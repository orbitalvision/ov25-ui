import { expect, test, type FrameLocator, type Locator, type Page } from '@playwright/test';

const RUNTIME_TIMEOUT = 20_000;
const CANVAS_READY_TIMEOUT = 45_000;
const CANVAS_SELECTOR = 'canvas[data-engine="three.js r171"]';
const MODULES_READY_SELECTOR =
  '#ov25-snap2-modules-body[data-ov25-snap2-modules-state="ready"]:visible';

type Point = { x: number; y: number };
type Snap2State = {
  snap2Objects?: Array<{ path?: string; product?: { name?: string } | null }>;
};

async function observeConfiguratorState(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const stateWindow = window as Window & { __mazeSnap2State?: Snap2State };

    window.addEventListener('message', (event) => {
      const message = event.data as { type?: unknown; payload?: unknown } | null;
      if (message?.type !== 'CONFIGURATOR_STATE') return;

      try {
        const payload = typeof message.payload === 'string'
          ? JSON.parse(message.payload)
          : message.payload;
        if (payload && typeof payload === 'object') {
          stateWindow.__mazeSnap2State = payload as Snap2State;
        }
      } catch {
        // Ignore unrelated or incomplete postMessages while the iframe boots.
      }
    });
  });
}

async function expectObjectCount(page: Page, count: number): Promise<void> {
  await expect.poll(
    () => page.evaluate(() => {
      const stateWindow = window as Window & { __mazeSnap2State?: Snap2State };
      return stateWindow.__mazeSnap2State?.snap2Objects?.length ?? -1;
    }),
    {
      message: `wait for CONFIGURATOR_STATE to contain ${count} Snap2 objects`,
      timeout: CANVAS_READY_TIMEOUT,
      intervals: [100, 250, 500],
    },
  ).toBe(count);
}

async function expectProductNames(page: Page, expectedNames: string[]): Promise<void> {
  await expect.poll(
    () => page.evaluate(() => {
      const stateWindow = window as Window & { __mazeSnap2State?: Snap2State };
      return stateWindow.__mazeSnap2State?.snap2Objects
        ?.map((object) => object.product?.name ?? '')
        .sort() ?? [];
    }),
    { timeout: CANVAS_READY_TIMEOUT, intervals: [100, 250, 500] },
  ).toEqual([...expectedNames].sort());
}

async function objectPaths(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const stateWindow = window as Window & { __mazeSnap2State?: Snap2State };
    return stateWindow.__mazeSnap2State?.snap2Objects
      ?.map((object) => object.path)
      .filter((path): path is string => typeof path === 'string') ?? [];
  });
}

async function expectObjectPaths(page: Page, expectedPaths: string[]): Promise<void> {
  await expect.poll(
    async () => (await objectPaths(page)).sort(),
    { timeout: CANVAS_READY_TIMEOUT, intervals: [100, 250, 500] },
  ).toEqual([...expectedPaths].sort());
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
      const responsive = current.width !== 300 && current.height !== 150
        && Math.abs(current.width - rect.width * ratio) <= 1
        && Math.abs(current.height - rect.height * ratio) <= 1;
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
    message: 'wait for the Snap2 WebGL canvas to reach a stable responsive size',
    timeout: CANVAS_READY_TIMEOUT,
    intervals: [250],
  }).toBeGreaterThanOrEqual(3);
}

async function expectDimensions(
  iframe: FrameLocator,
  { width, height, depth }: { width: number; height: number; depth: number },
): Promise<void> {
  const labels = {
    width: iframe.locator('.ov25-dimensions-width'),
    height: iframe.locator('.ov25-dimensions-height'),
    depth: iframe.locator('.ov25-dimensions-depth'),
  };

  await expect(labels.width).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  await expect(labels.height).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  await expect(labels.depth).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  await expect(labels.width).toHaveText(`W ${width}cm`, { timeout: RUNTIME_TIMEOUT });
  await expect(labels.height).toHaveText(`H ${height}cm`, { timeout: RUNTIME_TIMEOUT });
  await expect(labels.depth).toHaveText(`D ${depth}cm`, { timeout: RUNTIME_TIMEOUT });
}

