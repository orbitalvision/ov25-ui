// Import the CSS
import '../globals.css';

// Export the injectConfigurator function from inject.ts
import { injectConfigurator, injectMultipleConfigurators } from './utils/inject.js';
import type { InjectConfiguratorOptions } from './utils/inject.js';

// Export both as named exports and as default export
export { injectConfigurator, injectMultipleConfigurators };
export type { InjectConfiguratorOptions };

// Default export object containing all exports
const OV25UI = {
  injectConfigurator,
  injectMultipleConfigurators,
};

export default OV25UI; 