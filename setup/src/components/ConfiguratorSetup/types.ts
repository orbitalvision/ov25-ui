import type { LayoutType } from '../../lib/config/preview-config';
import type { StringReplacementsConfig } from 'ov25-ui';

export type PreviewLayoutType = LayoutType;

export type FormCarouselDisplayMode = 'none' | 'carousel' | 'stacked';
export type FormConfiguratorDisplayMode = 'inline' | 'inline-sticky' | 'sheet' | 'modal' | 'variants-only-sheet';
export type FormConfiguratorDisplayModeMobile = 'inline' | 'inline-sticky' | 'drawer' | 'modal' | 'variants-only-sheet';
export type FormVariantDisplayMode = 'wizard' | 'list' | 'tabs' | 'accordion' | 'tree';
export type FormSnap2VariantPosition = 'left' | 'right';
export type FormSnap2ModulePosition = 'left' | 'right' | 'bottom';

export interface SelectorFormState {
  enabled: boolean;
  selector: string;
  replace: boolean;
}

export interface TypeSettings {
  selectors: {
    gallery: SelectorFormState;
    price: SelectorFormState;
    name: SelectorFormState;
    variants: SelectorFormState;
    swatches: SelectorFormState;
    configureButton: SelectorFormState;
    initialiseMenu: SelectorFormState;
  };
  carousel: {
    desktop: FormCarouselDisplayMode;
    mobile: FormCarouselDisplayMode;
    maxImagesDesktop: number;
    maxImagesMobile: number;
  };
  configurator: {
    displayModeDesktop: FormConfiguratorDisplayMode;
    displayModeMobile: FormConfiguratorDisplayModeMobile;
    triggerStyleDesktop: 'single-button' | 'split-buttons';
    triggerStyleMobile: 'single-button' | 'split-buttons';
    variantDisplayDesktop: FormVariantDisplayMode;
    variantDisplayMobile: FormVariantDisplayMode;
    snap2VariantPositionDesktop: FormSnap2VariantPosition;
    snap2VariantPositionMobile: FormSnap2VariantPosition;
    snap2ModulePositionDesktop: FormSnap2ModulePosition;
    snap2ModulePositionMobile: FormSnap2ModulePosition;
    useSimpleVariantsSelector: boolean;
    /** Comma-separated option ids/names → saved as `variants.hideOptions` in JSON. */
    variantHideOptionsCsv: string;
  };
  flags: {
    hidePricing: boolean;
    disableAddToCart: boolean;
    disableBuyNow: boolean;
    hideAr: boolean;
    hideGestureHint: boolean;
    deferThreeD: boolean;
    showOptional: boolean;
    forceMobile: boolean;
    autoOpen: boolean;
  };
  branding: {
    logoURL: string;
    mobileLogoURL: string;
    cssString: string;
    hideLogo: boolean;
  };
  style: Record<string, string>;
  elementStyles: Record<string, Record<string, string>>;
  /** Per-catalog-key replacement rules (order matters; optional triggers). */
  stringReplacements: StringReplacementsConfig;
  snap2UseStartingConfig?: boolean;
  /**
   * Bed layout only: when checked, that part may use the “None” line on the OV25 bed iframe (`bedAllowNone` query).
   */
  bed?: {
    allowNoneHeadboard: boolean;
    allowNoneBase: boolean;
    allowNoneMattress: boolean;
    /** Variant UI: hide selections whose bed size metadata ≠ iframe current size (per line). */
    filterMatchingSizeHeadboard: boolean;
    filterMatchingSizeBase: boolean;
    filterMatchingSizeMattress: boolean;
  };
}

export interface ConfiguratorSetupFormState {
  layout: PreviewLayoutType;
  typeSettings: Record<PreviewLayoutType, TypeSettings>;
}

export const DEFAULT_SELECTOR_STATE: SelectorFormState = {
  enabled: true,
  selector: '',
  replace: true,
};

const DEFAULT_STANDARD_SETTINGS: TypeSettings = {
  selectors: {
    gallery: { enabled: true, selector: '.configurator-container', replace: true },
    price: { enabled: true, selector: '#price', replace: true },
    name: { enabled: true, selector: '#name', replace: true },
    variants: { enabled: true, selector: '#ov25-controls', replace: false },
    swatches: { enabled: true, selector: '#ov25-swatches', replace: false },
    configureButton: { enabled: false, selector: '[data-ov25-configure-button]', replace: false },
    initialiseMenu: { enabled: false, selector: '#ov25-initialise-menu', replace: true },
  },
  carousel: { desktop: 'stacked', mobile: 'carousel', maxImagesDesktop: 4, maxImagesMobile: 6 },
  configurator: {
    displayModeDesktop: 'sheet',
    displayModeMobile: 'drawer',
    triggerStyleDesktop: 'single-button',
    triggerStyleMobile: 'single-button',
    variantDisplayDesktop: 'tree',
    variantDisplayMobile: 'list',
    snap2VariantPositionDesktop: 'right',
    snap2VariantPositionMobile: 'right',
    snap2ModulePositionDesktop: 'right',
    snap2ModulePositionMobile: 'right',
    useSimpleVariantsSelector: true,
    variantHideOptionsCsv: '',
  },
  flags: { hidePricing: false, disableAddToCart: false, disableBuyNow: false, hideAr: false, hideGestureHint: false, deferThreeD: false, showOptional: false, forceMobile: false, autoOpen: false },
  branding: { logoURL: '', mobileLogoURL: '', cssString: '', hideLogo: false },
  style: {},
  elementStyles: {},
  stringReplacements: {},
};

const DEFAULT_SNAP2_SETTINGS: TypeSettings = {
  ...DEFAULT_STANDARD_SETTINGS,
  selectors: {
    ...DEFAULT_STANDARD_SETTINGS.selectors,
    gallery: { enabled: false, selector: '.configurator-container', replace: true },
    configureButton: { enabled: true, selector: '[data-ov25-configure-button]', replace: false },
  },
  configurator: {
    ...DEFAULT_STANDARD_SETTINGS.configurator,
    displayModeDesktop: 'modal',
    displayModeMobile: 'modal',
  },
};

/** Single-product bed flow: same shell as standard, with configure trigger and bed preview selectors. */
const DEFAULT_BED_CONFIGURATOR_SETTINGS: TypeSettings = {
  ...DEFAULT_STANDARD_SETTINGS,
  selectors: {
    ...DEFAULT_STANDARD_SETTINGS.selectors,
    configureButton: { enabled: true, selector: '#ov25-fullscreen-button', replace: false },
  },
  branding: {
    ...DEFAULT_STANDARD_SETTINGS.branding,
    cssString: 'ov25-selection-thumbnail: bg-white;',
  },
  bed: {
    allowNoneHeadboard: true,
    allowNoneBase: true,
    allowNoneMattress: true,
    filterMatchingSizeHeadboard: false,
    filterMatchingSizeBase: false,
    filterMatchingSizeMattress: false,
  },
};

export const DEFAULT_TYPE_SETTINGS: Record<PreviewLayoutType, TypeSettings> = {
  standard: DEFAULT_STANDARD_SETTINGS,
  snap2: DEFAULT_SNAP2_SETTINGS,
  bedConfigurator: DEFAULT_BED_CONFIGURATOR_SETTINGS,
};

export const DEFAULT_FORM_STATE: ConfiguratorSetupFormState = {
  layout: 'standard',
  typeSettings: DEFAULT_TYPE_SETTINGS,
};
