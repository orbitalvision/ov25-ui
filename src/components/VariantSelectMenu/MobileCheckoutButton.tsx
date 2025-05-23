import * as React from 'react'
import { cn } from '../../lib/utils.js';
import { Button } from '../ui/button.js';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';

export const MobileCheckoutButton = () => {
    const { buyNowFunction, addToBasketFunction, formattedPrice, setIsVariantsOpen } = useOV25UI();
    return (
      <div className={cn(
        'ov:grid ov:grid-cols-2 ov:p-2 ov:border-t ov:gap-2 ov:w-full ov:mt-auto ov:bottom-0 ov:right-0',
        'ov:bg-[var(--ov25-background-color)]',
        'ov:border-[var(--ov25-border-color)] ',
      )}>
        <div className="ov:h-full ov:flex ov:justify-center ov:items-center ov:w-full">
          <div className={cn(
            'ov:h-[calc(100%-2px)] ov:w-[calc(100%-16px)] ov:flex ov:justify-center ov:items-center',
            'ov:border-[var(--ov25-primary-color)]',
            'ov:rounded-[var(--ov25-button-border-radius)]',
          )}>
            <h3 className='ov:mt-0.5'>{formattedPrice}</h3>
          </div>
        </div>
        <div id="ov25-checkout-button-container" className="ov:grid ov:grid-rows-2 ov:gap-2">
          {buyNowFunction && (
            <Button id="ov25-checkout-button" onClick={buyNowFunction} className={cn(
              'ov:w-full',
              'ov:bg-[var(--ov25-primary-color)]',
              'ov:hover:bg-[var(--ov25-button-hover-background-color)]',
              'ov:text-[var(--ov25-button-text-color)]',
              'ov:hover:text-[var(--ov25-button-hover-text-color)]',
              'ov:border-[length:var(--ov25-button-border-width)]',
              'ov:border-[var(--ov25-button-border-color)]',
              'ov:rounded-[var(--ov25-button-border-radius)]',
            )}>
              <span>BUY NOW</span>
            </Button>
          )}
          {addToBasketFunction && (
            <Button id="ov25-add-to-basket-button" onClick={() => {setIsVariantsOpen(false); addToBasketFunction()}} className={cn(
              'ov:w-full',
              'ov:bg-[var(--ov25-primary-color)]',
              'ov:hover:bg-[var(--ov25-button-hover-background-color)]',
              'ov:text-[var(--ov25-button-text-color)]',
              'ov:hover:text-[var(--ov25-button-hover-text-color)]',
              'ov:border-[length:var(--ov25-button-border-width)]',
              'ov:border-[var(--ov25-button-border-color)]',
              'ov:rounded-[var(--ov25-button-border-radius)]',
            )}>
              <span>ADD TO BASKET</span>
            </Button>
          )}
        </div>
      </div>
    )
  };