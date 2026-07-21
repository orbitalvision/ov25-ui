# Bugs ready for review

This file is the active manual review queue for the upcoming release. When a bug fix is ready, Codex should add a review packet here with the fixture as a clickable markdown link, visual steps, changed files, implementation diff file, diff summary, verification run, residual risk, and approval instruction. Post-release exclusions are retained separately in [PARKED_BUGS.md](PARKED_BUGS.md).

For UI bugs, include before/after screenshots when practical. Generate them with Playwright against the relevant fixture, store them under `review-screenshots/`, and link the PNGs in that bug's review packet. If a UI bug is interaction-only or needs data/setup that cannot be reproduced locally, add a short note explaining why screenshots were not generated.

After manual approval, Codex should remove the item from this file and mark the source item fixed in `ov25_bugs_and_todo.md`, but should not stage either tracker file. Only implementation and test files for the approved bug should be staged.

Do not rebuild `ov25-ui` for manual review unless the user explicitly asks; the user handles local rebuilds.

Parked bugs must not be approved or staged from this queue. Move the entire packet back here from [PARKED_BUGS.md](PARKED_BUGS.md) and refresh its evidence before review resumes.

Before/after comparison server: a clean baseline worktree from `HEAD` is available at `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/ov25-ui-clean-baseline-3009` and is intended to run on [localhost:3009](http://127.0.0.1:3009/). Use port `3009` for before/current-HEAD behavior and port `3008` for the dirty/fixed working tree when comparing review packets. The `localhost:3008/tests/...` fixture paths referenced below were checked on 2026-06-08 and returned HTTP 200 on `3009`, so you can usually compare by replacing `http://localhost:3008` with `http://127.0.0.1:3009`.

Coding work should be assigned to worker subagents by default. If a reviewed bug needs follow-up changes, send it back to the same worker when that agent is still available; otherwise assign a new worker with the same bug context. The main thread coordinates, reviews, verifies, updates this queue, and stages only after approval.

Queue update 2026-07-21: collapsing-header sizing now separates the live sticky top from a lifecycle-stable sizing offset. The largest observed header bottom continues constraining available height, preventing the host and every iframe layer from growing as the header compacts/hides or the gallery exits its native boundary. The focused sticky suite passes 66/66 in both trees; Playwright discovery remains 21 tests. Build/runtime E2E await the user's rebuild.

Queue update 2026-07-21: `selectors.mobileCarousel` is retained as the public key but now means `Carousel target` for every non-Snap2 layout and viewport. The observer is authoritative within each configurator scope, covers shared ShadowRoots, filters OV25-owned host mutations, and reconciles removal of only that host. Legacy localStorage keeps the newly introduced target disabled while fresh defaults stay enabled. The ordinary Standard fixture uses sheet on desktop and drawer on mobile at `/tests/carousel-relocation.html`; Playwright discovery is 21 relevant cases, including 4 dedicated relocation cases. TypeScript and the focused 42/42 Vitest run pass in both trees. Build and runtime E2E remain gated on the user's rebuild.

Queue update 2026-07-20: the shared fixed-header fixture exposes `?fallback=body-layer` for the actual `Element.moveBefore()` relocation strategy. It combines a genuine external blocker with a pre-injection `showPopover()` failure scoped to the gallery host; a separate probe still opens/closes via native Chromium Popover. The body strategy now uses one absolute natural-top-to-boundary track with its direct host always native sticky, removing the scroll-event/rAF fixed-to-absolute switch that produced a stale reverse-scroll frame. Focused coverage checks exact track bounds, browser-owned trajectory, immediate same-task reverse geometry, header hit testing, full style restoration, identity, layout, duplicates, and cleanup. The relocation unit passes 14/14, TypeScript passes, and the combined current Playwright discovery lists 21 tests. Build, full E2E, and manual browser review remain gated on the user's rebuild.

Queue audit 2026-07-17: 1 active review section is listed below. Bug 39 is in active manual review / follow-up feedback; source and automated browser verification are complete, and its current screenshots plus consolidated/cross-repository diffs are available. Approval is paused until expected minor feedback is incorporated; review artifacts need refreshing only if that feedback causes source or visual changes. Bug 47 was manually approved, its exact 12-file `ov25-ui`/setup sender patch is staged, and the OV25 receiver is committed on `main` as `c41770ae`; its packet is archived in [bugs-resolved.md](bugs-resolved.md). Bug 13 was removed from this queue after browser/source review found its visible-button acceptance criterion invalid for pure inline mode; the required behavior decision is now in [bugs-questions-for-user.md](bugs-questions-for-user.md). Eleven former ready packets, Bugs 12, 15, 28, 33, 34, 35, 36, 41, 42, 43, and 45, moved to [PARKED_BUGS.md](PARKED_BUGS.md); Bug 15 was parked after manual inspection found invalid `srcset` width descriptors and its changes were removed from main pending redesign. Bug 23 has a compact parked entry there because its semantic inverse is complete and unstaged in main for this release, while original commit history remains unchanged. Approved/staged, committed/merged, committed/awaiting-merge, and resolved/not-reproducible packets, including Bugs 18, 19, 29 correction, 11, 16, 17, 30, 31, 32, 37, 40, 44, 46, and 47, are archived in [bugs-resolved.md](bugs-resolved.md). Bugs 18, 19, and 29 correction plus Bugs 17, 32, 37, 46, and 47 were approved and staged as isolated changes. Bug 44 was approved and committed to OV25 `main` as `6731b81b`. Bug 38 was approved and committed as `1c784b5` with only its selected-state hunks. The Safari selection thumbnail offset was marked not reproducible and removed; Bugs 9 and 10 plus the Shopify store-mismatch logout prompt were completed outside this thread; Bug 21 was marked wont-fix; Bugs 7a, 7b, 22, 24, 25, and 26 were approved/staged or committed; and the no-thumbnail repro fixture was approved/staged.

## Review priority

1. Bug 39 normal-product `inline-sticky`: rebuild, test all three stable pages plus the stacked iframe and actual body-layer paths, including constant collapsing-header viewer sizing, relocation cleanup, corner-mode transitions, alignment, spacing, carousel, and header offsets, then run the 21 E2E tests. Approval and staging are paused.

## Ready

### 39. Normal-product inline-sticky display mode

- Status: **STABLE COLLAPSING-HEADER SIZE + GENERIC CAROUSEL TARGET READY / AWAITING USER REBUILD**. All three stable header-scenario pages support real desktop/mobile viewport switching, the collapsing desktop viewer now retains one rendered size, and the ordinary carousel fixture covers non-sticky sheet/drawer relocation. Matching Bug 39 hunks are synchronized but not rebuilt or browser-verified, and the runtime remains unstaged, not approved, and not stage-ready.
- Repositories: dirty `ov25-ui` main plus `codex/inline-sticky`, dirty OV25 `main`, and the Shopify extension workspace.

Summary:

- Adds responsive `inline-sticky` for standard, non-Snap2 products. Desktop keeps the viewer and carousel below the active client header while page-scrolling long variants; mobile keeps the viewer below the header and can portal the carousel into a separate target above variants.
- Header measurement supports automatic detection or an explicit selector, including fixed and collapsing headers. Sticky top follows the live header bottom, while available gallery height uses the largest offset observed during the controller lifecycle so collapse/hide cannot enlarge the viewer. Missing mobile targets fall back to one embedded carousel.
- The setup label is `Carousel target`, while the public key remains `selectors.mobileCarousel`. Standard and Bed serialize it in every display-mode combination; Snap2 hides/omits it. Runtime target lookup is scoped per configurator and independent of sticky state, so desktop/mobile sheet, drawer, modal, inline, and inline-sticky paths share dynamic target appearance/replacement/removal and one embedded fallback.
- Existing normal `inline` behavior is unchanged, and Snap2 rejects/falls back from `inline-sticky`.
- Generic client parent height is deliberately not mutated. Eligible direct grid/row-flex gallery columns first receive a bounded, reversible `align-self: stretch !important` repair, retained only when it creates sufficient native sticky travel and no other blocker requires fallback. Ineligible, still-short, or blocked layouts use the reversible body-host fallback, with owned state restored on mode exit, responsive changes, overlays, or unmount.
- Actual body-layer fixture: `?fallback=body-layer` applies the existing external overflow/transform blocker and makes `showPopover()` fail only for `#ov25-sticky-gallery` before injection. A separate fixture element proves native Popover still opens/closes, while runtime selects `Element.moveBefore()` for the gallery; root data attributes make the state inspectable without a production test hook.
- July 20 mobile follow-up: the gallery host expands to the measured viewport width even inside a narrow client column. Mobile top/bottom sticky gaps resolve to `0`, so the viewer starts immediately below the detected header and uses the remaining viewport height.
- Viewer-corner follow-up: `stickyLayoutActive && isMobile` applies `rounded-none` to ProductGallery's background/outer iframe container and IframeContainer's true container/iframe. Desktop `inline-sticky`, ordinary mobile `inline`, and other non-sticky modes retain their configured radius. Responsive resize coverage requires configured -> square -> configured.
- Stacked iframe coverage: `?stackedGallery=1` gives the original gallery target `z-index: 1` before injection, which makes the existing stacked-gallery detector choose the portaled IframeContainer path. The target is then replaced, so the trigger does not alter final client layout; the test asserts `data-stacked="true"`, the true container is outside the outer placeholder, and every existing viewer layer is square.
- The controller publishes and restores `--ov25-sticky-gallery-bottom`; the mobile option header sticks at that live edge and group headers stack beneath its measured height. `ProductVariantsWrapper` registers the option header for desktop or mobile sticky lists.
- Desktop follow-up: variant thumbnails could paint through the gap between the client header and sticky option header. An opaque `::before` mask covers exactly `--ov25-sticky-resolved-top-gap` without moving the header. Its original before evidence remains historical rather than a current rebuild gate.
- Boundary-exit follow-up: near 1280 x 900 and `scrollY` 5007, the fixed-header fixture reached absolute-end with gallery top near `-111px` above a header bottom of `106px`. The popover/top layer's z-index `2147483644` exceeded the header's `300`, so the gallery painted over the header.
- `stickyLayoutSnapshot.headerOffset` now passes separately as `occlusionTop`. Popover absolute-end applies an owned top `clip-path` inset only for overlap above the header; fixed mode clears it, no-header mode adds no clip, and disable/destroy restores any merchant clip. Fullscreen temporarily clears the clip and closing restores end-state clipping.
- Body-layer lag follow-up: unlike the ordinary native path, the forced fallback could paint stale absolute-end geometry until its scroll rAF when reversing from about `scrollY 5107` to `4507`. The body layer is now an absolute document track from natural host top to selected boundary bottom, with its direct host always `position: sticky`. Page scroll performs no body relocation sync or mode switch after activation; browser CSS owns the boundary frame. Structural/resize/header updates still remeasure, fullscreen raises the layer, and cleanup ownership is unchanged.
- Mobile page-scroll repro: `[data-ov25-list-variants-content]` measured `488px` client height against `4698px` scroll height, with `max-height: 600px` and `overflow-y: auto`; the outer mobile root was also `600px` high with hidden overflow.
- Only normal-product mobile `inline-sticky` + list releases the container, outer wrapper, mobile list root, content wrapper, and content to page flow. Ordinary mobile `inline` retains its 600px internal scroller and has no sticky markers. After rebuilding, the user manually confirmed mobile page scrolling and header positioning are fixed; those checks no longer block the current text-alignment follow-up.
- Native boundary-exit repro: the desktop fixed-header fixture placed a `792px` gallery column inside a `5276px` grid row. Insufficient travel forced popover relocation, and its rAF-updated absolute-end `clip-path` visibly lagged behind the header during continuous scroll.
- For eligible gallery columns that are direct children of grid or row-flex containers, the controller now applies `align-self: stretch !important`, then retains it only if native sticky travel becomes sufficient and no other blocker requires fallback. Browser CSS owns sticky positioning and boundary exit on the default fixture, so no scroll-driven JS clip is used there.
- JS still measures dynamic headers and owns/reverts the one-time stretch repair. Ineligible or genuinely blocked layouts retain Popover relocation/clipping or the body sticky-track fallback. Exact merchant `align-self` value and priority restore only while OV25 still owns the applied stretch; external overwrite/removal is preserved.
- Failed stretch attempts are cached against geometry, column/container constraints, and blocker state to avoid retry loops. Relevant geometry, constraint, or blocker changes allow a fresh attempt. Independent final review found no issues.
- After rebuilding, the user manually confirmed the native desktop boundary behavior now "works great"; that action is passed and no longer blocks review.
- Header-alignment follow-up: font-relative `ov:px-4` produced an `18px` option-header inset and a `14px` group-header inset, shifting option text 4px right on desktop and mobile. Under `.ov25-inline-sticky-list` and `.ov25-inline-sticky-list-mobile` only, both header types now use `padding-inline: var(--ov25-sticky-list-header-inline-inset, 14px) !important`. Ordinary inline/list behavior is unchanged.
- Vertical-spacing repro: live port `3008` measurements showed option/group boxes already touching. Desktop option bottom padding `18px` plus group top padding `21px` produced a `43px` text gap; mobile used `9px` plus `21px`, producing `34px`.
- Under the same desktop/mobile sticky-list roots only, group headers now use `padding-block-start: var(--ov25-sticky-list-group-header-block-start, 0px) !important`. Existing responsive option-header bottom spacing remains; Snap2 and ordinary inline/list are unaffected by root scope.
- The existing Playwright geometry helper retains logical inline-start box/text and `14px` inset assertions, and now also requires option/group boxes to touch within `1px` and group logical block-start padding to equal `0px` in fixed-header desktop and every generated mobile scenario. Review removed an unnecessary Snap2 `:not(...)` selector and found no unresolved issue for this scoped patch.
- The current bundle must be rebuilt before those browser assertions or a new after screenshot are treated as current.
- Responsive fixture consolidation: the stable no-header, fixed-header, and collapsing-header URLs now each render the same DOM for desktop and mobile. Visible page titles/index labels no longer say Desktop, and the dedicated `inline-sticky-mobile-carousel.html` fixture is removed from Vite, the index, and Playwright.
- The shared fixture has no mobile-only scenario/data layout or `forceMobile`; viewport width selects runtime mode. Every scenario renders the compatibility target `[data-ov25-sticky-mobile-carousel]` unless `?target=missing`, and the generalized runtime keeps its populated carousel visible at both desktop and mobile widths during desktop -> mobile -> desktop transitions.
- Playwright generates mobile coverage for all three scenarios. It verifies no-header offset `0`, fixed-header behavior, collapsing-header offsets `94px` initially, `54px` compact-visible, and `0px` hidden, plus carousel portal, five-layer page scroll, option/group stacking, and logical horizontal/vertical alignment. Ordinary-inline, missing-target, and responsive-switch tests use the shared pages. No runtime behavior changed.
- The OV25 preview patch is applied in dirty OV25 main and matches its review diff. The Shopify mobile-carousel block exists, validates, matches the runtime/setup selector, and remains untracked.

Fixture links:

- [Normal-inline comparison on responsive fixed-header page](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?desktopMode=inline)
- [Responsive no-header page](http://localhost:3008/tests/inline-sticky-desktop-no-header.html)
- [Responsive fixed-header page](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html)
- [Actual body-layer fallback on shared fixed-header page](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?fallback=body-layer)
- [Inline-sticky fixed header with explicit selector](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?header=explicit)
- [Responsive collapsing-header page](http://localhost:3008/tests/inline-sticky-desktop-collapsing-header.html)
- [Ordinary mobile inline on shared no-header page](http://localhost:3008/tests/inline-sticky-desktop-no-header.html?mobileMode=inline)
- [Mobile sticky stacked iframe path](http://localhost:3008/tests/inline-sticky-desktop-no-header.html?stackedGallery=1)
- [Mobile missing-target fallback on shared no-header page](http://localhost:3008/tests/inline-sticky-desktop-no-header.html?target=missing)
- [Ordinary desktop/mobile carousel relocation](http://localhost:3008/tests/carousel-relocation.html)
- [Ordinary carousel missing-target fallback](http://localhost:3008/tests/carousel-relocation.html?target=missing)
- [Ordinary carousel selector disabled](http://localhost:3008/tests/carousel-relocation.html?target=disabled)
- [Ordinary carousel disabled](http://localhost:3008/tests/carousel-relocation.html?carousel=none)
- [Blocked-parent fullscreen cleanup](http://localhost:3008/tests/inline-sticky-desktop-no-header.html?blocker=1&carousel=stacked)
- [Configurator Setup fixture](http://localhost:3008/tests/configurator-setup.html)
- [Local OV25 setup preview target](http://app.localhost:3000/configurator-preview)

Screenshot links:

- [Normal-inline comparison](review-screenshots/bug-39-inline-sticky-before.png)
- [Inline-sticky desktop](review-screenshots/bug-39-inline-sticky-after.png)
- [Earlier inline-sticky mobile run](review-screenshots/bug-39-inline-sticky-mobile.png)
- [Mobile constrained-width before follow-up](review-screenshots/bug-39-mobile-full-width-before.png)
- [Option-header gap bleed before fix](review-screenshots/bug-39-option-header-mask-before.png)
- [Boundary-exit header occlusion before fix](review-screenshots/bug-39-sticky-end-header-before.png)
- [Mobile internal-scroll before follow-up](review-screenshots/bug-39-mobile-page-scroll-before.png)
- [Native-sticky boundary exit before fix](review-screenshots/bug-39-native-sticky-exit-before.png)
- [Sticky header vertical spacing before fix](review-screenshots/bug-39-sticky-header-spacing-before.png)
- [Collapsing-header viewer before fix, expanded header](review-screenshots/bug-39-collapsing-height-before-top.jpg)
- [Collapsing-header viewer before fix, hidden header](review-screenshots/bug-39-collapsing-height-before-hidden.jpg)

These are direct links, not embedded images. The prior mobile page-scroll/header-positioning outcomes are manually confirmed fixed, and the user confirmed the native desktop boundary behavior now "works great." The collapsing-header pair records the pre-fix `762px -> 868px` growth; matching after images are pending the next rebuild. The sticky-header-spacing after image is also pending. Earlier images remain historical evidence. All sticky fixtures use a red viewer background so viewer bounds and clipping are obvious.

Desktop manual review:

The native desktop boundary behavior is manually passed. Re-check all three responsive pages at a desktop viewport; horizontal alignment plus reduced vertical option/group spacing remains the visual gate.

1. At a desktop viewport near 1280 x 900, open the responsive no-header, fixed-header, and collapsing-header pages. Confirm each selects desktop sticky mode, places exactly one carousel in the shared external target, and uses its expected header scenario without a mobile-only DOM variant.
2. On the fixed-header page, compare with the [vertical-spacing before image](review-screenshots/bug-39-sticky-header-spacing-before.png). Confirm option/group boxes touch within `1px`, both boxes/text retain the same logical inline-start and `14px` inset, group logical block-start padding is `0px`, and the text gap is visibly reduced while responsive option bottom spacing remains.
3. Repeat the fixed-header check with the explicit-selector fixture. Auto-detection and `?header=explicit` should produce the same offset and pinned position.
4. Open the no-header fixture and scroll from before the sticky threshold through the end of the product section. Its eligible gallery column should stretch and remain native sticky with no relocation nodes, then stop naturally before following content. The explicit blocked-parent fixture should still use the reversible fallback; with no detected header, its absolute-end host should receive no header-occlusion clip.
5. Open the collapsing-header fixture. Scroll down until the announcement/header compacts and hides, scroll upward, then continue beyond the sticky boundary. The viewer top should follow each live header state, but the host, iframe containers, and iframe must retain their initial rendered height throughout without flicker, stale gaps, growth, or later shrinkage.
6. At 1280 x 900, open the fixed-header fixture and confirm the `792px` gallery column is stretched to the full grid-row height. The gallery must remain a direct child of that column and use native `position: sticky`, with no popover, body layer, or placeholder.
7. Regression-check the manually passed gallery-column boundary exit. Browser CSS should own the transition with no inline/computed `clip-path` and no visible lag against the fixed header; compare the historical resting old state with the [before image](review-screenshots/bug-39-native-sticky-exit-before.png).
8. Open the blocked-parent fullscreen fixture and confirm a genuinely blocked layout still uses the existing relocation/clip fallback. Fullscreen and close should preserve the same iframe and restore fallback state correctly.
9. Open the [actual body-layer fixture](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?fallback=body-layer). Confirm fixture attributes report `body-layer` plus `gallery-show-fails`, and that the independent native Popover probe opens/closes. Scroll through activation, multiple pinned positions, and the product boundary. There must be exactly one absolute body track and placeholder; the direct host must remain `position: sticky`; track top/bottom must align with natural host top/product boundary; the fixed header must win overlap hit testing; and width, client grid, blocker styles, iframe identity, and node counts must stay stable. Reverse immediately after boundary exit and confirm no delayed fixed/absolute catch-up. Repeat with `&mobileMode=inline`: resize below 768px after relocation to confirm exact external inline-style restoration plus removal of both relocation nodes, then resize back to desktop. Frame-stepped and same-task pre-rAF assertions cover deterministic geometry; continuous input/compositor appearance remains manual.

Mobile manual review:

The user manually confirmed mobile page scrolling and option/group header positioning after rebuild. Re-check every responsive header scenario near 390 x 844; horizontal alignment plus reduced vertical spacing remains the visual gate.

1. Open the responsive no-header page at mobile width. Confirm mobile sticky mode is selected by viewport, the gallery pins at header offset `0`, the external carousel target contains exactly one portal, and the viewer has no rounded corners on its outer container, true container, or iframe.
2. Open the responsive fixed-header page at mobile width. Confirm the gallery tracks the visible fixed header and the same DOM provides the external carousel, page-scrolling variants, and stacked headers.
3. Open the responsive collapsing-header page at mobile width. Confirm header/gallery offset `94px` initially, `54px` while compact and visible, and `0px` once hidden.
4. On all three pages, scroll the full list using document scroll. Confirm the five sticky-list layers have no internal scroller, the carousel remains correctly portaled, and option/group headers stack below the gallery without overlap or stale offsets.
5. On all three pages, confirm option/group boxes touch within `1px`, boxes/text share the same logical inline-start and `14px` inset, group logical block-start padding is `0px`, and the vertical text gap is visibly reduced while responsive option bottom spacing remains.
6. On the shared no-header page, test `?mobileMode=inline`, `?stackedGallery=1`, and `?target=missing`. Ordinary inline must retain its configured nonzero viewer radius and internal scroller; stacked mode must use the separate true-container portal with square outer/true/iframe layers; missing-target mode must render exactly one embedded carousel. Confirm desktop sticky remains rounded; Snap2 remains unaffected.
7. Load the shared no-header page at desktop width, resize to mobile, then back to desktop. Confirm corner mode changes configured -> square -> configured, the shared target remains visible with exactly one external carousel throughout, and no viewer, carousel, variant, placeholder, or body-layer nodes duplicate.
8. Retain the [mobile internal-scroll](review-screenshots/bug-39-mobile-page-scroll-before.png) and [constrained-width](review-screenshots/bug-39-mobile-full-width-before.png) images as historical comparisons; no active URL depends on the removed standalone mobile page.

Setup-preview manual review:

1. Run local OV25 at `app.localhost:3000`, then open the Configurator Setup fixture on port 3008. Its embedded preview should load the local OV25 `/configurator-preview` route.
2. Select the Standard layout. Under Configurator -> Display mode, choose `Inline (sticky)` for desktop and mobile.
3. Confirm `Header selector override` appears when either viewport is sticky. Leave it blank for automatic detection, then enter `[data-preview-sticky-header]` and confirm the preview remains aligned.
4. Confirm `Carousel target` is visible for Standard and Bed regardless of display modes, remains hidden for Snap2, and uses `[data-ov25-sticky-mobile-carousel]` when enabled. Export ordinary sheet/drawer settings and verify the compatibility key remains `selectors.mobileCarousel`; Snap2 export must omit it.
5. Use the setup preview's Desktop and Mobile controls. Desktop should show the two-column sticky product layout below the simulated fixed/collapsing header; Mobile should show the one-column viewer with the external carousel above variants. Scroll inside each preview and check header tracking and usable viewer height.
6. Change one or both display modes back to normal `Inline`. Confirm sticky-only fields hide as appropriate and the preview returns to normal inline behavior without stale sticky positioning.

Carousel relocation manual review:

1. Rebuild, then open `http://localhost:3008/tests/carousel-relocation.html` near 1280 x 900. Confirm the ordinary Standard product uses sheet mode and exactly one carousel is inside the dashed external target, with no sticky marker or embedded `#true-carousel`.
2. Use **Remove OV25 host** first and confirm exactly one owned host/carousel is recreated in the same target while the existing iframe remains loaded. Then use **Replace target**, **Remove target**, and **Restore target**. Replacement must move without duplicates; target removal must produce exactly one embedded carousel; restoration must return exactly one external host.
3. Repeat near 390 x 844, where the same fixture uses drawer mode. Open the drawer and confirm modal/surface lifecycle does not duplicate the external carousel.
4. Check `?target=missing` and `?target=disabled` for one embedded carousel, and `?carousel=none` for no external or embedded carousel. Confirm client target markup remains untouched apart from the reversible OV25 child host.

Changed files in `ov25-ui` - runtime and public contract:

- `globals.css`
- `src/components/IframeContainer.tsx`
- `src/components/VariantSelectMenu/ProductVariantsWrapper.tsx`
- `src/components/VariantSelectMenu/VariantSelectMenu.tsx`
- `src/components/product-carousel.tsx`
- `src/components/product-gallery.tsx`
- `src/contexts/ov25-ui-context.tsx`
- `src/hooks/useStickyHostRelocation.ts`
- `src/lib/carousel-target-controller.ts`
- `src/lib/sticky-layout-controller.ts`
- `src/types/config-enums.ts`
- `src/types/inject-config.ts`
- `src/utils/configurator-utils.ts`
- `src/utils/inject.tsx`

Changed files in `ov25-ui` - setup:

- `setup/src/components/ConfiguratorSetup/ConfigPanel/index.tsx`
- `setup/src/components/ConfiguratorSetup/initial-config-from-payload.ts`
- `setup/src/components/ConfiguratorSetup/serialize-config.ts`
- `setup/src/components/ConfiguratorSetup/types.ts`
- `setup/src/components/ConfiguratorSetup/useConfiguratorSetup.ts`

Changed files in `ov25-ui` - fixtures and architecture:

- `dev/react-test/index.html`
- `dev/react-test/vite.config.js`
- `dev/react-test/tests/inline-sticky-desktop-collapsing-header.html`
- `dev/react-test/tests/inline-sticky-desktop-fixed-header.html`
- `dev/react-test/tests/inline-sticky-desktop-no-header.html`
- `dev/react-test/tests/inline-sticky-fixture.jsx`
- `dev/react-test/tests/carousel-relocation.html`
- `dev/react-test/tests/carousel-relocation.jsx`
- `docs/sticky-display-mode-architecture.md`
- `docs/sticky-header-autodetection-audit.md`

Changed files in `ov25-ui` - automated coverage:

- `test/e2e/inline-sticky.test.ts`
- `test/e2e/carousel-relocation.test.ts`
- `test/unit/carousel-target-controller.test.ts`
- `test/unit/configurator-setup-initial-config.test.ts`
- `test/unit/inline-sticky-config.test.ts`
- `test/unit/product-carousel.test.tsx`
- `test/unit/sticky-host-relocation.test.ts`
- `test/unit/sticky-layout-controller.test.ts`
- `test/unit/sticky-layout-metrics.test.ts`
- `test/unit/variant-select-menu-role.test.ts`

Changed files in OV25:

- `app/(ov25-ui)/configurator-preview/page.tsx`

Changed files in Shopify:

- `extensions/ov25-configurator/blocks/ov25_sticky_mobile_carousel.liquid`

Implementation diffs:

- [Current `ov25-ui` consolidated diff](review-diffs/bug-39-inline-sticky-ov25-ui.diff)
- [OV25 preview diff](review-diffs/bug-39-ov25-preview.diff)
- [Shopify mobile-carousel block diff](review-diffs/bug-39-shopify-mobile-carousel.diff)

The `ov25-ui` patch was refreshed from dedicated worktree `HEAD` `1c784b5`: 39 files, 11,882 insertions, and 130 deletions (all 20 tracked worktree diffs plus 19 untracked Bug 39 files). All three links are current review artifacts. Refresh an affected diff only if follow-up feedback changes its source.

Diff summary:

```diff
+ public/setup inline-sticky display mode and selector round-trip
+ measured fixed/collapsing-header offsets and viewport-constrained gallery metrics
+ lifecycle-stable gallery/iframe sizing while collapsing headers move the live sticky top
+ reversible sticky-host relocation for blocked ancestors and insufficient native travel
+ desktop page-scroll variant headers and mobile external-carousel portal/fallback
+ compatibility-key carousel target generalized to every non-Snap2 mode and viewport
+ authoritative configurator scoping, shared-ShadowRoot observation, owner-realm validation, and stable :empty ownership
+ owned-host removal reconciliation plus ordinary sheet/drawer relocation fixture
+ legacy setup storage keeps the new carousel target disabled while fresh defaults stay enabled
+ exact desktop option-header top-gap mask so variants cannot bleed above it
+ full-viewport mobile gallery with zero sticky gaps and live gallery-bottom header stacking
+ Popover absolute-end header-occlusion clipping with fullscreen and merchant-style restoration
+ normal-product mobile sticky list page scroll while ordinary mobile inline stays internally scrollable
+ eligible grid/row-flex column stretch keeps default desktop boundary exit native and clip-free
+ shared logical 14px option/group header inset under desktop/mobile sticky roots only
+ zero logical group-header block-start inset reduces text gaps while retaining option bottom spacing
+ three stable no/fixed/collapsing-header pages share one responsive desktop/mobile DOM
+ square outer/true/iframe viewer corners only during active mobile inline-sticky
+ fixture-only forcing, native Popover control, and a browser-owned sticky boundary track for the actual Element.moveBefore() body-layer path
+ focused unit coverage and 21-test relevant Playwright matrix, including 4 ordinary carousel cases
+ OV25 two-column/mobile setup preview with simulated sticky header
+ Shopify section block for [data-ov25-sticky-mobile-carousel]
```

Verification results:

- The July 17 pre-follow-up bundle passed 11/11 E2E cases against port `3008`; that result does not verify the current header-spacing follow-up.
- The native-boundary focused run passed 101/101 tests across 7 files.
- `bun run type-check` passes after responsive fixture consolidation.
- Comment-only annotations immediately before the four Bug 39 layout effects document controller lifecycle, reversible host-style ownership, fullscreen z-index/data ownership, and final restoration ordering; effect bodies and dependencies are unchanged.
- Playwright discovery lists all 21 relevant E2E tests across the sticky and carousel-relocation files. The 4 dedicated cases cover ordinary desktop/mobile relocation, dynamic replacement/removal/restoration, stylesheet adoption, fallback, no duplicates, and `carousel: none`; the actual run is pending the user's rebuild.
- `bun x --bun vitest run --config vitest.config.ts test/unit/carousel-target-controller.test.ts test/unit/configurator-setup-initial-config.test.ts test/unit/inline-sticky-config.test.ts` passes 42/42 in both the worktree and dirty main. The previous missing-Rollup/blocked claim is obsolete.
- `bun run type-check` passes in both trees. Carousel controller coverage includes authoritative product scope, direct shared-ShadowRoot siblings/observation, foreign owner-realm validation, owned-host mutation filtering, stable `:empty` ownership, merchant selector invalidation, and legacy localStorage migration.
- The sticky metrics/controller/relocation command passes 66/66 in both trees. Unit assertions hold `--ov25-sticky-sizing-header-offset` at `106px` while the live offset changes to `0px` and `54px`, and restore exact pre-existing client values/priorities on destroy.
- The collapsing-header Playwright case records the host, gallery root/content, iframe slot, outer/true iframe containers, and iframe before collapse and requires every layer to remain within `1px` at compact-visible, hidden, restored, and post-boundary-exit states. The blocker fallback now expects the same constant `762px` host/placeholder height instead of the former `868px`/`814px` growth.
- The body-layer tests require a working independent native Popover probe alongside gallery-only failure, exactly one absolute track and placeholder, a direct sticky host, host/iframe identity preservation, unchanged client blocker styles and materially stable grid geometry, natural-top/boundary-bottom alignment within `1px`, real-header hit testing, duplicate-free boundary exit, and full cleanup/restoration across desktop -> ordinary mobile inline -> desktop.
- Activation and boundary trajectories use bounded 8px frame-stepped increments and must follow the analytic native-sticky clamp without changing computed position. A same-task reverse scroll from beyond the boundary reads the pinned top before any post-scroll rAF and requires the track style to remain unchanged. This directly guards the old stale mode frame but does not replace manual continuous-input/compositor review.
- Cleanup compares the complete inline style attribute, cssText, declaration values, and priorities after removing only explicit sticky lifecycle properties; external sentinel declarations must restore byte-for-byte in the serialized snapshot.
- Positive E2E coverage requires `max-height: none`, visible overflow, and no internal scrolling across all five mobile sticky list layers; content height must fully expand beyond 600px and the document must scroll.
- The negative E2E case requires ordinary mobile `inline` to have no sticky markers and retain `600px` / `overflow-y: auto` internal scrolling.
- The user manually confirmed rebuilt mobile page scrolling/header positioning are fixed and the native desktop boundary behavior now "works great."
- Generated mobile coverage runs on all three stable pages: no-header offset `0`, fixed header, and collapsing header at `94px` initial, `54px` compact-visible, and `0px` hidden. Each also covers external carousel portal, five-layer page scroll, header stacking, and logical horizontal/vertical alignment.
- The mobile matrix requires all four computed corners to be `0px` on the outer iframe container, true iframe container, and iframe; the ordinary mobile-inline negative case requires one shared configured radius greater than zero across those layers. Responsive resize coverage checks configured -> square -> configured, and the stacked-path case verifies the separate true-container portal remains square.
- The shared geometry helper checks logical inline-start box/text alignment and a `14px` inset, touching option/group boxes within `1px`, and `0px` group logical block-start padding in fixed-header desktop and all three mobile scenarios.
- Ordinary-inline, missing-target, and desktop -> mobile -> desktop tests use the shared no-header page; the dedicated mobile HTML is no longer part of discovery or the artifact.
- The rebuilt pre-fix [header-spacing before image](review-screenshots/bug-39-sticky-header-spacing-before.png) is captured; its after image is pending the next rebuild.
- Review removed an unnecessary Snap2 `:not(...)` selector and found no unresolved issue for the scoped spacing patch.
- The mobile full-bleed, zero-gap, gallery-bottom publication/restoration, stacked-header, and desktop/mobile option-header registration source is synchronized in dirty main and `.worktrees/ov25-ui-inline-sticky`.
- Popover boundary clipping passes `headerOffset` separately as `occlusionTop`, clips only absolute-end overlap, clears for fixed/fullscreen/no-header states, restores end-state clipping after fullscreen, and restores merchant `clip-path` on disable/destroy. The body track stays clip-free, uses normal layer stacking beneath the fixed header, raises during fullscreen freeze, and restores merchant clipping on cleanup.
- Eligible direct grid/row-flex gallery columns use an ownership-aware `align-self: stretch !important` repair only when it eliminates insufficient travel and no other blocker requires fallback. Failure caching prevents unchanged retries while layout/blocker changes permit retry; independent final review found no issues.
- The OV25 preview patch is applied in dirty OV25 main and matches `review-diffs/bug-39-ov25-preview.diff`.
- The Shopify block exists, validates, matches the runtime/setup selector, and remains untracked.

Residual risk:

- This is a high-blast-radius layout change across client-owned scrolling, responsive transitions, portals, overlays, dynamic headers, setup preview, and Shopify theme integration.
- The body-host fallback preserves the same iframe and restores owned styles, but ancestry-dependent client CSS and unusual product-section boundaries still need manual theme checks.
- Mobile Safari dynamic viewport/header behavior remains a real-device/manual verification gap despite `visualViewport` coverage.
- Automatic header detection is conservative; uncommon themes may require `selectors.header`.
- The implementation is spread across dirty workspaces, and the Shopify block remains untracked. Do not stage from this packet; refresh affected artifacts and cross-repository scope only if follow-up feedback changes them.

Approval state:

Approval is paused. The user must rebuild first; Codex must then verify all three sticky pages plus the stacked iframe, actual body-layer path, and ordinary carousel-relocation fixture, including dynamic target cleanup, square mobile sticky viewer layers, configured -> square -> configured resizing, retained ordinary-inline radius, header offsets, carousel/page-scroll behavior, alignment, spacing, and Snap2 isolation; run all 21 relevant E2E tests; and capture the pending header-spacing after screenshot before the packet returns to manual approval. Bug 39 remains unstaged, not approved, and not stage-ready.
