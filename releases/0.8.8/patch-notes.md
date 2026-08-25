# Release Draft: ov25-ui@0.8.8

Status: Approved for release
Bump: patch
Base: `ov25-ui@0.8.7` (`b057651`)
Head: `b4fa145`

## Patch Notes

- Replace the temporary `£0.00` storefront price with an accessible loading skeleton until the
  configurator supplies real pricing.
- Keep Buy now and Add to basket disabled until the current configuration has both a price and a
  usable SKU, preventing early null-priced checkout callbacks.
- Support safe multiline Size-card names through the existing `variantName` replacement system.
- Prefer product cutouts for Size-card thumbnails, then fall back to the configurator product-card
  screenshot and final gallery image without cropping transparent cutouts.
- Keep the image, title, and description top-aligned in landscape Selection Details sheets and
  mobile fullscreen panels, including short viewports.

## Developer Summary

- Commerce readiness is now tracked independently for `CURRENT_PRICE` and `CURRENT_SKU`. Placeholder
  zero values are hidden, unusable SKU messages are ignored, and commerce state is reset on genuine
  product changes or iframe replacement.
- Iframe messages are accepted only from the currently mounted configurator iframe. The initial
  `CURRENT_PRODUCT_ID: null` sequence no longer clears a valid quote that arrived first.
- `priceLoading` is a new configurable string key for the skeleton's screen-reader label.
- Size cards resolve their heading with
  `getString('variantName', { VARIANT_NAME: variant.name }, variant.name)` and render embedded
  newlines as text using `white-space: pre-line`; no HTML rendering was introduced.
- Synthetic Size options resolve `metadata.cutoutImage`, then `configuratorThumbnail`, then the
  final `metadata.images[]` entry. Size-card images now default to visible and use `object-contain`.
- The Selection Details landscape sheet/mobile-fullscreen content uses a top-packed flex layout;
  the square image shrinks before long copy scrolls, while the action footer remains pinned.
- Release QA gained an E2E fixture ledger, focused-fixture runner, responsive viewport matrix, and
  more deterministic screenshot synchronization. These are development-only changes.
- No package entry-point export, checkout callback shape, price/SKU payload shape, saved setup
  schema, or selector was removed or renamed.

## Breaking Changes

- None known.

## Downstream Impact

- OV25: required Bug 59 message suppression (`63796903`) and Bug 61
  `configuratorThumbnail` projection (`90edf441`) are already on remote `main`. After publication,
  update the three exact package versions through the normal OV25 workflow.
- Shopify: the light-DOM price skeleton/null guard is already on remote `main` (`ec70686`). Publish
  `ov25-ui-react18@0.8.8`, update the extension's exact dependency, rebuild the bundle, create a
  Shopify app version, and stage it before promotion. Deferred theme-patcher/template-route work is
  explicitly outside this release.
- WooCommerce: no Bug 59/60/61 adapter source change is required, but the exact UI, React 18, and
  Setup dependencies must be updated together. Preserve and reconcile the substantial existing
  local WooCommerce work before making that release commit.
- `ov25-setup`: no new Setup feature is included. The release finalisation should repin Setup to
  exact `ov25-ui@0.8.8` and regenerate both lockfiles after the UI package is published.

## Tests And Evidence

- The complete `release:test` sequence passed at `b4fa145`: type check, unit tests,
  browser/component tests, React 19 build, frozen Setup install/build, react-test build, and
  Playwright E2E.
- The release owner confirmed the isolated React 18 publish build passed at the same commit.
- Focused Bug 59 commerce/readiness tests, Size-card replacement/thumbnail tests, Selection Details
  geometry tests, and stabilized E2E cases passed during implementation and review.
- Git and npm preflight found no `0.8.8` package tags or published versions.

## Needs Review

- Merchant code that reads `window.ov25.configurator.price` or `.sku` at a fixed early moment may
  now see the value later (or temporarily `undefined`) instead of a misleading zero. These globals
  are undocumented and were already asynchronous, but the timing change should be noted.
- A storefront/configuration that never publishes both a usable SKU and a price will now keep its
  checkout controls disabled. Confirm representative standard, range, Snap2, and bed flows before
  downstream promotion.
- Confirm the new default-visible Size-card thumbnails and merchant-specific multiline
  `variantName` replacements on representative range products.
- Recheck the Selection Details sheet and mobile fullscreen layouts in short landscape viewports
  and in any heavily customized client theme selected for staging.

## Approval

Approved by the release owner on 2026-08-25 after review of the artifacts, compatibility notes,
downstream plan, and manual staging checklist. No release action happened while preparing or
approving this draft.
