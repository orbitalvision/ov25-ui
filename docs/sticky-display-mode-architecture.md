# Sticky Display Mode Architecture

Implementation audit: 2026-07-28

Status: the core `ov25-ui` implementation, setup mode controls, responsive fixtures, and focused
tests were reviewed and approved in main commit `fad225f`; documentation commit `a9eb0f7` followed.
The approval audit recorded `bun run type-check` passing and discovered 21 inline-sticky plus 3
carousel-relocation Playwright cases and 113 focused unit cases.

This document describes authoritative main. The dedicated Bug 39 worktree is a historical,
divergent implementation workspace; this document is mirrored there for reference only and its
divergence does not block the approved implementation.

## Contract

`inline-sticky` is a responsive `ConfiguratorDisplayMode` for non-Snap2 configurators:

```ts
selectors: {
  gallery: { selector: '.configurator-container', replace: true },
  variants: '#ov25-controls',
  header: '#announcement-bar, #site-header',
  desktopCarousel: '#desktop-carousel-target',
  mobileCarousel: '#mobile-carousel-target',
},
configurator: {
  displayMode: {
    desktop: 'inline-sticky',
    mobile: 'inline-sticky',
  },
},
```

The mode has no `configurator.sticky` object. Theme adjustments use custom properties:

```css
--ov25-sticky-top-gap: 16px;
--ov25-sticky-bottom-gap: 16px;
--ov25-sticky-carousel-height: 120px;
--ov25-sticky-list-header-inline-inset: 14px;
--ov25-sticky-list-group-header-block-start: 0px;
```

Scope rules:

- Only the currently selected breakpoint activates sticky behavior.
- Existing `inline` and `inline-sheet` remain inline-variant modes but receive no sticky controller,
  host classes, styles, placeholder, or relocation.
- Setup exposes `Inline (sticky)` for Standard and Bed layouts.
- Setup excludes it from Snap2. Runtime also normalizes accidental Snap2 sticky requests to
  `modal` and warns.
- Omitted mobile mode inherits desktop `inline`, `inline-sticky`, or `modal`; desktop `sheet` and
  `inline-sheet` default mobile to `drawer`.

## Controller Ownership

One active configurator provider coordinates two independent controllers.

### Sticky layout controller

`createStickyLayoutController()` owns:

- header resolution and measurement;
- top/bottom gap resolution;
- option-header and gallery-bottom measurement;
- ancestor classification and bounded repair;
- product-boundary selection;
- CSS variable publication;
- diagnostics;
- observers/listeners and restoration.

It does not render UI or relocate the gallery.

### Carousel target controller

`createCarouselTargetController()` owns:

- selecting the current viewport's configured target;
- the mobile `inline-sticky` built-in target fallback;
- product/configurator-scoped lookup;
- dynamic target observation;
- invalid/missing/ambiguous diagnostics.

It is deliberately independent of the sticky snapshot, so external carousel targeting works in
other non-Snap2 display modes.

### Context orchestration

`ov25-ui-context.tsx`:

- derives the current responsive mode;
- starts/destroys the relevant controllers;
- owns outer gallery-host sticky geometry and data markers;
- registers the current list option header;
- passes blocker/boundary measurements to `useStickyHostRelocation`;
- disables relocation while sheet/drawer/modal iframe ownership is active;
- coordinates carousel fullscreen and responsive cleanup.

Browser layout effects are used so host geometry changes occur before paint; server rendering uses
`useEffect` through `useBrowserLayoutEffect`.

## Header Resolution

`selectors.header` is an optional string override.

- Blank/missing: automatic candidate detection.
- Valid with matches: only those matches are measured.
- Valid with no matches: zero offset; mutation observation waits for insertion.
- Invalid syntax: warn once and use automatic detection.

Current strong candidate set:

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

Guarded semantic candidates:

```text
header[role="banner"]
body > header
```

Automatic candidates are filtered by connectivity, visibility, excluded regions, top-region
intersection, plausible width, and plausible height. Semantic candidates must also be fixed/sticky
or originate near document top. The detailed thresholds and theme evidence are in
[sticky-header-autodetection-audit.md](sticky-header-autodetection-audit.md).

