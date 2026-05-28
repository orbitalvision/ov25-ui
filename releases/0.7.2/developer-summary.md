# Developer Summary: ov25-ui 0.7.2

Status: Draft, not approved
Bump requested: patch
Current package version: 0.7.1
Target version: 0.7.2
Base: `3942d5f711317d941e7291da8c0afc5b9e224fc5`
Head: `1fc5ba6e656d7558be09e18924f6fe252192b516`
Generated context: `2026-05-28T10:59:16.181Z`

No release action has happened. This review refreshed raw context and human artifacts only. No versions were bumped, no deploy script was run, no commit/tag/push happened, and no package/platform publish happened.

`releases/0.7.2/test-summary.md` already existed and reports the user-run release test passed at `2026-05-28T10:06:01.067Z`.

## Artifacts

- Patch notes: `releases/0.7.2/patch-notes.md`
- Developer summary: `releases/0.7.2/developer-summary.md`
- Client email draft: `releases/0.7.2/client-email.md`
- Test summary: `releases/0.7.2/test-summary.md`
- Raw context: `releases/0.7.2/context.md`
- Raw metadata: `releases/0.7.2/context.json`
- Commits: `releases/0.7.2/commits.txt`
- Changed files: `releases/0.7.2/changed-files.txt`
- Diff stat: `releases/0.7.2/diff-stat.txt`
- Committed diff: `releases/0.7.2/diff.patch`

## Headline Review

This is not a small patch-sized diff. The range now includes 21 commits and 134 changed files: runtime string replacements, setup text overrides, dining configurator runtime, UI/CSS-sensitive fixes, `dev/react-test` fixtures, release automation, local publish refusal, and GitHub package publish workflows.

Compatibility looks mostly additive, but release risk remains because:

- Public API surface was expanded.
- DOM/CSS-sensitive UI changed.
- Shopify/WooCommerce/OV25 version sync is not complete yet.
- GitHub package publish workflows have not been proven by a live tag release yet.

## Dirty Workspace At Review Time

```text
M docs/skills/ov25-compatibility-guard/SKILL.md
?? docs/release-automation-and-shopify-runtime-versioning-plan.md
?? releases/
```

Release-sensitive notes:

- No dirty runtime source file was detected in `ov25-ui`.
- `docs/skills/ov25-compatibility-guard/SKILL.md` has uncommitted compatibility-rule edits.
- `docs/release-automation-and-shopify-runtime-versioning-plan.md` is untracked.
- `releases/0.7.2/` is untracked and should be reviewed before commit.

## Implementation Summary

### String Replacements

- Added replacement config/types and resolver:
  - `src/types/string-replacements.ts`
  - `src/lib/strings/resolve-string-replacement.ts`
  - `src/lib/strings/use-ov25-string.ts`
  - `src/lib/strings/string-keys.ts`
- Added `stringReplacements` to grouped and legacy `injectConfigurator` options.
- Added `getString` to `OV25UIProvider` and replaced visible runtime copy across configurator components.
- Exported replacement definitions, hook, and types from public entrypoints.
- Added unit coverage in `test/unit/resolve-string-replacement.test.ts`.

Compatibility: additive. Missing `stringReplacements` falls back to built-in copy.

### ov25-setup Text Overrides

- Added `StringReplacementsEditor`.
- Added string replacement serialization/hydration helpers.
- Added top-level `stringReplacements` to setup form state, preview config, and saved payload.
- Added setup docs for Element Styles and Text Overrides in `ov25-docs`.

Compatibility: additive saved config field. Old saved setup payloads should hydrate through defaults.

### Dining Configurator

- Added `injectDiningConfigurator` and `injectDining`.
- Added dining runtime components, context, iframe types, and inject config types.
- `injectConfigurator` delegates to dining when `productLink` starts with `dining-configurator/<id>`.
- Added display option support including `showAttachmentPoints=false`.

