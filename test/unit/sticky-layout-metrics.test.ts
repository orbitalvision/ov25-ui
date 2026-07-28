import { describe, expect, it, vi } from 'vitest';
import {
  calculateStickyBodyFallbackGeometry,
  classifyStickyAncestor,
  createStickyLayoutCssVariables,
  detectStickyHeaderElements,
  findCommonStickyBoundary,
  findSufficientStickyBoundary,
  getLargestVisibleHeaderBottom,
  inspectStickyAncestors,
  isOv25OwnedElement,
  measureStickyHeaderOffset,
  measureStickyTravel,
  OV25_INJECTOR_OWNED_ATTRIBUTE,
  repairOv25OwnedStickyBlocker,
  resolveStickyHeaderElements,
  resolveStickyLayoutGaps,
} from '../../src/lib/sticky-layout-controller';

type RectInput = {
  top: number;
  left?: number;
  width?: number;
  height: number;
};

function rect(input: RectInput): DOMRect {
  const left = input.left ?? 0;
  const width = input.width ?? 1200;
  return {
    x: left,
    y: input.top,
    top: input.top,
    left,
    width,
    height: input.height,
    right: left + width,
    bottom: input.top + input.height,
    toJSON: () => ({}),
  } as DOMRect;
}

function mockRect(element: Element, input: RectInput) {
  return vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(rect(input));
}

