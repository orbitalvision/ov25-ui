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
