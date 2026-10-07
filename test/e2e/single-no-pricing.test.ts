import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  SNAP2_CLOSE_PRESET_IDS,
  expectedResponsiveLayout,
  presetSize,
  responsivePreset,
} from '../../dev/react-test/config/responsive-layout.js';
import {
  configureButton,
  configuratorSurface,
  defineResponsiveLayoutTests,
  expectConfiguratorLoaded,
  expectInsideViewport,
  expectVariantControls,
  presetContext,
  snap2Builder,
  watchConfiguratorLoad,
  type Layout,
} from './support/responsive-layout';

const FIXTURE_PATH = '/tests/single-no-pricing.html';
const RUNTIME_TIMEOUT = 30_000;
const MOBILE_VIEWPORT = { width: 375, height: 667 };
const VARIANT_DISPLAY_MODES = [
  'wizard',
  'guided-overview',
  'list',
  'tabs',
  'accordion',
  'tree',
] as const;
const PROFILES = ['standard', 'snap2'] as const;

type VariantDisplayMode = (typeof VARIANT_DISPLAY_MODES)[number];
type Profile = (typeof PROFILES)[number];

function mobileDrawer(page: Page): Locator {
  return page
    .locator('#ov25-mobile-drawer-container')
    .locator('#ov25-drawer-content');
}

function modeSurface(page: Page, mode: VariantDisplayMode): Locator {
  switch (mode) {
    case 'wizard':
    case 'guided-overview':
      return page.locator(`[data-ov25-wizard-display-mode="${mode}"]:visible`).first();
    case 'tabs':
      return page.locator('[data-ov25-tabs-container]:visible').first();
    case 'accordion':
      return page.locator('[data-ov25-accordion-variants-mode]:visible').first();
    case 'tree':
      return page.locator('[data-ov25-tree-variants-mode]:visible').first();
    case 'list':
      return page
        .locator('#ov25-variants-content-wrapper:visible [data-ov25-option-id]:visible')
        .first();
  }
}

async function expectNoPricing(page: Page): Promise<void> {
  await expect(page.locator('#price')).toHaveCount(0);
  await expect(page.locator('#ov25-configurator-price-container')).toHaveCount(0);
  await expect(page.locator('.ov25-configurator-price')).toHaveCount(0);
  await expect(page.locator('#ov25-price-product-page')).toHaveCount(0);
  await expect(page.locator('#ov25-savings-amount-product-page')).toHaveCount(0);
  await expect(page.locator('#ov25-savings-percentage-product-page')).toHaveCount(0);
  await expect(page.locator('[data-ov25-checkout-price-label]:visible')).toHaveCount(0);
  await expect(page.locator('#ov25-snap2-checkout-sheet-total-value:visible')).toHaveCount(0);
  await expect(page.locator('.ov25-snap2-checkout-line-subtotal:visible')).toHaveCount(0);
  await expect(page.locator('.ov25-snap2-checkout-line-total:visible')).toHaveCount(0);
}

async function expectNoPurchaseActions(page: Page): Promise<void> {
  await expect(page.locator('#ov25-checkout-button:visible')).toHaveCount(0);
  await expect(page.locator('#ov25-add-to-basket-button:visible')).toHaveCount(0);
  await expect(page.locator('#ov25-snap2-panel-checkout-button')).toHaveCount(0);
  await expect(page.locator('.ov25-checkout-combo-button:visible')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /buy now/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /add to (?:basket|cart)/i })).toHaveCount(0);
}

async function openVariantSurface(
  page: Page,
  profile: Profile,
  mode: VariantDisplayMode,
): Promise<Locator> {
  const configureButton = page
    .getByRole('button', { name: /^Configure(?:\s|$)/i })
    .filter({ visible: true })
    .first();
  await expect(configureButton).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await configureButton.click();

  const surface = modeSurface(page, mode);
  await expect(surface).toBeVisible({ timeout: RUNTIME_TIMEOUT });

  if (profile === 'snap2') {
    await expect(page.locator('#ov25-snap2-modal-frame')).toBeVisible({
      timeout: RUNTIME_TIMEOUT,
    });
  } else {
    await expect(page.locator('#ov25-variants-shadow-container')).toBeAttached({
      timeout: RUNTIME_TIMEOUT,
    });
  }

  return surface;
}