describe('sticky header metrics and detection', () => {
  it('uses the largest visible bottom for stacked/overlapping headers and clamps it', () => {
    document.body.innerHTML = `
      <div id="announcement"></div>
      <div id="header"></div>
      <div id="hidden"></div>
      <div id="offscreen"></div>
    `;
    const announcement = document.getElementById('announcement')!;
    const header = document.getElementById('header')!;
    const hidden = document.getElementById('hidden')!;
    const offscreen = document.getElementById('offscreen')!;
    mockRect(announcement, { top: 0, height: 32 });
    mockRect(header, { top: 20, height: 900 });
    mockRect(hidden, { top: 0, height: 300 });
    mockRect(offscreen, { top: -100, height: 50 });
    hidden.setAttribute('aria-hidden', 'true');

    expect(
      getLargestVisibleHeaderBottom(
        [announcement, header, hidden, offscreen],
        800,
      ),
    ).toBe(800);
  });

  it('returns zero without throwing for missing or invalid selectors', () => {
    document.body.innerHTML = '<main></main>';
    expect(measureStickyHeaderOffset(document, undefined, 800, undefined, 1200)).toBe(0);
    expect(() => measureStickyHeaderOffset(document, '[', 800, undefined, 1200)).not.toThrow();
    expect(measureStickyHeaderOffset(document, '[', 800, undefined, 1200)).toBe(0);
  });

  it('auto-detects Dawn/Horizon section groups and measures nested stacked candidates once', () => {
    document.body.innerHTML = `
      <div id="header-group">
        <div id="announcement" class="shopify-section-group-header-group"></div>
        <div id="header-section" class="header-section shopify-section-group-header-group">
          <div id="header-component"></div>
        </div>
      </div>
      <main><div class="section-header" id="content-heading"></div></main>
    `;
    const group = document.getElementById('header-group')!;
    const announcement = document.getElementById('announcement')!;
    const headerSection = document.getElementById('header-section')!;
    const header = document.getElementById('header-component')!;
    const contentHeading = document.getElementById('content-heading')!;
    mockRect(group, { top: 0, height: 104 });
    mockRect(announcement, { top: 0, height: 28 });
    mockRect(headerSection, { top: 28, height: 76 });
    mockRect(header, { top: 28, height: 76 });
    mockRect(contentHeading, { top: 200, height: 80 });

    const detected = detectStickyHeaderElements(document, {
      viewportWidth: 1200,
      viewportHeight: 800,
    });

    expect(detected.status).toBe('resolved');
    expect(detected.source).toBe('auto');
    expect(detected.elements).toEqual([group, announcement, headerSection, header]);
    expect(getLargestVisibleHeaderBottom(detected.elements, 800)).toBe(104);
    expect(detected.elements).not.toContain(contentHeading);
  });

  it('filters hidden duplicates, implausible dimensions, and OV25/content subtrees', () => {
    document.body.innerHTML = `
      <div id="SiteHeader"></div>
      <header id="site-header"></header>
      <main><header id="header"></header></main>
      <div id="ov25-provider-root"><header class="site-header"></header></div>
      <header class="theme__header" id="visible-header"></header>
    `;
    const hidden = document.getElementById('SiteHeader')!;
    const tooTall = document.getElementById('site-header')!;
    const content = document.querySelector('main #header')!;
    const ov25 = document.querySelector('#ov25-provider-root header')!;
    const visible = document.getElementById('visible-header')!;
    hidden.style.display = 'none';
    mockRect(hidden, { top: 0, height: 90 });
    mockRect(tooTall, { top: 0, height: 700 });
    mockRect(content, { top: 100, height: 60 });
    mockRect(ov25, { top: 0, height: 60 });
    mockRect(visible, { top: 0, height: 72 });

    const detected = detectStickyHeaderElements(document, {
      viewportWidth: 1200,
      viewportHeight: 800,
    });

    expect(detected.elements).toEqual([visible]);
  });

  it('rejects off-canvas and mid-viewport strong candidates while keeping a static top header', () => {
    document.body.innerHTML = `
      <div id="SiteHeader"></div>
      <div id="header-component"></div>
      <div id="HeaderWrapper"></div>
    `;
    const offCanvas = document.getElementById('SiteHeader')!;
    const midViewport = document.getElementById('header-component')!;
    const staticTop = document.getElementById('HeaderWrapper')!;
    mockRect(offCanvas, { top: 0, left: -1400, width: 1200, height: 72 });
    mockRect(midViewport, { top: 400, height: 72 });
    mockRect(staticTop, { top: 20, height: 72 });

    const detected = detectStickyHeaderElements(document, {
      viewportWidth: 1200,
      viewportHeight: 800,
    });

    expect(detected.elements).toEqual([staticTop]);
  });

  it('guards semantic fallback headers by position or document origin', () => {
    document.body.innerHTML = `
      <header id="near"></header>
      <header id="far" role="banner"></header>
      <header id="fixed" role="banner"></header>
    `;
    const near = document.getElementById('near')!;
    const far = document.getElementById('far')!;
    const fixed = document.getElementById('fixed')!;
    mockRect(near, { top: 0, height: 70 });
    mockRect(far, { top: 600, height: 70 });
    mockRect(fixed, { top: 70, height: 50 });
    fixed.style.position = 'fixed';

    const detected = detectStickyHeaderElements(document, {
      viewportWidth: 1200,
      viewportHeight: 800,
      scrollY: 1000,
    });

    expect(detected.elements).toEqual([fixed]);
    expect(detected.elements).not.toContain(far);
  });

  it('gives a valid explicit override precedence, waits on no match, and auto-falls back on invalid CSS', () => {
    document.body.innerHTML = `
      <div id="SiteHeader"></div>
      <div class="custom-header"></div>
    `;
    const automatic = document.getElementById('SiteHeader')!;
    const custom = document.querySelector('.custom-header')!;
    mockRect(automatic, { top: 0, height: 100 });
    mockRect(custom, { top: 0, height: 44 });
    const options = { viewportWidth: 1200, viewportHeight: 800 };

    const override = resolveStickyHeaderElements(document, '.custom-header', options);
    expect(override.source).toBe('override');
    expect(override.elements).toEqual([custom]);
    expect(getLargestVisibleHeaderBottom(override.elements, 800)).toBe(44);

    const waiting = resolveStickyHeaderElements(document, '.late-header', options);
    expect(waiting.source).toBe('override');
    expect(waiting.status).toBe('not-found');
    expect(waiting.elements).toEqual([]);

    const invalid = resolveStickyHeaderElements(document, '[', options);
    expect(invalid.source).toBe('auto-fallback');
    expect(invalid.overrideSelector).toBe('[');
    expect(invalid.overrideError).toBeTruthy();
    expect(invalid.elements).toEqual([automatic]);
  });

  it('creates valid light-DOM metrics with overrideable 16px gap fallbacks', () => {
    const variables = createStickyLayoutCssVariables(38.126, 47.999);

    expect(variables).toEqual({
      '--ov25-sticky-header-offset': '38.13px',
      '--ov25-sticky-resolved-top-gap': '16px',
      '--ov25-sticky-resolved-bottom-gap': '16px',
      '--ov25-sticky-top':
        'calc(var(--ov25-sticky-header-offset, 0px) + var(--ov25-sticky-resolved-top-gap, 16px))',
      '--ov25-sticky-available-height':
        'calc(100dvh - var(--ov25-sticky-sizing-header-offset, var(--ov25-sticky-header-offset, 0px)) - var(--ov25-sticky-resolved-top-gap, 16px) - var(--ov25-sticky-resolved-bottom-gap, 16px))',
      '--ov25-sticky-option-header-height': '48px',
    });
    expect(variables).not.toHaveProperty('--ov25-sticky-top-gap');
    expect(variables).not.toHaveProperty('--ov25-sticky-bottom-gap');
  });

  it('resolves one gap source with outer overrides before inner branding hosts', () => {
    document.body.innerHTML = `
      <div id="gallery">
        <div id="ov-25-configurator-gallery-container"
          style="--ov25-sticky-top-gap: 24px; --ov25-sticky-bottom-gap: 20px"></div>
      </div>
      <div id="variants"
        style="--ov25-sticky-top-gap: 30px; --ov25-sticky-bottom-gap: 28px"></div>
    `;
    const gallery = document.getElementById('gallery')!;
    const variants = document.getElementById('variants')!;

    expect(resolveStickyLayoutGaps(gallery, variants, window)).toEqual({
      top: 24,
      bottom: 20,
    });

    const inner = document.getElementById('ov-25-configurator-gallery-container')!;
    inner.style.setProperty('--ov25-sticky-top-gap', '16px');
    inner.style.setProperty('--ov25-sticky-bottom-gap', '16px');
    expect(resolveStickyLayoutGaps(gallery, variants, window)).toEqual({
      top: 30,
      bottom: 28,
    });

    gallery.style.setProperty('--ov25-sticky-top-gap', '12px');
    expect(resolveStickyLayoutGaps(gallery, variants, window)).toEqual({
      top: 12,
      bottom: 28,
    });
  });
});

