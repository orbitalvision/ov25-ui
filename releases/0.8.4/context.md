# Release Review Context: ov25-ui@0.8.4

Status: raw context only
Bump: patch
Current version: 0.8.3
Target version: 0.8.4
Base: ov25-ui@0.8.3 (391e9aaaf36d)
Head: HEAD (3d48de3b5783)
Branch: main
Generated: 2026-08-17T10:28:54.730Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.8.4`
- contextJson: `releases/0.8.4/context.json`
- contextMarkdown: `releases/0.8.4/context.md`
- commits: `releases/0.8.4/commits.txt`
- changedFiles: `releases/0.8.4/changed-files.txt`
- diffStat: `releases/0.8.4/diff-stat.txt`
- diffPatch: `releases/0.8.4/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
?? releases/0.8.4/
```

## Committed Changes

### Commits

```text
3d48de3 (HEAD -> main, origin/main, origin/HEAD) fix(details): use mobile mode on touch tablets
380c3fa (tag: ov25-setup@0.8.3) chore: release ov25-setup 0.8.3
```

### Diff Stat

```text
setup/bun.lock                                     |  4 +--
 setup/package-lock.json                            | 12 ++++----
 setup/package.json                                 |  4 +--
 .../variant-cards/DefaultVariantCard.tsx           |  3 +-
 .../variant-cards/SelectionDetailsSurface.tsx      | 20 ++++++------
 src/contexts/ov25-ui-context.tsx                   | 26 ++++++++++++----
 src/utils/viewport-mobile.ts                       | 16 ++++++++++
 test/browser/SelectionDetails.test.tsx             | 36 ++++++++++++++++++++++
 test/unit/selection-details-device-mode.test.ts    | 16 ++++++++++
 9 files changed, 110 insertions(+), 27 deletions(-)
```

### Changed Files

```text
setup/bun.lock
setup/package-lock.json
setup/package.json
src/components/VariantSelectMenu/variant-cards/DefaultVariantCard.tsx
src/components/VariantSelectMenu/variant-cards/SelectionDetailsSurface.tsx
src/contexts/ov25-ui-context.tsx
src/utils/viewport-mobile.ts
test/browser/SelectionDetails.test.tsx
test/unit/selection-details-device-mode.test.ts
```
