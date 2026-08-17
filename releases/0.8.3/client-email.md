# Draft Client Email: OV25 UI 0.8.3

Status: **Internal draft only — do not send until package and client staging are approved**

No version, tag, package publication, or deployment was performed while preparing this draft. The
focused fix passed client reproduction testing, the complete package release suite, and the
isolated React 18 publish build. The coordinated package release has been approved for preparation.

**To:** [Client / recipient names]

**Cc:** [Account / technical contacts]

**Subject:** Preview planned: OV25 configurator 0.8.3 storefront stability update

Hi [Client name],

We are preparing OV25 configurator version `0.8.3`, a focused storefront stability update for the
Selection Details side sheet.

The update prevents the surrounding product page and configurator from shifting when the sheet is
opened after scrolling. It also keeps Buy Now controls, swatches, and other page content visible
while the background is locked, including on themes with custom scrollbar and page-overflow rules.

Customers will also be able to close the side sheet by clicking outside it. Doing so dismisses the
preview without applying a different product option.

No configurator data migration is required. Product-option settings, pricing, SKU handling, Add to
Basket, Buy Now, and existing integration callbacks are unchanged.

## Rollout

After the coordinated packages are published, we will rebuild the Shopify extension with the exact
`ov25-ui-react18@0.8.3` package and validate it on the client theme before promotion. Testing will
repeat the original scrolled-page scenario and cover desktop/mobile layouts, click-outside and
keyboard dismissal, Swatch Book layering, scrollbar behavior, and cart controls.

Rollback will be to reselect the previous approved Shopify app/extension version containing the
`0.8.2` runtime.

Regards,

[Sender name]

[Role / OV25 team]

[Support email / phone]
