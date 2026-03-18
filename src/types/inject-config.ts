import type { Swatch, SwatchRulesData } from '../contexts/ov25-ui-context.js';

export type StringOrFunction = string | (() => string);

export type ElementConfig = {
  /** CSS selector (id, class, or any valid selector). */
  selector?: string;
  /** @deprecated Use `selector` instead. Supported for backward compatibility. */
  id?: string;
  replace?: boolean;
};

export type ElementSelector = string | ElementConfig;

/** Responsive value: desktop and mobile breakpoints. */
export type ResponsiveValue<T> = {
  desktop: T;
  mobile?: T;
};

/** Carousel display: 'none' hides it, 'carousel' | 'stacked' show it. */
export type CarouselDisplayMode = 'none' | 'carousel' | 'stacked';

export type CarouselConfig = ResponsiveValue<CarouselDisplayMode> & {
  /** Max images to show in carousel; excess are cut. Responsive: { desktop, mobile }. */
  maxImages?: number | ResponsiveValue<number>;
};

/** Configurator layout: desktop 'inline' | 'sheet' | 'modal', mobile 'inline' | 'drawer'. */
export type ConfiguratorDisplayMode = 'inline' | 'sheet' | 'drawer' | 'modal';

export type ConfiguratorConfig = {
  displayMode: ResponsiveValue<ConfiguratorDisplayMode>;
  triggerStyle?: ResponsiveValue<'single-button' | 'split-buttons'>;
  variants?: VariantsConfig;
};

/** Variant UI style: wizard | list | tabs | accordion | tree. Accordion not available on mobile. */
export type VariantDisplayMode = 'wizard' | 'list' | 'tabs' | 'accordion' | 'tree';

export type VariantsConfig = {
  displayMode: ResponsiveValue<VariantDisplayMode>;
  useSimpleVariantsSelector?: boolean;
};

export type SelectorsConfig = {
  gallery?: ElementSelector;
  price?: ElementSelector;
  name?: ElementSelector;
  variants?: ElementSelector;
  swatches?: ElementSelector;
  configureButton?: ElementSelector;
};

/**
 * Price payload from CURRENT_PRICE message (useIframeMessaging).
 * @property {number} totalPrice - Final price after discount, in minor units (e.g. pence)
 * @property {number} subtotal - Subtotal before discount
 * @property {string} formattedPrice - Display string for final price after discount (e.g. '£1,200.00')
 * @property {string} formattedSubtotal - Display string for subtotal before discount
 * @property {{ amount: number, formattedAmount: string, percentage: number }} discount
 */
export interface OnChangePricePayload {
  totalPrice: number;
  subtotal: number;
  formattedPrice: string;
  formattedSubtotal: string;
  discount: { amount: number; formattedAmount: string; percentage: number };
}

/**
 * Maps option names to their selected SKU values.
 * Keys: option names (e.g. 'Color', 'Size'); reserved keys: 'Range', 'Product', 'Ranges', 'Products'.
 * @example { Color: 'RED-001', Size: 'M-001', Range: 'RANGE-123' }
 */
export interface OptionSkuMap {
  [optionName: string]: string;
}

/**
 * SKU payload from CURRENT_SKU message (useIframeMessaging).
 * @property {string} skuString - Full concatenated SKU string
 * @property {OptionSkuMap} [skuMap] - Per-option SKU values
 */
export interface OnChangeSkuPayload {
  skuString: string;
  skuMap?: OptionSkuMap;
}

/**
 * Payload passed to onChange when price or SKU changes.
 * Each key is null until that message type has been received at least once.
 * @property {OnChangeSkuPayload | null} skus - SKU data from CURRENT_SKU message, or null if not yet received
 * @property {OnChangePricePayload | null} price - Price data from CURRENT_PRICE message, or null if not yet received
 */
export interface OnChangePayload {
  skus: OnChangeSkuPayload | null;
  price: OnChangePricePayload | null;
}

