// Export the injectConfigurator function from inject.ts
import { injectConfigurator } from './utils/inject.js';
import { injectDiningConfigurator } from './utils/inject-dining.js';
import type { InjectConfiguratorOptions, InjectConfiguratorInput } from './utils/inject.js';

export {
  injectConfigurator,
  ConfiguratorDisplayMode,
  CarouselDisplayMode,
  VariantDisplayMode,
  VariantDisplayStyleOverlay,
  CarouselLayout,
  STRING_REPLACEMENT_DEFINITIONS,
} from './utils/inject.js';
export { injectDiningConfigurator, injectDiningConfigurator as injectDining } from './utils/inject-dining.js';
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
  StringReplacementRuleTrigger,
  StringReplacementDefinitionKey,
  StringReplacementRule,
  StringReplacementsConfig,
  StringReplacementDefinition,
  StringInterpolationValueDefinition,
  StringReplacements,
} from './utils/inject.js';

export type {
  InjectDiningConfiguratorOptions,
  DiningSelectorsConfig,
  DiningCallbacksConfig,
  DiningBrandingConfig,
  DiningFlagsConfig,
  DiningDisplayOptions,
  DiningStyleImagesConfig,
  DiningDisplayMode,
  DiningEmbedConfig,
  DiningCommercePayload,
  DiningOnChangePayload,
} from './types/dining-inject-config.js';

export { normalizeSkuPayload, normalizePricePayload, parseIframeJsonPayload } from './commerce/normalize-iframe-commerce.js';
export type { Swatch, SwatchRulesData } from './contexts/ov25-ui-context.js';
export { useOv25String } from './lib/strings/use-ov25-string.js';

// Default export object containing all exports
const OV25UI = {
  injectConfigurator,
  injectDiningConfigurator,
};

export default OV25UI; 
