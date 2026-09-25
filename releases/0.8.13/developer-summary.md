# Developer Summary: ov25-ui@0.8.13

Status: Approved
The release owner approved the release notes in this task on 2026-09-25 after reporting passing tests and confirming storefront mobile sticky verification. Approval is carried forward into this artifact; additional preflight findings below are operational context, not evidence of downstream deployment.

Bump: patch, as requested and approved
Base: `ov25-ui@0.8.12` (`8b430ee32cbd274c376120940166f9f9d343234a`)
Head: `426e387faaf1bc8d5266eca277aeababe2840439`
Context generated: 2026-09-25T07:56:17.398Z

No version bump, lockfile edit, commit, tag, push, publication, or deployment occurred during artifact generation. Tests were not rerun.

## Review Materials

- [Patch notes](patch-notes.md), [draft client email](client-email.md), [test summary](test-summary.md).
- [Context](context.md), [JSON context](context.json), [commits](commits.txt), [changed files](changed-files.txt), [diff statistics](diff-stat.txt), [raw diff](diff.patch).

## Scope And Implementation

The range contains four commits and nine changed files. The two runtime changes are in `src/components/product-carousel.tsx` and `src/lib/sticky-layout-controller.ts`. Three unit-test files cover the changes; `playwright.config.ts` enables one retry with the existing first-retry trace setting. Setup manifest and lockfile changes belong to the previous `ov25-setup@0.8.12` finalization commit, not new Setup functionality.

### Automatic-cutout gallery

When automatic cutouts are enabled, the carousel checks the image list after applying its image limit. If that list includes an automatic cutout with a resolvable carousel URL, the 3D tile is omitted from horizontal and stacked thumbnail rendering. The internal 3D placeholder remains in the index model, preserving selection indices and cutout-angle shortcuts. The existing rendering path remains when no qualifying cutout is displayed.

### Sticky travel boundary

`resolveStickyContainingBlock` walks past ancestors with `display: inline` or `display: contents` to find the box used for travel measurement. It stops at the body and accepts a missing parent. The controller uses the retained original gallery parent so fallback reparenting does not change the reference. This corrects the zero-height custom-element wrapper case represented by the Arighi Bianchi mobile regression test.

### Test configuration

Playwright permits one retry per E2E test and records a trace on the first retry. This is test infrastructure only. The release owner accepts the passing summary without a per-retry breakdown.

## Compatibility Assessment

No breaking TypeScript API or commerce-payload change was identified. `src/index.ts`, package exports, injection options, callback definitions, SKU/price fields, cart/checkout/invoice mappings, Setup saved payloads, metafields, and CSS variables/scoping are unchanged in this range. The new sticky helper is an internal-module export, not a new package-root export.

The intentional visible change is conditional removal of the 360 thumbnail and its horizontal wrapper for existing auto-cutout configurations. Other thumbnail hooks remain, but positional selectors and selectors requiring `[data-ov25-gallery-tile="360"]` must tolerate its absence. Sticky fallback can now activate on previously affected markup and uses the existing fallback implementation. There is no new selector migration or required setting; the release owner has approved the behavior and tested mobile sticky.

No new owned UI strings or visual controls are introduced. Existing string replacements and custom-CSS channels remain. Both `dev/react-test/tests/string-replacement.jsx` and `single-custom-css.jsx` already enable automatic cutouts, providing representative customization fixtures without new fixture edits. Snap2 carousel suppression and configurator mode normalization are unchanged; Standard and Bed products using these shared gallery paths can receive the changes.

The requested patch classification is retained. Conditional tile removal is an approved visual behavior change, so automatic rollout should still account for store-specific selector assumptions. No data migration is required.

## Downstream And Adapter Coverage

These are live local repository observations from 2026-09-25; downstream HEADs are review snapshots, not claims that those repositories were tested or deployed for this release.

| Consumer | Local HEAD and dependency state | Required action |
| --- | --- | --- |
| OV25 | `29cbf0bfd00e3429e1f78d41cdbedcd01b8a7cd9`; all three packages at 0.8.11 | Dependency update through the release workflow; no new producer payload required by this diff. |
| Shopify | `33eefe9b6311c05cc67e0d5196a94fc477c0f6cc`; working manifest has React 18 UI at 0.8.12, ahead of committed 0.8.11 | Dependency-only source update to 0.8.13, rebuild, and separately managed app rollout. Existing runtime forwards carousel config and branding/text customization. No new metafield/admin/cart mapping. Check custom thumbnail selectors on each target theme. |
| WooCommerce | `1de7294cfd77c81265129efa46290bee549cc20f`; all three packages at 0.8.1 | Reconcile independent work before updating all three dependencies and rebuilding/packaging. Committed frontend forwards saved config and custom CSS. No new mapping required for these two UI changes; the larger dependency jump needs separate integration validation. |
| Setup | Current local package and exact UI dependency are 0.8.12 | Coordinated release finalizes Setup against published UI 0.8.13. No saved-config migration. |

