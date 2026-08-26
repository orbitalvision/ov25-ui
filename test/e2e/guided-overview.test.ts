import { expect, test, type Locator, type Page } from '@playwright/test';

const FIXTURE = '/tests/gallery-inline-guided-overview.html';
const SHEET_FIXTURE = '/tests/gallery-sheet-guided-overview.html';
const RUNTIME_TIMEOUT = 30000;
const EXPECTED_CONTENT_HEIGHT = '500px';

const ROOT = '[data-ov25-wizard-display-mode="guided-overview"]';
const HEADER = '[data-ov25-guided-overview-header]';
const REVIEW = '[data-ov25-guided-overview-review="true"]';
const REVIEW_ROW = '[data-ov25-guided-overview-review-row]';
const REVIEW_OPTION = '[data-ov25-guided-overview-review-part="option"]';
const EDITOR = '[data-ov25-guided-overview-editor]';
const ACTIONS = '[data-ov25-guided-overview-actions]';
const PREVIOUS = '[data-ov25-guided-overview-action="previous"]';
const BUY_NOW = '[data-ov25-guided-overview-action="buy-now"]';
const NEXT = '[data-ov25-guided-overview-action="next"]';

type GuidedOverviewFixture = {
  root: Locator;
  rows: Locator;
  previous: Locator;
  next: Locator;
};

async function loadGuidedOverview(page: Page): Promise<GuidedOverviewFixture> {
  await page.goto(FIXTURE);

  const root = page.locator(ROOT);
  const rows = root.locator(REVIEW_ROW);
  const previous = root.locator(PREVIOUS);
  const next = root.locator(NEXT);

  await expect(root).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await expect
    .poll(() => rows.count(), { timeout: RUNTIME_TIMEOUT })
    .toBeGreaterThan(1);
  await expectReview(root);

  return { root, rows, previous, next };
}

async function optionNames(rows: Locator): Promise<string[]> {
  return (await rows.locator(REVIEW_OPTION).allInnerTexts()).map((name) => name.trim());
}

async function expectReview(root: Locator): Promise<void> {
  await expect(root.locator(HEADER).getByRole('heading', { level: 2 })).toHaveText('Review');
  await expect(root.locator(REVIEW)).toBeVisible();
  await expect(root.locator(EDITOR)).toHaveCount(0);
}

async function expectEditor(root: Locator, optionName: string): Promise<void> {
  await expect(root.locator(HEADER).getByRole('heading', { level: 2 })).toHaveText(
    `Choose ${optionName}`,
  );
  await expect(root.locator(EDITOR)).toBeVisible();
  await expect(root.locator(REVIEW)).toHaveCount(0);
}

async function expectConfiguredHeight(locator: Locator): Promise<void> {
  await expect(locator).toHaveCSS('height', EXPECTED_CONTENT_HEIGHT);
  await expect(locator).toHaveCSS('min-height', EXPECTED_CONTENT_HEIGHT);
  await expect(locator).toHaveCSS('max-height', EXPECTED_CONTENT_HEIGHT);
}

async function expectSingleScrollOwner(content: Locator): Promise<void> {
  await expect(content).toHaveCSS('overflow-y', 'hidden');
  await expect
    .poll(() => content.evaluate((element) => element.scrollHeight - element.clientHeight))
    .toBe(0);
}

