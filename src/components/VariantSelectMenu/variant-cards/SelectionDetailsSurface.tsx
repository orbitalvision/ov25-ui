import * as React from 'react';
import { X } from 'lucide-react';
import {
  useOV25UI,
  type SelectionDetailsItem,
  type SelectionDetailsState,
  type Swatch,
} from '../../../contexts/ov25-ui-context.js';
import { PLACEHOLDER_IMAGE_URL } from '../../../lib/placeholder-image.js';
import { useSwatchActions } from '../../../hooks/useSwatchActions.js';
import { acquirePageScrollLock } from '../../../utils/page-scroll-lock.js';
import { Button } from '../../ui/button.js';
import { SwatchMetadata } from '../SwatchMetadata.js';

const ENTER_MS = 220;
const EXIT_MS = 180;
const SHEET_ENTER_MS = 260;
const SHEET_EXIT_MS = 220;
const VIEWPORT_GAP = 12;
const TOOLTIP_GAP = 10;
const TOOLTIP_WIDTH = 240;
const TOOLTIP_HEIGHT = 360;
const SELECTION_DETAILS_IMAGE_WIDTH_COMPACT = 400;
const SELECTION_DETAILS_IMAGE_WIDTH_DESKTOP = 800;
const OV25_CDN_ORIGIN = 'https://cdn.orbital.vision';
const useBrowserLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
// React 18 drops `inert={true}`, while React 19 drops `inert=""`.
// The canonical named value in a widened spread emits the boolean attribute in both.
const INERT_HTML_ATTRIBUTE: Record<string, string> = { inert: 'inert' };
let backgroundIsolationCount = 0;
const backgroundElementState = new Map<Element, {
  ariaHidden: string | null;
  inert: boolean;
}>();

function isolatePageBackground(surface: HTMLElement): () => void {
  if (backgroundIsolationCount === 0) {
    const rootNode = surface.getRootNode();
    let surfaceTreeRoot: Element = rootNode instanceof ShadowRoot ? rootNode.host : surface;
    while (surfaceTreeRoot.parentElement && surfaceTreeRoot.parentElement !== document.body) {
      surfaceTreeRoot = surfaceTreeRoot.parentElement;
    }

    for (const element of Array.from(document.body.children)) {
      if (
        element === surfaceTreeRoot ||
        element.id === 'ov25-toaster-container' ||
        element.id === 'ov25-swatchbook-portal-container' ||
        element.id.startsWith('ov25-selection-details-portal-container')
      ) {
        continue;
      }
      backgroundElementState.set(element, {
        ariaHidden: element.getAttribute('aria-hidden'),
        inert: element.hasAttribute('inert'),
      });
      element.setAttribute('aria-hidden', 'true');
      element.setAttribute('inert', '');
    }
  }
  backgroundIsolationCount += 1;

  return () => {
    backgroundIsolationCount = Math.max(0, backgroundIsolationCount - 1);
    if (backgroundIsolationCount !== 0) return;
    for (const [element, state] of backgroundElementState) {
      if (state.ariaHidden == null) {
        element.removeAttribute('aria-hidden');
      } else {
        element.setAttribute('aria-hidden', state.ariaHidden);
      }
      if (!state.inert) element.removeAttribute('inert');
    }
    backgroundElementState.clear();
  };
}

type TooltipPosition = {
  left: number;
  top: number;
  width: number;
};

function firstImage(...values: Array<string | null | undefined>): string {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0) ?? PLACEHOLDER_IMAGE_URL;
}

/** Request an on-demand CDN resize while retaining the source image's aspect ratio. */
export function resizeSelectionDetailsImage(source: string, width: number): string {
  if (!Number.isFinite(width) || width <= 0) return source;

  try {
    const url = new URL(source);
    if (url.origin !== OV25_CDN_ORIGIN) return source;

    if (!url.pathname.startsWith('/rs/')) {
      url.pathname = `/rs${url.pathname.startsWith('/') ? '' : '/'}${url.pathname}`;
    }
    url.searchParams.set('w', String(Math.round(width)));
    url.hash = '';
    return url.toString();
  } catch {
    return source;
  }
}