Compatibility: additive for normal product links. Any integration that previously used a literal `dining-configurator/` prefix for non-dining behavior would change route, but that is unlikely.

### Runtime UI And Styling

- Added outer host ids for product name and price:
  - `ov25-configurator-name-container`
  - `ov25-configurator-price-container`
- Changed variant card name color to follow `--ov25-text-color`.
- Removed black carousel image background.
- Added carousel drag threshold for better click behavior.
- Adjusted mobile Snap2 controls, duplicate controls, module detail sheet z-index, and grouped/dining headers.

Compatibility risk: DOM/CSS-sensitive. Client theme CSS and `cssString` selectors should be checked.

### Configurator Origin

- Added `src/utils/configurator-origin.ts`.
- Production base URL is `https://configurator.orbital.vision`.
- Local dev flags are opt-in:
  - `OV25_CONFIGURATOR_DEV`
  - `VITE_OV25_CONFIGURATOR_DEV`
  - `ov25-configurator-dev`
  - `USE_LOCAL_DEV`

Compatibility: preserved. Current committed source does not point production at localhost.

### Release Automation

- Added `release:review`, `release:test`, and `release:deploy`.
- Added local publish refusal for old publish scripts and `prepublishOnly`.
- Added tag-triggered workflows for:
  - `ov25-ui@x.y.z`
  - `ov25-ui-react18@x.y.z`
  - `ov25-setup@x.y.z`
- Added CI-only `scripts/release/publish-ci.js`.
- Removed old GitHub Packages workflow.
- Phase 1 now stops at package release tags. It does not trigger OV25.

Release automation note:

- Root `package.json` build script calls `bun run ...`.
- The GitHub package workflows now set up Bun with `oven-sh/setup-bun@v2` before publish/build steps.
- First tag-triggered publish is still the first real CI validation of these workflows.

## Breaking-Change Assessment

No intentional breaking change found, but patch classification needs review.

Risks:

- Large additive feature set is closer to minor release than patch.
- Visible copy now flows through replacement resolver, so default fallback behavior must remain correct.
- DOM/CSS-sensitive changes may affect client CSS selectors.
- Dining route behavior is now prefix-based.
- `ProductVariantsProps.title` was removed; likely internal, but direct imports would break.
- `release:deploy` must keep `ov25-setup` and its `ov25-ui` dependency synchronized to the final release version.

Verdict: compatibility mostly preserved. Release automation still needs first-run validation, but the Bun setup blocker has been addressed.

## Downstream Impact

- OV25: still references `ov25-ui`, `ov25-ui-react18`, and `ov25-setup` `0.7.0`. Phase 2 must update OV25 after all three npm packages exist.
- Shopify: adapter has string replacement pass-through and bed/dining product-link admin support, but configurator extension still depends on `ov25-ui-react18@0.7.0`.
- WooCommerce: `ov25-woo-extension` is clean at `v1.1.1`, with bed configurator support and `^0.7.1` package deps. It still needs final `0.7.2` dependency update after npm publish.
- `ov25-setup`: must be released after `ov25-ui@0.7.2` exists, because setup depends on exact `ov25-ui` version.

## Integration Adapter Coverage

### Shopify Plugin

Status:

- Working tree has `M build.sh`.
- Latest relevant commit: `2658936 add stringReplacements`.
- `extensions/ov25-configurator/assets/ov25-configurator.js` passes `_ov25s.stringReplacements` through when it is an object.
- Product admin utility supports `bed-configurator/<id>` and `dining-configurator/<id>`.
- `extensions/ov25-configurator/package.json` still uses `ov25-ui-react18@0.7.0`.

Coverage:

- `stringReplacements`: covered.
- Bed/dining product links: admin support present.
- Runtime dependency: needs final version bump.
- Theme/CSS selector guidance: still needs client staging review.

### WooCommerce Plugin

Status:

- Working tree clean.
- Latest release tag: `v1.1.1`.
- Latest commit: `452d455 Release 1.1.1`.
- Dependencies are `ov25-ui`, `ov25-ui-react18`, and `ov25-setup` `^0.7.1`.
- `src/frontend/index.ts` includes `stringReplacements`, `bed`, `hideLogo`, and `bedConfigurator` support.
- Product picker supports `bed-configurator/<id>`.
- Storefront defaults include `bedConfigurator`.

Coverage:

- `stringReplacements`: covered.
- Bed configurator: covered for admin picker, defaults, frontend setup bucket, and local types.
- Dining configurator: no confirmed dedicated Woo handling beyond generic pass-through.
- Version sync: needs final `0.7.2` update after package publish.
- Manual plugin-level test still needed for admin product selection, storefront launch, cart payload, and checkout/order metadata.

## Documentation Coverage

Checked `../ov25-docs`; working tree clean.

- `stringReplacements`: docs updated in `content/docs/developer/ui-package-integration.mdx`.
- Setup Element Styles/Text Overrides: docs updated in `content/docs/developer/ui-package-integration.mdx` and `content/docs/developer/ecommerce-configurator-setup.mdx`.
- Shopify/WooCommerce setup UI: docs updated and linked from `shopify.mdx` / `wordpress.mdx`.
- Plugin product links for bed/dining: docs updated in `content/docs/developer/build-a-plugin.mdx`.
- Multi-line cart guidance for bed/dining: docs present in `build-a-plugin.mdx`.
- Dining `injectDiningConfigurator` / `injectDining` API details: docs still needed if external developers will use direct dining embeds.
- New name/price host ids: styling docs still need an explicit note if clients should target these hooks.
- Local configurator dev flags: docs needed only if this workflow is intended for external integrators.

## Runtime Fixture And Test Coverage

Representative fixtures exist:

- String replacements: `dev/react-test/tests/string-replacement.jsx`
- Dining inline/full-page/no-attachment-points: `dev/react-test/tests/dining-configurator*.jsx`
- Bed configurator: `dev/react-test/tests/bed-configurator.jsx`
- Configurator sizing: `dev/react-test/tests/configurator-sizing.jsx`
- Carousel behavior: `dev/react-test/tests/gallery-carousel-horizontal.jsx`
- Auto-open variant sheet: `dev/react-test/tests/gallery-sheet-list-auto-open.jsx`
- Snap2/custom CSS coverage: `dev/react-test/tests/Maze_snap2.jsx`, `single-custom-css-snap2.jsx`, `snap2-*`

E2E tests currently cover:

- Hidden logo behavior.
- Inline variants with disabled add-to-cart.
- Single product/no variants snapshot.

Gap:

- No dedicated Playwright e2e for dining or bed configurator flows yet.
- GitHub package publish workflows have not been proven by a live tag release yet.

## Test Summary

User-run `release:test` passed:

- `bun run type-check`
- `bun run test:unit`
- `bun run test:browser:ci`
- `bun run build`
- `ov25-setup` install/build
- `dev/react-test` build
- Playwright e2e tests

No tests were run during this artifact refresh.

## Pre-Deploy Blockers

- Configure npm Trusted Publishing for all three packages:
  - `ov25-ui`
  - `ov25-ui-react18`
  - `ov25-setup`
- Decide whether this should remain patch or become minor.
- Commit/review the untracked release plan and compatibility skill changes before `release:deploy`, or keep them out of the release working tree.

## Follow-Ups

- After package publish, update OV25 package deps in Phase 2.
- After package publish, update Shopify plugin dependency and release path.
- After package publish, update WooCommerce package deps and release a new plugin version if needed.
- Revoke old npm publish tokens after Trusted Publishing is verified.
- Add docs for direct dining embed APIs if those are external.

## Next Step

Review this refreshed release package. If the blockers are resolved and the release scope is accepted, the next user-run step is:

```bash
bun run release:deploy -- --release 0.7.2
```

Do not push tags until GitHub/npm Trusted Publishing prerequisites are complete.
