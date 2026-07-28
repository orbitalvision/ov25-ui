# Resolved bugs

Concise archive of approved, committed, and otherwise closed bugs. Active review remains in [bugs-ready-for-review.md](bugs-ready-for-review.md); deferred work remains in [PARKED_BUGS.md](PARKED_BUGS.md).

Commit hashes below identify the primary implementation commit. Cross-repository fixes list each relevant repository.

Last reconciled against `ov25-ui` and OV25 branch ancestry: 2026-07-28. Local `ov25-ui/main` is at documentation commit `a9eb0f7`, immediately after approved Bug 39 commit `fad225f`.

## Committed / merged

- **Bug 1** - `efbc93b` (`ov25-ui`) - Variant names now use the configured theme text colour instead of hard-coded black.
- **Bugs 2/2a** - `a594844` (`ov25-ui`) - Added targetable name and price shadow-host container IDs while preserving the existing internal IDs.
- **Bug 3** - `bb56186` (`ov25-ui`) - Inline variant selections always switch the gallery back to the 360 viewer.
- **Bug 4** - `90c5f4c` (`ov25-ui`) - Added a movement threshold so small pointer movement no longer prevents carousel thumbnail clicks.
- **Bug 5** - `486b3a1` (`ov25-ui`) - Setup colour inputs reliably accept pasted hex values.
- **Bug 6** - `c8b444e` (`ov25-ui`) - Removed the duplicate Snap2 controls instance.
- **Bug 7** - `9a82c1a` (`ov25-ui`) - Variant thumbnail wrappers use an exact 4px padding.
- **Bug 7a** - `4e20397` (`ov25-ui`) - Added stable CSS selectors for size cards, their grid, names, and dimensions.
- **Bug 7b** - `76f4031` (`ov25-ui`) - Prevented sheet opening from collapsing the gallery slot or shifting the page when scroll locking.
- **Bug 9** - `93059f5f` (`OV25`) - Fixed the Shopify post-login return flow and added a manual redirect fallback.
- **Bug 10** - `b14e4160` (`OV25`) - Corrected oversized Snap2 plan-view dimension labels.
- **Bug 11** - `06321d5` (`ov25-ui`) - Snap2 initialise cards keep both names and tooltips in the DOM with responsive default visibility.
- **Bug 14** - `4220f42` (`ov25-ui`) - Separated Snap2 view controls so the mobile drawer close button remains accessible.
- **Bug 17** - `a08acd3` (`ov25-ui`) - Added the supported `disableBuyNow` option without affecting Add to Basket.
- **Bug 18** - `f45914f` (`ov25-ui`) - Normal variant thumbnails default to square while explicit radius overrides remain supported.
- **Bug 19** - `bf9e635` (`ov25-ui`) - Fixed the mobile SwatchBook grid and made empty swatches match filled swatch size and shape.
- **Bug 22** - `0bcfc73` (`ov25-ui`) - Horizontal gallery wheel input scrolls the carousel before the page.
- **Bug 23** - `eaa808d` (`ov25-ui`) - Standardised body-level z-index layers so toasts remain above Snap2/share dialogs while preserving modal, drawer, popover, checkout, and transition ordering.
- **Bug 24** - `06eb331` (`ov25-ui`) - Setup now preserves and exports the Snap2 selectors and module/variant positions required by runtime.
- **Bug 25** - `43acd5f` (`ov25-ui`) - Setup hydrates saved `:host` colour variables while retaining legacy `:root` support.
- **Bug 26** - `d262314` (`ov25-ui`) - Fixed Snap2 mobile modal/drawer rendering, checkout scrolling, sizing, and joined-panel corner treatment.
- **Bug 29** - `b8038ed`, corrected by `b934bc4` (`ov25-ui`) - Jagged geometry is limited to SwatchBook swatches; normal variants continue to honour Variant Shape.
- **Bug 32** - `459fac3` (`ov25-ui`) - Added the approved setup-side data-selector/style-variable catalog entries.
- **Bug 37** - `ca27d58` (`ov25-ui`) - Setup drafts survive tab leave/remount and remain scoped to the incoming saved configuration.
- **Bug 38** - `1c784b5` (`ov25-ui`) - Carousel thumbnails expose their selection state through `data-selected`.
- **Bug 39** - `fad225f` (`ov25-ui`) - Added the approved normal-product `inline-sticky` mode with header auto-detection/override, natural responsive viewer sizing, page-scroll variant headers, viewport-specific carousel relocation, and reversible native, Popover, and body-layer strategies. The `ov25-ui` core is complete; uncommitted OV25, Shopify, and WooCommerce integration remains a separate release follow-up.
- **Bug 40** - `bd5ebbd9` (`OV25`, merged into current `main`) - Saved Snap2 configurations can load `.zcpb` model assets through the shared loader.
- **Bug 44** - `6731b81b` (`OV25`) - Embedded Snap2 validation toasts are offset below the Snap2 controls.
- **Bug 46** - `73ac99b` (`ov25-ui`) - Public product-image types accept the image tiers already supported by runtime.
- **Bug 47** - `b748b6e` (`ov25-ui`) and `c41770ae` (`OV25`) - Added the setup/runtime option to hide the initial 3D drag indicator.

## Committed / awaiting merge

- **Bug 27** - `3541b736` (`OV25`, branch `snap2-draggable-objects-bounds`) - Clamps movable Snap2 objects to valid drag bounds; approved and committed but not present on `OV25/main`.

## Resolved without a new fix

- **Bug 16** - existing `3d0ceb5` (`ov25-ui`) - The fullscreen gallery already stacks above configurator controls; the original fixture was not a valid reproduction.
- **Bug 20** - existing `b9cf4049` (`OV25`) - Current bed pricing/product-breakdown behavior already avoids the reported checkout currency-symbol issue.
- **Bug 21** - no commit - Closed as wont-fix because inline variants are unavailable until configurator state arrives, so the proposed pre-readiness click path was not reproducible.
- **Bug 30** - no commit - Snap2 overlapping-footstool replacement crash was not reproducible on the clean baseline; the proposed patch was discarded.
- **Bug 31** - no commit - Saved Snap2 attachment-point restoration issue was not reproducible after the separate Bug 40 loader fix; the proposed patch was discarded.
- **Safari thumbnail offset** - no commit - Not reproducible on the clean baseline in Safari; the proposed change was discarded.

## Other completed work

- **No-thumbnail reproduction fixture** - `4600b46` (`ov25-ui`) - Added the approved product-with-no-variant-thumbnails fixture; production fallback behavior remains separate parked work.
- **Shopify embedded store mismatch** - `a96cd0e1` (`OV25`) - Added a logout action when the active OV25 session belongs to a different Shopify store.
