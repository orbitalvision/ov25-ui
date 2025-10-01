import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { createPortal } from "react-dom"
import { useOV25UI } from "../../contexts/ov25-ui-context.js"

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
      "ov:fixed ov:inset-0 ov:z-[1000] ov:bg-black/80  data-[state=open]:ov:animate-in data-[state=closed]:ov:animate-out data-[state=closed]:ov:fade-out-0 data-[state=open]:ov:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { shadowDOMs } = useOV25UI();
  
  // Snap2 dialogs need special handling for fullscreen compatibility
  const isSnap2Dialog = className?.includes('snap2');
  const portalTarget = isSnap2Dialog 
    ? (document.querySelector('iframe')?.parentElement || document.body)
    : (shadowDOMs?.configuratorViewControls || shadowDOMs?.swatchbookPortal);
  
  if (!portalTarget) {
    throw new Error('Portal target not found');
  }
  
  return (
    <>
      {createPortal(<DialogOverlay />, portalTarget)}
      {createPortal(
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "ov:fixed ov:left-[50%] ov:top-[50%] ov:z-[2147483647] ov:grid ov:w-full ov:max-w-lg ov:translate-x-[-50%] ov:translate-y-[-50%] ov:gap-4 ov:border ov:bg-background ov:p-6 ov:shadow-lg ov:duration-200 data-[state=open]:ov:animate-in data-[state=closed]:ov:animate-out data-[state=closed]:ov:fade-out-0 data-[state=open]:ov:fade-in-0 data-[state=closed]:ov:zoom-out-95 data-[state=open]:ov:zoom-in-95 data-[state=closed]:ov:slide-out-to-left-1/2 data-[state=closed]:ov:slide-out-to-top-[48%] data-[state=open]:ov:slide-in-from-left-1/2 data-[state=open]:ov:slide-in-from-top-[48%] ov:rounded-lg",
            className
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="ov:absolute ov:right-4 ov:top-4 ov:rounded-sm ov:opacity-70 ov:ring-offset-background ov:transition-opacity hover:ov:opacity-100 focus:ov:outline-none focus:ov:ring-2 focus:ov:ring-ring focus:ov:ring-offset-2 disabled:ov:pointer-events-none data-[state=open]:ov:bg-accent data-[state=open]:ov:text-muted-foreground">
            <X className="ov:h-6 ov:w-6" />
            <span className="ov:sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>,
        portalTarget
      )}
    </>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "ov:flex ov:flex-col ov:space-y-1.5 ov:text-center ov:sm:text-left",
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
      "ov:flex ov:flex-col-reverse ov:sm:flex-row ov:sm:justify-end ov:sm:space-x-2",
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
      "ov:text-lg ov:font-semibold ov:leading-none ov:tracking-tight",
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
    className={cn("ov:text-sm ov:text-muted-foreground", className)}
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
