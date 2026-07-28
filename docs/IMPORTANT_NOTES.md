# Important Notes

Current queue state was reconciled against local repositories on 2026-07-28. Use [IMPORTANT_BUGS.md](IMPORTANT_BUGS.md) for required user actions, [bugs-ready-for-review.md](bugs-ready-for-review.md) for the active manual queue, and [bugs-resolved.md](bugs-resolved.md) for approved work.

## Current ov25-ui state

- Bug 39 core was manually reviewed, approved, and committed as `fad225f`.
- The workflow/sticky documentation was committed immediately afterwards as `a9eb0f7`.
- Local `main` is two commits ahead of `origin/main`. This workflow-documentation update remains unstaged; unrelated worktrees/release artifacts also remain untracked.
- `fad225f` is the authoritative Bug 39 implementation. The dedicated sticky worktree and old review diff are historical and no longer block release.

## 0.8.0 release review draft

Draft artifacts: [patch notes](../releases/0.8.0/patch-notes.md), [developer summary](../releases/0.8.0/developer-summary.md), and [client email](../releases/0.8.0/client-email.md).

The approved `ov25-ui` core no longer blocks the release. Remaining release work includes the separate Bug 39 integration follow-up described below, Shopify forwarding for `disableBuyNow` and `hideGestureHint`, the stale generated Shopify bundle, the Snap2 `modules.position` migration/default decision, package-version synchronization, and public documentation updates. Regenerate the release review from the final release state before running `npm run release:test -- --release 0.8.0`.

## Bug 39 core approved

Commit `fad225f` adds normal-product `inline-sticky`, automatic/explicit header resolution, viewport-specific carousel relocation, natural viewer sizing under the viewport cap, mobile page-scroll list behavior, sticky option/group headers, and reversible native/Popover/body-layer strategies. Ordinary `inline` and `inline-sheet` remain non-sticky, and Snap2 remains excluded.

Useful implementation detail and design rationale remain in:

- [Inline-sticky implementation report](inline-sticky-report.md)
- [Sticky display-mode architecture](sticky-display-mode-architecture.md)
- [Sticky header auto-detection audit](sticky-header-autodetection-audit.md)

Historical review checkpoints incorporated into `fad225f` include:

- Mobile full-bleed alignment and square sticky viewer corners.
- Mobile option/group header stacking and document-level variant scrolling.
- Constant natural viewer sizing while headers collapse.
- Native grid/flex stretch repair without generic client-parent height mutation.
- Popover fallback clipping at header/boundary exit.
- Body-layer fallback using one natural document track and the same iframe host.
- Separate desktop/mobile carousel targets plus the built-in mobile sticky target.
- Ordinary `inline` and `inline-sheet` isolation from sticky controllers and relocation.

The focused historical verification recorded 68 sticky controller/relocation tests, 44 carousel/setup tests, a passing type-check, and 24 discovered browser cases. The user subsequently completed manual review and approved the committed implementation.

## Bug 39 integration follow-up

This is separate from approval of the `ov25-ui` core:

- Current OV25 `main` still lacks the configurator-preview patch and the Shopify PluginSettings fields for `header`, `desktopCarousel`, and `mobileCarousel`.
- Shopify and WooCommerce contain dirty unstaged integration changes.
- The Shopify `[data-ov25-sticky-mobile-carousel]` app block remains untracked.
- OV25 and WooCommerce must consume the release containing `fad225f`; Shopify's generated runtime bundle must then be rebuilt.

These cross-repository changes are not yet approved or committed. Track them in [IMPORTANT_BUGS.md](IMPORTANT_BUGS.md), not in the empty core review queue.
