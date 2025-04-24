// Import the CSS
import '../globals.css';

// Export the injectConfigurator function from inject.ts
import { injectConfigurator } from './utils/inject.js';
import type { InjectConfiguratorOptions } from './utils/inject.js';

// Export both as named exports and as default export
export { injectConfigurator };
export type { InjectConfiguratorOptions };

// Default export object containing all exports
const OV25UI = {
  injectConfigurator,
};

export default OV25UI; 