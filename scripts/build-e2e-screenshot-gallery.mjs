#!/usr/bin/env node

/**
 * Builds one page with every screenshot a fixture E2E run attached, so a run can be reviewed
 * without opening each test in the Playwright report. Reads the JSON reporter output the runner
 * writes next to the HTML report (results.json) and writes screenshots.html beside it.
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E2E_FIXTURE_LEDGER } from '../dev/react-test/config/e2e-fixture-ledger.js';
import { VIEWPORT_PRESETS } from '../dev/react-test/config/viewport-presets.js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STATES = ['page', 'open'];
const IMAGE_DIR = 'screenshots';
// Longest IDs first, so "desktop-wide-page" reads as desktop-wide rather than desktop.
const PRESETS_BY_ID_LENGTH = [...VIEWPORT_PRESETS].sort((a, b) => b.id.length - a.id.length);

export function buildScreenshotGallery(reportDirectory) {
  const resultsPath = path.join(reportDirectory, 'results.json');
  if (!existsSync(resultsPath)) {
    throw new Error(`No results.json in ${reportDirectory}; run the fixtures through scripts/run-fixture-e2e.mjs first.`);
  }
  const results = JSON.parse(readFileSync(resultsPath, 'utf8'));
  const imageDirectory = path.join(reportDirectory, IMAGE_DIR);
  // Start clean so screenshots from an earlier run never mix into this one.
  rmSync(imageDirectory, { recursive: true, force: true });
  mkdirSync(imageDirectory, { recursive: true });

  const groups = new Map();
  let screenshotCount = 0;
  for (const fileSuite of results.suites ?? []) {
    const specFile = `test/e2e/${fileSuite.file}`;
    const ledgerFixture = E2E_FIXTURE_LEDGER.find((fixture) => fixture.specFiles.includes(specFile));
    const key = ledgerFixture?.id ?? fileSuite.file;
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        title: ledgerFixture?.title ?? fileSuite.file,
        inLedger: Boolean(ledgerFixture),
        specFiles: new Set(),
        tests: [],
      });
    }
    const group = groups.get(key);
    group.specFiles.add(specFile);
    for (const spec of collectSpecs(fileSuite)) {
      for (const test of spec.tests) {
        const result = test.results.at(-1);
        if (!result) continue;
        const failedAttempt = test.results.findLast((attempt) => attempt.error);
        const entry = {
          id: spec.id,
          title: spec.title,
          group: group.title,
          status: result.status,
          outcome: test.status,
          duration: result.duration,
          error: failedAttempt ? errorSummary(failedAttempt.error) : null,
          screenshots: [],
        };
        for (const attachment of result.attachments ?? []) {
          if (attachment.contentType !== 'image/png') continue;
          const fileName = `${slug(group.id)}--${slug(spec.title)}--${slug(attachment.name.replace(/\.png$/, ''))}.png`;
          const target = path.join(imageDirectory, fileName);
          if (attachment.body) {
            writeFileSync(target, Buffer.from(attachment.body, 'base64'));
          } else if (attachment.path && existsSync(attachment.path)) {
            copyFileSync(attachment.path, target);
          } else {
            continue;
          }
          screenshotCount += 1;
          entry.screenshots.push({ ...describeScreenshot(attachment.name), file: `${IMAGE_DIR}/${fileName}` });
        }
        group.tests.push(entry);
      }
    }
  }

  const allGroups = [...groups.values()];
  const baselines = collectBaselines(allGroups.filter((group) => group.inLedger), imageDirectory);
  const galleryPath = path.join(reportDirectory, 'screenshots.html');
  writeFileSync(galleryPath, renderGallery(allGroups, baselines, results.stats, path.basename(reportDirectory)));
  return {
    galleryPath,
    screenshotCount,
    testCount: allGroups.reduce((sum, group) => sum + group.tests.length, 0),
  };
}

function collectSpecs(suite) {
  return [...(suite.specs ?? []), ...(suite.suites ?? []).flatMap(collectSpecs)];
}

/**
 * Splits a responsive screenshot name, `[variant-]<preset>-<page|open>.png`, into its parts. Any
 * other attachment (a spec's own named capture, a failure screenshot) keeps its name as an "other".
 */
