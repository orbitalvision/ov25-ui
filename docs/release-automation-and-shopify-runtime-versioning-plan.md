# OV25 Release Automation and Shopify Runtime Versioning Plan

## Goals

Build a safer release process for `ov25-ui`, `ov25-ui-react18`, `ov25-setup`, OV25, WooCommerce, and Shopify integrations.

The process must:

- Review changes since the last release.
- Draft patch notes and a developer-facing summary.
- Draft optional client release notification emails from the reviewed patch notes.
- Highlight breaking changes before anything is changed.
- Stop for human review and approval before committing, bumping versions, publishing, pushing, or deploying.
- Publish package releases from GitHub Actions after the user pushes an approved release tag.
- Keep deploy scripts under manual user control.
- Let Shopify clients test new OV25 storefront runtime versions on staging themes before live rollout.

Important safety rule: Codex/AI agents must never run publish, release, deploy, or Shopify deploy scripts. Only the initial review and summary is done by an AI agent. Everything else, including testing and deployment, should be done via user-run scripts.

The user reviews the generated notes, and if happy runs the test and deploy scripts. GitHub Actions performs the package publishing after the tags are pushed.

From a perspective of when the user needs to give input, here is the rough flow:

- User requests release review & artifact generation
- AI Agent creates all the release artifacts
- User reviews
- User runs `npm run release:test` to run automated tests
- User does manual testing
- User decides whether release is ready to go
- if yes, user runs `npm run release:deploy`
- `release:deploy` updates package metadata, commits the release candidate, creates tags, and pushes the release trigger tags

## Release Automation Flow

Most (all?) of the current release scripts will become obsolete.
The aim is to have all releases in sync. That means:

- ov25-ui, ov25-ui-react18 and ov25-setup always use the same package version number.
- any release also updates OV25 to reference the new versions.
- a new WooCommerce plugin version is released to reference the new versions.
- Shopify plugin/runtime updates are prepared to reference the new versions without automatically deploying client sites.

Do not make `npm run publish` immediately publish. Replace the current single-step mental model with a gated release workflow.

Recommended scripts:

```json
{
  "release:review": "node scripts/release/review.js",
  "release:test": "node scripts/release/test.js",
  "release:deploy": "node scripts/release/deploy.js"
}
```

### 1. Review phase

Command:

```bash
npm run release:review -- --bump patch
npm run release:review -- --bump minor
npm run release:review -- --bump major
```

Behavior:

- release artifacts should be stored in `ov25-ui/releases/` but make sure they don't get deployed as part of ov25-ui, ov25-ui-react18 or ov25-setup
- Detect the current version from `package.json`.
- Calculate the next version from the requested bump type.
- Detect the comparison point using the latest release tag, preferably `ov25-ui@x.y.z`.
- If no reliable release tag exists, require `--since <git-ref>`.
- Run `npm run release:review` as a deterministic context collector only.
- Write raw context files such as `context.json`, `context.md`, `commits.txt`, `changed-files.txt`, `diff-stat.txt`, and diff patches under `ov25-ui/releases/<version>/`.
- Use the repo-local `$ov25-release-review` AI skill to inspect the raw context and source diffs.
- The AI skill, not the Node script, classifies files, summarizes changes, drafts patch notes, drafts the developer summary, drafts the client email, and flags likely breaking changes/migration risks.
- Write AI-generated review artifacts under `ov25-ui/releases/<version>/`.
- Do not commit the draft.
- Do not bump package versions.
- Do not publish anything.
- Do not create or push tags.
- Do not push anything.

#### Patch Notes

Patch notes should be user-facing and suitable for review before release.

They should include:

- Release version and bump type.
- Important fixes, improvements, features - client/user focused.
- Any behavior changes visible to OV25 users, WooCommerce sites, or Shopify storefronts.
- Known issues or manual testing notes.
- Clear wording for anything that could affect client sites.
- Section for developers who use ov25-ui package, the shopify plugin or woocommerce plugin.

