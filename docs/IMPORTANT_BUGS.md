# Important Bugs

Items that currently need user action. Remove an item after it has been handled.

Last reconciled against local repositories: 2026-07-28.

## Bug 39 integration and release follow-up

The core `ov25-ui` implementation is manually approved and committed as `fad225f`. The follow-up documentation commit is `a9eb0f7`, which is the current local `main` head. Local `main` is two commits ahead of `origin/main`; `fad225f` is authoritative for the implementation. The dedicated worktree and old consolidated diff are historical references, not review or release blockers.

Cross-repository integration is not complete:

- Current OV25 `main` still lacks the configurator-preview changes and Shopify PluginSettings fields for `header`, `desktopCarousel`, and `mobileCarousel`.
- Shopify and WooCommerce retain dirty unstaged integration changes.
- The Shopify sticky mobile-carousel app block remains untracked.
- No cross-repository integration change should be described as approved or committed until it is separately reviewed.

Action:

1. Recreate/rebase the OV25 preview changes on current OV25 `main`.
2. Apply and review the OV25 PluginSettings selector changes.
3. Review and commit the Shopify and WooCommerce adapter/settings changes, including the Shopify app block.
4. Update consuming package versions and rebuild generated integration bundles when the release version is available.

## Choose the next blocked fix

The remaining non-review backlog has no safe implementation candidate without a behavior decision. Answer any item to unblock that bug:

1. **Bug 13 inline + Configure:** reject/omit a Configure target without a variants target (recommended), or support a new hybrid where Configure opens variants in a sheet/drawer while the viewer stays inline?
2. **Bed current-size filtering:** default it on for all existing bed embeds at runtime, or only for newly exported setup configs?
3. **No-thumbnail variants:** Bug 15 is parked after invalid width descriptors were found, so this remains blocked until Bug 15 is redesigned and resumed; once resumed, should every all-missing-image group use compact text-only cards instead of repeated placeholders?
4. **Carousel maximum:** should the 360 item count toward `carousel.maxImages`, or should the limit continue to apply only to product/gallery images?
5. **Selected gallery image:** should horizontal-carousel clicks show the in-page image with `object-contain`, or open the existing fullscreen contain viewer?
6. **Hidden options in line items:** filter them in Shopify/Woo host cart-property code, add a new `commerce.hideOptionsFromLineItems` opt-in, or change existing `variants.hideOptions` callback payload behavior?

The full clarification queue is in [bugs-questions-for-user.md](bugs-questions-for-user.md).
