# Release Review Context: ov25-ui@0.8.7

Status: raw context only
Bump: patch
Current version: 0.8.6
Target version: 0.8.7
Base: ov25-ui@0.8.6 (7bc32e257f1b)
Head: HEAD (b277201f5790)
Branch: main
Generated: 2026-08-18T12:45:25.139Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.8.7`
- contextJson: `releases/0.8.7/context.json`
- contextMarkdown: `releases/0.8.7/context.md`
- commits: `releases/0.8.7/commits.txt`
- changedFiles: `releases/0.8.7/changed-files.txt`
- diffStat: `releases/0.8.7/diff-stat.txt`
- diffPatch: `releases/0.8.7/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
?? releases/0.8.7/
```

## Committed Changes

### Commits

```text
b277201 (HEAD -> main, origin/main, origin/HEAD) fix(test) update screenshots after selection reordering
4e77089 fix(selection-details) use white text on black background, black text on white background (mix-blend)
da49927 fix(selection-details) correct animations when opening mobile 'sheet'. stop reflow in sheet by reserving space for the image.
2d13ca6 (tag: ov25-setup@0.8.6) chore: release ov25-setup 0.8.6
```

### Diff Stat

```text
globals.css                                        |   1 +
 setup/bun.lock                                     |   4 +-
 setup/package-lock.json                            |  12 ++---
 setup/package.json                                 |   4 +-
 .../variant-cards/SelectionDetailsSurface.tsx      |  54 +++++++++++++++------
 ...cing-mobile-drawer-boundary-chromium-darwin.png | Bin 28329 -> 28341 bytes
 ...-details-desktop-fullscreen-chromium-darwin.png | Bin 1575980 -> 842477 bytes
 ...ction-details-desktop-modal-chromium-darwin.png | Bin 720350 -> 408353 bytes
 ...ction-details-desktop-sheet-chromium-darwin.png | Bin 313715 -> 158940 bytes
 ...ion-details-desktop-tooltip-chromium-darwin.png | Bin 126617 -> 70231 bytes
 ...n-details-mobile-fullscreen-chromium-darwin.png | Bin 284950 -> 144180 bytes
 ...ection-details-mobile-modal-chromium-darwin.png | Bin 287826 -> 139891 bytes
 ...election-details-swatch-add-chromium-darwin.png | Bin 720350 -> 408353 bytes
 ...ction-details-swatch-remove-chromium-darwin.png | Bin 720518 -> 408502 bytes
 14 files changed, 51 insertions(+), 24 deletions(-)
```

### Changed Files

```text
globals.css
setup/bun.lock
setup/package-lock.json
setup/package.json
src/components/VariantSelectMenu/variant-cards/SelectionDetailsSurface.tsx
test/e2e/mobile-drawer-stacking.test.ts-snapshots/single-no-pricing-mobile-drawer-boundary-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-desktop-fullscreen-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-desktop-modal-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-desktop-sheet-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-desktop-tooltip-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-mobile-fullscreen-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-mobile-modal-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-swatch-add-chromium-darwin.png
test/e2e/selection-details.test.ts-snapshots/selection-details-swatch-remove-chromium-darwin.png
```
