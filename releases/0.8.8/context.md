# Release Review Context: ov25-ui@0.8.8

Status: raw context only
Bump: patch
Current version: 0.8.7
Target version: 0.8.8
Base: ov25-ui@0.8.7 (b05765174159)
Head: HEAD (b4fa1453fcce)
Branch: main
Generated: 2026-08-25T08:40:09.679Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.8.8`
- contextJson: `releases/0.8.8/context.json`
- contextMarkdown: `releases/0.8.8/context.md`
- commits: `releases/0.8.8/commits.txt`
- changedFiles: `releases/0.8.8/changed-files.txt`
- diffStat: `releases/0.8.8/diff-stat.txt`
- diffPatch: `releases/0.8.8/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
M docs/IMPORTANT_NOTES.md
 M docs/bugs-resolved.md
 M docs/ov25_bugs_and_todo.md
 M docs/pre-release-engineering-runbook.md
 M docs/release-runbook.md
?? releases/0.8.8/
```

## Committed Changes

### Commits

```text
b4fa145 (HEAD -> main, origin/main, origin/HEAD) fix(tests) yo
e2a90c7 fix(selection-details) fix layout for sheet
29826fc release artifacts, and move test step to be first step
28b8505 feat(ov25-ui) use auto or user cutouts for size cards
efcd13f update(tests) use dev retailer
77cf203 fix(price): show skeleton while price loads
3e3308e feat(release-runbook) .md for orchestrating release bookkeeping
509bdf2 (tests) update test to DEV_RETAILER
e3b3486 feat(dev): add responsive viewport matrix
0cb79dc feat(tests) add full-e2e tested ledger (for stuff i can exclude from manual test). add tests for hidden-logo fixture and retire it from manul
bb558cc fix(selection-details) fit content within selection-details sheet/panel without vertical scrollbar
b94edd9 (tag: ov25-setup@0.8.7) chore: release ov25-setup 0.8.7
```

### Diff Stat

```text
dev/react-test/config/e2e-fixture-ledger.js        |  58 +++
 dev/react-test/config/viewport-presets.js          | 121 +++++
 dev/react-test/e2e-ledger.html                     |  81 +++
 dev/react-test/e2e-ledger.js                       | 153 ++++++
 dev/react-test/index.html                          |  18 +-
 dev/react-test/plugins/viewport-matrix.js          | 168 +++++++
 dev/react-test/tests/hidden-logo.jsx               |   5 +-
 dev/react-test/tests/range-no-groups.jsx           |   6 +-
 dev/react-test/tests/responsive-layout-matrix.css  | 547 +++++++++++++++++++++
 dev/react-test/tests/responsive-layout-matrix.html |  12 +
 dev/react-test/tests/responsive-layout-matrix.jsx  | 422 ++++++++++++++++
 dev/react-test/tests/single-with-discounts.jsx     |  11 +-
 dev/react-test/vite.config.js                      |   5 +-
 docs/IMPORTANT_BUGS.md                             |   4 +
 docs/IMPORTANT_NOTES.md                            |  34 +-
 docs/bugs-questions-for-user.md                    |   3 +
 docs/bugs-ready-for-review.md                      |  72 ++-
 docs/bugs-resolved.md                              |  96 ++++
 docs/ov25_bugs_and_todo.md                         |  23 +-
 docs/pre-release-engineering-runbook.md            | 412 ++++++++++++++++
 docs/release-runbook.md                            |  82 +--
 globals.css                                        | 108 ++++
 package.json                                       |   3 +
 plan.md                                            | 267 ++++++++++
 scripts/capture-viewport-matrix.mjs                | 483 ++++++++++++++++++
 scripts/release/refuse-local-publish.js            |   2 +-
 scripts/release/review.js                          |   2 +-
 scripts/release/test.js                            |   2 +-
 scripts/run-fixture-e2e.mjs                        | 289 +++++++++++
 scripts/validate-e2e-fixture-ledger.mjs            | 227 +++++++++
 setup/bun.lock                                     |   4 +-
 setup/package-lock.json                            |  12 +-
 setup/package.json                                 |   4 +-
 src/commerce/iframe-commerce-readiness.ts          |  11 +
 src/components/Price.tsx                           |  35 +-
 .../VariantSelectMenu/CheckoutButton.tsx           |  64 ++-
 .../variant-cards/SelectionDetailsSurface.tsx      |   4 +-
 .../variant-cards/SizeVariantCard.tsx              |  13 +-
 src/contexts/ov25-ui-context.tsx                   |  88 +++-
 src/lib/strings/string-keys.ts                     |   1 +
 test/browser/SelectionDetails.test.tsx             | 136 ++++-
 test/e2e/fixture-ledger.test.ts                    |   7 +
 test/e2e/hidden-logo.test.ts                       | 417 ++++++++++++++--
 .../inline-variants-disable-add-to-cart.test.ts    |   1 +
 test/e2e/selection-details.test.ts                 |  16 +-
 test/unit/checkout-button-price-gating.test.tsx    | 124 +++++
 test/unit/checkout-callback-readiness.test.tsx     | 216 ++++++++
 test/unit/iframe-commerce-readiness.test.ts        |  24 +
 test/unit/price-loading-skeleton.test.tsx          |  64 +++
 test/unit/size-option-thumbnail-selection.test.tsx | 157 ++++++
 test/unit/size-variant-card.test.tsx               | 159 ++++++
 51 files changed, 5114 insertions(+), 159 deletions(-)
