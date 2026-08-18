# Changelog

## 0.8.5

- Prevent selection-details sheets from causing a one-frame merchant page reflow or sticky-element flicker.
- Show retailer-defined Swatch Fields, plus material Range and Supplier, in selection details and the SwatchBook.
- Keep tooltip metadata available for merchant CSS while hidden by default.
- Add basic Snap2 scenario coverage.

## 0.8.4

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

## 0.8.3

# OV25 UI 0.8.3

Status: **Approved — full release suite and isolated React 18 build passed**

Release type: **Patch**

Review range: completed `0.8.2` package train at `ov25-setup@0.8.2`
(`e9da768e85ae`) to `45fa5b5f9241`.

## Customer-Facing Changes

### Feature

- None. This is a focused storefront reliability patch.

### Improvement

- Selection Details sheets can now be dismissed by clicking outside the sheet. The current option
  remains unchanged unless the customer explicitly applies it.
- Unified the desktop variants-sheet and Selection Details page locks so overlapping instances
  share one snapshot and restore the page only after the final acquisition releases.

### Bug

- Fixed the storefront page, configurator, and surrounding content shifting when a Selection
  Details sheet opens while the customer is scrolled down the page.
- Fixed scrollbar removal changing the usable page width and causing responsive storefront content
  to reflow during sheet open and close.
- Fixed Buy Now controls, swatch controls, and other below-the-fold page content disappearing
  while the Selection Details sheet was open on percentage-height or overflow-constrained themes.

## Compatibility

- No public TypeScript export, configurator option, callback, commerce payload, or saved Setup
  configuration changed in this patch.
- Existing Selection Details display-mode settings continue to work without migration.
- The existing `.ov25-selection-details-backdrop` styling hook is now present for `sheet` as well as
  `modal`. Integrations with modal-only backdrop rules should qualify them with
  `[data-display-mode="modal"]`.
- `ov25-setup@0.8.3` is a coordination-only release with no Setup source changes. Its version,
  exact `ov25-ui` dependency, and locks will advance so all three packages remain aligned.

## Validation Status And Known Limitations

- Focused implementation checks passed: type-check, all 15 Selection Details browser/component
  tests, and three headed Chromium regressions covering page geometry, below-fold content, nested
  Swatch Book locking, and the existing desktop sheet lock.
- The reported client storefront scenario was manually retested and approved after the fix.
- The complete [`0.8.3` release suite](test-summary.md) passed at committed HEAD `45fa5b5`, including
  type-check, unit, browser/component, React 19 package build, frozen Setup install/build,
  react-test build, preview readiness, and Playwright E2E.
- Playwright discovered 70 tests: all 68 active tests passed and the two existing bed-specific cases
  remained intentionally skipped as an approved coverage exception.
- Nine visual baselines were regenerated after the approved CDN thumbnail regeneration, committed,
  and then passed in the complete release suite.
- The release owner confirmed that the isolated React 18 publish build passed at final HEAD.
- Merchant scripts that rewrite the same `html` or `body` inline layout properties while an OV25
  sheet is open should be exercised in staging because unlock restores the acquisition snapshot.
- The release owner approved the documented backdrop-selector and merchant-inline-style integration
  risks with `APPROVE ov25-ui@0.8.3`.

## Manual Testing Notes

- Retest the original Shopify client page while scrolled to Buy Now, swatches, and content below the
  configurator. Confirm no horizontal or vertical movement when the sheet opens or closes.
- Test themes with reserved and overlay scrollbars, `body { overflow-x: hidden }`, percentage-height
  roots, non-default body margins, and fixed or sticky merchant widgets.
- Verify that clicking inside a sheet does not dismiss it, clicking outside does dismiss it without
  applying a selection, and the close button, Escape, Apply, and focus return still work.
- Open Swatch Book from Selection Details and verify the page remains locked until the final nested
  overlay closes.
- Rebuild and stage the exact Shopify React 18 extension before promoting it to the client site.

## Developer And Integrator Notes

- A shared, internal, reference-counted page-scroll lock now serves both the desktop variants sheet
  and modal-style Selection Details surfaces.
- The lock snapshots scroll position and relevant inline declarations, freezes the measured body
  geometry before paint, locks the document root, and restores the original declarations and scroll
  position after the final lock holder releases it.
- Both body overflow axes remain visible while the body is fixed. Root overflow owns the viewport
  lock, preventing percentage-height bodies and merchant `overflow-x` rules from clipping content.
- Sheet mode uses a transparent pointer-active backdrop with `data-display-mode="sheet"`; modal mode
  retains its dark backdrop.

No version bump, release commit, tag, package publication, or downstream deployment was performed
while generating these notes.

