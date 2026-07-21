#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args = parseArgs(process.argv.slice(2));

if (args.help || args.h) {
  printHelp();
  process.exit(0);
}

const target = args.url ?? args._[0];

if (!target) {
  printHelp();
  process.exitCode = 1;
  process.exit();
}

const baseUrl = String(args.base ?? 'http://localhost:3008').replace(/\/$/, '');
const url = normalizeTarget(target, baseUrl);
const viewport = getViewport(args);
const waitMs = Number(args.waitMs ?? args.wait ?? 1000);
const timeout = Number(args.timeout ?? 60000);
const selectors = asArray(args.selector);
const clickSelectors = asArray(args.clickSelector);
const clickTexts = asArray(args.clickText);
const clickRowTexts = asArray(args.clickRowText);
const frameSelectors = asArray(args.frameSelector);
const frameClickSelectors = asArray(args.frameClickSelector);
const frameClickTexts = asArray(args.frameClickText);
const probes = asArray(args.probe);
const screenshotPath = args.screenshot ? path.resolve(String(args.screenshot)) : null;

const browser = await chromium.launch({ headless: args.headed ? false : true });
const page = await browser.newPage({
  viewport: viewport.size,
  isMobile: viewport.mobile,
  hasTouch: viewport.mobile,
});

try {
  await page.goto(url, {
    waitUntil: String(args.waitUntil ?? 'domcontentloaded'),
    timeout,
  });

  if (waitMs > 0) {
    await page.waitForTimeout(waitMs);
  }

  for (const selector of clickSelectors) {
    await clickDeep(page, { selector });
    if (waitMs > 0) await page.waitForTimeout(waitMs);
  }

  for (const text of clickTexts) {
    await clickDeep(page, { text });
    if (waitMs > 0) await page.waitForTimeout(waitMs);
  }

  for (const text of clickRowTexts) {
    await clickRowByText(page, text);
    if (waitMs > 0) await page.waitForTimeout(waitMs);
  }

  for (const selector of frameClickSelectors) {
    await clickFrameDeep(page, { selector });
    if (waitMs > 0) await page.waitForTimeout(waitMs);
  }

  for (const text of frameClickTexts) {
    await clickFrameDeep(page, { text });
    if (waitMs > 0) await page.waitForTimeout(waitMs);
  }

  const result = await page.evaluate(
    ({ selectors, probes }) => {
      const roots = collectRoots();
      const wants = new Set(probes.length ? probes : selectors.length ? [] : ['summary']);

      const output = {
        url: window.location.href,
        title: document.title,
        bodyText: document.body.innerText.slice(0, 500),
        roots: roots.length,
      };

      if (selectors.length) {
        output.selectors = Object.fromEntries(
          selectors.map((selector) => [
            selector,
            queryDeep(roots, selector).map(serializeElement),
          ])
        );
      }

      if (wants.has('summary') || wants.has('buttons')) {
        output.buttons = queryDeep(roots, 'button').map(serializeElement);
      }

      if (wants.has('summary') || wants.has('inline-variants')) {
        const inlineSelector = [
          '[data-ov25-list-variants-mode="inline"]',
          '[data-ov25-wizard-variants-mode="inline"]',
        ].join(', ');
        output.inlineVariantControls = queryDeep(roots, inlineSelector).map(serializeElement);
      }

      if (wants.has('summary') || wants.has('variant-images')) {
        output.variantImages = queryDeep(
          roots,
          '.ov25-selection-thumbnail img, .ov25-variant-thumb-wrapper img'
        ).map((img) => ({
          ...serializeElement(img),
          src: img.getAttribute('src'),
          srcset: img.getAttribute('srcset'),
          sizes: img.getAttribute('sizes'),
          alt: img.getAttribute('alt'),
        }));
      }

      if (wants.has('summary') || wants.has('swatches')) {
        output.swatches = queryDeep(
          roots,
          '#ov25-selected-swatches-container, #ov25-swatchbook, #ov25-filter-controls-swatches, [data-ov25-swatch-book-button]'
        ).map(serializeElement);
      }

      if (wants.has('summary') || wants.has('gallery')) {
        output.gallery = queryDeep(
          roots,
          '.ov25-gallery-image-button, #ov25-product-carousel button, [data-ov25-fullscreen-gallery], [data-ov25-gallery-fullscreen]'
        ).map(serializeElement);
      }

      return output;

      function collectRoots() {
        const rootsToSearch = [document];
        const seen = new Set();

        for (let index = 0; index < rootsToSearch.length; index += 1) {
          const root = rootsToSearch[index];
          root.querySelectorAll?.('*').forEach((element) => {
            if (element.shadowRoot && !seen.has(element.shadowRoot)) {
              seen.add(element.shadowRoot);
              rootsToSearch.push(element.shadowRoot);
            }
          });
        }

        return rootsToSearch;
      }

      function queryDeep(rootsToSearch, selector) {
        return rootsToSearch.flatMap((root) => Array.from(root.querySelectorAll?.(selector) ?? []));
      }

      function serializeElement(element) {
        const rect = element.getBoundingClientRect();

        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || null,
          className: typeof element.className === 'string' ? element.className : '',
          text: (element.innerText || element.textContent || element.getAttribute('aria-label') || '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 160),
          ariaLabel: element.getAttribute('aria-label'),
          title: element.getAttribute('title'),
          src: element.getAttribute('src'),
          href: element.getAttribute('href'),
          visible: Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length),
          inViewport:
            rect.bottom > 0 &&
            rect.right > 0 &&
            rect.top < window.innerHeight &&
            rect.left < window.innerWidth,
          computedStyle: {
            display: window.getComputedStyle(element).display,
            visibility: window.getComputedStyle(element).visibility,
            opacity: window.getComputedStyle(element).opacity,
            pointerEvents: window.getComputedStyle(element).pointerEvents,
            transform: window.getComputedStyle(element).transform,
          },
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        };
      }
    },
    { selectors, probes }
  );

  if (args.frames || frameSelectors.length || frameClickSelectors.length || frameClickTexts.length) {
    result.frames = await collectFrameInfo(page, {
      selectors: frameSelectors,
      probes,
    });
  }

  if (screenshotPath) {
    await page.screenshot({
      path: screenshotPath,
      fullPage: Boolean(args.fullPage),
    });
    result.screenshot = screenshotPath;
  }

  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

