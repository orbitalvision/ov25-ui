# OV25 Docs Gap Audit

Date: 2026-06-08

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
   - Source/features: `src/types/inject-config.ts`; `root`, `initialiseMenu`, `inline-sheet`, `configurationUuid`, `uniqueId`, `branding.hideLogo`, `flags.disableBuyNow`, `flags.currencySymbol`, `bed`, `dining`, Snap2 positions.
   - Target: `content/docs/developer/ui-package-integration.mdx`.

2. Setup UI/export contract is stale
   - Why: integrators using `ov25-setup` need the saved JSON shape.
   - Source/features: `setup/src/components/ConfiguratorSetup/types.ts`, `setup/src/components/ConfiguratorSetup/useConfiguratorSetup.ts`; standard/Snap2/bed layouts, `variants-only-sheet`, bed allow-none/filter flags, `disableBuyNow`, `hideLogo`, `hideOptions`.
   - Target: `content/docs/developer/ecommerce-configurator-setup.mdx` and `content/docs/developer/ui-package-integration.mdx`.

3. Shopify/Woo pages lag plugin architecture
   - Why: platform docs still emphasize older selector/settings flows, and Woo product ID docs do not cover Snap2/bed/dining clearly.
   - Source/features: `content/docs/developer/build-a-plugin.mdx` already has newer productLink shapes and cart guidance.
   - Target: `content/docs/developer/shopify.mdx`, `content/docs/developer/wordpress.mdx`.

4. Variant display modes need a practical guide
   - Why: current docs list modes but do not explain behavior differences, selector requirements, inline vs sheet/drawer/modal interactions, or `variants-only-sheet`.
   - Source/features: `src/components/VariantSelectMenu/**`, `dev/react-test/tests/**`, `variants.hideOptions`, `useSimpleVariantsSelector`, `configureButton`.
   - Target: new `content/docs/developer/variant-display-modes.mdx`.

5. Snap2 layout/options docs are incomplete
   - Why: Snap2 is a major integration path, but public docs mostly treat it as a productLink/cart mode.
   - Source/features: `configurator.displayMode: inline-sheet`, `configurator.variants.position`, `configurator.modules.position`, `initialiseMenu`, `configurationUuid`, save/load UI, controls ownership.
   - Target: new `content/docs/developer/snap2-integration.mdx`.

6. Swatch developer docs need runtime callback/cart details
   - Why: retailer swatch docs cover dashboard setup, but integration docs need `buySwatches`, swatch page, product page triggers, and pricing expectations.
   - Source/features: `src/components/VariantSelectMenu/SwatchBook.tsx`, callback types in `src/types/inject-config.ts`, platform swatch endpoints.
   - Target: `content/docs/developer/build-a-plugin.mdx`, platform pages, or new `content/docs/developer/swatches.mdx`.

7. Image/source/srcset behavior should be public
   - Why: integration users need precedence rules for host `images[]`, OV25 metadata, gallery tiers, variant thumbnails, and Snap2/cart images.
   - Source/features: `docs/image-source-precedence.md`, the parked Bug 15 packet in `PARKED_BUGS.md` and retained `review-diffs/bug-thumbnail-srcset*.diff` artifacts (the implementation was removed from main), `src/utils/module-product-image-srcset.ts`, and `src/components/product-carousel.tsx`.
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

11. Styling selector docs need updates after pending selector work
    - Why: styling docs will be stale once selector review items are approved.
    - Source/features: Bug 7a size dimension selectors, setup selector catalog, runtime name selector slice.
    - Target: `content/docs/developer/configurator-styling.mdx`.

12. Release/versioning docs need clearer package/plugin coordination
    - Why: the current bug list calls out Woo/Shopify dependency on iframe/setup versions; docs mention semver generally but not runtime/setup/plugin compatibility or release ordering.
    - Source/features: `docs/release-automation-and-shopify-runtime-versioning-plan.md`, `ov25-ui`, `ov25-setup`, Shopify/Woo deployment contracts.
    - Target: new `content/docs/developer/versioning-and-compatibility.mdx`.

## Wait For Approval Before Documenting As Shipped

- Bug 7a size-card dimension selectors.
- Bug 7b sheet-mode reservation/reflow behavior.
- Hide Buy Now / `disableBuyNow`.
- Thumbnail `srcset` and no-thumbnail fallback.
- Bed line-item currency symbol behavior.
- Selection postMessage readiness queue.
- Snap2 `configurationUuid` attachment points, overlapping replacement, drag clamp, and wheel rotation.
- Setup style-variable drift/version ownership.

## Suggested Next Step

After the currently ready review queue is approved, update `ov25-docs` in this order:

1. Refresh `ui-package-integration.mdx` with the current inject config contract.
2. Add the variant display modes guide.
3. Add the image sources and thumbnails guide.
4. Refresh platform docs for Shopify/Woo using the same cart/setup contract.
5. Add Snap2, bed, and dining pages as separate integration guides.
