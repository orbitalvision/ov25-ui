import type { UnifiedPricePayload } from '../../types/inject-config.js';

/** Matches OV25 iframe `Intl` GBP output; used as default and as the substring replaced when overriding display. */
export const DEFAULT_CURRENCY_SYMBOL = '£';

function replacePoundWithSymbol(value: string, displaySymbol: string): string {
  if (!value.includes(DEFAULT_CURRENCY_SYMBOL)) return value;
  return value.split(DEFAULT_CURRENCY_SYMBOL).join(displaySymbol);
}

/**
 * Re-maps formatted price strings from the iframe (OV25 uses `en-GB` / GBP, typically `£`) to a host-chosen
 * display symbol. Numeric fields are unchanged; this is not currency conversion.
 */
export function applyDisplayCurrencySymbolToPricePayload(
  payload: UnifiedPricePayload,
  displaySymbol: string,
): UnifiedPricePayload {
  if (displaySymbol === DEFAULT_CURRENCY_SYMBOL) return payload;

  const discount = {
    ...payload.discount,
    formattedAmount: replacePoundWithSymbol(payload.discount.formattedAmount, displaySymbol),
  };

  const lines = payload.lines.map((line) => ({
    ...line,
    formattedPrice: replacePoundWithSymbol(line.formattedPrice, displaySymbol),
    formattedSubtotal: replacePoundWithSymbol(line.formattedSubtotal, displaySymbol),
    formattedDiscountAmount: replacePoundWithSymbol(line.formattedDiscountAmount, displaySymbol),
    selections: line.selections.map((sel) => ({
      ...sel,
      formattedPrice: replacePoundWithSymbol(sel.formattedPrice, displaySymbol),
    })),
  }));

  return {
    ...payload,
    formattedPrice: replacePoundWithSymbol(payload.formattedPrice, displaySymbol),
    formattedSubtotal: replacePoundWithSymbol(payload.formattedSubtotal, displaySymbol),
    discount,
    lines,
  };
}
