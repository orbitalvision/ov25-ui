# OV25 UI 0.8.10 Developer Summary

Status: **Approved — documented Playwright exception accepted**

## Review Identity

| Field | Value |
| --- | --- |
| Coordinated release | `ov25-ui@0.8.10`, `ov25-ui-react18@0.8.10`, `ov25-setup@0.8.10` |
| Bump | Patch |
| Comparison base | `ov25-ui@0.8.9` (`d2212cbffa63`) |
| Reviewed head | `0135ba1cfdc84fa1d3ed49fa8418ced2a33a2a9b` |
| Branch | `main` / `origin/main` |
| Review date | 2026-08-27 |
| Committed delta | 8 commits; 55 files; 1,899 insertions; 146 deletions |

The raw range includes the final `ov25-setup@0.8.9` version/lockfile coordination commit. Runtime
0.8.10 work is concentrated in Guided Overview, fluid variant-card grids, checkout-label
customization, and mobile hidden-pricing layouts; the remaining changes are Setup integration,
fixtures, compatibility guidance, and regression coverage.

No version bump, release commit, tag, package publication, or downstream deployment was performed
while generating this review.

## Release Scope

### Guided Overview display mode

`guided-overview` is a new opt-in member of the public variant display mode unions and enum-like
constants. It uses the wizard's option data and selection content but starts on the review hub. A
review row opens its matching option editor, and the Undo control returns to Review without closing
the surrounding sheet or modal.

The mode removes step counts and the wizard's top previous/next controls. Its footer uses two named
navigation actions on the first row and the existing combined checkout action on the second row.
Previous is disabled on Review; Next enters the first option from Review, advances through options,
and returns to Review from the final option. The header uses `Choose ${OPTION_NAME}` inside an editor.

Inline review and editor surfaces both use `--ov25-wizard-variants-content-height`. Guided Overview
suppresses the redundant inner scrollbar and separates the in-mode back action from the viewer's
close control across sheet, modal, variants-only, Snap2, and mobile drawer shells.

### Checkout and hidden-pricing behavior

The checkout button's formatted price now resolves through the additive `checkoutPriceLabel` string
key before rendering. Guided Overview embeds the normal checkout component, preserving its combined
Buy now/Add to basket behavior and existing callback payloads.

When `hidePricing` is true, Guided Overview omits checkout and gives Previous/Next the full footer
row. Mobile list, tabs, tree, and accordion surfaces no longer reserve bottom padding for an absent
checkout control. Guided Overview no longer renders a duplicate drawer-local close button, and the
standard mobile wizard preserves the Back button's footer padding and geometry on Review.

### Configurable variants per row

All standard variant-card grids now share `.ov25-variant-card-grid`, whose column count is controlled
by the unitless `--ov25-variants-per-row` custom property. The default is `4`. Tracks use
`minmax(0, 1fr)`, and the thumbnail wrapper/image/overlay scale with track width; the four-column
thumbnail remains at its previous size. Size/product-card grids intentionally retain their existing
two-column treatment.

The Setup Product Variants & Collections group exposes a 1–6 slider. The style editor now supports
unitless slider values and includes the shared grid plus Guided Overview's major structural elements
in its selector catalogue.

### Customization and compatibility contract

New string-replacement keys:

- `checkoutPriceLabel` with price/subtotal/discount interpolation values;
- `wizardPreviousButtonLabel`;
- `wizardBackToReviewLabel`;
- `wizardChooseOption` with `OPTION_NAME`.

Guided Overview also consumes the existing `wizardPreviousStep`, `wizardNextStep`, `wizardReview`,
`wizardOverview`, `wizardReviewStepOption`, and `wizardReviewStepSelection` keys. Its root, header,
back action, review rows/parts, editor, footer actions, and checkout price label have stable CSS/data
hooks represented in the Setup style catalogue. The development compatibility guide now states that
every UI feature must include both string-replacement and `cssString` coverage.

## Public API And Compatibility Audit

- `VariantDisplayMode.GuidedOverview` and `VariantDisplayStyleOverlay.GuidedOverview` are additive.
- The public `VariantDisplayMode` TypeScript union now includes `'guided-overview'`.
- Setup's `FormVariantDisplayMode` and configurator option list include the new value.
- `--ov25-variants-per-row` is additive and defaults to the prior four-column layout.
- No package entry-point export, existing display-mode value, selector, iframe message, checkout
  callback, price/SKU payload, or saved setup field was removed or renamed.
