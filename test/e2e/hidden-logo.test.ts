import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import { HIDDEN_LOGO_REPORT_SCREENSHOTS } from '../../dev/react-test/config/e2e-fixture-ledger.js';

const FIXTURE_PATH = '/tests/hidden-logo.html';
const RUNTIME_TIMEOUT = 20_000;
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
type ConfiguratorSurface = 'desktop-range' | 'desktop-snap2' | 'mobile';
type ReportScreenshotOptions = {
  surface?: ConfiguratorSurface;
  snap2Header?: 'logo-visible' | 'header-hidden';
};

async function openRangeFixture(page: Page, mobile = false): Promise<void> {
  await page.setViewportSize(mobile ? MOBILE_VIEWPORT : DESKTOP_VIEWPORT);
  await page.goto(`${FIXTURE_PATH}${mobile ? '?viewport=mobile' : ''}`);

  await expect(page.locator('.ov25-configurator-price')).toBeVisible({
    timeout: RUNTIME_TIMEOUT,
  });
  await expect(page.locator('#ov25-configurator-name')).toHaveText(/^.+-.+$/, {
    timeout: RUNTIME_TIMEOUT,
  });
  await expect(page.locator('#ov25-configurator-iframe')).toHaveAttribute(
    'title',
    /^3D configurator for .+ range\.$/,
    { timeout: RUNTIME_TIMEOUT },
  );
}

async function switchToSnap2(page: Page): Promise<void> {
  await page.getByTestId('product-snap2-button').click();
  await expect(page.locator('#ov25-snap2-options-layout').first()).toBeAttached({
    timeout: RUNTIME_TIMEOUT,
  });
}

function configuratorPanel(page: Page, surface: ConfiguratorSurface): Locator {
  if (surface === 'mobile') {
    return page.locator('#ov25-mobile-drawer-container').locator('#ov25-drawer-content');
  }
  if (surface === 'desktop-snap2') {
    return page.locator('#ov25-snap2-modal-frame').locator('#ov25-snap2-variants-layout');
  }
  return page
    .locator('#ov25-variants-shadow-container')
    .locator('#ov25-configurator-variant-menu-container');
}

async function panelIsOpen(panel: Locator): Promise<boolean> {
  if ((await panel.count()) === 0) return false;
  return panel.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const parentHeight = element.parentElement?.getBoundingClientRect().height ?? rect.height;
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      parentHeight > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.bottom > 0
    );
  });
}

async function ensureConfiguratorPanelOpen(
  page: Page,
  surface: ConfiguratorSurface,
): Promise<Locator> {
  const panel = configuratorPanel(page, surface);

  if (!(await panelIsOpen(panel))) {
    if (surface === 'mobile') {
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    }

    const configureButton = page
      .getByRole('button', { name: /^Configure(?:\s|$)/i })
      .filter({ visible: true })
      .first();
    await expect(configureButton).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    if (surface === 'mobile') {
      // Avoid Playwright scrolling the fixture controls out of the review screenshot.
      await configureButton.evaluate((button) => (button as HTMLButtonElement).click());
    } else {
      await configureButton.click();
    }
  }

  await expect.poll(() => panelIsOpen(panel), { timeout: RUNTIME_TIMEOUT }).toBe(true);
  return panel;
}

async function closeConfiguratorPanel(
  page: Page,
  panel: Locator,
  surface: ConfiguratorSurface,
): Promise<void> {
  const closeButton =
    surface === 'desktop-snap2'
      ? page.getByRole('button', { name: 'Close modal', exact: true }).first()
      : panel.getByRole('button', { name: 'Close', exact: true }).first();
  await expect(closeButton).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  if (surface === 'desktop-snap2') {
    await closeButton.evaluate((button) => (button as HTMLButtonElement).click());
  } else {
    await closeButton.click({ timeout: RUNTIME_TIMEOUT });
  }
  await expect.poll(() => panelIsOpen(panel), { timeout: RUNTIME_TIMEOUT }).toBe(false);
}

