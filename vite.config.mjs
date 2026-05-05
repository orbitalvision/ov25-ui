import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

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
      // Second entry only imports globals.css so we ship dist/index.css without a
      // side-effect CSS import inside dist/index.js (Next.js css-npm).
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        __ov25GlobalCss: resolve(__dirname, 'src/build-emit-global-css.ts'),
      },
      name: 'OV25UI',
      formats: ['es'],
      // Rollup still emits one JS file per entry; the CSS entry’s chunk is deleted
      // after build (scripts/remove-ov25-css-entry-chunk.js).
      fileName: (format, entryName) =>
        entryName === '__ov25GlobalCss'
          ? '__ov25-temp-css-entry.js'
          : 'index.js',
    },
    sourcemap: true,
    rollupOptions: {
      external: (id) => /^react(-dom)?(\/|$)/.test(id),
      output: {
        // Default emitted CSS name varies; normalize to package export dist/index.css.
        assetFileNames: (assetInfo) => {
          const n = assetInfo.name ?? '';
          if (n.endsWith('.css')) return 'index.css';
          return assetInfo.name ?? '[name][extname]';
        },
        inlineDynamicImports: false
      }
    },
    cssCodeSplit: false,
    emptyOutDir: true
  }
  }
})