# Responsive configurator layout refactor

- Status: proposed
- Scope: `ov25-ui` responsive layout, viewer sizing, and touch interaction behavior
- Primary evidence: the viewport matrix, especially 667×375 and 844×390 phone landscape

## Problem

The UI currently makes too many decisions through one `isMobile` boolean, derived mainly from a 768px viewport-width breakpoint. That couples three things which are not equivalent:

1. how the configurator and controls are arranged;
2. how large the 3D viewer should be;
3. whether interactions should use hover UI or touch-friendly sheets/dialogs.

The viewport matrix exposes the failure at either side of the breakpoint:

- At 667×375, the mobile stacked layout gives the configurator the full viewport width. Its square viewer is taller than the available screen, so the controls are pushed away.
- At 844×390, the desktop layout is selected, but desktop spacing and proportions leave the viewer partially out of view.
- Tablet portrait has the related problem that a full-width square viewer consumes most of the screen and leaves too little room for controls.
- Touch tablets may have enough room for a desktop-like arrangement while still needing touch-friendly tooltips and detail surfaces.

Client sites introduce another independent breakpoint system. We should not require their breakpoint values: the plugin should respond to the space its own host receives after the client layout changes.

The current test fixture demonstrates the mismatch clearly: its merchant-style host switches from a column to a row at 768px and gives the gallery 55% of the row. That makes 667×375 a 667px-tall stacked square and 844×390 an approximately 464px square inside only about 306px of remaining visible height. The refactor must solve the height constraint, not move that breakpoint.

## Goals

- Keep the complete 3D viewer visible in short landscape viewports.
- Keep useful controls visible or immediately reachable in tablet portrait.
- Preserve touch-friendly interactions independently of the chosen layout.
- Adapt to the measured plugin container and available viewport height, without knowing client-site breakpoints.
- Provide stable, explainable layout decisions that can be unit tested and shown in the viewport matrix.
- Migrate incrementally without breaking existing client configuration.

## Non-goals

- Detecting device models or relying on user-agent sniffing.
- Mirroring every client site's media queries.
- Redesigning every variant-control style as part of the first slice.
- Replacing all existing mobile configuration options in one release.
- Fixing unusual client integrations only through more global CSS breakpoints.

## Proposed model

Replace the single responsive decision with three independent outputs.

### 1. Layout mode

`stacked`, `split`, or `overlay` describes composition only.

- `stacked`: viewer above controls, used when the container is narrow and sufficiently tall.
- `split`: viewer on the left and controls on the right, used when height is constrained and both columns meet their minimum useful widths.
- `overlay`: viewer remains visible while controls open in a sheet/drawer, used only when neither stacked nor split can provide usable control space.

Both phone-landscape fixtures should resolve to the same short-landscape policy even though their widths straddle 768px.

### 2. Interaction mode

`pointer` or `touch` controls tooltips, hit targets, and detail surfaces. It is derived from capabilities such as `(any-hover: hover)` and coarse pointer support, not from layout mode.

A touch tablet can therefore use a split layout while selection details continue to use the configured mobile sheet/modal behavior.

### 3. Viewer size policy

Viewer geometry is based on measured container width and available visual-viewport height.

- In split/short-landscape mode, size the square viewer from available height, not page width.
- Let the controls column scroll independently; do not make the viewer scroll out of view with it.
- In stacked portrait mode, cap viewer height so a useful amount of the controls area remains visible. The viewer may be shorter than a square.
- In roomy desktop layouts, preserve the existing desktop aspect-ratio progression unless measurements show a regression.

Initial thresholds should be named resolver constants and tuned from fixtures. They must describe usability constraints—minimum viewer size, minimum controls width, minimum visible controls area—not device names.

### Host composition boundary

Some integrations inject the gallery and variants into separate client-owned targets. Even with perfect measurements, OV25 cannot safely force unrelated merchant DOM into a new row without reparenting unknown content.

- The robust automatic path should use an OV25-owned adaptive root containing the viewer and controls. Container styles can then compose those children without knowing the client's breakpoint.
- Legacy separate-slot integrations can still receive viewer height caps and capability-based interactions.
- When legacy host flow cannot provide a usable split, use an OV25-owned overlay shell rather than rewriting the client's grid. Move the existing iframe without recreating it so configuration and camera state survive.
- Keep any reparenting reversible and preserve placeholders, focus, scroll state, and support for multiple configurators.