async function attachReportScreenshot(
  page: Page,
  testInfo: TestInfo,
  fileName: string,
  options: ReportScreenshotOptions = {},
): Promise<Locator> {
  const surface = options.surface ?? 'desktop-range';
  const panel = await ensureConfiguratorPanelOpen(page, surface);

  if (surface === 'desktop-snap2') {
    const modalShell = page.locator('#ov25-snap2-modal-shell');
    const modalFrame = page.locator('#ov25-snap2-modal-frame');
    await expect(modalShell).toHaveCSS('opacity', '1', { timeout: RUNTIME_TIMEOUT });
    await expect(modalFrame).toBeInViewport({ ratio: 0.95, timeout: RUNTIME_TIMEOUT });
    await expect(panel).toBeInViewport({ ratio: 0.95, timeout: RUNTIME_TIMEOUT });
    await expect(page.locator('#ov25-configurator-iframe')).toHaveAttribute(
      'title',
      /^Modular 3D configurator(?: for .+ range)?\.$/,
      { timeout: RUNTIME_TIMEOUT },
    );
    await expect(page.locator('#ov25-snap2-modal-frame #ov25-initialise-menu')).toHaveCount(0, {
      timeout: RUNTIME_TIMEOUT,
    });
    await expect(panel.getByPlaceholder('Search')).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(panel.locator('.ov25-option-header').filter({ visible: true }).first()).toBeVisible({
      timeout: RUNTIME_TIMEOUT,
    });

    const modalHeader = panel.locator('#ov25-variants-header-wrapper');
    const modalLogo = panel.locator('.ov25-variant-header-logo');
    if (options.snap2Header === 'logo-visible') {
      await expect(modalHeader).toBeVisible({ timeout: RUNTIME_TIMEOUT });
      await expect(modalLogo).toBeVisible({ timeout: RUNTIME_TIMEOUT });
      await expect(modalHeader).toBeInViewport({ ratio: 1, timeout: RUNTIME_TIMEOUT });
      await expect(modalLogo).toBeInViewport({ ratio: 1, timeout: RUNTIME_TIMEOUT });
    } else if (options.snap2Header === 'header-hidden') {
      await expect(modalHeader).toHaveCount(0, { timeout: RUNTIME_TIMEOUT });
      await expect(modalLogo).toHaveCount(0, { timeout: RUNTIME_TIMEOUT });
    }
  }

  if (surface === 'mobile') {
    await expect(panel.getByPlaceholder('Search')).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(
      panel
        .locator(
          '.ov25-default-variant-card, .ov25-size-variant-card, [data-ov25-module-variant-card], img',
        )
        .filter({ visible: true })
        .first(),
    ).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  }

  await page.evaluate(() => document.fonts.ready);
  await testInfo.attach(fileName, {
    body: await panel.screenshot({
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    }),
    contentType: 'image/png',
  });
  return panel;
}

async function attachMobileFixtureControlsScreenshot(
  page: Page,
  testInfo: TestInfo,
  fileName: string,
): Promise<void> {
  const controls = page.getByTestId('hidden-logo-fixture-controls');
  await expect(controls).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await page.evaluate(() => document.fonts.ready);
  await testInfo.attach(fileName, {
    body: await controls.screenshot({
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    }),
    contentType: 'image/png',
  });
}

