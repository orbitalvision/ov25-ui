# Inline-Sticky Developer Report

Implementation audit: 2026-07-28

This report describes the reviewed Bug 39 implementation committed to `ov25-ui` main as
`fad225f`, followed by documentation commit `a9eb0f7`. Main is authoritative. The dedicated
`.worktrees/ov25-ui-inline-sticky` directory is a historical, divergent implementation workspace;
its documentation copies are mirrored for reference only and do not block the approved main
implementation.

## Purpose And Scope

`inline-sticky` is a responsive display mode for non-Snap2 configurators. It keeps the 3D viewer
visible while a long inline variant list scrolls with the client page.

- Existing `inline` and `inline-sheet` modes keep their previous behavior and do not start sticky
  measurement, repair, or relocation.
- Runtime rejects `inline-sticky` for Snap2 and normalizes each requested sticky breakpoint to
  `modal`, with one warning.
- Configurator Setup currently offers `Inline (sticky)` for its Standard and Bed layouts. The
  Snap2 option lists exclude it.
- Desktop and mobile modes are independent. When mobile is omitted, `inline-sticky`, `inline`, and
  `modal` inherit their desktop mode; desktop `sheet` and `inline-sheet` default mobile to
  `drawer`.

Typical runtime configuration:

```ts
injectConfigurator({
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    variants: '#ov25-controls',
    // Optional. Blank/omitted enables automatic header detection.
    header: '#announcement-bar, #site-header',
    // Optional external carousel destinations for any non-Snap2 layout.
    desktopCarousel: '[data-ov25-carousel-desktop]',
    mobileCarousel: '[data-ov25-carousel-mobile]',
  },
  configurator: {
    displayMode: {
      desktop: 'inline-sticky',
      mobile: 'inline-sticky',
    },
    variants: {
      displayMode: {
        desktop: 'list',
        mobile: 'list',
      },
    },
  },
});
```

`selectors.header` accepts a CSS selector string. Carousel selectors accept the normal
`ElementSelector` string/object shape, but they are portal destinations: their `replace` field does
not cause the destination to be replaced.

## Runtime Map

- `src/types/inject-config.ts`: public fields, responsive defaults, Snap2 exclusion, and normalized
  selector values.
- `src/contexts/ov25-ui-context.tsx`: activates sticky mode for the current viewport, starts the
  layout and carousel controllers, owns outer-host styles, and coordinates relocation/fullscreen.
- `src/lib/sticky-layout-controller.ts`: detects headers, measures geometry, diagnoses ancestors,
  applies bounded repairs, publishes CSS variables, and chooses a product-scoped fallback boundary.
- `src/hooks/useStickyHostRelocation.ts`: preserves the same gallery host through Popover or
  `Element.moveBefore()` body-layer fallback.
- `src/lib/carousel-target-controller.ts`: resolves and observes external carousel targets
  independently of sticky mode.
- `src/components/product-gallery.tsx` and `globals.css`: size the sticky gallery, iframe slot,
  embedded carousel, and responsive viewer.
- `src/components/VariantSelectMenu/VariantSelectMenu.tsx` and
  `src/components/VariantSelectMenu/ProductVariantsWrapper.tsx`: release list constraints and
  register option headers when a list uses page scrolling.

## Header Detection

OV25 measures the client header but does not modify it.

### Explicit override

- A valid nonblank `selectors.header` is authoritative.
- All matches are considered, which supports nested/stacked announcement and header wrappers.
- A valid selector with no matches produces a zero offset and waits for later DOM insertion. It
  does not fall back to automatic candidates.
- Invalid selector syntax warns once and falls back to automatic detection.

### Automatic candidates

The current strong candidate set is:

```text
.shopify-section-group-header-group
[data-ov25-header]
[id^="shopify-section-"][id$="__header"]
#header-group
#header-component
#HeaderWrapper
#SiteHeader
#site-header
[data-header-wrapper]
[data-section-type="header"]
#shopify-section-header
header.site-header
header.theme__header
#header
sticky-header
```

Guarded semantic fallbacks are:

```text
header[role="banner"]
body > header
```

Candidates must be connected, rendered, outside OV25/main/footer/dialog/drawer/modal regions,
horizontally intersect the viewport, and intersect the top viewport region. Current geometry guards
require:

