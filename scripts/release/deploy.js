// Release phase 3: prepare versioned release commits and tags after tests pass.
// ov25-ui is tagged first because ov25-setup's lockfiles cannot resolve the new
// ov25-ui version until its tag-triggered GitHub Action publishes it to npm.
// npm publish remains GitHub Actions-only and Shopify/WooCommerce deploys stay manual.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  captureOrEmpty,
  ensureSemver,
  git,
  gitOrEmpty,
  parseArgs,
  readJson,
  releaseDir,
  rootDir,
  run,
  writeJson,
} from './common.js';

function usage() {
  return `Usage:
  bun run release:deploy -- --release 0.7.2
  bun run release:deploy -- --release 0.7.2 --push
  bun run release:deploy -- --release 0.7.2 --finalize-setup
  bun run release:deploy -- --release 0.7.2 --finalize-setup --push

Options:
  --release <x.y.z>        Required release version.
  --push                   Push each completed release commit and its package tags.
  --finalize-setup         Refresh Setup lockfiles and create its tag after ov25-ui is on npm.
  --skip-ov25-dispatch     Do not trigger the downstream OV25 package update workflow after pushing.
  --help                   Show this message.

This script never publishes npm packages and never deploys Shopify. Package publishing is
handled by tag-triggered GitHub Actions. A normal --push run publishes ov25-ui first, waits for
that version on npm, then refreshes and commits both ov25-setup lockfiles before pushing its tag.
When --push is used, the script also dispatches the OV25 dependency update workflow unless
--skip-ov25-dispatch is set.`;
}

function statusPath(line) {
  return line.slice(3).trim();
}

function assertWorkingTreeAllowed(version) {
  const status = gitOrEmpty(['status', '--short', '--untracked-files=all']);
  const disallowed = status
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .filter((line) => {
      const filePath = statusPath(line);
      return !(filePath === `releases/${version}` || filePath.startsWith(`releases/${version}/`));
    });

  if (disallowed.length > 0) {
    throw new Error(
      [
        'Working tree contains changes outside the reviewed release artifacts.',
        'Commit/stash/revert them before running release:deploy:',
        ...disallowed.map((line) => `  ${line}`),
      ].join('\n'),
    );
  }
}

const SETUP_RELEASE_PATHS = [
  'setup/package.json',
  'setup/package-lock.json',
  'setup/bun.lock',
];

export function inspectSetupFinalizationStatus(status) {
  const lines = status.split('\n').filter(Boolean);
  return {
    clean: lines.length === 0,
    disallowed: lines.filter((line) => !SETUP_RELEASE_PATHS.includes(statusPath(line))),
  };
}

function assertSetupFinalizationTreeAllowed() {
  const status = gitOrEmpty(['status', '--short', '--untracked-files=all']);
  const { clean, disallowed } = inspectSetupFinalizationStatus(status);
  if (disallowed.length > 0) {
    throw new Error(
      [
        'Working tree contains changes outside an in-progress ov25-setup finalization:',
        ...disallowed.map((line) => `  ${line}`),
      ].join('\n'),
    );
  }

  return clean;
}

