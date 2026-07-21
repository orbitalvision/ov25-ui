# Triage pass - 2026-05-15

Status summary:

- **✅ FINISHED / STAGED / COMMITTED**: Bugs 1, 2/2a, 3, 4, 5, 6, 7, 7a, 7b, 14, 18, 19, 22, 24, 25, 26, 27, Bug 29 correction, and the no-thumbnail repro fixture.
- **✅ COMPLETED OUTSIDE THREAD**: Bugs 9 and 10, plus Shopify embedded store-mismatch logout prompt.
- **🚫 WONT FIX**: Bug 21 selection postMessage readiness/queue.
- **⚪ ALREADY FIXED UPSTREAM / NOT REPRODUCIBLE**: Bug 20 bed checkout currency symbols; Bug 30 Snap2 overlapping footstool replacement crash; Safari selection thumbnail offset.
- **STABLE COLLAPSING-HEADER SIZE / AWAITING USER REBUILD**: Bug 39 now separates live sticky top from lifecycle-stable gallery sizing, preventing iframe growth during header collapse and boundary exit. Scope/ShadowRoot carousel ownership and cleanup remain covered. TypeScript, 42/42 carousel/setup tests, and 66/66 sticky tests pass in both trees; Playwright discovers 21 tests. Build, full E2E, and manual browser review remain pending.
- **PARKED FOR POST-RELEASE**: Bugs 12, 15, 23, 28, 33, 34, 35, 36, 41, 42, 43, and 45. See [PARKED_BUGS.md](PARKED_BUGS.md); none is fixed or approved for the upcoming release.

Release-cleanup state: Bugs 12, 15, 33, 42, 43 (`ov25-ui`), and 45 were removed from dirty main; Bug 23 has a completed unstaged semantic inverse; Bugs 28, 35, 36, 41, and the OV25 side of Bug 43 were never applied to current OV25 main; and the distinct Bug 34 proposal was not applied to main while the approved committed Bug 24 equivalent remains.

Current repo note: `ov25-ui` already has unrelated local modifications, and this TODO file is currently untracked. Keep bug fixes on separate branches/worktrees so those changes do not get mixed with the current working tree.

Bug 39 responsive fixture consolidation 2026-07-20: the stable no-header, fixed-header, and collapsing-header URLs now each represent one responsive desktop/mobile client page, with viewport-neutral visible titles/index labels. The dedicated mobile-carousel HTML is deleted and removed from Vite, the index, and tests. The shared fixture has no mobile-only scenario/data layout or `forceMobile`; every scenario renders the external mobile target unless `?target=missing`, CSS hides it on desktop and shows it at `767px` or below, and the same DOM supports desktop -> mobile -> desktop. Generated mobile tests cover all three scenarios, including no-header offset `0`, fixed-header behavior, collapsing offsets `94px` initial / `54px` compact-visible / `0px` hidden, carousel portal, page scroll, header stacking, and alignment. Ordinary-inline, missing-target, and responsive-switch checks use shared pages. No runtime behavior changed. `bun run type-check` passes and Playwright discovery lists 14 tests; build/full E2E await the user rebuild. Nothing is staged or approved.

Bug 39 mobile viewer-corner follow-up 2026-07-20: normal-product mobile `inline-sticky` derives square viewer corners from `stickyLayoutActive && isMobile` across ProductGallery's background/outer container and IframeContainer's true container/iframe. Desktop sticky and every non-sticky mode retain the configured radius. Responsive resize coverage requires configured -> square -> configured. `?stackedGallery=1` puts an explicit z-index only on the original pre-injection target, triggering the established stacked iframe portal path before replacement; its outer, separate true container, and iframe must all remain square. Type-check and Playwright discovery pass in both trees with 15 tests. The consolidated review diff is refreshed at 34 files, 9,681 insertions, and 126 deletions; build/full E2E await the user rebuild. Nothing is staged or approved.

Bug 39 vertical sticky-header spacing follow-up 2026-07-20: port `3008` showed option/group boxes already touching, but desktop option bottom padding `18px` plus group top padding `21px` created a `43px` text gap; mobile used `9px` plus `21px`, creating `34px`. Under desktop/mobile sticky-list roots only, group headers now use `padding-block-start: var(--ov25-sticky-list-group-header-block-start, 0px) !important`; responsive option bottom spacing remains, and Snap2/ordinary inline are unaffected. The shared geometry helper retains logical inline alignment checks and now requires touching boxes within `1px` plus zero group logical block-start padding in desktop/mobile fixtures. Review removed an unnecessary Snap2 `:not(...)` selector and found no unresolved scoped issue. `bun run type-check` passes and Playwright discovery lists 12; build, E2E, and the spacing after screenshot await the user rebuild. Before image: [bug-39-sticky-header-spacing-before.png](review-screenshots/bug-39-sticky-header-spacing-before.png). Nothing is staged or approved.

Bug 39 sticky-list header-alignment follow-up 2026-07-20: option-header text sat 4px right of group-header text on desktop and mobile `inline-sticky` because font-relative `ov:px-4` resolved to `18px` for the option header and `14px` for the group header. Under desktop/mobile sticky roots only, both header types now use `padding-inline: var(--ov25-sticky-list-header-inline-inset, 14px) !important`; ordinary inline/list behavior is unchanged. The Playwright helper checks logical inline-start box/text alignment and the `14px` inset in fixed-header desktop and mobile-carousel cases. `bun run type-check` passes and Playwright discovery lists 12. Its horizontal-only rebuild gate is superseded by the combined horizontal/vertical spacing check above. Nothing is staged or approved.

Bug 39 native desktop boundary-exit follow-up 2026-07-20: a `792px` gallery column inside a `5276px` grid row forced popover relocation, and the absolute-end rAF clip visibly lagged behind the fixed header during continuous scroll. Eligible direct grid/row-flex gallery columns now receive a reversible `align-self: stretch !important` repair retained only when it yields sufficient native travel and no other blocker requires fallback. Browser CSS owns the default fixture's boundary exit; dynamic header measurement, ownership-aware restoration, changed-state retry, and genuine blocker fallback remain. Independent final review found no issues. Focused tests pass 101/101 across 7 files, `bun run type-check` passes, and Playwright discovery remains 12. After rebuilding, the user confirmed the native desktop boundary behavior now "works great"; that action is passed and superseded by the header-alignment follow-up. The rebuilt mobile page-scroll and option-header-positioning follow-ups are also manually confirmed fixed.

Bug 39 mobile page-scroll follow-up 2026-07-20: pre-fix mobile sticky list content measured `488px` client height versus `4698px` scroll height under a `600px` / `overflow-y: auto` constraint, while the outer root was also 600px with hidden overflow. Normal-product mobile `inline-sticky` + list now releases five layout layers into document flow; ordinary mobile `inline` keeps its internal 600px scroller. Option headers await rebuilt-browser recheck after the constraint removal. Focused tests remain 90/90 across 7 files and `bun run type-check` passes; Playwright discovery now lists 12 cases, but full E2E and the after image require the user's rebuild.

Bug 39 boundary-exit follow-up 2026-07-20: the fixed-header fixture could reach absolute-end with the gallery above the header while the popover/body layer's z-index painted over it. Runtime now passes `headerOffset` separately as `occlusionTop`, clips only absolute-end overlap above the header, clears clipping for fixed/fullscreen/no-header states, restores clipping after fullscreen closes, and restores merchant `clip-path` on disable/destroy. Popover and body-layer strategies are covered. Focused tests pass 90/90 across 7 files and `bun run type-check` passes; Playwright discovers 11 cases, but full E2E and the boundary/other after screenshots await the user's rebuild.

Bug 39 follow-up 2026-07-20: mobile inline-sticky now expands to the full viewport width inside narrow client columns, overrides mobile top/bottom sticky gaps to `0`, publishes/restores the live `--ov25-sticky-gallery-bottom`, and stacks option/group headers beneath that edge. Focused tests pass 88/88 across 7 files and `bun run type-check` passes; Playwright discovers 11 cases, but full E2E and both updated after screenshots are pending the user's rebuild because port `3008` is assumed stale.

Review queue audit 2026-07-17: 1 active packet is in `bugs-ready-for-review.md`. Bug 39 is in active manual review / follow-up feedback; its source and automated browser verification are complete, and current screenshots plus `ov25-ui`, OV25, and Shopify diffs are packaged. Approval is paused until expected minor feedback is incorporated; artifacts need refreshing only if that feedback causes source or visual changes. Bug 20 was removed as already fixed upstream / not reproducible with current OV25; Bugs 12, 15, 23, 28, 33, 34, 35, 36, 41, 42, 43, and 45 are **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md). Bug 15 was parked after manual inspection found invalid width descriptors, and its changes were removed from main pending redesign. Bug 23 was previously approved and committed as `eaa808d`, and its semantic inverse is complete and unstaged in main for this release, without rewriting that history. Bug 27 was approved and committed as `3541b736` on branch `snap2-draggable-objects-bounds`; its review entry and action prompt were removed. Bugs 30 and 31 were resolved as not reproducible without accepting their proposed changes; Bug 30's five-file proposal was discarded and its OV25 worktree/branch were removed. Bug 40 is approved/committed as `bd5ebbd9` on `snap2-configuration-uuid-zctb` and awaits coworker review/merge; Bug 38 is approved/committed as `1c784b5`. Bug 29's original `b8038ed` implementation is retained in history, and its clarified SwatchBook-only correction is manually approved with the exact two-file patch staged. Bug 18's square runtime/setup defaults and Bug 19's final SwatchBook shape/mobile-grid patch are manually approved and staged. The Safari selection thumbnail offset was marked not reproducible and its proposed change was discarded. Bugs 9 and 10 plus the Shopify store-mismatch logout prompt were completed outside this thread, Bug 21 was marked wont-fix, Bugs 7a, 7b, 18, 19, 22, 24, 25, 26, 27, Bug 29 correction, and 38 were approved/staged or committed, and the no-thumbnail repro fixture was approved/staged.

Clarification queue: see [`bugs-questions-for-user.md`](bugs-questions-for-user.md) for the current short list of decisions, missing repro details, and product questions blocking unclear bugs.