Offset calculation is:

```ts
max(visibleCandidate.getBoundingClientRect().bottom)
```

clamped to viewport height. Candidate bottoms are not summed.

The controller separates:

- live `headerOffset`, which can shrink or reach zero;
- lifecycle maximum `sizingHeaderOffset`, which prevents viewer growth when a header collapses.

## Measurement Lifecycle

Measurements are scheduled through one animation frame.

Triggers:

- captured document scroll and window scroll;
- window resize and orientation changes;
- `visualViewport` resize/scroll;
- `ResizeObserver` on headers, hosts, option header, blockers, original parent, and boundary;
- one root `MutationObserver` for attributes/child lists;
- transition/animation start, end, and cancel events on header candidates.

Header motion keeps scheduling frames until tracked transitions/animations finish. Snapshot equality
prevents React updates when behavior-relevant values are unchanged.

The controller publishes:

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

The existing inline values/priorities of those properties are captured per host and restored by
controller teardown.

## Outer Host And Gallery Sizing

The inject-created outer gallery host is the sticky ownership boundary. It is either:

- the replacement host created for `selectors.gallery.replace`, or
- `.ov25-configurator-inject-column` created inside a non-replace target.

While active, context owns these outer-host properties with `!important`:

```text
position, top, align-self, display, flex-direction, width,
box-sizing, min-height, max-height, height, overflow, z-index
```

Mobile additionally owns `max-width`, compensating `margin-inline`, every border width, and every
padding edge.

### Desktop

- Outer host: `height: auto`, capped by `--ov25-sticky-available-height`.
- Gallery root/content: auto height with the same cap and hidden overflow.
- Default iframe slot: square, centered, and capped by available width/height.
- Embedded carousel: reserves its configured cap plus `--ov25-gallery-gap`.
- External/disabled carousel: reserves no embedded space.
- Later `.ov25-inline-sticky-iframe-slot` custom CSS may reduce width or change aspect ratio while
  the complete gallery remains capped.

The viewport budget is a maximum, not a fill-height request.

### Mobile

- Outer host width is `--ov25-sticky-viewport-width`; an inline margin compensates for a narrower
  theme column.
- Resolved top/bottom gaps are zero.
- Viewer height is the smaller of container width and available height.
- Borders/padding are zeroed to avoid edge seams.
- Viewer layers use no configured corner radius.

Mobile sticky state is reversible; ordinary mobile `inline` retains merchant sizing and radius.

## Ancestor Classification

The controller classifies:

```text
vertical-scroll-container
vertical-overflow-clipping
constrained-height
contain-layout
contain-paint
transform-containing-block
flex-grid-stretch
insufficient-sticky-travel
```

The document scrolling root is never considered a blocker. Flex/grid stretch is relevant to the
sticky host itself rather than every stretched ancestor.

Gallery blockers control relocation. Variants-only blockers are diagnosed but do not relocate the
gallery.

## Repair Policy

### OV25-owned wrappers

Only elements carrying `data-ov25-injector-owned` may receive generic repairs:

| Reason | Applied value |
| --- | --- |
| overflow scroll/clip | `overflow* : visible !important` |
| constrained height | `height: auto; max-height: none` |
| containment | `contain: none` |
| transform containing block | transform/filter/perspective removed; `will-change: auto` |
| self stretch | `align-self: flex-start` |

Repairs are suspended/reclassified after relevant layout mutations and restored at teardown.

### Eligible client gallery column

The only generic client-layout mutation is:

```css
align-self: stretch !important;
```

Eligibility requires the original gallery parent to be a direct child of:

- grid/inline-grid; or
- row/row-reverse flex/inline-flex;

with horizontal writing mode.

The repair is retained only when it supplies sufficient native sticky travel and no other gallery
blocker remains. If another blocker requires fallback, the stretch is released before relocation.
External overwrite/removal relinquishes ownership instead of restoring stale merchant state.

Failed attempts are cached by relevant host/boundary/container geometry, natural origin, sticky
top, inline/computed sizing, layout styles, and blocker state. Meaningful changes invalidate the
signature.

## Fallback Boundary

Fallback needs a product-scoped boundary.

