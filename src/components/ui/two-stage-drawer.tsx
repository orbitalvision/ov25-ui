import { useState, type ReactNode, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { gsap } from "gsap"
import * as React from 'react'
import { CSSProperties } from "react"
import { useOV25UI } from "../../contexts/ov25-ui-context.js"
import { DRAWER_HEIGHT_RATIO } from "../../utils/configurator-utils.js"
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react"

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

  const [viewportHeightState, setViewportHeightState] = useState(window.visualViewport?.height !== undefined ? window.visualViewport?.height :  window.innerHeight)
  const [isViewportReady, setIsViewportReady] = useState(true)
  
  // GSAP refs
  const drawerRef = useRef<HTMLDivElement>(null)
  
  // Initialize drawer height
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

  // Effect to update drawer height on window resize
  useEffect(() => {
    const updateHeight = () => {
      const newHeight = window.visualViewport?.height !== undefined ? window.visualViewport?.height :  window.innerHeight;
      setViewportHeightState(newHeight);
      setIsViewportReady(true);

      // Update drawer height if it's open
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
  }, [drawerState]);

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
    
    // Animate with GSAP
    if (drawerRef.current) {
      const targetHeight = getHeightForState(newState)
      
      // Kill any existing animations
      gsap.killTweensOf(drawerRef.current)
      
      // Animate to target height (matching iframe timing)
      gsap.to(drawerRef.current, {
        height: targetHeight,
        duration: 0.5,
        ease: "cubic-bezier(0.4, 0, 0.2, 1)",
        onComplete: () => {
          // Ensure final height is set
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

  // Only render in browser environment
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
        zIndex: 2147483646, // max -1
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
        <div className="ov:w-full ov:relative  ov:flex ov:justify-center ">
          {drawerState !== 0 && <button 
            id="ov25-drawer-toggle-button"
            className=""
            onClick={toggleDrawerState}
          >
            <div>
              {drawerState === 1 ? 
                <ChevronUpIcon strokeWidth={1} className="ov:w-8 ov:h-8"/> 
                : (drawerState === 2 ? <ChevronDownIcon strokeWidth={1} className="ov:w-8 ov:h-8"/> : null)
              }
            </div>
          </button>}
        </div>

        <div className="ov:h-full ov:flex ov:flex-col ov:pointer-events-none">{children}</div>
      </div>
    </div>
  );
  
  // Get Shadow DOM reference from context
  const { shadowDOMs } = useOV25UI();
  
  // Use Shadow DOM if available, otherwise fallback to document.body
  const portalTarget = shadowDOMs?.mobileDrawer || document.body;
  
  return createPortal(drawerContent, portalTarget);
};

// Export as a named export
export const TwoStageDrawer = TwoStageDrawerComponent;

// Also add the displayName
(TwoStageDrawer as any).displayName = "TwoStageDrawer";
