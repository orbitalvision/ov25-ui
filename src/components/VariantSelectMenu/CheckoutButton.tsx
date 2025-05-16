import * as React from 'react'
import { cn } from '../../lib/utils.js';
import { Button } from '../ui/button.js';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
export const CheckoutButton = () => {
    const { checkoutFunction } = useOV25UI();
    return (
      <div id={'ov25-checkout-button'} className={cn(
        'flex flex-row p-2 border-t w-full mt-auto  bottom-0 right-0',
        'bg-[var(--ov25-background-color)]',
        'border-[var(--ov25-border-color)] ',
      )}>
        <Button onClick={checkoutFunction}className={cn(
          'w-full h-10',
          'bg-[var(--ov25-primary-color)]',
          'hover:bg-[var(--ov25-button-hover-background-color)]',
          'text-[var(--ov25-button-text-color)]',
          'hover:text-[var(--ov25-button-hover-text-color)]',
          'border-[length:var(--ov25-button-border-width)]',
          'border-[var(--ov25-button-border-color)]',
          'rounded-[var(--ov25-button-border-radius)]',
        )}>
          <span>Checkout</span>
        </Button>
      </div>
    )
  };