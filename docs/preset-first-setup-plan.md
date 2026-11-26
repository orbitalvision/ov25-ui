# Preset-first OV25 setup with client-site previews

Status: implemented on feature branches with draft pull requests in all three repositories (orbitalvision/OV25#530, orbitalvision/ov25-ui#11, orbitalvision/shopify-plugin#4); the most recent work is still uncommitted in the local checkouts. Development-store testing is under way on the dev retailer apps. Nothing has been released to production or deployed to a client store.
Last updated: 20 November 2026.

This is the master plan for changes across `ov25-ui`, `OV25`, and `shopify-plugin`. It supersedes the earlier live-preview branch proposals. The separate root `plan.md` remains the responsive-layout plan.

## Current state — 20 November 2026

The Shopify portal no longer walks merchants through the picker flow in the Summary below. It uses a two-step **guided setup**: **Choose theme** (copy or confirm a theme, activate the app embed, prepare the OV25 product template, product blocks, cart and checkout, and the OV25 Test Product), then **Automatic setup**. Each type starts from the In-page preset, Match my site runs automatically and applies straight to the draft with Undo, and the step is preview-first. The preset picker, Match my site and the editor described below remain the Advanced setup and non-Shopify path. The guided flow, its constraints and its "remove before release" list are in `OV25/docs/shopify-guided-setup-handoff-2026-10-29.md`.

Added since 20 October (details in that handoff):

- 29 October: the palette review screen and the placement review were removed. Only high-confidence placement suggestions on new setups, or theme overrides on a non-live theme, apply automatically. Sections below that describe those review screens are kept as history.
- Theme preparation and theme copying, cart and checkout preparation, the OV25 Test Product, Link Products assigning the OV25 template, and Go live theme publishing.
- Local storefront verification and **Ask for changes**: a sandboxed browser checks the storefront, and the agent can apply CSS or theme edits. It runs only on the local development server (see Release blockers).
- Dev-store plugin builds are made from the local `ov25-ui` working tree and registered as `OV25/lib/shopify/runtime-builds/demo-local-vN.json`. The current prepared build is v25 (`shopify-16ec54f6dc33bfca955a0b7c`); see `shopify-plugin/DEV-STORE-DEPLOY.md`.
- 20 November fixes, found in dev-store run-throughs and not yet retested there:
  - Shopify can serve the old theme file for a few seconds after accepting a write. Theme writes now wait for Shopify's write job, and guided setup re-checks for up to 15 seconds before showing a manual fallback card such as "Product options".
  - Browsers pause a background tab's animation frames, so a preview reloaded behind setup cannot mount until it is viewed. The plugin now counts its 25-second mount timeout only while the preview tab is visible, and setup no longer says "the storefront may need a plugin update" while a loaded tab is still mounting. The plugin part ships in v25.
  - The activation step's demo video now waits for the loading overlay to clear.

## Shopify theme integration update — 20 October 2026

The production Shopify portal now wires **Match my site** through `useConfiguratorThemeStyling` and the authenticated `/api/shopify/configurator-theme` endpoint. This completes the host integration described as pending in the historical local-review sections below; matching real stores has not yet been tested.

- Reads the published theme and the preview product's actual assigned template, falling back to the default product template only when no product is selected. Theme source remains read-only; setup never invokes the patcher.
- Shares bounded source downloads between separate colour and selector analyses. A placement-analysis failure leaves the palette usable. Shopify source provenance is accepted by setup; remote font files are not downloaded and typography limitations are shown.
- Direct keyed metafield reads classify existing/default/product/legacy settings. Persisted empty values count as existing; failed or incomplete reads stay unknown. Only confirmed absence permits automatic inclusion of untouched placement defaults, and all changes still wait for Apply to draft and Save.
- Tracks manually changed or cleared host integration fields, keeps product editors' global fields read-only, and rechecks source/saved-state identities before and after AI analysis. Target changes cancel pending requests; stale contexts require retry.
- Requires the connected store's `read_themes` or `write_themes` scope. Uses the existing Gemini configuration. Local tests mock both Shopify and AI; no live stores or production database were contacted.

Remaining release work is tracked under Validation and rollout (status, release blockers and rollout order, updated 20 November). *Superseded:* password-protected storefronts no longer simply fail the anonymous preflight. It reports that the store needs unlocking, and preview support is checked after the merchant enters the password in the preview tab. As of 20 October, accepting a verified Shopify visitor preview link was a proposed dev-store follow-up and had not been implemented.

## Summary

Replace the initial settings editor with four presets per product type: Standard, Snap2, and Bed.

**Choose product type → Choose a preset → Match my site (optional) → Preview & edit → Save**

Users can edit settings or change presets at any time. The preset and colour-matching steps fill the setup surface; the embedded product demo appears only after these choices. Returning configured users see their current configuration summary. Shopify also has an optional **Preview on your site** action after the initial steps.

OV25 is deployed centrally, while clients adopt Shopify-plugin and its bundled UI updates at different times. A central deployment must not require a client plugin update. Unconfirmed plugin versions use a fixed current-feature baseline, as described below.

## Presets and editing flow

| Preset | Standard / Bed: desktop → mobile | Snap2: desktop → mobile | Options |
|---|---|---|---|
| **In-page** | Sticky inline → sticky inline (Bed matches Standard since 20 Nov) | Inline → inline | Standard/Bed: list; Snap2: accordion |
| **Fullscreen** (Standard) / **Classic** (Snap2, Bed) | Sheet → drawer | Modal → drawer | Tree desktop, list mobile |
| **Guided** | Modal → modal | Modal → modal | Wizard |
| **Overview** | Sticky inline → sticky inline | Inline → inline | Guided overview |

- Bundle complete, versioned JSON settings for each preset/type combination, with stable IDs, names, descriptions, and independently cloned values. Use the existing product-type defaults for unspecified settings and neutral styling throughout.
- For Standard only, In-page is first and most closely resembles a normal product page, with options alongside the product. Fullscreen is second: clicking a button opens the configurator in fullscreen, using `sheet` on desktop and `drawer` on mobile. Its internal `classic` ID is retained for existing local drafts. Snap2 and Bed retain their original order, names and descriptions: Classic, In-page, Guided, Overview.
- Fullscreen/Classic retains current gallery defaults. In-page and Guided use carousels; Overview uses stacked desktop images and a mobile carousel. Snap2 modal presets omit the in-page gallery.
- All presets enable automatic cutouts and allow up to 10 gallery images on both desktop and mobile. Setup's default image limits are also 10; loading an existing configuration preserves its explicit saved values.
- Applying a preset affects only the selected product type. Other types remain unchanged and need no preset selection before saving.
- Presets replace gallery behaviour, configurator presentation, layout dimensions, element styles, and custom CSS. Retain semantic colours, fonts and button styling, including theme matches and later manual edits, even after importing saved runtime JSON without local provenance. Retain existing selectors, logos and logo visibility, text replacements, hidden-option rules, flags, bed rules, and Snap2 starting-configuration settings. Fresh setups receive complete preset defaults.
- Host-owned Global settings remain separate and are never reset by preset selection.
- Add catalogue completeness checks so newly introduced settings cannot silently drift between presets. Future settings must also be assigned compatibility requirements before inclusion.

Show four accessible cards in a full-width 2×2 desktop grid, stacking them on narrow screens. Enlarge the existing schematic thumbnails; the media area can later hold improved images or videos. Highlight In-page initially for Standard and Classic for Snap2/Bed, without applying it. Browsing computes a candidate using the same preservation rules as application, without changing the draft. Do not mount the product iframe or show the host preview toolbar during this step.

**Use preset** applies the candidate and opens the full-width **Match my site** step when the host provides theme analysis. Users can request a palette, review it inline, and apply it, or skip/keep their existing colours. Both paths lead to the summary containing the preset name, key settings, preview, and **Save**, **Edit settings**, and **Change preset** actions. Hosts without theme analysis go directly to this summary. Confirm before replacing customised presentation settings, explicitly including custom CSS. Cancelling restores the existing draft; changing product type discards an uncommitted candidate.

Retain the existing Settings, Style, and Global editor, with a return-to-summary action. Stack controls and preview on narrow screens and preserve keyboard accessibility.

## Embedded demo

- Reuse the existing preview iframe and desktop/mobile toggle.
- Polish framing, spacing, product-type-specific copy, and coherent demo-product imagery in setup and the existing OV25 preview page.
- Stabilise configuration memoization to avoid unrelated reloads. Retain iframe remounts when effective configuration or device changes: the existing preview page injects once per mount.
- Provide loading, failure, and retry states; preview failure does not block saving compatible settings.
- Preserve host product/API overrides and exclude demo assets from exported settings.
- In the Shopify host, resolve an organisation product separately for Standard, Snap2 and Bed. Prefer the selected Shopify product's accessible OV25 link, then another linked Shopify product of that type, then an accessible, renderable OV25 catalogue entry. If no suitable product/key exists, retain that type's original bundled demo and its matching demo API key.
- Read `ov25.configurator_api_key` from the shop and validate it against the effective organisation's public configurator keys. If it is missing or stale, reuse an existing public key belonging to the organisation; do not create keys or update Shopify metafields. Resolve retailer-facing product/range IDs rather than raw manufacturer IDs.
- The authenticated `GET /api/shopify/configurator-demo` endpoint returns per-type preview identities and optional images. Shopify discovery uses the linked-product metafield filter with pagination, a 15-second deadline and a 1,000-product bound; provider failures or exhausted discovery fall back to the accessible OV25 catalogue. Always validate actual returned links because filtering may not be enabled on older stores.
- Pass paired `apiKey`/`productLink` maps and `previewImages` to setup. Async preview resolution must not reset unsaved edits or change the save target. Custom products must not inherit sample sofa/bed images or the demo-only Snap2 configuration UUID. Preview keys, product IDs and images never enter saved settings.
- A successful embedded demo does not prove compatibility with a client's installed runtime or theme; apply the compatibility rules separately.

## Shopify site preview

### Setup interface and host responsibilities

- Add an optional `livePreview` prop based on the unfinished branch interface: `onRequest({ payload, activeLayout })`, host-controlled status/message/disabled state, and optional action label.
- Setup supplies the exact unsaved configuration after the initial choices. The site-preview action and host preview toolbar are shown only on the summary and editor, and use the current draft.
- Provide explicit **Open site preview** and **Update site preview** actions, independent of Save. Prevent concurrent requests. Automatic draft updates and an on-site preset toolbar are deferred.
- Shopify owns product selection, session transport, window handling, readiness, and error reporting. Hide the action in hosts that do not provide the capability. Check the selected product’s rendered build metadata before enabling Open site preview; show checking, unsupported and unverified states with Retry check. Only a fresh, recognised preview-capable build permits opening a tab.
- Keep the preview product separate from the save target. Store-default settings can be previewed on a selected compatible product without creating product-specific settings.
- Automatically select the matching Shopify product from embedded-demo discovery for the hydrated Standard/Snap2/Bed type. Prefer the edited product when eligible, then another accessible linked product published on the online store. Only a real published Shopify page can be a live target; OV25-only/demo fallbacks keep live preview unavailable. The automatic embedded and live choices match, except that an explicit unpublished embedded selection can retain its own product while live preview uses another eligible page.
- Setup reports its effective type through optional `onPreviewLayoutChange`, after draft hydration and on later changes. The host scopes auto selection, preflight and manual overrides to the current store/editing target and type. Automatic discovery selects and checks a product; it never opens a tab.
- Keep the preview product picker available while editing Default or product settings. A manual choice takes precedence per type until cleared with **Use automatic product**. Validate that choice is accessible, published and linked to the current configurator type before allowing live preview; an invalid manual choice is explained rather than silently replaced. Switching preview products does not remount the settings editor or change where Save writes.
- Combine the configuration draft with the host's unsaved Global settings. Preview overrides must take precedence over saved product-specific settings for that session.

### Session and storefront behaviour

Create short-lived preview sessions scoped to the selected shop, product, and product type. Authenticated host operations create and update sessions; the storefront receives a narrowly scoped token, never an Admin API credential. Sessions expire after 30 minutes of inactivity and are invalidated when their target changes. Readiness polling must not extend an abandoned session indefinitely.

The updated Shopify extension reads the session before normal configurator injection and applies it only in that preview tab. The host puts the token and API origin in URL fragment parameters (`#ov25_preview=…&ov25_preview_api=…`) so Shopify page requests and referrer headers do not receive the token. An explicit update advances the session revision; the tab detects it and reloads the page to initialise a single configurator with the latest settings. Reuse the tab where possible and open it directly from the user gesture to avoid popup blocking.

Display a preview-mode indicator and exit action. Disable OV25 purchase callbacks in preview mode. Missing, expired, or unsupported sessions show an explicit failure rather than presenting saved settings as a successful draft preview. Ordinary shopper visits continue using saved settings.

Opening a storefront tab is not a successful preview. The host must receive a valid handshake identifying the loaded build and supported preview-protocol version, followed by acknowledgement that the requested session revision was applied. Preflight prevents opening a tab when preview support cannot be verified. If deployment or execution changes after preflight, an old plugin may still ignore the preview link; OV25 must report that draft preview was not confirmed. Leave the embedded demo and normal editor available.

## Backward compatibility and build identification

### Automatic build reporting

- Add a unique, immutable build identifier to the Shopify runtime as part of this feature. Generate it at build time and bind it to that artifact's plugin source, resolved dependencies, and bundled `ov25-ui-react18` version.
- Generate a release manifest mapping the build identifier to its UI version, tested feature support, and preview-protocol support. Maintain this mapping per release, not per client.
- Report the identifier from the JavaScript actually loaded on the storefront, through the compatibility/preview handshake. Do not infer the storefront version from OV25's installed package version or from a merely intended deployment.
- The extension package currently uses `version: "1.0.0"`; this unchanged value is insufficient for identification. Use the generated build identifier, not that existing value alone.
- OV25 may automatically cache observations scoped to the relevant shop and theme, but no manually maintained client deployment list is required. A fresh handshake takes precedence over cached observations, including after rollback.
- Version the reporting and preview protocols explicitly. Future central releases must continue supporting earlier preview-capable clients, with additive changes or negotiated protocol versions.

### Fixed baseline for unconfirmed versions

The user confirmed on **29 September 2026** that all clients are up to date with all major features available today. Therefore, when the plugin does not report a build identifier, assume support for the fixed feature baseline **`legacy-2026-09-29`**.

This is a feature-support assumption, not a claim that every client runs an identical patch or build. Reference source snapshots when constructing and testing the baseline:

- `ov25-ui`: version `0.8.13`, commit `2442d94a1bcdb57f7dcfdfcf854a3c859869ddd9`.
- `shopify-plugin`: commit `b9b56caa5c21f061ea744acfe1da8af7beceaa7e`, with `ov25-ui-react18` pinned to `0.8.13` in the configurator extension.

The baseline includes the existing layouts, variant presentation modes, and other settings used by the four proposed presets. All four presets per product type can therefore be applied and saved on unconfirmed installations; lack of reporting alone must not block them or the existing editor/save flow.

The baseline is frozen. It does not advance when OV25 deploys, when new UI features are released, or when the calendar date changes. Newly introduced features require a recognised supporting build. A reported but unrecognised build receives only baseline assumptions until its release manifest is known. A recognised build uses its actual tested support, including any known limitations.

**Site preview is a new feature outside this baseline.** Do not infer support for build reporting, preview sessions, or preview protocols from the user's statement about existing major features. Actual site preview requires a positive preflight from the selected product’s rendered build marker, then the new handshake and revision acknowledgement. Unknown builds, missing markers, password/challenge pages and failed reads leave the site-preview action disabled with a retry action. These states must not be mistaken for evidence against the client’s existing layout features. Metadata is generated with the exact runtime bundle, matched to OV25’s trusted release catalogue and checked against shop/product identity; no client deployment list is maintained. Setup results expire after 60 seconds, and the server rechecks before creating or updating a session.

### Preset compatibility checks

- Derive required features from the effective settings produced by the preset, including retained customisations, and compare them with the recognised build's support or the frozen baseline.
- Account for both the Shopify adapter and bundled UI. UI support alone is insufficient if the adapter does not pass a setting through.
- Validate on preset application and saving newly selected features. Explain specific unavailable features; do not silently rewrite a preset into a different experience.
- Preserve the existing configuration path. Compatibility gating must not newly prevent legacy users from retaining or saving their already-supported settings, and missing reporting does not justify destructive normalization.
- Keep saved JSON and Shopify metafield formats backward compatible. Build identifiers, feature requirements, and preview-session data stay outside runtime settings JSON.
- Do not automatically change client plugin versions, UI versions, or stored configuration during the central rollout.

## State, interfaces, and repository responsibilities

- Preserve `ConfiguratorSetupPayload`, `initialConfig`, `onSave`, export formats, and existing default-payload helper behaviour.
- Store preset identity/version and per-type setup progress as optional local draft metadata outside runtime JSON. Legacy configurations show "Current configuration"; do not infer a preset.
- Preserve server-config/draft hydration precedence. An untouched fresh draft reopens the picker; an incomplete theme step resumes there. Returning configured users and older drafts without theme-step metadata open the summary. Per-type `setupProgress.themeStep` is local metadata and is never exported.
- Preserve the Shopify protection against tab-focus refetches resetting drafts. Scope sessions and asynchronous responses to the current store/product target.
- Add an explicit `previewToolbar` React-node slot. Replace Shopify's DOM-query insertion of store/product controls with this supported slot.
- Honour `hidePreview`, `hideSaveButton`, host styling, and existing host-owned save behaviour.
- Register preview-session operations under appropriate Shopify configuration permissions, with documented token-scoped access for storefront reads/reporting.

| Repository | Responsibility |
|---|---|
| `ov25-ui` | `setup/` preset catalogue, picker, summary, compatibility presentation, optional live-preview interface, and toolbar slot. Shared runtime changes only if required. |
| `OV25` | Embedded demo polish, Shopify host controls, separate preview-product selection, draft combination, release compatibility lookup, session endpoints/storage, and permissions. Work extends beyond `lib/shopify/`. |
| `shopify-plugin` | Build identification and release manifest generation, loaded-runtime reporting, preview-session support, draft override precedence, revision handling, and preview UI. |

### Earlier work reviewed

- `ov25-ui` branch `codex/shopify-live-preview-setup`, worktree `.worktrees/ov25-ui-shopify-live-preview`, contains uncommitted live-preview types, Open/Update actions, pending/error handling, and browser tests. Reuse these ideas selectively against current code.
- The reviewed `OV25` branch `codex/shopify-live-preview-ov25` and `shopify-plugin` branch `codex/shopify-live-preview-extension` had no uncommitted changes or commits ahead of their respective `main` branches. No completed storefront-preview connection was found.
- Existing host work already separates Global settings and protects drafts on tab focus. Preserve it.
- Do not merge the older setup worktree wholesale: it predates newer settings and hydration fixes. This plan supersedes its proposal, but does not authorise deleting branches or worktrees.

## Validation and rollout

### Acceptance tests

- Validate all twelve preset/type combinations, complete settings coverage, serialization/hydration, reset boundaries, and preservation of other product types.
- Test candidate browsing, cancellation, confirmation, editing, saving, reloads, legacy drafts, and changing `initialConfig`.
- Exercise every preset on desktop and mobile, including overlays, variant navigation, galleries, and keyboard operation.
- Test exact candidate/draft delivery to the host, independent Save and Preview actions, pending/error states, and duplicate-click prevention.
- Verify store-default previews on products with existing overrides, unsaved Global settings, target changes, tab return, popup blocking, expiry, wrong-shop tokens, unavailable runtimes, and failed updates.
- Confirm normal shopper requests remain unchanged and preview refreshes never create duplicate configurators.
- Confirm generated build IDs map to the actual bundled dependency versions, and compatibility tables are tested against the corresponding release artifacts.
- Test new OV25 with an unreported legacy build: all baseline presets and the existing save/editor flow work; site preview stays disabled unless preflight proves a recognised preview-capable build; a later applied handshake is still required.
- Test that the fixed baseline does not gain future features automatically, including when a new field is added to setup defaults or a preset.
- Test the first preview-capable release, subsequent protocol-compatible releases, unrecognised reported builds, stale cached reports, and plugin rollback.
- Do not equate feature compatibility with theme-layout correctness; verify actual client selectors and styling in the site preview.
- Run guided setup end to end for Standard, Snap2 and Bed: copied and existing themes, embed activation, automatic template and product blocks, cart and checkout preparation, the test product, automatic matching, the preview, Save, Link Products and Go live.
- Run setup type checks, relevant unit/browser tests, React 19/React 18 builds, standalone/Shopify/WooCommerce host checks, and required OV25 permission checks.

### Status at 26 November

**Automated tests.** All pass on the three branches: OV25 8,356 unit tests (after merging `main`), ov25-ui 580, the plugin 116, and the storefront probe's own 131. OV25's full type check is clean; it needs more than Node's default memory since the merge, so the `type-check` script now sets it. The setup package's browser tests and end-to-end (Playwright) tests were not re-run.

**Development store.** Guided Standard run-throughs on a dev retailer store (19–26 November) reached Automatic setup, the site preview, Ask for changes and Save. Snap2 reached its preview in a dialog. The store runs plugin v25; v28 is built and registered but not deployed (see `shopify-plugin/DEV-STORE-DEPLOY.md`).

**Not yet verified on a real store:**

- Plugin v26–v28: Snap2 previews no longer opening the dialog, Snap2 basket lines on the test product, and the empty price slot before a Snap2 dialog is opened.
- Reopening a saved type (Edit) end to end, and Match my site again.
- Bed guided setup with the In-page preset (sticky inline), and Bed visual QA. Bed fails like Snap2 did if the site match gives it no gallery placement.
- The setup assistant on production infrastructure: only unit-tested with a fake table and a fake probe (see blocker 2).
- OV25 cart pricing and checkout after cart preparation, without placing a real order.
- The dedicated fabric samples page, Go live theme publishing and template assignment from Link Products.
- The guided setup leave-page warning inside Shopify admin.
- An old-plugin store: baseline presets and Save work, and site preview stays disabled.

### Release blockers

These must be resolved before the OV25 branch reaches production:

1. **Production preview storage. Still to do (infrastructure).** The `shopify-configurator-previews` DynamoDB table does not exist yet. Its CloudFormation migration was generated on 22 October and has not been applied; see `OV25/docs/shopify-configurator-preview.md`. Neither site preview nor the setup assistant (which keeps its job records in the same table) can work in production without it. Other storage:
   - **Postgres:** no migration. The objects the branch reuses, `organizations.organization_allowances` for assistant credit and the `shopify_theme_patch_state`, `_runs` and `_files` tables for theme preparation, already exist in production.
   - **Shopify app access:** no change. The plugin branch leaves every app's access scopes as they are, so merchants won't need to re-approve the app.
2. **Storefront agent. Built 26 November; needs a real run.** Final check and Ask for changes no longer require a development server. In production each run is a record in the preview DynamoDB table and is run by the internal `POST /api/shopify/storefront-agent/process` route (started with `after()`, `INTERNAL_API_SECRET`, `maxDuration = 800`), which settles the run's cost itself and frees the organisation. Details and decisions are in `OV25/docs/shopify-guided-setup-handoff-2026-10-29.md` (26 November). Differences from the 20 November plan: DynamoDB instead of the `aiJob` Postgres table (no migration, automatic expiry, no rows in the AI tools' lists); nothing sensitive stored at all (the password and run configuration travel only in the request that starts the worker); screenshots are not kept; a final check gets 12 minutes rather than 15. Before release:
   - Confirm the production project has `INTERNAL_API_SECRET` (already used by other workers), and that the deployment's own OIDC identity may use AI Gateway and create Sandboxes.
   - Do one real final check and one chat on the test organisation, on a production domain: the assistant refuses any other host (a Vercel preview deployment included), because the storefront only accepts drafts from OV25's own origins.
   - Decide who watches for `[storefront-agent] run failed` in the logs. No alert is wired up.
