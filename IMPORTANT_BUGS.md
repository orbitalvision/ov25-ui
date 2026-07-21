# Important Bugs

Items that currently need user action. Remove an item after it has been handled.

## Bug 39 - Rebuild and re-check responsive fixtures and body-layer fallback

The no-header, fixed-header, and collapsing-header URLs are responsive desktop/mobile client pages backed by one DOM. Normal-product mobile `inline-sticky` removes the configured radius from the outer viewer container, true iframe container, and iframe; desktop sticky and non-sticky modes retain it. The shared fixed-header page adds `?fallback=body-layer`, which combines a real external blocker with a gallery-only pre-injection Popover failure so runtime uses its actual `Element.moveBefore()` fallback. That body layer is now an absolute natural-top-to-boundary track whose direct gallery host remains native sticky, eliminating its scroll-event/rAF fixed-to-absolute transition. Its independent native Popover probe, exact track geometry, immediate reverse-scroll behavior, and style restoration are covered. Focused relocation tests pass 14/14, type-check passes, and Playwright discovers 17 tests; build, E2E, and manual browser review are pending.

Action:

1. Rebuild `ov25-ui` using the normal local workflow.
2. Open all three stable pages at desktop width. Confirm the expected no/fixed/collapsing header behavior, a hidden external-carousel slot, and preserved horizontal plus reduced vertical option/group spacing.
3. Repeat all three at mobile width. Confirm no-header offset `0`, fixed-header tracking, collapsing offsets `94px` -> `54px` -> `0px`, external-carousel portal, page scrolling, header stacking, alignment, and square corners across every viewer layer.
4. Open `inline-sticky-desktop-fixed-header.html?fallback=body-layer`. Confirm the native control probe can open/close while the gallery reports its scoped Popover failure. Scroll through several pinned positions and the product boundary; confirm one absolute body track/placeholder, a direct `position: sticky` host, stable width/top, exact track/boundary bottom alignment, real-header hit testing, unchanged client blocker/grid, preserved iframe state, and no duplicate nodes. Reverse immediately after boundary exit and confirm there is no delayed fixed/absolute catch-up.
5. Repeat with `&mobileMode=inline`; after relocation, resize below 768px and confirm the host returns to the blocker, external inline styles remain exact, and the layer/placeholder disappear, then resize back to desktop. Continuous input remains a manual visual check; automated frame-stepped trajectories plus a same-task pre-rAF reverse-scroll read cover deterministic geometry.
6. On the shared pages, re-check ordinary mobile inline retains its configured nonzero radius, test `?stackedGallery=1`, then test `?target=missing` and desktop -> mobile -> desktop without duplicate portals or stale corner mode; Snap2 remains unaffected.
7. Codex will run all 17 browser tests and capture the header-spacing after image.

No manual approval is requested yet. Bug 39 is in active manual review / follow-up feedback and is not stage-ready.

## Choose the next blocked fix

The remaining non-review backlog has no safe implementation candidate without a behavior decision. Answer any item to unblock that bug:

1. **Bug 13 inline + Configure:** reject/omit a Configure target without a variants target (recommended), or support a new hybrid where Configure opens variants in a sheet/drawer while the viewer stays inline?
2. **Bed current-size filtering:** default it on for all existing bed embeds at runtime, or only for newly exported setup configs?
3. **No-thumbnail variants:** Bug 15 is parked after invalid width descriptors were found, so this remains blocked until Bug 15 is redesigned and resumed; once resumed, should every all-missing-image group use compact text-only cards instead of repeated placeholders?
4. **Carousel maximum:** should the 360 item count toward `carousel.maxImages`, or should the limit continue to apply only to product/gallery images?
5. **Selected gallery image:** should horizontal-carousel clicks show the in-page image with `object-contain`, or open the existing fullscreen contain viewer?
6. **Hidden options in line items:** filter them in Shopify/Woo host cart-property code, add a new `commerce.hideOptionsFromLineItems` opt-in, or change existing `variants.hideOptions` callback payload behavior?

The full clarification queue is in [bugs-questions-for-user.md](bugs-questions-for-user.md).
