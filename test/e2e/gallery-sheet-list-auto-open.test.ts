import { expect, test, type Locator, type Page } from '@playwright/test';

const FIXTURE = '/tests/gallery-sheet-list-auto-open.html';
const RUNTIME_TIMEOUT = 20000;

async function expectPageScrollLocked(page: Page) {
  await expect.poll(
    () => page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const html = getComputedStyle(document.documentElement);
      return (
        body.position === 'fixed' ||
        body.overflow === 'hidden' ||
        body.overflowY === 'hidden' ||
        html.overflow === 'hidden' ||
        html.overflowY === 'hidden'
      );
    }),
    { timeout: RUNTIME_TIMEOUT },
  ).toBe(true);
}

async function expectPageScrollUnlocked(page: Page) {
  await expect.poll(
    () => page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const html = getComputedStyle(document.documentElement);
      return !(
        body.position === 'fixed' ||
        body.overflow === 'hidden' ||
        body.overflowY === 'hidden' ||
        html.overflow === 'hidden' ||
        html.overflowY === 'hidden'
      );
    }),
    { timeout: RUNTIME_TIMEOUT },
  ).toBe(true);
}

async function expectSheetInsideViewport(sheet: Locator) {
  await expect
    .poll(
      () => sheet.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          hasWidth: rect.width > 0,
          leftInside: rect.left >= 0,
          rightInside: rect.right <= window.innerWidth,
        };
      }),
      { timeout: RUNTIME_TIMEOUT },
    )
    .toMatchObject({ hasWidth: true, leftInside: true, rightInside: true });
}

async function expectSheetOutsideRightOfViewport(sheet: Locator) {
  await expect
    .poll(
      () => sheet.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { outsideRight: rect.left >= document.documentElement.clientWidth };
      }),
      { timeout: RUNTIME_TIMEOUT },
    )
    .toMatchObject({ outsideRight: true });
}

test('desktop sheet auto-opens, closes, and reopens from Configure', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(FIXTURE);

  const sheet = page
    .locator('#ov25-variants-shadow-container')
    .locator('#ov25-configurator-variant-menu-container');

  await expectPageScrollLocked(page);
  await expectSheetInsideViewport(sheet);

  await sheet.getByRole('button', { name: 'Close' }).click();
  await expectPageScrollUnlocked(page);
  await expectSheetOutsideRightOfViewport(sheet);

  await page.getByRole('button', { name: 'Configure', exact: true }).click();
  await expectPageScrollLocked(page);
  await expectSheetInsideViewport(sheet);
});

function mobileDrawer(page: Page): Locator {
  return page
    .locator('#ov25-mobile-drawer-container')
    .locator('#ov25-drawer-content');
}

async function expectMobileDrawerOpen(page: Page) {
  const drawer = mobileDrawer(page);

  await expectPageScrollLocked(page);
  await expect(drawer).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await expect
    .poll(
      () => drawer.evaluate((element) => element.parentElement?.getBoundingClientRect().height ?? 0),
      { timeout: RUNTIME_TIMEOUT },
    )
    .toBeGreaterThan(0);
}

test('mobile drawer still auto-opens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(FIXTURE);

  await expectMobileDrawerOpen(page);
});

test('mobile drawer auto-opens when desktop shows the configurator inline', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${FIXTURE}?desktopMode=inline`);

  await expectMobileDrawerOpen(page);
});

test('desktop inline configurator stays closed through a resize to the mobile drawer', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${FIXTURE}?desktopMode=inline`);

  await expect(page.locator('.ov25-default-variant-card').first()).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await expectPageScrollUnlocked(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Configure', exact: true })).toBeVisible({
    timeout: RUNTIME_TIMEOUT,
  });
  // Auto-opening the inline configurator on desktop would open this drawer as soon as it mounts.
  await page.waitForTimeout(1000);
  await expect(mobileDrawer(page)).toBeHidden();
  await expectPageScrollUnlocked(page);
});
