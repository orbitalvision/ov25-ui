import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import * as React from 'react'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { useIframePositioning } from "../hooks/useIframePositioning.js"
import { cn } from "../lib/utils.js"
import {
  CONFIGURATOR_IFRAME_BACKGROUND_CSS_VAR,
  CONFIGURATOR_IFRAME_BACKGROUND_FALLBACK,
  TRANSITION_PROXY_CLOSE_EASING,
  TRANSITION_PROXY_CLOSE_MODAL_FADE_MS,
  TRANSITION_PROXY_CLOSE_SLIDE_MS,
  TRANSITION_PROXY_CLOSE_Z_INDEX,
  TRANSITION_PROXY_CLOSE_Z_INDEX_MOBILE_DRAWER,
  TRANSITION_PROXY_FADE_MS,
  TRANSITION_MODAL_OVERLAY_IN_MS,
  TRANSITION_PROXY_HOLD_DESKTOP_MS,
} from "../lib/config/iframe-transition-snapshot.js"
import {
  type ConfiguratorIframeScreenRect,
  findElementByIdInShadowOrRegularDOM,
  getResolvedConfiguratorIframeBackgroundColor,
} from "../utils/configurator-dom-queries.js"
import { createPortal } from "react-dom"
import { getSharedStylesheet, createuserCustomCssStylesheet } from "../utils/shadow-styles.js"
import { IframeContainer } from "./IframeContainer.js"
import { ProductCarousel } from "./product-carousel.js"
import { ArPreviewQRCodeDialog } from "./ar-preview-qr-code-dialog.js"

type ClosingProxyExit = 'sheet-slide-left' | 'drawer-slide-up' | 'modal-fade'

/**
 * Full-screen portaled bitmap at the pre-close iframe fixed rect; slides/fades with the shell while
 * the real iframe is already restored into the gallery.
 */
function ConfiguratorClosingTransitionProxyCanvas({
  bitmap,
  rect,
  exitAnimation,
  zIndex,
  onClear,
}: {
  bitmap: ImageBitmap
  rect: ConfiguratorIframeScreenRect
  exitAnimation: ClosingProxyExit
  zIndex: number
  onClear: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [runExit, setRunExit] = useState(false)

  const durationMs =
    exitAnimation === 'modal-fade' ? TRANSITION_PROXY_CLOSE_MODAL_FADE_MS : TRANSITION_PROXY_CLOSE_SLIDE_MS

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = Math.max(1, Math.round(rect.width))
    const h = Math.max(1, Math.round(rect.height))
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const bw = bitmap.width
    const bh = bitmap.height
    if (bw < 1 || bh < 1) return
    ctx.fillStyle = getResolvedConfiguratorIframeBackgroundColor()
    ctx.fillRect(0, 0, w, h)
    const scale = Math.max(w / bw, h / bh)
    const dw = bw * scale
    const dh = bh * scale
    const dx = (w - dw) / 2
    const dy = (h - dh) / 2
    ctx.drawImage(bitmap, dx, dy, dw, dh)
  }, [bitmap, rect.width, rect.height])

  useLayoutEffect(() => {
    draw()
  }, [draw])

  useLayoutEffect(() => {
    setRunExit(false)
    let raf1 = 0
    let raf2 = 0
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => setRunExit(true))
    })
    return () => {
      window.cancelAnimationFrame(raf1)
      window.cancelAnimationFrame(raf2)
    }
  }, [bitmap, rect.top, rect.left, rect.width, rect.height])

  useEffect(() => {
    if (!runExit) return
    const t = window.setTimeout(onClear, durationMs)
    return () => window.clearTimeout(t)
  }, [runExit, durationMs, onClear])

  const isModalFade = exitAnimation === 'modal-fade'
  const wrapperStyle: React.CSSProperties = {
    position: 'fixed',
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    zIndex,
    pointerEvents: 'none',
    overflow: 'hidden',
    backgroundColor: `var(${CONFIGURATOR_IFRAME_BACKGROUND_CSS_VAR}, ${CONFIGURATOR_IFRAME_BACKGROUND_FALLBACK})`,
    borderRadius: isModalFade
      ? 'var(--ov25-configurator-iframe-border-radius, 1.5rem)'
      : 0,
    transform:
      exitAnimation === 'sheet-slide-left'
        ? runExit
          ? 'translateX(-100%)'
          : 'translateX(0)'
        : exitAnimation === 'drawer-slide-up'
          ? runExit
            ? 'translateY(-100%)'
            : 'translateY(0)'
          : 'none',
    opacity: isModalFade ? (runExit ? 0 : 1) : 1,
    transition: isModalFade
      ? `opacity ${durationMs}ms ${TRANSITION_PROXY_CLOSE_EASING}`
      : `transform ${durationMs}ms ${TRANSITION_PROXY_CLOSE_EASING}`,
  }

  return createPortal(
    <div style={wrapperStyle}>
      <canvas
        ref={canvasRef}
        className="ov:block ov:w-full ov:h-full"
        style={{ verticalAlign: 'top' }}
      />
    </div>,
    document.body
  )
}