Before/after manual review: clean baseline `HEAD` worktree is at `.worktrees/ov25-ui-clean-baseline-3009` and should run on [localhost:3009](http://127.0.0.1:3009/) for before/current-HEAD behavior. Continue using the main dirty/fixed worktree on [localhost:3008](http://localhost:3008/) for after/fixed behavior.

## Implementation workflow

- Before fixing any bug, first verify whether it is still reproducible from current code/fixtures. If it already appears fixed, record the evidence instead of changing code. If reproduction needs a specific product/config that is not in the repo, ask the user for the fixture details.
- Before implementing a still-reproducible bug, record: summary, repro, rough fix, manual test, automated test candidates, risk/blast radius, and branch name or patch owner.
- When a bug fix is ready for manual testing, create or update a per-bug implementation diff file under `review-diffs/`, then add or update a full review packet in `bugs-ready-for-review.md` that links to it. This is the canonical queue for the user to check when returning to the chat.
- Also append a short unread entry to `IMPORTANT_BUGS.md` whenever a bug becomes ready to re-check, an important decision needs user input, or a test environment/fixture changes. Include the bug number, test URL, expected result, and any action needed. The user removes entries after reading them; never stage this queue with bug implementation files. `IMPORTANT_NOTES.md` is retained only as historical context.
- For UI bugs, generate before/after screenshots with Playwright when practical. Store screenshots under `review-screenshots/`, link them from the bug packet in `bugs-ready-for-review.md`, and state when screenshots were skipped because the bug is interaction-only or needs unreproducible product/setup data.
- When practical, include both manual comparison URLs: baseline/current-HEAD on `localhost:3009` and fixed/dirty worktree on `localhost:3008`.
- Prefer the stable Playwright helper `node scripts/check-local-fixture.mjs ...` for local fixture checks and screenshots. Ask for one persistent approval for the prefix `["node", "scripts/check-local-fixture.mjs"]` instead of using long one-off `node -e` Playwright commands.
- When a bug fix is ready for manual testing, ping the user with: exact fixture URL as a clickable markdown link, visual/manual verification steps, changed-file links, diff summary, verification commands run, and known residual risk.
- Do not rebuild `ov25-ui` for manual review unless the user explicitly asks; the user handles local rebuilds.
- Do not stage changes or mark a bug fixed until the user explicitly approves it after manual testing.
- After approval, stage only the implementation and test files for that bug. Remove its packet from `bugs-ready-for-review.md` and mark the source checklist item fixed, but do not stage `bugs-ready-for-review.md` or `ov25_bugs_and_todo.md`.
- For isolated fixes, use one branch per bug, e.g. `fix/variant-name-theme-color`.
- A single Git working directory cannot safely be on multiple branches at once. Use separate worktrees only when they are inside a repo-writable path, e.g. `.worktrees/bug-name`, or use subagents for read-only investigation/patch proposals and apply reviewed patches in the main repo. Avoid `/private/tmp` implementation worktrees because file edits there can trigger approval prompts.
- Use at most two implementation subagents at a time. Coding tasks should be delegated to worker subagents by default; the main thread should coordinate, reproduce, write the bug packet, assign ownership, review returned diffs, run verification, update trackers, and stage approved files only.
- When the user asks for changes to an already-active bug, send the follow-up back to the same subagent when that agent is still available and has useful context. Use a new subagent only when the previous one is closed, blocked, or the follow-up belongs to a clearly separate file scope.
- Subagents should own disjoint files for concurrent work. Each assignment should say that other user/agent changes may exist and must not be reverted.
- For sibling repos like `OV25`, `shopify-plugin`, or WooCommerce code, make a separate branch/worktree in that repo. Do not mix `ov25-ui` and `OV25` edits unless the fix needs an explicit cross-repo contract.

## Easy / good first fixes

### ✅ 1. Variant name hard-coded black

- Status: **✅ FINISHED / STAGED** - approved by user on 2026-05-15.
- Source item: `ov25-variant-name still has ov:text-black`
- Summary: variant labels ignore theme text colors because `DefaultVariantCard` hard-codes `ov:text-black`.
- Repro: load a variant page with custom `--ov25-secondary-text-color`; inspect a `.ov25-variant-name` label. It remains black.
- Likely files: `src/components/VariantSelectMenu/variant-cards/DefaultVariantCard.tsx`.
- Rough fix: replace `ov:text-black` with a theme variable class. Implemented as `ov:text-(--ov25-text-color)`.
- Manual test: approved by user after reviewing the ready-for-review packet for `gallery-inline-list.html`.
- Automated tests: Playwright computed-style assertion for `.ov25-variant-name`; optional screenshot for a custom CSS page.
- Suggested branch: `fix/variant-name-theme-color`.

### ✅ 2. Product name id should be targetable outside shadow root

- Status: **✅ FINISHED / STAGED** - approved by user on 2026-05-15.
- Source item: `Name.tsx needs a shadow-host container selector without moving id="ov25-configurator-name" out of the shadow root.`
- Summary: `#ov25-configurator-name` must stay inside the shadow root for client custom CSS, and a new shadow-host container id should provide a page-queryable wrapper target.
- Repro: load any page with a name selector and inspect the name shadow root. Moving `#ov25-configurator-name` to the host makes it page-queryable but breaks custom CSS selectors that expect it inside the shadow root.
- Likely files: `src/components/Name.tsx`, possibly setup selector catalog.
- Rough fix: keep `id="ov25-configurator-name"` on the shadow-root content element and add `id="ov25-configurator-name-container"` to the `Ov25ShadowHost`.
- Manual test: rebuild `ov25-ui` first because the dev fixture serves `../../dist`; then load `single-no-variants.html`, verify `document.querySelector('#ov25-configurator-name-container')?.shadowRoot` exists, and verify that shadow root still contains `#ov25-configurator-name`.
- Automated tests: Playwright light-DOM assertion for the new host id; shadow-root assertion that the original title id still renders.
- Suggested branch: `fix/name-host-selector`.

### ✅ 2a. Product price id should be targetable outside shadow root

- Status: **✅ FINISHED / STAGED** - approved by user on 2026-05-15.
- Source item: `Price.tsx needs the same shadow-host container selector without moving id="ov25-price-product-page" out of the shadow root.`
- Summary: `#ov25-price-product-page` must stay inside the shadow root for client custom CSS, and a new shadow-host container id should provide a page-queryable wrapper target.
- Repro: load any page with a price selector and inspect the price shadow root. Moving `#ov25-price-product-page` to the host makes it page-queryable but breaks custom CSS selectors that expect it inside the shadow root.
- Likely files: `src/components/Price.tsx`.
- Rough fix: keep `id="ov25-price-product-page"` on the shadow-root price `<p>` and add `id="ov25-configurator-price-container"` to the `Ov25ShadowHost`.
- Manual test: rebuild `ov25-ui` first because the dev fixture serves `../../dist`; then load `single-no-variants.html`, verify `document.querySelector('#ov25-configurator-price-container')?.shadowRoot` exists, and verify that shadow root still contains `#ov25-price-product-page`.
- Automated tests: Playwright light-DOM assertion for the new host id; shadow-root assertion that the original price id still renders; discount fixture assertion for sale/subtotal rendering.
- Suggested branch: `fix/price-host-selector`.

### ✅ 3. Inline variants should flip back to 360 on every selection

- Status: **✅ FINISHED / STAGED** - approved by user on 2026-06-08.
- Source item: `Defer 3d when using gallery doesnt flip to 360 when a selection si made`
- Summary: when variants are inline, every variant selection, including size/product selections, should switch the visible gallery back to the 360/iframe slot whether or not `deferThreeD` is enabled. This does not apply to sheet/modal variants because the page gallery is not visible while selecting and the iframe is already visible in the sheet/modal surface.
- Repro: load `single-product-gallery.html` and `single-product-gallery.html?defer3d=1`, select a non-360 gallery image, then select any inline variant, including a size/product card if available. Expected: gallery switches to the 360/iframe slot. Select another static gallery image, then select another variant. Expected: it switches to 360 again every time.
- Likely files: `src/contexts/ov25-ui-context.tsx`.
- Rough fix: gate the gallery flip to inline configurator display mode, remove the one-time `hasSwitchedAfterDefer` guard from the selection-time path, and set `galleryIndex` to `galleryIndexToUse` for all inline selections regardless of `deferThreeD`, including paths that return early for size/product changes.
- Manual test: approved by user after checking `dev/react-test/tests/single-product-gallery.html` and `dev/react-test/tests/single-product-gallery.html?defer3d=1`; sheet/modal fixtures should not be forced by this logic.
- Automated tests: Playwright clicks a static gallery image, selects a regular inline variant, asserts iframe/360 slot is selected; repeats the static-image + variant selection sequence with a size/product selection if the fixture supports it; repeat with `defer3d=1`; sheet/modal regression asserts selection does not force the page gallery while sheet/modal variants are open.
- Suggested branch: `fix/defer3d-inline-selection-flip`.

### ✅ 4. Carousel thumbnail click is too sensitive to tiny mouse movement

- Status: **✅ FINISHED / STAGED** - approved by user on 2026-05-19.
- Source item: `Mouse needs to be perfectly still to select images in the carousel`
- Summary: `ProductCarousel` marks any mousemove during mousedown as a drag, suppressing the click even for 1px movement.
- Repro: horizontal carousel page; mouse down on a thumbnail, move a tiny amount, mouse up. Expected: select thumbnail; current: click often suppressed.
- Likely files: `src/components/product-carousel.tsx`.
- Rough fix: add a small drag threshold, e.g. 4-6px, before setting `didDrag` and suppressing click. Implemented with `DRAG_THRESHOLD_PX = 5`.
- Manual test: approved by user after reviewing `gallery-carousel-horizontal.html`; tiny move selects, larger drag scrolls. Fixture now starts with enough thumbnails to overflow.
- Automated tests: Playwright mouse move 2px should select; move 10px should drag/suppress click.
- Suggested branch: `fix/carousel-drag-threshold`.

### ✅ 5. Color inputs cannot paste hex values reliably

- Status: **✅ FINISHED / STAGED** - approved by user on 2026-05-19.
- Source item: `Color selectors cant paste`
- Summary: setup color input prepends `#` on change and has `maxLength=6`, so pasting `#ff00aa` can become invalid/truncated.
- Repro: open ov25-setup style editor color popover, paste `#ff00aa` into hex field. Expected: color updates.
- Likely files: `setup/src/components/ui/color-input.tsx`.
- Rough fix: normalize input by stripping leading `#`, whitespace, and invalid chars before validating; accept both `ff00aa` and `#ff00aa`. Implemented with `normalizeHexInput` and removed the input `maxLength`.
- Manual test: approved by user after pasting with and without `#`; picker and saved CSS update.
- Automated tests: component/browser test for pasted hex; maybe unit-test sanitizer if extracted.
- Suggested branch: `fix/setup-color-paste`.

### ✅ 6. Duplicate Snap2 controls

- Status: **✅ FINISHED / STAGED** - approved by user on 2026-05-19.
- Source item: `ov25-snap2-controls is in the DOM twice for snap2. one is redundant.`
- Summary: Snap2 controls are rendered both through `IframeContainer -> ConfiguratorViewControls` and shell-level `ConfiguratorViewControls` in Snap2 modal/drawer paths.
- Repro: open `snap2-dialog.html` or `snap2-uuid.html`, inspect shadow roots for `#ov25-snap2-controls`; count can be 2.
- Likely files: `src/components/IframeContainer.tsx`, `src/components/Snap2ConfigureButton.tsx`, `src/components/ConfiguratorViewControls.tsx`.
- Rough fix: decide one controls owner per Snap2 shell; suppress duplicate controls while preserving mobile drawer controls. Implemented by removing the redundant desktop modal controls mount and guarding explicit mobile controls to only render when the iframe path suppresses them.
- Manual test: approved by user after checking Snap2 modal/drawer controls still work and only one DOM instance exists.
- Automated tests: Playwright count across open shadow roots equals 1; click dimensions/floor/view controls still sends messages.
- Suggested branch: `fix/snap2-single-controls-owner`.

### ✅ 7. Variant thumb wrapper padding should be exact 4px

- Status: **✅ FINISHED / STAGED** - approved by user on 2026-06-02.
- Source item: `ov25-variant-thumb-wrapper needs 4px padding instead of current calc`
- Summary: source uses `ov:p-1`, but compiled Tailwind spacing may produce a calc-based value that is not desired for theme overrides.
- Repro: inspect `.ov25-variant-thumb-wrapper` computed or generated CSS.
- Likely files: `src/components/VariantSelectMenu/variant-cards/VariantThumb.tsx`.
- Rough fix: use explicit `ov:p-[4px]` or a CSS variable with default `4px`. Implemented with `ov:p-[4px]`.
- Manual test: inspect selected and unselected variant cards.
- Automated tests: Playwright computed-style assertion for padding.
- Suggested branch: `fix/variant-thumb-padding`.

### ✅ 7a. Size variant dimensions need targetable CSS classes

- Status: **✅ FINISHED / STAGED** - approved and staged by user on 2026-07-09.
- Source item: `SizeVariantCard.tsx need a few classes adding so that the dimensions are easily targetable with css.`
- Summary: the size variant card has a stable card class, but the size-card name, dimensions row, dimension value, and decorative dimension-line elements only used Tailwind utility classes, so customer custom CSS could not reliably target those parts. The new selectors also need to appear in ov25-setup Element Styles so merchants can pick them from the Style Editor.
- Repro: inspect a rendered size variant card with dimensions enabled. The dimension area and `dimensionX` value render without semantic/stable classes. In ov25-setup Style Editor > Element Styles, searching `size variant dimension` should expose the same selectors.
- Likely files: `src/components/VariantSelectMenu/variant-cards/SizeVariantCard.tsx`, `setup/src/lib/config/configurator-style-variables.ts`.
- Rough fix: add stable classes `ov25-size-variant-card-name`, `ov25-size-variant-card-dimensions`, `ov25-size-variant-card-dimension-row`, `ov25-size-variant-card-dimension-line`, `ov25-size-variant-card-dimension-marker`, and `ov25-size-variant-card-dimension-value` without changing the existing Tailwind layout classes, then add the same selectors to setup `ELEMENT_SELECTORS`. Follow-up: add a stable selector for the size-card grid container as well, likely `ov25-size-variant-card-grid`, and expose it in setup Element Styles.
- Manual test: open ov25-setup Element Styles and verify the size-card grid, name, and dimension selectors are searchable/selectable; load a size-variant fixture, apply custom CSS targeting the new classes, and verify only the intended name/dimension row/value/line elements change.
- Automated tests: Playwright DOM assertion that the new classes exist when `showDimensions` is true and the dimension classes are absent when `showDimensions` is false; unit/snapshot assertion that `ELEMENT_SELECTORS` contains the size-card grid/name/dimension selector entries.
- Suggested branch: `fix/size-variant-dimension-selectors`.

### ✅ 7b. Sheet-mode opening can briefly reflow client pages

- Status: **✅ FINISHED / STAGED** - approved by user and staged on 2026-07-09.
- Source item: client sites sometimes show a brief page reflow when opening the configurator in sheet mode; local `single-no-pricing` did not make the issue visible.
- Summary: opening desktop sheet mode moves the iframe out of the gallery slot and into a fixed sheet surface. Some client pages appear to briefly reflow/collapse while that happens.
- Repro fixture: `dev/react-test/tests/sheet-reflow-debug.html` / `sheet-reflow-debug.jsx`, registered in Vite as [sheet reflow debug](http://localhost:3008/tests/sheet-reflow-debug.html).
- Repro details: fixture is based on `single-no-pricing`, adds high-contrast page bands, fixed viewport markers, a colored gallery slot wrapper, and above/below content for checking sheet-mode reflow.
- Evidence: `useIframePositioning` currently reserves `container.parentElement` before moving the iframe to fixed positioning. In stacked/gallery paths the moved element can be `#true-ov25-configurator-iframe-container`, which may be portaled directly into a shadow root and have no `parentElement`, causing the hook to abort before reserving layout.
- Likely files: `src/hooks/useIframePositioning.tsx`, `src/components/IframeContainer.tsx`, gallery-slot/layout wrappers, and any client-theme container styles that collapse when the iframe is fixed.
- Rough fix: implemented a first pass that separates the fixed/moving element from the in-flow slot that reserves layout. For non-stacked, the hook moves `#ov25-configurator-iframe-container` and reserves its parent; for stacked, it moves `#true-ov25-configurator-iframe-container` but reserves the original in-flow `#ov25-configurator-iframe-container` parent. Follow-up: when desktop sheet scroll-lock hides the page scrollbar, reserve/compensate the scrollbar gutter so root/body layout width does not expand and centered/right content does not shift.
- Manual test: approved by user after checking `sheet-reflow-debug.html`; rebuild `ov25-ui`, open `sheet-reflow-debug.html`, click Configure, and watch the colored bands/fixed rulers during the desktop sheet transition.
- Automated tests: Playwright can record gallery slot/above/below element bounding boxes before click, during transition, and after transition; assert stable top/height values.
- Suggested branch: `fix/sheet-mode-open-reflow`.

### ✅ 22. Horizontal gallery wheel scrolls the page behind

- Status: **✅ FINISHED / STAGED** - approved by user on 2026-06-18.
- Source item: `our gallery is not allowing scroll (its scrolling page behind)`
- Summary: wheeling over the horizontal thumbnail strip in carousel gallery mode can scroll the page instead of moving the thumbnail strip.
- Repro: open `gallery-carousel-horizontal.html`, place the cursor over `.ov25-thumbnail-scroll`, then wheel down. Observed on 2026-06-03 via Playwright: `window.scrollY` changed `0 -> 242` while `.ov25-thumbnail-scroll.scrollLeft` stayed `0`.
- Likely files: `src/components/product-carousel.tsx`.
- Rough fix: implemented a native non-passive wheel listener on `.ov25-thumbnail-scroll` so the handler can call `preventDefault()` and advance `scrollLeft` when the strip can scroll in the wheel direction. Preserves edge behavior so page scroll can resume when the strip cannot scroll further.
- Manual test: approved by user after checking `gallery-carousel-horizontal.html`; wheel down/up over the thumbnail strip, verify the thumbnail strip scrolls horizontally and the page does not move while the strip can scroll.
- Automated tests: Playwright wheel over `.ov25-thumbnail-scroll`, assert `scrollLeft` changes and `window.scrollY` remains stable; repeat at left/right edges to confirm normal page scroll can resume.
- Suggested branch: `fix/horizontal-gallery-wheel-scroll`.

### ✅ 24. Snap2 Shopify setup export is incomplete

- Status: **✅ FINISHED / COMMITTED** - approved and committed by user on 2026-07-09 after retesting setup export, Snap2 dialog/inline preview behavior, narrowed Snap2 display-mode options, and local OV25 preview integration.
- Source item: temporary Shopify plugin shim in `shopify-plugin/extensions/ov25-configurator/assets/ov25-configurator.js` around lines 1526-1626 patches missing Snap2 setup config before calling `ov25Ui.injectConfigurator()`. The narrower `configurator.modules.position` force around lines 1593-1626 is folded into this same bug.
- Summary: Snap2 configs exported by ov25-setup previously missed enough runtime config that the Shopify plugin had to mutate saved setup JSON. This included Snap2 inline selectors and Snap2 module panel position. The fix now lives in `ov25-ui` / `ov25-setup` so Shopify can pass saved setup config through unchanged after the plugin shim is removed.
- Repro before fix: create/export a Snap2 inline setup config from ov25-setup, then inspect the saved/exported Shopify config. Bad output could omit `selectors.gallery`, `selectors.initialiseMenu`, and `configurator.modules.position`, requiring the Shopify runtime shim to inject those values. Also create/export any Snap2 setup config with the module panel intended on the right; bad output could omit `configurator.modules.position`, causing runtime to fall back to `BOTTOM`.
- Current Shopify shim behavior: detects Snap2 inline mode from `configurator.displayMode.desktop/mobile === "inline"`; adds `selectors.gallery = { selector: ".configurator-container", replace: true }` when missing; adds `selectors.initialiseMenu = { selector: "#ov25-initialise-menu", replace: true }` when missing and the element exists; forces `configurator.modules.position = { desktop: "RIGHT", mobile: "RIGHT" }`.
- Expected minimum export shape for Snap2 inline:

```js
selectors: {
  gallery: { selector: ".configurator-container", replace: true },
  variants: "#ov25-controls",
  initialiseMenu: { selector: "#ov25-initialise-menu", replace: true }
},
configurator: {
  displayMode: { desktop: "inline", mobile: "inline" },
  triggerStyle: { desktop: "single-button", mobile: "single-button" },
  variants: {
    displayMode: { desktop: "list", mobile: "list" }
  },
  modules: {
    position: { desktop: "RIGHT", mobile: "RIGHT" }
  }
}
```

- Root causes fixed:
  - `setup/src/components/ConfiguratorSetup/types.ts`: `TypeSettings.selectors` does not include `initialiseMenu`; Snap2 defaults disable `selectors.gallery`; Snap2 setup UI hides the element selector panel entirely.
  - `setup/src/components/ConfiguratorSetup/serialize-config.ts`: `buildSerializableConfig()` serializes only selectors present in `TypeSettings.selectors`; it does not export `configurator.modules.position`; it may also need to export `configurator.variants.position`.
  - `setup/src/components/ConfiguratorSetup/preview-config-serializable.ts`: `SerializableInjectConfig.configurator` currently lacks `modules`.
  - `setup/src/components/ConfiguratorSetup/initial-config-from-payload.ts`: saved config import/loading may not preserve `initialiseMenu`, `variants.position`, or `modules.position`.
- Runtime support already exists for part of this: `src/types/inject-config.ts` includes `SelectorsConfig.initialiseMenu` and `ConfiguratorConfig.modules`; `normalizeInjectConfig()` reads `configurator.modules.position`; runtime default module panel position is currently `bottom`, while the Shopify shim forces Snap2 inline to `RIGHT`.
- Important distinction: `configurator.variants.position` controls the main Snap2 variants sheet side. `configurator.modules.position` controls compatible modules. If `modules.position` matches the variant sheet side, modules are embedded in the variants sheet; if it is `BOTTOM`, runtime uses the bottom module panel; if it is the opposite side, runtime uses a separate side modules sheet.
- Fixed files: `setup/src/components/ConfiguratorSetup/types.ts`, `setup/src/components/ConfiguratorSetup/serialize-config.ts`, `setup/src/components/ConfiguratorSetup/preview-config-serializable.ts`, `setup/src/components/ConfiguratorSetup/initial-config-from-payload.ts`, setup UI/defaults for Snap2 element selectors, plus OV25 setup preview integration. Shopify shim removal remains a follow-up after release verification.
- Rough fix: ov25-setup now models `initialiseMenu`, preserves it in drafts/imports, forces Snap2 inline exports to include gallery/variants/initialiseMenu selector targets, and exports/imports `configurator.variants.position` plus `configurator.modules.position`. A follow-up review fix keeps `configureButton` for mixed inline/non-inline breakpoints while omitting it when both breakpoints are inline. Snap2 setup now offers `Dialog` (`modal`) and `Inline` for desktop display mode, and `Dialog`, `Drawer`, and `Inline` for mobile display mode. Snap2 defaults display modes to `modal`/`modal`; unsupported saved Snap2 display modes (`sheet`, `inline-sheet`, `variants-only-sheet`) normalize to `modal`, while supported mobile `drawer` is preserved and exports as `mobile: "drawer"`. Non-Snap2 display modes are unchanged. Snap2 `Variant position` and `Module position` setup controls are desktop-only and visible only when desktop display mode is `Dialog`; no mobile position selectors are shown, and the whole block is hidden when desktop is `Inline`. The OV25 `/configurator-preview` setup preview shell now includes the Snap2 `#ov25-initialise-menu` mount target. Active Snap2 inline mode uses a Snap2-specific full-height two-column preview shell with `.configurator-container` on the left and `#ov25-aside-menu` controls on the right; it hides `.preview-configure-slot` and strips `selectors.configureButton` before injection so inline has no Configure button. Active Snap2 dialog/modal mode uses the normal product-page shell with gallery/product-media left and product info plus Configure button right; it strips `selectors.initialiseMenu` before local injection so the initialise menu mounts inside the dialog after Configure is clicked instead of fullscreen on page load. Non-inline Snap2 setup exports also omit `selectors.initialiseMenu` while still hydrating it from saved config. The duplicate `dev/react-test/tests/configurator-setup-preview.*` files were removed; `configurator-setup.jsx` should use the package's normal local preview URL while OV25 runs on port 3000.
- Dependency/overlap: the earlier `setup Snap2 side/position controls` work was folded into Bug 24. Shopify shim removal remains a follow-up after this setup export fix is released and verified in Shopify.
- Acceptance criteria:
  - Snap2 inline setup export includes `selectors.gallery`, `selectors.variants`, and `selectors.initialiseMenu`.
  - Snap2 setup offers desktop `Dialog`/`Inline` and mobile `Dialog`/`Drawer`/`Inline`; unsupported saved Snap2 `sheet`, `inline-sheet`, and `variants-only-sheet` values hydrate/export as `modal`, while supported mobile `drawer` is preserved.
  - Snap2 `Variant position` and `Module position` controls are desktop-only and show only when desktop display mode is `Dialog`; mobile position controls are hidden for all mobile display modes.
  - Snap2 setup export includes `configurator.modules.position`.
  - Existing saved configs with `selectors.initialiseMenu`, `configurator.variants.position`, and `configurator.modules.position` round-trip through setup without being dropped; non-inline Snap2 exports intentionally omit `selectors.initialiseMenu`.
  - Setup preview uses the serialized modules position value.
  - Add or update tests for setup serialization and import.
  - Shopify plugin no longer needs to force `modules.position` or inject missing Snap2 inline selectors.
  - After release, remove the Shopify shim in `ov25-configurator.js`.
- Manual test: export a Snap2 inline setup config, use it in the Shopify plugin without the shim, and verify the inline gallery mounts into `.configurator-container`, the initialise menu mounts into `#ov25-initialise-menu`, variants mount into `#ov25-controls`, and the Snap2 module panel opens on the expected right side on desktop/mobile.
- Automated tests: unit tests for `buildSerializableConfig()` exporting Snap2 inline `gallery`, `variants`, `initialiseMenu`, `configurator.modules.position`, and any intended `configurator.variants.position`; unit tests for `buildFormStateFromInitialPayload()` preserving those fields; fixture/Playwright check for `configurator-setup.jsx` or a new Snap2 inline setup export fixture.
- Suggested branch: `fix/snap2-inline-setup-export`.

### ✅ 25. ov25-setup color selectors do not hydrate from saved settings

- Status: **✅ FINISHED / COMMITTED** - approved and committed by user on 2026-07-01.
- Source item: `Viewer Background can be set and passes through correctly, but saved settings load it as the default.` Follow-up: this likely extends to all ov25-setup color selectors.
- Summary: ov25-setup can set and export/pass through color selector values, but loading saved settings back into setup hydrated generated `:host` CSS variables as Custom CSS instead of setup style controls. Viewer Background was the confirmed example, and the same path applies to all setup-generated `--ov25-*` color variables.
- Repro: save/export settings with Viewer Background and at least one other color changed, then reload/import those saved settings. Expected: each color selector shows its saved value and the preview/frontend keeps using those values. Current before the fix: affected controls displayed defaults even though the exported settings could still pass through correctly.
- Likely files: `setup/src/components/ConfiguratorSetup/initial-config-from-payload.ts`, `setup/src/components/ConfiguratorSetup/types.ts`, `setup/src/components/ConfiguratorSetup/serialize-config.ts`, setup style/editor controls, and any style-variable mapping such as `setup/src/lib/config/configurator-style-variables.ts`.
- Rough fix: hydrate setup-generated `:host { --ov25-* }` CSS variable blocks into setup style controls while preserving legacy `:root` imports and non-OV25 custom CSS. The earlier color-input debounce change was removed before commit.
- Manual test: approved by user after comparing the setup fixture against the 3009 baseline and confirming the saved `:host` values hydrate into the setup controls.
- Automated tests: added setup import/hydration unit tests for `:host`, legacy `:root`, non-OV25 custom CSS preservation, and export/import round-trip coverage.
- Suggested branch: `fix/setup-color-selector-hydration`.

### 8. Bed config only current size

- Source item: `Only show current size on bed config`
- Summary: size filtering already exists behind bed setup flags. Runtime intentionally keeps selections visible unless the relevant bed-part flag is enabled, `CURRENT_BED_SIZE` has arrived from the iframe, the option name starts with `Headboard`, `Base`, or `Mattress`, and selection metadata has a matching `bedSize`.
- Repro: open `bed-configurator.html`, choose a bed size, inspect headboard/base/mattress options for non-matching sizes.
- Likely files: `src/lib/bed/bed-variant-size-filter.ts`, `src/contexts/ov25-ui-context.tsx`, `setup/src/components/ConfiguratorSetup/types.ts`.
- Rough fix: decision required. For newly exported setup configs only, default `filterMatchingSizeHeadboard`, `filterMatchingSizeBase`, and `filterMatchingSizeMattress` to true in `setup/src/components/ConfiguratorSetup/types.ts`. For existing bed embeds without re-export, add a runtime default in `normalizeInjectConfig` for normalized `productLink` paths starting `bed-configurator/` only when neither grouped `bed.filterSelectionsByCurrentSize` nor legacy `bedFilterSelectionsByCurrentSize` is present, while preserving explicit false as opt-out.
- Manual test: `bed-configurator.html` currently sets Headboard false, Base true, Mattress true. Choose a bed size, then verify Base/Mattress hide non-current-size selections while Headboard remains unfiltered.
- Automated tests: unit tests for `normalizeInjectConfig` defaulting behavior; unit tests for `selectionVisibleForBedSizeFilter`; setup export test for default-on setup path if chosen; Playwright after `CURRENT_BED_SIZE` message hides non-matching selections.
- Suggested branch: `fix/bed-current-size-filter-defaults`.
- Clarification needed: should this be always on for existing bed embeds at runtime, or just the setup default for newly exported configs?

### ✅ 9. Shopify login redirect needs refresh

- Status: **✅ COMPLETED OUTSIDE THREAD** - current `OV25` `main` already contains the Shopify login redirect flow; confirmed 2026-07-09.
- Source item: `fix shopify login redirect after login issue (currently have to refresh after login)`
- Summary: unauthenticated Shopify app-entry login could return to `/api/shopify/app-entry-point` through client-side `router.push`, leaving stale SPA/session state until refresh. The login redirect also dropped signed query params beyond `shop`, `host`, and `hmac`.
- Repro: open a signed Shopify embedded app-entry URL while logged out; complete credentials login; observe whether the embedded app/portal loads without refresh.
- Current OV25 evidence: `OV25/app/(OV25)/api/shopify/app-entry-point/route.ts` now builds `callbackUrl` with `buildShopifyAppEntryCallbackPath(url.searchParams)`; `OV25/components/auth/SignInPage.tsx` resolves Shopify app-entry callbacks through `resolveLoginCallbackUrl(...)` and uses `window.location.assign(...)` for Shopify login callbacks instead of SPA-only navigation.
- Likely files: `OV25/components/auth/SignInPage.tsx`, `OV25/app/(OV25)/api/shopify/app-entry-point/route.ts`, `OV25/lib/auth/login-callback-url.ts`.
- Rough fix: preserve the full original app-entry query in `callbackUrl` and use hard browser navigation for Shopify app-entry callbacks after login.
- Manual test: unauthenticated app entry logs in and lands in portal without manual refresh; normal `/log-in?callbackUrl=/dashboard` still behaves normally.
- Automated tests: add route/browser integration coverage for signed app-entry login once an auth test harness exists.
- Suggested branch: in `OV25`, `fix/shopify-login-redirect`.

### ✅ 10. Snap2 plan-view dimensions are huge

- Status: **✅ COMPLETED OUTSIDE THREAD** - fixed outside this thread per user on 2026-06-18; removed from `bugs-ready-for-review.md`; local worktree removed.
- Source item: `snap2 in plan view dimensions are mahoosive`
- Summary: plan camera has a smaller dimension distance factor, but shared Snap2 dimension labels ignored it and kept using the normal Snap2 label scale.
- Repro: open Snap2, switch to plan view, enable dimensions.
- Likely files: `OV25/components/threeD/Dimensions.tsx`, `OV25/components/threeD/ModelPreview/Model/Snap2Model.tsx`.
- Rough fix: allow `DimensionLabel` to receive an explicit `distanceFactor`, pass the existing `SNAP2_PLAN_VIEW_DIMENSIONS_DISTANCE_FACTOR` to normal and mini Snap2 dimension labels only when Plan View is active.
- Manual test: completed outside this thread.
- Automated tests: screenshot test for plan-view dimensions if 3D test fixture is stable; component/integration test for explicit `DimensionLabel` distance factor.
- Suggested branch: in `OV25`, `fix/snap2-plan-dimension-scale`.

### ✅ 11. Snap2 initialise menu titles/tooltips

- Status: **✅ APPROVED / STAGED** - approved by user on 2026-07-10; source changes staged; tracker files intentionally unstaged.
- Source item: `snap2 initialise menu remove the titles - re-add tooltips`
- Summary: every initialise card must always contain both its name and tooltip nodes. Desktop hides the name by default and exposes the tooltip on hover/focus; mobile shows the name by default and hides the tooltip. Visibility must use CSS rather than conditional DOM mounting.
- Repro: open Snap2 initialise menu before selecting a product on desktop and mobile widths.
- Likely files: `src/components/VariantSelectMenu/InitialiseMenu.tsx`, `src/components/VariantSelectMenu/variant-cards/ModuleVariantCard.tsx`.
- Rough fix: hide visible product titles in desktop initialise mode and show a custom hover/focus tooltip. Mobile passes through the visible name row.
- Manual test: desktop initialise cards show image-first layout with hover/focus tooltips; mobile initialise cards still show product/module names.
- Automated tests: desktop DOM assertion that visible title is absent in initialise mode; mobile assertion that visible title remains; accessible name still exists.
- Suggested branch: `fix/snap2-initialise-card-titles`.

### ✅ 14. Snap2 mobile drawer close button overlaps Snap2 controls

- Status: **✅ FINISHED / STAGED** - approved by user on 2026-05-19.
- Source item: mobile `snap2-dialog` drawer close button is overlapped by `Snap2Controls`; user also requested moving Snap2 controls ownership out of `ConfiguratorViewControls`.
- Summary: Snap2 controls were rendered from the generic view-controls component, which also owned the mobile close overlay. Mobile drawer now needs a Snap2-specific owner so the close button can be positioned at `top: 0; right: 0` and stacked above the controls.
- Repro: open `snap2-dialog.html?viewport=mobile`, configure/select a Snap2 product so the drawer opens, then try to tap the close button. Expected: close button remains visible/clickable.
- Likely files: `src/components/Snap2ViewControls.tsx`, `src/components/ConfiguratorViewControls.tsx`, `src/components/IframeContainer.tsx`, `src/components/Snap2ConfigureButton.tsx`.
- Rough fix: add `Snap2ViewControls`, move `Snap2Controls` and the Snap2 mobile close overlay into it, render it from both iframe controls and mobile drawer external controls, and use `ov:top-0! ov:right-0!` for drawer close position.
- Manual test: approved by user after checking mobile `snap2-dialog.html?viewport=mobile`; Snap2 controls remain visible, close button sits top-right and closes drawer/save flow; non-Snap2 mobile fixture still closes normally.
- Automated tests: Playwright mobile drawer click test for `.ov25-close-button`; regression assertion that non-Snap2 controls still render through `ConfiguratorViewControls`.
- Suggested branch: `fix/snap2-view-controls-owner`.

## Medium fixes with clear direction

### 39. Normal-product `inline-sticky` display mode

- Status: **NATIVE-STICKY BODY TRACK READY / AWAITING USER REBUILD** - all three stable header pages exercise real desktop/mobile viewport behavior on one DOM, active mobile sticky viewers are square, and the shared fixed-header page forces the real body-layer relocation strategy. That path now uses a browser-owned sticky boundary transition. Matching follow-up hunks are synchronized in dirty main and `.worktrees/ov25-ui-inline-sticky` but await rebuilt browser verification; Bug 39 remains unstaged and unapproved.
- Summary: standard, non-Snap2 configurators need a responsive `inline-sticky` mode. Desktop keeps the configurator and carousel pinned below an automatically detected or explicitly selected client header while the long variant list scrolls. Mobile pins the configurator below the header, portals the carousel to an optional external target, and leaves variants below it. Runtime must recover from client ancestors or short containing blocks without requiring theme edits.
- Current implementation: public/setup display mode, header auto-detection and selector override, responsive metrics, constrained square-corner mobile sticky viewer/carousel layout, compatibility-key carousel target for every non-Snap2 mode/viewport, page-scroll list headers, shared sticky-root inline and group block-start insets, setup round-trip, OV25 preview, Shopify block, three responsive scenario fixtures, diagnostics, and reversible body-level fallback are integrated. Existing `inline` keeps its configured radius and Snap2 is excluded.
- Final follow-up: retain a parent-relative natural-flow anchor before sticky positioning can clamp the host; keep native sticky at its exact threshold; switch to the reversible body fallback only when the short/client parent starts pulling the gallery away; preserve the anchor through controller recreation and body-layer relocation; clear it after a true disable, host change, or parent change; and remeasure after the current frame when host sizing is applied. Cleanup restores only CSS variables the controller actually owns. The final `scheduleMeasure({ afterCurrentFrame: true })` hunk is synchronized into `codex/inline-sticky`.
- Mobile follow-up: size the gallery to the measured document viewport even when its client column is narrow; force mobile top/bottom gaps to `0`; publish and restore `--ov25-sticky-gallery-bottom`; stick `.ov25-option-header` at that live edge and stack `.ov25-group-header` beneath it. `ProductVariantsWrapper` registers the option header for desktop or mobile sticky lists.
- Option-header follow-up: desktop list variants could paint through the resolved top gap above `.ov25-option-header`. A background-colored, pointer-events-none `::before` mask covers exactly that dynamic gap without shifting header alignment. Its original before evidence is historical rather than the current rebuild gate.
- Boundary-exit follow-up: pass `stickyLayoutSnapshot.headerOffset` separately as `occlusionTop`; Popover absolute-end owns a `clip-path` inset for only the gallery/header overlap. Fixed state and no-header state clear it, fullscreen freeze clears it temporarily and restores it on close, and disable/destroy restores merchant clipping.
- Mobile page-scroll follow-up: only normal-product mobile `inline-sticky` + list releases the variant-menu container, outer wrapper, mobile list root, content wrapper, and content to `max-height: none`, visible overflow, and document scroll. Ordinary mobile `inline` retains 600px/auto/internal scrolling with no sticky markers. The user manually confirmed rebuilt page scrolling and option/group headers are fixed.
- Native boundary-exit follow-up: when an insufficient-travel gallery column is a direct child of grid or row-flex, try reversible `align-self: stretch !important`; keep it only if native travel becomes sufficient and no other blocker needs fallback. Native browser CSS then owns boundary exit without relocation/clip updates. Ineligible or blocked layouts retain fallback. Exact merchant value/priority restores only while OV25 owns the style; external overwrite/removal is preserved. Failure cache includes geometry, constraints, and blockers so unchanged states do not loop while meaningful changes can retry.
- Parent-height decision: do not mutate generic client-owned parent height. Eligible direct grid/row-flex gallery columns first receive the bounded, reversible `align-self: stretch !important` repair, retained only when it creates sufficient native sticky travel and no other blocker requires fallback. Ineligible, still-short, or blocked layouts use the reversible body-host fallback without imposing generic theme layout changes.
- Header-alignment follow-up: font-relative `ov:px-4` resolved to an `18px` option-header inset and `14px` group-header inset. Desktop/mobile sticky-list roots now apply `padding-inline: var(--ov25-sticky-list-header-inline-inset, 14px) !important` to both header types only; ordinary inline/list spacing remains unchanged.
- Vertical-spacing follow-up: live pre-fix option/group boxes touched, but combined padding created `43px` desktop and `34px` mobile text gaps. Sticky-list group headers now apply `padding-block-start: var(--ov25-sticky-list-group-header-block-start, 0px) !important`; responsive option bottom spacing remains, and root scope excludes Snap2/ordinary inline. Review removed an unnecessary Snap2 `:not(...)` selector and found no unresolved issue.
- Responsive-fixture follow-up: the stable [no-header](http://localhost:3008/tests/inline-sticky-desktop-no-header.html), [fixed-header](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html), and [collapsing-header](http://localhost:3008/tests/inline-sticky-desktop-collapsing-header.html) pages each support desktop/mobile mode on one DOM. Viewport-neutral labels replace Desktop wording; the standalone mobile page is removed. All scenarios render a CSS-responsive external target unless `?target=missing`, with no mobile-only fixture state or forced mode.
- Actual body-layer fixture: [the shared fixed-header query](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?fallback=body-layer) combines the existing external overflow/transform blocker with a gallery-only pre-injection `showPopover()` failure. A separate probe still opens/closes through native Chromium Popover. Runtime selects `Element.moveBefore()`; its body layer is now an absolute natural-top-to-boundary track with a direct host that remains `position: sticky`, eliminating scroll-time fixed/absolute mode switching and the reproduced stale reverse-scroll frame. Focused coverage checks identity, layout stability, exact track bounds, header hit testing, immediate pre-rAF reverse geometry, full non-lifecycle style restoration, duplicates, and responsive cleanup.
- Viewer-corner follow-up: `stickyLayoutActive && isMobile` applies square corners to ProductGallery's background/outer iframe container and IframeContainer's true container/iframe. Desktop sticky and non-sticky modes retain configured radius. Resize coverage checks configured -> square -> configured; `?stackedGallery=1` uses a pre-injection target z-index to exercise the separate true-container portal path without retaining the trigger after replacement.
- Carousel relocation review: meaningful gallery/variants scope is authoritative, including direct shared-ShadowRoot siblings, so a missing product-local target cannot borrow a sibling configurator's document target. Realm checks use the owner document; OV25-only host mutations cannot destabilize `:empty` selectors, merchant mutations still invalidate selection, and removing only the owned host recreates one portal without reloading the iframe. Fresh setup defaults remain enabled, while legacy localStorage TypeSettings without `selectors.mobileCarousel` migrate disabled. The injector remains intentionally limited to one ambient document.
- Collapsing-header size follow-up: the live `--ov25-sticky-header-offset` still moves sticky top through expanded/compact/hidden states, but internal `--ov25-sticky-sizing-header-offset` retains the largest observed bottom. Available height can tighten for a newly taller header but cannot grow during collapse, so host/root/content/iframe layers and relocation placeholders remain constant through native boundary exit and fallback transitions.
- Manual review: after rebuilding, test all three stable pages at desktop and mobile widths. Check square mobile sticky viewer layers, no-header offset `0`, fixed-header tracking, collapsing offsets `94px` -> `54px` -> `0px`, external-carousel portal, page scrolling, header stacking, preserved logical inline alignment/`14px` inset, touching boxes, zero group block-start padding, and visibly reduced spacing. Use the shared no-header page to confirm ordinary mobile inline and desktop sticky remain rounded, verify `?stackedGallery=1`, then check missing-target and configured -> square -> configured resizing. On `?fallback=body-layer`, verify native probe scope, one absolute track/placeholder, a direct sticky host, exact natural-top/boundary-bottom alignment, real-header hit testing, no delayed catch-up when immediately reversing from boundary exit, and exact restoration on `&mobileMode=inline` resize; confirm Snap2 remains unchanged.
- Automated verification: the existing native-boundary focused run passed 101/101 across 7 files. Carousel/setup passes 42/42 and sticky sizing/controller/relocation passes 66/66 in both trees; `bun run type-check` passes in both, and Playwright discovery lists 21 tests. Collapsing desktop coverage compares every host/iframe layer before collapse, compact, hidden, restored, and after native boundary exit within `1px`; generated mobile coverage retains its header/corner matrix. Full E2E and manual browser review are pending the user's rebuild.
- Integration state: the OV25 preview patch is applied in dirty OV25 main and matches `review-diffs/bug-39-ov25-preview.diff`. The Shopify `extensions/ov25-configurator/blocks/ov25_sticky_mobile_carousel.liquid` block exists, validates, matches the runtime/setup selector, and remains untracked.
- Risk/blast radius: high. This touches client-owned layout, scrolling, responsive changes, portals, overlays, header animation, and setup/Shopify/OV25 contracts. Every fallback mutation must remain product-scoped and reversible; existing `inline` and Snap2 must not regress. Mobile Safari and unusual client-theme boundaries remain manual-review risks.
- Branch/worktree: `codex/inline-sticky` at `.worktrees/ov25-ui-inline-sticky`; dirty main and the worktree contain matching Bug 39 follow-up hunks while unrelated main changes remain preserved. The 39-file consolidated diff is refreshed from worktree `HEAD` `1c784b5` at 11,882 insertions and 130 deletions. Rebuild, 21-test browser rerun, manual collapsing-size/body-layer/carousel review, remaining feedback, and explicit approval remain before staging.

### 42. Snap2 side-sheet module cards need dimension and movable actions

- Status: **PARKED FOR POST-RELEASE** - Bug 42 code was removed from dirty main during the completed release cleanup. The retained artifact historically implemented anchored custom-dimensions popovers and one open editor per module surface. Retained review packet: [PARKED_BUGS.md](PARKED_BUGS.md).
- Source item: Snap2 module cards in the left/right modules sheet do not expose the `Edit dimensions` or `Place movable object` actions that already exist in `ModuleBottomPanel`.
- Summary: when compatible modules are displayed in the side sheet through `Snap2ModulesSheet` -> `Snap2ModulesOptionBody` -> `ModuleVariantCard`, users can add/open a module but cannot choose custom dimensions or start movable placement. The bottom module panel already supports both actions.
- Repro: open [snap2-dialog.html?md=left&mm=left](http://localhost:3008/tests/snap2-dialog.html?md=left&mm=left), configure a Snap2 scene, open compatible modules, and inspect a variable-dimension or movable module card in the side sheet. Expected: the relevant action buttons are available on that card. Current: neither action is rendered.
- Likely files: `src/components/VariantSelectMenu/ModuleBottomPanel.tsx`, `src/components/VariantSelectMenu/Snap2ModulesOptionBody.tsx`, `src/components/VariantSelectMenu/variant-cards/ModuleVariantCard.tsx`, and possibly a new shared module-card action helper/component.
- Rough fix: share the existing bottom-panel action behavior. Add a reserved top-right icon rail for eligible cards and show only actions supported by that module (`variableDimensions` and/or `isMovable`). Every dimensions editor must portal into the same shadow root as a viewport-safe anchored popover so it never changes card/list layout or gets hidden by sheet transforms/clipping. Parent module surfaces own one active module key so opening a second editor closes the first. Action clicks must stop propagation, respect `isModuleSelectionLoading`, preserve `uniqueId`, and invoke `selectModule` with either `customDimensions` or `placeMovable: true`.
- Placement note: top-right should work if the card reserves a fixed action rail or positions the buttons over a padded thumbnail area. Do not place an unreserved overlay over the existing name row/details trigger. Verify cards exposing both actions at the narrowest mobile side-sheet width.
- Manual test on post-release resumption: follow Bug 42 in [PARKED_BUGS.md](PARKED_BUGS.md) across LEFT/RIGHT/BOTTOM/mobile fixtures; verify every dimensions form floats without reflow, one editor per surface, scroll/viewport tracking, cancel/submit focus, movable placement, no-action cards, and the combined Bug 43 narrow-card layout.
- Historical verification: 39/39 focused Bug 42 tests and 58/58 combined Bug 42/Bug 43 tests passed; TypeScript and diff checks passed. Coverage includes eligibility, payloads, one-active state, owner-document/visual-viewport geometry, transforms, refresh reconciliation, duplicate identities, rejection/focus, and keyboard activation. Final independent review found no P0-P3 issues.
- Risk/blast radius: `ModuleVariantCard` is shared by initialise, side-sheet, desktop list, and mobile carousel paths. Gate the new controls explicitly to the compatible-modules side-sheet context so initialise cards and unrelated module cards do not change.
- Suggested branch: `fix/snap2-side-sheet-module-actions`.

### 43. Show Snap2 module name and price on cards and detail titles

- Status: **PARKED FOR POST-RELEASE** - Bug 43 `ov25-ui` code was removed from dirty main during the completed release cleanup, and the OV25 side was never applied to current OV25 main. Both sides remain only in retained artifacts/worktrees. Historical independent review found no P0-P3 issues. Retained review packet: [PARKED_BUGS.md](PARKED_BUGS.md).
- Source item: every Snap2 module card should show its price after the module name, separated by a dash. `ModuleBottomPanel` should contain the same name/price line below the image but hide it by default, and the module information sheet title should include the price.
- Summary: `ModuleVariantCard` currently shows the module name but no price; `ModuleBottomPanel` shows neither name nor price below its image; `ModuleVariantDetailPanel` shows only the name in its visible title. The `COMPATIBLE_MODULES` message currently supplies no price field, so this requires an OV25 message-contract change as well as `ov25-ui` rendering.
- Repro: open [snap2-dialog.html?md=left&mm=left](http://localhost:3008/tests/snap2-dialog.html?md=left&mm=left), configure a Snap2 scene, and inspect compatible modules in the side sheet, bottom panel (`md=bottom`), and a module's `See more...` detail sheet. Current: no module price appears in any surface, and the bottom-panel card has no mounted name line below the image.
- OV25 data source: `OV25/hooks/iframe-configurator/useIframeMessaging.ts` builds `COMPATIBLE_MODULES` through `enrichModules()`, but currently sends product metadata/model/dimensions only. `OV25/hooks/useSnap2TotalPrice.ts` already resolves unit prices from the candidate product SKU plus the currently selected shared Snap2 option SKUs. Prefer extracting/reusing that resolver so card prices and checkout prices cannot drift.
- Confirmed pricing contract: show the configured unit price, including the currently selected shared Snap2 options. When that unit has a discount, show its original/subtotal price and discounted total with the same visual and interpolation behavior as `Price.tsx`; undiscounted units show only the current total. OV25 remains responsible for calculating the values so compatible-module cards and checkout totals cannot drift.
- Message contract: add optional `unitPrice: { subtotal, formattedSubtotal, totalPrice, formattedPrice, discount: { amount, formattedAmount, percentage } }` to each compatible module; numeric values are pence. Omit `unitPrice` only when pricing cannot resolve, never for a valid zero. Keep it additive so either repository can deploy first.
- Rough cross-repo fix: extract a pure OV25 configured-unit resolver shared by compatible candidate pricing and `useSnap2TotalPrice`, then extend the compatible-module payload. Update `ov25-ui`'s `CompatibleModule` type and comparator, remap every formatted unit-price field through `flags.currencySymbol`, and tolerate older iframe payloads that omit pricing. Extract the reusable price presentation from `Price.tsx` into a data-driven component, then use it for the main product price and module price surfaces without coupling module cards to global context price state.
- String replacement contract: keep the existing `Price.tsx` price/subtotal/savings behavior through a context-free shared presenter, but use module-specific `modulePriceValue`, `modulePriceSubtotal`, `modulePriceSavingsAmount`, and `modulePriceSavingsPercentage` keys so module copy can differ without changing the main product price. Use a separate replaceable `moduleNamePriceSeparator` because rich struck-through price markup cannot be interpolated into one string template. Continue using `productName` for the module name. Do not route ARIA-only labels through string replacements.
- Targetable DOM: provide stable wrapper and subpart hooks on every surface, including `.ov25-module-name-price`, `.ov25-module-name`, `.ov25-module-name-price-separator`, and `.ov25-module-price` (plus equivalent `data-ov25-*` part attributes). Keep name, separator, and price nodes mounted even when the bottom-panel line is hidden by default, so client CSS can reveal/style them.
- Bottom-panel behavior: insert the mounted name-price line directly below the module image. Hide the line by default through a stable class/data state rather than conditional rendering. Ensure revealing it with custom CSS does not make the fixed-height bottom panel clip or overlap the tabs/actions.
- Initialise-menu compatibility: preserve approved Bug 11 behavior. Both the name-price line and tooltip stay mounted; desktop hides the line and shows the tooltip by default, while mobile shows the line and hides the tooltip by default. The tooltip must include the same module price/discount information rather than removing `hideVisibleName`.
- Pricing behavior: respect `flags.hidePricing`; when pricing is hidden or a module has no resolved price, show the module name without a dangling dash. Zero is a valid resolved price and should render as formatted zero rather than being treated as missing. Discounted modules must expose targetable current-price and struck-through subtotal nodes matching the main price semantics.
- Manual test: compare side sheet, bottom panel, and detail sheet at desktop/mobile widths; verify undiscounted `Name - Price`, discounted subtotal/current-price presentation, custom currency symbol, hide-pricing behavior, zero/missing prices, bottom-panel default-hidden DOM, CSS reveal, string replacement interpolation, targetable selectors, and no clipping with Bug 42's two top-right action buttons.
- Automated tests: OV25 unit coverage proving compatible-module pricing reuses checkout configured-unit and discount semantics; message payload contract test; shared price-presentation tests; `ov25-ui` component tests for discounted/undiscounted visible and hidden name-price states, zero/missing price handling, `hidePricing`, string interpolation, targetable selectors, and detail-title output; Playwright screenshot after compatible-module fixture data loads.
- Historical verification: 63/63 combined Bug 42/Bug 43 `ov25-ui` tests, root type-check, and the deterministic module-card geometry Playwright test passed. OV25's 33 focused pricing/message tests, type-check, lint, and diff checks passed. Both isolated artifacts applied cleanly; final independent review was clean.
- Manual test on post-release resumption: follow section 43 in [PARKED_BUGS.md](PARKED_BUGS.md) after rebuilding `ov25-ui` and reloading local OV25. Check left/right/bottom/mobile module surfaces, discounts, details, hidden bottom DOM/CSS reveal, Bug 11 visibility, and Bug 42 narrow-card coexistence.
- Risk/blast radius: pricing is a cross-repo public message contract. New fields are additive and missing prices remain supported. Bug 42 and Bug 43 share module-card layout; their historical integrated review state and overlap tests passed, but real product/font/custom-CSS combinations still need manual review after both artifacts are reapplied.
- Suggested branches: `fix/snap2-compatible-module-prices` in OV25 and `fix/snap2-module-price-labels` in `ov25-ui`.

### 44. Snap2 dialog toasts appear below Snap2 controls

- Status: **FIXED / APPROVED / COMMITTED** - manually approved and committed to OV25 `main` as `6731b81b` on 2026-07-15; present on `origin/main`.
- Source item: Snap2 dialog runtime toasts such as `Not enough space!` render underneath `#ov25-snap2-controls`, so the message is partly or fully hidden.
- Confirmed root cause: `Not enough space!` is emitted by OV25's `react-hot-toast` inside the configurator iframe. `#ov25-snap2-controls` is rendered by `ov25-ui` in the parent document above the iframe. Nothing rendered inside an iframe can out-z-index a parent-document sibling, regardless of the toast's internal z-index. Snap2 dialog itself is a custom fixed ShadowRoot surface, not a native `<dialog>`.
- Repro: open [snap2-dialog.html](http://localhost:3008/tests/snap2-dialog.html), configure a scene, then trigger a placement/space validation toast such as `Not enough space!`. Expected: toast is fully visible above the Snap2 controls. Current: controls paint over it.
- Fix: keep the existing iframe-local OV25 toast and give embedded Snap2's top-center toaster a `72px` top offset, clearing the controls' top offset, height, and a small gap. Standalone Snap2 and other OV25 toaster callers keep the default position.
- Changed areas: OV25 `AllPositionToaster`, Snap2 caller wiring, and one focused component test. The abandoned cross-frame bridge was removed from `ov25-ui`.
- Manual test: passed by the user in desktop/mobile dialog and inline modes; the toast appears fully below the controls.
- Automated verification: OV25 2/2 focused tests and type-check pass; diff checks and isolated-worktree equivalence pass.
- Risk/blast radius: the fixed `72px` offset assumes the controls remain one row at their current size; non-Snap2 callers are unchanged.
- Suggested branch: `fix/snap2-dialog-toast-layer`.

### 45. Preserve product images on normalized commerce lines

- Status: **PARKED FOR POST-RELEASE** - Bug 45 code was removed from dirty main during the completed release cleanup; only the retained isolated artifact and historical evidence remain. Retained review packet: [PARKED_BUGS.md](PARKED_BUGS.md).
- Source item: the image-source audit left an unresolved choice between copying `productBreakdowns[].image` into normalized checkout lines or making host integrations recover product images themselves.
- Summary: `CURRENT_PRICE.productBreakdowns` may already contain a valid product image, but `normalizeIframeCommercePayload()` omits it when producing the stable `lines[]` callback contract. Consumers using only normalized lines lose data that is present in the same payload.
- Repro: normalize a `CURRENT_PRICE` payload whose first `productBreakdowns` item contains `image`. The raw breakdown retains that value, but `normalized.lines[0].image` is absent.
- Expected: a valid source image is copied to the corresponding normalized line. Missing or invalid image values remain omitted; existing SKU, quantity, price, option, and currency behavior remains byte-compatible.
- Rough fix: add an optional image field to the public normalized commerce-line type and map a validated non-empty image URL/string from each source breakdown. Keep this additive and avoid image-source fallback or URL rewriting in the normalizer.
- Manual test: inspect a callback payload from a product whose `CURRENT_PRICE` breakdown includes an image and confirm the corresponding normalized line exposes the same image. Confirm a payload without images remains unchanged.
- Automated tests: valid image preservation, absent image omission, malformed/non-string image omission, and regression assertions for existing normalized line fields.
- Historical verification: focused tests passed 7/7, root TypeScript and scoped diff checks passed, the isolated artifact applied cleanly, and independent review had no remaining findings. Exact-preservation coverage includes surrounding whitespace to prove the returned string is not normalized.
- Review packet for post-release resumption: follow Bug 45 in [PARKED_BUGS.md](PARKED_BUGS.md); compare `price.productBreakdowns[0].image` with `price.lines[0].image` in the logged Snap2 `onChange` payload.
- Risk/blast radius: low. Public callback shape gains one optional field; consumers ignoring it are unaffected. Do not formalize tiered gallery-image input types as part of this bug.
- Suggested branch: `fix/normalized-commerce-line-images`.

### 46. Public product-image types reject runtime-supported image tiers

- Status: **FIXED / APPROVED / STAGED** - manually approved and exact three-file type-contract hunks staged on 2026-07-15; tracker/review documents remain unstaged.
- Source item: the image-source audit found that `injectConfigurator({ images })` accepts tiered product-image objects at runtime, while the exported TypeScript API still declares only `string[]` and does not export the existing `ProductImageInput` type.
- Summary: TypeScript consumers cannot pass the same nested image-tier objects that `ov25-ui` already resolves internally. A valid object such as `{ alt, urls: { hero, image, small_image, thumbnail, original } }` fails assignment to `InjectConfiguratorOptions.images`, and consumers cannot import `ProductImageInput` from the package root.
- Repro: compile a package consumer that imports `injectConfigurator` and calls it with `images: [{ urls: { hero: '/hero.jpg', thumbnail: '/thumb.jpg' } }]`; TypeScript reports that the object is not assignable to `string`. Importing `ProductImageInput` from `ov25-ui` also fails because it is not root-exported. Raw string images compile and run today.
- Existing runtime behavior: `ProductImageInput` already exists in `src/lib/utils.ts`, and the gallery resolvers accept either strings or nested `.urls` tiers. Main-poster precedence is `hero`, `image`, `small_image`, `thumbnail`; horizontal, stacked, and fullscreen surfaces retain their existing surface-specific tier order. This bug must not alter those runtime orders.
- Rough fix: widen the public, grouped, legacy, normalized, provider, and context `images` fields from `string[]` to `ProductImageInput[]`; export `ProductImageInput` from the package root. Do not change carousel/gallery rendering, setup state, or Bug 15 variant-thumbnail `srcset` code.
- Manual/type test: approved by the user. A no-emit TypeScript consumer probe can import `ProductImageInput` from the package root and pass both raw strings and tiered objects to `injectConfigurator`; this is a compile-time contract fix, so no before/after screenshot is expected.
- Automated tests: no dedicated Bug 46 test file. Verify the root type export and `InjectConfiguratorOptions.images` with the no-emit consumer compile described above.
- Verification: root no-emit TypeScript and scoped diff checks pass; the 82-line isolated artifact applies cleanly to a clean index with strict whitespace checking; independent review found no P0-P3 issues.
- Risk/blast radius: low. JavaScript behavior is unchanged and `string[]` remains valid. The main risks are missing one public/context declaration or accidentally changing existing tier precedence. Keep the patch type-focused and additive.
- Suggested branch: `codex/bug-46-product-image-input` in isolated worktree `.worktrees/ov25-ui-bug-46-product-image-input`.

### 47. Hide the OV25 3D drag indicator

- Status: **COMPLETED / MANUALLY APPROVED / OV25-UI SENDER STAGED / OV25 RECEIVER COMMITTED** - approved by the user on 2026-07-17. The exact 12-file `ov25-ui`/setup sender patch is staged; the OV25 receiver is committed on `main` as `c41770ae`. Archived packet: [bugs-resolved.md](bugs-resolved.md#47-hide-the-ov25-3d-drag-indicator).
- Public contract: grouped `flags.hideGestureHint?: boolean`, default `false`. No legacy flat alias was added.
- Setup: Behaviour toggle label is exactly `Hide 3D Drag Indicator`; the value persists in setup state and is included in preview, import, save, and JSON round-trip flows.
- Runtime: `hideGestureHint=true` is added to Standard, Snap2, Bed, and Dining OV25 iframe URLs; the parameter is removed when the flag is false or omitted.
- OV25 receiver: a shared strict query parser/render hook suppresses the hint only for literal `hideGestureHint=true` and is wired into Standard, Snap2, Bed, and Dining while preserving existing visibility gates.
- Verification: manual setup-to-iframe behavior approved by the user; `ov25-ui` 10/10 plus root/setup TypeScript; OV25 scratch 14/14 plus TypeScript. Cross-repository review found no correctness issues.
- `ov25-ui` implementation diff: [review-diffs/bug-47-ov25-ui-hide-gesture-hint.diff](review-diffs/bug-47-ov25-ui-hide-gesture-hint.diff).
- OV25 implementation diff: [review-diffs/bug-47-ov25-hide-gesture-hint.diff](review-diffs/bug-47-ov25-hide-gesture-hint.diff).
- OV25 commit: `c41770ae` (`feat(configurator): add gesture hint opt-out to iframe queryParams`).
- Risk/blast radius: low and additive. Existing configs default to visible gesture hints, and false values do not alter iframe URLs.

- Default variant image / no thumbnails: repro fixture approved and staged on 2026-07-09 as `gallery-inline-list-no-variant-thumbs.html`. Production fallback is blocked until parked Bug 15 is redesigned and resumed. Placeholder URLs are injected before cards render in list/tabs, accordion, tree, wizard, and size-card paths, which masks all-missing-image groups. A redesigned real-thumbnail signal can then support `hasRealImage` or equivalent on `Variant` and compact image-free/text cards at group/render level when every variant in that option/group lacks real image URLs. Avoid a generic placeholder because it keeps the current repeated-placeholder UX.
- Hide Buy Now button too: approved and staged. Adds `flags.disableBuyNow` as the sole key, plus the setup Behaviour toggle/export and runtime checkout filtering for standard, mobile, Snap2, and wizard review flows.
- Bug 15, thumbnail `srcset`: **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md). Manual inspection found invalid width descriptors (`?w=50` advertised as `120w`, `?w=150` as `240w`, and `?w=250` as `480w`), so the changes were removed from main and require redesign before review resumes.
- Inline variants appear when Configure button is selected and Variant Controls off: Bug 13 is **NEEDS BEHAVIOR DECISION** after browser/source review on 2026-07-16. `?inline=1` suppresses inline controls but leaves the replaced Configure target empty; `?inline=1&variants=1` renders one inline variants panel and no Configure button. The old visible-button acceptance criterion is invalid without defining click behavior because pure inline desktop mode mounts no overlay. Decide whether setup/runtime should reject or omit Configure-without-Variant-Controls in inline mode (recommended), or support a new hybrid where Configure opens variants in a sheet/drawer while the viewer stays inline.
- Bug 12, auto-open configurator in setup: **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md). Its code was removed from dirty main; the retained proposal uses the same open path as a real Configure click. The temporary local `configurator-setup-preview.html` duplicate has been removed; setup preview testing should use OV25's `/configurator-preview` while the OV25 dev server is running.
- Variants square by default: status ready for manual review. Runtime CSS and setup `Variant shape` default now use `0px`, while explicit setup/custom CSS overrides still win.
- Swatch-book empty-slot shape/mobile wrap: **approved and staged as Bug 19**. Empty slots render the shared solid jagged `SWATCH_PATH`; selected and empty entries share two equal responsive mobile columns, while tablet/desktop sizing and plus/remove/zoom behavior remain unchanged.
- Bed checkout line item `£` props: **already fixed upstream / not reproducible with current OV25**. OV25 commit `b9cf4049` disables standard single-product pricing for bed mode and emits `productBreakdowns`, which clean `ov25-ui` already remaps.
- Bug 41, Snap2 name selector fallback: **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md). The sender proposal was never applied to current OV25 main; the retained artifact canonicalizes standard flat and Snap2 nested range input before sending the same flat `RANGE` payload. `ov25-ui` consumes it directly with no compatibility normalizer; `Name.tsx` stays unchanged. Historical verification: sender tests passed 10/10, Name regressions passed 4/4, and type-checks passed.
- Carousel max images: current slicing happens before inserting the 360 slot in `src/components/product-carousel.tsx`, so `maxImages.desktop = 16` means 16 image thumbnails plus a 360 item. The inject type currently describes this as "Max images to show in carousel", which supports the existing behavior. Need decide whether to preserve this as "maximum product/gallery images" or change it to "maximum total carousel thumbnail items including 360" before implementing.
- Bug 38, carousel thumbnail selected-state data attribute: **approved and committed 2026-07-10** as `1c784b5`. The commit contains only the two `data-selected` source hunks and the 69-line selected-state test; Bug 39 carousel/popover hunks remain unstaged. Tracker/review documents remain uncommitted.
- Safari thumbnail offset: not reproducible on the clean baseline in Safari as of 2026-07-10. The proposed `display: block` change was discarded; reopen only with a concrete failing client/fixture repro.
- Z-index/gallery/fullscreen issues: Bug 16 was already resolved by commit `3d0ceb5`; no new fix was required. Playwright on the clean `gallery-carousel-stacked.html` fixture confirmed a fullscreen image opens and covers the viewer controls; the old `single-product-gallery.html` baseline was horizontal and invalid. Other z-index symptoms still need exact repros before broad cleanup.
- Snap2 mobile modal mounts drawer behind modal / Snap2 mobile drawer checkout overflows: fixed as Bug 26 and staged on 2026-07-09. When a Snap2 Shopify/runtime config uses `configurator.displayMode = { desktop: "modal", mobile: "modal" }`, mobile now renders the Snap2 modal path without the standard modal/mobile drawer gallery/initialise drawer portal/`#ov25-mobile-drawer-container`. The mobile Snap2 modal keeps a visible configurator/gallery area above the constrained variants/modules panel, removes desktop side-radius data from the lower mobile panel, removes bottom iframe/slot radius where the 3D area meets the lower panel, and keeps `View Cart` checkout sheets contained inside mobile dialog/drawer panels so their item lists scroll and the footer remains reachable.
- Bug 40, saved Snap2 configurations load `.zcpb` models: **approved locally, committed, and pushed 2026-07-10** as `bd5ebbd9` on OV25 branch `snap2-configuration-uuid-zctb`; awaiting coworker review and merge to main. `loadSaveConfiguration.ts` normalizes saved asset URLs by removing query parameters and trailing instance suffixes, then loads `.zcpb` through the shared `zcpbLoader`.
- Bug 31, Snap2 saved configuration restores attachment points: **resolved as not reproducible 2026-07-10**. Manual testing could not reproduce the missing attachment points or nested save-dialog failure. Proposed Bug 31 worktree/review-patch changes are historical only and must not be staged or merged without a concrete reproduction.
- Bug 30, Snap2 overlapping footstool replacement crash: **⚪ NOT REPRODUCIBLE / PROPOSAL DISCARDED**. Baseline testing on 2026-07-13 did not reproduce a crash before any patch was applied. No fix was accepted; the five-file proposal was discarded and its OV25 worktree/branch were removed.
- Bug 27, Snap2 movable objects in stratosphere: **approved and committed 2026-07-13** as `3541b736` on branch `snap2-draggable-objects-bounds`. Clamps floor-plane X/Z drag targets to padded Snap2 scene bounds, rejects non-finite hits/sizes, and exits drag mode even when a final invalid target cannot be applied.
- Bug 28, Snap2 movable object mouse-wheel rotation: **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md). It was never applied to current OV25 main; in the retained proposal, wheel events over the 3D canvas rotate the dragged movable in Snap2's existing 90-degree orientation/clockwise-rotation increments; normal wheel behavior is unchanged outside active placement.
- Safari selection thumbnail offset: not reproducible on the clean baseline in Safari as of 2026-07-10. No runtime change retained.
- Bug 29 correction, SwatchBook-only jagged geometry: **approved and staged 2026-07-17** as the exact two-file review patch. Normal `VariantThumb` rendering again honors ov25-setup `Variant Shape` / `--ov25-variant-thumb-border-radius`, while `SwatchBook.tsx` and its jagged `SWATCH_PATH` rendering remain untouched. TypeScript, isolated diff, and manual fixture checks passed.
- Multi-line item support hide options: expose/apply `hideOptions` to multi-line cart property generation.

## Larger / architectural items

- Selection postMessage readiness/queue: **wont fix** as of 2026-06-18. The suspected bug appears to be a misunderstanding of the inline variants flow: variants are rendered only after `CONFIGURATOR_STATE` arrives from the iframe, so the iframe has already proven it can send state before the user can click these controls. The normal baseline applies immediate selections reliably, and no real failing repro remains. The experimental worktree/diff should not be approved or staged unless a new reproducible edge case is found.
- Bug 35, `configurator-style-variables.tsx` drift: **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md). It was never applied to current OV25 main; the retained worktree proposal would redirect the OV25 manufacturer setup route to the package-backed `/configurator-setup`, make the preview import `SerializableInjectConfig` from `ov25-setup`, and remove the obsolete local OV25 admin setup editor/style-variable copy.
- WooCommerce/Shopify dependency on OV25 iframe/setup version: architecture work. Need define one schema/version owner and stop duplicating preview/setup config across `ov25-ui`, `ov25-setup`, OV25, Shopify, and Woo. Likely requires a versioned setup-config contract and release/deployment plan rather than a single bug patch.
- Where images come from: inspected 2026-06-03 and documented in `docs/image-source-precedence.md`. Current product gallery precedence is host/inject `images[]`, then OV25 product metadata (`heroImage`, `cutoutImage`, `images[]`), with a `cutoutFirst` exception on mobile or non-`deferThreeD`. Variant thumbnails currently use their existing single-source fallback; Bug 15's proposed responsive `variant-image-srcset` path is parked for redesign. Module previews prefer cutout, hero, images, then `imageUrl`. `ov25-ui` has no Woo/Shopify-specific image mapping; storefront integrations should normalize platform media before calling `injectConfigurator`.
- String interpolation/custom icons/data selectors everywhere: partly underway, but this is a broad API/design-system pass, not a quick bug. Setup catalog entries for existing name selectors were approved and staged as Bug 32; the first bounded runtime name-selector slice is **PARKED FOR POST-RELEASE** as Bug 33 in [PARKED_BUGS.md](PARKED_BUGS.md), with worktree `codex/runtime-name-selectors` retained. Full custom text/icon replacement and exhaustive selector coverage remain open.
- Filter display redesign: product/design work; not a bug-sized patch. Needs target UX for default filter visibility, side-swipe behavior, sticky/scrolling header names, mobile/desktop differences, and setup controls before implementation.
- Shopify theme line-item-property automation: completed in current OV25. It includes local ZIP/directory patching plus an admin-only Shopify API patcher with scan, diff, apply, checksum protection, audit history, and rollback.
- Identify missing docs: read-only audit saved in `docs/ov25-docs-gap-audit.md`. Actual `ov25-docs` updates remain open and should wait for pending review items before documenting those features as shipped.
- Z-index reasonableness, Bug 23: **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md). It was previously approved and committed as `eaa808d`; the semantic inverse is complete and unstaged in main for the upcoming release, without rewriting history. The retained implementation adds named body-level layer constants, gives drawer/modal/popover, swatchbook/toaster/Snap2 checkout, and Snap2/AR dialog host distinct ordering, and replaces relevant raw z-index literals in `inject.tsx`, `iframe-transition-snapshot.ts`, and `dialog.tsx`. Read-only audit: `docs/z-index-layer-audit.md`.

## Needs clarification from user

- For bed current-size filtering: always on for bed configs, or just the setup default?
- For data selectors for names: Bug 32 setup catalog entries were approved and staged; Bug 33 runtime selector slice is **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md). Need decide whether the next slice should continue exhaustively across every remaining runtime text/name surface, or wait and treat this as part of the broader string interpolation/custom icon architecture pass.
- For default/no-thumbnail variants: repro fixture is approved/staged; current recommendation is compact image-free/text cards when every selection in an option/group lacks real thumbnail URLs. This is blocked until parked Bug 15 is redesigned and resumed; then confirm the desired fallback before implementing it.
- For carousel max images: should the 360 slot count toward the configured max? Current code treats `carousel.maxImages` as "max product/gallery images": `src/components/product-carousel.tsx` slices `allImages` first, then inserts the 360 placeholder with `carouselItems.splice(galleryIndexToUse, 0, { is3D: true })`. The public type comment in `src/types/inject-config.ts` also says "Max images to show in carousel". If the desired UX is "max total thumbnail items", change semantics and add a regression fixture/assertion for `gallery-carousel-horizontal.html` where `maxImages.desktop = 16` renders 15 images + 360 instead of 16 images + 360.
- For image contain/selected gallery behavior: horizontal carousel clicks currently set `galleryIndex`; the selected in-page product image is rendered by `IframeContainer` with `object-cover`, while stacked gallery clicks open a fullscreen overlay that already uses `object-contain`. Decide whether to change only the in-page selected image to `object-contain`, or to make horizontal image clicks open the same fullscreen contain overlay instead of replacing the 360 slot.
- For mobile woods 403: need affected product/page and the failing image URL.
- For mobile wizard next button: not reproduced on 2026-06-02 with `gallery-sheet-wizard.html` at mobile viewport. After clicking Configure, the drawer is 490px tall, NEXT is in viewport, and clicking NEXT advances to Step 2. Need exact fixture/device/browser where it fails.
- For Ziggy variants hidden but still appearing: need exported JSON/current config to distinguish stale config from inject bug.
- For BUY NOW over fullscreen gallery: need exact page/layout where it reproduces; current overlay uses max z-index, so it may be a portal/shadow stacking context issue.
- For gallery scrolling page behind: need exact fixture/layout and input type. `gallery-carousel-horizontal.html` has a scrollable `.ov25-thumbnail-scroll`; source already prevents wheel bubbling while that strip can scroll. The remaining symptom may be touch scrolling, stacked/fullscreen gallery, or a specific theme overflow ancestor.
- For Snap2 ghost box: should this re-enable the old selected-attachment preview box as a rough preview, build an exact preview from the hovered/selected candidate module dimensions, or apply only to movable drag placement? Worker evidence: `Snap2Model.tsx` has `ENABLE_ATTACHMENT_PREVIEW_BOX = false`, the disabled preview uses the currently attached object's bbox rather than the candidate module, and git history says the feature was temp-disabled.
- For Snap2 Arlo `ModuleBottomPanel`: does "does not start in the correct place" mean the module picker should initially dock somewhere other than `bottom`, or that the bottom panel carousel starts centered instead of aligned to the first/active module? Evidence points to `snap2-dialog.jsx` using Arlo `snap2/22` with modules position `BOTTOM`, while `ModuleBottomPanel.tsx` anchors the panel bottom and centers carousel content with `ov:justify-center`.
- For mouse settings/disable pan: should this add an `ov25-ui` inject/setup-level override that disables pan/zoom/rotate for iframe cameras, or rely on existing OV25 per-camera admin settings? Worker evidence: OV25 `CameraContext` and `SceneControls` already support `enableZoom`, `enablePan`, and `enableRotate`, and OV25 admin camera settings expose those switches, but `ov25-ui` inject config and iframe URL/message plumbing do not expose a runtime override.
- For Unified menu/select side: the distinct Bug 34 setup controls/export proposal for Snap2 variant sheet side and module panel position is **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md); it was not applied to current main, its worktree `codex/setup-snap2-position-controls` is retained, and the approved committed Bug 24 equivalent remains in main. If this item also meant runtime attachment-side selection inside the Snap2 module picker, that remains a separate clarification.
- For defer3D modal/sheet follow-ups: not covered by Bug 3. Local checks on 2026-06-03 did not reproduce against `single-product-gallery.html?defer3d=1` or `configure-button-modal.html?defer3d=1`; after open/close, sheet/gallery returned the iframe to the visible page gallery and modal/no-gallery returned it to the hidden deferred preload container. Need exact failing fixture/page if still happening.
- For multi-line item hidden options: `variants.hideOptions` is currently documented and implemented as UI-only via `normalizeHideVariantOptions`; normalized `CURRENT_SKU`/`CURRENT_PRICE` callback payloads preserve hidden options in `skuMap`, `price.lines[].selections`, `priceBreakdown`, and raw `productBreakdowns`. Compatibility-safe options: keep `hideOptions` UI-only and filter cart properties in Shopify/Woo/host callbacks, or add a new opt-in payload filter such as `commerce.hideOptionsFromLineItems`. Avoid silently changing `variants.hideOptions` to mutate public callback payloads unless this is accepted as a breaking behavior change.
- The Alexis block needs a target outcome: fixture to create, bug to fix, or data/config to validate.

