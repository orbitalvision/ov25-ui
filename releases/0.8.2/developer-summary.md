# OV25 UI 0.8.2 Developer Summary

Status: **Ready for final artifact review — no known pre-tag code or test blocker**

## Review Identity

| Field | Value |
| --- | --- |
| Release | `0.8.2` |
| Bump | `patch` |
| Base | `ov25-ui@0.8.1` (`71dde5c7af3ff61c2df75f3cfb998d4618a3c755`) |
| Head | `dcb55e5e7ff5cfa91610140e6f9cc026fd85d70c` |
| Branch | `main` / `origin/main` |
| Review date | `2026-08-14` |
| Committed range | 27 commits; 107 files; 8,978 insertions; 735 deletions |

Review artifacts: [combined review draft](../../release-drafts/ov25-ui-0.8.2.md),
[patch notes](patch-notes.md), [client email](client-email.md), and
[deterministic review context](context.md).

No version was bumped, and no release commit, tag, package publication, Shopify deploy,
WooCommerce release, or OV25 deploy was performed while refreshing this review. Package manifests
remain at `0.8.1` pending the approved coordinated release.

## Release Verdict

**No known package pre-tag code or test blocker remains.** The full React 19, Configurator Setup,
and active E2E gate passed. The release owner also reported that the isolated React 18 publish build
passed after the final runtime fixes.

The former Setup Bun-lock blocker is fixed. `release:deploy --push` now pushes the UI and React 18
tags first, waits for the tag-triggered publication of the real registry package, regenerates both
Setup locks in a temporary directory, verifies an exact frozen install/build, and only then creates
the Setup commit and tag.

The release owner explicitly accepted:

- the patch-release source-compatibility risks affecting `Swatch`, Setup `TypeSettings`, and the
  `variants-only-sheet` union;
- the fresh-Setup default of tooltip on desktop and fullscreen on mobile; and
- the two intentionally skipped bed E2E cases as a documented coverage exception.

The refreshed artifacts themselves still require final review and approval. Live rollout remains
conditional on downstream dependency updates and appropriate Shopify, WooCommerce, OV25,
documentation, browser/device, accessibility, responsive, and cart staging.

## Final Pre-Tag Checklist

1. Review and explicitly approve these refreshed artifacts.
2. Commit the refreshed tracked combined draft before invoking `release:deploy`. Versioned files
   under `releases/0.8.2/` are allowed and staged by the deploy flow.
3. Run the two-phase release flow described in the runbook and inspect each generated commit/tag
   before pushing.

Before this refresh, the workspace contained no tracked changes and only the untracked
`releases/0.8.2/` directory. This refresh modifies the tracked combined draft outside the deploy
allowlist, so that draft update must be committed first.

## Workspace And Downstream State

| Repository | Review state | Release implication |
| --- | --- | --- |
| `ov25-ui` | `main` and `origin/main` are at `dcb55e5`; package and Setup manifests remain `0.8.1`. | Review/commit the refreshed artifacts, then use the coordinated two-phase release flow. |
| `OV25` | `codex/selection-details-preload` is at `89ab3e67`; exact UI dependencies remain `0.8.1`. | Existing selection remains compatible. Move the receiver through normal review/deployment before advertising preload performance. |
| `shopify-plugin` | Clean `main` at `146a74e`; extension uses exact `ov25-ui-react18@0.8.1`. | Update, rebuild, and stage the exact `0.8.2` bundle after package publication. |
| `ov25-woo-extension` | `main` at `1de7294`; manifests use `0.8.1`, while substantial tracked/untracked host-integration work and an older Bun lock are present. | Preserve/reconcile local work before dependency synchronization and plugin release. |
| `ov25-docs` | Clean `main` at `1e23604`; no public Selection Details or Setup host-integration coverage was found. | Publish documentation before or with live rollout. |

No matching local `0.8.2` tags exist. This review did not query or publish registry packages.

## Changed Packages And Areas

