import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // process.env does not include .env until loadEnv runs (config is evaluated first).
  const env = loadEnv(mode, process.cwd(), '')
  return {
  plugins: [
    tailwindcss(),
  ],
  define: {
    'import.meta.env.USE_LOCAL_DEV': JSON.stringify(env.USE_LOCAL_DEV ?? ''),
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'OV25UI',
      formats: ['es'],
      fileName: 'index'
    },
    sourcemap: true,
    rollupOptions: {
      external: (id) => /^react(-dom)?(\/|$)/.test(id),
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'index.css';
          return assetInfo.name;
        },
        inlineDynamicImports: false
      }
    },
    cssCodeSplit: false,
    emptyOutDir: true
  }
  }
})