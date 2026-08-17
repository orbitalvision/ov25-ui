import { expect, test, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const RUNTIME_TIMEOUT = 30000;

const DETAILS_SURFACE = '.ov25-selection-details-surface';
const DETAILS_TRIGGER = '.ov25-default-variant-card';
const DETAILS_CLOSE = '.ov25-selection-details-close';
const DETAILS_APPLY = '.ov25-selection-details-apply';
const DETAILS_SWATCH_TOGGLE = '.ov25-selection-details-swatch-toggle';
const DETAILS_IMAGE = '.ov25-selection-details-image';
const DETAILS_IMAGE_FRAME = '.ov25-selection-details-image-frame';
const DETAILS_FOOTER = '.ov25-selection-details-footer';

const PRODUCT_FIXTURES = {
  tooltip: '/tests/selection-details-tooltip-sheet.html',
  modal: '/tests/selection-details-modal.html',
  fullscreen: '/tests/selection-details-fullscreen.html',
} as const;

type DetailMode = 'tooltip' | 'sheet' | 'modal' | 'fullscreen';

type RectSnapshot = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

type SelectionDetailsPageLayoutSnapshot = {
  scrollX: number;
  scrollY: number;
  body: RectSnapshot;
  shell: RectSnapshot;
  configurator: RectSnapshot;
};

type IntersectionSnapshot = {
  boundingRect: RectSnapshot;
  intersectionRect: RectSnapshot;
  intersectionRatio: number;
  isIntersecting: boolean;
  visibleArea: number;
};

function rectsAreClose(
  actual: RectSnapshot,
  expected: RectSnapshot,
  tolerance = 0.1,
): boolean {
  return (Object.keys(expected) as Array<keyof RectSnapshot>).every(
    (property) =>
      Math.abs(actual[property] - expected[property]) <= tolerance,
  );
}

function visualPageLayoutIsStable(
  actual: SelectionDetailsPageLayoutSnapshot,
  expected: SelectionDetailsPageLayoutSnapshot,
): boolean {
  const bodyViewportGeometryIsStable =
    Math.abs(actual.body.top - expected.body.top) <= 0.1 &&
    Math.abs(actual.body.right - expected.body.right) <= 0.1 &&
    Math.abs(actual.body.left - expected.body.left) <= 0.1 &&
    Math.abs(actual.body.width - expected.body.width) <= 0.1;
  return (
    actual.scrollX === expected.scrollX &&
    bodyViewportGeometryIsStable &&
    rectsAreClose(actual.shell, expected.shell) &&
    rectsAreClose(actual.configurator, expected.configurator)
  );
}

function intersectionIsStable(
  actual: IntersectionSnapshot,
  expected: IntersectionSnapshot,
): boolean {
  return (
    actual.isIntersecting === expected.isIntersecting &&
    rectsAreClose(actual.boundingRect, expected.boundingRect) &&
    rectsAreClose(actual.intersectionRect, expected.intersectionRect) &&
    Math.abs(actual.intersectionRatio - expected.intersectionRatio) <= 0.001 &&
    Math.abs(actual.visibleArea - expected.visibleArea) <= 1
  );
}

function fixtureUrl(
  path: string,
  params: Record<string, string | undefined> = {},
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, value);
  }
  return query.size ? `${path}?${query}` : path;
}

async function resetFixtureState(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.removeItem('ov25-selected-swatches');
    window.localStorage.removeItem('ov25-viewport-mode');
  });
}

async function visibleTriggers(page: Page): Promise<Locator> {
  const triggers = page.locator(`${DETAILS_TRIGGER}:visible`);

  let snap2Starter = page.locator(
    '[data-ov25-module-variant-card-pick="true"]:visible',
  ).first();
  if ((await snap2Starter.count()) > 0) {
    await snap2Starter.click();
    await expect(snap2Starter).toBeHidden({ timeout: RUNTIME_TIMEOUT });
  }

  if ((await triggers.count()) === 0) {
    const configure = page
      .getByRole('button', { name: /^Configure(?:\s|$)/i })
      .filter({ visible: true })
      .first();
    if ((await configure.count()) > 0) {
      await expect(configure).toBeVisible({ timeout: RUNTIME_TIMEOUT });
      await configure.click();
    }
  }

  if (new URL(page.url()).pathname.includes('snap2')) {
    snap2Starter = page.locator(
      '[data-ov25-module-variant-card-pick="true"]:visible',
    ).first();
    await expect(snap2Starter).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await snap2Starter.click();
    await expect(snap2Starter).toBeHidden({ timeout: RUNTIME_TIMEOUT });
  }

  await expect
    .poll(
      async () =>
        (await triggers.count()) +
        (await page.locator('[data-ov25-tree-variants-mode]:visible').count()) +
        (await page.locator('[data-ov25-accordion-variants-mode]:visible').count()),
      { timeout: RUNTIME_TIMEOUT },
    )
    .toBeGreaterThan(0);

  const enterOrdinaryOption = async (container: Locator) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if ((await triggers.count()) > 0) return;
      const optionHeaders = container.locator('button.ov25-option-header:visible');
      await expect(optionHeaders.first()).toBeVisible({ timeout: RUNTIME_TIMEOUT });
      const nonSizeHeaders = optionHeaders.filter({ hasNotText: /^\s*Size\s*$/i });

      if ((await nonSizeHeaders.count()) === 0) {
        await optionHeaders.first().click();
        await expect
          .poll(
            () => container.locator('button.ov25-option-header:visible').count(),
            { timeout: RUNTIME_TIMEOUT },
          )
          .toBeGreaterThan(1);
        continue;
      }

      const target = nonSizeHeaders.first();
      if ((await container.getAttribute('data-ov25-accordion-variants-mode')) != null) {
        await page.waitForTimeout(750);
        const stableHeaders = container
          .locator('button.ov25-option-header:visible')
          .filter({ hasNotText: /^\s*Size\s*$/i });
        await stableHeaders.first().evaluate((element) => (element as HTMLButtonElement).click());
        return;
      } else {
        await target.click();
      }
      try {
        await triggers.first().waitFor({ state: 'visible', timeout: 5000 });
        return;
      } catch {
        // Product/options can settle once more after their first live payload.
      }
    }
  };

  const tree = page.locator('[data-ov25-tree-variants-mode]:visible').first();
  if ((await triggers.count()) === 0 && (await tree.count()) > 0) {
    await enterOrdinaryOption(tree);
  }

  const accordion = page
    .locator('[data-ov25-accordion-variants-mode]:visible')
    .first();
  if ((await triggers.count()) === 0 && (await accordion.count()) > 0) {
    await enterOrdinaryOption(accordion);
  }

  await expect(triggers.first()).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  return triggers;
}

