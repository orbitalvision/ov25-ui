import { expect, test } from '@playwright/test';

// The child document is cross-origin, like OV25. These tests verify that the
// fixture actually resizes a live browsing context instead of reloading it;
// OV25's own camera fitting is covered in the OV25 repository and manual QA.
for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test(`iframe survives page, sheet and modal moves at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    let requests = 0;
    await page.route('https://resize-fixture.invalid/viewer', async route => {
      requests += 1;
      await route.fulfill({ contentType: 'text/html', body: `<!doctype html>
        <html><body style="margin:0;background:#e0e8dd;font:20px system-ui;display:grid;place-items:center;height:100vh">
          <button onclick="window.zoom += 1; this.textContent = 'Zoom ' + window.zoom">Zoom 1</button>
          <script>
            window.documentToken = crypto.randomUUID(); window.zoom = 1;
            parent.postMessage({type:'IS_LOADING',payload:'false'}, 'http://localhost:3008');
          </script>
        </body></html>` });
    });
    await page.goto('/tests/iframe-resize.html?src=' + encodeURIComponent('https://resize-fixture.invalid/viewer'));
    const viewer = page.locator('#resize-test-iframe');
    await expect(page.locator('#load-count')).toHaveText('1');
    await expect(page.locator('#scene-status')).toHaveText('Scene ready');
    const child = page.frameLocator('#resize-test-iframe');
    // Settle the host's scroll tracking before clicking into the cross-origin
    // document. Playwright's implicit frame scrolling can otherwise move the
    // fixed viewer between pointer-down and pointer-up on small viewports.
    await page.locator('#page-slot').scrollIntoViewIfNeeded();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await child.getByRole('button', { name: 'Zoom 1' }).click();
    await expect(child.getByRole('button', { name: 'Zoom 2' })).toBeVisible();
    const frame = page.frames().find(frame => frame.url().startsWith('https://resize-fixture.invalid/'))!;
    const token = await frame.evaluate(() => (window as any).documentToken);
    await page.evaluate(() => { (window as any).originalIframe = document.querySelector('#resize-test-iframe'); });

    const checkState = async (ratio: number) => {
      await expect.poll(async () => {
        const rect = await viewer.boundingBox();
        return Math.abs(rect!.width / rect!.height - ratio);
      }).toBeLessThan(0.01);
      await expect(viewer).toBeVisible();
      await expect(viewer).toHaveCount(1);
      await expect(page.locator('#load-count')).toHaveText('1');
      expect(await page.evaluate(() => document.querySelector('#resize-test-iframe') === (window as any).originalIframe)).toBe(true);
      expect(await frame.evaluate(() => (window as any).documentToken)).toBe(token);
      await expect(child.getByRole('button', { name: 'Zoom 2' })).toBeVisible();
    };

    await checkState(1);
    for (let cycle = 0; cycle < 3; cycle++) {
      const pageMoves = page.getByRole('navigation', { name: 'Viewer location', exact: true });
      await pageMoves.getByRole('button', { name: 'Open sheet', exact: true }).click();
      await checkState(16 / 9);
      await page.getByRole('dialog').getByRole('button', { name: 'Modal', exact: true }).click();
      await checkState(16 / 9);
      await page.getByRole('dialog').getByRole('button', { name: 'Close and return to page' }).click();
      await checkState(1);
    }
    await page.getByRole('navigation', { name: 'Viewer location', exact: true }).getByRole('button', { name: 'Lower on page' }).click();
    await checkState(16 / 9);
    await page.getByRole('navigation', { name: 'Lower viewer location' }).getByRole('button', { name: 'Return to gallery' }).click();
    await checkState(1);
    await page.setViewportSize({ width: viewport.width === 390 ? 1280 : 390, height: 900 });
    await checkState(1);
    expect(requests).toBe(1);
    expect(errors).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('iframe-resize.png'), fullPage: true });
  });
}

test('fluid-width gallery changes desktop aspect but keeps mobile proportions without reloading', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let requests = 0;
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://resize-fixture.invalid/viewer', async route => {
    requests++;
    await route.fulfill({ contentType: 'text/html', body: `<!doctype html>
      <html><body style="margin:0;background:#e0e8dd;height:100vh;display:grid;place-items:center;font:20px system-ui">
        <p>Fluid-width resize test</p>
        <script>window.documentToken = crypto.randomUUID(); window.zoom = 2;</script>
      </body></html>` });
  });
  await page.goto('/tests/iframe-resize.html?place=fluid&src=' + encodeURIComponent('https://resize-fixture.invalid/viewer'));
  const viewer = page.locator('#resize-test-iframe');
  await expect(page.locator('#load-count')).toHaveText('1');
  await expect(page.locator('#location')).toHaveText('Fluid width · Orla Kiely');
  const frame = page.frames().find(frame => frame.url().startsWith('https://resize-fixture.invalid/'))!;
  const token = await frame.evaluate(() => (window as any).documentToken);
  await page.evaluate(() => { (window as any).originalIframe = document.querySelector('#resize-test-iframe'); });
  const checkDimensions = async () => {
    await expect.poll(async () => {
      const actual = await viewer.boundingBox();
      const target = await page.locator('#fluid-slot').boundingBox();
      return Math.max(Math.abs(actual!.width - target!.width), Math.abs(actual!.height - target!.height));
    }).toBeLessThan(1);
    const rect = (await viewer.boundingBox())!;
    await expect.poll(() => frame.evaluate(() => innerWidth)).toBe(Math.round(rect.width));
    expect(await frame.evaluate(() => (window as any).documentToken)).toBe(token);
    expect(await frame.evaluate(() => (window as any).zoom)).toBe(2);
    expect(await page.evaluate(() => document.querySelector('#resize-test-iframe') === (window as any).originalIframe)).toBe(true);
    await expect(page.locator('#load-count')).toHaveText('1');
    return rect;
  };
  const start = await checkDimensions();
  for (const width of [1200, 1000, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const rect = await checkDimensions();
    expect(rect.width).toBeCloseTo((width - 100) / 2, 0);
    expect(rect.height).toBeCloseTo(start.height, 0);
    expect(rect.width / rect.height).toBeCloseTo(((width - 100) / 2) / start.height, 2);
  }
  await page.locator('#fluid-width').evaluate((input: HTMLInputElement) => {
    input.value = '60'; input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const narrowed = await checkDimensions();
  expect(narrowed.width).toBeCloseTo(start.width * 0.6, 0);
  expect(narrowed.height).toBeCloseTo(start.height, 0);
  await expect(page.locator('#fluid-width-value')).toHaveText('60%');
  await page.locator('#fluid-width').evaluate((input: HTMLInputElement) => {
    input.value = '100'; input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const restored = await checkDimensions();
  expect(restored.width).toBeCloseTo(start.width, 0);
  expect(restored.height).toBeCloseTo(start.height, 0);
  await page.screenshot({ path: testInfo.outputPath('fluid-width-desktop.png'), fullPage: true });
  for (const width of [800, 600, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const rect = await checkDimensions();
    expect(rect.width).toBeCloseTo(width, 0);
    expect(rect.width / rect.height).toBeCloseTo(1.5, 2);
  }
  expect(requests).toBe(1);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('fluid-width-mobile.png'), fullPage: true });
});