/** Callbacks for inject configurator. */
export interface CallbacksConfig {
  /** Add configured product to basket/checkout. Receives current { skus, price } so you don't need to store them in state. */
  addToBasket: (payload?: OnChangePayload) => void;
  /** Buy now / checkout immediately. Receives current { skus, price } so you don't need to store them in state. */
  buyNow: (payload?: OnChangePayload) => void;
  /** Purchase selected swatches */
  buySwatches: (swatches: Swatch[], swatchRulesData: SwatchRulesData) => void;
  /**
   * Called when price or SKU changes from configurator messages.
   * Receives `{ skus, price }`; each is `null` until that message type has been received at least once.
   * @param payload - `{ skus: OnChangeSkuPayload | null, price: OnChangePricePayload | null }`
   */
  onChange?: (payload: OnChangePayload) => void;
}

export type BrandingConfig = {
  logoURL?: string;
  mobileLogoURL?: string;
  cssString?: string;
};

export type FlagsConfig = {
  hidePricing?: boolean;
  hideAr?: boolean;
  deferThreeD?: boolean;
  showOptional?: boolean;
  /** Force mobile layout for testing (e.g. in device frame). */
  forceMobile?: boolean;
  /** Auto-open configurator modal on load. Only applies when not using inline display mode. Default false. */
  autoOpen?: boolean;
};

/** Primary inject config: grouped structure. */
export interface InjectConfiguratorOptions {
  apiKey: StringOrFunction;
  productLink: StringOrFunction;
  configurationUuid?: StringOrFunction;
  images?: string[];
  uniqueId?: string;

  selectors: SelectorsConfig;
  carousel?: CarouselConfig;
  configurator?: ConfiguratorConfig;
  /** Callbacks for add to basket, buy now, buy swatches, and onChange (price/SKU updates) */
  callbacks: CallbacksConfig;
  branding?: BrandingConfig;
  flags?: FlagsConfig;
}

/** Legacy flat config. Supported for backward compatibility. */
export interface LegacyInjectConfiguratorOptions {
  apiKey: StringOrFunction;
  productLink: StringOrFunction;
  configurationUuid?: StringOrFunction;
  images?: string[];
  uniqueId?: string;

  gallerySelector?: ElementSelector;
  priceSelector?: ElementSelector;
  nameSelector?: ElementSelector;
  variantsSelector?: ElementSelector;
  swatchesSelector?: ElementSelector;
  configureButtonSelector?: ElementSelector;

  carouselDisplayMode?: CarouselDisplayMode;
  carouselDisplayModeMobile?: CarouselDisplayMode;

  configuratorDisplayMode?: 'inline' | 'sheet' | 'modal';
  configuratorDisplayModeMobile?: 'inline' | 'drawer' | 'modal';
  configuratorTriggerStyle?: 'single-button' | 'split-buttons';
  configuratorTriggerStyleMobile?: 'single-button' | 'split-buttons';

  variantDisplayMode?: VariantDisplayMode;
  variantDisplayModeMobile?: VariantDisplayMode;
  useSimpleVariantsSelector?: boolean;

  addToBasketFunction: (payload?: OnChangePayload) => void;
  buyNowFunction: (payload?: OnChangePayload) => void;
  buySwatchesFunction: (swatches: Swatch[], swatchRulesData: SwatchRulesData) => void;
  onChangeFunction?: (payload: OnChangePayload) => void;

  logoURL?: string;
  mobileLogoURL?: string;
  cssString?: string;

  hidePricing?: boolean;
  hideAr?: boolean;
  deferThreeD?: boolean;
  showOptional?: boolean;
  forceMobile?: boolean;
  autoOpen?: boolean;

