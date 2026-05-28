// Release phase 2: run all tests and generate test-summary.md.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  ensureSemver,
  parseArgs,
  releaseDir,
  rootDir,
  run,
  timestamp,
  writeFile,
} from './common.js';

function usage() {
  return `Usage:
  bun run release:test -- --release 0.7.2

Options:
  --release <x.y.z>  Required release version.
  --skip-e2e         Skip Playwright e2e tests.
  --install-react-test
                     Install dev/react-test dependencies before e2e. Usually avoid this because
                     the local file dependency can recurse through node_modules.
  --help             Show this message.`;
}

function runLogged(summary, label, command, args, options = {}) {
  const startedAt = timestamp();
  summary.steps.push({ label, command: [command, ...args].join(' '), startedAt, status: 'running' });
  const step = summary.steps[summary.steps.length - 1];

  try {
    run(command, args, options);
    step.status = 'passed';
    step.finishedAt = timestamp();
  } catch (error) {
    step.status = 'failed';
    step.finishedAt = timestamp();
    step.error = error.message;
    throw error;
  }
}

function runBunScript(summary, label, script, options = {}) {
  runLogged(summary, label, 'bun', ['run', script], options);
}

function runBunInstall(summary, label, options = {}) {
  runLogged(summary, label, 'bun', ['install', '--frozen-lockfile'], options);
}

function localBin(cwd, name) {
  const extension = process.platform === 'win32' ? '.cmd' : '';
  return path.join(cwd, 'node_modules', '.bin', `${name}${extension}`);
}

function writeSummary(version, summary) {
  const lines = [
    `# Release Test Summary: ${version}`,
    '',
    `Status: ${summary.status}`,
    `Started: ${summary.startedAt}`,
    `Finished: ${summary.finishedAt ?? 'not finished'}`,
    '',
    'No package metadata was intentionally changed by this test step.',
    '',
    '## Steps',
    '',
  ];

  for (const step of summary.steps) {
    lines.push(`- ${step.status.toUpperCase()}: ${step.label}`);
    lines.push(`  - command: \`${step.command}\``);
    if (step.error) lines.push(`  - error: ${step.error}`);
  }

  writeFile(path.join(releaseDir(version), 'test-summary.md'), `${lines.join('\n')}\n`);
}

function startPreviewServer() {
  const reactTestDir = path.join(rootDir, 'dev/react-test');
  const child = spawn(localBin(reactTestDir, 'vite'), ['preview', '--port', '3008'], {
    cwd: reactTestDir,
    stdio: 'inherit',
    shell: false,
  });

  let killed = false;
  return {
    child,
    kill() {
      if (killed || !child.pid) return;
      killed = true;
      try {
        child.kill('SIGTERM');
      } catch {
        // Ignore already-dead process.
      }
    },
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const version = args.release;
  ensureSemver(version, '--release');

  const summary = {
    release: version,
    startedAt: timestamp(),
    finishedAt: null,
    status: 'running',
    steps: [],
  };

  fs.mkdirSync(releaseDir(version), { recursive: true });
  let server = null;

  try {
    runBunScript(summary, 'Type check', 'type-check');
    runBunScript(summary, 'Unit tests', 'test:unit');
    runBunScript(summary, 'Browser/component tests', 'test:browser:ci');
    runBunScript(summary, 'Build ov25-ui', 'build');

    if (fs.existsSync(path.join(rootDir, 'setup/package.json'))) {
      runBunInstall(summary, 'Install ov25-setup dependencies', { cwd: path.join(rootDir, 'setup') });
      runBunScript(summary, 'Build ov25-setup', 'build', { cwd: path.join(rootDir, 'setup') });
    }

    if (!args['skip-e2e']) {
      const reactTestDir = path.join(rootDir, 'dev/react-test');
      if (args['install-react-test']) {
        runBunInstall(summary, 'Install react-test dependencies', { cwd: reactTestDir });
      } else if (!fs.existsSync(path.join(reactTestDir, 'node_modules'))) {
        throw new Error(
          'dev/react-test/node_modules is missing. Install it manually before release:test, or rerun with --install-react-test if you accept reinstalling the local file dependency.',
        );
      }
      runBunScript(summary, 'Build react-test app', 'build', { cwd: path.join(rootDir, 'dev/react-test') });
      server = startPreviewServer();
      runLogged(summary, 'Wait for e2e preview server', 'bun', ['run', 'wait-on', 'http://localhost:3008', '--timeout', '30000']);
      runBunScript(summary, 'Playwright e2e tests', 'test:e2e');
    }

    summary.status = 'passed';
  } catch (error) {
    summary.status = 'failed';
    throw error;
  } finally {
    if (server) server.kill();
    summary.finishedAt = timestamp();
    writeSummary(version, summary);
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