This owned root can be introduced as part of `responsiveLayout: 'auto'`; existing integrations remain unchanged until they opt in.

## Responsive environment

Add one shared measurement layer which reports approximately:

```ts
type ResponsiveEnvironment = {
  containerWidth: number;
  containerHeight: number | null;
  viewportWidth: number;
  viewportHeight: number;
  canHover: boolean;
  hasCoarsePointer: boolean;
};

type ResponsivePresentation = {
  layout: 'stacked' | 'split' | 'overlay';
  interaction: 'pointer' | 'touch';
  density: 'compact' | 'regular';
  viewerMaxHeight: number | null;
};
```

Implementation notes:

- Observe the actual gallery/configurator host with `ResizeObserver`.
- When gallery and variants have separate hosts, observe both rectangles and treat their relationship as an input rather than assuming a shared container.
- Use `visualViewport.height` when available so browser chrome and the on-screen keyboard are accounted for.
- Recompute after a client breakpoint moves or resizes the host.
- Keep the resolver pure; DOM observation belongs in a provider/hook around it.
- Expose the resolved modes as `data-ov25-*` attributes for CSS, diagnostics, fixtures, and client overrides.
- Avoid resize feedback loops. Round measurements and only publish a new result when the resolved presentation changes.

The resolver should prefer, in order:

1. a usable split layout for short landscape;
2. a usable stacked layout for narrow/tall containers;
3. the existing roomy desktop layout where space permits;
4. an overlay fallback when the inline choices cannot meet their minimum control and viewer sizes.

## Work plan

### Phase 0 — Baseline and fixtures

- [x] Add common desktop, phone, and tablet portrait/landscape viewport captures.
- [x] Give every capture a fresh browser context with the correct touch capability.
- [x] Wait for the 3D configurator and real variant controls before taking screenshots.
- [x] Add a gallery page for side-by-side review.
- [ ] Add constrained-host fixtures independently of viewport size:
  - wide viewport with a narrow product column;
  - phone viewport whose host switches from stacked to split;
  - host resizing across 768px and 1024px boundaries;
  - an arbitrary 900px merchant breakpoint to prove we do not mirror it;
  - fixed/collapsing client header reducing usable height.
- [ ] Add one hybrid touch-and-hover fixture.
- [ ] Add a short 1366×768 laptop to the edge-case review group.

### Phase 1 — Pure responsive resolver

- [ ] Define `ResponsiveEnvironment` and `ResponsivePresentation` in a small responsive-layout module.
- [ ] Encode the short-landscape, stacked-portrait, overlay-fallback, and roomy-desktop rules as a pure function.
- [ ] Add table-driven unit tests covering boundary values and both phone-landscape sizes.
- [ ] Add hysteresis or a small dead band if measurements near a threshold cause mode flapping.
- [ ] Keep `computeIsMobileViewport` temporarily as a compatibility input, not the new source of layout truth.

### Phase 2 — Measurement and diagnostics

- [ ] Add a provider/hook that observes the real plugin host and visual viewport.
- [ ] Publish layout, interaction, and density separately through context.
- [ ] Add resolved `data-ov25-layout`, `data-ov25-interaction`, and `data-ov25-density` attributes.
- [ ] Add development-only diagnostics to the matrix: measured dimensions, resolved mode, and the rule that won.
- [ ] Verify that client DOM moves and breakpoint changes update the result without reinjection or reload.

### Phase 3 — First vertical slice: standard inline product

- [ ] Add an opt-in OV25-owned root for the standard gallery and controls.
- [ ] Implement a two-column short-landscape shell.
- [ ] Size the square viewer from available height and keep it completely visible.
- [ ] Give the controls column its own vertical scroll area and preserve the primary action.
- [ ] Cap the stacked tablet-portrait viewer so controls retain useful space.
- [ ] Keep source/focus order logical when CSS changes the visual arrangement.
- [ ] Use sheets/dialogs for secondary touch detail surfaces; do not make a full overlay sheet the default controls layout when inline right-side controls fit.
- [ ] Verify safe-area insets, zoom, keyboard appearance, and rotation while a detail surface is open.
- [ ] Verify rotation changes presentation without replacing the iframe or losing the selected variant.

### Phase 4 — Decouple interaction behavior