function updateChangelog(version) {
  const changelogPath = path.join(rootDir, 'CHANGELOG.md');
  const notesPath = path.join(releaseDir(version), 'patch-notes.md');
  if (!fs.existsSync(notesPath)) {
    throw new Error(`Missing reviewed patch notes: ${path.relative(rootDir, notesPath)}`);
  }

  const current = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : '# Changelog\n';
  if (new RegExp(`^## ${version.replace(/\./g, '\\.')}$`, 'm').test(current)) {
    return;
  }

  const notes = fs.readFileSync(notesPath, 'utf8').trim();
  const entry = `\n## ${version}\n\n${notes}\n`;
  const next = current.startsWith('# Changelog')
    ? current.replace(/^# Changelog\s*/, `# Changelog\n${entry}\n`)
    : `# Changelog\n${entry}\n${current}`;
  fs.writeFileSync(changelogPath, next);
}

function updateUiPackageVersion(version) {
  const packageJson = readJson('package.json');
  packageJson.version = version;
  writeJson('package.json', packageJson);
}

function updateSetupPackageData(setupPackageJson, version) {
  setupPackageJson.version = version;
  setupPackageJson.dependencies = {
    ...setupPackageJson.dependencies,
    'ov25-ui': version,
  };
  return setupPackageJson;
}

function refreshUiLockfile() {
  run('npm', ['install', '--package-lock-only', '--ignore-scripts']);
}

export function assertSetupLockVersions(version, packageLock, bunLockText) {
  const packageLockRoot = packageLock.packages?.[''];
  if (
    packageLock.version !== version ||
    packageLockRoot?.version !== version ||
    packageLockRoot?.dependencies?.['ov25-ui'] !== version
  ) {
    throw new Error(`setup/package-lock.json metadata did not update to ov25-setup@${version}`);
  }

  const packageLockVersion = packageLock.packages?.['node_modules/ov25-ui']?.version;
  if (packageLockVersion !== version) {
    throw new Error(
      `setup/package-lock.json resolved ov25-ui@${packageLockVersion ?? 'missing'} instead of ${version}`,
    );
  }

  const escapedVersion = version.replace(/\./g, '\\.');
  const workspaceDependency = new RegExp(`"ov25-ui"\\s*:\\s*"${escapedVersion}"`);
  const packageResolution = new RegExp(
    `"ov25-ui"\\s*:\\s*\\[\\s*"ov25-ui@${escapedVersion}"`,
  );

  if (!workspaceDependency.test(bunLockText) || !packageResolution.test(bunLockText)) {
    throw new Error(`setup/bun.lock did not resolve ov25-ui@${version}`);
  }
}

export function refreshSetupLockfiles(
  version,
  {
    runCommand = run,
    setupDir = path.join(rootDir, 'setup'),
    readSetupPackageLock = () => readJson('setup/package-lock.json'),
    readSetupBunLock = () => fs.readFileSync(path.join(rootDir, 'setup/bun.lock'), 'utf8'),
  } = {},
) {
  runCommand(
    'npm',
    ['install', '--package-lock-only', '--ignore-scripts', '--legacy-peer-deps'],
    { cwd: setupDir },
  );
  runCommand('bun', ['install', '--lockfile-only', '--ignore-scripts'], { cwd: setupDir });

  assertSetupLockVersions(version, readSetupPackageLock(), readSetupBunLock());
  runCommand('bun', ['install', '--frozen-lockfile', '--ignore-scripts', '--dry-run'], {
    cwd: setupDir,
  });
}

export function generateSetupReleaseFiles(version) {
  const temporaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ov25-setup-release-'));

  try {
    for (const fileName of ['package.json', 'package-lock.json', 'bun.lock']) {
      const relativePath = `setup/${fileName}`;
      fs.writeFileSync(
        path.join(temporaryDir, fileName),
        `${git(['show', `HEAD:${relativePath}`])}\n`,
      );
    }

    const temporaryPackagePath = path.join(temporaryDir, 'package.json');
    const temporaryPackage = updateSetupPackageData(
      JSON.parse(fs.readFileSync(temporaryPackagePath, 'utf8')),
      version,
    );
    fs.writeFileSync(temporaryPackagePath, `${JSON.stringify(temporaryPackage, null, 2)}\n`);

    refreshSetupLockfiles(version, {
      setupDir: temporaryDir,
      readSetupPackageLock: () =>
        JSON.parse(fs.readFileSync(path.join(temporaryDir, 'package-lock.json'), 'utf8')),
      readSetupBunLock: () => fs.readFileSync(path.join(temporaryDir, 'bun.lock'), 'utf8'),
    });

    return Object.fromEntries(
      ['package.json', 'package-lock.json', 'bun.lock'].map((fileName) => [
        fileName,
        fs.readFileSync(path.join(temporaryDir, fileName), 'utf8'),
      ]),
    );
  } finally {
    fs.rmSync(temporaryDir, { recursive: true, force: true });
  }
}

function applySetupReleaseFiles(files) {
  for (const [fileName, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(rootDir, 'setup', fileName), contents);
  }
}

export function isSafeSetupRetryFile(currentContents, headContents, generatedContents) {
  return currentContents === headContents || currentContents === generatedContents;
}

function assertSetupRetryMatchesGeneratedFiles(files) {
  for (const [fileName, generatedContents] of Object.entries(files)) {
    const relativePath = `setup/${fileName}`;
    const headContents = `${git(['show', `HEAD:${relativePath}`])}\n`;
    let currentContents;
    try {
      currentContents = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
    } catch {
      throw new Error(`Cannot safely resume: ${relativePath} is missing`);
    }

    if (!isSafeSetupRetryFile(currentContents, headContents, generatedContents)) {
      throw new Error(
        `Cannot safely resume: ${relativePath} contains changes not generated by release:deploy`,
      );
    }
  }
}

function setupReleaseFilesMatch(version) {
  const setupPackage = readJson('setup/package.json');
  if (
    setupPackage.version !== version ||
    setupPackage.dependencies?.['ov25-ui'] !== version
  ) {
    return false;
  }

  try {
    assertSetupLockVersions(
      version,
      readJson('setup/package-lock.json'),
      fs.readFileSync(path.join(rootDir, 'setup/bun.lock'), 'utf8'),
    );
    return true;
  } catch {
    return false;
  }
}

function verifySetupReleaseBuild() {
  const setupDir = path.join(rootDir, 'setup');
  run('bun', ['install', '--frozen-lockfile', '--ignore-scripts'], { cwd: setupDir });
  run('bun', ['run', 'build'], { cwd: setupDir });
}

function ensureTagsDoNotExist(tags) {
  const existing = tags.filter((tag) => gitOrEmpty(['rev-parse', '--verify', `refs/tags/${tag}`]));
  if (existing.length > 0) {
    throw new Error(`Release tag already exists: ${existing.join(', ')}`);
  }
}

function tagCommit(tag) {
  return gitOrEmpty(['rev-parse', '--verify', `refs/tags/${tag}^{commit}`]);
}

function createTags(version, tags) {
  const notesPath = path.join('releases', version, 'patch-notes.md');
  for (const tag of tags) {
    git(['tag', '-a', tag, '-m', `Release ${tag}`, '-m', `Reviewed notes: ${notesPath}`]);
  }
}

export function commitUiRelease(version, { runCommand = run, gitCommand = git } = {}) {
  runCommand('git', [
    'add',
    'CHANGELOG.md',
    'package.json',
    'package-lock.json',
    `releases/${version}`,
  ]);
  gitCommand(['commit', '-m', `chore: release ov25-ui ${version}`]);
}

export function commitSetupRelease(version, { runCommand = run, gitCommand = git } = {}) {
  runCommand('git', ['add', ...SETUP_RELEASE_PATHS]);
  gitCommand(['commit', '-m', `chore: release ov25-setup ${version}`]);
}

function ov25DispatchCommand(version) {
  return [
    'gh',
    'workflow',
    'run',
    'update-ov25-ui-packages.yml',
    '--repo',
    'orbitalvision/OV25',
    '--ref',
    'main',
    '-f',
    `version=${version}`,
  ];
}

function printUiPushInstructions(version, tags) {
  console.log('\nov25-ui release commit and tags were created locally.');
  console.log('Push was not requested. Review them, then run:');
  console.log('');
  console.log('  git push origin main');
  console.log(`  git push origin ${tags.join(' ')}`);
  console.log('');
  console.log('After ov25-ui is available on npm, finalize the Setup release:');
  console.log('');
  console.log(`  bun run release:deploy -- --release ${version} --finalize-setup`);
}

function printSetupPushInstructions(version, tag) {
  console.log('\nov25-setup lockfile commit and tag were created locally.');
  console.log('Push was not requested. Review them, then run:');
  console.log('');
  console.log('  git push origin main');
  console.log(`  git push origin ${tag}`);
  console.log(`  ${ov25DispatchCommand(version).join(' ')}`);
}

function currentBranch() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!branch || branch === 'HEAD') {
    throw new Error('Cannot release from detached HEAD.');
  }
  return branch;
}