- `rect.top < min(320px, max(160px, 35vh))`;
- `rect.width >= min(320px, 50vw)`;
- `rect.height <= min(420px, 60vh)`.

Semantic candidates must additionally be fixed/sticky or originate near the document top.

The active offset is the largest visible candidate `getBoundingClientRect().bottom`, clamped to the
viewport height. Nested or overlapping wrappers are therefore not double-counted.

Two offsets are maintained:

- `headerOffset` follows the current visible header bottom.
- `sizingHeaderOffset` retains the largest offset observed during that controller lifecycle, so a
  collapsing header can move the sticky top upward without making the viewer grow.

Headers are remeasured after captured document/window scroll, resize/orientation and visual
viewport changes, resize/mutation observation, and transition/animation activity. Work is
coalesced into animation frames.

See [sticky-header-autodetection-audit.md](sticky-header-autodetection-audit.md) for theme evidence
and the exact eligibility contract.

## CSS Variable Contract

The controller writes these owned values to the outer gallery and variants hosts:

```css
--ov25-sticky-header-offset
--ov25-sticky-sizing-header-offset
--ov25-sticky-resolved-top-gap
--ov25-sticky-resolved-bottom-gap
--ov25-sticky-top
--ov25-sticky-available-height
--ov25-sticky-option-header-height
--ov25-sticky-gallery-bottom
--ov25-sticky-viewport-width
```

Client-adjustable inputs/defaults are:

```css
--ov25-sticky-top-gap: 16px;
--ov25-sticky-bottom-gap: 16px;
--ov25-sticky-carousel-height: 120px;
--ov25-sticky-list-header-inline-inset: 14px;
--ov25-sticky-list-group-header-block-start: 0px;
```

The top/bottom gaps are read from the outer gallery host first, then the inner gallery/variants
hosts. Mobile forces both resolved gaps to zero.

`--ov25-sticky-available-height` is a cap:

```css
calc(
  100dvh
  - var(--ov25-sticky-sizing-header-offset)
  - var(--ov25-sticky-resolved-top-gap)
  - var(--ov25-sticky-resolved-bottom-gap)
)
```

Controller-owned variables are snapshotted per host and restored on teardown.

## Desktop Sizing

Desktop expects the client page to provide a gallery column and a variants/product-information
column.

- The outer inject-owned gallery host is `position: sticky`, uses
  `top: var(--ov25-sticky-top)`, remains `height: auto`, and is capped by
  `--ov25-sticky-available-height`.
- Sticky ownership temporarily applies `box-sizing: border-box` so merchant padding/borders stay
  inside width and height caps.
- The default iframe slot remains square and is centered when the available-height cap is narrower
  than its column.
- When the carousel is embedded, the viewer cap reserves
  `--ov25-sticky-carousel-height + --ov25-gallery-gap`.
- External or disabled carousels reserve no embedded-carousel space.
- Later client CSS can target `.ov25-inline-sticky-iframe-slot` to make the viewer smaller or
  change its aspect ratio; the outer/inner caps still prevent the complete sticky gallery from
  exceeding the viewport budget.

The gallery is not forced to fill all available height.

## Mobile Sizing

- The outer host expands to the measured document viewport width and compensates for a narrower
  client column with `margin-inline`.
- Top/bottom sticky gaps are zero, so the gallery sits directly below the measured header.
- Outer host border widths and padding are temporarily set to zero to prevent one-pixel seams that
  reveal scrolling content.
- The viewer is full-width and capped by available height.
- ProductGallery's background/outer iframe container and IframeContainer's true container/iframe
  have square corners while mobile `inline-sticky` is active.
- All of those outer-host styles and corner decisions leave ordinary mobile `inline` unchanged and
  are restored/recomputed after responsive exit.

## Native Sticky And Repairs

Native browser sticky positioning is preferred because it gives smooth pinning and boundary exit
without scroll-time positioning updates.

The controller inspects the gallery and variants ancestor chains for:

- vertical scroll containers;
- hidden/clipped vertical overflow;
- constrained/max height;
- layout/paint containment;
- transform/filter/perspective containing blocks;
- flex/grid stretch;
- insufficient travel to reach the sticky top before the product boundary ends.

