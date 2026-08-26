import { expect, test, type Locator, type Page } from '@playwright/test';

const FIXTURE_PATH = '/tests/single-no-pricing.html';
const RUNTIME_TIMEOUT = 30_000;
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
