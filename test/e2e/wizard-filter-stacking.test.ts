import { expect, test } from '@playwright/test';

test('wizard filters remain clickable above sticky group headings', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/tests/string-replacement.html?display=wizard');

  await page.getByRole('button', { name: '▽OPEN CONFIGURATOR▽' }).click({ timeout: 30000 });
  const wizard = page.locator('[data-ov25-wizard-display-mode="wizard"]');
  await expect(wizard.locator('.ov25-group-header').first()).toBeVisible({ timeout: 30000 });
  const filtersButton = wizard.locator('#ov25-filter-controls-button');
  await filtersButton.click();

  const filter = wizard.locator('#ov25-filter-content button.ov25-filter-pill').first();
  await expect(filter).toBeVisible();
  await expect(filter).toHaveAttribute('data-checked', 'false');
  await filter.click();
  await expect(filter).toHaveAttribute('data-checked', 'true');

  await filtersButton.click();
  await expect(filter).toHaveCount(0);
  await expect(wizard.locator('.ov25-group-header').first()).toBeVisible();
});
