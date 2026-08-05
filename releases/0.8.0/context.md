# Release Review Context: ov25-ui@0.8.0

Status: raw context only
Bump: minor
Current version: 0.7.3
Target version: 0.8.0
Base: ov25-ui@0.7.3 (b56f81794911)
Head: HEAD (521ef22c71b2)
Branch: main
Generated: 2026-08-05T08:26:05.424Z

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

- releaseDir: `releases/0.8.0`
- contextJson: `releases/0.8.0/context.json`
- contextMarkdown: `releases/0.8.0/context.md`
- commits: `releases/0.8.0/commits.txt`
- changedFiles: `releases/0.8.0/changed-files.txt`
- diffStat: `releases/0.8.0/diff-stat.txt`
- diffPatch: `releases/0.8.0/diff.patch`

## Package Artifact Safety

- ov25-ui package files: ["dist"]
- ov25-setup package files: ["dist"]
- ov25-ui excludes release artifacts: yes
- ov25-setup excludes release artifacts: yes

## Working Tree Status

```text
?? releases/0.8.0/
```

## Committed Changes

### Commits

```text
521ef22 (HEAD -> main, origin/main, origin/HEAD) update(docs) various docs and .md files for inline-sticky and bug fixing leading up to 0.8.0
8a7c85a fix(tests) run playwright headless, fix tests
dbc0bc9 fix(images): limit weave fallback to materials
35a14c7 fix(setup) bun lockfile was failing tests
ee7bf4f chore(git): ignore local worktrees
f8da121 fix(ov25-ui) comment update
ad400f6 fix(sticky): detect short gallery boundaries (fix for setup inline-sticky preview)
50fd555 fix(setup): remount preview on device change
239fa6a feat(test) update test fixture
d7c2de7 fix(setup) fix configurator-preview not previewing inline-sticky correctly
4dc3c24 fix(snap2) fix case where share/save dialog for snap2 desktop would appear behind main snap2 dialog is configuration uuid was provided to snap2.
3fcc699 (codex/bug-53-snap2-confirm-layer) fix(tests) various test reorder
b5e26a7 fix(mobile): keep modal close button visible (with deferThreeD it would be hidden if configurator is not selected before opening)
e3b6c89 fix(tests) maze snap2 mobile full width in fixture
429b4f9 feat(ov25-ui) add accessible iframe title for SEO
0df85c3 feat(ov25-ui) placeholder image for when selection is missing image
8f25bbb fix(tests) consolidate test
4d038ec fix: restore desktop configurator auto-open
89d4d98 fix(mobile) configuratorViewControls were not appearing  in drawer/sheet when defer3D was on.
2695ce4 fix(tests) various test suite optimise
3db1114 feat(docs) docs and skills updates
a9eb0f7 docs(ov25-ui) various docs and records for bug fixing, inline-sticky implementation
fad225f feat(ov25-ui) inline-sticky and moveable header
f512d69 Merge remote-tracking branch 'origin/main'
7588490 feat(bugs) various ledgers and markdown files for tracking fixed/parked/todo bugs.
51c9269 fix(gitignore) add .pnpm-store to gitignore
067c385 (feat) script for ai to check and debug local fixtures with playwright
86bfa86 fix(test) forgotted test update
f4d1242 fix(gitignore) remove .DS_Store (its in gitignore but was tracked)
8ddf84d docs(configurator): clarify iframe query merge
715a959 feat(variants): support accordion on mobile
8e68f5d fix(snap2) minor spacing so "View Cart" button is in same place as "Buy Now/Add To Cart"
e31a9bd feat(setup) export default configurator settings for use by OV25 when settings initial shopify metafield values. ensure .css files have correct filename
248cee1 fix(test fixture) snap2-uuid update with new configuratorUuid
85ce00c fix(test fixture) snap2 dialog mobile
b748b6e feat(configurator): add gesture hint opt-out to injectConfigurator and setup
bf9e635 fix(swatchbook) fix broken/wonky swatchbook layout on mobile
f45914f fix(variants): default thumbnails to square
b934bc4 fix(variant image) revert accidental change that applied swatch outline to variants
a08acd3 feat(checkout): add disableBuyNow flag (inject, setup, etc)
ca27d58 fix(setup) fix bug where leaving the tab would cause setup UI to refresh and reset to defaults.
459fac3 fix(setup) add missing configurator-style-variables
73ac99b fix(types): accept tiered product images
06321d5 (codex/bug-46-product-image-input, codex/bug-45-commerce-line-images, codex/bug-44-host-toast-ui, codex/bug-43-snap2-module-prices-ui, codex/bug-42-module-actions) fix(snap2) show tooltips instead of inline titles for snap2 initialise menu. mobile cant show tooltip. both available in dom for css hide/show.
1c784b5 (codex/inline-sticky) fix(carousel) add data-selected to carousel thumbnails
b8038ed fix(swatches) make empty swatch outline the same as the jagged filled swatch outline
27cadb7 feat(dev)  new tests
967dc47 feat(react-test) 3 new test fixtures.
76f4031 fix(sheet) stop page-level reflows when useIframePositioning relocates the iframe and opens sheets (retains size of gallery, and accounts for scrollbar width). add reflow debug test fixture
4e20397 fix(size-variant-card) add proper targetable classes to all SizeVariantCard parts.
3a9faad fix(ov25-ui) update gitignore
4600b46 feat(react-test) add test fixture for variants with missing thumbs
d262314 fix(snap2) stop rendering mobile drawer when we are supposed to render snap2 mobile dialog. fix scroll on snap2 mobile dialog checkout sheet. fix rounded borders on snap2 mobile dialog. fix view cart padding to match checkout buttons.
fb96197 delete useless .md
eaa808d refactor(z-index) extract and standardise z-index on body-level portals (layers.ts)
06eb331 fix(setup): preserve Snap2 export config
0248b9a feat(react-test) upgrade responsize configurator test fixture
43acd5f fix (setup): hydrate host CSS color variables (we switched from :root to :host and didnt update loader). handle legacy
0bcfc73 make scrolling scroll the carousel before it scrolls the main page
```

