# OV25 UI 0.8.0 Developer Summary

Status: **Approved on 2026-08-05**

## Review Identity

| Field | Value |
| --- | --- |
| Release | `0.8.0` |
| Bump | `minor` |
| Collector base | `ov25-ui@0.7.3` (`b56f817949116ffbe6605f2c0f187cc5b971faaf`) |
| Collector head | `HEAD` (`521ef22c71b2c79b9e9c6ba819c0028360084a3d`) |
| Artifact commit | `c202f1f` (follows the reviewed source context) |
| Branch | `main` |
| Context generated | `2026-08-05T08:26:05.424Z` |

Raw evidence: [context](context.md), [JSON context](context.json), [commits](commits.txt), [changed files](changed-files.txt), [diff stat](diff-stat.txt), and [committed diff](diff.patch).

No version was bumped, and no tag, push, package publication, Shopify deploy, WooCommerce release, or OV25 deploy occurred while refreshing these artifacts. Final core release validation completed successfully on 2026-08-05.

## Release Verdict

**The `0.8.0` release artifacts were approved on 2026-08-05 and the core source has passed final release validation, but the coordinated rollout is not complete.** The reviewed source context remains `521ef22`, which includes the approved Bug 57 Inline (sticky) recovery and gallery-style preservation fixes. Artifact commit `c202f1f` follows that context, is present on local and remote `main`, and does not change the reviewed runtime or passing release-test result. The `ov25-ui` working tree is clean. Remaining work begins with pushing the adapter source commits, then preparing and publishing the packages before completing OV25 against the published `0.8.0` packages. Public documentation is already committed locally and will be pushed after the releases.

## Release Blockers

1. **Shopify and WooCommerce adapter commits have not reached remote `main`.** Shopify is three commits ahead and WooCommerce is one commit ahead. Their source changes must be pushed before their package-sync/build/deploy workflows consume those repositories.
2. **Package preparation and publication have not run.** Prepare and publish `ov25-ui`, `ov25-ui-react18`, and `ov25-setup` at exact version `0.8.0` without dispatching OV25 prematurely.
3. **OV25 must be completed after package publication.** Its staged integration imports `ov25-setup/defaults`, which is unavailable from installed `ov25-setup@0.7.2`. Publish `0.8.0`, synchronize OV25 to the exact package versions, then validate and commit the seven staged integration files, including approved Bug 56.
4. **Snap2 drag bounds still require OV25 integration.** Approved commit `3541b736` remains on `ov25-ui-v0.8.0`/`snap2-draggable-objects-bounds` and is not contained by current OV25 `main`; integrate it when completing OV25 after package publication.
5. **Downstream rollout remains local.** OV25 is two commits ahead of `origin/main` before its pending integration commit. Public docs are clean and one commit ahead at `1e23604`; per the release plan, they will be pushed after the package releases.

Bug 54 is explicitly ignored for this release and is not a `0.8.0` blocker.

The square thumbnail default and current Snap2 setup normalization were manually approved during development. They remain staging checks, not unresolved release decisions.

## Workspace Status

| Repository | Current state | Release implication |
| --- | --- | --- |
| `ov25-ui` | Local and remote `main` include approved artifact commit `c202f1f`, which follows reviewed source context `521ef22`; the working tree is clean. `.worktrees/` is ignored. | Final `release:test` passed. Push adapter source next, then prepare and publish the packages. |
| `OV25` | `main` at `5d3c9002`, two commits ahead of `origin/main`; seven integration files, including approved Bug 56, are staged, and two unrelated SQL dumps are untracked. | Wait for published `0.8.0` packages, synchronize exact dependencies, integrate `3541b736`, then commit, validate, and push. |
| `shopify-plugin` | Clean local `main`, three commits ahead of `origin/main`: `626c165`, `ec950cd`, and `7f55479`. | Push source; update the exact package and regenerate the bundle after npm publication. |
| `ov25-woo-extension` | Clean local `main`, one commit (`c7b690a`) ahead of `origin/main`. | Push source before dispatching its exact-package release workflow. |
| `ov25-docs` | Clean local `main`, one commit (`1e23604`) ahead of `origin/main`; the commit covers five public integration pages and three setup screenshots. | Push after the package releases, as planned by the user. |

