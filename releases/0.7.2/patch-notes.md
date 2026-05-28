# ov25-ui 0.7.2

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