Repair policy:

1. Wrappers explicitly marked `data-ov25-injector-owned` may receive reversible property repairs.
2. A narrow client-owned repair is allowed for the direct gallery column: `align-self: stretch
   !important` when its parent is grid or row/row-reverse flex in horizontal writing mode.
3. The stretch is retained only if immediate remeasurement proves it supplies enough travel and no
   other gallery blocker remains.
4. Failed stretch attempts are cached by geometry, constraints, styles, sticky top, and blocker
   state; meaningful changes allow another attempt.
5. Other unresolved gallery blockers use host relocation. Variants-only blockers are diagnosed but
   do not relocate the gallery.

OV25 does not generally remove overflow, transforms, containment, or dimensions from arbitrary
client ancestors.

## Same-Host Relocation

Relocation can run when sticky mode is active, the controller reports an unresolved gallery
blocker, a useful product boundary exists, and no sheet/drawer/modal owns the gallery. Fullscreen is
the overlay exception.

The runtime keeps the host in normal/native flow before the sticky threshold. Even after fallback
is requested, it does not relocate while native sticky is still holding the requested top within
`0.5px`; relocation starts when the constrained layout begins pulling it away.

The moved/lifted node is the inject-created outer gallery host. React and the iframe are not cloned
or remounted.

### Boundary and placeholder

- The controller selects the lowest useful common ancestor containing concrete gallery and variants
  hosts, climbs out of OV25-owned wrappers, and rejects document scrolling roots.
- If that boundary is too short, it walks outward only within the product subtree and stops before
  broad `main`/footer roots.
- When no useful common boundary exists, the original gallery target parent may be used.
- If no product-scoped boundary has enough travel, relocation is disabled and the native host is
  left in place with a diagnostic.
- A measured placeholder preserves the gallery's original grid/flex participation.

### Popover strategy

If the manual Popover API is available and `showPopover()` succeeds:

- the same host enters the browser top layer without DOM reparenting;
- the placeholder remains in the product layout;
- the host uses fixed positioning while pinned and `absolute-end` positioning at the boundary;
- absolute-end clipping hides only the part that would paint above the live header;
- desktop height is locked to the smaller of its pre-Popover natural rendered height and the
  current available-height cap, preventing cap changes from ratcheting its size.

### Body-layer strategy

If Popover fails/unavailable and both destination and original parent support
`Element.moveBefore()`:

- the same host moves into an owned `data-ov25-sticky-body-layer`;
- the body layer is an absolute document-space track from the natural gallery top to the selected
  boundary bottom;
- its direct host child remains native `position: sticky`;
- ordinary scroll does not schedule relocation geometry or switch fixed/absolute modes; browser
  sticky owns the boundary trajectory;
- desktop keeps auto height; mobile locks the measured relocation height while using full viewport
  width;
- the body layer's normal stacking context stays at the original low level so fixed client headers
  can paint above it; fullscreen raises the layer.

The body-layer strategy still depends on the layout controller for changing header offsets and
structural/resize remeasurement.

### Preservation and unsupported browsers

Relocation snapshots owned inline properties, the existing `popover` attribute, original
parent/sibling position, dimensions, and inherited/ancestor-defined `--ov25-*` properties. Cleanup
restores only relocation properties that still match the value OV25 applied.

If neither Popover nor `Element.moveBefore()` is available, the runtime warns and leaves the host
on the native path. It does not clone/remount the iframe.

If moving the host back with `moveBefore()` fails, cleanup warns and deliberately retains the live
host/body layer rather than removing the configurator node.

## Variant List Behavior

For `inline-sticky` plus `list`:

- `VariantSelectMenu` releases its outer container/wrapper constraints;
- `ProductVariantsWrapper` releases the list root/content constraints;
- height/max-height become auto/none and overflow becomes visible;
- the variants participate in document scrolling instead of a nested variants scroller.

Desktop:

- option headers stick at `--ov25-sticky-top`;
- group headers stack below `--ov25-sticky-option-header-height`;
- an option-header `::before` mask covers the deliberate desktop top gap;
- option/group headers share the configurable logical inline inset and reduced group top inset.

Mobile:

