import type { Swatch, SwatchRulesData } from '../contexts/ov25-ui-context.js';
import type { BedAllowNonePartsInput } from '../lib/config/bed-embed-query.js';
import { serializeBedAllowNoneQueryValue } from '../lib/config/bed-embed-query.js';
import { DEFAULT_CURRENCY_SYMBOL } from '../lib/config/currency-display.js';

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
  /**
   * Option ids or display names (case-insensitive) to omit from variant UI (list, wizard, tabs, etc.).
   * Iframe defaults and CURRENT_SKU state stay applied; users cannot change these options in the shell.
   */
  hideOptions?: string[];
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
 * Maps option names to their selected SKU values.
 * Keys: option names (e.g. 'Color', 'Size'); reserved keys: 'Range', 'Product', 'Ranges', 'Products'.
 * @example { Color: 'RED-001', Size: 'M-001', Range: 'RANGE-123' }
 */
export interface OptionSkuMap {
  [optionName: string]: string;
}

/** One billable/configured product line after normalization (SKU side). */
export interface CommerceLineItemSku {
  /** Catalogue product id or other stable line id from the iframe. */
  id: string;
  skuString: string;
  skuMap: Record<string, string>;
  quantity: number;
}

/** One configured option row inside a price line (single-product breakdown or Snap2 selections). */
export interface CommerceLineItemSelection {
  category?: string;
  name: string;
  sku?: string;
  price: number;
  formattedPrice: string;
  thumbnail?: string;
}

/** One billable product line after normalization (price side). */
export interface CommerceLineItemPrice {
  /** Same id semantics as {@link CommerceLineItemSku.id} when both messages come from Snap2 with `productId`. */
  id: string;
  name: string;
  quantity: number;
  price: number;
  formattedPrice: string;
  subtotal: number;
  formattedSubtotal: string;
  discountedAmount: number;
  formattedDiscountAmount: string;
  discountPercentage: number;
  selections: CommerceLineItemSelection[];
  /** Snap2 3D model id when present on the iframe breakdown. */
  modelId?: string;
}

/** One selection row inside {@link ProductPriceBreakdown} (Snap2; aligns with OV25 `useSnap2TotalPrice`). */
export interface SelectionPriceBreakdown {
  name: string;
  price: number;
  formattedPrice: string;
  thumbnail?: string;
}

/**
 * Per-product Snap2 totals (aligns with OV25 `ProductPriceBreakdown` in `useSnap2TotalPrice`).
 * Optional on {@link UnifiedPricePayload} for host consumers (cart, invoices).
 */
export interface ProductPriceBreakdown {
  productId: string;
  formattedSubtotal: string;
  subtotal: number;
  discountedAmount: number;
  formattedDiscountAmount: string;
  discountPercentage: number;
  name: string;
  quantity: number;
  price: number;
  formattedPrice: string;
  selections: SelectionPriceBreakdown[];
  modelId: string;
  image?: string;
}

/** Single-product iframe: legacy top-level sku fields plus `lines` (length 1). */
export interface UnifiedSkuPayloadSingle {
  mode: 'single';
  lines: CommerceLineItemSku[];
  skuString: string;
  skuMap?: OptionSkuMap;
}

/** Multi-product (Snap2): only `lines`; no top-level `skuString`. */
export interface UnifiedSkuPayloadMulti {
  mode: 'multi';
  lines: CommerceLineItemSku[];
}

export type UnifiedSkuPayload = UnifiedSkuPayloadSingle | UnifiedSkuPayloadMulti;

export interface UnifiedPricePayload {
  mode: 'single' | 'multi';
  totalPrice: number;
  subtotal: number;
  formattedPrice: string;
  formattedSubtotal: string;
  discount: { amount: number; formattedAmount: string; percentage: number };
  lines: CommerceLineItemPrice[];
  /** Raw single-product `priceBreakdown` from the iframe when present. */
  priceBreakdown?: unknown[];
  /** Snap2 `productBreakdowns` from the iframe when present (same shape as OV25 `ProductPriceBreakdown[]`). */
  productBreakdowns?: ProductPriceBreakdown[];
}

