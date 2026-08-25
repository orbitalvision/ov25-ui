# Release Draft: ov25-ui@0.8.9

Status: Approved for release
Bump: patch
Base: `ov25-ui@0.8.8` (`5bd6dde`)
Head: `a8f0dd8`

## Patch Notes

- Prevent the storefront price from remaining on its loading skeleton when a cached configurator
  iframe emits its initial price and SKU messages during startup, particularly on Safari/iOS.
- Preserve an initial valid quote when the same product ID is delivered as equivalent numeric and
  string values.

## Developer Summary

- The configurator iframe message listener is now registered in a layout effect, before descendant
  passive effects can emit one-shot initial commerce messages.
- Product IDs are normalized only for equality comparison. Their original runtime type remains
  unchanged so numeric product lookup and selection behaviour continue to work.
- Deterministic regression coverage exercises early commerce messages, numeric/string ID
  equivalence in both directions, and numeric current-product lookup.
- No iframe message, checkout payload, public API, package export, selector, or saved-data contract
  was added, removed, or changed.

## Breaking Changes

- None known.

## Downstream Impact

- OV25: no source or messaging-protocol change is required; use the normal exact package-version
  update after publication.
- Shopify: update to exact `ov25-ui-react18@0.8.9`, rebuild the extension, create a Shopify app
  version, and verify Chair Studio on physical iOS Safari before promotion.
- WooCommerce: no adapter change is required; it receives the same startup robustness fix when its
  exact React 18 dependency is updated.
- `ov25-setup`: no Setup behaviour changes; the standard release finalisation only advances its
  coordinated version and exact `ov25-ui` dependency.

## Tests And Evidence

- The complete `release:test` sequence passed at `a8f0dd8` on 2026-08-25: type check, unit tests,
  browser/component tests, React 19 build, frozen Setup install/build, react-test build, and
  Playwright E2E. See `test-summary.md`.
- Focused regression tests cover the startup message race and equivalent numeric/string product
  IDs without weakening real product-transition resets.
- The source-only runtime delta is commit `a8f0dd8`; the raw `ov25-ui@0.8.8..HEAD` range also
  contains the already-released `ov25-setup@0.8.8` finalisation commit.

## Needs Review

- Confirm the required isolated `npm run build:react18` preflight passed at `a8f0dd8` before
  creating the package tags; it is not included in `release:test`.
- After the Shopify rebuild, repeatedly cold-open and reload the Chair Studio product page on a
  physical iOS Safari device and confirm the initial price leaves the skeleton without interaction.

## Approval

Approved by the release owner on 2026-08-25 after review of the single-fix scope, compatibility
notes, downstream plan, and automated test result. The attempted deploy stopped at the missing-notes
guard; no version bump, release commit, tag, publication, or deployment occurred while preparing
or approving this artifact.
