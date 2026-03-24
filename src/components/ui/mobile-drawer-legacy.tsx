/**
 * Legacy mobile drawer with three states: closed (0), small (1), large (2).
 * Includes toggle button to switch between small and large.
 * Use mobile-drawer.tsx for the simplified closed/open-only version.
 */
import React, { useState, type ReactNode, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { gsap } from "gsap"
import { CSSProperties } from "react"
import { useOV25UI } from "../../contexts/ov25-ui-context.js"
import { DRAWER_HEIGHT_RATIO } from "../../utils/configurator-utils.js"
import { requestTransitionSnapshotFromIframe } from "../../utils/request-transition-snapshot-from-iframe.js"
import { getConfiguratorIframeContainerScreenRect } from "../../utils/configurator-dom-queries.js"
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react"

export interface MobileDrawerLegacyProps {
  children: ReactNode
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  className?: string
  style?: CSSProperties
  minHeightRatio?: number
  maxHeightRatio?: number
  onStateChange?: (state: 0 | 1 | 2) => void
}

export type MobileDrawerLegacyState = 0 | 1 | 2

const MobileDrawerLegacyComponent = ({
  children,
  isOpen,
  onOpenChange,
  className = "",
  style = {},
  minHeightRatio = 1 / 6,
  maxHeightRatio = 5 / 6,
  onStateChange,
}: MobileDrawerLegacyProps) => {
  const [drawerState, setDrawerState] = useState<MobileDrawerLegacyState>(0)
  const {
    setIsDrawerOrDialogOpen: setIsDrawerOpen,
    isMobile,
    uniqueId,
    setConfiguratorTransitionProxyBitmap,
    setConfiguratorTransitionProxyMode,
    setUseInstantIframeCloseRestore,
    releaseConfiguratorTransitionProxy,
    setConfiguratorClosingProxyRect,
    isProductGalleryStacked,
    shadowDOMs,
  } = useOV25UI()
  const originalStylesRef = useRef<{
    body: {
      overflow: string;
      position: string;
      width: string;
      top: string;
    };
    html: {
      overflow: string;
    };
  } | null>(null);
  const prevDrawerStateForShellRef = useRef<MobileDrawerLegacyState>(0)

  const [viewportHeightState, setViewportHeightState] = useState(window.visualViewport?.height !== undefined ? window.visualViewport?.height :  window.innerHeight)
  const [isViewportReady, setIsViewportReady] = useState(true)

  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (drawerRef.current) {
      gsap.set(drawerRef.current, { height: 0 })
    }
  }, [])

  function getMinHeight(viewPortHeight: number) {
    return viewPortHeight - (isMobile ? viewPortHeight * DRAWER_HEIGHT_RATIO : window.innerWidth * (2/3))
  }

  function getMaxHeight(viewPortHeight: number) {
    return viewPortHeight * DRAWER_HEIGHT_RATIO
  }

  const minHeight = typeof window !== 'undefined' ? getMinHeight(viewportHeightState) : 0
  const maxHeight = typeof window !== 'undefined' ? getMaxHeight(viewportHeightState) : 0

  useEffect(() => {
    const updateHeight = () => {
      const newHeight = window.visualViewport?.height !== undefined ? window.visualViewport?.height :  window.innerHeight;
      setViewportHeightState(newHeight);
      setIsViewportReady(true);

      if (drawerState !== 0 && drawerRef.current) {
        const newMinHeight = getMinHeight(newHeight);
        const newMaxHeight = getMaxHeight(newHeight);
        const newHeightx = drawerState === 1 ? newMinHeight : newMaxHeight;
        gsap.to(drawerRef.current, {
          height: newHeightx,
          duration: 0.5,
          ease: "cubic-bezier(0.4, 0, 0.2, 1)"
        });
      }
    };

    window.visualViewport?.addEventListener('resize', updateHeight);
    window.visualViewport?.addEventListener('scroll', updateHeight);
    window.addEventListener('resize', updateHeight);
    updateHeight();

    return () => {
      window.visualViewport?.removeEventListener('resize', updateHeight);
      window.visualViewport?.removeEventListener('scroll', updateHeight);
      window.removeEventListener('resize', updateHeight);
    };
  }, [drawerState]);

  useEffect(() => {
    if (isOpen && drawerState === 0 && isViewportReady) {
      updateDrawerState(1)
    } else if (!isOpen && drawerState !== 0) {
      updateDrawerState(0)
    }
  }, [isOpen, isViewportReady])

  useEffect(() => {
    let cancelled = false

    const restoreBodyScroll = () => {
      const scrollY = document.body.style.top
      const stored = originalStylesRef.current
      if (stored) {
        document.body.style.overflow = stored.body.overflow
        document.body.style.position = stored.body.position
        document.body.style.width = stored.body.width
        document.body.style.top = stored.body.top
        document.documentElement.style.overflow = stored.html.overflow
      } else {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
        document.documentElement.style.overflow = ''
      }
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1)
      originalStylesRef.current = null
    }

    if (drawerState !== 0) {
      if (!originalStylesRef.current) {
        originalStylesRef.current = {
          body: {
            overflow: document.body.style.overflow,
            position: document.body.style.position,
            width: document.body.style.width,
            top: document.body.style.top,
          },
          html: { overflow: document.documentElement.style.overflow },
        }
      }

      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
      document.documentElement.style.overflow = 'hidden'

      const wasClosed = prevDrawerStateForShellRef.current === 0
      prevDrawerStateForShellRef.current = drawerState

      if (wasClosed) {
        void (async () => {
          const bitmap = await requestTransitionSnapshotFromIframe(uniqueId)
          if (cancelled) {
            bitmap?.close()
            return
          }
          if (bitmap) {
            setConfiguratorTransitionProxyMode('opening')
            setConfiguratorTransitionProxyBitmap(bitmap)
          }
          if (cancelled) {
            bitmap?.close()
            releaseConfiguratorTransitionProxy()
            return
          }
          setIsDrawerOpen(true)
        })()
      } else {
        setIsDrawerOpen(true)
      }
    } else {
      prevDrawerStateForShellRef.current = 0
      restoreBodyScroll()
      if (isOpen) {
        void (async () => {
          const bitmap = await requestTransitionSnapshotFromIframe(uniqueId)
          if (cancelled) {
            bitmap?.close()
            return
          }
          const rect = bitmap
            ? getConfiguratorIframeContainerScreenRect(uniqueId, isProductGalleryStacked)
            : null
          setConfiguratorClosingProxyRect(rect)
          if (bitmap) {
            setConfiguratorTransitionProxyMode('closing')
            setConfiguratorTransitionProxyBitmap(bitmap)
          }
          setUseInstantIframeCloseRestore(true)
          setIsDrawerOpen(false)
        })()
      } else {
        setIsDrawerOpen(false)
      }
    }

    return () => {
      cancelled = true
    }
  }, [
    drawerState,
    setIsDrawerOpen,
    uniqueId,
    setConfiguratorTransitionProxyBitmap,
    setConfiguratorTransitionProxyMode,
    setUseInstantIframeCloseRestore,
    releaseConfiguratorTransitionProxy,
    setConfiguratorClosingProxyRect,
    isProductGalleryStacked,
    isOpen,
  ])

  useEffect(() => {
    return () => {
      const stored = originalStylesRef.current
      if (stored) {
        document.body.style.overflow = stored.body.overflow
        document.body.style.position = stored.body.position
        document.body.style.width = stored.body.width
        document.body.style.top = stored.body.top
        document.documentElement.style.overflow = stored.html.overflow
      } else {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
        document.documentElement.style.overflow = ''
      }
      originalStylesRef.current = null
      releaseConfiguratorTransitionProxy()
      setIsDrawerOpen(false)
    }
  }, [releaseConfiguratorTransitionProxy, setIsDrawerOpen])

  const getHeightForState = (state: MobileDrawerLegacyState) => {
    switch (state) {
      case 0:
        return 0
      case 1:
        return minHeight
      case 2:
        return maxHeight
      default:
        return 0
    }
  }

  const updateDrawerState = (newState: MobileDrawerLegacyState) => {
    setDrawerState(newState)
    onStateChange?.(newState)

    if (newState === 0) {
      onOpenChange(false)
    }

    if (drawerRef.current) {
      const targetHeight = getHeightForState(newState)
      gsap.killTweensOf(drawerRef.current)
      gsap.to(drawerRef.current, {
        height: targetHeight,
        duration: 0.5,
        ease: "cubic-bezier(0.4, 0, 0.2, 1)",
        onComplete: () => {
          if (drawerRef.current) {
            gsap.set(drawerRef.current, { height: targetHeight })
          }
        }
      })
    }
  }

  const toggleDrawerState = () => {
    if (drawerState === 1) {
      updateDrawerState(2)
    } else if (drawerState === 2) {
      updateDrawerState(1)
    }
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const drawerContent = (
    <div
      ref={drawerRef}
      style={{
        height: 0,
        bottom: 0,
        touchAction: "none",
        WebkitOverflowScrolling: 'touch',
        zIndex: 2147483646,
        position: 'fixed',
        left: 0,
        right: 0,
        willChange: 'transform',
        pointerEvents: drawerState === 0 ? 'none' : 'auto',
        ...style
      }}
      data-clarity-mask="true"
      className={'ov:bg-[var(--ov25-configurator-iframe-background-color)]'}
    >
      <div id="ov25-drawer-content" className="ov:w-full ov:h-full ov:bg-[var(--ov25-background-color)] ov:relative ov:rounded-t-xl ov:[box-shadow:0_-4px_6px_-1px_rgba(0,0,0,0.05),0_-2px_4px_-2px_rgba(0,0,0,0.03)]">
        <div className="ov:w-full ov:relative ov:flex ov:justify-center ov:pt-2">
          {drawerState !== 0 && (
            <button
              id="ov25-drawer-toggle-button"
              onClick={toggleDrawerState}
            >
              {drawerState === 1 ? (
                <ChevronUpIcon strokeWidth={1} className="ov:w-8 ov:h-8" />
              ) : drawerState === 2 ? (
                <ChevronDownIcon strokeWidth={1} className="ov:w-8 ov:h-8" />
              ) : null}
            </button>
          )}
        </div>

        <div className="ov:h-full ov:flex ov:flex-col ov:pointer-events-none">{children}</div>
      </div>
    </div>
  );

  const portalTarget = shadowDOMs?.mobileDrawer || document.body;

  return createPortal(drawerContent, portalTarget);
};

export const MobileDrawerLegacy = MobileDrawerLegacyComponent;
(MobileDrawerLegacy as any).displayName = "MobileDrawerLegacy";
