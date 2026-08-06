import { test, expect, type Page } from '@playwright/test';

/** Matches production and local AR preview URLs (path + UUID). */
const AR_PREVIEW_URL_PATTERN = /https?:\/\/[^/]+\/ar-preview\/[a-f0-9-]{36}/;
const RUNTIME_TIMEOUT = 20000;
const CANVAS_READY_TIMEOUT = 45000;
const REQUIRED_STABLE_CANVAS_SAMPLES = 3;
const CANVAS_SELECTOR = 'canvas[data-engine="three.js r171"]';

async function loadFixture(page: Page) {
    const configuratorLoaded = page.waitForEvent('console', {
        predicate: (msg) => msg.text().includes('OV25 3D Loaded'),
        timeout: 60000,
    });

    await page.goto('/tests/single-no-variants.html');
    await expect(page.locator('body')).toBeVisible();

    const price = page.locator('.ov25-configurator-price');
    await expect(price).toBeVisible({ timeout: 10000 });
    await expect(price).toContainText('£1,125.00', { timeout: 15000 });
    await expect(page.locator('.ov25-configurator-name')).toHaveText('Windrush-Loveseat');
    await expect(page.locator('.ov-25-configurator-variant-menu-container')).not.toBeVisible();
    await configuratorLoaded;

    const iframeElement = page.locator('#ov25-configurator-iframe');
    await expect(iframeElement).toBeVisible({ timeout: CANVAS_READY_TIMEOUT });

    return { iframeElement, iframe: page.frameLocator('#ov25-configurator-iframe') };
}

async function waitForStableResponsiveCanvas(page: Page): Promise<void> {
    const canvas = page.frameLocator('#ov25-configurator-iframe').locator(CANVAS_SELECTOR).last();
    let previousSize = '';
    let stablePolls = 0;

    await expect.poll(async () => {
        const size = await canvas.evaluate((element) => {
            const current = element as HTMLCanvasElement;
            const rect = current.getBoundingClientRect();
            const ratio = current.ownerDocument.defaultView?.devicePixelRatio ?? 1;
            const responsive = current.width !== 300 && current.height !== 150 &&
                Math.abs(current.width - rect.width * ratio) <= 1 &&
                Math.abs(current.height - rect.height * ratio) <= 1;
            return responsive ? `${current.width}x${current.height}` : '';
        }).catch(() => '');

        if (!size) {
            previousSize = '';
            stablePolls = 0;
            return 0;
        }

        stablePolls = size === previousSize ? stablePolls + 1 : 1;
        previousSize = size;
        return stablePolls;
    }, {
        message: 'wait for the current WebGL canvas to reach a stable responsive size',
        timeout: CANVAS_READY_TIMEOUT,
        intervals: [250],
    }).toBeGreaterThanOrEqual(REQUIRED_STABLE_CANVAS_SAMPLES);
}

const visualTest = test.extend({
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
});
visualTest.use({ viewport: { width: 1280, height: 800 } });

visualTest.describe('Windrush - Loveseat visual render', () => {

    visualTest('renders the initial model', async ({ page }) => {
        visualTest.setTimeout(240000);
        const { iframeElement, iframe } = await loadFixture(page);
        await waitForStableResponsiveCanvas(page);

        const gestureHint = iframe.locator('#ov25-gesture-hint');
        await expect(gestureHint).toBeVisible({ timeout: CANVAS_READY_TIMEOUT });

        const clickTarget = await iframeElement.boundingBox();
        expect(clickTarget).not.toBeNull();
        if (!clickTarget) throw new Error('Configurator iframe has no visible bounding box');
        await page.mouse.click(
            clickTarget.x + clickTarget.width / 2,
            clickTarget.y + clickTarget.height / 2,
        );

        await expect(gestureHint).not.toBeVisible({ timeout: RUNTIME_TIMEOUT });
        await waitForStableResponsiveCanvas(page);

        // Keep Next.js development tooling out of the product-rendering baseline.
        const nextDevPortal = iframe.locator('nextjs-portal');
        if (await nextDevPortal.count() === 1) {
            await nextDevPortal.evaluate((element) => {
                (element as HTMLElement).style.display = 'none';
            });
        }

        const screenshotTarget = await iframeElement.boundingBox();
        expect(screenshotTarget).not.toBeNull();
        if (!screenshotTarget) throw new Error('Configurator iframe has no screenshot region');
        const renderedIframeRegion = await page.screenshot({
            animations: 'disabled',
            clip: screenshotTarget,
        });
        expect(renderedIframeRegion).toMatchSnapshot('single-no-variants-initial-canvas.png', { maxDiffPixelRatio: 0.01 });

        const dimensionsButton = page.locator('#ov25-desktop-dimensions-toggle-button');
        await expect(dimensionsButton).toBeVisible({ timeout: RUNTIME_TIMEOUT });
        await dimensionsButton.click({ timeout: RUNTIME_TIMEOUT });

        const dimensionsWidth = iframe.locator('.ov25-dimensions-width');
        const dimensionsHeight = iframe.locator('.ov25-dimensions-height');
        const dimensionsDepth = iframe.locator('.ov25-dimensions-depth');
        await expect(dimensionsWidth).toBeVisible({ timeout: RUNTIME_TIMEOUT });
        await expect(dimensionsWidth).toHaveText('W 127cm', { timeout: RUNTIME_TIMEOUT });
        await expect(dimensionsHeight).toBeVisible({ timeout: RUNTIME_TIMEOUT });
        await expect(dimensionsHeight).toHaveText('H 95cm', { timeout: RUNTIME_TIMEOUT });
        await expect(dimensionsDepth).toBeVisible({ timeout: RUNTIME_TIMEOUT });
        await expect(dimensionsDepth).toHaveText('D 104cm', { timeout: RUNTIME_TIMEOUT });
    });
});

