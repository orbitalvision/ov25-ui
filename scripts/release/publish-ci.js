import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  captureOrEmpty,
  ensureSemver,
  parseArgs,
  readJson,
  rootDir,
  timestamp,
  writeFile,
  writeJson,
} from './common.js';

const PACKAGE_CONFIG = {
  'ov25-ui': {
    tagPrefix: 'ov25-ui@',
    cwd: rootDir,
    packageJson: 'package.json',
  },
  'ov25-ui-react18': {
    tagPrefix: 'ov25-ui-react18@',
    cwd: rootDir,
    packageJson: 'package.json',
  },
  'ov25-setup': {
    tagPrefix: 'ov25-setup@',
    cwd: path.join(rootDir, 'setup'),
    packageJson: 'setup/package.json',
  },
};

function usage() {
  return `Usage:
  node scripts/release/publish-ci.js --package ov25-ui --tag ov25-ui@0.7.2
  node scripts/release/publish-ci.js --package ov25-ui-react18 --tag ov25-ui-react18@0.7.2
  node scripts/release/publish-ci.js --package ov25-setup --tag ov25-setup@0.7.2

This script refuses to run unless GITHUB_ACTIONS=true.`;
}

function runLogged(logPath, command, args, options = {}) {
  const line = `$ ${[command, ...args].join(' ')}\n`;
  fs.appendFileSync(logPath, `\n${line}`);
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? rootDir,
    env: options.env ?? process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    shell: false,
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
    fs.appendFileSync(logPath, result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
    fs.appendFileSync(logPath, result.stderr);
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }
}

function versionFromTag(tag, prefix) {
  if (!tag.startsWith(prefix)) {
    throw new Error(`Tag ${tag} does not match expected prefix ${prefix}`);
  }
  const version = tag.slice(prefix.length);
  ensureSemver(version, 'tag version');
  return version;
}

function packageExists(packageName, version) {
  return Boolean(captureOrEmpty('npm', ['view', `${packageName}@${version}`, 'version', '--registry=https://registry.npmjs.org']));
}

function waitForPackage(packageName, version, logPath) {
  const deadline = Date.now() + 30 * 60 * 1000;
  while (!packageExists(packageName, version)) {
    if (Date.now() > deadline) {
      throw new Error(`Timed out waiting for ${packageName}@${version} on npm`);
    }
    fs.appendFileSync(logPath, `Waiting for ${packageName}@${version} on npm...\n`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 30_000);
  }
}

function configureReact18Package(version) {
  const packageJson = readJson('package.json');
  packageJson.name = 'ov25-ui-react18';
  packageJson.version = version;
  packageJson.peerDependencies = {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
  };
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    '@types/react': '^18.2.0',
    '@types/react-dom': '^18.2.0',
    react: '^18.2.0',
    'react-dom': '^18.2.0',
  };
  writeJson('package.json', packageJson);
}

function assertPackageMetadata(packageName, version) {
  if (packageName === 'ov25-setup') {
    const setupPackageJson = readJson('setup/package.json');
    if (setupPackageJson.name !== 'ov25-setup' || setupPackageJson.version !== version) {
      throw new Error(`setup/package.json must be ov25-setup@${version}`);
    }
    if (setupPackageJson.dependencies?.['ov25-ui'] !== version) {
      throw new Error(`setup/package.json must depend on ov25-ui@${version}`);
    }
    return;
  }

  const packageJson = readJson('package.json');
  if (packageJson.version !== version) {
    throw new Error(`package.json version must be ${version}`);
  }
  if (packageName === 'ov25-ui' && packageJson.name !== 'ov25-ui') {
    throw new Error('package.json name must be ov25-ui');
  }
}

function packAndPublish({ packageName, version, cwd, artifactDir, logPath }) {
  fs.appendFileSync(logPath, '\n$ npm pack --dry-run --json\n');
  const dryRun = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (dryRun.stdout) {
    process.stdout.write(dryRun.stdout);
    fs.appendFileSync(logPath, dryRun.stdout);
  }
  if (dryRun.stderr) {
    process.stderr.write(dryRun.stderr);
    fs.appendFileSync(logPath, dryRun.stderr);
  }
  if (dryRun.status !== 0) {
    throw new Error(`npm pack --dry-run failed for ${packageName}`);
  }
  writeFile(path.join(artifactDir, 'npm-pack-dry-run.json'), dryRun.stdout);

  runLogged(logPath, 'npm', ['pack', '--json', '--pack-destination', artifactDir], { cwd });

  if (packageExists(packageName, version)) {
    fs.appendFileSync(logPath, `${packageName}@${version} already exists on npm. Skipping publish.\n`);
    return;
  }

  runLogged(logPath, 'npm', ['publish', '--ignore-scripts', '--access', 'public'], { cwd });
}

function writeSummary(artifactDir, data) {
  writeFile(
    path.join(artifactDir, 'publish-summary.md'),
    [
      `# Publish Summary: ${data.packageName}@${data.version}`,
      '',
      `Tag: \`${data.tag}\``,
      `Generated: ${timestamp()}`,
      '',
      '- Published by tag-triggered GitHub Actions.',
      '- No local npm token is required; npm Trusted Publishing authenticates through OIDC.',
      '',
    ].join('\n'),
  );
}

function main() {
  if (process.env.GITHUB_ACTIONS !== 'true') {
    throw new Error('publish-ci.js only runs in GitHub Actions.');
  }

  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const packageName = args.package;
  const tag = args.tag || process.env.GITHUB_REF_NAME;
  const config = PACKAGE_CONFIG[packageName];
  if (!config) throw new Error(`Unsupported package: ${packageName}`);
  if (!tag) throw new Error('Missing --tag or GITHUB_REF_NAME');

  const version = versionFromTag(tag, config.tagPrefix);
  const artifactDir = path.join(rootDir, 'release-artifacts', `${packageName}-${version}`);
  fs.rmSync(artifactDir, { recursive: true, force: true });
  fs.mkdirSync(artifactDir, { recursive: true });
  const logPath = path.join(artifactDir, 'build.log');
  fs.writeFileSync(logPath, `Publish started ${timestamp()}\n`);

  if (packageName === 'ov25-ui-react18') {
    configureReact18Package(version);
    runLogged(logPath, 'npm', ['install', '--ignore-scripts']);
  }

  assertPackageMetadata(packageName, version);

  if (packageName === 'ov25-setup') {
    waitForPackage('ov25-ui', version, logPath);
    runLogged(logPath, 'npm', ['install', '--package-lock-only', '--ignore-scripts', '--legacy-peer-deps'], { cwd: config.cwd });
    runLogged(logPath, 'npm', ['ci', '--legacy-peer-deps'], { cwd: config.cwd });
  }

  runLogged(logPath, 'npm', ['run', 'build'], { cwd: config.cwd });
  packAndPublish({ packageName, version, cwd: config.cwd, artifactDir, logPath });
  writeSummary(artifactDir, { packageName, version, tag });
}

try {
  main();
} catch (error) {
  console.error(error.message);
  console.error('');
  console.error(usage());
  process.exit(1);
}
