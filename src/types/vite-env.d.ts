/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set at build time via env `USE_LOCAL_DEV` (e.g. `USE_LOCAL_DEV=true npm run build`). */
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