# Important Notes

Current queue and release-review state was reconciled against local repositories on 2026-08-05. Use [IMPORTANT_BUGS.md](IMPORTANT_BUGS.md) for required user actions, [bugs-ready-for-review.md](bugs-ready-for-review.md) for the active manual queue, and [bugs-resolved.md](bugs-resolved.md) for approved work.

## Playwright now runs headlessly by default

`playwright.config.ts` now sets `headless: true`, so focused Playwright runs and `release:test`
will not open browser windows over other work. `scripts/check-local-fixture.mjs` retains its explicit
`--headed` option for intentional visible-browser debugging. The HTML reporter uses `open: 'never'`,
so a failed run still writes its report without opening or serving it interactively. Playwright
loads the updated config and discovers all 33 tests. The `headless: true` hunk is already staged;
the reporter configuration is also staged as part of Bug 57.

## Bug 57 release-test fixes approved and staged

Bug 57 was manually approved and its implementation/tests staged on 2026-08-05. The failed `0.8.0`
release run was repaired and rerun successfully. The final
[test summary](../releases/0.8.0/test-summary.md) records passing type checks, 226 unit tests,
4 browser/component tests, both production builds, the frozen `ov25-setup` install, and all
33 Playwright tests running headlessly in 3.0 minutes.

The only runtime changes are in Inline Sticky: transient pre-render geometry no longer leaves a
Popover fallback active after the variants finish sizing, permanent short boundaries still report
diagnostics, body-layer relocation remains retained, and an inline-sticky gallery replacement
preserves the original target's inline host-box styles. Style copying is explicitly excluded from
ordinary `inline`, `inline-sheet`, sheet, and modal modes. The remaining changes correct stale or
racy Playwright assumptions.

Switching to headless execution exposed two test-only differences. The checkout baseline widened
from 444px to 448px because headed Chromium had reserved width for its page scrollbar. The 3D test
now runs UI interactions in a normal-headless test and uses a short dedicated SwiftShader worker
for a stable outer-iframe screenshot. Its valid 704x704 baseline visibly contains the rendered sofa
and controls. The focused 3D file passed twice after stabilization, and the focused checkout visual
also passed. The approved refreshed
[snapshot](../test/e2e/single-no-variants.test.ts-snapshots/single-no-variants-initial-canvas-chromium-darwin.png)
contains the rendered sofa and controls. No release, publish, deployment, or commit was performed;
tracker, review, and release documentation remains unstaged.

## Bug 50 placeholder-scope correction approved and staged

The woven missing-image placeholder is now limited to material-selection `VariantThumb` and Swatch
Book image leaves. `ModuleVariantCard` has been restored to its previous targetable “No Image” text
state using the existing `moduleCardNoImage` string replacement. Size cards omit their image when
none exists. Horizontal and stacked product carousels preserve an inert neutral slot without an
image or click action, so gallery indices remain stable. Focused tests pass 11/11 and
`git diff --check` passes. The user approved the correction on 2026-08-04 and only the five
implementation/test files are staged; tracker, release, and review files remain unstaged.

## Release-test setup lockfile fix committed and verified

The first `release:test` run passed the root type-check, unit tests, browser/component tests, and
`ov25-ui` build, then stopped because `setup/bun.lock` still resolved `ov25-ui@0.7.0` while
`setup/package.json` requires the published `0.7.3` package. The lockfile has been regenerated with
Bun and now contains `ov25-ui@0.7.3` plus its required nested Radix slot resolution. No unrelated
dependencies changed. A fresh `bun install --frozen-lockfile` in `setup` succeeds.

The lockfile correction was committed as `35a14c7`. The final
[test summary](../releases/0.8.0/test-summary.md) now records a complete passing release run,
including the frozen setup install.

## Mobile Inline Sticky setup-preview follow-up approved

The sticky layout controller now treats an original gallery boundary as insufficient when it ends
before the variants host, even if it is tall enough for the gallery to reach its sticky top. It
first attempts the existing reversible grid/flex column stretch; when stretching cannot span the
variants, it falls back to the common product boundary. Variant-bottom geometry is included in the
failed-stretch cache key and `variantsHost` remains resize-observed, so dynamically changing list
height triggers a fresh decision. Ordinary `inline`/`inline-sheet` and valid desktop native-sticky
layouts retain their existing paths.

The focused controller and metrics suites pass all 55 tests, `bun run type-check` passes, and
`git diff --check` passes. The user manually approved the follow-up on 2026-08-04. Only the
controller implementation and focused unit test are staged; tracker/review files remain unstaged.

## Configurator preview duplicate thumbnails approved

