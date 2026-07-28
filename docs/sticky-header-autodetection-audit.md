# Sticky Header Auto-Detection Audit

Evidence gathered: 2026-07-10

Implementation rechecked: 2026-07-28

The implementation was reviewed and approved in `ov25-ui` main commit `fad225f`; documentation
commit `a9eb0f7` followed. Main is authoritative. The dedicated Bug 39 worktree is a historical,
divergent implementation workspace whose mirrored documentation is retained for reference only.

Purpose: define automatic header discovery for `inline-sticky` from downloaded theme evidence and
record the exact current implementation. A nonblank `selectors.header` remains the authoritative
override.

## Sources Checked

All 24 Shopify free themes under
`artifacts/shopify-free-theme-patcher-results-20260604/themes`:

- Dawn family (14): Colorblock, Craft, Crave, Dawn, Origin, Publisher, Refresh, Ride, Rise, Sense,
  Spotlight, Studio, Taste, Trade.
- Horizon family (10): Atelier, Dwell, Fabric, Heritage, Horizon, Pitch, Ritual, Savor, Tinker,
  Vessel.

Downloaded client-theme evidence under the patcher artifacts:

- `91ynjg-pd.myshopify.com`
- Diamond Furniture B2B
- Diamond Furniture B2C
- Moy Furniture
- Orla Kiely
- Recline Online

All About Tweed was checked from its full source in `client-mono`.

## Observed DOM Families

### Shopify Dawn family

- Shopify adds `.shopify-section-group-header-group` to announcement/header sections.
- The header section wrapper commonly adds `.section-header`.
- The main wrapper commonly uses `.header-wrapper` or `sticky-header`.
- The main element commonly uses `header.header`.

### Shopify Horizon family

- The section group uses `#header-group`.
- Shopify sections retain `.shopify-section-group-header-group`.
- The main custom element uses `#header-component`.
- Announcement content is a separate header-group section.

### Client themes

| Theme | Strong header hooks |
| --- | --- |
| 91ynjg | `#header`; Shopify wrapper uses schema tag `header` and `.section-header` |
| Diamond B2B/B2C | `[data-header-wrapper] > header.theme__header` |
| Moy | Dawn-style `.shopify-section-group-header-group`, `.section-header`, `sticky-header` |
| Orla Kiely | top-level `header.site-header`; announcement nested inside it |
| Recline Online | `.section-header > sticky-header > header.modern-header` |
| All About Tweed | `#HeaderWrapper > #SiteHeader.site-header` |

## Current Candidate Set

`STICKY_HEADER_STRONG_CANDIDATE_SELECTORS` currently contains:

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

The implementation queries each set as a combined selector and de-duplicates elements. Array order
is not a priority order: the final offset uses geometry, not the first selector match.

`[data-ov25-header]` is an explicit auto-detection hint. The general OV25-subtree exclusion ignores
that attribute itself so a client can deliberately mark a header, although an OV25-style id/class
on the same ancestor can still exclude it as runtime UI.

Do not add bare `.section-header`. All About Tweed uses that class for customer forms, content
headings, collection headings, FAQ, recommendations, and other non-page-header sections.

## Exact Eligibility Guards

A strong/semantic candidate is accepted only when:

- it is connected;
- it is outside OV25 runtime subtrees;
- it is not inside `main`, `[role="main"]`, `footer`, `dialog`, `[role="dialog"]`,
  `[aria-modal="true"]`, `[data-drawer]`, or `[data-modal]`;
- neither it nor an ancestor has `hidden`, `inert`, or `aria-hidden="true"`;
- neither it nor an ancestor has `display:none`, hidden/collapsed visibility, opacity at or below
  `0.01`, or `content-visibility:hidden`;
- its rectangle has positive finite width/height and intersects the viewport vertically and
  horizontally;
- its top is above:

  ```text
  min(320px, max(160px, viewportHeight * 0.35))
  ```

- its width is at least:

  ```text
  min(320px, viewportWidth * 0.5)
  ```

- its height is at most:

  ```text
  min(420px, viewportHeight * 0.6)
  ```

Semantic fallback headers have one additional guard. They must either:

- have computed `position: fixed` or `position: sticky`; or
- have a document-space top no greater than `max(200px, rect.height * 2)`.

These thresholds are conservative heuristics, not guarantees. They intentionally reject narrow
controls, full-screen drawers, heroes, and ordinary mid-page headings.

## Offset Rule

For eligible visible candidates:

```ts
offset = max(
  0,
  ...candidates.map((element) =>
    Math.min(element.getBoundingClientRect().bottom, viewportHeight),
  ),
);
```

Candidates whose rectangle no longer intersects the viewport are ignored. This handles:

- announcement plus main header;
- nested wrappers without double-counting;
- static bars scrolling away;
- sticky headers shrinking;
- scroll-up headers translating off-screen;
- hidden desktop/mobile duplicate markup.

The live offset is published as `--ov25-sticky-header-offset`.

The controller separately retains the largest offset observed during its current lifecycle as
`--ov25-sticky-sizing-header-offset`. A collapsing header can therefore move the sticky top upward
without increasing viewer height. A later taller header can still reduce the available-height cap.

## Override Behavior

- Blank/missing `selectors.header`: use automatic detection.
- Valid nonblank selector with matches: use only those matches.
- Valid nonblank selector with no matches: report `header-target-not-found`, use zero offset, and
  wait for MutationObserver to discover a later match. Do not substitute automatic candidates.
- Invalid selector syntax: report `header-selector-invalid` once, then use automatic detection.

An explicit selector may match several stacked/nested elements; their largest visible bottom is
used.

## Observation Lifecycle

The sticky controller re-resolves/re-measures headers after:

- captured document scroll and window scroll;
- window resize and orientation changes;
- `visualViewport` resize/scroll;
- relevant root attribute/child-list mutations;
- `ResizeObserver` callbacks;
- transition/animation start, end, and cancel events.

Measurements are animation-frame coalesced. During an active header transition/animation, another
frame is scheduled until the tracked motion ends.

Header candidates removed by a Shopify section rerender are disconnected and later replacements
are discovered by the root MutationObserver.

## Tests

Primary unit coverage is in:

- `test/unit/sticky-layout-metrics.test.ts`
- `test/unit/sticky-layout-controller.test.ts`

The current cases cover:

- largest-bottom and viewport clamping;
- Dawn/Horizon candidates;
- hidden, implausible, off-canvas, content-region, and OV25 exclusions;
- semantic-position/document-origin guards;
- explicit-selector precedence/no-match behavior;
- invalid-selector automatic fallback;
- dynamic replacement/reveal;
- transition/animation measurement;
- sizing-offset stability and restoration.

Browser coverage is in `test/e2e/inline-sticky.test.ts` using the fixed and collapsing header
fixtures, including `?header=explicit`.

The approval audit recorded `bun run type-check` passing and discovered 21 inline-sticky plus 3
carousel-relocation Playwright cases and 113 focused unit cases across the Bug 39 test inventory.
Runtime and release smoke tests remain future regression verification, not an approval prerequisite.

## Limits

- No heuristic can identify every custom theme header.
- A custom header outside the candidate set may resolve to zero until `selectors.header` is
  supplied.
- A valid override that never appears intentionally suppresses automatic candidates.
- Shadow-root headers are only found when they are inside the controller's query root; current
  context supplies the owner document as that root.
- The numeric guards are currently inline implementation values rather than named exported
  constants.