1. Find the lowest useful common ancestor containing connected gallery and variants hosts.
2. Walk out of OV25-owned wrappers.
3. Reject body/document scrolling roots.
4. If no useful common boundary exists, try the original gallery target parent.
5. If the nearest boundary is too short, walk outward until enough travel exists.
6. Stop before broad `main`, footer, or document roots.

Without a useful boundary, `requiresBodyFallback` remains false and the gallery is left on its
native path with a diagnostic.

A retained flow anchor records the gallery's original parent-relative offset. This reconstructs its
natural document top even while body-layer relocation moves the live node elsewhere.

## Relocation Lifecycle

`useStickyHostRelocation` creates one same-host relocation controller per gallery host/layer key and
recreates it on responsive `resetKey` changes.

Relocation is enabled when:

```text
sticky mode active
AND unresolved gallery blocker with useful boundary
AND no sheet/drawer/modal overlay owns the gallery
```

Carousel fullscreen overrides the overlay suppression and freezes/raises the relocated host.

The controller does not relocate before the natural sticky threshold. If native sticky is still
holding the requested top within `0.5px`, it also remains on the native path. This avoids replacing
working browser behavior merely because ancestor inspection predicted a blocker.

### Shared preparation

Both fallback strategies:

- preserve the same outer host and iframe;
- create a measured placeholder;
- snapshot relocation-owned styles and the prior `popover` attribute;
- preserve computed/ancestor-defined `--ov25-*` variables on the host;
- retain original parent and sibling position.

### Strategy 1: Popover

Requirements: host exposes `showPopover`/`hidePopover`, and `showPopover()` succeeds.

- Host receives `popover="manual"` and enters the browser top layer.
- DOM parentage does not change.
- It uses `position: fixed` while pinned.
- At product-boundary exit it uses `position: absolute` at the document-space end position.
- `clip-path` hides only absolute-end overlap above the current header.
- Fullscreen clears clipping and raises the host.
- Desktop height uses the minimum of its cached pre-Popover natural height and current cap.

The natural desktop baseline resets after normal-flow restoration, disable, host/controller
replacement, or responsive controller reset.

### Strategy 2: Body layer

Requirements: Popover failed/unavailable, and `Element.moveBefore()` exists on both the created
body layer and original parent.

- An absolute `data-ov25-sticky-body-layer` track spans natural gallery top to product-boundary
  bottom.
- `moveBefore()` moves the same host into that track.
- The direct host remains `position: sticky`.
- Ordinary page scroll does not schedule relocation sync once active; browser layout owns pinning
  and boundary exit.
- Resize, structural, flow-origin, header, and options changes still update geometry through the
  broader measurement lifecycle.
- Desktop does not set an explicit relocation height; mobile uses its measured height and full
  viewport width.
- The normal body-layer stacking context stays low so client fixed headers win hit testing.
- Fullscreen raises the body layer and host.

The public relocation mode remains `fixed` while this native-sticky body track is active; there is
no scroll-time `body-track` mode exposed by the hook.

### Unsupported/failure behavior

- If neither strategy is available, warn and leave the live host on the native path.
- No clone, portal replacement, or iframe remount is used.
- If body-layer restoration cannot `moveBefore()` the host back, retain the live host and layer and
  warn rather than deleting the configurator.

## Variant Page Scrolling

Only `inline-sticky` plus variant display mode `list` uses page-scroll release.

`VariantSelectMenu` marks/releases its menu container and wrapper.
`ProductVariantsWrapper` marks/releases the list root, content wrapper, and content.

Effective overrides:

```css
min-height: 0 !important;
height: auto !important;
max-height: none !important;
overflow: visible !important;
```

Desktop header geometry:

```css
.ov25-option-header {
  top: var(--ov25-sticky-top);
}

.ov25-group-header {
  top: calc(
    var(--ov25-sticky-top) +
    var(--ov25-sticky-option-header-height)
  );
}
```

An opaque option-header pseudo-element masks the configured desktop top gap.

Mobile header geometry:

```css
.ov25-option-header {
  top: var(--ov25-sticky-gallery-bottom);
}

.ov25-group-header {
  top: calc(
    var(--ov25-sticky-gallery-bottom) +
    var(--ov25-sticky-option-header-height)
  );
}
```