#### Developer Summary

The developer summary should explain what changed for us (the developers of OV25).

It should include:

- Changed packages and important files.
- API, payload, DOM, CSS selector, runtime, Shopify, WooCommerce, and OV25 compatibility risks.
- Breaking-change assessment.
- Migration notes if needed.
- Tests expected before publish.
- Any follow-up tasks that should not block the release.

#### Client Release Email Draft

The review phase should also generate optional client notification email copy from the patch notes.

The email draft should include:

- Release version.
- Short client-facing summary.
- Relevant fixes and improvements.
- Compatibility notes.
- Whether the release is patch, minor, or major.
- Shopify runtime instructions:
  - test the new version on a staging theme first;
  - keep live pinned to the current version until approved;
  - update live to the tested version after approval;
  - optionally use `latest` only if the client accepts automatic updates.
- WooCommerce/OV25 notes where relevant.
- Support contact and rollback instructions.

Sending should be a separate reviewed step after the release is approved. It should not happen during `release:review` or before packages are available.

OV25 already has Resend usage, so a future notification tool can probably reuse that infrastructure. Keep the first implementation manual or dry-run only, then add an explicit send command later, for example:

```text
OV25 release notification dry run
OV25 release notification send
```

Email sending does not need to be part of the core `ov25-ui` release scripts. The send step must require explicit approval, log recipients, and never infer broad client mailing lists silently.

### 2. Human review gate

The user reviews `releases/<version>/...` first.

No automation continues - no AI Agents after this point. The rest is done using scripts triggered manually by the user: first the test script, then the release script.

### 3. Test phase

Command:

```bash
npm run release:test -- --release 0.7.0
```

Behavior after review approval:

- Run checks and builds.
- Write a test summary into the release draft or a linked release report.
- Leave source/package metadata unchanged for manual testing.
- Do not update `CHANGELOG.md`.
- Do not bump `ov25-ui`, `ov25-ui-react18`, or `ov25-setup` versions.
- Do not update `setup/package.json`.
- Do not update package lockfiles.
- Do not commit anything.
- Do not create or push tags.
- Do not publish anything.
- Do not deploy Shopify or WooCommerce.

Recommended checks:

```bash
npm run type-check
npm run test:unit
npm run test:browser:ci
npm run test:e2e
npm run build
```

### 4. Deploy phase

Command:

```bash
npm run release:deploy -- --release 0.7.0
```

This command is user-run only, after automated tests and manual testing are complete.

Behavior:

- Verify the working tree contains only the expected release changes.
- Update `CHANGELOG.md` from the reviewed draft.
- Bump `ov25-ui` version.
- Update package metadata for both npm package names:
  - `ov25-ui`
  - `ov25-ui-react18`
  - This means the package name, version, React peer dependency range, export map, `main`/`module`/`types` paths, files list, and package-specific build inputs are correct for the package that GitHub Actions will later publish.
  - The local deploy script must not publish either package. It only prepares and commits metadata needed by the tag-triggered GitHub Actions publish workflow.
- Bump `ov25-setup` when its dependency on `ov25-ui` changes.
- Update `setup/package.json` to depend on the new released `ov25-ui` version.
- Update package lockfiles consistently.
- Verify `package.json` version matches the requested release.
- Verify `setup/package.json` has the intended `ov25-setup` version and depends on the new released `ov25-ui` version.
- Commit reviewed notes, version changes, and lockfile changes.
- Create package-specific annotated release tags:
  - `ov25-ui@0.7.0`
  - `ov25-ui-react18@0.7.0`
  - `ov25-setup@0.7.0`
- Use `ov25-setup` for the setup package tag unless the package is renamed. The npm package is currently `ov25-setup`, not `ov25-ui-setup`.
- Include the relevant release draft/changelog excerpt in each annotated tag message.
- Push the release commit and package tags, or print the exact commands and require final confirmation before pushing:

```bash
git push origin main
git push origin ov25-ui@0.7.0 ov25-ui-react18@0.7.0 ov25-setup@0.7.0
```

