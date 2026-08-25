# OV25 UI 0.8.8 Developer Summary

Status: **Approved — no known pre-tag code or test blocker**

## Review Identity

| Field | Value |
| --- | --- |
| Coordinated release | `ov25-ui@0.8.8`, `ov25-ui-react18@0.8.8`, `ov25-setup@0.8.8` |
| Bump | Patch |
| Comparison base | `ov25-ui@0.8.7` (`b05765174159`) |
| Tested head | `b4fa1453fcceaeedacdfbfa28b532053376ed27c` |
| Branch | `main` / `origin/main` |
| Review date | 2026-08-25 |
| Committed delta | 12 commits; 51 files; 5,114 insertions; 159 deletions |

The committed delta includes the final `ov25-setup@0.8.7` version/lockfile coordination and a large
set of development-only fixture, viewport, and release-process tooling. Runtime package behaviour
is concentrated in price/checkout readiness, Size cards, and Selection Details layout.

No version bump, release commit, tag, package publication, or downstream deployment was performed
while generating this review.

## Release Scope

### Price and checkout readiness

The UI no longer treats its initial formatted zero as a usable price. Until a normalized
`CURRENT_PRICE` arrives, the price component renders an accessible, reduced-motion-aware skeleton
and checkout price interpolation values remain empty. Buy now and Add to basket stay disabled until
both price and usable SKU messages have arrived.

Commerce snapshots reset when the shopper genuinely changes product or the configurator iframe is
replaced. The initial iframe sequence can report SKU and price before its first non-null product ID;
that initial ID is now treated as establishing the current epoch rather than a product transition,
so it does not clear a valid initial quote. Messages from retired or unrelated iframe windows are
ignored for default and explicitly identified instances alike.

The callback payload contract is unchanged. The change is when the existing callbacks become
available: they can no longer fire from disabled controls with null price/SKU snapshots.

### Size-card labels and thumbnails

Native Size-card labels now use the existing `variantName` string replacement, preserve their
original product name as fallback, and display real newline characters through safe React text
rendering. The memo comparator now includes the name and dimension-visibility inputs.

Synthetic Size options select the first resolvable image in this order:

1. product-information `metadata.cutoutImage`;
2. OV25's product-card screenshot projected as `configuratorThumbnail`;
3. the existing final gallery image;
4. no image.

Images are visible by default and contained rather than cropped. Explicit `showImage={false}` and
no-image states remain supported, and card selection still sends the same product ID.

### Selection Details layout

Landscape desktop sheets and mobile fullscreen surfaces now top-pack their image and copy instead
of vertically centring a shrinking grid row. The square image consumes only available space and
shrinks first on short panels; unusually long copy can scroll inside its own region while the
footer remains pinned. Other Selection Details display modes are unchanged.

### QA and release workflow

The development fixture app now has a validated E2E coverage ledger, focused-fixture test runner,
responsive viewport matrix/capture tooling, and stronger fixture synchronization. The release
runbook now tests before artifact generation and records the pre-release multi-agent/bookkeeping
workflow. These files do not ship in either npm package.

## Public API And Compatibility Audit

- `src/index.ts` and the package export map are unchanged.
- No existing string key, selector, setup setting, saved configuration field, iframe message, or
  checkout callback field was removed or renamed.
- `priceLoading` is an additive string-replacement key with default text `Loading price`.
- `configuratorThumbnail` is an optional product payload input used only for Size-card fallback.
- `window.ov25.configurator.price` and `.sku` can populate later because OV25 no longer publishes an
  initial zero snapshot. Fixed-time reads of these undocumented asynchronous globals should be
  treated as an integration risk and covered in release notes.
- Requiring both a usable SKU and price is intentionally stricter. Any product flow that does not
  publish one of those messages will remain disabled instead of submitting incomplete commerce
  data.

No breaking source or saved-data migration is known.

## Cross-Repository State And Deployment Order

| Repository | Frozen remote state | 0.8.8 implication |
| --- | --- | --- |
| `ov25-ui` | `b4fa145`, synchronized with `origin/main` | Publish UI and React 18 packages, then finalize Setup. |
| OV25 | `b9928fbd` remote main; includes `63796903` and `90edf441` | Required iframe/payload work is already deployed on main; update exact packages after publication. |
| Shopify | `ec70686`, synchronized with remote main | Update to React 18 package 0.8.8, rebuild, create and stage an app version, then promote manually. |
| WooCommerce | `1de7294`, synchronized with remote main | Reconcile substantial local work before changing all three exact package pins and producing a release ZIP. |
| Public docs | `aad4043` remote main | Local checkout is 11 commits behind; review documentation impact from current remote before publishing docs. |

The safe order is OV25 prerequisite code (already shipped) → UI/React 18 npm packages → Setup npm
package → OV25 exact dependency workflow → Shopify rebuild/staging/promotion → WooCommerce
dependency reconciliation/build/release → public documentation closeout.

Local OV25, Shopify, and WooCommerce worktrees contain unrelated or deferred changes. Do not use
those dirty trees for automated dependency commits without isolating or reconciling their work.

## Test Evidence

- `release:test` passed at `b4fa145` on 2026-08-25. The generated summary records successful type
  checking, unit tests, browser/component tests, React 19 package build, frozen Setup install/build,
  react-test build, preview readiness, and Playwright E2E.
- The release owner confirmed the isolated `npm run build:react18` preflight passed at the same
  committed head.
- Bug 59 focused tests cover the loading skeleton, price/SKU gating, callback readiness, iframe
  source filtering, initial ID ordering, and product reset behaviour.
- Feature 60/Bug 61 focused tests cover replacement fallback/newlines, memo inputs, cutout and
  screenshot fallback ordering, missing images, contained thumbnails, and unchanged selection IDs.
- Bug 62 focused browser tests cover desktop sheet and mobile fullscreen geometry, including short
  landscape viewports.
- Bug 63 stabilized the Buy Now ready-state screenshot, hidden-logo mobile fixture readiness, and
  Selection Details tooltip screenshot ownership without changing runtime code or snapshots.
- Direct npm registry requests returned 404 for all three `0.8.8` package versions, and fetched Git
  refs contain no corresponding tags.

## Manual Staging Checklist

1. On a standard Shopify PDP, throttle startup and confirm no `£0.00` flash, an accessible skeleton,
   and disabled CTAs until the first real price and SKU arrive.
2. Switch between products and confirm the skeleton/readiness cycle resets without showing stale
   price/SKU data.
3. Exercise representative standard, range, Snap2, and bed checkout flows; confirm each becomes
   enabled and sends its expected price/SKU payload.
4. On a range, verify user cutout → product-card screenshot → final-gallery fallback order,
   transparent containment, no-image handling, and unchanged product selection.
5. Verify a triggered multiline `variantName` replacement and an unmatched original-name fallback.
6. Recheck Selection Details desktop sheet and touch/mobile fullscreen layouts in short landscape
   viewports and the selected client theme.
7. After rebuilding Shopify from exact `ov25-ui-react18@0.8.8`, repeat the original price-flash
   scenario before promoting the tested app version.

## Review Decision

No known implementation or automated-test blocker remains. The release owner approved the artifact
wording, compatibility notes, downstream plan, and manual staging checklist on 2026-08-25. No
release action has happened.
