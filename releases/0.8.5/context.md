# Release Review Context: ov25-ui@0.8.5

Status: raw context only
Bump: patch
Current version: 0.8.4
Target version: 0.8.5
Base: ov25-ui@0.8.4 (12700628cc12)
Head: HEAD (a0a0e8833e8b)
Branch: main
Generated: 2026-08-18T08:55:59.983Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.8.5`
- contextJson: `releases/0.8.5/context.json`
- contextMarkdown: `releases/0.8.5/context.md`
- commits: `releases/0.8.5/commits.txt`
- changedFiles: `releases/0.8.5/changed-files.txt`
- diffStat: `releases/0.8.5/diff-stat.txt`
- diffPatch: `releases/0.8.5/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
?? releases/0.8.5/
```

## Committed Changes

### Commits

```text
a0a0e88 (HEAD -> main, origin/main, origin/HEAD) fix(selection-details) centre text 2
deffa73 fix(selection-details) centre text
eaedafa fix(tests) regenerate screenshots after selection ordering
77076d7 fix(selection-details) hide range/supplier by default
f24541d fix(tests)
ce7f200 add(tests) tests for basic snap2 scenarios
c298e2b feat(swatches): show retailer metadata
4b8061b fix(details): prevent sheet-open page reflow
8518b34 (tag: ov25-setup@0.8.4) chore: release ov25-setup 0.8.4
```

### Diff Stat

```text
dev/react-test/tests/string-replacement.jsx        |   3 +
 dev/react-test/vite.config.js                      |   1 +
 globals.css                                        |  57 ++-
 setup/bun.lock                                     |   4 +-
 setup/package-lock.json                            |  12 +-
 setup/package.json                                 |   4 +-
 .../src/lib/config/configurator-style-variables.ts |  13 +-
 src/components/VariantSelectMenu/SwatchBook.tsx    |  34 +-
 .../VariantSelectMenu/SwatchMetadata.tsx           |  99 +++++
 .../variant-cards/SelectionDetailsSurface.tsx      |  21 +-
 src/contexts/ov25-ui-context.tsx                   |  24 ++
 src/index.ts                                       |   7 +-
 src/lib/strings/string-keys.ts                     |   3 +
 src/utils/page-scroll-lock.ts                      |  64 ++--
 test/browser/SelectionDetails.test.tsx             |  59 ++-
 test/e2e/gallery-sheet-list-auto-open.test.ts      |  38 +-
 test/e2e/maze-snap2-dimensions.test.ts             | 420 +++++++++++++++++++++
 ...cing-mobile-drawer-boundary-chromium-darwin.png | Bin 28374 -> 28329 bytes
 test/e2e/selection-details.test.ts                 |  27 +-
 ...-details-desktop-fullscreen-chromium-darwin.png | Bin 1300432 -> 1575980 bytes
 ...ction-details-desktop-modal-chromium-darwin.png | Bin 616559 -> 720350 bytes
 ...ction-details-desktop-sheet-chromium-darwin.png | Bin 261467 -> 313715 bytes
 ...ion-details-desktop-tooltip-chromium-darwin.png | Bin 103725 -> 126617 bytes
 ...n-details-mobile-fullscreen-chromium-darwin.png | Bin 241304 -> 284950 bytes
 ...ection-details-mobile-modal-chromium-darwin.png | Bin 243727 -> 287826 bytes
 ...election-details-swatch-add-chromium-darwin.png | Bin 616559 -> 720350 bytes
 ...ction-details-swatch-remove-chromium-darwin.png | Bin 616733 -> 720518 bytes
 test/e2e/sheet-reflow-debug.test.ts                |   4 +-
 test/unit/placeholder-image-fallback.test.tsx      |  33 ++
 test/unit/selection-details-config.test.ts         |  18 +-
 test/unit/swatch-metadata.test.ts                  |  55 +++
 31 files changed, 918 insertions(+), 82 deletions(-)
```

### Changed Files

```text
dev/react-test/tests/string-replacement.jsx
dev/react-test/vite.config.js
globals.css
setup/bun.lock
setup/package-lock.json
setup/package.json
setup/src/lib/config/configurator-style-variables.ts
src/components/VariantSelectMenu/SwatchBook.tsx
src/components/VariantSelectMenu/SwatchMetadata.tsx
src/components/VariantSelectMenu/variant-cards/SelectionDetailsSurface.tsx
src/contexts/ov25-ui-context.tsx
src/index.ts
src/lib/strings/string-keys.ts
src/utils/page-scroll-lock.ts
test/browser/SelectionDetails.test.tsx
test/e2e/gallery-sheet-list-auto-open.test.ts
test/e2e/maze-snap2-dimensions.test.ts
test/e2e/mobile-drawer-stacking.test.ts-snapshots/single-no-pricing-mobile-drawer-boundary-chromium-darwin.png
test/e2e/selection-details.test.ts
test/e2e/selection-details.test.ts-snapshots/selection-details-desktop-fullscreen-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-desktop-modal-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-desktop-sheet-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-desktop-tooltip-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-mobile-fullscreen-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-mobile-modal-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-swatch-add-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-swatch-remove-chromium-darwin.png
test/e2e/sheet-reflow-debug.test.ts
test/unit/placeholder-image-fallback.test.tsx
test/unit/selection-details-config.test.ts
test/unit/swatch-metadata.test.ts
```