3. **Development-only code. Done, except the video.** The guided dev shortcuts and the temporary AI usage logging were removed on 26 November; `rg "REMOVE BEFORE RELEASE"` finds nothing.
   - **Re-record the activation-step video** (`OV25/public/media/shopify-portal/activate-embed.m4v`) on a deployed site. It was recorded locally and shows Next.js's development badge throughout; a `BEFORE RELEASE` comment marks it in the portal page.
4. **Local plugin builds. Still to do, after publishing.** Deregister them (Rollout order, step 4). They must stay until a build made against the published `ov25-ui` exists, or the dev stores lose site preview.
5. **Merchant theme data sent to AI providers.** This is a business decision, not a code task. The note under Local source analysis records a development-time block: the coding agent's automatic review refused to send client theme snippets to Gemini without explicit approval. That was a tool restriction during development, not a decision about production use. What production does (checked 20 November):
   - **Match my site** sends theme evidence to Google's Gemini Developer API, using API keys rather than Vertex AI (model `gemini-3.1-flash-lite`; production tries up to five backup keys in other Google Cloud projects before the main one). That evidence is at most 80 KiB of styling settings and CSS rules, plus sanitised markup outlines for placements; theme copy, URLs, scripts and secret-like settings are excluded. In guided setup it runs automatically when the merchant continues to Automatic setup.
   - **Verify storefront and Ask for changes** send the merchant's request, the setup draft, up to 100 KB of the product template's theme files and storefront screenshots to OpenAI's Terra through Vercel AI Gateway, which can route each call to OpenAI, Azure or Amazon Bedrock.
   - Merchants are not told: the guided flow does not mention AI analysis or any third party.

   To decide before release:
   - Whether OV25's merchant terms and privacy notice cover sending theme data, screenshots and requests to Google and OpenAI, or whether setup needs a notice or consent step. Check what Shopify's app terms require about sharing merchant data with third parties.
   - Which Google terms apply to each Gemini key: under Google's Gemini API terms, free and paid use differ on whether content may be used to improve Google's products. Decide whether the backup keys' projects should receive merchant data at all.
   - Whether to restrict AI Gateway to zero-data-retention providers: Gateway lists zero data retention for Terra's OpenAI and Azure endpoints, not Bedrock.
