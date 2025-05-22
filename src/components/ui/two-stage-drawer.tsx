import { useState, useRef, type ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"
import { useDrag } from "@use-gesture/react"
import { animated, useSpring } from "@react-spring/web"
import { useMediaQuery } from "../../hooks/use-media-query.js"
import * as React from 'react'
import { CSSProperties } from "react"
import { useOV25UI } from "../../contexts/ov25-ui-context.js"

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
  const isMobile = useMediaQuery(768) // md breakpoint
  const { setIsDrawerOrDialogOpen: setIsDrawerOpen } = useOV25UI()


  function getMinHeight() {
    return window.innerHeight - (isMobile ? window.innerWidth : window.innerWidth * (2/3))
  }

  function getMaxHeight() {
    return window.innerHeight * 0.80
  }

  const minHeight = typeof window !== 'undefined' ? getMinHeight() : 0
  const maxHeight = typeof window !== 'undefined' ? getMaxHeight() : 0

  const [{ height }, api] = useSpring(() => ({
    height: 0,
    config: { tension: 200, friction: 30 },
  }))

  // Effect to update drawer height on window resize
  useEffect(() => {
    const handleResize = () => {
      if (drawerState !== 0) {
        const newMinHeight = getMinHeight();
        const newMaxHeight = getMaxHeight();
        
        const newHeight = drawerState === 1 ? newMinHeight : newMaxHeight;
        api.start({ height: newHeight });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawerState, api, isMobile]);

  // Handle drawer state changes based on isOpen prop
  useEffect(() => {
    
    if (isOpen && drawerState === 0) {
      updateDrawerState(1)
    } else if (!isOpen && drawerState !== 0) {
      updateDrawerState(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (drawerState !== 0) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
      setIsDrawerOpen(true)
    } else {
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
      setIsDrawerOpen(false)
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      setIsDrawerOpen(false)
    }
  }, [drawerState, setIsDrawerOpen])

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
        zIndex: 101,
        position: 'fixed',
        left: 0,
        right: 0,
        willChange: 'transform',
        pointerEvents: drawerState === 0 ? 'none' : 'auto',
        ...style
      }}
      className={'orbitalvision:bg-[var(--ov25-configurator-iframe-background-color)]'}
      onTouchMove={(e: any) => {
        if (e.target instanceof Element && !e.target.closest('.scroll-area-viewport')) {
          // causing error in console when scrolling drawer: Unable to preventDefault inside passive event listener invocation.
          // e.preventDefault()
        }
      }}
    >
      <div id="ov25-drawer-content" className="orbitalvision:w-full orbitalvision:h-full orbitalvision:bg-[var(--ov25-background-color)] orbitalvision:relative orbitalvision:rounded-t-xl orbitalvision:[box-shadow:0_-4px_6px_-1px_rgba(0,0,0,0.05),0_-2px_4px_-2px_rgba(0,0,0,0.03)]">
        <div 
          {...bind()} 
          className="orbitalvision:w-full orbitalvision:flex orbitalvision:justify-center orbitalvision:cursor-grab orbitalvision:touch-none orbitalvision:active:cursor-grabbing"
        >
        <div className="orbitalvision:py-4 orbitalvision:z-10">
          <div className="orbitalvision:w-8 orbitalvision:h-1 orbitalvision:mt-0 orbitalvision:bg-[var(--ov25-border-color)] orbitalvision:shadow-sm orbitalvision:rounded-full "/></div>
        </div>

        <div className="orbitalvision:h-full orbitalvision:flex orbitalvision:flex-col orbitalvision:pointer-events-none">{children}</div>
      </div>
    </AnimatedDiv>
  );
  
  return createPortal(drawerContent, document.body);
};

// Export as a named export
export const TwoStageDrawer = TwoStageDrawerComponent;

// Also add the displayName
(TwoStageDrawer as any).displayName = "TwoStageDrawer";

