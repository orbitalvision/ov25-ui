import { expect, test, type Page } from '@playwright/test';

const FIXTURE = '/tests/carousel-relocation.html';
const RUNTIME_TIMEOUT = 20000;
const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;
type ViewportName = keyof typeof VIEWPORTS;

function carouselTarget(page: Page, viewport: ViewportName) {
  return page.locator(`[data-carousel-relocation-target="${viewport}"]`);
}

async function expectResponsiveTargetVisibility(page: Page, viewport: ViewportName) {
  await expect(page.locator('[data-carousel-relocation-target]')).toHaveCount(2);
  await expect(carouselTarget(page, viewport)).toBeVisible();
  await expect(carouselTarget(page, viewport === 'desktop' ? 'mobile' : 'desktop')).not.toBeVisible();
}

async function expectSingleExternalCarousel(page: Page, viewport: ViewportName) {
  const target = carouselTarget(page, viewport);
  const externalHost = target.locator(':scope > [data-ov25-external-carousel="true"]');

  await expectResponsiveTargetVisibility(page, viewport);
  await expect(externalHost).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  await expect(externalHost.locator('#ov25-product-carousel')).toHaveCount(1);
  await expect(page.locator('#true-carousel')).toHaveCount(0);
  await expect(page.locator('[data-ov25-external-carousel]')).toHaveCount(1);
  await expect(page.locator('#ov25-product-carousel')).toHaveCount(1);
  await expect(
    carouselTarget(page, viewport === 'desktop' ? 'mobile' : 'desktop').locator(
      ':scope > [data-ov25-external-carousel]',
    ),
  ).toHaveCount(0);

  expect(await externalHost.evaluate((host) => {
    const stylesheets = host.shadowRoot?.adoptedStyleSheets ?? [];
    return {
      count: stylesheets.length,
      hasCustomCss: stylesheets.some((stylesheet) =>
        Array.from(stylesheet.cssRules).some((rule) =>
          rule.cssText.includes('--ov25-carousel-relocation-fixture')
        )
      ),
    };
  })).toEqual({ count: 2, hasCustomCss: true });
}

function relocatedTile(page: Page, viewport: ViewportName, tile: '360' | 'image') {
  return carouselTarget(page, viewport)
    .locator(`#ov25-product-carousel button[data-ov25-gallery-tile="${tile}"]`)
    .first();
}

function desktopSheet(page: Page) {
  return page
    .locator('#ov25-variants-shadow-container')
    .locator('#ov25-configurator-variant-menu-container');
}

function mobileDrawer(page: Page) {
  return page
    .locator('#ov25-mobile-drawer-container')
    .locator('#ov25-drawer-content');
}

async function desktopSheetIsOnScreen(page: Page): Promise<boolean> {
  return desktopSheet(page).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.left >= 0 && rect.right <= window.innerWidth;
  });
}

for (const viewport of ['desktop', 'mobile'] as const) {
  test(`relocates an ordinary ${viewport} carousel to its viewport target`, async ({ page }) => {
    await page.setViewportSize(VIEWPORTS[viewport]);
    await page.goto(FIXTURE);
    await expect(page.locator('[data-ov25-inline-sticky-active]')).toHaveCount(0);
    await expect(page.locator('#ov25-configurator-iframe')).toHaveCount(1, {
      timeout: RUNTIME_TIMEOUT,
    });
    await expectSingleExternalCarousel(page, viewport);
  });

  test(`${viewport} carousel thumbnails switch the gallery between an image and the 3D view`, async ({ page }) => {
    await page.setViewportSize(VIEWPORTS[viewport]);
    await page.goto(FIXTURE);
    await expectSingleExternalCarousel(page, viewport);

    const threeDTile = relocatedTile(page, viewport, '360');
    const imageTile = relocatedTile(page, viewport, 'image');
    // The first host image (the sofa) follows the 3D tile at gallery index 1.
    const galleryImage = page.locator('#ov-25-configurator-product-image-1');

    await expect(threeDTile).toHaveAttribute('data-selected', 'true');
    await imageTile.click();
    await expect(imageTile).toHaveAttribute('data-selected', 'true');
    await expect(threeDTile).toHaveAttribute('data-selected', 'false');
    await expect(galleryImage).toBeVisible();
    await expect(galleryImage).toHaveAttribute('src', /sofa/);

    await threeDTile.click();
    await expect(threeDTile).toHaveAttribute('data-selected', 'true');
    await expect(galleryImage).toHaveCount(0);
    await expect(page.locator('#ov25-configurator-iframe')).toBeVisible();
  });

  test(`${viewport} carousel stays in its target while the configurator opens and closes`, async ({ page }) => {
    await page.setViewportSize(VIEWPORTS[viewport]);
    await page.goto(FIXTURE);
    await expectSingleExternalCarousel(page, viewport);
    await page.locator('#ov25-configurator-iframe').evaluate((iframe) => {
      iframe.setAttribute('data-carousel-relocation-identity', 'preserved-while-configuring');
    });

    await page.getByRole('button', { name: 'Configure', exact: true }).click();
    if (viewport === 'desktop') {
      await expect.poll(() => desktopSheetIsOnScreen(page), { timeout: RUNTIME_TIMEOUT }).toBe(true);
    } else {
      await expect(mobileDrawer(page)).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    }
    await expectSingleExternalCarousel(page, viewport);

    const close = viewport === 'desktop'
      ? desktopSheet(page).getByRole('button', { name: 'Close', exact: true })
      : page.getByRole('button', { name: 'Close', exact: true }).filter({ visible: true });
    await close.click();
    if (viewport === 'desktop') {
      await expect.poll(() => desktopSheetIsOnScreen(page), { timeout: RUNTIME_TIMEOUT }).toBe(false);
    } else {
      await expect(mobileDrawer(page)).toBeHidden({ timeout: RUNTIME_TIMEOUT });
    }
    await expectSingleExternalCarousel(page, viewport);
    await expect(page.locator('#ov25-configurator-iframe')).toHaveAttribute(
      'data-carousel-relocation-identity',
      'preserved-while-configuring',
    );
  });
}

test('switches viewport targets without duplicate carousels or iframe reload', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await page.goto(FIXTURE);
  await expect(page.locator('#ov25-configurator-iframe')).toHaveCount(1, {
    timeout: RUNTIME_TIMEOUT,
  });
  await page.locator('#ov25-configurator-iframe').evaluate((iframe) => {
    iframe.setAttribute('data-carousel-relocation-identity', 'preserved-across-viewports');
  });

  for (const viewport of ['desktop', 'mobile', 'desktop'] as const) {
    await page.setViewportSize(VIEWPORTS[viewport]);
    await expectSingleExternalCarousel(page, viewport);
    await expect(page.locator('#ov25-configurator-iframe')).toHaveAttribute(
      'data-carousel-relocation-identity',
      'preserved-across-viewports',
    );
  }
});
