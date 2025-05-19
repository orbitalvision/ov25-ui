import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "../../utils/cn.js"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "orbitalvision-fixed orbitalvision-inset-0 orbitalvision-z-50 orbitalvision-bg-black/80  data-[state=open]:orbitalvision-animate-in data-[state=closed]:orbitalvision-animate-out data-[state=closed]:orbitalvision-fade-out-0 data-[state=open]:orbitalvision-fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "orbitalvision-fixed orbitalvision-left-[50%] orbitalvision-top-[50%] orbitalvision-z-50 orbitalvision-grid orbitalvision-w-full orbitalvision-max-w-lg orbitalvision-translate-x-[-50%] orbitalvision-translate-y-[-50%] orbitalvision-gap-4 orbitalvision-border orbitalvision-bg-background orbitalvision-p-6 orbitalvision-shadow-lg orbitalvision-duration-200 data-[state=open]:orbitalvision-animate-in data-[state=closed]:orbitalvision-animate-out data-[state=closed]:orbitalvision-fade-out-0 data-[state=open]:orbitalvision-fade-in-0 data-[state=closed]:orbitalvision-zoom-out-95 data-[state=open]:orbitalvision-zoom-in-95 data-[state=closed]:orbitalvision-slide-out-to-left-1/2 data-[state=closed]:orbitalvision-slide-out-to-top-[48%] data-[state=open]:orbitalvision-slide-in-from-left-1/2 data-[state=open]:orbitalvision-slide-in-from-top-[48%] orbitalvision-sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="orbitalvision-absolute orbitalvision-right-4 orbitalvision-top-4 orbitalvision-rounded-sm orbitalvision-opacity-70 orbitalvision-ring-offset-background orbitalvision-transition-opacity hover:orbitalvision-opacity-100 focus:orbitalvision-outline-none focus:orbitalvision-ring-2 focus:orbitalvision-ring-ring focus:orbitalvision-ring-offset-2 disabled:orbitalvision-pointer-events-none data-[state=open]:orbitalvision-bg-accent data-[state=open]:orbitalvision-text-muted-foreground">
        <X className="orbitalvision-h-4 orbitalvision-w-4" />
        <span className="orbitalvision-sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "orbitalvision-flex orbitalvision-flex-col orbitalvision-space-y-1.5 orbitalvision-text-center sm:orbitalvision-text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "orbitalvision-flex orbitalvision-flex-col-reverse sm:orbitalvision-flex-row sm:orbitalvision-justify-end sm:orbitalvision-space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "orbitalvision-text-lg orbitalvision-font-semibold orbitalvision-leading-none orbitalvision-tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("orbitalvision-text-sm orbitalvision-text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
