# Important Notes

Historical implementation notes are retained below. Current queue state was reconciled against local repositories on 2026-07-28; use [IMPORTANT_BUGS.md](IMPORTANT_BUGS.md) for required user actions and [bugs-ready-for-review.md](bugs-ready-for-review.md) for the authoritative Bug 39 packet.

## 0.8.0 release review draft is ready

Draft artifacts: [patch notes](../releases/0.8.0/patch-notes.md), [developer summary](../releases/0.8.0/developer-summary.md), and [client email](../releases/0.8.0/client-email.md).

Do not release from the current state. Local `main` matches `origin/main` at merge `f512d69`, but all 39 Bug 39 `ov25-ui` implementation/test files are staged without manual approval and the dedicated worktree differs from main in 18 files. The consolidated review diff is stale against that worktree in three implementation/test files (`useStickyHostRelocation.ts`, `carousel-target-controller.ts`, and `inline-sticky.test.ts`) plus the subsequently updated sticky architecture and header-audit docs; it is unsuitable for current staged main because of the broader main/worktree divergence. OV25 `main` does not contain the Bug 39 preview or PluginSettings selector changes; Shopify and WooCommerce contain unstaged integration edits, and the Shopify mobile-carousel block is untracked. Shopify still drops `disableBuyNow` and `hideGestureHint`, its generated bundle is stale, existing Snap2 configs need a `modules.position` migration/default decision, cross-repo package versions are not synchronized, and public docs remain stale. Bug 23 is approved and committed as `eaa808d`. After the remaining blockers are resolved, regenerate the review from `ov25-ui@0.7.3` and then manually run `npm run release:test -- --release 0.8.0` if approved. No build, deploy, publish, tag, push, or version bump was run during the documentation reconciliation.

## Bug 39: ordinary inline modes are isolated from sticky behavior

The obsolete `.ov25-inline-gallery-sticky` injection and CSS have been removed in staged main and `.worktrees/ov25-ui-inline-sticky`. Ordinary `inline` and `inline-sheet` retain their existing gallery/variant rendering and controls but now receive no sticky class, controller, placeholder, relocation layer, or sticky position. Only `inline-sticky` enters the new layout lifecycle. The Snap2 fixture overrides that existed solely to neutralize the old class were also removed. The complete trees are no longer byte-identical, so this note confirms the scoped correction only.

