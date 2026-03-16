import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { cn } from '../../lib/utils.js';

const baseButtonClasses = 'ov:flex ov:items-center ov:justify-center ov:gap-2 ov:py-2 ov:px-6 ov:text-sm ov:rounded-full ov:bg-[var(--ov25-cta-color)] ov:text-white ov:font-medium ov:cursor-pointer ov:hover:bg-[var(--ov25-cta-color-hover)] ov:transition-colors ov:border-0 ov:text-center ov:uppercase';

export const CheckoutButton = () => {
  const {
    buyNowFunction,
    addToBasketFunction,
    setIsVariantsOpen,
    formattedPrice,
  } = useOV25UI();

  const hasAddToBasket = typeof addToBasketFunction === 'function';
  const hasBuyNow = typeof buyNowFunction === 'function';

  if (!hasAddToBasket && !hasBuyNow) return null;


  if (hasAddToBasket && !hasBuyNow) {
    return (
      <button
        id="ov25-add-to-basket-button"
        type="button"
        onClick={() => {
          setIsVariantsOpen(false);
          addToBasketFunction();
        }}
        className={cn(baseButtonClasses, 'ov:w-full')}
      >
        <span>Add to basket</span>
        <span>{formattedPrice}</span>
      </button>
    );
  }

  if (hasBuyNow && !hasAddToBasket) {
    return (
      <button
        id="ov25-checkout-button"
        type="button"
        onClick={() => buyNowFunction()}
        className={cn(baseButtonClasses, 'ov:w-full')}
      >
        <span>Buy now</span>
        <span>{formattedPrice}</span>
      </button>
    );
  }

  const labelContent = (
    <>
      <span>Buy now</span>
      <span>{formattedPrice}</span>
    </>
  );

  return (
    <div className="ov:relative ov:flex ov:w-full ov:rounded-full ov:overflow-hidden ov:bg-[var(--ov25-cta-color)] ov:text-white ov:uppercase ov:text-sm">
      <div className="ov:flex ov:items-center ov:justify-center ov:gap-2 ov:py-2 ov:px-6 ov:pr-14 ov:min-w-0 ov:flex-1 ov:invisible" aria-hidden>
        {labelContent}
      </div>
      <div className="ov:w-14 ov:shrink-0 ov:invisible" aria-hidden>
        <ShoppingCart size={20} />
      </div>
      <div
        className="ov:absolute ov:inset-0 ov:flex ov:items-center ov:justify-center ov:gap-2 ov:pointer-events-none"
        aria-hidden
      >
        {labelContent}
      </div>
      <button
        id="ov25-checkout-button"
        type="button"
        onClick={() => buyNowFunction()}
        className="ov:absolute ov:inset-0 ov:right-14 ov:z-0 ov:cursor-pointer ov:bg-transparent ov:border-0"
        aria-label="Buy now"
      />
      <div className="ov:absolute ov:right-14 ov:top-0 ov:bottom-0 ov:w-px ov:bg-white/30 ov:z-10" aria-hidden />
      <button
        id="ov25-add-to-basket-button"
        type="button"
        onClick={() => {
          setIsVariantsOpen(false);
          addToBasketFunction();
        }}
        className="ov:absolute ov:right-0 ov:top-0 ov:bottom-0 ov:w-14 ov:z-20 ov:flex ov:items-center ov:justify-center ov:cursor-pointer ov:bg-transparent ov:border-0 ov:hover:bg-white/10 ov:transition-colors"
        aria-label="Add to basket"
      >
        <ShoppingCart size={20} />
      </button>
    </div>
  );
};