---

- [x]  remove typography (actually i just fixed it)
- [x]  remove various options when configuring snap2 in /ov25-setup
- [x]  leaving the tab causes reset OH NO
- [x]  ov25-variant-header-logo show/hide
- [x]  some buttons dont take the color

- [x]  ooof actually fullscreen button still does not ? check:   couldnt replicate.

- [ ]  need a nice default variant image - detect when there aren’t any variant thumbs and display a list option instead - repro fixture approved/staged; production fallback is blocked until parked Bug 15 is redesigned and resumed. Then add an explicit real-image signal and render compact image-free/text cards at group level when all variants lack real images.

- [x]  need simple button to hide buy now button too - approved and staged; `flags.disableBuyNow` is the sole supported key and is covered by setup export plus runtime/e2e checkout behavior.
- [ ]  Bug 39, normal-product `inline-sticky` display mode - **STABLE COLLAPSING-HEADER SIZE / AWAITING USER REBUILD**. The responsive matrix now requires constant desktop viewer/iframe height through collapse and boundary exit, while retaining mobile corner/header coverage, body-layer forcing, and carousel reconciliation. Playwright discovery lists 21 tests; build, full E2E, and manual collapsing-size/body-layer/carousel review are pending. Keep unstaged and unchecked until verification and explicit approval; it is not stage-ready.
- [x]  recline online power options not showing pricing - new pricing grade feature responsible? (snug range)
- [x]  dont show ‘product’ on shopify snap2 cart (its already in the title)
- [ ]  remove the permissions 500 error from vercel - Bug 36 is **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md); it was never applied to current OV25 main, and OV25 worktree `codex/permissions-500-vercel` is retained, the page-level permission gate looked correct in code review, and the CRLF-sensitive diff artifact was regenerated so it applies cleanly in a fresh OV25 context.
- [x]  fix shopify targeting wrong form for arighi
- [ ]  make thumbnails pass srcset to img so that all small, medium, large and .thumbnail are available on each selection - Bug 15 is **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md). Manual inspection found invalid width descriptors (`?w=50` advertised as `120w`, `?w=150` as `240w`, and `?w=250` as `480w`); changes were removed from main and need redesign.
- [ ]  Data selectors for names - setup-only catalog partial was approved and staged as Bug 32. The first bounded runtime selector slice, Bug 33, is **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md); its code was removed from dirty main and worktree `codex/runtime-name-selectors` is retained, covering size names, option header label spans, tab names, wizard step/review names, Snap2 checkout selection names, bottom-panel module tooltip names, custom-dimension product name, and module type/position tab labels. Full string interpolation/custom icon coverage remains a broader architecture pass.
- [x]  configurator controls are showing above gallery images in some situations (test file - “Full Gallery (sheet + tabs)”) - Bug 16 was already resolved by `3d0ceb5`; Playwright confirmed the clean `gallery-carousel-stacked.html` fixture opens a fullscreen image above the viewer controls, so no new fix was required.
- [x]  fix double swatches on recline-online (MATERIALS / FABRICS ) - frontend/endpoint fix by diffing against all selections
    - [x]  FABRICS is the correct one
    - [x]  some fabrics have wrong name - should all the AMBLER
