import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import {
  RESPONSIVE_LAYOUT_PRESETS,
  RESPONSIVE_SCREENSHOT_STATES,
  expectedResponsiveLayout,
  responsiveLayoutTestTitle,
  responsiveScreenshotName,
} from '../../../dev/react-test/config/responsive-layout.js';
import {
  CONFIGURATOR_LOADED_LOG,
  SNAP2_READY_SELECTOR,
  VARIANTS_READY_SELECTOR,
  hideDevelopmentOverlays,
  readDevelopmentOverlay,
  waitForConfiguratorLoaded,
  waitForDecodedImages,
  waitForStableLayout,
} from '../../../scripts/lib/configurator-readiness.mjs';

export type ViewportPreset = (typeof RESPONSIVE_LAYOUT_PRESETS)[number];
export type Layout = 'desktop' | 'mobile';
export type Product = 'standard' | 'snap2';
export type ConfiguratorLoad = Promise<{ ok: boolean; error?: unknown }>;

export type ResponsiveLayoutOptions = {
  /** Fixture URL, including any query string. */
  path: string;
  /** How the fixture shows its configurator: from Configure, already open on load, or inline. */
  opens: keyof typeof RESPONSIVE_SCREENSHOT_STATES;
  product?: Product;
  /** Prefixes titles and screenshot names when one spec covers several setups of its fixture. */
  variant?: string;
  /** Fixture-specific checks, run once the configurator has loaded. */
  check?: (page: Page, layout: Layout) => Promise<void>;
};

const RUNTIME_TIMEOUT = 30_000;
const LOAD_TIMEOUT = 60_000;

/** Pixel baselines are recorded headless, so @visual tests only compare in headless runs. */
export const PIXEL_BASELINES_ENABLED = process.env.OV25_E2E_NEW_HEADLESS === 'true';
export const PIXEL_BASELINES_SKIP_REASON =
  'Pixel baselines are recorded headless: run through scripts/run-fixture-e2e.mjs or set OV25_E2E_NEW_HEADLESS=true.';

/** Browser context options for a preset: its size plus its touch and mobile emulation. */
export function presetContext(preset: ViewportPreset) {
  return {
    viewport: { width: preset.width, height: preset.height },
    isMobile: preset.isMobile,
    hasTouch: preset.hasTouch,
    deviceScaleFactor: 1,
  };
}

/**
 * Starts listening for the iframe's "OV25 3D Loaded" console line. Call it before the iframe can
 * mount (before page.goto, or before opening a Snap2 builder) so a fast load is not missed, then
 * pass the result to `expectConfiguratorLoaded` once the iframe should have loaded.
 */
export function watchConfiguratorLoad(page: Page): ConfiguratorLoad {
  return waitForConfiguratorLoaded(page, LOAD_TIMEOUT);
}

/** Fails with the iframe's error overlay text, if any, when the 3D scene never loaded. */
export async function expectConfiguratorLoaded(page: Page, load: ConfiguratorLoad): Promise<void> {
  const result = await load;
  if (result.ok) return;
  const overlay = await readDevelopmentOverlay(page);
  throw new Error(
    `The configurator did not log "${CONFIGURATOR_LOADED_LOG}" within ${LOAD_TIMEOUT / 1000}s.` +
      (overlay ? ` The OV25 dev server showed an error overlay in the iframe: ${overlay}` : ''),
  );
}

/** Waits until the variant controls (or Snap2 modules) have rendered inside `root`. */
export async function expectVariantControls(
  root: Page | Locator,
  product: Product = 'standard',
): Promise<void> {
  const selector = product === 'snap2' ? SNAP2_READY_SELECTOR : VARIANTS_READY_SELECTOR;
  await expect(root.locator(selector).first()).toBeVisible({ timeout: RUNTIME_TIMEOUT });
}

/** Attaches a screenshot once images have decoded and the layout has stopped moving. */
export async function attachSettledScreenshot(
  page: Page,
  testInfo: TestInfo,
  name: string,
): Promise<void> {
  await hideDevelopmentOverlays(page);
  await waitForDecodedImages(page, 5_000);
  await waitForStableLayout(page, 8_000);
  await testInfo.attach(name, {
    body: await page.screenshot({ animations: 'disabled' }),
    contentType: 'image/png',
  });
}

