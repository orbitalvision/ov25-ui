import { test, expect } from '@playwright/test';

test.describe('Hidden logo (branding.hideLogo)', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('range: mask logo removed when hideLogo; snap2: header wrapper removed when hideLogo', async ({ page }) => {
    await page.goto('/tests/hidden-logo.html');

    const price = page.locator('.ov25-configurator-price');
    await expect(price).toBeVisible({ timeout: 20000 });

    const headerLogo = page.locator('.ov25-variant-header-logo');
    await expect(headerLogo).toBeVisible({ timeout: 20000 });

    const productTitle = page.locator('#ov25-configurator-name');
    await expect(productTitle).toHaveText(/\S/, { timeout: 20000 });
    const loadedDisplayTitle = (await productTitle.textContent())?.trim() ?? '';
    expect(loadedDisplayTitle).not.toBe('');

    const configuratorIframe = page.locator('#ov25-configurator-iframe');
    await expect(configuratorIframe).toHaveAttribute(
      'title',
      /^3D configurator for .+ range\.$/,
      { timeout: 20000 },
    );
    const iframeTitle = await configuratorIframe.getAttribute('title');
    const rangeName = iframeTitle
      ?.replace(/^3D configurator for /, '')
      .replace(/ range\.$/, '') ?? '';
    expect(loadedDisplayTitle.startsWith(`${rangeName}-`)).toBe(true);
    const loadedProductTitle = loadedDisplayTitle.slice(rangeName.length + 1);
    expect(loadedProductTitle).not.toBe('');

    await page.getByTestId('hide-logo-button').click();
    await expect(headerLogo).toHaveCount(0, { timeout: 20000 });
    const headerName = page.locator('#ov25-variants-header .ov25-variants-header-name');
    await expect
      .poll(
        async () => {
          const [titleText, headerText] = await Promise.all([
            productTitle.textContent(),
            headerName.textContent(),
          ]);
          const normalizedTitle = titleText?.trim() ?? '';
          const normalizedHeader = headerText?.trim() ?? '';
          return {
            titleUnchanged: normalizedTitle === loadedDisplayTitle,
            hasHeaderName: normalizedHeader.length > 0,
            headerMatchesLoadedTitle: normalizedHeader === loadedProductTitle,
          };
        },
        { timeout: 20000 },
      )
      .toEqual({
        titleUnchanged: true,
        hasHeaderName: true,
        headerMatchesLoadedTitle: true,
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