6. **Findings from the 6 October review. Re-checked 26 November.**
   - Changing between Snap2 Classic and In-page kept the old gallery and configure-button placements: fixed 20 November (the preset now decides which of the two is on, keeping the saved selectors).
   - Setup drafts carrying over between stores: confirmed for Advanced setup when two stores or products have identical saved settings (their draft key is made from the settings alone). Fixed 26 November: the Shopify portal clears those drafts whenever its store or product changes. Guided setup's drafts were already scoped by store and theme.
   - The compatibility check disabling Save after the portal hydrates from `_formState`: not reproduced and not changed. It needs a store on an older plugin build to check, which is also the old-plugin item under Status.

Not blocking: skipping theme matching when the theme has not changed since the last match was agreed in principle and has not been built.

### Rollout order

1. Finish the development-store checks above with the current local build, and bring all three branches up to date with `main`.
2. Clear the release blockers.
3. Publish `ov25-ui` (runtime and setup) and pin that version. The `update-ov25-ui-packages` workflow pushes the version bump straight to OV25 `main`, and `main`'s current Shopify portal loses its store and product controls after **Change preset** in the new setup. So that bump must not reach production before the OV25 branch does (step 5): pause the workflow for this release, or carry the bump on the OV25 branch.
4. Build the reporting/preview-capable Shopify extension and publish its release manifest before deploying that build to any client.
   - Build it against the **published** `ov25-ui` package (no `OV25_UI_LOCAL=1`), register only that manifest in `OV25/lib/shopify/runtime-builds`, and deploy it to the dev stores and the test organisation first.
   - Then deregister every local development build before the OV25 branch merges: delete `demo-local-v*.json`, `browser-unlock-v1.json`, `preview-v1.json` and `preview-preflight-v1.json` (the last two are committed on the branch but were built against a local UI), and leave `index.ts` listing only release builds.
   - The registry is read only by setup and site preview, never by storefronts. A store still running a deregistered build keeps rendering normally but loses site preview ("not been verified for preview support") and the newer style controls until it is redeployed.
