# Release Draft: ov25-ui@0.8.3

Status: **Approved — full release suite and isolated React 18 build passed**
Bump: **patch** (`0.8.2` → `0.8.3`)
Completed-train base: `ov25-setup@0.8.2`
(`e9da768e85aef8254d5f723ad8f99c4421b79694`)
Head: `45fa5b5f92410d53ee379c12afb305038d7983cf`
Range: `ov25-setup@0.8.2..45fa5b5f92410d53ee379c12afb305038d7983cf`

Detailed artifacts: [patch notes](../releases/0.8.3/patch-notes.md),
[developer summary](../releases/0.8.3/developer-summary.md), and
[client email draft](../releases/0.8.3/client-email.md). Deterministic evidence starts at
[review context](../releases/0.8.3/context.md).

## Patch Notes

### Feature

- None. This is a focused storefront reliability patch.

### Improvement

- Selection Details sheets can be dismissed by clicking outside without applying the pending
  option.
- Unified the desktop variants-sheet and Selection Details page locks so overlapping instances
  restore the page only after their final acquisition releases.

### Bug

- Fixed storefront and configurator movement when a Selection Details sheet opens from a scrolled
  page.
- Fixed root scrollbar removal widening and reflowing responsive page content.
- Fixed Buy Now, swatches, and other below-fold content disappearing while the sheet was open on
  percentage-height or overflow-constrained themes.

## Developer Summary

- The actual `0.8.3` delta contains two commits across 17 files: 599 insertions, 190 deletions, and
  nine regenerated PNG baselines after the approved CDN thumbnail regeneration.
- A shared internal, reference-counted page lock now serves the desktop variants sheet and
  modal-style Selection Details surfaces.
- It freezes measured body geometry, lets the document root own scroll clipping, retains painting
  beyond percentage-height bodies, and restores exact captured inline styles and scroll position.
- Selection Details acquires the lock before paint and retains it through the exit transition.
- Sheet mode adds a transparent pointer-active backdrop for outside-click dismissal.
- No public TypeScript export, config option, callback, commerce payload, saved Setup schema, iframe
  message, or global CSS changed.
- `ov25-setup@0.8.3` is a coordination-only release with no Setup source changes; its version,
  exact UI dependency, and locks will advance together.

## Breaking Changes And Compatibility

- No public API/source break or required migration was found; the intentional dismissal and theme
  integration behavior changes are noted below.
- `.ov25-selection-details-backdrop` now exists for sheets as well as modals. Qualify modal-only
  custom CSS with `[data-display-mode="modal"]`.
- The page lock restores captured `html`/`body` inline layout declarations. Merchant code that
  rewrites the same declarations while a sheet is open should be tested on staging.

## Downstream Impact

- OV25: bump the coordinated exact package set after publication; no protocol or adapter change.
- Shopify: bump exact `ov25-ui-react18` to `0.8.3`, refresh the lock, rebuild the extension assets,
  and stage the original client scenario before deployment.
- WooCommerce: preserve and reconcile existing local integration work before updating packages.
- `ov25-setup`: coordination-only version/dependency/lock update; no Setup source behavior change.

## Tests And Evidence

- Focused type-check passed.
- Selection Details browser/component suite passed 15/15.
- Three focused headed Chromium regressions passed: existing variants-sheet reflow, nested Swatch
  Book locking, and the new scrolled below-fold visibility/geometry restoration case.
- The release owner manually retested and approved the reported client bug.
- The release-range and working-tree diff checks passed before artifact generation.
- The generated full `0.8.3` release test summary passed at committed HEAD `45fa5b5`: type-check,
  unit, browser/component, React 19 build, frozen Setup install/build, react-test build, preview
  readiness, and Playwright all passed.
- Playwright discovered 70 tests: all 68 active tests passed; the two existing bed-specific cases
  remained intentionally skipped as the approved coverage exception.
- The release owner confirmed the isolated React 18 publish build passed at final HEAD.

## Release Readiness

1. Completed: full release suite, isolated React 18 build, client regression testing, coverage
   exception review, and documented integration-risk review.
2. Commit this tracked combined draft before invoking `release:deploy`. The deterministic context is
   intentionally pinned to the reviewed source commit; an artifact-only commit does not create an
   infinite review loop.
3. Prepare the release without `--push`, inspect the generated release commit and tags, then follow
   the runbook's two-phase UI/React 18 and Setup push sequence.

## Approval

Approval received for final reviewed HEAD `45fa5b5f92410d53ee379c12afb305038d7983cf`:
`APPROVE ov25-ui@0.8.3`.

No version bump, release commit, release tag, package publication, Shopify deploy, WooCommerce
release, or OV25 deploy was performed while generating this draft.

No further artifact approval is required unless the reviewed source or risk assessment changes.
