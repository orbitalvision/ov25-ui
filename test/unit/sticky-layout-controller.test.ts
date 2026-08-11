import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  classifyStickyAncestor,
  createStickyLayoutController,
  findCommonStickyBoundary,
  findSufficientStickyBoundary,
  getStickyHostNaturalDocumentTop,
  observeStickyHostNaturalDocumentTop,
  OV25_INJECTOR_OWNED_ATTRIBUTE,
  STICKY_OPTION_HEADER_PINNED_ATTRIBUTE,
  type StickyLayoutDiagnostic,
} from '../../src/lib/sticky-layout-controller';

function domRect(top: number, height: number, width = 1200, left = 0): DOMRect {
  return {
    x: left,
    y: top,
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  } as DOMRect;
}

function setRect(element: Element, top: number, height: number, width = 1200, left = 0) {
  return vi
    .spyOn(element, 'getBoundingClientRect')
    .mockReturnValue(domRect(top, height, width, left));
}

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();

  constructor(readonly callback: ResizeObserverCallback) {
    ResizeObserverMock.instances.push(this);
  }

  trigger() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

class MutationObserverMock {
  static instances: MutationObserverMock[] = [];
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();
  readonly takeRecords = vi.fn(() => []);

  constructor(readonly callback: MutationCallback) {
    MutationObserverMock.instances.push(this);
  }

  trigger(records: MutationRecord[] = []) {
    this.callback(records, this as unknown as MutationObserver);
  }
}

class VisualViewportMock extends EventTarget {
  width = 1200;
  height = 800;
}

