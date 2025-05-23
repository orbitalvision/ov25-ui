import * as React from 'react'
import { cn } from '../../lib/utils.js';
import { Button } from '../ui/button.js';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';

export const CheckoutButton = () => {
    const { buyNowFunction, addToBasketFunction, setIsVariantsOpen } = useOV25UI();
    return (
      <div id="ov25-checkout-button-container" className={cn(
        'ov:flex ov:flex-column ov:p-2 ov:border-t ov:w-full ov:mt-auto ov:bottom-0 ov:right-0',


        'ov:bg-[var(--ov25-background-color)]',
        'ov:border-[var(--ov25-border-color)] ',
      )}>
        {addToBasketFunction && (
          <Button id="ov25-add-to-basket-button" onClick={() => {setIsVariantsOpen(false); addToBasketFunction()}} className={cn(
            'ov:w-full ov:h-10',
            'ov:bg-[var(--ov25-background-color)]',
            'ov:text-[var(--ov25-primary-color)]',
            'ov:border-[var(--ov25-button-border-width)]',
            'ov:border-[var(--ov25-border-color-secondary)]',
            'ov:rounded-[var(--ov25-button-border-radius)]',
            'ov:hover:bg-[var(--ov25-secondary-background-color)]',
            'ov:cursor-pointer',
          )}>
            <span>ADD TO BASKET</span>
          </Button>
        )}
        {buyNowFunction && (
          <Button id="ov25-checkout-button" onClick={buyNowFunction} className={cn(
            'ov:w-full ov:h-10',
            'ov:bg-[var(--ov25-primary-color)]',
            'ov:text-white',
            'ov:rounded-[var(--ov25-button-border-radius)]',
            'ov:hover:bg-[var(--ov25-primary-color)]/90',
            'ov:cursor-pointer',
          )}>
            <span>BUY NOW</span>
          </Button>
        )}
      </div>
    )
  };