5. Merge and deploy OV25 with the old-client baseline behaviour in place, following OV25's shipping-to-production procedure (`.agents/skills/ov25-shipping-to-production/SKILL.md`).
6. Prove the complete flow on one real store (the test organisation), including draft updates and an old-plugin fallback.
7. Update further clients independently. Before updating a client's plugin, check their saved settings for `branding.hideLogo: true`: earlier plugins ignore it, the new one hides their logo. Site preview can be opened after a successful preflight and is confirmed only when the actual loaded runtime acknowledges the draft; clients not yet updated continue using baseline presets and the embedded demo.

Defaults: four bundled presets per product type; no preset-management UI; embedded demo available unless hidden by the host; Shopify site preview in a separate tab with explicit updates; automatic build reporting rather than manual client-version tracking; fixed 29 September 2026 fallback feature baseline; Save remains the only action that publishes configuration changes.

## Local implementation and review

The implementation includes all twelve preset/type combinations, draft-preserving selection and confirmation, summary/edit navigation, the responsive demo, the optional host API, and the Shopify temporary-session path. Existing JSON export and metafield formats are unchanged. Preset identity and progress are local editor metadata.

The setup package has been built locally and copied into `OV25/node_modules/ov25-setup`. Rebuild and resync after changing setup:

```sh
cd ov25-ui/setup
bun --bun run build
cd ../../OV25
node scripts/sync-local-ov25-setup.mjs
```