Pushing the tags is the publish trigger. The local script must not publish npm packages itself and must not deploy Shopify.

Phase 1 stops here. `release:deploy` should not trigger OV25 automation yet. The only automatic result of pushing tags in Phase 1 is publishing:

- `ov25-ui`
- `ov25-ui-react18`
- `ov25-setup`

The downstream OV25 dependency-update workflow belongs to Phase 2. It should be added only after the three package publish workflows are stable.

### 5. GitHub Actions publish phase

Each package should release from its own tag and GitHub Action. This keeps package releases explicit and makes partial failures easier to see.

Triggers:

```yaml
on:
  push:
    tags:
      - "ov25-ui@*"
      - "ov25-ui-react18@*"
      - "ov25-setup@*"
```

Behavior:

- Checkout the tagged commit.
- Determine the package from the tag prefix.
- Verify the tag version exactly matches the package metadata for the package being published.
- Install dependencies with the lockfile.
- Do not run the full test suite in GitHub Actions. The user-run `release:test` phase is the release quality gate, and some tests, especially Playwright/browser tests, are not reliable enough in GitHub Actions.
- Run only the publish-specific build step required to package the tagged release.
- Build and publish only the tagged package to the public npm registry.
- Create a GitHub Release for the tag using the reviewed release notes.
- Upload useful artifacts:
  - npm pack tarballs
  - build logs
  - `release:test` summary if present
  - release draft/changelog excerpt

Required repository secrets/settings:

- Enable npm Trusted Publishing for GitHub Actions publishes. This is the normal target path.
- Do not require an `NPM_TOKEN` for the normal release workflow.
- Workflow permissions:
  - `contents: write` for creating the GitHub Release.
  - `id-token: write` so GitHub Actions can request the OIDC token npm uses for Trusted Publishing.
- No GitHub environment approval gate is required by default. Pushing the release tag is the manual approval to publish the package.
- After the GitHub release workflow is verified, revoke any other npm publish tokens or local machine tokens that can publish these packages. GitHub Actions should become the only normal publish path.

#### trusted publishing

docs: https://docs.npmjs.com/trusted-publishers

Package publishing should use npm Trusted Publishing from GitHub Actions. This avoids long-lived npm tokens and makes the GitHub workflow the normal publish authority.

Required setup:

1. Use npm Trusted Publishing for each npm package:
  - `ov25-ui`
  - `ov25-ui-react18`
  - `ov25-setup`
2. In npmjs.com, open each package's settings and add a **Trusted Publisher**:
  - provider: GitHub Actions
  - owner/organization: the GitHub owner for this repo
  - repository: this repo name
  - workflow filename: the package-specific release workflow filename, for example `release-ov25-ui.yml`, `release-ov25-ui-react18.yml`, or `release-ov25-setup.yml`
  - environment name: leave blank unless an additional GitHub environment approval gate is added later
  - allowed action: `npm publish`
3. In the GitHub Actions workflow:
  - run on a GitHub-hosted runner such as `ubuntu-latest`;
  - use Node/npm versions that support trusted publishing;
  - set `permissions.id-token: write`;
  - publish with `npm publish --access public`.
4. With Trusted Publishing, do not set `NODE_AUTH_TOKEN` and do not use `NPM_TOKEN`; npm will authenticate through OIDC.

Example workflow permissions:

```yaml
permissions:
  contents: write
  id-token: write
```

Example trusted-publishing publish step:

```yaml
- run: npm publish --access public
```

Existing workflow note:

- The old `.github/workflows/release-package.yml` GitHub-Packages workflow should be removed.
- Use the package-specific tag-triggered npm release workflows instead.

Fixes needed before relying on existing publish code:

- Remove implicit `git pull` from publish scripts.
- Do not delete `node_modules` or package locks as a cleanup step.
- Do not temporarily leave `package.json` in the React 18 package state.
- Add failure handling that restores package metadata on publish/build failure.
- Move publish implementation into a CI-only script, for example `scripts/release/publish-ci.js`, and make it refuse to run unless `GITHUB_ACTIONS=true`.

