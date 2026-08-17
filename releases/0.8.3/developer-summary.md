# OV25 UI 0.8.3 Developer Summary

Status: **Approved — no known pre-tag code or test blocker**

## Review Identity

| Field | Value |
| --- | --- |
| Coordinated release | `ov25-ui@0.8.3`, `ov25-ui-react18@0.8.3`, `ov25-setup@0.8.3` |
| Bump | `patch` |
| Completed-train base | `ov25-setup@0.8.2` (`e9da768e85aef8254d5f723ad8f99c4421b79694`) |
| UI/React 18 package tag | `ov25-ui@0.8.2` / `ov25-ui-react18@0.8.2` (`86c36435ce80095bf0635a71fe240a8b9b920cc4`) |
| Head | `45fa5b5f92410d53ee379c12afb305038d7983cf` |
| Branch | `main` / `origin/main` |
| Review date | `2026-08-17` |
| Patch delta | 2 commits; 17 files; 599 insertions; 190 deletions; 9 regenerated PNG baselines |

The completed Setup tag is the deterministic base because it marks the end of the coordinated
`0.8.2` train. Comparing from the earlier UI tag also includes `e9da768`, which contains only the
previous Setup `0.8.2` version and lock finalization, not `0.8.3` product work.

Review artifacts: [combined review draft](../../release-drafts/ov25-ui-0.8.3.md),
[patch notes](patch-notes.md), [client email](client-email.md), and
[deterministic review context](context.md).

No version was bumped, and no release commit, tag, package publication, or downstream deployment
was performed while generating this review. Root and Setup manifests remain coherently at `0.8.2`.

## Release Verdict

**No known implementation or source-compatibility blocker remains.** The patch is narrowly scoped
to Selection Details sheet dismissal and shared page-scroll locking. The full release suite passed
at final committed HEAD, the release owner confirmed the isolated React 18 publish build passed,
and the original client scenario passed manual retesting.

The release owner approved the final package review and the documented low theme-integration risks
with `APPROVE ov25-ui@0.8.3`. Package release preparation may proceed after the refreshed combined
draft is committed. Shopify, OV25, WooCommerce, browser/device, and client-theme staging remain
rollout work rather than package pre-tag blockers.

## Changed Areas

| Area | Summary |
| --- | --- |
| Shared page locking | Extracts the desktop variants-sheet lock into an internal, reference-counted utility used by both overlay systems. |
| Selection Details | Acquires the lock before paint, retains it through exit, and adds click-outside sheet dismissal. |
| Desktop variants sheet | Adopts the shared lock with no intended presentation or public API change. |
| Merchant-page compatibility | Preserves measured page geometry and below-fold painting while the root owns scroll clipping. |
| Fixtures | Adds realistic content below the configurator and a selectable Selection Details mode to the inline-sticky fixture. |
| Tests | Adds browser interaction coverage and a scrolled, repeated open/close geometry and clipping regression; refreshes nine approved live-thumbnail visual baselines. |
| `ov25-setup` | No Setup source change; the coordinated patch will update only its version, exact UI dependency, and locks. |

## Implementation Summary

### Shared Page Scroll Lock

`src/utils/page-scroll-lock.ts` now owns the geometry-preserving lock previously embedded in
`VariantContentDesktop`. It is internal and is not exported from the package entry point.

On first acquisition it:

- snapshots the current `window.scrollX`/`scrollY` and relevant `html`/`body` inline declarations,
  including declaration priority;
- measures the body and fixes it at the same viewport rect and width;
- removes the root scrollbar gutter while keeping the background content at its old geometry, so a
  fixed sheet can reach the true viewport edge without widening or moving the page;
- keeps both body overflow axes visible while fixed and locks overflow at the document root; and
- falls back to a scroll-offset/width lock for bodies that cannot safely use measured geometry.

The body-overflow behavior is essential for storefronts whose `html`, `body`, root, or app wrappers
have percentage heights. Once a body becomes fixed, authored overflow no longer propagates to the
viewport and can clip content beyond the body's used height. Keeping both axes visible preserves
Buy Now, swatches, and other below-fold content; both axes are set because CSS overflow-axis
coupling can otherwise compute the visible axis to `auto`.

Acquisitions from variants sheets and Selection Details are reference counted and share one
snapshot. Selection Details retains its acquisition while Swatch Book is layered above it. The
exact original declarations and scroll position return only after the final lock holder releases.

### Selection Details Lifecycle And Dismissal

All non-tooltip Selection Details modes acquire the shared lock in a browser-safe layout effect as
soon as the retained surface exists. The retained render state keeps the lock through the exit
transition, preventing a close-time reflow.

Sheet mode now renders the same backdrop element used by modal mode, but transparent. It receives
pointer events behind the panel, carries `data-display-mode="sheet"`, and dismisses without applying
the pending selection. Clicking within the panel does not reach the backdrop. Modal keeps its dark,
animated backdrop.

## Public API And Compatibility Audit

No diff was found in public exports, configuration types, injection normalization, callbacks,
commerce payloads, iframe messages, Setup source, or global CSS. Specifically:

