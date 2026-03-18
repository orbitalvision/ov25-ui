/** How the configurator UI is presented. Desktop: inline | sheet | modal. Mobile: inline | drawer. */
export const ConfiguratorDisplayMode = {
  Inline: 'inline',
  Sheet: 'sheet',
  Drawer: 'drawer',
  Modal: 'modal',
  VariantsOnlySheet: 'variants-only-sheet',
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

/** @deprecated Use VariantDisplayMode */
export const VariantDisplayStyle = VariantDisplayMode;
/** @deprecated Use VariantDisplayMode */
export type VariantDisplayStyle = VariantDisplayMode;

/** Variant display style for inline and overlay variant selectors. */
export const VariantDisplayStyleOverlay = {
  Wizard: 'wizard',
  List: 'list',
  Tabs: 'tabs',
  Accordion: 'accordion',
  Tree: 'tree',
} as const;
export type VariantDisplayStyleOverlay = (typeof VariantDisplayStyleOverlay)[keyof typeof VariantDisplayStyleOverlay];
