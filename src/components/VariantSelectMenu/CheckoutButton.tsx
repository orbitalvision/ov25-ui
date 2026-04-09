import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { cn } from '../../lib/utils.js';

const baseButtonClasses =
  'ov:flex ov:items-center ov:justify-center ov:gap-2 ov:py-2 ov:px-6 ov:text-sm ov:rounded-[var(--ov25-cta-border-radius)] ov:bg-[var(--ov25-cta-color)] ov:text-[var(--ov25-cta-text-color)] ov:cursor-pointer ov:hover:bg-[var(--ov25-cta-color-hover)] ov:hover:text-[var(--ov25-cta-text-color-hover)] ov:transition-colors ov:border-0 ov:text-center ov:uppercase';

function buttonFontWeight(embedded: boolean) {
  return embedded ? 'ov:font-normal' : 'ov:font-medium';
}

function stopCommerceClick(e: React.SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export type CheckoutButtonProps = {
  onAfterAddToBasket?: () => void;
  onAfterBuyNow?: () => void;
  /**
   * Tighter layout for narrow panels (e.g. Snap2 checkout sheet): no extra horizontal padding on the wrapper
   * so the CTA stays within the parent padding box and does not clip.
   */
  embedded?: boolean;
};

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  onAfterAddToBasket,
  onAfterBuyNow,
  embedded = false,
}) => {
  const {
    buyNowFunction,
    addToBasketFunction,
    setIsVariantsOpen,
    formattedPrice,
  } = useOV25UI();

  const hasAddToBasket = typeof addToBasketFunction === 'function';
  const hasBuyNow = typeof buyNowFunction === 'function';

  if (!hasAddToBasket && !hasBuyNow) return null;

  const wrapperClass = embedded
    ? 'ov25-checkout-button-wrapper ov25-checkout-button-wrapper--embedded ov:shrink-0 ov:w-full ov:min-w-0 ov:max-w-full'
    : 'ov25-checkout-button-wrapper ov:shrink-0';

  if (hasAddToBasket && !hasBuyNow) {
    return (
      <div className={wrapperClass}>
      <button
        id="ov25-add-to-basket-button"
        type="button"
        onClick={(e) => {
          stopCommerceClick(e);
          setIsVariantsOpen(false);
          addToBasketFunction();
          onAfterAddToBasket?.();
        }}
        className={cn(baseButtonClasses, buttonFontWeight(embedded), 'ov:w-full ov:min-w-0 ov:max-w-full')}
      >
        <span>Add to basket</span>
        <span>{formattedPrice}</span>
      </button>
      </div>
    );
  }

  if (hasBuyNow && !hasAddToBasket) {
    return (
      <div className={wrapperClass}>
      <button
        id="ov25-checkout-button"
        type="button"
        onClick={(e) => {
          stopCommerceClick(e);
          buyNowFunction();
          onAfterBuyNow?.();
        }}
        className={cn(baseButtonClasses, buttonFontWeight(embedded), 'ov:w-full ov:min-w-0 ov:max-w-full')}
      >
        <span>Buy now</span>
        <span>{formattedPrice}</span>
      </button>
      </div>
    );
  }

  const labelContent = (
    <>
      <span>Buy now</span>
      <span>{formattedPrice}</span>
    </>
  );

  return (
    <div className={wrapperClass}>
    <div
      className={cn(
        'ov25-checkout-combo-button ov:relative ov:flex ov:w-full ov:min-w-0 ov:max-w-full ov:rounded-(--ov25-cta-border-radius) ov:overflow-hidden ov:bg-(--ov25-cta-color) ov:hover:bg-(--ov25-cta-color-hover) ov:text-(--ov25-cta-text-color) ov:hover:text-(--ov25-cta-text-color-hover) ov:uppercase ov:text-sm',
        buttonFontWeight(embedded)
      )}
    >
      <div
        className="ov:pointer-events-none ov:flex ov:items-center ov:justify-center ov:gap-2 ov:py-2 ov:px-6 ov:pr-14 ov:min-w-0 ov:flex-1 ov:invisible"
        aria-hidden
      >
        {labelContent}
      </div>
      <div className="ov:pointer-events-none ov:w-14 ov:shrink-0 ov:invisible" aria-hidden>
        <ShoppingCart size={20} />
      </div>
      <div
        className="ov25-checkout-combo-button-text ov:absolute ov:z-1 ov:inset-0 ov:flex ov:items-center ov:justify-center ov:gap-2 ov:pointer-events-none"
        aria-hidden
      >
        {labelContent}
      </div>
      <button
        id="ov25-checkout-button"
        type="button"
        onClick={(e) => {
          stopCommerceClick(e);
          buyNowFunction();
          onAfterBuyNow?.();
        }}
        className={cn(baseButtonClasses, 'ov:absolute ov:inset-0 ov:right-14 ov:z-11 ov:cursor-pointer ov:bg-transparent ov:border-0 ov:rounded-none')}
        aria-label="Buy now"
      >
        <span>Buy now</span>
        <span>{formattedPrice}</span>
      </button>
      <div className="ov:absolute ov:right-14 ov:top-0 ov:bottom-0 ov:w-px ov:bg-white/30 ov:z-10" aria-hidden />
      <button
        id="ov25-add-to-basket-button"
        type="button"
        onClick={(e) => {
          stopCommerceClick(e);
          setIsVariantsOpen(false);
          addToBasketFunction();
          onAfterAddToBasket?.();
        }}
        className="ov:absolute ov:right-0 ov:top-0 ov:bottom-0 ov:w-14 ov:z-20 ov:flex ov:items-center ov:justify-center ov:cursor-pointer ov:bg-transparent ov:border-0 ov:hover:bg-white/10 ov:transition-colors"
        aria-label="Add to basket"
      >
        <ShoppingCart size={20} />
      </button>
    </div>
    </div>
  );
};
