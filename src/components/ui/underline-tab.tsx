"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion } from "framer-motion"

import { cn } from "../../utils/cn.js"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    indicatorClassName?: string
  }
>(({ className, children, indicatorClassName, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState<HTMLButtonElement | null>(null)
  const [prevTab, setPrevTab] = React.useState<HTMLButtonElement | null>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // Find the active trigger within this specific TabsList
    if (listRef.current) {
      const activeTabElement = listRef.current.querySelector('[data-state="active"]') as HTMLButtonElement
      if (activeTabElement) {
        setActiveTab(activeTabElement)
      }
    }
  }, [children])

  return (
    <div className="div w-full overflow-x-auto">
    <TabsPrimitive.List
      ref={(node) => {
        // Handle both the forwarded ref and our internal ref
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
        (listRef as any).current = node
      }}
      className={cn("relative inline-flex items-center justify-start gap-6", className)}
      onMouseDown={(e) => {
        // Find the closest trigger button within this TabsList
        const trigger = (e.target as HTMLElement).closest("button")
        if (trigger instanceof HTMLButtonElement && listRef.current?.contains(trigger)) {
          setPrevTab(activeTab)
          setActiveTab(trigger)
        }
      }}
      {...props}
    >
      {children}
      {activeTab && listRef.current && (
        <motion.div
          className={cn("absolute bottom-0 h-1 bg-primary", indicatorClassName)}
          initial={false}
          animate={{
            width: activeTab.getBoundingClientRect().width,
            x: activeTab.offsetLeft,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
    </TabsPrimitive.List></div>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    tabId?: string;
  }
>(({ className, tabId, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    key={`tab-trigger-${tabId || props.value}`}
    className={cn(
      "relative px-1 pb-3 text-xl bg-transparent font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-foreground",
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    tabId?: string;
  }
>(({ className, tabId, ...props }, ref) => (
  <TabsPrimitive.Content 
    ref={ref} 
    key={`tab-content-${tabId || props.value}`}
    className={cn("mt-6", className)} 
    {...props} 
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

