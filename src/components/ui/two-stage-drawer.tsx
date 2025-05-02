import { useState, useRef, type ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"
import { useDrag } from "@use-gesture/react"
import { animated, useSpring } from "@react-spring/web"
import { cn } from "../../utils/cn.js"
import { useMediaQuery } from "../../hooks/use-media-query.js"
import * as React from 'react'
import { CSSProperties } from "react"
import { useOV25UI } from "../../contexts/ov25-ui-context.js"

// Cast animated.div to any to bypass TypeScript errors
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

export type DrawerState = 0 | 1 | 2 // 0 = closed, 1 = minified, 2 = extended


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
  const { setIsDrawerOpen } = useOV25UI()

  function getMinHeight() {
    return window.innerHeight - (isMobile ? window.innerWidth : window.innerWidth * (2/3))
  }

  function getMaxHeight() {
    return window.innerHeight * 0.95
  }

  const minHeight = typeof window !== 'undefined' ? getMinHeight() : 0
  const maxHeight = typeof window !== 'undefined' ? getMaxHeight() : 0

  const [{ height }, api] = useSpring(() => ({
    height: 0,
    config: { tension: 300, friction: 26 },
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

  // Define drawer content styles
  const drawerContentStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--ov25-configurator-variant-drawer-background-color)',
    borderTopLeftRadius: '0.5rem',
    borderTopRightRadius: '0.5rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  };

  // Define styles for the drag handle container
  const dragHandleContainerStyle: CSSProperties = {
    width: '100%',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    display: 'flex',
    justifyContent: 'center',
    cursor: 'grab',
    touchAction: 'none'
  };

  // Define styles for the drag handle
  const dragHandleStyle: CSSProperties = {
    width: '2rem',
    height: '0.25rem',
    backgroundColor: 'var(--ov25-configurator-variant-drawer-handle-color)',
    borderRadius: '9999px',
    zIndex: 2
  };

  // Define styles for the children container
  const childrenContainerStyle: CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'none'
  };

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
        zIndex: 100,
        position: 'fixed',
        left: 0,
        right: 0,
        willChange: 'transform',
        pointerEvents: drawerState === 0 ? 'none' : 'auto',
        ...style
      }}
      onTouchMove={(e: any) => {
        if (e.target instanceof Element && !e.target.closest('.scroll-area-viewport')) {
          // causing error in console when scrolling drawer: Unable to preventDefault inside passive event listener invocation.
          // e.preventDefault()
        }
      }}
    >
      <div style={drawerContentStyle}>
        <div 
          {...bind()} 
          style={dragHandleContainerStyle}
          className="active:cursor-grabbing"
        >
          <div style={dragHandleStyle} />
        </div>

        <div style={childrenContainerStyle}>{children}</div>
      </div>
    </AnimatedDiv>
  );
  
  return createPortal(drawerContent, document.body);
};

// Export as a named export
export const TwoStageDrawer = TwoStageDrawerComponent;

// Also add the displayName
(TwoStageDrawer as any).displayName = "TwoStageDrawer";

