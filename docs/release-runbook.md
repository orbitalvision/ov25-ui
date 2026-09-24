# OV25 Release Runbook

This is the canonical operational procedure for releasing `ov25-ui`, `ov25-ui-react18`, and
`ov25-setup`, then synchronizing OV25, Shopify, and WooCommerce. The older
[release automation plan](release-automation-and-shopify-runtime-versioning-plan.md) records design
history and may describe superseded phases.

Bug fixing, feature implementation, multi-agent coordination, code review, and active bookkeeping
before release scope is frozen follow the
[pre-release engineering runbook](pre-release-engineering-runbook.md).

Agents may prepare review artifacts and source changes, but the user runs tests, commits, pushes,
tags, package publication triggers, and platform deployments.

## Packages And Consumers

| Package | Primary consumers |
| --- | --- |
| `ov25-ui` | React 19 applications, including OV25 |
| `ov25-ui-react18` | Shopify and WooCommerce integrations |
| `ov25-setup` | OV25 and WooCommerce setup UI |

All three packages use the same release version.

## 1. Test And Stabilize

Before generating release context or artifacts, confirm the active release queue is clear and the
approved source commits are stable. Run:

```bash
OV25_E2E_NEW_HEADLESS=true npm run release:test -- --release <version>
```

This runs type checking, unit tests, browser/component tests, the React 19 package build, the setup
frozen install/build, the react-test build, and Playwright. Review
`releases/<version>/test-summary.md` after it completes.

Headless execution is the default because headed browser windows interrupt other work. Use headed
mode only when a specific failure cannot be diagnosed or verified headlessly. Notify the user
before starting a headed run, explain why it is necessary, and limit it to the smallest relevant
test scope.

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

If any test or stabilization check fails, fix the source, commit and push the fix, then rerun all of
Step 1. Do not proceed with a partially tested source state.

## 2. Preflight And Freeze Tested Scope

1. Inspect live Git state in `ov25-ui`, `OV25`, `shopify-plugin`, `ov25-woo-extension`, and
   `ov25-docs`. Do not rely on historical status snapshots in bug trackers or release artifacts.
2. Confirm approved source work is committed and pushed. Keep unrelated local work out of the
   release.
3. Confirm the intended version does not already exist on npm and its three package tags do not
   already exist.
4. Confirm the previous package tags identify the comparison base.
5. Review parked bugs separately; parked work is not release-approved.
6. Record the exact tested `HEAD` for each repository and freeze the reviewed release scope before
   generating artifacts.

## 3. Generate And Review Artifacts

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

The collector and artifact review happen only after Step 1 is green and Step 2 has frozen the exact
tested scope. Perform the manual fixture, Shopify theme, setup-preview, cart, and responsive checks
identified by the review artifacts; additional manual checks may be discovered from the artifacts.
Approve the final artifacts only after the tests and manual checks pass.

Any code change after Step 1 completes or after artifacts are generated requires returning to Step 1,
rerunning the complete test and stabilization sequence, refreezing the tested scope in Step 2, and
regenerating the Step 3 artifacts.

## 4. Release And Publish

Once the artifacts are approved and Step 1 is green at the reviewed head, run the whole release in
one command:

```bash
npm run release:deploy -- --release <version> --push
```

This is the default path. It:

1. updates the `ov25-ui` version, root npm lockfile, and `CHANGELOG.md`, commits the approved release
   artifacts, and creates annotated `ov25-ui@<version>` and `ov25-ui-react18@<version>` tags;
2. pushes the release commit and both tags, which start the UI and React 18 publish workflows;
3. waits until `ov25-ui@<version>` is available on npm;
4. finalizes Setup: updates `ov25-setup` and its exact `ov25-ui` dependency, regenerates both
   `setup/package-lock.json` and `setup/bun.lock` from the published package, verifies the Bun lock
   with a frozen install, builds Setup against that exact package, and commits all three Setup files;
5. pushes the Setup commit, then creates and pushes `ov25-setup@<version>`;
6. dispatches the OV25 dependency update workflow (skip with `--skip-ov25-dispatch`).

Before the Setup commit it fetches the current branch and refuses to proceed if the remote moved
beyond the reviewed local release while npm was publishing, or if Setup source changed after the UI
release tag. Lock generation happens in a temporary directory, so a transient registry failure does
not leave partial tracked files.

The Setup phase has to wait for npm because Bun's lockfile records the published tarball integrity,
which does not exist until the `ov25-ui` workflow publishes. Never replace only the version text in
`setup/bun.lock`; that can silently keep Setup pinned to the previous package.

### Resuming

If the run stops after the UI tags are pushed (for example npm is slow to publish), resume with:

```bash
npm run release:deploy -- --release <version> --finalize-setup --push
```

An already-created Setup commit or matching unpushed local tag is validated and reused, so this
never creates a duplicate commit or tag.

### Manual path (only when you need to inspect the local release commit first)

Running without `--push` stops after each phase and prints the `git push` commands instead of
running them:

```bash
npm run release:deploy -- --release <version>
```

It then needs `git push origin main`, `git push origin ov25-ui@<version> ov25-ui-react18@<version>`,
waiting for npm, `release:deploy -- --release <version> --finalize-setup`, another
`git push origin main`, and `git push origin ov25-setup@<version>`. **Each tag must be pushed
explicitly**: the publish workflows are triggered only by tag pushes, and `git push origin main`
does not push tags. Nothing watches npm for a new `ov25-ui`; the Setup workflow runs only when its tag
is pushed. The manual path also does not dispatch OV25, so run Step 6 by hand.

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