async function getUnselectedTrigger(page: Page): Promise<Locator> {
  await visibleTriggers(page);
  const unselected = page.locator(
    `${DETAILS_TRIGGER}[data-selected="false"]:visible`,
  );
  if ((await unselected.count()) > 0) return unselected.first();

  const triggers = page.locator(`${DETAILS_TRIGGER}:visible`);
  expect(await triggers.count()).toBeGreaterThan(1);
  return triggers.nth(1);
}

async function getSwatchEligibleTrigger(page: Page): Promise<Locator> {
  await visibleTriggers(page);
  const eligibleUnselected = page.locator(
    `${DETAILS_TRIGGER}[data-swatch-eligible="true"][data-selected="false"]:visible`,
  );
  if ((await eligibleUnselected.count()) > 0) return eligibleUnselected.first();

  const eligible = page.locator(
    `${DETAILS_TRIGGER}[data-swatch-eligible="true"]:visible`,
  );
  await expect(eligible.first()).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  return eligible.first();
}

async function openDetails(
  page: Page,
  mode: DetailMode,
  interaction: 'click' | 'keyboard' = 'click',
  requestedTrigger?: Locator,
): Promise<{ surface: Locator; trigger: Locator }> {
  const trigger = requestedTrigger ?? (await getUnselectedTrigger(page));

  if (mode === 'tooltip') {
    await trigger.hover();
  } else if (interaction === 'keyboard') {
    await trigger.focus();
    await trigger.press('Enter');
  } else {
    await trigger.click();
  }

  const surface = page.locator(`${DETAILS_SURFACE}:visible`);
  await expect(surface).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await expect(surface).toHaveAttribute('data-display-mode', mode);
  return { surface, trigger };
}

async function waitForSurfaceAssets(surface: Locator): Promise<void> {
  await expect(surface.locator(DETAILS_IMAGE)).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await surface.evaluate(async (element) => {
    await document.fonts.ready;
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      images.map(async (image) => {
        if (!image.complete) {
          await new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
          });
        }
        await image.decode?.().catch(() => undefined);
      }),
    );
  });
}

async function expectDetailsClosed(page: Page): Promise<void> {
  await expect(page.locator(`${DETAILS_SURFACE}:visible`)).toHaveCount(0, {
    timeout: RUNTIME_TIMEOUT,
  });
}

async function expectPageScrollLocked(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const body = getComputedStyle(document.body);
          const html = getComputedStyle(document.documentElement);
          return (
            body.position === 'fixed' ||
            body.overflow === 'hidden' ||
            body.overflowY === 'hidden' ||
            html.overflow === 'hidden' ||
            html.overflowY === 'hidden'
          );
        }),
      { timeout: RUNTIME_TIMEOUT },
    )
    .toBe(true);
}

async function selectionDetailsPageLayoutSnapshot(
  page: Page,
  shellSelector = '.app',
): Promise<SelectionDetailsPageLayoutSnapshot> {
  return page.evaluate((clientShellSelector) => {
    const findDeep = (
      root: Document | ShadowRoot,
      selector: string,
    ): Element | null => {
      const match = root.querySelector(selector);
      if (match) return match;

      for (const element of root.querySelectorAll('*')) {
        if (element.shadowRoot) {
          const shadowMatch = findDeep(element.shadowRoot, selector);
          if (shadowMatch) return shadowMatch;
        }
      }
      return null;
    };
    const snapshotRect = (element: Element | null): RectSnapshot => {
      if (!element) throw new Error('Selection details reflow target not found');
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
    };

    return {
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      body: snapshotRect(document.body),
      shell: snapshotRect(document.querySelector(clientShellSelector)),
      configurator: snapshotRect(
        findDeep(document, '#ov-25-configurator-gallery-container'),
      ),
    };
  }, shellSelector);
}

async function inlineStyleSnapshot(page: Page) {
  return page.evaluate(() => {
    const declarations = (element: HTMLElement) =>
      Array.from(element.style)
        .sort()
        .map((property) => ({
          property,
          value: element.style.getPropertyValue(property),
          priority: element.style.getPropertyPriority(property),
        }));

    return {
      body: declarations(document.body),
      html: declarations(document.documentElement),
    };
  });
}

