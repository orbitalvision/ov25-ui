#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E2E_FIXTURE_LEDGER } from '../dev/react-test/config/e2e-fixture-ledger.js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX_PATH = path.join(ROOT_DIR, 'dev/react-test/index.html');
const SAFE_SECTION_TITLE = 'Fully E2E Tested (Safe to Skip)';

export function validateE2EFixtureLedger() {
  const errors = [];
  const indexHtml = readFileSync(INDEX_PATH, 'utf8');
  const safeFixtures = readSafeSectionFixtures(indexHtml, errors);
  const safeFixtureIds = safeFixtures.map((fixture) => fixture.id);
  const ledgerFixtureIds = E2E_FIXTURE_LEDGER.map((fixture) => fixture.id);

  addDuplicateErrors(safeFixtureIds, 'safe-to-skip index ID', errors);
  addDuplicateErrors(ledgerFixtureIds, 'ledger fixture ID', errors);

  const missingFromLedger = safeFixtureIds.filter((id) => !ledgerFixtureIds.includes(id));
  const missingFromIndex = ledgerFixtureIds.filter((id) => !safeFixtureIds.includes(id));
  if (missingFromLedger.length > 0) {
    errors.push(`Safe-to-skip fixtures missing from the ledger: ${missingFromLedger.join(', ')}`);
  }
  if (missingFromIndex.length > 0) {
    errors.push(`Ledger fixtures missing from the safe-to-skip section: ${missingFromIndex.join(', ')}`);
  }

  let declaredTestCount = 0;
  for (const fixture of E2E_FIXTURE_LEDGER) {
    const prefix = `[${fixture.id}]`;
    const indexFixture = safeFixtures.find((candidate) => candidate.id === fixture.id);
    if (indexFixture) {
      const expectedHref = fixture.fixturePath.replace(/^\//, '');
      if (indexFixture.href !== expectedHref) {
        errors.push(`${prefix} index href is "${indexFixture.href}"; expected "${expectedHref}".`);
      }
      if (indexFixture.title !== fixture.title) {
        errors.push(`${prefix} index label is "${indexFixture.title}"; expected "${fixture.title}".`);
      }
    }

    if (fixture.tests.length === 0) errors.push(`${prefix} no covered tests are declared.`);
    if (fixture.specFiles.length === 0) errors.push(`${prefix} no Playwright specs are declared.`);
    declaredTestCount += fixture.tests.length;
    addDuplicateErrors(
      fixture.tests.map((coveredTest) => coveredTest.title),
      `${fixture.id} declared test title`,
      errors,
    );

    const fixtureFile = path.join(
      ROOT_DIR,
      'dev/react-test',
      fixture.fixturePath.replace(/^\//, ''),
    );
    if (!existsSync(fixtureFile)) {
      errors.push(`${prefix} missing fixture page: ${fixture.fixturePath}`);
    } else {
      const fixtureHtml = readFileSync(fixtureFile, 'utf8');
      if (!fixtureHtml.includes(`<title>${fixture.fixtureDocumentTitle}</title>`)) {
        errors.push(`${prefix} fixture document title does not match "${fixture.fixtureDocumentTitle}".`);
      }
    }

    for (const sourceFile of fixture.sourceFiles) {
      if (!existsSync(path.join(ROOT_DIR, sourceFile))) {
        errors.push(`${prefix} missing fixture source: ${sourceFile}`);
      }
    }

    const existingSpecFiles = [];
    const specContents = [];
    for (const specFile of fixture.specFiles) {
      const absoluteSpecPath = path.join(ROOT_DIR, specFile);
      if (!existsSync(absoluteSpecPath)) {
        errors.push(`${prefix} missing Playwright spec: ${specFile}`);
        continue;
      }
      existingSpecFiles.push(specFile);
      specContents.push(readFileSync(absoluteSpecPath, 'utf8'));
    }

    if (specContents.length > 0 && !specContents.join('\n').includes(fixture.fixturePath)) {
      errors.push(`${prefix} declared specs do not reference ${fixture.fixturePath}.`);
    }

    if (existingSpecFiles.length > 0) {
      const collection = collectPlaywrightTests(existingSpecFiles);
      errors.push(...collection.errors.map((error) => `${prefix} ${error}`));
      const declaredTitles = fixture.tests.map((coveredTest) => coveredTest.title).sort();
      const collectedTitles = collection.titles.sort();
      if (JSON.stringify(declaredTitles) !== JSON.stringify(collectedTitles)) {
        errors.push(
          `${prefix} declared tests do not match Playwright collection.\n` +
            `  Declared: ${declaredTitles.join(' | ')}\n` +
            `  Collected: ${collectedTitles.join(' | ')}`,
        );
      }
    }

    for (const screenshot of fixture.visualArtifacts.baselineScreenshots) {
      if (!existsSync(path.join(ROOT_DIR, screenshot))) {
        errors.push(`${prefix} missing screenshot baseline: ${screenshot}`);
      }
    }

    const reportScreenshots = fixture.visualArtifacts.reportScreenshots ?? [];
    addDuplicateErrors(reportScreenshots, `${fixture.id} report screenshot name`, errors);
    for (const screenshot of reportScreenshots) {
      if (!screenshot.endsWith('.png')) {
        errors.push(`${prefix} report screenshot must use a .png name: ${screenshot}`);
      }
    }
  }

  return {
    errors,
    fixtureCount: E2E_FIXTURE_LEDGER.length,
    declaredTestCount,
  };
}

function collectPlaywrightTests(specFiles) {
  const playwrightBin = localBin(ROOT_DIR, 'playwright');
  const { FORCE_COLOR: _forceColor, ...baseEnv } = process.env;
  const result = spawnSync(
    playwrightBin,
    ['test', ...specFiles, '--config', 'playwright.config.ts', '--list', '--reporter=json'],
    {
      cwd: ROOT_DIR,
      env: { ...baseEnv, NO_COLOR: '1' },
      encoding: 'utf8',
      shell: false,
    },
  );

  if (result.error) {
    return { errors: [`could not collect Playwright tests: ${result.error.message}`], titles: [] };
  }
  if (result.status !== 0) {
    return {
      errors: [
        `Playwright collection failed (${result.status}). ${String(result.stderr || result.stdout).trim()}`,
      ],
      titles: [],
    };
  }

  try {
    const report = JSON.parse(result.stdout);
    const titles = collectSpecTitles(report.suites ?? []);
    const reportErrors = (report.errors ?? []).map((error) => error.message ?? String(error));
    addDuplicateErrors(titles, 'collected Playwright test title', reportErrors);
    return { errors: reportErrors, titles };
  } catch (error) {
    return {
      errors: [`could not parse Playwright collection JSON: ${error.message}`],
      titles: [],
    };
  }
}

function collectSpecTitles(suites) {
  return suites.flatMap((suite) => [
    ...(suite.specs ?? []).map((spec) => spec.title),
    ...collectSpecTitles(suite.suites ?? []),
  ]);
}

function readSafeSectionFixtures(indexHtml, errors) {
  const sectionMarker = `<div class="checklist-section">${SAFE_SECTION_TITLE}</div>`;
  const sectionStart = indexHtml.indexOf(sectionMarker);
  if (sectionStart < 0) {
    errors.push(`Fixture index is missing "${SAFE_SECTION_TITLE}".`);
    return [];
  }

  const listStart = indexHtml.indexOf('<ul class="checklist">', sectionStart + sectionMarker.length);
  const listEnd = indexHtml.indexOf('</ul>', listStart);
  if (listStart < 0 || listEnd < 0) {
    errors.push('Safe-to-skip section is missing a complete checklist.');
    return [];
  }

  const safeListHtml = indexHtml.slice(listStart, listEnd);
  return [
    ...safeListHtml.matchAll(
      /<li\b[^>]*data-id="([^"]+)"[\s\S]*?<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<\/li>/g,
    ),
  ].map((match) => ({
    id: match[1],
    href: match[2],
    title: match[3].trim(),
  }));
}

function addDuplicateErrors(values, label, errors) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) errors.push(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

function localBin(directory, name) {
  return path.join(directory, 'node_modules', '.bin', process.platform === 'win32' ? `${name}.cmd` : name);
}

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  const result = validateE2EFixtureLedger();
  if (result.errors.length > 0) {
    console.error('E2E fixture ledger validation failed:\n');
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(
      `E2E fixture ledger valid: ${result.fixtureCount} fixture, ${result.declaredTestCount} covered tests.`,
    );
  }
}