test.describe('Windrush - Loveseat interactions', () => {
    test('supports controls in normal browser mode', async ({ page }) => {
        test.setTimeout(120000);
        await loadFixture(page);

        // Test Share button
        const shareButton = page.locator('#ov25-share-button');
        await expect(shareButton).toBeVisible();
        const expectedShareUrl = await page.evaluate(() => window.location.href);
        await shareButton.click();
        // link should be copied to clipboard
        await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(expectedShareUrl);
        // toast should appear
        const toast = page.locator('li[data-sonner-toast]');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Share link copied to clipboard!');

        // Test Dimensions button
        const dimensionsButton = page.locator('#ov25-desktop-dimensions-toggle-button');
        await expect(dimensionsButton).toBeVisible();

        // Test AR button
        const arButton = page.locator('#ov25-ar-toggle-button');
        await expect(arButton).toBeVisible();
        await arButton.click();
        // dialog should appear (AR dialog is portaled to document.body, not inside the container)
        const arDialog = page.locator('#ov25-ar-preview-qr-code-dialog');
        await expect(arDialog).toBeVisible({ timeout: RUNTIME_TIMEOUT });
        await expect(arDialog).toContainText('View in room');
        await expect(arDialog).toContainText('Scan the QR code on your phones camera to view this item in your room');
        await expect(arDialog).toContainText(AR_PREVIEW_URL_PATTERN);
        // contains an svg QR code
        const qrCode = arDialog.locator('#ov25-qr-code');
        await expect(qrCode).toBeVisible();

        // Close dialog
        await arDialog.locator('button').filter({ has: page.locator('svg') }).click();
        await expect(arDialog).not.toBeVisible();

        //Test Fullscreen button
        const fullscreenButton = page.locator('#ov25-desktop-fullscreen-button');
        await expect(fullscreenButton).toBeVisible();
        await fullscreenButton.click();
        // iframe should be fullscreen: toggleFullscreen calls requestFullscreen on
        // #true-ov25-configurator-iframe-container (parent of #ov25-configurator-iframe). With stacked
        // gallery, that node can sit directly under the gallery shadow root; Chromium may then expose
        // document.fullscreenElement as the shadow host #ov-25-configurator-gallery-container instead.
        await expect.poll(
          () => page.evaluate(() => document.fullscreenElement?.id),
          { timeout: RUNTIME_TIMEOUT }
        ).toMatch(/^(true-ov25-configurator-iframe-container|ov-25-configurator-gallery-container)$/);

        // Check share button still works
        await expect(shareButton).toBeVisible();
        const expectedMobileShareUrl = await page.evaluate(() => window.location.href);
        await shareButton.click();
        // link should be copied to clipboard
        await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(expectedMobileShareUrl);
        // toast should appear - use .last() to get the most recent toast
        const toast2 = page.locator('li[data-sonner-toast]').last();
        await expect(toast2).toBeVisible();
        await expect(toast2).toContainText('Share link copied to clipboard!');

        // Test AR button still shows
        await expect(arButton).toBeVisible();
        await arButton.click();
        // dialog should appear
        await expect(arDialog).toBeVisible({ timeout: RUNTIME_TIMEOUT });
        await expect(arDialog).toContainText('View in room');
        await expect(arDialog).toContainText('Scan the QR code on your phones camera to view this item in your room');
        await expect(arDialog).toContainText(AR_PREVIEW_URL_PATTERN);
        // contains an svg QR code
        await expect(qrCode).toBeVisible();

        // Close fullscreen
        await fullscreenButton.click();
        await expect.poll(
          () => page.evaluate(() => document.fullscreenElement?.id == null),
          { timeout: RUNTIME_TIMEOUT }
        ).toBe(true);
    });
    
});
