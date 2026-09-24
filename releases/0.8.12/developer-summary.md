# Developer Summary: ov25-ui@0.8.12

Status: Approved
Approved by release owner on 2026-09-24 for source `ba02776042e7`, retaining the requested patch version `0.8.12`. Approval does not replace the outstanding registry/remote checks or constitute evidence of downstream deployment.
Reviewed scope refreshed after the committed layout fixes and successful full release test run.
Bump: patch, per requested version `0.8.12`
Base: `ov25-ui@0.8.11` → commit `51ec3914ee4997bb06470cfc1bfcdf98b61d7b1a`
Head: `ba02776042e7e158ff678d9f66b656525f9750ee`
Context generated: 2026-09-24T12:45:15.474Z

No version bump, commit, tag, push, publish, or deploy was performed during this review. No tests were rerun during artifact generation; test evidence is the user's completed run.

## Review Materials

- [Patch notes](patch-notes.md), [draft client email](client-email.md), [test summary](test-summary.md).
- [Context](context.md), [machine-readable context](context.json), [commits](commits.txt), [changed files](changed-files.txt), [diff statistics](diff-stat.txt), [raw diff](diff.patch).

## Scope And Implementation

### Group headings and mobile spacing

List and tab headings now render enabled group upgrade prices on desktop and mobile, including named labels for filtered single-group views. Existing hidden defaults, string replacements, unavailable-price suppression, hidePricing, and Snap2 handling remain.

Wizard and guided-overview options now use the shared grouped renderer, with sticky group names and prices beside the matching cards. Names remain visible when prices are hidden. The size grid and Snap2 module path retain their existing rendering; empty or not-yet-loaded groups are omitted. Selection payloads and lazy loading are covered by regression tests. This is a user-requested visible layout change from the previously flat wizard grid.

Grouped wizard scroll containers omit top padding, eliminating the 16px gap above sticky headings. Shared sticky option/group headers paint a 1px strip above their edge to cover fractional-pixel seams without changing sticky offsets or the inline list's existing gap cover. The user confirmed the mobile appearance after these fixes.

Checkout clearance is reserved for the overlapping mobile drawer footer. Sheets and modals with separate footer rows no longer count that space twice; duplicate outer tree/accordion/tab padding is removed. The drawer retains its clearance. Wrapper regression tests cover drawer, sheet, and modal cases. Prior browser inspection confirmed final cards remain reachable without the large blank area.

The variants-per-row regression test now checks wizard delegation to the grouped renderer, where the shared grid hook is rendered. This changes the test assertion only.

The comparison contains 30 changed files. Runtime changes cover group-price rendering, grouped wizard headings, sticky seams, checkout spacing, optional context/group types, four registered string definitions, and an opt-in CSS display hook. Remaining changes cover fixtures, tests, documentation, and release tooling.

`Group.priceSummary` accepts `totalPrice`, optional `upgradePrice`, `currency: 'GBP'`, and `isFrom`. Amounts are integer pence. The producer supplies the whole-product total and the upgrade over the cheapest available group in the same option. The UI displays only finite positive upgrades; absent summaries, missing upgrades, zero/negative values, and non-finite upgrades produce no element. The current selection does not establish the comparison baseline. The documented producer contract omits uncertain baselines and excludes the ungraded Other bucket.

`.ov25-group-price` has `data-price-pence` (upgrade), `data-total-price-pence` (full total), and `data-price-from`. Labels are hidden by `display: var(--ov25-group-price-display, none)`. Custom CSS can opt in within the existing shadow root. New spans are added beside headings/controls, or as named labels where headings are absent. Existing hooks remain, but positional selectors should be checked because inserting hidden elements can still affect child-index selectors. Wizard now creates a grid per group instead of one flat grid; custom direct-child selectors, grid placement rules, and styles targeting the old nesting require theme verification. The shared grid hook is retained on each group grid.

All owned label fragments use registered replacements: `groupPriceTotal`, `groupPriceFromTotal`, `groupPriceInline`, and `groupPriceNamed`. The existing currency-symbol setting changes display only, not currency conversion. `hidePricing` and Snap2 suppress rendering; bed exclusion depends on the producer not supplying summaries.

Release tooling now builds React 18 in an isolated temporary copy of current source, including uncommitted/non-ignored new files. Its result is part of `release:test`, including with `--skip-e2e`; failures fail the gate. The temporary copy is removed on normal success/failure. The main dependencies remain intact. The tooltip E2E test now uses a controlled clock to remove a wall-clock timing race; runtime tooltip code is unchanged.

Setup manifest and lockfile changes in the range are the prior `ov25-setup@0.8.11` finalisation commit. There are no new Setup source or saved-payload changes. The coordinated release will eventually update UI, React 18 UI, and Setup to the same version through the existing release process.

## Compatibility And Downstream Review

No breaking API change identified. Package-root exports, required options, callback timing, commerce/SKU/price payloads, saved Setup data, existing selector names, and CSS injection/scoping are unchanged. `GroupPriceSummary` is not a new package-root export. Older producer payloads remain accepted and simply produce no upgrade label. Checkout, invoice, cart properties, Shopify metafield names, and configurator identifiers are unchanged in this UI diff.