The local fixture at `http://127.0.0.1:3008/tests/configurator-setup.html?fresh=1&demoDefaults=1` opens the picker without a server configuration and uses the bundled demo products. Without `demoDefaults`, the fixture retains its older environment-specific API/product overrides. Existing stored drafts may open their summary; use a fresh browser context to check first-run behaviour. The embedded demo uses `http://app.localhost:3000/configurator-preview`. Start OV25 with `next dev --hostname localhost`; binding it to `127.0.0.1` caused an existing internal configurator rewrite to loop during this review.

Review the full-width picker, selection without application, Use preset, optional colour matching, Edit settings, and Change preset, including custom CSS replacement confirmation and switching product types. The Shopify portal additionally has a separate preview-product picker for Default settings after the initial steps. Previewing sends the current draft and unsaved Global settings; Save remains a separate action.

The Shopify extension can be built against the existing local `ov25-ui/dist` with `OV25_UI_LOCAL=1 pnpm build` from `shopify-plugin/extensions/ov25-configurator`. Its generated `release-manifest.json` is copied into `OV25/lib/shopify/runtime-builds/preview-v1.json`. Recopy that manifest after any plugin/runtime rebuild that changes the build ID; future released manifests must be added rather than overwritten.

*Superseded:* later local builds are registered as `demo-local-vN.json` (v25 on 20 November); the procedure is in `shopify-plugin/DEV-STORE-DEPLOY.md`. All local registrations, including `preview-v1.json`, are removed before release (Rollout order, step 4).

