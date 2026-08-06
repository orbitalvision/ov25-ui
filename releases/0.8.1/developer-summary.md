# OV25 UI 0.8.1 Developer Summary

Status: **Approved on 2026-08-06**

## Review Identity

| Field | Value |
| --- | --- |
| Release | `0.8.1` |
| Bump | `patch` |
| Base | `ov25-ui@0.8.0` (`72a4ce5b76797167f6151613cc22296512518d67`) |
| Head | `HEAD` (`a60ecb694fd2a11a7619447435a5ba3b86ae47c6`) |
| Branch | `main` |
| Context generated | `2026-08-06T08:44:14.016Z` |

Raw evidence: [context](context.md), [JSON context](context.json), [commits](commits.txt),
[changed files](changed-files.txt), [diff stat](diff-stat.txt), [committed diff](diff.patch), and
[release test summary](test-summary.md).

No version was bumped, and no commit, tag, push, package publication, Shopify deploy,
WooCommerce release, or OV25 deploy was performed by this review refresh.

## Release Verdict

**Approved and suitable for patch release.** The runtime change
fixes a Shopify theme interoperability failure without changing public configuration, payloads, or
defaults. Bug 58 was manually approved. Complete `release:test` validation passed on 2026-08-06.

## Remaining Release Blockers

No pre-deploy blockers remain once this approval-status update is committed. Runtime and test
changes, review artifacts, and tracker notes are otherwise committed. Downstream dependency
updates happen after the packages publish and do not block package release.

## Workspace Status

| Repository | Review state | Release implication |
| --- | --- | --- |
| `ov25-ui` | Runtime, tests, tracker notes, and review artifacts are committed; no source changes remain. | Commit this approval-status update, then proceed to the manual deploy step. |
| `OV25` | Tracked files are clean at `1334b07c`; `moy-cart-footer.liquid` and two SQL dumps are untracked. Exact package dependencies are `0.8.0`. | Dependency-only `0.8.1` synchronization after publication. Avoid unrelated untracked files. |
| `shopify-plugin` | Clean at `235ff60`; configurator extension uses exact `ov25-ui-react18@0.8.0`. | Dependency-only update, bundle rebuild, staging check, and Shopify app-version release after publication. |
| `ov25-woo-extension` | Clean at `a39f860`; `package.json` and `package-lock.json` use exact `0.8.0` packages. | Dependency-only update and normal plugin workflow after publication. Its older `bun.lock` entries remain pre-existing version-hygiene debt. |
| `ov25-docs` | Clean at `1e23604`. | No new public feature documentation required for this patch. |

## Changed Packages And Files

Committed range: four commits, seven files, 77 insertions, 14 deletions.

| File or package area | Summary |
| --- | --- |
| `src/components/product-gallery.tsx` | Adds a hidden, inert light-DOM child so shadow-root gallery content is not hidden by storefront `:empty` rules. |
| `src/components/product-carousel.tsx` | Adds a typed `PopoverDiv` wrapper so fullscreen Popover markup builds with React 18 DOM typings. |
| `test/e2e/inline-sticky.test.ts` | Covers the Dawn-style `:empty` regression and allows one CSS pixel of subpixel rounding in fallback geometry. |
| `test/e2e/single-no-variants.test.ts` | Updates share-link expectations and stabilizes real WebGL readiness checks. |
| `playwright.config.ts` and snapshot | Uses headed Chromium for faster hardware-accelerated WebGL validation and restores the headed checkout baseline. |
| `setup/bun.lock` | Synchronizes setup's resolved `ov25-ui` dependency to published `0.8.0`; frozen install now succeeds. |

The carousel commit appears because `ov25-ui@0.8.0` points to `72a4ce5`, while the successful
`ov25-ui-react18@0.8.0` hotfix tag points to following commit `2b2ba55`. React 18 users already
received that typing-only fix in `0.8.0`.

## Implementation Summary

Shopify Dawn and similar themes can apply `display: none` to `div:empty`. Product Gallery content
is portalled into an open shadow root, so its light-DOM host still matched `:empty`. When hidden
during initial load, the iframe did not emit the product/configurator state needed to populate the
separate variants host. Product media collapsed and controls remained empty.