## Changed Packages And Areas

The committed `ov25-ui@0.7.3..HEAD` range contains 59 commits, 136 changed files, 21,736 insertions, and 701 deletions. The final commit changes nine internal Markdown files only and does not alter runtime, package, or test behavior.

| Area | Summary |
| --- | --- |
| `ov25-ui` runtime | Inline (sticky), header detection, viewport-specific carousel relocation, new flags, mobile accordion, viewer-control and modal-close fixes, accessible iframe titles, missing-image fallback, Snap2 mobile/stacking fixes, sheet reflow handling, carousel behavior, CSS hooks, and z-index standardization. |
| `ov25-setup` | Inline (sticky) selection and preview support, new controls, Snap2 export/import completeness, Element Styles fields, saved-style hydration, draft persistence, default exports, and corrected CSS output naming. |
| Fixtures and tests | Inline (sticky) header/fallback fixtures, carousel relocation coverage, setup/runtime unit suites, saved-Snap2 layering coverage, and supporting regressions. |
| Internal docs | Bug ledgers and Inline (sticky) implementation, architecture, and header-detection reports. |
| OV25 | Gesture-hint receiver and saved `.zcpb` loading are already on `main`; preview/Plugin Settings integration is staged, while Snap2 drag bounds still require integration. |
| Shopify plugin | Three local commits add integration-owned selectors, complete flag forwarding, Snap2 position preservation/defaulting, cart-form matching, and a shared carousel block. |
| WooCommerce plugin | One local commit adds matching selector settings, complete defaults, Snap2 defaults, runtime forwarding, and the required mobile Inline (sticky) carousel target. |
| `ov25-docs` | Local updates cover setup, styling, Shopify, and WooCommerce integration for the `0.8.0` public options. |

## Implementation Summary

### Inline (sticky)

- Added the opt-in `inline-sticky` display mode for standard and bed products. Existing `inline` and `inline-sheet` behavior remains unchanged.
- Added automatic storefront-header detection and the optional `selectors.header` override.
- Added independent `selectors.desktopCarousel` and `selectors.mobileCarousel` relocation for non-Snap2 carousels. Ordinary layouts do not relocate a carousel when no valid target exists; mobile Inline (sticky) retains its required relocation fallback.
- Added responsive desktop/mobile layout handling, full-width mobile viewers, page-scrolling variants, sticky option/group headers, fullscreen handling, and breakpoint cleanup.
- Added bounded injector-owned layout repair plus Popover/body-layer fallbacks when external ancestors block native sticky positioning.
- Extended sticky travel checks so a gallery column that reaches the sticky top but ends before its variants is stretched or moved to the common product fallback. Variant-height changes invalidate the failed-stretch cache through the existing resize lifecycle.
- Allowed Popover fallback layouts to return to native sticky positioning when asynchronous storefront initialization later provides sufficient travel; body-layer fallback remains fixed because relocation hides the original ancestor chain from later measurements.
- Preserved client-authored inline styles on a replaced gallery host in Inline (sticky), retaining host-box sizing and layout constraints while leaving other display modes unchanged.
- Added setup-preview support and dedicated no-header, fixed-header, collapsing-header, body-layer, carousel-relocation, and responsive fixtures.

### Other Runtime And Setup Changes

