import type { LayoutType } from '../../lib/config/preview-config';

export type PreviewLayoutType = LayoutType;

export type FormCarouselDisplayMode = 'none' | 'carousel' | 'stacked';
export type FormConfiguratorDisplayMode = 'inline' | 'sheet' | 'modal' | 'variants-only-sheet';
export type FormConfiguratorDisplayModeMobile = 'inline' | 'drawer' | 'modal' | 'variants-only-sheet';
export type FormVariantDisplayMode = 'wizard' | 'list' | 'tabs' | 'accordion' | 'tree';

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
    useSimpleVariantsSelector: boolean;
  };
  flags: {
    hidePricing: boolean;
    hideAr: boolean;
    deferThreeD: boolean;
    showOptional: boolean;
    forceMobile: boolean;
    autoOpen: boolean;
  };
  branding: {
    logoURL: string;
    mobileLogoURL: string;
    cssString: string;
  };
  style: Record<string, string>;
  elementStyles: Record<string, Record<string, string>>;
  snap2UseStartingConfig?: boolean;
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
  },
  carousel: { desktop: 'stacked', mobile: 'carousel', maxImagesDesktop: 4, maxImagesMobile: 6 },
  configurator: {
    displayModeDesktop: 'sheet',
    displayModeMobile: 'drawer',
    triggerStyleDesktop: 'single-button',
    triggerStyleMobile: 'single-button',
    variantDisplayDesktop: 'tree',
    variantDisplayMobile: 'list',
    useSimpleVariantsSelector: true,
  },
  flags: { hidePricing: false, hideAr: false, deferThreeD: false, showOptional: false, forceMobile: false, autoOpen: false },
  branding: { logoURL: '', mobileLogoURL: '', cssString: '' },
  style: {},
  elementStyles: {},
};

const DEFAULT_SNAP2_SETTINGS: TypeSettings = {
  ...DEFAULT_STANDARD_SETTINGS,
  selectors: {
    ...DEFAULT_STANDARD_SETTINGS.selectors,
    gallery: { enabled: false, selector: '.configurator-container', replace: true },
    configureButton: { enabled: true, selector: '[data-ov25-configure-button]', replace: false },
  },
};

export const DEFAULT_TYPE_SETTINGS: Record<PreviewLayoutType, TypeSettings> = {
  standard: DEFAULT_STANDARD_SETTINGS,
  snap2: DEFAULT_SNAP2_SETTINGS,
};

export const DEFAULT_FORM_STATE: ConfiguratorSetupFormState = {
  layout: 'standard',
  typeSettings: DEFAULT_TYPE_SETTINGS,
};
