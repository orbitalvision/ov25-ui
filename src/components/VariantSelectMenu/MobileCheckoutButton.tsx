import * as React from 'react'
import { cn } from '../../lib/utils.js';
import { Button } from '../ui/button.js';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
export const MobileCheckoutButton = () => {
    const { checkoutFunction, formattedPrice } = useOV25UI();
    return (
      <div id={'ov25-checkout-button'} className={cn(
        'grid grid-cols-2 p-2 border-t gap-2 w-full mt-auto  bottom-0 right-0',
        'bg-[var(--ov25-background-color)]',
        'border-[var(--ov25-border-color)] ',
      )}>
        <div className="h-full flex justify-center items-center w-full">
        <div className={cn(
          'h-[calc(100%-2px)] w-[calc(100%-16px)]  flex justify-center items-center',
          'border-[var(--ov25-primary-color)]',
          'rounded-[var(--ov25-button-border-radius)]',
        )}>
          <h3 className='mt-0.5'>{formattedPrice}</h3>
        </div>
        
        </div>
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