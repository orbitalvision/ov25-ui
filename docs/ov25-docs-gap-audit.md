# OV25 Docs Gap Audit

Originally audited: 2026-06-08
Reconciled with current repositories and bug ledgers: 2026-07-28

Scope: read-only audit of `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-docs/content/docs/**` against current `ov25-ui` runtime/setup contracts and the active bug review queue.

## Docs Structure Inspected

- `developer`: integration, setup, plugin, Shopify, and WordPress docs.
- `retailer`: product management, swatches, and security docs.
- `fabrics`: fabric workflow docs.
- `manufacturer` and `admin`: lighter operational sections.

Key docs inspected:

- `content/docs/developer/ui-package-integration.mdx`
- `content/docs/developer/configurator-styling.mdx`
- `content/docs/developer/build-a-plugin.mdx`
- `content/docs/developer/shopify.mdx`
- `content/docs/developer/wordpress.mdx`

## Prioritized Gaps

1. Full `InjectConfiguratorOptions` refresh
   - Why: plugin authors can ship stale configs if the main integration page omits current fields.
   - Source/features: `src/types/inject-config.ts`; `root`, `initialiseMenu`, `inline-sheet`, `configurationUuid`, `uniqueId`, `branding.hideLogo`, `flags.disableBuyNow`, `flags.hideGestureHint`, `flags.currencySymbol`, public product-image tiers, `bed`, `dining`, and Snap2 positions. Bug 39 additionally proposes `inline-sticky` plus integration-owned `header`, `desktopCarousel`, and `mobileCarousel` selectors, but it is not approved.
   - Target: `content/docs/developer/ui-package-integration.mdx`.

2. Setup UI/export contract is stale
   - Why: integrators using `ov25-setup` need the saved JSON shape.
   - Source/features: `setup/src/components/ConfiguratorSetup/types.ts`, `setup/src/components/ConfiguratorSetup/useConfiguratorSetup.ts`; standard/Snap2/bed layouts, `variants-only-sheet`, bed allow-none/filter flags, `disableBuyNow`, `hideGestureHint`, `hideLogo`, `hideOptions`, Snap2 module/variant positions, saved `:host` style hydration, and tab-draft persistence.
   - Target: `content/docs/developer/ecommerce-configurator-setup.mdx` and `content/docs/developer/ui-package-integration.mdx`.

3. Shopify/Woo pages lag plugin architecture
   - Why: platform docs still emphasize older selector/settings flows, and Woo product ID docs do not cover Snap2/bed/dining clearly.
   - Source/features: `content/docs/developer/build-a-plugin.mdx` already has newer productLink shapes and cart guidance.
   - Target: `content/docs/developer/shopify.mdx`, `content/docs/developer/wordpress.mdx`.

4. Variant display modes need a practical guide
   - Why: current docs list modes but do not explain behavior differences, selector requirements, inline vs sheet/drawer/modal interactions, or `variants-only-sheet`.
   - Source/features: `src/components/VariantSelectMenu/**`, `dev/react-test/tests/**`, `variants.hideOptions`, `useSimpleVariantsSelector`, `configureButton`, and the unapproved Bug 39 `inline-sticky` behavior.
   - Target: new `content/docs/developer/variant-display-modes.mdx`.

5. Snap2 layout/options docs are incomplete
   - Why: Snap2 is a major integration path, but public docs mostly treat it as a productLink/cart mode.
   - Source/features: supported setup modes (desktop Dialog/Inline; mobile Dialog/Drawer/Inline), `configurator.variants.position`, `configurator.modules.position`, `initialiseMenu`, `configurationUuid`, save/load UI, and controls ownership.
   - Target: new `content/docs/developer/snap2-integration.mdx`.

6. Swatch developer docs need runtime callback/cart details
   - Why: retailer swatch docs cover dashboard setup, but integration docs need `buySwatches`, swatch page, product page triggers, and pricing expectations.
   - Source/features: `src/components/VariantSelectMenu/SwatchBook.tsx`, callback types in `src/types/inject-config.ts`, platform swatch endpoints.
   - Target: `content/docs/developer/build-a-plugin.mdx`, platform pages, or new `content/docs/developer/swatches.mdx`.

