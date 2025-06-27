import { useState, useRef, type ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"
import { useDrag } from "@use-gesture/react"
import { animated, useSpring } from "@react-spring/web"
import { useMediaQuery } from "../../hooks/use-media-query.js"
import * as React from 'react'
import { CSSProperties } from "react"
import { useOV25UI } from "../../contexts/ov25-ui-context.js"
import { DRAWER_HEIGHT_RATIO } from "../../utils/configurator-utils.js"

const AnimatedDiv = animated.div as any;

export interface TwoStageDrawerProps {
  children: ReactNode
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  className?: string
  style?: CSSProperties
  minHeightRatio?: number
  maxHeightRatio?: number
  onStateChange?: (state: 0 | 1 | 2) => void
}

export type DrawerState = 0 | 1 | 2 


const TwoStageDrawerComponent = ({ 
  children,
  isOpen,
  onOpenChange,
  className = "",
  style = {},
  minHeightRatio = 1 / 6,
  maxHeightRatio = 5 / 6,
  onStateChange,
}: TwoStageDrawerProps) => {
  const [drawerState, setDrawerState] = useState<DrawerState>(0)
  const dragStartY = useRef(0)
  const { setIsDrawerOrDialogOpen: setIsDrawerOpen, isMobile } = useOV25UI()
  const [originalStyles, setOriginalStyles] = useState<{
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

  const [viewportHeight, setViewportHeight] = useState(window.visualViewport?.height || window.innerHeight)
  const [isViewportReady, setIsViewportReady] = useState(false)
  
  function getViewportHeight() {
    return window.visualViewport?.height || window.innerHeight;
  }

  function getMinHeight() {
    return viewportHeight - (isMobile ? window.innerWidth : window.innerWidth * (2/3))
  }

  function getMaxHeight() {
    return viewportHeight * DRAWER_HEIGHT_RATIO
  }

  const minHeight = typeof window !== 'undefined' ? getMinHeight() : 0
  const maxHeight = typeof window !== 'undefined' ? getMaxHeight() : 0

  const [{ height }, api] = useSpring(() => ({
    height: 0,
    config: { tension: 200, friction: 30 },
  }))

  // Effect to update drawer height on window resize
  useEffect(() => {
    const updateHeight = () => {
      const newHeight = getViewportHeight();
      setViewportHeight(newHeight);
      setIsViewportReady(true);

      // Update drawer height if it's open
      if (drawerState !== 0) {
        const newMinHeight = getMinHeight();
        const newMaxHeight = getMaxHeight();
        const newHeight = drawerState === 1 ? newMinHeight : newMaxHeight;
        api.start({ height: newHeight });
      }
    };

    // Update height on visual viewport changes
    window.visualViewport?.addEventListener('resize', updateHeight);
    window.visualViewport?.addEventListener('scroll', updateHeight);
    window.addEventListener('resize', updateHeight);

    // Initial height update
    updateHeight();

    return () => {
      window.visualViewport?.removeEventListener('resize', updateHeight);
      window.visualViewport?.removeEventListener('scroll', updateHeight);
      window.removeEventListener('resize', updateHeight);
    };
  }, [drawerState, api]);

  // Handle drawer state changes based on isOpen prop
  useEffect(() => {
    if (isOpen && drawerState === 0 && isViewportReady) {
      updateDrawerState(1)
    } else if (!isOpen && drawerState !== 0) {
      updateDrawerState(0)
    }
  }, [isOpen, isViewportReady])

  useEffect(() => {
    if (drawerState !== 0) {
      // Store original styles before modifying
      if (!originalStyles) {
        const bodyStyles = {
          overflow: document.body.style.overflow,
          position: document.body.style.position,
          width: document.body.style.width,
          top: document.body.style.top,
        };
        const htmlStyles = {
          overflow: document.documentElement.style.overflow,
        };
        setOriginalStyles({ body: bodyStyles, html: htmlStyles });
      }

      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
      document.documentElement.style.overflow = 'hidden'
      setIsDrawerOpen(true)
    } else {
      const scrollY = document.body.style.top
      
      // Restore original styles if we have them
      if (originalStyles) {
        document.body.style.overflow = originalStyles.body.overflow
        document.body.style.position = originalStyles.body.position
        document.body.style.width = originalStyles.body.width
        document.body.style.top = originalStyles.body.top
        document.documentElement.style.overflow = originalStyles.html.overflow
        setOriginalStyles(null)
      } else {
        // Fallback to empty strings
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
        document.documentElement.style.overflow = ''
      }
      
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
      setIsDrawerOpen(false)
    }

    return () => {
      if (originalStyles) {
        document.body.style.overflow = originalStyles.body.overflow
        document.body.style.position = originalStyles.body.position
        document.body.style.width = originalStyles.body.width
        document.body.style.top = originalStyles.body.top
        document.documentElement.style.overflow = originalStyles.html.overflow
        setOriginalStyles(null)
      } else {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
        document.documentElement.style.overflow = ''
      }
      setIsDrawerOpen(false)
    }
  }, [drawerState, setIsDrawerOpen, originalStyles])

  const getHeightForState = (state: DrawerState) => {
    switch (state) {
      case 0:
        return 0 // Closed
      case 1:
        return minHeight // Minified
      case 2:
        return maxHeight // Extended
      default:
        return 0
    }
  }

  const updateDrawerState = (newState: DrawerState) => {
    setDrawerState(newState)
    onStateChange?.(newState)

    if (newState === 0) {
      onOpenChange(false)
    }
    api.start({ height: getHeightForState(newState) })
  }

  const bind = useDrag(
    ({ movement, last, first, velocity }) => {
      if (first) {
        dragStartY.current = getHeightForState(drawerState)
      }

      if (last) {
        const dragDistance = movement[1]
        const dragVelocity = velocity[1]

        const isDraggingUp = dragDistance < 0 || dragVelocity < -0.5

        if (isDraggingUp && drawerState === 1) {
          updateDrawerState(2)
        } else if (!isDraggingUp && drawerState === 2) {
          updateDrawerState(1)
        } else if (!isDraggingUp && drawerState === 1 && (dragDistance > 50 || dragVelocity > 0.5)) {
          updateDrawerState(0)
        } else {
          updateDrawerState(drawerState)
        }
      } else {
        const newHeight = Math.max(0, Math.min(maxHeight, dragStartY.current - movement[1]))
        api.start({ height: newHeight, immediate: true })
      }
    },
    {
      from: () => [0, 0],
      filterTaps: true,
      bounds: { top: -maxHeight, bottom: maxHeight },
      rubberband: true,
    },
  )

  // Only render in browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  const drawerContent = (
    <AnimatedDiv
      style={{
        height,
        bottom: 0,
        touchAction: "none",
        WebkitOverflowScrolling: 'touch',
        zIndex: 99999999999991,
        position: 'fixed',
        left: 0,
        right: 0,
        willChange: 'transform',
        pointerEvents: drawerState === 0 ? 'none' : 'auto',
        ...style
      }}
      className={'ov:bg-[var(--ov25-configurator-iframe-background-color)]'}
      onTouchMove={(e: any) => {
        if (e.target instanceof Element && !e.target.closest('.scroll-area-viewport')) {
          // causing error in console when scrolling drawer: Unable to preventDefault inside passive event listener invocation.
          // e.preventDefault()
        }
      }}
    >
      <div id="ov25-drawer-content" className="ov:w-full ov:h-full ov:bg-[var(--ov25-background-color)] ov:relative ov:rounded-t-xl ov:[box-shadow:0_-4px_6px_-1px_rgba(0,0,0,0.05),0_-2px_4px_-2px_rgba(0,0,0,0.03)]">
        <div className="ov:w-full ov:relative ov:flex ov:justify-center">
          {/* Invisible hitbox for drag */}
          <div
            {...bind()}
            className="ov:absolute ov:top-0 ov:w-[150px] ov:h-[60px] ov:z-[20] ov:cursor-grab ov:touch-none ov:active:cursor-grabbing" />
          {/* Visible handle */}
          <div id="ov25-draggable-icon" className="ov:py-4 ov:z-10">
            <div className="ov:w-8 ov:h-1 ov:mt-0 ov:bg-[var(--ov25-border-color)] ov:shadow-sm ov:rounded-full "/>
          </div>
        </div>

        <div className="ov:h-full ov:flex ov:flex-col ov:pointer-events-none">{children}</div>
      </div>
    </AnimatedDiv>
  );
  
  return createPortal(drawerContent, document.body);
};

// Export as a named export
export const TwoStageDrawer = TwoStageDrawerComponent;

// Also add the displayName
(TwoStageDrawer as any).displayName = "TwoStageDrawer";