async function openMobileVariantSurface(
  page: Page,
  mode: VariantDisplayMode,
): Promise<{ drawer: Locator; surface: Locator }> {
  await page.goto(`${FIXTURE_PATH}?profile=standard&display=${mode}`);

  const fixtureControls = page.getByTestId('no-pricing-fixture-controls');
  await expect(fixtureControls).toHaveAttribute('data-profile', 'standard');
  await expect(fixtureControls).toHaveAttribute('data-display-mode', mode);
  await expect(fixtureControls).toHaveAttribute('data-hide-pricing', 'true');

  const configureButton = page
    .getByRole('button', { name: /^Configure(?:\s|$)/i })
    .filter({ visible: true })
    .first();
  await expect(configureButton).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await configureButton.click();

  const surface = modeSurface(page, mode);
  await expect(surface).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  const drawer = mobileDrawer(page);
  await expect(drawer).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await expect
    .poll(
      () =>
        drawer.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return { height: Math.round(rect.height), top: Math.round(rect.top) };
        }),
      { timeout: RUNTIME_TIMEOUT },
    )
    .toEqual({ height: 387, top: 280 });

  return { drawer, surface };
}

test.describe('Single product — hidePricing across variant display modes', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const profile of PROFILES) {
    for (const mode of VARIANT_DISPLAY_MODES) {
      test(`${profile} / ${mode}: hides page pricing and purchase actions`, async ({ page }) => {
        test.setTimeout(90_000);
        await page.goto(`${FIXTURE_PATH}?profile=${profile}&display=${mode}`);

        const fixtureControls = page.getByTestId('no-pricing-fixture-controls');
        await expect(fixtureControls).toHaveAttribute('data-profile', profile);
        await expect(fixtureControls).toHaveAttribute('data-display-mode', mode);
        await expect(fixtureControls).toHaveAttribute('data-hide-pricing', 'true');
        if (profile === 'standard') {
          await expect(page.locator('#ov25-configurator-iframe')).toBeVisible({
            timeout: RUNTIME_TIMEOUT,
          });
        }

        await expectNoPricing(page);
        await expectNoPurchaseActions(page);

        const surface = await openVariantSurface(page, profile, mode);

        await expectNoPricing(page);
        await expectNoPurchaseActions(page);

        if (mode === 'guided-overview') {
          const actions = surface.locator('[data-ov25-guided-overview-actions]');
          await expect(actions).toHaveAttribute(
            'data-ov25-guided-overview-has-buy-now',
            'false',
          );
          await expect(
            actions.locator('[data-ov25-guided-overview-action="buy-now"]'),
          ).toHaveCount(0);

          const columns = await actions.evaluate((element) =>
            getComputedStyle(element).gridTemplateColumns
              .split(/\s+/)
              .map((width) => Number.parseFloat(width)),
          );
          expect(columns).toHaveLength(2);
          expect(Math.abs(columns[0] - columns[1])).toBeLessThanOrEqual(1);
        }
      });
    }
  }
});

