/**
 * Readiness checks for pages that embed the OV25 configurator, shared by the viewport matrix capture
 * and the fixture E2E specs so both use the same definition of "loaded".
 */

/** Logged by the OV25 iframe (SceneContext) once its 3D scene has finished loading. */
export const CONFIGURATOR_LOADED_LOG = 'OV25 3D Loaded';

export const VARIANTS_READY_SELECTOR = [
  '.ov25-size-variant-card:visible',
  '.ov25-default-variant-card:visible',
  '[data-ov25-variant-option]:visible',
  '[data-ov25-tree-variants-mode] .ov25-option-header:visible',
  '[data-ov25-accordion-variants-mode] .ov25-option-header:visible',
].join(', ');

/**
 * Snap2 adds its modules list, which can be the only content in the mobile drawer. With nothing
 * selected the list settles on "empty" rather than "ready", so only "loading" means not ready.
 */
export const SNAP2_READY_SELECTOR = [
  VARIANTS_READY_SELECTOR,
  '#ov25-snap2-modules-body:not([data-ov25-snap2-modules-state="loading"]):visible',
].join(', ');

/**
 * Resolves `{ ok: true }` when the iframe logs that its 3D scene has loaded, or `{ ok: false }` on
 * timeout. Subscribe before the iframe can mount (before page.goto, or before opening a Snap2
 * builder) so a fast load is not missed.
 */
export async function waitForConfiguratorLoaded(page, timeoutMs) {
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

/** Text of a Next.js error overlay shown in any frame, or null when none is showing. */
export async function readDevelopmentOverlay(page) {
  for (const frame of page.frames()) {
    const text = await frame
      .locator('nextjs-portal')
      .evaluateAll((portals) =>
        portals
          .map((portal) => portal.shadowRoot?.textContent?.replace(/\s+/g, ' ').trim() ?? '')
          .filter(Boolean)
          .join(' | '),
      )
      .catch(() => '');
    if (/build error|runtime error|unhandled|failed to compile/i.test(text)) return text.slice(0, 300);
  }
  return null;
}

export async function hideDevelopmentOverlays(page) {
  for (const frame of page.frames()) {
    await frame
      .locator('nextjs-portal')
      .evaluateAll((portals) => {
        for (const portal of portals) portal.style.setProperty('display', 'none', 'important');
      })
      .catch(() => {});
  }
}

export async function waitForDecodedImages(page, timeoutMs) {
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

export async function waitForStableLayout(page, timeoutMs) {
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
