import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "../../utils/cn.js"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "orbitalvision-flex orbitalvision-h-9 orbitalvision-w-full orbitalvision-items-center orbitalvision-justify-between orbitalvision-whitespace-nowrap orbitalvision-rounded-md orbitalvision-border orbitalvision-border-input orbitalvision-bg-transparent orbitalvision-px-3 orbitalvision-py-2 orbitalvision-text-sm orbitalvision-shadow-sm orbitalvision-ring-offset-background placeholder:orbitalvision-text-muted-foreground focus:orbitalvision-outline-none focus:orbitalvision-ring-1 focus:orbitalvision-ring-ring disabled:orbitalvision-cursor-not-allowed disabled:orbitalvision-opacity-50 [&>span]:orbitalvision-line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="orbitalvision-h-4 orbitalvision-w-4 orbitalvision-opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "orbitalvision-flex orbitalvision-cursor-default orbitalvision-items-center orbitalvision-justify-center orbitalvision-py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="orbitalvision-h-4 orbitalvision-w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "orbitalvision-flex orbitalvision-cursor-default orbitalvision-items-center orbitalvision-justify-center orbitalvision-py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="orbitalvision-h-4 orbitalvision-w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "orbitalvision-relative orbitalvision-z-50 orbitalvision-max-h-96 orbitalvision-min-w-[8rem] orbitalvision-overflow-hidden orbitalvision-rounded-md orbitalvision-border orbitalvision-bg-popover orbitalvision-text-popover-foreground orbitalvision-shadow-md data-[state=open]:orbitalvision-animate-in data-[state=closed]:orbitalvision-animate-out data-[state=closed]:orbitalvision-fade-out-0 data-[state=open]:orbitalvision-fade-in-0 data-[state=closed]:orbitalvision-zoom-out-95 data-[state=open]:orbitalvision-zoom-in-95 data-[side=bottom]:orbitalvision-slide-in-from-top-2 data-[side=left]:orbitalvision-slide-in-from-right-2 data-[side=right]:orbitalvision-slide-in-from-left-2 data-[side=top]:orbitalvision-slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:orbitalvision-translate-y-1 data-[side=left]:orbitalvision--translate-x-1 data-[side=right]:orbitalvision-translate-x-1 data-[side=top]:orbitalvision--translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "orbitalvision-p-1",
          position === "popper" &&
            "orbitalvision-h-[var(--radix-select-trigger-height)] orbitalvision-w-full orbitalvision-min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("orbitalvision-px-2 orbitalvision-py-1.5 orbitalvision-text-sm orbitalvision-font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "orbitalvision-relative orbitalvision-flex orbitalvision-w-full orbitalvision-cursor-default orbitalvision-select-none orbitalvision-items-center orbitalvision-rounded-sm orbitalvision-py-1.5 orbitalvision-pl-2 orbitalvision-pr-8 orbitalvision-text-sm orbitalvision-outline-none focus:orbitalvision-bg-accent focus:orbitalvision-text-accent-foreground data-[disabled]:orbitalvision-pointer-events-none data-[disabled]:orbitalvision-opacity-50",
      className
    )}
    {...props}
  >
    <span className="orbitalvision-absolute orbitalvision-right-2 orbitalvision-flex orbitalvision-h-3.5 orbitalvision-w-3.5 orbitalvision-items-center orbitalvision-justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="orbitalvision-h-4 orbitalvision-w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("orbitalvision--mx-1 orbitalvision-my-1 orbitalvision-h-px orbitalvision-bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
