# Bugs ready for review

This file is the active manual review queue for the upcoming release. When a bug fix is ready, Codex should add a review packet here with the fixture as a clickable markdown link, visual steps, changed files, implementation diff file, diff summary, verification run, residual risk, and approval instruction. Post-release exclusions are retained separately in [PARKED_BUGS.md](PARKED_BUGS.md).

For UI bugs, include before/after screenshots when practical. Generate them with Playwright against the relevant fixture, store them under `review-screenshots/`, and link the PNGs in that bug's review packet. If a UI bug is interaction-only or needs data/setup that cannot be reproduced locally, add a short note explaining why screenshots were not generated.

After manual approval, Codex should remove the item from this file and mark the source item fixed in `docs/ov25_bugs_and_todo.md`, but should not stage either tracker file. Only implementation and test files for the approved bug should be staged.

Do not rebuild `ov25-ui` for manual review unless the user explicitly asks; the user handles local rebuilds.

Parked bugs must not be approved or staged from this queue. Move the entire packet back here from [PARKED_BUGS.md](PARKED_BUGS.md) and refresh its evidence before review resumes.

Before/after comparison server: the retained clean baseline worktree is detached at historical commit `bb56186`, not current `HEAD`. It is available at `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/ov25-ui-clean-baseline-3009` and is intended to run on [localhost:3009](http://127.0.0.1:3009/). Use port `3009` only for historical pre-fix behavior and port `3008` for current staged main. A current-HEAD baseline requires a newly refreshed worktree. Not every fixture added after `bb56186` exists on `3009`.

Coding work should be assigned to worker subagents by default. If a reviewed bug needs follow-up changes, send it back to the same worker when that agent is still available; otherwise assign a new worker with the same bug context. The main thread coordinates, reviews, verifies, updates this queue, and stages only after approval.

Queue update 2026-07-23: ordinary `inline` and `inline-sheet` retain their rendering/control paths but no longer receive the obsolete `.ov25-inline-gallery-sticky` class or any new sticky controller/relocation state. The class, CSS variable/rule, and Snap2 fixture overrides were removed in both trees. A browser regression checks both ordinary desktop modes; existing cases continue to cover active `inline-sticky`. Both trees type-check, the focused config test passes 6/6, and Playwright discovers 21 sticky-file cases / 24 relevant cases overall. Build/runtime E2E await the user's rebuild.

Queue update 2026-07-21: desktop sticky sizing treats the stable available height as a cap, not a forced fill height. The normal viewer remains square and natural; an embedded carousel reserves its existing cap/gap while external or disabled carousels reserve nothing. The client override class now exists only during sticky layout, Popover cap contraction/expansion uses a stable pre-relocation baseline, and reversible border-box ownership keeps client padding/borders inside the host cap. Focused sticky tests pass 68/68 and current Playwright discovery lists 24 relevant tests. Build/runtime E2E await the user's rebuild.

Queue update 2026-07-21: runtime now exposes separate `selectors.desktopCarousel` and `selectors.mobileCarousel`; each viewport uses only its own field, and missing/blank ordinary-mode selectors keep the carousel embedded. Normal-product mobile `inline-sticky` alone falls back to `[data-ov25-sticky-mobile-carousel]`. Setup owns/exports neither field and discards legacy saved values. The ordinary sheet/drawer fixture now always configures permanent desktop/mobile targets and has no controls or query modes; unit tests own missing/blank/error and dynamic-target behavior. Playwright discovery is 24 relevant cases, and TypeScript plus the focused 44/44 carousel/setup run pass in both trees. Build and runtime E2E remain gated on the user's rebuild.

Queue update 2026-07-22: the intended cross-repository selector wiring is ready for review. The OV25 PluginSettings diff adds the header plus separate ordinary desktop/mobile carousel targets through `ov25HeaderQuerySelector`, `ov25DesktopCarouselQuerySelector`, and `ov25MobileCarouselQuerySelector` metafields, but that diff is not applied to current OV25 `main`. Dirty Shopify and WooCommerce workspaces contain the adapter/Global Settings portions. `ov25-setup` has no UI/default/form/import/export ownership for any of the three selectors, and adapters discard legacy saved values before applying nonblank integration settings. A blank header setting uses automatic detection. Every Woo classic/block OV25 variants placeholder has one adjacent `[data-ov25-sticky-mobile-carousel]` target with a hidden child, allowing blank-setting mobile `inline-sticky` to use the runtime fallback. Legacy Shopify Auto Carousel remains independent, mobile `inline-sticky` fallback remains runtime-owned, and no integration bundle was built.

Queue update 2026-07-20: the shared fixed-header fixture exposes `?fallback=body-layer` for the actual `Element.moveBefore()` relocation strategy. It combines a genuine external blocker with a pre-injection `showPopover()` failure scoped to the gallery host; a separate probe still opens/closes via native Chromium Popover. The body strategy now uses one absolute natural-top-to-boundary track with its direct host always native sticky, removing the scroll-event/rAF fixed-to-absolute switch that produced a stale reverse-scroll frame. Focused coverage checks exact track bounds, browser-owned trajectory, immediate same-task reverse geometry, header hit testing, full style restoration, identity, layout, duplicates, and cleanup. The relocation unit passes 14/14, TypeScript passes, and the combined current Playwright discovery lists 21 tests. Build, full E2E, and manual browser review remain gated on the user's rebuild.

Queue audit 2026-07-28: 1 active review section is listed below. Bug 39 remains unapproved. Its 39-file `ov25-ui` implementation/test set is currently staged on main, while `.worktrees/ov25-ui-inline-sticky` is unstaged and differs from main in 18 files. The consolidated review diff is stale against the worktree in three implementation/test files plus two subsequently updated sticky docs, and it is unsuitable for current staged main because of the broader main/worktree divergence. Current OV25 `main` contains neither the preview patch nor the PluginSettings selector patch; the selector diff still applies cleanly, while the preview diff must be rebased or recreated. Dirty Shopify and WooCommerce workspaces retain their Bug 39 integration changes, and the Shopify block remains untracked. Source/artifact reconciliation now precedes rebuilding, running the 21 sticky plus 3 carousel browser cases, capturing after screenshots, and requesting manual approval. Bug 13 remains in [bugs-questions-for-user.md](bugs-questions-for-user.md); the 11 deferred packets remain in [PARKED_BUGS.md](PARKED_BUGS.md); committed, awaiting-merge, and otherwise resolved work remains in [bugs-resolved.md](bugs-resolved.md).

## Review priority

1. Bug 39 normal-product `inline-sticky`: reconcile staged main, the divergent worktree, stale review artifacts, and missing OV25 portions; then rebuild, test ordinary `inline`/`inline-sheet` isolation plus all three stable sticky pages, natural/embedded/compact viewer sizing, the stacked iframe, actual body-layer paths, and deterministic viewport-specific carousel relocation. Approval and commit are paused.

## Ready

### 39. Normal-product inline-sticky display mode

- Status: **RECONCILIATION REQUIRED / STAGED BUT UNAPPROVED**. All three stable header-scenario pages support real desktop/mobile viewport switching, desktop viewers retain natural sizing under the stable cap, and the ordinary carousel fixture covers viewport-specific non-sticky sheet/drawer relocation. The complete 39-file `ov25-ui` implementation/test set is staged on main. The dedicated worktree differs in 18 files; the consolidated diff is stale against the worktree in three implementation/test files plus two updated sticky docs and is unsuitable for current main because of the broader divergence. The OV25 preview/PluginSettings portions are absent from current OV25 `main`. Reconcile these sources before rebuilding or requesting approval.
- Repositories: staged `ov25-ui` main; divergent unstaged `codex/inline-sticky`; clean tracked OV25 `main` with unapplied Bug 39 artifacts; dirty unstaged Shopify and WooCommerce workspaces.

Summary:

- Adds responsive `inline-sticky` for standard, non-Snap2 products. Desktop keeps the viewer and carousel below the active client header while page-scrolling long variants; mobile keeps the viewer below the header and can portal the carousel into a separate target above variants.
- Header measurement supports automatic detection or an explicit selector, including fixed and collapsing headers. Sticky top follows the live header bottom, while the available-height cap uses the largest offset observed during the controller lifecycle so collapse/hide cannot enlarge the viewer. Missing targets fall back to one embedded carousel.
- Desktop sticky no longer fills the available viewport height. The outer host and default square viewer size naturally under the cap; an embedded carousel conditionally reserves only `--ov25-sticky-carousel-height + --ov25-gallery-gap`, while external/disabled carousels reserve no space. Low-specificity caps allow later `.ov25-inline-sticky-iframe-slot` client CSS to make the viewer smaller or change aspect ratio without letting the complete gallery exceed the cap.
- Runtime accepts `selectors.header`, `selectors.desktopCarousel`, and `selectors.mobileCarousel`. Carousel lookup uses only the current viewport's field and keeps ordinary carousels embedded when that field is blank/missing. Normal-product mobile `inline-sticky` alone uses `[data-ov25-sticky-mobile-carousel]` as an implicit target. Setup has no UI/default/form/import/export ownership for any of these three integration selectors, and legacy saved values cannot continue exporting. Runtime lookup remains scoped per configurator and independent of sticky snapshots, so sheet, drawer, modal, inline, and inline-sticky paths share dynamic target appearance/replacement/removal and one embedded fallback.
- The proposed OV25 Shopify PluginSettings patch exposes the header selector alongside the two integration-owned carousel targets; it is not yet applied to current OV25 `main`. Dirty Shopify Liquid/runtime adapter changes forward all three values. Saved setup values for all three keys are stripped; nonblank PluginSettings values are added, while a blank header value leaves runtime automatic detection active. Dirty WooCommerce changes follow the same integration-only model through three sanitized options localized into `ov25Settings`. Woo's shared variants-placeholder helper emits exactly one built-in sticky mobile carousel target immediately before variants in classic simple/variable and block paths, including hidden-variants/simple-configure mode. The existing Shopify Auto Carousel/display setting remains separate.
- Existing normal `inline` and `inline-sheet` rendering/control behavior is unchanged. Neither ordinary mode receives a sticky gallery class, layout controller, placeholder, or relocation layer; only `inline-sticky` does. Snap2 rejects/falls back from `inline-sticky`.
- Generic client parent height is deliberately not mutated. Eligible direct grid/row-flex gallery columns first receive a bounded, reversible `align-self: stretch !important` repair, retained only when it creates sufficient native sticky travel and no other blocker requires fallback. Ineligible, still-short, or blocked layouts use the reversible body-host fallback, with owned state restored on mode exit, responsive changes, overlays, or unmount.
- Actual body-layer fixture: `?fallback=body-layer` applies the existing external overflow/transform blocker and makes `showPopover()` fail only for `#ov25-sticky-gallery` before injection. A separate fixture element proves native Popover still opens/closes, while runtime selects `Element.moveBefore()` for the gallery; root data attributes make the state inspectable without a production test hook.
- July 20 mobile follow-up: the gallery host expands to the measured viewport width even inside a narrow client column. Mobile top/bottom sticky gaps resolve to `0`, so the viewer starts immediately below the detected header and uses the remaining viewport height.
- Mobile edge-seam follow-up: active mobile `inline-sticky` temporarily owns all four outer-host border widths and padding edges at `0`, covering native sticky, Popover, and body-layer fallback. Desktop retains merchant insets, and responsive exit/unmount restores the prior inline values. Shared mobile E2E assertions require every edge to be zero and the injected gallery root to align with the host on all four sides within `1px`.
- Viewer-corner follow-up: `stickyLayoutActive && isMobile` applies `rounded-none` to ProductGallery's background/outer iframe container and IframeContainer's true container/iframe. Desktop `inline-sticky`, ordinary mobile `inline`, and other non-sticky modes retain their configured radius. Responsive resize coverage requires configured -> square -> configured.
- Stacked iframe coverage: `?stackedGallery=1` gives the original gallery target `z-index: 1` before injection, which makes the existing stacked-gallery detector choose the portaled IframeContainer path. The target is then replaced, so the trigger does not alter final client layout; the test asserts `data-stacked="true"`, the true container is outside the outer placeholder, and every existing viewer layer is square.
- The controller publishes and restores `--ov25-sticky-gallery-bottom`; the mobile option header sticks at that live edge and group headers stack beneath its measured height. `ProductVariantsWrapper` registers the option header for desktop or mobile sticky lists.
- Desktop follow-up: variant thumbnails could paint through the gap between the client header and sticky option header. An opaque `::before` mask covers exactly `--ov25-sticky-resolved-top-gap` without moving the header. Its original before evidence remains historical rather than a current rebuild gate.
- Boundary-exit follow-up: near 1280 x 900 and `scrollY` 5007, the fixed-header fixture reached absolute-end with gallery top near `-111px` above a header bottom of `106px`. The popover/top layer's z-index `2147483644` exceeded the header's `300`, so the gallery painted over the header.
- `stickyLayoutSnapshot.headerOffset` now passes separately as `occlusionTop`. Popover absolute-end applies an owned top `clip-path` inset only for overlap above the header; fixed mode clears it, no-header mode adds no clip, and disable/destroy restores any merchant clip. Fullscreen temporarily clears the clip and closing restores end-state clipping.
- Body-layer lag follow-up: unlike the ordinary native path, the forced fallback could paint stale absolute-end geometry until its scroll rAF when reversing from about `scrollY 5107` to `4507`. The body layer is now an absolute document track from natural host top to selected boundary bottom, with its direct host always `position: sticky`. Page scroll performs no body relocation sync or mode switch after activation; browser CSS owns the boundary frame. Structural/resize/header updates still remeasure, fullscreen raises the layer, and cleanup ownership is unchanged.
- Mobile body-layer stacking follow-up: the layer deliberately remains z1 so the fixed site header at z300 wins, but that capped the relocated gallery host while sticky option/group headers at z10/z9 escaped the variants surface and painted over the viewer during their section exit. Active `.ov25-inline-sticky-list-mobile` now creates an isolated stacking context, retaining header-over-card order internally while keeping the complete variants surface below the body layer. Native/Popover geometry and the no-scroll body track are unchanged. A bounded-search E2E finds a real header/viewer intersection and checks gallery plus fixed-header hit-test ownership.
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
- The shared fixture has no mobile-only scenario/data layout or `forceMobile`; viewport width selects runtime mode. It configures neither carousel selector and renders the built-in `[data-ov25-sticky-mobile-carousel]` node unless `?target=missing`. Desktop keeps one embedded carousel; mobile sticky relocates into the built-in target; returning to desktop restores the embedded carousel without duplicates.
- Playwright generates mobile coverage for all three scenarios. It verifies no-header offset `0`, fixed-header behavior, collapsing-header offsets `94px` initially, `54px` compact-visible, and `0px` hidden, plus carousel portal, five-layer page scroll, option/group stacking, and logical horizontal/vertical alignment. Ordinary-inline, missing-target, and responsive-switch tests use the shared pages. No runtime behavior changed.
- The intended OV25 preview and PluginSettings selector changes are represented by review diffs but are absent from current OV25 `main`. The selector diff still applies cleanly; the preview diff no longer applies and needs rebasing. The Shopify mobile-carousel block exists, validates, matches the runtime built-in mobile sticky target, and remains untracked.

Fixture links:

- [Normal-inline comparison on responsive fixed-header page](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?desktopMode=inline)
- [Normal inline-sheet comparison on responsive fixed-header page](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?desktopMode=inline-sheet)
- [Responsive no-header page](http://localhost:3008/tests/inline-sticky-desktop-no-header.html)
- [Responsive fixed-header page](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html)
- [Embedded-carousel square/cap path](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?target=missing)
- [Compact 72%-width 4:3 client override](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?viewer=compact&target=missing)
- [Sticky-only override and content-box restoration](http://localhost:3008/tests/inline-sticky-desktop-no-header.html?mobileMode=inline&viewer=compact&hostBox=content-box)
- [Actual body-layer fallback on shared fixed-header page](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?fallback=body-layer)
- [Inline-sticky fixed header with explicit selector](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?header=explicit)
- [Responsive collapsing-header page](http://localhost:3008/tests/inline-sticky-desktop-collapsing-header.html)
- [Ordinary mobile inline on shared no-header page](http://localhost:3008/tests/inline-sticky-desktop-no-header.html?mobileMode=inline)
- [Mobile sticky stacked iframe path](http://localhost:3008/tests/inline-sticky-desktop-no-header.html?stackedGallery=1)
- [Mobile missing-target fallback on shared no-header page](http://localhost:3008/tests/inline-sticky-desktop-no-header.html?target=missing)
- [Ordinary desktop/mobile carousel relocation](http://localhost:3008/tests/carousel-relocation.html)
- [Blocked-parent fullscreen cleanup](http://localhost:3008/tests/inline-sticky-desktop-no-header.html?blocker=1&carousel=stacked)
- [Configurator Setup fixture](http://localhost:3008/tests/configurator-setup.html)
- [Local OV25 setup preview target](http://app.localhost:3000/configurator-preview)

Screenshot links:

- [Normal-inline comparison](../review-screenshots/bug-39-inline-sticky-before.png)
- [Inline-sticky desktop](../review-screenshots/bug-39-inline-sticky-after.png)
- [Earlier inline-sticky mobile run](../review-screenshots/bug-39-inline-sticky-mobile.png)
- [Mobile constrained-width before follow-up](../review-screenshots/bug-39-mobile-full-width-before.png)
- [Option-header gap bleed before fix](../review-screenshots/bug-39-option-header-mask-before.png)
- [Boundary-exit header occlusion before fix](../review-screenshots/bug-39-sticky-end-header-before.png)
- [Mobile internal-scroll before follow-up](../review-screenshots/bug-39-mobile-page-scroll-before.png)
- [Native-sticky boundary exit before fix](../review-screenshots/bug-39-native-sticky-exit-before.png)
- [Sticky header vertical spacing before fix](../review-screenshots/bug-39-sticky-header-spacing-before.png)
- [Mobile sticky 1px edge seam before fix](../review-screenshots/bug-39-mobile-sticky-edge-gap-before.png)
- [Body-layer sticky-header overlap before fix](../review-screenshots/bug-39-body-layer-header-overlap-before.png)
- [Collapsing-header viewer before fix, expanded header](../review-screenshots/bug-39-collapsing-height-before-top.jpg)
- [Collapsing-header viewer before fix, hidden header](../review-screenshots/bug-39-collapsing-height-before-hidden.jpg)

These are direct links, not embedded images. The prior mobile page-scroll/header-positioning outcomes are manually confirmed fixed, and the user confirmed the native desktop boundary behavior now "works great." The edge-seam image records the fixture host's `1px` border/padding exposing scrolling content around the red viewer. Its after image, the collapsing-header pair's matching after images, and the sticky-header-spacing after image are pending the next rebuild. Earlier images remain historical evidence. All sticky fixtures use a red viewer background so viewer bounds and clipping are obvious.

Desktop manual review:

The native desktop boundary behavior is manually passed. Re-check all three responsive pages at a desktop viewport; horizontal alignment plus reduced vertical option/group spacing remains the visual gate.

Before the sticky scenarios, open the ordinary `inline` and ordinary `inline-sheet` comparison links. Confirm the gallery and controls still render normally and scroll with the page. In DevTools, `#ov25-sticky-gallery` must have neither `.ov25-inline-gallery-sticky` nor `.ov25-inline-sticky-gallery-host`, no `data-ov25-inline-sticky-active`, no sticky placeholder/body layer, and computed `position` must not be `sticky`. The default no-header link must still acquire the `inline-sticky` host state and pin.

1. At a desktop viewport near 1280 x 900, open the responsive no-header, fixed-header, and collapsing-header pages. Confirm each selects desktop sticky mode, keeps exactly one embedded carousel with no external host, uses its expected header scenario, and renders a natural square viewer no taller than the available-height cap rather than filling that cap.
2. On the fixed-header page, compare with the [vertical-spacing before image](../review-screenshots/bug-39-sticky-header-spacing-before.png). Confirm option/group boxes touch within `1px`, both boxes/text retain the same logical inline-start and `14px` inset, group logical block-start padding is `0px`, and the text gap is visibly reduced while responsive option bottom spacing remains.
3. Repeat the fixed-header check with the explicit-selector fixture. Auto-detection and `?header=explicit` should produce the same offset and pinned position.
4. Open the no-header fixture and scroll from before the sticky threshold through the end of the product section. Its eligible gallery column should stretch and remain native sticky with no relocation nodes, then stop naturally before following content. The explicit blocked-parent fixture should still use the reversible fallback; with no detected header, its absolute-end host should receive no header-occlusion clip.
5. Open the collapsing-header fixture. Scroll down until the announcement/header compacts and hides, scroll upward, then continue beyond the sticky boundary. The viewer top should follow each live header state, but the host, iframe containers, and iframe must retain their initial rendered height throughout without flicker, stale gaps, growth, or later shrinkage.
6. At 1280 x 900, open the fixed-header fixture and confirm the `792px` gallery column is stretched to the full grid-row height. The gallery must remain a direct child of that column and use native `position: sticky`, with no popover, body layer, or placeholder.
7. Regression-check the manually passed gallery-column boundary exit. Browser CSS should own the transition with no inline/computed `clip-path` and no visible lag against the fixed header; compare the historical resting old state with the [before image](../review-screenshots/bug-39-native-sticky-exit-before.png).
8. Open the blocked-parent fullscreen fixture and confirm a genuinely blocked layout still uses the existing relocation/clip fallback. Fullscreen and close should preserve the same iframe and restore fallback state correctly.
9. Open the [actual body-layer fixture](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?fallback=body-layer). Confirm fixture attributes report `body-layer` plus `gallery-show-fails`, and that the independent native Popover probe opens/closes. Scroll through activation, multiple pinned positions, and the product boundary. There must be exactly one absolute body track and placeholder; the direct host must remain `position: sticky`; track top/bottom must align with natural host top/product boundary; the fixed header must win overlap hit testing; and width, client grid, blocker styles, iframe identity, and node counts must stay stable. Reverse immediately after boundary exit and confirm no delayed fixed/absolute catch-up. Repeat with `&mobileMode=inline`: resize below 768px after relocation to confirm exact external inline-style restoration plus removal of both relocation nodes, then resize back to desktop. Frame-stepped and same-task pre-rAF assertions cover deterministic geometry; continuous input/compositor appearance remains manual.
10. Open the embedded-carousel and compact-viewer links. The fallback viewer must remain 1:1 above one embedded carousel within the cap. The compact fixture must render the client-owned 72%-width 4:3 slot, with outer/true/iframe layers matching it and no fill-height expansion while pinned.
11. Open the sticky-only override/content-box fixture at desktop width. Confirm the compact 4:3 viewer is active and the padded, bordered gallery host is `border-box` and remains inside its width/height caps. Resize below 768px: ordinary mobile inline must return to a square viewer and restore the merchant `content-box` style. Resize back to desktop and confirm compact sticky sizing returns without replacing the iframe.

Mobile manual review:

The user manually confirmed mobile page scrolling and option/group header positioning after rebuild. Re-check every responsive header scenario near 390 x 844; horizontal alignment plus reduced vertical spacing remains the visual gate.

1. Open the responsive no-header page at mobile width. Confirm mobile sticky mode is selected by viewport, the gallery pins at header offset `0`, the external carousel target contains exactly one portal, and the viewer has no rounded corners on its outer container, true container, or iframe. Scroll colored page/variant content behind the pinned viewer and inspect every edge: no 1px seam or moving content should be visible around it. Compare with the [edge-seam before image](../review-screenshots/bug-39-mobile-sticky-edge-gap-before.png).
2. Open the responsive fixed-header page at mobile width. Confirm the gallery tracks the visible fixed header and the same DOM provides the external carousel, page-scrolling variants, and stacked headers.
3. Open the responsive collapsing-header page at mobile width. Confirm header/gallery offset `94px` initially, `54px` while compact and visible, and `0px` once hidden.
4. On all three pages, scroll the full list using document scroll. Confirm the five sticky-list layers have no internal scroller, the carousel remains correctly portaled, and option/group headers stack below the gallery without overlap or stale offsets.
5. On all three pages, confirm option/group boxes touch within `1px`, boxes/text share the same logical inline-start and `14px` inset, group logical block-start padding is `0px`, and the vertical text gap is visibly reduced while responsive option bottom spacing remains.
6. On the shared no-header page, test `?mobileMode=inline`, `?stackedGallery=1`, and `?target=missing`. Ordinary inline must retain its configured nonzero viewer radius and internal scroller; stacked mode must use the separate true-container portal with square outer/true/iframe layers; missing-target mode must render exactly one embedded carousel. Confirm desktop sticky remains rounded; Snap2 remains unaffected.
7. Load the shared no-header page at desktop width, resize to mobile, then back to desktop. Confirm corner mode changes configured -> square -> configured and carousel placement changes embedded -> built-in external target -> embedded, with no viewer, carousel, variant, placeholder, or body-layer duplicates.
8. Open the fixed-header body-layer fixture at 390 x 844 and scroll through the final option/group section boundary (around `scrollY 5200` in the captured run). Compare with the [body-layer overlap before image](../review-screenshots/bug-39-body-layer-header-overlap-before.png): stale header geometry may pass behind the pinned red viewer, but no header text/background may paint over it, and the fixed site header must remain above the viewer.
9. Retain the [mobile internal-scroll](../review-screenshots/bug-39-mobile-page-scroll-before.png) and [constrained-width](../review-screenshots/bug-39-mobile-full-width-before.png) images as historical comparisons; no active URL depends on the removed standalone mobile page.

Setup-preview manual review:

1. Run local OV25 at `app.localhost:3000`, then open the Configurator Setup fixture on port 3008. Its embedded preview should load the local OV25 `/configurator-preview` route.
2. Select the Standard layout. Under Configurator -> Display mode, choose `Inline (sticky)` for desktop and mobile.
3. Confirm Configurator Setup has no header or carousel-target selector fields for Standard, Bed, or Snap2.
4. Import a payload containing legacy `selectors.header`, `selectors.desktopCarousel`, and `selectors.mobileCarousel`, then export and confirm none of the three keys is retained.
5. Use the setup preview's Desktop and Mobile controls. Desktop should show the two-column sticky product layout below the simulated fixed/collapsing header; Mobile should show the one-column viewer with the external carousel above variants. Scroll inside each preview and check header tracking and usable viewer height.
6. Change one or both display modes back to normal `Inline`. Confirm the preview returns to normal inline behavior without stale sticky positioning; no integration selector controls should appear in setup in either mode.

Carousel relocation manual review:

1. Rebuild, then open `http://localhost:3008/tests/carousel-relocation.html` near 1280 x 900. Confirm the ordinary Standard product uses sheet mode and exactly one carousel is inside the visible permanent desktop target, with no top controls, sticky marker, or embedded `#true-carousel`.
2. Resize near 390 x 844. The same fixture should use drawer mode, hide the desktop target, show the permanent mobile target, and move the sole carousel there without reloading the iframe.
3. Resize desktop -> mobile -> desktop and confirm exactly one external host/carousel throughout, the inactive target remains visually hidden and empty, and iframe identity is preserved. Missing/blank/error and dynamic-target reconciliation are covered by focused unit tests rather than this manual fixture.

Shopify PluginSettings manual review:

1. Open OV25 Shopify Plugin Settings for a connected test store. Confirm **Header Selector**, **Desktop carousel target selector**, and **Mobile carousel target selector** are separate text fields and the existing **Auto Carousel** control is unchanged.
2. Save a valid header selector plus distinct carousel targets, reload Plugin Settings, and confirm all three values round-trip independently.
3. Put a conflicting `selectors.header` in the saved setup JSON. Confirm the nonblank PluginSettings Header Selector wins. Clear the PluginSettings field and confirm the saved setup value is ignored and automatic header detection is active.
4. On a Shopify product page containing both carousel target elements, confirm desktop injects only `selectors.desktopCarousel` and mobile injects only `selectors.mobileCarousel`; resizing must move one carousel without duplicates.
5. Clear one carousel field and confirm that viewport keeps the ordinary carousel embedded. Clear both and confirm no ordinary relocation occurs.
6. Put conflicting `header`/`desktopCarousel`/`mobileCarousel` keys in shop-default or product-level setup JSON. Confirm the Shopify adapter ignores them and continues using only PluginSettings metafields.
7. Confirm normal-product mobile `inline-sticky` still uses the existing `[data-ov25-sticky-mobile-carousel]` app block when the mobile metafield is blank, while the legacy Auto Carousel setting retains its existing display behavior.

WooCommerce Global Settings manual review:

1. Open WooCommerce -> OV25 -> Global Settings. Confirm **Header Selector**, **Desktop Carousel Target Selector**, and **Mobile Carousel Target Selector** appear as separate fields.
2. Save a valid header selector plus distinct carousel selectors, reload the page, and confirm all three options persist independently in the admin UI.
3. Put a conflicting `selectors.header` in saved Configurator Setup JSON. Confirm the nonblank Woo Header Selector wins. Clear it and confirm the saved setup value is ignored and automatic header detection is active.
4. On a WooCommerce product page containing both carousel targets, inspect the localized `window.ov25Settings` values and confirm desktop/mobile each relocate into only their matching target without duplicates.
5. Clear one carousel selector and confirm that viewport keeps the ordinary carousel embedded. Enter whitespace only, save, and confirm no runtime selector is emitted.
6. Confirm the values are present in admin page data and storefront localization, and that existing gallery, variants, swatches, price, configure-button, and cart behavior remains unchanged.
7. With both carousel fields blank, inspect classic simple, classic variable, Product Variation Form block, and Product Button block output. Each active path must contain exactly one `[data-ov25-sticky-mobile-carousel]` immediately before `[data-ov25-variants]`, with one hidden `.ov25-placeholder` child preventing `:empty` theme rules.
8. Enable the simple configure button and confirm the target remains singular, variants remain `display:none`, and `[data-ov25-configure-button]` remains after variants. Then test normal-product mobile `inline-sticky`: the runtime fallback should portal into the built-in target even though no Woo mobile selector is configured. Other display modes should leave the empty target harmless.

No admin screenshots were generated for these selector fields because the Shopify persistence flow requires a connected test store and the WooCommerce admin is not part of the local `ov25-ui` fixture. The manual checks above cover field presence, persistence, precedence, and storefront forwarding.

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

Proposed files in OV25 (not currently applied to OV25 `main`):

- `app/(ov25-ui)/configurator-preview/page.tsx`

Changed files in OV25 - Shopify selector settings:

- `components/plugins/shopify/PluginSettings.tsx`
- `components/plugins/shopify/graphql-utils.ts`
- `app/(OV25)/api/shopify/ov25-metafields/route.ts`
- `tests/unit/shopify-admin-api-hardening.test.ts`

Changed files in Shopify:

- `extensions/ov25-configurator/blocks/ov25_sticky_mobile_carousel.liquid`
- `extensions/ov25-configurator/blocks/ov25_configurator.liquid`
- `extensions/ov25-configurator/assets/ov25-configurator.js`

Changed files in WooCommerce:

- `includes/class-admin-api.php`
- `includes/class-admin-page.php`
- `includes/class-variant-hook.php`
- `includes/ov25-plugin-init.php`
- `src/admin/pages/GlobalSettings.tsx`
- `src/frontend/index.ts`

Implementation diffs:

- [Current `ov25-ui` consolidated diff](../review-diffs/bug-39-inline-sticky-ov25-ui.diff)
- [Mobile sticky edge-seam follow-up](../review-diffs/bug-39-mobile-sticky-edge-seam.diff)
- [Body-layer sticky-header overlap follow-up](../review-diffs/bug-39-body-layer-header-overlap.diff)
- [OV25 preview diff](../review-diffs/bug-39-ov25-preview.diff)
- [Shopify mobile-carousel block diff](../review-diffs/bug-39-shopify-mobile-carousel.diff)
- [OV25 integration selector settings diff](../review-diffs/bug-39-carousel-settings-ov25.diff)
- [Shopify integration selector settings diff](../review-diffs/bug-39-carousel-settings-shopify.diff)
- [WooCommerce integration selector settings diff](../review-diffs/bug-39-carousel-settings-woocommerce.diff)

The consolidated `ov25-ui` patch is a stale 41-file snapshot from dedicated worktree `HEAD` `1c784b5` and must be refreshed before approval. Against the current worktree, reverse-apply fails in the three implementation/test files `useStickyHostRelocation.ts`, `carousel-target-controller.ts`, and `inline-sticky.test.ts`, plus the subsequently updated `docs/sticky-display-mode-architecture.md` and `docs/sticky-header-autodetection-audit.md`. Current staged main contains 39 implementation/test files with 12,179 insertions and 239 deletions; the two sticky documentation files are untracked and intentionally outside that staged count. The dedicated worktree differs from main in 18 implementation/test files, making the old patch unsuitable for current staged main beyond those five worktree failures. Neither the old patch nor the worktree should be treated as authoritative without reconciliation. The OV25 selector-settings artifact applies cleanly to current OV25 `main`, but the OV25 preview artifact does not. Shopify and WooCommerce integration artifacts still reverse-apply cleanly to their dirty workspaces.

Diff summary:

```diff
+ public inline-sticky display mode and runtime-only viewport carousel selectors
+ ordinary inline and inline-sheet retain their rendering paths without sticky class/controller behavior
+ measured fixed/collapsing-header offsets and viewport-constrained gallery metrics
+ natural square desktop gallery sizing under a lifecycle-stable viewport cap
+ embedded-carousel cap/gap reservation plus later client slot width/aspect overrides
+ sticky-only viewer override targeting with ordinary-mode sizing restoration
+ Popover natural-height baseline that survives cap contraction and expansion
+ reversible border-box sticky-host cap ownership for padded/bordered client targets
+ reversible sticky-host relocation for blocked ancestors and insufficient native travel
+ desktop page-scroll variant headers and mobile external-carousel portal/fallback
+ separate desktop/mobile carousel targets plus mobile inline-sticky built-in fallback
+ authoritative configurator scoping, shared-ShadowRoot observation, owner-realm validation, and stable :empty ownership
+ ordinary sheet/drawer relocation fixture
+ setup omits both runtime carousel fields from UI, defaults, hydration, and export
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
+ focused unit coverage and 24-test relevant Playwright matrix, including ordinary-mode isolation and deterministic viewport switching
+ OV25 two-column/mobile setup preview with simulated sticky header
+ Shopify section block for [data-ov25-sticky-mobile-carousel]
+ Shopify PluginSettings-owned header/desktop-carousel/mobile-carousel selector metafields
+ WooCommerce Global Settings-owned header/carousel selectors plus one default sticky mobile target before every variants placeholder
```

Verification results:

- The July 17 pre-follow-up bundle passed 11/11 E2E cases against port `3008`; that result does not verify the current header-spacing follow-up.
- The native-boundary focused run passed 101/101 tests across 7 files.
- `bun run type-check` passes after responsive fixture consolidation.
- Comment-only annotations immediately before the four Bug 39 layout effects document controller lifecycle, reversible host-style ownership, fullscreen z-index/data ownership, and final restoration ordering; effect bodies and dependencies are unchanged.
- Playwright discovery lists all 24 relevant E2E tests across the sticky and carousel-relocation files. The 21 sticky-file cases include ordinary `inline`/`inline-sheet` isolation plus mobile body-layer header/viewer stacking; the carousel fixture contributes desktop-target, mobile-target, and desktop -> mobile -> desktop identity cases. Missing/blank/error and dynamic target behavior remain covered by unit tests. The actual browser run is pending the user's rebuild.
- `bun x --bun vitest run --config vitest.config.ts test/unit/carousel-target-controller.test.ts test/unit/configurator-setup-initial-config.test.ts test/unit/inline-sticky-config.test.ts test/unit/product-carousel.test.tsx` passes 44/44 in both trees.
- OV25 selector settings integration: `tests/unit/shopify-admin-api-hardening.test.ts` passes 10/10, including the header and both carousel shop-metafield keys. Selected-file lint passes for PluginSettings, GraphQL utilities, and the focused test; the metafield route still reports its two pre-existing explicit-`any` lint errors.
- Shopify selector settings integration: `node --check extensions/ov25-configurator/assets/ov25-configurator.js`, focused Liquid/window bridge review, and diff checks pass. No extension bundle was generated.
- WooCommerce selector settings integration: `bun run check-types`, PHP syntax checks for the changed PHP files, all 8 normal/hidden classic/block placeholder-path assertions, and diff checks pass. `class-variant-hook.php` centralizes target-plus-variants markup so every branch emits one target while preserving hidden variants and configure-button ordering. Focused ESLint could not load because the installed WordPress ESLint chain is missing `prettier/package.json`.
- `bun run type-check` passes in both trees. Carousel coverage includes viewport-only selector resolution, mobile sticky implicit fallback, authoritative product scope, shared-ShadowRoot observation, owner-realm validation, owned-host mutation filtering, stable `:empty` ownership, merchant selector invalidation, and setup omission of legacy runtime fields.
- The sticky metrics/controller/relocation command passes 68/68 in both trees. Relocation tests preserve an auto-sized body-track host and lock Popover from its pre-relocation natural-height baseline; a `700px -> 220px -> 700px` cap cycle returns to the original size, disable resets the baseline, and merchant `content-box` restores exactly.
- The responsive ownership case uses `?mobileMode=inline&viewer=compact&hostBox=content-box`: desktop sticky exposes the 4:3 override class and caps the padded/bordered host as border-box, ordinary mobile inline removes the class and restores default square sizing plus merchant content-box, and desktop return reapplies sticky ownership while preserving iframe identity.
- The collapsing-header Playwright case records the host, gallery root/content, iframe slot, outer/true iframe containers, and iframe before collapse and requires every layer to remain within `1px` at compact-visible, hidden, restored, and post-boundary-exit states. The blocker fallback now retains that measured natural host/placeholder height instead of a hard-coded full cap.
- The body-layer tests require a working independent native Popover probe alongside gallery-only failure, exactly one absolute track and placeholder, a direct sticky host, host/iframe identity preservation, unchanged client blocker styles and materially stable grid geometry, natural-top/boundary-bottom alignment within `1px`, real-header hit testing, duplicate-free boundary exit, and full cleanup/restoration across desktop -> ordinary mobile inline -> desktop.
- Activation and boundary trajectories use bounded 8px frame-stepped increments and must follow the analytic native-sticky clamp without changing computed position. A same-task reverse scroll from beyond the boundary reads the pinned top before any post-scroll rAF and requires the track style to remain unchanged. This directly guards the old stale mode frame but does not replace manual continuous-input/compositor review.
- Cleanup compares the complete inline style attribute, cssText, declaration values, and priorities after removing only explicit sticky lifecycle properties; external sentinel declarations must restore byte-for-byte in the serialized snapshot.
- Positive E2E coverage requires `max-height: none`, visible overflow, and no internal scrolling across all five mobile sticky list layers; content height must fully expand beyond 600px and the document must scroll.
- The negative E2E case requires ordinary mobile `inline` to have no sticky markers and retain `600px` / `overflow-y: auto` internal scrolling.
- The user manually confirmed rebuilt mobile page scrolling/header positioning are fixed and the native desktop boundary behavior now "works great."
- Generated mobile coverage runs on all three stable pages: no-header offset `0`, fixed header, and collapsing header at `94px` initial, `54px` compact-visible, and `0px` hidden. Each also covers external carousel portal, five-layer page scroll, header stacking, and logical horizontal/vertical alignment.
- The mobile matrix requires all four computed corners to be `0px` on the outer iframe container, true iframe container, and iframe; the ordinary mobile-inline negative case requires one shared configured radius greater than zero across those layers. Responsive resize coverage checks configured -> square -> configured, and the stacked-path case verifies the separate true-container portal remains square.
- The shared mobile viewport helper requires all four outer-host border widths and padding edges to compute to `0`, and the injected gallery root must align with all four host edges within `1px`. This guards the reproduced mobile seam across native sticky, Popover, and body-layer strategies.
- The shared geometry helper checks logical inline-start box/text alignment and a `14px` inset, touching option/group boxes within `1px`, and `0px` group logical block-start padding in fixed-header desktop and all three mobile scenarios.
- Ordinary-inline, missing-target, and desktop -> mobile -> desktop tests use the shared no-header page; the dedicated mobile HTML is no longer part of discovery or the artifact.
- The rebuilt pre-fix [header-spacing before image](../review-screenshots/bug-39-sticky-header-spacing-before.png) is captured; its after image is pending the next rebuild.
- Review removed an unnecessary Snap2 `:not(...)` selector and found no unresolved issue for the scoped spacing patch.
- Mobile full-bleed, zero-gap, gallery-bottom publication/restoration, stacked-header, and desktop/mobile option-header registration code exists in both main and `.worktrees/ov25-ui-inline-sticky`, but the containing files now diverge and require comparison before the worktree can be treated as synchronized.
- Popover boundary clipping passes `headerOffset` separately as `occlusionTop`, clips only absolute-end overlap, clears for fixed/fullscreen/no-header states, restores end-state clipping after fullscreen, and restores merchant `clip-path` on disable/destroy. The body track stays clip-free, uses normal layer stacking beneath the fixed header, raises during fullscreen freeze, and restores merchant clipping on cleanup.
- Eligible direct grid/row-flex gallery columns use an ownership-aware `align-self: stretch !important` repair only when it eliminates insufficient travel and no other blocker requires fallback. Failure caching prevents unchanged retries while layout/blocker changes permit retry; independent final review found no issues.
- The OV25 preview patch is absent from current OV25 `main`, and its review diff no longer applies cleanly; it needs rebasing or recreation.
- The OV25 selector-settings patch is also absent from current OV25 `main`, but its focused review diff still applies cleanly.
- The Shopify block exists, validates, matches the runtime built-in mobile sticky target, and remains untracked.

Residual risk:

- This is a high-blast-radius layout change across client-owned scrolling, responsive transitions, portals, overlays, dynamic headers, setup preview, and Shopify theme integration.
- The body-host fallback preserves the same iframe and restores owned styles, but ancestry-dependent client CSS and unusual product-section boundaries still need manual theme checks.
- Mobile Safari dynamic viewport/header behavior remains a real-device/manual verification gap despite `visualViewport` coverage.
- Automatic header detection is conservative; uncommon themes may require `selectors.header`.
- The Popover natural-height baseline is scoped to one relocation activation at the current desktop width/client CSS. Disable, normal-flow restoration, host/controller replacement, or responsive controller recreation resets it; a structural natural-size change during one continuously active Popover is recaptured on its next relocation lifecycle while the current cap remains enforced.
- The `ov25-ui` implementation is already staged despite being unapproved; the dedicated worktree and consolidated artifact are divergent/stale, and the Shopify block remains untracked. Do not commit the staged index from this packet until the authoritative source and cross-repository scope are reconciled.
- Shopify Liquid loads the generated `ov25-configurator-bundle.js`; the reviewed source bridge will not run on a storefront until the normal Shopify extension build regenerates that bundle.
- OV25 and WooCommerce currently depend on `ov25-ui-react18` `0.7.2`; both dependency references must move to the release containing Bug 39 before these integration settings can work in deployment.
- The new Shopify and WooCommerce settings have focused source/type/syntax coverage but no live admin save/reload or storefront viewport-switch test yet. Metafield permissions, WordPress option persistence, selector validity, and theme-owned target markup remain manual integration checks.
- Shopify has automated metafield-allowlist coverage but not storefront blank/fallback/override precedence; WooCommerce has no automated saved-header/override precedence test. Those behaviors are covered by source review and remain explicit manual checks above.
- Woo emits the built-in target for every OV25 variants placeholder regardless of display mode. Its hidden child prevents common `:empty` selectors and the container has no default dimensions, but unusual theme CSS targeting generic empty-adjacent product elements still needs a storefront regression check.

Approval state:

Approval is paused. First reconcile staged `ov25-ui` main with the divergent worktree, refresh the consolidated diff, and rebase/apply the missing OV25 preview and PluginSettings portions. The user must then rebuild; Codex must verify ordinary `inline`/`inline-sheet` isolation, all three sticky pages, natural embedded/compact desktop sizing, the sticky-only compact/content-box responsive lifecycle, the stacked iframe, actual body-layer path, and deterministic viewport-specific carousel-relocation fixture, including square mobile sticky viewer layers, configured -> square -> configured resizing, retained ordinary-inline sizing/radius, header offsets, carousel/page-scroll behavior, alignment, spacing, body-layer header stacking, and Snap2 isolation; run all 24 relevant E2E tests; and capture the pending after screenshots before the packet returns to manual approval. Bug 39 is not approved or commit-ready, even though its current `ov25-ui` files are staged.