| Area | Summary |
| --- | --- |
| `ov25-ui` public API | Adds Selection Details enum/config exports and completes the public `variants-only-sheet` type. |
| Variant selection runtime | Adds tooltip, sheet, modal, and fullscreen details surfaces with explicit Apply behavior, responsive imagery, swatch actions, focus management, scroll locking, and replacement strings. |
| Tooltip/focus reliability | Stabilizes pointer re-entry, closes tooltips when anchors are replaced across shadow roots, suppresses apply-time reopen, and restores focus only after `inert` isolation clears. |
| Iframe messaging | Adds speculative `PRELOAD_SELECTION` and tooltip cancellation messages after the details image paints. |
| Carousel/gallery | Corrects mixed storefront/OV25 image indexing and cutout-backed 3D thumbnails; improves tablet/Inline (sticky) sizing. |
| Sticky/sheet layout | Keeps mobile variants in document flow, prevents option-header overlap, centralises portal tiers, and reduces sheet-induced page reflow. |
| Swatches | Adds missing-image fallbacks, group-aware identity with legacy-cache matching, and deterministic Swatch Book/toast ordering. |
| Customisation contracts | Adds Selection Details title/description replacement keys plus stable module-card loading and Snap2 view-control data hooks. |
| `ov25-setup` | Redesigns editor grouping, adds Selection Details settings and style hooks, introduces an optional host-owned Global integration panel, and synchronises current Setup locks with `ov25-ui@0.8.1`. |
| Release automation | Splits UI and Setup preparation, waits for registry integrity, regenerates npm/Bun locks safely, verifies exact Setup install/build, and supports validated retry/resume states. |
| Tests/fixtures | Adds broad unit, browser/component, E2E, manual-fixture, visual, and release-deploy coverage. |

## Implementation Summary

### Selection Details

`configurator.variants.selectionDetails.displayMode` controls the surface. Desktop accepts `none`,
`tooltip`, `sheet`, `modal`, or `fullscreen`. Mobile accepts `none`, `modal`, or `fullscreen`;
JavaScript-provided mobile `tooltip` or `sheet` values resolve to fullscreen.

For sheet, modal, and fullscreen, activating a normal variant card opens details without selecting
it. **Apply to Model** invokes the existing selection path. Desktop tooltip previews on hover/focus
and applies directly when the card is clicked or keyboard-activated. The surface can display the
selection/swatch name, description, responsive image, Apply state, and Swatch Book action.

The runtime default is `none`, so integrations that omit the new field retain direct selection.
Fresh Setup form state defaults to `tooltip` desktop and `fullscreen` mobile, while hydration of
legacy saved payloads assigns `none`/`none` to omitted fields. The release owner approved this
fresh-Setup behavior.

`selectionDetailsTitle` and `selectionDetailsDescription` resolve through `getString` with
`SELECTION_NAME` and `DESCRIPTION` values. Description replacement remains gated by real source
copy, so a template does not create a description when none exists.

Tooltip pointer handling uses boundary-aware bubbling events so it works across the React/shadow
portal topology. It ignores transitions from disconnected anchors, suppresses immediate reopen
after selection, and closes if the captured trigger or a composed ancestor is removed. Modal-style
focus restoration observes `inert` cleanup across shadow roots instead of relying on frame timing.

After the details image decodes and paints, the UI can post `PRELOAD_SELECTION` with the selection
identity. Closing an uncommitted tooltip preview can post `CANCEL_PRELOAD_SELECTION`. Older OV25
runtimes ignore these additive messages, preserving apply behavior without the preload benefit.

### Configurator Setup

The editor keeps Product Type outside the Settings/Style/Global tabs, groups controls into Display &
layout, Variant experience, Storefront selectors, Behaviour, and Brand identity, and adds Selection
Details selectors to Element Styles. The optional `storefrontIntegration` prop lets a platform host
supply loading, error/retry, read-only, or editable field schemas. Host values remain separate from
Setup JSON and use the host's `onChange` callback.

### Styling And Fixture Coverage

Module cards expose `data-ov25-module-variant-card-loading`, while Snap2 view controls expose
`data-ov25-snap2-view-control="desktop|mobile"`. Manual fixtures exercise Selection Details display
modes, registered string replacements, module cards in Initialise and Variants panels, control
states, and the desktop/mobile Snap2 selector.

The configurator-sizing fixture lets Responsive Width grow with the page up to its 920px ceiling.
Tall removes the stale 760px cap and limits its gallery column to a 3:4 portrait ratio. These are
fixture corrections, not production runtime changes.

### Reliability Fixes

- Carousel indices stay aligned when storefront images precede OV25 metadata images.
- Percentage-height iframe sizing is corrected for Inline (sticky) tablet layouts.
- Mobile variants return to page flow when client CSS makes their host fixed or absolute.
- Pinned option headers avoid filter overlap.
- Sheet open/close restores page dimensions, scroll position, and prior inline styles.
- Portal tiers define ordering for sticky UI, drawers/dialogs, Selection Details, Swatch Book, and
  toasts.
- Cross-version string-valued `inert` attributes preserve overlay isolation in React 18 and 19.
- Setup's current manifest and Bun/npm locks align on exact `ov25-ui@0.8.1`; frozen install passed.
- The Configurator Setup bed preview uses a product authorised for the default demo key.
- Mobile-drawer visual coverage waits for content, decoded images, and fonts while retaining explicit
  geometry and layer assertions.

### Release Automation

