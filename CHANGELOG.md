# Changelog

## 0.7.3

# ov25-ui 0.7.3

## Customer-Facing Changes

### Bug Fixes

- Fixed the **full-page dining configurator** getting stuck on the loading screen (pulsing logo) and never revealing the configurator. The full-page shell was keeping its content — including the 3D iframe — hidden until it was "ready", but readiness depended on data the hidden iframe could never send. The content now stays mounted so the iframe initialises normally, while the loading overlay still covers it until everything is ready.
- Fixed Snap2 view controls overlapping the Snap2 close button on mobile.
- Fixed variant thumbnail border rendering (consistent 4px border; addresses a Safari issue).

### Improvements

- The configurator now reliably switches back to the 3D view whenever any selection is made.

## Developer And Integrator Notes

- Refactored `ConfiguratorViewControls` so it no longer conditionally renders `Snap2Controls`; Snap2 view controls now live in a dedicated `Snap2ViewControls` component.
- Internal release tooling: the deploy script now triggers the downstream OV25 dependency-update workflow after a successful push.

## Shopify Notes

- This release touches DOM/CSS-sensitive UI (dining full-page shell, Snap2 controls). Shopify clients with custom theme CSS or `cssString` selectors should re-test their configurator pages.

## WooCommerce Notes

- No WooCommerce-specific changes in this release. Bump the `ov25-ui` / `ov25-ui-react18` dependency to `0.7.3` once published.

## 0.7.2

# Patch Notes Draft: ov25-ui 0.7.2

Status: Draft, not approved
Bump requested: patch
Base: `3942d5f711317d941e7291da8c0afc5b9e224fc5`
Head: `1fc5ba6e656d7558be09e18924f6fe252192b516`

These notes were refreshed after release test artifacts were generated. The selected range still includes the `0.7.0` and `0.7.1` version commits plus the new release automation commit, so confirm this is the intended `0.7.2` scope before publishing.

## Customer-Facing Changes

### Features

- Added configurable text labels across the OV25 configurator. See [String Replacements](/docs/developer/ui-package-integration#string-replacements).
- Added setup controls for custom configurator text. See [Text Overrides](/docs/developer/ecommerce-configurator-setup#text-overrides).
- Added support for a new dining configurator experience.
- Added Shopify and WooCommerce product-link support for bed and dining configurator products where enabled. See [Build a Plugin](/docs/developer/build-a-plugin).

### Improvements

- Improved mobile Snap2 and configurator controls.
- Improved mouse interaction with the product image carousel.
- Improved carousel image presentation by removing the dark background behind product images.
- Improved variant name styling so it follows the configured OV25 theme color.
- Added more stable styling hooks for product name and price areas.
- Simplified dining option headers when there is only one group.
- Improved color entry in setup so hex values can be pasted with or without a leading `#`.

### Bug Fixes

- Fixed duplicate Snap2 controls appearing in the page.
- Fixed module detail sheets appearing underneath other UI on mobile.
- Fixed setup/string-replacement test handling when no replacement rules are supplied.

## Developer And Integrator Notes

- `injectConfigurator` now accepts additive `stringReplacements` config.
- `injectConfigurator` now delegates to the dining configurator embed path when `productLink` starts with `dining-configurator/<id>`.
- New `injectDiningConfigurator` / `injectDining` exports are available for dining-specific embeds.
- New string replacement metadata and types are exported:
  - `STRING_REPLACEMENT_DEFINITIONS`
  - `useOv25String`
  - `StringReplacementsConfig`
  - related replacement rule/definition types
- New dining types are exported for callbacks, display options, selectors, branding, flags, and payloads.
- Configurator iframe URL handling now supports `OV25_CONFIGURATOR_DEV` / `VITE_OV25_CONFIGURATOR_DEV` in addition to the existing local dev flag.
- Release automation has been added for review/test/deploy phases, tag-triggered GitHub Actions publishing, and local publish refusal.

## Shopify Notes

- Shopify product admin support exists for product, range, Snap2, bed configurator, and dining configurator links.
- Shopify storefront code already passes `stringReplacements` through when present.
- Shopify plugin dependency still needs to be updated from `ov25-ui-react18@0.7.0` after final packages are published.
- Shopify clients should test custom theme CSS and `cssString` selectors because this release touches DOM/CSS-sensitive UI.

## WooCommerce Notes

- WooCommerce adapter support for bed configurators has been added and released through `ov25-woo-extension` `v1.1.1`.
- WooCommerce product admins can choose `bed-configurator/<id>` links from the product picker.
- WooCommerce frontend config now selects the saved `bedConfigurator` setup bucket for bed configurator product links.
- WooCommerce local types now include `stringReplacements`, `bed`, `hideLogo`, and `bedConfigurator` setup layout support.
- WooCommerce package versions still need to move from `^0.7.1` to final `0.7.2` packages after `ov25-ui`, `ov25-ui-react18`, and `ov25-setup` are published.

## Known Review Items

- Requested release type is `patch`, but the range contains large additive APIs, a new dining configurator flow, setup UI additions, and release automation. Confirm patch vs minor before publishing.
- `releases/0.7.2/test-summary.md` reports the user-run release test passed.
- GitHub publish workflows now set up Bun before package build/publish steps.
- Trusted Publishing still needs npm-side setup for all three packages before tags are pushed.

## 0.5.95

### Commerce payloads (minor, additive for runtime; TypeScript callback types updated)

- **`onChange`, `addToBasket`, `buyNow`** now receive **normalized** SKU and price objects:
  - **`payload.skus`**: discriminated union — `mode: 'single'` includes legacy `skuString` / `skuMap` plus `lines` (one row); `mode: 'multi'` (Snap2) has **`lines` only** (no top-level `skuString`).
  - **`payload.price`**: includes `mode`, order-level totals, **`lines`** (per-product breakdown), and optional passthrough of raw **`priceBreakdown`** (single) or **`productBreakdowns`** (Snap2).
- New exported types: `UnifiedSkuPayload`, `UnifiedPricePayload`, `UnifiedOnChangePayload`, `CommerceLineItemSku`, `CommerceLineItemPrice`, `CommerceLineItemSelection`.
- New helpers for raw `postMessage` users: `normalizeSkuPayload`, `normalizePricePayload`, `parseIframeJsonPayload`.
- **TypeScript**: `OnChangeSkuPayload` / `OnChangePricePayload` are aliases of the unified types; narrow with `payload.skus.mode === 'single'` when you require `skuString` on SKU.

Integrators should prefer **`payload.skus.lines`** and **`payload.price.lines`** for new multi-line cart logic.