test.describe('Single product — hidePricing mobile drawer layout', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  for (const mode of ['tabs', 'tree'] as const) {
    test(`${mode} fills the drawer without reserving hidden checkout space`, async ({ page }) => {
      const { drawer, surface } = await openMobileVariantSurface(page, mode);

      await expectNoPricing(page);
      await expectNoPurchaseActions(page);

      const bottomGap = await surface.evaluate((element) => {
        const drawer = element.closest('#ov25-drawer-content');
        if (!drawer) throw new Error('Mobile drawer ancestor not found');
        return Math.round(
          drawer.getBoundingClientRect().bottom - element.getBoundingClientRect().bottom,
        );
      });
      expect(Math.abs(bottomGap)).toBeLessThanOrEqual(1);

      const reservedPadding = await drawer
        .locator('#ov25-variants-content-wrapper > div')
        .evaluateAll((elements) =>
          elements.map((element) => Number.parseFloat(getComputedStyle(element).paddingBottom)),
        );
      expect(reservedPadding.every((padding) => padding <= 8)).toBe(true);
    });
  }

  test('guided overview keeps only the viewer-level close button', async ({ page }) => {
    const { drawer } = await openMobileVariantSurface(page, 'guided-overview');

    await expect(drawer.locator('#ov25-variants-header-mobile')).toHaveCount(0);
    await expect(drawer.getByRole('button', { name: 'Close', exact: true })).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Close', exact: true }).filter({ visible: true }),
    ).toHaveCount(1);
  });

  test('wizard keeps Back in the same position on the final overview', async ({ page }) => {
    const { surface } = await openMobileVariantSurface(page, 'wizard');
    const back = surface.locator('.ov25-wizard-button-back');
    const next = surface.locator('.ov25-wizard-button-next');
    const review = surface.locator('[data-ov25-wizard-variants-step-content] dl');

    await expect(back).toBeVisible();
    const initialBox = await back.boundingBox();
    expect(initialBox).not.toBeNull();

    for (let attempt = 0; attempt < 10 && !(await review.isVisible().catch(() => false)); attempt += 1) {
      await expect(next).toBeVisible();
      await next.click();
    }

    await expect(review).toBeVisible();
    const reviewBox = await back.boundingBox();
    expect(reviewBox).not.toBeNull();
    expect(reviewBox!.x).toBeCloseTo(initialBox!.x, 0);
    expect(reviewBox!.y).toBeCloseTo(initialBox!.y, 0);
    expect(reviewBox!.width).toBeCloseTo(initialBox!.width, 0);
    expect(reviewBox!.height).toBeCloseTo(initialBox!.height, 0);
  });
});

for (const profile of PROFILES) {
  defineResponsiveLayoutTests({
    path: `${FIXTURE_PATH}?profile=${profile}&display=tree`,
    opens: 'configure',
    product: profile,
    variant: profile,
    check: async (page) => {
      await expectNoPricing(page);
      await expectNoPurchaseActions(page);
    },
  });
}

// Since the 0.8.0 layer refactor (layers.ts), the full-screen Snap2 mobile 3D layer that
// Snap2ConfigureButton portals to the body keeps a hard-coded z-index of 2147483644: above the
// drawer portal (2147483643) and tied with the dialog, so it takes taps meant for No.
const SNAP2_SAVE_DIALOG_BUG =
  'Known bug: the Snap2 mobile 3D layer sits above the drawer and covers the save dialog, so a tap on No dismisses the dialog and the builder stays open.';

for (const presetId of SNAP2_CLOSE_PRESET_IDS) {
  const preset = responsivePreset(presetId);

  test.describe(() => {
    test.use(presetContext(preset));

    test(`snap2 builder closes through the save dialog at ${preset.id} (${presetSize(preset)})`, async ({ page }) => {
      const layout = expectedResponsiveLayout(preset, 'snap2') as Layout;
      const load = watchConfiguratorLoad(page);
      await page.goto(`${FIXTURE_PATH}?profile=snap2&display=tree`);
      await configureButton(page).click({ timeout: RUNTIME_TIMEOUT });
      await expectInsideViewport(configuratorSurface(page, 'snap2', layout));
      await expectConfiguratorLoaded(page, load);
      await expectVariantControls(page, 'snap2');

      // On desktop the settings panel covers the builder's own close button, so it closes first.
      await page.getByRole('button', { name: 'Close', exact: true }).filter({ visible: true }).first().click();
      if (layout === 'desktop') {
        await page.getByRole('button', { name: 'Close modal', exact: true }).click();
      }
      const saveDialog = page.getByRole('dialog').filter({ hasText: 'Save Your Configuration' });
      await expect(saveDialog).toBeVisible({ timeout: RUNTIME_TIMEOUT });
      // Everything above works on every layout; only the dialog's own buttons are unreachable on mobile.
      test.fail(layout === 'mobile', SNAP2_SAVE_DIALOG_BUG);
      await saveDialog.getByRole('button', { name: 'No', exact: true }).click({ timeout: 5_000 });

      await expect(snap2Builder(page)).toBeHidden({ timeout: RUNTIME_TIMEOUT });
      await expect(mobileDrawer(page)).toBeHidden();
      await expect(configureButton(page)).toBeVisible();
    });
  });
}