- [ ] Replace layout-driven tooltip/detail choices with `interaction` capability checks.
- [ ] Audit `VariantSelectMenu`, selection details, configurator view controls, sharing, carousel controls, and gallery actions.
- [ ] Preserve explicit desktop/mobile detail-surface configuration, but choose between them using interaction capability rather than shell shape.
- [ ] Ensure no important action is hover-only on touch or hybrid hardware.

### Phase 5 — Migrate specialist modes

Migrate one mode at a time, adding its matrix fixture before changing it:

- [ ] inline-sticky;
- [ ] modal and drawer;
- [ ] variants-only and gallery modes;
- [ ] Snap2 module/checkout panels;
- [ ] dining and product-range flows;
- [ ] carousel/fullscreen combinations.

Do not assume the same controls presentation is right for all modes. They should consume the same resolved environment, but may map it to different panels.

Before migrating Snap2, make its inject-time gallery and panel target ownership profile-neutral or safely movable. The current initial mobile/desktop choice must not outlive a later rotation into a different presentation.

### Phase 6 — Compatibility and rollout

- [ ] Introduce the resolver behind an opt-in `responsiveLayout: 'auto'` flag for client QA.
- [ ] Keep existing forced-mobile and explicit display-mode settings working during migration.
- [ ] Provide a narrowly scoped override for pathological hosts, preferably a forced layout mode or CSS custom properties rather than per-client media-query patches.
- [ ] Compare representative existing client CSS against the new data attributes.
- [ ] Make `auto` the default only after fixture coverage and pilot sites pass.
- [ ] Deprecate redundant `isMobile` layout branches after all consumers migrate.

## Acceptance criteria

### Phone portrait

- Existing stacked behavior remains usable.
- No horizontal page overflow.
- Viewer, controls, and primary action remain reachable.

### Phone landscape — 667×375 and 844×390

- Both resolve to the same short-landscape family.
- The complete square viewer is visible on the left.
- Controls are usable on the right and scroll independently when needed.
- The page itself has no unintended horizontal or nested vertical overflow.
- Touch detail surfaces remain touch-friendly; desktop hover tooltips are not selected merely because width exceeds 768px.
- Rotation between portrait and landscape does not require reload and does not leave stale inline styles.
- Rotation preserves iframe identity, selected configuration, and any valid open-panel state.

### Tablet portrait — 768×1024 and large tablet portrait

- The viewer does not consume nearly the entire initial screen solely to remain square.
- A meaningful controls area is visible or the primary controls are one immediate gesture away.
- Touch behavior is retained even if the layout resembles desktop.

### Tablet landscape and desktop

- The complete viewer is visible at initial load.
- Existing roomy desktop layouts do not regress.
- Controls do not overlap the viewer or client page chrome.

### Client host integration

- A client breakpoint can resize or relocate the plugin host and the plugin adapts from measurements alone.
- A narrow host on a wide viewport does not incorrectly receive a roomy desktop layout.
- A short host does not create a viewer taller than its usable space.
- Explicit client overrides remain possible without needing to fork plugin CSS.
- Legacy separate-slot integrations fall back safely when the client flow cannot fit a split; OV25 does not mutate an arbitrary merchant grid.

### Quality

- The resolver has deterministic unit tests for all named fixture dimensions and threshold boundaries.
- Screenshot tests wait for `OV25 3D Loaded` and populated variant controls.
- Layout changes do not trap focus or create inaccessible visual/source ordering.
- Resize/rotation produces no visible mode thrashing or repeated observer loop warnings.

## First implementation slice

The smallest valuable slice is:

1. create and test the pure resolver;
2. measure the standard inline fixture's real host;
3. render it through the opt-in OV25-owned adaptive root;
4. resolve both phone landscapes to `split + touch + compact`;
5. constrain the viewer by available height;
6. make the right controls column independently scrollable;
7. cap the viewer in tablet portrait;
8. add matrix assertions and screenshots for those three cases.

This validates the architecture before changing Snap2, drawers, sticky relocation, or every existing `isMobile` consumer.

## Decisions to validate during the slice

- The minimum useful controls-column width and viewer size.
- The minimum controls area to reserve below a stacked tablet-portrait viewer.
- Whether an exceptionally narrow/short landscape should use an overlay fallback or show an explicit rotate-device treatment.
- Whether `responsiveLayout: 'auto'` should be opt-in for one release or enabled only on selected pilot clients.

Recommended defaults: inline right-side controls in normal phone landscape, sheets only for secondary/detail content, and an opt-in rollout until representative client hosts pass the matrix.
