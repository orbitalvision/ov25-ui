# Parked bugs

These bugs are excluded from the upcoming release. Their implementation artifacts and worktrees are retained for later resumption, and nothing represented here is approved for release or staging.

Before any parked bug can be approved or staged, move its entire packet back to [bugs-ready-for-review.md](bugs-ready-for-review.md), refresh any stale build and test evidence, and complete review there.

Queue audit 2026-08-03: 10 bugs are parked for post-release work: Bugs 15, 28, 33, 34, 35, 36, 41, 42, 43, and 45. Bug 12 was resumed on 2026-07-30, manually approved on 2026-08-03, and is no longer part of this queue. All named retained worktrees below still exist and contain their proposal changes, except Bug 15, which is retained through review artifacts only.

Current release-cleanup state:

- Bugs 15, 33, 42, 43 (`ov25-ui` side), and 45 are absent from current `ov25-ui` main.
- Bugs 28, 35, 36, 41, and the OV25 side of Bug 43 were never applied to current OV25 main; they remain only in retained worktrees/artifacts.
- The distinct Bug 34 proposal was not applied to current main; the approved, committed Bug 24 equivalent remains.

## Parked

### 15. Variant thumbnails should expose responsive `srcset` tiers

- Status: **PARKED FOR POST-RELEASE**. Manual inspection on 2026-07-16 found invalid `srcset` width descriptors: `?w=50` was advertised as `120w`, `?w=150` as `240w`, and `?w=250` as `480w`. The changes are absent from current main and need redesign before review resumes. Retained artifacts and historical evidence are not approved for release or staging.
- Source item: `make thumbnails pass srcset to img so that all small, medium, large and .thumbnail are available on each selection`
- Historical location: previously implemented inline in main; the Bug 15 changes have now been removed. Retained review diffs describe the rejected proposal only.

Parking reason:

- The browser output proved that the implementation paired transformed CDN URLs with unrelated width descriptors. These descriptors describe intrinsic candidate width, not the viewport slot or desired tier, so the browser could select an undersized image. Automated coverage asserted the same incorrect mapping and did not catch the semantic error.

Bug summary:

- Variant thumbnail cards used a single image URL, usually `miniThumbnails.medium`, so the browser could not choose between the available `small`, `medium`, `large`, and `thumbnail` image tiers.

Historical manual fixtures:

