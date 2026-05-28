---
name: ov25-release-review
description: Run the manual OV25 release review flow before testing or deployment. Use when the user says /release-review, asks for a release review, patch notes, developer summary, client release email, breaking-change review, or wants release artifacts generated for ov25-ui, ov25-ui-react18, ov25-setup, OV25, Shopify, or WooCommerce updates.
---

# OV25 Release Review

## Purpose

Generate the pre-release review artifacts in `releases/<version>/`:

- raw git/package context from `npm run release:review`;
- `patch-notes.md`;
- `developer-summary.md`;
- `client-email.md`.

This is the only AI-controlled release step. After this, the user reviews the artifacts and manually runs test/deploy scripts.

## Hard Rules

- Never run `npm run release:test`, `npm run release:deploy`, `npm run publish:*`, `npm publish`, Shopify deploy, WooCommerce release, git tag, git push, or any deploy/publish command.
- Never bump versions, edit lockfiles, commit, tag, push, publish, or deploy.
- `npm run release:review` is allowed because it only collects context.
- If no reliable release base exists and the user did not provide `--since`, stop and ask for the comparison ref.
- Do not let the Node script classify files or risks. The AI agent owns classification and artifact writing.
- Do not claim tests passed unless they were run in the current session or the user provided evidence.

## Command Shape

Preferred user prompt:

```text
/release-review --bump patch --since <git-ref>
```

Equivalent prompts:

```text
Use $ov25-release-review for a patch release since <git-ref>.
Create release review artifacts for a minor release since <git-ref>.
```

If bump is missing, ask for `patch`, `minor`, or `major`.

## Workflow

1. Run the context collector from the `ov25-ui` repo root:

```bash
npm run release:review -- --bump <patch|minor|major> [--since <git-ref>] [--head <git-ref>]
```

Use `--force` only if the user explicitly wants to overwrite an existing `releases/<version>/` context.

2. Read `releases/<version>/context.json` and `context.md`.

3. Inspect the generated raw artifacts:

- `commits.txt`
- `changed-files.txt`
- `diff-stat.txt`
- `diff.patch`

Also check the current working tree directly with `git status --short`. The context collector may show the status in `context.md`, but it should not create separate working-tree status or diff artifact files.

4. Inspect relevant source files and diffs. Focus on:

- public exports and types;
- `injectConfigurator` options, callbacks, payloads, and `cssString`;
- DOM/HTML structure, ids/classes/data attributes, CSS variables, and shadow-root behavior;
- Shopify metafields, cart properties, checkout/invoice flow, Snap2, and bed-configurator behavior;
- WooCommerce integration payloads and dependency usage;
- `ov25-setup` payloads and saved config compatibility;
- OV25 app imports and configurator payloads;
- release/package automation.

5. Check docs coverage in `../ov25-docs` when the repo exists.

- Inspect `git status --short` and recent commits.
- Search docs for the release's features and improvements.
- For every feature/improvement in patch notes, record one of:
  - `Docs updated`: linked docs change exists in `ov25-docs`;
  - `Docs needed`: feature/improvement should be documented before or with release;
  - `Docs not needed`: explain why, usually invisible bug fix or internal-only behavior;
  - `Not previously documented`: feature area lacks docs; create or update docs if client/developer-visible.
- If `../ov25-docs` is missing or unreadable, state that docs coverage could not be verified.

6. Check integration adapter coverage in `../shopify-plugin` and `../ov25-woo-extension` when those repos exist.

- Inspect `git status --short`, relevant package manifests, and recent changes.
- Search adapter repos for new `ov25-ui` feature/config/payload names.
- For every feature/improvement that affects `injectConfigurator`, setup payloads, metafields, cart/checkout payloads, DOM/CSS selectors, or runtime mode selection, record whether each adapter needs:
  - no change;
  - dependency-only update;
  - config/metafield/admin setting pass-through;
  - runtime adapter mapping;
  - cart/checkout payload handling;
  - theme/CSS selector guidance;
  - explicit testing before automatic rollout.
- Examples:
  - If `ov25-ui` adds `stringReplacements`, verify Shopify and WooCommerce pass it through from saved config/metafields to `injectConfigurator`.
  - If `ov25-ui` adds dining options, verify plugin product-link/admin settings/runtime mapping are present or explicitly mark follow-up needed.
  - If payload shapes change, verify WooCommerce cart mapping and Shopify cart/checkout mapping still work.
