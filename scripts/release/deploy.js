// Release phase 3: prepare versioned release commit and tags after tests pass.
// This script may update package metadata and create local tags, but npm publish
// remains GitHub Actions-only and Shopify/WooCommerce deploys stay manual.

import fs from 'node:fs';
import path from 'node:path';
import {
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

Options:
  --release <x.y.z>        Required release version.
  --push                   Push release commit and package tags.
  --skip-ov25-dispatch     Do not trigger the downstream OV25 package update workflow after pushing.
  --help                   Show this message.

This script never publishes npm packages and never deploys Shopify. Package publishing is
handled by tag-triggered GitHub Actions. When --push is used, the script also
dispatches the OV25 dependency update workflow unless --skip-ov25-dispatch is set.`;
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

function updatePackageVersions(version) {
  // update main package version
  const packageJson = readJson('package.json');
  packageJson.version = version;
  writeJson('package.json', packageJson);

  // update ov25-setup dependency on ov25-ui
  const setupPackageJson = readJson('setup/package.json');
  setupPackageJson.version = version;
  setupPackageJson.dependencies = {
    ...setupPackageJson.dependencies,
    'ov25-ui': version,
  };
  writeJson('setup/package.json', setupPackageJson);
}

function refreshLockfiles(version) {
  run('npm', ['install', '--package-lock-only', '--ignore-scripts']);

  const setupLockfile = readJson('setup/package-lock.json');
  setupLockfile.version = version;
  setupLockfile.packages[''].version = version;
  setupLockfile.packages[''].dependencies = {
    ...setupLockfile.packages[''].dependencies,
    'ov25-ui': version,
  };
  writeJson('setup/package-lock.json', setupLockfile);
}

function ensureTagsDoNotExist(tags) {
  const existing = tags.filter((tag) => gitOrEmpty(['rev-parse', '--verify', `refs/tags/${tag}`]));
  if (existing.length > 0) {
    throw new Error(`Release tag already exists: ${existing.join(', ')}`);
  }
}

function createTags(version, tags) {
  const notesPath = path.join('releases', version, 'patch-notes.md');
  for (const tag of tags) {
    git(['tag', '-a', tag, '-m', `Release ${tag}`, '-m', `Reviewed notes: ${notesPath}`]);
  }
}

function commitRelease(version) {
  run('git', [
    'add',
    'CHANGELOG.md',
    'package.json',
    'package-lock.json',
    'setup/package.json',
    'setup/package-lock.json',
    `releases/${version}`,
  ]);
  git(['commit', '-m', `chore: release ov25-ui ${version}`]);
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

function printPushInstructions(version, tags) {
  console.log('\nRelease commit and tags were created locally.');
  console.log('Push was not requested. Review locally, then run:');
  console.log('');
  console.log('  git push origin main');
  console.log(`  git push origin ${tags.join(' ')}`);
  console.log(`  ${ov25DispatchCommand(version).join(' ')}`);
  console.log('');
  console.log('Or rerun release:deploy with --push if you intentionally want the script to push the release commit and package tags.');
}

function pushRelease(tags) {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!branch || branch === 'HEAD') {
    throw new Error('Cannot push from detached HEAD.');
  }

  run('git', ['push', 'origin', branch]);
  run('git', ['push', 'origin', ...tags]);
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

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const version = args.release;
  ensureSemver(version, '--release');

  const tags = [`ov25-ui@${version}`, `ov25-ui-react18@${version}`, `ov25-setup@${version}`];

  assertWorkingTreeAllowed(version);
  ensureTagsDoNotExist(tags);
  updateChangelog(version);
  updatePackageVersions(version);
  refreshLockfiles(version);
  commitRelease(version);
  createTags(version, tags);

  if (args.push) {
    pushRelease(tags);
    if (!args['skip-ov25-dispatch']) {
      dispatchOv25Update(version);
    }
  } else {
    printPushInstructions(version, tags);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  console.error('');
  console.error(usage());
  process.exit(1);
}