After rebuilding port 3008, compare [ordinary inline](http://localhost:3008/tests/inline-sticky-desktop-no-header.html?desktopMode=inline&mobileMode=inline), [ordinary inline-sheet](http://localhost:3008/tests/inline-sticky-desktop-no-header.html?desktopMode=inline-sheet&mobileMode=inline), and [inline-sticky](http://localhost:3008/tests/inline-sticky-desktop-no-header.html). The first two must scroll normally with no sticky host attributes/classes; the last must remain sticky. Both trees type-check, the focused config suite passes 6/6, and Playwright discovers 21 cases in the sticky file, including one regression that checks both ordinary modes. No build or browser test was run.

## Bug 39: mobile body-layer header overlap ready to rebuild

At 390 x 844 in the fixed-header body-layer fixture, a sticky option header could geometrically overlap the pinned red viewer and paint above it because its z10 escaped the variants surface while the gallery was capped inside the body layer's z1 stacking context. Active `.ov25-inline-sticky-list-mobile` now uses `isolation: isolate`, containing option/group z10/z9 above their cards but below the body layer; the fixed site header remains above the unchanged z1 layer.

The new E2E performs a bounded search through the variants section for a real header/viewer intersection, then requires `elementFromPoint` to resolve to the gallery at that overlap and to the fixed site header inside the header. Before image: [bug-39-body-layer-header-overlap-before.png](../review-screenshots/bug-39-body-layer-header-overlap-before.png). TypeScript passes and Playwright discovers 21 tests in the sticky file; rebuild and runtime verification remain pending.

## Bug 39: mobile full-bleed seam fix ready to rebuild

Mobile normal-product `inline-sticky` now temporarily clears all four border widths and padding edges on the OV25-owned outer gallery host. This covers native sticky, Popover, and body-layer fallback paths; desktop merchant border/padding remains unchanged, and responsive exit/unmount restores the previous inline styles property by property.

The shared mobile E2E helper now asserts zero border/padding on every edge and verifies the injected gallery root aligns with all four host edges within 1px. TypeScript passes and Playwright now discovers 21 tests in the sticky file, including the later body-layer stacking and ordinary-mode isolation regressions. No build or browser E2E was run; rebuild port 3008 before visually rechecking the scrolled mobile fixture.

## Bug 39: integration selector settings are ready for cross-repo review

The proposed OV25 PluginSettings patch exposes `ov25HeaderQuerySelector` alongside the separate `ov25DesktopCarouselQuerySelector` and `ov25MobileCarouselQuerySelector` metafields. It is not present on current OV25 `main`; its focused review diff still applies cleanly and must be applied/reviewed before release. The dirty Shopify Liquid/runtime adapter changes already forward all three values. All three selectors are integration-only: saved shop-default/product setup values are discarded, a nonblank PluginSettings value supplies the runtime selector, and a blank header value uses automatic detection. Legacy Auto Carousel remains separate.

WooCommerce now has equivalent Header, Desktop Carousel Target, and Mobile Carousel Target selector options. They are sanitized, persisted, localized, and trimmed before runtime use. Saved setup values for all three keys are discarded; a nonblank Woo header supplies the runtime override and a blank field uses automatic detection.

Normal-product mobile `inline-sticky` remains the only implicit relocation path: `ov25-ui` owns its `[data-ov25-sticky-mobile-carousel]` fallback. The dirty Shopify workspace provides that target through an untracked app block; the dirty Woo workspace emits exactly one matching target immediately before every active classic/block variants placeholder, including hidden-variants/simple-configure paths. Each Woo target contains a hidden `.ov25-placeholder` child to avoid theme `:empty` rules. The responsive sticky fixtures intentionally configure neither selector. Focused review artifacts are linked from [bugs-ready-for-review.md](bugs-ready-for-review.md); no integration bundle was built.

Release dependency: OV25 and WooCommerce still reference `ov25-ui-react18` `0.7.2`. They must be updated to the release containing Bug 39 before deploying these settings. Shopify's generated/ignored configurator bundle must also be rebuilt after that runtime release.

## Historical OV25 conflict-marker note

An earlier dirty OV25 tree reported conflict markers in `lib/org-auto-cutouts/assets.ts`. Current OV25 `main` has no tracked working-tree diff, so that condition is no longer part of the Bug 39 review state.

## Bug 39: carousel selectors are runtime-only and viewport-specific

Runtime `SelectorsConfig` now accepts separate `desktopCarousel` and `mobileCarousel` targets. Desktop never consumes the mobile selector and mobile never consumes the desktop selector. Ordinary non-Snap2 modes with a blank or missing selector keep one embedded carousel. Normal-product mobile `inline-sticky` remains the one implicit case: when `mobileCarousel` is absent it tries `[data-ov25-sticky-mobile-carousel]`, then keeps the embedded carousel and emits a diagnostic if that target is not in the DOM. Snap2 ignores both fields.

Configurator Setup owns neither field: there is no carousel-target control/default/form state, legacy imported or localStorage values are discarded, and setup export cannot emit either key. The three responsive inline-sticky fixtures omit explicit carousel selectors, so desktop remains embedded while mobile exercises the built-in target. The ordinary [carousel relocation fixture](http://localhost:3008/tests/carousel-relocation.html) is deterministic: it always configures permanent desktop/mobile targets, visually shows only the current target, and switches desktop -> mobile -> desktop without duplicate hosts or iframe replacement. Missing/blank/error and dynamic-target behavior remains unit-tested rather than exposed through fixture controls.

Automated status for this follow-up: the focused carousel/setup run passes 44/44, TypeScript passes, and Playwright now discovers 24 relevant cases. No build or runtime E2E was run; rebuild remains user-owned.

## Bug 39: natural-sizing edge cases are ready to rebuild

Desktop `inline-sticky` keeps the gallery at its natural size and treats available viewport height as a maximum. The `.ov25-inline-sticky-iframe-slot` target now exists only while sticky layout is active, so a client override cannot leak into ordinary inline/modal/sheet/drawer sizing. A Popover fallback caches its pre-relocation auto-sized desktop height and applies the current cap to that stable baseline, preventing a `700px -> 220px -> 700px` cap cycle from remaining at `220px`. Sticky host ownership also sets reversible `box-sizing: border-box`, keeping client padding/borders inside width and height caps.

After rebuilding/restarting port 3008, check:

- [Collapsing header](http://localhost:3008/tests/inline-sticky-desktop-collapsing-header.html): viewer size must remain constant while the header collapses, hides, returns, and the gallery exits its sticky boundary.
- [Embedded carousel](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?target=missing): square viewer plus carousel must remain within the available-height cap.
- [Compact client override](http://localhost:3008/tests/inline-sticky-desktop-fixed-header.html?viewer=compact&target=missing): viewer must render centered at 72% width with a 4:3 aspect ratio.
- [Responsive ownership/content-box](http://localhost:3008/tests/inline-sticky-desktop-no-header.html?mobileMode=inline&viewer=compact&hostBox=content-box): desktop sticky must use the compact 4:3 viewer and border-box cap; mobile ordinary inline must restore merchant content-box and default square sizing; returning to desktop must restore sticky-only 4:3 sizing without replacing the iframe.

Historical automated status: 112 focused unit tests passed in both trees (68 sticky plus 44 carousel/setup), TypeScript passed in both trees, and Playwright discovers 24 relevant cases. The runtime browser suite and after screenshots still require the rebuilt server. Bug 39 remains unapproved and is not commit-ready even though its complete 39-file `ov25-ui` implementation/test set is currently staged. The main implementation, divergent worktree, and worktree-stale/current-main-unsuitable consolidated diff described above must be reconciled before that index is committed.