Validation covers preset completeness and round trips, preserved settings, compatibility and reloads, actual Chromium editor flows, React 18 compatibility, Shopify host draft delivery and acknowledgements, session ownership/expiry/revisions/CORS, and the storefront adapter's normal and preview paths. Test files are under `ov25-ui/test/{unit,browser}`, `OV25/lib/shopify/configurator-preview`, `OV25/tests/unit/shopify-configurator-*`, and `shopify-plugin/tests/ov25-configurator`.

Final local results: 102 setup unit tests; 20 browser tests run on both React 19 and React 18; 74 focused OV25 tests across the backend, demo and host; 33 Shopify adapter tests. The setup and local Shopify bundles build, and the complete OV25 TypeScript check passes. All eight Standard/Snap2 preset demos loaded real product data; their modal actions opened successfully. The desktop preview retains a desktop viewport when scaled into a narrow host.

**Bed visual validation remains incomplete.** Its existing local `bed-configurator/3` data request sometimes took 44–58 seconds, then failed to deliver usable product data within 90 seconds in the clean final browser run. A direct request to that endpoint, bypassing setup, also timed out. The new preview shows an explicit retry state and can recover if data arrives later; Bed preset serialization and editor tests pass. Recheck Bed against a healthy local/product-data environment before release. No changes were made to the underlying Bed data service.

The full real-store round trip still needs a Shopify store running the new extension. No client store has been updated in this task. An old extension without the rendered build marker should keep Open site preview disabled with support-not-detected guidance, while baseline presets and normal Save remain available. Runtime failures after a successful preflight must still time out without confirming draft application. Verify a successful initial preview, an explicit revision update, product-target changes, Global overrides, expiry and Exit preview when reviewing the updated extension.

*Superseded:* previews now use the dedicated `shopify-configurator-previews` table (`dev-shopify-configurator-previews` with local DynamoDB), whose production provisioning is a release blocker. As originally implemented: temporary data uses the existing Dynamo temporary-store table, with namespaced keys and enforced 30-minute expiry. Enable its `ttl` cleanup attribute for eventual removal of abandoned rows. No Postgres migration is required. The OV25 permission coverage check still reports 25 unrelated pre-existing gaps; the new preview routes have registered coverage. The Shopify host page has seven pre-existing React-hook/compiler lint findings (eight on its original `HEAD`; removing the DOM portal eliminates one). New hook, backend and demo files pass their targeted lint checks, and the full OV25 TypeScript check passes. Protocol and deployment details live in `OV25/docs/shopify-configurator-preview.md` and `shopify-plugin/extensions/ov25-configurator/PREVIEW.md`.

## Theme colours and palette review — local implementation, 1 October 2026

*Superseded 29 October:* the palette review screen (`ThemePalettePreview`), the Current/Suggested comparison and the `theme-palette` and `theme-button-animations` fixtures were removed (moved to `_to_delete/palette-removal-2026-10-29/`). Matching now applies straight to the draft with Undo, and the site preview is where the result is checked. The controls, fonts, button motion, compatibility rules and source analysis below still apply.

### Scope

**Match my site** is a full-width step after choosing a preset, before the product preview mounts. It reads theme source through an optional host-owned `themeStyling` callback, displays the palette review inline, and only changes the selected product type when **Apply to draft** is clicked. Users may skip matching or continue with their current colours, including after an analysis error. Leaving the step aborts pending analysis. A compact summary action can reopen the step; it remains hidden while editing settings. Save and site preview remain explicit separate actions after these steps. Cancelling a proposed palette leaves the draft unchanged.

This review implementation uses only the downloaded Harbour Lifestyle and Arighi Bianchi themes in `client-mono`. It does not crawl websites, call Shopify GraphQL, update stores, or add a production analysis endpoint. The local OV25 bridge is the source adapter for this phase. A future Shopify source adapter and authenticated portal integration remain separate work; existing central deployments and client plugins are unaffected.

Existing Product Lifestyles Brands code is only visual inspiration for a palette. No brand voice, lifestyle imagery, campaign data or brand profile schema is reused.

### Review interface and editable controls

`ThemePalettePreview` shows labelled colour swatches, a typography specimen, selected options, an input, primary/secondary/disabled buttons, actual hover/focus states, contrast ratios, and source limitations. The setup dialog compares Current and Suggested; custom CSS/element overrides are preserved and explicitly flagged as potentially overriding the suggested styling.

Twenty-three new controls join the existing style registry:

| Area | New controls |
| --- | --- |
| Selected tabs | Tab background, text and border; product thumbnails keep the existing selection ring without filling their cards or changing captions |
| Action button | Border colour, border width, disabled text |
| Inputs | Background, text, border and placeholder |
| Interaction | Focus ring and overlay-button hover |
| Overlay | Backdrop colour and opacity |
| Text | Compare-price and link colour |
| Typography | Heading/button families; body/heading/button weights; button letter spacing and text case |

Existing controls cover body font, page/viewer surfaces, primary/secondary button colours, hover/disabled backgrounds, corners and other colours. Colour, shape and typography proposals map to visible editor controls. Button motion is the exception: it is saved in the existing Custom CSS field, with no additional controls. The setup serializer continues generating controlled CSS variables from the colour/style fields. Matching the outline colour also activates the existing solid-outline toggle.

### Button motion through Custom CSS

The palette response may include up to two source-backed animation recipes, one for action buttons and one for collection controls. Supported effects are colour fade, slight lift, sliding fill and animated underline. The AI supplies bounded duration/easing and optional effect parameters; it does not supply arbitrary CSS, JavaScript or selectors. Missing motion evidence produces no recipe. The CSS collector retains relevant transitions, transforms and pseudo-element visibility within the existing evidence limits.

Setup generates CSS targeting existing OV25 button hooks and stores it in an identifiable block inside `branding.cssString`. Applying another palette replaces that block while preserving handwritten CSS. Old proposals without animation data preserve the current block; an explicit empty animation list removes it. Changing presets retains generated motion when retaining the matched theme styling. No Shopify theme source is modified.

