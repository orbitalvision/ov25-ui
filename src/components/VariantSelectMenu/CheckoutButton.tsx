import * as React from 'react'
import { cn } from '../../lib/utils.js';
import { Button } from '../ui/button.js';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';

export const CheckoutButton = () => {
    const { buyNowFunction, addToBasketFunction, setIsVariantsOpen, formattedPrice } = useOV25UI();
    return (
      <div id="ov25-checkout-button-container" className={cn(
        'ov:flex ov:flex-col ov:p-2 ov:px-0   ov:w-full ov:mt-auto ov:bottom-0 ov:right-0',


        'ov:bg-[var(--ov25-background-color)]',
        'ov:border-[var(--ov25-border-color)] ',
      )}>
        <div className="ov:w-full ov:flex ov:items-center ov:justify-center ov:pb-1.5 ov:mb-2 ov:border-b ov:border-b-[var(--ov25-secondary-text-color)]/20">
            <h3 className='ov:text-xl  text-center ov:text-[var(--ov25-text-color)]'>{formattedPrice}</h3>
        </div>
        <div className="ov:grid ov:grid-cols ov:grid-cols-2 ov:px-2">
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
      </div>
    )
  };