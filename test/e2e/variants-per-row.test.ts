import { expect, test, type Locator, type Page } from '@playwright/test';

const FIXTURE = '/tests/variants-per-row.html';
const RUNTIME_TIMEOUT = 30_000;
const GRID = '.ov25-variant-card-grid';
const VARIANT_DISPLAY_MODES = ['wizard', 'guided-overview', 'list', 'tabs', 'accordion', 'tree'];
const CONFIGURATOR_DISPLAY_MODES = [
  'inline',
  'inline-sticky',
  'sheet',
  'modal',
  'variants-only-sheet',
  'inline-sheet',
];

async function revealVariantGrid(page: Page, variantMode: string): Promise<Locator> {
  if (variantMode === 'guided-overview') {
    await page.locator('[data-ov25-guided-overview-review-row] button').first().click();
  } else if (variantMode === 'accordion') {
    await page.locator('[data-ov25-accordion-variants-mode] button').first().click();
  } else if (variantMode === 'tree') {
    await page.locator('[data-ov25-tree-variants-mode] button').first().click();
  }

  const grid = page.locator(`${GRID}:visible`).first();
  await expect(grid).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await expect.poll(() => grid.locator('.ov25-default-variant-card').count(), {
    timeout: RUNTIME_TIMEOUT,
  }).toBeGreaterThan(3);
  return grid;
}

async function gridColumnCount(grid: Locator): Promise<number> {
  return grid.evaluate((element) => {
    const cards = Array.from(element.querySelectorAll('.ov25-default-variant-card'));
    if (cards.length === 0) return 0;
    const firstTop = cards[0].getBoundingClientRect().top;
    return cards.filter((card) => Math.abs(card.getBoundingClientRect().top - firstTop) <= 1).length;
  });
}

test.describe('variants per row fixture', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  for (const variantMode of VARIANT_DISPLAY_MODES) {
    test(`${variantMode} uses the shared variants-per-row value`, async ({ page }) => {
      await page.goto(`${FIXTURE}?variants=${variantMode}&configurator=inline&count=4`);
      const grid = await revealVariantGrid(page, variantMode);
      const firstThumbnail = grid.locator('.ov25-variant-image-container').first();

      await expect.poll(() => gridColumnCount(grid)).toBe(4);
      await expect.poll(() => firstThumbnail.evaluate(
        (element) => element.getBoundingClientRect().width,
      )).toBe(64);

      await page.getByTestId('variants-per-row-slider').fill('3');
      await expect(page.getByTestId('variants-per-row-controls')).toHaveAttribute(
        'data-variants-per-row',
        '3',
      );
      await expect.poll(() => gridColumnCount(grid)).toBe(3);
      await expect.poll(() => firstThumbnail.evaluate(
        (element) => element.getBoundingClientRect().width,
      )).toBeGreaterThan(64);
    });
  }

  test('cards and thumbnails fluidly grow and shrink while four columns remain unchanged', async ({ page }) => {
    await page.goto(`${FIXTURE}?variants=tabs&configurator=inline`);
    const grid = await revealVariantGrid(page, 'tabs');
    const firstCard = grid.locator('.ov25-default-variant-card').first();
    const firstThumbnail = firstCard.locator('.ov25-variant-image-container');
    const defaultWidth = await firstCard.evaluate((element) => element.getBoundingClientRect().width);
    const defaultThumbnailSize = await firstThumbnail.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    await expect.poll(() => gridColumnCount(grid)).toBe(4);
    expect(defaultThumbnailSize.width).toBe(64);
    expect(defaultThumbnailSize.height).toBe(64);

    await page.getByTestId('variants-per-row-slider').fill('2');
    await expect.poll(() => grid.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--ov25-variants-per-row').trim()
    )).toBe('2');
    await expect.poll(() => gridColumnCount(grid)).toBe(2);
    const twoColumnWidth = await firstCard.evaluate((element) => element.getBoundingClientRect().width);
    const twoColumnThumbnailWidth = await firstThumbnail.evaluate(
      (element) => element.getBoundingClientRect().width,
    );

    await page.getByTestId('variants-per-row-slider').fill('6');
    await expect.poll(() => gridColumnCount(grid)).toBe(6);
    const sixColumnWidth = await firstCard.evaluate((element) => element.getBoundingClientRect().width);
    const sixColumnThumbnailWidth = await firstThumbnail.evaluate(
      (element) => element.getBoundingClientRect().width,
    );

    expect(twoColumnWidth).toBeGreaterThan(defaultWidth);
    expect(sixColumnWidth).toBeLessThan(defaultWidth);
    expect(twoColumnThumbnailWidth).toBeGreaterThan(defaultThumbnailSize.width);
    expect(sixColumnThumbnailWidth).toBeLessThan(defaultThumbnailSize.width);
  });

  for (const configuratorMode of CONFIGURATOR_DISPLAY_MODES) {
    test(`${configuratorMode} configurator uses the shared grid`, async ({ page }) => {
      await page.goto(`${FIXTURE}?variants=tabs&configurator=${configuratorMode}&count=5`);
      const grid = await revealVariantGrid(page, 'tabs');

      await expect.poll(() => gridColumnCount(grid)).toBe(5);
    });
  }
});