/**
 * Draws a transferred ImageBitmap (object-fit: cover) into the locked iframe slot.
 * Rendered under `#ov-25-configurator-gallery-container` (positioned ancestor) so it does not inherit
 * transforms from `#ov25-configurator-iframe-container`. `measureRef` is the slot row (parent of that
 * container) so size matches useIframePositioning’s locked box without covering the carousel below.
 *
 * Release timing (default): effect A starts a timer `holdMs` → sets `phase` to `fade` → canvas gets
 * `opacity: 0` with a CSS transition over `fadeMs` → effect B runs in `fade` and calls `onClear` after
 * `fadeMs`. Mobile drawer uses `skipOpacityFade` so the same total delay (`holdMs + fadeMs`) is used
 * but opacity stays at 1 until unmount (no CSS fade).
 */
function ConfiguratorOpeningTransitionProxyCanvas({
  bitmap,
  holdMs,
  fadeMs,
  onClear,
  measureRef,
  skipOpacityFade = false,
  squareSlotCorners = false,
}: {
  bitmap: ImageBitmap
  holdMs: number
  fadeMs: number
  onClear: () => void
  measureRef: React.RefObject<HTMLDivElement | null>
  /** When true, release the proxy after `holdMs + fadeMs` without animating canvas opacity. */
  skipOpacityFade?: boolean
  /** Match square iframe slot (e.g. Snap2 mobile drawer). */
  squareSlotCorners?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<'hold' | 'fade'>('hold')
  const [slotCssSize, setSlotCssSize] = useState({ w: 0, h: 0 })

  const draw = useCallback(() => {
    const slot = measureRef.current
    const canvas = canvasRef.current
    if (!slot || !canvas) return
    let w = Math.max(1, Math.round(slot.offsetWidth))
    let h = Math.max(1, Math.round(slot.offsetHeight))
    if (w < 2 || h < 2) {
      const bw = bitmap.width
      const bh = bitmap.height
      if (bw > 0 && bh > 0) {
        w = Math.max(320, bw)
        h = Math.round((w / bw) * bh)
      }
    }
    setSlotCssSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const bw = bitmap.width
    const bh = bitmap.height
    if (bw < 1 || bh < 1) return
    ctx.fillStyle = getResolvedConfiguratorIframeBackgroundColor()
    ctx.fillRect(0, 0, w, h)
    const scale = Math.max(w / bw, h / bh)
    const dw = bw * scale
    const dh = bh * scale
    const dx = (w - dw) / 2
    const dy = (h - dh) / 2
    ctx.drawImage(bitmap, dx, dy, dw, dh)
  }, [bitmap, measureRef])

  useLayoutEffect(() => {
    setPhase('hold')
  }, [bitmap])

  useLayoutEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    const slot = measureRef.current
    if (!slot || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      draw()
    })
    ro.observe(slot)
    return () => ro.disconnect()
  }, [measureRef, draw])

  useEffect(() => {
    if (skipOpacityFade) {
      const t = window.setTimeout(onClear, holdMs + fadeMs)
      return () => clearTimeout(t)
    }
    const t = window.setTimeout(() => setPhase('fade'), holdMs)
    return () => clearTimeout(t)
  }, [skipOpacityFade, holdMs, fadeMs, bitmap, onClear])

  useEffect(() => {
    if (skipOpacityFade) return
    if (phase !== 'fade') return
    const t = window.setTimeout(onClear, fadeMs)
    return () => clearTimeout(t)
  }, [skipOpacityFade, phase, fadeMs, onClear])

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'ov:pointer-events-none ov:absolute ov:left-0 ov:top-0 ov:z-[4]',
        squareSlotCorners
          ? 'ov:rounded-none'
          : 'ov:rounded-[var(--ov25-configurator-iframe-border-radius)]'
      )}
      style={{
        width: slotCssSize.w > 0 ? `${slotCssSize.w}px` : undefined,
        height: slotCssSize.h > 0 ? `${slotCssSize.h}px` : undefined,
        opacity: skipOpacityFade || phase === 'hold' ? 1 : 0,
        transition: skipOpacityFade || fadeMs <= 0 ? 'none' : `opacity ${fadeMs}ms ease-out`,
      }}
    />
  )
}

