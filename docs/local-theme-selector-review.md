# Local theme AI selector review

Generated 2026-10-07T14:31:20.828Z. Layout: **standard**. Model: **gemini-3.1-flash-lite**.

These are real Gemini placement-agent results from downloaded theme source. No Shopify API calls or store writes were made. Colours were not regenerated.

Compare these with the selectors configured for the same product template on the live store. Downloaded source and source confidence do not establish current deployment, rendered match counts, visibility or app-generated markup.

## Source review: do not apply this result as-is

The Gemini call succeeded, and its JSON passes the proposal contract, but the local source review found unsuitable targets. The raw JSON below is preserved exactly as returned and validated by the agent.

- **Gallery — unsuitable:** `.product-media-container` is one media tile in `snippets/product-thumbnail.liquid:53`, rendered repeatedly by the product-media loop in `snippets/product-media-gallery.liquid:92–125`. It does not represent the whole gallery. Gallery-level source hooks such as `.product__media-wrapper` or `media-gallery` need investigation.
- **Variants — unsuitable:** `.variant-option-item` is an individual value inside `for value in option.values` in `snippets/custom-product-variant-options.liquid:23,60`. Replacing it would not mount the configurator at the whole-controls level.
- **Price and cart form — scope unverified:** `.price` and `form[data-type="add-to-cart-form"]` also occur in card/quick-add paths. Main-product scoping and rendered uniqueness need checking.
- **Header — plausible from source:** `.header` identifies the header, but rendered dimensions and visibility were not tested.
- **Template scope:** the current local reader chose `templates/product.json`. Moy also has `templates/product.ov25-product.json`, which uses the same main-product section but adds an OV25 controls app block and `[data-ov25-configure-button]`. The current local plugin renders the controls block as `#ov25-configurator-controls-container`; its deployed version and live metafield settings were not read. Snap2 uses another template again.

This first test demonstrates that the current candidate extraction/selection needs refinement before automatic application. It does not confirm Moy's live configured selectors.

| Client | Inspected template | Candidates sent | With structure | Proposed targets | Status |
| --- | --- | ---: | ---: | ---: | --- |
| Moy Furniture | `templates/product.json` | 23 | 19 | 5 | complete |

## Moy Furniture

Template: `templates/product.json`. Layout: `standard`. Input: 21130 bytes.

[Result JSON](../dev/react-test/public/theme-selectors/moy-furniture.standard.json)

| Setting | AI proposal | Confidence | Evidence |
| --- | --- | --- | --- |
| `gallery` | `.product-media-container` | medium | `snippets/product-thumbnail.liquid` |
| `variants` | `.variant-option-item` | medium | `snippets/custom-product-variant-options.liquid` |
| `price` | `.price` | medium | `snippets/price.liquid` |
| `name` | No proposal | — | — |
| `swatches` | No proposal | — | — |
| `configureButton` | No proposal | — | — |
| `headerSelector` | `.header` | medium | `sections/header.liquid` |
| `desktopCarouselSelector` | No proposal | — | — |
| `mobileCarouselSelector` | No proposal | — | — |
| `addToCartFormSelector` | `form[data-type="add-to-cart-form"]` | medium | `snippets/buy-buttons.liquid`, `snippets/card-product.liquid` |

Agent reasoning:

- **headerSelector:** The header element is a standard semantic container for the site header.
- **price:** The .price class is a standard container for product pricing information.
- **gallery:** The .product-media-container is a standard container for product media.
- **variants:** The .variant-option-item is a dedicated container for individual variant options.
- **addToCartFormSelector:** The form with data-type='add-to-cart-form' is the explicit target for the add-to-cart action.

Warnings:

- Source evidence only: Liquid conditions, app blocks, JavaScript changes, visibility and selector match counts have not been verified in a rendered product page. Review before applying.
- Inspected templates/product.json; other product templates may use different targets.
- The selected template uses app blocks whose markup is not present in the theme source. Their selectors cannot be inferred from app names.
- Structural context budget reached; only a bounded sample of candidate occurrences was retained.
- 4 source candidates have no safely parsed structural outline; surrounding markup is unavailable for those choices.
- Some structural outlines are partial because of source limits, Liquid or incomplete markup; they are not rendered DOM trees.
- Multiple price candidates were identified; candidate-2 was selected as the most representative container.
- Candidate-23 was ignored in favor of candidate-1 for the headerSelector as they target the same element.
- No source-backed proposal for: name, swatches, configureButton, desktopCarouselSelector, mobileCarouselSelector. Existing choices should be kept or selected manually.
