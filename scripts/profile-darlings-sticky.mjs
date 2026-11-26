import { chromium, webkit } from 'playwright';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { instrumentStickyController } from './sticky-profile-instrumentation.mjs';

const base = process.env.OV25_PERF_BASE_URL || 'http://127.0.0.1:3008';
const directory = new URL('../outputs/darlings-sticky-profile/', import.meta.url);
await fs.mkdir(directory, { recursive: true });
const summaries = [];
const percentile = (values, p) => [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * p))] ?? 0;

for (const [engine, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch({ headless: true, ...(engine === 'chromium' ? {
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    let intercepted = 0;
    await page.route('**/*sticky-layout-controller.ts*', async route => {
      const response = await route.fetch();
      intercepted++;
      await route.fulfill({ response, body: instrumentStickyController(await response.text()) });
    });
    await page.goto(`${base}/tests/performance-darlings-savor.html`);
    await page.locator('.ov25-default-variant-card').nth(199).waitFor({ state: 'attached', timeout: 120000 });
    if (!intercepted) throw Error('Controller instrumentation not loaded');
    const viewer = page.frames().find(f => f.url().startsWith('https://configurator.orbital.vision/'));
    if (!viewer) throw Error('Production viewer frame missing');
    await viewer.locator('canvas').waitFor({ state: 'visible', timeout: 120000 });
    await page.locator('[data-ov25-gallery-tile="cutout"]').nth(1).waitFor({ state: 'attached', timeout: 120000 });
    // Warm the scroll path and lazy images before recording steady-state work.
    await page.evaluate(async () => {
      const end = document.querySelector('#performance-product').getBoundingClientRect().bottom + window.scrollY;
      for (let y = 0; y < end; y += 600) {
        window.scrollTo(0, y);
        await new Promise(resolve => setTimeout(resolve, 80));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(5000);
    const metadata = {
      engine, productId: 7449,
      optionHeaders: await page.locator('.ov25-option-header').allTextContents(),
      cardsPerOption: await page.locator('.ov25-option-header').evaluateAll(headers => headers.map(h => ({ option: h.textContent, cards: h.parentElement.querySelectorAll('.ov25-default-variant-card').length }))),
      cards: await page.locator('.ov25-default-variant-card').count(),
      groups: await page.locator('.ov25-group-header').count(),
      name: await page.locator('#performance-name').evaluate(el => el.shadowRoot?.textContent?.slice(-180) || el.textContent),
      cutouts: await page.locator('[data-ov25-gallery-tile="cutout"]').count(),
    };
    console.log(JSON.stringify(metadata));
    const client = engine === 'chromium' ? await page.context().newCDPSession(page) : null;
    if (client) await client.send('Performance.enable');
    const metrics = async () => client ? Object.fromEntries((await client.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value])) : null;
    const results = [];
    for (const mode of ['idle-model', 'rotate-then-scroll']) for (let repeat = 0; repeat < 3; repeat++) {
      await page.evaluate(() => window.scrollTo(0, document.querySelector('#performance-product').offsetTop));
      await page.waitForTimeout(1000);
      if (mode === 'rotate-then-scroll') {
        const tiles = page.locator('[data-ov25-gallery-tile="cutout"]');
        if (await tiles.count() < 2) throw Error('Need two real cutout angle thumbnails for rotation');
        await tiles.nth(repeat % 2).click({ force: true });
      }
      await viewer.evaluate(() => {
        window.__perfFrames = []; window.__perfActive = true;
        let last = performance.now();
        function tick(t) {
          if (!window.__perfActive) return;
          window.__perfFrames.push(t - last); last = t;
          requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
      const before = await metrics();
      const data = await page.evaluate(async () => {
        window.__stickyProfile = { rows: [] };
        const frames = []; let last = performance.now(); const start = last;
        const section = document.querySelector('#performance-product');
        const startY = section.getBoundingClientRect().top + window.scrollY;
        const endY = section.getBoundingClientRect().bottom + window.scrollY;
        await new Promise(resolve => {
          function tick(t) {
            frames.push(t - last); last = t;
            const fraction = Math.min(1, (t - start) / 6000);
            window.scrollTo(0, startY + (endY - startY) * (1 - Math.cos(fraction * Math.PI * 2)) / 2);
            if (fraction < 1) requestAnimationFrame(tick); else resolve();
          }
          requestAnimationFrame(tick);
        });
        return { rows: window.__stickyProfile.rows, frames, startY, endY };
      });
      const after = await metrics();
      const viewerFrames = await viewer.evaluate(() => { window.__perfActive = false; return window.__perfFrames; });
      const cdp = before ? Object.fromEntries(['LayoutDuration', 'RecalcStyleDuration', 'ScriptDuration', 'TaskDuration', 'LayoutCount', 'RecalcStyleCount'].map(key => [key, after[key] - before[key]])) : null;
      results.push({ mode, repeat, ...data, viewerFrames, cdp });
    }
    for (const mode of ['idle-model', 'rotate-then-scroll']) {
      const rs = results.filter(r => r.mode === mode);
      const rows = rs.flatMap(r => r.rows);
      const durations = rows.map(r => r.at(-1)[1] - r[0][1]);
      const phaseMs = {};
      for (const row of rows) for (let i = 1; i < row.length - 1; i++) {
        phaseMs[row[i][0]] = (phaseMs[row[i][0]] || 0) + row[i + 1][1] - row[i][1];
      }
      summaries.push({ ...metadata, mode, calls: rows.length,
        totalControllerMs: durations.reduce((a, b) => a + b, 0),
        meanControllerMs: durations.reduce((a, b) => a + b, 0) / durations.length,
        p95ControllerMs: percentile(durations, .95), maxControllerMs: Math.max(...durations), phaseMs,
        parentP95FrameGapMs: percentile(rs.flatMap(r => r.frames), .95),
        parentMaxFrameGapMs: Math.max(...rs.flatMap(r => r.frames)),
        viewerP95FrameGapMs: percentile(rs.flatMap(r => r.viewerFrames), .95),
        viewerMaxFrameGapMs: Math.max(...rs.flatMap(r => r.viewerFrames)), cdp: rs.map(r => r.cdp),
      });
    }
    await fs.writeFile(new URL(`${engine}-raw.json`, directory), JSON.stringify({ metadata, results }));
    await page.evaluate(() => window.scrollTo(0, document.querySelector('#performance-product').offsetTop));
    await page.screenshot({ path: fileURLToPath(new URL(`${engine}-mobile.png`, directory)), timeout: 30000 });
    const manualButtonEnabled = await page.locator('#run-scroll').isEnabled();
    if (!manualButtonEnabled) throw Error('Fixture scroll button did not become ready');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: fileURLToPath(new URL(`${engine}-desktop.png`, directory)), timeout: 30000 });
    await fs.writeFile(new URL('summary.json', directory), JSON.stringify(summaries, null, 2));
    console.log(engine, 'completed');
  } finally {
    await browser.close();
  }
}
console.log(JSON.stringify(summaries, null, 2));
