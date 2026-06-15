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