The palette board renders the same recipes with selectors scoped to that board; Current uses the draft's generated block. Disabled buttons remain unaffected, hover respects pointer capabilities, keyboard focus receives the same effects, and reduced-motion users receive immediate state changes without motion. Arbitrary handwritten CSS is still reviewed in the actual product preview. The separate local fixture `/tests/theme-button-animations.html` demonstrates all four recipes; these examples are handwritten tests, not AI results. Existing plugins keep their existing Custom CSS transport, with effects targeting only hooks present in their runtime.

Optional `branding.fonts` descriptors contain observed family, URL, weight, style and optional Unicode range. The editor exposes font sources; the runtime loads them through a per-document deduplicated `FontFace` loader with isolated family aliases and system fallbacks. Fonts survive export/import. Harbour's downloaded font is served locally for this review; Arighi's external font stylesheet is not fetched, so its preview reports fallback typography.

### State and compatibility

- Pending analysis is cancelled/discarded when the theme context, product type, initial configuration, draft or compatibility changes. Duplicate requests are blocked. Errors leave the draft and Save available.
- `themeStyling.contextKey` identifies the current source. Optional `draftKey` scopes local drafts for hosts whose initial settings can be identical across stores/products. The two theme fixtures use different draft keys.
- Preset changes retain semantic styles and fonts; local match metadata is only descriptive and is never exported. Retention also works for imported saved JSON without editor metadata.
- `styling:theme-v1` identifies the new controls; `branding:fonts-v1` identifies font-file support. Neither is added to `legacy-2026-09-29`.
- Unconfirmed/older clients receive baseline colour/button controls and an explicit partial-match explanation. Unsupported advanced controls and font files are omitted before review/application; proposals with no supported changes cannot apply. Manual use of new features is gated on Save.
- The Shopify adapter forwards fonts. New build capabilities are emitted only when the actual bundled UI artifact advertises them, so building the updated plugin against the old UI cannot falsely claim support.

### Local source analysis

OV25's `lib/shopify/theme-style` has a fixed catalogue, a bounded source reader, an explicit style allowlist and a structured Gemini invocation using the existing GCP client pattern. It reads current settings, schema defaults, product-template settings and relevant CSS/Liquid snippets. Source is untrusted data. Freeform copy, URL-bearing CSS and secret-like settings are excluded. Reads are bounded to 24 files, 256 KiB/file, 2 MiB total and 80 KiB extracted evidence, with truncation warnings and path/symlink checks. *Updated:* as of 20 November the read limits are 64 files, 2 MiB per file and 8 MiB in total (`THEME_STYLE_SOURCE_LIMITS`); the 80 KiB cap on what is sent to the model is unchanged.

The agent is limited to two 25-second attempts, validates returned control keys/values, rejects invented font/source references, and applies deterministic contrast checks. Provider errors are sanitized. No database writes or production credentials reach the browser.

*Since superseded:* Gemini analysis has run locally since this was written (for example the AD Furnishings fixture, `source=ai`); production use is Release blocker 5. As originally written: **Actual Gemini analysis has not run.** Automatic approval review rejected sending private client theme snippets to Google's Gemini service without explicit destination approval. The review fixtures are labelled **Source-derived palette**, `method: "source"`; they use local settings and clearly mark inferred styling defaults. The AI path is implemented and tested with mocked provider responses, ready for an approved run.

### Local review

Open `http://127.0.0.1:3008/tests/theme-palette.html` to compare the palette boards. Choose **Try the setup flow**, choose a preset, then **Match my site**. The default fixture loads saved source-derived proposals. The demo Save handler does not update any store.