  galleryId?: ElementSelector;
  priceId?: ElementSelector;
  nameId?: ElementSelector;
  variantsId?: ElementSelector;
  swatchesId?: ElementSelector;
  configureButtonId?: ElementSelector;
  variantDisplayStyle?: VariantDisplayMode;
  variantDisplayStyleMobile?: VariantDisplayMode;
  useInlineVariantControls?: boolean;
}

export type InjectConfiguratorInput = InjectConfiguratorOptions | LegacyInjectConfiguratorOptions;

/** Internal flattened config used by inject logic. */
export interface NormalizedInjectConfig {
  apiKey: StringOrFunction;
  productLink: StringOrFunction;
  configurationUuid?: StringOrFunction;
  images?: string[];
  uniqueId?: string;

  gallerySelector?: ElementSelector;
  priceSelector?: ElementSelector;
  nameSelector?: ElementSelector;
  variantsSelector?: ElementSelector;
  swatchesSelector?: ElementSelector;
  configureButtonSelector?: ElementSelector;

  carouselDisplayMode: CarouselDisplayMode;
  carouselDisplayModeMobile: CarouselDisplayMode;
  carouselMaxImagesDesktop?: number;
  carouselMaxImagesMobile?: number;

  configuratorDisplayMode: 'inline' | 'sheet' | 'modal';
  configuratorDisplayModeMobile: 'inline' | 'drawer' | 'modal';
  configuratorTriggerStyle: 'single-button' | 'split-buttons';
  configuratorTriggerStyleMobile: 'single-button' | 'split-buttons';

  variantDisplayMode: VariantDisplayMode;
  variantDisplayModeMobile: VariantDisplayMode;
  useSimpleVariantsSelector: boolean;

  addToBasketFunction: (payload?: OnChangePayload) => void;
  buyNowFunction: (payload?: OnChangePayload) => void;
  buySwatchesFunction: (swatches: Swatch[], swatchRulesData: SwatchRulesData) => void;
  onChangeFunction?: (payload: OnChangePayload) => void;

  logoURL?: string;
  mobileLogoURL?: string;
  cssString?: string;

  hidePricing?: boolean;
  hideAr?: boolean;
  deferThreeD?: boolean;
  showOptional?: boolean;
  forceMobile?: boolean;
  autoOpen?: boolean;
}

function pick<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
  return obj?.[key];
}