function verifyReleaseBranchIsCurrent() {
  const branch = currentBranch();
  run('git', [
    'fetch',
    'origin',
    `+refs/heads/${branch}:refs/remotes/origin/${branch}`,
  ]);
  const remoteRef = `origin/${branch}`;
  try {
    git(['merge-base', '--is-ancestor', remoteRef, 'HEAD']);
  } catch {
    throw new Error(
      `${remoteRef} advanced beyond the reviewed local release. Update and re-review before finalizing Setup.`,
    );
  }
}

function pushReleaseBranch() {
  const branch = currentBranch();
  run('git', ['push', 'origin', branch]);
}

function pushReleaseTags(tags) {
  run('git', ['push', 'origin', ...tags]);
}

function pushRelease(tags) {
  pushReleaseBranch();
  pushReleaseTags(tags);
}

function dispatchOv25Update(version) {
  const command = ov25DispatchCommand(version);
  try {
    run(command[0], command.slice(1));
  } catch (error) {
    throw new Error(
      [
        'Package tags were pushed, but dispatching the OV25 dependency update workflow failed.',
        'Run this manually after confirming the OV25 workflow exists on main:',
        '',
        `  ${command.join(' ')}`,
        '',
        error.message,
      ].join('\n'),
    );
  }
}

function packageExists(packageName, version) {
  const publishedVersion = captureOrEmpty('npm', [
    'view',
    `${packageName}@${version}`,
    'version',
    '--registry=https://registry.npmjs.org',
  ]);
  const integrity = captureOrEmpty('npm', [
    'view',
    `${packageName}@${version}`,
    'dist.integrity',
    '--registry=https://registry.npmjs.org',
  ]);

  return publishedVersion === version && integrity.startsWith('sha512-');
}

