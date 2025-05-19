import * as React from 'react'
import { cn } from '../../lib/utils.js';
import { Button } from '../ui/button.js';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
export const MobileCheckoutButton = () => {
    const { checkoutFunction, formattedPrice } = useOV25UI();
    return (
      <div id={'ov25-checkout-button'} className={cn(
        'orbitalvision:grid orbitalvision:grid-cols-2 orbitalvision:p-2 orbitalvision:border-t orbitalvision:gap-2 orbitalvision:w-full orbitalvision:mt-auto orbitalvision:bottom-0 orbitalvision:right-0',
        'orbitalvision:bg-[var(--ov25-background-color)]',
        'orbitalvision:border-[var(--ov25-border-color)] ',
      )}>
        <div className="orbitalvision:h-full orbitalvision:flex orbitalvision:justify-center orbitalvision:items-center orbitalvision:w-full">
        <div className={cn(
          'orbitalvision:h-[calc(100%-2px)] orbitalvision:w-[calc(100%-16px)] orbitalvision:flex orbitalvision:justify-center orbitalvision:items-center',
          'orbitalvision:border-[var(--ov25-primary-color)]',
          'orbitalvision:rounded-[var(--ov25-button-border-radius)]',
        )}>
          <h3 className='orbitalvision:mt-0.5'>{formattedPrice}</h3>
        </div>
        
        </div>
        <Button onClick={checkoutFunction}className={cn(
          'orbitalvision:w-full orbitalvision:h-10',
          'orbitalvision:bg-[var(--ov25-primary-color)]',
          'orbitalvision:hover:bg-[var(--ov25-button-hover-background-color)]',
          'orbitalvision:text-[var(--ov25-button-text-color)]',
          'orbitalvision:hover:text-[var(--ov25-button-hover-text-color)]',
          'orbitalvision:border-[length:var(--ov25-button-border-width)]',
          'orbitalvision:border-[var(--ov25-button-border-color)]',
          'orbitalvision:rounded-[var(--ov25-button-border-radius)]',
        )}>
          <span>Checkout</span>
        </Button>
      </div>
    )
  };