# Release Review Context: ov25-ui@0.8.3

Status: raw context only
Bump: patch
Current version: 0.8.2
Target version: 0.8.3
Base: ov25-setup@0.8.2 (e9da768e85ae)
Head: 45fa5b5f92410d53ee379c12afb305038d7983cf (45fa5b5f9241)
Branch: main
Generated: 2026-08-17T07:23:13.677Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.8.3`
- contextJson: `releases/0.8.3/context.json`
- contextMarkdown: `releases/0.8.3/context.md`
- commits: `releases/0.8.3/commits.txt`
- changedFiles: `releases/0.8.3/changed-files.txt`
- diffStat: `releases/0.8.3/diff-stat.txt`
- diffPatch: `releases/0.8.3/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
?? release-drafts/ov25-ui-0.8.3.md
?? releases/0.8.3/
```

## Committed Changes

### Commits

```text
45fa5b5 (HEAD -> main, origin/main, origin/HEAD) fix(tests) regenerate test screenshots because thumbnails were regenerated
ef86b56 fix(selection-details) extract scroll locker and use it for selection details sheet also, stopping page reflow and layout jumps
```

### Diff Stat

```text
dev/react-test/templates/TestPageLayout.jsx        |   3 +
 dev/react-test/tests/inline-sticky-fixture.jsx     |  14 +-
 dev/react-test/tests/selection-details.jsx         |  36 +++
 .../VariantSelectMenu/VariantContentDesktop.tsx    | 166 +----------
 .../variant-cards/SelectionDetailsSurface.tsx      |  38 +--
 src/utils/page-scroll-lock.ts                      | 173 +++++++++++
 test/browser/SelectionDetails.test.tsx             |  39 ++-
 ...cing-mobile-drawer-boundary-chromium-darwin.png | Bin 17536 -> 28374 bytes
 test/e2e/selection-details.test.ts                 | 320 +++++++++++++++++++++
 ...-details-desktop-fullscreen-chromium-darwin.png | Bin 1379772 -> 1300432 bytes
 ...ction-details-desktop-modal-chromium-darwin.png | Bin 641953 -> 616559 bytes
 ...ction-details-desktop-sheet-chromium-darwin.png | Bin 269714 -> 261467 bytes
 ...ion-details-desktop-tooltip-chromium-darwin.png | Bin 107504 -> 103725 bytes
 ...n-details-mobile-fullscreen-chromium-darwin.png | Bin 246855 -> 241304 bytes
 ...ection-details-mobile-modal-chromium-darwin.png | Bin 249731 -> 243727 bytes
 ...election-details-swatch-add-chromium-darwin.png | Bin 641953 -> 616559 bytes
 ...ction-details-swatch-remove-chromium-darwin.png | Bin 642119 -> 616733 bytes
 17 files changed, 599 insertions(+), 190 deletions(-)
```

### Changed Files

```text
dev/react-test/templates/TestPageLayout.jsx
dev/react-test/tests/inline-sticky-fixture.jsx
dev/react-test/tests/selection-details.jsx
src/components/VariantSelectMenu/VariantContentDesktop.tsx
src/components/VariantSelectMenu/variant-cards/SelectionDetailsSurface.tsx
src/utils/page-scroll-lock.ts
test/browser/SelectionDetails.test.tsx
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
```