- [x]  setup recline-online discount code
- [x]  ov25-setup doesnt inject swatches (missing placeholder or something?) actually asthall-grand-sofa just had no swatches enabled
- [ ]  theres separate `configurator-style-variables.tsx`in OV25 and ov25-setup. and they have drifted. not sure what solution is here. is one obsolete? (yes, OV25 stuff can be deleted) - Bug 35 is **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md); it was never applied to current OV25 main, and OV25 worktree `codex/setup-style-variable-drift` is retained.
- [ ]  woocommerce/shopify is dependant on OV25 iframe which has specific ov25-setup version, need to untangle this somehow - architecture task; needs a versioned setup-config/schema owner and release plan across `ov25-ui`, `ov25-setup`, OV25, Shopify, and Woo before coding.
- [x]  make deferThreeD work with stacked gallery (previously only with carousel)
- [x]  there are two X buttons on “variants sheet”, “wizard”
- [ ]  Only show current size on bed config - existing filter is implemented but defaulted off. Needs decision: make setup defaults true only, or add runtime default-on for existing `bed-configurator/` embeds when no explicit filter config is provided.
- [x]  snap2 with configurationUuid not working - attachment points missing - Bug 31 resolved as not reproducible on 2026-07-10; no attachment/recompute/layering changes will be merged. The separately reproducible Bug 40 `.zcpb` loader prerequisite remains committed as `bd5ebbd9` on `snap2-configuration-uuid-zctb`, awaiting coworker review/merge.
- [ ]  BUY NOW appears above the fullscreen gallery images in some situations - Bug 16's existing `3d0ceb5` fullscreen-gallery fix likely covers this, but a separate exact repro is still required if the symptom remains, especially with Snap2 checkout open.
- [x]  default displaymode is inline ??? ensure no breakages - verified 2026-06-02 for standard layouts; Snap2 setup was narrowed on 2026-07-08 to desktop `Dialog`/`Inline` and mobile `Dialog`/`Drawer`/`Inline`, and now defaults to `modal`/`modal`.
- [x]  variants square by default - Bug 18 manually approved and exact two-hunk patch staged 2026-07-17; runtime and ov25-setup defaults are `0px`, while explicit radius overrides remain supported.
- [x]  Swatch looking variants ? jaggy outlines - Bug 29 correction approved and staged 2026-07-17. Original commit `b8038ed` incorrectly applied jagged geometry to all image-backed normal variants; the approved correction keeps jagged geometry SwatchBook-only, restores ov25-setup `Variant Shape` / `--ov25-variant-thumb-border-radius` for normal variants, and adds no jagged setup option.
- [ ]  when ‘inli*ne’ variant controls, the inline variants are still shown if you have ‘Config*ure button” selected (even if “Variant Controls” is turned off) - Bug 13 **NEEDS BEHAVIOR DECISION**; pure inline Configure-without-Variant-Controls must either be rejected/omitted or become a supported hybrid that opens variants in a sheet/drawer. See the investigation summary at line 401.
- [ ]  “auto open configurator” in ov25-setup does not work? - Bug 12 is **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md); its code was removed from dirty main, and the retained setup-preview proposal uses the same open path as a real Configure click and should be tested through OV25's `/configurator-preview` route when review resumes.
- [x]  ov25-variant-name still has ov:text-black
- [ ]  Better default variant image - same scope as all-missing thumbnail fallback; the repro fixture is approved/staged, but production fallback is blocked until parked Bug 15 is redesigned and resumed and compact image-free/text cards are confirmed as the desired fallback.
- [x]  ov25-snap2-controls is in the DOM twice for snap2. one is redundant. - fixed as Bug 6.
- [x]  £ signs showing in line item properties in checkout bedconfig - Bug 20 was already fixed upstream / not reproducible with current OV25. OV25 commit `b9cf4049` (2026-04-01) disables standard single-product pricing for bed mode and emits `productBreakdowns`; clean `ov25-ui` already remaps `productBreakdowns`. The port 3009 baseline shares current OV25, so it confirmed current cross-repo behavior rather than isolating the older OV25 path.
- [x]  remove duplicate “product type” from ov25-setup
- [x]  fix create-invoice validatePrice for /snap2 and /bed - no code change needed; Shopify create-invoice `validatePrice` remains intentionally disabled for standard/Snap2 and is not used for bed.
- [x]  make shopify embedded app logout when not logged into the correct store (so i cant accidentally edit recline-online after i switch to ov25-demo-2 etc) - completed outside this thread in current OV25 `main`; invalid Shopify app-entry/session mismatch redirects to `/shopify/auth-error`, which explains the store mismatch and offers `Log Out Of OV25` while preserving the app-entry return path.
- [x]  Name.tsx in ov25-ui needs id="ov25-configurator-name” so it can be targeted easier (id is outside the shadow root now) - fixed as Bug 2/2a; original ids remain inside shadow roots and host container ids are targetable outside.
- [ ]  Bug 41, Snap2 products replacing a name selector with `Name.tsx` render an empty name - **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md); the sender proposal was never applied to current OV25 main, and the retained artifact would send one canonical flat `RANGE` contract, `ov25-ui` uses its direct receiver, and no backward-compatibility layer remains.
- [ ]  Bug 42, Snap2 compatible-module side sheets need `Edit dimensions` and `Place movable object` actions on eligible module cards - **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md); its code was removed from dirty main, and in the retained artifact dimensions use a popover, one editor may be open per LEFT/RIGHT/BOTTOM/embedded surface, and the final eight-file artifact passed independent review.
- [ ]  Bug 43, show configured unit pricing on Snap2 module cards and detail titles; discounted modules match `Price.tsx`, and bottom-panel name/price DOM remains mounted but hidden by default - **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md); `ov25-ui` code was removed from dirty main, the OV25 side was never applied to current OV25 main, and historical checks/review passed in retained artifact/worktree state.
- [x]  Bug 44, Snap2 add/replace validation toasts (for example `Not enough space!`) rendered below `#ov25-snap2-controls` - approved and committed to OV25 `main` as `6731b81b`; embedded Snap2's top-center toaster is offset by `72px`, with no `ov25-ui` bridge.
- [ ]  Bug 45, preserve `productBreakdowns[].image` on normalized commerce callback lines - **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md); its code was removed from dirty main, and the retained additive type/normalizer artifact historically passed seven focused tests, TypeScript, diff checks, and independent review.
- [ ]  For everywhere we show text, allow string interpolation. And all Icons should be interchangable with custom icons, and custom text - data selectors on all of them - broad architectural pass; name selector audit completed 2026-06-02, setup selector catalog was approved and staged as Bug 32, and the first runtime name-selector slice is **PARKED FOR POST-RELEASE** as Bug 33 in [PARKED_BUGS.md](PARKED_BUGS.md), with worktree `codex/runtime-name-selectors` retained.
- [ ]  More options of how to display filters, a whole section on it. Also the default way filters show should be pretty different. I think the filters should always be there without a trigger by default, side swiping, and the header name (like collections, colors) should scroll in too. Needs product/design spec: which filter display modes, default per variant display style, setup controls, mobile behavior, and whether current trigger-based filters remain as a compatibility option.
- [x]  fix shopify login redirect after login issue (currently have to refresh after login) - completed outside this thread in current OV25 `main`; app-entry login preserves the signed callback and hard-navigates Shopify callbacks after credentials login.
- [ ]  Mouse settings for configurator, disable pan etc - needs clarification: add ov25-ui/setup runtime override for pan/zoom/rotate, or rely on existing OV25 per-camera admin settings?
- [x]  swatches + button doesn’t work with inline accordion and inline tree (and more?) - verified on 2026-06-02 against `gallery-inline-accordion.html` and `gallery-inline-tree.html`: external `#ov25-selected-swatches-container` is visible, opens `#ov25-swatchbook`, and checkout buttons are visible. Per-option swatch button also appears and opens the swatch book after opening Fabrics.
- [x]  swatches empty icon needs same jagged edges and size as full swatch - Bug 19 manually approved and exact one-file patch staged 2026-07-17; empty outlines match filled jagged geometry and use a solid stroke.
- [ ]  Accordion styles like https://www.tamariskdesigns.co.uk/bloxham-3-seater-sofa/?configuration=eyJwIjo5NjYsInMiOls2OSw5MywxMDBdfQ on tamarisk. animations, plus minus, different styling options in general - needs design/spec before coding. Public Tamarisk page shows product customisation grouped into accordion-like sections such as Fabric, Contrast Piping, Foot Colour, and Sitting Green with filter selects and option lists. Need decide which parts should become ov25-ui accordion settings: plus/minus icon style vs chevrons, open/close animation, section spacing/borders, filter placement, setup controls, and default/opt-in behavior.
- [ ]  ziggy had trouble hiding variants - both configure-button and variants were toggled off in ov25-setup but still appearing. Investigated 2026-06-08: setup export omits disabled selectors via `toElementSelector`, and runtime only mounts `VariantSelectMenu` into a variants slot when `selectors.variants` resolves to an existing target. Bug 13 no longer provides a ready fix because inline Configure-without-Variant-Controls needs a behavior decision. If Ziggy still reproduces with both selectors absent, need the exported setup JSON/current config to distinguish stale saved config from another inject bug.
- [ ]  Where images come from (combine vs woo vs ov25) - inspected 2026-06-03 and current runtime precedence documented in `docs/image-source-precedence.md`. Bug 45, which owns preservation of `productBreakdowns[].image` on normalized commerce lines, is **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md). Remaining decision: expose object-tier gallery image types publicly because runtime already supports them.
- [ ]  Carousel is buggy, max images is not working - needs decision: should `maxImages` count the 360 slot? Current `gallery-carousel-horizontal.html` renders 16 images + 360 for `maxImages.desktop = 16` because slicing happens before the 360 placeholder is inserted, and the type comment currently says "Max images" rather than "Max carousel items".
- [x]  items in the carousel `.ov25-thumbnail-scroll` need a `data-selected` attribute - Bug 38 approved and committed 2026-07-10 as `1c784b5`. Only the two source hunks and selected-state test were committed; Bug 39 carousel/popover hunks remain unstaged.
- [ ]  Image contain on gallery and where gallery images go when selected - needs clarification: change only the in-page selected image in `IframeContainer` from `object-cover` to `object-contain`, or change horizontal image clicks to open the same fullscreen contain overlay used by stacked gallery?
- [x]  Defer 3d when using inline variants does not flip to 360 when a selection is made - fixed as Bug 3; approved/staged 2026-06-08. Covers every inline variant selection, including size/product selections, with and without `deferThreeD`.
- [x]  Flex wrap or somethign breaking swatch book mobile - Bug 19 manually approved and exact one-file patch staged 2026-07-17; selected and empty cells share two equal mobile columns, with responsive swatches up to 120px and unchanged tablet/desktop breakpoints.
- [x]  Color selectors cant paste - fixed as Bug 5.
- [x]  ov25-variant-thumb-wrapper needs 4px padding instead of current calc - fixed as Bug 7; approved/staged 2026-06-02.
- [x]  SizeVariantCard dimensions need stable CSS classes - fixed as Bug 7a; approved/staged on 2026-07-09. Targets the size-card grid, card name, and dimension wrapper/value/line pieces without changing layout.
- [x]  sheet mode opening briefly reflows/collapses the page on some client sites - fixed as Bug 7b; approved/staged on 2026-07-09. Diagnostic `sheet-reflow-debug.html` added, desktop sheet opening reserves the original in-flow iframe slot, and desktop sheet scroll-lock now compensates for the page scrollbar gutter.
- [x]  Mouse needs to be perfectly still to select images in the carousel, needs to be better - fixed as Bug 4.
- [ ]  Show / order by selection price, calculate total price twice, once with selection once without and display either + / -. Investigated 2026-06-03: true +/- deltas are cross-repo, not an easy `ov25-ui`-only fix. `ov25-ui` receives raw `Selection.price` in `CONFIGURATOR_STATE`, current total/breakdown in `CURRENT_PRICE`, and SKU-only data in SKU payloads, but it does not receive candidate totals for every alternative selection. Raw selection-price display/sort is possible in `ov25-ui`, but the requested calculate-with/without behavior needs OV25 iframe/backend support, likely a per-selection delta or batch quote payload.
- [ ]  Allow sorting into different categories, sortin gby price etc - needs product/data contract. Local `ov25-ui` can sort by raw selection fields it receives, but category grouping and true price deltas need either consistent option metadata from `CONFIGURATOR_STATE` or new OV25 iframe/backend payloads. Decide desired sort keys, category source, and whether setup exposes this per option before coding.
- [ ]  mobile woods aren’t loading (low res images 403 mobile only) - needs affected product/page and at least one failing image URL. Local repo has no woods-specific fixture or image URL; without the 403 URL it is unclear whether this is OV25 media-source data, CDN transform permissions, mobile thumbnail tier selection, or storefront integration mapping.

