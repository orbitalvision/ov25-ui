# Release Review Context: ov25-ui@0.7.2

Status: raw context only
Bump: patch
Current version: 0.7.1
Target version: 0.7.2
Base: 3942d5f711317d941e7291da8c0afc5b9e224fc5 (3942d5f71131)
Head: HEAD (1fc5ba6e656d)
Branch: main
Generated: 2026-05-28T10:59:16.181Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.7.2`
- contextJson: `releases/0.7.2/context.json`
- contextMarkdown: `releases/0.7.2/context.md`
- commits: `releases/0.7.2/commits.txt`
- changedFiles: `releases/0.7.2/changed-files.txt`
- diffStat: `releases/0.7.2/diff-stat.txt`
- diffPatch: `releases/0.7.2/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
M docs/skills/ov25-compatibility-guard/SKILL.md
?? docs/release-automation-and-shopify-runtime-versioning-plan.md
?? releases/
```

## Committed Changes

### Commits

```text
1fc5ba6 (HEAD -> main, origin/main, origin/HEAD) release automation. release review/compile script. test script. release script. github workflows. move scripts to bun. fix and re-enable playwright tests. prevent local publish of packages.
4f357c2 always use prod if useLocalPreview value is undefined. ov25-ui v0.7.1
07342a9 ov25-ui v0.7.0 ov25-setup v0.7.0
72e2620 removed black background on carousel images
2748282 fix test when no replacement
f722b0e Merge remote-tracking branch 'origin/main'
2ff7eec add z-index to module detail sheet so it appears on mobile
5c22a27 hide group name when there is only one on dining config
b6016ce hide screenshots button on mobile, shorten view control on mobile
0b649ae Merge remote-tracking branch 'origin/main'
51ac9ec missing test file
0b5dfed added a new full page dining configurator ui
c8b444e remove duplicate snap2 controls (a dupe was hiding in the DOM sometimes, not visible)
a5b22fe add missing flex to new buttons so svgs are centered
486b3a1 alllow pasting hexcodes into configurator setup (with or without leading #)
90c5f4c 5px threshold for carousel scrolling (allows clicking images with minor mouse movement)
63256a6 minor string-replacement additions. configurator-sizing test suite.
a594844 add bonus container ids outside shadow root for name and price
efbc93b variant name should not be hardcoded to black - it should pull from --vars.
250dd35 (origin/string-interpolation-replacement, string-interpolation-replacement, bug7-variant-thumb-padding, bug6-snap2-single-controls, bug5-setup-color-paste, bug4-carousel-drag-threshold, bug3-defer3d-first-selection, bug2-name-host-selector, bug11-snap2-initialise-tooltips, bug-auto-open-configurator) mild ov25-setup right panel style
30417cf stringReplacements. full replacement of all strings in ov25-ui. UI for ov25-setup to define and pass stringReplacements.
67c7377 add stringReplacements to inject config. replace all strings in project with call to getString(...). export getOv25String and STRING_REPLACEMENT_DEFINITIONS so consumers can also get strings. remove unused title prop from ProductVariants
```

### Diff Stat

```text
.codex/skills/ov25-release-review/SKILL.md         |  231 ++++
 .../skills/ov25-release-review/agents/openai.yaml  |    4 +
 .codex/skills/ov25-string-replacements/SKILL.md    |  135 ++
 .../ov25-string-replacements/agents/openai.yaml    |    4 +
 .../scripts/audit-ov25-string-replacements.mjs     |  133 ++
 .github/workflows/release-ov25-setup.yml           |   45 +
 .github/workflows/release-ov25-ui-react18.yml      |   47 +
 .github/workflows/release-ov25-ui.yml              |   47 +
 .github/workflows/release-package.yml              |   34 -
 README.md                                          |   34 +-
 bun.lock                                           |  154 +--
 dev/react-test/index.html                          |   11 +
 dev/react-test/package-lock.json                   |    2 +-
 dev/react-test/src/config/dining-configurator.js   |    5 +
 dev/react-test/templates/TestBackButton.jsx        |    4 +-
 dev/react-test/templates/TestPageLayout.jsx        |   23 +-
 dev/react-test/tests/Maze_snap2.jsx                |    7 +
 dev/react-test/tests/animation-test.html           |   13 +
 dev/react-test/tests/animation-test.jsx            |   48 +
 dev/react-test/tests/configurator-sizing.html      |   12 +
 dev/react-test/tests/configurator-sizing.jsx       |  164 +++
 .../tests/dining-configurator-full-page.html       |   13 +
 .../tests/dining-configurator-full-page.jsx        |   91 ++
 .../dining-configurator-no-attachment-points.html  |   13 +
 .../dining-configurator-no-attachment-points.jsx   |   85 ++
 dev/react-test/tests/dining-configurator.html      |   13 +
 dev/react-test/tests/dining-configurator.jsx       |   82 ++
 .../tests/gallery-carousel-horizontal.jsx          |    6 +-
 .../tests/gallery-sheet-list-auto-open.html        |   12 +
 .../tests/gallery-sheet-list-auto-open.jsx         |   40 +
 dev/react-test/tests/string-replacement.html       |   13 +
 dev/react-test/tests/string-replacement.jsx        |  245 ++++
 dev/react-test/vite-env.d.ts                       |    1 +
 dev/react-test/vite.config.js                      |    8 +
 docs/skills/ov25-compatibility-guard/SKILL.md      |  209 ++++
 package-lock.json                                  |   73 +-
 package.json                                       |   19 +-
 scripts/publish-all.js                             |  235 +---
 scripts/publish-canary.js                          |   74 +-
 scripts/publish-setup.js                           |   28 +-
 scripts/release/common.js                          |  105 ++
 scripts/release/deploy.js                          |  181 +++
 scripts/release/publish-ci.js                      |  223 ++++
 scripts/release/refuse-local-publish.js            |    7 +
 scripts/release/review.js                          |  362 ++++++
 scripts/release/test.js                            |  170 +++
 setup/bun.lock                                     |  542 ++++++++
 setup/package-lock.json                            |   12 +-
 setup/package.json                                 |    8 +-
 .../ConfiguratorSetup/ConfigPanel/index.tsx        |   10 +-
 .../ConfiguratorSetup/PreviewArea/index.tsx        |    2 +-
 .../StyleEditor/StringReplacementsEditor.tsx       |  411 +++++++
 .../ConfiguratorSetup/StyleEditor/controls.tsx     |    6 +-
 .../ConfiguratorSetup/StyleEditor/index.tsx        |   45 +-
 setup/src/components/ConfiguratorSetup/index.tsx   |    6 +-
 .../initial-config-from-payload.ts                 |    9 +
 .../preview-config-serializable.ts                 |    3 +
 setup/src/components/ConfiguratorSetup/types.ts    |    4 +
 .../ConfiguratorSetup/useConfiguratorSetup.ts      |   13 +
 setup/src/components/ui/color-input.tsx            |   17 +-
 setup/src/components/ui/scroll-area.tsx            |    2 +-
 setup/src/lib/string-replacements-config.ts        |   82 ++
 src/components/ConfiguratorViewControls.tsx        |   51 +-
 src/components/ConfigureButton.tsx                 |   16 +-
 src/components/IframeContainer.tsx                 |    9 +-
 src/components/Name.tsx                            |   12 +-
 src/components/OVOrBrandLogo.tsx                   |    6 +-
 src/components/Price.tsx                           |   68 +-
 src/components/SaveSnap2Dialog.tsx                 |   31 +-
 src/components/SaveSnap2Menu.tsx                   |    8 +-
 src/components/Snap2CheckoutSheet.tsx              |   41 +-
 src/components/Snap2ConfigureButton.tsx            |   10 +-
 src/components/Snap2Controls.tsx                   |   91 +-
 src/components/Snap2ScreenshotDialog.tsx           |   16 +-
 src/components/Snap2VariantSheetColumn.tsx         |    5 +-
 src/components/SwatchesContainer.tsx               |   35 +-
 .../VariantSelectMenu/AccordionVariants.tsx        |   11 +-
 .../VariantSelectMenu/CheckoutButton.tsx           |   16 +-
 src/components/VariantSelectMenu/FilterContent.tsx |   12 +-
 .../VariantSelectMenu/FilterControls.tsx           |   29 +-
 .../VariantSelectMenu/GroupedVariantsList.tsx      |    7 +-
 .../VariantSelectMenu/InitialiseMenu.tsx           |    7 +-
 .../VariantSelectMenu/MobileVariants.tsx           |    6 +-
 .../VariantSelectMenu/ModuleBottomPanel.tsx        |   17 +-
 .../VariantSelectMenu/ModulePositionTypeTabs.tsx   |   11 +-
 src/components/VariantSelectMenu/NoResults.tsx     |    8 +-
 .../VariantSelectMenu/ProductVariants.tsx          |    1 -
 .../VariantSelectMenu/ProductVariantsWrapper.tsx   |   38 +-
 .../VariantSelectMenu/Snap2CustomDimensionForm.tsx |   19 +-
 .../VariantSelectMenu/Snap2ModulesEmptyState.tsx   |   54 +-
 .../VariantSelectMenu/Snap2ModulesOptionBody.tsx   |    7 +-
 src/components/VariantSelectMenu/Snap2Wrapper.tsx  |    6 +-
 src/components/VariantSelectMenu/SwatchBook.tsx    |   66 +-
 src/components/VariantSelectMenu/TreeVariants.tsx  |   17 +-
 .../VariantSelectMenu/VariantSelectMenu.tsx        |   11 +-
 .../VariantSelectMenu/WizardVariants.tsx           |   79 +-
 .../variant-cards/DefaultVariantCard.tsx           |    7 +-
 .../variant-cards/ModuleVariantCard.tsx            |   32 +-
 .../variant-cards/SwatchIconOverlay.tsx            |    1 -
 .../variant-cards/module-variant-detail-panel.tsx  |   46 +-
 src/components/ar-preview-qr-code-dialog.tsx       |    6 +-
 src/components/dining/DiningChairCard.tsx          |   53 +
 src/components/dining/DiningChairCountControl.tsx  |  181 +++
 src/components/dining/DiningFinishOptions.tsx      |  218 ++++
 src/components/dining/DiningFullPageShell.tsx      |  588 +++++++++
 src/components/dining/DiningImageOptionCard.tsx    |  182 +++
 src/components/dining/DiningProductGallery.tsx     |   47 +
 src/components/dining/DiningReviewPage.tsx         |  539 ++++++++
 src/components/dining/DiningSideToggle.tsx         |   84 ++
 src/components/dining/DiningSidebar.tsx            | 1296 ++++++++++++++++++++
 src/components/dining/DiningStepper.tsx            |  181 +++
 src/components/dining/DiningStyleLanding.tsx       |  206 ++++
 src/components/dining/DiningTableCard.tsx          |   51 +
 src/components/product-carousel.tsx                |    8 +-
 src/contexts/dining-ui-context.tsx                 |  713 +++++++++++
 src/contexts/ov25-ui-context.tsx                   |   27 +-
 src/index.ts                                       |   28 +-
 src/lib/strings/resolve-string-replacement.ts      |   65 +
 src/lib/strings/string-keys.ts                     |  277 +++++
 src/lib/strings/use-ov25-string.ts                 |   14 +
 src/types/dining-iframe-types.ts                   |  191 +++
 src/types/dining-inject-config.ts                  |  122 ++
 src/types/inject-config.ts                         |   79 ++
 src/types/string-replacements.ts                   |   41 +
 src/types/vite-env.d.ts                            |    8 +-
 src/utils/configurator-origin.ts                   |   45 +
 src/utils/configurator-utils.ts                    |   12 +-
 src/utils/inject-dining.tsx                        |  380 ++++++
 src/utils/inject.tsx                               |   57 +
 ...isable-add-to-cart-checkout-chromium-darwin.png |  Bin 2915 -> 2885 bytes
 ...-no-variants-initial-canvas-chromium-darwin.png |  Bin 191106 -> 222011 bytes
 test/unit/resolve-string-replacement.test.ts       |  153 +++
 test/unit/utils.test.ts                            |  146 ++-
 vite.config.mjs                                    |   10 +-
 134 files changed, 10617 insertions(+), 935 deletions(-)
```

### Changed Files

```text
.codex/skills/ov25-release-review/SKILL.md
.codex/skills/ov25-release-review/agents/openai.yaml
.codex/skills/ov25-string-replacements/SKILL.md
.codex/skills/ov25-string-replacements/agents/openai.yaml
.codex/skills/ov25-string-replacements/scripts/audit-ov25-string-replacements.mjs
.github/workflows/release-ov25-setup.yml
.github/workflows/release-ov25-ui-react18.yml
.github/workflows/release-ov25-ui.yml
.github/workflows/release-package.yml
README.md
bun.lock
dev/react-test/index.html
dev/react-test/package-lock.json
dev/react-test/src/config/dining-configurator.js
dev/react-test/templates/TestBackButton.jsx
dev/react-test/templates/TestPageLayout.jsx
dev/react-test/tests/Maze_snap2.jsx
dev/react-test/tests/animation-test.html
dev/react-test/tests/animation-test.jsx
dev/react-test/tests/configurator-sizing.html
dev/react-test/tests/configurator-sizing.jsx
dev/react-test/tests/dining-configurator-full-page.html
dev/react-test/tests/dining-configurator-full-page.jsx
dev/react-test/tests/dining-configurator-no-attachment-points.html
dev/react-test/tests/dining-configurator-no-attachment-points.jsx
dev/react-test/tests/dining-configurator.html
dev/react-test/tests/dining-configurator.jsx
dev/react-test/tests/gallery-carousel-horizontal.jsx
dev/react-test/tests/gallery-sheet-list-auto-open.html
dev/react-test/tests/gallery-sheet-list-auto-open.jsx
dev/react-test/tests/string-replacement.html
dev/react-test/tests/string-replacement.jsx
dev/react-test/vite-env.d.ts
dev/react-test/vite.config.js
docs/skills/ov25-compatibility-guard/SKILL.md
package-lock.json
package.json
scripts/publish-all.js
scripts/publish-canary.js
scripts/publish-setup.js
scripts/release/common.js
scripts/release/deploy.js
scripts/release/publish-ci.js
scripts/release/refuse-local-publish.js
scripts/release/review.js
scripts/release/test.js
setup/bun.lock
setup/package-lock.json
setup/package.json
setup/src/components/ConfiguratorSetup/ConfigPanel/index.tsx
setup/src/components/ConfiguratorSetup/PreviewArea/index.tsx
setup/src/components/ConfiguratorSetup/StyleEditor/StringReplacementsEditor.tsx
setup/src/components/ConfiguratorSetup/StyleEditor/controls.tsx
setup/src/components/ConfiguratorSetup/StyleEditor/index.tsx
setup/src/components/ConfiguratorSetup/index.tsx
setup/src/components/ConfiguratorSetup/initial-config-from-payload.ts
setup/src/components/ConfiguratorSetup/preview-config-serializable.ts
setup/src/components/ConfiguratorSetup/types.ts
setup/src/components/ConfiguratorSetup/useConfiguratorSetup.ts
setup/src/components/ui/color-input.tsx
setup/src/components/ui/scroll-area.tsx
setup/src/lib/string-replacements-config.ts
src/components/ConfiguratorViewControls.tsx
src/components/ConfigureButton.tsx
src/components/IframeContainer.tsx
src/components/Name.tsx
src/components/OVOrBrandLogo.tsx
src/components/Price.tsx
src/components/SaveSnap2Dialog.tsx
src/components/SaveSnap2Menu.tsx
src/components/Snap2CheckoutSheet.tsx
src/components/Snap2ConfigureButton.tsx
src/components/Snap2Controls.tsx
src/components/Snap2ScreenshotDialog.tsx
src/components/Snap2VariantSheetColumn.tsx
src/components/SwatchesContainer.tsx
src/components/VariantSelectMenu/AccordionVariants.tsx
src/components/VariantSelectMenu/CheckoutButton.tsx
src/components/VariantSelectMenu/FilterContent.tsx
src/components/VariantSelectMenu/FilterControls.tsx
src/components/VariantSelectMenu/GroupedVariantsList.tsx
src/components/VariantSelectMenu/InitialiseMenu.tsx
src/components/VariantSelectMenu/MobileVariants.tsx
src/components/VariantSelectMenu/ModuleBottomPanel.tsx
src/components/VariantSelectMenu/ModulePositionTypeTabs.tsx
src/components/VariantSelectMenu/NoResults.tsx
src/components/VariantSelectMenu/ProductVariants.tsx
src/components/VariantSelectMenu/ProductVariantsWrapper.tsx
src/components/VariantSelectMenu/Snap2CustomDimensionForm.tsx
src/components/VariantSelectMenu/Snap2ModulesEmptyState.tsx
src/components/VariantSelectMenu/Snap2ModulesOptionBody.tsx
src/components/VariantSelectMenu/Snap2Wrapper.tsx
src/components/VariantSelectMenu/SwatchBook.tsx
src/components/VariantSelectMenu/TreeVariants.tsx
src/components/VariantSelectMenu/VariantSelectMenu.tsx
src/components/VariantSelectMenu/WizardVariants.tsx
src/components/VariantSelectMenu/variant-cards/DefaultVariantCard.tsx
src/components/VariantSelectMenu/variant-cards/ModuleVariantCard.tsx
src/components/VariantSelectMenu/variant-cards/SwatchIconOverlay.tsx
src/components/VariantSelectMenu/variant-cards/module-variant-detail-panel.tsx
src/components/ar-preview-qr-code-dialog.tsx
src/components/dining/DiningChairCard.tsx
src/components/dining/DiningChairCountControl.tsx
src/components/dining/DiningFinishOptions.tsx
src/components/dining/DiningFullPageShell.tsx
src/components/dining/DiningImageOptionCard.tsx
src/components/dining/DiningProductGallery.tsx
src/components/dining/DiningReviewPage.tsx
src/components/dining/DiningSideToggle.tsx
src/components/dining/DiningSidebar.tsx
src/components/dining/DiningStepper.tsx
src/components/dining/DiningStyleLanding.tsx
src/components/dining/DiningTableCard.tsx
src/components/product-carousel.tsx
src/contexts/dining-ui-context.tsx
src/contexts/ov25-ui-context.tsx
src/index.ts
src/lib/strings/resolve-string-replacement.ts
src/lib/strings/string-keys.ts
src/lib/strings/use-ov25-string.ts
src/types/dining-iframe-types.ts
src/types/dining-inject-config.ts
src/types/inject-config.ts
src/types/string-replacements.ts
src/types/vite-env.d.ts
src/utils/configurator-origin.ts
src/utils/configurator-utils.ts
src/utils/inject-dining.tsx
src/utils/inject.tsx
test/e2e/inline-variants-disable-add-to-cart.test.ts-snapshots/inline-variants-disable-add-to-cart-checkout-chromium-darwin.png
test/e2e/single-no-variants.test.ts-snapshots/single-no-variants-initial-canvas-chromium-darwin.png
test/unit/resolve-string-replacement.test.ts
test/unit/utils.test.ts
vite.config.mjs
```