function describeScreenshot(name) {
  const stem = name.replace(/\.png$/, '');
  for (const preset of PRESETS_BY_ID_LENGTH) {
    for (const state of STATES) {
      const suffix = `${preset.id}-${state}`;
      if (stem !== suffix && !stem.endsWith(`-${suffix}`)) continue;
      return { name: stem, preset, state, variant: stem.slice(0, -suffix.length).replace(/-$/, '') };
    }
  }
  return { name: stem, preset: null, state: 'other', variant: '' };
}

function collectBaselines(groups, imageDirectory) {
  const baselines = [];
  for (const group of groups) {
    for (const specFile of group.specFiles) {
      const snapshotDirectory = path.join(ROOT_DIR, `${specFile}-snapshots`);
      if (!existsSync(snapshotDirectory)) continue;
      for (const file of readdirSync(snapshotDirectory).filter((name) => name.endsWith('.png')).sort()) {
        const target = `baseline--${slug(group.id)}--${file}`;
        copyFileSync(path.join(snapshotDirectory, file), path.join(imageDirectory, target));
        baselines.push({ group: group.title, name: file, file: `${IMAGE_DIR}/${target}` });
      }
    }
  }
  return baselines;
}

function renderGallery(groups, baselines, stats, runName) {
  const presetOrder = new Map(VIEWPORT_PRESETS.map((preset, index) => [preset.id, index]));
  const sortKey = (shot) => [
    shot.variant,
    shot.preset ? presetOrder.get(shot.preset.id) : VIEWPORT_PRESETS.length,
    STATES.includes(shot.state) ? STATES.indexOf(shot.state) : STATES.length,
  ];
  const compare = (a, b) => {
    const [ka, kb] = [sortKey(a), sortKey(b)];
    for (let i = 0; i < ka.length; i += 1) if (ka[i] !== kb[i]) return ka[i] < kb[i] ? -1 : 1;
    return 0;
  };

  const shownGroups = groups.filter((group) => group.inLedger || group.tests.some((test) => test.screenshots.length > 0));
  const notPassed = groups
    .flatMap((group) => group.tests)
    .filter((test) => test.outcome === 'unexpected' || test.outcome === 'flaky');

  const notPassedSection = notPassed.length
    ? `<section class="not-passed"><h2>Not passed <small>${notPassed.length} tests · traces and full errors are in the <a href="index.html">Playwright report</a></small></h2><ul>${notPassed
        .map((test) => `<li class="${test.outcome === 'flaky' ? '' : 'failed'}"><b>${escapeHtml(test.group)}</b>: ${testLink(test)} <span class="muted">${statusLabel(test)}</span>${test.error ? `<code>${escapeHtml(test.error)}</code>` : ''}</li>`)
        .join('')}</ul></section>`
    : '';

  const sections = shownGroups.map((group) => {
    const cards = group.tests
      .flatMap((test) => test.screenshots.map((shot) => ({ ...shot, test })))
      .sort(compare)
      .map(renderCard)
      .join('');
    const withoutScreenshots = group.tests.filter((test) => test.screenshots.length === 0);
    const screenshotTotal = group.tests.reduce((sum, test) => sum + test.screenshots.length, 0);
    return `
      <section id="${escapeHtml(group.id)}">
        <h2>${escapeHtml(group.title)} <small>${group.tests.length} tests · ${screenshotTotal} screenshots</small></h2>
        ${cards ? `<div class="grid">${cards}</div>` : '<p class="muted">No screenshots were attached.</p>'}
        ${withoutScreenshots.length ? `<details><summary>${withoutScreenshots.length} tests without screenshots</summary><ul>${withoutScreenshots.map((test) => `<li class="${testClass(test)}">${testLink(test)} <span class="muted">${statusLabel(test)} · ${seconds(test.duration)}</span></li>`).join('')}</ul></details>` : ''}
      </section>`;
  });

  const baselineSection = baselines.length
    ? `<section id="baselines"><h2>Committed pixel baselines <small>${baselines.length} images the @visual tests compare against</small></h2><div class="grid">${baselines
        .map((baseline) => `<figure data-search="${escapeHtml(`baseline pixel @visual ${baseline.group} ${baseline.name}`.toLowerCase())}" data-state="baseline" data-passed="true"><a class="frame" href="${baseline.file}" target="_blank"><img loading="lazy" src="${baseline.file}" alt=""></a><figcaption><b>${escapeHtml(baseline.group)}</b><br>${escapeHtml(baseline.name)}</figcaption></figure>`)
        .join('')}</div></section>`
    : '';

  const summary = stats
    ? `${stats.expected} passed · ${stats.unexpected} failed · ${stats.flaky} flaky · ${stats.skipped} skipped · ${(stats.duration / 60000).toFixed(1)} min`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>E2E screenshots: ${escapeHtml(runName)}</title>
    <style>
      :root { color-scheme: light; font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; color: #1a1a1a; background: #f5f5f5; }
      * { box-sizing: border-box; }
      body { margin: 0; padding: 20px 16px 64px; }
      .page { max-width: 1480px; margin: 0 auto; }
      h1 { font-size: 22px; margin: 0 0 4px; }
      h2 { font-size: 17px; margin: 28px 0 10px; }
      h2 small, .muted { color: #6c757d; font-weight: 400; font-size: 13px; }
      a { color: #0069d9; }
      .summary { color: #525252; font-size: 13px; margin: 0 0 12px; }
      .toolbar { position: sticky; top: 0; z-index: 1; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 10px 0; background: #f5f5f5; }
      .toolbar input { padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 6px; font: inherit; min-width: 240px; }
      .toolbar button { padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; font: inherit; cursor: pointer; }
      .toolbar button[aria-pressed="true"] { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
      nav a { margin-right: 12px; font-size: 13px; text-decoration: none; }
      .not-passed { background: #fff5f5; border: 1px solid #fecaca; border-radius: 8px; padding: 2px 14px 10px; margin-top: 12px; }
      .not-passed h2 { margin-top: 12px; }
      .not-passed ul, details ul { margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.5; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
      figure { margin: 0; background: #fff; border: 1px solid #e6e6e6; border-radius: 8px; padding: 8px; }
      figure.failed { border-color: #dc2626; box-shadow: 0 0 0 2px #fecaca; }
      figure.expected-failure { border-color: #d97706; }
      .frame { -webkit-tap-highlight-color: transparent; display: flex; align-items: center; justify-content: center; height: 240px; background: #555; border-radius: 4px; overflow: hidden; }
      .frame img { max-width: 100%; max-height: 240px; object-fit: contain; }
      figcaption { margin-top: 6px; font-size: 12px; line-height: 1.35; color: #333; }
      figcaption b { font-size: 13px; }
      .state { display: inline-block; padding: 1px 6px; border-radius: 999px; background: #eef; color: #335; margin-left: 4px; }
      code { display: block; margin-top: 4px; color: #b91c1c; white-space: pre-wrap; font-size: 12px; }
      figure[hidden] { display: none; }
      details { margin-top: 8px; font-size: 13px; }
      li.failed { color: #b91c1c; }
      body.lightbox-open { overflow: hidden; }
      .lightbox { position: fixed; inset: 0; z-index: 10; display: grid; grid-template-columns: 64px minmax(0, 1fr) 64px; grid-template-rows: auto minmax(0, 1fr) auto; background: #111; color: #eee; }
      .lightbox[hidden] { display: none; }
      .lightbox:focus { outline: none; }
      .lightbox-bar { grid-column: 1 / -1; grid-row: 1; display: flex; align-items: center; gap: 12px; padding: 10px 14px; font-size: 13px; }
      .lightbox-count { color: #aaa; font-variant-numeric: tabular-nums; }
      .lightbox-title { font-weight: 600; }
      .lightbox-hint { color: #888; }
      .lightbox-close { margin-left: auto; width: 36px; height: 36px; border: 0; border-radius: 999px; background: rgba(255, 255, 255, 0.12); color: #fff; font-size: 16px; cursor: pointer; }
      .lightbox-nav { grid-row: 2; align-self: center; justify-self: center; width: 48px; height: 48px; border: 0; border-radius: 999px; background: rgba(255, 255, 255, 0.12); color: #fff; font-size: 30px; line-height: 1; cursor: pointer; }
      .lightbox-prev { grid-column: 1; }
      .lightbox-next { grid-column: 3; }
      .lightbox-close:hover, .lightbox-nav:hover { background: rgba(255, 255, 255, 0.26); }
      .lightbox-close:focus-visible, .lightbox-nav:focus-visible { outline: 2px solid #9cc9ff; outline-offset: 2px; }
      .lightbox-stage { grid-column: 2; grid-row: 2; display: flex; align-items: center; justify-content: center; min-height: 0; overflow: auto; }
      .lightbox-stage img { max-width: 100%; max-height: 100%; object-fit: contain; cursor: zoom-in; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5); }
      .lightbox.actual-size .lightbox-stage { display: block; }
      .lightbox.actual-size .lightbox-stage img { max-width: none; max-height: none; cursor: zoom-out; }
      .lightbox-caption { grid-column: 1 / -1; grid-row: 3; padding: 8px 16px 14px; font-size: 13px; line-height: 1.45; text-align: center; color: #ddd; }
      .lightbox-caption a { color: #9cc9ff; }
      .lightbox-caption code { display: inline-block; text-align: left; color: #fca5a5; }
      .lightbox-caption .state { background: #334; color: #cde; }
      @media (max-width: 640px) {
        .lightbox { grid-template-columns: 40px minmax(0, 1fr) 40px; }
        .lightbox-nav { width: 34px; height: 34px; font-size: 24px; }
        .lightbox-hint { display: none; }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <h1>E2E screenshots: ${escapeHtml(runName)}</h1>
      <p class="summary">${escapeHtml(summary)} · <a href="index.html">Playwright report</a> · click a screenshot to view it here and step through with the arrow keys, or a test title to open it in the report</p>
      <nav>${shownGroups.map((group) => `<a href="#${escapeHtml(group.id)}">${escapeHtml(group.title)}</a>`).join('')}${baselines.length ? '<a href="#baselines">Pixel baselines</a>' : ''}</nav>
      ${notPassedSection}
      <div class="toolbar">
        <input id="filter" type="search" placeholder="Filter by preset, state, test or fixture" aria-label="Filter screenshots">
        <button type="button" data-state="" aria-pressed="true">All states</button>
        <button type="button" data-state="page">Page</button>
        <button type="button" data-state="open">Open</button>
        <button type="button" data-failed="1" aria-pressed="false">Not passed only</button>
      </div>
      ${sections.join('')}
      ${baselineSection}
    </main>
    <div id="lightbox" class="lightbox" role="dialog" aria-modal="true" aria-label="Screenshot viewer" tabindex="-1" hidden>
      <div class="lightbox-bar">
        <span id="lightbox-count" class="lightbox-count" aria-live="polite"></span>
        <span id="lightbox-title" class="lightbox-title"></span>
        <span class="lightbox-hint">← → to step · click the image for actual size · Esc to close</span>
        <button type="button" class="lightbox-close" aria-label="Close viewer">✕</button>
      </div>
      <button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous screenshot">‹</button>
      <div class="lightbox-stage"><img id="lightbox-image" alt=""></div>
      <button type="button" class="lightbox-nav lightbox-next" aria-label="Next screenshot">›</button>
      <div id="lightbox-caption" class="lightbox-caption"></div>
    </div>
    <script>
      const figures = [...document.querySelectorAll('figure[data-search]')];
      const filter = document.getElementById('filter');
      const buttons = [...document.querySelectorAll('.toolbar button')];
      let state = '';
      let failedOnly = false;
      function apply() {
        const needle = filter.value.trim().toLowerCase();
        for (const figure of figures) {
          figure.hidden = !(
            (!needle || figure.dataset.search.includes(needle)) &&
            (!state || figure.dataset.state === state) &&
            (!failedOnly || figure.dataset.passed === 'false')
          );
        }
      }
      filter.addEventListener('input', apply);
      for (const button of buttons) {
        button.addEventListener('click', () => {
          if (button.dataset.failed) {
            failedOnly = !failedOnly;
            button.setAttribute('aria-pressed', String(failedOnly));
          } else {
            state = button.dataset.state;
            for (const other of buttons) if (!other.dataset.failed) other.setAttribute('aria-pressed', String(other === button));
          }
          apply();
        });
      }

      // In-page viewer: steps through the screenshots currently shown, so a filter narrows it too.
      const lightbox = document.getElementById('lightbox');
      const lightboxImage = document.getElementById('lightbox-image');
      const lightboxStage = lightbox.querySelector('.lightbox-stage');
      const lightboxTitle = document.getElementById('lightbox-title');
      const lightboxCaption = document.getElementById('lightbox-caption');
      const lightboxCount = document.getElementById('lightbox-count');
      let lightboxItems = [];
      let lightboxIndex = 0;
      let touchStartX = null;

      function renderLightbox() {
        const link = lightboxItems[lightboxIndex];
        const figure = link.closest('figure');
        const heading = figure.closest('section') && figure.closest('section').querySelector('h2');
        lightbox.classList.remove('actual-size');
        lightboxStage.scrollTo(0, 0);
        lightboxImage.src = link.getAttribute('href');
        lightboxTitle.textContent = heading ? heading.firstChild.textContent.trim() : '';
        lightboxCaption.innerHTML = figure.querySelector('figcaption').innerHTML;
        lightboxCount.textContent = (lightboxIndex + 1) + ' / ' + lightboxItems.length;
        for (const offset of [1, -1]) {
          const neighbour = lightboxItems[(lightboxIndex + offset + lightboxItems.length) % lightboxItems.length];
          if (neighbour) new Image().src = neighbour.getAttribute('href');
        }
      }
      function openLightbox(link) {
        lightboxItems = [...document.querySelectorAll('figure:not([hidden]) a.frame')];
        lightboxIndex = Math.max(0, lightboxItems.indexOf(link));
        lightbox.hidden = false;
        document.body.classList.add('lightbox-open');
        renderLightbox();
        lightbox.focus();
      }
      function closeLightbox() {
        const current = lightboxItems[lightboxIndex];
        lightbox.hidden = true;
        document.body.classList.remove('lightbox-open');
        lightboxImage.removeAttribute('src');
        if (current) {
          current.scrollIntoView({ block: 'nearest' });
          current.focus({ preventScroll: true });
        }
      }
      function stepLightbox(offset) {
        lightboxIndex = (lightboxIndex + offset + lightboxItems.length) % lightboxItems.length;
        renderLightbox();
      }

      // A plain click opens the viewer; modified clicks keep the browser's open-in-new-tab behaviour.
      document.addEventListener('click', (event) => {
        const link = event.target.closest('a.frame');
        if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        openLightbox(link);
      });
      lightbox.querySelector('.lightbox-prev').addEventListener('click', () => stepLightbox(-1));
      lightbox.querySelector('.lightbox-next').addEventListener('click', () => stepLightbox(1));
      lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox || event.target === lightboxStage) closeLightbox();
      });
      lightboxImage.addEventListener('click', () => lightbox.classList.toggle('actual-size'));
      document.addEventListener('keydown', (event) => {
        if (lightbox.hidden) return;
        if (event.key === 'Escape') closeLightbox();
        else if (event.key === 'ArrowRight') stepLightbox(1);
        else if (event.key === 'ArrowLeft') stepLightbox(-1);
        else if (event.key === 'Tab') {
          // Keep keyboard focus inside the viewer while it is open.
          const focusable = [...lightbox.querySelectorAll('button, a[href]')];
          const position = focusable.indexOf(document.activeElement);
          const next = position === -1 ? (event.shiftKey ? focusable.length - 1 : 0) : position + (event.shiftKey ? -1 : 1);
          focusable[(next + focusable.length) % focusable.length].focus();
        } else return;
        event.preventDefault();
      });
      lightbox.addEventListener('touchstart', (event) => { touchStartX = event.touches[0].clientX; }, { passive: true });
      lightbox.addEventListener('touchend', (event) => {
        if (touchStartX === null || lightbox.classList.contains('actual-size')) return;
        const distance = event.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(distance) > 50) stepLightbox(distance < 0 ? 1 : -1);
      }, { passive: true });
    </script>
  </body>
</html>
`;
}

function renderCard(shot) {
  const { test } = shot;
  const presetLabel = shot.preset ? `${shot.preset.id} ${shot.preset.width}×${shot.preset.height}` : shot.name;
  const search = [test.title, test.group, shot.name, shot.variant, shot.state, shot.preset?.id, shot.preset?.label]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return `<figure class="${testClass(test)}" data-search="${escapeHtml(search)}" data-state="${escapeHtml(shot.state)}" data-passed="${test.status === 'passed'}">
    <a class="frame" href="${shot.file}" target="_blank"><img loading="lazy" src="${shot.file}" alt=""></a>
    <figcaption><b>${escapeHtml(presetLabel)}</b>${shot.variant ? ` · ${escapeHtml(shot.variant)}` : ''}${shot.preset ? `<span class="state">${escapeHtml(shot.state)}</span>` : ''}<br>${statusLabel(test)} · ${seconds(test.duration)}<br>${testLink(test)}${test.error ? `<code>${escapeHtml(test.error)}</code>` : ''}</figcaption>
  </figure>`;
}

/** The HTML report routes to a test by its ID. */
function testLink(test) {
  return test.id
    ? `<a href="index.html#?testId=${encodeURIComponent(test.id)}" target="_blank">${escapeHtml(test.title)}</a>`
    : escapeHtml(test.title);
}

function testClass(test) {
  if (test.status === 'passed' || test.status === 'skipped') return '';
  return test.outcome === 'expected' ? 'expected-failure' : 'failed';
}

function statusLabel(test) {
  if (test.outcome === 'expected' && test.status === 'failed') return 'failed as expected (known bug)';
  if (test.outcome === 'flaky') return 'passed on retry';
  return test.status;
}

function errorSummary(error) {
  const text = stripAnsi(error?.message ?? error?.value ?? String(error ?? ''));
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join('\n')
    .slice(0, 400);
}

function seconds(milliseconds) {
  return `${(milliseconds / 1000).toFixed(1)}s`;
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120);
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, '');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

/** The runner keeps one report at a time, so the gallery defaults to whichever fixture report exists. */
function currentReportDirectory() {
  const fixturesDirectory = path.join(ROOT_DIR, 'playwright-report', 'fixtures');
  const reports = existsSync(fixturesDirectory)
    ? readdirSync(fixturesDirectory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : [];
  if (reports.length === 0) throw new Error('No fixture report found; run scripts/run-fixture-e2e.mjs first.');
  return path.join(fixturesDirectory, reports.includes('all') ? 'all' : reports[0]);
}

if (isDirectExecution) {
  try {
    const reportDirectory = process.argv[2] ? path.resolve(ROOT_DIR, process.argv[2]) : currentReportDirectory();
    const { galleryPath, screenshotCount, testCount } = buildScreenshotGallery(reportDirectory);
    console.log(`Screenshot gallery: ${galleryPath} (${screenshotCount} screenshots from ${testCount} tests)`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
