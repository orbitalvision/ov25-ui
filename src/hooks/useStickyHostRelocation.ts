// fallback system used when ordinary CSS position: sticky cannot work because of client-theme layout constraints
// First fallack (Popover): lifts the same host into the top layer without reparenting.
// Second fallback (Body layer): uses Element.moveBefore() to move the same host into a bounded body-level sticky track while preserving node/iframe identity.
import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  calculateStickyBodyFallbackGeometry,
  getStickyHostNaturalDocumentTop,
  observeStickyHostNaturalDocumentTop,
} from '../lib/sticky-layout-controller.js';
import {
  BODY_STICKY_FULLSCREEN_PORTAL_Z_INDEX,
  BODY_STICKY_PORTAL_Z_INDEX,
} from '../lib/config/layers.js';

export type StickyHostRelocationMode = 'normal' | 'fixed' | 'absolute-end';

export interface StickyHostRelocationUpdate {
  enabled: boolean;
  stickyTop: number;
  occlusionTop?: number;
  boundary: HTMLElement | null;
  fullViewportWidth?: boolean;
  freeze?: boolean;
  zIndex?: number;
}

export interface StickyHostRelocationController {
  update(update: StickyHostRelocationUpdate): void;
  sync(): void;
  getMode(): StickyHostRelocationMode;
  isRelocated(): boolean;
  destroy(): void;
}

interface CreateStickyHostRelocationOptions {
  host: HTMLElement;
  document: Document;
  window?: Window;
  layerKey?: string;
  onModeChange?: (mode: StickyHostRelocationMode) => void;
  onUnsupported?: (message: string) => void;
}

export const STICKY_BODY_LAYER_Z_INDEX = BODY_STICKY_PORTAL_Z_INDEX;
export const STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX =
  BODY_STICKY_FULLSCREEN_PORTAL_Z_INDEX;

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

type StickyHostRelocationStrategy = 'popover' | 'body-layer';

function moveBeforeIfSupported(
  parent: ParentNode,
  node: Node,
  reference: Node | null,
): boolean {
  const movableParent = parent as ParentNode & {
    moveBefore?: (node: Node, child: Node | null) => void;
  };

  if (typeof movableParent.moveBefore !== 'function') return false;

  try {
    movableParent.moveBefore(node, reference);
    return true;
  } catch {
    return false;
  }
}

/**
 * Popover/body-layer relocation changes the host's inheritance chain, so resolved and ancestor-defined
 * `--ov25-*` custom properties are copied onto the host. Relocation cleanup restores its original styles.
 */
function preserveInheritedOv25CustomProperties(
  host: HTMLElement,
  computed: CSSStyleDeclaration,
  setStyle: (property: string, value: string, priority?: string) => void,
): void {
  const names = new Set<string>();
  for (let index = 0; index < computed.length; index += 1) {
    const property = computed.item(index);
    if (property.startsWith('--ov25-')) names.add(property);
  }
  let ancestor = host.parentElement;
  while (ancestor) {
    for (let index = 0; index < ancestor.style.length; index += 1) {
      const property = ancestor.style.item(index);
      if (property.startsWith('--ov25-')) names.add(property);
    }
    ancestor = ancestor.parentElement;
  }

  for (const property of names) {
    if (host.style.getPropertyValue(property)) continue;
    let value = computed.getPropertyValue(property).trim();
    if (!value) {
      let ancestor = host.parentElement;
      while (ancestor && !value) {
        value = ancestor.style.getPropertyValue(property).trim();
        ancestor = ancestor.parentElement;
      }
    }
    if (!value) continue;
    setStyle(property, value, '');
  }
}

function finiteScrollValue(value: number | undefined): number {
  return Number.isFinite(value) ? value ?? 0 : 0;
}

