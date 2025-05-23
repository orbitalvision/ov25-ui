import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../utils/cn.js"

const buttonVariants = cva(
  "ov:inline-flex ov:items-center ov:rounded-md ov:justify-center ov:gap-2 ov:whitespace-nowrap ov:text-sm ov:font-medium ov:transition-colors ov:focus-visible:outline-none ov:disabled:pointer-events-none ov:disabled:opacity-50 ov:[&_svg]:pointer-events-none ov:[&_svg]:size-4 ov:[&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "ov:bg-primary ov:text-white ov:shadow ov:hover:bg-primary/90 ",
        black:
          "ov:bg-black ov:text-white ov:shadow ov:hover:bg-black/90 ",
        destructive:
          "ov:bg-destructive ov:text-destructive-foreground ov:shadow-sm ov:hover:bg-destructive/90",
        outline:
          "ov:border ov:border-input ov:bg-background ov:shadow-sm ov:hover:bg-accent ov:hover:text-accent-foreground",
        secondary:
          "ov:bg-secondary ov:text-secondary-foreground ov:shadow-sm ov:hover:bg-secondary/80",
        success:
          "ov:bg-green-500 ov:text-white ov:shadow-sm ov:hover:bg-green-600",
        ghost: "ov:hover:bg-accent ov:hover:text-accent-foreground",
        link: "ov:text-primary ov:underline-offset-4 ov:hover:underline",
        shimmerOutline: "ov:hover:animate-shimmer ov:border ov:border-input ov:bg-background ov:bg-[linear-gradient(110deg,#ffffff,45%,#f7f7f7,55%,#ffffff)] ov:bg-[length:200%_100%] ov:shadow-sm ov:hover:bg-accent ov:hover:text-accent-foreground ",
        shimmerDefault: "ov:hover:animate-shimmer ov:bg-primary ov:text-white ov:shadow ov:bg-[linear-gradient(110deg,var(--primary),45%,white,55%,var(--primary))] ov:bg-[length:250%_100%] ov:hover:bg-primary/90",
      },
      size: {
        default: "ov:h-9 ov:px-4 ov:py-2",
        sm: "ov:h-8 ov:px-3 ov:text-xs",
        lg: "ov:h-10 ov:px-8",
        icon: "ov:h-9 ov:w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"


    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
