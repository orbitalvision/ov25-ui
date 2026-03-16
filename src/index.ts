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
  OptionSkuMap,
} from './utils/inject.js';
export type { Swatch, SwatchRulesData } from './contexts/ov25-ui-context.js';

// Default export object containing all exports
const OV25UI = {
  injectConfigurator,
};

export default OV25UI; 