function computedPixelLength(value: string): number | null {
  const match = /^(-?(?:\d+(?:\.\d+)?|\.\d+))px$/i.exec(value.trim());
  if (!match) return null;
  const number = Number(match[1]);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function resolveDesktopStickyRenderedHeight(
  host: HTMLElement,
  windowObject: Window,
  naturalHeight: number | null = null,
): number | null {
  if (host.getAttribute('data-ov25-inline-sticky-mobile') !== 'false') return null;
  const computed = windowObject.getComputedStyle(host);
  const availableHeight =
    computedPixelLength(computed.maxHeight) ??
    computedPixelLength(computed.getPropertyValue('--ov25-sticky-available-height'));
  const renderedHeight = naturalHeight ?? host.getBoundingClientRect().height;
  if (!Number.isFinite(renderedHeight) || renderedHeight <= 0) return availableHeight;
  return availableHeight === null
    ? renderedHeight
    : Math.min(renderedHeight, availableHeight);
}

/**
 * Lifts one inject-owned outer gallery host without replacing or cloning it.
 * Popover: lifts the same host into the top layer without reparenting.
 * Body layer: uses Element.moveBefore() to move the same host into a bounded body-level sticky track while preserving node/iframe identity.
 */
export function createStickyHostRelocation(
  options: CreateStickyHostRelocationOptions,
): StickyHostRelocationController {
  const host = options.host;
  const documentObject = options.document;
  const windowObject = options.window ?? documentObject.defaultView;
  if (!windowObject) {
    throw new Error('createStickyHostRelocation requires a document with a window');
  }

  const originalParent = host.parentNode;
  const originalNextSibling = host.nextSibling;
  const runtimeWindow = windowObject as Window & { ResizeObserver?: typeof ResizeObserver };
  const usesNativeAnimationFrame = typeof windowObject.requestAnimationFrame === 'function';
  const requestFrame = usesNativeAnimationFrame
    ? windowObject.requestAnimationFrame.bind(windowObject)
    : (callback: FrameRequestCallback) => windowObject.setTimeout(() => callback(Date.now()), 16);
  const cancelFrame = usesNativeAnimationFrame
    ? windowObject.cancelAnimationFrame.bind(windowObject)
    : windowObject.clearTimeout.bind(windowObject);

  let update: StickyHostRelocationUpdate = {
    enabled: false,
    stickyTop: 0,
    boundary: null,
    zIndex: STICKY_BODY_LAYER_Z_INDEX,
  };
  let mode: StickyHostRelocationMode = 'normal';
  let destroyed = false;
  let frameId: number | null = null;
  let layer: HTMLDivElement | null = null;
  let placeholder: HTMLDivElement | null = null;
  let strategy: StickyHostRelocationStrategy | null = null;
  let bodyLayerNormalZIndex = '1';
  const relocationStyleSnapshots = new Map<string, { value: string; priority: string }>();
  const relocationAppliedStyles = new Map<string, { value: string; priority: string }>();
  let relocationPopoverAttribute: string | null = null;
  let hasRelocationSnapshot = false;
  let flowDocumentTop: number | null = null;
  let popoverShown = false;
  let unsupportedReported = false;
  let resizeObserver: ResizeObserver | null = null;
  let desktopNaturalHeight: number | null = null;

  const captureFlowOrigin = (): void => {
    const rect = host.getBoundingClientRect();
    flowDocumentTop =
      getStickyHostNaturalDocumentTop(host, windowObject) ??
      finiteScrollValue(windowObject.scrollY) + rect.top;
  };

  const naturalFlowRect = (): DOMRect => {
    const liveRect = host.getBoundingClientRect();
    const anchoredDocumentTop = getStickyHostNaturalDocumentTop(host, windowObject);
    const top =
      anchoredDocumentTop === null && flowDocumentTop === null
        ? liveRect.top
        : (anchoredDocumentTop ?? flowDocumentTop ?? 0) -
          finiteScrollValue(windowObject.scrollY);
    return {
      x: liveRect.x,
      y: top,
      top,
      right: liveRect.right,
      bottom: top + liveRect.height,
      left: liveRect.left,
      width: liveRect.width,
      height: liveRect.height,
      toJSON: () => ({}),
    } as DOMRect;
  };

  const isCurrentlyRelocated = (): boolean => Boolean(
    placeholder?.isConnected &&
    (strategy === 'popover' || (strategy === 'body-layer' && layer?.contains(host))),
  );

  const setMode = (nextMode: StickyHostRelocationMode): void => {
    if (mode === nextMode) return;
    mode = nextMode;
    options.onModeChange?.(mode);
  };

  const removeLayer = (): void => {
    layer?.remove();
    layer = null;
    bodyLayerNormalZIndex = '1';
  };

  const setRelocationStyle = (
    property: string,
    value: string,
    priority = 'important',
  ): void => {
    if (!relocationStyleSnapshots.has(property)) {
      relocationStyleSnapshots.set(property, {
        value: host.style.getPropertyValue(property),
        priority: host.style.getPropertyPriority(property),
      });
    }
    host.style.setProperty(property, value, priority);
    relocationAppliedStyles.set(property, {
      value: host.style.getPropertyValue(property),
      priority: host.style.getPropertyPriority(property),
    });
  };

  const restoreRelocationStyles = (): void => {
    for (const [property, previous] of relocationStyleSnapshots) {
      const applied = relocationAppliedStyles.get(property);
      const currentValue = host.style.getPropertyValue(property);
      const currentPriority = host.style.getPropertyPriority(property);
      if (
        applied &&
        (currentValue !== applied.value || currentPriority !== applied.priority)
      ) {
        continue;
      }
      if (previous.value) host.style.setProperty(property, previous.value, previous.priority);
      else host.style.removeProperty(property);
    }
    relocationStyleSnapshots.clear();
    relocationAppliedStyles.clear();
  };

  const captureRelocationState = (): void => {
    if (hasRelocationSnapshot) return;
    relocationPopoverAttribute = host.getAttribute('popover');
    hasRelocationSnapshot = true;
  };

  const restoreRelocationState = (): void => {
    if (!hasRelocationSnapshot) return;
    restoreRelocationStyles();
    if (host.getAttribute('popover') === 'manual') {
      if (relocationPopoverAttribute === null) host.removeAttribute('popover');
      else host.setAttribute('popover', relocationPopoverAttribute);
    }
    relocationPopoverAttribute = null;
    hasRelocationSnapshot = false;
  };

  const reportUnsupported = (): void => {
    if (unsupportedReported) return;
    unsupportedReported = true;
    const message =
      'Sticky host fallback is unavailable because neither the Popover API nor Element.moveBefore() is supported; using native positioning to preserve the configurator iframe.';
    if (options.onUnsupported) options.onUnsupported(message);
    else console.warn(`[OV25-UI] ${message}`);
  };

  const restore = (): void => {
    if (strategy === 'popover' && popoverShown) {
      try {
        (host as HTMLElement & { hidePopover: () => void }).hidePopover();
      } catch {
        // It may already have been closed by external code; attribute/style restoration still applies.
      }
      popoverShown = false;
    }

    if (strategy === 'body-layer' && layer?.contains(host)) {
      const destination = placeholder?.parentNode ?? originalParent;
      const reference = placeholder ??
        (originalNextSibling?.parentNode === destination ? originalNextSibling : null);
      if (!destination || !moveBeforeIfSupported(destination, host, reference)) {
        console.warn('[OV25-UI] Unable to restore sticky host with Element.moveBefore(); preserving the current host node and body layer.');
        return;
      }
    }

    if (placeholder) resizeObserver?.unobserve(placeholder);
    placeholder?.remove();
    placeholder = null;
    restoreRelocationState();
    removeLayer();
    strategy = null;
    desktopNaturalHeight = null;
    setMode('normal');
  };

  const ensureLayer = (): HTMLDivElement => {
    if (layer?.isConnected) return layer;
    layer = documentObject.createElement('div');
    layer.setAttribute('data-ov25-sticky-body-layer', options.layerKey ?? 'default');
    layer.setAttribute('data-clarity-mask', 'true');
    layer.style.position = 'absolute';
    layer.style.top = '0';
    layer.style.left = '0';
    layer.style.width = '100%';
    layer.style.height = '0';
    layer.style.boxSizing = 'border-box';
    layer.style.pointerEvents = 'none';
    layer.style.zIndex = bodyLayerNormalZIndex;
    documentObject.body.appendChild(layer);
    return layer;
  };

  const createPlaceholder = (rect: DOMRect): HTMLDivElement | null => {
    const parent = host.parentNode;
    if (!parent) return null;

    const nextPlaceholder = documentObject.createElement('div');
    nextPlaceholder.setAttribute('data-ov25-sticky-placeholder', options.layerKey ?? 'default');
    nextPlaceholder.setAttribute('data-clarity-mask', 'true');
    nextPlaceholder.setAttribute('aria-hidden', 'true');
    const computed = windowObject.getComputedStyle(host);
    const parentWidth = host.parentElement?.getBoundingClientRect().width ?? 0;
    const widthPercent = parentWidth > 0 ? Math.min(100, (rect.width / parentWidth) * 100) : 0;
    nextPlaceholder.style.display = computed.display === 'inline' ? 'block' : computed.display;
    nextPlaceholder.style.width = widthPercent > 0 ? `${widthPercent}%` : `${rect.width}px`;
    nextPlaceholder.style.maxWidth = '100%';
    nextPlaceholder.style.height = `${rect.height}px`;
    nextPlaceholder.style.boxSizing = 'border-box';
    nextPlaceholder.style.margin = computed.margin;
    nextPlaceholder.style.flex = computed.flex;
    nextPlaceholder.style.alignSelf = computed.alignSelf;
    nextPlaceholder.style.gridArea = computed.gridArea;
    nextPlaceholder.style.visibility = 'hidden';
    nextPlaceholder.style.pointerEvents = 'none';
    nextPlaceholder.appendChild(documentObject.createElement('span'));
    parent.insertBefore(nextPlaceholder, host);
    return nextPlaceholder;
  };

  const setPlaceholderHeight = (height: number): void => {
    if (!placeholder?.isConnected) return;
    const value = `${height}px`;
    placeholder.style.height = value;
    placeholder.style.minHeight = value;
    placeholder.style.maxHeight = value;
  };

  const prepareRelocation = (rect: DOMRect): boolean => {
    captureRelocationState();
    preserveInheritedOv25CustomProperties(
      host,
      windowObject.getComputedStyle(host),
      setRelocationStyle,
    );
    placeholder = createPlaceholder(rect);
    if (placeholder) {
      resizeObserver?.observe(placeholder);
      return true;
    }
    restoreRelocationState();
    return false;
  };

  const rollbackPreparedRelocation = (): void => {
    if (placeholder) resizeObserver?.unobserve(placeholder);
    placeholder?.remove();
    placeholder = null;
    restoreRelocationState();
    removeLayer();
    strategy = null;
    popoverShown = false;
  };

  const ensureRelocated = (rect: DOMRect): boolean => {
    if (isCurrentlyRelocated()) return true;
    if (rect.width <= 0 || rect.height <= 0) return false;

    const popoverHost = host as HTMLElement & {
      showPopover?: () => void;
      hidePopover?: () => void;
    };
    if (
      typeof popoverHost.showPopover === 'function' &&
      typeof popoverHost.hidePopover === 'function'
    ) {
      const computedBox = windowObject.getComputedStyle(host);
      const readInset = (side: 'Top' | 'Right' | 'Bottom' | 'Left'): string => {
        const padding =
          Number.parseFloat(computedBox.getPropertyValue(`padding-${side.toLowerCase()}`)) || 0;
        const border =
          Number.parseFloat(computedBox.getPropertyValue(`border-${side.toLowerCase()}-width`)) || 0;
        return `${padding + border}px`;
      };
      const preservedInsets = {
        Top: readInset('Top'),
        Right: readInset('Right'),
        Bottom: readInset('Bottom'),
        Left: readInset('Left'),
      };
      if (!prepareRelocation(rect)) return false;
      host.setAttribute('popover', 'manual');
      setRelocationStyle('border-width', '0');
      setRelocationStyle('border-style', 'none');
      setRelocationStyle('padding-top', preservedInsets.Top);
      setRelocationStyle('padding-right', preservedInsets.Right);
      setRelocationStyle('padding-bottom', preservedInsets.Bottom);
      setRelocationStyle('padding-left', preservedInsets.Left);
      setRelocationStyle('background-color', 'transparent');
      try {
        popoverHost.showPopover();
        popoverShown = true;
        strategy = 'popover';
        return true;
      } catch {
        rollbackPreparedRelocation();
      }
    }

    const computedZIndex = windowObject.getComputedStyle(host).zIndex.trim();
    const numericZIndex = Number(computedZIndex);
    bodyLayerNormalZIndex =
      computedZIndex !== '' &&
      computedZIndex !== 'auto' &&
      Number.isFinite(numericZIndex) &&
      numericZIndex < STICKY_BODY_LAYER_Z_INDEX
        ? computedZIndex
        : '1';
    const bodyLayer = ensureLayer();
    bodyLayer.style.zIndex = bodyLayerNormalZIndex;
    const canMoveOut = typeof (bodyLayer as HTMLDivElement & { moveBefore?: unknown }).moveBefore === 'function';
    const canMoveBack = Boolean(
      originalParent &&
      typeof (originalParent as ParentNode & { moveBefore?: unknown }).moveBefore === 'function',
    );
    if (!canMoveOut || !canMoveBack) {
      removeLayer();
      reportUnsupported();
      return false;
    }
    if (!prepareRelocation(rect)) {
      removeLayer();
      return false;
    }
    if (!moveBeforeIfSupported(bodyLayer, host, null)) {
      rollbackPreparedRelocation();
      reportUnsupported();
      return false;
    }
    strategy = 'body-layer';
    return true;
  };

  const applyCommonStyles = (width: number, height: number | null): void => {
    setRelocationStyle('right', 'auto');
    setRelocationStyle('bottom', 'auto');
    setRelocationStyle('width', `${width}px`);
    if (height !== null) setRelocationStyle('height', `${height}px`);
    setRelocationStyle('box-sizing', 'border-box');
    setRelocationStyle('margin-top', '0');
    setRelocationStyle('margin-right', '0');
    setRelocationStyle('margin-bottom', '0');
    setRelocationStyle('margin-left', '0');
    setRelocationStyle('pointer-events', 'auto');
    setRelocationStyle(
      'z-index',
      String(update.zIndex ?? STICKY_BODY_LAYER_Z_INDEX),
    );
  };

  const applyBodyLayerTrack = (
    geometry: ReturnType<typeof calculateStickyBodyFallbackGeometry>,
    width: number,
    height: number,
    documentViewportRect: DOMRect | null,
  ): void => {
    const bodyLayer = ensureLayer();
    const scrollX = finiteScrollValue(windowObject.scrollX);
    const scrollY = finiteScrollValue(windowObject.scrollY);
    const layerRect = bodyLayer.getBoundingClientRect();
    const currentLayerTop = Number.parseFloat(bodyLayer.style.top);
    const currentLayerLeft = Number.parseFloat(bodyLayer.style.left);
    const containingDocumentTop =
      layerRect.top + scrollY - (Number.isFinite(currentLayerTop) ? currentLayerTop : 0);
    const containingDocumentLeft =
      layerRect.left + scrollX - (Number.isFinite(currentLayerLeft) ? currentLayerLeft : 0);
    const trackDocumentTop = geometry.placeholder.top + scrollY;
    const trackDocumentLeft = documentViewportRect
      ? documentViewportRect.left + scrollX
      : geometry.placeholder.left + scrollX;
    const boundaryDocumentBottom = geometry.boundaryBottom === null
      ? Math.max(trackDocumentTop + height, documentObject.documentElement.scrollHeight)
      : geometry.boundaryBottom + scrollY;

    bodyLayer.style.top = `${trackDocumentTop - containingDocumentTop}px`;
    bodyLayer.style.left = `${trackDocumentLeft - containingDocumentLeft}px`;
    bodyLayer.style.width = `${width}px`;
    bodyLayer.style.height = `${Math.max(0, boundaryDocumentBottom - trackDocumentTop)}px`;
    bodyLayer.style.zIndex = update.freeze
      ? String(update.zIndex ?? STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX)
      : bodyLayerNormalZIndex;

    setRelocationStyle('position', 'sticky');
    setRelocationStyle('top', `${geometry.stickyTop}px`);
    setRelocationStyle('left', 'auto');
    setRelocationStyle('clip-path', 'none');
    setMode('fixed');
  };

  const sync = (): void => {
    frameId = null;
    if (destroyed) return;
    if (!update.enabled || !host.isConnected) {
      restore();
      return;
    }
    const currentlyRelocated = isCurrentlyRelocated();
    const measuredDesktopHeight = resolveDesktopStickyRenderedHeight(host, windowObject);
    if (!currentlyRelocated && measuredDesktopHeight !== null) {
      // Preserve the auto-sized flow measurement before Popover writes an explicit height.
      desktopNaturalHeight = measuredDesktopHeight;
    }
    const desktopHeight = resolveDesktopStickyRenderedHeight(
      host,
      windowObject,
      strategy === 'popover' ? desktopNaturalHeight : null,
    );
    if (desktopHeight !== null) setPlaceholderHeight(desktopHeight);
    if (update.freeze && isCurrentlyRelocated()) {
      setRelocationStyle(
        'z-index',
        String(update.zIndex ?? STICKY_BODY_LAYER_Z_INDEX),
      );
      setRelocationStyle('clip-path', 'none');
      if (strategy === 'body-layer' && layer) {
        layer.style.zIndex = String(
          update.zIndex ?? STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX,
        );
      }
      return;
    }

    const geometrySource = placeholder?.isConnected
      ? placeholder
      : { getBoundingClientRect: naturalFlowRect };
    const geometry = calculateStickyBodyFallbackGeometry({
      placeholder: geometrySource,
      stickyTop: update.stickyTop,
      boundary: update.boundary?.isConnected ? update.boundary : null,
      scrollY: finiteScrollValue(windowObject.scrollY),
    });

    const hasBodyLayerTrack = strategy === 'body-layer' && isCurrentlyRelocated();
    if (geometry.mode === 'flow' && !hasBodyLayerTrack) {
      restore();
      return;
    }
    if (
      !isCurrentlyRelocated() &&
      Math.abs(host.getBoundingClientRect().top - geometry.stickyTop) <= 0.5
    ) {
      return;
    }
    if (!ensureRelocated(geometrySource.getBoundingClientRect())) {
      restore();
      return;
    }

    if (desktopHeight !== null) setPlaceholderHeight(desktopHeight);
    const documentViewportRect = update.fullViewportWidth
      ? documentObject.documentElement.getBoundingClientRect()
      : null;
    const relocationWidth = update.fullViewportWidth
      ? documentObject.documentElement.clientWidth
      : geometry.fixedWidth;
    const relocationHeight = desktopHeight ?? geometry.fixedHeight;
    // Popover removes the merchant border and leaves normal flow, so lock its measured natural
    // height. The body track keeps auto height so browser layout can respond to structural resizes.
    const relocationHeightLock =
      desktopHeight === null || strategy === 'popover' ? relocationHeight : null;
    applyCommonStyles(relocationWidth, relocationHeightLock);
    if (strategy === 'body-layer') {
      applyBodyLayerTrack(
        geometry,
        relocationWidth,
        relocationHeight,
        documentViewportRect,
      );
      return;
    }
    if (geometry.mode === 'fixed') {
      setRelocationStyle('position', 'fixed');
      setRelocationStyle('top', `${geometry.stickyTop}px`);
      setRelocationStyle(
        'left',
        `${documentViewportRect?.left ?? geometry.fixedLeft}px`,
      );
      setRelocationStyle('clip-path', 'none');
      setMode('fixed');
      return;
    }

    const scrollX = finiteScrollValue(windowObject.scrollX);
    const scrollY = finiteScrollValue(windowObject.scrollY);
    const documentLeft = documentViewportRect
      ? documentViewportRect.left + scrollX
      : geometry.placeholder.left + scrollX;
    setRelocationStyle('position', 'absolute');
    if (strategy === 'popover') {
      setRelocationStyle(
        'top',
        `${geometry.documentEndTop ?? scrollY + geometry.placeholder.top}px`,
      );
      setRelocationStyle('left', `${documentLeft}px`);
    }
    const occlusionTop = Number.isFinite(update.occlusionTop)
      ? Math.max(0, update.occlusionTop ?? 0)
      : 0;
    const topInset = occlusionTop > 0
      ? Math.min(
          relocationHeight,
          Math.max(0, occlusionTop - (geometry.boundaryEndTop ?? occlusionTop)),
        )
      : 0;
    setRelocationStyle(
      'clip-path',
      topInset > 0 ? `inset(${topInset}px 0px 0px 0px)` : 'none',
    );
    setMode('absolute-end');
  };

  const scheduleSync = (): void => {
    if (destroyed || frameId !== null) return;
    frameId = requestFrame(sync);
  };

  const stopObservingFlowOrigin = observeStickyHostNaturalDocumentTop(
    host,
    scheduleSync,
  );

  const onScroll = (): void => {
    if (strategy === 'body-layer' && isCurrentlyRelocated()) return;
    scheduleSync();
  };
  const onViewportChange = (): void => scheduleSync();
  windowObject.addEventListener('scroll', onScroll, { passive: true });
  documentObject.addEventListener('scroll', onScroll, {
    capture: true,
    passive: true,
  });
  windowObject.addEventListener('resize', onViewportChange, { passive: true });
  windowObject.addEventListener('orientationchange', onViewportChange, { passive: true });
  windowObject.visualViewport?.addEventListener('resize', onViewportChange, { passive: true });
  windowObject.visualViewport?.addEventListener('scroll', onScroll, { passive: true });

  if (runtimeWindow.ResizeObserver) {
    resizeObserver = new runtimeWindow.ResizeObserver(() => {
      if (placeholder && isCurrentlyRelocated()) {
        const hostHeight =
          resolveDesktopStickyRenderedHeight(
            host,
            windowObject,
            strategy === 'popover' ? desktopNaturalHeight : null,
          ) ??
          host.getBoundingClientRect().height;
        const placeholderHeight = placeholder.getBoundingClientRect().height;
        if (hostHeight > 0 && Math.abs(hostHeight - placeholderHeight) > 0.5) {
          setPlaceholderHeight(hostHeight);
        }
      }
      scheduleSync();
    });
    resizeObserver.observe(host);
    if (update.boundary) resizeObserver.observe(update.boundary);
  }

  return {
    update(nextUpdate) {
      const previousBoundary = update.boundary;
      const enabling = !update.enabled && nextUpdate.enabled;
      update = nextUpdate;
      if (enabling && !isCurrentlyRelocated()) captureFlowOrigin();
      if (resizeObserver && previousBoundary !== update.boundary) {
        if (previousBoundary) resizeObserver.unobserve(previousBoundary);
        if (update.boundary) resizeObserver.observe(update.boundary);
      }
      sync();
      if (!update.enabled) flowDocumentTop = null;
    },
    sync,
    getMode: () => mode,
    isRelocated: isCurrentlyRelocated,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (frameId !== null) {
        cancelFrame(frameId);
        frameId = null;
      }
      resizeObserver?.disconnect();
      stopObservingFlowOrigin();
      windowObject.removeEventListener('scroll', onScroll);
      documentObject.removeEventListener('scroll', onScroll, { capture: true });
      windowObject.removeEventListener('resize', onViewportChange);
      windowObject.removeEventListener('orientationchange', onViewportChange);
      windowObject.visualViewport?.removeEventListener('resize', onViewportChange);
      windowObject.visualViewport?.removeEventListener('scroll', onScroll);
      restore();
    },
  };
}