async function intersectionSnapshot(
  locator: Locator,
): Promise<IntersectionSnapshot> {
  return locator.evaluate(
    (element) =>
      new Promise<IntersectionSnapshot>((resolve) => {
        const snapshotRect = (rect: DOMRectReadOnly): RectSnapshot => ({
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
        const observer = new IntersectionObserver(([entry]) => {
          observer.disconnect();
          const intersectionRect = snapshotRect(entry.intersectionRect);
          resolve({
            boundingRect: snapshotRect(entry.boundingClientRect),
            intersectionRect,
            intersectionRatio: entry.intersectionRatio,
            isIntersecting: entry.isIntersecting,
            visibleArea: intersectionRect.width * intersectionRect.height,
          });
        });
        observer.observe(element);
      }),
  );
}

async function screenshotSurface(
  surface: Locator,
  snapshotName: string,
): Promise<void> {
  await waitForSurfaceAssets(surface);
  await expect(surface).toHaveScreenshot(snapshotName, {
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  });
}

async function expectFullscreenLayout(
  surface: Locator,
  expectedLayout: 'desktop-split' | 'mobile-stack',
): Promise<void> {
  const layout = await surface.evaluate((element, imageSelector) => {
    const image = element.querySelector<HTMLImageElement>(imageSelector);
    const imageFrame = element.querySelector<HTMLElement>('.ov25-selection-details-image-frame');
    const copy = element.querySelector<HTMLElement>('.ov25-selection-details-copy');
    const footer = element.querySelector<HTMLElement>('.ov25-selection-details-footer');
    if (!image || !imageFrame || !copy || !footer) {
      throw new Error('Selection details fullscreen layout is incomplete');
    }
    const surfaceRect = element.getBoundingClientRect();
    const frameRect = imageFrame.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const copyRect = copy.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    return {
      layout: element.getAttribute('data-layout'),
      topInset: imageRect.top - surfaceRect.top,
      leftInset: imageRect.left - surfaceRect.left,
      rightInset: surfaceRect.right - imageRect.right,
      surfaceWidth: surfaceRect.width,
      surfaceHeight: surfaceRect.height,
      imageWidth: imageRect.width,
      imageHeight: imageRect.height,
      renderedRatio: imageRect.width / imageRect.height,
      naturalRatio: image.naturalWidth / image.naturalHeight,
      objectFit: getComputedStyle(image).objectFit,
      presentation: imageFrame.dataset.imagePresentation,
      frameLeft: frameRect.left - surfaceRect.left,
      frameTop: frameRect.top - surfaceRect.top,
      frameRight: frameRect.right - surfaceRect.left,
      frameBottom: frameRect.bottom - surfaceRect.top,
      copyLeft: copyRect.left - surfaceRect.left,
      footerLeft: footerRect.left - surfaceRect.left,
      footerRight: footerRect.right - surfaceRect.left,
      titleTextAlign: getComputedStyle(
        element.querySelector<HTMLElement>('.ov25-selection-details-title')!,
      ).textAlign,
      footerDirection: getComputedStyle(footer).flexDirection,
    };
  }, DETAILS_IMAGE);

  expect(layout.objectFit).toBe('contain');
  expect(layout.presentation).toBe('contain');
  expect(layout.titleTextAlign).toBe('center');

  if (expectedLayout === 'desktop-split') {
    expect(layout.layout).toBe('split');
    expect(layout.frameLeft).toBeCloseTo(0, 0);
    expect(layout.frameTop).toBeCloseTo(0, 0);
    expect(layout.frameBottom).toBeCloseTo(layout.surfaceHeight, 0);
    expect(layout.frameRight).toBeLessThanOrEqual(layout.copyLeft + 1);
    expect(layout.copyLeft).toBeGreaterThan(layout.surfaceWidth / 2);
    expect(layout.footerLeft).toBeCloseTo(layout.copyLeft, 0);
    expect(layout.footerRight).toBeCloseTo(layout.surfaceWidth, 0);
    expect(layout.imageWidth).toBeGreaterThan(layout.surfaceWidth / 2);
    expect(layout.imageHeight).toBeGreaterThan(layout.surfaceHeight * 0.75);
    expect(layout.footerDirection).toBe('column');
    return;
  }

  expect(layout.layout).toBe('stacked');
  expect(layout.topInset).toBeGreaterThanOrEqual(16);
  expect(layout.leftInset).toBeGreaterThanOrEqual(16);
  expect(layout.rightInset).toBeGreaterThanOrEqual(16);
  expect(layout.imageWidth).toBeLessThan(layout.surfaceWidth);
  expect(Math.abs(layout.renderedRatio - layout.naturalRatio)).toBeLessThan(0.02);
  expect(layout.footerDirection).toBe('column');
}

async function expectSquareImageCrop(surface: Locator): Promise<void> {
  await waitForSurfaceAssets(surface);
  const layout = await surface.evaluate((element, selectors) => {
    const frame = element.querySelector<HTMLElement>(selectors.frame);
    const image = element.querySelector<HTMLImageElement>(selectors.image);
    if (!frame || !image) throw new Error('Selection details image crop not found');
    const frameRect = frame.getBoundingClientRect();
    return {
      frameWidth: frameRect.width,
      frameHeight: frameRect.height,
      objectFit: getComputedStyle(image).objectFit,
      presentation: frame.dataset.imagePresentation,
    };
  }, { frame: DETAILS_IMAGE_FRAME, image: DETAILS_IMAGE });

  expect(Math.abs(layout.frameWidth - layout.frameHeight)).toBeLessThan(1);
  expect(layout.objectFit).toBe('cover');
  expect(layout.presentation).toBe('square-crop');
}

async function expectDesktopModalActionsCentered(surface: Locator): Promise<void> {
  const layout = await surface.evaluate((element, selectors) => {
    const footer = element.querySelector<HTMLElement>(selectors.footer);
    const actions = Array.from(element.querySelectorAll<HTMLElement>(selectors.actions));
    if (!footer || actions.length === 0) {
      throw new Error('Selection details modal actions not found');
    }
    const footerRect = footer.getBoundingClientRect();
    const footerStyle = getComputedStyle(footer);
    const contentWidth = footerRect.width
      - Number.parseFloat(footerStyle.paddingLeft)
      - Number.parseFloat(footerStyle.paddingRight);
    const footerCenter = footerRect.left + footerRect.width / 2;
    return {
      alignItems: footerStyle.alignItems,
      borderTopWidth: footerStyle.borderTopWidth,
      direction: footerStyle.flexDirection,
      expectedActionWidth: contentWidth / 2,
      actions: actions.map((action) => {
        const rect = action.getBoundingClientRect();
        return {
          width: rect.width,
          centerOffset: rect.left + rect.width / 2 - footerCenter,
        };
      }),
    };
  }, {
    footer: DETAILS_FOOTER,
    actions: `${DETAILS_SWATCH_TOGGLE}, ${DETAILS_APPLY}`,
  });

  expect(layout.direction).toBe('column');
  expect(layout.alignItems).toBe('center');
  expect(layout.borderTopWidth).toBe('0px');
  for (const action of layout.actions) {
    expect(action.width).toBeCloseTo(layout.expectedActionWidth, 0);
    expect(Math.abs(action.centerOffset)).toBeLessThan(1);
  }
}

async function expectModalCopyCentered(surface: Locator): Promise<void> {
  await expect(surface.locator('.ov25-selection-details-copy')).toHaveCSS(
    'text-align',
    'center',
  );
}

test.beforeEach(async ({ page }) => {
  await resetFixtureState(page);
});

test.describe('selection detail interactions', () => {
  test.use({ viewport: DESKTOP });

  test('opening a card does not apply it; Apply applies once and closes', async ({
    page,
  }) => {
    await page.goto(
      fixtureUrl(PRODUCT_FIXTURES.modal, {
        configuratorMode: 'inline',
        variantStyle: 'list',
      }),
    );

    const trigger = await getUnselectedTrigger(page);
    const title = await trigger.getAttribute('title');
    expect(title).toBeTruthy();
    await expect(trigger).toHaveAttribute('data-selected', 'false');
    await trigger.click();

    const surface = page.locator(`${DETAILS_SURFACE}:visible`);
    await expect(surface).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(trigger).toHaveAttribute('data-selected', 'false');

    const apply = surface.locator(DETAILS_APPLY);
    await expect(apply).toHaveText('Apply to Model');
    await apply.click();
    await expectDetailsClosed(page);

    const appliedTrigger = page.getByTitle(title!, { exact: true }).filter({ visible: true });
    await appliedTrigger.click();

    const appliedButton = page
      .locator(`${DETAILS_SURFACE}:visible`)
      .locator(DETAILS_APPLY);
    await expect(appliedButton).toBeDisabled();
    await expect(appliedButton).toHaveText('Applied');
  });

  test('swatchbook toggle changes state without applying or closing', async ({ page }) => {
    await page.goto(
      fixtureUrl(PRODUCT_FIXTURES.modal, {
        configuratorMode: 'inline',
        variantStyle: 'list',
      }),
    );
    const swatchTrigger = await getSwatchEligibleTrigger(page);
    const { surface, trigger } = await openDetails(
      page,
      'modal',
      'click',
      swatchTrigger,
    );
    await expect(trigger).toHaveAttribute('data-selected', 'false');

    const swatchToggle = surface.locator(DETAILS_SWATCH_TOGGLE);
    await expect(swatchToggle).toHaveText('Add to swatchbook', {
      timeout: RUNTIME_TIMEOUT,
    });
    await swatchToggle.click();
    await expect(surface).toBeVisible();
    await expect(trigger).toHaveAttribute('data-selected', 'false');
    await expect(swatchToggle).toHaveText('Remove from swatchbook');
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('ov25-selected-swatches')))
      .not.toBe('[]');

    await swatchToggle.click();
    await expect(surface).toBeVisible();
    await expect(swatchToggle).toHaveText('Add to swatchbook');
  });

  test('toast opens the swatchbook above the selection-details sheet', async ({ page }) => {
    await page.goto(
      fixtureUrl(PRODUCT_FIXTURES.tooltip, {
        desktopDetails: 'sheet',
        configuratorMode: 'inline',
        variantStyle: 'list',
      }),
    );
    const swatchTrigger = await getSwatchEligibleTrigger(page);
    const { surface } = await openDetails(page, 'sheet', 'click', swatchTrigger);
    const swatchToggle = surface.locator(DETAILS_SWATCH_TOGGLE);
    await expect(swatchToggle).toHaveText('Add to swatchbook', {
      timeout: RUNTIME_TIMEOUT,
    });

    await swatchToggle.click();
    await page.getByRole('button', { name: 'Open Swatchbook', exact: true }).click();

    const swatchbook = page.locator('#ov25-swatchbook');
    await expect(swatchbook).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(surface).toBeVisible();
    await expect(surface).toHaveAttribute('aria-hidden', 'true');
    await expect(surface).toHaveAttribute('inert');
    await expect
      .poll(() => page.evaluate(() => {
        const swatchbookHost = document.getElementById('ov25-swatchbook-portal-container');
        const detailsHost = Array.from(document.body.children).find((element) =>
          element.id.startsWith('ov25-selection-details-portal-container'));
        const toasterHosts = Array.from(document.body.children).filter((element) =>
          element.id === 'ov25-toaster-container');
        const swatchbook = swatchbookHost?.shadowRoot?.querySelector('#ov25-swatchbook');
        if (!swatchbook || !swatchbookHost || !detailsHost) return false;
        const rect = swatchbook.getBoundingClientRect();
        const topHost = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + 20,
        );
        return (
          Number(getComputedStyle(swatchbookHost).zIndex) >
            Number(getComputedStyle(detailsHost).zIndex) &&
          toasterHosts.every((toasterHost) =>
            Number(getComputedStyle(toasterHost).zIndex) >
              Number(getComputedStyle(swatchbookHost).zIndex)) &&
          topHost === swatchbookHost
        );
      }))
      .toBe(true);

    await page.getByRole('button', { name: 'Close Swatch Book', exact: true }).click();
    await expect(swatchbook).toBeHidden({ timeout: RUNTIME_TIMEOUT });
    await expect(surface).not.toHaveAttribute('aria-hidden', 'true');
    await expect(surface).not.toHaveAttribute('inert');
    await expect(surface).toHaveCSS('pointer-events', 'auto');
    await expect
      .poll(() => page.evaluate(() => {
        const swatchbookHost = document.getElementById('ov25-swatchbook-portal-container');
        const detailsHost = Array.from(document.body.children).find((element) =>
          element.id.startsWith('ov25-selection-details-portal-container'));
        if (!swatchbookHost || !detailsHost) return false;
        return (
          Number(getComputedStyle(swatchbookHost).zIndex) >
            Number(getComputedStyle(detailsHost).zIndex) &&
          swatchbookHost.style.getPropertyPriority('z-index') !== 'important'
        );
      }))
      .toBe(true);
  });

  test('none preserves direct selection and the legacy swatch overlay', async ({ page }) => {
    await page.goto(
      fixtureUrl(PRODUCT_FIXTURES.tooltip, {
        desktopDetails: 'none',
        mobileDetails: 'none',
        configuratorMode: 'inline',
        variantStyle: 'list',
      }),
    );
    const trigger = await getSwatchEligibleTrigger(page);
    const title = await trigger.getAttribute('title');
    await trigger.click();
    await expectDetailsClosed(page);

    const selected = page.getByTitle(title!, { exact: true }).filter({ visible: true });
    await expect(selected).toHaveAttribute('data-selected', 'true', {
      timeout: RUNTIME_TIMEOUT,
    });
    await expect(selected.locator('#ov25-variant-swatch-icon-container')).toBeVisible();
  });

test('desktop tooltip previews after its CSS hover delay and applies directly from its card', async ({
  page,
}) => {
    await page.goto(
      fixtureUrl(PRODUCT_FIXTURES.tooltip, {
        configuratorMode: 'inline',
        variantStyle: 'list',
      }),
    );

    const trigger = await getSwatchEligibleTrigger(page);
    const title = await trigger.getAttribute('title');
    await trigger.evaluate((element) => {
      element.style.setProperty('--ov25-selection-details-tooltip-hover-delay', '120ms');
    });
    await trigger.hover();
    await page.waitForTimeout(40);
    await expectDetailsClosed(page);
    await page.mouse.move(1, 1);
    await page.waitForTimeout(140);
    await expectDetailsClosed(page);

    await trigger.hover();
    const surface = page.locator(`${DETAILS_SURFACE}:visible`);
    await expect(surface).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(surface).toHaveAttribute('data-pinned', 'false');
    await expect(surface).toHaveCSS('pointer-events', 'none');
    await expect(surface.locator(DETAILS_CLOSE)).toHaveCount(0);
    await expect(surface.locator(DETAILS_FOOTER)).toHaveCount(0);
    await expect(surface.locator(DETAILS_APPLY)).toHaveCount(0);
    await expect(surface.locator(DETAILS_SWATCH_TOGGLE)).toHaveCount(0);
    await expect.poll(async () => {
      const [triggerBox, surfaceBox] = await Promise.all([
        trigger.boundingBox(),
        surface.boundingBox(),
      ]);
      if (!triggerBox || !surfaceBox) return false;
      return surfaceBox.x + surfaceBox.width <= triggerBox.x;
    }).toBe(true);
    await trigger.click();
    const selected = page.getByTitle(title!, { exact: true }).filter({ visible: true });
    await expect(selected).toHaveAttribute('data-selected', 'true', {
      timeout: RUNTIME_TIMEOUT,
    });
    await expect(selected.locator('#ov25-variant-swatch-icon-container')).toBeVisible();
    await expectDetailsClosed(page);

    const keyboardTrigger = await getUnselectedTrigger(page);
    await keyboardTrigger.evaluate((element) => (element as HTMLElement).blur());
    await keyboardTrigger.focus();
    await expect(page.locator(`${DETAILS_SURFACE}:visible`)).toHaveAttribute('data-pinned', 'false');
    await keyboardTrigger.press('Enter');
    await expectDetailsClosed(page);
  });

  test('tooltip closes when its anchor is removed', async ({ page }) => {
    await page.goto(
      fixtureUrl(PRODUCT_FIXTURES.tooltip, {
        configuratorMode: 'inline',
        variantStyle: 'list',
      }),
    );
    const { trigger } = await openDetails(page, 'tooltip', 'click');
    await trigger.evaluate((element) => element.remove());
    await expectDetailsClosed(page);
  });

  for (const scenario of [
    { mode: 'sheet' as const, fixture: PRODUCT_FIXTURES.tooltip, params: { desktopDetails: 'sheet' } },
    { mode: 'fullscreen' as const, fixture: PRODUCT_FIXTURES.fullscreen, params: {} },
  ]) {
    test(`${scenario.mode} traps focus, locks scroll, and restores focus`, async ({ page }) => {
      await page.goto(
        fixtureUrl(scenario.fixture, {
          configuratorMode: 'inline',
          variantStyle: 'list',
          ...scenario.params,
        }),
      );
      const { surface, trigger } = await openDetails(page, scenario.mode, 'keyboard');
      await expectPageScrollLocked(page);
      await page.keyboard.press('Tab');
      await expect
        .poll(() =>
          surface.evaluate((element) => {
            const root = element.getRootNode();
            const active = root instanceof ShadowRoot ? root.activeElement : document.activeElement;
            return !!active && element.contains(active);
          }),
        )
        .toBe(true);
      await page.keyboard.press('Escape');
      await expectDetailsClosed(page);
      await expect(trigger).toBeFocused();
    });
  }

  test('sheet preserves visible overflow on a scrolled inline-sticky client page and restores inline page styles', async ({
    page,
  }) => {
    const shellSelector = '.fixture-product-grid';
    const sentinelSelector = '[data-selection-details-scroll-sentinel]';
    await page.goto(
      fixtureUrl('/tests/inline-sticky-desktop-no-header.html', {
        desktopDetails: 'sheet',
        mobileDetails: 'fullscreen',
      }),
    );
    const trigger = await getUnselectedTrigger(page);

    await page.evaluate(() => {
      document.body.style.setProperty('overflow-x', 'hidden', 'important');
      document.body.style.setProperty('margin', '8px 11px 7px 5px', 'important');
      document.body.style.setProperty('box-sizing', 'content-box', 'important');
      document.body.style.setProperty('position', 'relative', 'important');
      document.documentElement.style.setProperty('scrollbar-gutter', 'auto', 'important');
    });
    await expect(page.locator('#ov-25-configurator-gallery-container')).toBeVisible({
      timeout: RUNTIME_TIMEOUT,
    });
    await expect(
      page.locator('[data-ov25-inline-sticky-active="true"]'),
    ).toBeVisible({ timeout: RUNTIME_TIMEOUT });

    const sentinel = page.locator(sentinelSelector);
    await expect(sentinel).toBeAttached();
    const overflowGeometry = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (!element) throw new Error('Selection details scroll sentinel not found');
      const bodyRect = document.body.getBoundingClientRect();
      const sentinelRect = element.getBoundingClientRect();
      return {
        bodyHeight: bodyRect.height,
        bodyScrollHeight: document.body.scrollHeight,
        sentinelDocumentTop: sentinelRect.top + window.scrollY,
        viewportHeight: window.innerHeight,
      };
    }, sentinelSelector);
    expect(overflowGeometry.bodyScrollHeight).toBeGreaterThan(
      overflowGeometry.bodyHeight,
    );
    expect(overflowGeometry.sentinelDocumentTop).toBeGreaterThan(
      overflowGeometry.viewportHeight,
    );

    await sentinel.evaluate((element) => {
      const documentTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(1, documentTop - window.innerHeight * 0.6));
    });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    const sentinelBeforeOpen = await intersectionSnapshot(sentinel);
    expect(sentinelBeforeOpen.isIntersecting).toBe(true);
    expect(sentinelBeforeOpen.visibleArea).toBeGreaterThan(0);

    const layoutBeforeOpen = await selectionDetailsPageLayoutSnapshot(
      page,
      shellSelector,
    );
    const inlineStylesBeforeOpen = await inlineStyleSnapshot(page);
    expect(layoutBeforeOpen.scrollY).toBeGreaterThan(0);

    const openAndClose = async () => {
      await trigger.evaluate((element) => (element as HTMLElement).click());
      const surface = page.locator(`${DETAILS_SURFACE}:visible`);
      await expect(surface).toBeVisible({ timeout: RUNTIME_TIMEOUT });
      await expect(surface).toHaveAttribute('data-display-mode', 'sheet');
      await expectPageScrollLocked(page);
      await page.waitForTimeout(350);
      await expect
        .poll(
          async () => {
            const [layout, sheetGeometry, sentinelIntersection] = await Promise.all([
              selectionDetailsPageLayoutSnapshot(page, shellSelector),
              surface.evaluate((element) => {
                const rect = element.getBoundingClientRect();
                return {
                  rootGutterRemoved:
                    document.documentElement.clientWidth === window.innerWidth,
                  bodyStayedInFlow:
                    getComputedStyle(document.body).position === 'relative',
                  reachesViewportRight:
                    Math.abs(rect.right - window.innerWidth) <= 1,
                };
              }),
              intersectionSnapshot(sentinel),
            ]);
            return {
              visualLayoutStable: visualPageLayoutIsStable(
                layout,
                layoutBeforeOpen,
              ),
              sentinelIntersectionStable: intersectionIsStable(
                sentinelIntersection,
                sentinelBeforeOpen,
              ),
              sentinelVisibleArea: sentinelIntersection.visibleArea > 0,
              ...sheetGeometry,
            };
          },
          { timeout: RUNTIME_TIMEOUT },
        )
        .toEqual({
          visualLayoutStable: true,
          sentinelIntersectionStable: true,
          sentinelVisibleArea: true,
          rootGutterRemoved: true,
          bodyStayedInFlow: true,
          reachesViewportRight: true,
        });

      const lockedScrollPosition = await page.evaluate(() => ({
        x: window.scrollX,
        y: window.scrollY,
      }));
      await page.mouse.move(20, Math.round(DESKTOP.height / 2));
      await page.mouse.wheel(0, 700);
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(100);
      expect(
        await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY })),
      ).toEqual(lockedScrollPosition);

      const intersectionAfterInput = await intersectionSnapshot(sentinel);
      expect(
        intersectionIsStable(intersectionAfterInput, sentinelBeforeOpen),
      ).toBe(true);

      await surface.locator(DETAILS_CLOSE).click();
      await expectDetailsClosed(page);
      await expect
        .poll(() => inlineStyleSnapshot(page), { timeout: RUNTIME_TIMEOUT })
        .toEqual(inlineStylesBeforeOpen);
      await expect
        .poll(
          async () => {
            const layout = await selectionDetailsPageLayoutSnapshot(
              page,
              shellSelector,
            );
            return {
              scrollX: layout.scrollX,
              scrollY: layout.scrollY,
              visualLayoutRestored: visualPageLayoutIsStable(
                layout,
                layoutBeforeOpen,
              ),
            };
          },
          { timeout: RUNTIME_TIMEOUT },
        )
        .toEqual({
          scrollX: layoutBeforeOpen.scrollX,
          scrollY: layoutBeforeOpen.scrollY,
          visualLayoutRestored: true,
        });
      const sentinelAfterClose = await intersectionSnapshot(sentinel);
      expect(intersectionIsStable(sentinelAfterClose, sentinelBeforeOpen)).toBe(
        true,
      );
    };

    await openAndClose();
    await openAndClose();
  });

  test('breakpoint changes close details even when both modes resolve to fullscreen', async ({ page }) => {
    await page.goto(
      fixtureUrl(PRODUCT_FIXTURES.fullscreen, {
        configuratorMode: 'inline',
        variantStyle: 'list',
      }),
    );
    await openDetails(page, 'fullscreen', 'click');
    await page.setViewportSize(MOBILE);
    await expectDetailsClosed(page);
    const { surface } = await openDetails(page, 'fullscreen');
    await expect(surface).toHaveAttribute('data-display-mode', 'fullscreen');
  });

  test('modal traps focus, locks scroll, closes with Escape, and restores focus', async ({
    page,
  }) => {
    await page.goto(
      fixtureUrl(PRODUCT_FIXTURES.modal, {
        configuratorMode: 'inline',
        variantStyle: 'list',
      }),
    );
    const { surface, trigger } = await openDetails(page, 'modal', 'keyboard');
    const imageTopGap = await surface.evaluate((element, imageFrameSelector) => {
      const frame = element.querySelector<HTMLElement>(imageFrameSelector);
      if (!frame) throw new Error('Selection details image frame not found');
      return frame.getBoundingClientRect().top - element.getBoundingClientRect().top;
    }, DETAILS_IMAGE_FRAME);
    expect(imageTopGap).toBeGreaterThanOrEqual(16);
    await expectPageScrollLocked(page);

    await page.keyboard.press('Tab');
    await expect
      .poll(() =>
        surface.evaluate((element) => {
          const root = element.getRootNode();
          const active = root instanceof ShadowRoot ? root.activeElement : document.activeElement;
          return !!active && element.contains(active);
        }),
      )
      .toBe(true);

    await page.keyboard.press('Escape');
    await expectDetailsClosed(page);
    await expect(trigger).toBeFocused();
  });

  test('close button dismisses without applying', async ({ page }) => {
    await page.goto(
      fixtureUrl(PRODUCT_FIXTURES.fullscreen, {
        configuratorMode: 'inline',
        variantStyle: 'list',
      }),
    );
    const { surface, trigger } = await openDetails(page, 'fullscreen');
    await surface.locator(DETAILS_CLOSE).click();
    await expectDetailsClosed(page);
    await expect(trigger).toHaveAttribute('data-selected', 'false');
  });

  test('modal backdrop dismisses without applying', async ({ page }) => {
    await page.goto(
      fixtureUrl(PRODUCT_FIXTURES.modal, {
        configuratorMode: 'inline',
        variantStyle: 'list',
      }),
    );
    const { trigger } = await openDetails(page, 'modal');
    const backdrop = page.locator(
      '.ov25-selection-details-backdrop:visible',
    );
    await expect(backdrop).toBeVisible();
    await backdrop.click({ position: { x: 2, y: 2 } });
    await expectDetailsClosed(page);
    await expect(trigger).toHaveAttribute('data-selected', 'false');
  });
});