### Diff Stat

```text
.DS_Store                                          |  Bin 10244 -> 0 bytes
 .gitignore                                         |    7 +-
 dev/react-test/index.html                          |   23 +-
 dev/react-test/tests/Maze_snap2.jsx                |    2 +-
 dev/react-test/tests/animation-test.jsx            |    5 +-
 dev/react-test/tests/bed-configurator.jsx          |    2 +-
 dev/react-test/tests/carousel-relocation.html      |   12 +
 dev/react-test/tests/carousel-relocation.jsx       |  103 +
 dev/react-test/tests/cart-thumbnail.html           |   12 +
 dev/react-test/tests/cart-thumbnail.jsx            |  563 ++++
 dev/react-test/tests/configurator-setup.jsx        |   70 +-
 dev/react-test/tests/configurator-sizing.jsx       |  220 +-
 dev/react-test/tests/gallery-carousel-stacked.jsx  |    2 +-
 .../gallery-inline-list-no-variant-thumbs.html     |   12 +
 .../gallery-inline-list-no-variant-thumbs.jsx      |   95 +
 .../inline-sticky-desktop-collapsing-header.html   |   12 +
 .../tests/inline-sticky-desktop-fixed-header.html  |   12 +
 .../tests/inline-sticky-desktop-no-header.html     |   12 +
 dev/react-test/tests/inline-sticky-fixture.jsx     |  597 ++++
 .../tests/inline-variants-disable-add-to-cart.jsx  |   16 +-
 .../{single-no-groups.html => product-list.html}   |    4 +-
 .../{single-no-groups.jsx => product-list.jsx}     |   17 +-
 .../tests/range-with-hidden-size-buttons.html      |   13 +
 .../tests/range-with-hidden-size-buttons.jsx       |  284 ++
 dev/react-test/tests/sheet-reflow-debug.html       |   13 +
 dev/react-test/tests/sheet-reflow-debug.jsx        |  393 +++
 dev/react-test/tests/single-custom-button.jsx      |   12 +-
 dev/react-test/tests/single-custom-css-snap2.jsx   |   12 -
 dev/react-test/tests/single-no-pricing.jsx         |    1 -
 dev/react-test/tests/single-product-gallery.jsx    |    1 -
 dev/react-test/tests/single-with-discounts.jsx     |    1 -
 dev/react-test/tests/single-with-groups.jsx        |    1 -
 dev/react-test/tests/snap2-dialog.jsx              |    2 +-
 dev/react-test/tests/snap2-inline.jsx              |   12 -
 dev/react-test/tests/snap2-uuid.jsx                |   10 +-
 dev/react-test/tests/split-variant-triggers.jsx    |    1 -
 dev/react-test/vite.config.js                      |    9 +-
 docs/IMPORTANT_BUGS.md                             |   41 +
 docs/IMPORTANT_NOTES.md                            |  216 ++
 docs/PARKED_BUGS.md                                |  949 +++++++
 docs/bugs-questions-for-user.md                    |   44 +
 docs/bugs-ready-for-review.md                      |   24 +
 docs/bugs-resolved.md                              |  164 ++
 docs/inline-sticky-report.md                       |  527 ++++
 docs/ov25-docs-gap-audit.md                        |  125 +
 docs/ov25_bugs_and_todo.md                         |  792 ++++++
 docs/sticky-display-mode-architecture.md           |  631 ++++
 docs/sticky-header-autodetection-audit.md          |  232 ++
 globals.css                                        |  192 +-
 playwright.config.ts                               |    6 +-
 scripts/check-local-fixture.mjs                    |  593 ++++
 scripts/ensure-setup-css-output.js                 |   18 +
 setup/bun.lock                                     |    6 +-
 setup/package.json                                 |    6 +-
 .../ConfiguratorSetup/ConfigPanel/index.tsx        |  101 +-
 .../ConfiguratorSetup/PreviewArea/index.tsx        |   24 +-
 setup/src/components/ConfiguratorSetup/index.tsx   |    9 +-
 .../initial-config-from-payload.ts                 |  144 +-
 .../preview-config-serializable.ts                 |    4 +
 .../ConfiguratorSetup/serialize-config.ts          |  243 ++
 setup/src/components/ConfiguratorSetup/types.ts    |   25 +-
 .../ConfiguratorSetup/useConfiguratorSetup.ts      |  203 +-
 setup/src/defaults.ts                              |    6 +
 setup/src/index.ts                                 |    6 +-
 .../src/lib/config/configurator-style-variables.ts |   20 +-
 setup/vite.config.ts                               |   11 +-
 src/components/ConfiguratorModal.tsx               |   12 +-
 src/components/ConfiguratorViewControls.tsx        |   13 -
 src/components/IframeContainer.tsx                 |  224 +-
 src/components/Snap2CheckoutSheet.tsx              |    2 +-
 src/components/Snap2ConfiguratorModal.tsx          |   29 +-
 src/components/Snap2ConfigureButton.tsx            |   10 +-
 src/components/Snap2SettingsSheet.tsx              |    5 +-
 src/components/Snap2VariantSheetColumn.tsx         |   14 +-
 .../VariantSelectMenu/AccordionVariants.tsx        |    6 +-
 .../VariantSelectMenu/CheckoutButton.tsx           |    8 +-
 .../VariantSelectMenu/DesktopVariants.tsx          |    3 +-
 .../VariantSelectMenu/InitialiseMenu.tsx           |    3 +-
 .../VariantSelectMenu/MobileCheckoutButton.tsx     |    4 +-
 .../VariantSelectMenu/MobileVariants.tsx           |    3 +-
 .../VariantSelectMenu/ModuleBottomPanel.tsx        |    2 +-
 .../VariantSelectMenu/ProductVariantsWrapper.tsx   |   83 +-
 .../VariantSelectMenu/Snap2ModulesOptionBody.tsx   |    2 +-
 src/components/VariantSelectMenu/SwatchBook.tsx    |   45 +-
 src/components/VariantSelectMenu/TreeVariants.tsx  |    6 +-
 .../VariantSelectMenu/VariantSelectMenu.tsx        |  103 +-
 .../VariantSelectMenu/WizardVariants.tsx           |    9 +-
 .../variant-cards/ModuleVariantCard.tsx            |   49 +-
 .../variant-cards/SizeVariantCard.tsx              |   29 +-
 .../variant-cards/VariantThumb.tsx                 |   11 +-
 src/components/ar-preview-qr-code-dialog.tsx       |    4 +-
 src/components/product-carousel.tsx                |  146 +-
 src/components/product-gallery.tsx                 |  109 +-
 src/components/ui/dialog.tsx                       |   26 +-
 src/contexts/ov25-ui-context.tsx                   |  384 ++-
 src/hooks/useIframePositioning.tsx                 |   78 +-
 src/hooks/useStickyHostRelocation.ts               |  796 ++++++
 src/index.ts                                       |    1 +
 src/lib/carousel-target-controller.ts              |  383 +++
 src/lib/config/iframe-transition-snapshot.ts       |   11 +-
 src/lib/config/layers.ts                           |   19 +
 src/lib/placeholder-image.ts                       |    1 +
 src/lib/sticky-layout-controller.ts                | 2356 +++++++++++++++
 src/placeholder.svg                                |   57 +-
 src/types/config-enums.ts                          |    3 +-
 src/types/dining-inject-config.ts                  |    2 +
 src/types/inject-config.ts                         |   79 +-
 src/utils/configurator-utils.ts                    |   34 +-
 src/utils/inject-dining.tsx                        |   13 +-
 src/utils/inject.tsx                               |  159 +-
 test/e2e/carousel-relocation.test.ts               |   80 +
 test/e2e/gallery-sheet-list-auto-open.test.ts      |   78 +
 test/e2e/hidden-logo.test.ts                       |   45 +-
 test/e2e/inline-sticky.test.ts                     | 2999 ++++++++++++++++++++
 .../inline-variants-disable-add-to-cart.test.ts    |   26 +
 ...isable-add-to-cart-checkout-chromium-darwin.png |  Bin 2885 -> 3002 bytes
 test/e2e/single-no-variants.test.ts                |  206 +-
 ...-no-variants-initial-canvas-chromium-darwin.png |  Bin 222011 -> 256560 bytes
 test/unit/carousel-target-controller.test.ts       |  291 ++
 test/unit/configurator-modal-close.test.tsx        |   73 +
 .../configurator-setup-hide-gesture-hint.test.ts   |   47 +
 .../unit/configurator-setup-initial-config.test.ts |  399 +++
 .../configurator-setup-preview-remount.test.tsx    |   30 +
 test/unit/configurator-setup-preview-url.test.ts   |   38 +
 .../configurator-setup-style-hydration.test.ts     |   87 +
 test/unit/hide-gesture-hint.test.ts                |   88 +
 test/unit/iframe-container-mobile-close.test.tsx   |  249 ++
 test/unit/iframe-container-title.test.tsx          |  261 ++
 test/unit/inline-sticky-config.test.ts             |  119 +
 test/unit/modal-portal.test.ts                     |  100 +
 test/unit/placeholder-image-fallback.test.tsx      |  203 ++
 test/unit/product-carousel.test.tsx                |  212 ++
 test/unit/sticky-host-relocation.test.ts           | 1193 ++++++++
 test/unit/sticky-layout-controller.test.ts         | 1731 +++++++++++
 test/unit/sticky-layout-metrics.test.ts            |  585 ++++
 test/unit/variant-select-menu-role.test.ts         |   36 +
 136 files changed, 21736 insertions(+), 701 deletions(-)
```