- no public TypeScript symbol was added, removed, renamed, or widened;
- `configurator.variants.selectionDetails.displayMode` and all defaults are unchanged;
- SKU, price, `onChange`, Add to Basket, Buy Now, and Swatch Book callback shapes are unchanged; and
- no saved configuration migration is required.

The new scroll-lock utility is internal: package exports expose only the built root entry and
`src/index.ts` does not re-export it.

### CSS And Theme Integration Notes

- `.ov25-selection-details-backdrop` previously existed only for modal and now also exists for
  sheet. Because Setup exposes that selector as a style hook, an unqualified merchant rule may now
  style the transparent sheet dismiss layer. Use
  `.ov25-selection-details-backdrop[data-display-mode="modal"]` for modal-only styling.
- Unlock restores the `html`/`body` inline declarations captured at acquisition. A merchant script
  that deliberately changes one of those same properties while the overlay is open may have that
  concurrent mutation replaced by the saved value.
- Unusual fixed/sticky merchant widgets and transformed, zoomed, or `display: contents` bodies
  remain staging targets. The utility includes a conservative fallback for body geometries it
  cannot safely freeze by measurement.

These are low integration risks rather than public source breaks and do not require a package API
migration.

## Test Evidence

The generated [`0.8.3` test summary](test-summary.md) records a successful run from
`2026-08-17T07:12:52.872Z` to `2026-08-17T07:14:41.946Z` against committed HEAD `45fa5b5`.

- Passed: type-check, unit tests, browser/component tests, React 19 production build, frozen
  Configurator Setup install, Setup build, react-test build, preview readiness, and Playwright E2E.
- Playwright discovered 70 tests: 68 active tests passed and two bed-specific cases remained
  intentionally skipped as the existing approved coverage exception.
- Nine visual baselines were regenerated after the approved CDN thumbnail regeneration and
  committed as `45fa5b5`; the complete suite passed after that commit.
- Owner-confirmed manual preflight: the isolated React 18 publish build passed at final HEAD.

Focused regression evidence retained for the patch:

- `bun run type-check`: passed.
- `test/browser/SelectionDetails.test.tsx`: 15/15 passed. New coverage proves that clicking inside
  a sheet keeps it open, clicking its transparent backdrop closes it, and no selection is applied.
- Headed Chromium focused regressions: 3/3 passed. They cover the existing desktop sheet geometry,
  nested Swatch Book over Selection Details, and the new scrolled visible-overflow regression.
- The new E2E regression opens and closes twice at nonzero scroll, checks a below-fold sentinel's
  painted intersection, page/configurator geometry, gutter removal, scroll-input suppression, and
  exact inline-style/scroll restoration. It includes a merchant-style
  `body { overflow-x: hidden !important; }` declaration.
- `git diff --check ov25-setup@0.8.2..HEAD`: passed.
- The release owner manually retested the client scenario, approved it, and committed the fix.

Evidence limits:

- Playwright coverage is Chromium-based; Shopify theme/browser/device staging remains required.
- The two skipped bed cases remain a documented coverage exception rather than active validation.

## Downstream Impact

| Repository | Current state | Patch implication |
| --- | --- | --- |
| `OV25` | Deployed main uses the coordinated `0.8.2` packages. | Update all three exact packages through the normal workflow after publication. No iframe protocol or adapter change is required for this patch. |
| `shopify-plugin` | Clean main uses exact `ov25-ui-react18@0.8.2`. | Bump the extension to exact `0.8.3`, refresh the lock, rebuild ignored bundle assets, and stage the original client URL/theme scenario before deployment. |
| `ov25-woo-extension` | Package pins remain at `0.8.1` and substantial local integration work is present. | Preserve and reconcile the existing work before any dependency update; do not mix the rollout into that dirty tree. |
| `ov25-setup` | Source and current locks are unchanged after the completed `0.8.2` tag. | Coordination-only publish with no Setup source changes; the two-phase release flow will update its version and regenerate its exact `0.8.3` dependency and npm/Bun locks after UI publication. |

Consumer working-tree state is rollout coordination, not a blocker to drafting or publishing the
three packages.

The unmerged `codex/shopify-live-preview-ov25` branch is unrelated to this scroll-lock patch and is
well behind deployed OV25 `main`. Do not merge it as part of the dependency bump; reconcile its
Configurator Setup redesign separately against current main while preserving the eventual `0.8.3`
pins.

## Pre-Tag Checklist

1. Completed: full `release:test` suite passed at final HEAD.
2. Completed: isolated React 18 publish build passed at final HEAD.
3. Completed: client regression, integration risks, coverage exception, and artifacts approved.
4. Commit the tracked combined draft before `release:deploy`; files under `releases/0.8.3/` are in
   the deploy allowlist. An artifact-only commit after this pinned review does not change the
   reviewed runtime range.
5. Run `npm run release:deploy -- --release 0.8.3` without `--push`, then inspect the generated UI
   release commit, both UI tags, package metadata, and working-tree state before pushing.
6. After `ov25-ui@0.8.3` publishes, finalize and inspect the Setup release commit/tag as documented
   in the two-phase runbook.

Approval received: `APPROVE ov25-ui@0.8.3`.
