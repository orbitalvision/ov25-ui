import { expect, test, type Page } from '@playwright/test';

const FIXTURE = '/tests/multiple-standard-configurators-with-variants.html';
const RUNTIME_TIMEOUT = 30000;
const VIEWPORT = { width: 1440, height: 900 };

async function galleryHeight(page: Page, index: number): Promise<number> {
  const box = await page.locator(`#ov25-configurator-iframe-config-${index}`).boundingBox();
  return box?.height ?? 0;
}

test.use({ viewport: VIEWPORT });

for (const [configurator, index] of [[1, 0], [2, 1]] as const) {
  test(`autoOpen on configurator ${configurator} opens only that configurator`, async ({ page }) => {
    await page.goto(`${FIXTURE}?autoOpen=${configurator}`);

    // An open configurator's gallery moves beside the sheet at full viewport height; a closed one
    // stays in its product card.
    await expect
      .poll(() => galleryHeight(page, index), { timeout: RUNTIME_TIMEOUT })
      .toBeGreaterThanOrEqual(VIEWPORT.height - 1);
    expect(await galleryHeight(page, 1 - index)).toBeLessThan(VIEWPORT.height - 1);
  });
}