export function resolveEligibleSelectionDetailsSwatch(
  item: SelectionDetailsItem,
  swatchesEnabled: boolean,
): Swatch | undefined {
  return swatchesEnabled ? (item.swatch ?? item.selection.swatch) : undefined;
}

export function resolveSelectionDetailsImage(
  item: SelectionDetailsItem,
  targetWidth?: number,
): string {
  const sourceSelection = item.selection;
  const sourceSwatch = item.swatch ?? sourceSelection.swatch;
  const source = firstImage(
    sourceSelection.thumbnail,
    sourceSwatch?.thumbnail?.thumbnail,
    sourceSelection.miniThumbnails?.large,
    sourceSwatch?.thumbnail?.miniThumbnails?.large,
    sourceSelection.miniThumbnails?.medium,
    sourceSwatch?.thumbnail?.miniThumbnails?.medium,
    sourceSelection.miniThumbnails?.small,
    sourceSwatch?.thumbnail?.miniThumbnails?.small,
    item.image,
  );
  return targetWidth == null ? source : resizeSelectionDetailsImage(source, targetWidth);
}

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter((element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true');
}

function isComposedAncestor(ancestor: Node, descendant: Node): boolean {
  let current: Node | null = descendant;
  while (current) {
    if (current === ancestor) return true;
    if (current.parentNode) {
      current = current.parentNode;
    } else if (current instanceof ShadowRoot) {
      current = current.host;
    } else {
      current = null;
    }
  }
  return false;
}

function tooltipPositionFor(trigger: HTMLElement, surface: HTMLElement | null): TooltipPosition {
  const triggerRect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(TOOLTIP_WIDTH, Math.max(1, viewportWidth - VIEWPORT_GAP * 2));
  const measuredHeight = surface?.getBoundingClientRect().height ?? Math.min(
    TOOLTIP_HEIGHT,
    Math.max(1, viewportHeight - VIEWPORT_GAP * 2),
  );
  const left = triggerRect.left - TOOLTIP_GAP - width;
  const top = Math.min(
    Math.max(VIEWPORT_GAP, triggerRect.top),
    Math.max(VIEWPORT_GAP, viewportHeight - VIEWPORT_GAP - measuredHeight),
  );
  return {
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(width),
  };
}

export function SelectionDetailsSurface() {
  const {
    selectionDetailsState,
    closeSelectionDetails,
    preloadSelectionDetails,
    selectedSelections,
    swatchRulesData,
    selectionDetailsUsesMobileMode,
    isSwatchBookOpen,
    getString,
    markSelectionDetailsApplied,
    isSelectionDetailsApplied,
  } = useOV25UI();
  const { isSwatchSelectedFor, toggleSwatchWithFeedback } = useSwatchActions();
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const exitTimerRef = React.useRef<number | null>(null);
  const appliedRequestRef = React.useRef<number | null>(null);
  const imageReadinessGenerationRef = React.useRef(0);
  const imageReadinessKeyRef = React.useRef<string | null>(null);
  const [rendered, setRendered] = React.useState<SelectionDetailsState | null>(selectionDetailsState);
  const [present, setPresent] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState<TooltipPosition | null>(null);
  const [failedImage, setFailedImage] = React.useState<{
    requestId: number;
    source: string;
  } | null>(null);
  const [decodedImage, setDecodedImage] = React.useState<{
    requestId: number;
    source: string;
  } | null>(null);

  // Keep the last details request mounted long enough to run its enter or exit transition.
  React.useEffect(() => {
    if (exitTimerRef.current != null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    if (selectionDetailsState) {
      setRendered(selectionDetailsState);
      appliedRequestRef.current = null;
      const skipTransition =
        selectionDetailsState.instant ||
        (selectionDetailsState.displayMode === 'fullscreen' && !selectionDetailsUsesMobileMode);
      if (skipTransition) {
        setPresent(true);
      } else {
        setPresent(false);
        let enterFrame: number | null = null;
        const mountFrame = window.requestAnimationFrame(() => {
          enterFrame = window.requestAnimationFrame(() => setPresent(true));
        });
        return () => {
          window.cancelAnimationFrame(mountFrame);
          if (enterFrame != null) window.cancelAnimationFrame(enterFrame);
        };
      }
      return;
    }

    if (!rendered) return;
    const skipTransition =
      rendered.instant ||
      (rendered.displayMode === 'fullscreen' && !selectionDetailsUsesMobileMode);
    if (skipTransition) {
      setRendered(null);
      setPresent(false);
      return;
    }
    setPresent(false);
    const exitDuration = rendered.displayMode === 'sheet' ? SHEET_EXIT_MS : EXIT_MS;
    exitTimerRef.current = window.setTimeout(() => {
      exitTimerRef.current = null;
      setRendered(null);
    }, exitDuration);
  }, [selectionDetailsState, rendered, selectionDetailsUsesMobileMode]);

  // Clear a pending exit transition if the entire surface unmounts.
  React.useEffect(() => () => {
    if (exitTimerRef.current != null) window.clearTimeout(exitTimerRef.current);
  }, []);

  const isTooltip = rendered?.displayMode === 'tooltip';
  const shouldLockPage = Boolean(rendered && !isTooltip);
  const requestedImageUrl = rendered
    ? resolveSelectionDetailsImage(
      rendered.item,
      selectionDetailsUsesMobileMode || isTooltip || rendered.displayMode === 'sheet'
        ? SELECTION_DETAILS_IMAGE_WIDTH_COMPACT
        : SELECTION_DETAILS_IMAGE_WIDTH_DESKTOP,
    )
    : '';
  const imageUrl = rendered && failedImage?.requestId === rendered.requestId
    ? PLACEHOLDER_IMAGE_URL
    : requestedImageUrl;

  const schedulePreloadAfterImagePaint = React.useCallback((
    image: HTMLImageElement,
    requestId: number,
    source: string,
  ) => {
    if (!image.complete || image.naturalWidth <= 0) return;
    if (image.getAttribute('src') !== source) return;

    const key = `${requestId}:${source}`;
    if (imageReadinessKeyRef.current === key) return;
    imageReadinessKeyRef.current = key;
    const generation = imageReadinessGenerationRef.current;
    const isCurrentImage = () =>
      imageReadinessGenerationRef.current === generation &&
      image.isConnected &&
      image.getAttribute('src') === source;

    const decoded = typeof image.decode === 'function'
      ? image.decode()
      : Promise.resolve();

    void decoded
      // `load` has already succeeded. Some browsers reject `decode()` for
      // SVG/data images even though they can paint them, so still allow one
      // paint before starting the speculative iframe work.
      .catch(() => undefined)
      .then(() => {
        if (!isCurrentImage()) return;
        setDecodedImage({ requestId, source });
      });
  }, []);

  // Reset image readiness for each request and detect images already loaded from cache.
  React.useEffect(() => {
    imageReadinessGenerationRef.current += 1;
    imageReadinessKeyRef.current = null;
    if (!rendered || !imageUrl) return;

    const image = imageRef.current;
    // A cached image can complete before React receives an `onLoad` event.
    if (image?.complete && image.naturalWidth > 0) {
      schedulePreloadAfterImagePaint(image, rendered.requestId, imageUrl);
    }
  }, [imageUrl, rendered?.requestId, schedulePreloadAfterImagePaint]);

  // Start selection preloading only after the visible image has decoded and painted.
  React.useEffect(() => {
    if (!rendered || !present) return;
    if (
      decodedImage?.requestId !== rendered.requestId ||
      decodedImage.source !== imageUrl
    ) {
      return;
    }

    const image = imageRef.current;
    if (!image || image.getAttribute('src') !== imageUrl) return;
    const generation = imageReadinessGenerationRef.current;
    let secondFrame: number | null = null;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (
          imageReadinessGenerationRef.current !== generation ||
          !image.isConnected ||
          image.getAttribute('src') !== imageUrl
        ) {
          return;
        }
        preloadSelectionDetails(rendered.requestId);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame != null) window.cancelAnimationFrame(secondFrame);
    };
  }, [decodedImage, imageUrl, preloadSelectionDetails, present, rendered]);

  // Invalidate any asynchronous image-readiness work when the surface unmounts.
  React.useEffect(() => () => {
    imageReadinessGenerationRef.current += 1;
  }, []);

  // Keep the tooltip anchored to its card and close it if that card leaves the DOM.
  React.useLayoutEffect(() => {
    if (!rendered || !isTooltip) {
      setTooltipPosition(null);
      return;
    }

    const update = () => {
      if (!rendered.trigger.isConnected) {
        closeSelectionDetails(false);
        return;
      }
      const position = tooltipPositionFor(rendered.trigger, surfaceRef.current);
      setTooltipPosition(position);
    };

    update();
    const observer = new ResizeObserver(update);
    if (surfaceRef.current) observer.observe(surfaceRef.current);
    observer.observe(rendered.trigger);
    const mutationObserver = new MutationObserver((records) => {
      // A framework render can detach and reattach the same card before this
      // callback runs, making `isConnected` true again. Treat any mutation
      // record that removed the captured anchor (or one of its ancestors) as
      // an anchor removal so the tooltip cannot remain attached to stale UI.
      const triggerWasRemoved = records.some((record) =>
        Array.from(record.removedNodes).some((removedNode) =>
          isComposedAncestor(removedNode, rendered.trigger)
        ),
      );
      if (triggerWasRemoved) {
        closeSelectionDetails(false);
        return;
      }
      update();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    const triggerRoot = rendered.trigger.getRootNode();
    if (triggerRoot instanceof ShadowRoot) {
      mutationObserver.observe(triggerRoot, { childList: true, subtree: true });
    }
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [closeSelectionDetails, isTooltip, rendered]);

  // Freeze the page before paint and keep it frozen through the exit transition.
  useBrowserLayoutEffect(() => {
    if (!shouldLockPage) return;
    return acquirePageScrollLock();
  }, [shouldLockPage]);

  // Make a presented modal-style surface exclusive to assistive technologies.
  React.useEffect(() => {
    if (!rendered || isTooltip || !present) return;
    const surface = surfaceRef.current;
    if (!surface) return;

    const restorePageBackground = isolatePageBackground(surface);

    return () => {
      restorePageBackground();
    };
  }, [isTooltip, present, rendered]);

  // Manage Escape and focus containment while a modal-style surface is active.
  React.useEffect(() => {
    if (!rendered || isTooltip || !present || isSwatchBookOpen) return;
    const surface = surfaceRef.current;
    if (!surface) return;

    const focusables = getFocusableElements(surface);
    (focusables[0] ?? surface).focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeSelectionDetails(true);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = getFocusableElements(surface);
      if (items.length === 0) {
        event.preventDefault();
        surface.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const activeElement = (surface.getRootNode() as ShadowRoot | Document).activeElement ?? document.activeElement;
      if (event.shiftKey && (activeElement === first || activeElement === surface)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [closeSelectionDetails, isSwatchBookOpen, isTooltip, present, rendered]);

  // Let Escape dismiss a passive tooltip without intercepting an open SwatchBook.
  React.useEffect(() => {
    if (!rendered || !isTooltip || isSwatchBookOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      closeSelectionDetails(false);
    };
    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [closeSelectionDetails, isSwatchBookOpen, isTooltip, rendered]);

  if (!rendered) return null;

  const { item } = rendered;
  const sourceSelection = item.selection;
  const eligibleSwatch = resolveEligibleSelectionDetailsSwatch(item, swatchRulesData.enabled);
  const rawTitle = eligibleSwatch?.name?.trim() || sourceSelection.name || item.name;
  const rawDescription = eligibleSwatch?.description?.trim() || '';
  const stringValues = {
    SELECTION_NAME: rawTitle,
    DESCRIPTION: rawDescription,
  };
  const title = getString('selectionDetailsTitle', stringValues, rawTitle);
  const description = rawDescription
    ? getString('selectionDetailsDescription', stringValues, rawDescription)
    : '';
  const isApplied = Boolean(item.isSelected) || isSelectionDetailsApplied(item) || selectedSelections.some((selected) =>
    selected.optionId === item.optionId &&
    selected.selectionId === item.id &&
    (item.groupId == null || selected.groupId == null || selected.groupId === item.groupId)
  );
  const swatchSelected = isSwatchSelectedFor(eligibleSwatch);
  const titleId = `ov25-selection-details-title-${rendered.requestId}`;
  const mode = rendered.displayMode;
  const isFullscreen = mode === 'fullscreen';
  const isFullscreenDesktop = isFullscreen && !selectionDetailsUsesMobileMode;
  const isModalDesktop = mode === 'modal' && !selectionDetailsUsesMobileMode;
  const slidesFromRight = mode === 'sheet' || (isFullscreen && selectionDetailsUsesMobileMode);
  const animate = !rendered.instant && (!isFullscreen || selectionDetailsUsesMobileMode);
  const transitionDuration = mode === 'tooltip'
    ? (present ? 160 : 125)
    : mode === 'sheet'
      ? (present ? SHEET_ENTER_MS : SHEET_EXIT_MS)
      : (present ? ENTER_MS : EXIT_MS);
  const transitionEasing = slidesFromRight
    ? 'cubic-bezier(0.32, 0.72, 0, 1)'
    : 'cubic-bezier(0.22, 1, 0.36, 1)';
  const transitionTiming = `${transitionDuration}ms ${transitionEasing}`;
  const panelTransition = animate
    ? `opacity ${transitionTiming}, transform ${transitionTiming}`
    : 'none';
  const actionButtonWidthClass = isFullscreenDesktop
    ? 'ov:w-full'
    : isModalDesktop
      ? 'ov:w-1/2'
      : 'ov:w-full';
  const footerLayoutClass = isFullscreenDesktop
    ? 'ov:col-start-2 ov:row-start-2 ov:flex-col ov:border-l'
    : isModalDesktop
      ? 'ov:flex-col ov:items-center'
      : 'ov:flex-col';
  const footerTopBorderClass = isModalDesktop ? '' : 'ov:border-t';
  const footerPaddingClass = mode === 'sheet'
    ? 'ov:px-4 ov:pt-4 ov:pb-2'
    : 'ov:p-4';
  const panelStyle: React.CSSProperties | undefined = mode === 'tooltip'
    ? {
        left: tooltipPosition?.left ?? VIEWPORT_GAP,
        top: tooltipPosition?.top ?? VIEWPORT_GAP,
        width: tooltipPosition?.width ?? Math.min(
          TOOLTIP_WIDTH,
          Math.max(1, window.innerWidth - VIEWPORT_GAP * 2),
        ),
        opacity: present ? 1 : 0,
        transform: present ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.985)',
        transition: panelTransition,
      }
    : slidesFromRight
      ? {
          opacity: present ? 1 : 0,
          transform: present ? 'translateX(0)' : 'translateX(100%)',
          transition: panelTransition,
        }
      : mode === 'fullscreen'
        ? undefined
        : {
            opacity: present ? 1 : 0,
            transform: present ? 'scale(1)' : 'scale(0.97)',
            transition: panelTransition,
          };

  const handleApply = () => {
    if (isApplied || appliedRequestRef.current === rendered.requestId) return;
    appliedRequestRef.current = rendered.requestId;
    rendered.onApply();
    markSelectionDetailsApplied(item);
    closeSelectionDetails(true);
  };

  return (
    <div
      className="ov25-selection-details-root ov:fixed ov:inset-0 ov:pointer-events-none"
    >
      {(mode === 'modal' || mode === 'sheet') && (
        <div
          className={`ov25-selection-details-backdrop ov:absolute ov:inset-0 ov:pointer-events-auto ${mode === 'modal' ? 'ov:bg-black/45' : ''}`}
          style={{
            opacity: mode === 'modal' ? (present ? 1 : 0) : 1,
            transition: mode === 'modal' && animate ? `opacity ${transitionTiming}` : 'none',
          }}
          data-display-mode={mode}
          data-present={present}
          aria-hidden="true"
          onPointerDown={() => closeSelectionDetails(true)}
        />
      )}
      <div
        ref={surfaceRef}
        role={isTooltip ? 'tooltip' : 'dialog'}
        aria-modal={!isTooltip && !isSwatchBookOpen || undefined}
        aria-hidden={isSwatchBookOpen || undefined}
        {...(isSwatchBookOpen ? INERT_HTML_ATTRIBUTE : {})}
        aria-labelledby={titleId}
        tabIndex={isTooltip ? undefined : -1}
        className={`ov25-selection-details-surface ${isFullscreenDesktop ? 'ov:grid' : 'ov:flex ov:flex-col'} ov:min-w-0 ov:max-w-full ov:overflow-hidden ov:bg-(--ov25-background-color) ov:text-(--ov25-text-color) ov:shadow-2xl ov:border ov:border-(--ov25-border-color) ov:focus:outline-none`}
        style={panelStyle}
        data-display-mode={mode}
        data-layout={isFullscreenDesktop ? 'split' : 'stacked'}
        data-mobile={selectionDetailsUsesMobileMode}
        data-present={present}
        data-pinned={rendered.pinned}
        data-interactive={!isTooltip && !isSwatchBookOpen}
      >
        {!isTooltip && (
          <button
            type="button"
            aria-label={getString('selectionDetailsClose', undefined, 'Close')}
            title={getString('selectionDetailsClose', undefined, 'Close')}
            className="ov25-selection-details-close ov:absolute ov:top-3 ov:right-3 ov:z-10 ov:flex ov:h-10 ov:w-10 ov:items-center ov:justify-center ov:rounded-full ov:bg-white/90 ov:text-black ov:shadow-sm ov:cursor-pointer ov:transition-none ov:focus-visible:outline-2 ov:focus-visible:outline-offset-2"
            onClick={() => closeSelectionDetails(true)}
          >
            <X aria-hidden="true" />
          </button>
        )}

        <div
          className={isFullscreenDesktop
            ? 'ov:contents'
            : isTooltip
              ? 'ov:relative ov:h-full ov:min-h-0 ov:flex-none ov:overflow-hidden'
              : 'ov:flex-1 ov:min-h-0 ov:min-w-0 ov:overflow-x-hidden ov:overflow-y-auto'}
        >
          <div
            className={`ov25-selection-details-image-frame ${isFullscreenDesktop
              ? 'ov:col-start-1 ov:row-start-1 ov:row-span-2 ov:flex ov:min-h-0 ov:min-w-0 ov:items-center ov:justify-center ov:overflow-hidden ov:bg-neutral-100 ov:p-8'
              : isTooltip
              ? 'ov:w-full ov:overflow-hidden ov:bg-neutral-100'
              : isFullscreen
              ? 'ov:flex ov:w-full ov:justify-center ov:px-4 ov:pt-16 ov:md:px-8 ov:md:pt-8'
              : `ov:mx-auto ov:w-full ov:aspect-square ov:overflow-hidden ov:bg-neutral-100 ${mode === 'modal' ? 'ov:mt-4' : ''}`}`}
            data-image-presentation={isFullscreen ? 'contain' : 'square-crop'}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt={title}
              fetchPriority="high"
              className={`ov25-selection-details-image ${isFullscreenDesktop
                ? 'ov:block ov:h-full ov:w-full ov:object-contain'
                : isFullscreen
                ? 'ov:block ov:w-auto ov:h-auto ov:max-w-full ov:object-contain'
                : 'ov:w-full ov:h-full ov:object-cover'}`}
              onLoad={(event) => {
                schedulePreloadAfterImagePaint(
                  event.currentTarget,
                  rendered.requestId,
                  imageUrl,
                );
              }}
              onError={(event) => {
                if (imageUrl === PLACEHOLDER_IMAGE_URL) return;
                if (event.currentTarget.getAttribute('src') !== imageUrl) return;
                setFailedImage({ requestId: rendered.requestId, source: imageUrl });
              }}
            />
          </div>
          <div
            className={`ov25-selection-details-copy ${isFullscreenDesktop
              ? 'ov:col-start-2 ov:row-start-1 ov:flex ov:min-h-0 ov:min-w-0 ov:flex-col ov:overflow-x-hidden ov:overflow-y-auto ov:border-l ov:border-(--ov25-border-color) ov:px-8 ov:py-20 ov:text-center'
              : isTooltip
              ? 'ov:absolute ov:inset-0 ov:min-w-0 ov:p-0'
              : `ov:min-w-0 ov:max-w-full ov:px-5 ov:pt-5 ${description ? 'ov:pb-5' : 'ov:pb-6'} ${isFullscreen || mode === 'modal' ? 'ov:text-center' : ''}`}`}
          >
            <div className={isFullscreenDesktop
              ? 'ov:my-auto ov:w-full ov:min-w-0 ov:max-w-full'
              : isTooltip
                ? 'ov:h-full ov:w-full ov:min-w-0 ov:max-w-full'
                : 'ov:min-w-0 ov:max-w-full'}>
              <h2
                id={titleId}
                className={`ov25-selection-details-title ${isFullscreenDesktop ? 'ov:text-3xl' : isTooltip ? '' : 'ov:text-xl'} ov:max-w-full ov:font-medium ov:leading-tight ${isTooltip ? '' : 'ov:text-(--ov25-secondary-text-color)'}`}
              >
                {title}
              </h2>
              {description && (
                <dl
                  className={`ov25-selection-details-description ${isFullscreenDesktop ? 'ov:mt-4 ov:text-base ov:leading-7' : isTooltip ? '' : 'ov:mt-3 ov:text-sm ov:leading-6'} ov:whitespace-pre-wrap ov:text-(--ov25-text-color)`}
                >
                  <div className="ov25-selection-details-description-row">
                    <dt className="ov25-selection-details-metadata-label ov25-selection-details-description-label">
                      {getString('swatchMetadataDescription', undefined, 'Description')}
                    </dt>
                    <dd className="ov25-selection-details-metadata-value ov25-selection-details-description-value ov:whitespace-pre-wrap">
                      {description}
                    </dd>
                  </div>
                </dl>
              )}
              <SwatchMetadata
                swatch={eligibleSwatch}
                parameters={swatchRulesData.parameters}
                getString={getString}
                classPrefix="ov25-selection-details"
                className={`${isFullscreenDesktop ? 'ov:mt-5' : isTooltip ? '' : 'ov:mt-4'} ov:grid ov:gap-1 ${isFullscreen || mode === 'modal' ? 'ov:text-center' : 'ov:text-left'} ov:text-sm ov:text-(--ov25-text-color)`}
              />
            </div>
          </div>
        </div>

        {!isTooltip && (
          <div
            className={`ov25-selection-details-footer ov:shrink-0 ov:flex ov:gap-2 ${footerTopBorderClass} ov:border-(--ov25-border-color) ov:bg-(--ov25-background-color) ${footerPaddingClass} ${footerLayoutClass}`}
          >
            {eligibleSwatch && (
              <Button
                type="button"
                variant="outline"
                className={`ov25-selection-details-swatch-toggle ${actionButtonWidthClass} ov:border-(--ov25-border-color) ov:rounded-none ov:bg-transparent ov:text-(--ov25-text-color) ov:transition-none`}
                data-selected={swatchSelected}
                onClick={() => toggleSwatchWithFeedback(eligibleSwatch)}
              >
                {swatchSelected
                  ? getString('selectionDetailsRemoveFromSwatchbook', undefined, 'Remove from swatchbook')
                  : getString('selectionDetailsAddToSwatchbook', undefined, 'Add to swatchbook')}
              </Button>
            )}
            <Button
              type="button"
              variant="configure"
              className={`ov25-selection-details-apply ${actionButtonWidthClass} ov:transition-none`}
              disabled={isApplied || appliedRequestRef.current === rendered.requestId}
              onClick={handleApply}
            >
              {isApplied
                ? getString('selectionDetailsApplied', undefined, 'Applied')
                : getString('selectionDetailsApply', undefined, 'Apply to Model')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
