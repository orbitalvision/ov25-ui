/** How the configurator UI is presented. `inline-sticky` is available for standard products only. */
export const ConfiguratorDisplayMode = {
  Inline: 'inline',
  InlineSticky: 'inline-sticky',
  Sheet: 'sheet',
  Drawer: 'drawer',
  Modal: 'modal',
  VariantsOnlySheet: 'variants-only-sheet',
  InlineSheet: 'inline-sheet',
} as const;
export type ConfiguratorDisplayMode = (typeof ConfiguratorDisplayMode)[keyof typeof ConfiguratorDisplayMode];

/** Carousel display mode: 'none' hides carousel, 'stacked'/'carousel' show it. */
export const CarouselDisplayMode = {
  None: 'none',
  Carousel: 'carousel',
  Stacked: 'stacked',
} as const;
export type CarouselDisplayMode = (typeof CarouselDisplayMode)[keyof typeof CarouselDisplayMode];

/** @deprecated Use CarouselDisplayMode */
export const CarouselLayout = CarouselDisplayMode;
/** @deprecated Use CarouselDisplayMode */
export type CarouselLayout = CarouselDisplayMode;

/** Variant display style for mobile and main variant selector. */
export const VariantDisplayMode = {
  Wizard: 'wizard',
  List: 'list',
  Tabs: 'tabs',
  Accordion: 'accordion',
  Tree: 'tree',
} as const;
export type VariantDisplayMode = (typeof VariantDisplayMode)[keyof typeof VariantDisplayMode];

/** Variant display style for inline and overlay variant selectors. */
export const VariantDisplayStyleOverlay = {
  Wizard: 'wizard',
  List: 'list',
  Tabs: 'tabs',
  Accordion: 'accordion',
  Tree: 'tree',
} as const;
export type VariantDisplayStyleOverlay = (typeof VariantDisplayStyleOverlay)[keyof typeof VariantDisplayStyleOverlay];

/** How extra information for an ordinary variant selection is presented. */
export const SelectionDetailsDisplayMode = {
  None: 'none',
  Sheet: 'sheet',
  Fullscreen: 'fullscreen',
  Modal: 'modal',
  Tooltip: 'tooltip',
} as const;
export type SelectionDetailsDisplayMode =
  (typeof SelectionDetailsDisplayMode)[keyof typeof SelectionDetailsDisplayMode];
