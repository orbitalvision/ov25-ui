# Release Review Context: ov25-ui@0.8.12

Status: raw context only
Bump: patch
Current version: 0.8.11
Target version: 0.8.12
Base: ov25-ui@0.8.11 (51ec3914ee49)
Head: ba02776042e7e158ff678d9f66b656525f9750ee (ba02776042e7)
Branch: main
Generated: 2026-09-24T12:45:15.474Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.8.12`
- contextJson: `releases/0.8.12/context.json`
- contextMarkdown: `releases/0.8.12/context.md`
- commits: `releases/0.8.12/commits.txt`
- changedFiles: `releases/0.8.12/changed-files.txt`
- diffStat: `releases/0.8.12/diff-stat.txt`
- diffPatch: `releases/0.8.12/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
?? release-drafts/ov25-ui-0.8.12.md
?? releases/0.8.12/
```

## Committed Changes

### Commits

```text
ba02776 (HEAD -> main, origin/main, origin/HEAD) fix (tests)
c8201c1 fix: group headers, prices and checkout spacing
dba7276 test: stabilize tooltip hover timing
2939cac feat(release) add react18 build to release:test script
ee3fd3c Merge pull request #7 from orbitalvision/feature/group-total-prices
134bb07 (origin/feature/group-total-prices, feature/group-total-prices) fix: hide group prices by default
b4a04f4 feat: show upgrades above cheapest group
2be86b6 fix(tests) dev retailer for tests
c729e45 css
1e3cf36 fix(skill) runbook and skill update
e30f7a4 fix: separate group names and prices with hyphens
98b221e test: demonstrate group price customisation
db0a22b fix: show group prices by default
672268f feat: add hidden group product totals
caaf7cd (tag: ov25-setup@0.8.11) chore: release ov25-setup 0.8.11
```

### Diff Stat

```text
.codex/skills/ov25-release-review/SKILL.md         |   4 +-
 dev/react-test/tests/single-custom-css-branding.js |  16 +++
 dev/react-test/tests/single-custom-css.jsx         |   2 +-
 dev/react-test/tests/single-with-groups.jsx        |  12 ++-
 dev/react-test/tests/string-replacement.jsx        |   4 +
 docs/group-total-prices.md                         |  29 ++++++
 docs/release-runbook.md                            | 116 ++++++++++-----------
 globals.css                                        |  17 +++
 scripts/release/react18-preflight.js               |  41 ++++++++
 scripts/release/test.js                            |   3 +
 setup/bun.lock                                     |   4 +-
 setup/package-lock.json                            |  12 +--
 setup/package.json                                 |   4 +-
 .../VariantSelectMenu/AccordionVariants.tsx        |   8 +-
 .../VariantSelectMenu/DesktopVariants.tsx          |   4 +-
 src/components/VariantSelectMenu/GroupPrice.tsx    |  19 ++++
 .../VariantSelectMenu/GroupedVariantsList.tsx      |   7 +-
 .../VariantSelectMenu/MobileVariants.tsx           |   5 +
 .../VariantSelectMenu/ProductVariants.tsx          |   2 +
 .../VariantSelectMenu/ProductVariantsWrapper.tsx   |  21 ++--
 src/components/VariantSelectMenu/TreeVariants.tsx  |   6 +-
 .../VariantSelectMenu/WizardVariants.tsx           |  31 ++++--
 src/contexts/ov25-ui-context.tsx                   |  10 ++
 src/lib/strings/string-keys.ts                     |  13 +++
 test/e2e/selection-details.test.ts                 |  13 ++-
 test/unit/group-price.test.tsx                     |  45 ++++++++
 test/unit/product-variants-group-price.test.tsx    |  96 +++++++++++++++++
 test/unit/release-react18-preflight.test.ts        |  66 ++++++++++++
 test/unit/variants-per-row.test.ts                 |   8 +-
 test/unit/wizard-group-price.test.tsx              |  88 ++++++++++++++++
 30 files changed, 606 insertions(+), 100 deletions(-)
```

### Changed Files

```text
.codex/skills/ov25-release-review/SKILL.md
dev/react-test/tests/single-custom-css-branding.js
dev/react-test/tests/single-custom-css.jsx
dev/react-test/tests/single-with-groups.jsx
dev/react-test/tests/string-replacement.jsx
docs/group-total-prices.md
docs/release-runbook.md
globals.css
scripts/release/react18-preflight.js
scripts/release/test.js
setup/bun.lock
setup/package-lock.json
setup/package.json
src/components/VariantSelectMenu/AccordionVariants.tsx
src/components/VariantSelectMenu/DesktopVariants.tsx
src/components/VariantSelectMenu/GroupPrice.tsx
src/components/VariantSelectMenu/GroupedVariantsList.tsx
src/components/VariantSelectMenu/MobileVariants.tsx
src/components/VariantSelectMenu/ProductVariants.tsx
src/components/VariantSelectMenu/ProductVariantsWrapper.tsx
src/components/VariantSelectMenu/TreeVariants.tsx
src/components/VariantSelectMenu/WizardVariants.tsx
src/contexts/ov25-ui-context.tsx
src/lib/strings/string-keys.ts
test/e2e/selection-details.test.ts
test/unit/group-price.test.tsx
test/unit/product-variants-group-price.test.tsx
test/unit/release-react18-preflight.test.ts
test/unit/variants-per-row.test.ts
test/unit/wizard-group-price.test.tsx
```