- option headers stick at `--ov25-sticky-gallery-bottom`;
- group headers stack beneath the measured option-header height;
- the mobile variants root creates an isolated stacking context so stale headers cannot paint over
  a body-layer gallery during section exit.

Ordinary `inline`, non-list layouts, overlays, and Snap2 do not use this page-scroll list path.

## Carousel Relocation

Carousel relocation is independent of sticky layout:

- `selectors.desktopCarousel` is considered only on desktop.
- `selectors.mobileCarousel` is considered only on mobile.
- Either can relocate a visible non-Snap2 carousel in sheet, drawer, modal, inline,
  `inline-sheet`, `inline-sticky`, or Bed standard-shell layouts.
- Snap2 ignores both selectors and normalizes its carousel to `none`.
- Missing/blank selectors keep the embedded carousel, except mobile `inline-sticky`.

Mobile `inline-sticky` uses this built-in selector when no explicit mobile selector is supplied:

```css
[data-ov25-sticky-mobile-carousel]
```

If the configured/current target is missing, invalid, or ambiguous, OV25 warns and renders one
embedded carousel.

Target lookup:

- is scoped to the nearest meaningful common gallery/variants scope;
- does not borrow a document-level target from a sibling configurator when such a scope exists;
- supports a shared ShadowRoot and owner-document realm checks;
- observes target appearance, replacement, removal, and selector-relevant merchant changes;
- filters mutations caused solely by OV25's own external host.

When resolved, ProductGallery appends one `data-ov25-external-carousel` host, attaches a ShadowRoot,
and portals the existing `ProductCarousel` there. If external code removes only that owned child
while leaving the exact target element in place, automatic recovery is not guaranteed; integration
targets should remain dedicated and stable.

Stacked-carousel fullscreen uses a separate manual Popover top-layer overlay when supported, with
the previous fixed overlay as fallback. This prevents sticky/top-layer stacking contexts from
obscuring the fullscreen image.

## Cleanup And Ownership

Sticky cleanup can occur after:

- responsive mode changes away from `inline-sticky`;
- gallery/variants host replacement;
- injection/provider replacement or unmount;
- opening a sheet, drawer, or modal that needs the gallery.

Cleanup disconnects observers/listeners, restores captured controller variables and outer-host
styles, removes sticky classes/data attributes, restores OV25-owned wrapper repairs, releases a
client-column stretch, removes relocation placeholder/layer, and returns a moved host to its
original position.

Ownership behavior is intentionally specific:

- client-column stretch restoration occurs only while OV25 still owns `stretch !important`;
- relocation property restoration skips properties changed after OV25 applied them;
- controller variables, outer sticky geometry, and OV25-owned wrapper repairs restore their
  captured pre-activation values.

Do not generalize the first two concurrency guards to every controller-owned property.

## Diagnostics And Markers

Diagnostics cover:

- invalid/missing header overrides and empty auto-detection;
- blocking ancestors and reasons;
- insufficient travel and boundary fallback/missing conditions;
- missing, invalid, or ambiguous carousel destinations;
- unavailable relocation APIs.

Useful markers:

```text
data-ov25-inline-sticky-active
data-ov25-inline-sticky-mobile
data-ov25-inline-sticky-fullscreen
data-ov25-inline-sticky-list-container
data-ov25-inline-sticky-list-wrapper
data-ov25-inline-sticky-list
data-ov25-sticky-placeholder
data-ov25-sticky-body-layer
data-ov25-external-carousel
```

## Fixtures

Responsive sticky pages:

- `dev/react-test/tests/inline-sticky-desktop-no-header.html`
- `dev/react-test/tests/inline-sticky-desktop-fixed-header.html`
- `dev/react-test/tests/inline-sticky-desktop-collapsing-header.html`

All three load `inline-sticky-fixture.jsx` and use the same responsive product DOM. The filenames
retain `desktop` for link stability; the actual viewport chooses desktop/mobile behavior.

Supported query parameters:

