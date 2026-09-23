import React from 'react';
import { useOV25UI, type GroupPriceSummary } from '../../contexts/ov25-ui-context.js';

/** Shows the upgrade from the cheapest available group; cheapest groups have no price label. */
export function GroupPrice({ price, groupName }: { price?: GroupPriceSummary; groupName?: string }) {
  const { getString, currencySymbol, hidePricing, isSnap2Mode } = useOV25UI();
  if (hidePricing || isSnap2Mode || !price || typeof price.upgradePrice !== 'number' || !Number.isFinite(price.upgradePrice) || price.upgradePrice <= 0) return null;
  const formatted = '+' + new Intl.NumberFormat('en-GB', { style: 'currency', currency: price.currency })
    .format(price.upgradePrice / 100).replace('£', currencySymbol || '£');
  const label = price.isFrom
    ? getString('groupPriceFromTotal', { PRICE: formatted }, `From ${formatted}`)
    : getString('groupPriceTotal', { PRICE: formatted }, `${formatted}`);
  return (
    <span className="ov25-group-price" data-price-pence={price.upgradePrice} data-total-price-pence={price.totalPrice} data-price-from={price.isFrom ? 'true' : 'false'}>
      {groupName ? getString('groupPriceNamed', { GROUP_NAME: groupName, PRICE_LABEL: label }, `${groupName} - ${label}`)
        : getString('groupPriceInline', { PRICE_LABEL: label }, ` - ${label}`)}
    </span>
  );
}