![Screenshot 2026-04-20 at 14.47.46.png](attachment:6d9708c9-dd12-4fe6-b46c-09a54937c745:Screenshot_2026-04-20_at_14.47.46.png)

- [x]  snap2 overlapping footstools - causing crash if trying to replace in this scenario - ⚪ NOT REPRODUCIBLE as Bug 30; baseline tested 2026-07-13 before patching, no crash reproduced, and the proposed fix was discarded.

    ![Screenshot 2026-04-28 at 13.46.14.png](attachment:514ea799-0901-4124-831f-fafea2a4d02e:Screenshot_2026-04-28_at_13.46.14.png)

- [ ]  Alexis product/config block - needs target outcome: fixture to create, bug to fix, or data/config to validate.

    Alexis

    3ft 56inch king headboard (OV25 product name)

    Ottoman/Divan

    Super Mattress

    HEADBOARD

    BASE

    MATTRESS

    START WITH b2c diamond.

- [x]  Make sure this works and give a clear example with smallest possible changes
- [x]  Display custom visuals with ids manually put on
- [x]  When user makes selection, check to see if you can actually send that message - wont fix. Inline variants are not clickable until after `CONFIGURATOR_STATE` arrives, so the suspected user-click-before-ready path does not reproduce in the normal flow.
- [x]  If you cant show loader - wont fix. No real manual repro remains where inline variant controls are visible while the iframe is unable to receive selection commands.
- [x]  If you can send message - wont fix. The baseline already sends and eventually applies immediate selections in the tested fixture.
- [x]  If you cant when you can send message - wont fix. Queue/retry behavior should not be added without a concrete failing edge case because it adds state and UI complexity around a path that may not be reachable.

