# Release Review Context: ov25-ui@0.7.3

Status: raw context only
Bump: patch
Current version: 0.7.2
Target version: 0.7.3
Base: ov25-ui@0.7.2 (f6d7ad00b26b)
Head: HEAD (0ec62328cc59)
Branch: main
Generated: 2026-06-15T14:48:19.087Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.7.3`
- contextJson: `releases/0.7.3/context.json`
- contextMarkdown: `releases/0.7.3/context.md`
- commits: `releases/0.7.3/commits.txt`
- changedFiles: `releases/0.7.3/changed-files.txt`
- diffStat: `releases/0.7.3/diff-stat.txt`
- diffPatch: `releases/0.7.3/diff.patch`

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
0ec6232 (HEAD -> main) fix(dining): keep full-page shell content visible so the iframe can bootstrap
bb56186 (origin/main, origin/HEAD) make it always switch back to configurator when ANY selection is made. remove unused hasSwitchedAfterDefer
9a82c1a make thumb border always 4px (i think it was causing safari problem
4220f42 stop snap2controls overlapping snap2 close button on mobile. refactor so we don't have ConfiguratorViewControls conditionally rendering Snap2Controls.
e775332 plan update
16ac111 update deploy script to include triggering the OV25 workflow which updates its package.json to point to new versions
b774f69 (tag: ov25-setup@0.7.2) fix: refresh setup lock before publish
```

### Diff Stat

```text
...tomation-and-shopify-runtime-versioning-plan.md | 53 +++++++++++++---------
 scripts/release/deploy.js                          | 45 ++++++++++++++++--
 scripts/release/publish-ci.js                      |  1 +
 setup/package-lock.json                            |  6 +--
 src/components/ConfiguratorViewControls.tsx        |  9 +---
 src/components/IframeContainer.tsx                 |  3 +-
 src/components/Snap2ConfigureButton.tsx            |  4 +-
 src/components/Snap2ViewControls.tsx               | 34 ++++++++++++++
 .../variant-cards/VariantThumb.tsx                 |  2 +-
 src/components/dining/DiningFullPageShell.tsx      | 12 ++++-
 src/contexts/ov25-ui-context.tsx                   | 35 ++++++--------
 11 files changed, 144 insertions(+), 60 deletions(-)
```

### Changed Files

```text
docs/release-automation-and-shopify-runtime-versioning-plan.md
scripts/release/deploy.js
scripts/release/publish-ci.js
setup/package-lock.json
src/components/ConfiguratorViewControls.tsx
src/components/IframeContainer.tsx
src/components/Snap2ConfigureButton.tsx
src/components/Snap2ViewControls.tsx
src/components/VariantSelectMenu/variant-cards/VariantThumb.tsx
src/components/dining/DiningFullPageShell.tsx
src/contexts/ov25-ui-context.tsx
```
