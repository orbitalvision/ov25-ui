# Important Bugs

Items that currently need user action. Remove an item after it has been handled.

Last reconciled against local repositories: 2026-08-04.

## 0.8.0 review follow-ups

- Review and commit the five updated `ov25-docs` pages and three new setup screenshots. The public docs now cover all new `0.8.0` configuration options identified by the release review.
- Run the final release test/build/tarball and cross-integration staging pass only after the pending source work is committed and package versions can be synchronized.

## Bug 39 integration and release follow-up

The core `ov25-ui` implementation is manually approved and committed as `fad225f`; current
`ov25-ui` `main` and `origin/main` are at `50fd555`. The dedicated sticky worktree and old
consolidated diff are historical references, not review or release blockers.

Cross-repository integration is not complete:

- OV25 `main` is two commits ahead of `origin/main`. Seven integration files are staged for the setup preview, Shopify Plugin Settings/metafields, canonical setup defaults, and approved Bug 56 cleanup. Pre-commit remains blocked until installed `ov25-setup@0.7.2` is replaced by `0.8.0`, which exports `ov25-setup/defaults`. Approved Snap2 drag-bounds commit `3541b736` still needs integrating into current OV25 `main`.
- Shopify source is clean locally and three commits ahead of `origin/main`: `626c165` (host layout selectors and shared carousel block), `ec950cd` (saved flags/Snap2 settings), and `7f55479` (localized cart forms). Its exact `ov25-ui-react18@0.8.0` package update and generated bundle rebuild wait until publication.
- WooCommerce source is clean locally and one commit ahead of `origin/main`: `c7b690a` adds the matching `0.8` settings/defaults. Its exact package synchronization, ZIP build, and release workflow wait until publication and after this commit reaches remote `main`.

Action:

1. Integrate OV25 commit `3541b736`, and commit the seven pending OV25 integration files once the local `ov25-setup/defaults` dependency can resolve. Do not permanently add a compatibility fallback.
2. Push the existing Shopify and WooCommerce source commits before release automation consumes their remote main branches.
3. Publish the three `0.8.0` packages, then let OV25/Woo automation synchronize exact versions and manually update/rebuild the Shopify runtime bundle.

## Choose the next blocked fix

The remaining non-review backlog has no safe implementation candidate without a behavior decision. Answer any item to unblock that bug:

1. **Bug 13 inline + Configure:** reject/omit a Configure target without a variants target (recommended), or support a new hybrid where Configure opens variants in a sheet/drawer while the viewer stays inline?
2. **Bed current-size filtering:** default it on for all existing bed embeds at runtime, or only for newly exported setup configs?
3. **No-thumbnail variants:** Bug 15 is parked after invalid width descriptors were found, so this remains blocked until Bug 15 is redesigned and resumed; once resumed, should every all-missing-image group use compact text-only cards instead of repeated placeholders?
4. **Carousel maximum:** should the 360 item count toward `carousel.maxImages`, or should the limit continue to apply only to product/gallery images?
5. **Selected gallery image:** should horizontal-carousel clicks show the in-page image with `object-contain`, or open the existing fullscreen contain viewer?
6. **Hidden options in line items:** filter them in Shopify/Woo host cart-property code, add a new `commerce.hideOptionsFromLineItems` opt-in, or change existing `variants.hideOptions` callback payload behavior?

The full clarification queue is in [bugs-questions-for-user.md](bugs-questions-for-user.md).
