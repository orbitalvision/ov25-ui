/**
 * Style variable definitions, element selectors, and CSS generation utilities
 * for the configurator setup visual style editor.
 */

export type StyleControlType = 'color' | 'corner' | 'slider' | 'font';

export interface StyleVariable {
  variable: string;
  label: string;
  defaultValue: string;
  control: StyleControlType;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  sliderUnit?: string;
  sliderLabels?: [string, string];
}

export interface StyleGroup {
  id: string;
  label: string;
  description: string;
  variables: StyleVariable[];
}

export interface ElementSelector {
  selector: string;
  label: string;
  element: string;
}

export const CORNER_PRESETS = [
  { value: '0px', label: 'Sharp' },
  { value: '4px', label: 'Slight' },
  { value: '8px', label: 'Rounded' },
  { value: '16px', label: 'More' },
  { value: '9999px', label: 'Pill' },
] as const;

export const FONT_OPTIONS = [
  { value: "'Lato', sans-serif", label: 'Lato' },
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Arial', sans-serif", label: 'Arial' },
  { value: "'Helvetica', sans-serif", label: 'Helvetica' },
  { value: "'system-ui', sans-serif", label: 'System UI' },
] as const;

export const STYLE_GROUPS: StyleGroup[] = [
  {
    id: 'gallery',
    label: 'Gallery & Viewer',
    description: '3D viewer, carousel images, spacing, and overlay controls',
    variables: [
      { variable: '--ov25-configurator-iframe-background-color', label: 'Viewer background', defaultValue: '#f6f6f6', control: 'color' },
      { variable: '--ov25-configurator-iframe-border-radius', label: 'Gallery corners', defaultValue: '1rem', control: 'corner' },
      { variable: '--ov25-gallery-gap', label: 'Carousel spacing', defaultValue: '0.5rem', control: 'slider', sliderMin: 0, sliderMax: 2, sliderStep: 0.125, sliderUnit: 'rem', sliderLabels: ['None', 'Wide'] },
      { variable: '--ov25-overlay-button-color', label: 'Overlay button fill', defaultValue: '#ffffff', control: 'color' },
      { variable: '--ov25-configurator-view-controls-text-color', label: 'Overlay icon color', defaultValue: '#000000', control: 'color' },
      { variable: '--ov25-configurator-view-controls-border-color', label: 'Overlay border', defaultValue: '#E5E5E5', control: 'color' },
      { variable: '--ov25-configurator-view-controls-border-radius', label: 'Overlay button shape', defaultValue: '9999px', control: 'corner' },
    ],
  },
  {
    id: 'variants',
    label: 'Product Variants & Collections',
    description: 'Variant thumbnails, collection buttons, highlight styles, and panel sizing',
    variables: [
      { variable: '--ov25-variant-thumb-border-radius', label: 'Variant shape', defaultValue: '9999px', control: 'corner' },
      { variable: '--ov25-primary-color', label: 'Collection button color', defaultValue: '#414141', control: 'color' },
      { variable: '--ov25-button-border-radius', label: 'Collection button corners', defaultValue: '0px', control: 'corner' },
      { variable: '--ov25-button-border-width', label: 'Collection button border', defaultValue: '1px', control: 'slider', sliderMin: 0, sliderMax: 4, sliderStep: 0.5, sliderUnit: 'px', sliderLabels: ['None', 'Thick'] },
      { variable: '--ov25-button-border-color', label: 'Collection border color', defaultValue: '#E5E5E5', control: 'color' },
      { variable: '--ov25-button-text-color', label: 'Collection text color', defaultValue: '#ffffff', control: 'color' },
      { variable: '--ov25-button-hover-background-color', label: 'Collection hover fill', defaultValue: '#fafafa', control: 'color' },
      { variable: '--ov25-button-hover-text-color', label: 'Collection hover text', defaultValue: '#000000', control: 'color' },
      { variable: '--ov25-highlight-color', label: 'Variant highlight', defaultValue: '', control: 'color' },
      { variable: '--ov25-wizard-variants-content-height', label: 'Variant panel height', defaultValue: '600px', control: 'slider', sliderMin: 200, sliderMax: 1200, sliderStep: 50, sliderUnit: 'px', sliderLabels: ['Short', 'Tall'] },
      { variable: '--ov25-configurator-variant-drawer-handle-color', label: 'Drawer handle color', defaultValue: '#000000', control: 'color' },
    ],
  },
  {
    id: 'buttons',
    label: 'Action Button',
    description: 'Add to basket, checkout, and configure buttons',
    variables: [
      { variable: '--ov25-cta-color', label: 'Action button color', defaultValue: '#22c55e', control: 'color' },
      { variable: '--ov25-cta-color-hover', label: 'Action hover color', defaultValue: '#16a34a', control: 'color' },
      { variable: '--ov25-cta-color-light', label: 'Action disabled tint', defaultValue: '#4ade80', control: 'color' },
      { variable: '--ov25-cta-border-radius', label: 'Action button corners', defaultValue: '9999px', control: 'corner' },
      { variable: '--ov25-cta-text-color', label: 'Action text color', defaultValue: '#ffffff', control: 'color' },
    ],
  },
  {
    id: 'colors',
    label: 'Colors & Theme',
    description: 'Background, text, border, and accent colors',
    variables: [
      { variable: '--ov25-background-color', label: 'Background', defaultValue: '#ffffff', control: 'color' },
      { variable: '--ov25-secondary-background-color', label: 'Secondary background', defaultValue: '#f6f6f6', control: 'color' },
      { variable: '--ov25-text-color', label: 'Text color', defaultValue: '#000000', control: 'color' },
      { variable: '--ov25-secondary-text-color', label: 'Secondary text', defaultValue: '#000000', control: 'color' },
      { variable: '--ov25-border-color', label: 'Light border', defaultValue: '#E5E5E5', control: 'color' },
      { variable: '--ov25-border-color-secondary', label: 'Dark border', defaultValue: '#282828', control: 'color' },
      { variable: '--ov25-hover-color', label: 'Hover tint', defaultValue: '#fafafa', control: 'color' },
      { variable: '--ov25-destructive', label: 'Error / delete', defaultValue: '#ef4444', control: 'color' },
      { variable: '--ov25-color-handle', label: 'Drawer handle', defaultValue: '#000000', control: 'color' },
    ],
  },
  {
    id: 'typography',
    label: 'Typography',
    description: 'Font family, sizes, and product title/price colors',
    variables: [
      { variable: '--ov25-360-font-family', label: 'Font', defaultValue: "'Lato', sans-serif", control: 'font' },
      { variable: '--ov25-text-xs-size', label: 'Text XS', defaultValue: '0.75em', control: 'slider', sliderMin: 0.5, sliderMax: 1.5, sliderStep: 0.05, sliderUnit: 'em', sliderLabels: ['Smaller', 'Larger'] },
      { variable: '--ov25-text-sm-size', label: 'Text SM', defaultValue: '0.875em', control: 'slider', sliderMin: 0.5, sliderMax: 1.5, sliderStep: 0.05, sliderUnit: 'em', sliderLabels: ['Smaller', 'Larger'] },
      { variable: '--ov25-text-base-size', label: 'Text base', defaultValue: '1em', control: 'slider', sliderMin: 0.5, sliderMax: 2, sliderStep: 0.05, sliderUnit: 'em', sliderLabels: ['Smaller', 'Larger'] },
      { variable: '--ov25-text-lg-size', label: 'Text LG', defaultValue: '1.125em', control: 'slider', sliderMin: 0.5, sliderMax: 2, sliderStep: 0.05, sliderUnit: 'em', sliderLabels: ['Smaller', 'Larger'] },
      { variable: '--ov25-text-xl-size', label: 'Text XL', defaultValue: '1.25em', control: 'slider', sliderMin: 0.5, sliderMax: 2.5, sliderStep: 0.05, sliderUnit: 'em', sliderLabels: ['Smaller', 'Larger'] },
      { variable: '--ov25-configurator-title-text-color', label: 'Product name color', defaultValue: '#000000', control: 'color' },
      { variable: '--ov25-configurator-price-text-color', label: 'Price color', defaultValue: '#000000', control: 'color' },
    ],
  },
  {
    id: 'layout',
    label: 'Rounding & Layout',
    description: 'Global corner radius scale, panel sizing, and popup styles',
    variables: [
      { variable: '--ov25-rounded', label: 'Base rounding', defaultValue: '0.25rem', control: 'slider', sliderMin: 0, sliderMax: 2, sliderStep: 0.125, sliderUnit: 'rem', sliderLabels: ['Sharp', 'Rounded'] },
      { variable: '--ov25-rounded-xs', label: 'Extra small rounding', defaultValue: '0.125rem', control: 'slider', sliderMin: 0, sliderMax: 1, sliderStep: 0.0625, sliderUnit: 'rem', sliderLabels: ['Sharp', 'Rounded'] },
      { variable: '--ov25-rounded-sm', label: 'Small rounding', defaultValue: '0.25rem', control: 'slider', sliderMin: 0, sliderMax: 1, sliderStep: 0.0625, sliderUnit: 'rem', sliderLabels: ['Sharp', 'Rounded'] },
      { variable: '--ov25-rounded-md', label: 'Medium rounding', defaultValue: '0.375rem', control: 'slider', sliderMin: 0, sliderMax: 1.5, sliderStep: 0.125, sliderUnit: 'rem', sliderLabels: ['Sharp', 'Rounded'] },
      { variable: '--ov25-rounded-lg', label: 'Large rounding', defaultValue: '0.5rem', control: 'slider', sliderMin: 0, sliderMax: 2, sliderStep: 0.125, sliderUnit: 'rem', sliderLabels: ['Sharp', 'Rounded'] },
      { variable: '--ov25-rounded-xl', label: 'Extra large rounding', defaultValue: '0.75rem', control: 'slider', sliderMin: 0, sliderMax: 3, sliderStep: 0.25, sliderUnit: 'rem', sliderLabels: ['Sharp', 'Rounded'] },
      { variable: '--ov25-rounded-2xl', label: '2XL rounding', defaultValue: '1rem', control: 'slider', sliderMin: 0, sliderMax: 4, sliderStep: 0.25, sliderUnit: 'rem', sliderLabels: ['Sharp', 'Rounded'] },
      { variable: '--ov25-rounded-3xl', label: '3XL rounding', defaultValue: '1.5rem', control: 'slider', sliderMin: 0, sliderMax: 4, sliderStep: 0.25, sliderUnit: 'rem', sliderLabels: ['Sharp', 'Rounded'] },
      { variable: '--ov25-rounded-4xl', label: '4XL rounding', defaultValue: '2rem', control: 'slider', sliderMin: 0, sliderMax: 6, sliderStep: 0.5, sliderUnit: 'rem', sliderLabels: ['Sharp', 'Rounded'] },
      { variable: '--ov25-rounded-full', label: 'Full rounding', defaultValue: '9999px', control: 'slider', sliderMin: 0, sliderMax: 9999, sliderStep: 1, sliderUnit: 'px', sliderLabels: ['Sharp', 'Circle'] },
      { variable: '--ov25-inline-list-aside-min-height', label: 'Aside min height', defaultValue: '1000px', control: 'slider', sliderMin: 200, sliderMax: 1500, sliderStep: 50, sliderUnit: 'px', sliderLabels: ['Short', 'Tall'] },
      { variable: '--ov25-inline-list-aside-min-height-mobile', label: 'Aside min height (mobile)', defaultValue: '100px', control: 'slider', sliderMin: 50, sliderMax: 500, sliderStep: 25, sliderUnit: 'px', sliderLabels: ['Short', 'Tall'] },
      { variable: '--ov25-inline-list-aside-max-height-mobile', label: 'Aside max height (mobile)', defaultValue: '600px', control: 'slider', sliderMin: 200, sliderMax: 1000, sliderStep: 50, sliderUnit: 'px', sliderLabels: ['Short', 'Tall'] },
      { variable: '--ov25-configurator-qr-code-popup-background-color', label: 'QR popup background', defaultValue: '#f6f6f6', control: 'color' },
      { variable: '--ov25-configurator-qr-code-popup-border-color', label: 'QR popup border', defaultValue: '#282828', control: 'color' },
      { variable: '--ov25-configurator-qr-code-popup-title-text-color', label: 'QR popup title color', defaultValue: '#000000', control: 'color' },
      { variable: '--ov25-configurator-qr-code-popup-description-text-color', label: 'QR popup text color', defaultValue: '#000000', control: 'color' },
    ],
  },
];

