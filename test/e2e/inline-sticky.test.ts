import { expect, test, type Locator, type Page } from '@playwright/test';

const DESKTOP_VIEWPORT = { width: 1280, height: 900 };
const IPAD_LANDSCAPE_VIEWPORT = { width: 1180, height: 820 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const STICKY_GAP = 16;
const RUNTIME_TIMEOUT = 20000;
const STICKY_HOST_LIFECYCLE_STYLE_PROPERTIES: readonly string[] = [
  'position',
  'top',
  'align-self',
  'display',
  'flex-direction',
  'width',
  'min-height',
  'max-height',
  'height',
  'overflow',
  'overflow-x',
  'overflow-y',
  'box-sizing',
  'z-index',
  'max-width',
  'margin-inline',
];
const RESPONSIVE_SCENARIOS = [
  {
    label: 'no header',
    path: '/tests/inline-sticky-desktop-no-header.html',
    key: 'desktop-no-header',
    headerSelector: null,
  },
  {
    label: 'fixed header',
    path: '/tests/inline-sticky-desktop-fixed-header.html',
    key: 'desktop-fixed-header',
    headerSelector: '.fixture-fixed-header',
  },
  {
    label: 'collapsing header',
    path: '/tests/inline-sticky-desktop-collapsing-header.html',
    key: 'desktop-collapsing-header',
    headerSelector: '.fixture-collapsing-header',
  },
] as const;
const RESPONSIVE_FIXTURE_PATH = RESPONSIVE_SCENARIOS[0].path;

async function waitForStickyGallery(page: Page): Promise<Locator> {
  const host = page.locator('#ov25-sticky-gallery.ov25-inline-sticky-gallery-host');

  await expect(host).toHaveAttribute('data-ov25-inline-sticky-active', 'true', {
    timeout: RUNTIME_TIMEOUT,
  });
  await expect(page.locator('#ov25-configurator-iframe')).toHaveCount(1, {
    timeout: RUNTIME_TIMEOUT,
  });

  return host;
}

async function expectDesktopStickyLayout(
  host: Locator,
  header: Locator | null,
  expectedHeaderOffset: number,
  expectedPosition: 'sticky' | 'fixed' = 'sticky',
  expectedSizingHeaderOffset = expectedHeaderOffset,
): Promise<void> {
  const expectedAvailableHeight =
    DESKTOP_VIEWPORT.height - expectedSizingHeaderOffset - STICKY_GAP * 2;

  await expect
    .poll(
      async () => {
        const metrics = await host.evaluate((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          const pixels = (value: string) => Math.round(Number.parseFloat(value));

          return {
            position: style.position,
            headerOffset: pixels(style.getPropertyValue('--ov25-sticky-header-offset')),
            sizingHeaderOffset: pixels(
              style.getPropertyValue('--ov25-sticky-sizing-header-offset'),
            ),
            top: pixels(style.top),
            maxHeight: pixels(style.maxHeight),
            height: Math.round(rect.height),
          };
        });
        const headerBottom = header
          ? await header.evaluate((element) =>
              Math.round(Math.max(0, element.getBoundingClientRect().bottom)),
            )
          : 0;

        return {
          position: metrics.position,
          headerOffset: metrics.headerOffset,
          sizingHeaderOffset: metrics.sizingHeaderOffset,
          top: metrics.top,
          maxHeight: metrics.maxHeight,
          heightWithinCap:
            metrics.height > 1 && metrics.height <= expectedAvailableHeight + 1,
          headerBottom,
        };
      },
      { timeout: 10000 },
    )
    .toEqual({
      position: expectedPosition,
      headerOffset: expectedHeaderOffset,
      sizingHeaderOffset: expectedSizingHeaderOffset,
      top: expectedHeaderOffset + STICKY_GAP,
      maxHeight: expectedAvailableHeight,
      heightWithinCap: true,
      headerBottom: expectedHeaderOffset,
    });

  await expect
    .poll(
      async () => {
        const root = host.locator('.ov25-inline-sticky-gallery-root-desktop');
        const content = host.locator('.ov25-inline-sticky-gallery-content');
        const iframeSlot = host.locator('.ov25-inline-sticky-iframe-slot');
        const embeddedCarousel = host.locator('.ov25-inline-sticky-carousel-host');
        const embeddedCarouselCount = await embeddedCarousel.count();
        const [hostContentHeight, rootBox, contentBox, iframeSlotBox, galleryGap] = await Promise.all([
          host.evaluate((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            const borderTop = Number.parseFloat(style.borderTopWidth) || 0;
            const borderBottom = Number.parseFloat(style.borderBottomWidth) || 0;
            return rect.height - borderTop - borderBottom;
          }),
          root.boundingBox(),
          content.boundingBox(),
          iframeSlot.boundingBox(),
          content.evaluate((element) => Number.parseFloat(getComputedStyle(element).rowGap) || 0),
        ]);
        const carouselBox = embeddedCarouselCount > 0
          ? await embeddedCarousel.boundingBox()
          : null;

        if (!rootBox || !contentBox || !iframeSlotBox) return null;
        const naturalChildrenHeight =
          iframeSlotBox.height + (carouselBox ? galleryGap + carouselBox.height : 0);

        return {
          rootFillsHost: Math.abs(rootBox.height - hostContentHeight) <= 1,
          contentFillsRoot: Math.abs(contentBox.height - rootBox.height) <= 1,
          contentWithinCap: contentBox.height <= expectedAvailableHeight + 1,
          iframeSlotIsVisible: iframeSlotBox.height > 1,
          contentFitsNaturalChildren:
            Math.abs(naturalChildrenHeight - contentBox.height) <= 1,
        };
      },
      { timeout: 10000 },
    )
    .toEqual({
      rootFillsHost: true,
      contentFillsRoot: true,
      contentWithinCap: true,
      iframeSlotIsVisible: true,
      contentFitsNaturalChildren: true,
    });
}

async function expectPinnedTop(host: Locator, expectedTop: number): Promise<void> {
  await expect
    .poll(
      () =>
        host.evaluate((element) => Math.round(element.getBoundingClientRect().top)),
      { timeout: 10000 },
    )
    .toBe(expectedTop);
}

async function expectMobileStickyViewportLayout(
  page: Page,
  host: Locator,
  header: Locator | null,
  options: { pinned?: boolean; expectedHeaderOffset?: number } = {},
): Promise<void> {
  const { pinned = false, expectedHeaderOffset } = options;
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

  await expect
    .poll(
      async () => {
        const metrics = await host.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          const pixels = (value: string) => Math.round(Number.parseFloat(value));
          const edgePixels = (prefix: 'border' | 'padding', suffix = '') =>
            ['Top', 'Right', 'Bottom', 'Left'].map((side) =>
              Number.parseFloat(
                style.getPropertyValue(
                  `${prefix}-${side.toLowerCase()}${suffix}`,
                ),
              ),
            );
          const galleryRoot = element.querySelector<HTMLElement>(
            '#ov-25-configurator-gallery-container',
          );
          const galleryRect = galleryRoot?.getBoundingClientRect() ?? null;
          const edgesAlign = galleryRect
            ? [
                Math.abs(galleryRect.top - rect.top),
                Math.abs(galleryRect.right - rect.right),
                Math.abs(galleryRect.bottom - rect.bottom),
                Math.abs(galleryRect.left - rect.left),
              ].every((difference) => difference <= 1)
            : false;
          return {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            top: Math.round(rect.top),
            clientWidth: document.documentElement.clientWidth,
            resolvedTopGap: pixels(
              style.getPropertyValue('--ov25-sticky-resolved-top-gap'),
            ),
            resolvedBottomGap: pixels(
              style.getPropertyValue('--ov25-sticky-resolved-bottom-gap'),
            ),
            headerOffset: pixels(
              style.getPropertyValue('--ov25-sticky-header-offset'),
            ),
            borderEdgesAreZero: edgePixels('border', '-width').every(
              (value) => value === 0,
            ),
            paddingEdgesAreZero: edgePixels('padding').every(
              (value) => value === 0,
            ),
            galleryEdgesAlign: edgesAlign,
          };
        });
        const layout = {
          left: metrics.left,
          right: metrics.right,
          width: metrics.width,
          clientWidth: metrics.clientWidth,
          resolvedTopGap: metrics.resolvedTopGap,
          resolvedBottomGap: metrics.resolvedBottomGap,
          borderEdgesAreZero: metrics.borderEdgesAreZero,
          paddingEdgesAreZero: metrics.paddingEdgesAreZero,
          galleryEdgesAlign: metrics.galleryEdgesAlign,
        };
        const headerBottom = header
          ? await header.evaluate((element) =>
              Math.round(Math.max(0, element.getBoundingClientRect().bottom)),
            )
          : 0;
        return {
          ...layout,
          headerOffsetMatches:
            Math.abs(metrics.headerOffset - headerBottom) <= 1,
          ...(expectedHeaderOffset == null
            ? {}
            : {
                headerBottom,
                runtimeHeaderOffset: metrics.headerOffset,
              }),
          ...(pinned
            ? { pinnedToHeader: Math.abs(metrics.top - headerBottom) <= 1 }
            : {}),
        };
      },
      { timeout: 10000 },
    )
    .toEqual({
      left: 0,
      right: clientWidth,
      width: clientWidth,
      clientWidth,
      resolvedTopGap: 0,
      resolvedBottomGap: 0,
      borderEdgesAreZero: true,
      paddingEdgesAreZero: true,
      galleryEdgesAlign: true,
      headerOffsetMatches: true,
      ...(expectedHeaderOffset == null
        ? {}
        : {
            headerBottom: expectedHeaderOffset,
            runtimeHeaderOffset: expectedHeaderOffset,
          }),
      ...(pinned ? { pinnedToHeader: true } : {}),
    });
}

const VIEWER_LAYER_SELECTORS = [
  '#ov25-configurator-iframe-container',
  '#true-ov25-configurator-iframe-container',
  '#ov25-configurator-iframe',
] as const;

async function expectViewerCornerMode(
  page: Page,
  mode: 'square' | 'configured',
): Promise<void> {
  const layers = VIEWER_LAYER_SELECTORS.map((selector) => page.locator(selector));
  for (const layer of layers) {
    await expect(layer).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  }

  await expect
    .poll(
      async () => {
        const layerRadii = await Promise.all(
          layers.map((layer) =>
            layer.evaluate((element) => {
              const style = getComputedStyle(element);
              return [
                style.borderStartStartRadius,
                style.borderStartEndRadius,
                style.borderEndStartRadius,
                style.borderEndEndRadius,
              ].map((value) => Number.parseFloat(value));
            }),
          ),
        );
        const radii = layerRadii.flat();
        return {
          allSquare: radii.every((radius) => Math.abs(radius) <= 0.01),
          sharedConfiguredRadius:
            radii.every((radius) => radius > 0) &&
            radii.every((radius) => Math.abs(radius - radii[0]) <= 0.01),
        };
      },
      { timeout: RUNTIME_TIMEOUT },
    )
    .toEqual(
      mode === 'square'
        ? { allSquare: true, sharedConfiguredRadius: false }
        : { allSquare: false, sharedConfiguredRadius: true },
    );
}

async function expectMobileVariantsUsePageScroll(page: Page): Promise<void> {
  const container = page.locator(
    '[data-ov25-inline-sticky-list-container="true"]',
  );
  const outerWrapper = page.locator(
    '[data-ov25-inline-sticky-list-wrapper="true"]',
  );
  const root = page.locator('.ov25-inline-sticky-list-mobile');
  const contentWrapper = root.locator('#ov25-variants-content-wrapper');
  const content = root.locator('[data-ov25-list-variants-content]');
  const readLayout = (locator: Locator) =>
    locator.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        maxHeight: style.maxHeight,
        overflowY: style.overflowY,
        hasInternalScroll: element.scrollHeight > element.clientHeight + 1,
      };
    });

  await expect(container).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  await expect(outerWrapper).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  await expect(root).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  await expect(contentWrapper).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  await expect(content).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });

  await expect
    .poll(
      async () => {
        const [
          containerLayout,
          outerWrapperLayout,
          rootLayout,
          contentWrapperLayout,
          contentLayout,
          contentHeights,
          documentScrollable,
        ] = await Promise.all([
          readLayout(container),
          readLayout(outerWrapper),
          readLayout(root),
          readLayout(contentWrapper),
          readLayout(content),
          content.evaluate((element) => ({
            clientHeight: element.clientHeight,
            scrollHeight: element.scrollHeight,
          })),
          page.evaluate(
            () => document.documentElement.scrollHeight > document.documentElement.clientHeight,
          ),
        ]);

        return {
          container: containerLayout,
          outerWrapper: outerWrapperLayout,
          root: rootLayout,
          contentWrapper: contentWrapperLayout,
          content: contentLayout,
          contentFitsClient: contentHeights.clientHeight === contentHeights.scrollHeight,
          contentExceedsFormerCap: contentHeights.scrollHeight > 600,
          documentScrollable,
        };
      },
      { timeout: 10000 },
    )
    .toEqual({
      container: { maxHeight: 'none', overflowY: 'visible', hasInternalScroll: false },
      outerWrapper: { maxHeight: 'none', overflowY: 'visible', hasInternalScroll: false },
      root: { maxHeight: 'none', overflowY: 'visible', hasInternalScroll: false },
      contentWrapper: { maxHeight: 'none', overflowY: 'visible', hasInternalScroll: false },
      content: { maxHeight: 'none', overflowY: 'visible', hasInternalScroll: false },
      contentFitsClient: true,
      contentExceedsFormerCap: true,
      documentScrollable: true,
    });
}

async function expectMobileVariantsUseInternalScroll(page: Page): Promise<void> {
  const container = page.locator('#ov25-configurator-variant-menu-container');
  const root = page.locator('[data-ov25-list-variants-mode="inline"]');
  const content = root.locator('[data-ov25-list-variants-content]');

  await expect(container).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  await expect(root).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  await expect(content).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  await expect(page.locator('[data-ov25-inline-sticky-list-container]')).toHaveCount(0);
  await expect(page.locator('[data-ov25-inline-sticky-list-wrapper]')).toHaveCount(0);
  await expect(page.locator('[data-ov25-inline-sticky-list]')).toHaveCount(0);
  await expect(page.locator('.ov25-inline-sticky-list-mobile')).toHaveCount(0);

  await expect
    .poll(
      () =>
        content.evaluate((element) => {
          const style = getComputedStyle(element);
          const maxHeight = Number.parseFloat(style.maxHeight);
          return {
            maxHeight: style.maxHeight,
            overflowY: style.overflowY,
            hasInternalScroll: element.scrollHeight > element.clientHeight,
            boundedByMaxHeight:
              Number.isFinite(maxHeight) && element.clientHeight <= maxHeight,
          };
        }),
      { timeout: 10000 },
    )
    .toEqual({
      maxHeight: '600px',
      overflowY: 'auto',
      hasInternalScroll: true,
      boundedByMaxHeight: true,
    });
}

