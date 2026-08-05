# Resolved bugs

Concise archive of approved, committed, and otherwise closed bugs. Active review remains in [bugs-ready-for-review.md](bugs-ready-for-review.md); deferred work remains in [PARKED_BUGS.md](PARKED_BUGS.md).

Commit hashes below identify the primary implementation commit. Cross-repository fixes list each relevant repository.

Last reconciled against `ov25-ui` and OV25 branch ancestry: 2026-08-04. Local `ov25-ui` `main` and `origin/main` are at `50fd555`.

## Committed core with active follow-up

### 55. Standard inline-sticky setup preview layout

**Status:** Manually approved on 2026-08-04 and committed in `d7c2de7`; device-mode remounting followed in `50fd555`. A newly discovered short mobile gallery-boundary case is active in [bugs-ready-for-review.md](bugs-ready-for-review.md#55-follow-up-mobile-inline-sticky-leaves-the-setup-preview-viewport).

**Summary:** The local setup fixture did not opt into the local preview, so it loaded the hosted production preview and made `inline-sticky` appear as sheet mode. Once routed locally, OV25 needed a stretched two-column preview layout. OV25 also applies `overflow-x: hidden` to both HTML and body, leaving HTML as the actual page scroller while body becomes a non-scrolling overflow ancestor. The sticky controller's fallback kept the gallery pinned, but option and group headers remained descendants of that body and scrolled away. The preview route now uses `overflow-x: clip` on body so its computed vertical overflow remains visible, allowing all native sticky elements to use the HTML page scroller. The existing route-only overscroll override continues to preserve wheel/trackpad scrolling.

**Fixture:** [Local Configurator Setup fixture](http://localhost:3008/tests/configurator-setup.html)

**Manual verification completed:**

1. Rebuild `ov25-ui/setup`, run OV25 on port `3000`, and run the react-test suite on port `3008`.
2. Open the fixture, select **Standard**, and set desktop display mode to **Inline (sticky)** with list variants.
3. Confirm there is no **Configure** button and the configurator plus variants render inline immediately.
4. In browser DevTools, confirm the preview iframe URL starts with `http://app.localhost:3000/configurator-preview`, not `https://app.ov25.ai/configurator-preview`.
5. In the preview document console, verify `getComputedStyle(document.body).overflowX` is `clip`, `getComputedStyle(document.body).overflowY` is `visible`, and `document.scrollingElement === document.documentElement`.
6. Put the pointer over the variants column and use the mouse wheel or trackpad. Confirm the preview document scrolls without dragging its scrollbar.
7. Scroll well into the variant list or press **Page Down**. Verify the configurator and active option/group headers remain pinned while variants pass beneath them, then release at their normal section boundaries.
8. Put the pointer over the 3D viewer and confirm wheel input still controls camera zoom rather than scrolling the preview page.
9. Switch the preview to mobile, select mobile **Inline (sticky)**, and verify the viewer pins above the page-scrolling variants.
10. Smoke-test ordinary **Inline**, sheet, modal, and both Snap2 preview modes. Their existing presentation should remain unchanged.

**Implementation:** Setup preserves the existing production default: local OV25 is used only when `useLocalPreview={true}` is supplied, and the react-test fixture now supplies that opt-in. The OV25 preview page supplies a naturally stretched two-column layout and removes artificial variants/swatches height caps. In ov25-ui, HTML and the actual `document.scrollingElement` remain exempt from blocker classification, while body overflow propagated through a fully visible HTML root is also ignored. A non-scrolling body is classified only when HTML has non-visible overflow, as in OV25. A separate predicate still rejects body, HTML, and the actual scroller from every fallback-boundary path. While this preview route is mounted, one lifecycle effect owns `overflow-x: clip` and `overscroll-behavior-y: auto` on body. It records and exactly restores each previous inline value and priority, removing properties that were previously absent. Global layout and configurator camera-wheel handling are unchanged.

**Changed files:** [ConfiguratorSetup/index.tsx](../setup/src/components/ConfiguratorSetup/index.tsx), [PreviewArea/index.tsx](../setup/src/components/ConfiguratorSetup/PreviewArea/index.tsx), [configurator-setup fixture](../dev/react-test/tests/configurator-setup.jsx), [configurator-setup-preview-url.test.ts](../test/unit/configurator-setup-preview-url.test.ts), [sticky-layout-controller.ts](../src/lib/sticky-layout-controller.ts), [sticky-layout-controller.test.ts](../test/unit/sticky-layout-controller.test.ts), [sticky-layout-metrics.test.ts](../test/unit/sticky-layout-metrics.test.ts), [inline-sticky fixture](../dev/react-test/tests/inline-sticky-fixture.jsx), [inline-sticky E2E](../test/e2e/inline-sticky.test.ts), and [OV25 configurator-preview/page.tsx](</Users/orbital/Documents/CODE/ORBITAL VISION/OV25/app/(ov25-ui)/configurator-preview/page.tsx:16>).

**Scoped diff:** [bug-55-setup-inline-sticky-preview.diff](../review-diffs/bug-55-setup-inline-sticky-preview.diff)

**Verification:** The three focused Bug 55 suites pass (59/59): sticky controller, sticky metrics, and preview URL resolution. The ov25-ui and OV25 `bun run type-check` commands pass. Scoped whitespace checks are clean, and the combined review artifact reverse-checks against both current workspaces. Live nested-preview inspection confirmed body `overflow-x: clip`, body `overflow-y: visible`, and HTML as the page scroller; at `scrollY=2816`, the active option header pinned at `y=16`, the active group header at `y=62`, and the native-sticky gallery at `y=16`. The new Chromium E2E is discovered successfully but was not executed because the running test suite imports `dist` and this task explicitly did not rebuild ov25-ui.

**Screenshots:** [Before: gallery scrolled out of the preview](../review-screenshots/bug-55-inline-sticky-preview-before.png) and [After: option and active group headers pinned in the nested setup preview](../review-screenshots/bug-55-inline-sticky-preview-headers-after.png). Before the route override, `scrollY=2816` left the first sticky option header at `y=-2568`. Live after-fix inspection at the same scroll position measured the active option header at `y=16`, active group header at `y=62`, and native-sticky gallery at `y=16` with no open Popover or body-layer fallback.

**Residual risk:** Low-medium until the existing inline-sticky E2E is run against a rebuilt local package. The route override is isolated to OV25's preview page and restores pre-existing body inline style state on unmount. There is no lightweight existing route-effect test harness, so a future nested setup-preview browser regression should assert body `clip/visible`, HTML scrolling ownership, and pinned option/group headers after Page Down.

**Approval:** The user completed the desktop/mobile sticky-preview checks and approved Bug 55 on 2026-08-04.

**Mobile boundary follow-up:** Manually approved on 2026-08-04. The controller now rejects a gallery boundary that ends before the variants host, retries failed stretch repairs when the variants height changes, and uses the bounded common-product fallback when needed. The focused sticky controller and metrics suites pass 55/55 and `bun run type-check` passes. `src/lib/sticky-layout-controller.ts` and `test/unit/sticky-layout-controller.test.ts` are staged; tracker and review files remain unstaged.

## Approved / staged (awaiting commit)

### 56. Configurator preview duplicates the real carousel with fake thumbnails

**Status:** Manually approved and staged in OV25 on 2026-08-04.

**Summary:** The desktop setup preview rendered a decorative four-item `.preview-thumbnails` strip as well as the real OV25 carousel. The obsolete JSX and its dedicated CSS were removed; carousel injection, targeting, and Inline Sticky layout are unchanged.

**Verification:** File-scoped ESLint and `git diff --check` pass. Live DOM inspection found no `.preview-thumbnails` elements, and manual review confirmed the real carousel remains correct.

**Changed file:** [OV25 configurator preview page](</Users/orbital/Documents/CODE/ORBITAL VISION/OV25/app/(ov25-ui)/configurator-preview/page.tsx>).

**Scoped diff:** [bug-56-configurator-preview-remove-fake-thumbnails.diff](../review-diffs/bug-56-configurator-preview-remove-fake-thumbnails.diff)

### 57. Release-test stabilization and Inline Sticky initialization recovery

**Status:** Manually approved on 2026-08-05. The implementation, fixture, Playwright configuration,
tests, and refreshed snapshots are staged and awaiting commit.

**Summary:** Inline Sticky now recovers from a transient Popover fallback once final variant layout
makes native sticky valid, retains body-layer fallback when reparenting hides the original ancestor
chain, preserves permanent blocker diagnostics, and keeps replacement-target inline host-box styles
only in `inline-sticky`. Playwright now runs headlessly without opening the HTML report; stale and
racy assertions were stabilized, the checkout baseline was refreshed for headless scrollbar
geometry, and the real 3D visual runs in a dedicated SwiftShader worker with a valid 704x704 model
snapshot.

**Verification:** Final `npm run release:test -- --release 0.8.0` passed 226 unit tests, 4
browser/component tests, all type checks and builds, the frozen setup install, and 33 Playwright
tests headlessly.

## Committed / merged

### 53. Snap2 UUID desktop close confirmation layering

**Status:** Manually approved and committed as `4dc3c24` on 2026-08-04.

**Summary:** The desktop UUID fixture requests Snap2 `sheet`, but desktop Snap2 renders that path with `Snap2ConfiguratorModal`. Because injection previously created the lower modal portal only for an explicit `modal` request, the Snap2 shell and save-confirmation host both mounted directly under `body` at z-index `2147483646`; the later shell covered the confirmation.

**Fixture:** [Snap2 with Configuration UUID](http://localhost:3008/tests/snap2-uuid.html)

**Manual verification completed:**

1. Rebuild using the normal local workflow, then open the fixture at desktop width.
2. Wait for the saved configuration to load and open the Snap2 configurator if it is not already open.
3. Press the top-right close button.
4. Confirm **Save Your Configuration** is visibly above the Snap2 dialog and its **Yes**, **No**, and close controls can be clicked.
5. Press **No** and verify the confirmation and Snap2 dialog both close.
6. Regress [Snap2 dialog](http://localhost:3008/tests/snap2-dialog.html) on desktop, the UUID fixture at mobile width, and [Snap2 inline](http://localhost:3008/tests/snap2-inline.html). Their existing modal, drawer, and inline behavior should remain unchanged.

**Implementation:** Injection now creates the lower modal portal whenever the desktop Snap2 component can render its modal shell: every desktop Snap2 mode except `inline-sheet`. Standard products retain the previous explicit desktop/mobile `modal` rule. This contains the Snap2 shell below the shared body-level save-dialog layer instead of raising generic dialog z-indexes.

**Changed and committed files:** [configurator-utils.ts](../src/utils/configurator-utils.ts), [inject.tsx](../src/utils/inject.tsx), and [modal-portal.test.ts](../test/unit/modal-portal.test.ts).

**Scoped diff:** [bug-53-snap2-uuid-confirmation-layer.diff](../review-diffs/bug-53-snap2-uuid-confirmation-layer.diff)

**Automated verification:** 14/14 focused tests pass in the main workspace; the worker also ran all 213 unit tests successfully. `bun run type-check` and `git diff --check` pass. Independent re-review found no issues.

**Screenshots:** Not generated. The bug is an interaction/stacking state, and the automated browser session did not receive the saved Snap2 object state required to trigger the confirmation. Live DOM inspection still confirmed the pre-fix tie: the save-dialog host preceded `#ov25-snap2-modal-shell` under `body`, both at z-index `2147483646`.

**Residual risk:** Low-medium. This adds an otherwise inert modal portal to desktop Snap2 `inline` because the modal component is mounted and can be externally opened there; `inline-sheet` remains excluded. Manual browser verification completed successfully.

**Approval:** The user completed the desktop close-confirmation flow and approved Bug 53 on 2026-08-04. The approved implementation and tests were committed as `4dc3c24`.

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
- **Bug 12** - `4d038ec` (`ov25-ui`) - Standard desktop auto-open and external Configure triggers use the product-aware sheet route while Snap2 retains its existing route.
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
- **Bug 49** - `89d4d98` (`ov25-ui`) - Normal desktop sheets and mobile drawers retain full viewer controls over a previously selected static gallery image; mobile drawers also retain one top-right close button.
- **Bug 50** - `0df85c3` plus the approved/staged pre-release correction (`ov25-ui`) - Missing material-selection and Swatch Book thumbnails use a package-owned woven placeholder, while size cards omit missing images, product carousels retain inert neutral slots, module cards retain their targetable “No Image” text state, and parent selection data preserves raw image values.
- **Feature 51** - `429b4f9` (`ov25-ui`) - Configurator iframes expose product/range-aware accessible titles for standard products, normal ranges, and Snap2.
- **Bug 52** - `b5e26a7` (`ov25-ui`) - Normal-product mobile modals render one visible close button in the lifted gallery layer while desktop modals retain the shell-owned control.

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
