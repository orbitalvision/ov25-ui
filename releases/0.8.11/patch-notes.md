# Release Draft: ov25-ui@0.8.11

Status: Approved for release
Bump: patch
Base: `ov25-ui@0.8.10` (`31b9a9a`)
Head: `92166cc`

## Customer-Facing Changes

### Features

- Added optional live product renders to the gallery. When enabled, the gallery shows the shopper's
  chosen material and four angles of their exact configuration, refreshed every time they change
  an option. Selecting an angle turns the 3D viewer to that view. Off by default, and enabled per
  product type with the new **Auto cutouts** switch in Configurator Setup.
- Option headings can now include the currently selected choice, for example
  "Fabric | Zelda Oyster", using the text overrides in Configurator Setup.

### Improvements

- With live renders enabled, the gallery now reads: chosen material, first product photo, 3D viewer,
  the four live angles, then the remaining product photos. The 3D viewer tile no longer shows a
  catalogue cutout behind it, since the live renders already show the configured product.
- When the 3D viewer is set to load on demand, the gallery now opens on the first product photo
  rather than the material swatch.
- The live render, material, and 3D viewer tiles can now each be styled individually with custom
  CSS, so stores can match them to their theme.
- Configurator Setup now uses the OV25 app's colours: sliders, switches, the Save button, the tab
  selector, and selected options use the OV25 pink in place of the previous green and blue-purple.
  Panel spacing on the Settings, Style, and integration tabs has also been tidied.

### Bug Fixes

- Fixed the sticky product gallery cutting off its thumbnail strip and showing an inner scrollbar
  when the thumbnails were taller than the space reserved for them. The strip is now sized to its
  thumbnails, and the stacked gallery layout is kept within half the screen height so the 3D
  viewer always stays visible.

## Visible Behavior Changes

- **All sticky (inline-sticky) galleries with a thumbnail strip, not only those using live
  renders:** the space reserved for the thumbnail strip is now measured instead of fixed. Where the
  thumbnails were shorter than the old fixed space, the 3D viewer is now slightly larger; where they
  were taller, the inner scrollbar is gone and the viewer is slightly smaller. Review the gallery on
  representative storefront themes before promotion.
- Live renders, the new gallery order, and the new opening tile only apply when **Auto cutouts** is
  switched on. Existing galleries are otherwise unchanged.

## Known Issues And Manual Testing Notes

- Live renders depend on the OV25 configurator supporting live angle capture. The release owner
  confirmed on 2026-09-23 that auto cutouts work against the production configurator.
- The Configurator Setup help text for Auto cutouts still says the renders are added "to the start
  of the gallery". Since this release they sit behind the 3D viewer tile. Merchant-visible copy only.
- Live renders are not available on Snap2 products; the option is ignored there.

## Developer / Integrator Notes

- **ov25-ui:** new optional `carousel.autoCutouts` (and legacy flat `carouselAutoCutouts`), default
  `false`. The iframe URL is unchanged unless it is `true`. `optionHeader` gains a
  `SELECTED_VARIANT_NAME` interpolation value; its default template is unchanged. No export,
  callback, payload, selector, or class was removed or renamed.
- **Gallery tile hooks:** every carousel and stacked gallery tile now carries
  `data-ov25-gallery-tile="360" | "material" | "cutout" | "image"`, and cutout tiles also carry
  `data-ov25-cutout-yaw` (`-45`, `0`, `-90`, `180`). Use these in `cssString` rather than tile
  position, which shifts with the material shot and `deferThreeD`.
- **ov25-setup:** visual refresh only. The new internal `Button` component is not exported; Setup's
  public exports, props, and saved payloads are unchanged.
- **`--ov25-sticky-carousel-height` is now written inline by the sticky layout controller.** A
  merchant `cssString` that set it without `!important` is now overridden by the measured value; one
  set with `!important` now overrides the measurement and should be removed.
- **Shopify:** dependency-only. The extension passes the saved `carousel` object to
  `injectConfigurator` whole, so `autoCutouts` flows through with no adapter change.
- **WooCommerce:** dependency-only for this feature. The frontend spreads the stored Setup config
  into `injectConfigurator`, so `autoCutouts` flows through. The extension is still pinned to
  `0.8.1`; see the developer summary before bumping.
