import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { cn } from '../../lib/utils.js';

export const checkoutCommerceCtaButtonClasses =
  'ov:flex ov:items-center ov:justify-center ov:gap-2 ov:py-2 ov:px-6 ov:text-sm ov:rounded-[var(--ov25-cta-border-radius)] ov:bg-[var(--ov25-cta-color)] ov:text-[var(--ov25-cta-text-color)] ov:cursor-pointer ov:hover:bg-[var(--ov25-cta-color-hover)] ov:hover:text-[var(--ov25-cta-text-color-hover)] ov:transition-colors ov:border-0 ov:text-center ov:uppercase';

const baseButtonClasses = checkoutCommerceCtaButtonClasses;

/*
 * `disabled` alone isn't enough on these CTAs: :hover still matches a disabled button, so the
 * base classes' hover colours would fire under a not-allowed cursor. Pin the background and text
 * back to their resting values instead of reaching for pointer-events-none, which would also
 * suppress the cursor affordance.
 */
const disabledCtaClasses =
  'ov:disabled:opacity-50 ov:disabled:cursor-not-allowed ov:disabled:hover:bg-(--ov25-cta-color) ov:disabled:hover:text-(--ov25-cta-text-color)';

/* The combo layout's halves are transparent hit areas over separately rendered content, so their
   own hover tint is what needs neutralising; the opacity does the work on the cart icon, and the
   Buy now label is dimmed alongside it. */
const disabledOverlayClasses =
  'ov:disabled:opacity-50 ov:disabled:cursor-not-allowed ov:disabled:hover:bg-transparent';

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
    formattedSubtotal,
    discount,
    hasReceivedPrice,
    isCheckoutPayloadReady,
    disableAddToCart,
    disableBuyNow,
    getString,
  } = useOV25UI();
  /*
   * Pricing comes from the configurator after mount, so every price field is a placeholder zero
   * until the first CURRENT_PRICE. Omit the price rather than print "£0.00" on a CTA. The blanks
   * cover merchant templates too — a configured "Buy now ${PRICE}" would otherwise interpolate
   * the zero even though the standalone price node is hidden.
   */
  const priceVars = hasReceivedPrice
    ? { PRICE: formattedPrice, SUBTOTAL: formattedSubtotal, DISCOUNT_AMOUNT: discount.formattedAmount, DISCOUNT_PERCENTAGE: discount.percentage }
    : { PRICE: '', SUBTOTAL: '', DISCOUNT_AMOUNT: '', DISCOUNT_PERCENTAGE: '' };
  const addToBasketText = getString('checkoutAddToBasket', priceVars, 'Add to basket');
  const buyNowText = getString('checkoutBuyNow', priceVars, 'Buy now');
  /* Rendered as nothing, not an empty span: the button is a flex row with a gap, so an empty
     node would still reserve that gap and knock the label off centre. */
  const priceLabel = hasReceivedPrice ? <span>{formattedPrice}</span> : null;
  /*
   * Both callbacks need the current normalized price and SKU. Those messages are independent and
   * may arrive in either order, so a valid price alone must not enable checkout with a null/stale SKU.
   */
  const awaitingPrice = !isCheckoutPayloadReady;
  const hasAddToBasket = typeof addToBasketFunction === 'function';
  const hasBuyNow = typeof buyNowFunction === 'function';
  const effectiveHasAddToBasket = hasAddToBasket && !disableAddToCart;
  const effectiveHasBuyNow = hasBuyNow && !disableBuyNow;

  if (!effectiveHasAddToBasket && !effectiveHasBuyNow) {
    return null;
  }

  const wrapperClass = embedded
    ? 'ov25-checkout-button-wrapper ov25-checkout-button-wrapper--embedded ov:shrink-0 ov:w-full ov:min-w-0 ov:max-w-full'
    : 'ov25-checkout-button-wrapper ov:shrink-0 ov:px-4 ov:pb-2 ov:pt-2';

  if (effectiveHasAddToBasket && !effectiveHasBuyNow) {
    return (
      <div className={wrapperClass}>
      <button
        id="ov25-add-to-basket-button"
        type="button"
        disabled={awaitingPrice}
        onClick={(e) => {
          stopCommerceClick(e);
          setIsVariantsOpen(false);
          addToBasketFunction();
          onAfterAddToBasket?.();
        }}
        className={cn(baseButtonClasses, buttonFontWeight(embedded), 'ov:w-full ov:min-w-0 ov:max-w-full', disabledCtaClasses)}
      >
        <span>{addToBasketText}</span>
        {priceLabel}
      </button>
      </div>
    );
  }

  if (effectiveHasBuyNow && !effectiveHasAddToBasket) {
    return (
      <div className={wrapperClass}>
      <button
        id="ov25-checkout-button"
        type="button"
        disabled={awaitingPrice}
        onClick={(e) => {
          stopCommerceClick(e);
          buyNowFunction();
          onAfterBuyNow?.();
        }}
        className={cn(baseButtonClasses, buttonFontWeight(embedded), 'ov:w-full ov:min-w-0 ov:max-w-full', disabledCtaClasses)}
      >
        <span>{buyNowText}</span>
        {priceLabel}
      </button>
      </div>
    );
  }

  const labelContent = (
    <>
      <span>{buyNowText}</span>
      {priceLabel}
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
        className={cn(
          'ov25-checkout-combo-button-text ov:absolute ov:z-12 ov:inset-0 ov:flex ov:items-center ov:justify-center ov:gap-2 ov:pointer-events-none',
          awaitingPrice && 'ov:opacity-50'
        )}
        aria-hidden
      >
        {labelContent}
      </div>
      <button
        id="ov25-checkout-button"
        type="button"
        disabled={awaitingPrice}
        onClick={(e) => {
          stopCommerceClick(e);
          buyNowFunction();
          onAfterBuyNow?.();
        }}
        className={cn(baseButtonClasses, 'ov:absolute ov:inset-0 ov:right-14 ov:z-11 ov:cursor-pointer ov:bg-transparent ov:border-0 ov:rounded-none', disabledOverlayClasses)}
        aria-label={buyNowText}
      >
      </button>
      <div className="ov:absolute ov:right-14 ov:top-0 ov:bottom-0 ov:w-px ov:bg-white/30 ov:z-10" aria-hidden />
      <button
        id="ov25-add-to-basket-button"
        type="button"
        disabled={awaitingPrice}
        onClick={(e) => {
          stopCommerceClick(e);
          setIsVariantsOpen(false);
          addToBasketFunction();
          onAfterAddToBasket?.();
        }}
        className={cn(
          'ov:absolute ov:right-0 ov:top-0 ov:bottom-0 ov:w-14 ov:z-20 ov:flex ov:items-center ov:justify-center ov:cursor-pointer ov:bg-transparent ov:border-0 ov:hover:bg-white/10 ov:transition-colors',
          disabledOverlayClasses
        )}
        aria-label={addToBasketText}
      >
        <ShoppingCart size={20} />
      </button>
    </div>
    </div>
  );
};