async function expectMobileHeadersBelowGallery(
  host: Locator,
  optionHeader: Locator,
  groupHeader: Locator,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const [optionMetrics, groupMetrics, galleryBottom] = await Promise.all([
          optionHeader.evaluate((element) => ({
            position: getComputedStyle(element).position,
            top: Math.round(element.getBoundingClientRect().top),
            bottom: Math.round(element.getBoundingClientRect().bottom),
          })),
          groupHeader.evaluate((element) => ({
            position: getComputedStyle(element).position,
            top: Math.round(element.getBoundingClientRect().top),
          })),
          host.evaluate((element) => Math.round(element.getBoundingClientRect().bottom)),
        ]);

        return {
          optionPosition: optionMetrics.position,
          optionAligned: optionMetrics.top === galleryBottom,
          groupPosition: groupMetrics.position,
          groupAligned: groupMetrics.top === optionMetrics.bottom,
        };
      },
      { timeout: 10000 },
    )
    .toEqual({
      optionPosition: 'sticky',
      optionAligned: true,
      groupPosition: 'sticky',
      groupAligned: true,
    });
}

async function expectStickyListHeaderTextAlignment(
  page: Page,
  rootSelector: '.ov25-inline-sticky-list' | '.ov25-inline-sticky-list-mobile',
): Promise<void> {
  const root = page.locator(rootSelector).first();
  const optionHeader = root.locator('.ov25-option-header').first();
  const groupHeader = root.locator('.ov25-group-header').first();
  await expect(optionHeader).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await expect(groupHeader).toBeVisible({ timeout: RUNTIME_TIMEOUT });

  await expect
    .poll(
      () =>
        root.evaluate((element) => {
          const option = element.querySelector<HTMLElement>('.ov25-option-header');
          const group = element.querySelector<HTMLElement>('.ov25-group-header');
          if (!option || !group) return null;

          const textInlineStart = (header: HTMLElement): number | null => {
            const walker = document.createTreeWalker(header, NodeFilter.SHOW_TEXT);
            let node = walker.nextNode();
            while (node && !node.textContent?.trim()) node = walker.nextNode();
            if (!node) return null;
            const range = document.createRange();
            range.selectNodeContents(node);
            const rect = range.getBoundingClientRect();
            return getComputedStyle(header).direction === 'rtl' ? rect.right : rect.left;
          };
          const optionStyle = getComputedStyle(option);
          const groupStyle = getComputedStyle(group);
          const optionTextInlineStart = textInlineStart(option);
          const groupTextInlineStart = textInlineStart(group);
          const optionRect = option.getBoundingClientRect();
          const groupRect = group.getBoundingClientRect();
          const optionBoxInlineStart =
            optionStyle.direction === 'rtl' ? optionRect.right : optionRect.left;
          const groupBoxInlineStart =
            groupStyle.direction === 'rtl' ? groupRect.right : groupRect.left;

          return {
            boxesAligned: Math.abs(optionBoxInlineStart - groupBoxInlineStart) <= 1,
            headersStacked: Math.abs(groupRect.top - optionRect.bottom) <= 1,
            textAligned:
              optionTextInlineStart !== null &&
              groupTextInlineStart !== null &&
              Math.abs(optionTextInlineStart - groupTextInlineStart) <= 1,
            optionPaddingInlineStart: Number.parseFloat(
              optionStyle.direction === 'rtl'
                ? optionStyle.paddingRight
                : optionStyle.paddingLeft,
            ),
            groupPaddingInlineStart: Number.parseFloat(
              groupStyle.direction === 'rtl'
                ? groupStyle.paddingRight
                : groupStyle.paddingLeft,
            ),
            groupPaddingBlockStart: Number.parseFloat(groupStyle.paddingBlockStart),
          };
        }),
      { timeout: 10000 },
    )
    .toEqual({
      boxesAligned: true,
      headersStacked: true,
      textAligned: true,
      optionPaddingInlineStart: 14,
      groupPaddingInlineStart: 14,
      groupPaddingBlockStart: 0,
    });
}

async function expectOptionHeaderGapMask(
  page: Page,
  expectedHeaderOffset: number,
): Promise<void> {
  const optionHeader = page.locator('.ov25-inline-sticky-list .ov25-option-header').first();
  await expect(optionHeader).toBeVisible({ timeout: RUNTIME_TIMEOUT });

  await expect
    .poll(
      () =>
        optionHeader.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          const maskStyle = getComputedStyle(element, '::before');
          const pixels = (value: string) => Math.round(Number.parseFloat(value));

          return {
            optionHeaderTop: Math.round(rect.top),
            content: maskStyle.content,
            position: maskStyle.position,
            height: pixels(maskStyle.height),
            bottomEqualsHeaderHeight:
              pixels(maskStyle.bottom) === Math.round(rect.height),
            backgroundMatchesHeader:
              maskStyle.backgroundColor === style.backgroundColor,
            pointerEvents: maskStyle.pointerEvents,
          };
        }),
      { timeout: 10000 },
    )
    .toEqual({
      optionHeaderTop: expectedHeaderOffset + STICKY_GAP,
      content: '""',
      position: 'absolute',
      height: STICKY_GAP,
      bottomEqualsHeaderHeight: true,
      backgroundMatchesHeader: true,
      pointerEvents: 'none',
    });
}

async function expectInitialFilterControlsUnobscured(page: Page): Promise<void> {
  const listRoot = page.locator('.ov25-inline-sticky-list').first();
  await expect(listRoot.locator('#ov25-filter-controls-wrapper')).toBeVisible({
    timeout: RUNTIME_TIMEOUT,
  });
  await expect(listRoot.locator('.ov25-option-header').first()).toBeVisible({
    timeout: RUNTIME_TIMEOUT,
  });

  await expect
    .poll(() =>
      listRoot.evaluate((element) => {
        const filters = element.querySelector<HTMLElement>(
          '#ov25-filter-controls-wrapper',
        );
        const header = element.querySelector<HTMLElement>('.ov25-option-header');
        if (!filters || !header) return null;

        const filterRect = filters.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        const mask = getComputedStyle(header, '::before');
        const boxesOverlap =
          filterRect.top < headerRect.bottom && filterRect.bottom > headerRect.top;

        return {
          boxesOverlap,
          edgesMeet: Math.abs(filterRect.bottom - headerRect.top) <= 1,
          maskContent: mask.content,
          pinned: header.getAttribute('data-ov25-sticky-pinned'),
        };
      }),
    )
    .toEqual({
      boxesOverlap: false,
      edgesMeet: true,
      maskContent: 'none',
      pinned: null,
    });
}

async function expectNativeStickyGallery(page: Page, host: Locator): Promise<void> {
  await expect(page.locator('[data-ov25-sticky-placeholder]')).toHaveCount(0);
  await expect(page.locator('[data-ov25-sticky-body-layer]')).toHaveCount(0);
  await expect(host).toHaveCSS('position', 'sticky');
  await expect
    .poll(
      () =>
        host.evaluate((element) => {
          return {
            popover: element.getAttribute('popover'),
            popoverOpen: element.matches(':popover-open'),
            inBodyLayer: element.closest('[data-ov25-sticky-body-layer]') !== null,
            hasPlaceholder: document.querySelector('[data-ov25-sticky-placeholder]') !== null,
            position: getComputedStyle(element).position,
          };
        }),
      { timeout: 10000 },
    )
    .toEqual({
      popover: null,
      popoverOpen: false,
      inBodyLayer: false,
      hasPlaceholder: false,
      position: 'sticky',
    });
}

async function waitForFixtureVariantLayout(page: Page): Promise<void> {
  let previousSignature: string | null = null;
  let stableSamples = 0;

  await expect
    .poll(
      async () => {
        const state = await page.locator('#ov25-sticky-controls').evaluate((element) => {
          const grid = document.querySelector<HTMLElement>('.fixture-product-grid');
          const variantsRect = element.getBoundingClientRect();
          const gridRect = grid?.getBoundingClientRect();
          return {
            fontsLoaded: document.fonts.status === 'loaded',
            variantCount:
              element.shadowRoot?.querySelectorAll('.ov25-default-variant-card').length ?? 0,
            variantsHeight: Math.round(variantsRect.height * 100) / 100,
            gridHeight: gridRect ? Math.round(gridRect.height * 100) / 100 : 0,
          };
        });
        if (!state.fontsLoaded || state.variantCount === 0 || state.gridHeight <= 0) {
          previousSignature = null;
          stableSamples = 0;
          return stableSamples;
        }

        const signature = JSON.stringify(state);
        stableSamples = signature === previousSignature ? stableSamples + 1 : 0;
        previousSignature = signature;
        return stableSamples;
      },
      { timeout: RUNTIME_TIMEOUT, intervals: [100, 150, 250, 500] },
    )
    .toBeGreaterThanOrEqual(2);
}

async function expectGalleryColumnStretch(page: Page, host: Locator): Promise<void> {
  await waitForFixtureVariantLayout(page);
  const column = page.locator('.fixture-gallery-column');
  await expect(host).toHaveCount(1);
  await expect(column).toHaveCount(1);
  await expect
    .poll(
      () =>
        column.evaluate((element) => {
          const htmlElement = element as HTMLElement;
          const grid = htmlElement.parentElement;
          const hostElement = document.querySelector('#ov25-sticky-gallery');
          if (!grid) return null;
          return {
            computedAlignSelf: getComputedStyle(htmlElement).alignSelf,
            inlineAlignSelf: htmlElement.style.getPropertyValue('align-self'),
            inlinePriority: htmlElement.style.getPropertyPriority('align-self'),
            fillsGrid:
              Math.abs(
                htmlElement.getBoundingClientRect().height -
                  grid.getBoundingClientRect().height,
              ) <= 1,
            hasStickyTravel: (() => {
              if (!hostElement) return false;
              const hostRect = hostElement.getBoundingClientRect();
              const columnRect = htmlElement.getBoundingClientRect();
              const stickyTop = Number.parseFloat(getComputedStyle(hostElement).top);
              const naturalDocumentTop = hostRect.top + window.scrollY;
              const requiredTravel = Math.max(0, naturalDocumentTop - stickyTop);
              const availableTravel = Math.max(
                0,
                columnRect.bottom + window.scrollY -
                  naturalDocumentTop -
                  hostRect.height,
              );
              return availableTravel + 1 >= requiredTravel;
            })(),
            hostIsDirectChild: hostElement?.parentElement === htmlElement,
          };
        }),
      { timeout: 10000 },
    )
    .toEqual({
      computedAlignSelf: 'stretch',
      inlineAlignSelf: 'stretch',
      inlinePriority: 'important',
      fillsGrid: true,
      hasStickyTravel: true,
      hostIsDirectChild: true,
    });
}

async function readBodyLayerTrackPlan(host: Locator) {
  return host.evaluate((element) => {
    const boundary = document.querySelector<HTMLElement>('.fixture-product-grid');
    if (!boundary) throw new Error('Body-layer fixture boundary is missing');
    const hostRect = element.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    const stickyTop = Number.parseFloat(getComputedStyle(element).top);
    const naturalDocumentTop = hostRect.top + window.scrollY;
    const boundaryDocumentBottom = boundaryRect.bottom + window.scrollY;
    const boundaryEndScrollY =
      boundaryDocumentBottom - hostRect.height - stickyTop;
    return {
      stickyTop,
      hostWidth: hostRect.width,
      hostHeight: hostRect.height,
      naturalDocumentTop,
      boundaryDocumentBottom,
      activationScrollY: naturalDocumentTop - stickyTop,
      boundaryEndScrollY,
      maxScrollY: Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      ),
    };
  });
}

async function waitForBodyLayerTrackPlan(page: Page, host: Locator) {
  await waitForFixtureVariantLayout(page);
  await expect
    .poll(
      async () => {
        const plan = await readBodyLayerTrackPlan(host);
        const firstFixedScrollY = Math.ceil(plan.activationScrollY + 64);
        const lastFixedScrollY = Math.floor(
          Math.min(plan.boundaryEndScrollY - 64, plan.maxScrollY - 128),
        );
        return lastFixedScrollY > firstFixedScrollY + 128;
      },
      { timeout: RUNTIME_TIMEOUT },
    )
    .toBe(true);

  return readBodyLayerTrackPlan(host);
}

async function expectNativeStickyBoundaryExit(
  page: Page,
  host: Locator,
  header: Locator,
): Promise<void> {
  const plan = await host.evaluate((element) => {
    const column = element.parentElement;
    const headerElement = document.querySelector<HTMLElement>('[data-fixture-header]');
    if (!column || !headerElement) return null;
    const hostRect = element.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();
    const headerRect = headerElement.getBoundingClientRect();
    const stickyTop = Number.parseFloat(getComputedStyle(element).top);
    const boundaryExitScrollY =
      columnRect.bottom + window.scrollY - hostRect.height - stickyTop;
    const maxScrollY = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    return {
      start: Math.max(0, Math.floor(boundaryExitScrollY - 64)),
      end: Math.min(
        maxScrollY,
        Math.ceil(boundaryExitScrollY + stickyTop - headerRect.bottom + 32),
      ),
      boundaryExitScrollY,
      maxScrollY,
    };
  });
  expect(plan).not.toBeNull();
  expect(plan!.end).toBeGreaterThan(plan!.boundaryExitScrollY);

  const samples = await page.evaluate(async ({ start, end }) => {
    const settle = () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    const results: Array<{
      top: number;
      stickyTop: number;
      headerBottom: number;
      position: string;
      inlineClipPath: string;
      computedClipPath: string;
      nativeOwnership: boolean;
    }> = [];

    for (let scrollY = start; scrollY <= end; scrollY = Math.min(end, scrollY + 16)) {
      window.scrollTo(0, scrollY);
      await settle();
      const gallery = document.querySelector<HTMLElement>('#ov25-sticky-gallery');
      const fixtureHeader = document.querySelector<HTMLElement>('[data-fixture-header]');
      if (!gallery || !fixtureHeader) break;
      const style = getComputedStyle(gallery);
      results.push({
        top: gallery.getBoundingClientRect().top,
        stickyTop: Number.parseFloat(style.top),
        headerBottom: fixtureHeader.getBoundingClientRect().bottom,
        position: style.position,
        inlineClipPath: gallery.style.clipPath,
        computedClipPath: style.clipPath,
        nativeOwnership:
          gallery.getAttribute('popover') === null &&
          !gallery.matches(':popover-open') &&
          gallery.closest('[data-ov25-sticky-body-layer]') === null &&
          document.querySelector('[data-ov25-sticky-placeholder]') === null,
      });
      if (scrollY === end) break;
    }
    return results;
  }, { start: plan!.start, end: plan!.end });

  expect(samples.length).toBeGreaterThan(4);
  expect(
    samples.every(
      (sample) =>
        sample.position === 'sticky' &&
        sample.nativeOwnership &&
        sample.computedClipPath === 'none',
    ),
  ).toBe(true);
  expect(new Set(samples.map((sample) => sample.inlineClipPath)).size).toBe(1);
  expect(['', 'none']).toContain(samples[0].inlineClipPath);
  expect(
    samples.some((sample) => Math.abs(sample.top - sample.stickyTop) <= 1),
  ).toBe(true);
  expect(samples.at(-1)!.top).toBeLessThan(samples.at(-1)!.headerBottom);

  await expect
    .poll(
      async () => {
        const [hostBox, headerBox] = await Promise.all([
          host.boundingBox(),
          header.boundingBox(),
        ]);
        if (!hostBox || !headerBox) return null;
        return host.evaluate((element, boxes) => {
          const fixtureHeader = document.querySelector<HTMLElement>('[data-fixture-header]');
          if (!fixtureHeader) return null;
          const overlapLeft = Math.max(boxes.host.x, boxes.header.x);
          const overlapRight = Math.min(
            boxes.host.x + boxes.host.width,
            boxes.header.x + boxes.header.width,
          );
          const overlapTop = Math.max(boxes.host.y, boxes.header.y);
          const overlapBottom = Math.min(
            boxes.host.y + boxes.host.height,
            boxes.header.y + boxes.header.height,
          );
          const pointX = (overlapLeft + overlapRight) / 2;
          const overlapPointY = (overlapTop + overlapBottom) / 2;
          const belowHeaderPointY = Math.ceil(boxes.header.y + boxes.header.height) + 1;
          const overlapHit = document.elementFromPoint(pointX, overlapPointY);
          const belowHeaderHit = document.elementFromPoint(pointX, belowHeaderPointY);
          return {
            overlapsHeader: overlapRight > overlapLeft && overlapBottom > overlapTop,
            headerOwnsOverlapPoint:
              overlapHit !== null && fixtureHeader.contains(overlapHit),
            galleryOwnsBelowHeaderPoint:
              belowHeaderHit !== null && element.contains(belowHeaderHit),
          };
        }, { host: hostBox, header: headerBox });
      },
      { timeout: 10000 },
    )
    .toEqual({
      overlapsHeader: true,
      headerOwnsOverlapPoint: true,
      galleryOwnsBelowHeaderPoint: true,
    });
  await expectNativeStickyGallery(page, host);
}