export function useStickyHostRelocation(options: {
  host: HTMLElement | null;
  active: boolean;
  requiresBodyFallback: boolean;
  stickyTop: number;
  occlusionTop?: number;
  boundary: HTMLElement | null;
  overlayOpen: boolean;
  fullscreenOpen: boolean;
  fullViewportWidth?: boolean;
  layerKey?: string;
  resetKey?: unknown;
  onModeChange?: (mode: StickyHostRelocationMode) => void;
}): void {
  const controllerRef = useRef<StickyHostRelocationController | null>(null);
  const onModeChangeRef = useRef(options.onModeChange);
  onModeChangeRef.current = options.onModeChange;

  useBrowserLayoutEffect(() => {
    if (!options.host || typeof document === 'undefined') return;
    const controller = createStickyHostRelocation({
      host: options.host,
      document: options.host.ownerDocument,
      layerKey: options.layerKey,
      onModeChange: (mode) => onModeChangeRef.current?.(mode),
    });
    controllerRef.current = controller;
    return () => {
      controller.destroy();
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, [options.host, options.layerKey, options.resetKey]);

  useBrowserLayoutEffect(() => {
    controllerRef.current?.update({
      enabled:
        options.active &&
        options.requiresBodyFallback &&
        (!options.overlayOpen || options.fullscreenOpen),
      stickyTop: options.stickyTop,
      occlusionTop: options.occlusionTop,
      boundary: options.boundary,
      fullViewportWidth: options.fullViewportWidth,
      freeze: options.fullscreenOpen,
      zIndex: options.fullscreenOpen
        ? STICKY_BODY_LAYER_FULLSCREEN_Z_INDEX
        : STICKY_BODY_LAYER_Z_INDEX,
    });
  }, [
    options.host,
    options.layerKey,
    options.resetKey,
    options.active,
    options.requiresBodyFallback,
    options.stickyTop,
    options.occlusionTop,
    options.boundary,
    options.overlayOpen,
    options.fullscreenOpen,
    options.fullViewportWidth,
  ]);
}
