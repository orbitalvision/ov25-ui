# Standard-product group upgrade prices

OV25 can send `priceSummary` on groups in `CONFIGURATOR_STATE`:

```ts
{ totalPrice: 150000, upgradePrice: 5000, currency: 'GBP', isFrom: false }
```

`totalPrice` is the resulting whole-product price in pence, with the shopper's other choices retained (or replaced by configuration rules), including current grade overrides, shared-grade charging, discounts and rounding. `upgradePrice` is the difference from the cheapest available group minimum **within the same option**, rounded to displayed pence. The current/default selection does not set the baseline. Every grouping mode uses this comparison, including Other. `isFrom` means available selections in that group produce different totals.

For example, Standard at £100 and Luxury at £150 produce “Standard” and “Luxury - +£50.00”. Tied cheapest groups show no price, including groups whose minimum matches the baseline but whose other selections cost more. Higher groups with varying totals show “From +£…”. The baseline updates with selections, availability, discounts and conditional pricing.

An unknown available group could be the cheapest. In that case OV25 omits `upgradePrice` for the entire option; the UI shows no amounts rather than guessing. Older producer payloads without `upgradePrice` also show no amount.

The runtime renders `.ov25-group-price` beside existing group headings or controls in list, tree and accordion layouts. Wizard and single-group layouts without headings retain named price elements. Prices update with configurator state. A zero or absent upgrade means no price element; an old summary is not retained. `hidePricing` and Snap2 suppress these elements.

They are visible by default. To hide them from layout and assistive technology, add this to the configurator's custom styling (inside its shadow root when applicable):

```css
.ov25-group-price {
  --ov25-group-price-display: none;
}
```

Use `data-price-pence` (upgrade), `data-total-price-pence` (full total), and `data-price-from` for styling or inspection. The text uses the existing currency-symbol setting and `groupPriceTotal`, `groupPriceFromTotal`, `groupPriceInline`, and `groupPriceNamed` string replacements.

Only standard products are supported. Bed and Snap2 pricing do not send summaries. OV25 omits groups with unresolved grade references, incomplete required selections, rule cycles, or scene-dependent visibility rules that cannot be safely previewed. Never interpret an absent summary as zero.

Deployment requires the matching OV25 producer and this UI build. Either side can ship first; older clients continue to display totals, while this UI requires the new upgrade field before displaying a price. Deploy this UI first if avoiding old total labels during rollout is important. This change does not publish a package. Once both sides are deployed, available group totals show by default.