test.describe('selection detail layout coverage', () => {
  test.use({ viewport: DESKTOP });

  for (const variantStyle of ['tree', 'list', 'tabs', 'accordion', 'wizard']) {
    test(`${variantStyle} cards open the shared detail surface`, async ({ page }) => {
      await page.goto(
        fixtureUrl(PRODUCT_FIXTURES.modal, {
          configuratorMode: 'inline',
          variantStyle,
        }),
      );
      const { surface } = await openDetails(page, 'modal');
      await expect(surface.locator(DETAILS_IMAGE)).toBeVisible();
    });
  }

  const integrationFixtures = [
    {
      name: 'range',
      path: '/tests/range-with-groups.html',
    },
    {
      name: 'bed',
      path: '/tests/bed-configurator.html',
    },
    {
      name: 'Snap2 finish',
      path: '/tests/snap2-dialog.html',
    },
  ] as const;

  for (const fixture of integrationFixtures) {
    // The bed fixture is disabled until its release-test timeout is resolved.
    const integrationTest = fixture.name === 'bed' ? test.skip : test;
    integrationTest(
      `${fixture.name} selections use the shared detail surface`,
      async ({ page }) => {
        await page.goto(
          fixtureUrl(fixture.path, {
            desktopDetails: 'modal',
            mobileDetails: 'fullscreen',
          }),
        );
        const { surface } = await openDetails(page, 'modal');
        await expect(surface.locator(DETAILS_IMAGE)).toBeVisible();
      },
    );
  }

  test('multiple configurators keep independent detail portals', async ({ page }) => {
    await page.goto(
      fixtureUrl('/tests/multiple-standard-configurators-inline-variants.html', {
        desktopDetails: 'modal',
        mobileDetails: 'fullscreen',
      }),
    );

    const firstHost = page.locator('#variants-1');
    const secondHost = page.locator('#variants-2');
    for (const host of [firstHost, secondHost]) {
      const header = host.locator('button.ov25-option-header:visible').first();
      await expect(header).toBeVisible({ timeout: RUNTIME_TIMEOUT });
      await header.click();
      await expect(host.locator(`${DETAILS_TRIGGER}:visible`).first()).toBeVisible({
        timeout: RUNTIME_TIMEOUT,
      });
    }

    const firstPortal = page.locator('#ov25-selection-details-portal-container-config-0');
    const secondPortal = page.locator('#ov25-selection-details-portal-container-config-1');
    await expect(firstPortal).toHaveCount(1);
    await expect(secondPortal).toHaveCount(1);

    await firstHost.locator(`${DETAILS_TRIGGER}:visible`).first().click();
    await expect(firstPortal.locator(`${DETAILS_SURFACE}:visible`)).toBeVisible();
    await secondHost.locator(`${DETAILS_TRIGGER}:visible`).first().evaluate((element) => {
      (element as HTMLButtonElement).click();
    });
    await expect(secondPortal.locator(`${DETAILS_SURFACE}:visible`)).toBeVisible();
    await expect(firstPortal.locator(`${DETAILS_SURFACE}:visible`)).toBeVisible();

    await secondPortal.locator(DETAILS_CLOSE).click();
    await expect(secondPortal.locator(`${DETAILS_SURFACE}:visible`)).toHaveCount(0);
    await expect(firstPortal.locator(`${DETAILS_SURFACE}:visible`)).toBeVisible();
  });
});