7. Image/source/srcset behavior should be public
   - Why: integration users need precedence rules for host `images[]`, OV25 metadata, gallery tiers, variant thumbnails, and Snap2/cart images.
   - Source/features: the parked Bug 15 packet in `docs/PARKED_BUGS.md` and retained `review-diffs/bug-thumbnail-srcset*.diff` artifacts (the implementation was removed from main), `src/utils/module-product-image-srcset.ts`, `src/components/product-carousel.tsx`, and committed Bug 46's public tiered product-image type.
   - Target: new `content/docs/developer/image-sources-and-thumbnails.mdx`.

8. Line item/currency docs need a canonical contract
   - Why: `currencySymbol` and bed raw line-item formatted strings are not clearly documented.
   - Source/features: `src/lib/config/currency-display.ts`, `src/commerce/normalize-iframe-commerce.ts`, `flags.currencySymbol`, raw `priceBreakdown`/`productBreakdowns`.
   - Target: `content/docs/developer/build-a-plugin.mdx`, `content/docs/developer/shopify.mdx`.

9. Bed configurator docs are missing
   - Why: bed is in setup/runtime but not documented as a first-class integration mode.
   - Source/features: `productLink: bed-configurator/{id}`, `bed.allowNone`, `bed.filterSelectionsByCurrentSize`, `CURRENT_BED_SIZE`, current-size filtering.
   - Target: new `content/docs/developer/bed-configurator.mdx` or a UI integration section.

10. Dining configurator docs are missing
    - Why: dining has runtime types and fixtures but little public integration guidance.
    - Source/features: `dining.displayMode`, `showAttachmentPoints`, style choice images, `dining-configurator/{id}` productLink.
    - Target: new `content/docs/developer/dining-configurator.mdx`.

11. Styling selector docs need updates
    - Why: committed size-card and setup-selector additions are not reflected publicly, while the broader runtime selector slice remains parked.
    - Source/features: committed Bug 7a size dimension selectors, committed Bug 32 setup selector catalog, and parked Bug 33 runtime name-selector slice.
    - Target: `content/docs/developer/configurator-styling.mdx`.

12. Release/versioning docs need clearer package/plugin coordination
    - Why: the current bug list calls out Woo/Shopify dependency on iframe/setup versions; docs mention semver generally but not runtime/setup/plugin compatibility or release ordering.
    - Source/features: `docs/release-automation-and-shopify-runtime-versioning-plan.md`, `ov25-ui`, `ov25-setup`, Shopify/Woo deployment contracts.
    - Target: new `content/docs/developer/versioning-and-compatibility.mdx`.

## Wait For Approval Before Documenting As Shipped

- Bug 39 `inline-sticky`, header detection/override, and desktop/mobile carousel relocation selectors.
- Parked Bug 15 thumbnail `srcset` redesign and the separate no-thumbnail production fallback.
- Bed current-size default behavior and any unresolved bed line-item currency contract.
- Bug 27 Snap2 drag bounds until its approved branch is merged into OV25 `main`.
- Parked Snap2 wheel rotation, module actions/pricing, range-name fallback, and setup style-variable ownership proposals.

## Approved Features Ready To Document

- Bug 7a size-card dimension selectors and Bug 32 setup selector catalog.
- Bug 7b sheet-mode reservation and scrollbar-gutter reflow prevention.
- `flags.disableBuyNow` and `flags.hideGestureHint`, including setup controls.
- Public tiered product-image input types from Bug 46.
- Snap2 setup selector/module-position export and supported desktop/mobile mode choices from Bug 24.
- Saved setup `:host` colour hydration and setup draft persistence.

## Suggested Next Step

After the currently ready review queue is approved, update `ov25-docs` in this order:

1. Refresh `ui-package-integration.mdx` with the current inject config contract.
2. Add the variant display modes guide.
3. Add the image sources and thumbnails guide.
4. Refresh platform docs for Shopify/Woo using the same cart/setup contract.
5. Add Snap2, bed, and dining pages as separate integration guides.
