/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set at build time via env `OV25_CONFIGURATOR_DEV` (e.g. `OV25_CONFIGURATOR_DEV=true npm run build`). */
  readonly OV25_CONFIGURATOR_DEV?: string;
  readonly VITE_OV25_CONFIGURATOR_DEV?: string;
  readonly 'ov25-configurator-dev'?: string;
  /** Legacy alias for `OV25_CONFIGURATOR_DEV`. */
  readonly USE_LOCAL_DEV?: string;
}

declare module '*.css?inline' {
  const css: string;
  export default css;
}

declare module '*.css?raw' {
  const css: string;
  export default css;
} 
