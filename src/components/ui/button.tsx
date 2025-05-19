import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../utils/cn.js"

const buttonVariants = cva(
  "orbitalvision:inline-flex orbitalvision:items-center orbitalvision:rounded-md orbitalvision:justify-center orbitalvision:gap-2 orbitalvision:whitespace-nowrap orbitalvision:text-sm orbitalvision:font-medium orbitalvision:transition-colors orbitalvision:focus-visible:outline-none orbitalvision:disabled:pointer-events-none orbitalvision:disabled:opacity-50 orbitalvision:[&_svg]:pointer-events-none orbitalvision:[&_svg]:size-4 orbitalvision:[&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "orbitalvision:bg-primary orbitalvision:text-white orbitalvision:shadow orbitalvision:hover:bg-primary/90 ",
        black:
          "orbitalvision:bg-black orbitalvision:text-white orbitalvision:shadow orbitalvision:hover:bg-black/90 ",
        destructive:
          "orbitalvision:bg-destructive orbitalvision:text-destructive-foreground orbitalvision:shadow-sm orbitalvision:hover:bg-destructive/90",
        outline:
          "orbitalvision:border orbitalvision:border-input orbitalvision:bg-background orbitalvision:shadow-sm orbitalvision:hover:bg-accent orbitalvision:hover:text-accent-foreground",
        secondary:
          "orbitalvision:bg-secondary orbitalvision:text-secondary-foreground orbitalvision:shadow-sm orbitalvision:hover:bg-secondary/80",
        success:
          "orbitalvision:bg-green-500 orbitalvision:text-white orbitalvision:shadow-sm orbitalvision:hover:bg-green-600",
        ghost: "orbitalvision:hover:bg-accent orbitalvision:hover:text-accent-foreground",
        link: "orbitalvision:text-primary orbitalvision:underline-offset-4 orbitalvision:hover:underline",
        shimmerOutline: "orbitalvision:hover:animate-shimmer orbitalvision:border orbitalvision:border-input orbitalvision:bg-background orbitalvision:bg-[linear-gradient(110deg,#ffffff,45%,#f7f7f7,55%,#ffffff)] orbitalvision:bg-[length:200%_100%] orbitalvision:shadow-sm orbitalvision:hover:bg-accent orbitalvision:hover:text-accent-foreground ",
        shimmerDefault: "orbitalvision:hover:animate-shimmer orbitalvision:bg-primary orbitalvision:text-white orbitalvision:shadow orbitalvision:bg-[linear-gradient(110deg,var(--primary),45%,white,55%,var(--primary))] orbitalvision:bg-[length:250%_100%] orbitalvision:hover:bg-primary/90",
      },
      size: {
        default: "orbitalvision:h-9 orbitalvision:px-4 orbitalvision:py-2",
        sm: "orbitalvision:h-8 orbitalvision:px-3 orbitalvision:text-xs",
        lg: "orbitalvision:h-10 orbitalvision:px-8",
        icon: "orbitalvision:h-9 orbitalvision:w-9",
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
