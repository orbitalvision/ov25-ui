// Export the injectConfigurator function from inject.ts
import { injectConfigurator, InjectConfiguratorOptions } from './utils/inject.js';

// Export both as named exports and as default export
export { injectConfigurator, InjectConfiguratorOptions };

// Default export object containing all exports
const OV25UI = {
  injectConfigurator
};

export default OV25UI; 