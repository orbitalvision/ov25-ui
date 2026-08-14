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
