# Release Draft: ov25-ui@0.8.10

Status: Approved for release
Bump: patch
Base: `ov25-ui@0.8.9` (`d2212cbffa63`)
Head: `0135ba1cfdc8`

## Patch Notes

- Add `guided-overview`, an opt-in variant display mode that opens on the review summary and lets
  shoppers enter individual option editors. Its Previous and Next actions name their destinations,
  the final Next action returns to Review, and a separate back-to-review control leaves sheet/modal
  close controls available for closing the configurator.
- Keep pricing visible on Guided Overview's combined Buy now/Add to basket action. When
  `hidePricing` is enabled, the checkout action is removed and the two navigation controls use the
  available footer width.
- Add a Product Variants & Collections control for choosing one to six standard variant cards per
  row. Cards and thumbnails grow or shrink with their grid tracks, while the existing four-card
  layout remains the default and Size/product-card layouts retain their existing two-column rules.
- Extend `stringReplacements` and `cssString` coverage to Guided Overview, including its heading,
  back-to-review label, navigation labels, checkout price label, review rows, action footer, and
  variant-card grid.
- Improve mobile drawer layout when pricing is hidden: tabs, tree, accordion, and list content no
  longer reserve checkout space; Guided Overview shows one close control; and the standard wizard's
  Back action keeps stable geometry on its final review.

## Developer Summary

- `VariantDisplayMode.GuidedOverview`, `VariantDisplayStyleOverlay.GuidedOverview`, and the public
  `VariantDisplayMode` union now accept `guided-overview`. The Setup editor exposes the same option.
- `--ov25-variants-per-row` is a new unitless CSS custom property with a default of `4`; Setup exposes
  it as a 1–6 slider. Standard variant grids use fluid tracks and thumbnails, while Size cards are
  deliberately excluded.
- New string keys are `checkoutPriceLabel`, `wizardPreviousButtonLabel`,
  `wizardBackToReviewLabel`, and `wizardChooseOption`. Guided Overview also uses the existing
  `wizardPreviousStep`, `wizardNextStep`, review/overview, and review-row replacement keys.
- Guided Overview exposes dedicated `data-ov25-*` hooks and `.ov25-guided-overview-back` through the
  Setup style-selector catalogue. The checkout callback and price/SKU payload contracts are
  unchanged.
- The raw comparison includes the coordinated `ov25-setup@0.8.9` finalisation commit immediately
  after the `ov25-ui@0.8.9` base tag; the new 0.8.10 runtime work begins with commit `941b711`.

## Breaking Changes

- None known. Both new controls are additive and the default variant grid remains four columns.

## Downstream Impact

- OV25: remote `main` already pins the coordinated packages to `0.8.9`. Use the normal exact-version
  update workflow after publication; do not use the stale, dirty local checkout for release work.
- Shopify: remote `main` pins `ov25-ui-react18@0.8.8`, while the local checkout contains an
  uncommitted `0.8.9` pin. Reconcile that work before updating to exact `0.8.10`, rebuilding, creating
  a Shopify app version, and staging the responsive variant/checkout flows.
- WooCommerce: remote and local package files still pin `0.8.1`, and the local checkout contains
  substantial unrelated integration work. Reconcile it before advancing all three coordinated
  dependencies and producing a release build.
- `ov25-setup`: this release adds Guided Overview and the Variants per row slider. Finalisation must
  repin Setup to exact `ov25-ui@0.8.10` and regenerate both lockfiles after UI publication.
- Public docs: document `guided-overview`, `--ov25-variants-per-row`, the new string keys, and the new
  CSS hooks before documentation closeout.

## Tests And Evidence

- Type checking, unit tests, browser/component tests, the React 19 build, frozen Setup install/build,
  and the react-test build passed. See `test-summary.md`.
- Full Playwright runs repeatedly completed with 107 passed, 2 skipped, and 1 inconsistent failure.
  Network-dependent failures passed when rerun individually. The remaining new-headless visual
  comparison is a 4px wrapper-width difference after its checkout behavior assertions passed; the
  release owner accepted this documented exception.
- The release owner confirmed the isolated `npm run build:react18` preflight passed at the reviewed
  head.
- New focused E2E and unit coverage exercises Guided Overview navigation/height behavior,
  variants-per-row sizing, all no-pricing display modes, mobile drawer spacing/controls, string
  replacement hooks, and Setup style hydration.

## Needs Review

- Manually verify Guided Overview in representative inline, sheet, modal, drawer, variants-only,
  Standard, and Snap2 presentations, including opening on Review and keeping close/back controls
  distinct.
- Check one through six variants per row at narrow and wide widths, with four columns unchanged, and
  confirm existing client `cssString` overrides are not relying on the removed utility grid classes.
- Verify hidden-pricing mobile drawers reach the bottom and that normal priced drawers still reserve
  space for checkout.
- Track the new-headless 444px-versus-448px screenshot geometry mismatch separately; it is accepted
  for this release but should not remain a permanent source of release noise.
- Reconcile the dirty/stale Shopify and WooCommerce checkouts before their dependency releases.

## Approval

Approved by the release owner on 2026-08-27 after review of the patch notes, documented Playwright
exception, compatibility risks, downstream plan, and manual staging checklist. No version bump,
release commit, tag, publication, or deployment occurred while preparing or approving this artifact.
