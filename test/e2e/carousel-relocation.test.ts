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
