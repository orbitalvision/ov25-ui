import { expect, test } from '@playwright/test';

const MOBILE = { width: 375, height: 667 };
const RUNTIME_TIMEOUT = 30000;

test('mobile drawer stays above the configurator gallery at its top edge', async ({
  page,
}) => {
  await page.setViewportSize(MOBILE);
  await page.goto('/tests/single-no-pricing.html');

  const configure = page.getByRole('button', { name: 'Configure', exact: true });
  await expect(configure).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await configure.click();

  const drawer = page
    .locator('#ov25-mobile-drawer-container')
    .locator('#ov25-drawer-content');
  await expect(drawer).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await expect
    .poll(
      () =>
        drawer.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return {
            height: Math.round(rect.height),
            top: Math.round(rect.top),
          };
        }),
      { timeout: RUNTIME_TIMEOUT },
    )
    .toEqual({ height: 387, top: 280 });

  await expect
    .poll(() =>
      page
        .evaluate(() => {
          const gallery = document.querySelector<HTMLElement>(
            '#ov-25-configurator-gallery-container',
          );
          const drawerHost = document.querySelector<HTMLElement>(
            '#ov25-mobile-drawer-container',
          );
          const drawer = drawerHost?.shadowRoot?.querySelector<HTMLElement>(
            '#ov25-drawer-content',
          );
          if (!gallery || !drawerHost || !drawer) return null;

          const drawerRect = drawer.getBoundingClientRect();
          return {
            drawerWinsAtBoundary:
              document.elementFromPoint(
                drawerRect.left + drawerRect.width / 2,
                drawerRect.top + 2,
              ) === drawerHost,
            galleryZIndex: Number(getComputedStyle(gallery).zIndex),
            drawerZIndex: Number(getComputedStyle(drawerHost).zIndex),
          };
        })
        .catch(() => null),
    )
    .toMatchObject({ drawerWinsAtBoundary: true });

  const layerOrder = await page.evaluate(() => {
    const gallery = document.querySelector<HTMLElement>(
      '#ov-25-configurator-gallery-container',
    );
    const drawer = document.querySelector<HTMLElement>(
      '#ov25-mobile-drawer-container',
    );
    if (!gallery || !drawer) throw new Error('Mobile drawer layers are incomplete');
    return {
      gallery: Number(getComputedStyle(gallery).zIndex),
      drawer: Number(getComputedStyle(drawer).zIndex),
    };
  });
  expect(layerOrder.gallery).toBeLessThan(layerOrder.drawer);

  // The drawer shell and its geometry settle before the asynchronously loaded
  // option content. Wait for everything captured by the visual assertion so a
  // fast screenshot cannot record an otherwise-correct empty drawer.
  await expect(drawer.getByPlaceholder('Search')).toBeVisible({
    timeout: RUNTIME_TIMEOUT,
  });
  await expect(drawer.getByText('Leather', { exact: true }).first()).toBeVisible({
    timeout: RUNTIME_TIMEOUT,
  });

  const variantCards = drawer.locator('.ov25-default-variant-card');
  await expect(variantCards.nth(3)).toBeVisible({ timeout: RUNTIME_TIMEOUT });

  const variantImages = variantCards.locator('img');
  await expect
    .poll(
      () =>
        variantImages.evaluateAll((images) =>
          images.length >= 4 &&
          images
            .slice(0, 4)
            .every((image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0
            ),
        ),
      { timeout: RUNTIME_TIMEOUT },
    )
    .toBe(true);
  await variantImages.evaluateAll((images) =>
    Promise.all(
      images
        .slice(0, 4)
        .filter(
          (image): image is HTMLImageElement => image instanceof HTMLImageElement,
        )
        .map((image) => image.decode()),
    ),
  );
  await page.evaluate(() => document.fonts.ready);

  const drawerBox = await drawer.boundingBox();
  expect(drawerBox).not.toBeNull();
  if (!drawerBox) throw new Error('Mobile drawer has no visible bounds');

  const boundary = await page.screenshot({
    animations: 'disabled',
    clip: {
      x: 0,
      y: drawerBox.y - 12,
      width: MOBILE.width,
      height: 220,
    },
  });
  expect(boundary).toMatchSnapshot('single-no-pricing-mobile-drawer-boundary.png', {
    // Headed Chromium reserves a scrollbar gutter while the optional headless
    // runner hides it. Both retain the asserted drawer/gallery layer order.
    maxDiffPixelRatio: 0.04,
  });
});
