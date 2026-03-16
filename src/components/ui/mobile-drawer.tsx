/**
 * Mobile drawer: closed or fully open (max height) only.
 * No middle stage, no toggle button.
 * For legacy three-state version (closed/small/large with toggle), use mobile-drawer-legacy.tsx.
 */
import React, { useState, type ReactNode, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { gsap } from "gsap"
import { CSSProperties } from "react"
import { useOV25UI } from "../../contexts/ov25-ui-context.js"
import { DRAWER_HEIGHT_RATIO } from "../../utils/configurator-utils.js"

export interface MobileDrawerProps {
  children: ReactNode
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  className?: string
  style?: CSSProperties
  minHeightRatio?: number
  maxHeightRatio?: number
  /** Backwards compat: receives 0 (closed) or 2 (open). Middle stage (1) no longer used. */
  onStateChange?: (state: 0 | 1 | 2) => void
}

const OPEN_STATE = 2 as const
const CLOSED_STATE = 0 as const

const MobileDrawerComponent = ({
  children,
  isOpen,
  onOpenChange,
  className = "",
  style = {},
  minHeightRatio = 1 / 6,
  maxHeightRatio = 5 / 6,
  onStateChange,
}: MobileDrawerProps) => {
  const { setIsDrawerOrDialogOpen: setIsDrawerOpen } = useOV25UI()
  const [originalStyles, setOriginalStyles] = useState<{
    body: { overflow: string; position: string; width: string; top: string };
    html: { overflow: string };
  } | null>(null)

  const [viewportHeightState, setViewportHeightState] = useState(
    typeof window !== 'undefined' && window.visualViewport?.height !== undefined
      ? window.visualViewport.height
      : typeof window !== 'undefined' ? window.innerHeight : 0
  )
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (drawerRef.current) {
      gsap.set(drawerRef.current, { height: 0 })
    }
  }, [])

  function getMaxHeight(viewPortHeight: number) {
    return viewPortHeight * DRAWER_HEIGHT_RATIO
  }

  const maxHeight = typeof window !== 'undefined' ? getMaxHeight(viewportHeightState) : 0

  useEffect(() => {
    const updateHeight = () => {
      const newHeight = typeof window !== 'undefined'
        ? (window.visualViewport?.height ?? window.innerHeight)
        : 0
      setViewportHeightState(newHeight)
      if (isOpen && drawerRef.current) {
        const newMaxHeight = getMaxHeight(newHeight)
        gsap.to(drawerRef.current, {
          height: newMaxHeight,
          duration: 0.5,
          ease: "cubic-bezier(0.4, 0, 0.2, 1)"
        })
      }
    }

    if (typeof window === 'undefined') return
    window.visualViewport?.addEventListener('resize', updateHeight)
    window.visualViewport?.addEventListener('scroll', updateHeight)
    window.addEventListener('resize', updateHeight)
    updateHeight()

    return () => {
      window.visualViewport?.removeEventListener('resize', updateHeight)
      window.visualViewport?.removeEventListener('scroll', updateHeight)
      window.removeEventListener('resize', updateHeight)
    }
  }, [isOpen])

  const prevOpenRef = useRef<boolean | null>(null)

  useEffect(() => {
    if (!drawerRef.current) return
    if (isOpen) {
      onStateChange?.(OPEN_STATE)
      gsap.killTweensOf(drawerRef.current)
      gsap.to(drawerRef.current, {
        height: maxHeight,
        duration: 0.5,
        ease: "cubic-bezier(0.4, 0, 0.2, 1)",
        onComplete: () => {
          if (drawerRef.current) gsap.set(drawerRef.current, { height: maxHeight })
        }
      })
    } else if (prevOpenRef.current === true) {
      onStateChange?.(CLOSED_STATE)
      onOpenChange(false)
      gsap.killTweensOf(drawerRef.current)
      gsap.to(drawerRef.current, {
        height: 0,
        duration: 0.5,
        ease: "cubic-bezier(0.4, 0, 0.2, 1)",
        onComplete: () => {
          if (drawerRef.current) gsap.set(drawerRef.current, { height: 0 })
        }
      })
    }
    prevOpenRef.current = isOpen
  }, [isOpen, maxHeight])

  useEffect(() => {
    if (isOpen) {
      if (!originalStyles) {
        setOriginalStyles({
          body: {
            overflow: document.body.style.overflow,
            position: document.body.style.position,
            width: document.body.style.width,
            top: document.body.style.top,
          },
          html: { overflow: document.documentElement.style.overflow },
        })
      }
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
      document.documentElement.style.overflow = 'hidden'
      setIsDrawerOpen(true)
    } else {
      const scrollY = document.body.style.top
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
  }, [isOpen, setIsDrawerOpen, originalStyles])

  if (typeof window === 'undefined') {
    return null
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
        pointerEvents: !isOpen ? 'none' : 'auto',
        ...style
      }}
      data-clarity-mask="true"
      className={'ov:bg-[var(--ov25-configurator-iframe-background-color)]'}
    >
      <div id="ov25-drawer-content" className="ov:w-full ov:h-full ov:bg-[var(--ov25-background-color)] ov:relative ov:rounded-t-xl ov:[box-shadow:0_-4px_6px_-1px_rgba(0,0,0,0.05),0_-2px_4px_-2px_rgba(0,0,0,0.03)]">
        <div className="ov:h-full ov:flex ov:flex-col ov:pointer-events-auto">{children}</div>
      </div>
    </div>
  )

  const { shadowDOMs } = useOV25UI()
  const portalTarget = shadowDOMs?.mobileDrawer || document.body

  return createPortal(drawerContent, portalTarget)
}

export const MobileDrawer = MobileDrawerComponent
;(MobileDrawer as any).displayName = "MobileDrawer"
