# OV25 UI 0.8.0

Status: **Approved on 2026-08-05**

Release type: **Minor**

Review evidence: [context](context.md), [JSON context](context.json), [commits](commits.txt), [changed files](changed-files.txt), [diff stat](diff-stat.txt), and [committed diff](diff.patch).

## Customer-Facing Changes

### Features

- Added **Inline (sticky)** to `ov25-setup` and support for `configurator.displayMode.desktop/mobile: 'inline-sticky'` in `injectConfigurator` for standard and bed products. The 3D viewer remains visible while customers scroll long variant lists, with responsive desktop and mobile layouts. See [OV25 Setup for Shopify and WooCommerce](/docs/developer/ecommerce-configurator-setup#inline-sticky).
- Added automatic storefront-header detection for Inline (sticky), plus an optional `selectors.header` override in `injectConfigurator` for themes that need an explicit header target. See [Configurator Styling](/docs/developer/configurator-styling#inline-sticky).
- Added independent desktop and mobile carousel relocation through `selectors.desktopCarousel` and `selectors.mobileCarousel` in `injectConfigurator`, allowing non-Snap2 carousels to be placed in integration-owned page regions. See the [Shopify](/docs/developer/shopify#html-query-selectors) and [WooCommerce](/docs/developer/wordpress#storefront-selectors) integration guides.
- Added a **Hide Buy Now** control to `ov25-setup` and the corresponding `flags.disableBuyNow` option to `injectConfigurator`. See [Behaviour Flags](/docs/developer/ecommerce-configurator-setup#behaviour-flags).
- Added a **Hide 3D Drag Indicator** control to `ov25-setup` and the corresponding `flags.hideGestureHint` option to `injectConfigurator`. See [Behaviour Flags](/docs/developer/ecommerce-configurator-setup#behaviour-flags).
- Added mobile accordion variant navigation to `ov25-setup` and support for `configurator.variants.displayMode.mobile: 'accordion'` in `injectConfigurator`. See [Configurator Layout](/docs/developer/ecommerce-configurator-setup#configurator-layout).
- Added Snap2 controls to `ov25-setup` for supported dialog, drawer, and inline layouts, with matching `injectConfigurator` support through `configurator.displayMode`, `configurator.variants.position`, and `configurator.modules.position`. See [Snap2 layouts](/docs/developer/ecommerce-configurator-setup#snap2-layouts).

### Improvements

- Added more styling options to the **Element Styles** editor in `ov25-setup`, including product and variant names, group headings, selected swatches, and Snap2 module and checkout text.
- Improved Snap2 mobile dialogs, drawers, checkout sheets, and responsive spacing.
- Improved the Swatch Book on mobile with larger samples, a consistent two-column layout, and matching filled and empty sample shapes.
- Improved horizontal product-carousel scrolling.
- Expanded CSS targeting with selected-state attributes and stable styling hooks for carousel items, size names, dimensions, dimension grids, Snap2 module names, and tooltips. See [Configurator Styling](/docs/developer/configurator-styling#5-class-names-and-data-attributes-for-targeting).
- Added descriptive iframe titles for standard products, product ranges, and Snap2 configurators to improve accessibility.
- Selecting any inline variant, including a size, now returns the gallery to the 360-degree view.

### Bug Fixes

- Fixed cases where `ov25-setup` did not correctly save or reload settings.
- Fixed the `ov25-setup` preview so Standard Inline (sticky) uses the real desktop and mobile layouts and keeps the gallery and variant headers sticky while scrolling.
- Removed the obsolete placeholder thumbnail strip from the setup preview so only the real OV25 carousel is shown.
- Fixed mobile Inline (sticky) galleries scrolling away early when a short gallery column ended before a longer variant list.
- Improved Inline (sticky) reliability while storefront layouts initialize asynchronously, and preserved client-authored inline gallery sizing styles when the gallery host is replaced.
- Fixed **Auto-open configurator** for standard desktop sheets; the sheet now opens automatically and can be closed and reopened using the Configure button.
- Fixed full 3D viewer controls disappearing from an open sheet or drawer when a static gallery image had previously been selected.
- Fixed close buttons being hidden behind the 3D viewer in normal-product mobile modals.
- Missing material-selection and Swatch Book thumbnails now use a bundled woven placeholder instead of requesting a placeholder asset from the storefront. Missing size images are omitted, missing product-gallery entries remain neutral, and missing Snap2 module images retain their existing text fallback.
- Opening a desktop sheet now reserves gallery space and compensates for the page scrollbar, reducing storefront layout movement.
- Snap2 mobile modal mode no longer mounts an unintended drawer behind the modal.
- Snap2 checkout content now uses the available modal or drawer height without overflowing the viewport.
- Snap2 save confirmation now appears above the desktop configurator when opening a saved configuration by UUID.
- Fixed parent-page toast notifications appearing behind Snap2 and share-dialog overlays.
- Empty Swatch Book slots now match the filled sample size and use a solid jagged outline.
- Snap2 movable objects are constrained to their configured floor bounds once the matching OV25 integration change is released.

## Known Issues

- Standard-product `Inline` layouts that combine a Configure button with hidden Variant Controls are not currently supported. Use visible inline variant controls or an overlay display mode such as Sheet or Modal.
- Snap2 custom colours do not yet apply consistently to every surface, including the grid, perspective, screenshot controls, and initialise-menu cards.
- Replacing a storefront product-name target for a Snap2 configurator can leave the host-page name blank because the Snap2 range name is not yet passed through consistently.
- Bed configurators filter headboard, base, and mattress selections to the current bed size only when the corresponding filtering options are explicitly enabled; existing configurations are not changed automatically.

## Behavior Changes Requiring Review

- The default variant-thumbnail shape changes from round to square. Sites that require round thumbnails must set **Variant Shape** explicitly or retain a custom `--ov25-variant-thumb-border-radius` value.
- Loading and re-saving older Snap2 setup data can normalize unsupported display modes to dialog and fill missing panel positions with the current right-side defaults.

Both behavior changes were manually reviewed during development, but existing client themes and saved Snap2 configurations still require staging checks before rollout.

## Manual Testing Notes

- Validate Inline (sticky) on staging with no header, fixed headers, collapsing headers, body-level fallback, desktop/mobile carousel targets, fullscreen, and responsive breakpoint changes.
- Re-test Standard Inline (sticky) in the setup preview on Mobile, including a long variant list whose gallery and controls occupy separate page rows.
- Include Safari and Firefox in manual Inline (sticky) testing. The passing automated Playwright suite is Chromium-focused and does not prove those browser paths passed.
- Re-test standard, bed, and Snap2 storefronts in Shopify and WooCommerce after their adapter changes and exact `0.8.0` dependency updates are committed.
- Re-test client themes that rely on the previous round thumbnail default or custom descendant selectors around gallery and variant controls.

## Developer And Integrator Notes

- The committed `ov25-ui` range is `ov25-ui@0.7.3..521ef22` and contains 59 commits across 136 files. The final commit updates internal documentation only; it does not change the customer-facing behavior or passing release-test result described here.
- Final core validation passed on 2026-08-05: type checking, 226 unit tests, 4 browser/component tests, all package and fixture builds, the frozen setup install, and 33 headless Chromium Playwright tests in roughly three minutes.
- The OV25 preview, Shopify Plugin Settings, metafield, canonical-default changes, and approved preview-thumbnail cleanup are staged on current `main`. They should be completed after the published `ov25-setup@0.8.0` package makes the new `ov25-setup/defaults` export available; the Snap2 drag-bounds commit still requires integration.
- Shopify and WooCommerce adapter source is committed locally. Their current package versions intentionally remain pre-`0.8.0` until the packages are published.
- OV25 package synchronization is automated but must be dispatched only after all `0.8.0` packages are published; use `release:deploy --push --skip-ov25-dispatch` or push manually for this release, then dispatch OV25 separately. Shopify package synchronization and bundle generation remain manual. WooCommerce has a workflow for exact package synchronization and plugin release after its committed adapter reaches remote `main`.
- Public setup, styling, Shopify, and WooCommerce documentation is committed locally at `1e23604` and will be pushed after the package releases are complete.

## Release Status

The release artifacts were **approved on 2026-08-05**. Their reviewed source context remains `521ef22`; artifact commit `c202f1f` follows that context and is present on both local and remote `main`. The working tree is clean and final core validation has passed. Package preparation and publication have not run. Shopify and WooCommerce adapter commits still need pushing first; after package publication, OV25 still needs exact dependency synchronization, its staged integration and preview cleanup committed, and the approved Snap2 drag-bounds branch integrated. Public documentation is committed locally and will be pushed after the releases.

No version, tag, push, package publication, or deploy action was performed while refreshing these notes.