### 6. Downstream phase

Behavior:

- Update `OV25` dependencies:
  - `ov25-ui`
  - `ov25-ui-react18`
  - `ov25-setup`
- Run OV25 checks/builds.
- Commit and push OV25 dependency updates.
- Update WooCommerce dependencies:
  - `ov25-ui`
  - `ov25-ui-react18`
  - `ov25-setup`
- Run WooCommerce build/type checks.
- Prepare WooCommerce release artifacts.
- Leave WooCommerce release execution to the user.
- Prepare Shopify dependency/runtime updates, but do not deploy Shopify apps automatically.

Downstream automation should be handled by follow-on GitHub Actions or repo-specific scripts, not by Phase 1 of the core `ov25-ui` release script. In Phase 1, `release:deploy` only prepares/pushes the package release commit and package tags. A later Phase 2 workflow can update OV25 after waiting until all three npm packages are available.

For OV25 specifically:

- Confirm all package versions exist on npm:
  - `npm view ov25-ui@0.7.0 version`
  - `npm view ov25-ui-react18@0.7.0 version`
  - `npm view ov25-setup@0.7.0 version`
- Update `OV25/package.json` to reference the released versions:

```json
{
  "ov25-setup": "0.7.0",
  "ov25-ui": "0.7.0",
  "ov25-ui-react18": "0.7.0"
}
```

- Update the OV25 lockfile with the repo's package manager.
- Run OV25 checks/builds.
- Commit and push the OV25 dependency update, for example:

```text
chore: update OV25 UI packages to 0.7.0
```

### Downstream wait automation

Yes: downstream automation can wait for all three package releases to become available. The reliable gate should be npm registry availability, not only GitHub workflow completion.

Recommended approach:

- Add an `OV25` repo workflow such as `.github/workflows/update-ov25-ui-packages.yml`.
- Trigger it from `release:deploy` with `workflow_dispatch` and a `version` input. Keep the workflow manually runnable too, so it can be rerun from the GitHub UI or `gh workflow run` if the first attempt fails.
- Use a concurrency group such as `ov25-ui-package-update-${version}` so repeated triggers cannot create duplicate update commits.
- Poll npm until all three exact versions are available and downloadable:

```bash
set -euo pipefail

version="${VERSION:?VERSION is required}"
deadline=$((SECONDS + 1800))
packages=(ov25-ui ov25-ui-react18 ov25-setup)

for pkg in "${packages[@]}"; do
  until npm view "${pkg}@${version}" version --registry=https://registry.npmjs.org >/dev/null 2>&1; do
    if (( SECONDS > deadline )); then
      echo "Timed out waiting for ${pkg}@${version}"
      exit 1
    fi
    echo "Waiting for ${pkg}@${version} to appear on npm..."
    sleep 30
  done
done
```

- After all three versions exist, update `OV25/package.json`, refresh the lockfile, run OV25 checks, then commit and push.
- For a stronger check, run a temporary install or `npm pack <pkg>@<version>` for each package before updating OV25, because package metadata can appear before all registry/CDN caches are fully ready.

Recommended Phase 2 trigger model:

- Keep the OV25 workflow manually runnable with `workflow_dispatch` and a required released version.
- After Phase 2 is proven safe, decide whether `release:deploy` should dispatch it automatically or whether it should remain an explicit user-run downstream step.
- The OV25 workflow polls npm until `ov25-ui`, `ov25-ui-react18`, and `ov25-setup` all exist at the exact version.
- Keep the npm polling even if a future automatic trigger is added; it handles registry propagation delay and partial publish failures.

## GitHub Actions Release Design

Create one workflow per package, or one dispatcher workflow that routes by tag prefix. Prefer one workflow per package for clarity:

- `.github/workflows/release-ov25-ui.yml`
- `.github/workflows/release-ov25-ui-react18.yml`
- `.github/workflows/release-ov25-setup.yml`

