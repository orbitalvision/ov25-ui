# Z-Index Layer Audit

Read-only audit captured on 2026-06-03.

## Current High-Layer Groups

| Surface | Representative files / values |
| --- | --- |
| iframe and gallery | `src/hooks/useIframePositioning.tsx` uses `2147483645` and `2147483647`; `src/components/product-gallery.tsx` uses `2147483644` and `2147483647`; `src/lib/config/iframe-transition-snapshot.ts` uses `2147483645` and `2147483647`; `src/components/IframeContainer.tsx` uses local `z-101` and `z-999`; `globals.css` uses `2147483646`. |
| variants drawer/sheet/modal | `src/utils/inject.tsx` uses drawer/modal host values around `2147483646`; `VariantContentDesktop.tsx` and `VariantsOnlySheet.tsx` use `2147483644`; `ConfiguratorModal.tsx` and `mobile-drawer.tsx` use `2147483646`. |
| swatch book | `src/utils/inject.tsx` uses `2147483647` for the swatch-book portal; `SwatchBook.tsx` uses the shared dialog layer, currently `2147483646`. |
| checkout | `src/utils/inject.tsx` uses `2147483647` for the Snap2 checkout host; checkout buttons mostly use local layers like `z-10` to `z-20`. |
| fullscreen gallery | `src/components/product-carousel.tsx` and `src/components/product-gallery.tsx` use `2147483647`. |
| AR/share dialogs | Shared dialog code uses `2147483646`, special Snap2/AR hosts use `2147483647`, AR launch overlay uses `100000` and `100001`. |
| Snap2 controls | Snap2 modal/sheet/control files use `2147483644`, `2147483645`, `2147483646`, local `101` to `104`, and one module detail layer at `2147483647`. |
| setup/admin | No very-high values found; setup uses normal layers such as `z-50`. |

Fixture-only high values also exist in `dev/react-test/templates/ViewportSwitcher.jsx`, Snap2 fixtures, and `sheet-reflow-debug.jsx`.

## Duplicate Max Owners

The most obvious races are at `2147483647`:

- Snap2 checkout host
- toaster host
- swatch-book host
- special Snap2/AR dialog hosts
- product carousel fullscreen
- gallery/deferred modal host
- modal iframe repositioning
- module detail sheet
- mobile close proxy

Because several unrelated hosts share the same max value, later DOM/shadow host order can decide which surface wins.

`2147483646` is also overloaded by mobile drawer content, popover/modal portals, Configurator/Snap2 modal shells, generic dialogs, tooltips, and drawer toggles.

`2147483644` is the lower full-page base used by variants sheets, variants-only sheet, Snap2 mobile gallery, dining full-page, and non-modal gallery/deferred hosts.

## Smallest Safe First Task

Add `src/lib/config/layers.ts` with named numeric constants, then migrate only inline numeric assignments in:

- `src/utils/inject.tsx`
- `src/lib/config/iframe-transition-snapshot.ts`

Keep every numeric value and append order unchanged. Leave Tailwind class strings for a later pass.

## Regression Scenarios

- `gallery-sheet-list.html`: open/close desktop sheet; iframe/proxy stays above variants shell during transition.
- `snap2-dialog.html`: open Snap2 modal, then save/share or screenshot dialog; dialog stays above modal shell.
- `product-with-swatches.html`: open variants, then swatch book; swatch book content/close button receives clicks above variants.
- `gallery-carousel-stacked.html`: open carousel fullscreen while configurator UI is active; fullscreen overlay is topmost and closable.
- `single-custom-css-snap2.html` mobile viewport: open Snap2 drawer, module detail, checkout sheet/toast; the intended top surface wins at key points.