- [gallery-inline-list fixture](http://localhost:3008/tests/gallery-inline-list.html)
- [gallery-inline-tree fixture](http://localhost:3008/tests/gallery-inline-tree.html)
- [gallery-inline-accordion fixture](http://localhost:3008/tests/gallery-inline-accordion.html)
- [gallery-inline-wizard fixture](http://localhost:3008/tests/gallery-inline-wizard.html)
- Historical `bb56186` baseline: [gallery-inline-list fixture on 3009](http://127.0.0.1:3009/tests/gallery-inline-list.html)
- Historical `bb56186` baseline: [gallery-inline-tree fixture on 3009](http://127.0.0.1:3009/tests/gallery-inline-tree.html)
- Historical `bb56186` baseline: [gallery-inline-accordion fixture on 3009](http://127.0.0.1:3009/tests/gallery-inline-accordion.html)
- Historical `bb56186` baseline: [gallery-inline-wizard fixture on 3009](http://127.0.0.1:3009/tests/gallery-inline-wizard.html)

Before/after screenshots:

- Not generated. This is an image attribute/performance fix; the visual output should be unchanged, and the useful manual check is the rendered `srcset`/`sizes` attributes.

Manual verification on resumption:

Current-state prerequisite: redesign the candidate-width contract, reapply a corrected implementation, and refresh all evidence before testing. Do not reuse the rejected descriptor mapping.

1. Rebuild `ov25-ui` first so the dev fixture package import picks up the source change, then keep using your `localhost:3008` server.
2. Open the list fixture above and wait for variant cards to render.
3. Run this DevTools snippet:

```js
(() => {
  const roots = [document];
  const seen = new Set();
  const images = [];
  for (const root of roots) {
    root.querySelectorAll?.('.ov25-selection-thumbnail img, .ov25-variant-thumb-wrapper img').forEach((img) => {
      images.push({
        src: img.getAttribute('src'),
        srcset: img.getAttribute('srcset'),
        sizes: img.getAttribute('sizes'),
        alt: img.getAttribute('alt'),
      });
    });
    root.querySelectorAll?.('*').forEach((el) => {
      if (el.shadowRoot && !seen.has(el.shadowRoot)) {
        seen.add(el.shadowRoot);
        roots.push(el.shadowRoot);
      }
    });
  }
  return images.filter((img) => img.srcset).slice(0, 10);
})()
```

4. Expected after redesign: every width descriptor truthfully matches that candidate image's intrinsic/requested width. In particular, do not advertise `?w=50` as `120w`, `?w=150` as `240w`, or `?w=250` as `480w`.
5. Repeat quickly on the tree, accordion, and wizard fixtures.
6. Expected: thumbnails still render normally; no broken images, no visible layout change.

Historical changed files:

- `src/contexts/ov25-ui-context.tsx`
- `src/utils/variant-image-srcset.ts`
- `src/components/VariantSelectMenu/MobileVariants.tsx`
- `src/components/VariantSelectMenu/ProductVariants.tsx`
- `src/components/VariantSelectMenu/ProductVariantsWrapper.tsx`
- `src/components/VariantSelectMenu/TreeVariants.tsx`
- `src/components/VariantSelectMenu/AccordionVariants.tsx`
- `src/components/VariantSelectMenu/WizardVariants.tsx`
- `src/components/VariantSelectMenu/variant-cards/DefaultVariantCard.tsx`
- `src/components/VariantSelectMenu/variant-cards/SizeVariantCard.tsx`
- `src/components/VariantSelectMenu/variant-cards/VariantThumb.tsx`
- `test/unit/variant-image-srcset.test.ts`

Retained implementation diffs:

- [review-diffs/bug-thumbnail-srcset.diff](../review-diffs/bug-thumbnail-srcset.diff)
- [review-diffs/bug-thumbnail-srcset-follow-up.diff](../review-diffs/bug-thumbnail-srcset-follow-up.diff)

Historical native diff in Cursor:

- Open Source Control and click the changed files above, or open each file and run `Git: Open Changes`.
- Note: Source Control also contains other pending review work. The linked diff is the scoped thumbnail `srcset` patch.

Historical diff summary (known-invalid descriptor mapping):

```diff
+ imageUrls?: VariantImageUrls
+ getVariantImageUrlsFromSelection(selection)
+ <img {...getVariantImageResponsiveAttrs(...)} />
+ srcSet: 'small.jpg 120w, medium.jpg 240w, large.jpg 480w, thumb.jpg 800w'
```

Historical verification run:

- `git diff --check -- src/utils/variant-image-srcset.ts src/components/VariantSelectMenu/WizardVariants.tsx src/components/VariantSelectMenu/ProductVariants.tsx src/components/VariantSelectMenu/ProductVariantsWrapper.tsx src/components/VariantSelectMenu/TreeVariants.tsx src/components/VariantSelectMenu/AccordionVariants.tsx src/components/VariantSelectMenu/variant-cards/DefaultVariantCard.tsx src/components/VariantSelectMenu/variant-cards/SizeVariantCard.tsx src/components/VariantSelectMenu/variant-cards/VariantThumb.tsx test/unit/variant-image-srcset.test.ts` passed.
- `npm run type-check` passed.
- `npm run test:unit -- test/unit/variant-image-srcset.test.ts` passed.
- `git apply --check --cached review-diffs/bug-thumbnail-srcset.diff` passed, so approval staging can be scoped to this bug.
- 2026-06-08 follow-up: `git diff --check -- src/utils/variant-image-srcset.ts src/contexts/ov25-ui-context.tsx src/components/VariantSelectMenu/variant-cards/DefaultVariantCard.tsx src/components/VariantSelectMenu/variant-cards/SizeVariantCard.tsx src/components/VariantSelectMenu/MobileVariants.tsx test/unit/variant-image-srcset.test.ts` passed.
- 2026-06-08 follow-up: `npm run test:unit -- test/unit/variant-image-srcset.test.ts` passed: 7 tests.
- 2026-06-08 follow-up: `npm run type-check` passed.
- 2026-06-08 artifact refresh: `review-diffs/bug-thumbnail-srcset-follow-up.diff` now applies cleanly after `review-diffs/bug-thumbnail-srcset.diff` in a temporary clean worktree.
- 2026-06-08 code review by subagent `Pascal`: no implementation blocking findings. Review confirmed URL extraction/propagation is consistent across regular variants, size/product variants, wizard review thumbnails, `VariantThumb`, `SizeVariantCard`, mobile carousel comparator, and tests.
- Pascal found a review-artifact issue: the follow-up diff added trailing whitespace on the final `SizeVariantCard.tsx` `);` line. Main fixed `review-diffs/bug-thumbnail-srcset-follow-up.diff`, verified the line has no trailing whitespace, applied the base patch and follow-up patch in order in `/private/tmp/ov25-srcset-check-20260608a`, and ran `git diff --check` on the resulting source changes.

Code review findings resolved:

- P1 resolved: synthetic size/product selections now translate product metadata image tiers into `imageUrls`, so `SizeVariantCard` can expose responsive tiers when product metadata provides them.
- P2 resolved: memo comparators in `DefaultVariantCard`, `SizeVariantCard`, and mobile carousel rendering now compare `image`/`imageUrls` value changes.

Automated test candidates:

- Existing unit coverage for URL extraction, `src` preference, `srcSet` order, dedupe, and fallback behavior.
- Added follow-up unit coverage for product metadata tier extraction, preserving attached product tiers on size selections, and `variantImageUrlsEqual`.
- Playwright assertion that variant thumbnail images in list/tree/accordion/wizard fixtures expose `srcset` when selections include `miniThumbnails`.

Residual risk:

- Product-size thumbnails only expose `srcset` when the size/product data includes multiple image tiers; current size option data often only has one resolved product image.
- Raw string product images still produce a single image URL; multi-tier `srcSet` depends on product metadata carrying tiered URL objects.
- Staging risk is high if path-staging: touched files also contain unrelated pending hunks, especially `src/contexts/ov25-ui-context.tsx` with Buy Now/AR/open-handler changes and `SizeVariantCard.tsx` with Bug 7a dimension selector changes. Use selected hunks or the refreshed scoped patches.
- Manual browser verification depends on a rebuilt `dist` because the dev fixture imports `ov25-ui` as a package.

Resumption instruction:

- Redesign the width-candidate contract first. Then move this entire packet back to [bugs-ready-for-review.md](bugs-ready-for-review.md), refresh implementation diffs and automated/browser evidence, and complete manual review before requesting approval or staging. Do not stage or approve the retained rejected proposal.

### 28. Snap2 movable objects rotate with mouse wheel

- Status: **PARKED FOR POST-RELEASE**. The Bug 28 proposal was never applied to current OV25 main; it remains only in the named OV25 worktree and retained review artifact. It is not fixed or approved.
- Source item: `snap2 rotate movable object with mousewheel?`
- Branch/worktree: `codex/snap2-movable-wheel-rotate` at `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/OV25-snap2-movable-wheel-rotate`.
- Patch owner: subagent `Bacon`.

Historical implementation summary:

- During Snap2 movable-object drag/placement, wheel input previously had no scoped rotation behavior for the object being placed.
- The expected behavior is that mouse wheel over the 3D canvas rotates the active movable object in the same 90-degree orientation increments Snap2 already uses, without changing normal wheel behavior outside movable placement.

Manual fixture:

- Use an OV25 Snap2 product/configurator with at least one movable object. There is no `ov25-ui` localhost fixture for this because the affected interaction is inside the OV25 3D app.

Before/after screenshots:

- Not generated. This is a wheel interaction inside a live 3D Snap2 scene and needs the product data that exposes movable modules.

Manual verification on resumption:

Current-state prerequisite: use the retained worktree or reapply the retained implementation diff before running these steps; the relevant current main workspace does not contain this parked proposal.

1. Open a Snap2 configurator with a movable module available.
2. Start placing or dragging the movable object.
3. Move the pointer over the 3D canvas and scroll the mouse wheel.
4. Expected: the movable object rotates in quarter turns while it keeps following the mouse.
5. Scroll the opposite direction.
6. Expected: rotation steps reverse and wrap normally.
7. Click to place the object.
8. Expected: the placed object keeps the chosen orientation/rotation and remains on the floor.
9. Exit movable placement and use the mouse wheel normally.
10. Expected: normal page/camera wheel behavior is unchanged when not actively placing a movable object.

Historical changed-file scope:

- [Snap2Model.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/OV25-snap2-movable-wheel-rotate/components/threeD/ModelPreview/Model/Snap2Model.tsx)
- [movableRotation.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/OV25-snap2-movable-wheel-rotate/lib/snap2/movableRotation.ts)
- [movableRotation.test.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/OV25-snap2-movable-wheel-rotate/lib/snap2/movableRotation.test.ts)

Retained implementation diff:

- [review-diffs/bug-snap2-movable-wheel-rotate.diff](../review-diffs/bug-snap2-movable-wheel-rotate.diff)

Native diff in Cursor:

- Open the OV25 worktree at `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/OV25-snap2-movable-wheel-rotate`, then open Source Control or run `Git: Open Changes`.

Retained diff summary:

```diff
+ getSnap2WheelRotationSteps() accumulates wheel delta into quarter-turn steps
+ rotateSnap2ClockwiseRotation() / rotateSnap2Orientation()
+ while isDraggingMovable: canvas wheel prevents default and rotates active object
+ updates model.rotation.y, orientation metadata, matrix world, and invalidates scene
+ listener is only attached while movable placement is active
```

Historical verification run:

- `git diff --check -- components/threeD/ModelPreview/Model/Snap2Model.tsx lib/snap2/movableRotation.ts lib/snap2/movableRotation.test.ts` passed in the OV25 worktree.
- Subagent attempted `bun run test:unit:ci lib/snap2/movableRotation.test.ts`, but the OV25 worktree dependency install is incomplete/mismatched and Rollup could not find `@rollup/rollup-darwin-x64`.

Automated test candidates:

- Helper test added for wrapped clockwise rotation, orientation metadata, radians mapping, wheel delta accumulation, and line-mode wheel normalization.
- Add an OV25 3D interaction test when a deterministic Snap2 movable fixture is available: enter movable placement, dispatch wheel on canvas, assert rotation/orientation changes, then place.
- Regression test: dispatch wheel when `isDraggingMovable` is false and assert no Snap2 object rotation.

Residual risk:

- The implementation mutates the active Three.js model and object metadata during drag, matching the existing Snap2 drag-placement style, then persists through the normal placement/history path.
- Manual testing should confirm scroll sensitivity feels right on a real mouse/trackpad.
- The wheel listener is canvas-scoped and active only during movable placement; if users wheel outside the canvas during placement, it will not rotate.

Resumption instruction:

- To resume Bug 28 after the release, move this entire packet back to [bugs-ready-for-review.md](bugs-ready-for-review.md), refresh any stale build/test evidence, and complete manual review there before requesting approval or staging. Do not mark the bug fixed while parked.

Archived committed and resolved review packets: [bugs-resolved.md](bugs-resolved.md).

### 33. Runtime name selectors first slice

- Status: **PARKED FOR POST-RELEASE**. Bug 33 code is absent from current main; the proposal remains only in the named worktree and retained review artifact. It is not fixed or approved.
- Source item: `Data selectors for names` / `For everywhere we show text... data selectors on all of them`.
- Branch/worktree: `codex/runtime-name-selectors` at `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors`.
- Patch owner: subagent `Dalton`.

Historical implementation summary:

- The setup-only catalog packet lists existing name selectors, but several visible runtime name/title surfaces still had no stable selector.
- This first bounded runtime slice adds stable classes and `data-ov25-*` selectors for size variant names, option header labels, tab names, wizard step/review names, Snap2 checkout selection names, Snap2 module position/type tab labels, bottom-panel module tooltip names, and custom-dimension product names.
- This is not the full string interpolation/custom icon architecture pass.

Manual fixtures:

- [gallery inline list fixture](http://localhost:3008/tests/gallery-inline-list.html)
- [gallery inline tree fixture](http://localhost:3008/tests/gallery-inline-tree.html)
- [gallery inline accordion fixture](http://localhost:3008/tests/gallery-inline-accordion.html)
- [gallery inline wizard fixture](http://localhost:3008/tests/gallery-inline-wizard.html)
- [Snap2 dialog fixture](http://localhost:3008/tests/snap2-dialog.html)
- [configurator setup fixture](http://localhost:3008/tests/configurator-setup.html)
- Historical `bb56186` baseline: [configurator setup fixture on 3009](http://127.0.0.1:3009/tests/configurator-setup.html)

Before/after screenshots:

- Not generated. This is a selector/API-surface change; useful review is DOM/custom-CSS inspection, and visual output should be unchanged.

Manual verification on resumption:

Current-state prerequisite: use the retained worktree or reapply the retained implementation diff before running these steps; the relevant current main workspace does not contain this parked proposal.

1. On post-release resumption, open the worktree above or apply the branch patch to your local dev copy, then rebuild if your running fixture serves built assets.
2. Open the representative fixtures above.
3. Inspect visible name/title surfaces in DevTools.
4. Expected: matching elements exist for selectors such as `[data-ov25-size-variant-name]`, `[data-ov25-option-header-label]`, `[data-ov25-tab-name]`, `[data-ov25-wizard-step-name]`, `[data-ov25-wizard-review-option-name]`, `[data-ov25-wizard-review-selection-name]`, `[data-ov25-snap2-checkout-selection-name]`, `[data-ov25-snap2-custom-dimension-product-name]`, `[data-ov25-module-type-tab-name]`, `[data-ov25-module-position-tab-name]`, and `[data-ov25-snap2-bottom-panel-module-name]`.
5. Add temporary custom CSS targeting one or two selectors.
6. Expected: the targeted text can be styled without relying on Tailwind utility classes and without visible layout changes.
7. In the setup fixture, check Element Styles.
8. Expected: the new selector labels are available in the setup selector catalog.

Historical changed-file scope:

- [configurator-style-variables.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/setup/src/lib/config/configurator-style-variables.ts)
- [Snap2CheckoutSheet.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/src/components/Snap2CheckoutSheet.tsx)
- [AccordionTrigger.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/src/components/VariantSelectMenu/AccordionTrigger.tsx)
- [DesktopVariants.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/src/components/VariantSelectMenu/DesktopVariants.tsx)
- [FilterContent.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/src/components/VariantSelectMenu/FilterContent.tsx)
- [ModuleBottomPanel.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/src/components/VariantSelectMenu/ModuleBottomPanel.tsx)
- [ModulePositionTypeTabs.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/src/components/VariantSelectMenu/ModulePositionTypeTabs.tsx)
- [ModuleTypeTabs.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/src/components/VariantSelectMenu/ModuleTypeTabs.tsx)
- [ProductVariantsWrapper.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/src/components/VariantSelectMenu/ProductVariantsWrapper.tsx)
- [Snap2CustomDimensionForm.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/src/components/VariantSelectMenu/Snap2CustomDimensionForm.tsx)
- [TreeTrigger.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/src/components/VariantSelectMenu/TreeTrigger.tsx)
- [TreeVariants.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/src/components/VariantSelectMenu/TreeVariants.tsx)
- [WizardVariants.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/src/components/VariantSelectMenu/WizardVariants.tsx)
- [SizeVariantCard.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors/src/components/VariantSelectMenu/variant-cards/SizeVariantCard.tsx)

Retained implementation diff:

- [review-diffs/bug-runtime-name-selectors.diff](../review-diffs/bug-runtime-name-selectors.diff)

Native diff in Cursor:

- Open the worktree at `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/ov25-ui-runtime-name-selectors`, then open Source Control or run `Git: Open Changes`.

Retained diff summary:

```diff
+ data-ov25-size-variant-name
+ data-ov25-option-header-label
+ data-ov25-tab-name
+ data-ov25-wizard-step-name
+ data-ov25-wizard-review-option-name / selection-name
+ data-ov25-snap2-checkout-selection-name
+ data-ov25-snap2-custom-dimension-product-name
+ data-ov25-module-type-tab-name / module-position-tab-name
+ data-ov25-snap2-bottom-panel-module-name
+ matching setup ELEMENT_SELECTORS entries
```

Historical verification run:

- Worker: `git diff --check` passed.
- Worker: `bun run type-check` at repo root passed.
- Main: repeated `git diff --check` for the changed files; passed.
- Main: repeated `bun run type-check` at repo root; passed.
- Main: selector grep confirmed the new runtime selectors and setup catalog entries exist.
- Setup package check: `bun run type-check` inside `setup/` failed on existing unrelated setup issues, mostly unresolved local/package dependencies (`ov25-ui`, `react-colorful`, CodeMirror/Radix packages) and pre-existing implicit-any errors.
- 2026-06-08 code review by subagent `Galileo`: no blocking findings. Review confirmed `git apply --check --cached review-diffs/bug-runtime-name-selectors.diff` passes from the clean index and the artifact was intact when parked.

Automated test candidates:

- DOM smoke tests across list/tree/accordion/wizard/Snap2 fixtures asserting the new `data-ov25-*name*` selectors exist.
- Setup catalog unit/snapshot test asserting the new selector labels are included in `ELEMENT_SELECTORS`.
- Visual regression should remain unchanged because the patch only adds attributes/classes and small inline spans around existing tab labels.

Residual risk:

- The patch adds wrapper spans around some tab labels. They are inline elements inside existing flex/button layouts, but manual review should still check tab spacing.
- This is only a bounded first slice. It does not finish string interpolation, custom icon replacement, or every possible name/text selector in the app.
- Historical integration note: at review time, the branch started from clean `HEAD` while dirty main had other selector/catalog changes. On resumption, use the retained clean artifact and reassess conflicts against then-current main.
- `[data-ov25-option-header-label]` is registered in setup as `element: 'span'`, but runtime applies the selector to mixed text elements (`span`, `div`, `h3`, and `h4`). This should not affect generated CSS, but the setup metadata is imprecise.
- The touched files include unrelated pending local hunks in `setup/src/lib/config/configurator-style-variables.ts`, `ProductVariantsWrapper.tsx`, `TreeVariants.tsx`, `WizardVariants.tsx`, and `SizeVariantCard.tsx`. When resumed and approved, stage from the clean-index patch or selected hunks only.

Resumption instruction:

- To resume Bug 33 after the release, move this entire packet back to [bugs-ready-for-review.md](bugs-ready-for-review.md), refresh any stale build/test evidence, and complete manual review there before requesting approval or staging. Do not mark the bug fixed while parked.

### 34. Setup Snap2 side/position controls

- Status: **PARKED FOR POST-RELEASE**. The distinct Bug 34 proposal was not applied to current main and remains only in its worktree and review artifact. The approved, committed Bug 24 equivalent remains in main. Bug 34 itself is not fixed or approved.
- Source item: `Unified menu and select side$`.
- Branch/worktree: `codex/setup-snap2-position-controls` at `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/ov25-ui-setup-snap2-position-controls`.
- Patch owner: subagent `Locke`.

Historical implementation summary:

- Current main already contains the approved Bug 24 setup/export controls. Do not reapply this older overlapping proposal without first identifying a behavior that Bug 24 does not cover.
- Runtime already supports Snap2 `configurator.variants.position` and `configurator.modules.position`.
- Dev fixtures expose those values through query params, but ov25-setup had no controls for variant sheet side or module panel position.
- Setup exports therefore could not configure desktop/mobile Snap2 side placement from the UI.

Manual fixture:

- [configurator setup fixture](http://localhost:3008/tests/configurator-setup.html)
- Historical `bb56186` baseline: [configurator setup fixture on 3009](http://127.0.0.1:3009/tests/configurator-setup.html)

Before/after screenshots:

- Not generated. This is a setup form/export change; the useful review is checking the setup controls and exported JSON. Per workflow, Codex did not rebuild `ov25-ui` or `setup`.

Manual verification on resumption:

Current-state prerequisite: use the retained worktree or reapply the retained implementation diff before running these steps; the relevant current main workspace does not contain this parked proposal.

1. On post-release resumption, open the worktree above or apply the patch to your local setup build.
2. On post-release resumption, rebuild setup if needed, then open the fixture above.
3. Select the `Snap2` product type.
4. Expected: the Configurator section shows `Variant sheet side` and `Module panel position`.
5. Change desktop/mobile values for both controls.
6. Save/export current settings.
7. Expected: exported JSON includes lowercase `configurator.variants.position.desktop/mobile` and `configurator.modules.position.desktop/mobile`.
8. Switch to `Standard` or `Bed`.
9. Expected: the Snap2 position controls are hidden, and non-Snap2 exports do not include those position objects.

Historical changed-file scope:

- [types.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-setup-snap2-position-controls/setup/src/components/ConfiguratorSetup/types.ts)
- [useConfiguratorSetup.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-setup-snap2-position-controls/setup/src/components/ConfiguratorSetup/useConfiguratorSetup.ts)
- [ConfigPanel/index.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-setup-snap2-position-controls/setup/src/components/ConfiguratorSetup/ConfigPanel/index.tsx)
- [initial-config-from-payload.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-setup-snap2-position-controls/setup/src/components/ConfiguratorSetup/initial-config-from-payload.ts)
- [preview-config-serializable.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-setup-snap2-position-controls/setup/src/components/ConfiguratorSetup/preview-config-serializable.ts)

Retained implementation diff:

- [review-diffs/bug-setup-snap2-position-controls.diff](../review-diffs/bug-setup-snap2-position-controls.diff)

Native diff in Cursor:

- Open the worktree at `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/ov25-ui-setup-snap2-position-controls`, then open Source Control or run `Git: Open Changes`.

Retained diff summary:

```diff
+ FormSnap2VariantSheetSide = 'left' | 'right'
+ FormSnap2ModulePanelPosition = 'left' | 'right' | 'bottom'
+ Snap2-only DesktopMobileRow controls in setup Configurator panel
+ export configurator.variants.position for Snap2
+ export configurator.modules.position for Snap2
+ import saved uppercase/lowercase position values into setup form state
```

Historical verification run:

- Worker: `git diff --check -- <changed files>` passed.
- Worker: root `bun run type-check` passed.
- Main: repeated focused `git diff --check` for changed files; passed.
- Main: repeated root `bun run type-check`; passed.
- Main: targeted Bun smoke check confirmed Snap2 export shape and import normalization:
  - export: `{"variants":{"desktop":"left","mobile":"right"},"modules":{"desktop":"bottom","mobile":"left"}}`
  - import: `{"vd":"left","vm":"right","md":"bottom","mm":"left"}`
- Setup package check: `bun run type-check` inside `setup/` failed on existing unrelated setup issues, mostly unresolved local/package dependencies (`ov25-ui`, `react-colorful`, CodeMirror/Radix packages) and pre-existing implicit-any errors.
- 2026-06-08 code review by subagent `Confucius`: no blocking findings. Review confirmed the packet is setup-scoped, runtime already consumes the lowercase position values, UI controls are gated to Snap2, export only adds `variants.position` and `modules.position` when `layout === 'snap2'`, and import normalizes uppercase/lowercase saved values with `trim().toLowerCase()`.
- Staging check: `git apply --check --cached review-diffs/bug-setup-snap2-position-controls.diff` passes from the clean index.

Automated test candidates:

- Unit test `buildSerializableConfig('snap2', ...)` exports both position objects.
- Unit test non-Snap2 layouts do not export Snap2 position objects.
- Unit test `buildFormStateFromInitialPayload` imports uppercase/lowercase position values.
- Component render test that controls are visible for Snap2 and hidden for Standard/Bed.

Residual risk:

- Historical integration note: at review time, the branch started from clean `HEAD` while dirty main had other setup changes such as `disableBuyNow`. On resumption, use the retained clean artifact and reassess conflicts against then-current main.
- Historical integration note: four touched setup files contained unrelated dirty-main hunks during review. On resumption, use the scoped review diff or selected hunks rather than broad file staging.
- Runtime already normalizes these values, so no runtime code changed.
- Manual browser verification depends on your current setup build.

Resumption instruction:

- To resume Bug 34 after the release, move this entire packet back to [bugs-ready-for-review.md](bugs-ready-for-review.md), refresh any stale build/test evidence, and complete manual review there before requesting approval or staging. Do not mark the bug fixed while parked.

### 35. OV25 setup style-variable drift removed

- Status: **PARKED FOR POST-RELEASE**. The Bug 35 proposal was never applied to current OV25 main; it remains only in the named OV25 worktree and retained review artifact. It is not fixed or approved.
- Source item: `theres separate configurator-style-variables.tsx in OV25 and ov25-setup. and they have drifted. not sure what solution is here. is one obsolete? (yes, OV25 stuff can be deleted)`
- Branch/worktree: `codex/setup-style-variable-drift` at `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/OV25-setup-style-variable-drift`.
- Patch owner: subagent `Heisenberg`.

Historical implementation summary:

- OV25 still had a local `components/admin-dashboard/ConfiguratorSetup` editor importing local `lib/config/configurator-style-variables.ts`.
- The canonical setup editor lives in `ov25-setup`, so the local OV25 editor/config had drifted from the package-backed setup experience.
- The remaining stale route was the manufacturer dashboard setup route, which rendered the local editor instead of the package-backed `/configurator-setup` page.

Manual fixture:

- OV25 route: `/dashboard/manufacturer/tools/configurator-setup`
- Canonical setup route: `/configurator-setup`

Before/after screenshots:

- Not generated. This is a route/ownership cleanup and needs the OV25 app route environment.

Manual verification on resumption:

Current-state prerequisite: use the retained worktree or reapply the retained implementation diff before running these steps; the relevant current main workspace does not contain this parked proposal.

1. Open `/dashboard/manufacturer/tools/configurator-setup`.
2. Expected: it redirects to `/configurator-setup`.
3. Open `/configurator-setup`.
4. Expected: setup editor loads from `ov25-setup`.
5. Open `/configurator-preview`.
6. Expected: preview still accepts setup postMessage payloads and injects configurator config.
7. Confirm style selector options match the package setup editor rather than the stale local OV25 copy.

Historical changed-file scope:

- [manufacturer setup page](</Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/OV25-setup-style-variable-drift/app/(OV25)/(dashboard)/dashboard/manufacturer/tools/configurator-setup/page.tsx>)
- [configurator preview page](</Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/OV25-setup-style-variable-drift/app/(ov25-ui)/configurator-preview/page.tsx>)
- Deleted `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/OV25-setup-style-variable-drift/components/admin-dashboard/ConfiguratorSetup`
- Deleted `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/OV25-setup-style-variable-drift/lib/config/configurator-style-variables.ts`

Retained implementation diff:

- [review-diffs/bug-setup-style-variable-drift.diff](../review-diffs/bug-setup-style-variable-drift.diff)

Native diff in Cursor:

- Open the OV25 worktree at `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/OV25-setup-style-variable-drift`, then open Source Control or run `Git: Open Changes`. Use the native diff for the full deleted-file contents.

Retained diff summary:

```diff
- local admin-dashboard ConfiguratorSetup editor
- local lib/config/configurator-style-variables.ts
+ manufacturer setup route redirects to /configurator-setup
+ configurator preview imports SerializableInjectConfig from ov25-setup
```

Historical verification run:

- `rg` found no remaining imports of `@/components/admin-dashboard/ConfiguratorSetup`, `components/admin-dashboard/ConfiguratorSetup`, `@/lib/config/configurator-style-variables`, or `lib/config/configurator-style-variables`.
- Confirmed `/configurator-setup` route exists and imports `ConfiguratorSetup` from `ov25-setup`.
- `git diff --check` passed in the OV25 worktree.
- Subagent attempted `bun run type-check`, but the OV25 worktree dependency install is incomplete and `next` was not found.

Automated test candidates:

- Route smoke test for `/dashboard/manufacturer/tools/configurator-setup` redirecting to `/configurator-setup`.
- Import/lint guard preventing new imports from retired local setup path/config.
- Type-check after OV25 dependencies are installed.

Residual risk:

- This deletes a large local OV25 setup editor directory. Manual review should confirm no hidden internal workflow expected the old manufacturer route to render a distinct editor.
- The review diff summarizes deleted files; use the native Cursor diff for exact removed file contents.
- The `ov25-setup` package export for `SerializableInjectConfig` must be available in the OV25 dependency version used at build time.

Resumption instruction:

- To resume Bug 35 after the release, move this entire packet back to [bugs-ready-for-review.md](bugs-ready-for-review.md), refresh any stale build/test evidence, and complete manual review there before requesting approval or staging. Do not mark the bug fixed while parked.

### 36. Permissions page no longer surfaces Vercel 500 for denied users

- Status: **PARKED FOR POST-RELEASE**. The Bug 36 proposal was never applied to current OV25 main; it remains only in the named OV25 worktree and retained review artifact. It is not fixed or approved.
- Source item: `remove the permissions 500 error from vercel`
- Branch/worktree: `codex/permissions-500-vercel` at `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/OV25-permissions-500-vercel`.
- Patch owner: subagent `Kierkegaard`; artifact repaired by `Hubble`.

Historical implementation summary:

- `/tools/permissions` rewrites to `/dashboard/orbital/tools/permissions`.
- A logged-in Orbital user without `ORBITAL_SUPER_ADMIN` or `orbital:view:permissions` could load the page shell, then `PermissionsManager` mounted and called protected server actions.
- Those server actions use `withAuth`, which throws on insufficient permissions. On Vercel/Next server actions this can surface as a 500-style failure instead of a controlled no-access state.

Manual fixture:

- OV25/Vercel route: `/tools/permissions`
- Direct route: `/dashboard/orbital/tools/permissions`

Before/after screenshots:

- Not generated. This is an auth/permissions route-state bug requiring specific Vercel users/permissions.

Manual verification on resumption:

Current-state prerequisite: use the retained worktree or reapply the retained implementation diff before running these steps; the relevant current main workspace does not contain this parked proposal.

1. Log in on Vercel as an Orbital user lacking `orbital:view:permissions` and not `ORBITAL_SUPER_ADMIN`.
2. Visit `/tools/permissions`.
3. Expected: a controlled “Permissions unavailable” no-access panel appears.
4. Expected: there is no 500 and no server-action error caused by `PermissionsManager` mounting.
5. Log in as `ORBITAL_SUPER_ADMIN` or a user with `orbital:view:permissions`.
6. Visit `/tools/permissions`.
7. Expected: the permissions table still loads normally.
8. Log out and visit the route.
9. Expected: redirect to `/log-in`.

Historical changed-file scope:

- [permissions page](</Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/OV25-permissions-500-vercel/app/(OV25)/(dashboard)/dashboard/orbital/tools/permissions/page.tsx>)
- [permissions-manager-auth.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/OV25-permissions-500-vercel/lib/utils/permissions-manager-auth.ts)
- [permissions-manager-auth.test.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/OV25-permissions-500-vercel/lib/utils/permissions-manager-auth.test.ts)

Retained implementation diff:

- [review-diffs/bug-permissions-500-vercel.diff](../review-diffs/bug-permissions-500-vercel.diff)

Native diff in Cursor:

- Open the OV25 worktree at `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/OV25-permissions-500-vercel`, then open Source Control or run `Git: Open Changes`.

Retained diff summary:

```diff
+ page-level auth() check
+ redirect('/log-in') for missing session
+ canAccessPermissionsManager(session.user, checkAuth)
+ render controlled no-access panel for insufficient access
+ render PermissionsManager only for allowed users
```

Historical verification run:

- `git diff --check -- 'app/(OV25)/(dashboard)/dashboard/orbital/tools/permissions/page.tsx' lib/utils/permissions-manager-auth.ts lib/utils/permissions-manager-auth.test.ts` passed in the OV25 worktree.
- Subagent attempted `bun run test:unit:ci lib/utils/permissions-manager-auth.test.ts`, but the OV25 worktree dependency install is incomplete/mismatched and Rollup could not find its optional native package.
- Subagent attempted `bun run type-check`, but `next` is not available in that worktree command path.
- Direct `tsc --noEmit` was also blocked by incomplete dependency/type resolution.
- 2026-06-08 code review by subagent `Epicurus`: implementation looks correct. Review confirmed the page-level gate redirects unauthenticated users, checks auth before rendering, returns denied UI for unauthorized users, and only mounts `PermissionsManager` for allowed users.
- Epicurus initially found the diff artifact did not apply cleanly in a fresh OV25 context because of CRLF/LF-sensitive context.
- 2026-06-08 artifact repair by subagent `Hubble`: regenerated `review-diffs/bug-permissions-500-vercel.diff` from the OV25 permissions worktree so it preserves the CRLF-sensitive deleted lines required by the OV25 clean HEAD context.
- Hubble verified `git apply --check /Users/orbital/Documents/CODE/ORBITAL\ VISION/ov25-ui/review-diffs/bug-permissions-500-vercel.diff` passed in a fresh temporary OV25 worktree.
- Hubble verified the repaired patch applied in that temporary OV25 worktree and `git diff --check -- 'app/(OV25)/(dashboard)/dashboard/orbital/tools/permissions/page.tsx' 'lib/utils/permissions-manager-auth.ts' 'lib/utils/permissions-manager-auth.test.ts'` passed.
- Main verified `git diff --check -- review-diffs/bug-permissions-500-vercel.diff` passed from `ov25-ui`.

Automated test candidates:

- Helper test added for missing user, missing user id, and passing the correct auth requirements to `checkAuth`.
- Route/render test mocking `auth()` and `checkAuth()` to assert denied users see no-access UI and `PermissionsManager` is not rendered.
- Server-action regression test asserting `getUsersWithPermissions` remains protected for direct invocation.

Residual risk:

- This prevents the denied page from mounting `PermissionsManager`; it does not weaken the server action protection.
- The no-access panel is intentionally minimal. If there is a shared no-access component/page in OV25, this could be swapped during review.
- Helper coverage is useful but narrow; it does not integration-test real super-admin/permission behavior or page-level non-mount behavior.
- In the linked worktree, `lib/utils/permissions-manager-auth.ts` and `lib/utils/permissions-manager-auth.test.ts` are untracked, so future staging after resumption and approval must include them explicitly.
- The diff artifact intentionally contains CR characters on removed lines for the existing CRLF OV25 source file. Removing those characters recreates the clean-apply failure.

Resumption instruction:

- To resume Bug 36 after the release, move this entire packet back to [bugs-ready-for-review.md](bugs-ready-for-review.md), refresh any stale build/test evidence, and complete manual review there before requesting approval or staging. Do not mark the bug fixed while parked.

### 41. Snap2 name selector falls back to the range name

- Status: **PARKED FOR POST-RELEASE**. The Bug 41 OV25 sender proposal was never applied to current OV25 main; it remains only in retained worktree/artifact state. No Bug 41 production change exists in `ov25-ui`, and the bug is not fixed or approved.
- Source item: Snap2 products replacing a name selector with `Name.tsx` render an empty name.
- Patch owners: subagent `Fermat` (canonical OV25 sender), cleanup worker `Cicero`, and independent reviewer `Faraday`.

Historical implementation summary:

- Standard configurators sent `RANGE` as a flat range object, while Snap2 sent `{ rangeData, productIds }`.
- The primary fix is now at the OV25 sender: flat standard input and nested Snap2 input both produce the same flat `RANGE.payload` before `postMessage`.
- `ov25-ui` consumes that canonical payload directly. `Name.tsx` remains unchanged, preserving its fallback and custom `productTitle` replacement behavior.

Manual fixture:

- [Snap2 dialog fixture](http://localhost:3008/tests/snap2-dialog.html)

Before/after screenshots:

- [Before: blank Snap2 name area](../review-screenshots/bug-41-snap2-name-before.jpg)
- After screenshot deferred: the fixture must open its full-screen Snap2 chooser to load the range, which then obscures the host-page heading. Live browser inspection confirmed the heading changes from blank to `Otto` after the iframe sends `RANGE`.
- The clean 3009 `ov25-ui` baseline is no longer a valid before comparison because it uses the same local OV25 iframe.

Manual verification on resumption:

Current-state prerequisite: use the retained worktree or reapply the retained implementation diff before running these steps; the relevant current main workspace does not contain this parked proposal.

1. On post-release resumption, ensure local OV25 on port 3000 has reloaded; restart that dev server only if hot reload missed the sender files, then reload the 3008 fixture. No `ov25-ui` rebuild is required.
2. Before opening the dialog, inspect the product information area above the price/Configure button.
3. Expected: the Snap2 range name is visible instead of a blank heading.
4. Open/configure the Snap2 product and confirm the name stays correct.
5. Compare with the linked before screenshot: its equivalent name area is blank.
6. Regression: open a standard-product fixture such as [gallery inline list](http://localhost:3008/tests/gallery-inline-list.html) and confirm its existing range/product title still renders normally.

Historical changed-file scope:

- [OV25 useIframeMessaging.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/OV25-bug-41-range-message/hooks/iframe-configurator/useIframeMessaging.ts)
- [OV25 range-message.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/OV25-bug-41-range-message/hooks/iframe-configurator/range-message.ts)
- [OV25 range-message.test.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/OV25-bug-41-range-message/hooks/iframe-configurator/range-message.test.ts)
- `test/unit/name.test.tsx` (historical regression file is no longer present in main or a retained worktree)

Retained implementation diff:

- [Bug 41 OV25 canonical sender diff](../review-diffs/bug-41-ov25-range-sender.diff)

Retained diff summary:

```diff
+ OV25 createRangePostMessage() emits one canonical flat RANGE contract
+ normal and nested Snap2 range inputs produce byte-equivalent payload shapes
+ malformed/null sender inputs do not emit RANGE
+ ov25-ui keeps its existing direct RANGE receiver; no compatibility layer
+ component regressions preserve default, explicitly empty, and whitespace replacement results
```

Historical verification run:

- OV25 canonical sender tests: 10/10 passed.
- `ov25-ui` Name regressions: 4/4 passed.
- `ov25-ui` and local OV25 type-checks passed.
- OV25 sender `git diff --check` passed.
- Independent review confirmed the direct receiver and `Name.tsx` are byte-equivalent to `HEAD`, with no legacy normalizer references.
- Live browser verification on `localhost:3008` confirmed the heading changes from blank to `Otto` after the Snap2 iframe sends its range data.

Historical automated coverage:

- Flat standard and nested Snap2 sender normalization.
- Malformed/null sender input rejection.
- Name fallback with no current product.
- Existing standard range-product fallback and custom replacement edge cases.

Residual risk:

- Sender validation requires the existing OV25 range contract (`id`, `name`, and `sku`).
- Deploy/reload the OV25 sender before testing; an unmodified old sender would still send the wrong nested Snap2 shape, intentionally unsupported.

Resumption instruction:

- To resume Bug 41 after the release, move this entire packet back to [bugs-ready-for-review.md](bugs-ready-for-review.md), refresh any stale build/test evidence, and complete manual review there before requesting approval or staging. Do not mark the bug fixed while parked.

### 42. Snap2 compatible-module cards expose dimension and movable actions

- Status: **PARKED FOR POST-RELEASE**. Bug 42 code is absent from current main; the retained worktree, review artifact, and historical evidence remain. It is not fixed or approved.
- Source item: compatible modules in left/right side sheets lack the `Edit dimensions` and `Place movable object` controls available in `ModuleBottomPanel`.
- Patch owners: subagents `Ptolemy`, `Hume`, and `Nietzsche`; final independent review by `Aristotle` is clean.

Historical implementation summary:

- Eligible compatible-module cards now expose a compact top-right action rail without changing cards that have no actions.
- Both side-sheet and bottom-panel paths share eligibility and `SELECT_MODULE` dispatch logic, including the configurator `uniqueId`.
- Movable placement closes a dedicated left/right module sheet after a successful dispatch; embedded module lists stay open.
- Custom dimensions always render in a fixed anchored popover for LEFT, RIGHT, BOTTOM, embedded, desktop, and mobile layouts. The editor never expands a card or changes list/grid layout.
- Each module surface owns one active editor. Complete product/model/path/position identities prevent duplicate or refreshed rows from sharing stale open state.
- Popovers follow scroll, transformed carousels, resize, and the mobile visual viewport; offscreen anchors dismiss safely and restore focus.
- Visible tooltips use replacement-backed text, work with hover/focus/Escape, wrap within the viewport, and do not overlap the bottom-panel product-name tooltip.

Manual fixtures:

- [Left-side Snap2 module sheet](http://localhost:3008/tests/snap2-dialog.html?md=left&mm=left)
- [Right-side Snap2 module sheet](http://localhost:3008/tests/snap2-dialog.html?md=right&mm=right)
- [Bottom module panel regression](http://localhost:3008/tests/snap2-dialog.html?md=right&mm=bottom)
- [Mobile dialog/right modules](http://localhost:3008/tests/snap2-dialog.html?viewport=mobile&md=right&mm=right)
- [Clean baseline before fix](http://127.0.0.1:3009/tests/snap2-dialog.html?md=left&mm=left)

Before/after screenshots:

- No final screenshots were generated before parking. After reapplying the retained artifact on post-release resumption, capture LEFT/RIGHT/BOTTOM screenshots if the fixture exposes eligible variable-dimension or movable modules.

Manual verification on resumption:

Current-state prerequisite: use the retained worktree or reapply the retained implementation diff before running these steps; the relevant current main workspace does not contain this parked proposal.

1. On post-release resumption, rebuild `ov25-ui`, then open the left-side fixture and configure/select an initial Snap2 module.
2. Select a placed module if needed, then open the compatible Modules option/sheet.
3. Find a variable-dimension module. Expected: a ruler action appears top-right without overlapping its name, details control, or adjacent action.
4. Hover and keyboard-focus the ruler. Expected: `Edit dimensions` tooltip appears above overlays, remains while either hover or focus remains, wraps on narrow screens, and closes with Escape.
5. Open the dimensions editor. Expected on every fixture: a floating popover is anchored to the action; the card height, grid, carousel, and surrounding layout do not move. No inline form appears.
6. Change values, then cancel. Expected: no ordinary card add/details action fires, the popover closes, and focus returns to the ruler.
7. Open dimensions on one module, then on another. Expected: the first closes, leaving exactly one dimensions popover in that module surface.
8. Reopen and submit. Expected: one module-selection dispatch uses those custom dimensions; the popover closes only after an accepted dispatch.
9. Find a movable module. Expected: a move action and `Place movable object` tooltip appear. Clicking it enters movable placement once and closes a dedicated side sheet.
10. Repeat on the right-side fixture. Expected: the popover chooses the available side, remains styled, is not clipped by the sheet, and does not overlap the action rail.
11. With a side popover open, scroll the module list/carousel. Expected: it follows its trigger. Scroll the trigger fully out of view. Expected: the popover closes and focus returns to a valid module control.
12. Open the bottom-panel fixture. Expected: dimensions use the same floating adaptive popover, only one can open, and the existing product-name tooltip is suppressed while an action tooltip is active. Press Enter/Space on a bottom card's image button and confirm normal selection still works once.
13. Repeat in the mobile fixture. Expected: both actions plus details fit, dimensions remain a popover, and opening it disables ordinary card/details activation while form controls remain usable.
14. Check a module with neither capability. Expected: no empty action rail and no header/card spacing regression.

Historical changed-file scope:

- [CompatibleModuleActions.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-bug-42-module-actions/src/components/VariantSelectMenu/CompatibleModuleActions.tsx)
- [ModuleBottomPanel.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-bug-42-module-actions/src/components/VariantSelectMenu/ModuleBottomPanel.tsx)
- [Snap2ModulesOptionBody.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-bug-42-module-actions/src/components/VariantSelectMenu/Snap2ModulesOptionBody.tsx)
- [ModuleVariantCard.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-bug-42-module-actions/src/components/VariantSelectMenu/variant-cards/ModuleVariantCard.tsx)
- [string-keys.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-bug-42-module-actions/src/lib/strings/string-keys.ts)
- [configurator-utils.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-bug-42-module-actions/src/utils/configurator-utils.ts)
- [compatible-modules-provider-refresh.test.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-bug-42-module-actions/test/unit/compatible-modules-provider-refresh.test.tsx)
- [snap2-compatible-module-actions.test.tsx](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-bug-42-module-actions/test/unit/snap2-compatible-module-actions.test.tsx)

Retained implementation diff:

- [Bug 42 isolated diff](../review-diffs/bug-42-snap2-compatible-module-actions.diff) - 4,398 lines across eight Bug 42 files; Bug 43 pricing/name changes are excluded.

Retained diff summary:

```diff
+ shared CompatibleModuleActionControls and validated selectCompatibleModule dispatch
+ eligible side-sheet cards render movable/dimensions actions in a reserved rail
+ all custom-dimension editors portal as anchored, non-layout-affecting popovers
+ one active editor per LEFT/RIGHT/BOTTOM/embedded module surface
+ dedicated side sheets close only after accepted movable placement
+ bottom panel reuses the same action behavior
+ owner-document-aware visual viewport, transform, scroll, resize, and offscreen tracking
+ collision-safe module row identities and capability/dimension refresh comparison
+ native keyboard-valid bottom-card selection controls and reliable focus restoration
+ 39 focused unit tests covering layout, events, payloads, refreshes, portals, rejection, focus, and accessibility
```

Historical verification run:

- Bug 42 focused suite: 39/39 tests passed.
- Combined Bug 42/Bug 43 overlap suite: 58/58 tests passed.
- `bun run type-check` passed in the historical integrated review workspace.
- String-replacement audit confirms every `getString` key has a catalog definition.
- Scoped `git diff --check` passed.
- `git apply --check --cached review-diffs/bug-42-snap2-compatible-module-actions.diff` passed against the clean index.
- Final independent review found no P0-P3 findings and confirmed that the isolated artifact excluded Bug 43 while the historical overlap workspace preserved `ModuleNamePrice` and every `unitPrice` comparison.
- No `ov25-ui` build was run, per workflow.

Historical automated coverage:

- Action eligibility and action-free layout preservation.
- Exact movable/custom-dimension payloads and `uniqueId` propagation.
- Dedicated versus embedded sheet dismissal.
- Invalid dispatch/editor retention and loading-disabled behavior.
- Card/name/media/details/See more propagation guards while editing.
- Independent hover/focus tooltip state, Escape dismissal, long replacement viewport containment, and bottom-panel tooltip suppression.
- Focus restoration to the dimensions trigger after cancel and to the card after accepted submit; rejected submit retains form focus.
- LEFT/RIGHT/BOTTOM popover ShadowRoot style access, initial viewport clamping, scroll repositioning, and offscreen dismissal/focus restoration.
- Every layout's popover-only presentation and one-active-editor behavior.
- Visual-viewport and transformed-carousel tracking, cleanup, and foreign-document ownership.
- Ready/loading/ready, filtering, identity, capability, base-dimension, and variable-dimension refreshes.
- Duplicate module-row identity and keyboard activation without double dispatch.

Residual risk:

- Real module capabilities and resulting 3D placement depend on fixture product data, so final scene behavior still needs manual testing after rebuild.
- Historical overlap note: dirty main also contained Bug 43 name/discounted-price work during review, and focused overlap tests passed. Both parked implementations are now absent from current main, so the combined narrow-width layout must be retested after both artifacts are reapplied.
- This patch intentionally does not close embedded module lists after movable dispatch.

Resumption instruction:

- To resume Bug 42 after the release, move this entire packet back to [bugs-ready-for-review.md](bugs-ready-for-review.md), refresh any stale build/test evidence, and complete manual review there before requesting approval or staging. Do not mark the bug fixed while parked.

### 43. Show Snap2 module name and configured price

- Status: **PARKED FOR POST-RELEASE**. Bug 43 `ov25-ui` code is absent from current main, and the OV25 side was never applied to current OV25 main. Both sides remain only in retained artifacts/worktrees; the bug is not fixed or approved.
- Source item: Snap2 module cards and detail titles omit configured module pricing, while bottom-panel cards omit both name and price.
- Patch owners: cross-repo implementation by subagents; final independent review by `Hilbert` found no P0-P3 issues.

Historical implementation summary:

- OV25 now calculates each compatible module's configured unit price using the same option-aware resolver as Snap2 totals, then sends additive `unitPrice` data in `COMPATIBLE_MODULES`.
- `ov25-ui` shows `Module name - Price` on compatible-module cards and detail titles. Discounted modules show original and current prices with the same presentation rules as the main product price.
- Bottom-panel cards keep the same name/price DOM mounted below the image but hide it by default, allowing client CSS to reveal it safely.
- Initialise-menu behavior from Bug 11 remains: desktop shows the tooltip and hides the line; mobile shows the line and hides the tooltip.
- Stable classes/data attributes and module-specific string-replacement keys cover names, separator, current price, subtotal, and savings.

Manual fixtures:

- [Left-side Snap2 modules](http://localhost:3008/tests/snap2-dialog.html?md=left&mm=left)
- [Right-side Snap2 modules](http://localhost:3008/tests/snap2-dialog.html?md=right&mm=right)
- [Bottom module panel](http://localhost:3008/tests/snap2-dialog.html?md=right&mm=bottom)
- [Mobile Snap2 dialog](http://localhost:3008/tests/snap2-dialog.html?viewport=mobile&md=right&mm=right)

Before/after screenshots:

- Deferred until post-release resumption. Current main no longer contains the Bug 43 implementation; capture module-card and bottom-panel images only after both retained artifacts are reapplied and rebuilt.
- Historical caveat: during review, both ports could share local OV25 pricing payload changes. The OV25 sender was never applied to current OV25 main and must be supplied from the retained artifact/worktree when review resumes.

Manual verification on resumption:

Current-state prerequisite: use the retained worktree or reapply the retained implementation diff before running these steps; the relevant current main workspace does not contain this parked proposal.

1. On post-release resumption, rebuild `ov25-ui` and ensure local OV25 on port 3000 has reloaded its Bug 43 sender/pricing changes.
2. Open left and right module fixtures, configure a scene, then inspect compatible-module cards.
3. Expected: each priced module shows `Name - Price`; no dangling dash appears when price is missing or pricing is hidden.
4. Find a discounted module. Expected: struck-through configured subtotal and discounted current price match main-price semantics.
5. Open `See more`. Expected: detail title contains the same name and configured price presentation.
6. Open the bottom-panel fixture. Expected: default layout remains unchanged, but `.ov25-module-name-price` exists below each image in the DOM with a hidden state.
7. Temporarily reveal that row in DevTools. Expected: it fits within the reserved card area without clipping, overlap, or carousel height changes.
8. Check desktop initialise cards. Expected: tooltip includes name/price while visible line stays hidden. At mobile width, expected behavior is reversed.
9. Check Bug 42 actions on a narrow card. Expected: name/price, details, dimensions, and movable actions do not overlap.
10. If available, check zero-priced, missing-price, `hidePricing`, custom currency, and discounted products.

Historical changed-file scope:

- `ov25-ui`: shared price presentation, module name/price presentation, module cards/panels/detail title, compatible-module payload types/comparison, currency mapping, string catalog, focused unit tests, and deterministic layout e2e fixture.
- `OV25`: configured-unit price resolver, Snap2 total integration, compatible-module message enrichment, caller updates, and focused pricing/message tests.

Retained implementation diffs:

- [Bug 43 ov25-ui diff](../review-diffs/bug-43-ov25-ui-module-prices.diff) - 20 files.
- [Bug 43 OV25 diff](../review-diffs/bug-43-ov25-module-prices.diff) - 11 files.

Retained diff summary:

```diff
+ shared configured-unit resolver keeps compatible-module and checkout pricing aligned
+ additive COMPATIBLE_MODULES unitPrice contract with discount/subtotal/current values
+ reusable PricePresentation extracted from main Price component
+ targetable, replacement-backed module name/price rows and detail titles
+ bottom-panel row remains mounted, default-hidden, and geometry-safe when revealed
+ deterministic geometry test covers fixed card/image/text bounds
```

Historical verification run:

- Combined Bug 42/Bug 43 `ov25-ui` suite: 63/63 tests passed across six files.
- `ov25-ui` root type-check passed.
- Bug 43 module-card geometry Playwright test passed 1/1.
- OV25 focused Bug 43 suite: 33/33 tests passed; type-check, lint, and diff checks passed.
- Both isolated artifacts apply cleanly to their clean indexes.
- Independent review confirmed all 20 `ov25-ui` paths are integrated, shared Bug 42 files retain both features, and Bug 11 visibility behavior remains intact.
- No `ov25-ui` build was run, per workflow.

Residual risk:

- Final visual behavior depends on real iframe product pricing, client fonts, narrow card widths, and custom string replacements; manual fixture review remains required.
- `unitPrice` is additive. Missing pricing remains supported and renders the name without a separator.

Resumption instruction:

- To resume Bug 43 after the release, move this entire packet back to [bugs-ready-for-review.md](bugs-ready-for-review.md), refresh any stale build/test evidence, and complete manual review there before requesting approval or staging. Do not mark the bug fixed while parked.

### 45. Preserve product images on normalized commerce lines

- Status: **PARKED FOR POST-RELEASE**. Bug 45 code is absent from current main; the retained worktree, isolated diff, and historical evidence remain. It is not fixed or approved.
- Source item: `productBreakdowns[].image` survives in the raw Snap2 price payload but is dropped from normalized `price.lines[]`.
- Patch owner: subagent `Raman`; independent review by `Copernicus` found no P0-P2 issues, and its P3 exact-preservation test gap was fixed.

Historical implementation summary:

- `CommerceLineItemPrice` now exposes optional `image`.
- `normalizePricePayload()` copies a nonblank string image from each product breakdown exactly, without trimming, URL rewriting, or fallback lookup.
- Missing, blank, and non-string values remain omitted. Existing normalized fields and raw `productBreakdowns` passthrough are unchanged.

Manual fixture:

- [Snap2 custom CSS fixture with `onChange` logging](http://localhost:3008/tests/single-custom-css-snap2.html)
- [Clean baseline comparison](http://127.0.0.1:3009/tests/single-custom-css-snap2.html)

Before/after screenshots:

- Not applicable. This changes callback data only and has no visual UI output.

Manual verification on resumption:

Current-state prerequisite: use the retained worktree or reapply the retained implementation diff before running these steps; the relevant current main workspace does not contain this parked proposal.

1. On post-release resumption, rebuild `ov25-ui`, open the 3008 fixture, and open DevTools Console.
2. Filter for `onChange`, expand the latest payload, then inspect `price.productBreakdowns[0].image` and `price.lines[0].image`.
3. When the source breakdown contains an image, expected: normalized line contains the exact same string.
4. Compare with 3009. Expected before fix: raw breakdown image may exist while normalized line image is absent.
5. Confirm normal line fields such as id, name, quantity, prices, discount, selections, and model id are unchanged.
6. If this fixture's current product data has no breakdown image, use the automated contract test as the deterministic review and report that the live payload lacked source image data.

Historical changed-file scope:

- [normalize-iframe-commerce.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-bug-45-commerce-line-images/src/commerce/normalize-iframe-commerce.ts)
- [inject-config.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-bug-45-commerce-line-images/src/types/inject-config.ts)
- [normalize-iframe-commerce.test.ts](/Users/orbital/Documents/CODE/ORBITAL%20VISION/ov25-ui/.worktrees/ov25-ui-bug-45-commerce-line-images/test/unit/normalize-iframe-commerce.test.ts)

Retained implementation diff:

- [Bug 45 isolated diff](../review-diffs/bug-45-normalized-commerce-line-images.diff) - 137 lines across three files.

Retained diff summary:

```diff
+ CommerceLineItemPrice.image?: string
+ copy valid nonblank productBreakdown.image exactly into normalized line
+ omit absent, blank, numeric, and object image values
+ seven focused regressions preserve every existing line field
```

Historical verification run:

- Focused Vitest: 7/7 passed.
- Root TypeScript check passed in the historical integrated review workspace.
- Scoped `git diff --check` passed.
- At review time, the main normalizer/test matched the isolated worktree byte-for-byte, while shared `inject-config.ts` retained unrelated changes outside the two-line Bug 45 field.
- At review time, the isolated artifact applied cleanly to the then-current clean index; re-check against current main before resumption.
- No build was run, per workflow.

Residual risk:

- Image validation intentionally accepts any nonblank string; consumers decide whether/how to use the value as a URL.
- Live manual comparison depends on the selected Snap2 product supplying `productBreakdowns[].image`.

Resumption instruction:

- To resume Bug 45 after the release, move this entire packet back to [bugs-ready-for-review.md](bugs-ready-for-review.md), refresh any stale build/test evidence, and complete manual review there before requesting approval or staging. Do not mark the bug fixed while parked.
