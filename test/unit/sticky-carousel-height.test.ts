import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createStickyLayoutController,
  DEFAULT_STICKY_CAROUSEL_HEIGHT,
  STICKY_CAROUSEL_MAX_AVAILABLE_FRACTION,
} from '../../src/lib/sticky-layout-controller';

const CAROUSEL_VAR = '--ov25-sticky-carousel-height';

function domRect(top: number, height: number, width = 1200, left = 0): DOMRect {
  return {
    x: left, y: top, top, left, width, height,
    right: left + width, bottom: top + height, toJSON: () => ({}),
  } as DOMRect;
}

function setRect(element: Element, top: number, height: number, width = 1200, left = 0) {
  return vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(domRect(top, height, width, left));
}

class ObserverMock {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  readonly takeRecords = vi.fn(() => []);
  constructor(readonly callback: unknown) {}
}

describe('sticky carousel height measurement', () => {
  let frames: Map<number, FrameRequestCallback>;
  let nextFrameId: number;

  beforeEach(() => {
    document.body.innerHTML = '';
    frames = new Map();
    nextFrameId = 1;
    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      value: vi.fn((cb: FrameRequestCallback) => { const id = nextFrameId++; frames.set(id, cb); return id; }),
    });
    Object.defineProperty(window, 'cancelAnimationFrame', {
      configurable: true, value: vi.fn((id: number) => frames.delete(id)),
    });
    Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: ObserverMock });
    Object.defineProperty(window, 'MutationObserver', { configurable: true, value: ObserverMock });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as Window & { ResizeObserver?: unknown }).ResizeObserver;
    delete (window as Window & { MutationObserver?: unknown }).MutationObserver;
    document.body.innerHTML = '';
  });

  function flushFrame() {
    const pending = [...frames.entries()];
    frames.clear();
    for (const [, cb] of pending) cb(performance.now());
  }

  /** Mirrors production: the carousel host is itself an open shadow host whose
   *  content root is the thing that carries the real, unclamped height. */
  function installLayout(contentHeight: number | null, clampedHostHeight = 120) {
    document.body.innerHTML = `
      <section id="product">
        <div id="gallery"></div>
        <div id="carousel"></div>
        <div id="variants"></div>
      </section>
    `;
    const gallery = document.getElementById('gallery')!;
    const variants = document.getElementById('variants')!;
    const carousel = document.getElementById('carousel')! as HTMLElement;
    setRect(gallery, 100, 400, 520, 80);
    setRect(variants, 100, 700, 520, 640);
    // The host reports its clamped box — using it would be circular.
    setRect(carousel, 520, clampedHostHeight, 520, 80);

    if (contentHeight !== null) {
      const shadow = carousel.attachShadow({ mode: 'open' });
      const content = document.createElement('div');
      content.id = 'ov25-product-carousel';
      shadow.appendChild(content);
      setRect(content, 520, contentHeight, 520, 80);
    }
    return { gallery, variants, carousel };
  }

  function run(layout: ReturnType<typeof installLayout>) {
    const controller = createStickyLayoutController({
      document,
      galleryHost: layout.gallery,
      variantsHost: layout.variants,
      carouselHost: layout.carousel,
      onDiagnostic: () => {},
    });
    controller.start();
    flushFrame();
    return controller;
  }

  it('measures the unclamped content, not the clamped host box', () => {
    const layout = installLayout(169, 120);
    const controller = run(layout);
    // 169 content + 1px clearance — never the 120px the host box reports.
    expect(controller.getSnapshot().carouselHeight).toBe(170);
    expect(layout.gallery.style.getPropertyValue(CAROUSEL_VAR)).toBe('170px');
    controller.destroy();
  });

  it('writes the variable onto the carousel host itself', () => {
    // globals.css sets this var in its own `:host` block, which lands ON the
    // carousel element and beats inheritance from the gallery. Writing it to
    // an ancestor alone would never reach the max-height that consumes it.
    const layout = installLayout(169);
    const controller = run(layout);
    expect(layout.carousel.style.getPropertyValue(CAROUSEL_VAR)).toBe('170px');
    controller.destroy();
  });

  it('clamps a stacked grid to half the available height', () => {
    // innerHeight 800 - 16 top - 16 bottom = 768 available.
    const available = 800 - 16 - 16;
    const ceiling = available * STICKY_CAROUSEL_MAX_AVAILABLE_FRACTION;
    const controller = run(installLayout(2000));
    expect(controller.getSnapshot().carouselHeight).toBe(ceiling);
    controller.destroy();
  });

  it('falls back to the globals.css default when there is no carousel content', () => {
    const controller = run(installLayout(null));
    expect(controller.getSnapshot().carouselHeight).toBe(DEFAULT_STICKY_CAROUSEL_HEIGHT);
    controller.destroy();
  });

  it('restores the host variable on destroy', () => {
    const layout = installLayout(169);
    const controller = run(layout);
    expect(layout.carousel.style.getPropertyValue(CAROUSEL_VAR)).toBe('170px');
    controller.destroy();
    expect(layout.carousel.style.getPropertyValue(CAROUSEL_VAR)).toBe('');
  });
});
