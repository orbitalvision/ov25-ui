# Important Bugs

Items that currently need user action. Remove an item after it has been handled.

Last reconciled against local repositories: 2026-07-28.

## Bug 39 - Reconcile the staged implementation before rebuilding

Current repository evidence:

- All 39 `ov25-ui` implementation/test files for Bug 39 are staged on local `main`, although Bug 39 is not manually approved.
- `.worktrees/ov25-ui-inline-sticky` is entirely unstaged and differs from main in 18 implementation/test files. It is no longer a byte-identical backup or authoritative patch source.
- `review-diffs/bug-39-inline-sticky-ov25-ui.diff` is stale against the dedicated worktree: its reverse-apply check fails in the three implementation/test files `useStickyHostRelocation.ts`, `carousel-target-controller.ts`, and `inline-sticky.test.ts`, plus the subsequently updated `docs/sticky-display-mode-architecture.md` and `docs/sticky-header-autodetection-audit.md`. It is also unsuitable for current staged main because main and the worktree have broader implementation/test divergence.
- Current OV25 `main` contains neither the Bug 39 preview changes nor the Shopify PluginSettings header/carousel fields. The selector-settings diff still applies cleanly, but the saved preview diff does not apply to current OV25 `main` and must be rebased or recreated.
- Shopify and WooCommerce still contain unstaged Bug 39 integration edits; the Shopify mobile-carousel block remains untracked. Their focused review diffs reverse-apply cleanly.

Action:

1. Treat staged `ov25-ui` main as the current implementation unless explicitly choosing to recover a worktree-only difference.
2. Reconcile or retire the divergent `codex/inline-sticky` worktree, then refresh the consolidated `ov25-ui` review diff from the chosen source.
3. Rebase/recreate the OV25 preview changes on current OV25 `main`, and apply/review the OV25 PluginSettings selector changes.
4. Only after the source and artifacts agree, rebuild `ov25-ui` using the normal local workflow.
5. Open all three stable pages at desktop width. Confirm the expected no/fixed/collapsing header behavior, a natural square viewer no taller than its cap, one embedded carousel, no external host, and preserved horizontal plus reduced vertical option/group spacing.
6. Repeat all three at mobile width. Confirm no-header offset `0`, fixed-header tracking, collapsing offsets `94px` -> `54px` -> `0px`, external-carousel portal, page scrolling, header stacking, alignment, and square corners across every viewer layer.
7. Open `inline-sticky-desktop-fixed-header.html?fallback=body-layer`. Confirm the native control probe can open/close while the gallery reports its scoped Popover failure. Scroll through several pinned positions and the product boundary; confirm one absolute body track/placeholder, a direct `position: sticky` host, stable width/top, exact track/boundary bottom alignment, real-header hit testing, unchanged client blocker/grid, preserved iframe state, and no duplicate nodes. Reverse immediately after boundary exit and confirm there is no delayed fixed/absolute catch-up.
8. Repeat with `&mobileMode=inline`; after relocation, resize below 768px and confirm the host returns to the blocker, external inline styles remain exact, and the layer/placeholder disappear, then resize back to desktop. Continuous input remains a manual visual check; automated frame-stepped trajectories plus a same-task pre-rAF reverse-scroll read cover deterministic geometry.
9. Open `inline-sticky-desktop-fixed-header.html?target=missing`; confirm the viewer remains 1:1 above one embedded carousel and the total stays within the cap. Then open `?viewer=compact&target=missing`; confirm the slot and every iframe layer are 72% width at 4:3 with no fill-height growth.
10. On the shared pages, re-check ordinary mobile inline retains its configured nonzero radius, test `?stackedGallery=1`, then test desktop embedded -> mobile built-in external -> desktop embedded without duplicate portals or stale corner mode; Snap2 remains unaffected.
11. Open `inline-sticky-desktop-no-header.html?mobileMode=inline&viewer=compact&hostBox=content-box`. Confirm desktop sticky is capped border-box with the 72%-width 4:3 override; resize to ordinary mobile inline and confirm merchant content-box plus default square sizing; resize back and confirm the sticky override returns without replacing the iframe.
12. Open `carousel-relocation.html`; confirm desktop uses the permanent desktop target, mobile uses the permanent mobile target, the inactive target is hidden, and desktop -> mobile -> desktop preserves one carousel and the same iframe without controls or duplicate hosts.
13. Run all 24 browser cases and capture the pending after screenshots.

No manual approval is requested yet. Bug 39 is staged but not approved or commit-ready.

## Choose the next blocked fix

The remaining non-review backlog has no safe implementation candidate without a behavior decision. Answer any item to unblock that bug:

1. **Bug 13 inline + Configure:** reject/omit a Configure target without a variants target (recommended), or support a new hybrid where Configure opens variants in a sheet/drawer while the viewer stays inline?
2. **Bed current-size filtering:** default it on for all existing bed embeds at runtime, or only for newly exported setup configs?
3. **No-thumbnail variants:** Bug 15 is parked after invalid width descriptors were found, so this remains blocked until Bug 15 is redesigned and resumed; once resumed, should every all-missing-image group use compact text-only cards instead of repeated placeholders?
4. **Carousel maximum:** should the 360 item count toward `carousel.maxImages`, or should the limit continue to apply only to product/gallery images?
5. **Selected gallery image:** should horizontal-carousel clicks show the in-page image with `object-contain`, or open the existing fullscreen contain viewer?
6. **Hidden options in line items:** filter them in Shopify/Woo host cart-property code, add a new `commerce.hideOptionsFromLineItems` opt-in, or change existing `variants.hideOptions` callback payload behavior?

The full clarification queue is in [bugs-questions-for-user.md](bugs-questions-for-user.md).