describe('sticky layout controller lifecycle', () => {
  let frames: Map<number, FrameRequestCallback>;
  let nextFrameId: number;
  let requestFrame: ReturnType<typeof vi.fn>;
  let cancelFrame: ReturnType<typeof vi.fn>;
  let visualViewport: VisualViewportMock;

  beforeEach(() => {
    document.body.innerHTML = '';
    ResizeObserverMock.instances = [];
    MutationObserverMock.instances = [];
    frames = new Map();
    nextFrameId = 1;
    requestFrame = vi.fn((callback: FrameRequestCallback) => {
      const id = nextFrameId++;
      frames.set(id, callback);
      return id;
    });
    cancelFrame = vi.fn((id: number) => frames.delete(id));
    visualViewport = new VisualViewportMock();

    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      value: requestFrame,
    });
    Object.defineProperty(window, 'cancelAnimationFrame', {
      configurable: true,
      value: cancelFrame,
    });
    Object.defineProperty(window, 'ResizeObserver', {
      configurable: true,
      value: ResizeObserverMock,
    });
    Object.defineProperty(window, 'MutationObserver', {
      configurable: true,
      value: MutationObserverMock,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: visualViewport,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as Window & { ResizeObserver?: unknown }).ResizeObserver;
    delete (window as Window & { MutationObserver?: unknown }).MutationObserver;
    delete (window as Window & { visualViewport?: unknown }).visualViewport;
    delete (window as Window & { requestAnimationFrame?: unknown }).requestAnimationFrame;
    delete (window as Window & { cancelAnimationFrame?: unknown }).cancelAnimationFrame;
    document.body.style.removeProperty('overflow-y');
    document.documentElement.style.removeProperty('overflow-x');
    document.documentElement.style.removeProperty('overflow-y');
    document.body.innerHTML = '';
  });

  function flushFrame() {
    const pending = [...frames.entries()];
    frames.clear();
    for (const [, callback] of pending) callback(performance.now());
  }

  function installLayout() {
    document.body.innerHTML = `
      <div id="theme-header" class="shopify-section-group-header-group"></div>
      <section id="product" class="product-section">
        <div id="client-blocker" style="overflow-y: hidden">
          <div id="ov25-layout-wrapper" ${OV25_INJECTOR_OWNED_ATTRIBUTE} style="overflow-y: hidden">
            <div id="gallery"></div>
            <div id="option-header"></div>
          </div>
        </div>
        <div id="variants"></div>
      </section>
    `;
    const header = document.getElementById('theme-header')!;
    const product = document.getElementById('product')!;
    const clientBlocker = document.getElementById('client-blocker')!;
    const ownedWrapper = document.getElementById('ov25-layout-wrapper')!;
    const gallery = document.getElementById('gallery')!;
    const variants = document.getElementById('variants')!;
    const optionHeader = document.getElementById('option-header')!;
    setRect(header, 0, 72);
    setRect(product, -100, 900);
    setRect(gallery, 100, 400, 520, 80);
    setRect(variants, 100, 700, 520, 640);
    setRect(optionHeader, 100, 46, 520, 640);
    return {
      header,
      product,
      clientBlocker,
      ownedWrapper,
      gallery,
      variants,
      optionHeader,
    };
  }

  it('falls back for body overflow when HTML overflow is non-visible', () => {
    document.body.innerHTML = `
      <section id="product">
        <div id="gallery"></div>
        <div id="variants"></div>
      </section>
      <div id="outside"></div>
    `;
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    const product = document.getElementById('product')!;
    const gallery = document.getElementById('gallery')!;
    const variants = document.getElementById('variants')!;
    const outside = document.getElementById('outside')!;
    const previousDescriptor = Object.getOwnPropertyDescriptor(document, 'scrollingElement');
    Object.defineProperty(document, 'scrollingElement', {
      configurable: true,
      value: document.documentElement,
    });
    setRect(document.body, 0, 1600);
    setRect(product, 100, 1200);
    setRect(gallery, 100, 400);

    try {
      expect(classifyStickyAncestor(document.body)).toMatchObject({
        element: document.body,
        reasons: ['vertical-overflow-clipping'],
        ownedByOv25: false,
      });
      expect(classifyStickyAncestor(document.documentElement)).toBeNull();
      expect(findCommonStickyBoundary([gallery, variants])).toBe(product);
      expect(findCommonStickyBoundary([gallery, outside])).toBeNull();
      expect(findSufficientStickyBoundary(document.body, gallery, 16)).toBeNull();
      expect(findSufficientStickyBoundary(document.documentElement, gallery, 16)).toBeNull();

      const controller = createStickyLayoutController({
        document,
        galleryHost: gallery,
        variantsHost: variants,
        onDiagnostic: () => {},
      });
      controller.start();
      flushFrame();
      expect(controller.getSnapshot()).toMatchObject({
        requiresBodyFallback: true,
        fallbackBoundary: product,
      });
      expect(
        controller
          .getSnapshot()
          .ancestorBlockers.some((blocker) => blocker.element === document.body),
      ).toBe(true);
      controller.destroy();
    } finally {
      if (previousDescriptor) {
        Object.defineProperty(document, 'scrollingElement', previousDescriptor);
      } else {
        delete (document as Document & { scrollingElement?: Element }).scrollingElement;
      }
      document.body.style.removeProperty('overflow-y');
      document.documentElement.style.removeProperty('overflow-x');
    }
  });

  it('exempts body from blocker classification when body is the actual scrolling element', () => {
    document.body.style.overflowY = 'hidden';
    const previousDescriptor = Object.getOwnPropertyDescriptor(document, 'scrollingElement');
    Object.defineProperty(document, 'scrollingElement', {
      configurable: true,
      value: document.body,
    });

    try {
      expect(classifyStickyAncestor(document.body)).toBeNull();
      expect(classifyStickyAncestor(document.documentElement)).toBeNull();
    } finally {
      if (previousDescriptor) {
        Object.defineProperty(document, 'scrollingElement', previousDescriptor);
      } else {
        delete (document as Document & { scrollingElement?: Element }).scrollingElement;
      }
      document.body.style.removeProperty('overflow-y');
    }
  });

  function installFlowAnchorLayout(options: {
    scrollY?: number;
    parentDocumentTop?: number;
    galleryTop?: number;
    headerHeight?: number;
  } = {}) {
    document.body.innerHTML = `
      <div id="theme-header" class="shopify-section-group-header-group"></div>
      <main>
        <section id="product">
          <div id="grid">
            <div id="gallery-column"><div id="gallery"></div></div>
            <aside><div id="variants"></div></aside>
          </div>
        </section>
      </main>
    `;
    const header = document.getElementById('theme-header')!;
    const product = document.getElementById('product')!;
    const grid = document.getElementById('grid')!;
    const galleryColumn = document.getElementById('gallery-column')!;
    const gallery = document.getElementById('gallery')!;
    const variants = document.getElementById('variants')!;
    const state = {
      scrollY: options.scrollY ?? 0,
      parentDocumentTop: options.parentDocumentTop ?? 276,
      galleryTop:
        options.galleryTop ??
        (options.parentDocumentTop ?? 276) - (options.scrollY ?? 0),
      headerHeight: options.headerHeight ?? 0,
    };
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => state.scrollY,
    });
    vi.spyOn(header, 'getBoundingClientRect').mockImplementation(() =>
      domRect(0, state.headerHeight),
    );
    vi.spyOn(product, 'getBoundingClientRect').mockImplementation(() =>
      domRect(220 - state.scrollY, 1485),
    );
    vi.spyOn(grid, 'getBoundingClientRect').mockImplementation(() =>
      domRect(state.parentDocumentTop - state.scrollY, 898),
    );
    vi.spyOn(galleryColumn, 'getBoundingClientRect').mockImplementation(() =>
      domRect(state.parentDocumentTop - state.scrollY, 898),
    );
    vi.spyOn(gallery, 'getBoundingClientRect').mockImplementation(() =>
      domRect(state.galleryTop, 868, 560),
    );
    vi.spyOn(variants, 'getBoundingClientRect').mockImplementation(() =>
      domRect(state.parentDocumentTop - state.scrollY, 898, 480, 640),
    );
    return { state, header, product, grid, galleryColumn, gallery, variants };
  }

  function installStretchRepairLayout(options: {
    display?: 'block' | 'grid' | 'flex';
    flexDirection?: 'row' | 'column';
    stretchResolves?: boolean;
    alignSelf?: string;
    alignSelfPriority?: string;
    columnHeight?: string;
    columnMaxHeight?: string;
    containerBlocker?: boolean;
    galleryColumnHeight?: number;
    variantsHeight?: number;
  } = {}) {
    const display = options.display ?? 'grid';
    const flexDirection = options.flexDirection ?? 'row';
    document.body.innerHTML = `
      <main>
        <section id="product">
          <div id="layout" style="display: ${display}; flex-direction: ${flexDirection}; align-items: start">
            <div id="gallery-column"><div id="gallery"></div></div>
            <aside><div id="variants"></div></aside>
          </div>
        </section>
      </main>
    `;
    const product = document.getElementById('product')!;
    const container = document.getElementById('layout')!;
    const galleryColumn = document.getElementById('gallery-column')!;
    const gallery = document.getElementById('gallery')!;
    const variants = document.getElementById('variants')!;
    const nativeSetProperty = galleryColumn.style.setProperty.bind(galleryColumn.style);
    const nativeGetPropertyPriority = galleryColumn.style.getPropertyPriority.bind(
      galleryColumn.style,
    );
    const nativeRemoveProperty = galleryColumn.style.removeProperty.bind(
      galleryColumn.style,
    );
    let alignSelfPriority = options.alignSelfPriority ?? '';
    if (options.alignSelf) {
      nativeSetProperty('align-self', options.alignSelf, alignSelfPriority);
    }
    if (options.columnHeight) nativeSetProperty('height', options.columnHeight);
    if (options.columnMaxHeight) nativeSetProperty('max-height', options.columnMaxHeight);
    if (options.containerBlocker) {
      container.style.overflow = 'hidden';
      container.style.transform = 'translateZ(0)';
    }
    // JSDOM drops priority for standard properties, so retain it for ownership assertions.
    const setProperty = vi
      .spyOn(galleryColumn.style, 'setProperty')
      .mockImplementation((property, value, priority) => {
        nativeSetProperty(property, value, priority);
        if (property === 'align-self') alignSelfPriority = priority;
      });
    vi.spyOn(galleryColumn.style, 'getPropertyPriority').mockImplementation((property) =>
      property === 'align-self'
        ? alignSelfPriority
        : nativeGetPropertyPriority(property),
    );
    vi.spyOn(galleryColumn.style, 'removeProperty').mockImplementation((property) => {
      const previous = nativeRemoveProperty(property);
      if (property === 'align-self') alignSelfPriority = '';
      return previous;
    });
    const state = {
      stretchResolves: options.stretchResolves !== false,
      containerTop: 240,
      containerHeight: 1200,
      variantsHeight: options.variantsHeight ?? 1200,
    };
    setRect(product, 180, 1500);
    vi.spyOn(container, 'getBoundingClientRect').mockImplementation(() =>
      domRect(state.containerTop, state.containerHeight),
    );
    vi.spyOn(galleryColumn, 'getBoundingClientRect').mockImplementation(() => {
      const stretchApplied =
        galleryColumn.style.getPropertyValue('align-self') === 'stretch';
      const height = stretchApplied && state.stretchResolves
        ? state.containerHeight
        : (options.galleryColumnHeight ?? 320);
      return domRect(240, height, 560);
    });
    setRect(gallery, 240, 300, 560);
    vi.spyOn(variants, 'getBoundingClientRect').mockImplementation(() =>
      domRect(240, state.variantsHeight, 480, 640),
    );
    return {
      state,
      product,
      container,
      galleryColumn,
      gallery,
      variants,
      setProperty,
    };
  }

  it('falls back when the gallery parent reaches sticky top but ends before variants', () => {
    const layout = installStretchRepairLayout({
      display: 'block',
      galleryColumnHeight: 600,
    });
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(true);
    expect(
      controller
        .getSnapshot()
        .ancestorBlockers.some(
          (blocker) =>
            blocker.element === layout.galleryColumn &&
            blocker.reasons.includes('insufficient-sticky-travel'),
        ),
    ).toBe(true);
    controller.destroy();
  });

  it('keeps native sticky when stretching the gallery parent through the variants', () => {
    const layout = installStretchRepairLayout({
      galleryColumnHeight: 600,
      alignSelf: 'self-start',
      alignSelfPriority: 'important',
    });
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(false);
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('stretch');
    expect(
      controller
        .getSnapshot()
        .ancestorBlockers.some((blocker) =>
          blocker.reasons.includes('insufficient-sticky-travel'),
        ),
    ).toBe(false);
    controller.destroy();
  });

  it('queues a follow-up measurement when sizing changes after the current frame is queued', () => {
    const layout = installLayout();
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });

    controller.start();
    expect(frames).toHaveLength(1);

    controller.scheduleMeasure({ afterCurrentFrame: true });
    flushFrame();

    expect(frames).toHaveLength(1);
    controller.destroy();
  });

  it('rechecks sticky travel when the original gallery parent becomes measurable', () => {
    const layout = installLayout();
    const galleryParent = layout.gallery.parentElement!;
    layout.clientBlocker.style.overflowY = 'visible';
    layout.ownedWrapper.style.overflowY = 'visible';
    const parentRect = vi
      .spyOn(galleryParent, 'getBoundingClientRect')
      .mockReturnValue(domRect(100, 800));
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
    });

    controller.start();
    flushFrame();
    expect(controller.getSnapshot().requiresBodyFallback).toBe(false);

    parentRect.mockReturnValue(domRect(100, 410));
    ResizeObserverMock.instances[0].trigger();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(true);
    controller.destroy();
  });

  it.each([
    { display: 'grid' as const, flexDirection: 'row' as const },
    { display: 'flex' as const, flexDirection: 'row' as const },
  ])('stretches an eligible $display gallery column and keeps the repair stable', (layoutType) => {
    const layout = installStretchRepairLayout({
      ...layoutType,
      alignSelf: 'self-start',
      alignSelfPriority: 'important',
    });
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(false);
    expect(
      controller
        .getSnapshot()
        .ancestorBlockers.some((blocker) =>
          blocker.reasons.includes('insufficient-sticky-travel'),
        ),
    ).toBe(false);
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('stretch');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');

    MutationObserverMock.instances[0].trigger([
      {
        type: 'attributes',
        target: layout.galleryColumn,
        attributeName: 'style',
      } as unknown as MutationRecord,
    ]);
    ResizeObserverMock.instances[0].trigger();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(false);
    expect(
      layout.setProperty.mock.calls.filter(
        ([property, value]) => property === 'align-self' && value === 'stretch',
      ),
    ).toHaveLength(1);

    controller.destroy();
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('self-start');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');
  });

  it.each([
    { display: 'block' as const, flexDirection: 'row' as const },
    { display: 'flex' as const, flexDirection: 'column' as const },
  ])('does not stretch an ineligible $display/$flexDirection gallery column', (layoutType) => {
    const layout = installStretchRepairLayout({
      ...layoutType,
      alignSelf: 'center',
      alignSelfPriority: 'important',
    });
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(true);
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('center');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');
    controller.destroy();
  });

  it('caches an unsuccessful stretch until variants geometry changes', () => {
    const layout = installStretchRepairLayout({
      stretchResolves: false,
      alignSelf: 'center',
      alignSelfPriority: 'important',
    });
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(true);
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('center');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');

    MutationObserverMock.instances[0].trigger([
      {
        type: 'attributes',
        target: layout.galleryColumn,
        attributeName: 'style',
      } as unknown as MutationRecord,
    ]);
    ResizeObserverMock.instances[0].trigger();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(true);
    expect(
      layout.setProperty.mock.calls.filter(
        ([property, value]) => property === 'align-self' && value === 'stretch',
      ),
    ).toHaveLength(1);
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('center');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');

    layout.state.variantsHeight = 1400;
    ResizeObserverMock.instances[0].trigger();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(true);
    expect(
      layout.setProperty.mock.calls.filter(
        ([property, value]) => property === 'align-self' && value === 'stretch',
      ),
    ).toHaveLength(2);
    controller.destroy();
  });

  it('retries a failed stretch after container geometry and column constraints change', () => {
    const layout = installStretchRepairLayout({
      stretchResolves: false,
      alignSelf: 'center',
      alignSelfPriority: 'important',
      columnHeight: '320px',
      columnMaxHeight: '320px',
    });
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();
    expect(controller.getSnapshot().requiresBodyFallback).toBe(true);
    expect(
      layout.setProperty.mock.calls.filter(
        ([property, value]) => property === 'align-self' && value === 'stretch',
      ),
    ).toHaveLength(1);

    layout.state.containerHeight = 1400;
    layout.state.stretchResolves = true;
    layout.container.style.alignItems = 'normal';
    layout.galleryColumn.style.removeProperty('height');
    layout.galleryColumn.style.removeProperty('max-height');
    MutationObserverMock.instances[0].trigger([
      {
        type: 'attributes',
        target: layout.container,
        attributeName: 'style',
      } as unknown as MutationRecord,
      {
        type: 'attributes',
        target: layout.galleryColumn,
        attributeName: 'style',
      } as unknown as MutationRecord,
    ]);
    ResizeObserverMock.instances[0].trigger();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(false);
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('stretch');
    expect(
      layout.setProperty.mock.calls.filter(
        ([property, value]) => property === 'align-self' && value === 'stretch',
      ),
    ).toHaveLength(2);
    controller.destroy();
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('center');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');
  });

  it('skips the column stretch when an external gallery blocker requires fallback', () => {
    const layout = installStretchRepairLayout({
      alignSelf: 'self-start',
      alignSelfPriority: 'important',
      containerBlocker: true,
    });
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(true);
    expect(
      controller
        .getSnapshot()
        .ancestorBlockers.some((blocker) => blocker.element === layout.container),
    ).toBe(true);
    expect(
      layout.setProperty.mock.calls.filter(
        ([property, value]) => property === 'align-self' && value === 'stretch',
      ),
    ).toHaveLength(0);
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('self-start');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');
    controller.destroy();
  });

  it('restores a successful stretch when final blocker resolution still requires fallback', () => {
    const layout = installStretchRepairLayout({
      alignSelf: 'self-start',
      alignSelfPriority: 'important',
      containerBlocker: true,
    });
    layout.container.setAttribute(OV25_INJECTOR_OWNED_ATTRIBUTE, '');
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      repairOwnedWrappers: false,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(true);
    expect(
      layout.setProperty.mock.calls.filter(
        ([property, value]) => property === 'align-self' && value === 'stretch',
      ),
    ).toHaveLength(1);
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('self-start');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');

    MutationObserverMock.instances[0].trigger([
      {
        type: 'attributes',
        target: layout.galleryColumn,
        attributeName: 'style',
      } as unknown as MutationRecord,
    ]);
    ResizeObserverMock.instances[0].trigger();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(true);
    expect(
      layout.setProperty.mock.calls.filter(
        ([property, value]) => property === 'align-self' && value === 'stretch',
      ),
    ).toHaveLength(1);
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('self-start');

    layout.container.style.overflow = 'visible';
    layout.container.style.transform = 'none';
    MutationObserverMock.instances[0].trigger([
      {
        type: 'attributes',
        target: layout.container,
        attributeName: 'style',
      } as unknown as MutationRecord,
    ]);
    ResizeObserverMock.instances[0].trigger();
    flushFrame();

    expect(controller.getSnapshot().requiresBodyFallback).toBe(false);
    expect(
      layout.setProperty.mock.calls.filter(
        ([property, value]) => property === 'align-self' && value === 'stretch',
      ),
    ).toHaveLength(2);
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('stretch');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');
    controller.destroy();
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('self-start');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');
  });

  it('relinquishes an externally overwritten stretch through mutation, rebind, and destroy', () => {
    const layout = installStretchRepairLayout({
      alignSelf: 'self-start',
      alignSelfPriority: 'important',
    });
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    controller.start();
    flushFrame();
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('stretch');

    layout.galleryColumn.style.setProperty('align-self', 'center', 'important');
    MutationObserverMock.instances[0].trigger([
      {
        type: 'attributes',
        target: layout.galleryColumn,
        attributeName: 'style',
      } as unknown as MutationRecord,
    ]);
    flushFrame();
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('center');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');

    const replacementHost = document.createElement('div');
    layout.container.appendChild(replacementHost);
    controller.setElements({ galleryHost: replacementHost });
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('center');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');

    controller.destroy();
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('center');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');
  });

  it('relinquishes ownership when external code removes the managed stretch', () => {
    const layout = installStretchRepairLayout({
      alignSelf: 'self-start',
      alignSelfPriority: 'important',
    });
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    controller.start();
    flushFrame();
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('stretch');

    layout.galleryColumn.style.removeProperty('align-self');
    MutationObserverMock.instances[0].trigger([
      {
        type: 'attributes',
        target: layout.galleryColumn,
        attributeName: 'style',
      } as unknown as MutationRecord,
    ]);
    flushFrame();
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('');

    controller.destroy();
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('');
  });

  it('restores the gallery column before rebinding the gallery host', () => {
    const layout = installStretchRepairLayout({
      alignSelf: 'self-start',
      alignSelfPriority: 'important',
    });
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    controller.start();
    flushFrame();
    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('stretch');

    const replacementHost = document.createElement('div');
    layout.container.appendChild(replacementHost);
    controller.setElements({ galleryHost: replacementHost });

    expect(layout.galleryColumn.style.getPropertyValue('align-self')).toBe('self-start');
    expect(layout.galleryColumn.style.getPropertyPriority('align-self')).toBe('important');
    controller.destroy();
  });

  it('preserves pre-existing host variables when destroyed before its first measurement', () => {
    const layout = installLayout();
    layout.gallery.style.setProperty('--ov25-sticky-header-offset', '41px', 'important');
    layout.variants.style.setProperty('--ov25-sticky-option-header-height', '27px');
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });

    controller.start();
    expect(frames).toHaveLength(1);
    controller.destroy();

    expect(layout.gallery.style.getPropertyValue('--ov25-sticky-header-offset')).toBe('41px');
    expect(layout.gallery.style.getPropertyPriority('--ov25-sticky-header-offset')).toBe(
      'important',
    );
    expect(layout.variants.style.getPropertyValue('--ov25-sticky-option-header-height')).toBe(
      '27px',
    );
  });

  it('uses gap overrides and owns the measured viewport geometry', () => {
    const layout = installLayout();
    const galleryRect = vi.mocked(layout.gallery.getBoundingClientRect);
    galleryRect.mockReturnValue(domRect(140, 400, 520, 80));
    layout.gallery.style.setProperty('--ov25-sticky-top-gap', '24px');
    layout.gallery.style.setProperty('--ov25-sticky-bottom-gap', '20px');
    layout.gallery.style.setProperty('--ov25-sticky-gallery-bottom', '512px', 'important');
    layout.variants.style.setProperty('--ov25-sticky-gallery-bottom', '498px');
    layout.gallery.style.setProperty('--ov25-sticky-viewport-width', '412px', 'important');
    layout.gallery.style.setProperty('--ov25-sticky-sizing-header-offset', '61px', 'important');
    layout.variants.style.setProperty('--ov25-sticky-sizing-header-offset', '59px');
    const clientWidth = vi
      .spyOn(document.documentElement, 'clientWidth', 'get')
      .mockReturnValue(375);
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      topGapOverride: 0,
      bottomGapOverride: 0,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();

    expect(controller.getSnapshot()).toMatchObject({ topGap: 0, bottomGap: 0 });
    for (const host of [layout.gallery, layout.variants]) {
      expect(host.style.getPropertyValue('--ov25-sticky-resolved-top-gap')).toBe('0px');
      expect(host.style.getPropertyValue('--ov25-sticky-resolved-bottom-gap')).toBe('0px');
      expect(host.style.getPropertyValue('--ov25-sticky-gallery-bottom')).toBe('540px');
      expect(host.style.getPropertyValue('--ov25-sticky-viewport-width')).toBe('375px');
      expect(host.style.getPropertyValue('--ov25-sticky-sizing-header-offset')).toBe('72px');
    }

    galleryRect.mockReturnValue(domRect(88, 400, 520, 80));
    clientWidth.mockReturnValue(360);
    controller.scheduleMeasure();
    flushFrame();
    expect(layout.gallery.style.getPropertyValue('--ov25-sticky-gallery-bottom')).toBe(
      '488px',
    );
    expect(layout.variants.style.getPropertyValue('--ov25-sticky-gallery-bottom')).toBe(
      '488px',
    );
    expect(layout.gallery.style.getPropertyValue('--ov25-sticky-viewport-width')).toBe(
      '360px',
    );
    expect(layout.variants.style.getPropertyValue('--ov25-sticky-viewport-width')).toBe(
      '360px',
    );

    controller.destroy();
    expect(layout.gallery.style.getPropertyValue('--ov25-sticky-gallery-bottom')).toBe(
      '512px',
    );
    expect(layout.gallery.style.getPropertyPriority('--ov25-sticky-gallery-bottom')).toBe(
      'important',
    );
    expect(layout.variants.style.getPropertyValue('--ov25-sticky-gallery-bottom')).toBe(
      '498px',
    );
    expect(layout.gallery.style.getPropertyValue('--ov25-sticky-viewport-width')).toBe(
      '412px',
    );
    expect(layout.gallery.style.getPropertyPriority('--ov25-sticky-viewport-width')).toBe(
      'important',
    );
    expect(layout.variants.style.getPropertyValue('--ov25-sticky-viewport-width')).toBe('');
    expect(layout.gallery.style.getPropertyValue('--ov25-sticky-sizing-header-offset')).toBe(
      '61px',
    );
    expect(
      layout.gallery.style.getPropertyPriority('--ov25-sticky-sizing-header-offset'),
    ).toBe('important');
    expect(layout.variants.style.getPropertyValue('--ov25-sticky-sizing-header-offset')).toBe(
      '59px',
    );
  });

  it('coalesces observers/events, reconnects replaced targets, classifies blockers, and cleans up', () => {
    const layout = installLayout();
    const clientStyle = layout.clientBlocker.getAttribute('style');
    const changes = vi.fn();
    const diagnostics: StickyLayoutDiagnostic[] = [];
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      optionHeader: layout.optionHeader,
      onChange: changes,
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });

    controller.start();
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('orientationchange'));
    visualViewport.dispatchEvent(new Event('scroll'));
    visualViewport.dispatchEvent(new Event('resize'));
    expect(requestFrame).toHaveBeenCalledTimes(1);
    expect(frames).toHaveLength(1);

    flushFrame();
    const firstSnapshot = controller.getSnapshot();
    expect(firstSnapshot.headerOffset).toBe(72);
    expect(firstSnapshot.headerSource).toBe('auto');
    expect(firstSnapshot.optionHeaderHeight).toBe(46);
    expect(firstSnapshot.requiresBodyFallback).toBe(true);
    expect(firstSnapshot.fallbackBoundary).toBe(layout.product);
    expect(firstSnapshot.ancestorBlockers.some((entry) => entry.element === layout.clientBlocker)).toBe(true);
    expect(layout.clientBlocker.getAttribute('style')).toBe(clientStyle);
    expect(layout.ownedWrapper.style.getPropertyValue('overflow-y')).toBe('visible');
    expect(layout.gallery.style.getPropertyValue('--ov25-sticky-header-offset')).toBe('72px');
    expect(layout.variants.style.getPropertyValue('--ov25-sticky-option-header-height')).toBe('46px');
    expect(changes).toHaveBeenCalledTimes(1);
    expect(
      diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'sticky-blocking-ancestor' &&
          diagnostic.element === layout.clientBlocker &&
          diagnostic.requiresBodyFallback,
      ),
    ).toBe(true);

    const resizeObserver = ResizeObserverMock.instances[0];
    const mutationObserver = MutationObserverMock.instances[0];
    expect(resizeObserver.observe).toHaveBeenCalledWith(layout.header);
    expect(resizeObserver.observe).toHaveBeenCalledWith(layout.gallery);
    expect(resizeObserver.observe).toHaveBeenCalledWith(layout.variants);
    expect(resizeObserver.observe).toHaveBeenCalledWith(layout.optionHeader);
    expect(resizeObserver.observe).toHaveBeenCalledWith(layout.clientBlocker);
    expect(resizeObserver.observe).toHaveBeenCalledWith(layout.ownedWrapper);
    expect(resizeObserver.observe).toHaveBeenCalledWith(layout.product);
    expect(resizeObserver.observe).toHaveBeenCalledWith(layout.gallery.parentElement);
    expect(mutationObserver.observe).toHaveBeenCalledWith(
      document.documentElement,
      expect.objectContaining({ attributes: true, childList: true, subtree: true }),
    );

    layout.header.remove();
    const replacementHeader = document.createElement('div');
    replacementHeader.className = 'shopify-section-group-header-group';
    setRect(replacementHeader, 0, 88);
    document.body.prepend(replacementHeader);
    mutationObserver.trigger();
    mutationObserver.trigger();
    resizeObserver.trigger();
    expect(frames).toHaveLength(1);
    flushFrame();

    const replacementSnapshot = controller.getSnapshot();
    expect(replacementSnapshot.headerOffset).toBe(88);
    expect(replacementSnapshot.headerElements).toContain(replacementHeader);
    expect(resizeObserver.disconnect).toHaveBeenCalled();
    expect(resizeObserver.observe).toHaveBeenCalledWith(replacementHeader);

    window.dispatchEvent(new Event('scroll'));
    expect(frames).toHaveLength(1);
    controller.destroy();
    expect(frames).toHaveLength(0);
    expect(cancelFrame).toHaveBeenCalled();
    expect(resizeObserver.disconnect).toHaveBeenCalled();
    expect(mutationObserver.disconnect).toHaveBeenCalled();
    expect(layout.ownedWrapper.style.getPropertyValue('overflow-y')).toBe('hidden');
    expect(layout.gallery.style.getPropertyValue('--ov25-sticky-header-offset')).toBe('');
    expect(layout.variants.style.getPropertyValue('--ov25-sticky-option-header-height')).toBe('');

    const frameCallCount = requestFrame.mock.calls.length;
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
    visualViewport.dispatchEvent(new Event('scroll'));
    expect(requestFrame).toHaveBeenCalledTimes(frameCallCount);
  });

  it('marks only pinned option headers and clears owned markers on rebind and destroy', () => {
    const layout = installLayout();
    layout.ownedWrapper.classList.add('ov25-inline-sticky-list');
    layout.optionHeader.classList.add('ov25-option-header');
    layout.optionHeader.style.position = 'sticky';
    const firstHeaderRect = vi.mocked(layout.optionHeader.getBoundingClientRect);

    const secondHeader = document.createElement('div');
    secondHeader.className = 'ov25-option-header';
    secondHeader.style.position = 'sticky';
    layout.ownedWrapper.appendChild(secondHeader);
    const secondHeaderRect = setRect(secondHeader, 500, 46, 520, 640);

    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      optionHeader: layout.optionHeader,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();
    expect(layout.optionHeader).not.toHaveAttribute(
      STICKY_OPTION_HEADER_PINNED_ATTRIBUTE,
    );
    expect(secondHeader).not.toHaveAttribute(STICKY_OPTION_HEADER_PINNED_ATTRIBUTE);

    firstHeaderRect.mockReturnValue(domRect(88, 46, 520, 640));
    controller.scheduleMeasure();
    flushFrame();
    expect(layout.optionHeader).toHaveAttribute(
      STICKY_OPTION_HEADER_PINNED_ATTRIBUTE,
      'true',
    );
    expect(secondHeader).not.toHaveAttribute(STICKY_OPTION_HEADER_PINNED_ATTRIBUTE);

    firstHeaderRect.mockReturnValue(domRect(40, 46, 520, 640));
    secondHeaderRect.mockReturnValue(domRect(88, 46, 520, 640));
    controller.scheduleMeasure();
    flushFrame();
    expect(layout.optionHeader).not.toHaveAttribute(
      STICKY_OPTION_HEADER_PINNED_ATTRIBUTE,
    );
    expect(secondHeader).toHaveAttribute(
      STICKY_OPTION_HEADER_PINNED_ATTRIBUTE,
      'true',
    );

    controller.setElements({ optionHeader: null });
    expect(secondHeader).not.toHaveAttribute(STICKY_OPTION_HEADER_PINNED_ATTRIBUTE);

    firstHeaderRect.mockReturnValue(domRect(88, 46, 520, 640));
    secondHeaderRect.mockReturnValue(domRect(500, 46, 520, 640));
    controller.setElements({ optionHeader: layout.optionHeader });
    flushFrame();
    expect(layout.optionHeader).toHaveAttribute(
      STICKY_OPTION_HEADER_PINNED_ATTRIBUTE,
      'true',
    );

    controller.destroy();
    expect(layout.optionHeader).not.toHaveAttribute(
      STICKY_OPTION_HEADER_PINNED_ATTRIBUTE,
    );
  });

  it('captures nested document scrolls for scheduling and removes the listener on destroy', () => {
    const layout = installLayout();
    const addDocumentListener = vi.spyOn(document, 'addEventListener');
    const removeDocumentListener = vi.spyOn(document, 'removeEventListener');
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });

    controller.start();
    const scrollRegistration = addDocumentListener.mock.calls.find(
      ([eventName]) => eventName === 'scroll',
    );
    expect(scrollRegistration?.[2]).toEqual(
      expect.objectContaining({ capture: true, passive: true }),
    );
    flushFrame();

    const frameCallCount = requestFrame.mock.calls.length;
    layout.clientBlocker.dispatchEvent(new Event('scroll'));
    expect(requestFrame).toHaveBeenCalledTimes(frameCallCount + 1);
    expect(frames).toHaveLength(1);
    flushFrame();

    controller.destroy();
    expect(removeDocumentListener).toHaveBeenCalledWith(
      'scroll',
      scrollRegistration?.[1],
      { capture: true },
    );
    const destroyedFrameCallCount = requestFrame.mock.calls.length;
    layout.clientBlocker.dispatchEvent(new Event('scroll'));
    expect(requestFrame).toHaveBeenCalledTimes(destroyedFrameCallCount);
    expect(frames).toHaveLength(0);
  });

  it('uses automatic detection after an invalid override and emits that warning once', () => {
    const layout = installLayout();
    const diagnostics: StickyLayoutDiagnostic[] = [];
    const controller = createStickyLayoutController({
      document,
      headerSelector: '[',
      galleryHost: layout.gallery,
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });

    controller.start();
    flushFrame();
    expect(controller.getSnapshot()).toMatchObject({
      headerOffset: 72,
      headerSource: 'auto-fallback',
      headerStatus: 'resolved',
    });

    window.dispatchEvent(new Event('scroll'));
    flushFrame();
    expect(
      diagnostics.filter((diagnostic) => diagnostic.code === 'header-selector-invalid'),
    ).toHaveLength(1);
    controller.destroy();
  });

  it('reports variants-only blockers without requesting gallery relocation', () => {
    document.body.innerHTML = `
      <section id="product">
        <div id="gallery"></div>
        <div id="variants-blocker" style="overflow-y: hidden">
          <div id="variants"></div>
        </div>
      </section>
    `;
    const gallery = document.getElementById('gallery')!;
    const variants = document.getElementById('variants')!;
    const variantsBlocker = document.getElementById('variants-blocker')!;
    const diagnostics: StickyLayoutDiagnostic[] = [];
    const controller = createStickyLayoutController({
      document,
      galleryHost: gallery,
      variantsHost: variants,
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });

    controller.start();
    flushFrame();

    const snapshot = controller.getSnapshot();
    expect(snapshot.ancestorBlockers.some((blocker) => blocker.element === variantsBlocker)).toBe(
      true,
    );
    expect(snapshot.requiresBodyFallback).toBe(false);
    expect(
      diagnostics.find(
        (diagnostic) =>
          diagnostic.code === 'sticky-blocking-ancestor' &&
          diagnostic.element === variantsBlocker,
      ),
    ).toMatchObject({ requiresBodyFallback: false });
    controller.destroy();
  });

  it('uses a product boundary when the common grid cannot reach sticky top', () => {
    document.body.innerHTML = `
      <main>
        <section id="product">
          <div id="grid">
            <div id="gallery-column"><div id="gallery"></div></div>
            <aside><div id="variants"></div></aside>
          </div>
        </section>
        <section id="following"></section>
      </main>
    `;
    const product = document.getElementById('product')!;
    const grid = document.getElementById('grid')!;
    const galleryColumn = document.getElementById('gallery-column')!;
    const gallery = document.getElementById('gallery')!;
    const variants = document.getElementById('variants')!;
    gallery.innerHTML = `
      <div id="ov-25-configurator-gallery-container"
        style="--ov25-sticky-top-gap: 24px; --ov25-sticky-bottom-gap: 20px"></div>
    `;
    setRect(product, 220, 1485);
    setRect(grid, 276, 898);
    setRect(galleryColumn, 276, 898);
    setRect(gallery, 276, 868, 560);
    setRect(variants, 276, 898, 480, 640);
    const diagnostics: StickyLayoutDiagnostic[] = [];
    const controller = createStickyLayoutController({
      document,
      galleryHost: gallery,
      variantsHost: variants,
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });

    controller.start();
    flushFrame();

    expect(controller.getSnapshot()).toMatchObject({
      topGap: 24,
      bottomGap: 20,
      requiresBodyFallback: true,
      fallbackBoundary: product,
      ancestorBlockers: [
        expect.objectContaining({
          element: galleryColumn,
          reasons: expect.arrayContaining(['insufficient-sticky-travel']),
        }),
      ],
    });
    expect(
      diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'sticky-blocking-ancestor' &&
          diagnostic.element === galleryColumn &&
          diagnostic.reasons?.includes('insufficient-sticky-travel'),
      ),
    ).toBe(true);
    expect(
      diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'sticky-boundary-insufficient-travel' &&
          diagnostic.element === product,
      ),
    ).toBe(true);
    expect(gallery.style.getPropertyValue('--ov25-sticky-resolved-top-gap')).toBe('24px');
    expect(variants.style.getPropertyValue('--ov25-sticky-resolved-top-gap')).toBe('24px');
    expect(gallery.style.getPropertyValue('--ov25-sticky-resolved-bottom-gap')).toBe('20px');
    expect(variants.style.getPropertyValue('--ov25-sticky-resolved-bottom-gap')).toBe('20px');
    controller.destroy();
  });

  it('retains its flow origin when a collapsing header leaves the host at its prior target', () => {
    const layout = installFlowAnchorLayout({
      parentDocumentTop: 382,
      galleryTop: 382,
      headerHeight: 106,
    });
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();
    expect(controller.getSnapshot()).toMatchObject({
      headerOffset: 106,
      requiresBodyFallback: true,
      fallbackBoundary: layout.product,
    });

    layout.state.scrollY = 300;
    layout.state.galleryTop = 122;
    layout.state.headerHeight = 54;
    window.dispatchEvent(new Event('scroll'));
    flushFrame();
    expect(controller.getSnapshot()).toMatchObject({
      headerOffset: 54,
      requiresBodyFallback: true,
      fallbackBoundary: layout.product,
      ancestorBlockers: [
        expect.objectContaining({
          element: layout.galleryColumn,
          reasons: expect.arrayContaining(['insufficient-sticky-travel']),
        }),
      ],
    });
    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBe(382);
    controller.destroy();
  });

  it('captures its flow origin before the first frame at restored nonzero scroll', () => {
    const layout = installFlowAnchorLayout({
      scrollY: 300,
      parentDocumentTop: 382,
      galleryTop: 82,
      headerHeight: 106,
    });
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });

    layout.state.galleryTop = 122;
    controller.start();
    flushFrame();

    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBe(382);
    expect(controller.getSnapshot()).toMatchObject({
      requiresBodyFallback: true,
      fallbackBoundary: layout.product,
    });
    controller.destroy();
  });

  it('tracks parent document movement without deriving origin from the pinned host', () => {
    const layout = installFlowAnchorLayout();
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    controller.start();
    flushFrame();
    const originChanged = vi.fn();
    const stopObserving = observeStickyHostNaturalDocumentTop(
      layout.gallery,
      originChanged,
    );

    layout.state.scrollY = 260;
    layout.state.galleryTop = 16;
    layout.state.parentDocumentTop = 316;
    ResizeObserverMock.instances[0].trigger();
    flushFrame();

    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBe(316);
    expect(originChanged).toHaveBeenCalled();
    expect(controller.getSnapshot()).toMatchObject({
      requiresBodyFallback: true,
      fallbackBoundary: layout.product,
    });
    stopObserving();
    controller.destroy();
  });

  it('clears the current shared anchor when the final owner holds a stale anchor', async () => {
    const layout = installFlowAnchorLayout();
    const reboundController = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    const staleController = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    const replacementParent = document.createElement('div');
    layout.product.appendChild(replacementParent);
    vi.spyOn(replacementParent, 'getBoundingClientRect').mockReturnValue(
      domRect(500, 900),
    );
    layout.state.galleryTop = 530;
    replacementParent.appendChild(layout.gallery);

    reboundController.setElements({ galleryHost: layout.gallery });
    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBe(530);

    reboundController.destroy();
    staleController.destroy();
    await Promise.resolve();

    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBeNull();
  });

  it('keeps a replacement record created synchronously by a release listener', async () => {
    const layout = installFlowAnchorLayout();
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    const replacement: {
      controller: ReturnType<typeof createStickyLayoutController> | null;
    } = { controller: null };
    let stopObserving = () => {};
    stopObserving = observeStickyHostNaturalDocumentTop(layout.gallery, () => {
      stopObserving();
      layout.state.parentDocumentTop = 400;
      layout.state.galleryTop = 430;
      replacement.controller = createStickyLayoutController({
        document,
        galleryHost: layout.gallery,
        variantsHost: layout.variants,
        onDiagnostic: () => {},
      });
    });

    controller.destroy();
    await Promise.resolve();

    expect(replacement.controller).not.toBeNull();
    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBe(430);
    replacement.controller?.destroy();
    await Promise.resolve();
    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBeNull();
  });

  it('preserves the original flow anchor across synchronous recreation while pinned', async () => {
    const layout = installFlowAnchorLayout();
    const firstController = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    firstController.start();
    flushFrame();
    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBe(276);

    layout.state.scrollY = 300;
    layout.state.galleryTop = 16;
    firstController.destroy();
    const replacementController = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    replacementController.start();
    flushFrame();

    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBe(276);
    replacementController.destroy();
    await Promise.resolve();
  });

  it('preserves the original flow anchor when recreated from the body layer', async () => {
    const layout = installFlowAnchorLayout();
    const firstController = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    firstController.start();
    flushFrame();

    const bodyLayer = document.createElement('div');
    bodyLayer.setAttribute('data-ov25-sticky-body-layer', 'test');
    document.body.appendChild(bodyLayer);
    layout.state.scrollY = 300;
    layout.state.galleryTop = 16;
    bodyLayer.appendChild(layout.gallery);

    firstController.destroy();
    const replacementController = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    replacementController.start();
    flushFrame();
    replacementController.setElements({ galleryHost: layout.gallery });

    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBe(276);
    replacementController.destroy();
    layout.galleryColumn.appendChild(layout.gallery);
    await Promise.resolve();
  });

  it('recaptures the flow anchor after a completed disable and layout change', async () => {
    const layout = installFlowAnchorLayout();
    const firstController = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    firstController.start();
    flushFrame();
    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBe(276);

    firstController.destroy();
    await Promise.resolve();
    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBeNull();

    layout.state.parentDocumentTop = 400;
    layout.state.galleryTop = 430;
    const replacementController = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    replacementController.start();
    flushFrame();

    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBe(430);
    replacementController.destroy();
    await Promise.resolve();
  });

  it('resets the flow anchor when the gallery host or original parent changes', async () => {
    const layout = installFlowAnchorLayout();
    const replacementParent = document.createElement('div');
    const replacementHost = document.createElement('div');
    replacementParent.appendChild(replacementHost);
    layout.product.appendChild(replacementParent);
    vi.spyOn(replacementParent, 'getBoundingClientRect').mockReturnValue(
      domRect(500, 900),
    );
    const replacementHostRect = vi
      .spyOn(replacementHost, 'getBoundingClientRect')
      .mockReturnValue(domRect(520, 868));
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      onDiagnostic: () => {},
    });
    controller.start();
    flushFrame();

    controller.setElements({ galleryHost: replacementHost });
    expect(getStickyHostNaturalDocumentTop(layout.gallery, window)).toBeNull();
    expect(getStickyHostNaturalDocumentTop(replacementHost, window)).toBe(520);

    const nextParent = document.createElement('div');
    layout.product.appendChild(nextParent);
    vi.spyOn(nextParent, 'getBoundingClientRect').mockReturnValue(domRect(700, 900));
    replacementHostRect.mockReturnValue(domRect(710, 868));
    nextParent.appendChild(replacementHost);
    controller.setElements({ galleryHost: replacementHost });
    expect(getStickyHostNaturalDocumentTop(replacementHost, window)).toBe(710);

    controller.destroy();
    await Promise.resolve();
    expect(getStickyHostNaturalDocumentTop(replacementHost, window)).toBeNull();
  });

  it('keeps a valid unmatched override isolated until MutationObserver finds its replacement', () => {
    const layout = installLayout();
    const controller = createStickyLayoutController({
      document,
      headerSelector: '.late-header',
      galleryHost: layout.gallery,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();
    expect(controller.getSnapshot()).toMatchObject({
      headerOffset: 0,
      headerSource: 'override',
      headerStatus: 'not-found',
    });

    const lateHeader = document.createElement('div');
    lateHeader.className = 'late-header';
    setRect(lateHeader, 0, 64);
    document.body.prepend(lateHeader);
    MutationObserverMock.instances[0].trigger();
    flushFrame();
    expect(controller.getSnapshot()).toMatchObject({
      headerOffset: 64,
      headerSource: 'override',
      headerStatus: 'resolved',
    });
    controller.destroy();
  });

  it('uses the original gallery parent when hosts have no useful LCA and diagnoses it', () => {
    document.body.innerHTML = `
      <section id="gallery-boundary" style="overflow-y: hidden">
        <div id="gallery"></div>
      </section>
      <section id="variants-boundary">
        <div id="variants"></div>
      </section>
    `;
    const galleryBoundary = document.getElementById('gallery-boundary')!;
    const gallery = document.getElementById('gallery')!;
    const variants = document.getElementById('variants')!;
    const diagnostics: StickyLayoutDiagnostic[] = [];
    const controller = createStickyLayoutController({
      document,
      galleryHost: gallery,
      variantsHost: variants,
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });

    controller.start();
    flushFrame();

    expect(controller.getSnapshot()).toMatchObject({
      requiresBodyFallback: true,
      fallbackBoundary: galleryBoundary,
    });
    expect(
      diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'sticky-boundary-parent-fallback' &&
          diagnostic.element === galleryBoundary,
      ),
    ).toBe(true);
    controller.destroy();
  });

  it('remeasures a connected auto-detected header when its reveal transition starts', () => {
    document.body.innerHTML = `
      <div id="theme-header" class="shopify-section-group-header-group" data-hidden="false">
        <div id="motion-child"></div>
      </div>
      <section><div id="gallery"></div></section>
    `;
    const header = document.getElementById('theme-header')!;
    const motionChild = document.getElementById('motion-child')!;
    const gallery = document.getElementById('gallery')!;
    let headerRect = domRect(0, 106);
    vi.spyOn(header, 'getBoundingClientRect').mockImplementation(() => headerRect);
    const controller = createStickyLayoutController({
      document,
      galleryHost: gallery,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();
    expect(gallery.style.getPropertyValue('--ov25-sticky-header-offset')).toBe('106px');
    expect(gallery.style.getPropertyValue('--ov25-sticky-sizing-header-offset')).toBe('106px');

    header.dataset.hidden = 'true';
    headerRect = domRect(-106, 106);
    window.dispatchEvent(new Event('scroll'));
    flushFrame();
    expect(gallery.style.getPropertyValue('--ov25-sticky-header-offset')).toBe('0px');
    expect(gallery.style.getPropertyValue('--ov25-sticky-sizing-header-offset')).toBe('106px');

    header.dataset.hidden = 'false';
    headerRect = domRect(0, 54);
    const transitionStart = new Event('transitionstart', { bubbles: true });
    Object.defineProperty(transitionStart, 'propertyName', { value: 'transform' });
    motionChild.dispatchEvent(transitionStart);
    expect(frames).toHaveLength(1);

    flushFrame();
    expect(gallery.style.getPropertyValue('--ov25-sticky-header-offset')).toBe('54px');
    expect(gallery.style.getPropertyValue('--ov25-sticky-sizing-header-offset')).toBe('106px');

    const transitionEnd = new Event('transitionend', { bubbles: true });
    Object.defineProperty(transitionEnd, 'propertyName', { value: 'transform' });
    motionChild.dispatchEvent(transitionEnd);
    flushFrame();
    expect(frames).toHaveLength(0);

    header.remove();
    controller.scheduleMeasure();
    flushFrame();
    motionChild.dispatchEvent(transitionStart);
    expect(frames).toHaveLength(0);
    controller.destroy();
  });

  it('measures through header transitions and animations and removes motion listeners', () => {
    document.body.innerHTML = `
      <div id="theme-header" class="shopify-section-group-header-group">
        <div id="motion-child"></div>
      </div>
      <section><div id="gallery"></div></section>
    `;
    const header = document.getElementById('theme-header')!;
    const motionChild = document.getElementById('motion-child')!;
    const gallery = document.getElementById('gallery')!;
    setRect(header, 0, 72);
    const dispatchMotion = (
      type: string,
      details: { animationName?: string; propertyName?: string },
    ): void => {
      const event = new Event(type, { bubbles: true });
      for (const [property, value] of Object.entries(details)) {
        Object.defineProperty(event, property, { value });
      }
      motionChild.dispatchEvent(event);
    };
    const controller = createStickyLayoutController({
      document,
      galleryHost: gallery,
      onDiagnostic: () => {},
    });

    controller.start();
    flushFrame();
    dispatchMotion('transitionstart', { propertyName: 'height' });
    dispatchMotion('animationstart', { animationName: 'collapse' });
    expect(frames).toHaveLength(1);
    flushFrame();
    expect(frames).toHaveLength(1);
    dispatchMotion('transitionend', { propertyName: 'height' });
    flushFrame();
    expect(frames).toHaveLength(1);
    dispatchMotion('animationcancel', { animationName: 'collapse' });
    flushFrame();
    expect(frames).toHaveLength(0);

    dispatchMotion('transitioncancel', { propertyName: 'not-started' });
    expect(frames).toHaveLength(1);
    flushFrame();
    expect(frames).toHaveLength(0);

    controller.destroy();
    const requestCount = requestFrame.mock.calls.length;
    dispatchMotion('transitionstart', { propertyName: 'height' });
    dispatchMotion('animationstart', { animationName: 'collapse' });
    expect(requestFrame).toHaveBeenCalledTimes(requestCount);
  });
});