// Simplified props, most data now comes from context
interface ProductGalleryProps {
  isInModal?: boolean;
  isPreloading?: boolean;
}

export function ProductGallery({ isInModal = false, isPreloading = false }: ProductGalleryProps = {}) {
    // Get all required data from context
    const {
        isDrawerOrDialogOpen,
        galleryIndexToUse,
        images: passedImages,
        isProductGalleryStacked,
        showCarousel,
        arPreviewLink,
        setArPreviewLink,
        isVariantsOpen,
        uniqueId,
        configuratorDisplayMode,
        configuratorDisplayModeMobile,
        isMobile,
        cssString,
        configuratorTransitionProxyBitmap,
        configuratorTransitionProxyMode,
        configuratorClosingProxyRect,
        releaseConfiguratorTransitionProxy,
        stackedGalleryCloseSyncImmediateRef,
        isSnap2Mode,
        galleryCarouselFullscreenImage,
    } = useOV25UI();

    const isModalMode = isMobile ? configuratorDisplayModeMobile === 'modal' : configuratorDisplayMode === 'modal';
    const snap2MobileDrawerOpen =
      isSnap2Mode && isMobile && isDrawerOrDialogOpen && !isModalMode;
    const iframeSlotBorderRadiusClass = snap2MobileDrawerOpen
      ? 'ov:rounded-none'
      : 'ov:rounded-[var(--ov25-configurator-iframe-border-radius)]';
    const closingExit: ClosingProxyExit = isModalMode
      ? 'modal-fade'
      : isMobile
        ? 'drawer-slide-up'
        : 'sheet-slide-left';
    const closingProxyZIndex =
      closingExit === 'drawer-slide-up'
        ? TRANSITION_PROXY_CLOSE_Z_INDEX_MOBILE_DRAWER
        : TRANSITION_PROXY_CLOSE_Z_INDEX;
    // Mobile drawer: iframe opens with the shell (no long proxy hold). Desktop sheet keeps a hold to align with iframe slide.
    const openingHoldMs = isModalMode
      ? 0
      : isMobile
        ? 0
        : TRANSITION_PROXY_HOLD_DESKTOP_MS;
    const openingFadeMs = isModalMode ? TRANSITION_MODAL_OVERLAY_IN_MS : TRANSITION_PROXY_FADE_MS;
    /** Drawer/sheet only; modal still fades the overlay in sync with the modal shell. */
    const openingProxySkipOpacityFade = isMobile && !isModalMode;
    const modalStackBoost = isDrawerOrDialogOpen && isModalMode;

    const carouselHostRef = useRef<HTMLDivElement>(null);
    const galleryHostRef = useRef<HTMLDivElement>(null);
    const [carouselShadowRoot, setCarouselShadowRoot] = useState<ShadowRoot | null>(null);
    const [galleryShadowRoot, setGalleryShadowRoot] = useState<ShadowRoot | null>(null);

    useLayoutEffect(() => {
        if (!showCarousel || modalStackBoost) {
            setCarouselShadowRoot(null);
            return;
        }
        const host = carouselHostRef.current;
        if (!host) return;

        let shadow = host.shadowRoot;
        if (!shadow) {
            shadow = host.attachShadow({ mode: 'open' });
        }
        const stylesheets: CSSStyleSheet[] = [getSharedStylesheet()];
        if (cssString) {
            stylesheets.push(createuserCustomCssStylesheet(cssString));
        }
        shadow.adoptedStyleSheets = stylesheets;
        setCarouselShadowRoot(shadow);
    }, [showCarousel, modalStackBoost, cssString, galleryShadowRoot]);

    useLayoutEffect(() => {
        const host = galleryHostRef.current;
        if (!host) return;

        let shadow = host.shadowRoot;
        if (!shadow) {
            shadow = host.attachShadow({ mode: 'open' });
        }

        const stylesheets: CSSStyleSheet[] = [getSharedStylesheet()];
        if (cssString) {
            stylesheets.push(createuserCustomCssStylesheet(cssString));
        }
        shadow.adoptedStyleSheets = stylesheets;
        setGalleryShadowRoot(shadow);
    }, [cssString]);

    // Use the custom hook to handle iframe positioning
    useIframePositioning();

    /** Sheet/drawer/modal: lift gallery host above page + variant shell; stacked path uses portaled iframe (useIframePositioning). */
    const liftGalleryStacking = isDrawerOrDialogOpen && !isProductGalleryStacked;
    const carouselFullscreenOpen = galleryCarouselFullscreenImage != null;
    const galleryHostStackStyle: React.CSSProperties | undefined = (() => {
        if (!carouselFullscreenOpen && !liftGalleryStacking) return undefined;
        const zIndex = carouselFullscreenOpen
            ? 2147483647
            : liftGalleryStacking
              ? isModalMode
                  ? 2147483647
                  : 2147483644
              : undefined;
        if (zIndex === undefined) return undefined;
        const pointerEvents =
            carouselFullscreenOpen || (liftGalleryStacking && isModalMode) ? ('auto' as const) : undefined;
        return {
            position: 'relative' as const,
            zIndex,
            ...(pointerEvents ? { pointerEvents } : {}),
        };
    })();


    const containerRef = useRef<HTMLDivElement>(null);
    /** Parent of `#ov25-configurator-iframe-container`; same node useIframePositioning locks — proxy measures this box. */
    const iframeSlotMeasureRef = useRef<HTMLDivElement>(null);


    


    // Position the true iframe container to match the normal container
    useEffect(() => {
        // Only run positioning logic when gallery is stacked
       if(!isProductGalleryStacked) return;
        
        let frameId: number;
        
        const positionIframeContainer = () => {
            const originalContainer = findElementByIdInShadowOrRegularDOM(uniqueId ? `ov25-configurator-iframe-container-${uniqueId}` : 'ov25-configurator-iframe-container');
            const trueContainer = findElementByIdInShadowOrRegularDOM('true-ov25-configurator-iframe-container');
            
            if (originalContainer && trueContainer && !isDrawerOrDialogOpen) {
                const rect = originalContainer.getBoundingClientRect();
                
                trueContainer.style.position = 'fixed';
                trueContainer.style.top = `${rect.top}px`;
                trueContainer.style.left = `${rect.left}px`;
                trueContainer.style.width = `${rect.width}px`;
                trueContainer.style.height = `${rect.height}px`;
                trueContainer.style.zIndex = '3';
            }
            
            frameId = requestAnimationFrame(positionIframeContainer);
        };
        
        // When drawer closes: instant iframe restore sets stackedGalleryCloseSyncImmediateRef in useIframePositioning.
        // Legacy animated iframe close still waits for the slide to finish.
        if (!isDrawerOrDialogOpen) {
            const skipDelay = stackedGalleryCloseSyncImmediateRef.current;
            if (skipDelay) {
                stackedGalleryCloseSyncImmediateRef.current = false;
            }
            const delayMs = skipDelay ? 0 : 500;
            const timeoutId = setTimeout(() => {
                frameId = requestAnimationFrame(positionIframeContainer);
            }, delayMs);
            
            return () => {
                clearTimeout(timeoutId);
                cancelAnimationFrame(frameId);
            };
        }
        
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [isDrawerOrDialogOpen, isProductGalleryStacked, uniqueId, stackedGalleryCloseSyncImmediateRef]);

    useEffect(() => {
        if (
            configuratorTransitionProxyMode === 'closing' &&
            configuratorTransitionProxyBitmap &&
            !configuratorClosingProxyRect
        ) {
            releaseConfiguratorTransitionProxy();
        }
    }, [
        configuratorTransitionProxyMode,
        configuratorTransitionProxyBitmap,
        configuratorClosingProxyRect,
        releaseConfiguratorTransitionProxy,
    ]);

    const showClosingProxy =
        configuratorTransitionProxyMode === 'closing' &&
        configuratorTransitionProxyBitmap &&
        configuratorClosingProxyRect;
    const showOpeningProxy =
        configuratorTransitionProxyMode === 'opening' && configuratorTransitionProxyBitmap;

    const galleryContent = (
        <>
        <div className={cn(
            "ov:relative ov:flex ov:flex-col ov:font-[family-name:var(--ov25-font-family)]",
            isInModal
              ? "ov:h-full ov:min-h-0 ov:overflow-hidden"
              : "ov:h-auto ov:max-h-full",
            modalStackBoost ? "ov:z-[2147483647]" : "ov:z-[2] ov:isolate",
            isPreloading && "ov:hidden"
        )}>
            {showClosingProxy && configuratorClosingProxyRect ? (
              <ConfiguratorClosingTransitionProxyCanvas
                bitmap={configuratorTransitionProxyBitmap}
                rect={configuratorClosingProxyRect}
                exitAnimation={closingExit}
                zIndex={closingProxyZIndex}
                onClear={releaseConfiguratorTransitionProxy}
              />
            ) : null}
            {showOpeningProxy ? (
              <ConfiguratorOpeningTransitionProxyCanvas
                bitmap={configuratorTransitionProxyBitmap}
                holdMs={openingHoldMs}
                fadeMs={openingFadeMs}
                onClear={releaseConfiguratorTransitionProxy}
                measureRef={iframeSlotMeasureRef}
                skipOpacityFade={openingProxySkipOpacityFade}
                squareSlotCorners={snap2MobileDrawerOpen}
              />
            ) : null}
            {/* Scope background to iframe slot only; absolute inset-0 on the outer column was covering the carousel */}
            <div
                ref={iframeSlotMeasureRef}
                className={cn(
                  "ov:relative ov:w-full",
                  isInModal && "ov:flex-1 ov:min-h-0 ov:flex ov:flex-col"
                )}
            >
                <div id="ov25-configurator-background-color" className={cn(
                    "ov:pointer-events-none ov:absolute ov:inset-0 ov:z-[2] ov:w-full",
                    modalStackBoost ? "ov:hidden!" : "ov:block!",
                    iframeSlotBorderRadiusClass,
                    "ov:bg-[var(--ov25-configurator-iframe-background-color)]",
                )}></div>
                <div id={uniqueId ? `ov25-configurator-iframe-container-${uniqueId}` : "ov25-configurator-iframe-container"}
                    data-fullscreen={isVariantsOpen}
                    data-stacked={isProductGalleryStacked}
                    data-clarity-mask="true"
                    ref={containerRef}
                    className={cn(
                        "ov:h-full ov:w-full ov:relative ov:overflow-hidden ov:z-[3]",
                        iframeSlotBorderRadiusClass,
                        "ov:bg-[var(--ov25-configurator-iframe-background-color)]",
                    )}>

                    {!isProductGalleryStacked && <IframeContainer />}

                </div>
            </div>
            {showCarousel && !modalStackBoost && (
              <div
                ref={carouselHostRef}
                id="true-carousel"
                className={cn(
                  "ov:shrink-0"                )}
              >
                <span />
              </div>
            )}
            {carouselShadowRoot &&
              createPortal(<ProductCarousel />, carouselShadowRoot)}
        </div>
        {isProductGalleryStacked && galleryShadowRoot && createPortal(
           <IframeContainer  />,
            galleryShadowRoot
        )}
        <ArPreviewQRCodeDialog arPreviewLink={arPreviewLink} setArPreviewLink={setArPreviewLink} />

    </>
    );

    return (
      <div
        ref={galleryHostRef}
        id="ov-25-configurator-gallery-container"
        className={cn(
          "ov25-configurator-gallery",
          isInModal &&
            "ov:flex ov:flex-1 ov:flex-col ov:min-h-0 ov:h-full ov:max-h-full ov:overflow-hidden",
        )}
        style={galleryHostStackStyle}
        data-clarity-mask="true"
      >
        {galleryShadowRoot && createPortal(galleryContent, galleryShadowRoot)}
      </div>
    )
}

/**
 * Renders ProductGallery in a stable off-screen wrapper so the iframe loads once and stays alive.
 * useIframePositioning handles repositioning the iframe into the visible area (sheet, modal, etc.)
 * when the configurator opens.
 */
export function DeferredGalleryContainer() {
    const { isDrawerOrDialogOpen, configuratorDisplayMode, configuratorDisplayModeMobile, isMobile } = useOV25UI();
    const isModalMode = isMobile ? configuratorDisplayModeMobile === 'modal' : configuratorDisplayMode === 'modal';
    // Preload stays behind the page (z-index -1). When sheet/drawer opens, lift above the page.
    // Modal backdrop is z-2147483646 — deferred host must be higher so the iframe sits above the dimmer.
    const openZ = isDrawerOrDialogOpen ? (isModalMode ? 2147483647 : 2147483644) : -1;
    // Preload: none so the full-viewport host does not steal clicks from the page. Open: auto so the
    // iframe stack hit-tests reliably while the shell is visible.
    const pointerEvents = isDrawerOrDialogOpen ? 'auto' : 'none';
    return (
        <div
            className="ov25-configurator-gallery ov:font-[family-name:var(--ov25-font-family)]"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents,
                zIndex: openZ,
                visibility: 'hidden',
            }}
        >
            <ProductGallery />
        </div>
    );
}