describe('sticky ancestor recovery and body fallback data', () => {
  it('requires the explicit injector marker on the element itself for repair ownership', () => {
    document.body.innerHTML = `
      <div id="ov25-provider-root">
        <div id="client-descendant" class="ov25-layout" data-ov25-runtime style="overflow-y: hidden">
          <div id="host"></div>
        </div>
      </div>
    `;
    const provider = document.getElementById('ov25-provider-root')!;
    const descendant = document.getElementById('client-descendant')!;
    const host = document.getElementById('host')!;
    const blocker = inspectStickyAncestors(host).blockers.find(
      (entry) => entry.element === descendant,
    )!;

    expect(isOv25OwnedElement(provider)).toBe(false);
    expect(isOv25OwnedElement(descendant)).toBe(false);
    expect(blocker.ownedByOv25).toBe(false);
    expect(repairOv25OwnedStickyBlocker(blocker)).toBeNull();
    expect(descendant.style.overflowY).toBe('hidden');

    provider.setAttribute(OV25_INJECTOR_OWNED_ATTRIBUTE, '');
    expect(isOv25OwnedElement(provider)).toBe(true);
    expect(isOv25OwnedElement(descendant)).toBe(false);
  });

  it('excludes body, documentElement, and the document scrolling root from blockers', () => {
    document.body.innerHTML = `
      <div id="scroll-root" style="overflow-y: hidden">
        <div id="host"></div>
      </div>
    `;
    const scrollingRoot = document.getElementById('scroll-root')!;
    const host = document.getElementById('host')!;
    const originalScrollingElement = Object.getOwnPropertyDescriptor(document, 'scrollingElement');
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflowY = 'hidden';
    Object.defineProperty(document, 'scrollingElement', {
      configurable: true,
      value: scrollingRoot,
    });

    try {
      expect(classifyStickyAncestor(document.body)).toBeNull();
      expect(classifyStickyAncestor(document.documentElement)).toBeNull();
      expect(classifyStickyAncestor(scrollingRoot)).toBeNull();
      expect(inspectStickyAncestors(host).blockers).toEqual([]);
      expect(findCommonStickyBoundary([host])).toBeNull();
    } finally {
      document.body.style.removeProperty('overflow-y');
      document.documentElement.style.removeProperty('overflow-y');
      if (originalScrollingElement) {
        Object.defineProperty(document, 'scrollingElement', originalScrollingElement);
      } else {
        delete (document as Document & { scrollingElement?: Element }).scrollingElement;
      }
    }
  });

  it('classifies external blockers without treating ancestor stretch as a blocker', () => {
    document.body.innerHTML = `
      <div id="grid"><div id="client"><div id="host"></div></div></div>
    `;
    const grid = document.getElementById('grid')!;
    const client = document.getElementById('client')!;
    const host = document.getElementById('host')!;
    grid.style.display = 'grid';
    grid.style.alignItems = 'stretch';
    client.style.overflowY = 'auto';
    client.style.maxHeight = '300px';
    client.style.contain = 'layout paint';
    client.style.transform = 'translateZ(0)';
    Object.defineProperty(client, 'clientHeight', { configurable: true, value: 300 });
    Object.defineProperty(client, 'scrollHeight', { configurable: true, value: 600 });
    const originalStyle = client.getAttribute('style');

    const inspection = inspectStickyAncestors(host);
    const blocker = inspection.blockers.find((entry) => entry.element === client)!;

    expect(blocker.reasons).toEqual([
      'vertical-scroll-container',
      'constrained-height',
      'contain-layout',
      'contain-paint',
      'transform-containing-block',
    ]);
    expect(blocker.ownedByOv25).toBe(false);
    expect(inspection.requiresBodyFallback).toBe(true);
    expect(repairOv25OwnedStickyBlocker(blocker)).toBeNull();
    expect(client.getAttribute('style')).toBe(originalStyle);
  });

  it('does not require body fallback for ordinary stretched product grid/flex ancestors', () => {
    document.body.innerHTML = `
      <section class="product-section" id="product-grid">
        <div id="product-flex">
          <div id="product-column"><div id="host"></div></div>
        </div>
      </section>
    `;
    const grid = document.getElementById('product-grid')!;
    const flex = document.getElementById('product-flex')!;
    const host = document.getElementById('host')!;
    grid.style.display = 'grid';
    grid.style.alignItems = 'stretch';
    flex.style.display = 'flex';
    flex.style.alignItems = 'stretch';

    const inspection = inspectStickyAncestors(host);

    expect(inspection.blockers).toEqual([]);
    expect(inspection.externalBlockers).toEqual([]);
    expect(inspection.requiresBodyFallback).toBe(false);
  });

  it('repairs stretch on an OV25 sticky host and restores its inline style', () => {
    document.body.innerHTML = `
      <section id="product-grid">
        <div id="ov25-gallery-host" ${OV25_INJECTOR_OWNED_ATTRIBUTE}></div>
      </section>
    `;
    const grid = document.getElementById('product-grid')!;
    const host = document.getElementById('ov25-gallery-host')!;
    grid.style.display = 'grid';
    grid.style.alignItems = 'stretch';

    const inspection = inspectStickyAncestors(host);
    const blocker = inspection.blockers.find((entry) => entry.element === host)!;

    expect(blocker.reasons).toEqual(['flex-grid-stretch']);
    expect(blocker.ownedByOv25).toBe(true);
    expect(inspection.requiresBodyFallback).toBe(false);

    const repair = repairOv25OwnedStickyBlocker(blocker)!;
    expect(host.style.getPropertyValue('align-self')).toBe('flex-start');

    repair.restore();
    expect(host.style.getPropertyValue('align-self')).toBe('');
  });

  it('repairs only an OV25-owned wrapper and restores its inline values', () => {
    document.body.innerHTML = `
      <div id="ov25-layout-wrapper" ${OV25_INJECTOR_OWNED_ATTRIBUTE}>
        <div id="host"></div>
      </div>
    `;
    const wrapper = document.getElementById('ov25-layout-wrapper')!;
    wrapper.style.setProperty('overflow-y', 'hidden', 'important');
    wrapper.style.setProperty('max-height', '240px');
    wrapper.style.setProperty('contain', 'paint');
    wrapper.style.setProperty('transform', 'translateZ(0)');
    const blocker = classifyStickyAncestor(wrapper)!;

    expect(blocker.ownedByOv25).toBe(true);
    const repair = repairOv25OwnedStickyBlocker(blocker)!;
    expect(wrapper.style.getPropertyValue('overflow-y')).toBe('visible');
    expect(wrapper.style.getPropertyValue('max-height')).toBe('none');
    expect(wrapper.style.getPropertyValue('contain')).toBe('none');
    expect(wrapper.style.getPropertyValue('transform')).toBe('none');

    repair.restore();
    expect(wrapper.style.getPropertyValue('overflow-y')).toBe('hidden');
    expect(wrapper.style.getPropertyValue('max-height')).toBe('240px');
    expect(wrapper.style.getPropertyValue('contain')).toBe('paint');
    expect(wrapper.style.getPropertyValue('transform')).toBe('translateZ(0)');
  });

  it('climbs an OV25 LCA only to the first external boundary and rejects document roots', () => {
    document.body.innerHTML = `
      <section id="client-boundary">
        <div id="ov25-layout" ${OV25_INJECTOR_OWNED_ATTRIBUTE}>
          <div id="gallery"></div>
          <div id="variants"></div>
        </div>
      </section>
    `;
    const clientBoundary = document.getElementById('client-boundary')!;
    const gallery = document.getElementById('gallery')!;
    const variants = document.getElementById('variants')!;

    expect(findCommonStickyBoundary([gallery, variants])).toBe(clientBoundary);

    clientBoundary.remove();
    document.body.innerHTML = `
      <div id="ov25-layout" ${OV25_INJECTOR_OWNED_ATTRIBUTE}>
        <div id="gallery"></div>
        <div id="variants"></div>
      </div>
    `;
    expect(
      findCommonStickyBoundary([
        document.getElementById('gallery'),
        document.getElementById('variants'),
      ]),
    ).toBeNull();
    expect(findCommonStickyBoundary([document.head, document.body])).toBeNull();
  });

  it('uses the true LCA inside a broader product selector for fallback geometry', () => {
    document.body.innerHTML = `
      <section class="product-section" id="product">
        <div id="product-layout">
          <div><div id="gallery"></div></div>
          <div><div id="variants"></div></div>
        </div>
      </section>
    `;
    const product = document.getElementById('product')!;
    const productLayout = document.getElementById('product-layout')!;
    const gallery = document.getElementById('gallery')!;
    const variants = document.getElementById('variants')!;
    const galleryRect = mockRect(gallery, {
      top: 50,
      left: 120,
      width: 520,
      height: 300,
    });
    const productLayoutRect = mockRect(productLayout, {
      top: -200,
      width: 1200,
      height: 700,
    });

    expect(findCommonStickyBoundary([gallery, variants])).toBe(productLayout);
    expect(findCommonStickyBoundary([gallery, variants])).not.toBe(product);
    expect(
      calculateStickyBodyFallbackGeometry({
        placeholder: gallery,
        stickyTop: 80,
        boundary: productLayout,
        scrollY: 400,
      }),
    ).toMatchObject({
      mode: 'fixed',
      stickyTop: 80,
      fixedLeft: 120,
      fixedWidth: 520,
      fixedHeight: 300,
      boundary: productLayout,
      boundaryBottom: 500,
      boundaryEndTop: 200,
      documentEndTop: 600,
    });

    productLayoutRect.mockReturnValue(rect({ top: -500, width: 1200, height: 700 }));
    expect(
      calculateStickyBodyFallbackGeometry({
        placeholder: gallery,
        stickyTop: 80,
        boundary: productLayout,
        scrollY: 700,
      }).mode,
    ).toBe('absolute-end');

    galleryRect.mockReturnValue(rect({ top: 100, left: 120, width: 520, height: 300 }));
    expect(
      calculateStickyBodyFallbackGeometry({
        placeholder: gallery,
        stickyTop: 80,
        boundary: productLayout,
      }).mode,
    ).toBe('flow');
  });

  it('widens a boundary with insufficient travel to the product section but not main content', () => {
    document.body.innerHTML = `
      <main id="main">
        <section id="product">
          <div id="grid">
            <div id="gallery-column"><div id="gallery"></div></div>
            <aside><div id="variants"></div></aside>
          </div>
        </section>
        <section id="following"></section>
      </main>
    `;
    const main = document.getElementById('main')!;
    const product = document.getElementById('product')!;
    const grid = document.getElementById('grid')!;
    const galleryColumn = document.getElementById('gallery-column')!;
    const gallery = document.getElementById('gallery')!;
    const variants = document.getElementById('variants')!;
    mockRect(main, { top: 0, height: 2600 });
    const productRect = mockRect(product, { top: 220, height: 1485 });
    mockRect(grid, { top: 276, height: 898 });
    const galleryColumnRect = mockRect(galleryColumn, { top: 276, height: 898 });
    mockRect(gallery, { top: 276, height: 868 });
    mockRect(variants, { top: 276, height: 898 });

    expect(measureStickyTravel(gallery, galleryColumn, 16)).toEqual({
      requiredTravel: 260,
      availableTravel: 30,
      insufficient: true,
    });
    galleryColumnRect.mockReturnValue(rect({ top: 16, height: 898 }));
    expect(
      measureStickyTravel(gallery, galleryColumn, 16, {
        naturalDocumentTop: 276,
        scrollY: 260,
      }),
    ).toEqual({
      requiredTravel: 260,
      availableTravel: 30,
      insufficient: true,
    });
    expect(findCommonStickyBoundary([gallery, variants])).toBe(grid);
    expect(findSufficientStickyBoundary(grid, gallery, 16)).toBe(product);

    productRect.mockReturnValue(rect({ top: 220, height: 900 }));
    expect(findSufficientStickyBoundary(grid, gallery, 16)).toBeNull();
  });
});