- Added `flags.disableBuyNow` and a matching setup control without changing Add to Basket behavior.
- Added `flags.hideGestureHint` and a matching setup control; supported configurator URLs receive `hideGestureHint=true`.
- Added mobile accordion selection in setup and runtime support for `configurator.variants.displayMode.mobile: 'accordion'`.
- Added Snap2 serialization/hydration for `initialiseMenu`, variant position, and module position while limiting setup choices to supported modes.
- Added setup draft persistence, corrected `:host` and legacy `:root` style hydration, exported public defaults, and corrected setup CSS output naming.
- Added descriptive iframe titles based on product, range, and Snap2 range names.
- Added a package-owned woven fallback for missing material-selection and Swatch Book thumbnails while preserving raw parent selection data. Size cards omit missing images, product carousels keep inert neutral slots, and module cards retain their targetable `moduleCardNoImage` text state.
- Added selected-state attributes and stable CSS hooks for carousel, size, dimension, Snap2 module, and tooltip elements.
- Improved carousel wheel handling, Swatch Book mobile layout, sheet reflow behavior, and Snap2 modal/drawer/checkout geometry.
- Fixed open sheet/drawer viewer controls, mobile modal close controls, and saved-Snap2 close-confirmation layering.

## Compatibility Checklist

| Question | Assessment |
| --- | --- |
| Public exports/options removed or renamed? | No intentional removal or rename found. New display values, selectors, flags, image inputs, and CSS hooks are additive. |
| Existing `inline` or `inline-sheet` behavior changed? | No intentional sticky behavior is applied to those modes; the complex sticky controller is scoped to `inline-sticky`. |
| DOM/CSS contracts changed? | New hooks are additive. Inline (sticky) can relocate the live gallery host, but only when that opt-in mode is selected. |
| Existing IDs/classes/data attributes preserved? | No intentional removal found. New selected-state and sticky ownership markers are additive. |
| Existing defaults changed? | Yes. Variant thumbnails default to square. Snap2 setup round trips can fill current display/position defaults. Both changes were approved but require theme/config staging checks. |
| Commerce behavior changed? | `disableBuyNow` suppresses only Buy Now. No staged Woo change alters cart keys, checkout payloads, pricing, SKUs, invoices, or native/AJAX submission. |
| Product types affected differently? | Inline (sticky) supports standard and bed products, not Snap2. Snap2 receives separate setup, modal/drawer, stacking, and planned drag-bound changes. |
| Missing-field fallbacks present? | New flags default to `false`; selectors are optional; header lookup can auto-detect; invalid/missing carousel targets retain the embedded carousel. |
| Old and new behavior covered? | Focused fixtures/tests exist and the complete final-head core release suite passed. Cross-browser and downstream adapter staging remain outstanding. |

Compatibility verdict: the public API changes are additive and Inline (sticky) is opt-in. Rollout risk is concentrated in accepted visual/default changes, saved Snap2 position behavior, host-theme sticky behavior, and adapter sequencing.

## Breaking-Change Assessment

No deliberate public API, callback, payload, selector, CSS-variable, cart, checkout, SKU, pricing, or invoice contract was removed or renamed. The release is suitable for a minor version once the adapters and validation are complete. The square thumbnail default and Snap2 setup normalization are visible behavior changes, so staging remains mandatory even though they were approved during development.

## Adapter Coverage

| Change | Shopify | WooCommerce | OV25 |
| --- | --- | --- | --- |
| Inline (sticky) and header selector | Committed local source passes the integration-owned header selector; push, package update, bundle build, and staging remain. | Committed local admin persistence and runtime mapping are complete; push and workflow validation remain. | Plugin Settings/metafield and preview integration is staged on current `main`; commit and push remain. |
| Desktop/mobile carousel relocation | Committed local source passes both selectors and adds one shared desktop/mobile app block. An absent/invalid target leaves the carousel embedded. | Committed local settings pass both selectors; mobile Inline (sticky) also receives its built-in required target. | Plugin Settings/metafield support is staged on current `main`; commit and push remain. |
| `disableBuyNow` | The committed local adapter preserves all saved flags, including `disableBuyNow`. | Generic saved-config forwarding and defaults include it in the committed local adapter. | No additional commerce receiver required. |
| `hideGestureHint` | The committed local adapter preserves it. | The committed local adapter includes it. | Receiver commit `c41770ae` is already on `main`. |
| Snap2 setup positions | Committed local source honors valid saved positions and retains Shopify `RIGHT` for missing/invalid legacy values. | Committed local defaults use modal/modal and right-side variants/modules. | Staged canonical defaults require published or locally linked `ov25-setup@0.8.0`. |
| Snap2 drag bounds | No adapter mapping required. | No adapter mapping required. | Commit `3541b736` remains branch-only. |
| CSS/data hooks and iframe titles | No adapter mapping required. | No adapter mapping required. | No adapter mapping required. |

