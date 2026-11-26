import { expect, test, type Page } from '@playwright/test';
import { AUTO_CUTOUT_ANGLES, AUTO_CUTOUT_SIZE } from '../../src/lib/auto-cutouts';

const FIXTURE = '/tests/gallery-auto-cutouts.html';
const LOAD_TIMEOUT = 30_000;
const CUTOUT_TIMEOUT = 15_000;

test.use({ viewport: { width: 1280, height: 900 } });

/**
 * Opens the fixture and waits for the 3D scene, so an OV25 error page can't pass as "no cutouts
 * yet". Subscribes to the load log before navigating so a fast load is not missed.
 */
async function openFixture(page: Page, query: string) {
  const loaded = page.waitForEvent('console', {
    predicate: (message) => message.text().includes('OV25 3D Loaded'),
    timeout: LOAD_TIMEOUT,
  });
  await page.goto(`${FIXTURE}${query}`);
  await loaded;
}

for (const layout of ['carousel', 'stacked'] as const) {
  test(`shows the live cutouts on first load in the ${layout} gallery`, async ({ page }) => {
    await openFixture(page, `?layout=${layout}`);

    // Nothing on the page is touched: the configurator's first CUTOUT_THUMBNAILS set alone must
    // fill the cutout tiles, in the fixed gallery order.
    const cutoutTiles = page.locator('[data-ov25-gallery-tile="cutout"]');
    await expect(cutoutTiles).toHaveCount(AUTO_CUTOUT_ANGLES.length, { timeout: CUTOUT_TIMEOUT });
    await expect
      .poll(() => cutoutTiles.evaluateAll((tiles) => tiles.map((tile) => Number(tile.getAttribute('data-ov25-cutout-yaw')))))
      .toEqual([...AUTO_CUTOUT_ANGLES]);

    // Each tile is a decoded live render of the build, not a catalogue image or a blank frame.
    const renders = await cutoutTiles.locator('img').evaluateAll(async (images) =>
      Promise.all(
        (images as HTMLImageElement[]).map(async (image) => {
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext('2d')!;
          context.drawImage(image, 0, 0);
          const alpha = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let opaque = 0;
          for (let index = 3; index < alpha.length; index += 4) if (alpha[index] > 0) opaque += 1;
          return {
            isObjectUrl: image.src.startsWith('blob:'),
            width: image.naturalWidth,
            opaqueShare: opaque / (canvas.width * canvas.height),
          };
        }),
      ),
    );
    for (const render of renders) {
      expect(render.isObjectUrl).toBe(true);
      expect(render.width).toBe(AUTO_CUTOUT_SIZE);
      // A transparent cutout of a sofa covers roughly a quarter to a half of the square.
      expect(render.opaqueShare).toBeGreaterThan(0.05);
      expect(render.opaqueShare).toBeLessThan(0.95);
    }
  });
}
