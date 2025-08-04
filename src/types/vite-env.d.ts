/// <reference types="vite/client" />

declare module '*.css?inline' {
  const css: string;
  export default css;
}

declare module '*.css?raw' {
  const css: string;
  export default css;
} 