Recommended jobs for each workflow:

```text
validate
  parse tag
  assert tag version == the relevant package.json version
  npm ci
  do not run the full test suite

pack
  build the tagged package
  npm pack --dry-run or npm pack

publish
  npm publish the tagged package

github-release
  create GitHub Release from tag
  use reviewed release notes
  upload the npm package tarball from npm pack
  upload the `npm pack --dry-run` package contents report
  upload build logs
  upload the release:test summary if present
```

The publish job should be idempotent where possible:

- Check `npm view <package>@<version> version` before publishing.
- If a package version already exists, fail with a clear message unless all expected packages already exist and the release is being verified.
- Never publish a different version from the tag version.
- Never publish from an untagged commit.

Tag naming:

- Use one tag per package:
  - `ov25-ui@x.y.z`
  - `ov25-ui-react18@x.y.z`
  - `ov25-setup@x.y.z`
- The three packages can share the same version number when they are released as a coordinated set.
- If `ov25-setup` needs to release independently later, push only the `ov25-setup@x.y.z` tag and run only the setup workflow. Because `ov25-setup` depends on `ov25-ui`, the setup workflow must first wait until the exact `ov25-ui` version referenced by `setup/package.json` exists on npm.
- Downstream repo updates, especially OV25, must wait until all required package tags have completed successfully.

Release notes source:

- Preferred: committed `release-drafts/<package>-x.y.z.md` after human approval.
- Fallback: the matching `CHANGELOG.md` section.
- The workflow should fail if neither source exists for the tag version.

## Shopify Runtime Versioning

Current problem:

- Shopify app extension versions are app-level.
- A released Shopify app version is used by both live and staging themes.
- Clients cannot natively choose an older app extension version for live and a newer version for staging.
- So there is no way to have a shopify-plugin version tested before it is pushed live.
- In the current `shopify-plugin`, `ov25-configurator.js` contains high-risk runtime logic:
  - Shopify metafield parsing.
  - Selector resolution.
  - `injectConfigurator` option mapping.
  - Checkout interception.
  - Cart property creation.
  - Snap2 and bed-configurator handling.
  - Invoice requests.

Therefore, versioning only `ov25-ui` is not enough. The Shopify adapter must be versioned too.

## Target Shopify Architecture

Use a minimal Shopify shell plus a versioned OV25 Shopify runtime.

```text
Shopify app extension
  minimal Liquid shell
  exposes raw Shopify context
  loads selected OV25 runtime

Versioned OV25 Shopify adapter
  parses Shopify context/metafields
  maps Shopify data to injectConfigurator options
  owns cart and checkout behavior
  imports or bundles the matching ov25-ui

ov25-ui
  stays platform-neutral
  receives normal injectConfigurator options only
```

Do not add `shopifyContext` to `injectConfigurator`. `injectConfigurator` is used outside Shopify and should stay platform-neutral.

The transformation from Shopify metafields/settings into `injectConfigurator` parameters belongs inside the versioned Shopify adapter.

## Shopify Shell

Change the Shopify app extension so Liquid exposes a minimal context object:

```js
window.__OV25_SHOPIFY__ = {
  shellVersion: "1.0.0",
  templateName: "...",
  shopUrl: "...",
  organizationId: "...",
  apiKey: "...",
  product: {
    isOV25Product: true,
    configuratorID: "...",
    images: []
  },
  shopSettings: {},
  productSettings: {},
  cart: {
    hasOV25Product: true
  },
  runtime: {
    mode: "version",
    version: "0.6.7"
  }
};
```

The shell should avoid behavior changes. It should mainly pass data through.

Adding new raw metafields to this object is generally safe if:

- Missing values serialize to `null` or an empty object.
- Old runtime versions ignore unknown fields.
- No behavior changes happen in the shell.
- The new data is only consumed by runtime versions that explicitly support it.

## Runtime Selection

Add Shopify theme settings:

- `runtime_mode`: `latest` or `version`.
- `runtime_version`: used only when `runtime_mode` is `version`.

Example behavior:

- Live theme uses a specific version, for example `0.6.7`.
- Staging theme uses `latest` or a specific newer version, for example `0.7.0`.
- Client tests staging theme.
- Client updates the live theme setting to the tested version when approved.

This restores the normal Shopify workflow: test on staging theme, then publish live.

`latest` is client-selected. It should not be treated as a global production promotion that every live theme uses by default. If a live theme is set to `latest`, that client is opting into automatic runtime updates.

Possible patch policy:

- Patch releases may be eligible for `latest` auto-update when the compatibility checklist is clean.
- Minor and major releases should require explicit client testing and a specific version selection.
- Clients that want maximum control should keep live themes pinned to a specific version.

## Runtime Hosting

Serve versioned runtime assets from OV25-controlled infrastructure.

Example URLs:

```text
https://webhooks.orbital.vision/api/shopify/runtime/manifest.json
https://webhooks.orbital.vision/api/shopify/runtime/0.7.0/ov25-shopify.js
```

Manifest should include:

```json
{
  "latest": "0.7.0",
  "blockedVersions": [],
  "availableVersions": ["0.6.7", "0.7.0"],
  "shops": {
    "example.myshopify.com": {
      "allowLatest": true,
      "blockedVersions": []
    }
  }
}
```

Runtime server requirements:

- JavaScript MIME type.
- CORS headers suitable for module scripts.
- Low-cache manifest.
- Immutable cache headers for versioned runtime files.
- Emergency fallback to the last known-good runtime if selected runtime is blocked or unavailable.

## Runtime Adapter Responsibilities

Move the current risky code from `ov25-configurator.js` into the versioned adapter:

- Parse `window.__OV25_SHOPIFY__`.
- Normalize old and new metafield shapes.
- Decide layout mode:
  - standard
  - Snap2
  - bed configurator
- Build normal `injectConfigurator` options.
- Provide Shopify callbacks:
  - `addToBasket`
  - `buyNow`
  - `buySwatches`
- Own cart property generation.
- Own checkout interception and invoice calls.
- Ignore unknown raw fields.
- Support backwards compatibility with existing metafields.

`ov25-ui` remains unaware of Shopify.

## Shopify App Update Policy

Shopify app extension updates should be rare and backwards-compatible.

Allowed safe changes:

- Add new inert raw fields to `window.__OV25_SHOPIFY__`.
- Add new theme settings without using them by default.
- Improve loader fallback behavior.
- Improve diagnostics without changing storefront behavior.

Risky changes:

- Changing checkout behavior in the Shopify-hosted shell.
- Changing cart property shapes in the shell.
- Changing selector behavior in the shell.
- Changing metafield interpretation in the shell.
- Bundling a new `ov25-ui` directly into the Shopify app extension.

Risky changes should go into the versioned runtime adapter instead.

## Shopify Rollout Flow

For a patch release:

- Publish new OV25 runtime version.
- Test on internal/dev store.
- If compatibility checks pass, optionally update `latest` to the new patch version.
- Client sets staging theme to `latest` or to the specific new version.
- Client reviews staging theme.
- Client updates the live theme to the specific tested version when approved.
- Clients who opt into `latest` on live themes receive patch updates automatically.

For a minor release:

- Publish new OV25 runtime version.
- Do not automatically move live clients unless they have explicitly opted into `latest`.
- Client tests the specific new version on staging.
- Client updates the live theme to the tested version after approval.

For a major release:

- Publish as a specific selectable version only.
- Do not move `latest` automatically.
- Require migration notes and client-specific testing.

## Emergency Rollback

If a runtime breaks a client site:

- If `latest` is affected, update manifest to point `latest` back to the last known-good version.
- Add the bad version to `blockedVersions`.
- Optional shop-specific override for affected clients.
- Clients pinned to a specific version can switch their theme setting back to a previous version.
- The Shopify app extension does not need redeploying for runtime rollback.

