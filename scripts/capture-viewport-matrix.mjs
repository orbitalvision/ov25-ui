import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import {
  DEFAULT_VIEWPORT_MATRIX_TARGET,
  VIEWPORT_PRESETS,
} from '../dev/react-test/config/viewport-presets.js';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
export const VIEWPORT_MATRIX_OUTPUT_DIR = path.join(
  PROJECT_ROOT,
  'review-screenshots',
  'viewport-matrix',
);
export const VIEWPORT_MATRIX_MANIFEST_PATH = path.join(
  VIEWPORT_MATRIX_OUTPUT_DIR,
  'manifest.json',
);
const DEFAULT_BASE_URL = 'http://localhost:3008';
const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_SETTLE_MS = 1_200;
const CONFIGURATOR_LOADED_LOG = 'OV25 3D Loaded';
const VARIANTS_READY_SELECTOR = [
  '.ov25-size-variant-card:visible',
  '.ov25-default-variant-card:visible',
  '[data-ov25-variant-option]:visible',
  '[data-ov25-tree-variants-mode] .ov25-option-header:visible',
  '[data-ov25-accordion-variants-mode] .ov25-option-header:visible',
].join(', ');

export async function readViewportMatrixManifest() {
  try {
    return JSON.parse(await fs.readFile(VIEWPORT_MATRIX_MANIFEST_PATH, 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return null;
    throw error;
  }
}

export function normalizeViewportMatrixTarget(target) {
  const requestedTarget = String(target || DEFAULT_VIEWPORT_MATRIX_TARGET).trim();
  const rawTarget =
    !requestedTarget.startsWith('/') && !/^[a-z][a-z\d+.-]*:/i.test(requestedTarget)
      ? `/tests/${requestedTarget}`
      : requestedTarget;
  const url = new URL(rawTarget, 'http://ov25-fixture.local');

  if (url.origin !== 'http://ov25-fixture.local') {
    throw new Error('The viewport matrix can only capture local fixture paths.');
  }

  if (!url.pathname.startsWith('/tests/') || !url.pathname.endsWith('.html')) {
    throw new Error('Fixture path must point to an HTML page under /tests/.');
  }

  if (url.pathname.includes('..')) {
    throw new Error('Fixture path cannot contain parent-directory segments.');
  }

  return `${url.pathname}${url.search}`;
}

export async function captureViewportMatrix(options = {}) {
  const target = normalizeViewportMatrixTarget(options.target);
  const baseUrl = String(options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
  const timeoutMs = boundedNumber(options.timeoutMs, DEFAULT_TIMEOUT_MS, 1_000, 120_000);
  const settleMs = boundedNumber(options.settleMs, DEFAULT_SETTLE_MS, 0, 10_000);
  const onProgress = typeof options.onProgress === 'function' ? options.onProgress : () => {};
  const targetUrl = new URL(target, `${baseUrl}/`).toString();
  const targetDescriptor = new URL(target, 'http://ov25-fixture.local');
  const expectsReadyMarker =
    targetDescriptor.pathname === '/tests/responsive-layout-matrix.html' &&
    targetDescriptor.searchParams.get('capture') === '1';
  const targetSlug = createTargetSlug(target);
  const capturedAt = new Date().toISOString();
  const captures = [];

  await fs.mkdir(VIEWPORT_MATRIX_OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    // Mirrors the visual E2E suite so WebGL can render reliably in headless Chromium.
    args: ['--enable-unsafe-swiftshader'],
  });

  try {
    for (const [index, preset] of VIEWPORT_PRESETS.entries()) {
      onProgress({
        type: 'progress',
        phase: 'capturing',
        index,
        completed: index,
        total: VIEWPORT_PRESETS.length,
        preset,
      });

      const filename = `${targetSlug}--${preset.id}-${preset.width}x${preset.height}.png`;
      const screenshotPath = path.join(VIEWPORT_MATRIX_OUTPUT_DIR, filename);
      const context = await browser.newContext({
        viewport: { width: preset.width, height: preset.height },
        screen: { width: preset.width, height: preset.height },
        deviceScaleFactor: 1,
        hasTouch: preset.hasTouch,
        isMobile: preset.isMobile,
        colorScheme: 'light',
        reducedMotion: 'reduce',
        serviceWorkers: 'block',
      });

      let captureStage = 'navigation';
      const diagnostics = [];
      const pendingRequests = new Map();
      try {
        const page = await context.newPage();
        const fixtureServer = new URL(baseUrl);
        // A capture must not be reset by an unrelated file save while Vite is
        // running. Mock only the fixture server's HMR socket; iframe/app sockets
        // on other origins continue to work normally.
        await page.routeWebSocket(
          (url) => url.hostname === fixtureServer.hostname && url.port === fixtureServer.port,
          () => {},
        );
        page.on('request', (request) => {
          if (request.resourceType() === 'websocket') return;
          pendingRequests.set(request, Date.now());
        });
        page.on('requestfinished', (request) => pendingRequests.delete(request));
        page.on('console', (message) => {
          if (message.text().includes('/_next/webpack-hmr')) return;
          diagnostics.push(
            `[console:${message.type()}] ${sanitizeDiagnosticText(message.text()).slice(0, 500)}`,
          );
          if (diagnostics.length > 20) diagnostics.shift();
        });
        page.on('pageerror', (error) => {
          diagnostics.push(`[pageerror] ${sanitizeDiagnosticText(error.message).slice(0, 500)}`);
          if (diagnostics.length > 20) diagnostics.shift();
        });
        page.on('requestfailed', (request) => {
          pendingRequests.delete(request);
          if (request.url().includes('/_next/webpack-hmr')) return;
          diagnostics.push(
            `[requestfailed] ${request.failure()?.errorText || 'unknown error'} ${sanitizeDiagnosticText(request.url()).slice(0, 500)}`,
          );
          if (diagnostics.length > 20) diagnostics.shift();
        });
        page.on('response', (response) => {
          if (response.status() < 400) return;
          diagnostics.push(
            `[http:${response.status()}] ${sanitizeDiagnosticText(response.url()).slice(0, 500)}`,
          );
          if (diagnostics.length > 20) diagnostics.shift();
        });
        // Subscribe before navigation so a fast iframe cannot emit the ready log
        // between page.goto() and listener registration.
        const configuratorLoaded = waitForConfiguratorLoaded(page, timeoutMs);
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
        await page.evaluate(() => document.fonts?.ready);

        if (expectsReadyMarker) {
          captureStage = 'fixture mount';
          await page.locator('html[data-ov25-viewport-matrix-ready="true"]').waitFor({
            state: 'attached',
            timeout: Math.min(timeoutMs, 10_000),
          });
        }

        const iframe = page.locator('#ov25-configurator-iframe').first();
        captureStage = 'configurator iframe';
        const iframeTimeout = expectsReadyMarker ? timeoutMs : Math.min(timeoutMs, 15_000);
        const hasConfigurator = await iframe
          .waitFor({ state: 'attached', timeout: iframeTimeout })
          .then(() => true, () => false);

        if (expectsReadyMarker && !hasConfigurator) {
          throw new Error('Configurator iframe did not mount before the readiness timeout.');
        }

        if (hasConfigurator) {
          captureStage = `console message: ${CONFIGURATOR_LOADED_LOG}`;
          const loadedResult = await configuratorLoaded;
          if (!loadedResult.ok) {
            throw new Error(
              `Configurator did not log "${CONFIGURATOR_LOADED_LOG}" before the readiness timeout.`,
              { cause: loadedResult.error },
            );
          }
        }

        if (expectsReadyMarker) {
          captureStage = 'variant controls';
          await page.locator(VARIANTS_READY_SELECTOR).first().waitFor({
            state: 'visible',
            timeout: timeoutMs,
          });
        }

        await hideDevelopmentOverlays(page);
        captureStage = 'image decoding';
        await waitForDecodedImages(page, Math.min(timeoutMs, 5_000));
        captureStage = 'stable layout';
        await waitForStableLayout(page, Math.min(timeoutMs, 8_000));

        if (settleMs > 0) await page.waitForTimeout(settleMs);

        await page.screenshot({
          path: screenshotPath,
          fullPage: false,
          animations: 'disabled',
        });

        captures.push({
          ...preset,
          filename,
          screenshotUrl: `/__ov25/viewport-matrix/assets/${encodeURIComponent(filename)}`,
          status: 'captured',
        });
      } catch (error) {
        // Never leave a previous successful PNG behind under a newly failed entry.
        // Otherwise the gallery can appear to show a fresh capture that never happened.
        await fs.rm(screenshotPath, { force: true });
        const pendingDiagnostics = Array.from(pendingRequests.entries())
          .filter(([request]) => !request.url().includes('/_next/webpack-hmr'))
          .slice(0, 10)
          .map(
            ([request, startedAt]) =>
              `[pending:${Date.now() - startedAt}ms] ${request.method()} ${sanitizeDiagnosticText(request.url()).slice(0, 500)}`,
          );
        captures.push({
          ...preset,
          filename: null,
          screenshotUrl: null,
          status: 'failed',
          error: `${captureStage}: ${error instanceof Error ? error.message : String(error)}`,
          diagnostics: [...diagnostics, ...pendingDiagnostics],
        });
      } finally {
        await context.close();
      }

      onProgress({
        type: 'progress',
        phase: 'captured',
        index,
        completed: index + 1,
        total: VIEWPORT_PRESETS.length,
        preset,
        capture: captures.at(-1),
      });
    }
  } finally {
    await browser.close();
  }

  const failed = captures.filter((capture) => capture.status === 'failed').length;
  const manifest = {
    version: 1,
    status: failed === 0 ? 'complete' : 'partial',
    capturedAt,
    target,
    targetUrl,
    total: captures.length,
    failed,
    captures,
  };

  await writeJsonAtomically(VIEWPORT_MATRIX_MANIFEST_PATH, manifest);
  onProgress({ type: 'complete', manifest });
  return manifest;
}

async function waitForConfiguratorLoaded(page, timeoutMs) {
  return page
    .waitForEvent('console', {
      predicate: (message) => message.text().includes(CONFIGURATOR_LOADED_LOG),
      timeout: timeoutMs,
    })
    .then(
      () => ({ ok: true }),
      (error) => ({ ok: false, error }),
    );
}

async function hideDevelopmentOverlays(page) {
  for (const frame of page.frames()) {
    await frame
      .locator('nextjs-portal')
      .evaluateAll((portals) => {
        for (const portal of portals) portal.style.setProperty('display', 'none', 'important');
      })
      .catch(() => {});
  }
}

function sanitizeDiagnosticText(value) {
  return String(value)
    .replace(/(\/configurator\/)[^/?#\s]+/gi, '$1<redacted>')
    .replace(/([?&](?:apiKey|token)=)[^&\s]+/gi, '$1<redacted>');
}

function createTargetSlug(target) {
  const url = new URL(target, 'http://ov25-fixture.local');
  const file = path.basename(url.pathname, '.html');
  const query = Array.from(url.searchParams.entries())
    .map(([key, value]) => `${key}-${value}`)
    .join('-');
  return `${file}${query ? `-${query}` : ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function boundedNumber(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.min(maximum, Math.max(minimum, parsed))
    : fallback;
}

async function writeJsonAtomically(filePath, value) {
  const temporaryPath = `${filePath}.tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await fs.rename(temporaryPath, filePath);
}

async function waitForDecodedImages(page, timeoutMs) {
  await page.evaluate(async (maximumWaitMs) => {
    const roots = [document];
    const seen = new Set();

    for (let index = 0; index < roots.length; index += 1) {
      roots[index].querySelectorAll?.('*').forEach((element) => {
        if (element.shadowRoot && !seen.has(element.shadowRoot)) {
          seen.add(element.shadowRoot);
          roots.push(element.shadowRoot);
        }
      });
    }

    const images = roots.flatMap((root) => Array.from(root.querySelectorAll?.('img') ?? []));
    const decodeImages = Promise.allSettled(
      images.map(async (image) => {
        if (!image.complete) {
          await new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          });
        }
        await image.decode?.().catch(() => {});
      }),
    );

    await Promise.race([
      decodeImages,
      new Promise((resolve) => window.setTimeout(resolve, maximumWaitMs)),
    ]);
  }, timeoutMs);
}

async function waitForStableLayout(page, timeoutMs) {
  await page.evaluate(async (maximumWaitMs) => {
    const startedAt = performance.now();
    let stableSamples = 0;
    let previousSignature = '';

    const findDeep = (selector) => {
      const roots = [document];
      const seen = new Set();
      for (let index = 0; index < roots.length; index += 1) {
        const match = roots[index].querySelector?.(selector);
        if (match) return match;
        roots[index].querySelectorAll?.('*').forEach((element) => {
          if (element.shadowRoot && !seen.has(element.shadowRoot)) {
            seen.add(element.shadowRoot);
            roots.push(element.shadowRoot);
          }
        });
      }
      return null;
    };

    while (performance.now() - startedAt < maximumWaitMs && stableSamples < 4) {
      const body = document.body.getBoundingClientRect();
      const iframe = findDeep('#ov25-configurator-iframe')?.getBoundingClientRect();
      const signature = JSON.stringify({
        viewport: [window.innerWidth, window.innerHeight],
        document: [
          Math.round(body.width),
          Math.round(body.height),
          document.documentElement.scrollWidth,
          document.documentElement.scrollHeight,
        ],
        iframe: iframe
          ? [
              Math.round(iframe.x),
              Math.round(iframe.y),
              Math.round(iframe.width),
              Math.round(iframe.height),
            ]
          : null,
      });

      stableSamples = signature === previousSignature ? stableSamples + 1 : 0;
      previousSignature = signature;
      await new Promise((resolve) => window.setTimeout(resolve, 120));
    }
  }, timeoutMs);
}

function parseCliArgs(argv) {
  const output = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith('--')) continue;
    const [rawKey, inlineValue] = argument.slice(2).split('=', 2);
    const key = rawKey.replace(/-([a-z])/g, (_, character) => character.toUpperCase());
    const value = inlineValue ?? argv[index + 1];
    if (inlineValue == null && value && !value.startsWith('--')) index += 1;
    output[key] = value === undefined || value.startsWith('--') ? true : value;
  }

  return output;
}