Desktop/mobile sticky-list roots share logical header insets. The mobile list root creates an
isolated stacking context so its headers cannot escape above a body-layer gallery.

Ordinary mobile `inline` retains the existing fixed-height internal scroller.

## Carousel Architecture

Selector choice:

```text
Snap2 -> no target
desktop -> selectors.desktopCarousel if nonblank
mobile -> selectors.mobileCarousel if nonblank
mobile inline-sticky with no explicit value
  -> [data-ov25-sticky-mobile-carousel]
otherwise -> embedded carousel
```

Resolution requires exactly one valid `HTMLElement` in the authoritative common gallery/variants
scope. A meaningful local scope never falls through to a document-wide sibling match. If both hosts
do not establish such a scope, document lookup is used.

The controller observes the owner document and a relevant shared ShadowRoot. It ignores mutations
caused only by OV25's external host so selectors such as `#target:empty` remain stable, while
merchant changes to the target or its selector-relevant descendants force revalidation.

ProductGallery appends a single `data-ov25-external-carousel` host and portals ProductCarousel into
its ShadowRoot. Missing, invalid, ambiguous, already-owned, or unusable destinations retain one
embedded carousel.

Removing only OV25's child from an otherwise unchanged target is an unsupported integration action;
dedicated targets should remain stable.

Stacked image fullscreen uses a manual Popover when possible, falling back to the existing fixed
overlay. This fullscreen Popover is distinct from sticky host relocation.

## Setup And Integrations

### Configurator Setup

- Standard and Bed desktop/mobile display-mode controls include `Inline (sticky)`.
- Snap2 controls do not.
- `header`, `desktopCarousel`, and `mobileCarousel` are integration-owned:
  - absent from form state/defaults/UI;
  - ignored during hydration;
  - omitted during serialization;
  - removed from legacy localStorage state.

### Shopify

The local Shopify workspace contains dirty, uncommitted integration changes that:

- read `ov25HeaderQuerySelector`, `ov25DesktopCarouselQuerySelector`, and
  `ov25MobileCarouselQuerySelector` metafields into window globals;
- strip those keys from Setup selectors and apply nonblank integration values;
- include `blocks/ov25_sticky_mobile_carousel.liquid`.

These changes are outside approved commit `fad225f` and are not committed or approved as part of
Bug 39. Current OV25 `main` does not contain the matching controls/persistence calls in
`components/plugins/shopify/PluginSettings.tsx`.

### WooCommerce

The local Woo workspace contains dirty, uncommitted integration changes that:

- expose and persist Header, Desktop Carousel Target, and Mobile Carousel Target selectors in
  Global Settings;
- localize them into frontend settings;
- exclude Setup-owned selector copies and apply nonblank integration values;
- emit a built-in mobile sticky target beside variant placeholders.

These changes are outside approved commit `fad225f` and are not committed or approved as part of
Bug 39.

### OV25 preview

Current OV25 `main` lacks the Bug 39-specific preview enhancement for simulated
fixed/collapsing headers and `[data-ov25-sticky-mobile-carousel]`. Dedicated `dev/react-test`
fixtures own that verification.

## Cleanup Semantics

Sticky deactivation may follow responsive mode exit, host replacement, provider/injection
replacement, unmount, or temporary overlay ownership.

Cleanup:

- cancels scheduled frames;
- disconnects Resize/Mutation observers;
- removes scroll/resize/orientation/visualViewport and header-motion listeners;
- restores controller CSS variables;
- restores OV25-owned wrapper repairs;
- releases gallery-column stretch if still owned;
- restores outer host classes, attributes, and captured inline geometry;
- hides/restores a Popover host;
- moves a body-layer host back when possible;
- removes placeholder/layer;
- clears retained flow-origin state after the lifecycle ends.

Ownership-aware concurrency guards apply to gallery-column stretch and relocation-applied
properties. Other controller/context properties restore their captured pre-activation values.

## Fixtures And Query Matrix

Shared responsive pages:

1. `inline-sticky-desktop-no-header.html`
2. `inline-sticky-desktop-fixed-header.html`
3. `inline-sticky-desktop-collapsing-header.html`

