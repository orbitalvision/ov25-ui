# OV25 Release Runbook

This is the canonical operational procedure for releasing `ov25-ui`, `ov25-ui-react18`, and
`ov25-setup`, then synchronizing OV25, Shopify, and WooCommerce. The older
[release automation plan](release-automation-and-shopify-runtime-versioning-plan.md) records design
history and may describe superseded phases.

Agents may prepare review artifacts and source changes, but the user runs tests, commits, pushes,
tags, package publication triggers, and platform deployments.

## Packages And Consumers

| Package | Primary consumers |
| --- | --- |
| `ov25-ui` | React 19 applications, including OV25 |
| `ov25-ui-react18` | Shopify and WooCommerce integrations |
| `ov25-setup` | OV25 and WooCommerce setup UI |

All three packages use the same release version.

## 1. Preflight

1. Inspect live Git state in `ov25-ui`, `OV25`, `shopify-plugin`, `ov25-woo-extension`, and
   `ov25-docs`. Do not rely on historical status snapshots in bug trackers or release artifacts.
2. Confirm approved source work is committed and pushed. Keep unrelated local work out of the
   release.
3. Confirm the intended version does not already exist on npm and its three package tags do not
   already exist.
4. Confirm the previous package tags identify the comparison base.
5. Review parked bugs separately; parked work is not release-approved.

## 2. Review

Ask an agent to run the repository `$ov25-release-review` skill, for example:

```text
Use $ov25-release-review for a patch release since ov25-ui@0.8.1.
```

The agent runs only the context collector and writes `releases/<version>/` artifacts. The user:

1. Reviews patch notes, developer summary, client email, raw diff, adapter impact, and docs impact.
2. Requests corrections.
3. Explicitly approves the artifacts.
4. Changes patch notes and developer summary from draft to approved.
5. Commits tracker/docs changes separately from approved release artifacts.

The review agent must not test, commit, tag, push, publish, or deploy.

## 3. Test

Run:

```bash
npm run release:test -- --release <version>
```

This runs type checking, unit tests, browser/component tests, the React 19 package build, the setup
frozen install/build, the react-test build, and Playwright. Review
`releases/<version>/test-summary.md` after it completes.

### Required React 18 Preflight

`release:test` currently does **not** install React 18 typings or run the exact
`ov25-ui-react18` publish build. This missed React 18 JSX incompatibilities in both the `0.8.0` and
`0.8.1` publishes. Before creating tags, run the exact React 18 build in an isolated temporary
worktree so the main workspace's package metadata, lockfile, and dependencies remain untouched:

```bash
git worktree add --detach /tmp/ov25-ui-react18-release-check HEAD
cd /tmp/ov25-ui-react18-release-check
npm run build:react18
cd -
git worktree remove --force /tmp/ov25-ui-react18-release-check
```

Use the repository's supported Node/npm toolchain if the system npm differs. Do not run
`build:react18` directly in a workspace that must remain clean: the script temporarily rewrites
package metadata and installs a React 18 dependency tree.

Automation follow-up: integrate this isolated React 18 build into `release:test` so this manual
step can eventually be removed.

Perform the manual fixture, Shopify theme, setup-preview, cart, and responsive checks identified by
the review artifacts. Approve the final artifacts only after the tests and manual checks pass.

## 4. Prepare Release Commits And Tags

Run without `--push` first:

```bash
npm run release:deploy -- --release <version>
```

The first phase updates the `ov25-ui` version and root npm lockfile, updates `CHANGELOG.md`, commits
the reviewed release artifacts, and creates these local annotated tags:

```text
ov25-ui@<version>
ov25-ui-react18@<version>
```

Review the release commit, tag targets, package metadata, and working-tree status before pushing.
Then push exactly what the script prints:

```bash
git push origin main
git push origin ov25-ui@<version> ov25-ui-react18@<version>
```

Wait until `ov25-ui@<version>` is available on npm, then finalize Setup:

```bash
npm run release:deploy -- --release <version> --finalize-setup
```

This second phase updates `ov25-setup` and its exact `ov25-ui` dependency, regenerates both
`setup/package-lock.json` and `setup/bun.lock` from the published package, verifies the Bun lock with
a frozen install, builds Setup against that exact package, commits all three Setup files, and
creates `ov25-setup@<version>`. Lock generation happens in a temporary directory so a transient
registry failure does not leave partial tracked files. Review the commit and tag, then push exactly
what the script prints:

```bash
git push origin main
git push origin ov25-setup@<version>
```

The split is required because Bun's lockfile records the published tarball integrity, which does not
exist before the `ov25-ui` workflow publishes the new version. Never replace only the version text
in `setup/bun.lock`; that can silently keep Setup pinned to the previous package.