/**
 * Callback payload: normalized SKU and price. Each half is null until that message was received at least once.
 */
export interface UnifiedOnChangePayload {
  skus: UnifiedSkuPayload | null;
  price: UnifiedPricePayload | null;
}

export type OnChangePayload = UnifiedOnChangePayload;

/**
 * Normalized SKU from CURRENT_SKU. Use `mode` / `lines` for multi-product; in `single` mode top-level `skuString` remains for legacy code.
 * @deprecated Prefer the name {@link UnifiedSkuPayload} in new integrations.
 */
export type OnChangeSkuPayload = UnifiedSkuPayload;

/**
 * Normalized price from CURRENT_PRICE (includes `mode`, `lines`, optional raw breakdown passthrough).
 * @deprecated Prefer the name {@link UnifiedPricePayload} in new integrations.
 */
export type OnChangePricePayload = UnifiedPricePayload;

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
   * Receives normalized `{ skus, price }` (see {@link UnifiedOnChangePayload}); each is `null` until that message type has been received at least once.
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
  disableAddToCart?: boolean;
  hideAr?: boolean;
  deferThreeD?: boolean;
  showOptional?: boolean;
  /** Force mobile layout for testing (e.g. in device frame). */
  forceMobile?: boolean;
  /** Auto-open configurator modal on load. Only applies when not using inline display mode. Default false. */
  autoOpen?: boolean;
  /**
   * Display symbol for formatted prices from the iframe (OV25 emits GBP/`£`). Replaces `£` in `CURRENT_PRICE`
   * strings after normalization; not FX conversion. Default `£`.
   */
  currencySymbol?: string;
};

/** Per bed line: when true, variant UI hides selections whose `metadata.bedSize` ≠ iframe current size. */
export type BedPartSizeFilterFlags = {
  headboard: boolean;
  base: boolean;
  mattress: boolean;
};

/** Bed iframe (OV25): optional `bedAllowNone` query param on the configurator URL. */
export type BedEmbedConfig = {
  allowNone?: BedAllowNonePartsInput;
  filterSelectionsByCurrentSize?: BedPartSizeFilterFlags;
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
  bed?: BedEmbedConfig;
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
  disableAddToCart?: boolean;
  hideAr?: boolean;
  deferThreeD?: boolean;
  showOptional?: boolean;
  forceMobile?: boolean;
  autoOpen?: boolean;
  /** @see {@link FlagsConfig.currencySymbol} */
  currencySymbol?: string;

  /** @see {@link BedEmbedConfig} */
  bedAllowNone?: BedAllowNonePartsInput;
  /** @see {@link BedEmbedConfig.filterSelectionsByCurrentSize} */
  bedFilterSelectionsByCurrentSize?: BedPartSizeFilterFlags;

  galleryId?: ElementSelector;
  priceId?: ElementSelector;
  nameId?: ElementSelector;
  variantsId?: ElementSelector;
  swatchesId?: ElementSelector;
  configureButtonId?: ElementSelector;
  variantDisplayStyle?: VariantDisplayMode;
  variantDisplayStyleMobile?: VariantDisplayMode;
  useInlineVariantControls?: boolean;
  hideOptions?: string[];
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
  /** Lowercase trimmed option ids/names to hide from variant selectors (see {@link VariantsConfig.hideOptions}). */
  hideVariantOptions: string[];

  addToBasketFunction: (payload?: OnChangePayload) => void;
  buyNowFunction: (payload?: OnChangePayload) => void;
  buySwatchesFunction: (swatches: Swatch[], swatchRulesData: SwatchRulesData) => void;
  onChangeFunction?: (payload: OnChangePayload) => void;

  logoURL?: string;
  mobileLogoURL?: string;
  cssString?: string;

  hidePricing?: boolean;
  disableAddToCart?: boolean;
  hideAr?: boolean;
  deferThreeD?: boolean;
  showOptional?: boolean;
  forceMobile?: boolean;
  autoOpen?: boolean;

  /** Serialized `bedAllowNone` query value; omit when unset (OV25 default: all parts may use None). */
  bedAllowNoneQueryValue?: string;
  /** Bed variant UI: hide non-matching `metadata.bedSize` per line when enabled. */
  bedFilterSelectionsByCurrentSize: BedPartSizeFilterFlags;
  /** Display symbol for iframe price strings; see {@link FlagsConfig.currencySymbol}. */
  currencySymbol: string;
}