- [ ]  Unified menu and select side$ - Bug 34 is **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md); the distinct proposal was not applied to current main, worktree `codex/setup-snap2-position-controls` is retained, and the approved committed Bug 24 equivalent remains in main. The retained proposal adds Snap2-only setup controls and exports `configurator.variants.position` / `configurator.modules.position`; runtime attachment-side selection, if intended, remains a separate clarification.
- [x]  Snap2 mobile modal mode still mounts the mobile drawer behind the modal / Snap2 mobile drawer checkout overflows - fixed as Bug 26; staged on 2026-07-09. Mobile modal now uses the Snap2 modal shell, suppresses drawer/gallery/init drawer portals, constrains the variants/modules panel so the configurator remains visible, omits desktop side-radius data from the lower mobile panel, removes bottom iframe and iframe-slot radius where the 3D area meets the lower panel, and keeps the `View Cart` checkout sheet inside mobile dialog/drawer panels so it avoids viewport overflow, its list scrolls, and its footer remains reachable.
- [x]  Snap2 Shopify setup export is incomplete, forcing Shopify plugin shims - fixed as Bug 24. ov25-setup export/import/defaults now include inline gallery/variants/initialiseMenu selectors and Snap2 module/variant position config without Shopify runtime mutation; manual Shopify verification with the shim disabled remains.
- [x]  ov25-setup color selectors load as defaults from saved settings even though they export/pass through correctly - fixed as Bug 25. Setup now hydrates generated `:host { --ov25-* }` style variables as form style controls, keeps legacy `:root` support, and preserves non-OV25 custom CSS.