The static `preview-thumbnails` scaffold has been removed from OV25's
`app/(ov25-ui)/configurator-preview/page.tsx`. The preview now shows only the real OV25 carousel;
the carousel target and Inline Sticky layout remain unchanged. File-scoped ESLint and
`git diff --check` pass, and live DOM inspection found zero fake thumbnail strips. The scoped diff
does not touch real carousel injection or targeting. The user manually approved Bug 56 on
2026-08-04, and the deletion is staged in the existing OV25 preview integration change.

## OV25 0.8 integration applied locally

The useful parts of OV25 branch commit `f822c2ae` are now applied to the current OV25 `main`
working tree without staging, committing, or pushing. This adds Shopify Plugin Settings and
metafield support for the header and per-viewport carousel selectors, sources default saved setup
JSON from `ov25-setup/defaults`, and combines the mode-aware configurator preview with the approved
Bug 55 sticky-preview behavior. The existing untracked OV25 SQL dumps were left untouched.

Switching the setup preview between Desktop and Mobile now remounts its iframe so mixed Snap2
display modes reconstruct the correct viewport-specific selectors. A focused regression test was
added in ov25-ui. The Shopify API hardening suite passes all 10 tests, the two setup preview test
files pass all 7 tests, setup type-checking passes, the OV25 preview page has zero TypeScript
semantic diagnostics, and both repository diffs pass `git diff --check`.

OV25's canonical setup-defaults test remains intentionally blocked until its installed
`ov25-setup@0.7.2` is replaced by the 0.8 release containing the `./defaults` export. Do not add a
temporary fallback; the release package update resolves this dependency in the intended order.

## Bug 12 approved and committed

Bug 12 passed manual review and was committed as `4d038ec` on 2026-08-03. The old setup-preview
proposal was not reapplied.

## Bug 52 approved and committed

The normal-product mobile modal close button now renders inside the lifted gallery layer instead of
behind it. Manual review passed on 2026-08-03 and the scoped implementation/tests were committed as
`b5e26a7`; tracker and release-note updates remain unstaged.

## Bug 53 approved and committed