function printHelp() {
  console.log(`Usage:
  node scripts/capture-viewport-matrix.mjs [options]

Options:
  --target <fixture>   Local fixture path. Default: ${DEFAULT_VIEWPORT_MATRIX_TARGET}
  --base-url <url>    Running fixture server. Default: ${DEFAULT_BASE_URL}
  --settle-ms <ms>    Delay after fixture readiness. Default: ${DEFAULT_SETTLE_MS}
  --timeout-ms <ms>   Navigation/readiness timeout. Default: ${DEFAULT_TIMEOUT_MS}
  --help               Show this help
`);
}

async function runCli() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const manifest = await captureViewportMatrix({
    target: args.target,
    baseUrl: args.baseUrl,
    settleMs: args.settleMs,
    timeoutMs: args.timeoutMs,
    onProgress(event) {
      if (event.type === 'progress' && event.phase === 'capturing') {
        console.log(
          `[${event.index + 1}/${event.total}] ${event.preset.label} (${event.preset.width}×${event.preset.height})`,
        );
      } else if (
        event.type === 'progress' &&
        event.phase === 'captured' &&
        event.capture?.status === 'failed'
      ) {
        console.error(`  Failed: ${event.capture.error}`);
        for (const diagnostic of event.capture.diagnostics || []) {
          console.error(`    ${diagnostic}`);
        }
      }
    },
  });

  console.log(`Captured ${manifest.total - manifest.failed}/${manifest.total} viewports.`);
  console.log(VIEWPORT_MATRIX_MANIFEST_PATH);
  if (manifest.failed > 0) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) {
  runCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