`ProductGallery` now renders one direct light-DOM `<span>` with
`data-ov25-portal-host-placeholder`, `hidden`, `inert`, and `aria-hidden="true"`. This prevents
`:empty` matching without adding layout, focus, or accessibility-tree output. The focused E2E case
injects the failing theme rule and verifies the compatibility element plus non-zero gallery/iframe
geometry.

## Compatibility Checklist

| Question | Assessment |
| --- | --- |
| Public exports, options, callbacks, or fields removed/renamed? | No. Public TypeScript and `injectConfigurator` contracts are unchanged. |
| DOM or CSS contract changed? | Additive only: gallery host gains one hidden direct child and intentionally stops matching `:empty`. Existing IDs, classes, data attributes, and shadow-root placement remain. |
| Existing defaults changed? | No. The fix only restores galleries hidden by storefront theme CSS. |
| Shopify metafields/settings changed? | No. Existing saved settings pass through unchanged. |
| WooCommerce settings or cart keys changed? | No. |
| Cart, checkout, price, SKU, or invoice behavior changed? | No. |
| Standard, bed, or Snap2 behavior changed differently? | No product-type branch changed. The inert child exists wherever `ProductGallery` renders. |
| Old saved setup/config payloads preserved? | Yes. No parsing or serialization changed. |
| Test coverage present and run? | Yes. Full `release:test` passed, including the focused Dawn-style Playwright regression. |

### Breaking-Change Assessment

No breaking change found. A custom selector explicitly depending on the gallery host being empty,
or counting all direct children, will observe the hidden child. Preventing `:empty` matching is the
intended fix; existing public hooks and visible structure remain intact. Patch classification is
appropriate.

Compatibility verdict: **preserved**.

## Adapter Coverage

| Integration | Required work | Assessment |
| --- | --- | --- |
| Shopify | Update extension to exact `ov25-ui-react18@0.8.1`, regenerate the configurator bundle, create a staging app version, and test an affected theme before promotion. | Dependency/build only. No metafield, Plugin Settings, Liquid, selector, cart, or checkout mapping change needed. |
| WooCommerce | Synchronize `ov25-ui`, `ov25-ui-react18`, and `ov25-setup` to exact `0.8.1`, then run normal type-check/build/ZIP workflow. | Dependency only. No PHP, admin setting, runtime mapping, or cart handling change needed. |
| OV25 | Synchronize the three exact package versions after publication and run normal package-update validation. | Dependency only. No configurator payload or setup-preview source change needed. |

## Documentation Coverage

| Change | Coverage |
| --- | --- |
| Shopify gallery `:empty` compatibility fix | **Docs not needed:** restores expected behavior; no option or migration. Patch notes are sufficient. |
| Inline (sticky) affected by bug | **Docs updated previously:** existing `0.8.0` integration docs cover Inline (sticky), selectors, header handling, and platform setup. |
| React 18 Popover typing wrapper | **Docs not needed:** build compatibility only, with no public API or runtime behavior change. |

Non-blocking docs debt: `ov25-docs/content/docs/developer/configurator-styling.mdx` describes the
gallery as light-DOM-only. Runtime uses a light-DOM host with visible content inside an open shadow
root. Correct that architecture description separately; this pre-existing inaccuracy does not
block the patch.

## Fixture And Test Coverage

- Existing `inline-sticky-desktop-no-header.html` fixture remains unchanged.
- Focused Playwright case injects Dawn-style `:empty` CSS, checks hidden/inert placeholder contract,
  and verifies non-zero gallery and iframe geometry.
- Bug 58 was manually approved on 2026-08-06.
- `release:test` passed: type-check, unit tests, browser/component tests, `ov25-ui` build, frozen
  `ov25-setup` install, setup build, react-test build, preview-server readiness, and Playwright E2E.

## Migration Notes

No configuration or data migration required. Existing Shopify, WooCommerce, direct-injection, and
saved setup configurations remain valid.

## Required Release Order

1. Run the normal `ov25-ui` deploy/publish process for exact `0.8.1` packages.
2. Synchronize and validate OV25 after packages exist.
3. Update/rebuild Shopify, test the new app version on staging, then promote it.
4. Run the WooCommerce exact-package release workflow and validate the generated plugin build.

## Non-Blocking Follow-Ups

- Correct public styling guide's gallery Shadow DOM description.
- Reconcile stale WooCommerce `bun.lock` dependency entries if Bun remains a supported install path.

## Next Step

Manually run `npm run release:deploy -- --release 0.8.1` when ready. Release review did not deploy
anything.
