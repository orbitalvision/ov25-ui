import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "../../utils/cn.js"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("orbitalvision-relative orbitalvision-overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="orbitalvision-h-full orbitalvision-w-full orbitalvision-rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "orbitalvision-flex orbitalvision-touch-none orbitalvision-select-none orbitalvision-transition-colors",
      orientation === "vertical" &&
        "orbitalvision-h-full orbitalvision-w-2.5 orbitalvision-border-l orbitalvision-border-l-transparent orbitalvision-p-[1px]",
      orientation === "horizontal" &&
        "orbitalvision-h-2.5 orbitalvision-flex-col orbitalvision-border-t orbitalvision-border-t-transparent orbitalvision-p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="orbitalvision-relative orbitalvision-flex-1 orbitalvision-rounded-full orbitalvision-bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
