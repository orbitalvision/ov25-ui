# OV25 UI 0.8.11 Developer Summary

Status: **Approved — no known pre-tag code or test blocker**

No release action has happened. Generating this review did not bump versions, commit, tag, push,
publish packages, or deploy Shopify/WooCommerce. `release:test` **passed** at this head (run by the
release owner), and the release owner confirmed the isolated React 18 build and manual checks passed;
see [Tests And Evidence](#tests-and-evidence).

## Review Identity

| Field | Value |
| --- | --- |
| Coordinated release | `ov25-ui@0.8.11`, `ov25-ui-react18@0.8.11`, `ov25-setup@0.8.11` |
| Bump | Patch (release owner's choice; see [Bump Classification](#bump-classification)) |
| Comparison base | `ov25-ui@0.8.10` (`31b9a9afb15a`) |
| Head | `92166cc89bd9` (`main` = `origin/main`) |
| Context generated | 2026-09-23T08:29:18.059Z (regenerated with `--force` after four further commits) |
| Committed delta | 10 commits (9 since the `ov25-setup@0.8.10` release commit); 47 files; 1,626 insertions; 102 deletions |
| Working tree at review | Clean (only the untracked `releases/0.8.11/` artifacts) |
| npm / tags preflight | `ov25-ui@0.8.11` not published (E404); latest published `0.8.10`; no `*@0.8.11` tags |

### Artifacts

- [patch-notes.md](patch-notes.md)
- [client-email.md](client-email.md)
- Raw context: [context.md](context.md), [context.json](context.json), [commits.txt](commits.txt),
  [changed-files.txt](changed-files.txt), [diff-stat.txt](diff-stat.txt), [diff.patch](diff.patch)

### Commits

```text
92166cc fix(tests) drop gesture hint and canvas snapshot from Windrush e2e (gesture-hint replaced with auto rotation)
c761b36 fix(setup) fix padding on tab content
220cf43 feat(setup) update to new OV25 colors, fix padding. make button component
575f974 fix(auto-cutouts) add stable styling hooks, update tests to include new UI (customCss, stringReplacement)
95fb756 fix(gallery) when using autoCutouts and deferThreeD, defer to first gallery image, not the material shot
f8f01f9 fix(sticky) measure stacked carousel so inline-sticky can account for it correctly. update auto cutout gallery ordering
78d17e3 feat(setup) allow replacing selection name into ov25-option-header
82a7789 feat(setup) auto cutouts toggle, and ov25-ui display of auto cutouts
aee5d34 feat(tests) various test suite upgrades, viewport matrix, dimensions in viewport matrix
8228c1c chore: release ov25-setup 0.8.10   (outside scope: prior Setup release commit after the UI tag)
```

## Verdict

**No breaking change to any published contract.** All new configuration is optional and defaults
off. One **default behaviour change affects every existing inline-sticky client with a carousel**
(measured carousel height) and needs visual review before automatic rollout. The two
compatibility-guard gaps found in the first review of this release (stable CSS hooks and branding
fixtures for auto cutouts) are closed by `575f974`. The Setup rebrand (`220cf43`) is visual only.
The Setup padding fix named in `220cf43` landed separately in `c761b36`.

## Changed Packages And Files

| Area | Files |
| --- | --- |
| `ov25-ui` runtime | `src/lib/auto-cutouts.ts` (new), `src/lib/sticky-layout-controller.ts`, `src/contexts/ov25-ui-context.tsx`, `src/components/{product-carousel,product-gallery,IframeContainer}.tsx`, `src/components/VariantSelectMenu/{ProductVariantsWrapper,AccordionVariants,TreeVariants,Snap2Wrapper}.tsx`, `src/lib/strings/string-keys.ts`, `src/types/inject-config.ts`, `src/utils/{configurator-utils,inject}.ts[x]` |
| `ov25-setup` | `ConfigPanel/index.tsx`, `types.ts`, `serialize-config.ts`, `initial-config-from-payload.ts`, `preview-config-serializable.ts`; rebrand: `globals.css`, `ui/button.tsx` (new), `ui/slider.tsx`, `ui/switch.tsx`, `StyleEditor/controls.tsx`; padding: `StyleEditor/index.tsx`, `StorefrontIntegrationPanel/index.tsx` |
| Setup release coordination | `setup/package.json`, `setup/package-lock.json`, `setup/bun.lock` (from `8228c1c`, the prior `ov25-setup@0.8.10` release) |
| Tests | `test/e2e/single-no-variants.test.ts` (+ removed baseline PNG), `test/unit/{auto-cutouts,configurator-setup-auto-cutouts,option-header-selected-variant,sticky-carousel-height}.test.ts`, `test/unit/product-carousel.test.tsx` |
| Dev only | `dev/react-test/*` (new `gallery-auto-cutouts` fixture; auto cutouts added to `string-replacement.jsx` and `single-custom-css.jsx` + branding CSS; responsive matrix; layout template), `scripts/capture-viewport-matrix.mjs` |

## Implementation Summary

### Auto cutouts (`82a7789`, `f8f01f9`, `95fb756`)

- New `carousel.autoCutouts` / legacy `carouselAutoCutouts`, normalized to `false` by default and
  forced `false` for Snap2.
- When on, `getIframeSrc` adds `cutoutAngles=-45,0,-90,180&cutoutSize=320`. Values already present
  on `productLink` win. When off, the iframe URL is byte-identical to `0.8.10`.
- The configurator posts `CUTOUT_THUMBNAILS` with transferred `ImageBitmap`s. The UI copies each to
  an object URL, discards unknown angles, closes bitmaps when the feature is off, guards against
  out-of-order sets with a capture version, and revokes URLs on replacement and unmount. The message
  listener only accepts events whose `source` is the mounted configurator iframe.
- Selecting a cutout tile shows the live viewer and posts `SELECT_CUTOUT_ANGLE` with that yaw
  instead of swapping in a still.
- Strip order is `material → first gallery image → 360 → cutouts ×4 → remaining gallery images`,
  produced by one shared `composeGalleryOrder` used by the context, the carousel, and the
  `IframeContainer` poster. Previously the order was duplicated in all three, and `galleryIndex`
  indexes the spliced strip, so any disagreement would show the wrong poster.
- `composeGalleryOrder` also returns `initialIndex`: the 360 normally, or the first gallery image
  when `deferThreeD` is on (the material shot only if there are no gallery images). A context
  effect snaps an untouched index `0` to it, because the material shot arrives asynchronously and
  shifts every index by one.
- With the feature on, the 360 tile no longer renders the catalogue `cutoutImage` behind its label.

### Auto cutout styling hooks (`575f974`)

- Both the carousel and stacked tile renderers now set `data-ov25-gallery-tile` to `360`,
  `material`, `cutout`, or `image`, and cutout tiles set `data-ov25-cutout-yaw`. One helper,
  `galleryTileAttributes`, classifies tiles for both layouts: cutouts by the yaw map, material by
  identity with `autoCutoutMaterialImages`, everything else `image`.
- Additive: every tile gets the attribute whether or not auto cutouts are on. No id, class, or
  existing attribute changed.
- Auto cutouts is now enabled in `single-custom-css.jsx` (branding CSS outlines each tile kind, with
  a distinct colour for yaw `180`) and in `string-replacement.jsx`, whose catch-all `optionHeader`
  now also uses `${SELECTED_VARIANT_NAME}`.

### Setup rebrand (`220cf43`)

- `setup/globals.css` adds the OV25 ink and three pinks as theme colours plus an
  `ov25-brand-gradient` utility. These are copies of OV25's `application-theme.css` values, because
  Setup also renders outside `.ov-app-theme` (WooCommerce, dev fixtures) and cannot read OV25's
  variables. The gradient utility uses literal values so it survives Setup's shadow-host CSS scoping.
- New internal `ui/button.tsx` (cva variants `default` pink, `brand` gradient, `outline`, `ghost`,
  `destructive`). Only the Save button uses it so far; the remaining ~30 neutral buttons keep inline
  classes.
- Slider range, checked switch, tab selector, product-type picker, export-mode toggle, and
  corner-preset chips now use the brand pink/gradient. The variant-outline preview and colour-input
  placeholder deliberately stay cyan–purple: they preview the shopper-facing selection ring, which
  ov25-ui still draws in those colours.
- `c761b36` removes a `pr-4` right padding from the Settings, Style, and Storefront integration
  panel content wrappers (completing the "fix padding" named in `220cf43`). Layout only.

### Option header selected value (`78d17e3`)

- `optionHeader` now receives `SELECTED_VARIANT_NAME` at all seven call sites (list, size, tabs,
  accordion, tree, Snap2 Pieces/Finish), resolved by a new context helper
  `getSelectedValueForOption(idOrName)` that matches option id, then display name.
- Registered in `STRING_REPLACEMENT_DEFINITIONS`, so the Setup text-override editor offers it as a
  variable and trigger. `defaultTemplate` remains `${OPTION_NAME}`.
- Unresolved variables interpolate to `''`, so `${OPTION_NAME} | ${SELECTED_VARIANT_NAME}` renders a
  trailing `" | "` until the first selection resolves. A unit test pins this as intended.

### Measured sticky carousel (`f8f01f9`)

- `--ov25-sticky-carousel-height` was a hardcoded `120px`. The sticky layout controller now measures
  `#ov25-product-carousel` inside the carousel host's shadow root (the unclamped content; the host's
  own box is clamped by this same variable, so measuring it would be circular), adds 1px clearance
  to avoid a scrollbar-width oscillation, and caps the result at 50% of the available height.
- The value is written inline on the gallery host, the variants host, **and the carousel host
  itself**. `#true-carousel` is its own shadow host, so globals' `:host` rule redefines the variable
  on that element and would otherwise beat the inherited value.
- Falls back to `120px` (`DEFAULT_STICKY_CAROUSEL_HEIGHT`, which must stay in sync with globals.css)
  when no carousel content is present. Host variables are restored on controller destroy.

## Compatibility Analysis

| Surface | Assessment |
| --- | --- |
| Public exports (`src/index.ts`) | Unchanged. `auto-cutouts.ts` and the context type are not exported, so the `composeAutoCutoutGalleryImages` return-shape change and the `autoCutoutGalleryImages` → `autoCutoutMaterialImages`/`autoCutoutImages` context rename are internal. Both were introduced within this unreleased window. |
| `STRING_REPLACEMENT_DEFINITIONS` (public) | Additive: one new `interpolationValues` entry on `optionHeader`. |
| `injectConfigurator` options | Additive optional `carousel.autoCutouts` / `carouselAutoCutouts`, default `false`. |
| Callbacks / commerce payloads | Unchanged. |
| Iframe URL / protocol | Unchanged when auto cutouts are off. New messages are opt-in, **except** `SELECT_CUTOUT_ANGLE { yawDeg: null }`, which the carousel posts on every non-cutout gallery click for all clients. The OV25 configurator only installs its handler when cutouts are enabled (OV25 `e7dd576b`), so this is a no-op, but it should be gated in ov25-ui (follow-up). |
| DOM / ids / classes | No existing id, class, or data attribute removed or moved. New additive `data-ov25-gallery-tile` / `data-ov25-cutout-yaw` on every gallery tile. The 360 tile renders its no-preview branch (existing `.ov25-360-label`) when auto cutouts are on. |
| CSS variables | **`--ov25-sticky-carousel-height` changes ownership.** Name and meaning are preserved, but it is now written inline at runtime. Merchant overrides without `!important` stop applying; overrides with `!important` now defeat the measurement. |
| Default layout | **Changed for every inline-sticky client with a carousel.** Short strips previously left the viewer undersized (slot reserved 120px regardless); tall strips scrolled internally. Both now size to content. This corrects broken behaviour but is visible. |
| `ov25-setup` saved config | Additive. Serialises `autoCutouts` only when `true`; old saved configs hydrate without it. |
| `ov25-setup` exports / visuals | Exports unchanged (`Button` is internal). Visual change for every Setup host: OV25 already themes Setup pink inside the app, so the visible change is mainly in WooCommerce admin and standalone hosts. |
| Snap2 / bed / standard | Auto cutouts forced off for Snap2. The header token applies to Snap2 Pieces/Finish headers too. The carousel measurement applies wherever inline-sticky renders a carousel. |
| OV25 app | No payload or identifier change. Auto cutouts requires the configurator protocol, which is on OV25 `origin/main` (`75ab5cc3`, `e7dd576b`, `030b94b4`, `5b74aab8`). The release owner confirmed on 2026-09-23 that auto cutouts work with local ov25-ui pointed at the production configurator. |

### Known merchant affected by the CSS-variable ownership change

Arighi Bianchi's saved `customCss` sets `--ov25-sticky-carousel-height: 176px !important` as a
workaround for the old 120px cap (annotated in `client-mono/Arighi Bianci/site v2/customCss.css`).
After this release, **that line must be removed**, or it overrides the measurement and stacked
mode stays broken for that client.

## Integration Adapter Coverage

| Adapter | State | Change needed |
| --- | --- | --- |
| Shopify (`shopify-plugin`) | `main`, clean; `ov25-ui-react18` pinned `0.8.10` | Dependency-only. `_ov25Carousel()` (`extensions/ov25-configurator/assets/ov25-configurator.js:1532`) passes the saved `carousel` object whole, so `autoCutouts` flows through. `stringReplacements` pass-through is unchanged. Rebuild the bundle, stage on a duplicate theme. |
| WooCommerce (`ov25-woo-extension`) | `main`, level with `origin/main`; **pinned `0.8.1`**; **8 uncommitted files** (`storefront.php`, `package.json`, admin `ProductField`/`ConfiguratorSetup`/`GlobalSettings`, `frontend/index.ts`, `types/ov25-ui.d.ts`, a PHP test) | Dependency-only for this feature. `frontend/index.ts` spreads the stored Setup config into `injectConfigurator`, denylisting only `selectors`/`callbacks`. The Setup toggle arrives with the `ov25-setup` bump. **Reconcile the uncommitted local work before any dependency commit.** The extension is nine versions behind; its `ov25-ui.d.ts` carousel type lacks `autoCutouts` (types only, not runtime). |
| OV25 | Updated by `update-ov25-ui-packages.yml` | Normal workflow. Production configurator already supports cutout capture (confirmed 2026-09-23). |

## Documentation Coverage

`ov25-docs` is clean; latest commit `1e202f9`.

| Change | Status | Detail |
| --- | --- | --- |
| Auto cutouts (runtime option) | **Docs needed** | No page mentions `autoCutouts`. Carousel options are documented in `content/docs/developer/ui-package-integration.mdx` (`maxImages`). Add the option, the fixed angles, the gallery order, the Snap2 exclusion, and the configurator dependency. |
| Auto cutouts (Setup toggle) | **Docs needed** | Add to `content/docs/developer/ecommerce-configurator-setup.mdx` carousel settings. |
| `SELECTED_VARIANT_NAME` | **Docs needed** | `content/docs/developer/text-override-reference.mdx:30` lists `optionHeader` with only `OPTION_NAME`. The table is hand-maintained (no generator). Also worth an example in `ui-package-integration.mdx`, including the trailing-separator behaviour before first selection. |
| Measured sticky carousel | Docs not needed | Invisible bug fix. `--ov25-sticky-carousel-height` is **not previously documented** anywhere, so there is no page to correct. |
| `deferThreeD` opening tile | Docs not needed separately | Cover within the auto cutouts section. |
| Pre-existing defect | Follow-up | In `text-override-reference.mdx`, the description column reads "Option display name." for unrelated keys (`groupHeader`, `selectionDetailsClose`, `selectionDetailsRemoveFromSwatchbook`, and others). Not introduced by this release. |

No docs link was added to the patch notes because no page exists yet.

## Runtime Fixture And Test Coverage

| Feature | `dev/react-test` | Automated |
| --- | --- | --- |
| Auto cutouts | `gallery-auto-cutouts.jsx` fixture (added in `82a7789`, docs updated in `f8f01f9`) | 27 unit tests in `auto-cutouts.test.ts` (normalization, URL, composition, ordering, opening tile), plus Setup coverage in `configurator-setup-auto-cutouts.test.ts`. **No e2e test.** |
| Auto cutouts in branding fixtures | Enabled in `string-replacement.jsx` and `single-custom-css.jsx`; branding CSS exercises every `data-ov25-gallery-tile` kind (`575f974`) | 2 tests in `product-carousel.test.tsx` assert the tile kinds and order in carousel and stacked layouts, and `360`/`image` with auto cutouts off. |
| `SELECTED_VARIANT_NAME` | `string-replacement.jsx` catch-all `optionHeader` uses the token (`575f974`) | 5 unit tests in `option-header-selected-variant.test.ts`. |
| Setup rebrand | Visual inspection of any Setup host | Setup `tsc` and build only. |
| Measured sticky carousel | Covered by existing inline-sticky fixtures | 5 unit tests in `sticky-carousel-height.test.ts`. `test/e2e/inline-sticky.test.ts` reads the variable dynamically (`carouselCap`) and compares geometry against the carousel's actual height, so it is expected to pass by construction. Not run for this head. |

### Compatibility-guard checklist (auto cutouts)

Both gaps from the first review are closed in `575f974`:

1. **Stable CSS hooks:** `data-ov25-gallery-tile` and `data-ov25-cutout-yaw` on every tile.
2. **Branding fixtures:** auto cutouts enabled in both, with CSS targeting each hook.

Auto cutouts introduces no owned UI copy, so there is no new `stringReplacements` key. The existing
`360°` label and `Product thumbnail/image N` alt text predate this release and remain unregistered;
out of scope here.

### React 18

`release:test` builds React 19 only. The isolated React 18 build from
[`docs/release-runbook.md`](../../docs/release-runbook.md#required-react-18-preflight) **must pass
before tags are created.** This release adds TSX in `product-carousel.tsx`, `IframeContainer.tsx`,
`product-gallery.tsx` and the context, all within existing JSX patterns, so risk is low but
unverified. The `0.8.0` and `0.8.1` incompatibilities were found exactly this way.

## Bump Classification

The compatibility guard defines `patch` as bug fixes only and additive optional features as
`minor`. This release adds two optional features, so by that definition it is `minor`. The release
owner chose `patch`, consistent with `0.8.5` and `0.8.8`, which also shipped additive features as
patches. Recorded for visibility; not a blocker.

## Dirty Workspace Status

| Repository | Status |
| --- | --- |
| `ov25-ui` | Clean. `releases/0.8.11/` is untracked (these artifacts). |
| `shopify-plugin` | Clean. |
| `ov25-woo-extension` | **8 modified files, uncommitted.** Must be reconciled before its dependency commit. |
| `OV25` | Many uncommitted changes (dashboard theme, Shopify webhook pages, and others). Unrelated to the package release, but keep them out of the automated dependency-update commit. |
| `ov25-docs` | Clean. |

## Breaking-Change Assessment

None to published contracts. The two items needing explicit acknowledgement:

1. The measured carousel changes default layout for all inline-sticky carousel clients.
2. `--ov25-sticky-carousel-height` is now runtime-owned, which changes the effect of existing
   merchant overrides (Arighi Bianchi known).

## Migration Notes

- No config or data migration.
- Merchants overriding `--ov25-sticky-carousel-height` should remove the override. Arighi Bianchi:
  delete the annotated `!important` line from the standard preset's `cssString`.
- To use auto cutouts: enable **Auto cutouts** in Setup per product type (production configurator
  support confirmed 2026-09-23).

## Tests And Evidence

What has actually run, and against what:

- **`release:test` passed at `92166cc`** (started 2026-09-23T08:26:06Z, 10s after that commit;
  see [test-summary.md](test-summary.md)): type check, unit, browser/component, React 19 build,
  frozen Setup install/build, react-test build, and Playwright E2E. Run via the headed command
  (no `OV25_E2E_NEW_HEADLESS`); the summary file itself does not record the mode.
- An earlier headless run at `c761b36` failed three E2E tests; each was investigated and none was
  caused by this release:
  - `inline-variants-disable-add-to-cart` checkout screenshot (444 vs 448px) and
    `selection-details` inline-sticky sheet stability: failed 3/3 headless, **passed headed**.
    Headless-rendering sensitivity; follow-up below.
  - `single-no-variants` Windrush: waited for `#ov25-gesture-hint`, which the configurator has
    replaced with an idle auto-rotate. Fixed test-side in `92166cc`: the hint wait and pixel snapshot
    (incompatible with a rotating model) are removed; `OV25 3D Loaded`, canvas-size settling, and the
    W/H/D dimension assertions are kept.

- **ov25-ui unit suite, `tsc --noEmit`, and the React 19 `npm run build`** passed in the review
  session: 375 tests across 39 files. The final run was against the working tree that became
  `575f974` (identical 5-file diff: 105 insertions, 2 deletions). Not re-run against the commit.
- **ov25-setup `tsc --noEmit` and `npm run build`** passed against the tree that became `220cf43`
  (identical 6-file diff: 71 insertions, 16 deletions); the built CSS was checked for the new
  pink, gradient, hover, and checked-state utilities. Setup `tsc --noEmit` also passed with the
  `c761b36` padding change applied (identical 3-file diff: 5 insertions, 5 deletions). No Setup unit tests were run for it, and it has
  not been viewed in a browser.
- **Isolated React 18 build and manual checks:** confirmed passed by the release owner on 2026-09-23
  at `92166cc`.
- **Not observed in a browser:** auto cutouts ordering, the opening tile, and the
  `SELECTED_VARIANT_NAME` header. The live Arighi Bianchi preview runs Shopify extension build
  `ov25-configurator-80`, which predates this release. The measured-carousel fix was prototyped in
  that preview by injecting the equivalent CSS: the scrollbar disappeared, the carousel sized to
  its 174px content, and the gallery exactly filled the available height.

## Expected Tests Before Deploy

1. ~~`release:test`~~: passed at `92166cc`.
2. The isolated React 18 build per the runbook.
3. Manual, `dev/react-test`:
   - `gallery-auto-cutouts`: strip order with and without a material option; with `deferThreeD`
     on and off; cutout click orbits the viewer; plain `360°` tile; fabric change re-renders all
     four tiles; toggling off leaves no stale tiles.
   - An inline-sticky fixture in `carousel` and `stacked` modes at desktop and mobile widths: no
     inner scrollbar in carousel mode; stacked capped at half height; viewer never collapses.
   - `string-replacement`: temporarily set `optionHeader` to `${OPTION_NAME} | ${SELECTED_VARIANT_NAME}`
     and check list, accordion, tree, and tabs displays.
4. Setup, in OV25 and standalone (WooCommerce admin or a dev fixture): slider, switch, Save,
   tabs, product-type picker, export toggle, and corner presets render pink; nothing else changed
   colour; the variant-outline preview is still cyan–purple.
5. Shopify staging on a duplicate theme, including one heavily customised theme (Arighi Bianchi
   after removing its workaround) in both carousel modes.

## Follow-Ups (non-blocking unless the owner decides otherwise)

- Gate `orbitToCutoutAngle(null)` on `carouselAutoCutouts` in `product-carousel.tsx`.
- Correct the stale copy that still describes cutouts as prepended: the Setup help text in
  `ConfigPanel/index.tsx` (merchant-visible), the `autoCutouts` JSDoc in `inject-config.ts`, and the
  header comment in `auto-cutouts.ts`.
- Add an e2e test for auto cutouts ordering.
- Write the three docs updates above and fix the pre-existing override-table descriptions.
- Consider suppressing an empty trailing separator for `SELECTED_VARIANT_NAME` before first
  selection.
- Bring WooCommerce up to date and reconcile its local work.
- Make `inline-variants-disable-add-to-cart` (screenshot width) and the `selection-details`
  inline-sticky sheet test pass under `OV25_E2E_NEW_HEADLESS=true`, so routine headless runs are green.
- Move Setup's remaining inline-styled buttons onto the new `Button` component.
- Register the pre-existing `360°` label and gallery alt text as `stringReplacements` keys.

## Next Step

The release owner reviews these artifacts and requests corrections. If approved, they manually run
`npm run release:test -- --release 0.8.11` and the React 18 preflight. Any code change after that,
including any follow-up above taken into scope, returns the release to runbook Step 1.

## Approval

Approved by the release owner on 2026-09-23 after review of the artifacts, compatibility notes,
downstream plan, `release:test` at `92166cc`, the isolated React 18 build, and the manual checklist.
No release action happened while preparing or approving this review.
