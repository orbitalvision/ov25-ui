/// <reference types="vite/client" />

declare module '*.png' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_MAZE_APIKEY?: string;
  readonly VITE_DEMO_RETAILER_APIKEY?: string;
  readonly VITE_DEV_RETAILER_APIKEY?: string;
  readonly VITE_DIAMOND_APIKEY?: string;
  readonly VITE_ARLO_APIKEY?: string;
}
