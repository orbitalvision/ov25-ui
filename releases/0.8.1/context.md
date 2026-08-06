# Release Review Context: ov25-ui@0.8.1

Status: raw context only
Bump: patch
Current version: 0.8.0
Target version: 0.8.1
Base: ov25-ui@0.8.0 (72a4ce5b7679)
Head: HEAD (a60ecb694fd2)
Branch: main
Generated: 2026-08-06T08:44:14.016Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.8.1`
- contextJson: `releases/0.8.1/context.json`
- contextMarkdown: `releases/0.8.1/context.md`
- commits: `releases/0.8.1/commits.txt`
- changedFiles: `releases/0.8.1/changed-files.txt`
- diffStat: `releases/0.8.1/diff-stat.txt`
- diffPatch: `releases/0.8.1/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
M docs/IMPORTANT_NOTES.md
 M docs/bugs-ready-for-review.md
 M docs/bugs-resolved.md
 M docs/ov25_bugs_and_todo.md
?? releases/0.8.1/
```

## Committed Changes

### Commits

```text
a60ecb6 (HEAD -> main, origin/main, origin/HEAD) (chore) bun lock
328b8d8 fix(tests) ya
ff077c1 fix(gallery): keep shadow host visible
2b2ba55 (tag: ov25-ui-react18@0.8.0) fix(carousel): support React 18 popover
```

### Diff Stat

```text
playwright.config.ts                               |   4 +-
 setup/bun.lock                                     |   4 +-
 src/components/product-carousel.tsx                |  13 +++++-
 src/components/product-gallery.tsx                 |   7 +++
 test/e2e/inline-sticky.test.ts                     |  52 +++++++++++++++++++--
 ...isable-add-to-cart-checkout-chromium-darwin.png | Bin 3002 -> 2859 bytes
 test/e2e/single-no-variants.test.ts                |  11 +++--
 7 files changed, 77 insertions(+), 14 deletions(-)
```

### Changed Files

```text
playwright.config.ts
setup/bun.lock
src/components/product-carousel.tsx
src/components/product-gallery.tsx
test/e2e/inline-sticky.test.ts
test/e2e/inline-variants-disable-add-to-cart.test.ts-snapshots/inline-variants-disable-add-to-cart-checkout-chromium-darwin.png
test/e2e/single-no-variants.test.ts
```
