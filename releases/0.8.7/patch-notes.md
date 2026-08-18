# Release Draft: ov25-ui@0.8.7

Status: Approved for release
Bump: patch
Base: ov25-ui@0.8.6
Head: b277201

## Patch Notes

- Animate mobile Selection Details consistently on the first open and after a completed close.
- Prevent the Selection Details title and content from jumping when its image finishes loading.
- Use a slower, transform-only mobile Fullscreen transition for a smoother opening and closing experience.
- Automatically invert tooltip title colour against the image, producing dark text over light areas and light text over dark areas.

## Developer Summary

- The enter transition now starts only after the requested surface has mounted, preventing React from coalescing the hidden and presented states on a fresh mount.
- Mobile Fullscreen reserves a constrained square image frame before image load and prevents intrinsic image dimensions from expanding it.
- Mobile Fullscreen now opens over 440 ms and closes over 360 ms. Sliding Sheet/Fullscreen surfaces no longer animate opacity.
- Tooltip titles use `mix-blend-mode: difference`; exact output is the inverse of the underlying pixels and may be off-white or complementary over non-pure colours.
- Chromium visual baselines were refreshed after the selection reordering and tooltip title treatment.
- No public API, configuration payload, selector, or exported type changes.
- The `ov25-setup` package and lockfile changes in this comparison are the completed 0.8.6 Setup finalisation, not new 0.8.7 source work.

## Breaking Changes

- None known.

## Downstream Impact

- OV25: package version update only.
- WooCommerce: package version update only.
- Shopify: package version update only.
- `ov25-setup`: no source change for 0.8.7; the standard release finalisation will repin it to the released UI version.

## Tests And Evidence

- Passed during implementation: `bun run type-check`.
- Manual fixture verification was user-confirmed for first open, fully completed close/reopen, and stable image/title layout.
- The user confirmed the test suite passed after refreshing the screenshots.

## Approval

The refreshed scope was approved by the release owner with `APPROVE ov25-ui@0.8.7`. No release action has happened from this task.