### Dependency And Automation State

- OV25 currently uses `ov25-ui` `0.7.3` and `ov25-setup`/`ov25-ui-react18` `0.7.2`. Its staged canonical-default import cannot type-check against those installed packages. Do not let `release:deploy --push` dispatch OV25 immediately: use `--skip-ov25-dispatch` or omit `--push`, confirm all three npm packages are published, then dispatch the exact-version workflow manually. This workflow does not merge feature branches or commit the staged integration.
- Shopify currently uses `ov25-ui-react18` `0.7.2`. There is no automatic package-bump workflow; update it to exact `0.8.0` and rebuild `ov25-configurator-bundle.js` after publication.
- WooCommerce currently uses all three packages at `0.7.2`. Its `update-ui-packages-and-release.yml` workflow installs exact `0.8.0` versions, type-checks, commits dependency changes, builds the plugin ZIP, and creates/updates the plugin release. Its committed adapter source must reach remote `main` first.

## Documentation Coverage

| Feature or improvement | Status |
| --- | --- |
| Inline (sticky), header detection, carousel targets, CSS variables, and direct package configuration | **Docs committed locally in `1e23604`.** Setup/layout guidance is in `ecommerce-configurator-setup.mdx`; runtime hooks are in `configurator-styling.mdx`; direct `injectConfigurator` contracts are in `ui-package-integration.mdx`; platform selector guidance is in `shopify.mdx` and `wordpress.mdx`. |
| `disableBuyNow` and `hideGestureHint` | **Docs committed locally in `1e23604`.** Both setup controls and outcomes are documented under Behaviour Flags. |
| Mobile accordion | **Docs committed locally in `1e23604`.** Setup documentation describes accordion for desktop and mobile. |
| Snap2 display, variant, and module positions | **Docs committed locally in `1e23604`.** Supported viewport modes and dialog-only desktop position behavior are documented. |
| Tiered image inputs and missing-image fallback | **Docs committed locally in `1e23604`.** `ProductImageInput` and URL fallback behavior are documented under Image Gallery; the visual placeholder needs no additional integration guidance. |
| Element Styles additions and CSS/data hooks | **Docs committed locally in `1e23604`.** The styling guide lists selected-state, size/dimension, carousel, sticky, and Snap2 module hooks. |
| Reliability, layout, and stacking fixes | No public documentation required beyond release notes. |

## Fixture And Test Evidence

Recorded checks from implementation, release validation, and manual approval:

- Final `npm run release:test -- --release 0.8.0` passed on 2026-08-05: root type checking, 226 unit tests, 4 browser/component tests, the `ov25-ui`, `ov25-setup`, and React test-app builds, the frozen setup dependency install, and 33 headless Chromium Playwright tests in roughly three minutes. See [test summary](test-summary.md).
- Playwright now runs headlessly and does not auto-open its HTML report. The 3D visual regression uses Chromium SwiftShader and a stable rendered-canvas readiness check; this is developer/test infrastructure, not a customer-facing feature.
- Bug 57 added focused Inline (sticky) coverage for recovery from transient pre-activation fallback and preservation of inline gallery host styles. The user reviewed and approved the fix on 2026-08-05.
- `ov25-ui`: focused sticky controller and metrics suites, type checks, and `git diff --check` passed throughout implementation. The user rebuilt and manually approved the mobile setup-preview behavior on 2026-08-04.
- `ov25-docs`: `bun run type-check` passed, all five changed MDX files compile with `@mdx-js/mdx`, and `git diff --check` passed.
- `OV25`: ESLint passed for `app/(ov25-ui)/configurator-preview/page.tsx`; `git diff --check` passed.
- Earlier browser verification covered header offsets but missed the setup preview's short mobile gallery row. The boundary correction has now passed the user's nested Mobile preview retest.
- The docs production build could not run because the installed `esbuild` binary is for `darwin-arm64` while the active Node process requires `darwin-x64`. This is a local dependency-architecture issue, not an MDX diagnostic.