- [x]  make sure intecepting checkout button will work, just display some custom ui over top of page


- [x]  Make sure mobile works - side menu as option, drawer still as an option
- [ ]  safari - likely covered by queued Safari thumbnail-offset review unless manual Safari testing shows another Alexis-specific symptom.


- [x]  scuffed corner of galery
- [x]  left align the pills
- [x]  Make the peices/options tabs actually nice (two pills)
- [x]  Module list can be one per row, showing both images, title & description if looks nice
- [x]  get rid of title and price at top, ugly
- [x]  mobile left/right scroll on modules, when click show sheet on right that contains name, extra pics, description and ‘add’ button
- [x]  checkout can be full screen on mobile
- [x]  side bar needs to close
- [x]  only open side bar product info on see more
- [x]  nothing selected show attachemnt points, or talk about selecting an existing model
- [x]  snap2 prevent movable objects being placed in the stratosphere - fixed as Bug 27; approved and committed as `3541b736` on branch `snap2-draggable-objects-bounds`.
- [ ]  snap2 rotate movable object with mousewheel? - Bug 28 is **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md); it was never applied to current OV25 main, and OV25 worktree `codex/snap2-movable-wheel-rotate` is retained.
- [ ]  snap2 ghost box - needs clarification: re-enable old selected-attachment ghost as rough preview, build exact hovered/selected candidate-module ghost, or limit to movable drag placement?
- [x]  snap2 in plan view dimensions are mahoosive - fixed outside this thread; local `OV25-snap2-plan-dimensions` worktree removed.
- [ ]  snap2 arlo modulebottompanel does not start in the correct place - needs clarification: wrong dock position, or carousel initial alignment/scroll within the bottom panel?
- [x]  snap2 initialise menu remove the titles - re-add tooltips - Bug 11 approved/staged 2026-07-10; name and tooltip nodes are always mounted, with desktop defaulting to tooltip-only interaction and mobile defaulting to visible names.
- [x]  ov25-ui - selection thumbnails are offset on safari - ⚪ not reproducible on the clean baseline in Safari; proposed fix discarded with no runtime change.
- [x]  script to auto replace all line item properties in the theme, rather than asking them to do it - legacy `shopify-plugin` CLI removed; OV25 now owns the theme patcher core and local fixture wrapper.
- [ ]  “next” button in mobile wizard view can’t be clicked - not reproduced on `gallery-sheet-wizard.html` mobile; need exact failing fixture/device/browser.
- [ ]  z-index reasonableness - Bug 23 is **PARKED FOR POST-RELEASE** in [PARKED_BUGS.md](PARKED_BUGS.md). It was previously approved and committed as `eaa808d`; the semantic inverse is complete and unstaged in main for this release, without rewriting history. The retained implementation uses named body-level layer constants, gives portal classes distinct ordering where needed, replaces the Snap2/AR dialog host raw max z-index, and keeps toasts above Snap2/share dialog overlays.
- [ ]  configurator shows in defer3D after you open and close the modal - not reproduced on 2026-06-03 with `configure-button-modal.html?defer3d=1`; after Configure then Close modal, `#ov25-configurator-iframe-container` and `#true-ov25-configurator-iframe-container` were hidden with `pointer-events: none` in the deferred preload container. Need exact failing page/fixture if still happening.
- [x]  ov25-setup page resets if i leave the tab - Bug 37 manually approved and staged on 2026-07-16. Setup stores unsaved drafts under a key derived from incoming server `initialConfig`, so remounting with the same server config keeps local edits while a different saved config gets a different draft key.
- [ ]  when deferThreeD is true, open sheet, close sheet, iframe is not displayed on page (only with gallery i think) - not reproduced on 2026-06-03 with `single-product-gallery.html?defer3d=1`; after Configure then Close, `#ov25-configurator-iframe-container` and `#true-ov25-configurator-iframe-container` were visible in the page gallery. Need exact failing page/fixture if still happening.
- [x]  our gallery is not allowing scroll (its scrolling page behind) - fixed as Bug 22 for horizontal carousel mouse wheel; approved/staged on 2026-06-18. Touch/fullscreen/stacked/theme-specific cases still need exact repros if separate.
- [ ]  multi line item support: paramater to hide options - inspected 2026-06-03. `ov25-ui` normalizes multi-line SKU/price callback payloads in `src/commerce/normalize-iframe-commerce.ts`, but does not own Shopify/Woo line-item-property generation. Existing `variants.hideOptions` is UI-only and keeps iframe `CURRENT_SKU`/`CURRENT_PRICE` payloads intact. Needs decision: filter cart properties in Shopify/Woo/host callbacks, add a new opt-in ov25-ui payload filter, or intentionally make `variants.hideOptions` alter public callback payloads as a compatibility-sensitive change.
- [ ]  identify whats missing in ov25-docs and update it (big task) - read-only audit complete in `docs/ov25-docs-gap-audit.md`; actual docs updates remain open. Highest-priority gaps: refresh `ui-package-integration.mdx`, document setup export contract, update Shopify/Woo plugin docs, add variant display modes guide, add Snap2/bed/dining integration pages, document image-source/srcset behavior, and add versioning/compatibility guidance.
