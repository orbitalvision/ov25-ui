# Release Review Context: ov25-ui@0.8.11

Status: raw context only
Bump: patch
Current version: 0.8.10
Target version: 0.8.11
Base: ov25-ui@0.8.10 (31b9a9afb15a)
Head: HEAD (92166cc89bd9)
Branch: main
Generated: 2026-09-23T08:29:18.059Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.8.11`
- contextJson: `releases/0.8.11/context.json`
- contextMarkdown: `releases/0.8.11/context.md`
- commits: `releases/0.8.11/commits.txt`
- changedFiles: `releases/0.8.11/changed-files.txt`
- diffStat: `releases/0.8.11/diff-stat.txt`
- diffPatch: `releases/0.8.11/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
?? releases/0.8.11/
```

## Committed Changes

### Commits

```text
92166cc (HEAD -> main, origin/main, origin/HEAD) fix(tests) drop gesture hint and canvas snapshot from Windrush e2e (gesture-hint replaced with auto rotation)
c761b36 fix(setup) fix padding on tab content
220cf43 feat(setup) update to new OV25 colors, fix padding. make button component
575f974 fix(auto-cutouts) add stable styling hooks, update tests to include new UI (customCss, stringReplacement)
95fb756 fix(gallery) when using autoCutouts and deferThreeD, defer to first gallery image, not the material shot
f8f01f9 fix(sticky) measure stacked carousel so inline-sticky can account for it correctly. update auto cutout gallery ordering
78d17e3 feat(setup) allow replacing selection name into ov25-option-header
82a7789 feat(setup) auto cutouts toggle, and ov25-ui display of auto cutouts
aee5d34 feat(tests) various test suite upgrades, viewport matrix, dimensions in viewport matrix
8228c1c (tag: ov25-setup@0.8.10) chore: release ov25-setup 0.8.10
```

### Diff Stat

```text
dev/react-test/index.html                          |   1 +
 dev/react-test/templates/TestPageLayout.jsx        |  33 +-
 dev/react-test/tests/gallery-auto-cutouts.html     |  13 +
 dev/react-test/tests/gallery-auto-cutouts.jsx      | 134 ++++++++
 dev/react-test/tests/responsive-layout-matrix.jsx  |  41 ++-
 dev/react-test/tests/single-custom-css-branding.js |  19 ++
 dev/react-test/tests/single-custom-css.jsx         |   2 +-
 dev/react-test/tests/single-with-groups.jsx        |   8 +-
 dev/react-test/tests/string-replacement.jsx        |   8 +-
 dev/react-test/vite.config.js                      |   1 +
 scripts/capture-viewport-matrix.mjs                |  28 ++
 setup/bun.lock                                     |   4 +-
 setup/globals.css                                  |  14 +
 setup/package-lock.json                            |  12 +-
 setup/package.json                                 |   4 +-
 .../ConfiguratorSetup/ConfigPanel/index.tsx        |  32 +-
 .../StorefrontIntegrationPanel/index.tsx           |   6 +-
 .../ConfiguratorSetup/StyleEditor/controls.tsx     |   2 +-
 .../ConfiguratorSetup/StyleEditor/index.tsx        |   2 +-
 .../initial-config-from-payload.ts                 |   1 +
 .../preview-config-serializable.ts                 |   1 +
 .../ConfiguratorSetup/serialize-config.ts          |   1 +
 setup/src/components/ConfiguratorSetup/types.ts    |   4 +-
 setup/src/components/ui/button.tsx                 |  44 +++
 setup/src/components/ui/slider.tsx                 |   4 +-
 setup/src/components/ui/switch.tsx                 |   2 +-
 src/components/IframeContainer.tsx                 |  17 +-
 .../VariantSelectMenu/AccordionVariants.tsx        |  11 +-
 .../VariantSelectMenu/ProductVariantsWrapper.tsx   |  10 +-
 src/components/VariantSelectMenu/Snap2Wrapper.tsx  |   6 +-
 src/components/VariantSelectMenu/TreeVariants.tsx  |  11 +-
 src/components/product-carousel.tsx                |  80 ++++-
 src/components/product-gallery.tsx                 |   7 +-
 src/contexts/ov25-ui-context.tsx                   | 149 ++++++++-
 src/lib/auto-cutouts.ts                            | 198 ++++++++++++
 src/lib/sticky-layout-controller.ts                |  77 ++++-
 src/lib/strings/string-keys.ts                     |  10 +-
 src/types/inject-config.ts                         |  12 +
 src/utils/configurator-utils.ts                    |  19 ++
 src/utils/inject.tsx                               |   2 +
 test/e2e/single-no-variants.test.ts                |  39 +--
 ...-no-variants-initial-canvas-chromium-darwin.png | Bin 256560 -> 0 bytes
 test/unit/auto-cutouts.test.ts                     | 356 +++++++++++++++++++++
 test/unit/configurator-setup-auto-cutouts.test.ts  |  47 +++
 test/unit/option-header-selected-variant.test.ts   |  55 ++++
 test/unit/product-carousel.test.tsx                |  57 ++++
 test/unit/sticky-carousel-height.test.ts           | 144 +++++++++
 47 files changed, 1626 insertions(+), 102 deletions(-)
```

### Changed Files

```text
dev/react-test/index.html
dev/react-test/templates/TestPageLayout.jsx
dev/react-test/tests/gallery-auto-cutouts.html
dev/react-test/tests/gallery-auto-cutouts.jsx
dev/react-test/tests/responsive-layout-matrix.jsx
dev/react-test/tests/single-custom-css-branding.js
dev/react-test/tests/single-custom-css.jsx
dev/react-test/tests/single-with-groups.jsx
dev/react-test/tests/string-replacement.jsx
dev/react-test/vite.config.js
scripts/capture-viewport-matrix.mjs
setup/bun.lock
setup/globals.css
setup/package-lock.json
setup/package.json
setup/src/components/ConfiguratorSetup/ConfigPanel/index.tsx
setup/src/components/ConfiguratorSetup/StorefrontIntegrationPanel/index.tsx
setup/src/components/ConfiguratorSetup/StyleEditor/controls.tsx
setup/src/components/ConfiguratorSetup/StyleEditor/index.tsx
setup/src/components/ConfiguratorSetup/initial-config-from-payload.ts
setup/src/components/ConfiguratorSetup/preview-config-serializable.ts
setup/src/components/ConfiguratorSetup/serialize-config.ts
setup/src/components/ConfiguratorSetup/types.ts
setup/src/components/ui/button.tsx
setup/src/components/ui/slider.tsx
setup/src/components/ui/switch.tsx
src/components/IframeContainer.tsx
src/components/VariantSelectMenu/AccordionVariants.tsx
src/components/VariantSelectMenu/ProductVariantsWrapper.tsx
src/components/VariantSelectMenu/Snap2Wrapper.tsx
src/components/VariantSelectMenu/TreeVariants.tsx
src/components/product-carousel.tsx
src/components/product-gallery.tsx
src/contexts/ov25-ui-context.tsx
src/lib/auto-cutouts.ts
src/lib/sticky-layout-controller.ts
src/lib/strings/string-keys.ts
src/types/inject-config.ts
src/utils/configurator-utils.ts
src/utils/inject.tsx
test/e2e/single-no-variants.test.ts
test/e2e/single-no-variants.test.ts-snapshots/single-no-variants-initial-canvas-chromium-darwin.png
test/unit/auto-cutouts.test.ts
test/unit/configurator-setup-auto-cutouts.test.ts
test/unit/option-header-selected-variant.test.ts
test/unit/product-carousel.test.tsx
test/unit/sticky-carousel-height.test.ts
```
