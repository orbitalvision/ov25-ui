# Release Notes: ov25-ui@0.8.13

Status: Approved
Bump: patch
Release owner approved the notes on 2026-09-25 for source `426e387faaf1bc8d5266eca277aeababe2840439`. This file records that approval; publication has not occurred during this review.

## Customer-Facing Changes

### Features

- No new configuration options.

### Improvements

- Galleries using automatic cutouts now hide the separate 3D/360 thumbnail when a usable cutout is among the displayed images. This applies to horizontal and stacked thumbnails. Existing 3D-thumbnail behavior remains when cutouts are unavailable or excluded by the image limit.

### Bug Fixes

- Fixed sticky gallery positioning in storefront themes whose gallery wrappers previously prevented the sticky fallback from activating correctly.

## Validation And Known Issues

- The release test summary reports passing type checks, unit tests, browser/component tests, Playwright E2E tests, and UI, React 18, Setup, and fixture-app builds.
- The release owner confirmed storefront mobile sticky behavior was manually tested.
- No additional product defect was identified in this review. Custom themes that target the 360 thumbnail or rely on thumbnail child positions should account for its conditional absence.

## Developer And Integrator Notes

- Public configuration and commerce payloads are unchanged. Gallery selection indices and cutout-angle selection remain aligned when the 360 thumbnail is hidden.
- Shopify and WooCommerce need updated package dependencies and rebuilt integrations to receive these changes; no new metafield, admin-setting, or cart mapping is required by this diff.
- The coordinated release targets `ov25-ui`, `ov25-ui-react18`, and `ov25-setup` at 0.8.13. Platform rollouts remain separate.
- See [developer summary](developer-summary.md) for integration state, documentation follow-up, and the exact reviewed scope.