If the Shopify shell itself breaks a site:

- Client can disable the app embed/block.
- Developer must release or roll back the Shopify app version.
- This is why shell changes should stay minimal and backwards-compatible.

## Testing Plan

Release automation tests:

- Version bump calculation for patch/minor/major.
- Last-release tag detection.
- `--since` fallback when tags are missing.
- Draft release note generation.
- Approval gate enforcement.
- Tag creation preflight without pushing.
- Tag/version mismatch failure.
- GitHub Actions workflow syntax and dry-run validation.
- Dirty worktree checks.
- Changelog insertion.
- Package metadata restoration on failure.
- CI-only publish script refuses to run locally.

`ov25-ui` checks:

- Type check.
- Unit tests.
- Browser/component tests.
- Real E2E tests.
- React 19 build.
- React 18 build.
- `ov25-setup` build.

Shopify runtime tests:

- Standard configurator fixture.
- Snap2 fixture.
- Bed configurator fixture.
- Old metafield shape.
- New metafield shape.
- Unknown fields ignored.
- Missing metafields safe.
- Runtime `latest` and specific-version selection.
- Manifest unavailable fallback.
- Blocked runtime fallback.

Downstream checks:

- OV25 dependency update and build/type-check.
- WooCommerce dependency update and build/type-check/zip preparation.
- Shopify plugin build only.
- No Shopify deploy in automation.

## Implementation Phases

### Phase 1: `ov25-ui`, `ov25-ui-react18`, and `ov25-setup`

Goal: build the package release foundation first. This phase should make the three npm packages releasable through the gated review/test/deploy flow and tag-triggered GitHub Actions, without changing downstream apps or client storefront behavior.

Scope:

- Create the release draft format under `ov25-ui/releases/<version>/`.
- Add `release:review`:
  - calculate the next version from the requested bump;
  - detect the last release tag or require `--since`;
  - collect commits, changed files, diff stats, and patches;
  - run the repo-local `$ov25-release-review` AI skill;
  - write patch notes, developer summary, client email draft, and breaking-change notes;
  - never bump, commit, tag, push, publish, or deploy.
- Add the human approval gate.
- Add `release:test`:
  - run the agreed checks and builds;
  - write a test summary into the release draft/report;
  - leave package metadata and source unchanged.
- Add `release:deploy`:
  - verify the release draft and expected working tree;
  - update `CHANGELOG.md`;
  - bump `ov25-ui`, `ov25-ui-react18`, and `ov25-setup` to the coordinated version;
  - update `setup/package.json` so `ov25-setup` depends on the released `ov25-ui` version;
  - refresh lockfiles consistently;
  - commit the reviewed release artifacts and version changes;
  - create annotated package tags:
    - `ov25-ui@x.y.z`
    - `ov25-ui-react18@x.y.z`
    - `ov25-setup@x.y.z`
  - push only after explicit user confirmation.
- Replace `.github/workflows/release-package.yml` with tag-triggered npm release workflows.
- Enable npm Trusted Publishing for all three packages.
- Refactor any existing publish code into CI-only internals that refuse to run unless `GITHUB_ACTIONS=true`.
- Remove unsafe publish-script behavior:
  - no implicit `git pull`;
  - no lockfile or `node_modules` deletion;
  - no package metadata left in the wrong package state after failure;
  - no local `npm publish`.

Exit criteria:

- A dry release review produces all expected artifacts.
- `release:test` runs without mutating package metadata.
- `release:deploy` can prepare a release commit and package tags without publishing locally.
- Pushing package tags publishes the correct npm packages from GitHub Actions only.
- The three packages can be released in sync at the same version number.

Explicitly out of scope for Phase 1:

- Updating `OV25` locally or triggering an OV25 workflow.
- Updating `shopify-plugin`.
- Updating `ov25-woo-extension`.
- Deploying Shopify apps.
- Releasing WooCommerce plugin builds.