## 0.8.2

# OV25 UI 0.8.2

Status: **Ready for final artifact review — package pre-tag technical gates passed**

Release type: **Patch**

Review range: `ov25-ui@0.8.1` (`71dde5c7af3f`) to `dcb55e5e7ff5`.

## Customer-Facing Changes

### Feature

- Added responsive Selection Details views so customers can inspect an option's image, description,
  and swatch actions before applying it to the model.
- Added configurable tooltip, sheet, modal, and fullscreen presentations for Selection Details,
  with mobile-safe modal and fullscreen choices.
- Added Selection Details controls, styling hooks, and configurable labels to Configurator Setup,
  including replaceable title and description copy.
- Redesigned Configurator Setup into a unified Product Type, Settings, Style, and optional Global
  integration experience. Shopify and WooCommerce hosts can present platform-owned storefront
  settings alongside the shared editor.

### Improvement

- Improved Swatch Book handling for missing imagery, same-name swatches from different groups, and
  stacking with Selection Details and notifications.
- Expanded stable styling hooks for default and module variant cards, loading states, Selection
  Details surfaces, and Snap2 desktop/mobile view controls.
- Expanded the string-replacement catalog so Selection Details titles and descriptions can use the
  same templates and trigger rules as other configurable copy.
- Improved release safety with a two-phase coordinated package flow that regenerates and verifies
  Setup's npm and Bun locks against the published `ov25-ui` version.

### Bug

- Fixed carousel thumbnails selecting the wrong image when storefront images are combined with OV25
  cutout and gallery images, including deferred 3D loading.
- Fixed Inline (sticky) iframe sizing on tablet/Safari-style layouts and mobile controls being taken
  out of page flow by storefront styles.
- Fixed pinned option headers overlapping filter controls in long Inline (sticky) variant lists.
- Reduced storefront page movement and scrollbar-gap changes when configurator sheets open or close.
- Fixed missing Swatch Book images so the fallback remains visible with the swatch name and
  description.
- Fixed Selection Details titles and descriptions bypassing configured string replacements.
- Fixed the Snap2 mobile camera/view selector wrapper not receiving custom styling applied to the
  corresponding desktop control.
- Fixed Selection Details tooltips reopening after apply, staying attached to replaced cards, or
  failing to reopen after genuine pointer re-entry.
- Fixed focus not returning to the originating card after sheet, modal, or fullscreen Selection
  Details closed.
- Fixed React 18 and React 19 overlay isolation so Selection Details and gallery placeholders
  preserve the `inert` HTML attribute without JSX errors or rendering warnings.
- Exposed the existing `variants-only-sheet` display mode in the public TypeScript configuration.

## Compatibility And Defaults

- Existing runtime configurations that omit Selection Details continue to apply variants directly.
- Existing saved Configurator Setup payloads without Selection Details remain disabled after
  hydration. Brand-new Setup configurations default to tooltip on desktop and fullscreen on mobile;
  this new-configuration default has been reviewed and approved for `0.8.2`.
- Existing SKU, price, `onChange`, Add to Basket, and Buy Now payloads are unchanged.
- The release owner accepted the documented patch-release source-compatibility risks for the
  exported `Swatch` shape, required Selection Details fields in Setup's `TypeSettings`, and the
  widened `variants-only-sheet` union.

## Validation Status And Known Limitations

- The full release suite passed type-check, unit, browser/component, React 19 package build, frozen
  Setup install/build, react-test build, preview readiness, and every active Playwright test.
- Playwright completed 69 tests: 67 passed, 0 failed, 0 flaky, and 2 intentionally skipped. The bed
  shared-detail and selection-only fallback cases are an accepted coverage exception.
- The runbook's isolated React 18 publish build was reported as passing after the final runtime
  fixes. Later commits affect release tooling, documentation, and review artifacts only.
- The coordinated deploy flow now refreshes and stages `setup/package.json`,
  `setup/package-lock.json`, and `setup/bun.lock`, then verifies a frozen Setup install/build before
  the Setup commit and tag.
- Selection Details emits optional preload messages, but the compatible OV25 iframe receiver is not
  yet on the normal rollout path. Applying a selection still uses the existing behavior; validate
  the preload performance benefit separately.
- Public documentation for Selection Details and the host-provided Global Setup panel is not yet
  available.

## Manual Testing Notes

- Keep the two skipped bed Selection Details paths in the rollout checklist despite the accepted
  automated-coverage exception.
- Exercise every enabled Selection Details mode with mouse, touch, keyboard, Escape, focus return,
  page scroll locking, long text, missing images, and Swatch Book actions.