The first deploy phase updates `ov25-ui`, the root npm lock, changelog, and reviewed artifacts, then
creates the UI and React 18 tags. Setup finalization waits until the exact UI version and integrity
are available from npm. It generates `setup/package.json`, `setup/package-lock.json`, and
`setup/bun.lock` in a temporary directory, validates exact versions, performs a frozen Bun install
and Setup build, then creates the separate Setup commit/tag.

The flow refuses unsafe dirty retries, checks that the remote branch and Setup inputs have not moved
outside the reviewed release, and can reuse a validated existing Setup commit or matching local tag
after an interrupted push. This resolves the former lock-drift blocker without fabricating registry
integrity before publication.

## Compatibility Checklist

| Question | Assessment |
| --- | --- |
| Public exports/options removed or renamed? | No deliberate removal or rename. Selection Details and `variants-only-sheet` changes are additive. |
| Existing runtime defaults preserved? | Yes for direct inject/runtime use: omitted Selection Details resolves to `none`. Fresh Setup defaults affect newly created form state and are approved. |
| Existing saved Setup payloads preserved? | Yes. Legacy payloads hydrate with Selection Details disabled. Saving through new Setup serializes the field. |
| Commerce callbacks/payloads changed? | No SKU, price, `onChange`, `addToBasket`, or `buyNow` signature/shape change found. |
| DOM/CSS contract changed? | Additive classes/data attributes and a body-level shadow portal. Global z-index tiers changed, so storefront overlay testing remains necessary. |
| Iframe messages changed? | Additive `PRELOAD_SELECTION` and `CANCEL_PRELOAD_SELECTION`; older receivers ignore them. |
| React 19 package ready? | Automated type, unit, browser/component, build, Setup, react-test, and active Playwright gates passed. |
| React 18 package ready? | The release owner reported the exact isolated publish build passed after the final runtime fixes. |

### Accepted Source-Compatibility Risks

No deliberate runtime break was found, but strict source consumers can be affected:

- `Swatch.manufacturerId` widens from `string` to `string | number`; `description`, `sku`,
  `thumbnail`, and nested image fields become optional/nullable; `group` is added.
- `ov25-setup`'s exported `TypeSettings.configurator` requires
  `selectionDetailsDisplayModeDesktop` and `selectionDetailsDisplayModeMobile`.
- Adding `variants-only-sheet` to the display-mode union can require a branch in exhaustive switches.

Local OV25, Shopify, and WooCommerce consumers do not appear to directly construct the affected
exported types, but external strict TypeScript consumers may. The release owner reviewed and
accepted these source risks for the `0.8.2` patch classification.

## Test Evidence

The generated [test summary](test-summary.md) records a successful run from
`2026-08-14T09:37:39.071Z` to `2026-08-14T09:39:48.688Z`. The final runtime fixes were committed as
`16f12b3` 18 seconds later; all changed-file timestamps predated the run and the tracked tree was
clean afterward. Subsequent commits modify release tooling, tests, documentation, and review
artifacts rather than package runtime or Setup source.

- Passed: type-check, unit tests, browser/component tests, React 19 production build, frozen
  Configurator Setup install, Setup build, react-test build, preview readiness, and Playwright E2E.
- Playwright report: 69 total; 67 passed/expected; 0 failed/unexpected; 0 flaky; 2 skipped.
- Skipped and accepted: bed shared-detail integration and bed selection-only fallback screenshot.
- User-reported manual preflight: isolated React 18 publish build passed after final runtime fixes.
- Release automation validation: type-check and the complete 281-test unit suite passed; a real
  temporary Setup lock generation against `0.8.1` reproduced all three committed Setup metadata
  files byte-for-byte.
- `git diff --check ov25-ui@0.8.1..HEAD` and the current working-tree diff check pass.

Evidence limits retained for rollout planning:

- Playwright is Chromium-only; Safari/tablet coverage is Chromium emulation, not WebKit or hardware.
- The sheet-reflow case can skip on overlay-scrollbar environments.
- Preload tests use a synthetic iframe; the downstream receiver needs integration evidence.
- Shopify/WooCommerce persistence, cart, and rollout paths are not exercised here.
- New module-card/Snap2 hooks and sizing fixtures rely primarily on manual fixture coverage.

## Migration Notes

- Existing saved configurations need no data migration and retain direct selection.
- Enable details through `configurator.variants.selectionDetails.displayMode` or approved Setup state.
- External `Swatch` consumers should accept numeric IDs and guard optional fields.
- External `TypeSettings` constructors should supply both new display-mode fields.
- Preload performance requires a compatible OV25 iframe runtime.

## Next Step

Review and approve these refreshed artifacts, commit the tracked combined draft, then follow the
runbook's two-phase `release:deploy` flow. Downstream integration and staging follow package
publication and remain required before live promotion.
