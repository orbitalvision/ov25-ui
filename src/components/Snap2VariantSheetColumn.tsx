import React, { createContext, useContext, useState } from 'react';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { cn } from '../lib/utils.js';
import {
  getSnap2CheckoutSheetDomId,
  Snap2CheckoutSheetBody,
  Snap2CheckoutSheetFooter,
} from './Snap2CheckoutSheet.js';
import { checkoutCommerceCtaButtonClasses } from './VariantSelectMenu/CheckoutButton.js';

/** Portal target for UI (e.g. module detail sheet): full `#ov25-snap2-variant-sheet-column`, including checkout CTA. */
export const Snap2VariantSheetMainRootContext = createContext<HTMLElement | null>(null);

export function useSnap2VariantSheetMainRoot(): HTMLElement | null {
  return useContext(Snap2VariantSheetMainRootContext);
}

/**
 * Snap2-only: variants column with a persistent `#ov25-snap2-checkout-sheet` host (for host-page DOM
 * replacement before first paint) and in-panel checkout toggled via context `isSnap2CheckoutSheetOpen`.
 */
export function Snap2VariantSheetColumn({ children }: { children: React.ReactNode }) {
  const {
    isSnap2Mode,
    isMobile,
    hidePricing,
    disableAddToCart,
    addToBasketFunction,
    buyNowFunction,
    isSnap2CheckoutSheetOpen,
    setIsSnap2CheckoutSheetOpen,
    uniqueId,
    activeOptionId,
  } = useOV25UI();

  const hasCheckout =
    (typeof addToBasketFunction === 'function' && !disableAddToCart) || typeof buyNowFunction === 'function';

  if (!isSnap2Mode) {
    return (
      <Snap2VariantSheetMainRootContext.Provider value={null}>
        {children}
      </Snap2VariantSheetMainRootContext.Provider>
    );
  }

  const sheetDomId = getSnap2CheckoutSheetDomId(uniqueId);
  const handleCloseCheckout = () => setIsSnap2CheckoutSheetOpen(false);
  const [columnEl, setColumnEl] = useState<HTMLDivElement | null>(null);

  return (
    <div
      id="ov25-snap2-variant-sheet-column"
      ref={setColumnEl}
      className="ov:relative ov:flex ov:flex-col ov:flex-1 ov:h-full ov:min-h-0 ov:min-w-0 ov:max-h-full ov:w-full ov:overflow-hidden"
      data-ov25-snap2-variant-column="true"
      data-ov25-snap2-checkout-open={isSnap2CheckoutSheetOpen ? 'true' : 'false'}
      data-ov25-snap2-active-option={activeOptionId ?? ''}
    >
      <Snap2VariantSheetMainRootContext.Provider value={columnEl}>
        <div
          id="ov25-snap2-variant-sheet-main"
          className={cn(
            'ov:relative ov:flex ov:flex-1 ov:min-h-0 ov:min-w-0 ov:flex-col ov:overflow-hidden',
            isSnap2CheckoutSheetOpen && 'ov:hidden'
          )}
        >
          {children}
        </div>

      <div
        id={sheetDomId}
        data-open={isSnap2CheckoutSheetOpen ? 'true' : 'false'}
        className={cn(
          'ov:flex ov:min-h-0 ov:min-w-0 ov:flex-col ov:overflow-hidden ov:bg-(--ov25-background-color)',
          isMobile
            ? 'ov:fixed ov:inset-0 ov:z-50 ov:pointer-events-auto ov:h-dvh ov:w-screen'
            : 'ov:flex-1',
          !isSnap2CheckoutSheetOpen && 'ov:hidden'
        )}
      >
        <div className="ov:shrink-0 ov:flex ov:items-center ov:gap-2 ov:px-4 ov:pt-3 ov:pb-2 ov:border-b ov:border-(--ov25-border-color)">
          <button
            type="button"
            id="ov25-snap2-checkout-sheet-back"
            onClick={handleCloseCheckout}
            className="ov:text-sm ov:font-medium ov:text-(--ov25-text-color) ov:underline ov:underline-offset-2 ov:hover:opacity-80"
          >
            Back to builder
          </button>
        </div>
        <div className="ov25-snap2-checkout-sheet-body ov:flex-1 ov:min-h-0 ov:min-w-0 ov:overflow-y-auto ov:overflow-x-hidden">
          <Snap2CheckoutSheetBody />
        </div>
        <Snap2CheckoutSheetFooter onRequestClose={handleCloseCheckout} />
      </div>

      {!isSnap2CheckoutSheetOpen && !hidePricing && hasCheckout ? (
        <div className="ov25-checkout-button-wrapper ov:shrink-0 ov:w-full ov:min-w-0 ov:max-w-full ov:md:border-t ov:border-(--ov25-border-color) ov:bg-(--ov25-background-color) ov:p-0 ov:md:px-4 ov:md:pb-2 ov:pt-2">
          <button
            type="button"
            id="ov25-snap2-panel-checkout-button"
            onClick={() => setIsSnap2CheckoutSheetOpen(true)}
            className={cn(checkoutCommerceCtaButtonClasses, 'ov:font-medium ov:w-full ov:min-w-0 ov:max-w-full')}
          >
            View Cart
          </button>
        </div>
      ) : null}
      </Snap2VariantSheetMainRootContext.Provider>
    </div>
  );
}
