# Release Review Context: ov25-ui@0.8.13

Status: raw context only
Bump: patch
Current version: 0.8.12
Target version: 0.8.13
Base: ov25-ui@0.8.12 (8b430ee32cbd)
Head: 426e387faaf1bc8d5266eca277aeababe2840439 (426e387faaf1)
Branch: main
Generated: 2026-09-25T07:56:17.398Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.8.13`
- contextJson: `releases/0.8.13/context.json`
- contextMarkdown: `releases/0.8.13/context.md`
- commits: `releases/0.8.13/commits.txt`
- changedFiles: `releases/0.8.13/changed-files.txt`
- diffStat: `releases/0.8.13/diff-stat.txt`
- diffPatch: `releases/0.8.13/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
?? releases/0.8.13/
```

## Committed Changes

### Commits

```text
426e387 (HEAD -> main, origin/main, origin/HEAD) chore(tests) allow each e2e test one retry
7e1f5d6 fix(sticky) measure travel against the gallery's real containing block
f3f8f94 feat(gallery) when auto cutouts, 3D slot should be hidden
696ca70 (tag: ov25-setup@0.8.12) chore: release ov25-setup 0.8.12
```

### Diff Stat

```text
playwright.config.ts                       |  5 +++
 setup/bun.lock                             |  4 +--
 setup/package-lock.json                    | 12 +++----
 setup/package.json                         |  4 +--
 src/components/product-carousel.tsx        |  8 ++++-
 src/lib/sticky-layout-controller.ts        | 31 ++++++++++++++--
 test/unit/product-carousel.test.tsx        | 19 +++++++++-
 test/unit/sticky-containing-block.test.ts  | 44 +++++++++++++++++++++++
 test/unit/sticky-layout-controller.test.ts | 57 ++++++++++++++++++++++++++++++
 9 files changed, 169 insertions(+), 15 deletions(-)
```

### Changed Files

```text
playwright.config.ts
setup/bun.lock
setup/package-lock.json
setup/package.json
src/components/product-carousel.tsx
src/lib/sticky-layout-controller.ts
test/unit/product-carousel.test.tsx
test/unit/sticky-containing-block.test.ts
test/unit/sticky-layout-controller.test.ts
```