| Query | Effect |
| --- | --- |
| `header=explicit` | Supplies `[data-fixture-header]`; omission tests auto-detection. |
| `target=missing` | Omits the built-in mobile carousel target. |
| `carousel=stacked` | Uses stacked instead of horizontal carousel layout. |
| `stackedGallery=1` | Triggers the existing stacked iframe-container path. |
| `viewer=compact` | Applies a sticky-only `72%` width, `4 / 3` viewer override. |
| `hostBox=content-box` | Adds merchant padding/border with `box-sizing: content-box`. |
| `fallback=body-layer` | Adds a real blocker and makes gallery `showPopover()` fail, forcing `moveBefore()`. |
| `blocker=1` | Adds the overflow/transform blocker without forcing Popover failure. |
| `desktopMode=inline` | Ordinary-inline comparison. |
| `desktopMode=inline-sheet` | Ordinary-inline-sheet comparison. |
| `mobileMode=inline` | Ordinary mobile-inline comparison. |

Dedicated carousel fixture:

- `dev/react-test/tests/carousel-relocation.html`
- `dev/react-test/tests/carousel-relocation.jsx`

It always configures permanent desktop and mobile destinations while using sheet/drawer display
modes; responsive CSS shows the current destination.

## Automated Test Inventory

Current Playwright discovery:

- `test/e2e/inline-sticky.test.ts`: 21 Chromium cases.
- `test/e2e/carousel-relocation.test.ts`: 3 Chromium cases.
- Total: 24 cases.

Focused unit discovery:

- `test/unit/sticky-layout-controller.test.ts`: 33 cases.
- `test/unit/sticky-layout-metrics.test.ts`: 18 cases.
- `test/unit/sticky-host-relocation.test.ts`: 16 cases.
- `test/unit/carousel-target-controller.test.ts`: 9 cases.
- `test/unit/inline-sticky-config.test.ts`: 6 cases.
- `test/unit/configurator-setup-initial-config.test.ts`: 25 cases.
- `test/unit/product-carousel.test.tsx`: 4 cases.
- `test/unit/variant-select-menu-role.test.ts`: 2 cases.
- Total: 113 cases.

The approval audit recorded `bun run type-check` passing. This 2026-07-28 documentation audit
confirmed test discovery but did not rerun the browser or unit suites. Runtime and release smoke
tests remain useful future regression verification; they are not prerequisites for the approval
already recorded in `fad225f`.

## Setup And Integration Ownership

Configurator Setup:

- owns responsive `inline-sticky` display-mode values for Standard and Bed;
- has no UI/form/default/import/export ownership for `header`, `desktopCarousel`, or
  `mobileCarousel`;
- drops those integration-owned keys from legacy local state/saved payloads and serialized output.

Shopify repository state:

- the local Shopify workspace has dirty, uncommitted changes that read header/desktop/mobile
  carousel values from shop metafields, apply nonblank integration values, and add
  `blocks/ov25_sticky_mobile_carousel.liquid`;
- those changes are outside the reviewed `ov25-ui` commit and are not approved or committed as part
  of Bug 39;
- current OV25 `main` does not expose the three fields in
  `components/plugins/shopify/PluginSettings.tsx`.

WooCommerce repository state:

- the local WooCommerce workspace has dirty, uncommitted changes that expose, persist, and localize
  `headerSelector`, `desktopCarouselSelector`, and `mobileCarouselSelector`, apply nonblank
  integration values, and add the built-in mobile target;
- those changes are outside the reviewed `ov25-ui` commit and are not approved or committed as part
  of Bug 39.

Current OV25 `main` also lacks the Bug 39-specific configurator-preview enhancement. Dedicated
`dev/react-test` fixtures provide the sticky header and carousel-target matrix.

## Remaining Risks

- Header auto-detection is heuristic; custom themes may require `selectors.header`.
- A valid explicit selector that never appears intentionally remains at zero offset.
- A product layout with no useful fallback boundary can still leave native sticky ineffective.
- Body-layer relocation can change ancestry-dependent merchant selectors; inherited `--ov25-*`
  values and measured geometry are preserved, but arbitrary ancestry selectors cannot be.
- `Element.moveBefore()` support is required for the non-Popover same-node fallback.
- Dynamic mobile Safari viewport behavior still warrants real-device testing.
- OV25 Shopify admin selector controls and the Bug 39-specific preview enhancement are absent from
  current OV25 `main`.
- Shopify and WooCommerce integration changes remain dirty and uncommitted in their respective
  workspaces.