export function waitForPackage(
  packageName,
  version,
  {
    packageExistsFn = packageExists,
    timeoutMs = 30 * 60 * 1000,
    pollIntervalMs = 30_000,
    sleep = (duration) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, duration),
  } = {},
) {
  const deadline = Date.now() + timeoutMs;
  while (!packageExistsFn(packageName, version)) {
    if (Date.now() >= deadline) {
      throw new Error(`Timed out waiting for ${packageName}@${version} on npm`);
    }
    console.log(`Waiting for ${packageName}@${version} on npm...`);
    sleep(pollIntervalMs);
  }
}

function assertUiReleasePrepared(version, tags) {
  const packageJson = readJson('package.json');
  if (packageJson.version !== version) {
    throw new Error(`package.json must already be ov25-ui@${version} before finalizing Setup`);
  }

  const missingTags = tags.filter(
    (tag) => !gitOrEmpty(['rev-parse', '--verify', `refs/tags/${tag}`]),
  );
  if (missingTags.length > 0) {
    throw new Error(`Missing prepared ov25-ui release tag(s): ${missingTags.join(', ')}`);
  }
}

function assertSetupSourceMatchesUiRelease(version) {
  const changedSetupFiles = gitOrEmpty([
    'diff',
    '--name-only',
    `ov25-ui@${version}..HEAD`,
    '--',
    'setup',
  ])
    .split('\n')
    .filter(Boolean)
    .filter((filePath) => !SETUP_RELEASE_PATHS.includes(filePath));

  if (changedSetupFiles.length > 0) {
    throw new Error(
      [
        'ov25-setup source changed after the reviewed ov25-ui release tag:',
        ...changedSetupFiles.map((filePath) => `  ${filePath}`),
      ].join('\n'),
    );
  }
}

