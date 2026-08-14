# Draft Client Email: OV25 UI 0.8.2

Status: **Internal draft only — do not send until platform staging is approved**

No version, tag, package publication, or deployment was performed while preparing this draft. The
package release's automated suite and isolated React 18 preflight have passed. Platform-specific
staging remains before live approval.

**To:** [Client / recipient names]

**Cc:** [Account / technical contacts]

**Subject:** Preview planned: OV25 configurator 0.8.2

Hi [Client name],

We are preparing OV25 configurator version `0.8.2`, focused on richer product-option information
and storefront reliability.

The first main feature is an optional Selection Details view. It can show a larger option image,
description, and Swatch Book action before the customer applies that option to the 3D model. Its
presentation, copy, and styling can be tailored for desktop and mobile, including tooltip,
side-sheet, modal, and fullscreen experiences.

The second main feature is a redesigned Configurator Setup experience. It brings Product Type,
Settings, Style, and optional platform-owned Global controls into a clearer shared editor.

This update also includes:

- richer custom styling targets for variant cards, Selection Details, and desktop/mobile view
  controls;
- improved product-image carousel behavior when storefront and OV25 images are combined;
- more reliable Inline (sticky) sizing and scrolling on tablet and mobile layouts;
- more reliable Selection Details tooltip and keyboard/focus behavior;
- reduced page movement when configurator sheets open and close; and
- improved missing-image and overlay behavior in the Swatch Book.

Existing saved configurations will continue to use their current direct-selection behavior unless
Selection Details is enabled. Existing SKU, price, Add to Basket, Buy Now, and configuration-change
payloads are unchanged, and no saved-data conversion is planned.

## Rollout And Compatibility

The package release has passed its type, unit, component, package-build, Setup, Playwright, and
isolated React 18 gates. Two bed-specific automated cases remain a documented coverage exception;
bed paths remain on the staging checklist. We will complete documentation and platform-specific
validation before live approval.

### Shopify

We will build a Shopify app/extension version using the exact `0.8.2` React 18 package and select
that version on a duplicate or staging theme. We will verify Selection Details, product imagery,
Inline (sticky), standard/bed/Snap2 products, Swatch Book actions, cart behavior, merchant overlays,
and responsive layouts before promoting the exact tested app version to live.

Rollback will be to reselect the previous approved Shopify app/extension version containing the
`0.8.1` runtime.

### WooCommerce

We will build a matching WooCommerce plugin with the exact `0.8.2` packages and test Global and
product settings, native and AJAX cart paths, swatches, merchant overlays, and responsive layouts
on staging before production rollout.

Rollback will be to reinstall the previous `0.8.1` plugin build. Existing configurator settings do
not require conversion.

Please send any product URLs, client themes, long option lists, or specific mobile devices that you
would like included in staging checks.

Regards,

[Sender name]

[Role / OV25 team]

[Support email / phone]