export function normalizeInjectConfig(opts: InjectConfiguratorInput): NormalizedInjectConfig {
  const isGrouped = 'callbacks' in opts && opts.callbacks;
  const c = opts as any;

  const selectors = isGrouped ? pick(c, 'selectors') : undefined;
  const carousel = isGrouped ? pick(c, 'carousel') : undefined;
  const configurator = isGrouped ? pick(c, 'configurator') : undefined;
  const variants = configurator?.variants ?? (isGrouped ? pick(c, 'variants') : undefined);
  const branding = isGrouped ? pick(c, 'branding') : undefined;
  const flags = isGrouped ? pick(c, 'flags') : undefined;

  const gallerySelector = selectors?.gallery ?? c.gallerySelector ?? c.galleryId;
  const priceSelector = selectors?.price ?? c.priceSelector ?? c.priceId;
  const nameSelector = selectors?.name ?? c.nameSelector ?? c.nameId;
  const variantsSelector = selectors?.variants ?? c.variantsSelector ?? c.variantsId;
  const swatchesSelector = selectors?.swatches ?? c.swatchesSelector ?? c.swatchesId;
  const configureButtonSelector = selectors?.configureButton ?? c.configureButtonSelector ?? c.configureButtonId;

  const carouselDesktop = carousel?.desktop ?? c.carouselDisplayMode ?? 'stacked';
  const carouselMobile = carousel?.mobile ?? c.carouselDisplayModeMobile ?? carouselDesktop;
  const maxImagesRaw = carousel?.maxImages;
  const carouselMaxImagesDesktop = typeof maxImagesRaw === 'number' ? maxImagesRaw : (typeof maxImagesRaw === 'object' && maxImagesRaw ? maxImagesRaw.desktop : undefined);
  const carouselMaxImagesMobile = typeof maxImagesRaw === 'number' ? maxImagesRaw : (typeof maxImagesRaw === 'object' && maxImagesRaw ? maxImagesRaw.mobile ?? maxImagesRaw.desktop : undefined);

  const configDesktop = configurator?.displayMode?.desktop ?? c.configuratorDisplayMode ?? 'sheet';
  const configMobile = configurator?.displayMode?.mobile ?? c.configuratorDisplayModeMobile ?? (configDesktop === 'sheet' ? 'drawer' : configDesktop === 'modal' ? 'modal' : 'inline');
  const triggerDesktop = configurator?.triggerStyle?.desktop ?? c.configuratorTriggerStyle ?? 'single-button';
  const triggerMobile = configurator?.triggerStyle?.mobile ?? c.configuratorTriggerStyleMobile ?? triggerDesktop;

  const variantDesktop = variants?.displayMode?.desktop ?? c.variantDisplayMode ?? c.variantDisplayStyle ?? 'tree';
  const variantMobileRaw = variants?.displayMode?.mobile ?? c.variantDisplayModeMobile ?? c.variantDisplayStyleMobile ?? 'tree';
  const variantMobile = variantMobileRaw === 'accordion' ? 'tree' : variantMobileRaw;

  const useSimpleVariantsSelector = variants?.useSimpleVariantsSelector ?? c.useSimpleVariantsSelector ?? true;

  const addToBasketFunction = isGrouped ? (opts as InjectConfiguratorOptions).callbacks.addToBasket : c.addToBasketFunction;
  const buyNowFunction = isGrouped ? (opts as InjectConfiguratorOptions).callbacks.buyNow : c.buyNowFunction;
  const buySwatchesFunction = isGrouped ? (opts as InjectConfiguratorOptions).callbacks.buySwatches : (c.buySwatchesFunction ?? c.addSwatchesToCartFunction);
  const onChangeFunction = isGrouped ? (opts as InjectConfiguratorOptions).callbacks.onChange : c.onChangeFunction;

  const logoURL = branding?.logoURL ?? c.logoURL;
  const mobileLogoURL = branding?.mobileLogoURL ?? c.mobileLogoURL;
  const cssString = branding?.cssString ?? c.cssString;

  const hidePricing = flags?.hidePricing ?? c.hidePricing;
  const hideAr = flags?.hideAr ?? c.hideAr;
  const deferThreeD = flags?.deferThreeD ?? c.deferThreeD;
  const showOptional = flags?.showOptional ?? c.showOptional;
  const forceMobile = flags?.forceMobile ?? c.forceMobile;
  const autoOpen = flags?.autoOpen ?? c.autoOpen ?? false;

  return {
    apiKey: opts.apiKey,
    productLink: opts.productLink,
    configurationUuid: opts.configurationUuid,
    images: opts.images,
    uniqueId: opts.uniqueId,
    gallerySelector,
    priceSelector,
    nameSelector,
    variantsSelector,
    swatchesSelector,
    configureButtonSelector,
    carouselDisplayMode: carouselDesktop,
    carouselDisplayModeMobile: carouselMobile,
    carouselMaxImagesDesktop,
    carouselMaxImagesMobile,
    configuratorDisplayMode: configDesktop,
    configuratorDisplayModeMobile: configMobile,
    configuratorTriggerStyle: triggerDesktop,
    configuratorTriggerStyleMobile: triggerMobile,
    variantDisplayMode: variantDesktop,
    variantDisplayModeMobile: variantMobile,
    useSimpleVariantsSelector,
    addToBasketFunction,
    buyNowFunction,
    buySwatchesFunction,
    onChangeFunction,
    logoURL,
    mobileLogoURL,
    cssString,
    hidePricing,
    hideAr,
    deferThreeD,
    showOptional,
    forceMobile,
    autoOpen,
  };
}
