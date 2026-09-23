import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Setup's shared button, in the OV25 app palette.
 *   default  – solid OV25 pink, for the primary action (Save).
 *   brand    – the OV25 brand gradient, for selected/active states.
 *   outline / ghost / destructive – secondary actions.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ov-pink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-ov-pink text-white shadow-sm hover:bg-ov-pink-mid',
        brand: 'ov25-brand-gradient text-white shadow-sm hover:opacity-90',
        outline: 'border border-border bg-background text-foreground hover:bg-muted',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        destructive: 'bg-destructive text-white shadow-sm hover:bg-destructive/90',
      },
      size: {
        default: 'h-9 px-4 text-sm rounded-full',
        sm: 'h-7 px-3 text-xs rounded-full',
        lg: 'py-2.5 px-4 text-sm rounded-full',
        icon: 'h-8 w-8 rounded-full',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';

export { Button, buttonVariants };