test.describe('selection detail screenshots', () => {
  const desktopScreenshots: Array<{
    mode: DetailMode;
    fixture: string;
    params?: Record<string, string>;
  }> = [
    { mode: 'tooltip', fixture: PRODUCT_FIXTURES.tooltip },
    {
      mode: 'sheet',
      fixture: PRODUCT_FIXTURES.tooltip,
      params: { desktopDetails: 'sheet' },
    },
    { mode: 'modal', fixture: PRODUCT_FIXTURES.modal },
    { mode: 'fullscreen', fixture: PRODUCT_FIXTURES.fullscreen },
  ];

  for (const scenario of desktopScreenshots) {
    test(`desktop ${scenario.mode}`, async ({ page }) => {
      await page.setViewportSize(DESKTOP);
      await page.goto(
        fixtureUrl(scenario.fixture, {
          configuratorMode: 'inline',
          variantStyle: 'list',
          ...scenario.params,
        }),
      );
      const { surface } = await openDetails(
        page,
        scenario.mode,
        'click',
      );
      if (scenario.mode === 'fullscreen') {
        await waitForSurfaceAssets(surface);
        await expectFullscreenLayout(surface, 'desktop-split');
      } else {
        await expectSquareImageCrop(surface);
      }
      if (scenario.mode === 'modal') {
        await expectModalCopyCentered(surface);
        await expectDesktopModalActionsCentered(surface);
      }
      await screenshotSurface(surface, `selection-details-desktop-${scenario.mode}.png`);
    });
  }

  const mobileScreenshots: Array<{ mode: DetailMode; fixture: string }> = [
    { mode: 'modal', fixture: PRODUCT_FIXTURES.modal },
    { mode: 'fullscreen', fixture: PRODUCT_FIXTURES.fullscreen },
  ];

  for (const scenario of mobileScreenshots) {
    test(`mobile ${scenario.mode}`, async ({ page }) => {
      await page.setViewportSize(MOBILE);
      await page.goto(
        fixtureUrl(scenario.fixture, {
          viewport: 'mobile',
          configuratorMode: 'inline',
          variantStyle: 'list',
        }),
      );
      const { surface } = await openDetails(page, scenario.mode);
      if (scenario.mode === 'fullscreen') {
        await waitForSurfaceAssets(surface);
        await expectFullscreenLayout(surface, 'mobile-stack');
      } else {
        await expectSquareImageCrop(surface);
        await expectModalCopyCentered(surface);
      }
      await screenshotSurface(surface, `selection-details-mobile-${scenario.mode}.png`);
    });
  }

  test('swatch action before and after adding', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(
      fixtureUrl(PRODUCT_FIXTURES.modal, {
        configuratorMode: 'inline',
        variantStyle: 'list',
      }),
    );
    const swatchTrigger = await getSwatchEligibleTrigger(page);
    const { surface } = await openDetails(page, 'modal', 'click', swatchTrigger);
    await expectSquareImageCrop(surface);
    await expectModalCopyCentered(surface);
    const swatchToggle = surface.locator(DETAILS_SWATCH_TOGGLE);
    await expect(swatchToggle).toHaveText('Add to swatchbook', {
      timeout: RUNTIME_TIMEOUT,
    });
    await screenshotSurface(surface, 'selection-details-swatch-add.png');

    await swatchToggle.click();
    await expect(swatchToggle).toHaveText('Remove from swatchbook');
    const addedToast = page.getByText('Swatch added', { exact: true }).first();
    await expect(addedToast).toBeVisible({ timeout: RUNTIME_TIMEOUT });
    await expect(addedToast).toBeHidden({ timeout: 7000 });
    await screenshotSurface(surface, 'selection-details-swatch-remove.png');
  });

  test.skip('bed selection-only fallback', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(
      fixtureUrl('/tests/bed-configurator.html', {
        desktopDetails: 'modal',
        mobileDetails: 'fullscreen',
      }),
    );
    const { surface } = await openDetails(page, 'modal');
    await expectSquareImageCrop(surface);
    await expectModalCopyCentered(surface);
    await expect(surface.locator(DETAILS_SWATCH_TOGGLE)).toHaveCount(0);
    await screenshotSurface(surface, 'selection-details-bed-fallback.png');
  });
});