/** Scrolls the 3D view into view; OV25 defers its scene while the view is off screen. */
export async function scrollGalleryIntoView(page: Page): Promise<void> {
  await page.locator('#ov25-configurator-iframe').scrollIntoViewIfNeeded({ timeout: RUNTIME_TIMEOUT });
}

/**
 * The in-page 3D view must fit on screen without covering all of it. On a phone held sideways a
 * full-width square view was taller than the viewport, and once it filled the screen the canvas
 * took every swipe, so the page could not be scrolled to the Configure button below.
 */
export async function expectViewFitsOnScreen(page: Page): Promise<void> {
  const view = page.locator('#ov25-configurator-iframe');
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Responsive checks need a fixed viewport');
  await scrollGalleryIntoView(page);
  await expectInsideViewport(view);
  await expect
    .poll(async () => {
      const box = await view.boundingBox();
      return box ? box.width < viewport.width - 1 || box.height < viewport.height - 1 : false;
    }, { message: 'the 3D view leaves page content on screen beside or below it' })
    .toBe(true);
}

/** On a landscape viewport the fixtures put the aside beside the gallery, so Configure shows with the view. */
export async function expectConfigureBesideView(page: Page): Promise<void> {
  const viewport = page.viewportSize();
  if (!viewport || viewport.width <= viewport.height) return;
  await expectInsideViewport(configureButton(page));
}

export function configureButton(page: Page): Locator {
  return page.getByRole('button', { name: /^Configure(?:\s|$)/i }).filter({ visible: true }).first();
}

export function desktopSheet(page: Page): Locator {
  return page
    .locator('#ov25-variants-shadow-container')
    .locator('#ov25-configurator-variant-menu-container');
}

export function mobileDrawer(page: Page): Locator {
  return page.locator('#ov25-mobile-drawer-container').locator('#ov25-drawer-content');
}

export function snap2Builder(page: Page): Locator {
  return page.locator('#ov25-snap2-modal-frame');
}

/** The surface the configurator opens into for a product at a layout. */
export function configuratorSurface(page: Page, product: Product, layout: Layout): Locator {
  if (layout === 'mobile') return mobileDrawer(page);
  return product === 'snap2' ? snap2Builder(page) : desktopSheet(page);
}

/** Polls until the element is visible inside the viewport; `axis: 'x'` checks only its width. */
export async function expectInsideViewport(
  locator: Locator,
  { axis = 'both' }: { axis?: 'x' | 'both' } = {},
): Promise<void> {
  const viewport = locator.page().viewportSize();
  if (!viewport) throw new Error('Responsive checks need a fixed viewport');
  await expect
    .poll(
      async () => {
        const box = await locator.boundingBox({ timeout: 1_000 }).catch(() => null);
        if (!box || box.width === 0 || box.height === 0) return 'not visible';
        const insideX = box.x >= -1 && box.x + box.width <= viewport.width + 1;
        const insideY = axis === 'x' || (box.y >= -1 && box.y + box.height <= viewport.height + 1);
        return insideX && insideY
          ? 'inside'
          : `outside: ${Math.round(box.x)},${Math.round(box.y)} ${Math.round(box.width)}x${Math.round(box.height)} in ${viewport.width}x${viewport.height}`;
      },
      { timeout: RUNTIME_TIMEOUT },
    )
    .toBe('inside');
}

export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
          document.documentElement.clientWidth,
      ),
    )
    .toBeLessThanOrEqual(1);
}

async function expectSheetOffScreen(page: Page): Promise<void> {
  const viewportWidth = page.viewportSize()?.width ?? 0;
  await expect
    .poll(
      async () => {
        const box = await desktopSheet(page).boundingBox({ timeout: 1_000 }).catch(() => null);
        return !box || box.x >= viewportWidth - 1;
      },
      { timeout: RUNTIME_TIMEOUT },
    )
    .toBe(true);
}