async function expectRenderedHeight(element: Locator, expectedHeight: number): Promise<void> {
  await expect
    .poll(
      () =>
        element.evaluate(
          (htmlElement, expected) =>
            Math.abs(htmlElement.getBoundingClientRect().height - expected),
          expectedHeight,
        ),
      { timeout: 10000 },
    )
    .toBeLessThanOrEqual(1);
}

async function readIframeSlotGeometry(page: Page) {
  const slot = page.locator('#ov25-configurator-background-color').locator('..');
  await expect(slot).toHaveCount(1);
  return slot.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      hasStickyClass: element.classList.contains('ov25-inline-sticky-iframe-slot'),
      width: rect.width,
      height: rect.height,
      aspectRatio: style.aspectRatio,
    };
  });
}

async function expectStickyContentBoxHostWithinCaps(host: Locator): Promise<void> {
  await expect
    .poll(() =>
      host.evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const parentRect = element.parentElement?.getBoundingClientRect();
        const maxHeight = Number.parseFloat(style.maxHeight);
        return {
          boxSizing: style.boxSizing,
          hasPadding: Number.parseFloat(style.paddingTop) > 0,
          hasBorder: Number.parseFloat(style.borderTopWidth) > 0,
          withinWidth: parentRect ? rect.width <= parentRect.width + 1 : false,
          withinHeight: Number.isFinite(maxHeight) && rect.height <= maxHeight + 1,
        };
      }),
    )
    .toEqual({
      boxSizing: 'border-box',
      hasPadding: true,
      hasBorder: true,
      withinWidth: true,
      withinHeight: true,
    });
}

const DESKTOP_VIEWER_HEIGHT_SELECTORS = {
  galleryRoot: '.ov25-inline-sticky-gallery-root-desktop',
  galleryContent: '.ov25-inline-sticky-gallery-content',
  iframeSlot: '.ov25-inline-sticky-iframe-slot',
  outerIframeContainer: '#ov25-configurator-iframe-container',
  trueIframeContainer: '#true-ov25-configurator-iframe-container',
  iframe: '#ov25-configurator-iframe',
} as const;

type DesktopViewerHeights = Record<
  'host' | keyof typeof DESKTOP_VIEWER_HEIGHT_SELECTORS,
  number
>;

async function readDesktopViewerHeights(
  page: Page,
  host: Locator,
): Promise<DesktopViewerHeights> {
  const entries = await Promise.all(
    Object.entries(DESKTOP_VIEWER_HEIGHT_SELECTORS).map(async ([name, selector]) => {
      const layer = page.locator(selector);
      await expect(layer).toHaveCount(1);
      return [
        name,
        await layer.evaluate((element) => element.getBoundingClientRect().height),
      ] as const;
    }),
  );
  return {
    host: await host.evaluate((element) => element.getBoundingClientRect().height),
    ...Object.fromEntries(entries),
  } as DesktopViewerHeights;
}

async function expectDesktopViewerHeightsToRemain(
  page: Page,
  host: Locator,
  expected: DesktopViewerHeights,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const current = await readDesktopViewerHeights(page, host);
        return Math.max(
          ...Object.keys(expected).map((key) =>
            Math.abs(
              current[key as keyof DesktopViewerHeights] -
                expected[key as keyof DesktopViewerHeights],
            ),
          ),
        );
      },
      { timeout: 10000 },
    )
    .toBeLessThanOrEqual(1);
}

async function readDesktopViewerGeometry(page: Page, host: Locator) {
  const root = page.locator(DESKTOP_VIEWER_HEIGHT_SELECTORS.galleryRoot);
  const content = page.locator(DESKTOP_VIEWER_HEIGHT_SELECTORS.galleryContent);
  const iframeSlot = page.locator(DESKTOP_VIEWER_HEIGHT_SELECTORS.iframeSlot);
  const outerIframeContainer = page.locator(
    DESKTOP_VIEWER_HEIGHT_SELECTORS.outerIframeContainer,
  );
  const trueIframeContainer = page.locator(
    DESKTOP_VIEWER_HEIGHT_SELECTORS.trueIframeContainer,
  );
  const iframe = page.locator(DESKTOP_VIEWER_HEIGHT_SELECTORS.iframe);
  const embeddedCarousel = host.locator('.ov25-inline-sticky-carousel-host');
  const [
    hostMetrics,
    rootBox,
    contentMetrics,
    iframeSlotMetrics,
    outerBox,
    trueBox,
    iframeBox,
    embeddedCarouselCount,
  ] = await Promise.all([
    host.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        maxHeight: Number.parseFloat(style.maxHeight),
      };
    }),
    root.boundingBox(),
    content.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        width: rect.width,
        height: rect.height,
        galleryGap: Number.parseFloat(style.rowGap) || 0,
        carouselCap:
          Number.parseFloat(
            style.getPropertyValue('--ov25-sticky-carousel-height'),
          ) || 0,
      };
    }),
    iframeSlot.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        aspectRatio: getComputedStyle(element).aspectRatio,
      };
    }),
    outerIframeContainer.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        position: style.position,
        top: style.top,
        right: style.right,
        bottom: style.bottom,
        left: style.left,
        maxHeight: style.maxHeight,
      };
    }),
    trueIframeContainer.boundingBox(),
    iframe.boundingBox(),
    embeddedCarousel.count(),
  ]);

  const embeddedCarouselBox = embeddedCarouselCount > 0
    ? await embeddedCarousel.boundingBox()
    : null;
  if (!rootBox || !trueBox || !iframeBox) return null;
  return {
    ...hostMetrics,
    root: rootBox,
    content: contentMetrics,
    iframeSlot: iframeSlotMetrics,
    outerIframeContainer: outerBox,
    trueIframeContainer: trueBox,
    iframe: iframeBox,
    embeddedCarouselCount,
    embeddedCarouselHeight: embeddedCarouselBox?.height ?? 0,
    embeddedCarousel: embeddedCarouselBox,
  };
}

async function expectDefaultDesktopViewerUsesNaturalSquare(
  page: Page,
  host: Locator,
  embeddedCarouselExpected = false,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const geometry = await readDesktopViewerGeometry(page, host);
        if (!geometry) return null;
        const iframeLayerRectError = Math.max(
          ...[
            geometry.outerIframeContainer,
            geometry.trueIframeContainer,
            geometry.iframe,
          ].flatMap((layer) => [
            Math.abs(layer.x - geometry.iframeSlot.x),
            Math.abs(layer.y - geometry.iframeSlot.y),
            Math.abs(layer.width - geometry.iframeSlot.width),
            Math.abs(layer.height - geometry.iframeSlot.height),
          ]),
        );

        return {
          hostWithinCap: geometry.height <= geometry.maxHeight + 1,
          slotIsSquare:
            Math.abs(geometry.iframeSlot.width - geometry.iframeSlot.height) <= 1,
          carouselSpaceMatchesMode: embeddedCarouselExpected
            ? geometry.embeddedCarouselCount === 1 &&
              geometry.iframeSlot.height <=
                geometry.maxHeight -
                  geometry.content.carouselCap -
                  geometry.content.galleryGap +
                  1 &&
              Math.abs(
                geometry.content.height -
                  geometry.iframeSlot.height -
                  geometry.content.galleryGap -
                  geometry.embeddedCarouselHeight,
              ) <= 1
            : geometry.embeddedCarouselCount === 0 &&
              Math.abs(geometry.content.height - geometry.iframeSlot.height) <= 1,
          iframeLayersMatchSlot: iframeLayerRectError <= 1,
          iframeShellPinnedToSlot:
            geometry.outerIframeContainer.position === 'absolute' &&
            geometry.outerIframeContainer.top === '0px' &&
            geometry.outerIframeContainer.right === '0px' &&
            geometry.outerIframeContainer.bottom === '0px' &&
            geometry.outerIframeContainer.left === '0px' &&
            geometry.outerIframeContainer.maxHeight === 'none',
          iframeShellClearsCarousel:
            !embeddedCarouselExpected ||
            (!!geometry.embeddedCarousel &&
              geometry.outerIframeContainer.y +
                geometry.outerIframeContainer.height <=
                geometry.embeddedCarousel.y + 1),
        };
      },
      { timeout: 10000 },
    )
    .toEqual({
      hostWithinCap: true,
      slotIsSquare: true,
      carouselSpaceMatchesMode: true,
      iframeLayersMatchSlot: true,
      iframeShellPinnedToSlot: true,
      iframeShellClearsCarousel: true,
    });
}

async function expectSingleRuntimePortalSet(page: Page): Promise<void> {
  for (const selector of [
    '#ov-25-configurator-gallery-container',
    '.ov25-inline-sticky-gallery-content',
    '#ov25-configurator-iframe',
    '#ov25-product-carousel',
    '#ov25-configurator-variant-menu-container',
  ]) {
    await expect(page.locator(selector)).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  }
}

async function readClientBlockerStyles(blocker: Locator) {
  return blocker.evaluate((element) => {
    const htmlElement = element as HTMLElement;
    const computed = getComputedStyle(htmlElement);

    return {
      styleAttribute: htmlElement.getAttribute('style'),
      inlineOverflow: htmlElement.style.overflow,
      inlineTransform: htmlElement.style.transform,
      computedOverflow: computed.overflow,
      computedTransform: computed.transform,
    };
  });
}

async function readBodyLayerHostStyleSnapshot(
  host: Locator,
  installClientSentinel = false,
) {
  return host.evaluate(
    (element, { lifecycleProperties, installSentinel }) => {
      const htmlElement = element as HTMLElement;
      if (installSentinel) {
        htmlElement.style.setProperty(
          '--fixture-client-inline-token',
          'preserve-body-layer',
          'important',
        );
        htmlElement.style.setProperty('outline-offset', '3px');
      }

      const serialize = (target: HTMLElement) => {
        const declarations = Array.from(target.style)
          .map((property) => ({
          property,
          value: target.style.getPropertyValue(property),
          priority: target.style.getPropertyPriority(property),
          }))
          .sort((left, right) => left.property.localeCompare(right.property));
        const cssText = declarations
          .map(
            ({ property, value, priority }) =>
              `${property}: ${value}${priority ? ` !${priority}` : ''};`,
          )
          .join(' ');

        return {
          styleAttribute: target.getAttribute('style') === null ? null : cssText,
          cssText,
          declarations,
        };
      };
      const current = serialize(htmlElement);
      const expectedAfterStickyCleanup = document.createElement('div');
      if (current.styleAttribute !== null) {
        expectedAfterStickyCleanup.setAttribute('style', current.styleAttribute);
      }
      for (const property of Array.from(expectedAfterStickyCleanup.style)) {
        if (
          lifecycleProperties.includes(property) ||
          property.startsWith('--ov25-sticky-')
        ) {
          expectedAfterStickyCleanup.style.removeProperty(property);
        }
      }

      return {
        current,
        expectedAfterStickyCleanup: serialize(expectedAfterStickyCleanup),
      };
    },
    {
      lifecycleProperties: [...STICKY_HOST_LIFECYCLE_STYLE_PROPERTIES],
      installSentinel: installClientSentinel,
    },
  );
}

type BodyLayerFrameSample = {
  requestedScrollY: number;
  scrollY: number;
  top: number;
  bottom: number;
  width: number;
  boundaryBottom: number;
  position: string;
  bodyLayerCount: number;
  placeholderCount: number;
  inBodyLayer: boolean;
};

// Frame-stepped sampling verifies the browser-owned sticky trajectory without wall-time or
// compositor claims. The body-layer runtime performs no scroll update after track activation;
// the focused same-task assertion below separately guards that no post-scroll rAF is required.
async function sampleBodyLayerFrameTrajectory(
  page: Page,
  start: number,
  end: number,
  step: number,
): Promise<BodyLayerFrameSample[]> {
  return page.evaluate(
    async ({ startScrollY, endScrollY, scrollStep }) => {
      const positions: number[] = [];
      for (
        let scrollY = startScrollY;
        scrollY < endScrollY;
        scrollY += scrollStep
      ) {
        positions.push(scrollY);
      }
      positions.push(endScrollY);

      const scrollForNextFrame = (nextScrollY: number) =>
        new Promise<void>((resolve) => {
          if (Math.abs(window.scrollY - nextScrollY) <= 0.5) {
            requestAnimationFrame(() => resolve());
            return;
          }
          window.addEventListener(
            'scroll',
            () => requestAnimationFrame(() => resolve()),
            { once: true },
          );
          window.scrollTo(0, nextScrollY);
        });
      const samples: BodyLayerFrameSample[] = [];

      for (let index = 0; index < positions.length; index += 1) {
        await scrollForNextFrame(positions[index]);
        const gallery = document.querySelector<HTMLElement>('#ov25-sticky-gallery');
        const boundary = document.querySelector<HTMLElement>('.fixture-product-grid');
        if (!gallery || !boundary) {
          throw new Error('Body-layer trajectory fixture is incomplete');
        }
        const galleryRect = gallery.getBoundingClientRect();
        samples.push({
          requestedScrollY: positions[index],
          scrollY: window.scrollY,
          top: galleryRect.top,
          bottom: galleryRect.bottom,
          width: galleryRect.width,
          boundaryBottom: boundary.getBoundingClientRect().bottom,
          position: getComputedStyle(gallery).position,
          bodyLayerCount: document.querySelectorAll(
            '[data-ov25-sticky-body-layer]',
          ).length,
          placeholderCount: document.querySelectorAll(
            '[data-ov25-sticky-placeholder]',
          ).length,
          inBodyLayer:
            gallery.closest('[data-ov25-sticky-body-layer]') !== null,
        });
      }
      return samples;
    },
    { startScrollY: start, endScrollY: end, scrollStep: step },
  );
}