### Changed Files

```text
.DS_Store
.gitignore
dev/react-test/index.html
dev/react-test/tests/Maze_snap2.jsx
dev/react-test/tests/animation-test.jsx
dev/react-test/tests/bed-configurator.jsx
dev/react-test/tests/carousel-relocation.html
dev/react-test/tests/carousel-relocation.jsx
dev/react-test/tests/cart-thumbnail.html
dev/react-test/tests/cart-thumbnail.jsx
dev/react-test/tests/configurator-setup.jsx
dev/react-test/tests/configurator-sizing.jsx
dev/react-test/tests/gallery-carousel-stacked.jsx
dev/react-test/tests/gallery-inline-list-no-variant-thumbs.html
dev/react-test/tests/gallery-inline-list-no-variant-thumbs.jsx
dev/react-test/tests/inline-sticky-desktop-collapsing-header.html
dev/react-test/tests/inline-sticky-desktop-fixed-header.html
dev/react-test/tests/inline-sticky-desktop-no-header.html
dev/react-test/tests/inline-sticky-fixture.jsx
dev/react-test/tests/inline-variants-disable-add-to-cart.jsx
dev/react-test/tests/product-list.html
dev/react-test/tests/product-list.jsx
dev/react-test/tests/range-with-hidden-size-buttons.html
dev/react-test/tests/range-with-hidden-size-buttons.jsx
dev/react-test/tests/sheet-reflow-debug.html
dev/react-test/tests/sheet-reflow-debug.jsx
dev/react-test/tests/single-custom-button.jsx
dev/react-test/tests/single-custom-css-snap2.jsx
dev/react-test/tests/single-no-pricing.jsx
dev/react-test/tests/single-product-gallery.jsx
dev/react-test/tests/single-with-discounts.jsx
dev/react-test/tests/single-with-groups.jsx
dev/react-test/tests/snap2-dialog.jsx
dev/react-test/tests/snap2-inline.jsx
dev/react-test/tests/snap2-uuid.jsx
dev/react-test/tests/split-variant-triggers.jsx
dev/react-test/vite.config.js
docs/IMPORTANT_BUGS.md
docs/IMPORTANT_NOTES.md
docs/PARKED_BUGS.md
docs/bugs-questions-for-user.md
docs/bugs-ready-for-review.md
docs/bugs-resolved.md
docs/inline-sticky-report.md
docs/ov25-docs-gap-audit.md
docs/ov25_bugs_and_todo.md
docs/sticky-display-mode-architecture.md
docs/sticky-header-autodetection-audit.md
globals.css
playwright.config.ts
scripts/check-local-fixture.mjs
scripts/ensure-setup-css-output.js
setup/bun.lock
setup/package.json
setup/src/components/ConfiguratorSetup/ConfigPanel/index.tsx
setup/src/components/ConfiguratorSetup/PreviewArea/index.tsx
setup/src/components/ConfiguratorSetup/index.tsx
setup/src/components/ConfiguratorSetup/initial-config-from-payload.ts
setup/src/components/ConfiguratorSetup/preview-config-serializable.ts
setup/src/components/ConfiguratorSetup/serialize-config.ts
setup/src/components/ConfiguratorSetup/types.ts
setup/src/components/ConfiguratorSetup/useConfiguratorSetup.ts
setup/src/defaults.ts
setup/src/index.ts
setup/src/lib/config/configurator-style-variables.ts
setup/vite.config.ts
src/components/ConfiguratorModal.tsx
src/components/ConfiguratorViewControls.tsx
src/components/IframeContainer.tsx
src/components/Snap2CheckoutSheet.tsx
src/components/Snap2ConfiguratorModal.tsx
src/components/Snap2ConfigureButton.tsx
src/components/Snap2SettingsSheet.tsx
src/components/Snap2VariantSheetColumn.tsx
src/components/VariantSelectMenu/AccordionVariants.tsx
src/components/VariantSelectMenu/CheckoutButton.tsx
src/components/VariantSelectMenu/DesktopVariants.tsx
src/components/VariantSelectMenu/InitialiseMenu.tsx
src/components/VariantSelectMenu/MobileCheckoutButton.tsx
src/components/VariantSelectMenu/MobileVariants.tsx
src/components/VariantSelectMenu/ModuleBottomPanel.tsx
src/components/VariantSelectMenu/ProductVariantsWrapper.tsx
src/components/VariantSelectMenu/Snap2ModulesOptionBody.tsx
src/components/VariantSelectMenu/SwatchBook.tsx
src/components/VariantSelectMenu/TreeVariants.tsx
src/components/VariantSelectMenu/VariantSelectMenu.tsx
src/components/VariantSelectMenu/WizardVariants.tsx
src/components/VariantSelectMenu/variant-cards/ModuleVariantCard.tsx
src/components/VariantSelectMenu/variant-cards/SizeVariantCard.tsx
src/components/VariantSelectMenu/variant-cards/VariantThumb.tsx
src/components/ar-preview-qr-code-dialog.tsx
src/components/product-carousel.tsx
src/components/product-gallery.tsx
src/components/ui/dialog.tsx
src/contexts/ov25-ui-context.tsx
src/hooks/useIframePositioning.tsx
src/hooks/useStickyHostRelocation.ts
src/index.ts
src/lib/carousel-target-controller.ts
src/lib/config/iframe-transition-snapshot.ts
src/lib/config/layers.ts
src/lib/placeholder-image.ts
src/lib/sticky-layout-controller.ts
src/placeholder.svg
src/types/config-enums.ts
src/types/dining-inject-config.ts
src/types/inject-config.ts
src/utils/configurator-utils.ts
src/utils/inject-dining.tsx
src/utils/inject.tsx
test/e2e/carousel-relocation.test.ts
test/e2e/gallery-sheet-list-auto-open.test.ts
test/e2e/hidden-logo.test.ts
test/e2e/inline-sticky.test.ts
test/e2e/inline-variants-disable-add-to-cart.test.ts
test/e2e/inline-variants-disable-add-to-cart.test.ts-snapshots/inline-variants-disable-add-to-cart-checkout-chromium-darwin.png
test/e2e/single-no-variants.test.ts
test/e2e/single-no-variants.test.ts-snapshots/single-no-variants-initial-canvas-chromium-darwin.png
test/unit/carousel-target-controller.test.ts
test/unit/configurator-modal-close.test.tsx
test/unit/configurator-setup-hide-gesture-hint.test.ts
test/unit/configurator-setup-initial-config.test.ts
test/unit/configurator-setup-preview-remount.test.tsx
test/unit/configurator-setup-preview-url.test.ts
test/unit/configurator-setup-style-hydration.test.ts
test/unit/hide-gesture-hint.test.ts
test/unit/iframe-container-mobile-close.test.tsx
test/unit/iframe-container-title.test.tsx
test/unit/inline-sticky-config.test.ts
test/unit/modal-portal.test.ts
test/unit/placeholder-image-fallback.test.tsx
test/unit/product-carousel.test.tsx
test/unit/sticky-host-relocation.test.ts
test/unit/sticky-layout-controller.test.ts
test/unit/sticky-layout-metrics.test.ts
test/unit/variant-select-menu-role.test.ts
```
