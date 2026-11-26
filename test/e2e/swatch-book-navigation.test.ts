import { expect, test } from '@playwright/test';

test('the swatch book returns to an inline gallery with working fullscreen controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/tests/gallery-inline-list-no-variant-thumbs.html');

  const fullscreen = page.locator('#ov25-desktop-fullscreen-button');
  await expect(fullscreen).toBeVisible();
  await page.getByRole('button', { name: 'Open Swatch Book', exact: true }).click();
  const book = page.getByRole('dialog', { name: 'Swatch Book' });
  await book.getByRole('button', { name: 'Open 3D Configurator' }).click();
  await expect(book).toBeHidden();
  await expect(fullscreen).toBeVisible();

  await fullscreen.click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await fullscreen.click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
});

for (const { name, width, height, selector } of [
  { name: 'desktop sheet', width: 1440, height: 900, selector: '#ov25-variants-shadow-container #ov25-configurator-variant-menu-container' },
  { name: 'mobile drawer', width: 390, height: 844, selector: '#ov25-mobile-drawer-container #ov25-drawer-content' },
]) {
  test(`the empty swatch book opens the ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/tests/single-custom-button.html');
    const viewer = page.locator('#ov25-configurator-iframe');
    await expect(viewer).toHaveAttribute('data-fullscreen', 'false');
    await page.getByRole('button', { name: 'Open swatches', exact: true }).click();
    const book = page.getByRole('dialog', { name: 'Swatch Book' });
    await book.getByText('3D Configurator', { exact: true }).click();
    await expect(book).toBeHidden();
    await expect(viewer).toHaveAttribute('data-fullscreen', 'true');
    await page.locator(selector).getByRole('button', { name: 'Upholstery Fabrics', exact: true }).click();
  });
}