The filenames are stable historical names; each page supports desktop and mobile on the same DOM.

Queries supported by `inline-sticky-fixture.jsx`:

| Query | Current behavior |
| --- | --- |
| `header=explicit` | Uses `[data-fixture-header]`; otherwise auto-detects. |
| `target=missing` | Omits built-in mobile carousel destination. |
| `carousel=stacked` | Uses stacked carousel. |
| `stackedGallery=1` | Uses the established stacked iframe path. |
| `viewer=compact` | Sticky-only `72%`, `4 / 3` viewer custom CSS. |
| `hostBox=content-box` | Merchant border/padding/content-box ownership case. |
| `fallback=body-layer` | Real blocker plus gallery-only Popover failure. |
| `blocker=1` | Real blocker while allowing Popover. |
| `desktopMode=inline` | Ordinary inline comparison. |
| `desktopMode=inline-sheet` | Ordinary inline-sheet comparison. |
| `mobileMode=inline` | Ordinary mobile-inline comparison. |

`carousel-relocation.html` is the separate ordinary sheet/drawer fixture with permanent desktop and
mobile destinations.

## Test Inventory

Playwright discovery:

- `test/e2e/inline-sticky.test.ts`: 21 cases.
- `test/e2e/carousel-relocation.test.ts`: 3 cases.
- Total: 24.

Focused unit discovery:

| Test file | Cases |
| --- | ---: |
| `sticky-layout-controller.test.ts` | 33 |
| `sticky-layout-metrics.test.ts` | 18 |
| `sticky-host-relocation.test.ts` | 16 |
| `carousel-target-controller.test.ts` | 9 |
| `inline-sticky-config.test.ts` | 6 |
| `configurator-setup-initial-config.test.ts` | 25 |
| `product-carousel.test.tsx` | 4 |
| `variant-select-menu-role.test.ts` | 2 |
| **Total** | **113** |

The E2E matrix covers:

- ordinary inline/inline-sheet isolation;
- no/fixed/collapsing headers and explicit override;
- natural, embedded-carousel, compact override, and content-box sizing;
- native stretch repair;
- Popover and forced body-layer paths;
- body-layer identity, bounds, cleanup, stacking, and immediate reverse-scroll geometry;
- mobile full-width viewer, square corners, page-scrolling lists, and sticky headers;
- embedded/external/missing carousel behavior;
- desktop/mobile responsive switching without duplicate portals or iframe reload.

This documentation audit used discovery rather than rerunning the browser and unit suites. Runtime
and release smoke tests remain useful future regression verification; they are not prerequisites
for the approval already recorded in `fad225f`.

## Current Risks And Unresolved Work

- Header detection remains heuristic and needs the explicit override for unusual themes.
- A valid explicit selector that never appears intentionally suppresses automatic detection.
- No useful product boundary means fallback cannot run.
- Body-layer movement can invalidate arbitrary merchant ancestry selectors; OV25 preserves
  inherited custom properties and dimensions but cannot reproduce every selector relationship.
- `Element.moveBefore()` availability controls whether the second same-node strategy exists.
- Real-device Safari dynamic viewport behavior remains a manual verification item.
- OV25 Shopify Plugin Settings controls and the Bug 39-specific sticky preview enhancement are
  absent from current OV25 `main`.
- Shopify and WooCommerce integration changes remain dirty and uncommitted in their respective
  workspaces.
- `.worktrees/ov25-ui-inline-sticky` remains a historical divergent workspace and is not a release
  source.

## Implementation Reading Order

1. `src/types/inject-config.ts`
2. `src/contexts/ov25-ui-context.tsx`
3. `src/lib/sticky-layout-controller.ts`
4. `src/hooks/useStickyHostRelocation.ts`
5. `src/components/product-gallery.tsx`, `IframeContainer.tsx`, and `globals.css`
6. `src/components/VariantSelectMenu/VariantSelectMenu.tsx` and `ProductVariantsWrapper.tsx`
7. `src/lib/carousel-target-controller.ts` and `src/components/product-carousel.tsx`
8. Setup serialization/hydration tests
9. Unit suites, then the two E2E files