### Phase 2: `OV25`

Goal: make OV25 consume the newly released npm packages safely, after all three package releases are available on npm.

Scope:

- Add downstream update preparation for `OV25`.
- Add an `OV25` workflow or script that accepts a released version.
- Poll npm until all three package versions are available and downloadable:
  - `ov25-ui@x.y.z`
  - `ov25-ui-react18@x.y.z`
  - `ov25-setup@x.y.z`
- Update `OV25/package.json` to reference the released versions.
- Refresh the OV25 lockfile with the repo's package manager.
- Run OV25 checks/builds.
- Commit and push the OV25 dependency update after the checks pass.
- Keep manual `workflow_dispatch` available as the initial trigger path, with a released `version` input.
- Consider an automatic `release:deploy` dispatch only after the manual Phase 2 workflow has proved safe.
- If runtime manifest/version hosting lives in OV25 infrastructure, add the hosting endpoints here:
  - low-cache manifest response;
  - immutable versioned runtime files;
  - JavaScript MIME type;
  - CORS headers suitable for Shopify storefront loading;
  - blocked-version and last-known-good fallback behavior.
- Keep release notification sending manual or dry-run only at first.

Exit criteria:

- OV25 can update to a newly released package version after npm availability is confirmed.
- OV25 checks/builds pass against the released packages.
- OV25 has a committed dependency update for the release version.
- Any OV25-hosted runtime manifest endpoint is available but does not force client storefronts onto the new runtime.

Explicitly out of scope for Phase 2:

- Shopify theme/app deployment.
- WooCommerce release execution.
- Automatic broad client notification sending.

### Phase 3: `shopify-plugin` and `ov25-woo-extension`

Goal: update the storefront integrations after the package and OV25 foundations are stable.

`shopify-plugin` scope:

- Introduce the minimal Shopify shell context object.
- Keep the Shopify app extension shell as behavior-free and backwards-compatible as possible.
- Add theme-level runtime settings:
  - `runtime_mode`: `latest` or `version`;
  - `runtime_version`: used when `runtime_mode` is `version`.
- Extract the Shopify adapter/runtime behavior from `ov25-configurator.js`.
- Move Shopify-specific mapping into the versioned adapter:
  - metafield parsing;
  - selector resolution;
  - Snap2 and bed-configurator handling;
  - `injectConfigurator` option mapping;
  - cart properties;
  - checkout interception;
  - invoice requests.
- Keep `injectConfigurator` platform-neutral. Do not add `shopifyContext`.
- Load the selected versioned runtime from the manifest.
- Support pinned versions and client-selected `latest`.
- Add runtime fallback handling for unavailable or blocked versions.
- Add Shopify runtime tests for standard, Snap2, bed configurator, old/new metafield shapes, missing data, unknown fields, `latest`, pinned versions, manifest fallback, and blocked-version fallback.
- Move clients to the Shopify shell/runtime loader only after staging-theme validation.

`ov25-woo-extension` scope:

- Update dependencies to the released `ov25-ui`, `ov25-ui-react18`, and `ov25-setup` versions where applicable.
- Run WooCommerce build/type checks.
- Prepare WooCommerce release artifacts.
- Keep WooCommerce release execution manual and user-approved.
- Document rollback and compatibility notes in the release artifacts.

Exit criteria:

- Shopify staging themes can test a specific new OV25 runtime without changing the live theme.
- Live Shopify themes can remain pinned to a known-good runtime.
- `latest` is opt-in and can be rolled back through the manifest.
- WooCommerce artifacts are prepared from the released package versions.
- No automation deploys Shopify apps or pushes WooCommerce releases without explicit user action.

## Non-Goals

- Do not make AI publish packages.
- Do not make AI deploy Shopify apps.
- Do not publish packages from local release scripts.
- Do not put Shopify-specific context into `injectConfigurator`.
- Do not rely on Shopify app versions as the client-facing staging mechanism.
- Do not auto-push Shopify client app changes to live stores.
