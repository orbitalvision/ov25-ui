import React from 'react';
import { Sofa } from 'lucide-react';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { cn } from '../lib/utils.js';
import { CheckoutButton } from './VariantSelectMenu/CheckoutButton.js';
import type { CommerceLineItemPrice } from '../types/inject-config.js';

export function getSnap2CheckoutSheetDomId(uniqueId: string | undefined | null) {
  return uniqueId ? `ov25-snap2-checkout-sheet-${uniqueId}` : 'ov25-snap2-checkout-sheet';
}

function LineCard({ line, index }: { line: CommerceLineItemPrice; index: number }) {
  const slug = line.id ? line.id.replace(/[^a-zA-Z0-9_-]/g, '_') : `idx-${index}`;
  return (
    <div
      className="ov25-snap2-checkout-line ov:flex ov:flex-col ov:bg-white ov:p-4 ov:rounded-xl ov:shadow-md ov:gap-2 ov:pr-8 "
      data-line-id={line.id}
      id={`ov25-snap2-checkout-line-${slug}`}
    >
      <div className="ov25-snap2-checkout-line-main ov:flex ov:items-start ov:gap-3 ov:min-w-0">
        <div className="ov25-snap2-checkout-line-thumb ov:h-20 ov:w-20 ov:shrink-0 ov:flex ov:items-center ov:justify-center ov:bg-neutral-50 ov:rounded-lg">
          <Sofa className="ov:w-10 ov:h-10 ov:text-neutral-400" strokeWidth={1.5} />
        </div>
        <div className="ov25-snap2-checkout-line-copy ov:flex ov:flex-col ov:min-w-0 ov:flex-1 ov:gap-1">
          <span className="ov25-snap2-checkout-line-name ov:font-normal ov:text-base ov:text-neutral-800 ov:line-clamp-2">
            {line.name}
          </span>
          <div className="ov25-snap2-checkout-line-meta ov:flex ov:flex-wrap ov:items-center ov:gap-2 ov:text-xs ov:text-neutral-600">
            <span className="ov:text-sm ov:font-normal ov:text-neutral-900">{line.formattedSubtotal}</span>
            <span className="ov:text-sm ov:text-neutral-500">× {line.quantity}</span>
            {line.discountPercentage > 0 && (
              <span className="ov:text-xs ov:text-red-500">(-{line.discountPercentage}%)</span>
            )}
          </div>
          <div className="ov25-snap2-checkout-line-total ov:text-sm ov:font-normal ov:text-neutral-900">
            Total: {line.formattedPrice}
          </div>
        </div>
      </div>
      {line.selections.length > 0 && (
        <div className="ov25-snap2-checkout-line-selections ov:border-t ov:border-neutral-200 ov:pt-2 ov:mt-1">
          <ul className="ov25-snap2-checkout-line-selection-list ov:flex ov:flex-col ov:gap-1">
            {line.selections.map((sel, idx) => (
              <li
                key={`${sel.name}-${idx}`}
                className="ov25-snap2-checkout-line-selection ov:flex ov:items-center ov:gap-2 ov:text-sm ov:min-w-0"
              >
                {sel.thumbnail ? (
                  <img
                    src={sel.thumbnail}
                    alt=""
                    className="ov25-snap2-checkout-line-selection-thumb ov:w-6 ov:h-6 ov:rounded-full ov:object-cover ov:shrink-0"
                  />
                ) : null}
                <span className="ov:font-normal ov:text-neutral-800 ov:min-w-0 ov:truncate">{sel.name}</span>
                {sel.price > 0 && (
                  <span className="ov:text-neutral-600 ov:shrink-0">+ {sel.formattedPrice}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Scrollable header + line list for Snap2 checkout (modal sheet or mobile drawer body). */
export function Snap2CheckoutSheetBody() {
  const { commercePriceSnapshot } = useOV25UI();
  const lines = commercePriceSnapshot?.lines ?? [];

  return (
    <>
      <div className="ov25-snap2-checkout-sheet-header ov:flex ov:items-center ov:justify-stretch ov:gap-2 ov:pt-14 ov:pb-2 ov:px-8 ov:shrink-0 ov:min-w-0">
        <h2
          id="ov25-snap2-checkout-sheet-title"
          className="ov25-snap2-checkout-sheet-title ov:text-xl ov:font-normal ov:text-neutral-800 ov:min-w-0 ov:flex-1 ov:pr-10 ov:truncate"
        >
          Total items
        </h2>
      </div>
      <div className="ov25-snap2-checkout-sheet-divider ov:border-t ov:border-neutral-200 ov:mx-4 ov:shrink-0" />
      <div
        id="ov25-snap2-checkout-sheet-scroll"
        className="ov25-snap2-checkout-sheet-scroll ov:px-8 ov:pt-4 ov:pb-2 ov:min-w-0"
      >
        {lines.length === 0 ? (
          <p className="ov25-snap2-checkout-sheet-empty ov:text-sm ov:text-neutral-600">
            Pricing updates appear here when the configurator sends price data.
          </p>
        ) : (
          <div className="ov25-snap2-checkout-sheet-list ov:flex ov:flex-col ov:gap-4 ov:min-w-0">
            {lines.map((line, index) => (
              <LineCard key={line.id || `line-${index}`} line={line} index={index} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/** Pinned totals + commerce actions for Snap2 checkout sheet. */
export function Snap2CheckoutSheetFooter({ onRequestClose }: { onRequestClose: () => void }) {
  const { commercePriceSnapshot, formattedPrice } = useOV25UI();
  const totalLabel = commercePriceSnapshot?.formattedPrice ?? formattedPrice;

  return (
    <div
      id="ov25-snap2-checkout-sheet-footer"
      className={cn(
        'ov25-snap2-checkout-sheet-footer ov:min-w-0 ov:max-w-full ov:overflow-x-hidden ov:box-border',
        'ov:bg-white ov:px-8 ov:pt-3 ov:pb-[max(0.5rem,env(safe-area-inset-bottom))] ov:md:pb-[max(1rem,env(safe-area-inset-bottom))]',
        'ov:shadow-[0_-4px_24px_rgba(0,0,0,0.08)] ov:flex ov:flex-col ov:gap-3'
      )}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="ov25-snap2-checkout-sheet-totals ov:flex ov:items-center ov:justify-between ov:gap-2 ov:min-w-0">
        <div className="ov25-snap2-checkout-sheet-total-block ov:flex ov:flex-col ov:min-w-0 ov:max-w-full">
          <span className="ov25-snap2-checkout-sheet-total-label ov:text-sm ov:text-neutral-600">Total</span>
          <span
            id="ov25-snap2-checkout-sheet-total-value"
            className="ov25-snap2-checkout-sheet-total-value ov:text-2xl ov:font-normal ov:text-neutral-900 ov:truncate ov:block ov:max-w-full"
          >
            {totalLabel}
          </span>
        </div>
      </div>
      <CheckoutButton
        embedded
        onAfterAddToBasket={onRequestClose}
        onAfterBuyNow={onRequestClose}
      />
    </div>
  );
}
