import * as React from 'react'
import { cn } from '../../lib/utils.js';
import { Button } from '../ui/button.js';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';

export const MobileCheckoutButton = () => {
    const { buyNowFunction, addToBasketFunction, formattedPrice, setIsVariantsOpen, discount, formattedSubtotal, hidePricing } = useOV25UI();
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
      !hidePricing &&(<div id="ov25-mobile-checkout-and-price-button-container" className={cn(
        'ov:flex ov:items-center ov:p-2 ov:border-t ov:border-t-[var(--ov25-secondary-text-color)]/20 ov:w-full ov:mt-auto ov:bottom-0 ov:right-0',
        'ov:bg-[var(--ov25-background-color)] ov:p-2 ov:min-w-0 ov:overflow-hidden',
      )}>
        {(
          discount.percentage > 0 && (formattedPrice !== formattedSubtotal) ? (
            <div id="ov25-mobile-price-container" className="ov:flex ov:flex-col ov:min-w-0 ov:flex-shrink ov:mr-2">
              <h3 id="ov25-mobile-savings-amount" className="ov:text-sm ov:truncate">{discount.formattedAmount}</h3>
              <h3 id="ov25-mobile-subtotal" className="ov:text-sm ov:truncate">{formattedSubtotal}</h3>
              <h3 id="ov25-mobile-price" data-sale="true" className="ov:text-lg ov:font-semibold ov:truncate">{formattedPrice}</h3>
            </div>
          ) : (
            <div id="ov25-mobile-price-container" className="ov:flex ov:flex-col ov:min-w-0 ov:flex-shrink ov:mr-2">
              <h3 id="ov25-mobile-price" className="ov:text-lg ov:font-semibold ov:truncate">{formattedPrice}</h3>
            </div>
          )
        )}
        <div id="ov25-mobile-checkout-button-container" className="ov:flex ov:flex-col ov:flex-1 ov:gap-2 ov:min-[350px]:flex-row ov:min-w-0">
          {addToBasketFunction && (
            <Button id="ov25-add-to-basket-button" onClick={() => {setIsVariantsOpen(false); addToBasketFunction()}} className={cn(
                (buyNowFunction === undefined && primaryStyles) || secondaryStyles,
                'ov:min-w-0 ov:flex-grow-2 ov:px-1'
            )}>
              <span className="ov:truncate">ADD TO BASKET</span>
            </Button>
          )}
          {buyNowFunction && (
            <Button id="ov25-checkout-button" onClick={buyNowFunction} className={cn(
                primaryStyles,
                'ov:min-w-0 ov:flex-shrink ov:px-1'
            )}>
              <span className="ov:truncate">BUY NOW</span>
            </Button>
          )}
        </div>
      </div>)
    )
  };