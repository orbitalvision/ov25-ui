# OV25 UI 0.8.4

Status: **Approved — full release suite passed**

Release type: **Patch**

Review range: completed `0.8.3` package train at `ov25-ui@0.8.3`
(`391e9aa`) to `3d48de3`.

## Customer-Facing Changes

### Bug Fix

- Touch-only tablets now use the configured mobile Selection Details surface instead of an
  unusable desktop hover tooltip. Customers can open Selection Details with a tap while the
  configurator otherwise keeps its desktop/tablet layout.

## Compatibility

- No public TypeScript export, injector option, callback, commerce payload, selector, or saved
  Setup configuration changed.
- The Selection Details mode is chosen once when OV25 mounts. A mouse or trackpad connected later
  does not change the active mode.
- `data-mobile="true"` now applies to the Selection Details surface on touch-only tablets, so
  existing mobile-specific custom CSS intentionally applies there too.
- `ov25-setup@0.8.4` is a coordination-only release. Its exact `ov25-ui` dependency and lockfiles
  will advance with the package train; no Setup source behaviour changed.

## Validation

- Complete `release:test` validation passed at `3d48de3`: type-check, unit tests, browser/component
  tests, React 19 package build, frozen Setup install/build, react-test build, preview readiness,
  and Playwright E2E.
- Playwright discovered 70 tests: 68 active tests passed; two existing bed-specific cases remain
  intentionally skipped.
- The full suite was rerun after one transient inline-sticky fixture readiness failure; the rerun
  passed cleanly.

## Manual Testing

- On a touch-only portrait tablet, configure desktop Selection Details as `tooltip` and mobile
  Selection Details as `fullscreen` or `modal`; tapping a selection must open the mobile surface.
- On desktop and hover-capable tablets, confirm the configured desktop tooltip still opens on hover.
- Rebuild and stage the Shopify React 18 extension before promoting it to a storefront.