Shopify requires no config pass-through change for either gallery improvement or sticky fix. WooCommerce likewise needs no new runtime mapping for these changes. Neither adapter's cart or checkout contract is altered. Platform builds and deployments have not been performed here.

## Documentation And Fixture Coverage

- **Automatic-cutout thumbnail behavior — Docs needed / not previously documented:** `../ov25-docs/content/docs/developer/ui-package-integration.mdx` documents carousel layouts and image limits, but its `CarouselConfig` example omits `autoCutouts` and does not describe conditional 360-thumbnail visibility. Add this behavior to the existing gallery section before or with client rollout. This artifact task did not edit the separate docs repository. The release notes above provide the immediate behavior notice.
- **Sticky fix — Docs not needed:** correction of existing behavior with no new configuration. Existing integration docs cover inline-sticky and external carousel targets.
- **Playwright retry — Docs not needed:** internal test configuration, recorded here.
- **Gallery coverage:** `test/unit/product-carousel.test.tsx` checks horizontal/stacked tile suppression, cutout-angle selection, preserved image indices, and fallback when cutouts are absent or excluded by image limits. Existing custom-CSS and string-replacement fixtures enable automatic cutouts. `test/e2e/carousel-relocation.test.ts` covers surrounding carousel placement; the specific suppression regression is covered by unit tests.
- **Sticky coverage:** `test/unit/sticky-containing-block.test.ts` covers ancestor resolution, and `sticky-layout-controller.test.ts` models the zero-height inline wrapper and fallback. `test/e2e/inline-sticky.test.ts` and the inline-sticky fixtures cover surrounding runtime behavior. The release owner confirmed storefront mobile sticky manually.

## Tests And Frozen Source

The supplied [test summary](test-summary.md) reports all steps passed from 2026-09-25T07:48:33.803Z to 2026-09-25T07:52:12.537Z: type checking, unit tests, browser/component tests, React 19 UI build, isolated React 18 build, Setup frozen dependency install/build, fixture-app build, preview-server readiness, and Playwright E2E. This includes the exact React 18 preflight required by the current runbook; the review skill's older manual-preflight wording is superseded by that runbook.

The report does not embed a SHA. Its association with frozen HEAD relies on the user's report that the Playwright change was committed and tests passed, the commit preceding the run, and clean tracked UI source at inspection. Frozen HEAD is `426e387faaf1bc8d5266eca277aeababe2840439`. No source changes occurred during artifact generation. A source change after this point requires a fresh complete test run and regenerated context.

## Preflight And Workspace State

- Fresh `git ls-remote` confirmed remote `main` equals frozen HEAD and none of the three 0.8.13 release tags exists. No matching local tags exist.
- Fresh npm registry checks for UI, React 18 UI, and Setup 0.8.13 each returned HTTP 404 with `version not found`. These versions were available to publish at review time.
- UI tracked files were clean; only `releases/0.8.13/` was untracked. Existing `test-summary.md` was preserved. Release artifacts are excluded by both package `files: ["dist"]` allowlists.
- OV25 has unrelated edits in `.github/workflows/update-ov25-ui-packages.yml` and `db/postgres/schema/swatches.ts`. They are not included or approved by this packet; the local workflow edit is not evidence of the remote workflow's behavior.
- Shopify has unrelated modified `extensions/ov25-configurator/package.json` and `pnpm-lock.yaml`.
- WooCommerce has modified storefront PHP, package manifest, admin components/pages, frontend, UI declarations, and storefront tests, plus new hydration/integration helpers and a setup test. This work is outside the frozen UI release and must be reconciled before a WooCommerce rollout.
- `ov25-docs` is clean at `1e202f98f09056ff48b4fcce6575028a980f1637`.
- The system npm launcher failed before running the collector. The same inspected collector was successfully invoked directly with `node scripts/release/review.js`. Use the supported toolchain from the successful test run for the user-owned release command.

## Follow-Up And Next Step

Non-blocking for artifact generation: document automatic-cutout visibility in the public integration guide; reconcile downstream local work; validate each subsequently rebuilt platform before its separate rollout. No repeat test run is required solely for these Markdown artifacts.

The notes are already approved by the release owner. With source unchanged, the user-owned release command is `npm run release:deploy -- --release 0.8.13 --push`, using the supported toolchain. It commits/tags and triggers package publication, finalizes Setup, and dispatches the OV25 update. Shopify and WooCommerce deployment remain separate. The draft client email must be tailored to actual rollout state before sending.

Compatibility risk: public APIs and commerce payloads are preserved; custom theme selectors must tolerate conditional absence of the 360 thumbnail. Mobile sticky verification is confirmed by the release owner.