export const ELEMENT_SELECTORS: ElementSelector[] = [
  { selector: '#ov25-configurator-iframe-container', label: 'Gallery container', element: 'div' },
  { selector: '#ov25-configurator-iframe', label: '3D viewer iframe', element: 'iframe' },
  { selector: '#ov25-configurator-background-color', label: 'Viewer background layer', element: 'div' },
  { selector: '#ov25-product-carousel', label: 'Product carousel', element: 'div' },
  { selector: '#ov25-product-carousel-controls', label: 'Carousel controls', element: 'div' },
  { selector: '#true-ov25-configurator-iframe-container', label: 'Gallery container (stacked)', element: 'div' },
  { selector: '#true-carousel', label: 'Carousel (stacked)', element: 'div' },
  { selector: '#ov25-dummy-iframe', label: 'Dummy iframe', element: 'iframe' },
  { selector: '#ov25-share-button', label: 'Share button', element: 'button' },
  { selector: '#ov25-animation-toggle-button', label: 'Animation toggle', element: 'button' },
  { selector: '#ov25-desktop-dimensions-toggle-button', label: 'Dimensions toggle', element: 'button' },
  { selector: '#ov25-camera-toggle-button', label: 'Camera toggle', element: 'button' },
  { selector: '#ov25-light-toggle-button', label: 'Light toggle', element: 'button' },
  { selector: '#ov25-ar-toggle-button', label: 'AR toggle', element: 'button' },
  { selector: '#ov25-desktop-fullscreen-button', label: 'Fullscreen button', element: 'button' },
  { selector: '#ov25-configurator-variant-menu-container', label: 'Variant menu container', element: 'div' },
  { selector: '#ov25-variants-header', label: 'Variants header', element: 'div' },
  { selector: '#ov25-variants-header-mobile', label: 'Variants header (mobile)', element: 'div' },
  { selector: '#ov25-variants-header-wrapper', label: 'Variants header wrapper', element: 'div' },
  { selector: '#ov25-variants-content-wrapper', label: 'Variants content wrapper', element: 'div' },
  { selector: '#ov25-carousel-controls', label: 'Carousel controls', element: 'div' },
  { selector: '#ov25-option-selector-tabs', label: 'Option selector tabs', element: 'div' },
  { selector: '#ov25-variant-group-content', label: 'Variant group content', element: 'div' },
  { selector: '#ov25-tabs-dropdown-select', label: 'Tabs dropdown select', element: 'select' },
  { selector: '#ov25-filter-container', label: 'Filter container', element: 'div' },
  { selector: '#ov25-content-area', label: 'Content area', element: 'div' },
  { selector: '#ov25-desktop-variants-content-ungrouped', label: 'Ungrouped variants', element: 'div' },
  { selector: '#ov25-desktop-variants-content-grouped', label: 'Grouped variants', element: 'div' },
  { selector: '#ov25-mobile-filter-container', label: 'Mobile filter container', element: 'div' },
  { selector: '#ov25-mobile-content-area', label: 'Mobile content area', element: 'div' },
  { selector: '#ov25-mobile-variants-content', label: 'Mobile variants content', element: 'div' },
  { selector: '#ov25-filter-controls-wrapper', label: 'Filter controls wrapper', element: 'div' },
  { selector: '#ov25-filter-controls', label: 'Filter controls', element: 'div' },
  { selector: '#ov25-filter-controls-button', label: 'Filter button', element: 'button' },
  { selector: '#ov25-filter-controls-search', label: 'Filter search', element: 'div' },
  { selector: '#ov25-filter-controls-swatches', label: 'Filter swatches button', element: 'button' },
  { selector: '#ov25-filter-controls-pills', label: 'Filter pills', element: 'div' },
  { selector: '#ov25-filter-pill-all', label: 'Filter pill "All"', element: 'div' },
  { selector: '#ov25-filter-content', label: 'Filter content', element: 'div' },
  { selector: '#ov25-filter-empty', label: 'Filter empty state', element: 'div' },
  { selector: '#ov25-filter-content-wrapper-desktop', label: 'Filter wrapper (desktop)', element: 'div' },
  { selector: '#ov25-filter-content-wrapper-mobile', label: 'Filter wrapper (mobile)', element: 'div' },
  { selector: '#ov25-add-to-basket-button', label: 'Add to basket button', element: 'button' },
  { selector: '#ov25-checkout-button', label: 'Checkout button', element: 'button' },
  { selector: '#ov25-selected-swatches-container', label: 'Selected swatches container', element: 'div' },
  { selector: '#ov25-swatchbook', label: 'Swatchbook dialog', element: 'div' },
  { selector: '#ov25-swatchbook-title', label: 'Swatchbook title', element: 'div' },
  { selector: '#ov25-swatchbook-featured', label: 'Swatchbook featured', element: 'div' },
  { selector: '#ov25-swatchbook-content', label: 'Swatchbook content', element: 'div' },
  { selector: '#ov25-swatchbook-empty', label: 'Swatchbook empty state', element: 'div' },
  { selector: '#ov25-swatchbook-swatches-list', label: 'Swatchbook swatches list', element: 'div' },
  { selector: '#ov25-swatchbook-controls', label: 'Swatchbook controls', element: 'div' },
  { selector: '#ov25-swatchbook-add-to-cart-button', label: 'Swatchbook add to cart', element: 'div' },
  { selector: '#ov25-swatchbook-add-button', label: 'Swatchbook add button', element: 'button' },
  { selector: '#ov25-drawer-content', label: 'Drawer content', element: 'div' },
  { selector: '#ov25-drawer-toggle-button', label: 'Drawer toggle button', element: 'div' },
  { selector: '#ov25-mobile-price-overlay', label: 'Mobile price overlay', element: 'div' },
  { selector: '#ov25-mobile-price-container', label: 'Mobile price container', element: 'div' },
  { selector: '#ov25-mobile-price', label: 'Mobile price', element: 'span' },
  { selector: '#ov25-mobile-subtotal', label: 'Mobile subtotal', element: 'span' },
  { selector: '#ov25-mobile-savings-amount', label: 'Mobile savings', element: 'span' },
  { selector: '#ov25-price-container', label: 'Price container', element: 'div' },
  { selector: '#ov25-subtotal-product-page', label: 'Subtotal', element: 'h3' },
  { selector: '#ov25-savings-amount-product-page', label: 'Savings amount', element: 'h3' },
  { selector: '#ov25-savings-percentage-product-page', label: 'Savings percentage', element: 'h3' },
  { selector: '#ov25-price-product-page', label: 'Price', element: 'p' },
  { selector: '#ov25-variant-swatch-icon-container', label: 'Swatch icon container', element: 'div' },
  { selector: '#ov25-no-results', label: 'No results', element: 'div' },
  { selector: '#ov25-module-type-tabs', label: 'Module type tabs', element: 'div' },
  { selector: '#ov25-provider-root', label: 'Provider root', element: 'div' },
  { selector: '#ov25-mobile-drawer-container', label: 'Mobile drawer shadow host', element: 'div' },
  { selector: '#ov25-variants-shadow-container', label: 'Variants shadow host', element: 'div' },
  { selector: '#ov25-swatchbook-portal-container', label: 'Swatchbook portal host', element: 'div' },
  { selector: '#ov25-configurator-view-controls-container', label: 'View controls shadow host', element: 'div' },
  { selector: '#ov25-popover-portal-container', label: 'Popover portal host', element: 'div' },
  { selector: '#ov25-toaster-container', label: 'Toaster portal host', element: 'div' },
  { selector: '#ov25-aside-menu', label: 'Aside menu', element: 'div' },
  { selector: '#ov25-controls', label: 'Variants mount point', element: 'div' },
  { selector: '[data-ov25-wizard-variants-mode="inline"]', label: 'Wizard (inline mode)', element: 'div' },
  { selector: '[data-ov25-wizard-variants-mode="drawer"]', label: 'Wizard (drawer mode)', element: 'div' },
  { selector: '[data-ov25-list-variants-mode="inline"]', label: 'List (inline mode)', element: 'div' },
  { selector: '[data-ov25-tree-variants-mode="inline"]', label: 'Tree (inline mode)', element: 'div' },
  { selector: '[data-ov25-tree-variants-mode="drawer"]', label: 'Tree (drawer mode)', element: 'div' },
  { selector: '[data-ov25-accordion-variants-mode="inline"]', label: 'Accordion (inline mode)', element: 'div' },
  { selector: '[data-ov25-accordion-variants-mode="drawer"]', label: 'Accordion (drawer mode)', element: 'div' },
  { selector: '[data-ov25-inline-list]', label: 'Inline list marker', element: 'div' },
  { selector: '[data-ov25-variants-panel]', label: 'Variants panel', element: 'div' },
  { selector: '[data-ov25-wizard-variants-content]', label: 'Wizard content', element: 'div' },
  { selector: '[data-ov25-wizard-variants-step-content]', label: 'Wizard step content', element: 'div' },
  { selector: '[data-ov25-list-variants-content]', label: 'List content', element: 'div' },
  { selector: '[data-ov25-tabs]', label: 'Tabs container', element: 'div' },
  { selector: '[data-ov25-tab]', label: 'Individual tab', element: 'div' },
  { selector: '[data-ov25-tab-active="true"]', label: 'Active tab', element: 'div' },
  { selector: '[data-ov25-tabs-container]', label: 'Tab content wrapper', element: 'div' },
  { selector: '[data-ov25-tabs-dropdown]', label: 'Tab dropdown mode', element: 'div' },
  { selector: '[data-ov25-tab-select]', label: 'Tab dropdown select', element: 'select' },
  { selector: '[data-ov25-variant-option]', label: 'Variant option button', element: 'button' },
  { selector: '[data-ov25-swatch-book-button]', label: 'Swatch book trigger', element: 'button' },
  { selector: '[data-ov25-swatch-book-count]', label: 'Swatch count badge', element: 'span' },
  { selector: '[data-ov25-configure-button]', label: 'Configure button', element: 'button' },
  { selector: '[data-open="true"]', label: 'Open state', element: 'div' },
  { selector: '[data-open="false"]', label: 'Closed state', element: 'div' },
  { selector: '[data-stacked="true"]', label: 'Stacked layout', element: 'div' },
  { selector: '[data-selected="true"]', label: 'Selected state', element: 'div' },
  { selector: '[data-selected="false"]', label: 'Unselected state', element: 'div' },
  { selector: '[data-swatch-selected="true"]', label: 'Swatch selected', element: 'div' },
  { selector: '[data-checked="true"]', label: 'Checked state', element: 'div' },
  { selector: '[data-checked="false"]', label: 'Unchecked state', element: 'div' },
  { selector: '[data-optional="true"]', label: 'Optional option', element: 'div' },
  { selector: '[data-optional="false"]', label: 'Required option', element: 'div' },
  { selector: '[data-sale="true"]', label: 'Sale price', element: 'div' },
  { selector: '[data-none="true"]', label: 'No-image placeholder', element: 'div' },
  { selector: '[data-fullscreen="true"]', label: 'Fullscreen mode', element: 'div' },
  { selector: '[data-ov25-swatch-flash="destructive"]', label: 'Swatch flash (destructive)', element: 'div' },
  { selector: '[data-ov25-swatch-flash="cta"]', label: 'Swatch flash (CTA)', element: 'div' },
  { selector: '#ov25-aside-menu[data-ov25-inline-list]', label: 'Aside (inline list)', element: 'div' },
  { selector: '#ov25-aside-menu:not([data-ov25-inline-list])', label: 'Aside (not inline)', element: 'div' },
  { selector: '[data-ov25-wizard-variants-mode="inline"] [data-ov25-wizard-variants-content]', label: 'Wizard inline content', element: 'div' },
  { selector: '[data-ov25-wizard-variants-mode="inline"] [data-ov25-wizard-variants-step-content]', label: 'Wizard inline step', element: 'div' },
  { selector: '[data-ov25-wizard-variants-mode="drawer"] [data-ov25-wizard-variants-content]', label: 'Wizard drawer content', element: 'div' },
  { selector: '[data-ov25-wizard-variants-mode="drawer"] [data-ov25-wizard-variants-step-content]', label: 'Wizard drawer step', element: 'div' },
  { selector: '[data-ov25-list-variants-mode="inline"] [data-ov25-list-variants-content]', label: 'List inline content', element: 'div' },
  { selector: '#ov25-configurator-iframe-container[data-stacked="true"]', label: 'Gallery (stacked)', element: 'div' },
  { selector: '[data-ov25-variants-panel][data-open="true"]', label: 'Variants panel (open)', element: 'div' },
  { selector: '.filter-option[data-checked="true"]', label: 'Checked filter option', element: 'div' },
  { selector: '#ov25-filter-content-wrapper-desktop[data-open="true"]', label: 'Desktop filter (open)', element: 'div' },
  { selector: '#ov25-filter-content-wrapper-mobile[data-open="true"]', label: 'Mobile filter (open)', element: 'div' },
];

