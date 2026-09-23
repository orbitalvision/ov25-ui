# Standard-product group totals

OV25 can send `priceSummary` on groups in `CONFIGURATOR_STATE`:

```ts
{ totalPrice: 150000, currency: 'GBP', isFrom: false }
```

`totalPrice` is the resulting whole-product price in pence, with the shopper's other choices retained (or replaced by configuration rules), including current grade overrides, shared-grade charging, discounts and rounding. It is not a surcharge or a comparison with the default selection. `isFrom` means available selections in that group produce different totals.

The runtime renders `.ov25-group-price` beside existing group headings or controls in list, tree and accordion layouts. Wizard and single-group layouts without headings retain named price elements. Prices update with configurator state. No summary means no price element; an old summary is not retained. `hidePricing` and Snap2 suppress these elements.

They are visible by default. To hide them from layout and assistive technology, add this to the configurator's custom styling (inside its shadow root when applicable):

```css
.ov25-group-price {
  --ov25-group-price-display: none;
}
```

Use `data-price-pence` and `data-price-from` for styling or inspection. The text uses the existing currency-symbol setting and `groupPriceTotal`, `groupPriceFromTotal`, and `groupPriceNamed` string replacements.

Only standard products are supported. Bed and Snap2 pricing do not send summaries. OV25 omits groups with unresolved grade references, incomplete required selections, rule cycles, or scene-dependent visibility rules that cannot be safely previewed. Never interpret an absent summary as zero.

Deployment requires the matching OV25 producer and this UI build. Either side can ship first; older clients ignore the additional field and older producers simply have no summaries. This change does not publish a package. Once both sides are deployed, available group totals show by default.