The desktop [Snap2 UUID fixture](http://localhost:3008/tests/snap2-uuid.html) now places its modal
shell below the save-confirmation layer. Manual review passed on 2026-08-04. The scoped implementation
and tests were committed as `4dc3c24`; the full packet is archived in
[bugs-resolved.md](bugs-resolved.md#53-snap2-uuid-desktop-close-confirmation-layering).

## Bug 55 core committed; mobile follow-up pending

The setup fixture now explicitly opts into local OV25 and uses its correct two-column inline layout.
The remaining sticky failure came from OV25's non-scrolling body becoming an overflow ancestor;
ov25-ui now distinguishes propagated body overflow from the blocking HTML-plus-body combination
and uses the existing product-bounded fallback while still rejecting body/HTML as boundaries.
The OV25 preview route now also restores wheel/trackpad scrolling over the variants column by
allowing vertical overscroll to chain from its non-scrolling body to the HTML scroller. Wheel input
over the nested 3D viewer remains camera zoom by design.
It now also uses route-scoped `overflow-x: clip` on body so computed vertical overflow stays
visible. This lets option and group headers use native sticky instead of scrolling away while only
the gallery survives through fallback relocation.
Live nested-preview verification passed for the approved core: HTML remained the page scroller and, at `scrollY=2816`,
the active option header pinned at `y=16`, the active group header at `y=62`, and the gallery at
`y=16`. Manual review passed on 2026-08-04, and the core was committed as `d7c2de7`; device-mode
remounting followed in `50fd555`. The newly discovered short mobile gallery boundary is handled by
the two-file follow-up at the top of this file and still needs a rebuild/manual retest. The original packet is archived in
[bugs-resolved.md](bugs-resolved.md#55-standard-inline-sticky-setup-preview-layout).

## Bug 54 ignored for 0.8.0

The bed-configurator cold-render delay comes from OV25 commit `512b71e3`, which moved the full bed
payload into a React Server Component `initialData` prop. Production currently hides the problem
behind a warm page cache. The user explicitly accepted this as non-blocking for `0.8.0`; no fix is
included in the release, and the temporary OV25 timing logs were removed.

## Feature 51 approved and committed

The real configurator iframe now exposes a product/range-aware accessible title for standard
products, normal ranges, and Snap2. A single-product title includes the range name before the
product name, with no dash or colon; a normal range title ends with the word `range`. Manual review
passed on 2026-08-03 and was committed as `429b4f9`; tracker and release-note updates remain unstaged.

## Bug 50 approved and committed

Bug 50 passed manual review on 2026-08-03. Its scoped placeholder implementation and focused tests
were committed as `0df85c3`; tracker and release-review documents remain unstaged. Fallback remains
owned by leaf image renderers, raw image values remain raw in selection data, and the package-owned
weave uses five cream and five grey `150px` threads with equal `75px` gaps.

## Current ov25-ui state

- Bug 39 core was manually reviewed, approved, and committed as `fad225f`.
- The workflow/sticky documentation was committed as `a9eb0f7`, followed by the docs and skills update in `3db1114`.
- Local `main` and `origin/main` are at `50fd555`; Bugs 52 and 53 remain committed as `b5e26a7` and `4dc3c24`.
- Bug 55's approved core is committed as `d7c2de7` with device remounting in `50fd555`; its two-file mobile boundary follow-up is unstaged and awaiting review.
- `fad225f` is the authoritative Bug 39 implementation. The dedicated sticky worktree and old review diff are historical and no longer block release.

## 0.8.0 release review draft

Draft artifacts: [patch notes](../releases/0.8.0/patch-notes.md), [developer summary](../releases/0.8.0/developer-summary.md), and [client email](../releases/0.8.0/client-email.md).

The release artifacts were regenerated on `2026-08-04T10:37:22.706Z` from `ov25-ui@0.7.3` (`b56f817`) to committed `HEAD` (`50fd555`). They also document the current uncommitted mobile Sticky follow-up and cross-repository release state.

The approved `ov25-ui` core no longer blocks the release. The mobile Sticky and OV25 preview-thumbnail follow-ups are approved and staged. Remaining release work includes committing/pushing the OV25, Shopify, and WooCommerce integration state; reviewing and committing the completed public documentation; package-version synchronization and the generated Shopify bundle rebuild; and the required release tests.

Regenerate the release review only if `HEAD` or the integration release set changes.

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
- Separate desktop/mobile carousel selectors plus the shared Shopify carousel app-block fallback.
- Ordinary `inline` and `inline-sheet` isolation from sticky controllers and relocation.

The focused historical verification recorded 68 sticky controller/relocation tests, 44 carousel/setup tests, a passing type-check, and 24 discovered browser cases. The user subsequently completed manual review and approved the committed implementation.

## Bug 39 integration follow-up

This is separate from approval of the `ov25-ui` core:

- OV25 release branch `ov25-ui-v0.8.0` now contains the configurator-preview and Shopify PluginSettings integration through merge commit `35f81646`, plus the approved Snap2 drag-bounds work through merge commit `24516f2f`; OV25 `main` remains unchanged. Focused verification passed 17 of 18 tests. The remaining setup-defaults test and one type-check error are blocked until OV25 moves from `ov25-setup@0.7.2` to the release that exports `ov25-setup/defaults`; two additional type-check errors come from an untouched `@vercel/functions` API mismatch. `release:deploy --push` automatically dispatches OV25's `update-ov25-ui-packages.yml`, which updates all three OV25 package dependencies and `bun.lock`, runs the type-check, and commits to OV25 `main`. Merge the OV25 release branch into `main` before that dispatch; no manual OV25 package bump is required.
- Shopify source now forwards integration selectors and saved flags, includes the shared desktop/mobile `blocks/ov25_carousel.liquid` app block, and preserves legacy Snap2 defaults. Explicit per-viewport carousel selectors win; the block falls back to `[data-ov25-carousel-target]` while retaining `[data-ov25-sticky-mobile-carousel]` for mobile `inline-sticky`. An absent or ambiguous block leaves the carousel embedded. The earlier adapter/Liquid changes are staged, the new shared-target JavaScript hunk is unstaged, and `blocks/ov25_carousel.liquid` is untracked. The Shopify integration remains unapproved; package/version and generated bundle updates are intentionally deferred to release.
- WooCommerce source now has selector/admin pass-through for `header`, `desktopCarousel`, and
  `mobileCarousel`, plus distinct Snap2 `modal`/`modal` storefront defaults, the Snap2 configure
  target, `RIGHT` variant/module positions, explicit false defaults for the new flags, and focused
  PHPUnit coverage. The mobile `inline-sticky` fallback remains intentionally mobile-only because
  Woo auto-emits its target. Existing non-empty saved configs are preserved rather than migrated.
  All Woo source/test changes remain unstaged and unapproved. Exact 0.8.0 package synchronization,
  build, and ZIP generation remain deferred to the release process.
- OV25 and WooCommerce must consume the release containing `fad225f`.

These cross-repository changes are not yet approved for release or merged into their production branches. Track them in [IMPORTANT_BUGS.md](IMPORTANT_BUGS.md), not in the empty core review queue.
