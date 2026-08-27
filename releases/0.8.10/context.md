# Release Review Context: ov25-ui@0.8.10

Status: raw context only
Bump: patch
Current version: 0.8.9
Target version: 0.8.10
Base: ov25-ui@0.8.9 (d2212cbffa63)
Head: HEAD (0135ba1cfdc8)
Branch: main
Generated: 2026-08-27T09:23:42.185Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.8.10`
- contextJson: `releases/0.8.10/context.json`
- contextMarkdown: `releases/0.8.10/context.md`
- commits: `releases/0.8.10/commits.txt`
- changedFiles: `releases/0.8.10/changed-files.txt`
- diffStat: `releases/0.8.10/diff-stat.txt`
- diffPatch: `releases/0.8.10/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
?? releases/0.8.10/
```

## Committed Changes

### Commits

```text
0135ba1 (HEAD -> main, origin/main, origin/HEAD) fix(tests) update e2e ledger
cfc9044 fix(tests) remove the 90s timeout codex added because we are having network issues
194e970 fix(variants): fix various issues with mobile drawer layouts with guided-overview or hideBuyNow
f7348fa feat(configurator): configure variants per row, setup integration
f2ab99c chore(fixtures): remove redundant inline fixture
7494dc2 test(e2e): expand no-pricing coverage
941b711 feat(ov25-ui) new 'guided-overview' selection displayMode
0a732e0 (tag: ov25-setup@0.8.9) chore: release ov25-setup 0.8.9
```

### Diff Stat

```text
dev/react-test/config/e2e-fixture-ledger.js        |  68 ++++++
 dev/react-test/index.html                          |   7 +-
 .../templates/SelectionDetailsControls.jsx         |   2 +-
 .../tests/gallery-inline-guided-overview.html      |  12 ++
 .../tests/gallery-inline-guided-overview.jsx       |  38 ++++
 ...allery-sheet-guided-overview-hide-fabrics.html} |   5 +-
 ...gallery-sheet-guided-overview-hide-fabrics.jsx} |  25 +--
 .../tests/gallery-sheet-guided-overview.html       |  12 ++
 .../tests/gallery-sheet-guided-overview.jsx        |  33 +++
 dev/react-test/tests/single-custom-button.jsx      |   2 +-
 dev/react-test/tests/single-custom-css-branding.js |  64 ++++++
 dev/react-test/tests/single-custom-css-snap2.jsx   |   2 +-
 dev/react-test/tests/single-custom-css.jsx         |   4 +-
 dev/react-test/tests/single-no-pricing.jsx         | 149 +++++++++++--
 dev/react-test/tests/string-replacement.jsx        |  33 ++-
 dev/react-test/tests/variants-per-row.html         |  12 ++
 dev/react-test/tests/variants-per-row.jsx          | 189 ++++++++++++++++
 dev/react-test/vite.config.js                      |   5 +-
 docs/skills/ov25-compatibility-guard/SKILL.md      |  26 +++
 globals.css                                        |  44 ++++
 setup/bun.lock                                     |   4 +-
 setup/package-lock.json                            |  12 +-
 setup/package.json                                 |   4 +-
 .../ConfiguratorSetup/ConfigPanel/index.tsx        |   1 +
 .../ConfiguratorSetup/StyleEditor/controls.tsx     |   3 +-
 setup/src/components/ConfiguratorSetup/types.ts    |   2 +-
 .../src/lib/config/configurator-style-variables.ts |  16 ++
 src/components/ConfiguratorModal.tsx               |   9 +-
 src/components/Snap2ConfiguratorModal.tsx          |  21 +-
 src/components/Snap2InlineSheetDesktopShell.tsx    |   8 +-
 .../VariantSelectMenu/AccordionVariants.tsx        |   6 +-
 .../VariantSelectMenu/CheckoutButton.tsx           |   7 +-
 .../VariantSelectMenu/DesktopVariants.tsx          |   6 +-
 .../VariantSelectMenu/GroupedVariantsList.tsx      |   4 +-
 .../VariantSelectMenu/MobileVariants.tsx           |   6 +-
 .../VariantSelectMenu/ProductVariantsWrapper.tsx   |   4 +-
 src/components/VariantSelectMenu/TreeVariants.tsx  |   4 +-
 .../VariantSelectMenu/VariantContentDesktop.tsx    |   8 +-
 .../VariantSelectMenu/VariantSelectMenu.tsx        |  12 +-
 .../VariantSelectMenu/VariantsHeader.tsx           |  23 +-
 .../VariantSelectMenu/VariantsOnlySheet.tsx        |   6 +-
 .../VariantSelectMenu/WizardVariants.tsx           | 201 ++++++++++++++---
 src/contexts/ov25-ui-context.tsx                   |   2 +-
 src/lib/strings/string-keys.ts                     |  11 +
 src/types/config-enums.ts                          |   2 +
 src/types/inject-config.ts                         |   4 +-
 test/e2e/guided-overview.test.ts                   | 238 ++++++++++++++++++++
 test/e2e/mobile-drawer-stacking.test.ts            |   6 +-
 ...cing-mobile-drawer-boundary-chromium-darwin.png | Bin 28341 -> 11321 bytes
 test/e2e/single-no-pricing.test.ts                 | 240 +++++++++++++++++++++
 test/e2e/variants-per-row.test.ts                  | 114 ++++++++++
 test/unit/checkout-button-price-gating.test.tsx    |  18 +-
 .../configurator-setup-style-hydration.test.ts     |  15 ++
 test/unit/guided-overview-wizard.test.tsx          | 225 +++++++++++++++++++
 test/unit/variants-per-row.test.ts                 |  71 ++++++
 55 files changed, 1899 insertions(+), 146 deletions(-)