function expectContinuousBodyLayerTrajectory(
  samples: BodyLayerFrameSample[],
  expectedTop: (sample: BodyLayerFrameSample) => number,
): void {
  expect(samples.length).toBeGreaterThan(4);
  const initialWidth = samples[0].width;

  for (const sample of samples) {
    expect(Math.abs(sample.scrollY - sample.requestedScrollY)).toBeLessThanOrEqual(1);
    expect(Math.abs(sample.top - expectedTop(sample))).toBeLessThanOrEqual(1);
    expect(Math.abs(sample.width - initialWidth)).toBeLessThanOrEqual(1);
    expect(sample.bodyLayerCount).toBeLessThanOrEqual(1);
    expect(sample.placeholderCount).toBe(sample.bodyLayerCount);
    expect(sample.inBodyLayer).toBe(sample.bodyLayerCount === 1);
  }

  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1];
    const current = samples[index];
    const scrollDelta = current.scrollY - previous.scrollY;
    const topDelta = current.top - previous.top;
    expect(scrollDelta).toBeGreaterThan(0);
    expect(topDelta).toBeLessThanOrEqual(1);
    expect(topDelta).toBeGreaterThanOrEqual(-scrollDelta - 1);
  }
}

async function expectResponsiveMobileScenario(
  page: Page,
  scenario: (typeof RESPONSIVE_SCENARIOS)[number],
): Promise<void> {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await page.goto(scenario.path);
  await expect(page.locator('body')).toHaveAttribute(
    'data-fixture-sticky-scenario',
    scenario.key,
  );

  const fixtureHeaders = page.locator('[data-fixture-header]');
  const header = scenario.headerSelector
    ? page.locator(scenario.headerSelector)
    : null;
  await expect(fixtureHeaders).toHaveCount(header ? 1 : 0);
  if (header) await expect(header).toHaveCount(1);
  const isCollapsingHeader = scenario.key === 'desktop-collapsing-header';
  if (isCollapsingHeader && header) {
    await expect(header).toHaveAttribute('data-compact', 'false');
    await expect(header).toHaveAttribute('data-hidden', 'false');
  }

  const host = await waitForStickyGallery(page);
  await expect(host).toHaveAttribute('data-ov25-inline-sticky-mobile', 'true');
  await expectMobileStickyViewportLayout(
    page,
    host,
    header,
    isCollapsingHeader ? { expectedHeaderOffset: 94 } : undefined,
  );
  await expectViewerCornerMode(page, 'square');

  const target = page.locator('[data-ov25-sticky-mobile-carousel]');
  const externalCarousel = target.locator(
    ':scope > [data-ov25-external-carousel="true"]',
  );
  await expect(target).toHaveCount(1);
  await expect(target).toBeVisible();
  await expect(externalCarousel).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
  await expect(externalCarousel.locator('#ov25-product-carousel')).toHaveCount(1);
  await expect(page.locator('#true-carousel')).toHaveCount(0);
  await expectSingleRuntimePortalSet(page);
  await expectMobileVariantsUsePageScroll(page);

  expect(
    await externalCarousel.evaluate((element) => {
      const targetElement = element.parentElement;
      const variantsTarget = document.querySelector('#ov25-sticky-controls');
      return {
        directChildOfTarget: targetElement?.hasAttribute(
          'data-ov25-sticky-mobile-carousel',
        ),
        targetPrecedesVariants:
          targetElement != null &&
          variantsTarget != null &&
          Boolean(
            targetElement.compareDocumentPosition(variantsTarget) &
              Node.DOCUMENT_POSITION_FOLLOWING,
          ),
      };
    }),
  ).toEqual({ directChildOfTarget: true, targetPrecedesVariants: true });

  const optionHeader = page.locator(
    '.ov25-inline-sticky-list-mobile .ov25-option-header',
  ).first();
  const groupHeader = page.locator(
    '.ov25-inline-sticky-list-mobile .ov25-group-header',
  ).first();
  await expect(optionHeader).toBeVisible({ timeout: RUNTIME_TIMEOUT });
  await expect(groupHeader).toBeVisible({ timeout: RUNTIME_TIMEOUT });

  if (isCollapsingHeader && header) {
    await page.evaluate(() => window.scrollTo(0, 100));
    await expect(header).toHaveAttribute('data-compact', 'true');
    await expect(header).toHaveAttribute('data-hidden', 'false');
    await expectMobileStickyViewportLayout(page, host, header, {
      expectedHeaderOffset: 54,
    });
  }

  await page.evaluate(() => window.scrollTo(0, 800));
  if (isCollapsingHeader && header) {
    await expect(header).toHaveAttribute('data-compact', 'true');
    await expect(header).toHaveAttribute('data-hidden', 'true');
  }
  await expectMobileStickyViewportLayout(page, host, header, {
    pinned: true,
    ...(isCollapsingHeader ? { expectedHeaderOffset: 0 } : {}),
  });
  if (!header) await expectPinnedTop(host, 0);
  await expectMobileHeadersBelowGallery(host, optionHeader, groupHeader);
  await expectStickyListHeaderTextAlignment(
    page,
    '.ov25-inline-sticky-list-mobile',
  );

  await page.evaluate(() => window.scrollTo(0, 1000));
  await expectMobileHeadersBelowGallery(host, optionHeader, groupHeader);
}

