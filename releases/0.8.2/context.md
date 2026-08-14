# Release Review Context: ov25-ui@0.8.2

Status: raw context only
Bump: patch
Current version: 0.8.1
Target version: 0.8.2
Base: ov25-ui@0.8.1 (71dde5c7af3f)
Head: dcb55e5e7ff5cfa91610140e6f9cc026fd85d70c (dcb55e5e7ff5)
Branch: main
Generated: 2026-08-14T10:35:32.369Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.8.2`
- contextJson: `releases/0.8.2/context.json`
- contextMarkdown: `releases/0.8.2/context.md`
- commits: `releases/0.8.2/commits.txt`
- changedFiles: `releases/0.8.2/changed-files.txt`
- diffStat: `releases/0.8.2/diff-stat.txt`
- diffPatch: `releases/0.8.2/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
 M release-drafts/ov25-ui-0.8.2.md
?? releases/0.8.2/
```

## Committed Changes

### Commits

```text
dcb55e5 (HEAD -> main, origin/main, origin/HEAD) v0.8.2 release draft
e4d6ba1 feat(release) release runbook update
13c7587 fix(release) update release script to stop lockfile drift issue
16f12b3 fix(selection-details): stabilize interactions
0bfc1f2 fix(docs) whitespace fix
03e5de1 disable(tests) disable bed configurator tests because they time out. bed configurators work on prod.. z said dont worry bout it
2ef1a78 fix(tests) whitespace fix, update lock files
29386fb fix(react18) preserve inert attribute in react18 version
6e83115 fix(tests) add selectionDetails displayMode to relevant fixtures
9aab449 fix(tests) stringReplacement and customCss fixtures updates
b4c966c fix(tests) various fixes to configuratorSizing fixture
ec32789 fix(setup) add missing string replacement for modulevariantcard, selection details
78f2158 feat(selection-details) new surfaces for showing selection details. ov25-setup settings and integration. selection preloading message sending (pending OV25 integration of preloading)
25b204a feat(setup): redesign editor and integrations (move settings page into configurator setup page)
9021103 fix(swatchbook): give swatchbook separate z-index layer to toasts, shuffle z-index to accomodate. add swatch key
8222201 fix(sticky): keep mobile variants in page flow (for making 'inline-sticky' work)
3a60444 fix(types): expose variants-only-sheet mode in type
14c9a0e fix(swatchbook) fall back to swatch placeholder image
9bd5e4f fix(ov25-ui) better fix for page reflows (remove scrollbar gutter gap)
a9cb596 (codex/shopify-live-preview-setup) fix(tests) prevent react dupe in setup, headless playwright test runner for ai
8e37a8d fix(swatchbook) show variant placeholder for zoomed swatch in SwatchBook
c6fcf30 fix(setup) bed configurator test file change
fee3ca2 fix(sticky): stop ov25-option-header overlapping filter-controls-wrapper when inline-sticky
55f1444 fix(gallery): ensure correct sizing of iframe for inline-sticky (safari/tablet bug)
b4468fb fix(carousel): stop bug where carousel indexes become mismatched when product pulls images from both shopify and OV25.
4aa6a8f (docs) release docs and skills for ai bugfixer/release
12aab1d (tag: ov25-ui-react18@0.8.1) fix(react18): type inert placeholder attribute
```

### Diff Stat

```text
 .codex/skills/ov25-release-review/SKILL.md         |   8 +
 .gitignore                                         |   1 +
 README.md                                          |  25 +-
 dev/react-test/index.html                          |   8 +
 .../templates/SelectionDetailsControls.jsx         | 190 +++++
 dev/react-test/templates/TestPageLayout.jsx        |  13 +-
 dev/react-test/tests/bed-configurator.jsx          |   9 +-
 .../tests/carousel-defer-threed-indexing.html      |  12 +
 .../tests/carousel-defer-threed-indexing.jsx       | 132 +++
 dev/react-test/tests/configurator-setup.jsx        |  64 ++
 dev/react-test/tests/configurator-sizing.jsx       |   4 +-
 dev/react-test/tests/inline-sticky-fixture.jsx     |  22 +-
 dev/react-test/tests/multiple-configurators.jsx    |  10 +
 ...iple-standard-configurators-inline-variants.jsx |  12 +-
 dev/react-test/tests/range-with-groups.jsx         |   7 +-
 .../tests/selection-details-fullscreen.html        |  12 +
 dev/react-test/tests/selection-details-modal.html  |  12 +
 .../tests/selection-details-tooltip-sheet.html     |  12 +
 dev/react-test/tests/selection-details.jsx         |  99 +++
 dev/react-test/tests/single-custom-css-branding.js | 598 +++++++++++++-
 dev/react-test/tests/single-custom-css.jsx         |  21 +-
 dev/react-test/tests/snap2-dialog.jsx              | 179 ++--
 dev/react-test/tests/snap2-inline.jsx              |  13 +-
 dev/react-test/tests/snap2-uuid.jsx                |   2 +-
 dev/react-test/tests/string-replacement.jsx        |  41 +-
 dev/react-test/vite.config.js                      |   4 +
 docs/bugs-resolved.md                              |   9 +-
 docs/ov25_bugs_and_todo.md                         |  10 +-
 ...tomation-and-shopify-runtime-versioning-plan.md |   4 +
 docs/release-runbook.md                            | 238 ++++++
 globals.css                                        | 148 +++-
 package.json                                       |   1 +
 playwright.config.ts                               |   7 +-
 release-drafts/ov25-ui-0.8.2.md                    | 128 +++
 scripts/release/deploy.js                          | 485 +++++++++--
 setup/bun.lock                                     |   4 +-
 setup/package-lock.json                            |  79 +-
 .../ConfiguratorSetup/ConfigPanel/index.tsx        | 493 ++++++-----
 .../StorefrontIntegrationPanel/index.tsx           | 206 +++++
 .../StyleEditor/ElementRuleBuilder.tsx             |  19 +-
 .../ConfiguratorSetup/StyleEditor/index.tsx        |  44 +-
 setup/src/components/ConfiguratorSetup/index.tsx   |   7 +-
 .../initial-config-from-payload.ts                 |  47 +-
 .../preview-config-serializable.ts                 |   3 +
 .../ConfiguratorSetup/serialize-config.ts          |   6 +
 .../ConfiguratorSetup/storefront-integration.ts    |  80 ++
 setup/src/components/ConfiguratorSetup/types.ts    |   9 +
 .../ConfiguratorSetup/useConfiguratorSetup.ts      |  31 +-
 setup/src/index.ts                                 |  14 +
 .../src/lib/config/configurator-style-variables.ts |  27 +
 setup/src/lib/config/preview-config.ts             |   3 +-
 src/components/IframeContainer.tsx                 |  13 +-
 src/components/Snap2Controls.tsx                   |   6 +-
 src/components/SwatchesContainer.tsx               |   5 +-
 .../VariantSelectMenu/AccordionVariants.tsx        |  10 +-
 .../VariantSelectMenu/ProductVariants.tsx          |   4 +-
 .../VariantSelectMenu/ProductVariantsWrapper.tsx   |  10 +-
 src/components/VariantSelectMenu/SwatchBook.tsx    |   6 +-
 src/components/VariantSelectMenu/TreeVariants.tsx  |  10 +-
 .../VariantSelectMenu/VariantContentDesktop.tsx    | 252 ++++--
 .../VariantSelectMenu/WizardVariants.tsx           |  17 +-
 .../variant-cards/DefaultVariantCard.tsx           | 320 +++++--
 .../variant-cards/ModuleVariantCard.tsx            |   1 +
 .../variant-cards/SelectionDetailsSurface.tsx      | 724 ++++++++++++++++
 src/components/dining/DiningFinishOptions.tsx      |  22 +-
 src/components/product-carousel.tsx                |  86 +-
 src/components/product-gallery.tsx                 |  24 +-
 src/contexts/ov25-ui-context.tsx                   | 605 +++++++++++++-
 src/hooks/useIframePositioning.tsx                 |  56 +-
 src/hooks/useStickyHostRelocation.ts               |   9 +-
 src/hooks/useSwatchActions.ts                      |  15 +-
 src/index.ts                                       |   6 +
 src/lib/config/layers.ts                           |  28 +-
 .../selection-details-tooltip-hover-delay.ts       |  43 +
 src/lib/sticky-layout-controller.ts                |  54 +-
 src/lib/strings/string-keys.ts                     |  23 +
 src/lib/utils.ts                                   |  15 +-
 src/types/config-enums.ts                          |  11 +
 src/types/inject-config.ts                         | 103 ++-
 src/utils/configurator-utils.ts                    |  15 +-
 src/utils/inject.tsx                               |  43 +-
 test/browser/ConfiguratorSetup.test.tsx            | 270 ++++++
 test/browser/SelectionDetails.test.tsx             | 770 +++++++++++++++++
 test/e2e/inline-sticky.test.ts                     | 323 +++++++-
 test/e2e/mobile-drawer-stacking.test.ts            | 139 ++++
 ...cing-mobile-drawer-boundary-chromium-darwin.png | Bin 0 -> 17536 bytes
 test/e2e/selection-details.test.ts                 | 920 +++++++++++++++++++++
 ...ection-details-bed-fallback-chromium-darwin.png | Bin 0 -> 45612 bytes
 ...-details-desktop-fullscreen-chromium-darwin.png | Bin 0 -> 1379772 bytes
 ...ction-details-desktop-modal-chromium-darwin.png | Bin 0 -> 641953 bytes
 ...ction-details-desktop-sheet-chromium-darwin.png | Bin 0 -> 269714 bytes
 ...ion-details-desktop-tooltip-chromium-darwin.png | Bin 0 -> 107504 bytes
 ...n-details-mobile-fullscreen-chromium-darwin.png | Bin 0 -> 246855 bytes
 ...ection-details-mobile-modal-chromium-darwin.png | Bin 0 -> 249731 bytes
 ...election-details-swatch-add-chromium-darwin.png | Bin 0 -> 641953 bytes
 ...ction-details-swatch-remove-chromium-darwin.png | Bin 0 -> 642119 bytes
 test/e2e/sheet-reflow-debug.test.ts                | 163 ++++
 test/unit/body-layer-order.test.ts                 |  37 +
 .../unit/configurator-setup-initial-config.test.ts |  10 +
 test/unit/hide-gesture-hint.test.ts                |   2 +-
 test/unit/placeholder-image-fallback.test.tsx      |  64 +-
 test/unit/product-carousel.test.tsx                | 170 ++++
 test/unit/release-deploy.test.ts                   | 149 ++++
 test/unit/selection-details-config.test.ts         | 447 ++++++++++
 test/unit/sticky-layout-controller.test.ts         |  68 ++
 test/unit/swatch-identity.test.ts                  |  27 +
 vitest.browser.config.ts                           |   6 +-
 107 files changed, 8978 insertions(+), 735 deletions(-)