test.describe('Guided Overview — inline variants', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('starts on Review with persistent actions and no wizard progress chrome', async ({ page }) => {
    const { root, rows, previous, next } = await loadGuidedOverview(page);
    const names = await optionNames(rows);

    await expect(previous).toBeDisabled();
    await expect(previous).toHaveText(/Prev/i);
    await expect(next).toBeEnabled();
    await expect(next).toHaveText(names[0]);
    await expect(root.locator(ACTIONS)).toHaveAttribute(
      'data-ov25-guided-overview-has-buy-now',
      'true',
    );
    await expect(root.locator(ACTIONS).getByRole('button')).toHaveCount(4);
    const checkout = root.locator(BUY_NOW);
    const buyNow = checkout.locator('#ov25-checkout-button');
    const addToBasket = checkout.locator('#ov25-add-to-basket-button');
    await expect(buyNow).toBeVisible();
    await expect(addToBasket).toBeVisible();
    const actionPositions = await Promise.all(
      [previous, next, checkout].map((button) => button.boundingBox()),
    );
    const [previousBox, nextBox, checkoutBox] = actionPositions;
    expect(previousBox).not.toBeNull();
    expect(nextBox).not.toBeNull();
    expect(checkoutBox).not.toBeNull();
    expect(Math.abs(previousBox!.y - nextBox!.y)).toBeLessThanOrEqual(1);
    expect(checkoutBox!.y).toBeGreaterThan(previousBox!.y + previousBox!.height - 1);
    expect(checkoutBox!.width).toBeGreaterThan(previousBox!.width + nextBox!.width - 2);
    await expect(root.locator('[data-ov25-checkout-price-label]').last()).toHaveText(/\S+/, {
      timeout: RUNTIME_TIMEOUT,
    });
    await expect(root.getByText(/Step \d+ of \d+/i)).toHaveCount(0);
  });

  test('opens an option from Review and the Undo button returns to Review', async ({ page }) => {
    const { root, rows } = await loadGuidedOverview(page);
    const names = await optionNames(rows);
    const targetIndex = 1;

    await rows.nth(targetIndex).getByRole('button').click();
    await expectEditor(root, names[targetIndex]);

    const backToReview = root.locator('.ov25-guided-overview-back');
    await expect(backToReview).toHaveAccessibleName('Back to review');
    await expect(backToReview.locator('.lucide-undo-2')).toBeVisible();
    await backToReview.click();

    await expectReview(root);
  });

  test('previous and next navigate between options and Review', async ({ page }) => {
    const { root, rows, previous, next } = await loadGuidedOverview(page);
    const names = await optionNames(rows);

    await next.click();
    await expectEditor(root, names[0]);
    await expect(previous).toHaveText('Review');
    await expect(next).toHaveText(names[1]);

    await next.click();
    await expectEditor(root, names[1]);
    await expect(previous).toHaveText(names[0]);

    await previous.click();
    await expectEditor(root, names[0]);

    await previous.click();
    await expectReview(root);
    await expect(previous).toBeDisabled();
  });

  test('Next on the final option leads back to Review', async ({ page }) => {
    const { root, rows, next } = await loadGuidedOverview(page);
    const names = await optionNames(rows);
    const finalIndex = names.length - 1;

    await rows.nth(finalIndex).getByRole('button').click();
    await expectEditor(root, names[finalIndex]);
    await expect(next).toBeEnabled();
    await expect(next).toHaveText('Review');

    await next.click();
    await expectReview(root);
  });

  test('the 500px content-height variable sizes Review and ordinary option steps', async ({ page }) => {
    const { root, rows } = await loadGuidedOverview(page);
    const names = await optionNames(rows);
    const content = root.locator('[data-ov25-list-variants-content]');
    const review = root.locator(REVIEW);

    await expect
      .poll(() => root.evaluate((element) => getComputedStyle(element)
        .getPropertyValue('--ov25-wizard-variants-content-height')
        .trim()))
      .toBe(EXPECTED_CONTENT_HEIGHT);
    await expect(content).toHaveCSS('height', EXPECTED_CONTENT_HEIGHT);
    await expect(content).toHaveCSS('max-height', EXPECTED_CONTENT_HEIGHT);
    await expectSingleScrollOwner(content);
    await expectConfiguredHeight(review);

    await rows.first().getByRole('button').click();
    await expectEditor(root, names[0]);

    await expect(content).toHaveCSS('height', EXPECTED_CONTENT_HEIGHT);
    await expect(content).toHaveCSS('max-height', EXPECTED_CONTENT_HEIGHT);
    await expectSingleScrollOwner(content);
    await expectConfiguredHeight(root.locator(EDITOR));
  });
});

test.describe('Guided Overview — sheet controls', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('keeps sheet close separate from the Undo return-to-review action', async ({ page }) => {
    await page.goto(SHEET_FIXTURE);

    const configure = page.getByRole('button', { name: 'Configure', exact: true });
    await expect(configure).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await configure.click();

    const sheet = page
      .locator('#ov25-variants-shadow-container')
      .locator('#ov25-configurator-variant-menu-container');
    const root = sheet.locator(ROOT);
    const sheetClose = sheet.getByRole('button', { name: 'Close', exact: true });

    await expect(root).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expectReview(root);
    await expect(sheetClose).toBeVisible();
    await expect(root.locator('.ov25-guided-overview-back')).toHaveCount(0);
    const [sheetBox, sheetCloseBox] = await Promise.all([
      sheet.boundingBox(),
      sheetClose.boundingBox(),
    ]);
    expect(sheetBox).not.toBeNull();
    expect(sheetCloseBox).not.toBeNull();
    expect(sheetCloseBox!.x + sheetCloseBox!.width).toBeGreaterThan(
      sheetBox!.x + sheetBox!.width - 48,
    );
    expect(sheetCloseBox!.y).toBeLessThan(sheetBox!.y + 64);

    await root.locator(REVIEW_ROW).first().getByRole('button').click();

    const backToReview = root.locator('.ov25-guided-overview-back');
    await expect(backToReview).toBeVisible();
    await expect(backToReview).toHaveAccessibleName('Back to review');
    await expect(backToReview.locator('.lucide-undo-2')).toBeVisible();
    await expect(sheetClose).toBeVisible();

    await backToReview.click();
    await expectReview(root);
    await expect(sheetClose).toBeVisible();

    await sheetClose.click();
    await expect
      .poll(() => sheet.evaluate((element) =>
        element.getBoundingClientRect().left >= document.documentElement.clientWidth
      ))
      .toBe(true);
  });
});
