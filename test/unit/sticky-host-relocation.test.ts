import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createStickyHostRelocation,
  STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX,
  STICKY_BODY_LAYER_Z_INDEX,
  type StickyHostRelocationMode,
  useStickyHostRelocation,
} from '../../src/hooks/useStickyHostRelocation';
import { createStickyLayoutController } from '../../src/lib/sticky-layout-controller';

function domRect(top: number, height: number, width = 500, left = 40): DOMRect {
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

describe('sticky outer-host relocation', () => {
  let originalMoveBefore: PropertyDescriptor | undefined;
  let originalShowPopover: PropertyDescriptor | undefined;
  let originalHidePopover: PropertyDescriptor | undefined;
  let originalRequestAnimationFrame: PropertyDescriptor | undefined;
  let originalCancelAnimationFrame: PropertyDescriptor | undefined;

  beforeEach(() => {
    document.body.innerHTML = '';
    originalMoveBefore = Object.getOwnPropertyDescriptor(Element.prototype, 'moveBefore');
    originalShowPopover = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'showPopover');
    originalHidePopover = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'hidePopover');
    originalRequestAnimationFrame = Object.getOwnPropertyDescriptor(window, 'requestAnimationFrame');
    originalCancelAnimationFrame = Object.getOwnPropertyDescriptor(window, 'cancelAnimationFrame');
    Object.defineProperty(window, 'scrollX', { configurable: true, value: 0 });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    delete (HTMLElement.prototype as HTMLElement & { showPopover?: unknown }).showPopover;
    delete (HTMLElement.prototype as HTMLElement & { hidePopover?: unknown }).hidePopover;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalMoveBefore) {
      Object.defineProperty(Element.prototype, 'moveBefore', originalMoveBefore);
    } else {
      delete (Element.prototype as Element & { moveBefore?: unknown }).moveBefore;
    }
    if (originalShowPopover) {
      Object.defineProperty(HTMLElement.prototype, 'showPopover', originalShowPopover);
    } else {
      delete (HTMLElement.prototype as HTMLElement & { showPopover?: unknown }).showPopover;
    }
    if (originalHidePopover) {
      Object.defineProperty(HTMLElement.prototype, 'hidePopover', originalHidePopover);
    } else {
      delete (HTMLElement.prototype as HTMLElement & { hidePopover?: unknown }).hidePopover;
    }
    if (originalRequestAnimationFrame) {
      Object.defineProperty(window, 'requestAnimationFrame', originalRequestAnimationFrame);
    } else {
      delete (window as Window & { requestAnimationFrame?: unknown }).requestAnimationFrame;
    }
    if (originalCancelAnimationFrame) {
      Object.defineProperty(window, 'cancelAnimationFrame', originalCancelAnimationFrame);
    } else {
      delete (window as Window & { cancelAnimationFrame?: unknown }).cancelAnimationFrame;
    }
    document.body.innerHTML = '';
  });

  function installLayout() {
    document.body.innerHTML = `
      <section id="product" class="product-section">
        <div id="client-blocker">
          <div id="gallery-host" style="position: relative; top: 3px; width: 75%; margin: 2px; --merchant-prop: keep">
            <iframe id="configurator-frame" src="about:blank"></iframe>
          </div>
          <div id="original-sibling"></div>
        </div>
      </section>
    `;
    const product = document.getElementById('product')!;
    const parent = document.getElementById('client-blocker')!;
    const host = document.getElementById('gallery-host')!;
    const iframe = document.getElementById('configurator-frame') as HTMLIFrameElement;
    const sibling = document.getElementById('original-sibling')!;
    vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue(domRect(0, 900, 500, 40));
    return { product, parent, host, iframe, sibling };
  }

  function installMoveBefore() {
    const moveBefore = vi.fn(function (
      this: Element,
      node: Node,
      reference: Node | null,
    ) {
      this.insertBefore(node, reference);
    });
    Object.defineProperty(Element.prototype, 'moveBefore', {
      configurable: true,
      value: moveBefore,
    });
    return moveBefore;
  }

  it('applies the current update when resetKey recreates the hook controller', () => {
    const layout = installLayout();
    installMoveBefore();
    vi.spyOn(layout.host, 'getBoundingClientRect').mockReturnValue(domRect(40, 320));
    vi.spyOn(layout.product, 'getBoundingClientRect').mockReturnValue(domRect(-100, 1200));

    const { rerender, unmount } = renderHook(
      ({ resetKey }: { resetKey: number }) =>
        useStickyHostRelocation({
          host: layout.host,
          active: true,
          requiresBodyFallback: true,
          stickyTop: 72,
          boundary: layout.product,
          overlayOpen: false,
          fullscreenOpen: false,
          layerKey: 'hook-recreation',
          resetKey,
        }),
      { initialProps: { resetKey: 1 } },
    );

    const firstPlaceholder = document.querySelector(
      '[data-ov25-sticky-placeholder="hook-recreation"]',
    );
    expect(firstPlaceholder).not.toBeNull();
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');

    rerender({ resetKey: 2 });

    const replacementPlaceholder = document.querySelector(
      '[data-ov25-sticky-placeholder="hook-recreation"]',
    );
    expect(replacementPlaceholder).not.toBeNull();
    expect(replacementPlaceholder).not.toBe(firstPlaceholder);
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');

    unmount();
    expect(document.querySelector('[data-ov25-sticky-placeholder="hook-recreation"]')).toBeNull();
    expect(layout.host.parentElement).toBe(layout.parent);
  });

  it.each(['body-layer', 'popover'] as const)(
    'uses full viewport geometry without widening the placeholder via %s',
    (strategy) => {
      const layout = installLayout();
      if (strategy === 'body-layer') {
        installMoveBefore();
      } else {
        Object.defineProperties(layout.host, {
          showPopover: { configurable: true, value: vi.fn() },
          hidePopover: { configurable: true, value: vi.fn() },
        });
      }

      vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(390);
      vi.spyOn(document.documentElement, 'getBoundingClientRect').mockReturnValue(
        domRect(0, 800, 390, -20),
      );
      vi.spyOn(layout.host, 'getBoundingClientRect').mockReturnValue(
        domRect(40, 320, 180, 72),
      );
      let boundaryBottom = 1100;
      vi.spyOn(layout.product, 'getBoundingClientRect').mockImplementation(() =>
        domRect(0, boundaryBottom, 500, 0),
      );
      Object.defineProperty(window, 'scrollX', { configurable: true, value: 20 });

      const { rerender, unmount } = renderHook(
        ({ active, stickyTop }: { active: boolean; stickyTop: number }) =>
          useStickyHostRelocation({
            host: layout.host,
            active,
            requiresBodyFallback: true,
            stickyTop,
            boundary: layout.product,
            overlayOpen: false,
            fullscreenOpen: false,
            fullViewportWidth: true,
            layerKey: `full-viewport-${strategy}`,
          }),
        { initialProps: { active: true, stickyTop: 72 } },
      );

      const placeholder = layout.parent.querySelector<HTMLElement>(
        `[data-ov25-sticky-placeholder="full-viewport-${strategy}"]`,
      )!;
      expect(layout.host.style.position).toBe(
        strategy === 'body-layer' ? 'sticky' : 'fixed',
      );
      expect(layout.host.style.left).toBe(strategy === 'body-layer' ? 'auto' : '-20px');
      expect(layout.host.style.width).toBe('390px');
      expect(placeholder.style.width).toBe('36%');
      vi.spyOn(placeholder, 'getBoundingClientRect').mockReturnValue(
        domRect(-560, 320, 180, 72),
      );

      boundaryBottom = 300;
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 600 });
      const layer = document.querySelector<HTMLElement>(
        `[data-ov25-sticky-body-layer="full-viewport-${strategy}"]`,
      );
      if (layer) {
        vi.spyOn(layer, 'getBoundingClientRect').mockReturnValue(
          domRect(-600, 0, 390, -20),
        );
      }
      rerender({ active: true, stickyTop: 73 });

      expect(layout.host.style.position).toBe(
        strategy === 'body-layer' ? 'sticky' : 'absolute',
      );
      expect(layout.host.style.top).toBe(strategy === 'body-layer' ? '73px' : '580px');
      expect(layout.host.style.left).toBe(strategy === 'body-layer' ? 'auto' : '0px');
      expect(layout.host.style.width).toBe('390px');
      expect(placeholder.style.width).toBe('36%');
      if (layer) {
        expect(layer.style.width).toBe('390px');
        expect(layer.style.height).toBe('860px');
      }

      rerender({ active: false, stickyTop: 73 });
      expect(layout.host.style.position).toBe('relative');
      expect(layout.host.style.top).toBe('3px');
      expect(layout.host.style.left).toBe('');
      expect(layout.host.style.width).toBe('75%');
      expect(document.querySelector(
        `[data-ov25-sticky-placeholder="full-viewport-${strategy}"]`,
      )).toBeNull();

      boundaryBottom = 1100;
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
      rerender({ active: true, stickyTop: 72 });
      expect(layout.host.style.position).toBe(
        strategy === 'body-layer' ? 'sticky' : 'fixed',
      );
      expect(layout.host.style.width).toBe('390px');
      unmount();

      expect(layout.host.style.position).toBe('relative');
      expect(layout.host.style.top).toBe('3px');
      expect(layout.host.style.left).toBe('');
      expect(layout.host.style.width).toBe('75%');
      expect(document.querySelector(
        `[data-ov25-sticky-placeholder="full-viewport-${strategy}"]`,
      )).toBeNull();
    },
  );

  it('clips Popover absolute-end below the header and restores merchant clipping', () => {
    const layout = installLayout();
    Object.defineProperties(layout.host, {
      showPopover: { configurable: true, value: vi.fn() },
      hidePopover: { configurable: true, value: vi.fn() },
    });

    layout.host.style.setProperty('clip-path', 'circle(40%)', 'important');
    const merchantClipPriority = layout.host.style.getPropertyPriority('clip-path');
    vi.spyOn(layout.host, 'getBoundingClientRect').mockReturnValue(domRect(40, 320));
    let boundaryBottom = 1000;
    vi.spyOn(layout.product, 'getBoundingClientRect').mockImplementation(() =>
      domRect(0, boundaryBottom),
    );
    const controller = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'header-occlusion-popover',
    });
    const updateRelocation = (
      enabled: boolean,
      occlusionTop = 106,
      freeze = false,
      zIndex = STICKY_BODY_LAYER_Z_INDEX,
    ) =>
      controller.update({
        enabled,
        stickyTop: 122,
        occlusionTop,
        boundary: layout.product,
        freeze,
        zIndex,
      });

    updateRelocation(true);
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('clip-path')).toBe('none');
    expect(layout.host.style.getPropertyValue('z-index')).toBe(
      String(STICKY_BODY_LAYER_Z_INDEX),
    );

    let placeholder = layout.parent.querySelector<HTMLElement>(
      '[data-ov25-sticky-placeholder="header-occlusion-popover"]',
    )!;
    vi.spyOn(placeholder, 'getBoundingClientRect').mockReturnValue(domRect(40, 320));
    boundaryBottom = 209;
    updateRelocation(true);

    expect(controller.getMode()).toBe('absolute-end');
    expect(layout.host.style.getPropertyValue('position')).toBe('absolute');
    expect(layout.host.style.getPropertyValue('top')).toBe('-111px');
    expect(layout.host.style.getPropertyValue('clip-path')).toBe(
      'inset(217px 0px 0px 0px)',
    );
    expect(layout.host.style.getPropertyValue('z-index')).toBe(
      String(STICKY_BODY_LAYER_Z_INDEX),
    );

    updateRelocation(true, 106, true, STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX);
    expect(controller.getMode()).toBe('absolute-end');
    expect(layout.host.style.getPropertyValue('clip-path')).toBe('none');
    expect(layout.host.style.getPropertyValue('z-index')).toBe(
      String(STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX),
    );

    updateRelocation(true);
    expect(controller.getMode()).toBe('absolute-end');
    expect(layout.host.style.getPropertyValue('clip-path')).toBe(
      'inset(217px 0px 0px 0px)',
    );
    expect(layout.host.style.getPropertyValue('z-index')).toBe(
      String(STICKY_BODY_LAYER_Z_INDEX),
    );

    updateRelocation(true, 0);
    expect(controller.getMode()).toBe('absolute-end');
    expect(layout.host.style.getPropertyValue('clip-path')).toBe('none');

    updateRelocation(true);
    expect(layout.host.style.getPropertyValue('clip-path')).toBe(
      'inset(217px 0px 0px 0px)',
    );

    boundaryBottom = 1000;
    updateRelocation(true);
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('clip-path')).toBe('none');

    updateRelocation(false);
    expect(layout.host.style.getPropertyValue('clip-path')).toBe('circle(40%)');
    expect(layout.host.style.getPropertyPriority('clip-path')).toBe(merchantClipPriority);

    updateRelocation(true);
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('clip-path')).toBe('none');
    placeholder = layout.parent.querySelector<HTMLElement>(
      '[data-ov25-sticky-placeholder="header-occlusion-popover"]',
    )!;
    vi.spyOn(placeholder, 'getBoundingClientRect').mockReturnValue(domRect(40, 320));
    boundaryBottom = 209;
    updateRelocation(true);
    expect(layout.host.style.getPropertyValue('clip-path')).toBe(
      'inset(217px 0px 0px 0px)',
    );

    controller.destroy();
    expect(layout.host.style.getPropertyValue('clip-path')).toBe('circle(40%)');
    expect(layout.host.style.getPropertyPriority('clip-path')).toBe(merchantClipPriority);
  });

  it('uses a bounded native-sticky body track and restores merchant clipping', () => {
    const layout = installLayout();
    installMoveBefore();
    layout.host.style.setProperty('clip-path', 'circle(40%)', 'important');
    layout.host.style.setProperty('z-index', '7', 'important');
    const merchantClipPriority = layout.host.style.getPropertyPriority('clip-path');
    vi.spyOn(layout.host, 'getBoundingClientRect').mockReturnValue(domRect(40, 320));
    let boundaryBottom = 1000;
    vi.spyOn(layout.product, 'getBoundingClientRect').mockImplementation(() =>
      domRect(0, boundaryBottom),
    );
    const controller = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'header-occlusion-body-layer',
    });
    const updateRelocation = (
      enabled: boolean,
      occlusionTop = 106,
      freeze = false,
      zIndex = STICKY_BODY_LAYER_Z_INDEX,
    ) =>
      controller.update({
        enabled,
        stickyTop: 122,
        occlusionTop,
        boundary: layout.product,
        freeze,
        zIndex,
      });

    updateRelocation(true);
    const layer = document.querySelector<HTMLElement>(
      '[data-ov25-sticky-body-layer="header-occlusion-body-layer"]',
    )!;
    const placeholder = layout.parent.querySelector<HTMLElement>(
      '[data-ov25-sticky-placeholder="header-occlusion-body-layer"]',
    )!;
    vi.spyOn(placeholder, 'getBoundingClientRect').mockReturnValue(domRect(40, 320));
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');
    expect(layout.host.style.getPropertyValue('clip-path')).toBe('none');
    expect(layout.host.parentElement).toBe(layer);
    expect(layer.style.top).toBe('40px');
    expect(layer.style.height).toBe('960px');
    expect(layer.style.zIndex).toBe('7');

    boundaryBottom = 209;
    updateRelocation(true);
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');
    expect(layout.host.style.getPropertyValue('top')).toBe('122px');
    expect(layout.host.style.getPropertyValue('clip-path')).toBe('none');
    expect(layer.style.height).toBe('169px');

    updateRelocation(true, 106, true, STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX);
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');
    expect(layout.host.style.getPropertyValue('clip-path')).toBe('none');
    expect(layer.style.zIndex).toBe(String(STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX));

    updateRelocation(true);
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');
    expect(layer.style.zIndex).toBe('7');
    expect(layer.style.height).toBe('169px');

    updateRelocation(true, 0);
    expect(layout.host.style.getPropertyValue('clip-path')).toBe('none');
    updateRelocation(false);
    expect(layout.host.style.getPropertyValue('clip-path')).toBe('circle(40%)');
    expect(layout.host.style.getPropertyPriority('clip-path')).toBe(merchantClipPriority);
    expect(layout.host.style.getPropertyValue('z-index')).toBe('7');

    boundaryBottom = 1000;
    updateRelocation(true);
    controller.destroy();
    expect(layout.host.style.getPropertyValue('clip-path')).toBe('circle(40%)');
    expect(layout.host.style.getPropertyPriority('clip-path')).toBe(merchantClipPriority);
    expect(layout.host.style.getPropertyValue('z-index')).toBe('7');
  });

  it('uses moveBefore and preserves the concrete host and iframe in a sticky track', () => {
    const layout = installLayout();
    const iframeSrc = layout.iframe.src;
    const customState = { retained: true };
    (layout.host as HTMLElement & { merchantState?: object }).merchantState = customState;
    layout.parent.style.setProperty('--ov25-client-accent', 'hotpink');
    const hostRect = vi
      .spyOn(layout.host, 'getBoundingClientRect')
      .mockReturnValue(domRect(40, 320));
    vi.spyOn(layout.product, 'getBoundingClientRect').mockReturnValue(domRect(-100, 1200));

    const moveBefore = installMoveBefore();

    const modes: StickyHostRelocationMode[] = [];
    const controller = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'config-1',
      onModeChange: (mode) => modes.push(mode),
    });
    controller.update({
      enabled: true,
      stickyTop: 72,
      boundary: layout.product,
      zIndex: STICKY_BODY_LAYER_Z_INDEX,
    });

    const layer = document.querySelector<HTMLElement>('[data-ov25-sticky-body-layer="config-1"]');
    const placeholder = layout.parent.querySelector<HTMLElement>('[data-ov25-sticky-placeholder="config-1"]');
    expect(controller.getMode()).toBe('fixed');
    expect(controller.isRelocated()).toBe(true);
    expect(layer).not.toBeNull();
    expect(placeholder).not.toBeNull();
    expect(layout.host.parentElement).toBe(layer);
    expect(moveBefore).toHaveBeenCalledWith(layout.host, null);
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');
    expect(layout.host.style.getPropertyValue('top')).toBe('72px');
    expect(layout.host.style.getPropertyValue('left')).toBe('auto');
    expect(layout.host.style.getPropertyValue('width')).toBe('500px');
    expect(layout.host.style.getPropertyValue('height')).toBe('320px');
    expect(layout.host.style.getPropertyValue('z-index')).toBe(String(STICKY_BODY_LAYER_Z_INDEX));
    expect(layer!.style.top).toBe('40px');
    expect(layer!.style.left).toBe('40px');
    expect(layer!.style.width).toBe('500px');
    expect(layer!.style.height).toBe('1060px');
    expect(layer!.style.zIndex).toBe('1');
    expect(layout.host.style.getPropertyValue('--merchant-prop')).toBe('keep');
    expect(layout.host.style.getPropertyValue('--ov25-client-accent')).toBe('hotpink');
    expect((layout.host as HTMLElement & { merchantState?: object }).merchantState).toBe(customState);
    expect(layout.host.querySelector('iframe')).toBe(layout.iframe);
    expect(layout.iframe.src).toBe(iframeSrc);
    expect(hostRect).toHaveBeenCalled();
    expect(modes).toEqual(['fixed']);

    controller.destroy();
  });

  it('activates at the natural-flow threshold even when native sticky delays the live rect', () => {
    const layout = installLayout();
    installMoveBefore();
    let scrollY = 0;
    let constrainedLiveTop = 276;
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => scrollY,
    });
    vi.spyOn(layout.host, 'getBoundingClientRect').mockImplementation(() =>
      domRect(constrainedLiveTop, 868),
    );
    vi.spyOn(layout.product, 'getBoundingClientRect').mockImplementation(() =>
      domRect(220 - scrollY, 1485),
    );
    const controller = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'natural-threshold',
    });

    controller.update({ enabled: true, stickyTop: 16, boundary: layout.product });
    expect(controller.getMode()).toBe('normal');

    scrollY = 259;
    constrainedLiveTop = 47;
    controller.sync();
    expect(controller.getMode()).toBe('normal');
    expect(document.querySelector('[data-ov25-sticky-placeholder="natural-threshold"]')).toBeNull();

    scrollY = 260;
    constrainedLiveTop = 46;
    controller.sync();
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('top')).toBe('16px');
    expect(document.querySelector('[data-ov25-sticky-placeholder="natural-threshold"]')).not.toBeNull();

    controller.update({
      enabled: true,
      stickyTop: 16,
      boundary: layout.product,
      freeze: true,
      zIndex: STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX,
    });
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');
    expect(layout.host.style.getPropertyValue('top')).toBe('16px');
    expect(layout.host.style.getPropertyValue('z-index')).toBe(
      String(STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX),
    );
    expect(
      document.querySelector<HTMLElement>(
        '[data-ov25-sticky-body-layer="natural-threshold"]',
      )!.style.zIndex,
    ).toBe(String(STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX));
    controller.destroy();
  });

  it('keeps working native sticky until the live top slips past its target', () => {
    const layout = installLayout();
    installMoveBefore();
    let scrollY = 0;
    let liveTop = 276;
    let parentTop = 276;
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => scrollY,
    });
    vi.spyOn(layout.host, 'getBoundingClientRect').mockImplementation(() =>
      domRect(liveTop, 688),
    );
    vi.spyOn(layout.parent, 'getBoundingClientRect').mockImplementation(() =>
      domRect(parentTop, 718),
    );
    vi.spyOn(layout.product, 'getBoundingClientRect').mockImplementation(() =>
      domRect(220 - scrollY, 1485),
    );
    const layoutController = createStickyLayoutController({
      document,
      galleryHost: layout.host,
      onDiagnostic: () => {},
    });
    const controller = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'native-sticky',
    });

    controller.update({ enabled: true, stickyTop: 16, boundary: layout.product });
    scrollY = 260;
    liveTop = 16;
    parentTop = 16;
    controller.sync();
    expect(controller.getMode()).toBe('normal');
    expect(document.querySelector('[data-ov25-sticky-placeholder="native-sticky"]')).toBeNull();

    scrollY = 291;
    liveTop = 15;
    parentTop = -15;
    controller.sync();
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');
    expect(layout.host.style.getPropertyValue('top')).toBe('16px');
    expect(document.querySelector('[data-ov25-sticky-placeholder="native-sticky"]')).not.toBeNull();
    controller.destroy();
    layoutController.destroy();
  });

  it('restores only relocation-owned properties and preserves concurrent host changes', () => {
    const layout = installLayout();
    installMoveBefore();
    vi.spyOn(layout.host, 'getBoundingClientRect').mockReturnValue(domRect(40, 320));
    vi.spyOn(layout.product, 'getBoundingClientRect').mockReturnValue(domRect(-100, 1200));
    layout.host.style.setProperty('--ov25-sticky-header-offset', '72px');
    const controller = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'property-restore',
    });

    controller.update({ enabled: true, stickyTop: 72, boundary: layout.product });
    expect(controller.getMode()).toBe('fixed');

    layout.host.style.setProperty('color', 'rebeccapurple');
    layout.host.style.setProperty('--merchant-live-change', 'retained');
    layout.host.style.setProperty('--ov25-sticky-header-offset', '99px');
    controller.update({ enabled: false, stickyTop: 72, boundary: layout.product });

    expect(layout.host.style.position).toBe('relative');
    expect(layout.host.style.top).toBe('3px');
    expect(layout.host.style.width).toBe('75%');
    expect(layout.host.style.color).toBe('rebeccapurple');
    expect(layout.host.style.getPropertyValue('--merchant-live-change')).toBe('retained');
    expect(layout.host.style.getPropertyValue('--ov25-sticky-header-offset')).toBe('99px');
    expect(document.querySelector('[data-ov25-sticky-placeholder="property-restore"]')).toBeNull();
    controller.destroy();
  });

  it('preserves natural desktop height under the available cap without changing mobile sizing', () => {
    const layout = installLayout();
    layout.host.setAttribute('data-ov25-inline-sticky-mobile', 'false');
    layout.host.style.setProperty('height', 'auto', 'important');
    const originalHost = layout.host;
    const originalIframe = layout.iframe;
    installMoveBefore();

    let availableHeight = 320;
    let naturalHeight = 280;
    const readComputedStyle = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudoElement) => {
      const computed = readComputedStyle.call(window, element, pseudoElement);
      if (element !== layout.host) return computed;
      return new Proxy(computed, {
        get(target, property) {
          if (property === 'maxHeight') return `${availableHeight}px`;
          const value = Reflect.get(target, property, target);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    });
    vi.spyOn(layout.host, 'getBoundingClientRect').mockImplementation(() =>
      domRect(40, Math.min(naturalHeight, availableHeight)),
    );
    let boundaryBottom = 900;
    vi.spyOn(layout.product, 'getBoundingClientRect').mockImplementation(() =>
      domRect(0, boundaryBottom),
    );

    const controller = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'desktop-resize',
    });
    controller.update({
      enabled: true,
      stickyTop: 120,
      boundary: layout.product,
    });

    const placeholder = layout.parent.querySelector<HTMLElement>(
      '[data-ov25-sticky-placeholder="desktop-resize"]',
    )!;
    vi.spyOn(placeholder, 'getBoundingClientRect').mockImplementation(() =>
      domRect(40, Number.parseFloat(placeholder.style.height)),
    );
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('height')).toBe('auto');
    expect(layout.host.style.getPropertyPriority('height')).toBe('important');
    expect(placeholder.style.height).toBe('280px');

    availableHeight = 500;
    boundaryBottom = 540;
    controller.update({
      enabled: true,
      stickyTop: 72,
      boundary: layout.product,
    });

    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');
    expect(layout.host.style.getPropertyValue('height')).toBe('auto');
    expect(placeholder.style.height).toBe('280px');
    expect(placeholder.style.minHeight).toBe('280px');
    expect(placeholder.style.maxHeight).toBe('280px');
    expect(placeholder.getBoundingClientRect().height).toBe(280);
    expect(layout.host).toBe(originalHost);
    expect(layout.host.querySelector('iframe')).toBe(originalIframe);

    availableHeight = 220;
    controller.update({
      enabled: true,
      stickyTop: 72,
      boundary: layout.product,
    });
    expect(layout.host.style.getPropertyValue('height')).toBe('auto');
    expect(placeholder.style.height).toBe('220px');
    expect(placeholder.getBoundingClientRect().height).toBe(220);

    controller.update({
      enabled: false,
      stickyTop: 72,
      boundary: layout.product,
    });
    expect(layout.host.parentElement).toBe(layout.parent);
    expect(layout.host.nextElementSibling).toBe(layout.sibling);
    expect(layout.host.style.position).toBe('relative');
    expect(layout.host.style.top).toBe('3px');
    expect(layout.host.style.width).toBe('75%');
    expect(layout.host.style.margin).toBe('2px');
    expect(layout.host.style.getPropertyValue('height')).toBe('auto');
    expect(layout.host.style.getPropertyPriority('height')).toBe('important');
    expect(layout.host.style.getPropertyValue('--merchant-prop')).toBe('keep');
    expect(layout.host.querySelector('iframe')).toBe(originalIframe);
    expect(document.querySelector('[data-ov25-sticky-placeholder="desktop-resize"]')).toBeNull();

    controller.destroy();

    layout.host.setAttribute('data-ov25-inline-sticky-mobile', 'true');
    availableHeight = 500;
    naturalHeight = 320;
    boundaryBottom = 900;
    const mobileController = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'mobile-size',
    });
    mobileController.update({
      enabled: true,
      stickyTop: 72,
      boundary: layout.product,
    });
    const mobilePlaceholder = layout.parent.querySelector<HTMLElement>(
      '[data-ov25-sticky-placeholder="mobile-size"]',
    )!;
    expect(mobileController.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('height')).toBe('320px');
    expect(mobilePlaceholder.style.height).toBe('320px');
    expect(layout.host.querySelector('iframe')).toBe(originalIframe);

    mobileController.destroy();
    expect(layout.host.style.getPropertyValue('height')).toBe('auto');
    expect(layout.host.style.getPropertyPriority('height')).toBe('important');
  });

  it('locks Popover fallback to the rendered natural desktop height instead of the cap', () => {
    const layout = installLayout();
    layout.host.setAttribute('data-ov25-inline-sticky-mobile', 'false');
    layout.host.style.setProperty('height', 'auto', 'important');
    layout.host.style.setProperty('max-height', '700px', 'important');
    layout.host.style.setProperty('border', '2px solid black');
    layout.host.style.setProperty('padding', '3px');
    Object.defineProperties(layout.host, {
      showPopover: { configurable: true, value: vi.fn() },
      hidePopover: { configurable: true, value: vi.fn() },
    });
    vi.spyOn(layout.host, 'getBoundingClientRect').mockReturnValue(
      domRect(40, 280),
    );
    vi.spyOn(layout.product, 'getBoundingClientRect').mockReturnValue(
      domRect(0, 1000),
    );
    const controller = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'natural-popover-height',
    });

    controller.update({
      enabled: true,
      stickyTop: 120,
      boundary: layout.product,
    });

    const placeholder = layout.parent.querySelector<HTMLElement>(
      '[data-ov25-sticky-placeholder="natural-popover-height"]',
    )!;
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('height')).toBe('280px');
    expect(layout.host.style.borderWidth).toBe('0px');
    expect(layout.host.style.paddingTop).toBe('5px');
    expect(placeholder.style.height).toBe('280px');

    controller.destroy();
    expect(layout.host.style.getPropertyValue('height')).toBe('auto');
    expect(layout.host.style.getPropertyPriority('height')).toBe('important');
    expect(layout.host.style.borderTopWidth).toBe('2px');
    expect(layout.host.style.paddingTop).toBe('3px');
  });

  it('restores the cached Popover natural height after the available cap grows', () => {
    const layout = installLayout();
    layout.host.setAttribute('data-ov25-inline-sticky-mobile', 'false');
    layout.host.style.setProperty('height', 'auto', 'important');
    layout.host.style.setProperty('box-sizing', 'content-box');
    Object.defineProperties(layout.host, {
      showPopover: { configurable: true, value: vi.fn() },
      hidePopover: { configurable: true, value: vi.fn() },
    });

    let availableHeight = 700;
    let naturalHeight = 280;
    const readComputedStyle = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudoElement) => {
      const computed = readComputedStyle.call(window, element, pseudoElement);
      if (element !== layout.host) return computed;
      return new Proxy(computed, {
        get(target, property) {
          if (property === 'maxHeight') return `${availableHeight}px`;
          const value = Reflect.get(target, property, target);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    });
    vi.spyOn(layout.host, 'getBoundingClientRect').mockImplementation(() => {
      const explicitHeight = Number.parseFloat(layout.host.style.getPropertyValue('height'));
      const renderedHeight = Number.isFinite(explicitHeight) ? explicitHeight : naturalHeight;
      return domRect(40, Math.min(renderedHeight, availableHeight));
    });
    vi.spyOn(layout.product, 'getBoundingClientRect').mockReturnValue(domRect(0, 1000));

    const controller = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'popover-natural-cap-cycle',
    });
    const update = () => controller.update({
      enabled: true,
      stickyTop: 120,
      boundary: layout.product,
    });

    update();
    const placeholder = layout.parent.querySelector<HTMLElement>(
      '[data-ov25-sticky-placeholder="popover-natural-cap-cycle"]',
    )!;
    expect(layout.host.style.height).toBe('280px');
    expect(placeholder.style.height).toBe('280px');
    expect(layout.host.style.boxSizing).toBe('border-box');

    availableHeight = 220;
    update();
    expect(layout.host.style.height).toBe('220px');
    expect(placeholder.style.height).toBe('220px');

    availableHeight = 700;
    update();
    expect(layout.host.style.height).toBe('280px');
    expect(placeholder.style.height).toBe('280px');

    controller.update({
      enabled: false,
      stickyTop: 120,
      boundary: layout.product,
    });
    expect(layout.host.style.height).toBe('auto');
    expect(layout.host.style.boxSizing).toBe('content-box');

    naturalHeight = 340;
    update();
    expect(layout.host.style.height).toBe('340px');

    controller.destroy();
    expect(layout.host.style.height).toBe('auto');
    expect(layout.host.style.boxSizing).toBe('content-box');
  });

  it('keeps one bounded sticky track through boundary exit and restores all ownership', () => {
    const layout = installLayout();
    installMoveBefore();
    const iframeSrc = layout.iframe.src;
    let scrollX = 0;
    let scrollY = 0;
    let hostTop = 140;
    Object.defineProperty(window, 'scrollX', {
      configurable: true,
      get: () => scrollX,
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => scrollY,
    });
    vi.spyOn(layout.host, 'getBoundingClientRect').mockImplementation(() =>
      domRect(hostTop, 300),
    );
    vi.spyOn(layout.product, 'getBoundingClientRect').mockImplementation(() =>
      domRect(-scrollY, 900),
    );
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const controller = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'config-2',
    });

    controller.update({
      enabled: true,
      stickyTop: 80,
      boundary: layout.product,
      zIndex: STICKY_BODY_LAYER_Z_INDEX,
    });
    expect(controller.getMode()).toBe('normal');
    expect(layout.host.parentElement).toBe(layout.parent);

    hostTop = 50;
    scrollY = 90;
    controller.sync();
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');

    const placeholder = layout.parent.querySelector<HTMLElement>('[data-ov25-sticky-placeholder="config-2"]')!;
    vi.spyOn(placeholder, 'getBoundingClientRect').mockImplementation(() =>
      domRect(140 - scrollY, 300, 500, 40 - scrollX),
    );
    const layer = document.querySelector<HTMLElement>('[data-ov25-sticky-body-layer="config-2"]')!;
    vi.spyOn(layer, 'getBoundingClientRect').mockImplementation(() =>
      domRect(
        Number.parseFloat(layer.style.top) - scrollY,
        Number.parseFloat(layer.style.height),
        Number.parseFloat(layer.style.width),
        Number.parseFloat(layer.style.left) - scrollX,
      ),
    );
    scrollX = 20;
    scrollY = 600;

    controller.update({
      enabled: true,
      stickyTop: 80,
      boundary: layout.product,
      zIndex: STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX,
    });
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');
    expect(layout.host.style.getPropertyValue('top')).toBe('80px');
    expect(layout.host.style.getPropertyValue('left')).toBe('auto');
    expect(layout.host.style.getPropertyValue('z-index')).toBe(
      String(STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX),
    );
    expect(layer.style.top).toBe('140px');
    expect(layer.style.left).toBe('40px');
    expect(layer.style.width).toBe('500px');
    expect(layer.style.height).toBe('760px');

    scrollY = 850;
    controller.sync();
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');
    expect(layer.style.top).toBe('140px');
    expect(layer.style.height).toBe('760px');

    scrollY = 500;
    controller.sync();
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');
    expect(layer.style.top).toBe('140px');
    expect(layer.style.height).toBe('760px');

    controller.update({
      enabled: false,
      stickyTop: 80,
      boundary: layout.product,
    });
    expect(controller.getMode()).toBe('normal');
    expect(controller.isRelocated()).toBe(false);
    expect(layout.host.parentElement).toBe(layout.parent);
    expect(layout.host.nextElementSibling).toBe(layout.sibling);
    expect(layout.host.style.position).toBe('relative');
    expect(layout.host.style.top).toBe('3px');
    expect(layout.host.style.width).toBe('75%');
    expect(layout.host.style.margin).toBe('2px');
    expect(layout.host.style.height).toBe('');
    expect(layout.host.style.getPropertyValue('--merchant-prop')).toBe('keep');
    expect(layout.host.style.getPropertyValue('--ov25-client-accent')).toBe('');
    expect(layout.host.querySelector('iframe')).toBe(layout.iframe);
    expect(layout.iframe.src).toBe(iframeSrc);
    expect(document.querySelector('[data-ov25-sticky-placeholder="config-2"]')).toBeNull();
    expect(document.querySelector('[data-ov25-sticky-body-layer="config-2"]')).toBeNull();

    controller.destroy();
    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  });

  it('uses one activation frame, then leaves body-layer scrolling to native sticky', () => {
    const layout = installLayout();
    installMoveBefore();
    let hostTop = 140;
    vi.spyOn(layout.host, 'getBoundingClientRect').mockImplementation(() =>
      domRect(hostTop, 300),
    );
    vi.spyOn(layout.product, 'getBoundingClientRect').mockReturnValue(domRect(0, 900));

    const frames = new Map<number, FrameRequestCallback>();
    let nextFrameId = 1;
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      const frameId = nextFrameId++;
      frames.set(frameId, callback);
      return frameId;
    });
    const cancelFrame = vi.fn((frameId: number) => frames.delete(frameId));
    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      value: requestFrame,
    });
    Object.defineProperty(window, 'cancelAnimationFrame', {
      configurable: true,
      value: cancelFrame,
    });

    const addDocumentListener = vi.spyOn(document, 'addEventListener');
    const removeDocumentListener = vi.spyOn(document, 'removeEventListener');
    const controller = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'nested-scroll',
    });
    const scrollRegistration = addDocumentListener.mock.calls.find(
      ([eventName]) => eventName === 'scroll',
    );
    expect(scrollRegistration?.[2]).toEqual({ capture: true, passive: true });

    controller.update({
      enabled: true,
      stickyTop: 80,
      boundary: layout.product,
    });
    expect(controller.getMode()).toBe('normal');

    hostTop = 40;
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 100 });
    layout.parent.dispatchEvent(new Event('scroll'));
    expect(requestFrame).toHaveBeenCalledTimes(1);
    expect(frames).toHaveLength(1);
    const [[frameId, callback]] = [...frames.entries()];
    frames.delete(frameId);
    callback(performance.now());
    expect(controller.getMode()).toBe('fixed');
    expect(layout.host.style.getPropertyValue('position')).toBe('sticky');

    const frameCallsAfterRelocation = requestFrame.mock.calls.length;
    layout.parent.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    expect(requestFrame).toHaveBeenCalledTimes(frameCallsAfterRelocation);
    expect(frames).toHaveLength(0);

    controller.destroy();
    expect(removeDocumentListener).toHaveBeenCalledWith(
      'scroll',
      scrollRegistration?.[1],
      { capture: true },
    );
    const frameCallsAfterDestroy = requestFrame.mock.calls.length;
    layout.parent.dispatchEvent(new Event('scroll'));
    expect(requestFrame).toHaveBeenCalledTimes(frameCallsAfterDestroy);
    expect(frames).toHaveLength(0);
  });

  it('uses a manual popover without reparenting and restores exact host attributes', () => {
    const layout = installLayout();
    layout.host.setAttribute('popover', 'auto');
    layout.parent.style.setProperty('--ov25-client-accent', 'hotpink');
    const originalPopover = layout.host.getAttribute('popover');
    const originalParent = layout.host.parentNode;
    const originalSibling = layout.host.nextSibling;
    const originalBox = getComputedStyle(layout.host);
    const preservedInsets = ['top', 'right', 'bottom', 'left'].map((side) =>
      `${
        (Number.parseFloat(originalBox.getPropertyValue(`padding-${side}`)) || 0) +
        (Number.parseFloat(originalBox.getPropertyValue(`border-${side}-width`)) || 0)
      }px`,
    );
    const showPopover = vi.fn();
    const hidePopover = vi.fn();
    Object.defineProperties(layout.host, {
      showPopover: { configurable: true, value: showPopover },
      hidePopover: { configurable: true, value: hidePopover },
    });
    vi.spyOn(layout.host, 'getBoundingClientRect').mockReturnValue(domRect(40, 320));
    vi.spyOn(layout.product, 'getBoundingClientRect').mockReturnValue(domRect(-100, 1200));
    const parentInsertBefore = vi.spyOn(layout.parent, 'insertBefore');
    const bodyInsertBefore = vi.spyOn(document.body, 'insertBefore');

    const controller = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'popover',
    });
    controller.update({
      enabled: true,
      stickyTop: 72,
      boundary: layout.product,
    });

    expect(controller.getMode()).toBe('fixed');
    expect(controller.isRelocated()).toBe(true);
    expect(showPopover).toHaveBeenCalledOnce();
    expect(layout.host.parentNode).toBe(originalParent);
    expect(layout.host.nextSibling).toBe(originalSibling);
    expect(layout.host.getAttribute('popover')).toBe('manual');
    expect(layout.host.style.borderWidth).toBe('0px');
    expect(layout.host.style.borderStyle).toBe('none');
    expect(layout.host.style.paddingTop).toBe(preservedInsets[0]);
    expect(layout.host.style.paddingRight).toBe(preservedInsets[1]);
    expect(layout.host.style.paddingBottom).toBe(preservedInsets[2]);
    expect(layout.host.style.paddingLeft).toBe(preservedInsets[3]);
    expect(layout.host.style.backgroundColor).toBe('transparent');
    expect(document.querySelector('[data-ov25-sticky-body-layer="popover"]')).toBeNull();
    expect(parentInsertBefore.mock.calls.some(([node]) => node === layout.host)).toBe(false);
    expect(bodyInsertBefore.mock.calls.some(([node]) => node === layout.host)).toBe(false);

    controller.destroy();

    expect(hidePopover).toHaveBeenCalledOnce();
    expect(layout.host.parentNode).toBe(originalParent);
    expect(layout.host.nextSibling).toBe(originalSibling);
    expect(layout.host.style.position).toBe('relative');
    expect(layout.host.style.top).toBe('3px');
    expect(layout.host.style.width).toBe('75%');
    expect(layout.host.style.margin).toBe('2px');
    expect(layout.host.style.borderWidth).toBe('');
    expect(layout.host.style.paddingTop).toBe('');
    expect(layout.host.style.backgroundColor).toBe('');
    expect(layout.host.style.getPropertyValue('--merchant-prop')).toBe('keep');
    expect(layout.host.getAttribute('popover')).toBe(originalPopover);
    expect(document.querySelector('[data-ov25-sticky-placeholder="popover"]')).toBeNull();
  });

  it('leaves the host in native flow when neither popover nor moveBefore is supported', () => {
    const layout = installLayout();
    vi.spyOn(layout.host, 'getBoundingClientRect').mockReturnValue(domRect(40, 320));
    vi.spyOn(layout.product, 'getBoundingClientRect').mockReturnValue(domRect(-100, 1200));
    const originalStyle = layout.host.getAttribute('style');
    const originalParent = layout.host.parentNode;
    const parentInsertBefore = vi.spyOn(layout.parent, 'insertBefore');
    const bodyInsertBefore = vi.spyOn(document.body, 'insertBefore');
    const onUnsupported = vi.fn();

    const controller = createStickyHostRelocation({
      host: layout.host,
      document,
      layerKey: 'unsupported',
      onUnsupported,
    });
    controller.update({
      enabled: true,
      stickyTop: 72,
      boundary: layout.product,
    });
    controller.sync();

    expect(controller.getMode()).toBe('normal');
    expect(controller.isRelocated()).toBe(false);
    expect(layout.host.parentNode).toBe(originalParent);
    expect(layout.host.getAttribute('style')).toBe(originalStyle);
    expect(layout.host.querySelector('iframe')).toBe(layout.iframe);
    expect(parentInsertBefore.mock.calls.some(([node]) => node === layout.host)).toBe(false);
    expect(bodyInsertBefore.mock.calls.some(([node]) => node === layout.host)).toBe(false);
    expect(onUnsupported).toHaveBeenCalledOnce();
    expect(document.querySelector('[data-ov25-sticky-placeholder="unsupported"]')).toBeNull();
    expect(document.querySelector('[data-ov25-sticky-body-layer="unsupported"]')).toBeNull();

    controller.destroy();
  });
});