async function expectMiniDimensions(iframe: FrameLocator, widths: number[]): Promise<void> {
  const labels = iframe.locator('.ov25-dimensions-mini');
  await expect(labels).toHaveCount(widths.length, { timeout: RUNTIME_TIMEOUT });
  await expect(labels).toHaveText(widths.map((width) => `W ${width}cm`), {
    timeout: RUNTIME_TIMEOUT,
  });
}

async function locatorCenters(locator: Locator): Promise<Point[]> {
  const count = await locator.count();
  const centers: Point[] = [];

  for (let index = 0; index < count; index += 1) {
    const box = await locator.nth(index).boundingBox();
    if (!box) throw new Error(`Element ${index} has no visible bounding box`);
    centers.push({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
  }

  return centers;
}

function attachmentButtons(iframe: FrameLocator): Locator {
  return iframe.locator('svg.lucide-plus').locator('..');
}

async function attachmentGeometry(iframe: FrameLocator, expectedCount = 2): Promise<Point[]> {
  const buttons = attachmentButtons(iframe);
  await expect(buttons).toHaveCount(expectedCount, { timeout: CANVAS_READY_TIMEOUT });
  return locatorCenters(buttons);
}

function indexWithGreatestX(points: Point[]): number {
  return points.reduce(
    (best, point, index) => point.x > points[best].x ? index : best,
    0,
  );
}

async function clickAttachment(iframe: FrameLocator, index: number): Promise<void> {
  const button = attachmentButtons(iframe).nth(index);
  await expect(button).toBeVisible({ timeout: CANVAS_READY_TIMEOUT });
  // The icon sits over the div's centre; an offset clicks the actual circular control.
  await button.click({ position: { x: 10, y: 10 }, timeout: RUNTIME_TIMEOUT });
}

async function chooseModulePosition(page: Page, position: 'middle' | 'corner'): Promise<void> {
  const tab = page.locator(`[data-ov25-tab-id="${position}"]:visible`);
  const select = page.locator('#ov25-module-position-tabs-select:visible');

  await expect.poll(
    async () => await tab.count() + await select.count(),
    { timeout: RUNTIME_TIMEOUT, intervals: [100, 250] },
  ).toBeGreaterThan(0);

  if (await tab.count()) {
    await tab.click();
    await expect(tab).toHaveAttribute('data-ov25-tab-active', 'true');
  } else {
    await select.selectOption(position);
    await expect(select).toHaveValue(position);
  }
}

async function addModule(
  page: Page,
  productName: 'Middle Cabinet' | 'Corner Modular',
  position?: 'middle' | 'corner',
): Promise<void> {
  await expect(page.locator(MODULES_READY_SELECTOR)).toBeVisible({ timeout: CANVAS_READY_TIMEOUT });
  if (position) await chooseModulePosition(page, position);

  const card = page.locator(
    `[data-ov25-module-variant-card][aria-label^="${productName}."]:visible`,
  ).first();
  await expect(card).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await expect(card).toHaveAttribute('data-ov25-module-variant-card-loading', 'false', {
    timeout: RUNTIME_TIMEOUT,
  });
  await card.press('Enter');
}

async function selectModelAt(page: Page, iframe: FrameLocator, point: Point): Promise<void> {
  await page.mouse.click(point.x, point.y);
  await expect(iframe.locator('svg.lucide-trash').locator('..')).toBeVisible({
    timeout: RUNTIME_TIMEOUT,
  });
}

async function deleteSelectedModel(iframe: FrameLocator): Promise<void> {
  const button = iframe.locator('svg.lucide-trash').locator('..');
  await expect(button).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  await button.click({ position: { x: 10, y: 10 }, timeout: RUNTIME_TIMEOUT });
}

function unitVector(from: Point, to: Point): Point {
  const x = to.x - from.x;
  const y = to.y - from.y;
  const length = Math.hypot(x, y);
  if (length === 0) throw new Error('Attachment points unexpectedly overlap');
  return { x: x / length, y: y / length };
}

function projection(point: Point, axis: Point): number {
  return point.x * axis.x + point.y * axis.y;
}

function pointOnChainAxis(label: Point, endpoint: Point, axis: Point): Point {
  const perpendicular = { x: -axis.y, y: axis.x };
  const along = projection(label, axis);
  const across = projection(endpoint, perpendicular);
  return {
    x: axis.x * along + perpendicular.x * across,
    y: axis.y * along + perpendicular.y * across,
  };
}

async function loadMazeSnap2(page: Page): Promise<FrameLocator> {
  await observeConfiguratorState(page);
  await page.goto('/tests/Maze_snap2.html');

  const iframe = page.frameLocator('#ov25-configurator-iframe');
  const initialMiddle = page.getByRole('button', {
    name: 'Middle Cabinet. Select this product.',
    exact: true,
  });
  await expect(initialMiddle).toBeVisible({ timeout: 60_000 });
  await initialMiddle.click();
  await expectObjectCount(page, 1);
  await waitForStableResponsiveCanvas(page);

  const viewSelect = page.locator('#ov25-snap2-view-select');
  await viewSelect.selectOption('86');
  await expect(viewSelect).toHaveValue('86');

  return iframe;
}

async function enableDimensions(page: Page, iframe: FrameLocator): Promise<void> {
  await page.locator('#ov25-snap2-dimensions-button').click();
  await expectDimensions(iframe, { width: 58, height: 90, depth: 58 });

  await page.locator('#ov25-snap2-mini-dimensions-switch').click();
  await expectMiniDimensions(iframe, [58]);
}

async function addSecondMiddle(page: Page, iframe: FrameLocator): Promise<void> {
  const endpoints = await attachmentGeometry(iframe);
  await clickAttachment(iframe, indexWithGreatestX(endpoints));
  await addModule(page, 'Middle Cabinet', 'middle');

  await expectObjectCount(page, 2);
  await expectDimensions(iframe, { width: 116, height: 90, depth: 58 });
  await expectMiniDimensions(iframe, [58, 58]);
}

const snap2Test = test.extend({
  launchOptions: { args: ['--enable-unsafe-swiftshader'] },
});

snap2Test.use({ viewport: { width: 1280, height: 800 } });

snap2Test('keeps dimensions correct when inserting and removing a middle item', async ({ page }) => {
  snap2Test.setTimeout(180_000);
  const iframe = await loadMazeSnap2(page);
  let originalPaths: string[] = [];
  let insertedPath = '';

  await test.step('single item dimensions', async () => {
    await enableDimensions(page, iframe);
  });

  await test.step('add a second item and show its dimensions', async () => {
    await addSecondMiddle(page, iframe);
    originalPaths = await objectPaths(page);
    expect(originalPaths).toHaveLength(2);
  });

  await test.step('insert a third item between the first two', async () => {
    const endpoints = await attachmentGeometry(iframe);
    const orderedEndpoints = [...endpoints].sort((a, b) => a.x - b.x);
    const miniLabels = (await locatorCenters(iframe.locator('.ov25-dimensions-mini')))
      .sort((a, b) => a.x - b.x);

    await selectModelAt(page, iframe, {
      x: miniLabels[0].x,
      y: (orderedEndpoints[0].y + orderedEndpoints[1].y) / 2,
    });

    const selectedPoints = await attachmentGeometry(iframe);
    const occupiedPointIndex = indexWithGreatestX(selectedPoints);
    const chainAxis = unitVector(orderedEndpoints[0], orderedEndpoints[1]);
    const endpointProjections = orderedEndpoints.map((point) => projection(point, chainAxis));
    const occupiedProjection = projection(selectedPoints[occupiedPointIndex], chainAxis);
    expect(occupiedProjection).toBeGreaterThan(Math.min(...endpointProjections) + 1);
    expect(occupiedProjection).toBeLessThan(Math.max(...endpointProjections) - 1);

    await clickAttachment(iframe, occupiedPointIndex);
    await addModule(page, 'Middle Cabinet', 'middle');

    await expectObjectCount(page, 3);
    const pathsAfterInsert = await objectPaths(page);
    insertedPath = pathsAfterInsert.find((path) => !originalPaths.includes(path)) ?? '';
    expect(insertedPath).not.toBe('');
    await expectDimensions(iframe, { width: 174, height: 90, depth: 58 });
    await expectMiniDimensions(iframe, [58, 58, 58]);
  });

  await test.step('remove the inserted item', async () => {
    const endpoints = await attachmentGeometry(iframe);
    const labels = (await locatorCenters(iframe.locator('.ov25-dimensions-mini')))
      .sort((a, b) => a.x - b.x);
    await selectModelAt(page, iframe, {
      x: labels[1].x,
      y: (endpoints[0].y + endpoints[1].y) / 2,
    });
    await deleteSelectedModel(iframe);

    await expectObjectCount(page, 2);
    await expectObjectPaths(page, originalPaths);
    expect(await objectPaths(page)).not.toContain(insertedPath);
    await expectDimensions(iframe, { width: 116, height: 90, depth: 58 });
    await expectMiniDimensions(iframe, [58, 58]);
  });
});

snap2Test('keeps corner dimensions correct when deleting the middle item', async ({ page }) => {
  snap2Test.setTimeout(180_000);
  const iframe = await loadMazeSnap2(page);
  const firstMiddlePath = (await objectPaths(page))[0];
  if (!firstMiddlePath) throw new Error('Initial Middle Cabinet has no Snap2 object path');
  let middlePathToDelete = '';
  let expectedPathsAfterDelete: string[] = [];

  await test.step('build the initial two-item line', async () => {
    await enableDimensions(page, iframe);
    await addSecondMiddle(page, iframe);
    middlePathToDelete = (await objectPaths(page))
      .find((path) => path !== firstMiddlePath) ?? '';
    expect(middlePathToDelete).not.toBe('');
  });

  let straightAxis: Point = { x: 1, y: 0 };

  await test.step('add a corner and an item on the other side', async () => {
    const endpoints = await attachmentGeometry(iframe);
    const orderedEndpoints = [...endpoints].sort((a, b) => a.x - b.x);
    straightAxis = unitVector(orderedEndpoints[0], orderedEndpoints[1]);

    await clickAttachment(iframe, indexWithGreatestX(endpoints));
    await addModule(page, 'Corner Modular', 'corner');
    await expectObjectCount(page, 3);
    await expectProductNames(page, ['Middle Cabinet', 'Middle Cabinet', 'Corner Modular']);
    await expectDimensions(iframe, { width: 196, height: 90, depth: 80 });
    await expectMiniDimensions(iframe, [58, 58, 80]);

    // Snap2 automatically selects the corner's remaining attachment point.
    await addModule(page, 'Middle Cabinet', 'middle');
    await expectObjectCount(page, 4);
    await expectProductNames(page, [
      'Middle Cabinet',
      'Middle Cabinet',
      'Corner Modular',
      'Middle Cabinet',
    ]);
    await expectDimensions(iframe, { width: 196, height: 90, depth: 138 });
    await expectMiniDimensions(iframe, [58, 58, 80, 58]);

    expectedPathsAfterDelete = (await objectPaths(page))
      .filter((path) => path !== middlePathToDelete);
    expect(expectedPathsAfterDelete).toHaveLength(3);
  });

  await test.step('delete the middle item from the L-shaped run', async () => {
    const endpoints = await attachmentGeometry(iframe);
    const chainStart = [...endpoints].sort(
      (a, b) => projection(a, straightAxis) - projection(b, straightAxis),
    )[0];
    const labels = (await locatorCenters(iframe.locator('.ov25-dimensions-mini')))
      .sort((a, b) => projection(a, straightAxis) - projection(b, straightAxis));

    // The second label along the original straight axis belongs to the middle cabinet.
    await selectModelAt(page, iframe, pointOnChainAxis(labels[1], chainStart, straightAxis));
    await deleteSelectedModel(iframe);

    await expectObjectCount(page, 3);
    await expectObjectPaths(page, expectedPathsAfterDelete);
    expect(await objectPaths(page)).toContain(firstMiddlePath);
    expect(await objectPaths(page)).not.toContain(middlePathToDelete);
    await expectProductNames(page, ['Middle Cabinet', 'Corner Modular', 'Middle Cabinet']);
    await expectDimensions(iframe, { width: 138, height: 90, depth: 138 });
    await expectMiniDimensions(iframe, [58, 80, 58]);
  });
});
