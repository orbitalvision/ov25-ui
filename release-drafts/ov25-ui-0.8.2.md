# Release Draft: ov25-ui@0.8.2

Status: **Draft, not approved — automated release validation passed; exact React 18 and
manual/downstream validation remain**
Bump: **patch** (`0.8.1` → `0.8.2`)
Base: `ov25-ui@0.8.1` (`71dde5c7af3ff61c2df75f3cfb998d4618a3c755`)
Head: `16f12b381d0924477f2d7504121c15cd2196c160`
Range: `ov25-ui@0.8.1..16f12b381d0924477f2d7504121c15cd2196c160`

Detailed artifacts: [patch notes](../releases/0.8.2/patch-notes.md),
[developer summary](../releases/0.8.2/developer-summary.md), and
[client email draft](../releases/0.8.2/client-email.md). Deterministic range evidence starts at
[review context](../releases/0.8.2/context.md).

## Patch Notes

### Feature

- Added responsive Selection Details views so customers can inspect option imagery, descriptions,
  and swatch actions before applying a selection. Desktop supports tooltip, sheet, modal, and
  fullscreen presentations; mobile supports modal and fullscreen.
- Redesigned Configurator Setup into a unified Product Type, Settings, Style, and optional,
  host-provided Global integration experience for platform-owned storefront settings.

### Improvement

- Improved Swatch Book missing-image fallbacks, group-aware swatch identity, and overlay ordering.
- Expanded stable custom-CSS hooks for variant cards, module-card loading states, Selection Details,
  and Snap2 desktop/mobile view controls.
- Added replaceable Selection Details title and description copy with template interpolation and
  trigger support.

### Bug

- Fixed product-carousel selection when storefront images are combined with OV25 cutout and gallery
  images, including deferred 3D loading.
- Fixed Inline (sticky) sizing and scrolling on tablet/mobile layouts, prevented pinned option
  headers from overlapping filters, and reduced page reflow when sheets open and close.
- Fixed Selection Details title/description copy bypassing configured replacements and fixed the
  Snap2 mobile view control not exposing the same stable styling target as desktop.
- Fixed Selection Details tooltips reopening after apply, remaining attached to replaced cards, and
  failing to reopen after genuine pointer re-entry.
- Fixed focus restoration after closing sheet, modal, and fullscreen Selection Details by waiting
  for `inert` cleanup across shadow-root boundaries.
- Fixed React 18 and React 19 overlay isolation so Selection Details and gallery placeholders
  preserve the `inert` HTML attribute without JSX errors or rendering warnings.
- Fixed the Configurator Setup bed preview, frozen dependency install, and public
  `variants-only-sheet` display-mode type.

## Developer Summary

- The reviewed range contains 24 commits across 104 files: 8,236 insertions and 685 deletions.
- `ov25-ui` adds the `SelectionDetailsDisplayMode` export and the
  `configurator.variants.selectionDetails.displayMode` configuration contract.
- Omitted Selection Details configuration still resolves to `none`, preserving direct selection for
  existing runtime integrations.
- New Configurator Setup state defaults to tooltip on desktop and fullscreen on mobile. Existing
  saved Setup payloads without this field hydrate to `none`/`none`.
- Selection Details can send `PRELOAD_SELECTION` and, for abandoned tooltip previews,
  `CANCEL_PRELOAD_SELECTION` after the visible details image has painted.
- SKU, price, `onChange`, `addToBasket`, and `buyNow` callback signatures and payload shapes are
  unchanged in this range.

## Breaking Changes

- No deliberate runtime configuration or commerce-payload break was found.
- **Source-compatibility risk:** the exported `Swatch` type now accepts numeric manufacturer IDs and
  optional/nullable description, SKU, and thumbnail fields. Strict callback consumers may need null
  checks or a wider manufacturer-ID type.
- **`ov25-setup` source-compatibility risk:** exported `TypeSettings` now requires desktop and mobile
  Selection Details fields. External code constructing this type must provide them.
- Adding `variants-only-sheet` to a public union can require updates to exhaustive external switches,
  even though the runtime mode already existed.

## Downstream Impact

- OV25: exact dependencies remain at `0.8.1`. Selection-preload receiving is committed on
  `codex/selection-details-preload`, but not on the normal `main` rollout path. Selection application
  remains compatible; do not advertise preload performance until that receiver is reviewed and
  deployed with the UI.
- WooCommerce: exact dependencies remain at `0.8.1`. The local checkout contains substantial
  uncommitted host-integration work; preserve and reconcile it before updating dependencies.
- Shopify: clean `main` uses exact `ov25-ui-react18@0.8.1`. It still needs a current-head React 18
  preflight, exact dependency/lockfile update, rebuilt bundle, and staged theme/app-version checks.
- `ov25-setup`: part of the coordinated `0.8.2` set because it depends exactly on `ov25-ui`. Its new
  Setup defaults and Global integration API require review with platform hosts.

## Tests And Evidence

- The full `release:test` suite passed against the working tree subsequently committed as
  `16f12b3`: type-check, unit tests, browser/component tests, the React 19 package build, frozen
  Configurator Setup install/build, react-test build, preview readiness, and Playwright E2E.
- Playwright completed 69 tests: 67 passed, 0 failed, 0 flaky, and 2 intentionally skipped bed cases.
- The bed shared-detail and bed selection-only screenshot skips remain a coverage exception, not a
  failing test gate.
- The exact isolated React 18 package build last passed at `29386fb`. Shared runtime source changed in
  `16f12b3`, so the runbook-required React 18 preflight must be rerun at current HEAD before tags.
- The committed release range and current working-tree diff checks pass. Configurator Setup's
  manifest and Bun/npm locks align on `ov25-ui@0.8.1`, and the frozen install passed.
- Registry inspection on 2026-08-14 confirmed that none of `ov25-ui@0.8.2`,
  `ov25-ui-react18@0.8.2`, or `ov25-setup@0.8.2` exists. Matching local tags are also absent.

## Remaining Blockers And Review

- Run the exact isolated React 18 build at `16f12b3` before creating package tags.
- Fix `release:deploy` so its coordinated `0.8.2` version bump refreshes and stages
  `setup/bun.lock`, or use a separately reviewed manual release-commit flow instead of the current
  script.
- Accept the two skipped bed cases as a documented exception only after equivalent manual bed
  validation, or restore reliable automated coverage.
- Confirm that patch remains the intended classification despite the new feature and public
  TypeScript source-compatibility risks.
- Approve the fresh-Setup default of tooltip desktop/fullscreen mobile; saved configurations remain
  disabled unless explicitly changed.
- Integrate the OV25 preload receiver before claiming Selection Details preloading end to end.
- Complete Shopify, WooCommerce, Safari/tablet, accessibility, responsive, cart, and documentation
  staging checks before live rollout.
- `release-drafts/` is outside the `release:deploy` working-tree allowlist. Commit or remove this
  combined draft before running the deploy script; approved versioned artifacts live under
  `releases/0.8.2/`.

## Approval

No version bump, release commit, release tag, package publication, Shopify deploy, WooCommerce
release, or OV25 deploy was performed while refreshing this draft.

Do not create tags until the React 18 and lockfile-generation blockers are resolved. The later manual
approval phrase is `APPROVE ov25-ui@0.8.2`.