Alternatively, `release:deploy -- --release <version> --push` performs both phases: it pushes the UI
commit and tags, waits for `ov25-ui@<version>` on npm, refreshes and commits the Setup lockfiles,
then pushes the Setup commit/tag and dispatches the OV25 dependency workflow. Before the Setup
commit it fetches the current branch and refuses to proceed if the remote moved beyond the reviewed
local release while npm was publishing, or if Setup source changed after the UI release tag. If the
process stops after the UI tags publish, resume safely with `--finalize-setup --push`; an
already-created Setup commit or matching unpushed local tag is validated and reused without
requiring a duplicate commit or tag.

A fully manual branch/tag push does not dispatch OV25; run the workflow separately after pushing the
Setup tag.

## 5. Package Publication

Each pushed package tag starts a separate GitHub Action in `orbitalvision/ov25-ui`. Watch the UI and
React 18 workflows first; the Setup tag is created only after the main UI package is available.
After the Setup workflow passes, verify all three npm packages:

```bash
npm view ov25-ui@<version> version
npm view ov25-ui-react18@<version> version
npm view ov25-setup@<version> version
```

Do not begin exact downstream dependency synchronization until all three packages are available.

### Partial Publish Failure

Treat each package independently:

1. Check which exact versions already exist on npm.
2. Never move or replace the tag for a package that published successfully.
3. Fix the failed package, run its exact build locally, commit, and push `main`.
4. Only when the failed version is absent from npm, delete and recreate that one failed tag at the
   fix commit, then push it to trigger a fresh workflow.

Example for an unpublished React 18 failure:

```bash
git push origin :refs/tags/ov25-ui-react18@<version>
git tag -d ov25-ui-react18@<version>
git tag -a ov25-ui-react18@<version> \
  -m "Release ov25-ui-react18@<version>" \
  -m "Reviewed notes: releases/<version>/patch-notes.md"
git push origin ov25-ui-react18@<version>
```

Moving a public release tag is exceptional and valid here only because that exact package version
was not published. A rerun of the old failed workflow is insufficient because it checks out the old
tagged commit.

## 6. Update OV25

When pushing manually, run the `Update OV25 UI packages` workflow from the GitHub Actions page, or:

```bash
gh workflow run update-ov25-ui-packages.yml \
  --repo orbitalvision/OV25 \
  --ref main \
  -f version=<version>
```

The workflow waits for all three packages, updates exact dependencies and `bun.lock`, runs OV25
type checking, and commits directly to OV25 `main`. Confirm it is green, then fetch the new remote
commit before continuing local OV25 work.

## 7. Update Shopify

1. Start from current `shopify-plugin/main`.
2. Update `extensions/ov25-configurator/package.json` to exact
   `ov25-ui-react18@<version>` and refresh `pnpm-lock.yaml` without unrelated churn.
3. Build the configurator extension/runtime bundle using the repository's normal build process.
4. Commit and push the dependency/bundle update.
5. Create a Shopify app version and test it on a staging or duplicate theme.
6. Promote the exact tested app version only after approval. Shopify deployment remains manual.

## 8. Update WooCommerce

1. Fetch current `ov25-woo-extension/main` before editing; plugin release commits may have advanced
   the branch since the previous dependency bump.
2. Update exact `ov25-ui`, `ov25-ui-react18`, and `ov25-setup` dependencies together.
3. Refresh `package-lock.json` without unrelated churn. Treat `bun.lock` separately until its stale
   dependency history is deliberately reconciled.
4. Run type checking/build/ZIP validation.
5. Commit the dependency update and use the repository's normal user-run plugin release workflow.
6. Verify the generated ZIP and GitHub workflow/release before rollout.

## 9. Documentation And Closeout

1. Publish approved public docs after package/platform releases are available.
2. Confirm all intended remote branches, tags, npm versions, Shopify app version, OV25 update, and
   WooCommerce release exist.
3. Confirm every repository is clean or that remaining local changes are explicitly documented.
4. Record any partial failure or deferred downstream update before starting the next feature cycle.

## 0.8.1 Closeout Snapshot

Recorded on 2026-08-06:

- `ov25-ui`, `ov25-ui-react18`, and `ov25-setup` `0.8.1` are published.
- OV25 remote `main` contains `873e1d8d`, updating all three packages to `0.8.1`.
- Shopify remote `main` contains `96d2b41`, updating `ov25-ui-react18` to `0.8.1`.
- WooCommerce remote `main` contains release `1.2.0` with OV25 packages still at `0.8.0`.
- The current local WooCommerce checkout is behind remote `main` and has unstaged `0.8.1`
  dependency changes based on the older branch. Do not commit them directly; first reconcile with
  current remote `main`, then decide whether to make a `1.2.1` dependency-only release.