```

### Changed Files

```text
dev/react-test/config/e2e-fixture-ledger.js
dev/react-test/config/viewport-presets.js
dev/react-test/e2e-ledger.html
dev/react-test/e2e-ledger.js
dev/react-test/index.html
dev/react-test/plugins/viewport-matrix.js
dev/react-test/tests/hidden-logo.jsx
dev/react-test/tests/range-no-groups.jsx
dev/react-test/tests/responsive-layout-matrix.css
dev/react-test/tests/responsive-layout-matrix.html
dev/react-test/tests/responsive-layout-matrix.jsx
dev/react-test/tests/single-with-discounts.jsx
dev/react-test/vite.config.js
docs/IMPORTANT_BUGS.md
docs/IMPORTANT_NOTES.md
docs/bugs-questions-for-user.md
docs/bugs-ready-for-review.md
docs/bugs-resolved.md
docs/ov25_bugs_and_todo.md
docs/pre-release-engineering-runbook.md
docs/release-runbook.md
globals.css
package.json
plan.md
scripts/capture-viewport-matrix.mjs
scripts/release/refuse-local-publish.js
scripts/release/review.js
scripts/release/test.js
scripts/run-fixture-e2e.mjs
scripts/validate-e2e-fixture-ledger.mjs
setup/bun.lock
setup/package-lock.json
setup/package.json
src/commerce/iframe-commerce-readiness.ts
src/components/Price.tsx
src/components/VariantSelectMenu/CheckoutButton.tsx
src/components/VariantSelectMenu/variant-cards/SelectionDetailsSurface.tsx
src/components/VariantSelectMenu/variant-cards/SizeVariantCard.tsx
src/contexts/ov25-ui-context.tsx
src/lib/strings/string-keys.ts
test/browser/SelectionDetails.test.tsx
test/e2e/fixture-ledger.test.ts
test/e2e/hidden-logo.test.ts
test/e2e/inline-variants-disable-add-to-cart.test.ts
test/e2e/selection-details.test.ts
test/unit/checkout-button-price-gating.test.tsx
test/unit/checkout-callback-readiness.test.tsx
test/unit/iframe-commerce-readiness.test.ts
test/unit/price-loading-skeleton.test.tsx
test/unit/size-option-thumbnail-selection.test.tsx
test/unit/size-variant-card.test.tsx
```
