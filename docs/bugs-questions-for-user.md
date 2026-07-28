# Bug clarification questions

Last updated: 2026-07-28

Use this file as the short decision queue for bug work that cannot be safely implemented from the current repo state alone. Answering any item here can unblock a focused bug packet or subagent assignment. The fuller source notes remain in `docs/ov25_bugs_and_todo.md`.

Implementation-candidate audit: subagent `Parfit` checked the non-ready backlog on 2026-06-08 after excluding fixed/staged and ready-for-review items. It found no remaining non-ready item that is safe to implement without one of the decisions, repro details, design specs, or architecture choices below.

## Blocking current implementation choices

1. Bug 13, pure inline mode with `selectors.configureButton` but no `selectors.variants`: should setup/runtime reject or omit this invalid combination (recommended), or should it become a supported hybrid where the inline viewer stays on-page and Configure opens variants in a sheet/drawer? Browser verification on 2026-07-16 found `?inline=1` correctly suppresses inline controls but also leaves the replaced configure target empty; simply restoring the button would make desktop clicks inert because inline mode mounts no overlay. `?inline=1&variants=1` renders one inline variants panel and intentionally no Configure button.
2. Bed current-size filtering: should matching-size filtering be default-on for all existing bed embeds at runtime, or only default-on in new ov25-setup exports?
3. No-thumbnail variant fallback: Bug 15 is parked after invalid width descriptors were found, so this remains blocked until Bug 15 is redesigned and resumed; once resumed, should every all-missing-image option/group render compact text-only cards instead of placeholder-image cards?
4. Carousel max images: should the 360 slot count toward `carousel.maxImages`, or should `maxImages` continue to mean "max product/gallery images" plus the 360 item?
5. Selected gallery image behavior: should horizontal carousel image clicks change the in-page selected image to `object-contain`, or open the same fullscreen contain overlay used by stacked gallery clicks?
6. Multi-line item hidden options: should hidden options be filtered in Shopify/Woo host cart-property code, through a new ov25-ui opt-in such as `commerce.hideOptionsFromLineItems`, or by changing existing `variants.hideOptions` callback payload behavior?

## Needs page, product, or fixture data

1. Mobile woods 403: send the affected product/page and at least one failing image URL.
2. Ziggy hidden variants: if Bug 13 does not resolve it, send the exported setup JSON/current config.
3. Buy Now over fullscreen gallery: Bug 16 was closed because the valid stacked-gallery baseline already keeps fullscreen above controls. Send the exact page/layout only if a separate Snap2 checkout-sheet or client-theme case still fails.
4. Gallery scrolling page behind: Bug 22 fixed horizontal mouse-wheel leakage. Send an exact touch, stacked, fullscreen, or theme-specific repro if scrolling still reaches the page.
5. Mobile wizard Next button: send the exact fixture, device, and browser where the button cannot be clicked.
6. Defer3D modal/sheet follow-ups: send the exact failing fixture/page if the modal/sheet iframe visibility issue still happens.
7. Alexis product/config block: clarify whether this should become a fixture, a bug fix, or a data/config validation task.

## Snap2 decisions

1. Snap2 ghost box: re-enable the old rough selected-attachment preview, build an exact hovered/selected candidate-module preview, or limit the behavior to movable drag placement?
2. Snap2 Arlo ModuleBottomPanel start position: does the problem mean the panel docks in the wrong place, or that the bottom-panel carousel starts centered instead of aligned to the first/active module?
3. Mouse settings/disable pan: should ov25-ui/setup expose a runtime override for pan/zoom/rotate, or should this continue to rely on existing OV25 per-camera admin settings?
4. Unified menu/select side: approved Bug 24 already covers setup/export of variant-sheet and module-panel positions; the overlapping Bug 34 proposal is parked. Did the request also mean an interactive attachment-side selector inside the Snap2 module picker?

## Product/design specs needed

1. Data selectors/string interpolation/custom icons: Bug 32's setup catalog is committed and Bug 33's first runtime selector slice is parked. After Bug 33 resumes, continue exhaustive selector coverage, or first define public string-interpolation and custom-icon replacement contracts?
2. Filter display redesign: define display modes, defaults, setup controls, mobile behavior, and whether trigger-based filters remain as a compatibility option.
3. Accordion styles like Tamarisk: decide which parts to implement: plus/minus icons, animation, spacing/borders, filter placement, setup controls, and default vs opt-in behavior.
4. Sorting/categories/price deltas: define sort keys, category metadata source, setup exposure, and whether OV25 should provide per-selection price deltas or batch quote data.

## Architecture or productization choices

1. WooCommerce/Shopify setup-version dependency: should ov25-setup's exported `SerializableInjectConfig` become the canonical versioned setup schema, and what schema-version/migration policy must OV25, Shopify, and Woo support?
