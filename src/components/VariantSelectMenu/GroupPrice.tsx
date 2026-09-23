import React from 'react';
import { useOV25UI, type GroupPriceSummary } from '../../contexts/ov25-ui-context.js';

/** Present in the DOM when a reliable standard-product total exists; opt in through CSS. */
export function GroupPrice({ price, groupName }: { price?: GroupPriceSummary; groupName?: string }) {
  const { getString, currencySymbol, hidePricing, isSnap2Mode } = useOV25UI();
  if (hidePricing || isSnap2Mode || !price || !Number.isFinite(price.totalPrice) || price.totalPrice < 0) return null;
  const formatted = new Intl.NumberFormat('en-GB', { style: 'currency', currency: price.currency })
    .format(price.totalPrice / 100).replace('£', currencySymbol || '£');
  const label = price.isFrom
    ? getString('groupPriceFromTotal', { PRICE: formatted }, `From ${formatted} total`)
    : getString('groupPriceTotal', { PRICE: formatted }, `${formatted} total`);
  return (
    <span className="ov25-group-price" data-price-pence={price.totalPrice} data-price-from={price.isFrom ? 'true' : 'false'}>
      {groupName ? getString('groupPriceNamed', { GROUP_NAME: groupName, PRICE_LABEL: label }, `${groupName} · ${label}`) : label}
    </span>
  );
}
