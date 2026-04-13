import { test, expect } from '@playwright/test';

async function expectNoAddToBasketChrome(page: import('@playwright/test').Page) {
  await expect(page.locator('#ov25-add-to-basket-button')).toHaveCount(0);
  await expect(page.locator('.ov25-checkout-combo-button')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Add to basket' })).toHaveCount(0);
}

/**
 * Snap2 with useSimpleVariantsSelector (default): inject mounts VariantSelectMenu on the configure
 * selector (#ov25-fullscreen-button) in a shadow host — not under #ov25-controls. The inner
 * #ov25-configurator-variant-menu-container can exist but fail Playwright visibility; target the
 * actual Configure control by role (see inject.tsx useSimpleVariantsSelector branch).
 */
async function openSnap2Configurator(page: import('@playwright/test').Page) {
  const configure = page.locator('#ov25-aside-menu').getByRole('button', { name: 'Configure' });
  await expect(configure).toBeVisible({ timeout: 20000 });
  await configure.click();
}

test.describe('Inline variants — disable add to cart', () => {
  test('buy now only: inline, Snap2 modal rail, no combo / add-to-basket', async ({ page }) => {
    await page.goto('/tests/inline-variants-disable-add-to-cart.html');

    const price = page.locator('.ov25-configurator-price');
    await expect(price).toBeVisible({ timeout: 15000 });

    const buyNow = page.locator('#ov25-checkout-button');
    await expect(buyNow).toBeVisible({ timeout: 15000 });

    await expectNoAddToBasketChrome(page);

    const wrapper = page.locator('.ov25-checkout-button-wrapper').first();
    await expect(wrapper).toBeVisible();
    await expect(wrapper).toHaveScreenshot('inline-variants-disable-add-to-cart-checkout.png', {
      maxDiffPixelRatio: 0.04,
    });
  });
});
