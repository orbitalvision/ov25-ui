/**
 * Configuration types for injectDiningConfigurator().
 */

import type {
  ElementSelector,
  ResponsiveValue,
  StringOrFunction,
  UnifiedPricePayload,
  UnifiedSkuPayload,
} from './inject-config.js';

export type DiningDisplayMode = 'split' | 'full-page';

export interface DiningSelectorsConfig {
  /** Where the full-page dining shell goes. If omitted in full-page mode, a fixed viewport root is created in document.body. */
  root?: ElementSelector;
  /** Where the 3D iframe goes (replaces target element) */
  gallery?: ElementSelector;
  /** Where the dining sidebar control panel goes */
  sidebar?: ElementSelector;
  /** Price display element */
  price?: ElementSelector;
  /** Product name display element */
  name?: ElementSelector;
}

export interface DiningCallbacksConfig {
  /** Add configured dining set to basket */
  addToBasket?: (payload?: DiningOnChangePayload) => void;
  /** Called when dining state changes (table/chair selections, pricing) */
  onChange?: (payload: DiningOnChangePayload) => void;
}

export interface DiningBrandingConfig {
  /** Custom CSS to inject into shadow roots */
  cssString?: string;
  /** Logo URL for branding */
  logoURL?: string;
  /** Optional mobile logo URL for branding */
  mobileLogoURL?: string;
  /** Hide logo in dining shell header */
  hideLogo?: boolean;
  /** Optional hero images for the initial style-choice screen. */
  styleImages?: DiningStyleImagesConfig;
}

export interface DiningFlagsConfig {
  /** Hide pricing UI */
  hidePricing?: boolean;
  /** Disable add to basket button */
  disableAddToCart?: boolean;
  /** Hide AR/view-in-room controls */
  hideAr?: boolean;
  /** Force mobile layout for testing */
  forceMobile?: boolean;
  /** Display currency symbol — default £ */
  currencySymbol?: string;
}

export type DiningDisplayOptions = {
  /** Show in-scene dining attachment point buttons. Default true. */
  showAttachmentPoints?: boolean;
};

export type DiningStyleImagesConfig = {
  /** Image for the fixed/full-range style choice. */
  fullRange?: string;
  /** Image for the mix-and-match style choice. */
  mixAndMatch?: string;
};

export type DiningEmbedConfig = {
  /** Dining UI layout mode. `full-page` owns a full viewport shell. Default `split`. */
  displayMode?: ResponsiveValue<DiningDisplayMode>;
  displayOptions?: DiningDisplayOptions;
  /** Optional hero images for the initial full-page style-choice screen. */
  styleImages?: DiningStyleImagesConfig;
};

export interface DiningCommercePayload {
  table: {
    productId: number;
    configId: number;
    name: string;
  } | null;
  chairs: Array<{
    productId: number;
    configId: number;
    name: string;
    count: number;
    side: string;
  }>;
  totalItems: number;
}

export interface DiningOnChangePayload extends DiningCommercePayload {
  /** Normalized standard OV25 SKU payload from CURRENT_SKU. */
  skus: UnifiedSkuPayload | null;
  /** Normalized standard OV25 price payload from CURRENT_PRICE. */
  price: UnifiedPricePayload | null;
  /** Dining-specific summary for hosts that do not want to parse SKU/price lines. */
  dining: DiningCommercePayload;
  table: { productId: number; configId: number; name: string } | null;
  globalChairCount: number;
  sideAssignments: Record<string, { type: string; productId: number; configId: number }>;
}

/** Primary inject config for dining configurator */
export interface InjectDiningConfiguratorOptions {
  apiKey: StringOrFunction;
  /** Dining configurator ID (the dining-configurator database record ID) */
  diningConfiguratorId: StringOrFunction;

  selectors?: DiningSelectorsConfig;
  displayMode?: ResponsiveValue<DiningDisplayMode>;
  callbacks?: DiningCallbacksConfig;
  branding?: DiningBrandingConfig;
  flags?: DiningFlagsConfig;
  displayOptions?: DiningDisplayOptions;
  uniqueId?: string;
}