```

### Changed Files

```text
.codex/skills/ov25-release-review/SKILL.md
.gitignore
README.md
dev/react-test/index.html
dev/react-test/templates/SelectionDetailsControls.jsx
dev/react-test/templates/TestPageLayout.jsx
dev/react-test/tests/bed-configurator.jsx
dev/react-test/tests/carousel-defer-threed-indexing.html
dev/react-test/tests/carousel-defer-threed-indexing.jsx
dev/react-test/tests/configurator-setup.jsx
dev/react-test/tests/configurator-sizing.jsx
dev/react-test/tests/inline-sticky-fixture.jsx
dev/react-test/tests/multiple-configurators.jsx
dev/react-test/tests/multiple-standard-configurators-inline-variants.jsx
dev/react-test/tests/range-with-groups.jsx
dev/react-test/tests/selection-details-fullscreen.html
dev/react-test/tests/selection-details-modal.html
dev/react-test/tests/selection-details-tooltip-sheet.html
dev/react-test/tests/selection-details.jsx
dev/react-test/tests/single-custom-css-branding.js
dev/react-test/tests/single-custom-css.jsx
dev/react-test/tests/snap2-dialog.jsx
dev/react-test/tests/snap2-inline.jsx
dev/react-test/tests/snap2-uuid.jsx
dev/react-test/tests/string-replacement.jsx
dev/react-test/vite.config.js
docs/bugs-resolved.md
docs/ov25_bugs_and_todo.md
docs/release-automation-and-shopify-runtime-versioning-plan.md
docs/release-runbook.md
globals.css
package.json
playwright.config.ts
release-drafts/ov25-ui-0.8.2.md
scripts/release/deploy.js
setup/bun.lock
setup/package-lock.json
setup/src/components/ConfiguratorSetup/ConfigPanel/index.tsx
setup/src/components/ConfiguratorSetup/StorefrontIntegrationPanel/index.tsx
setup/src/components/ConfiguratorSetup/StyleEditor/ElementRuleBuilder.tsx
setup/src/components/ConfiguratorSetup/StyleEditor/index.tsx
setup/src/components/ConfiguratorSetup/index.tsx
setup/src/components/ConfiguratorSetup/initial-config-from-payload.ts
setup/src/components/ConfiguratorSetup/preview-config-serializable.ts
setup/src/components/ConfiguratorSetup/serialize-config.ts
setup/src/components/ConfiguratorSetup/storefront-integration.ts
setup/src/components/ConfiguratorSetup/types.ts
setup/src/components/ConfiguratorSetup/useConfiguratorSetup.ts
setup/src/index.ts
setup/src/lib/config/configurator-style-variables.ts
setup/src/lib/config/preview-config.ts
src/components/IframeContainer.tsx
src/components/Snap2Controls.tsx
src/components/SwatchesContainer.tsx
src/components/VariantSelectMenu/AccordionVariants.tsx
src/components/VariantSelectMenu/ProductVariants.tsx
src/components/VariantSelectMenu/ProductVariantsWrapper.tsx
src/components/VariantSelectMenu/SwatchBook.tsx
src/components/VariantSelectMenu/TreeVariants.tsx
src/components/VariantSelectMenu/VariantContentDesktop.tsx
src/components/VariantSelectMenu/WizardVariants.tsx
src/components/VariantSelectMenu/variant-cards/DefaultVariantCard.tsx
src/components/VariantSelectMenu/variant-cards/ModuleVariantCard.tsx
src/components/VariantSelectMenu/variant-cards/SelectionDetailsSurface.tsx
src/components/dining/DiningFinishOptions.tsx
src/components/product-carousel.tsx
src/components/product-gallery.tsx
src/contexts/ov25-ui-context.tsx
src/hooks/useIframePositioning.tsx
src/hooks/useStickyHostRelocation.ts
src/hooks/useSwatchActions.ts
src/index.ts
src/lib/config/layers.ts
src/lib/config/selection-details-tooltip-hover-delay.ts
src/lib/sticky-layout-controller.ts
src/lib/strings/string-keys.ts
src/lib/utils.ts
src/types/config-enums.ts
src/types/inject-config.ts
src/utils/configurator-utils.ts
src/utils/inject.tsx
test/browser/ConfiguratorSetup.test.tsx
test/browser/SelectionDetails.test.tsx
test/e2e/inline-sticky.test.ts
test/e2e/mobile-drawer-stacking.test.ts
test/e2e/mobile-drawer-stacking.test.ts-snapshots/single-no-pricing-mobile-drawer-boundary-chromium-darwin.png
test/e2e/selection-details.test.ts
test/e2e/selection-details.test.ts-snapshots/selection-details-bed-fallback-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-desktop-fullscreen-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-desktop-modal-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-desktop-sheet-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-desktop-tooltip-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-mobile-fullscreen-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-mobile-modal-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-swatch-add-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-swatch-remove-chromium-darwin.png
test/e2e/sheet-reflow-debug.test.ts
test/unit/body-layer-order.test.ts
test/unit/configurator-setup-initial-config.test.ts
test/unit/hide-gesture-hint.test.ts
test/unit/placeholder-image-fallback.test.tsx
test/unit/product-carousel.test.tsx
test/unit/release-deploy.test.ts
test/unit/selection-details-config.test.ts
test/unit/sticky-layout-controller.test.ts
test/unit/swatch-identity.test.ts
vitest.browser.config.ts
```