- Verify replaceable Selection Details title/description copy and custom CSS for module-card loading
  states plus desktop/mobile Snap2 view controls.
- Test mixed storefront/OV25 carousel images with deferred 3D both enabled and disabled.
- Test Inline (sticky) on Safari/tablet and mobile themes, including fixed/absolute storefront
  wrappers, long variant lists, filters, full-screen transitions, and external carousel targets.
- Test sheet open/close behavior in browsers with overlay scrollbars and reserved scrollbar gutters.
- Rebuild and stage the Shopify React 18 extension before live promotion. Validate standard, bed,
  Snap2, swatch, cart, and responsive paths.
- Validate WooCommerce Global/product Setup persistence, legacy selectors, native and AJAX cart,
  swatch ordering, and the generated plugin ZIP.

## Developer And Integrator Notes

- New grouped config path:
  `configurator.variants.selectionDetails.displayMode.{desktop,mobile}`.
- `SelectionDetailsDisplayMode` and the related configuration types are exported by `ov25-ui`.
- Desktop modes are `none`, `tooltip`, `sheet`, `modal`, and `fullscreen`. Mobile supports `none`,
  `modal`, and `fullscreen`; mobile tooltip or sheet input falls back to fullscreen.
- Selection Details can send `PRELOAD_SELECTION` and `CANCEL_PRELOAD_SELECTION` messages containing
  `requestId`, optional `productId`, `optionId`, `groupId`, and `selectionId`.
- New replacement keys are `selectionDetailsTitle` (`SELECTION_NAME`, `DESCRIPTION`) and
  `selectionDetailsDescription` (`SELECTION_NAME`, `DESCRIPTION`).
- Additive styling hooks include `data-ov25-module-variant-card-loading` and
  `data-ov25-snap2-view-control`.
- The exported `Swatch` type now models nullable backend data and a group-aware identity. Strict
  TypeScript consumers should retain the documented null checks and wider ID handling.
- `ov25-setup` adds `storefrontIntegration` to `ConfiguratorSetup` and exports the corresponding
  loading, error, ready, field, section, and value types.
- Setup's current manifest and Bun/npm locks align with its exact `ov25-ui@0.8.1` dependency. The
  two-phase deploy flow will regenerate all three files against `0.8.2` before tagging Setup.

No version bump, release tag, package publication, Shopify deploy, WooCommerce release, or OV25
deploy was performed while refreshing these notes.

## 0.8.1

# OV25 UI 0.8.1

Status: **Approved on 2026-08-06**

Release type: **Patch**

Review evidence: [context](context.md), [JSON context](context.json), [commits](commits.txt),
[changed files](changed-files.txt), [diff stat](diff-stat.txt), [committed diff](diff.patch), and
[release test summary](test-summary.md).

## Customer-Facing Changes

### Features

- No new features in this patch.

### Improvements

- No new customer-facing improvements in this patch.

### Bug Fixes

- Fixed Shopify themes with generic empty-element styling hiding the injected 3D product gallery.
  The viewer, product-media column, and variant controls now initialise correctly on affected
  product pages, including Inline (sticky) layouts.

## Known Issues

- No new known issues were identified for `0.8.1`. Existing `0.8.0` known issues remain unchanged
  and are not addressed by this patch.

## Manual Testing Notes

- Re-test an affected Shopify theme, including Dawn, and confirm the 3D gallery has non-zero
  dimensions and variant controls populate.
- Test Inline (sticky) on desktop and mobile, including scrolling through a long variant list.
- Smoke-test an ordinary non-sticky product layout and cart actions.

## Developer And Integrator Notes

- The gallery host now includes a hidden, inert light-DOM child so theme selectors such as
  `div:empty { display: none; }` no longer hide a gallery whose visible UI lives in a shadow root.
- No `injectConfigurator` option, setup payload, callback, commerce payload, existing selector,
  CSS variable, or saved configuration changed. No migration is required.
- The reviewed range also contains the React 18-compatible typing wrapper used by the carousel
  fullscreen Popover. It has no intended runtime behavior change and was already included in the
  published `ov25-ui-react18@0.8.0` package.
- Full `release:test` validation passed for `0.8.1`: type-check, unit tests, browser/component
  tests, both package builds, frozen setup install, react-test build, and Playwright E2E tests.
- Shopify requires an exact `ov25-ui-react18@0.8.1` dependency update, bundle rebuild, and staged
  extension release. WooCommerce and OV25 require exact package synchronization only; no adapter
  mapping changes are needed.

No version, tag, push, package publication, Shopify deploy, WooCommerce release, or OV25 deploy was
performed while refreshing these notes.

## 0.8.0

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