| Consumer | Evidence and required action |
| --- | --- |
| OV25 | Clean local HEAD `bac8dcf5982c`. Local producer files `lib/pricing/standard-group-totals.ts` and `hooks/iframe-configurator/useIframeMessaging.ts` calculate and forward summaries. UI, React 18 UI, and Setup dependencies are `0.8.11`. Update dependencies and verify production producer support; local code is not deployment evidence. |
| Shopify | HEAD `33eefe9b6311`; dirty `pnpm-lock.yaml` is outside this review. `extensions/ov25-configurator/assets/ov25-configurator.js` forwards `branding.cssString` and top-level `stringReplacements`. Runtime dependency is `ov25-ui-react18@0.8.11`. Dependency/build/deploy update plus CSS opt-in required; no new admin/metafield or commerce mapping required. Test on an unpublished theme before live rollout. |
| WooCommerce | HEAD `1de7294cfd77`; committed UI, React 18 UI, and Setup dependencies remain `0.8.1`. Committed `src/frontend/index.ts` forwards saved config excluding selectors/callbacks and supports custom CSS, so the two customization channels already pass through. Numerous local admin/frontend/PHP/type/test changes and a modified manifest are uncommitted; they are not release-approved here. Review the larger dependency jump and that independent work before packaging. |
| Setup | Exact local UI dependency `0.8.11`. Existing custom CSS and text overrides provide configuration channels. After coordinated publication, verify the editor exposes the new string definitions from the updated dependency. No payload migration required. |

No store needs to enable group labels immediately. Older UI builds without this feature continue their existing behaviour. Do not interpret missing price summaries as zero. No automatic downstream rollout is approved by this packet.

## Documentation And Fixture Coverage

- **Group upgrade labels and customization — Docs needed:** repository documentation exists at [group-total-prices.md](../../docs/group-total-prices.md), but no group-price coverage was found in the clean `ov25-docs` checkout at `1e202f98f090`. Its existing `content/docs/developer/ui-package-integration.mdx` documents generic CSS/text customization only. Add opt-in CSS, four keys, cheapest-group semantics, unavailable-data behaviour, and supported product types before or with feature rollout.
- **Automatic React 18 preflight — Docs updated:** [release runbook](../../docs/release-runbook.md) describes the automatic step and diagnostic command. Public client documentation is not needed for internal release tooling.
- **Grouped wizard headings — Docs needed:** document grouping/sticky headings for wizard and guided-overview alongside group-price customization, including the custom-selector impact.
- **Sticky seams and footer spacing — Docs not needed:** visual bug fixes with no new configuration.
- **Tooltip and grid-hook test stabilization — Docs not needed:** no product behaviour change.
- Representative fixtures: `single-with-groups.jsx` uses standard product `1682`, a dev retailer key, and CSS opt-in; `single-custom-css.jsx` uses styled price badges through shared branding CSS; `string-replacement.jsx` supplies all four replacement keys. Ensure CSS visibility is enabled when manually checking string replacements.
- Focused `group-price.test.tsx` covers live updates, missing/invalid/zero upgrades, minimum/named formatting, currency symbol, hidePricing, and Snap2. No dedicated group-price assertions were found in browser/E2E tests. Existing fixture presence and a green suite do not replace visual/producer accuracy checks.

## Tests And Frozen State

The verified [test summary](test-summary.md) ran from **2026-09-24T12:40:04.368Z** to **2026-09-24T12:43:57.417Z**, status **passed**. It includes type checking, unit tests, browser/component tests, React 19 build, isolated React 18 build, Setup frozen install/build, react-test build, and Playwright E2E. The user confirms the run followed the final test-fix commit. The report does not embed a Git SHA; the tested-head association relies on that user confirmation and the clean tracked source at review. Frozen source HEAD is `ba02776042e7e158ff678d9f66b656525f9750ee`, matching the locally recorded upstream ref. No tests were rerun during this artifact refresh.

Only the earlier draft and release artifacts were untracked in the UI repository. Keep release artifacts separate from unrelated downstream changes. No v0.8.12 package tags exist locally. Fresh GitHub remote-head/tag and npm-version checks failed because DNS could not resolve github.com or registry.npmjs.org. Remote push state and availability of all three target versions remain unverified; check them before publishing. Live local status and HEAD were rechecked in all five repositories; downstream HEADs and dirty-file scope remain as recorded above.

## Rollout Checks And Recorded Limitations

1. Confirm group-price correctness with production producer data, including tied cheapest groups, varying totals, discounts, availability/rule changes, and unknown baselines.
2. Check hidden defaults, enabled labels, custom text, and mobile/desktop layout across list/tree/accordion/wizard/guided overview; verify shadow-root styling and any positional theme selectors. Confirm hidePricing, bed, and Snap2 behaviour.
3. Cover the feature in public docs and validate Shopify theme/Setup preview and relevant cart paths. Resolve WooCommerce rollout scope independently of this UI release.
4. Confirm target-version availability on npm and remote tags before release. Check supported Node/npm/Bun paths: this session's system `npm` failed before the collector started, so the identical collector was invoked directly with Node. The user's supported toolchain completed the release test successfully.
5. Version classification: the compatibility guide normally calls additive features a minor release. This packet retains the user's explicit `0.8.12` target; acknowledge that classification choice during approval.

Non-blocking cleanup: the CSS comment says group prices are visible by default although the actual default is hidden. The repository release-review skill still describes React 18 as a manual step; the current runbook and passing report supersede that outdated guidance.

## Next Step

The release owner approved this packet on 2026-09-24. Complete final registry/remote preflight, then run the user-owned release command `npm run release:deploy -- --release 0.8.12 --push`. It publishes through tag-triggered workflows. Downstream rollout checks and documented limitations remain applicable.

Compatibility risk: APIs and commerce payloads remain compatible; wizard/guided-overview now use grouped DOM and sticky headings by default. Verify custom theme selectors before rollout, together with production group-price data.
