import { test, expect } from '@playwright/test';

test.describe('Hidden logo (branding.hideLogo)', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('range: mask logo removed when hideLogo; snap2: header wrapper removed when hideLogo', async ({ page }) => {
    await page.goto('/tests/hidden-logo.html');

    const price = page.locator('.ov25-configurator-price');
    await expect(price).toBeVisible({ timeout: 20000 });

    const headerLogo = page.locator('.ov25-variant-header-logo');
    await expect(headerLogo).toBeVisible({ timeout: 20000 });

    await page.getByTestId('hide-logo-button').click();
    await expect(headerLogo).toHaveCount(0, { timeout: 20000 });
    await expect(page.locator('#ov25-variants-header').getByText('Chaise LHF')).toBeVisible({
      timeout: 20000,
    });

    await page.getByTestId('product-snap2-button').click();
    await expect(price).toBeVisible({ timeout: 20000 });

    await page.getByTestId('show-logo-button').click();

    const headerWrapper = page.locator('#ov25-variants-header-wrapper');
    await expect(headerWrapper).toBeVisible({ timeout: 20000 });

    await page.getByTestId('hide-logo-button').click();

    await expect(headerWrapper).toHaveCount(0, { timeout: 20000 });
  });
});
