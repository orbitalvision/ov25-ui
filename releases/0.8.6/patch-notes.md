# Release Draft: ov25-ui@0.8.6

Status: Approved for release
Bump: patch
Base: ov25-ui@0.8.5
Head: 7a66a45

## Patch Notes

- Keep Selection Details tooltip images square when retailer-defined Swatch Fields are shown.
- Place tooltip descriptions and visible metadata together in an auto-growing white panel beneath the image.
- Render metadata labels with a trailing colon, for example `Composition: 100% Wool`.
- Report missing or interrupted release commands clearly instead of the unhelpful `exit code null` message.

## Developer Summary

- Tooltip metadata remains hidden by default and is still enabled through merchant CSS. When shown, its panel grows up to the viewport limit and then scrolls internally.
- No public API or payload changes. The `ov25-setup` lockfile/package changes in this comparison are the completed 0.8.5 Setup finalisation, not new 0.8.6 source work.

## Breaking Changes

- None known.

## Downstream Impact

- OV25: none.
- WooCommerce: none.
- Shopify: none.
- `ov25-setup`: no source change for 0.8.6; it will be repinned to the released UI version by the standard release finalisation.

## Tests And Evidence

- Passed this session: `bun run type-check` and the browser test suite (user-confirmed after the tooltip assertion update).

## Approval

Approved by the release owner. No release action has happened from this task.
