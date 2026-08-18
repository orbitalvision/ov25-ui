# Release Review Context: ov25-ui@0.8.6

Status: raw context only
Bump: patch
Current version: 0.8.5
Target version: 0.8.6
Base: ov25-ui@0.8.5 (e3c33d992844)
Head: HEAD (7a66a454204c)
Branch: main
Generated: 2026-08-18T09:44:22.868Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.8.6`
- contextJson: `releases/0.8.6/context.json`
- contextMarkdown: `releases/0.8.6/context.md`
- commits: `releases/0.8.6/commits.txt`
- changedFiles: `releases/0.8.6/changed-files.txt`
- diffStat: `releases/0.8.6/diff-stat.txt`
- diffPatch: `releases/0.8.6/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
None.
```

## Committed Changes

### Commits

```text
7a66a45 (HEAD -> main, origin/main, origin/HEAD) fix(deploy) error handling in release script
9035c35 fix(selection-details) position metadata better
a3bf9f2 (tag: ov25-setup@0.8.5) chore: release ov25-setup 0.8.5
```

### Diff Stat

```text
globals.css                                        | 41 +++++++++++++----
 scripts/release/common.js                          | 12 +++++
 setup/bun.lock                                     |  4 +-
 setup/package-lock.json                            | 12 ++---
 setup/package.json                                 |  4 +-
 .../VariantSelectMenu/SwatchMetadata.tsx           |  4 +-
 .../variant-cards/SelectionDetailsSurface.tsx      | 52 +++++++++++-----------
 test/browser/SelectionDetails.test.tsx             | 10 ++++-
 test/unit/release-common.test.ts                   |  8 +++-
 9 files changed, 99 insertions(+), 48 deletions(-)
```

### Changed Files

```text
globals.css
scripts/release/common.js
setup/bun.lock
setup/package-lock.json
setup/package.json
src/components/VariantSelectMenu/SwatchMetadata.tsx
src/components/VariantSelectMenu/variant-cards/SelectionDetailsSurface.tsx
test/browser/SelectionDetails.test.tsx
test/unit/release-common.test.ts
```