test.describe('Standard product inline-sticky display mode', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test('keeps ordinary inline modes outside the sticky layout lifecycle', async ({ page }) => {
    for (const mode of ['inline', 'inline-sheet'] as const) {
      await page.goto(
        `/tests/inline-sticky-desktop-no-header.html?desktopMode=${mode}&mobileMode=inline&replacementStyle=hazardous`,
      );

      const host = page.locator('#ov25-sticky-gallery');
      await expect(host).toBeVisible({ timeout: RUNTIME_TIMEOUT });
      await expect(host).toHaveClass(/ov25-configurator-gallery/);
      await expect(host).not.toHaveClass(/ov25-inline-gallery-sticky/);
      await expect(host).not.toHaveClass(/ov25-inline-sticky-gallery-host/);
      await expect(host).not.toHaveAttribute('data-ov25-inline-sticky-active');
      await expect(host).not.toHaveCSS('position', 'sticky');
      await expect(page.locator('.ov25-inline-sticky-gallery-root')).toHaveCount(0);
      await expect(page.locator('[data-ov25-sticky-placeholder]')).toHaveCount(0);
      await expect(page.locator('[data-ov25-sticky-body-layer]')).toHaveCount(0);
      await expect(page.locator('#ov25-sticky-controls')).toBeVisible();
      expect(
        await host.evaluate((element) => ({
          display: element.style.display,
          transform: element.style.transform,
          boxSizing: element.style.boxSizing,
          padding: element.style.padding,
          border: element.style.border,
        })),
      ).toEqual({
        display: '',
        transform: '',
        boxSizing: '',
        padding: '',
        border: '',
      });
    }
  });

  test('stays visible when a Dawn-style empty div rule targets the gallery root', async ({ page }) => {
    await page.goto('/tests/inline-sticky-desktop-no-header.html');
    await page.addStyleTag({
      content: `
        #ov-25-configurator-gallery-container:empty {
          display: none !important;
        }
      `,
    });

    const host = await waitForStickyGallery(page);
    const galleryRoot = host.locator('#ov-25-configurator-gallery-container');
    const placeholder = galleryRoot.locator(
      ':scope > [data-ov25-portal-host-placeholder]',
    );
    const iframe = page.locator('#ov25-configurator-iframe');

    await expect(placeholder).toHaveCount(1);
    await expect(placeholder).toHaveAttribute('hidden', '');
    await expect(placeholder).toHaveAttribute('inert');
    await expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    await expect(galleryRoot).toBeVisible();
    await expect(galleryRoot).not.toHaveCSS('display', 'none');
    expect(await galleryRoot.evaluate((element) => element.matches(':empty'))).toBe(false);
    await expect
      .poll(async () => {
        const [galleryBox, iframeBox] = await Promise.all([
          galleryRoot.boundingBox(),
          iframe.boundingBox(),
        ]);
        return Boolean(
          galleryBox &&
            galleryBox.width > 1 &&
            galleryBox.height > 1 &&
            iframeBox &&
            iframeBox.width > 1 &&
            iframeBox.height > 1,
        );
      })
      .toBe(true);
  });

  test('keeps a fixed merchant mobile variants host in page flow and restores it on exit', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(
      `${RESPONSIVE_FIXTURE_PATH}?desktopMode=inline&fixedMobileVariants=1`,
    );

    const galleryHost = await waitForStickyGallery(page);
    const variantsHost = page.locator('#ov25-sticky-controls');
    const readHostStyles = () =>
      variantsHost.evaluate((element) => {
        const computed = getComputedStyle(element);
        const properties = ['position', 'top', 'right', 'bottom', 'left', 'z-index'];
        return Object.fromEntries(
          properties.map((property) => [
            property,
            {
              computed: computed.getPropertyValue(property),
              inline: element.style.getPropertyValue(property),
              priority: element.style.getPropertyPriority(property),
            },
          ]),
        );
      });

    await expect
      .poll(readHostStyles, { timeout: RUNTIME_TIMEOUT })
      .toEqual({
        position: { computed: 'relative', inline: 'relative', priority: 'important' },
        top: { computed: '0px', inline: 'auto', priority: 'important' },
        right: { computed: '0px', inline: 'auto', priority: 'important' },
        bottom: { computed: '0px', inline: 'auto', priority: 'important' },
        left: { computed: '0px', inline: 'auto', priority: 'important' },
        'z-index': { computed: 'auto', inline: 'auto', priority: 'important' },
      });
    await expectMobileVariantsUsePageScroll(page);

    const galleryBox = await galleryHost.boundingBox();
    expect(galleryBox).not.toBeNull();
    const viewerCenter = {
      x: galleryBox!.x + galleryBox!.width / 2,
      y: galleryBox!.y + galleryBox!.height / 2,
    };
    expect(
      await variantsHost.evaluate((element, point) => {
        const hit = document.elementFromPoint(point.x, point.y);
        return hit === element || element.shadowRoot?.contains(hit) === true;
      }, viewerCenter),
    ).toBe(false);

    const beforeScroll = await variantsHost.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        documentTop: rect.top + window.scrollY,
        viewportTop: rect.top,
        documentBottom: rect.bottom + window.scrollY,
        documentScrollHeight: document.documentElement.scrollHeight,
      };
    });
    expect(beforeScroll.documentScrollHeight + 1).toBeGreaterThanOrEqual(
      beforeScroll.documentBottom,
    );

    await page.evaluate(() => window.scrollTo(0, 300));
    await expect
      .poll(
        () =>
          variantsHost.evaluate((element, before) => {
            const rect = element.getBoundingClientRect();
            const documentTop = rect.top + window.scrollY;
            return {
              reachedRequestedScroll: Math.abs(window.scrollY - 300) <= 1,
              documentTopStayedStable: Math.abs(documentTop - before.documentTop) <= 1,
              movedWithDocument:
                Math.abs(rect.top - (before.viewportTop - window.scrollY)) <= 1,
            };
          }, beforeScroll),
        { timeout: 10000 },
      )
      .toEqual({
        reachedRequestedScroll: true,
        documentTopStayedStable: true,
        movedWithDocument: true,
      });

    await page.setViewportSize(DESKTOP_VIEWPORT);
    await expect(page.locator('.ov25-inline-sticky-gallery-root')).toHaveCount(0, {
      timeout: RUNTIME_TIMEOUT,
    });
    await expect
      .poll(readHostStyles, { timeout: RUNTIME_TIMEOUT })
      .toEqual({
        position: { computed: 'relative', inline: 'relative', priority: '' },
        top: { computed: '0px', inline: '', priority: '' },
        right: { computed: '0px', inline: '', priority: '' },
        bottom: { computed: '0px', inline: '', priority: '' },
        left: { computed: '0px', inline: '', priority: '' },
        'z-index': { computed: '2', inline: '2', priority: '' },
      });

    await page.setViewportSize(MOBILE_VIEWPORT);
    await waitForStickyGallery(page);
    await expect
      .poll(readHostStyles, { timeout: RUNTIME_TIMEOUT })
      .toEqual({
        position: { computed: 'relative', inline: 'relative', priority: 'important' },
        top: { computed: '0px', inline: 'auto', priority: 'important' },
        right: { computed: '0px', inline: 'auto', priority: 'important' },
        bottom: { computed: '0px', inline: 'auto', priority: 'important' },
        left: { computed: '0px', inline: 'auto', priority: 'important' },
        'z-index': { computed: 'auto', inline: 'auto', priority: 'important' },
      });
  });

  test('leaves a fixed merchant variants host untouched outside mobile inline-sticky', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(
      `${RESPONSIVE_FIXTURE_PATH}?mobileMode=inline&fixedMobileVariants=1`,
    );

    const variantsHost = page.locator('#ov25-sticky-controls');
    await expect(page.locator('#ov25-configurator-variant-menu-container')).toHaveCount(1, {
      timeout: RUNTIME_TIMEOUT,
    });
    await expect
      .poll(
        () =>
          variantsHost.evaluate((element) => {
            const computed = getComputedStyle(element);
            return {
              computedPosition: computed.position,
              computedZIndex: computed.zIndex,
              inlinePosition: element.style.position,
              inlinePositionPriority: element.style.getPropertyPriority('position'),
              inlineZIndex: element.style.zIndex,
              inlineZIndexPriority: element.style.getPropertyPriority('z-index'),
              inlineTop: element.style.top,
              inlineRight: element.style.right,
              inlineBottom: element.style.bottom,
              inlineLeft: element.style.left,
            };
          }),
        { timeout: RUNTIME_TIMEOUT },
      )
      .toEqual({
        computedPosition: 'fixed',
        computedZIndex: '9999',
        inlinePosition: 'relative',
        inlinePositionPriority: '',
        inlineZIndex: '2',
        inlineZIndexPriority: '',
        inlineTop: '',
        inlineRight: '',
        inlineBottom: '',
        inlineLeft: '',
      });
  });

  test('leaves an in-flow variants host untouched during mobile inline-sticky', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(RESPONSIVE_FIXTURE_PATH);

    await waitForStickyGallery(page);
    const variantsHost = page.locator('#ov25-sticky-controls');
    await expect(page.locator('#ov25-configurator-variant-menu-container')).toHaveCount(1, {
      timeout: RUNTIME_TIMEOUT,
    });
    await expect
      .poll(
        () =>
          variantsHost.evaluate((element) => ({
            computedPosition: getComputedStyle(element).position,
            inlinePosition: element.style.position,
            inlineTop: element.style.top,
            inlineRight: element.style.right,
            inlineBottom: element.style.bottom,
            inlineLeft: element.style.left,
            inlineZIndex: element.style.zIndex,
          })),
        { timeout: RUNTIME_TIMEOUT },
      )
      .toEqual({
        computedPosition: 'static',
        inlinePosition: '',
        inlineTop: '',
        inlineRight: '',
        inlineBottom: '',
        inlineLeft: '',
        inlineZIndex: '',
      });
  });

  test('keeps the no-header desktop gallery pinned and sized to the viewport', async ({ page }) => {
    const consoleWarnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'warning') consoleWarnings.push(message.text());
    });
    await page.goto('/tests/inline-sticky-desktop-no-header.html');

    await expect(page.locator('body')).toHaveAttribute(
      'data-fixture-sticky-scenario',
      'desktop-no-header',
    );
    const host = await waitForStickyGallery(page);
    await expectInitialFilterControlsUnobscured(page);
    await expect(host).toHaveAttribute('data-ov25-inline-sticky-mobile', 'false');
    await expectDesktopStickyLayout(host, null, 0);
    await expectGalleryColumnStretch(page, host);
    await expect(page.locator('[data-ov25-external-carousel]')).toHaveCount(0);
    await expect(host.locator('.ov25-inline-sticky-carousel-host')).toHaveCount(1);
    await expect(page.locator('[data-ov25-sticky-mobile-carousel]')).not.toBeVisible();
    await expectDefaultDesktopViewerUsesNaturalSquare(page, host, true);
    await expectSingleRuntimePortalSet(page);

    const iframe = page.locator('#ov25-configurator-iframe');
    await iframe.evaluate((element) => {
      (window as Window & { __ov25DefaultStickyIframe?: Element }).__ov25DefaultStickyIframe =
        element;
    });
    const naturalDocumentTop = await host.evaluate(
      (element) => element.getBoundingClientRect().top + window.scrollY,
    );
    const activationScrollY = Math.ceil(naturalDocumentTop - STICKY_GAP);

    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), activationScrollY - 1);
    await expect(page.locator('[data-ov25-sticky-placeholder]')).toHaveCount(0);

    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), activationScrollY);
    await expect(page.locator('[data-ov25-sticky-placeholder]')).toHaveCount(0);
    await expect(host).toHaveCSS('position', 'sticky');
    await expectPinnedTop(host, STICKY_GAP);

    await page.evaluate(() => window.scrollTo(0, 600));
    await expectNativeStickyGallery(page, host);
    await expectPinnedTop(host, STICKY_GAP);
    await expectOptionHeaderGapMask(page, 0);
    expect(
      await iframe.evaluate(
        (element) =>
          element ===
          (window as Window & { __ov25DefaultStickyIframe?: Element })
            .__ov25DefaultStickyIframe,
      ),
    ).toBe(true);
    expect(
      consoleWarnings.some(
        (message) =>
          message.includes('insufficient-sticky-travel') &&
          message.includes('body-host fallback is required'),
      ),
    ).toBe(false);
    expect(
      consoleWarnings.some((message) =>
        message.includes('Carousel target') && message.includes('was not found'),
      ),
    ).toBe(false);
  });

  test('remeasures final host sizing before an immediate threshold scroll', async ({ page }) => {
    await page.goto('/tests/inline-sticky-desktop-no-header.html');

    const host = await waitForStickyGallery(page);
    const iframe = page.locator('#ov25-configurator-iframe');
    await iframe.evaluate((element) => {
      (window as Window & { __ov25ImmediateStickyIframe?: Element })
        .__ov25ImmediateStickyIframe = element;
    });
    const naturalDocumentTop = await host.evaluate(
      (element) => element.getBoundingClientRect().top + window.scrollY,
    );
    const activationScrollY = Math.ceil(naturalDocumentTop - STICKY_GAP);

    await page.evaluate(
      ({ threshold, sustained }) => {
        window.scrollTo(0, threshold);
        window.scrollTo(0, sustained);
      },
      { threshold: activationScrollY, sustained: 600 },
    );
    await expectNativeStickyGallery(page, host);
    await expectPinnedTop(host, STICKY_GAP);
    await expect(iframe).toHaveCount(1);
    expect(
      await iframe.evaluate(
        (element) =>
          element ===
          (window as Window & { __ov25ImmediateStickyIframe?: Element })
            .__ov25ImmediateStickyIframe,
      ),
    ).toBe(true);
  });

  test('recovers sticky behavior without rewriting a client gallery blocker', async ({ page }) => {
    const consoleWarnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'warning') consoleWarnings.push(message.text());
    });

    await page.goto('/tests/inline-sticky-desktop-no-header.html?blocker=1');

    await expect(page.locator('.inline-sticky-fixture')).toHaveAttribute(
      'data-gallery-blocker',
      'true',
    );
    const blocker = page.locator('[data-fixture-gallery-blocker]');
    await expect(blocker).toHaveCount(1);

    const blockerStyles = await readClientBlockerStyles(blocker);
    expect(blockerStyles.styleAttribute).toContain('overflow: clip');
    expect(blockerStyles.styleAttribute).toContain('transform: translateZ(0');
    expect(blockerStyles.inlineOverflow).toBe('clip');
    expect(blockerStyles.inlineTransform).not.toBe('');
    expect(blockerStyles.computedOverflow).toBe('clip');
    expect(blockerStyles.computedTransform).not.toBe('none');

    const host = await waitForStickyGallery(page);
    await expectDesktopStickyLayout(host, null, 0);
    await expectSingleRuntimePortalSet(page);
    await expect(page.locator('[data-ov25-sticky-placeholder]')).toHaveCount(0);
    await expect
      .poll(
        () =>
          consoleWarnings.filter((message) =>
            message.includes('Client ancestor blocks gallery sticky positioning') &&
            message.includes('vertical-overflow-clipping') &&
            message.includes('transform-containing-block') &&
            message.includes('body-host fallback is required'),
          ).length,
        { timeout: 10000 },
      )
      .toBeGreaterThan(0);

    const iframe = page.locator('#ov25-configurator-iframe');
    await iframe.evaluate((element) => {
      (window as Window & { __ov25StickyIframe?: Element }).__ov25StickyIframe = element;
    });

    await page.evaluate(() => window.scrollTo(0, 600));

    await expect(page.locator('[data-ov25-sticky-placeholder]')).toHaveCount(1, {
      timeout: 10000,
    });
    await expect(host).toHaveCSS('position', 'fixed');
    await expectPinnedTop(host, STICKY_GAP);
    await expect
      .poll(() =>
        host.evaluate(
          (element) =>
            element.matches(':popover-open') ||
            element.closest('[data-ov25-sticky-body-layer]') !== null,
        ),
      )
      .toBe(true);
    await expectSingleRuntimePortalSet(page);
    expect(await readClientBlockerStyles(blocker)).toEqual(blockerStyles);
    expect(
      await iframe.evaluate(
        (element) =>
          element === (window as Window & { __ov25StickyIframe?: Element }).__ov25StickyIframe,
      ),
    ).toBe(true);

    await page.evaluate(() => window.scrollTo(0, 0));

    await expect(page.locator('[data-ov25-sticky-placeholder]')).toHaveCount(0, {
      timeout: 10000,
    });
    await expect(page.locator('[data-ov25-sticky-body-layer]')).toHaveCount(0);
    await expectDesktopStickyLayout(host, null, 0);
    await expect
      .poll(() =>
        host.evaluate((element) => ({
          directChildOfBlocker: element.parentElement?.hasAttribute(
            'data-fixture-gallery-blocker',
          ),
          popover: element.getAttribute('popover'),
          popoverOpen: element.matches(':popover-open'),
        })),
      )
      .toEqual({ directChildOfBlocker: true, popover: null, popoverOpen: false });
    await expectSingleRuntimePortalSet(page);
    expect(await readClientBlockerStyles(blocker)).toEqual(blockerStyles);
    expect(
      await iframe.evaluate(
        (element) =>
          element === (window as Window & { __ov25StickyIframe?: Element }).__ov25StickyIframe,
      ),
    ).toBe(true);
  });

  test('falls back when hidden fixture-root overflow makes a non-scrolling sticky ancestor', async ({ page }) => {
    const consoleWarnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'warning') consoleWarnings.push(message.text());
    });

    await page.goto(
      '/tests/inline-sticky-desktop-no-header.html?overflowBlocker=fixture-root',
    );

    await expect(page.locator('.inline-sticky-fixture')).toHaveAttribute(
      'data-overflow-blocker',
      'fixture-root',
    );
    await expect(page.locator('.inline-sticky-fixture')).toHaveCSS(
      'overflow-x',
      'hidden',
    );
    expect(
      await page.evaluate(() => document.scrollingElement === document.documentElement),
    ).toBe(true);

    const host = await waitForStickyGallery(page);
    const iframe = page.locator('#ov25-configurator-iframe');
    await iframe.evaluate((element) => {
      (window as Window & { __ov25RootOverflowIframe?: Element })
        .__ov25RootOverflowIframe = element;
    });

    await expect
      .poll(
        () =>
          consoleWarnings.some(
            (message) =>
              message.includes('vertical-scroll-container') &&
              message.includes('body-host fallback is required'),
          ),
        { timeout: 10000 },
      )
      .toBe(true);

    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(page.locator('[data-ov25-sticky-placeholder]')).toHaveCount(1, {
      timeout: 10000,
    });
    await expect(host).toHaveCSS('position', 'fixed');
    await expectPinnedTop(host, STICKY_GAP);
    expect(
      await iframe.evaluate(
        (element) =>
          element ===
          (window as Window & { __ov25RootOverflowIframe?: Element })
            .__ov25RootOverflowIframe,
      ),
    ).toBe(true);
  });

  test('keeps native Popover available while only the gallery probe fails', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'The supported inline-sticky E2E project is Chromium.');
    await page.goto(
      '/tests/inline-sticky-desktop-fixed-header.html?fallback=body-layer',
    );

    const probe = page.locator('[data-fixture-native-popover-probe]');
    await expect(probe).toHaveCount(1);
    const popoverSupported = await probe.evaluate(
      (element) =>
        typeof (element as HTMLElement).showPopover === 'function' &&
        typeof (element as HTMLElement).hidePopover === 'function',
    );
    test.skip(!popoverSupported, 'This Chromium build does not expose the native Popover API.');
    await expect(page.locator('.inline-sticky-fixture')).toHaveAttribute(
      'data-popover-fixture',
      'gallery-show-fails',
    );

    await probe.evaluate((element) => (element as HTMLElement).showPopover());
    await expect
      .poll(() => probe.evaluate((element) => element.matches(':popover-open')))
      .toBe(true);
    await probe.evaluate((element) => (element as HTMLElement).hidePopover());
    await expect
      .poll(() => probe.evaluate((element) => element.matches(':popover-open')))
      .toBe(false);

    const host = await waitForStickyGallery(page);
    const galleryFailure = await host.evaluate((element) => {
      const htmlElement = element as HTMLElement;
      const previousPopover = htmlElement.getAttribute('popover');
      htmlElement.setAttribute('popover', 'manual');
      let errorName: string | null = null;
      try {
        htmlElement.showPopover();
      } catch (error) {
        errorName = error instanceof DOMException ? error.name : 'non-dom-error';
      }
      const opened = htmlElement.matches(':popover-open');
      if (opened) htmlElement.hidePopover();
      if (previousPopover === null) htmlElement.removeAttribute('popover');
      else htmlElement.setAttribute('popover', previousPopover);
      return { errorName, opened };
    });
    expect(galleryFailure).toEqual({
      errorName: 'NotSupportedError',
      opened: false,
    });

    const fallbackScrollY = await host.evaluate((element) => {
      const stickyTop = Number.parseFloat(getComputedStyle(element).top);
      return element.getBoundingClientRect().top + window.scrollY - stickyTop + 64;
    });
    await page.evaluate(
      (scrollY) =>
        new Promise<void>((resolve) => {
          window.scrollTo(0, scrollY);
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
      fallbackScrollY,
    );
    await expect(page.locator('[data-ov25-sticky-body-layer]')).toHaveCount(1, {
      timeout: RUNTIME_TIMEOUT,
    });
    await expect(page.locator('[data-ov25-sticky-placeholder]')).toHaveCount(1);
    await expect
      .poll(() =>
        host.evaluate((element) => ({
          inBodyLayer:
            element.closest('[data-ov25-sticky-body-layer]') !== null,
          directLayerChild: element.parentElement?.hasAttribute(
            'data-ov25-sticky-body-layer',
          ),
          position: getComputedStyle(element).position,
          popoverOpen: element.matches(':popover-open'),
        })),
      )
      .toEqual({
        inBodyLayer: true,
        directLayerChild: true,
        position: 'sticky',
        popoverOpen: false,
      });
  });

  test('uses a native-sticky body-layer track and restores it across responsive cleanup', async ({
    page,
  }) => {
    await page.goto(
      '/tests/inline-sticky-desktop-fixed-header.html?fallback=body-layer&mobileMode=inline',
    );

    const fixture = page.locator('.inline-sticky-fixture');
    await expect(fixture).toHaveAttribute('data-gallery-blocker', 'true');
    await expect(fixture).toHaveAttribute('data-fallback-strategy', 'body-layer');
    await expect(fixture).toHaveAttribute(
      'data-popover-fixture',
      /^(gallery-show-fails|unavailable)$/,
    );

    const header = page.locator('[data-fixture-header]');
    const blocker = page.locator('[data-fixture-gallery-blocker]');
    const grid = page.locator('.fixture-product-grid');
    await expect(header).toHaveCount(1);
    await expect(blocker).toHaveCount(1);
    await expect(grid).toHaveCount(1);

    const blockerStyles = await readClientBlockerStyles(blocker);
    expect(blockerStyles.styleAttribute).toContain('overflow: clip');
    expect(blockerStyles.styleAttribute).toContain('transform: translateZ(0');

    const host = await waitForStickyGallery(page);
    const iframe = page.locator('#ov25-configurator-iframe');
    const bodyLayer = page.locator('[data-ov25-sticky-body-layer]');
    const placeholder = page.locator('[data-ov25-sticky-placeholder]');
    await expectDesktopStickyLayout(host, header, 106);
    await expect(page.locator('[data-ov25-list-variants-content]')).toBeVisible({
      timeout: RUNTIME_TIMEOUT,
    });
    await expect(bodyLayer).toHaveCount(0);
    await expect(placeholder).toHaveCount(0);
    await expectSingleRuntimePortalSet(page);

    const preRelocationHostStyles = await readBodyLayerHostStyleSnapshot(host, true);
    expect(preRelocationHostStyles.current.styleAttribute).not.toBeNull();
    expect(preRelocationHostStyles.current.declarations).toContainEqual({
      property: '--fixture-client-inline-token',
      value: 'preserve-body-layer',
      priority: 'important',
    });
    expect(preRelocationHostStyles.current.declarations).toContainEqual({
      property: 'outline-offset',
      value: '3px',
      priority: '',
    });

    await host.evaluate((element) => {
      (window as Window & { __ov25BodyLayerHost?: Element }).__ov25BodyLayerHost =
        element;
    });
    await iframe.evaluate((element) => {
      (window as Window & { __ov25BodyLayerIframe?: Element })
        .__ov25BodyLayerIframe = element;
    });

    const readClientLayout = () =>
      page.evaluate(() => {
        const gridElement = document.querySelector<HTMLElement>('.fixture-product-grid');
        const blockerElement = document.querySelector<HTMLElement>(
          '[data-fixture-gallery-blocker]',
        );
        const informationElement = document.querySelector<HTMLElement>(
          '.fixture-product-information',
        );
        if (!gridElement || !blockerElement || !informationElement) {
          throw new Error('Body-layer fixture layout is incomplete');
        }
        const gridRect = gridElement.getBoundingClientRect();
        const blockerRect = blockerElement.getBoundingClientRect();
        const informationRect = informationElement.getBoundingClientRect();
        return {
          gridWidth: gridRect.width,
          gridHeight: gridRect.height,
          gridDocumentTop: gridRect.top + window.scrollY,
          blockerWidth: blockerRect.width,
          blockerHeight: blockerRect.height,
          informationLeft: informationRect.left,
          informationWidth: informationRect.width,
          informationDocumentTop: informationRect.top + window.scrollY,
          documentHeight: document.documentElement.scrollHeight,
        };
      });
    let baselineLayout: Awaited<ReturnType<typeof readClientLayout>> | null = null;
    const expectClientLayoutStable = (
      current: Awaited<ReturnType<typeof readClientLayout>>,
    ) => {
      if (!baselineLayout) throw new Error('Body-layer fixture baseline is missing');
      expect(Math.abs(current.gridWidth - baselineLayout.gridWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(current.gridHeight - baselineLayout.gridHeight)).toBeLessThanOrEqual(2);
      expect(
        Math.abs(current.gridDocumentTop - baselineLayout.gridDocumentTop),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(current.blockerWidth - baselineLayout.blockerWidth),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(current.blockerHeight - baselineLayout.blockerHeight),
      ).toBeLessThanOrEqual(2);
      expect(
        Math.abs(current.informationLeft - baselineLayout.informationLeft),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(current.informationWidth - baselineLayout.informationWidth),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(
          current.informationDocumentTop - baselineLayout.informationDocumentTop,
        ),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(current.documentHeight - baselineLayout.documentHeight),
      ).toBeLessThanOrEqual(2);
    };

    const plan = await waitForBodyLayerTrackPlan(page, host);
    baselineLayout = await readClientLayout();
    expect(Math.round(plan.stickyTop)).toBe(106 + STICKY_GAP);

    const firstFixedScrollY = Math.ceil(plan.activationScrollY + 64);
    const lastFixedScrollY = Math.floor(
      Math.min(plan.boundaryEndScrollY - 64, plan.maxScrollY - 128),
    );
    expect(lastFixedScrollY).toBeGreaterThan(firstFixedScrollY + 128);
    const fixedScrollSamples = [
      firstFixedScrollY,
      Math.round((firstFixedScrollY + lastFixedScrollY) / 2),
      lastFixedScrollY,
    ];
    const boundaryScrollY = Math.min(
      plan.maxScrollY,
      Math.ceil(plan.boundaryEndScrollY + 96),
    );
    expect(boundaryScrollY).toBeGreaterThan(plan.boundaryEndScrollY);

    const scrollAndSettle = (scrollY: number) =>
      page.evaluate(
        (nextScrollY) =>
          new Promise<void>((resolve) => {
            window.scrollTo(0, nextScrollY);
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          }),
        scrollY,
      );

    const activationTrajectory = await sampleBodyLayerFrameTrajectory(
      page,
      Math.max(0, Math.floor(plan.activationScrollY - 48)),
      Math.ceil(plan.activationScrollY + 48),
      8,
    );
    expectContinuousBodyLayerTrajectory(
      activationTrajectory,
      (sample) =>
        Math.max(plan.stickyTop, plan.naturalDocumentTop - sample.scrollY),
    );
    expect(activationTrajectory[0].top).toBeGreaterThan(plan.stickyTop + 1);
    expect(
      Math.abs(activationTrajectory.at(-1)!.top - plan.stickyTop),
    ).toBeLessThanOrEqual(1);
    expect(activationTrajectory.some((sample) => sample.bodyLayerCount === 0)).toBe(true);
    expect(activationTrajectory.some((sample) => sample.bodyLayerCount === 1)).toBe(true);
    expect(new Set(activationTrajectory.map((sample) => sample.position))).toEqual(
      new Set(['sticky']),
    );

    const fixedWidths: number[] = [];
    for (const scrollY of fixedScrollSamples) {
      await scrollAndSettle(scrollY);
      await expect(bodyLayer).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
      await expect(placeholder).toHaveCount(1);
      await expect
        .poll(
          () =>
            host.evaluate((element, expected) => {
              const layer = element.closest<HTMLElement>(
                '[data-ov25-sticky-body-layer]',
              );
              const rect = element.getBoundingClientRect();
              const layerRect = layer?.getBoundingClientRect();
              return {
                position: getComputedStyle(element).position,
                pinned: Math.abs(rect.top - expected.stickyTop) <= 1,
                hostIsLayerChild: element.parentElement === layer,
                layerIsBodyChild: layer?.parentElement === document.body,
                layerPosition: layer ? getComputedStyle(layer).position : null,
                layerTopAligned:
                  layerRect !== undefined &&
                  Math.abs(
                    layerRect.top + window.scrollY - expected.naturalDocumentTop,
                  ) <= 1,
                layerBottomAligned:
                  layerRect !== undefined &&
                  Math.abs(
                    layerRect.bottom + window.scrollY - expected.boundaryDocumentBottom,
                  ) <= 1,
                bodyLayerCount: document.querySelectorAll(
                  '[data-ov25-sticky-body-layer]',
                ).length,
                placeholderCount: document.querySelectorAll(
                  '[data-ov25-sticky-placeholder]',
                ).length,
                popover: element.getAttribute('popover'),
                popoverOpen: element.matches(':popover-open'),
                hostIdentity:
                  element ===
                  (window as Window & { __ov25BodyLayerHost?: Element })
                    .__ov25BodyLayerHost,
              };
            }, {
              stickyTop: plan.stickyTop,
              naturalDocumentTop: plan.naturalDocumentTop,
              boundaryDocumentBottom: plan.boundaryDocumentBottom,
            }),
          { timeout: RUNTIME_TIMEOUT },
        )
        .toEqual({
          position: 'sticky',
          pinned: true,
          hostIsLayerChild: true,
          layerIsBodyChild: true,
          layerPosition: 'absolute',
          layerTopAligned: true,
          layerBottomAligned: true,
          bodyLayerCount: 1,
          placeholderCount: 1,
          popover: null,
          popoverOpen: false,
          hostIdentity: true,
        });

      const [hostBox, placeholderBox] = await Promise.all([
        host.boundingBox(),
        placeholder.boundingBox(),
      ]);
      expect(hostBox).not.toBeNull();
      expect(placeholderBox).not.toBeNull();
      fixedWidths.push(hostBox!.width);
      expect(Math.abs(hostBox!.x - placeholderBox!.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(hostBox!.width - placeholderBox!.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(hostBox!.width - plan.hostWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(hostBox!.height - plan.hostHeight)).toBeLessThanOrEqual(1);
      expect(await readClientBlockerStyles(blocker)).toEqual(blockerStyles);
      expectClientLayoutStable(await readClientLayout());
      expect(
        await iframe.evaluate(
          (element) =>
            element ===
            (window as Window & { __ov25BodyLayerIframe?: Element })
              .__ov25BodyLayerIframe,
        ),
      ).toBe(true);
    }
    expect(Math.max(...fixedWidths) - Math.min(...fixedWidths)).toBeLessThanOrEqual(1);

    const boundaryTrajectory = await sampleBodyLayerFrameTrajectory(
      page,
      Math.floor(plan.boundaryEndScrollY - 48),
      Math.ceil(plan.boundaryEndScrollY + 48),
      8,
    );
    expectContinuousBodyLayerTrajectory(
      boundaryTrajectory,
      (sample) =>
        Math.min(
          plan.stickyTop,
          plan.boundaryDocumentBottom - plan.hostHeight - sample.scrollY,
        ),
    );
    expect(
      boundaryTrajectory.every(
        (sample) =>
          sample.bodyLayerCount === 1 &&
          sample.placeholderCount === 1 &&
          sample.inBodyLayer,
      ),
    ).toBe(true);
    expect(new Set(boundaryTrajectory.map((sample) => sample.position))).toEqual(
      new Set(['sticky']),
    );
    expect(
      Math.abs(
        boundaryTrajectory.at(-1)!.bottom -
          boundaryTrajectory.at(-1)!.boundaryBottom,
      ),
    ).toBeLessThanOrEqual(1);

    await scrollAndSettle(boundaryScrollY);
    await expect(bodyLayer).toHaveCount(1);
    await expect(placeholder).toHaveCount(1);
    await expect
      .poll(
        () =>
          host.evaluate((element, stickyTop) => {
            const rect = element.getBoundingClientRect();
            return {
              position: getComputedStyle(element).position,
              exitedBoundary: rect.top < stickyTop - 1,
              inBodyLayer:
                element.closest('[data-ov25-sticky-body-layer]') !== null,
              bodyLayerCount: document.querySelectorAll(
                '[data-ov25-sticky-body-layer]',
              ).length,
              placeholderCount: document.querySelectorAll(
                '[data-ov25-sticky-placeholder]',
              ).length,
              hostIdentity:
                element ===
                (window as Window & { __ov25BodyLayerHost?: Element })
                  .__ov25BodyLayerHost,
            };
          }, plan.stickyTop),
        { timeout: RUNTIME_TIMEOUT },
      )
      .toEqual({
        position: 'sticky',
        exitedBoundary: true,
        inBodyLayer: true,
        bodyLayerCount: 1,
        placeholderCount: 1,
        hostIdentity: true,
      });
    const boundaryHostBox = await host.boundingBox();
    expect(boundaryHostBox).not.toBeNull();
    expect(Math.abs(boundaryHostBox!.width - plan.hostWidth)).toBeLessThanOrEqual(1);
    const boundaryEndGeometry = await host.evaluate((element) => {
      const selectedFallbackBoundary =
        document.querySelector<HTMLElement>('.fixture-product-grid');
      if (!selectedFallbackBoundary) {
        throw new Error('Selected body-layer fallback boundary is missing');
      }
      const hostRect = element.getBoundingClientRect();
      const boundaryRect = selectedFallbackBoundary.getBoundingClientRect();
      return {
        scrollY: window.scrollY,
        hostBottomViewport: hostRect.bottom,
        boundaryBottomViewport: boundaryRect.bottom,
        hostBottomDocument: hostRect.bottom + window.scrollY,
        boundaryBottomDocument: boundaryRect.bottom + window.scrollY,
      };
    });
    expect(
      Math.abs(
        boundaryEndGeometry.hostBottomViewport -
          boundaryEndGeometry.boundaryBottomViewport,
      ),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(
        boundaryEndGeometry.hostBottomDocument -
          boundaryEndGeometry.boundaryBottomDocument,
      ),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(
        boundaryEndGeometry.hostBottomDocument -
          (boundaryEndGeometry.hostBottomViewport + boundaryEndGeometry.scrollY),
      ),
    ).toBeLessThanOrEqual(0.01);
    expect(await readClientBlockerStyles(blocker)).toEqual(blockerStyles);
    expectClientLayoutStable(await readClientLayout());
    await expectSingleRuntimePortalSet(page);

    const boundaryHitTest = await host.evaluate((element) => {
      const fixtureHeader = document.querySelector<HTMLElement>('[data-fixture-header]');
      if (!fixtureHeader) throw new Error('Fixed header is missing');
      const hostRect = element.getBoundingClientRect();
      const headerRect = fixtureHeader.getBoundingClientRect();
      const overlapLeft = Math.max(hostRect.left, headerRect.left);
      const overlapRight = Math.min(hostRect.right, headerRect.right);
      const overlapTop = Math.max(hostRect.top, headerRect.top);
      const overlapBottom = Math.min(hostRect.bottom, headerRect.bottom);
      const pointX = (overlapLeft + overlapRight) / 2;
      const overlapPointY = (overlapTop + overlapBottom) / 2;
      const belowHeaderPointY = Math.ceil(headerRect.bottom) + 1;
      const overlapHit = document.elementFromPoint(pointX, overlapPointY);
      const belowHeaderHit = document.elementFromPoint(pointX, belowHeaderPointY);
      return {
        overlapsHeader: overlapRight > overlapLeft && overlapBottom > overlapTop,
        headerOwnsOverlapPoint:
          overlapHit !== null && fixtureHeader.contains(overlapHit),
        galleryOwnsBelowHeaderPoint:
          belowHeaderHit !== null && element.contains(belowHeaderHit),
      };
    });
    expect(boundaryHitTest).toEqual({
      overlapsHeader: true,
      headerOwnsOverlapPoint: true,
      galleryOwnsBelowHeaderPoint: true,
    });

    const bodyLayerStyleBeforeReverse = await bodyLayer.getAttribute('style');
    const immediateReverseGeometry = await page.evaluate(
      ({ reverseScrollY, stickyTop }) => {
        window.scrollTo(0, reverseScrollY);
        const gallery = document.querySelector<HTMLElement>('#ov25-sticky-gallery');
        const layer = document.querySelector<HTMLElement>('[data-ov25-sticky-body-layer]');
        if (!gallery || !layer) {
          throw new Error('Body-layer sticky track disappeared during reverse scroll');
        }
        const galleryRect = gallery.getBoundingClientRect();
        return {
          scrollY: window.scrollY,
          position: getComputedStyle(gallery).position,
          topError: Math.abs(galleryRect.top - stickyTop),
          bodyLayerCount: document.querySelectorAll(
            '[data-ov25-sticky-body-layer]',
          ).length,
          placeholderCount: document.querySelectorAll(
            '[data-ov25-sticky-placeholder]',
          ).length,
          hostIsLayerChild: gallery.parentElement === layer,
          layerStyle: layer.getAttribute('style'),
        };
      },
      { reverseScrollY: lastFixedScrollY, stickyTop: plan.stickyTop },
    );
    expect(Math.abs(immediateReverseGeometry.scrollY - lastFixedScrollY)).toBeLessThanOrEqual(1);
    expect(immediateReverseGeometry.position).toBe('sticky');
    expect(immediateReverseGeometry.topError).toBeLessThanOrEqual(1);
    expect(immediateReverseGeometry.bodyLayerCount).toBe(1);
    expect(immediateReverseGeometry.placeholderCount).toBe(1);
    expect(immediateReverseGeometry.hostIsLayerChild).toBe(true);
    expect(immediateReverseGeometry.layerStyle).toBe(bodyLayerStyleBeforeReverse);

    await page.setViewportSize(MOBILE_VIEWPORT);
    const mobileHost = page.locator('#ov25-sticky-gallery');
    await expect(mobileHost).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
    await expect(mobileHost).not.toHaveClass(/ov25-inline-sticky-gallery-host/, {
      timeout: RUNTIME_TIMEOUT,
    });
    await expect(mobileHost).not.toHaveAttribute('data-ov25-inline-sticky-active');
    await expect(bodyLayer).toHaveCount(0);
    await expect(placeholder).toHaveCount(0);
    await expect(mobileHost).toHaveCSS('position', 'static');
    await expect
      .poll(() =>
        mobileHost.evaluate((element) => ({
          directChildOfBlocker: element.parentElement?.hasAttribute(
            'data-fixture-gallery-blocker',
          ),
          hostIdentity:
            element ===
            (window as Window & { __ov25BodyLayerHost?: Element })
              .__ov25BodyLayerHost,
          popover: element.getAttribute('popover'),
          popoverOpen: element.matches(':popover-open'),
        })),
      )
      .toEqual({
        directChildOfBlocker: true,
        hostIdentity: true,
        popover: null,
        popoverOpen: false,
      });
    await expect
      .poll(
        async () => (await readBodyLayerHostStyleSnapshot(mobileHost)).current,
        { timeout: RUNTIME_TIMEOUT },
      )
      .toEqual(preRelocationHostStyles.expectedAfterStickyCleanup);
    expect(
      await iframe.evaluate(
        (element) =>
          element ===
          (window as Window & { __ov25BodyLayerIframe?: Element })
            .__ov25BodyLayerIframe,
      ),
    ).toBe(true);
    expect(await readClientBlockerStyles(blocker)).toEqual(blockerStyles);
    await expectSingleRuntimePortalSet(page);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await expect(host).toHaveAttribute('data-ov25-inline-sticky-active', 'true', {
      timeout: RUNTIME_TIMEOUT,
    });
    await expectDesktopStickyLayout(host, header, 106);
    await expect(bodyLayer).toHaveCount(0);
    await expect(placeholder).toHaveCount(0);
    await expect
      .poll(() =>
        host.evaluate((element) => ({
          directChildOfBlocker: element.parentElement?.hasAttribute(
            'data-fixture-gallery-blocker',
          ),
          hostIdentity:
            element ===
            (window as Window & { __ov25BodyLayerHost?: Element })
              .__ov25BodyLayerHost,
        })),
      )
      .toEqual({ directChildOfBlocker: true, hostIdentity: true });
    expect(
      await iframe.evaluate(
        (element) =>
          element ===
          (window as Window & { __ov25BodyLayerIframe?: Element })
            .__ov25BodyLayerIframe,
      ),
    ).toBe(true);
    expect(await readClientBlockerStyles(blocker)).toEqual(blockerStyles);
    await expectSingleRuntimePortalSet(page);
  });

  test('keeps stale mobile list headers below the body-layer gallery while their section exits', async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(
      '/tests/inline-sticky-desktop-fixed-header.html?fallback=body-layer',
    );

    const siteHeader = page.locator('[data-fixture-header]');
    const host = await waitForStickyGallery(page);
    const bodyLayer = page.locator('[data-ov25-sticky-body-layer]');
    const listRoot = page.locator('.ov25-inline-sticky-list-mobile');
    const stickyHeaders = page.locator(
      '.ov25-inline-sticky-list-mobile .ov25-option-header, .ov25-inline-sticky-list-mobile .ov25-group-header',
    );

    await expect(siteHeader).toHaveCount(1);
    await expect(host).toHaveAttribute('data-ov25-inline-sticky-mobile', 'true');
    await expect(listRoot).toHaveCSS('isolation', 'isolate');
    await expect(stickyHeaders.first()).toBeVisible({ timeout: RUNTIME_TIMEOUT });

    const searchBounds = await listRoot.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const documentTop = rect.top + window.scrollY;
      const documentBottom = rect.bottom + window.scrollY;
      const maxScrollY = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      return {
        start: Math.max(0, Math.floor(documentTop - window.innerHeight)),
        end: Math.min(maxScrollY, Math.ceil(documentBottom)),
      };
    });
    expect(searchBounds.end).toBeGreaterThan(searchBounds.start);

    const scrollAndSettle = (scrollY: number) =>
      page.evaluate(
        (nextScrollY) =>
          new Promise<void>((resolve) => {
            window.scrollTo(0, nextScrollY);
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          }),
        scrollY,
      );
    const headerOverlapsGallery = () =>
      stickyHeaders.evaluateAll((headers) => {
        const gallery = document.querySelector<HTMLElement>(
          '#ov25-sticky-gallery',
        );
        if (!gallery) return false;
        const galleryRect = gallery.getBoundingClientRect();
        return headers.some((header) => {
          const rect = header.getBoundingClientRect();
          return (
            rect.right > galleryRect.left &&
            rect.left < galleryRect.right &&
            rect.bottom > galleryRect.top &&
            rect.top < galleryRect.bottom
          );
        });
      });

    let overlapScrollY: number | null = null;
    for (
      let scrollY = searchBounds.start;
      scrollY <= searchBounds.end;
      scrollY += 64
    ) {
      await scrollAndSettle(scrollY);
      if ((await bodyLayer.count()) === 1 && (await headerOverlapsGallery())) {
        overlapScrollY = scrollY;
        break;
      }
    }
    expect(overlapScrollY).not.toBeNull();
    await expect(bodyLayer).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });

    await expect
      .poll(
        () =>
          stickyHeaders.evaluateAll((headers) => {
            const gallery = document.querySelector<HTMLElement>(
              '#ov25-sticky-gallery',
            );
            const layer = document.querySelector<HTMLElement>(
              '[data-ov25-sticky-body-layer]',
            );
            const fixedHeader = document.querySelector<HTMLElement>(
              '[data-fixture-header]',
            );
            const list = headers[0]?.closest<HTMLElement>(
              '.ov25-inline-sticky-list-mobile',
            );
            if (!gallery || !layer || !fixedHeader || !list) {
              return {
                bodyLayerZ: null,
                listIsolation: null,
                staleHeaderOverlapsGallery: false,
                staleHeaderKeepsPositiveStacking: false,
                galleryOwnsOverlapPoint: false,
                siteHeaderOwnsHeaderPoint: false,
              };
            }

            const galleryRect = gallery.getBoundingClientRect();
            const staleHeader = headers.find((header) => {
              const rect = header.getBoundingClientRect();
              return (
                rect.right > galleryRect.left &&
                rect.left < galleryRect.right &&
                rect.bottom > galleryRect.top &&
                rect.top < galleryRect.bottom
              );
            });
            if (!staleHeader) {
              return {
                bodyLayerZ: getComputedStyle(layer).zIndex,
                listIsolation: getComputedStyle(list).isolation,
                staleHeaderOverlapsGallery: false,
                staleHeaderKeepsPositiveStacking: false,
                galleryOwnsOverlapPoint: false,
                siteHeaderOwnsHeaderPoint: false,
              };
            }

            const staleRect = staleHeader.getBoundingClientRect();
            const overlapLeft = Math.max(galleryRect.left, staleRect.left);
            const overlapRight = Math.min(galleryRect.right, staleRect.right);
            const overlapTop = Math.max(galleryRect.top, staleRect.top);
            const overlapBottom = Math.min(galleryRect.bottom, staleRect.bottom);
            const overlapHit = document.elementFromPoint(
              (overlapLeft + overlapRight) / 2,
              (overlapTop + overlapBottom) / 2,
            );
            const fixedHeaderRect = fixedHeader.getBoundingClientRect();
            const headerHit = document.elementFromPoint(
              (fixedHeaderRect.left + fixedHeaderRect.right) / 2,
              (fixedHeaderRect.top + fixedHeaderRect.bottom) / 2,
            );
            const staleHeaderZ = Number.parseFloat(
              getComputedStyle(staleHeader).zIndex,
            );

            return {
              bodyLayerZ: getComputedStyle(layer).zIndex,
              listIsolation: getComputedStyle(list).isolation,
              staleHeaderOverlapsGallery: true,
              staleHeaderKeepsPositiveStacking:
                Number.isFinite(staleHeaderZ) && staleHeaderZ > 0,
              galleryOwnsOverlapPoint:
                overlapHit !== null && gallery.contains(overlapHit),
              siteHeaderOwnsHeaderPoint:
                headerHit !== null && fixedHeader.contains(headerHit),
            };
          }),
        { timeout: RUNTIME_TIMEOUT },
      )
      .toEqual({
        bodyLayerZ: '1',
        listIsolation: 'isolate',
        staleHeaderOverlapsGallery: true,
        staleHeaderKeepsPositiveStacking: true,
        galleryOwnsOverlapPoint: true,
        siteHeaderOwnsHeaderPoint: true,
      });
  });

  test('uses the fixed header offset for auto detection and the explicit selector', async ({
    page,
  }) => {
    for (const query of ['', '?header=explicit']) {
      await page.goto(`/tests/inline-sticky-desktop-fixed-header.html${query}`);

      const header = page.locator('[data-fixture-header]');
      await expect(header).toHaveCount(1);
      await expect(header).toHaveCSS('position', 'fixed');

      const host = await waitForStickyGallery(page);
      await expectDesktopStickyLayout(host, header, 106);
      await expectDefaultDesktopViewerUsesNaturalSquare(page, host, true);
      await expectGalleryColumnStretch(page, host);
      await expectNativeStickyGallery(page, host);

      await page.evaluate(() => window.scrollTo(0, 600));
      await expectNativeStickyGallery(page, host);
      await expectPinnedTop(host, 106 + STICKY_GAP);
      await expectOptionHeaderGapMask(page, 106);
      await expectStickyListHeaderTextAlignment(page, '.ov25-inline-sticky-list');

      await expectNativeStickyBoundaryExit(page, host, header);
    }
  });

  test('keeps the desktop carousel embedded when no desktop selector is configured', async ({
    page,
  }) => {
    await page.goto('/tests/inline-sticky-desktop-fixed-header.html');

    const header = page.locator('[data-fixture-header]');
    const host = await waitForStickyGallery(page);
    await expectDesktopStickyLayout(host, header, 106);
    await expect(page.locator('[data-ov25-external-carousel="true"]')).toHaveCount(0);
    await expect(host.locator('.ov25-inline-sticky-carousel-host')).toHaveCount(1);
    await expectDefaultDesktopViewerUsesNaturalSquare(page, host, true);
  });

  test('pins the sticky iframe shell despite legacy important percentage sizing', async ({
    page,
  }) => {
    await page.setViewportSize(IPAD_LANDSCAPE_VIEWPORT);
    await page.goto('/tests/inline-sticky-desktop-fixed-header.html');

    const host = await waitForStickyGallery(page);
    const outerIframeContainer = page.locator(
      DESKTOP_VIEWER_HEIGHT_SELECTORS.outerIframeContainer,
    );
    await outerIframeContainer.evaluate((element) => {
      const style = document.createElement('style');
      style.dataset.ov25LegacySizingFixture = 'true';
      style.textContent = `
        #ov25-configurator-iframe-container[data-fullscreen="false"],
        #true-ov25-configurator-iframe-container,
        iframe[id^="ov25-configurator-iframe"] {
          width: 100% !important;
          height: 100% !important;
          min-height: 0 !important;
          max-height: 100% !important;
        }
      `;
      element.getRootNode().appendChild(style);
    });

    await expectDefaultDesktopViewerUsesNaturalSquare(page, host, true);
  });

  test('honors a smaller desktop client viewer override under the viewport cap', async ({
    page,
  }) => {
    await page.goto(
      '/tests/inline-sticky-desktop-fixed-header.html?viewer=compact&target=missing',
    );

    await expect(page.locator('.inline-sticky-fixture')).toHaveAttribute(
      'data-viewer-override',
      'compact',
    );
    const header = page.locator('[data-fixture-header]');
    const host = await waitForStickyGallery(page);
    await expectDesktopStickyLayout(host, header, 106);
    await expect(page.locator('[data-ov25-external-carousel="true"]')).toHaveCount(0);
    await expect(host.locator('.ov25-inline-sticky-carousel-host')).toHaveCount(1);

    await expect
      .poll(
        async () => {
          const geometry = await readDesktopViewerGeometry(page, host);
          if (!geometry) return null;
          const iframeLayerHeightError = Math.max(
            Math.abs(
              geometry.outerIframeContainer.height - geometry.iframeSlot.height,
            ),
            Math.abs(
              geometry.trueIframeContainer.height - geometry.iframeSlot.height,
            ),
            Math.abs(geometry.iframe.height - geometry.iframeSlot.height),
          );

          return {
            aspectRatio: geometry.iframeSlot.aspectRatio,
            widthRatio: Math.round(
              (geometry.iframeSlot.width / geometry.content.width) * 100,
            ),
            renderedRatio: Number(
              (geometry.iframeSlot.width / geometry.iframeSlot.height).toFixed(2),
            ),
            hostWithinCap: geometry.height <= geometry.maxHeight + 1,
            hostUsesNaturalHeight:
              geometry.height < geometry.maxHeight - 1 &&
              Math.abs(
                geometry.content.height -
                  geometry.iframeSlot.height -
                  geometry.content.galleryGap -
                  geometry.embeddedCarouselHeight,
              ) <= 1,
            embeddedCarouselPresent: geometry.embeddedCarouselCount === 1,
            iframeLayersMatchSlot: iframeLayerHeightError <= 1,
          };
        },
        { timeout: 10000 },
      )
      .toEqual({
        aspectRatio: '4 / 3',
        widthRatio: 72,
        renderedRatio: 1.33,
        hostWithinCap: true,
        hostUsesNaturalHeight: true,
        embeddedCarouselPresent: true,
        iframeLayersMatchSlot: true,
      });

    const compactViewerHeights = await readDesktopViewerHeights(page, host);
    await expectGalleryColumnStretch(page, host);
    await page.evaluate(() => window.scrollTo(0, 600));
    await expectNativeStickyGallery(page, host);
    await expectPinnedTop(host, 106 + STICKY_GAP);
    await expectDesktopViewerHeightsToRemain(page, host, compactViewerHeights);
  });

  test('tracks compact, hidden, and restored collapsing-header offsets', async ({ page }) => {
    await page.goto('/tests/inline-sticky-desktop-collapsing-header.html');

    const header = page.locator('[data-fixture-header]');
    await expect(header).toHaveAttribute('data-compact', 'false');
    await expect(header).toHaveAttribute('data-hidden', 'false');

    const host = await waitForStickyGallery(page);
    await expectDesktopStickyLayout(host, header, 106);
    await expectDefaultDesktopViewerUsesNaturalSquare(page, host, true);
    await expectGalleryColumnStretch(page, host);
    await expectNativeStickyGallery(page, host);
    const initialViewerHeights = await readDesktopViewerHeights(page, host);
    expect(Object.values(initialViewerHeights).every((height) => height > 1)).toBe(true);

    await page.evaluate(() => window.scrollTo(0, 100));
    await expect(header).toHaveAttribute('data-compact', 'true');
    await expect(header).toHaveAttribute('data-hidden', 'false');
    await expectDesktopStickyLayout(host, header, 54, 'sticky', 106);
    await expectDesktopViewerHeightsToRemain(page, host, initialViewerHeights);

    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(header).toHaveAttribute('data-hidden', 'true');
    await expectDesktopStickyLayout(host, header, 0, 'sticky', 106);
    await expectNativeStickyGallery(page, host);
    await expectPinnedTop(host, STICKY_GAP);
    await expectDesktopViewerHeightsToRemain(page, host, initialViewerHeights);

    await page.evaluate(() => window.scrollTo(0, 540));
    await expect(header).toHaveAttribute('data-hidden', 'false');
    await expectDesktopStickyLayout(host, header, 54, 'sticky', 106);
    await expectNativeStickyGallery(page, host);
    await expectPinnedTop(host, 54 + STICKY_GAP);
    await expectDesktopViewerHeightsToRemain(page, host, initialViewerHeights);

    const boundaryExitScrollY = await host.evaluate((element, stickyGap) => {
      const column = element.parentElement;
      if (!column) return 0;
      const boundaryBottom = column.getBoundingClientRect().bottom + window.scrollY;
      const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      return Math.min(
        maxScrollY,
        Math.ceil(boundaryBottom - element.getBoundingClientRect().height - stickyGap + 96),
      );
    }, STICKY_GAP);
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), boundaryExitScrollY);
    await expect(header).toHaveAttribute('data-hidden', 'true');
    await expect
      .poll(
        () =>
          host.evaluate((element) => {
            const style = getComputedStyle(element);
            return element.getBoundingClientRect().top < Number.parseFloat(style.top) - 1;
          }),
        { timeout: 10000 },
      )
      .toBe(true);
    await expectNativeStickyGallery(page, host);
    await expectDesktopViewerHeightsToRemain(page, host, initialViewerHeights);
  });

  test('keeps blocker fallback natural height constant as the collapsing header hides and returns', async ({ page }) => {
    await page.goto('/tests/inline-sticky-desktop-collapsing-header.html?blocker=1');

    await expect(page.locator('.inline-sticky-fixture')).toHaveAttribute(
      'data-gallery-blocker',
      'true',
    );
    const header = page.locator('[data-fixture-header]');
    const blocker = page.locator('[data-fixture-gallery-blocker]');
    await expect(header).toHaveAttribute('data-compact', 'false');
    await expect(header).toHaveAttribute('data-hidden', 'false');
    await expect(blocker).toHaveCount(1);

    const blockerStyles = await readClientBlockerStyles(blocker);
    expect(blockerStyles.inlineOverflow).toBe('clip');
    expect(blockerStyles.inlineTransform).not.toBe('');
    expect(blockerStyles.computedOverflow).toBe('clip');
    expect(blockerStyles.computedTransform).not.toBe('none');

    const host = await waitForStickyGallery(page);
    const placeholder = page.locator('[data-ov25-sticky-placeholder]');
    const iframe = page.locator('#ov25-configurator-iframe');
    await expectDesktopStickyLayout(host, header, 106);
    const initialViewerHeights = await readDesktopViewerHeights(page, host);
    const initialHostHeight = initialViewerHeights.host;
    expect(Object.values(initialViewerHeights).every((height) => height > 1)).toBe(true);
    expect(initialHostHeight).toBeLessThanOrEqual(762);
    await expectRenderedHeight(host, initialHostHeight);
    await expect(placeholder).toHaveCount(0);
    await iframe.evaluate((element) => {
      (window as Window & { __ov25StickyHeightIframe?: Element }).__ov25StickyHeightIframe =
        element;
    });

    await page.evaluate(() => window.scrollTo(0, 600));

    await expect(header).toHaveAttribute('data-compact', 'true');
    await expect(header).toHaveAttribute('data-hidden', 'true');
    await expect
      .poll(
        () =>
          header.evaluate((element) =>
            Math.round(Math.max(0, element.getBoundingClientRect().bottom)),
          ),
        { timeout: 10000 },
      )
      .toBe(0);
    await expect(placeholder).toHaveCount(1);
    await expect(host).toHaveCSS('position', 'fixed');
    await expectPinnedTop(host, STICKY_GAP);
    await expectRenderedHeight(host, initialHostHeight);
    await expectRenderedHeight(placeholder, initialHostHeight);
    await expectDesktopViewerHeightsToRemain(page, host, initialViewerHeights);
    expect(await readClientBlockerStyles(blocker)).toEqual(blockerStyles);
    expect(
      await iframe.evaluate(
        (element) =>
          element ===
          (window as Window & { __ov25StickyHeightIframe?: Element })
            .__ov25StickyHeightIframe,
      ),
    ).toBe(true);

    await page.evaluate(() => window.scrollTo(0, 540));

    await expect(header).toHaveAttribute('data-compact', 'true');
    await expect(header).toHaveAttribute('data-hidden', 'false');
    await expect
      .poll(
        () =>
          header.evaluate((element) =>
            Math.round(Math.max(0, element.getBoundingClientRect().bottom)),
          ),
        { timeout: 10000 },
      )
      .toBe(54);
    await expect(placeholder).toHaveCount(1);
    await expect(host).toHaveCSS('position', 'fixed');
    await expectPinnedTop(host, 54 + STICKY_GAP);
    await expectRenderedHeight(host, initialHostHeight);
    await expectRenderedHeight(placeholder, initialHostHeight);
    await expectDesktopViewerHeightsToRemain(page, host, initialViewerHeights);
    expect(await readClientBlockerStyles(blocker)).toEqual(blockerStyles);
    expect(
      await iframe.evaluate(
        (element) =>
          element ===
          (window as Window & { __ov25StickyHeightIframe?: Element })
            .__ov25StickyHeightIframe,
      ),
    ).toBe(true);
  });

  test('keeps blocker fallback geometry fixed while carousel fullscreen opens', async ({ page }) => {
    await page.goto(
      '/tests/inline-sticky-desktop-no-header.html?blocker=1&carousel=stacked',
    );

    const host = await waitForStickyGallery(page);
    const iframe = page.locator('#ov25-configurator-iframe');
    await iframe.evaluate((element) => {
      (window as Window & { __ov25FullscreenIframe?: Element }).__ov25FullscreenIframe =
        element;
    });
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(page.locator('[data-ov25-sticky-placeholder]')).toHaveCount(1, {
      timeout: 10000,
    });
    await expect(host).toHaveCSS('position', 'fixed');
    await expectPinnedTop(host, STICKY_GAP);

    const imageButton = page.locator('#ov25-product-carousel .ov25-gallery-image-button').first();
    await expect(imageButton).toBeVisible();
    await imageButton.click();
    await expect(page.locator('img[alt="Fullscreen"]')).toHaveCount(1);
    await expect(host).toHaveAttribute('data-ov25-inline-sticky-fullscreen', 'true');
    await expect(host).toHaveCSS('position', 'fixed');
    await expectPinnedTop(host, STICKY_GAP);
    await expect(page.locator('[data-ov25-sticky-placeholder]')).toHaveCount(1);
    expect(
      await iframe.evaluate(
        (element) =>
          element ===
          (window as Window & { __ov25FullscreenIframe?: Element }).__ov25FullscreenIframe,
      ),
    ).toBe(true);

    await page.keyboard.press('Escape');
    await expect(page.locator('img[alt="Fullscreen"]')).toHaveCount(0);
    await expect(host).toHaveAttribute('data-ov25-inline-sticky-fullscreen', 'false');
    await expect(host).toHaveCSS('position', 'fixed');
    await expectPinnedTop(host, STICKY_GAP);
  });

  test('scopes client viewer overrides and host box ownership across sticky desktop and ordinary mobile inline', async ({
    page,
  }) => {
    await page.goto(
      `${RESPONSIVE_FIXTURE_PATH}?mobileMode=inline&viewer=compact&hostBox=content-box`,
    );

    await expect(page.locator('.inline-sticky-fixture')).toHaveAttribute(
      'data-gallery-host-box',
      'content-box',
    );

    const host = await waitForStickyGallery(page);
    const iframe = page.locator('#ov25-configurator-iframe');
    await expectGalleryColumnStretch(page, host);
    await expectStickyContentBoxHostWithinCaps(host);
    expect(await readIframeSlotGeometry(page)).toMatchObject({
      hasStickyClass: true,
      aspectRatio: '4 / 3',
    });
    await iframe.evaluate((element) => {
      (window as Window & { __ov25ResponsiveIframe?: Element }).__ov25ResponsiveIframe =
        element;
    });
    await page.evaluate(() => window.scrollTo(0, 600));
    await expectNativeStickyGallery(page, host);

    await page.setViewportSize(MOBILE_VIEWPORT);
    const mobileHost = page.locator('#ov25-sticky-gallery');
    await expect(mobileHost).toHaveCount(1, { timeout: 10000 });
    await expect(mobileHost).not.toHaveClass(/ov25-inline-sticky-gallery-host/, {
      timeout: 10000,
    });
    await expect(mobileHost).not.toHaveAttribute('data-ov25-inline-sticky-active');
    await expect(page.locator('[data-ov25-sticky-placeholder]')).toHaveCount(0);
    await expect(page.locator('[data-ov25-sticky-body-layer]')).toHaveCount(0);
    await expect(mobileHost).toHaveCSS('position', 'static');
    await expect(mobileHost).toHaveCSS('box-sizing', 'content-box');
    const ordinaryMobileSlot = await readIframeSlotGeometry(page);
    expect(ordinaryMobileSlot.hasStickyClass).toBe(false);
    expect(ordinaryMobileSlot.aspectRatio).toBe('1 / 1');
    expect(Math.abs(ordinaryMobileSlot.width - ordinaryMobileSlot.height)).toBeLessThanOrEqual(1);
    expect(
      await mobileHost.evaluate((element) => ({
        popover: element.getAttribute('popover'),
        inlinePosition: (element as HTMLElement).style.getPropertyValue('position'),
        inlineBoxSizing: (element as HTMLElement).style.getPropertyValue('box-sizing'),
        inlineBoxSizingPriority: (element as HTMLElement).style.getPropertyPriority('box-sizing'),
        stickyTop: (element as HTMLElement).style.getPropertyValue('--ov25-sticky-top'),
        stickyHeight: (element as HTMLElement).style.getPropertyValue(
          '--ov25-sticky-available-height',
        ),
      })),
    ).toEqual({
      popover: null,
      inlinePosition: '',
      inlineBoxSizing: 'content-box',
      inlineBoxSizingPriority: '',
      stickyTop: '',
      stickyHeight: '',
    });
    expect(
      await iframe.evaluate(
        (element) =>
          element ===
          (window as Window & { __ov25ResponsiveIframe?: Element }).__ov25ResponsiveIframe,
      ),
    ).toBe(true);

    await page.setViewportSize(DESKTOP_VIEWPORT);
    await expect(host).toHaveAttribute('data-ov25-inline-sticky-mobile', 'false', {
      timeout: 10000,
    });
    await expectStickyContentBoxHostWithinCaps(host);
    expect(await readIframeSlotGeometry(page)).toMatchObject({
      hasStickyClass: true,
      aspectRatio: '4 / 3',
    });
    expect(
      await iframe.evaluate(
        (element) =>
          element ===
          (window as Window & { __ov25ResponsiveIframe?: Element }).__ov25ResponsiveIframe,
      ),
    ).toBe(true);
  });

  for (const scenario of RESPONSIVE_SCENARIOS) {
    test(`supports mobile external-carousel sticky layout with ${scenario.label}`, async ({
      page,
    }) => {
      await expectResponsiveMobileScenario(page, scenario);
    });
  }

  test('keeps ordinary mobile inline lists internally scrollable', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(`${RESPONSIVE_FIXTURE_PATH}?mobileMode=inline`);

    await expect(page.locator('#ov25-configurator-iframe')).toHaveCount(1, {
      timeout: RUNTIME_TIMEOUT,
    });
    await expectViewerCornerMode(page, 'configured');
    await expectMobileVariantsUseInternalScroll(page);
  });

  test('keeps the mobile stacked gallery iframe path square', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(`${RESPONSIVE_FIXTURE_PATH}?stackedGallery=1`);

    await expect(page.locator('.inline-sticky-fixture')).toHaveAttribute(
      'data-stacked-gallery-trigger',
      'true',
    );
    const host = await waitForStickyGallery(page);
    await expect(host).toHaveAttribute('data-ov25-inline-sticky-mobile', 'true');

    const outerContainer = page.locator('#ov25-configurator-iframe-container');
    const trueContainer = page.locator('#true-ov25-configurator-iframe-container');
    await expect(outerContainer).toHaveAttribute('data-stacked', 'true');
    await expect(
      outerContainer.locator('#true-ov25-configurator-iframe-container'),
    ).toHaveCount(0);
    await expect(trueContainer).toHaveCount(1);
    await expect(page.locator('#ov25-configurator-iframe')).toHaveCount(1);
    await expectViewerCornerMode(page, 'square');
  });

  test('falls back to one embedded mobile carousel when the target is missing', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (message) => consoleMessages.push(message.text()));

    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(`${RESPONSIVE_FIXTURE_PATH}?target=missing`);

    await expect(page.locator('.inline-sticky-fixture')).toHaveAttribute(
      'data-missing-carousel-target',
      'true',
    );
    const host = await waitForStickyGallery(page);
    await expect(host).toHaveAttribute('data-ov25-inline-sticky-mobile', 'true');
    await expect(page.locator('[data-ov25-sticky-mobile-carousel]')).toHaveCount(0);
    await expect(page.locator('[data-ov25-external-carousel]')).toHaveCount(0);

    const embeddedCarousel = page.locator('#true-carousel');
    await expect(embeddedCarousel).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
    await expect(embeddedCarousel.locator('#ov25-product-carousel')).toHaveCount(1);
    await expectSingleRuntimePortalSet(page);
    await expect
      .poll(
        () =>
          consoleMessages.filter((message) =>
            message.includes(
              'Carousel target "[data-ov25-sticky-mobile-carousel]" was not found; using the embedded carousel',
            ),
          ).length,
        { timeout: 10000 },
      )
      .toBeGreaterThan(0);
  });

  test('switches desktop to mobile and back without duplicate portals', async ({ page }) => {
    await page.goto(RESPONSIVE_FIXTURE_PATH);

    const host = await waitForStickyGallery(page);
    const carouselTarget = page.locator('[data-ov25-sticky-mobile-carousel]');
    const externalCarousel = page.locator('[data-ov25-external-carousel]');
    await expect(host).toHaveAttribute('data-ov25-inline-sticky-mobile', 'false');
    await expect(carouselTarget).toHaveCount(1);
    await expect(carouselTarget).not.toBeVisible();
    await expect(externalCarousel).toHaveCount(0);
    await expect(page.locator('.ov25-inline-sticky-gallery-root-desktop')).toHaveCount(1);
    await expect(page.locator('.ov25-inline-sticky-gallery-root-mobile')).toHaveCount(0);
    await expect(page.locator('#true-carousel')).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
    await expectSingleRuntimePortalSet(page);
    await expectViewerCornerMode(page, 'configured');

    await page.setViewportSize(MOBILE_VIEWPORT);
    await expect(host).toHaveAttribute('data-ov25-inline-sticky-mobile', 'true', {
      timeout: 10000,
    });
    await expect(carouselTarget).toBeVisible();
    await expect(page.locator('.ov25-inline-sticky-gallery-root-desktop')).toHaveCount(0);
    await expect(page.locator('.ov25-inline-sticky-gallery-root-mobile')).toHaveCount(1);
    await expect(externalCarousel).toHaveCount(1, { timeout: RUNTIME_TIMEOUT });
    await expect(page.locator('#true-carousel')).toHaveCount(0);
    await expectSingleRuntimePortalSet(page);
    await expectViewerCornerMode(page, 'square');

    await page.setViewportSize(DESKTOP_VIEWPORT);
    await expect(host).toHaveAttribute('data-ov25-inline-sticky-mobile', 'false', {
      timeout: 10000,
    });
    await expect(carouselTarget).not.toBeVisible();
    await expect(page.locator('.ov25-inline-sticky-gallery-root-desktop')).toHaveCount(1);
    await expect(page.locator('.ov25-inline-sticky-gallery-root-mobile')).toHaveCount(0);
    await expect(externalCarousel).toHaveCount(0);
    await expect(page.locator('#true-carousel')).toHaveCount(1, {
      timeout: RUNTIME_TIMEOUT,
    });
    await expectSingleRuntimePortalSet(page);
    await expectViewerCornerMode(page, 'configured');
  });
});
