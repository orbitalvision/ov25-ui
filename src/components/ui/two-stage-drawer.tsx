import { useState, useRef, type ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"
import { useDrag } from "@use-gesture/react"
import { animated, useSpring } from "@react-spring/web"
import { cn } from "../../utils/cn"
import { useMediaQuery } from "../../hooks/use-media-query"
import * as React from 'react'

export interface TwoStageDrawerProps {
  children: ReactNode
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  className?: string
  minHeightRatio?: number
  maxHeightRatio?: number
  onStateChange?: (state: 0 | 1 | 2) => void
}

export type DrawerState = 0 | 1 | 2 // 0 = closed, 1 = minified, 2 = extended

export function TwoStageDrawer({
  children,
  isOpen,
  onOpenChange,
  className = "",
  minHeightRatio = 1 / 6,
  maxHeightRatio = 5 / 6,
  onStateChange,
}: TwoStageDrawerProps) {
  const [drawerState, setDrawerState] = useState<DrawerState>(0)
  const dragStartY = useRef(0)
  const isMobile = useMediaQuery(768) // md breakpoint

  const minHeight = window.innerHeight - (isMobile ? window.innerWidth : window.innerWidth * (2/3))
  
  const maxHeight = window.innerHeight * 0.95

  const [{ height }, api] = useSpring(() => ({
    height: 0,
    config: { tension: 300, friction: 26 },
  }))

  useEffect(() => {
    if (drawerState !== 0) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
    } else {
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
    }
  }, [drawerState])

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

  if (isOpen && drawerState === 0) {
    updateDrawerState(1)
  } else if (!isOpen && drawerState !== 0) {
    updateDrawerState(0)
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

  return typeof window === 'undefined' ? null : createPortal(
    <animated.div
      style={{
        height,
        bottom: 0,
        touchAction: "none",
        WebkitOverflowScrolling: 'touch',
      }}
      onTouchMove={(e: any) => {
        if (e.target instanceof Element && !e.target.closest('.scroll-area-viewport')) {
          e.preventDefault()
        }
      }}
      className={`z-[100] fixed left-0 right-0 bg-[#E5E5E5] will-change-transform
        ${drawerState === 0 ? "pointer-events-none" : "pointer-events-auto"}
        ${className}`}
    >
        <div className="w-full h-full  bg-white rounded-t-lg shadow-xl">
      <div {...bind()} className="w-full   flex justify-center py-4 cursor-grab active:cursor-grabbing touch-none">
        <div className="w-8 h-1 bg-muted-foreground/25 rounded-full" />
      </div>

      <div className={cn(`h-full flex  flex-col pointer-events-none`)}>{children}</div>

      </div>
    </animated.div>,
    document.body
  )
}

