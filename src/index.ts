// Import the CSS
import '../globals.css';

// Export the injectConfigurator function from inject.ts
import { injectConfigurator } from './utils/inject.js';
import type { InjectConfiguratorOptions, InjectConfiguratorInput } from './utils/inject.js';

export {
  injectConfigurator,
  ConfiguratorDisplayMode,
  CarouselDisplayMode,
  VariantDisplayMode,
  VariantDisplayStyleOverlay,
  CarouselLayout,
  VariantDisplayStyle,
} from './utils/inject.js';
export type {
  InjectConfiguratorOptions,
  LegacyInjectConfiguratorOptions,
  InjectConfiguratorInput,
  CarouselConfig,
  ConfiguratorConfig,
  VariantsConfig,
  SelectorsConfig,
  CallbacksConfig,
  BrandingConfig,
  FlagsConfig,
  ElementSelector,
  ElementConfig,
  StringOrFunction,
  OnChangePayload,
  OnChangePricePayload,
  OnChangeSkuPayload,
  UnifiedOnChangePayload,
  UnifiedSkuPayload,
  UnifiedSkuPayloadSingle,
  UnifiedSkuPayloadMulti,
  UnifiedPricePayload,
  CommerceLineItemSku,
  CommerceLineItemPrice,
  CommerceLineItemSelection,
  OptionSkuMap,
} from './utils/inject.js';

export { normalizeSkuPayload, normalizePricePayload, parseIframeJsonPayload } from './commerce/normalize-iframe-commerce.js';
export type { Swatch, SwatchRulesData } from './contexts/ov25-ui-context.js';

// Default export object containing all exports
const OV25UI = {
  injectConfigurator,
};

export default OV25UI; 