/** Closes a standard sheet or drawer the way a shopper would and waits until it has gone. */
export async function closeStandardSurface(page: Page, layout: Layout): Promise<void> {
  if (layout === 'desktop') {
    await desktopSheet(page).getByRole('button', { name: 'Close', exact: true }).click();
    await expectSheetOffScreen(page);
  } else {
    await page.getByRole('button', { name: 'Close', exact: true }).filter({ visible: true }).first().click();
    await expect(mobileDrawer(page)).toBeHidden({ timeout: RUNTIME_TIMEOUT });
  }
}

/**
 * Registers one test per viewport preset for a ledger fixture. Each waits for the 3D view to load
 * and the variant controls to render, then checks what should hold at any size without comparing
 * pixels: the layout the breakpoint rule predicts, no horizontal scroll, the gallery and Configure
 * button inside the viewport, and the sheet or drawer opening on screen and closing again. A
 * screenshot of each state is attached to the report for review.
 */
export function defineResponsiveLayoutTests(options: ResponsiveLayoutOptions): void {
  const product = options.product ?? 'standard';

  for (const preset of RESPONSIVE_LAYOUT_PRESETS) {
    test.describe(() => {
      test.use(presetContext(preset));

      test(responsiveLayoutTestTitle(preset, options.variant), async ({ page }, testInfo) => {
        test.setTimeout(120_000);
        const layout = expectedResponsiveLayout(preset, product) as Layout;
        const surface = configuratorSurface(page, product, layout);
        const attach = async (state: string) => {
          // Page screenshots show the product rather than the fixture's own controls.
          if (state === 'page' && product === 'standard') await scrollGalleryIntoView(page);
          await attachSettledScreenshot(page, testInfo, responsiveScreenshotName(preset, state, options.variant));
        };

        const load = watchConfiguratorLoad(page);
        await page.goto(options.path);
        if (product === 'standard') {
          await expect(page.locator('#ov25-configurator-iframe')).toBeAttached({ timeout: RUNTIME_TIMEOUT });
          // A short landscape phone can push the gallery below the fold, where OV25 waits to load it.
          await scrollGalleryIntoView(page);
          await expectConfiguratorLoaded(page, load);
          await expect(page.locator('#ov25-configurator-name')).toHaveText(/\S/, { timeout: RUNTIME_TIMEOUT });
          await expectInsideViewport(page.locator('#ov-25-configurator-gallery-container'), { axis: 'x' });
          // With the configurator open on load, the lifted view is checked once it has closed.
          if (options.opens !== 'on-load') await expectViewFitsOnScreen(page);
        } else {
          // Snap2 only mounts its 3D view once the builder opens.
          await expect(configureButton(page)).toBeVisible({ timeout: RUNTIME_TIMEOUT });
        }
        await options.check?.(page, layout);

        if (options.opens === 'inline') {
          await expectVariantControls(page, product);
          await expect(mobileDrawer(page)).toBeHidden();
          await expectSheetOffScreen(page);
          await expectNoHorizontalScroll(page);
          await attach('page');
          return;
        }

        if (options.opens === 'on-load') {
          await expectInsideViewport(surface);
          await expectVariantControls(surface, product);
          await expectNoHorizontalScroll(page);
          await attach('open');
          await closeStandardSurface(page, layout);
          await expect(configureButton(page)).toBeVisible();
          await expectViewFitsOnScreen(page);
          await expectConfigureBesideView(page);
          await expectNoHorizontalScroll(page);
          await attach('page');
          return;
        }

        await expectInsideViewport(configureButton(page), { axis: 'x' });
        if (product === 'standard') await expectConfigureBesideView(page);
        await expectNoHorizontalScroll(page);
        await attach('page');

        await configureButton(page).click();
        await expectInsideViewport(surface);
        if (product === 'snap2') await expectConfiguratorLoaded(page, load);
        // The Snap2 builder fills the viewport, and its settings panel can sit outside the frame element.
        await expectVariantControls(product === 'snap2' ? page : surface, product);
        await expectNoHorizontalScroll(page);
        await attach('open');

        // Closing Snap2 goes through its save dialog, which the Snap2 close tests cover.
        if (product === 'standard') {
          await closeStandardSurface(page, layout);
          await expect(configureButton(page)).toBeVisible();
        }
      });
    });
  }
}