function getViewport(options) {
  const viewportName = String(options.viewport ?? (options.mobile ? 'mobile' : 'desktop'));

  if (/^\d+x\d+$/i.test(viewportName)) {
    const [width, height] = viewportName.toLowerCase().split('x').map(Number);
    return { size: { width, height }, mobile: Boolean(options.mobile) };
  }

  if (viewportName === 'mobile') {
    return { size: { width: 390, height: 844 }, mobile: true };
  }

  if (viewportName === 'tablet') {
    return { size: { width: 820, height: 1180 }, mobile: false };
  }

  return { size: { width: 1280, height: 900 }, mobile: false };
}

function normalizeTarget(rawTarget, baseUrl) {
  const value = String(rawTarget);

  if (/^(https?:|file:)/.test(value)) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${baseUrl}${value}`;
  }

  if (value.startsWith('tests/')) {
    return `${baseUrl}/${value}`;
  }

  if (value.endsWith('.html') || value.includes('.html?')) {
    return `${baseUrl}/tests/${value}`;
  }

  return `${baseUrl}/${value}`;
}

async function clickDeep(page, targetOptions) {
  const clicked = await page.evaluate(({ selector, text }) => {
    const roots = [document];
    const seen = new Set();

    for (let index = 0; index < roots.length; index += 1) {
      const root = roots[index];
      root.querySelectorAll?.('*').forEach((element) => {
        if (element.shadowRoot && !seen.has(element.shadowRoot)) {
          seen.add(element.shadowRoot);
          roots.push(element.shadowRoot);
        }
      });

      const candidates = selector
        ? Array.from(root.querySelectorAll?.(selector) ?? [])
        : Array.from(root.querySelectorAll?.('button, [role="button"], a') ?? []);

      const match = candidates.find((element) => {
        if (!text) return true;
        const label = (element.innerText || element.textContent || element.getAttribute('aria-label') || '')
          .replace(/\s+/g, ' ')
          .trim();
        return label === text || label.includes(text);
      });

      if (match) {
        match.click();
        return true;
      }
    }

    return false;
  }, targetOptions);

  if (!clicked) {
    const label = targetOptions.selector ?? targetOptions.text;
    throw new Error(`Could not find click target: ${label}`);
  }
}

async function clickRowByText(page, text) {
  const clicked = await page.evaluate((targetText) => {
    const normalizedTarget = String(targetText).replace(/\s+/g, ' ').trim();
    const roots = [document];
    const seen = new Set();

    for (let index = 0; index < roots.length; index += 1) {
      const root = roots[index];
      root.querySelectorAll?.('*').forEach((element) => {
        if (element.shadowRoot && !seen.has(element.shadowRoot)) {
          seen.add(element.shadowRoot);
          roots.push(element.shadowRoot);
        }
      });

      const labels = Array.from(root.querySelectorAll?.('span, label, p, div') ?? []);
      const label = labels.find((element) => {
        const ownText = Array.from(element.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent ?? '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        return ownText === normalizedTarget || ownText.includes(normalizedTarget);
      });

      if (!label) continue;

      let container = label.parentElement;
      for (let depth = 0; container && depth < 5; depth += 1, container = container.parentElement) {
        const button = container.querySelector('button, [role="switch"], [role="button"]');
        if (button) {
          button.click();
          return true;
        }
      }
    }

    return false;
  }, text);

  if (!clicked) {
    throw new Error(`Could not find row click target: ${text}`);
  }
}

async function collectFrameInfo(page, options) {
  const frames = page.frames().filter((frame) => frame !== page.mainFrame());

  return Promise.all(
    frames.map(async (frame) => {
      try {
        return await frame.evaluate(({ selectors, probes }) => {
          const roots = collectRoots();
          const wants = new Set(probes.length ? probes : selectors.length ? [] : ['summary']);
          const output = {
            url: window.location.href,
            title: document.title,
            bodyText: document.body.innerText.slice(0, 500),
            roots: roots.length,
          };

          if (selectors.length) {
            output.selectors = Object.fromEntries(
              selectors.map((selector) => [
                selector,
                queryDeep(roots, selector).map(serializeElement),
              ])
            );
          }

          if (wants.has('summary') || wants.has('buttons')) {
            output.buttons = queryDeep(roots, 'button').map(serializeElement);
          }

          if (wants.has('summary') || wants.has('inline-variants')) {
            const inlineSelector = [
              '[data-ov25-list-variants-mode="inline"]',
              '[data-ov25-wizard-variants-mode="inline"]',
            ].join(', ');
            output.inlineVariantControls = queryDeep(roots, inlineSelector).map(serializeElement);
          }

          if (wants.has('summary') || wants.has('variant-images')) {
            output.variantImages = queryDeep(
              roots,
              '.ov25-selection-thumbnail img, .ov25-variant-thumb-wrapper img'
            ).map((img) => ({
              ...serializeElement(img),
              src: img.getAttribute('src'),
              srcset: img.getAttribute('srcset'),
              sizes: img.getAttribute('sizes'),
              alt: img.getAttribute('alt'),
            }));
          }

          if (wants.has('summary') || wants.has('swatches')) {
            output.swatches = queryDeep(
              roots,
              '#ov25-selected-swatches-container, #ov25-swatchbook, #ov25-filter-controls-swatches, [data-ov25-swatch-book-button]'
            ).map(serializeElement);
          }

          if (wants.has('summary') || wants.has('gallery')) {
            output.gallery = queryDeep(
              roots,
              '.ov25-gallery-image-button, #ov25-product-carousel button, [data-ov25-fullscreen-gallery], [data-ov25-gallery-fullscreen]'
            ).map(serializeElement);
          }

          return output;

          function collectRoots() {
            const rootsToSearch = [document];
            const seen = new Set();

            for (let index = 0; index < rootsToSearch.length; index += 1) {
              const root = rootsToSearch[index];
              root.querySelectorAll?.('*').forEach((element) => {
                if (element.shadowRoot && !seen.has(element.shadowRoot)) {
                  seen.add(element.shadowRoot);
                  rootsToSearch.push(element.shadowRoot);
                }
              });
            }

            return rootsToSearch;
          }

          function queryDeep(rootsToSearch, selector) {
            return rootsToSearch.flatMap((root) => Array.from(root.querySelectorAll?.(selector) ?? []));
          }

          function serializeElement(element) {
            const rect = element.getBoundingClientRect();

            return {
              tag: element.tagName.toLowerCase(),
              id: element.id || null,
              className: typeof element.className === 'string' ? element.className : '',
              text: (element.innerText || element.textContent || element.getAttribute('aria-label') || '')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 160),
              ariaLabel: element.getAttribute('aria-label'),
              title: element.getAttribute('title'),
              src: element.getAttribute('src'),
              href: element.getAttribute('href'),
              visible: Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length),
              inViewport:
                rect.bottom > 0 &&
                rect.right > 0 &&
                rect.top < window.innerHeight &&
                rect.left < window.innerWidth,
              computedStyle: {
                display: window.getComputedStyle(element).display,
                visibility: window.getComputedStyle(element).visibility,
                opacity: window.getComputedStyle(element).opacity,
                pointerEvents: window.getComputedStyle(element).pointerEvents,
                transform: window.getComputedStyle(element).transform,
              },
              rect: {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
              },
            };
          }
        }, options);
      } catch (error) {
        return {
          url: frame.url(),
          error: error instanceof Error ? error.message : String(error),
        };
      }
    })
  );
}

async function clickFrameDeep(page, targetOptions) {
  for (const frame of page.frames().filter((candidate) => candidate !== page.mainFrame())) {
    const clicked = await frame.evaluate(({ selector, text }) => {
      const roots = [document];
      const seen = new Set();

      for (let index = 0; index < roots.length; index += 1) {
        const root = roots[index];
        root.querySelectorAll?.('*').forEach((element) => {
          if (element.shadowRoot && !seen.has(element.shadowRoot)) {
            seen.add(element.shadowRoot);
            roots.push(element.shadowRoot);
          }
        });

        const candidates = selector
          ? Array.from(root.querySelectorAll?.(selector) ?? [])
          : Array.from(root.querySelectorAll?.('button, [role="button"], a') ?? []);

        const match = candidates.find((element) => {
          if (!text) return true;
          const label = (element.innerText || element.textContent || element.getAttribute('aria-label') || '')
            .replace(/\s+/g, ' ')
            .trim();
          return label === text || label.includes(text);
        });

        if (match) {
          match.click();
          return true;
        }
      }

      return false;
    }, targetOptions);

    if (clicked) return;
  }

  const label = targetOptions.selector ?? targetOptions.text;
  throw new Error(`Could not find frame click target: ${label}`);
}

function parseArgs(argv) {
  const parsed = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith('--')) {
      parsed._.push(arg);
      continue;
    }

    const withoutPrefix = arg.slice(2);
    const equalsIndex = withoutPrefix.indexOf('=');
    const rawKey = equalsIndex >= 0 ? withoutPrefix.slice(0, equalsIndex) : withoutPrefix;
    const key = rawKey.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    let value = equalsIndex >= 0 ? withoutPrefix.slice(equalsIndex + 1) : true;

    if (value === true && argv[index + 1] && !argv[index + 1].startsWith('--')) {
      value = argv[index + 1];
      index += 1;
    }

    if (parsed[key] == null) {
      parsed[key] = value;
    } else if (Array.isArray(parsed[key])) {
      parsed[key].push(value);
    } else {
      parsed[key] = [parsed[key], value];
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`Usage:
  node scripts/check-local-fixture.mjs <fixture-or-url> [options]

Examples:
  node scripts/check-local-fixture.mjs gallery-inline-list.html --probe variant-images
  node scripts/check-local-fixture.mjs /tests/snap2-dialog.html --viewport mobile --selector "#ov25-snap2-controls"
  node scripts/check-local-fixture.mjs single-product-gallery.html --screenshot review-screenshots/gallery.png

Options:
  --base <url>              Base URL for relative targets. Default: http://localhost:3008
  --viewport <name|WxH>     desktop, tablet, mobile, or e.g. 390x844
  --mobile                  Use touch/mobile flags with the viewport
  --wait-ms <ms>            Wait after navigation/clicks. Default: 1000
  --timeout <ms>            Navigation timeout. Default: 60000
  --probe <name>            summary, buttons, inline-variants, variant-images, swatches, gallery
  --selector <css>          Query selector across document and shadow roots. Repeatable.
  --frames                  Include iframe summaries
  --frame-selector <css>    Query selector inside iframes and their shadow roots. Repeatable.
  --click-selector <css>    Click first selector match across document and shadow roots. Repeatable.
  --click-text <text>       Click first button/link text match across document and shadow roots. Repeatable.
  --click-row-text <text>   Click button/switch in the row whose label contains text. Repeatable.
  --frame-click-selector <css>
                            Click first selector match inside iframes and their shadow roots. Repeatable.
  --frame-click-text <text> Click first button/link text match inside iframes and their shadow roots. Repeatable.
  --screenshot <path>       Save a screenshot
  --full-page               Capture full-page screenshot
`);
}
