#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { E2E_FIXTURE_LEDGER } from '../dev/react-test/config/e2e-fixture-ledger.js';
import { buildScreenshotGallery } from './build-e2e-screenshot-gallery.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REACT_TEST_DIR = path.join(ROOT_DIR, 'dev/react-test');
const BASE_URL = 'http://localhost:3008';
const KNOWN_FLAGS = new Set([
  '--build',
  '--headed',
  '--help',
  '--list',
  '--no-open',
  '--update-visuals',
  '--validate',
]);

let ownedServer = null;
let ownedServerError = null;

process.once('SIGINT', () => exitFromSignal(130));
process.once('SIGTERM', () => exitFromSignal(143));

try {
  process.exitCode = await main();
} catch (error) {
  stopOwnedServer();
  console.error(`\n${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = error?.exitCode ?? 1;
}

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((arg) => arg.startsWith('--')));
  const fixtureId = args.find((arg) => !arg.startsWith('--'));

  for (const flag of flags) {
    if (!KNOWN_FLAGS.has(flag)) throw runnerError(`Unknown option: ${flag}`);
  }
  if (flags.has('--update-visuals') && flags.has('--headed')) {
    throw runnerError('Pixel baselines are recorded headless; drop --headed when using --update-visuals.');
  }

  if (flags.has('--help')) {
    printUsage();
    return 0;
  }

  if (flags.has('--validate')) {
    return runLedgerValidation();
  }

  if (flags.has('--list') || !fixtureId) {
    printFixtures();
    if (!fixtureId) printUsage();
    return 0;
  }

  const selectedFixtures =
    fixtureId === 'all'
      ? E2E_FIXTURE_LEDGER
      : E2E_FIXTURE_LEDGER.filter((fixture) => fixture.id === fixtureId);
  if (selectedFixtures.length === 0) {
    throw runnerError(
      `Unknown fixture "${fixtureId}". Run with --list to see available fixture IDs.`,
    );
  }

  validateLocalInstall();
  // Re-recording may be what creates a missing baseline, so only normal runs validate the ledger first.
  if (!flags.has('--update-visuals')) {
    const validationStatus = runLedgerValidation();
    if (validationStatus !== 0) return validationStatus;
  }

  const distIsMissing = !existsSync(path.join(ROOT_DIR, 'dist/index.js'));
  if (flags.has('--build') || distIsMissing) {
    console.log('\nBuilding ov25-ui so the fixture uses the current source...\n');
    const buildStatus = runSync('bun', ['run', 'build']);
    if (buildStatus !== 0) {
      throw runnerError('The ov25-ui build failed; E2E tests were not started.', buildStatus);
    }
  }

  try {
    if (!(await selectedFixturesAreServed(selectedFixtures))) {
      console.log('\nStarting the fixture server on http://localhost:3008...\n');
      ownedServer = startFixtureServer();
      await waitForFixtureServer(selectedFixtures, 45_000);
    } else {
      console.log('\nUsing the expected fixture server already running on http://localhost:3008.');
    }

    const specs = [
      'test/e2e/fixture-ledger.test.ts',
      ...new Set(selectedFixtures.flatMap((fixture) => fixture.specFiles)),
    ];
    const playwrightArgs = [
      'test',
      ...specs,
      '--config',
      'playwright.config.ts',
      '--reporter',
      'html,json',
      '--trace',
      'on',
    ];
    if (flags.has('--headed')) playwrightArgs.push('--headed', '--workers', '1');
    // Only the @visual tests compare pixels, so re-recording runs just those.
    if (flags.has('--update-visuals')) playwrightArgs.push('--grep', '@visual', '--update-snapshots');

    const reportDirectory = path.join('playwright-report', 'fixtures', fixtureId);
    clearPreviousRun();
    console.log(
      `\n${flags.has('--update-visuals') ? 'Re-recording pixel baselines' : 'Running E2E coverage'} for: ${selectedFixtures.map((fixture) => fixture.title).join(', ')}\n`,
    );
    const testStatus = runSync(localBin(ROOT_DIR, 'playwright'), playwrightArgs, {
      env: {
        ...process.env,
        OV25_E2E_NEW_HEADLESS: flags.has('--headed') ? 'false' : 'true',
        PLAYWRIGHT_HTML_OPEN: 'never',
        PLAYWRIGHT_HTML_OUTPUT_DIR: reportDirectory,
        PLAYWRIGHT_HTML_TITLE: `OV25 fixture E2E — ${fixtureId}`,
        // The screenshot gallery is built from the JSON reporter's copy of the results.
        PLAYWRIGHT_JSON_OUTPUT_FILE: path.join(ROOT_DIR, reportDirectory, 'results.json'),
      },
    });

    stopOwnedServer();
    const gallery = writeScreenshotGallery(path.join(ROOT_DIR, reportDirectory));
    removeRawTestOutput();
    if (!flags.has('--no-open')) {
      if (gallery) openInBrowser(gallery.galleryPath);
      console.log('\nOpening the Playwright HTML report. Press Ctrl+C when you are finished.\n');
      runSync(localBin(ROOT_DIR, 'playwright'), [
        'show-report',
        reportDirectory,
        '--port',
        '0',
      ]);
    } else {
      console.log(`\nReport written to ${reportDirectory}/index.html`);
    }
    return testStatus;
  } finally {
    stopOwnedServer();
  }
}

/**
 * Only the latest run is kept: a run replaces every earlier report, including a plain
 * `playwright test` report, and starts without Playwright's raw output from the last run.
 */
function clearPreviousRun() {
  rmSync(path.join(ROOT_DIR, 'playwright-report'), { recursive: true, force: true });
  rmSync(path.join(ROOT_DIR, 'test-results'), { recursive: true, force: true });
}

/**
 * The report holds its own copy of every attachment and trace, and the gallery has copied its
 * screenshots, so the raw output is deleted. `.last-run.json` stays so `--last-failed` still works.
 */
function removeRawTestOutput() {
  const outputDirectory = path.join(ROOT_DIR, 'test-results');
  if (!existsSync(outputDirectory)) return;
  for (const entry of readdirSync(outputDirectory)) {
    if (entry !== '.last-run.json') rmSync(path.join(outputDirectory, entry), { recursive: true, force: true });
  }
}

function writeScreenshotGallery(reportDirectory) {
  try {
    const gallery = buildScreenshotGallery(reportDirectory);
    console.log(
      `\nScreenshot gallery: ${path.relative(ROOT_DIR, gallery.galleryPath)} (${gallery.screenshotCount} screenshots from ${gallery.testCount} tests)`,
    );
    return gallery;
  } catch (error) {
    console.warn(`\nCould not build the screenshot gallery: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function openInBrowser(filePath) {
  const [command, commandArgs] =
    process.platform === 'darwin'
      ? ['open', [filePath]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', filePath]]
        : ['xdg-open', [filePath]];
  const result = spawnSync(command, commandArgs, { stdio: 'ignore', shell: false });
  if (result.error) console.warn(`Could not open ${filePath}: ${result.error.message}`);
}

function runLedgerValidation() {
  console.log('\nValidating the safe-to-skip fixture ledger...\n');
  return runSync(process.execPath, ['scripts/validate-e2e-fixture-ledger.mjs']);
}

function validateLocalInstall() {
  const requiredPaths = [
    localBin(ROOT_DIR, 'playwright'),
    viteEntryPoint(),
    path.join(REACT_TEST_DIR, 'node_modules'),
  ];
  const missing = requiredPaths.filter((requiredPath) => !existsSync(requiredPath));
  if (missing.length > 0) {
    throw runnerError(
      `Missing local dependencies:\n${missing.map((item) => `  - ${item}`).join('\n')}\n` +
        'Install the root and dev/react-test dependencies first.',
    );
  }
}

function startFixtureServer() {
  const child = spawn(
    process.execPath,
    [viteEntryPoint(), '--host', 'localhost', '--port', '3008', '--strictPort', '--force'],
    {
      cwd: REACT_TEST_DIR,
      env: process.env,
      stdio: 'inherit',
      shell: false,
    },
  );
  child.once('error', (error) => {
    ownedServerError = error;
  });
  return child;
}

async function waitForFixtureServer(selectedFixtures, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (ownedServerError) {
      throw runnerError(`Fixture server failed to start: ${ownedServerError.message}`);
    }
    if (ownedServer?.exitCode !== null) {
      throw runnerError(`Fixture server exited before becoming ready (code ${ownedServer.exitCode}).`);
    }
    if (await selectedFixturesAreServed(selectedFixtures)) return;
    await delay(300);
  }
  throw runnerError(`Timed out waiting for the expected fixture pages on ${BASE_URL}.`);
}

async function selectedFixturesAreServed(selectedFixtures) {
  for (const fixture of selectedFixtures) {
    if (!(await fixtureIsReady(fixture))) return false;
  }
  return true;
}

async function fixtureIsReady(fixture) {
  try {
    const response = await fetch(new URL(fixture.fixturePath, BASE_URL), {
      signal: AbortSignal.timeout(1_500),
    });
    if (!response.ok) return false;
    const html = await response.text();
    if (!html.includes(`<title>${fixture.fixtureDocumentTitle}</title>`)) return false;

    const moduleSources = [
      ...html.matchAll(/<script\b[^>]*type=["']module["'][^>]*src=["']([^"']+)["'][^>]*>/gi),
    ].map((match) => match[1]);
    for (let attempt = 0; attempt < 12; attempt += 1) {
      if (await moduleDependenciesAreReady(moduleSources, fixture.fixturePath)) return true;
      await delay(250);
    }
    return false;
  } catch {
    return false;
  }
}

async function moduleDependenciesAreReady(moduleSources, fixturePath) {
  for (const moduleSource of moduleSources) {
    const moduleUrl = new URL(moduleSource, new URL(fixturePath, BASE_URL));
    const response = await fetch(moduleUrl, { signal: AbortSignal.timeout(1_500) });
    if (!response.ok) return false;

    const source = await response.text();
    const optimizedDependencies = [
      ...source.matchAll(/["'](\/node_modules\/\.vite\/deps\/[^"']+)["']/g),
    ].map((match) => match[1]);
    for (const dependency of optimizedDependencies) {
      const dependencyResponse = await fetch(new URL(dependency, BASE_URL), {
        signal: AbortSignal.timeout(1_500),
      });
      if (!dependencyResponse.ok) return false;
    }
  }
  return true;
}

function stopOwnedServer() {
  if (!ownedServer) return;
  if (ownedServer.exitCode === null && !ownedServer.killed) ownedServer.kill('SIGTERM');
  ownedServer = null;
  ownedServerError = null;
}

function runSync(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: ROOT_DIR,
    env: process.env,
    stdio: 'inherit',
    shell: false,
    ...options,
  });
  if (result.error) throw runnerError(`Could not run ${command}: ${result.error.message}`);
  return result.status ?? 1;
}

function localBin(directory, name) {
  return path.join(directory, 'node_modules', '.bin', process.platform === 'win32' ? `${name}.cmd` : name);
}

function viteEntryPoint() {
  return path.join(ROOT_DIR, 'node_modules', 'vite', 'bin', 'vite.js');
}

function printFixtures() {
  console.log('Available fully E2E-tested fixtures:');
  for (const fixture of E2E_FIXTURE_LEDGER) {
    console.log(`  ${fixture.id.padEnd(20)} ${fixture.title}`);
  }
  console.log('  all'.padEnd(22) + 'Run every fixture in the ledger');
}

function printUsage() {
  console.log(`\nUsage:\n  node scripts/run-fixture-e2e.mjs <fixture-id|all> [options]\n\nOptions:\n  --build     Rebuild ov25-ui before running the fixture\n  --headed    Show the browser while tests run\n  --no-open   Write the HTML report and screenshot gallery without opening them\n  --update-visuals  Re-record the pixel baselines (tests tagged @visual) after an intended visual change\n  --validate  Validate the ledger without running fixtures\n  --list      List fixture IDs\n\nEvery run also writes screenshots.html next to its report: every captured screenshot on one page.\nOnly the latest report is kept: each run deletes earlier reports and Playwright's raw test output.\nRebuild the gallery for the current report with: node scripts/build-e2e-screenshot-gallery.mjs\n`);
}

function runnerError(message, exitCode = 1) {
  const error = new Error(message);
  error.exitCode = exitCode;
  return error;
}

function exitFromSignal(exitCode) {
  stopOwnedServer();
  process.exit(exitCode);
}