```

### Changed Files

```text
dev/react-test/config/e2e-fixture-ledger.js
dev/react-test/index.html
dev/react-test/templates/SelectionDetailsControls.jsx
dev/react-test/tests/gallery-inline-guided-overview.html
dev/react-test/tests/gallery-inline-guided-overview.jsx
dev/react-test/tests/gallery-sheet-guided-overview-hide-fabrics.html
dev/react-test/tests/gallery-sheet-guided-overview-hide-fabrics.jsx
dev/react-test/tests/gallery-sheet-guided-overview.html
dev/react-test/tests/gallery-sheet-guided-overview.jsx
dev/react-test/tests/single-custom-button.jsx
dev/react-test/tests/single-custom-css-branding.js
dev/react-test/tests/single-custom-css-snap2.jsx
dev/react-test/tests/single-custom-css.jsx
dev/react-test/tests/single-no-pricing.jsx
dev/react-test/tests/string-replacement.jsx
dev/react-test/tests/variants-per-row.html
dev/react-test/tests/variants-per-row.jsx
dev/react-test/vite.config.js
docs/skills/ov25-compatibility-guard/SKILL.md
globals.css
setup/bun.lock
setup/package-lock.json
setup/package.json
setup/src/components/ConfiguratorSetup/ConfigPanel/index.tsx
setup/src/components/ConfiguratorSetup/StyleEditor/controls.tsx
setup/src/components/ConfiguratorSetup/types.ts
setup/src/lib/config/configurator-style-variables.ts
src/components/ConfiguratorModal.tsx
src/components/Snap2ConfiguratorModal.tsx
src/components/Snap2InlineSheetDesktopShell.tsx
src/components/VariantSelectMenu/AccordionVariants.tsx
src/components/VariantSelectMenu/CheckoutButton.tsx
src/components/VariantSelectMenu/DesktopVariants.tsx
src/components/VariantSelectMenu/GroupedVariantsList.tsx
src/components/VariantSelectMenu/MobileVariants.tsx
src/components/VariantSelectMenu/ProductVariantsWrapper.tsx
src/components/VariantSelectMenu/TreeVariants.tsx
src/components/VariantSelectMenu/VariantContentDesktop.tsx
src/components/VariantSelectMenu/VariantSelectMenu.tsx
src/components/VariantSelectMenu/VariantsHeader.tsx
src/components/VariantSelectMenu/VariantsOnlySheet.tsx
src/components/VariantSelectMenu/WizardVariants.tsx
src/contexts/ov25-ui-context.tsx
src/lib/strings/string-keys.ts
src/types/config-enums.ts
src/types/inject-config.ts
test/e2e/guided-overview.test.ts
test/e2e/mobile-drawer-stacking.test.ts
test/e2e/mobile-drawer-stacking.test.ts-snapshots/single-no-pricing-mobile-drawer-boundary-chromium-darwin.png
test/e2e/single-no-pricing.test.ts
test/e2e/variants-per-row.test.ts
test/unit/checkout-button-price-gating.test.tsx
test/unit/configurator-setup-style-hydration.test.ts
test/unit/guided-overview-wizard.test.tsx
test/unit/variants-per-row.test.ts
```
