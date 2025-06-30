import * as React from 'react'
import { cn } from '../../lib/utils.js';
import { Button } from '../ui/button.js';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';

export const MobileCheckoutButton = () => {
    const { buyNowFunction, addToBasketFunction, formattedPrice, setIsVariantsOpen, discount, formattedSubtotal } = useOV25UI();
    const primaryStyles = cn(
        'ov:flex-1',
        'ov:bg-[var(--ov25-primary-color)]',
        'ov:text-white',
        'ov:rounded-[var(--ov25-button-border-radius)]',
        'ov:hover:bg-[var(--ov25-primary-color)]/90',
        'ov:cursor-pointer',
    )
    const secondaryStyles = cn(
        'ov:flex-1',
        'ov:bg-[var(--ov25-background-color)]',
        'ov:text-[var(--ov25-primary-color)]',
        'ov:border-[var(--ov25-button-border-width)]',
        'ov:border-[var(--ov25-border-color-secondary)]',
        'ov:rounded-[var(--ov25-button-border-radius)]',
        'ov:hover:bg-[var(--ov25-secondary-background-color)]',
        'ov:cursor-pointer',
    )
    return (
      <div id="ov25-mobile-checkout-and-price-button-container" className={cn(
        'ov:flex ov:items-center ov:p-2 ov:border-t ov:border-t-[var(--ov25-secondary-text-color)]/20 ov:w-full ov:mt-auto ov:bottom-0 ov:right-0',
        'ov:bg-[var(--ov25-background-color)]',
        discount.percentage > 0 ? 'ov:p-2' : 'ov:p-4'
      )}>
        {discount.percentage > 0 && (formattedPrice !== formattedSubtotal) ? (
          <div id="ov25-mobile-price-container" className='ov:flex ov:flex-col ov:items-center ov:pr-2'>
            <h3 id="ov25-mobile-savings-amount" className='ov:text-md ov:hidden text-center ov:px-2 ov:text-[var(--ov25-text-color)]'>{discount.formattedAmount}</h3>
            <h3 id="ov25-mobile-subtotal" className='ov:text-sm ov:text-red-500 text-center ov:line-through'>{formattedSubtotal}</h3>
            <h3 id="ov25-mobile-price" className='ov:text-lg text-center ov:text-[var(--ov25-text-color)]'>{formattedPrice}</h3>
          </div>
        ) : (
          <div id="ov25-mobile-price-container" className="ov:flex ov:items-center ov:mr-4">
            <h3 id="ov25-mobile-price" className='ov:text-xl  ov:text-[var(--ov25-text-color)]'>{formattedPrice}</h3>
          </div>
        )}
        <div id="ov25-mobile-checkout-button-container" className="ov:flex ov:flex-col ov:flex-1 ov:gap-2 ov:min-[350px]:flex-row">
          {addToBasketFunction && (
            <Button id="ov25-add-to-basket-button" onClick={() => {setIsVariantsOpen(false); addToBasketFunction()}} className={cn(
                (buyNowFunction === undefined && primaryStyles) || secondaryStyles
            )}>
              <span>ADD TO BASKET</span>
            </Button>
          )}
          {buyNowFunction && (
            <Button id="ov25-checkout-button" onClick={buyNowFunction} className={cn(
                primaryStyles
            )}>
              <span>BUY NOW</span>
            </Button>
          )}
        </div>
      </div>
    )
  };