function prepareUiRelease(version) {
  const tags = [`ov25-ui@${version}`, `ov25-ui-react18@${version}`];
  const setupTag = `ov25-setup@${version}`;

  assertWorkingTreeAllowed(version);
  ensureTagsDoNotExist([...tags, setupTag]);
  updateChangelog(version);
  updateUiPackageVersion(version);
  refreshUiLockfile();
  commitUiRelease(version);
  createTags(version, tags);

  return tags;
}

function finalizeSetupRelease(version, { createTag = true } = {}) {
  const uiTags = [`ov25-ui@${version}`, `ov25-ui-react18@${version}`];
  const setupTag = `ov25-setup@${version}`;

  const treeWasClean = assertSetupFinalizationTreeAllowed();
  assertUiReleasePrepared(version, uiTags);
  const existingSetupTagCommit = tagCommit(setupTag);
  if (existingSetupTagCommit) {
    const headCommit = git(['rev-parse', 'HEAD']);
    if (
      createTag ||
      !treeWasClean ||
      existingSetupTagCommit !== headCommit ||
      !setupReleaseFilesMatch(version)
    ) {
      throw new Error(`Release tag already exists and cannot be safely resumed: ${setupTag}`);
    }

    waitForPackage('ov25-ui', version);
    verifyReleaseBranchIsCurrent();
    assertSetupFinalizationTreeAllowed();
    assertSetupSourceMatchesUiRelease(version);
    verifySetupReleaseBuild();
    return { setupTag, tagAlreadyExists: true };
  }

  waitForPackage('ov25-ui', version);

  verifyReleaseBranchIsCurrent();
  assertSetupFinalizationTreeAllowed();
  assertUiReleasePrepared(version, uiTags);
  ensureTagsDoNotExist([setupTag]);
  assertSetupSourceMatchesUiRelease(version);

  if (!treeWasClean || !setupReleaseFilesMatch(version)) {
    const generatedFiles = generateSetupReleaseFiles(version);
    if (!treeWasClean) {
      assertSetupRetryMatchesGeneratedFiles(generatedFiles);
    }
    applySetupReleaseFiles(generatedFiles);
  }

  if (!setupReleaseFilesMatch(version)) {
    throw new Error(`Generated ov25-setup files do not consistently resolve ov25-ui@${version}`);
  }

  verifySetupReleaseBuild();
  assertSetupFinalizationTreeAllowed();

  const setupStatus = gitOrEmpty(['status', '--short', '--', ...SETUP_RELEASE_PATHS]);
  if (setupStatus) {
    commitSetupRelease(version);
  }

  if (createTag) {
    createTags(version, [setupTag]);
  }

  return { setupTag, tagAlreadyExists: createTag };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const version = args.release;
  ensureSemver(version, '--release');

  if (args['finalize-setup']) {
    const { setupTag, tagAlreadyExists } = finalizeSetupRelease(version, {
      createTag: !args.push,
    });
    if (args.push) {
      pushReleaseBranch();
      if (!tagAlreadyExists) {
        createTags(version, [setupTag]);
      }
      pushReleaseTags([setupTag]);
      if (!args['skip-ov25-dispatch']) {
        dispatchOv25Update(version);
      }
    } else {
      printSetupPushInstructions(version, setupTag);
    }
    return;
  }

  const uiTags = prepareUiRelease(version);
  if (args.push) {
    pushRelease(uiTags);
    const { setupTag, tagAlreadyExists } = finalizeSetupRelease(version, { createTag: false });
    pushReleaseBranch();
    if (!tagAlreadyExists) {
      createTags(version, [setupTag]);
    }
    pushReleaseTags([setupTag]);
    if (!args['skip-ov25-dispatch']) {
      dispatchOv25Update(version);
    }
  } else {
    printUiPushInstructions(version, uiTags);
  }
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    console.error('');
    console.error(usage());
    process.exit(1);
  }
}