function pick<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
  return obj?.[key];
}

function normalizeHideVariantOptions(raw: string[] | undefined): string[] {
  if (!raw?.length) return [];
  const seen = new Set<string>();
  for (const s of raw) {
    const k = String(s).trim().toLowerCase();
    if (k) seen.add(k);
  }
  return [...seen];
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
  const bedGrouped = isGrouped ? pick(c, 'bed') : undefined;

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
  const hideVariantOptions = normalizeHideVariantOptions(variants?.hideOptions ?? c.hideOptions);

  const addToBasketFunction = isGrouped ? (opts as InjectConfiguratorOptions).callbacks.addToBasket : c.addToBasketFunction;
  const buyNowFunction = isGrouped ? (opts as InjectConfiguratorOptions).callbacks.buyNow : c.buyNowFunction;
  const buySwatchesFunction = isGrouped ? (opts as InjectConfiguratorOptions).callbacks.buySwatches : (c.buySwatchesFunction ?? c.addSwatchesToCartFunction);
  const onChangeFunction = isGrouped ? (opts as InjectConfiguratorOptions).callbacks.onChange : c.onChangeFunction;

  const logoURL = branding?.logoURL ?? c.logoURL;
  const mobileLogoURL = branding?.mobileLogoURL ?? c.mobileLogoURL;
  const cssString = branding?.cssString ?? c.cssString;

  const hidePricing = flags?.hidePricing ?? c.hidePricing;
  const disableAddToCart = flags?.disableAddToCart ?? c.disableAddToCart ?? false;
  const hideAr = flags?.hideAr ?? c.hideAr;
  const deferThreeD = flags?.deferThreeD ?? c.deferThreeD;
  const showOptional = flags?.showOptional ?? c.showOptional;
  const forceMobile = flags?.forceMobile ?? c.forceMobile;
  const autoOpen = flags?.autoOpen ?? c.autoOpen ?? false;

  const rawCurrencySymbol = flags?.currencySymbol ?? c.currencySymbol;
  const trimmedCurrency =
    typeof rawCurrencySymbol === 'string' ? rawCurrencySymbol.trim() : '';
  const currencySymbol =
    trimmedCurrency !== '' ? trimmedCurrency : DEFAULT_CURRENCY_SYMBOL;

  const bedAllowNoneParts: BedAllowNonePartsInput | undefined =
    bedGrouped?.allowNone ?? c.bedAllowNone;
  const bedAllowNoneQueryValue =
    bedAllowNoneParts !== undefined
      ? serializeBedAllowNoneQueryValue(bedAllowNoneParts)
      : undefined;

  const bedFilterRaw: BedPartSizeFilterFlags | undefined =
    bedGrouped?.filterSelectionsByCurrentSize ?? c.bedFilterSelectionsByCurrentSize;
  const bedFilterSelectionsByCurrentSize: BedPartSizeFilterFlags = {
    headboard: Boolean(bedFilterRaw?.headboard),
    base: Boolean(bedFilterRaw?.base),
    mattress: Boolean(bedFilterRaw?.mattress),
  };

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
    hideVariantOptions,
    addToBasketFunction,
    buyNowFunction,
    buySwatchesFunction,
    onChangeFunction,
    logoURL,
    mobileLogoURL,
    cssString,
    hidePricing,
    disableAddToCart,
    hideAr,
    deferThreeD,
    showOptional,
    forceMobile,
    autoOpen,
    bedAllowNoneQueryValue,
    bedFilterSelectionsByCurrentSize,
    currencySymbol,
  };
}
