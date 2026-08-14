# Release Draft: ov25-ui@0.8.2

Status: **Ready for final artifact review — no known pre-tag code or test blocker**
Bump: **patch** (`0.8.1` → `0.8.2`)
Base: `ov25-ui@0.8.1` (`71dde5c7af3ff61c2df75f3cfb998d4618a3c755`)
Head: `dcb55e5e7ff5cfa91610140e6f9cc026fd85d70c`
Range: `ov25-ui@0.8.1..dcb55e5e7ff5cfa91610140e6f9cc026fd85d70c`

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
- Made the coordinated release flow regenerate and verify both Setup lockfiles after the matching
  `ov25-ui` package is available, preventing frozen-lockfile drift.

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

- The reviewed range contains 27 commits across 107 files: 8,978 insertions and 735 deletions.
- `ov25-ui` adds the `SelectionDetailsDisplayMode` export and the
  `configurator.variants.selectionDetails.displayMode` configuration contract.
- Omitted Selection Details configuration still resolves to `none`, preserving direct selection for
  existing runtime integrations.
- New Configurator Setup state defaults to tooltip on desktop and fullscreen on mobile. Existing
  saved Setup payloads without this field hydrate to `none`/`none`. The release owner approved this
  new-configuration default.
- Selection Details can send `PRELOAD_SELECTION` and, for abandoned tooltip previews,
  `CANCEL_PRELOAD_SELECTION` after the visible details image has painted.
- SKU, price, `onChange`, `addToBasket`, and `buyNow` callback signatures and payload shapes are
  unchanged in this range.
- `release:deploy` now uses a two-phase flow: create and optionally push the UI/React 18 tags, wait
  for the tag-triggered `ov25-ui` registry package, regenerate Setup's npm and Bun locks, verify a
  frozen install/build, then commit and tag `ov25-setup`.

## Breaking Changes And Compatibility Decisions

- No deliberate runtime configuration or commerce-payload break was found.
- The release owner explicitly accepted the patch-release source-compatibility risk from widening
  the exported `Swatch` type to model numeric manufacturer IDs and optional/nullable backend data.
- The release owner explicitly accepted that external `ov25-setup` code constructing exported
  `TypeSettings` must provide the two new Selection Details fields.
- The release owner explicitly accepted that adding `variants-only-sheet` to a public union may
  require updates to exhaustive external switches, even though the runtime mode already existed.
- The patch classification is retained with those source-compatibility decisions documented.

## Downstream Impact

- OV25: exact dependencies remain at `0.8.1`. Selection-preload receiving is not yet on the normal
  rollout path. Selection application remains compatible; do not advertise preload performance
  until that receiver is reviewed and deployed with the UI.
- WooCommerce: exact dependencies remain at `0.8.1`. Preserve and reconcile existing host-integration
  work before updating dependencies and building the plugin.
- Shopify: the current integration uses exact `ov25-ui-react18@0.8.1`. Update the dependency and
  lockfile, rebuild the bundle, and complete staged theme/app-version checks after publication.
- `ov25-setup`: part of the coordinated `0.8.2` set because it depends exactly on `ov25-ui`. Its new
  Setup defaults and optional Global integration API require host rollout review.

## Tests And Evidence

- The full `release:test` suite passed against the final runtime source subsequently committed as
  `16f12b3`: type-check, unit tests, browser/component tests, the React 19 package build, frozen
  Configurator Setup install/build, react-test build, preview readiness, and Playwright E2E.
- Playwright completed 69 tests: 67 passed, 0 failed, 0 flaky, and 2 intentionally skipped bed cases.
  The release owner accepted those two bed cases as a documented coverage exception.
- The release owner reported that the runbook's isolated React 18 publish build passed after the
  final runtime fixes. Later commits change only release tooling, documentation, and artifacts.
- The release automation change passed type-check and the complete 281-test unit suite. A real
  temporary Setup lock regeneration against `0.8.1` reproduced the committed manifest and both
  lockfiles byte-for-byte.
- The committed release-range and current working-tree diff checks pass. Configurator Setup's
  manifest and Bun/npm locks align on `ov25-ui@0.8.1`, as expected before the coordinated bump.
- No matching local `0.8.2` tags exist. No release action has been performed during this review.

## Accepted Exceptions And Remaining Rollout Work

- The bed shared-detail and bed selection-only screenshot tests remain intentionally skipped. This
  is an accepted coverage exception, not an active test failure.
- Safari/tablet, accessibility, responsive, cart, Shopify theme, WooCommerce plugin, documentation,
  and client-specific staging remain required before live rollout.
- Integrate and deploy the OV25 preload receiver before claiming Selection Details preloading end to
  end.

## Approval

All known package pre-tag technical blockers have been resolved. This refreshed text still requires
final artifact review and must be committed before `release:deploy`, because this combined draft is
a tracked file outside the versioned-artifact allowlist.

No version bump, release commit, release tag, package publication, Shopify deploy, WooCommerce
release, or OV25 deploy was performed while refreshing this draft.

The final manual approval phrase is `APPROVE ov25-ui@0.8.2`.