As of 7 October 2026, the catalogue includes Harbour Lifestyle, Arighi Bianchi, All About Tweed, Recline Online, Moy Furniture, Orla Kiely Furniture, Diamond Furniture, Diamond Furniture Design (B2B), and The Chair People (identity inferred from the export's social links). Add `?theme=<catalogue-id>` for a direct link, for example `?theme=all-about-tweed`. The seven additional source archives came from `client-mono` and `ov25-ui/artifacts`; their extracted copies remain under the ignored `ov25-ui/artifacts/theme-style-sources` directory. Archive provenance and regeneration instructions are in `OV25/lib/shopify/theme-style/README.md`. All saved previews remain explicitly source-derived; no Shopify or AI calls were made to generate them.

The existing Vite dev server on port 3008 serves the fixture and copied local font. To regenerate from downloaded source and use the local OV25 request path:

```sh
cd OV25
bun scripts/local-theme-style.ts --generate-all --source-only --refresh
bun scripts/local-theme-style.ts --serve --source-only
```

Then open `http://127.0.0.1:3008/tests/theme-palette.html?live=1`. The bridge binds only `127.0.0.1:3011`, accepts the fixed catalogue IDs, restricts browser origins to the local Vite server, and exposes `/themes` and `/proposal`. No arbitrary filesystem paths are accepted. Keep `--source-only` until the remote AI scan is explicitly approved. Add `&noProductPreview=1` for a setup-only review without the embedded OV25 demo.

Build runtime first, then setup, then sync both packages into OV25 for its local configurator preview:

```sh
cd ov25-ui
bun --bun run build
cd setup
bun --bun run build
cd ../../OV25
node scripts/sync-local-ov25-ui.mjs
node scripts/sync-local-ov25-setup.mjs
```

Focused validation covers proposal validation, contrast, source budgets, source-only mode, bounded/mocked AI calls, font loading/round trips, actual browser styling, review/cancel/apply, stale results, draft isolation, preservation after import, legacy partial matches and plugin artifact capability reporting. No release, deployment or client-store changes are part of this local review.

## Theme-assisted page placement — local implementation, 5 October 2026

Placement discovery is part of **Match my site**, with no extra onboarding step. One button invokes two focused analyses behind the host callback: colours/styles and page-placement selectors. Their evidence and prompts stay separate to avoid increasing the colour prompt or mixing its task with selector reasoning. Each request has independent limits and validation. Placement errors keep a valid palette usable and leave selectors unchanged.

*Superseded 29 October:* the **Page placements** review described here was removed with the palette review; only high-confidence suggestions on new setups, or theme overrides on a non-live theme, are applied automatically. The production saved-state reads described in the last paragraphs were completed on 20 October (see that update).

The palette response may carry an optional `placement` proposal with observed selectors, role labels, source files, confidence and warnings. A collapsed **Page placements** disclosure presents changes only when supported, enabled fields differ from the draft. Technical selector strings live under each suggestion's details. The host supplies `themeStyling.placement` with a store/theme/template context key, a scope label and explicit saved-state classification:

- **Confirmed no saved settings:** high-confidence suggestions can be included automatically for untouched preset defaults. Empty global fields additionally need the host's `untouchedIntegrationKeys` allowlist. Deliberately cleared fields and existing manual draft edits stay intact. Uncertain suggestions require review.
- **Existing or unconfirmed settings:** retain all existing selectors by default. The user can explicitly include selected suggestions after reviewing a warning that shared settings can affect existing pages and other themes.
- **Apply to draft:** commits the included selectors together with the palette. Cancel/skip changes neither. Save and site preview remain separate actions. Disabled selector roles and unavailable/read-only integration fields remain untouched.

Gallery, name, price, variants, swatches and configure-button targets use the existing per-type selector JSON. `variants` is an OV25 controls mount, not merely a native Shopify variant field. Header, desktop/mobile carousel and add-to-cart targets use existing host-owned global fields through `storefrontIntegration.onChange`. Preserve selector enable/replace flags, and keep metadata out of exported runtime JSON. This requires no plugin protocol change: preview payload and integration fields already support the same selectors. The ordinary embedded product demo rewrites selectors to its own DOM and cannot verify merchant placement; final verification must use the actual site preview.

`OV25/lib/shopify/theme-selectors` uses the fixed downloaded-theme catalogue and guarded source reader, follows product/header dependencies, excludes scripts/copy/secret attributes and permits model choices only from observed candidates. Dedicated hooks are preferred; ambiguous source matches cannot become high-confidence automatic updates. Source-only fixture generation includes placement proposals but explicitly reports that no model or rendered-site validation ran. One theme can legitimately produce fewer suggestions if its app-block markup is absent.

Production integration remains pending with the colour adapter. Absence must be established using successful, reliable keyed reads: current `getShopMetafield`/`getProductMetafield` null results conflate absence and failure, and the bulk metafield reader only requests the first 50. Bootstrap-created defaults and legacy selector overrides count as existing settings; do not infer a new store from missing editor metadata. Preserve the Default-save migration that adopts and then removes legacy selector globals.

Local review remains `http://127.0.0.1:3008/tests/theme-palette.html`: **Try the setup flow → choose a preset → Match my site**. Add `?savedPlacements=1` to inspect existing-settings protection, or `?noProductPreview=1` for a review without the product iframe. `?live=1` uses the same loopback bridge on port 3011. Source-only regeneration now produces palettes and placements together; no Shopify connection, AI transmission or store write is made during local verification.

Verification: 104 focused tests passed across palette/preset compatibility, placement validation/review, the combined browser flow, bounded source/model extraction and independent-analysis fallback. The setup build/type check passed and its output was synced into local OV25. Desktop/mobile review had no horizontal overflow. The full OV25 type check reports one unrelated error in `scripts/requeue-arlo-nell-neve-cutouts.ts:180` (assignment to read-only `NODE_ENV`); it was left untouched. Selector model evidence has a separate 24 KiB serialized-input cap, with at most two 25-second attempts and no tools. Actual model calls and real-store verification remain outstanding.

**Structural selector evidence (7 October 2026):** placement candidates now carry bounded, sanitised HTML outlines showing source-local ancestors, descendants and nearby siblings. The generated `data-candidate="true"` marker identifies the candidate. Text, URLs, scripts/styles, event handlers and arbitrary attribute/Liquid values are excluded; snippets are never flattened into an invented cross-file DOM. Partial outlines and omitted context are flagged. The full selector model request still fits within 24 KiB, and the agent can choose only observed candidate IDs. The local selector-only runner (`OV25/scripts/local-theme-selectors.ts --prepare`) writes reviewable requests for all nine downloaded themes without making network calls. Gemini execution remains separate from preparation and from colour fixtures.

## Live placement validation — part 4 implementation, 8 October 2026

The Shopify draft preview now checks the actual merchant DOM before OV25 mounts, replaces or hides elements. It inspects the effective selectors for the active layout and viewport: valid CSS, bounded match counts, the first match used by the runtime, visibility, the main product region and unsafe replacement/overlap. Disabled or inactive targets are reported as **Not required**; legitimate empty app-block mounts do not fail solely because they have zero height. Unconfirmed page context remains unverified. The existing post-mount acknowledgement still confirms that the configurator opened. Source analysis and the embedded demo do not claim these live checks.

Diagnostics use the existing temporary preview session and runtime reporting endpoint. Each result is bound to a validation run, session revision, shop/product and layout, with the observed theme, product template and tested viewport. The expected product template comes from the preview target. Responsive width/orientation changes reload the preview and check fresh markup, rather than examining OV25's already replaced DOM. Reports contain bounded selectors, counts and issue codes; they do not send page HTML, text or input values.

Setup shows a compact **Page placement** disclosure beneath the live-preview action, with per-target explanations and an explicit reminder that the other viewport still needs checking. It retains the exact submitted payload/layout and the host's store/product/integration context. Changing any of these hides old results until the matching draft is checked; an earlier validation run cannot confirm a new request.

The runtime negotiates optional `placementValidationVersion: 1` support before sending new report fields. Older plugins can continue their existing preview flow and display **Not checked** in setup; mounting alone is not selector validation. New plugins omit diagnostics for backends that do not advertise support. No saved settings format changes or theme-code writes are introduced. Setup remains separate from `/shopify-theme-patcher` and does not invoke it.

Code is in `shopify-plugin/extensions/ov25-configurator/assets/preview-placement.js`, `site-preview.js` and the Shopify adapter; the existing `OV25-worktrees/configurator-preview-preflight` checkout's `lib/shopify/configurator-preview`, runtime route and `useConfiguratorSitePreview` hook; and setup's `live-preview.ts`, `PlacementValidation.tsx` and `LivePreviewAction`. Verification passed 74 plugin tests, 224 backend tests and 54 focused setup tests. Setup type checking and the local setup distribution build pass; the plugin bundle also compiles against the local ov25-ui artifact without writing release files. Tests use local fixtures/mocks without database or Shopify calls. The build emits the existing Radix `"use client"` directive warnings. Real-store visual verification remains a separate review step; this implementation has not connected to or modified a client store.