Existing bug records report focused type checks and unit coverage for Inline (sticky), setup preview, carousel relocation, new flags, accessible iframe titles, modal portals, and setup serialization. Bug 55 records 59 focused tests and both relevant type checks passing before approval. The setup preview device-remount regression is committed at `50fd555`, the short-boundary follow-up at `ad400f6`, and the approved Bug 57 changes are included in the reviewed range. The passing core suite does not replace published-package and downstream adapter staging.

Remaining required verification:

1. Safari and Firefox Inline (sticky) checks on representative client themes.
2. OV25 preview, Plugin Settings/metafield persistence, and Snap2 drag bounds after exact `0.8.0` dependency synchronization.
3. Shopify package/bundle build plus standard, bed, Snap2, selectors, carousel block, flags, cart, and responsive staging paths.
4. WooCommerce type-check/ZIP workflow plus standard, Snap2, selectors, carousel targets, flags, native cart, AJAX cart, and responsive staging paths.
5. Direct execution or workflow wiring for `tests/StorefrontDefaultsTest.php`.

## Migration Notes

- To retain round variant thumbnails, set **Variant Shape** explicitly or provide `--ov25-variant-thumb-border-radius: var(--ov25-rounded-full)` in client CSS.
- Load and inspect existing Snap2 settings before re-saving, especially configurations without `modules.position`.
- Treat Inline (sticky) as opt-in. When automatic header detection is unsuitable, provide `selectors.header` through Shopify/WooCommerce integration settings or direct injection.
- Provide `selectors.desktopCarousel` or `selectors.mobileCarousel` only when relocation is intended. The host page must contain exactly one matching target within the configurator scope.
- Retain Shopify's `RIGHT` compatibility fallback for saved Snap2 configurations that do not yet contain a valid module position.

## Required Release Order

1. Push the existing Shopify and WooCommerce adapter source commits to their remote `main` branches before downstream package workflows run. Bug 54 is explicitly ignored for this release and does not block it.
2. Prepare and publish the three `0.8.0` packages through the approved release process. Use `--skip-ov25-dispatch` when pushing through `release:deploy`, or push manually, so OV25 is not updated before package publication and integration preparation are complete.
3. After publication, synchronize OV25 to exact `0.8.0` dependencies, integrate `3541b736`, then commit, validate, and push its seven staged integration files plus drag bounds. Do not add a permanent fallback for the pre-`0.8.0` `ov25-setup/defaults` import.
4. Update Shopify to exact `ov25-ui-react18@0.8.0`, rebuild its bundle, and test/deploy the extension on staging before live rollout.
5. Dispatch WooCommerce's exact-package release workflow after its adapter commit is on `main`, then validate the generated ZIP on staging.
6. Push the committed public docs (`1e23604`) after the releases, as planned.

## Non-Blocking Follow-Ups

- Add dedicated mobile-accordion E2E coverage beyond the existing fixtures.
- Add broader Safari, Firefox, and real-client-theme coverage for Inline (sticky).
- Wire the WooCommerce storefront-default PHP test into a normal test command or CI job.
- Reconcile the WooCommerce plugin's older internal version constants as separate version-hygiene work.
- Bug 54's cold bed-configurator render path is explicitly ignored for `0.8.0` and is not a release blocker.

## Next Step

Push the Shopify and WooCommerce adapter source commits, then prepare and publish the three `0.8.0` packages. OV25 integration and the public-docs push follow publication.