- Existing client CSS that targets generated four-column utility classes or overrides thumbnail
  width/height with lower specificity may need to move to `--ov25-variants-per-row` or the new stable
  grid hooks. This is a customization risk, not a known default-layout regression.

No source or saved-data migration is known.

## Cross-Repository State And Deployment Order

| Repository | Observed state | 0.8.10 implication |
| --- | --- | --- |
| `ov25-ui` | `0135ba1`, synchronized with `origin/main`; only `releases/0.8.10/` is untracked | Review and approve artifacts before preparing package tags. |
| OV25 | Local `main` is 56 commits behind and heavily dirty; `origin/main` pins all packages to `0.8.9` | Use the normal remote workflow to update exact package versions after publication; avoid the local checkout. |
| Shopify | `origin/main` pins React 18 `0.8.8`; local dirty files advance it to `0.8.9` | Reconcile local work, then pin `0.8.10`, rebuild, create/stage an app version, and promote manually. |
| WooCommerce | `origin/main` and local package pin `0.8.1`; local source is substantially dirty | Reconcile integration work before updating all coordinated dependencies and creating a release ZIP. |
| Public docs | Clean local `main` synchronized with `origin/main` at `c87b002` | Add public guidance for the new display mode, CSS variable, replacement keys, and selectors. |

Safe order: approve UI artifacts → publish UI/React 18 packages through tag workflows → finalize and
publish Setup → update OV25 exact dependencies → reconcile/rebuild/stage Shopify → reconcile/build
WooCommerce → close public documentation gaps.

## Test Evidence

- The release summary records passes for type checking, unit tests, browser/component tests, the
  React 19 package build, frozen Setup dependency install/build, react-test build, and preview-server
  readiness.
- Full Playwright runs reached 107 passed and 2 skipped, with one inconsistent failure per run.
  Network-related failures passed individually. The remaining new-headless visual comparison differs
  only in wrapper width (444px baseline versus 448px actual) after its checkout behavior assertions
  passed. The release owner explicitly accepted these exceptions in `test-summary.md`.
- The release owner confirmed the required isolated React 18 publish build passed at reviewed
  `HEAD`.
- Guided Overview has focused unit and Playwright coverage for review-first entry, review-row entry,
  Undo-to-review, named Previous/Next navigation, final-option return, review disabled state, fixed
  height propagation, checkout/no-pricing layout, and close-control ownership.
- Variants-per-row coverage checks Setup hydration, grid counts, responsive card/thumbnail scaling,
  and preservation of the four-column baseline.
- No-pricing coverage exercises Standard and Snap2 across wizard, Guided Overview, list, tabs,
  accordion, and tree, plus the affected mobile drawer geometries.

## Manual Staging Checklist

1. Open Guided Overview in inline, sheet, modal, variants-only, and mobile drawer presentations.
   Confirm Review is the entry state, each review row opens the correct option, Undo returns to
   Review, and the viewer close button still closes the presentation.
2. Check Previous/Next destination labels, Review disabled state, final-option return to Review, and
   the combined checkout action with price visible.
3. Enable hidden pricing and confirm checkout disappears, navigation expands, and mobile list/tabs/
   tree/accordion content reaches the drawer bottom without obscuring variants.
4. Set variants per row from one through six in Setup. Verify fluid square thumbnails at narrow and
   wide widths, the unchanged four-column default, and unchanged Size/product-card grids.
5. Apply representative `stringReplacements` and `cssString` overrides to every new Guided Overview
   surface and the checkout price label.
6. Recheck representative Standard, Snap2, range, modules, and Size-option configurations on desktop
   and mobile.
7. After rebuilding Shopify with exact `ov25-ui-react18@0.8.10`, repeat checkout and responsive-mode
   checks on a staging or duplicate theme before promotion.

## Needs Review

- Decide whether the accepted headless snapshot-width mismatch should be corrected before the next
  release so `release:test` can finish without a manual exception.
- Confirm no production client stylesheet relies on the generated four-column utility class or
  lower-specificity fixed thumbnail dimensions replaced by the stable grid hooks.
- Confirm the public docs update is included in release closeout.
- Reconcile the dirty Shopify and WooCommerce worktrees before changing dependency pins.

## Review Decision

Approved by the release owner on 2026-08-27 after review of the patch notes, documented Playwright
exception, compatibility risks, downstream plan, and manual staging checklist. No release action
occurred while preparing or approving these artifacts.
