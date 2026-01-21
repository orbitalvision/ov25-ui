import { test, expect } from '@playwright/test';

test.describe('Windrush - Loveseat. Single product without variants', () => {

    test('Initial load and model render', async ({ page }) => {
        await page.goto('/single-no-variants.html');

        const body = page.locator('body');
        await expect(body).toBeVisible();

        // Wait for the price element and configurator to initialize
        const price = page.locator('.ov25-configurator-price');
        await expect(price).toBeVisible({ timeout: 10000 });

        // Wait for the price and name to be updated by the configurator
        await expect(price).toContainText('£1,125.00', { timeout: 15000 });

        const name = page.locator('.ov25-configurator-name');
        await expect(name).toBeVisible();
        await expect(name).toHaveText('Windrush-Loveseat');

        // Variants should not be added to the page
        const variants = page.locator('.ov-25-configurator-variant-menu-container');
        await expect(variants).not.toBeVisible();

        // need to wait for the iframe to load and render
        //watch the console for the message "OV25 3D Loaded"
        await page.waitForEvent('console', msg => msg.text().includes('OV25 3D Loaded'));

        const iframe = page.frameLocator('#ov25-configurator-iframe');

        // Find the correct canvas by its data-engine attribute equal to "three.js r171" (is this stable???)
        const canvas = iframe.locator('canvas[data-engine="three.js r171"]');
        const size = await canvas.evaluate((c) => {
            const canvasEl = c as HTMLCanvasElement;
            return { width: canvasEl.width, height: canvasEl.height };
        });
        expect(size).toEqual({ width: 700, height: 500 }); //These are set in App-single-no-variants.jsx

        const gestureHint = iframe.locator('#ov25-gesture-hint');
        expect(gestureHint).toBeVisible();

        await canvas.click(); // this removes the animated gesture hint, so our screenshot will be deterministic

        expect(gestureHint).not.toBeVisible();

        expect(await canvas.screenshot()).toMatchSnapshot('single-no-variants-initial-canvas.png', { maxDiffPixelRatio: 0.01 });

        // Test Share button
        const shareButton = page.locator('#ov25-share-button');
        await expect(shareButton).toBeVisible();
        await shareButton.click();
        // link should be copied to clipboard
        await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toContain('http://localhost:3008/single-no-variants.html?configuration=eyJwIjo2MDcsInMiOls0LDE5XX0');
        // toast should appear
        const toast = page.locator('li[data-sonner-toast]');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Share link copied to clipboard!');

        // Test Dimensions button
        const dimensionsButton = page.locator('#ov25-desktop-dimensions-toggle-button');
        await expect(dimensionsButton).toBeVisible();
        await dimensionsButton.click();

        // dimensions overlay should appear
        const dimensionsWidth = iframe.locator('.ov25-dimensions-width');
        await expect(dimensionsWidth).toBeVisible();
        await expect(dimensionsWidth).toContainText('W 127cm');
        const dimensionsHeight = iframe.locator('.ov25-dimensions-height');
        await expect(dimensionsHeight).toBeVisible();
        await expect(dimensionsHeight).toContainText('H 95cm');
        const dimensionsDepth = iframe.locator('.ov25-dimensions-depth');
        await expect(dimensionsDepth).toBeVisible();
        await expect(dimensionsDepth).toContainText('D 104cm');

        await dimensionsButton.click();
        // dimensions overlay should disappear
        await expect(dimensionsWidth).not.toBeVisible();
        await expect(dimensionsHeight).not.toBeVisible();
        await expect(dimensionsDepth).not.toBeVisible();

        // Test AR button
        const arButton = page.locator('#ov25-ar-toggle-button');
        await expect(arButton).toBeVisible();
        await arButton.click();
        // dialog should appear
        const arDialogContainer = page.locator('#ov25-configurator-view-controls-container');
        const arDialog = arDialogContainer.locator('#ov25-ar-preview-qr-code-dialog');
        await expect(arDialog).toBeVisible();
        await expect(arDialog).toContainText('View in room');
        await expect(arDialog).toContainText('Scan the QR code on your phones camera to view this item in your room');
        await expect(arDialog).toContainText(/https:\/\/configurator\.orbital\.vision\/ar-preview\/[a-f0-9-]{36}/);
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
        // iframe should be fullscreen
        const fullscreenParent = page.locator('#true-ov25-configurator-iframe-container');
        // check document.fullscreenElement is this element by comparing IDs
        await expect(page.evaluate(() => document.fullscreenElement?.id)).resolves.toBe('true-ov25-configurator-iframe-container');

        // Check share button still works
        await expect(shareButton).toBeVisible();
        await shareButton.click();
        // link should be copied to clipboard
        await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toContain('http://localhost:3008/single-no-variants.html?configuration=eyJwIjo2MDcsInMiOls0LDE5XX0');
        // toast should appear - use .last() to get the most recent toast
        const toast2 = page.locator('li[data-sonner-toast]').last();
        await expect(toast2).toBeVisible();
        await expect(toast2).toContainText('Share link copied to clipboard!');

        // Check Dimensions button still works
        dimensionsButton.click();
        // dimensions overlay should appear
        await expect(dimensionsWidth).toBeVisible();
        await expect(dimensionsHeight).toBeVisible();
        await expect(dimensionsDepth).toBeVisible();
        // close dimensions overlay
        dimensionsButton.click();
        // dimensions overlay should disappear
        await expect(dimensionsWidth).not.toBeVisible();
        await expect(dimensionsHeight).not.toBeVisible();
        await expect(dimensionsDepth).not.toBeVisible();

        // Test AR button still shows
        await expect(arButton).toBeVisible();
        await arButton.click();
        // dialog should appear
        await expect(arDialog).toBeVisible();
        await expect(arDialog).toContainText('View in room');
        await expect(arDialog).toContainText('Scan the QR code on your phones camera to view this item in your room');
        await expect(arDialog).toContainText(/https:\/\/configurator\.orbital\.vision\/ar-preview\/[a-f0-9-]{36}/);
        // contains an svg QR code
        await expect(qrCode).toBeVisible();

        // Close fullscreen
        await fullscreenButton.click();
        await expect(page.evaluate(() => document.fullscreenElement?.id)).resolves.toBe(undefined);
    });
});