test.describe('Hidden logo (branding.hideLogo)', () => {
  test('desktop range replaces the logo with the current product name and restores it', async ({
    page,
  }, testInfo) => {
    await openRangeFixture(page);

    const headerWrapper = page.locator('#ov25-variants-header-wrapper');
    const headerLogo = page.locator('.ov25-variant-header-logo');
    const headerName = page.locator('#ov25-variants-header .ov25-variants-header-name');
    const productTitle = page.locator('#ov25-configurator-name');
    const loadedDisplayTitle = (await productTitle.textContent())?.trim() ?? '';
    const iframeTitle = await page.locator('#ov25-configurator-iframe').getAttribute('title');
    const rangeName =
      iframeTitle?.replace(/^3D configurator for /, '').replace(/ range\.$/, '') ?? '';

    expect(rangeName).not.toBe('');
    expect(loadedDisplayTitle.startsWith(`${rangeName}-`)).toBe(true);
    const loadedProductTitle = loadedDisplayTitle.slice(rangeName.length + 1);
    expect(loadedProductTitle).not.toBe('');

    await expect(headerWrapper).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(headerLogo).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(headerName).toHaveCount(0);

    await page.getByTestId('hide-logo-button').click();

    await expect(headerWrapper).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(headerLogo).toHaveCount(0, { timeout: RUNTIME_TIMEOUT });
    await expect(headerName).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(headerName).toHaveText(loadedProductTitle);
    await expect(productTitle).toHaveText(loadedDisplayTitle);
    const hiddenRangePanel = await attachReportScreenshot(
      page,
      testInfo,
      HIDDEN_LOGO_REPORT_SCREENSHOTS.desktopRangeLogoHidden,
    );
    await closeConfiguratorPanel(page, hiddenRangePanel, 'desktop-range');

    await page.getByTestId('show-logo-button').click();

    await expect(headerLogo).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(headerName).toHaveCount(0, { timeout: RUNTIME_TIMEOUT });
    await expect(productTitle).toHaveText(loadedDisplayTitle);
    await attachReportScreenshot(
      page,
      testInfo,
      HIDDEN_LOGO_REPORT_SCREENSHOTS.desktopRangeLogoRestored,
    );
  });

  test('desktop Snap2 removes and restores the complete header wrapper', async ({ page }, testInfo) => {
    await openRangeFixture(page);
    await switchToSnap2(page);

    const headerWrapper = page.locator('#ov25-variants-header-wrapper');
    const headerLogo = page.locator('.ov25-variant-header-logo');
    const snap2Layout = page.locator('#ov25-snap2-options-layout').first();

    await expect(snap2Layout).toBeAttached();
    await expect(headerWrapper).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(headerLogo).toBeVisible({ timeout: RUNTIME_TIMEOUT });

    await page.getByTestId('hide-logo-button').click();

    await expect(headerWrapper).toHaveCount(0, { timeout: RUNTIME_TIMEOUT });
    await expect(headerLogo).toHaveCount(0, { timeout: RUNTIME_TIMEOUT });
    await expect(snap2Layout).toBeAttached();

    await page.getByTestId('show-logo-button').click();

    await expect(headerWrapper).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(headerLogo).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(snap2Layout).toBeAttached();
    await attachReportScreenshot(
      page,
      testInfo,
      HIDDEN_LOGO_REPORT_SCREENSHOTS.desktopSnap2LogoRestored,
      { surface: 'desktop-snap2', snap2Header: 'logo-visible' },
    );

    await openRangeFixture(page);
    await switchToSnap2(page);
    await page.getByTestId('hide-logo-button').click();

    await expect(headerWrapper).toHaveCount(0, { timeout: RUNTIME_TIMEOUT });
    await expect(headerLogo).toHaveCount(0, { timeout: RUNTIME_TIMEOUT });
    await expect(snap2Layout).toBeAttached();
    await attachReportScreenshot(
      page,
      testInfo,
      HIDDEN_LOGO_REPORT_SCREENSHOTS.desktopSnap2HeaderHidden,
      { surface: 'desktop-snap2', snap2Header: 'header-hidden' },
    );
  });

  test('mobile stays logo-free in Range and Snap2 regardless of hideLogo', async ({
    page,
  }, testInfo) => {
    await openRangeFixture(page, true);

    const mobileHeader = page.locator('#ov25-variants-header-mobile');
    const desktopHeaderWrapper = page.locator('#ov25-variants-header-wrapper');
    const headerLogo = page.locator('.ov25-variant-header-logo');
    const configuratorIframe = page.locator('#ov25-configurator-iframe');
    const price = page.locator('.ov25-configurator-price');
    const showLogoButton = page.getByTestId('show-logo-button');
    const hideLogoButton = page.getByTestId('hide-logo-button');

    await expect(mobileHeader).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
    await expect(desktopHeaderWrapper).toHaveCount(0);
    await expect(headerLogo).toHaveCount(0);
    await expect(configuratorIframe).toHaveAttribute('title', /^3D configurator for .+ range\.$/);
    await expect(price).toBeVisible();

    await hideLogoButton.click();
    await expect(hideLogoButton).toHaveClass(/ov:bg-\[#1a1a1a\]/);
    await expect(mobileHeader).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
    await expect(desktopHeaderWrapper).toHaveCount(0);
    await expect(headerLogo).toHaveCount(0);
    await expect(configuratorIframe).toHaveAttribute('title', /^3D configurator for .+ range\.$/);
    await expect(price).toBeVisible();

    await switchToSnap2(page);
    await expect(hideLogoButton).toHaveClass(/ov:bg-\[#1a1a1a\]/);
    await expect(mobileHeader).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
    await expect(desktopHeaderWrapper).toHaveCount(0);
    await expect(headerLogo).toHaveCount(0);
    await expect(configuratorIframe).toHaveAttribute(
      'title',
      /^Modular 3D configurator(?: for .+ range)?\.$/,
      { timeout: RUNTIME_TIMEOUT },
    );
    await expect(price).toBeVisible();

    await showLogoButton.click();
    await expect(showLogoButton).toHaveClass(/ov:bg-\[#1a1a1a\]/);
    await expect(mobileHeader).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
    await expect(desktopHeaderWrapper).toHaveCount(0);
    await expect(headerLogo).toHaveCount(0);
    await expect(configuratorIframe).toHaveAttribute(
      'title',
      /^Modular 3D configurator(?: for .+ range)?\.$/,
    );
    await expect(price).toBeVisible();

    await openRangeFixture(page, true);
    await expect(showLogoButton).toHaveClass(/ov:bg-\[#1a1a1a\]/);
    await expect(mobileHeader).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
    await expect(desktopHeaderWrapper).toHaveCount(0);
    await expect(headerLogo).toHaveCount(0);
    await expect(configuratorIframe).toHaveAttribute('title', /^3D configurator for .+ range\.$/);
    await expect(price).toBeVisible();
    await attachMobileFixtureControlsScreenshot(
      page,
      testInfo,
      HIDDEN_LOGO_REPORT_SCREENSHOTS.mobileRangeControlsHideLogoDisabled,
    );
    await attachReportScreenshot(
      page,
      testInfo,
      HIDDEN_LOGO_REPORT_SCREENSHOTS.mobileRangeDrawerHideLogoDisabled,
      { surface: 'mobile' },
    );

    await openRangeFixture(page, true);
    await hideLogoButton.click();
    await expect(hideLogoButton).toHaveClass(/ov:bg-\[#1a1a1a\]/);
    await expect(mobileHeader).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
    await expect(desktopHeaderWrapper).toHaveCount(0);
    await expect(headerLogo).toHaveCount(0);
    await expect(configuratorIframe).toHaveAttribute('title', /^3D configurator for .+ range\.$/);
    await expect(price).toBeVisible();
    await attachMobileFixtureControlsScreenshot(
      page,
      testInfo,
      HIDDEN_LOGO_REPORT_SCREENSHOTS.mobileRangeControlsHideLogoEnabled,
    );
    await attachReportScreenshot(
      page,
      testInfo,
      HIDDEN_LOGO_REPORT_SCREENSHOTS.mobileRangeDrawerHideLogoEnabled,
      { surface: 'mobile' },
    );
  });
});