- If a repo is missing or unreadable, state that adapter coverage could not be verified.

7. Apply the compatibility checklist from `docs/skills/ov25-compatibility-guard/SKILL.md`.

8. Check runtime fixture/test coverage in `dev/react-test`.

- Inspect `dev/react-test/tests/` and related e2e files under `test/e2e/`.
- For every major feature or improvement in patch notes, record whether there is a representative `react-test` fixture or e2e route/test.
- Treat these as coverage signals, not proof that tests passed. Do not run tests unless the user explicitly asks.
- If a major feature has no `react-test` coverage, call it out in `developer-summary.md` as a follow-up or release risk.
- Examples:
  - `stringReplacements` should have a fixture that passes replacement config and shows changed visible copy.
  - Dining configurator changes should have a dining fixture/route.
  - Carousel interaction changes should have a fixture/e2e test that exercises product image carousel behavior.
  - Snap2 or bed-configurator changes should have matching fixtures for those product types.

9. Write these artifacts:

- `releases/<version>/patch-notes.md`
- `releases/<version>/developer-summary.md`
- `releases/<version>/client-email.md`

Use `apply_patch` for artifact writes. Do not edit `CHANGELOG.md`.

## Artifact Requirements

### patch-notes.md

Client/user-facing. Include:

- release version and bump type;
- customer-facing changes split into `Features`, `Improvements`, and `Bug Fixes`;
- visible behavior changes;
- known issues or manual testing notes;
- developer/integrator notes for `ov25-ui`, Shopify, and WooCommerce where relevant.

Customer-facing changes must be written as user/feature outcomes, not implementation details.

For new features, add a link to the relevant `ov25-docs` page when one exists or was added during the review. Use normal Markdown links to the published docs path, for example:

```markdown
- Added configurable text labels across the OV25 configurator. See [String Replacements](/docs/developer/ui-package-integration#string-replacements).
```

If no suitable docs page exists for a new feature, do not invent a link. Leave the patch note unlinked and call out the missing docs in `developer-summary.md`.

Use this structure:

```markdown
## Customer-Facing Changes

### Features

- ...

### Improvements

- ...

### Bug Fixes

- ...
```

Use wording like:

- "Improved mouse interaction with the product image carousel."
- "Improved mobile Snap2 and configurator controls."
- "Added configurable text labels across the OV25 configurator."

Avoid wording like:

- "Allowed small pointer movement before treating a click as a drag."
- "Added `stringReplacements` to runtime copy."
- "Changed variant card color from hardcoded black to `--ov25-text-color`."

Keep technical details in `developer-summary.md` or the developer/integrator notes section.

### developer-summary.md

Developer-facing. Include:

- status: `Draft, not approved`;
- release version, bump, base, head, and generated context timestamp;
- links to generated artifacts and raw context files;
- explicit note that no release action has happened;
- changed packages/files;
- high-level breaking-change verdict and downstream impact summary;
- implementation summary;
- API/payload/runtime/DOM/CSS/Shopify/WooCommerce/OV25 compatibility analysis;
- integration adapter coverage for Shopify and WooCommerce, including missing updates or version-sync issues;
- documentation coverage for every feature/improvement, including whether `ov25-docs` was updated or needs updating;
- runtime fixture/test coverage for major features, including whether `dev/react-test` has a representative fixture or e2e route/test;
- dirty workspace status, including any uncommitted or untracked files that could affect the release review or block deploy;
- breaking-change assessment;
- migration notes;
- expected tests before deploy;
- follow-up tasks that should not block release;
- next step: user reviews artifacts, then manually runs `npm run release:test` if approved.

### client-email.md

Draft email only. Include:

- subject;
- short summary;
- relevant fixes/improvements;
- compatibility and rollout notes;
- Shopify staging/live version-selection instructions;
- rollback instruction;
- placeholders for recipients/client names.

## Final Response

Report:

- generated artifact paths;
- base/head used;
- whether any breaking-change or compatibility risk needs review;
- that no test/deploy/publish action was run.

End with:

```text
Compatibility: preserved
```

or a specific compatibility risk note.