export const ELEMENT_CSS_PROPERTIES = [
  'background', 'background-color', 'color', 'border', 'border-color',
  'border-width', 'border-radius', 'padding', 'margin', 'gap',
  'font-size', 'font-family', 'font-weight', 'opacity', 'display',
  'max-height', 'min-height',
] as const;

export type PropertyInputType = 'color' | 'spacing' | 'size-px' | 'font-select' | 'weight-select' | 'display-select' | 'opacity' | 'text';

export const PROPERTY_INPUT_MAP: Record<string, PropertyInputType> = {
  'background-color': 'color',
  'color': 'color',
  'border-color': 'color',
  'padding': 'spacing',
  'margin': 'spacing',
  'gap': 'spacing',
  'border-radius': 'spacing',
  'border-width': 'size-px',
  'max-height': 'size-px',
  'min-height': 'size-px',
  'font-size': 'spacing',
  'font-family': 'font-select',
  'font-weight': 'weight-select',
  'display': 'display-select',
  'opacity': 'opacity',
};

export const FONT_WEIGHT_OPTIONS = [
  { value: '100', label: 'Thin' },
  { value: '200', label: 'Extra Light' },
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' },
] as const;

export const DISPLAY_OPTIONS = [
  { value: 'block', label: 'Block' },
  { value: 'flex', label: 'Flex' },
  { value: 'grid', label: 'Grid' },
  { value: 'inline', label: 'Inline' },
  { value: 'inline-flex', label: 'Inline Flex' },
  { value: 'inline-block', label: 'Inline Block' },
  { value: 'none', label: 'Hidden' },
] as const;

export function generateVariableCSS(styleValues: Record<string, string>): string {
  const entries = Object.entries(styleValues).filter(([, v]) => v);
  if (!entries.length) return '';
  return `:root {\n${entries.map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`;
}

export function generateElementCSS(elementStyles: Record<string, Record<string, string>>): string {
  const rules: string[] = [];
  for (const [selector, props] of Object.entries(elementStyles)) {
    const declarations = Object.entries(props).filter(([, v]) => v);
    if (!declarations.length) continue;
    rules.push(`${selector} {\n${declarations.map(([p, v]) => `  ${p}: ${v};`).join('\n')}\n}`);
  }
  return rules.join('\n\n');
}
