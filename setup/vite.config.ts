import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        defaults: 'src/defaults.ts',
      },
      name: 'OV25Setup',
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: (id) => /^react(-dom)?(\/|$)/.test(id),
      output: {
        assetFileNames: (assetInfo) => {
          if ([assetInfo.name, ...assetInfo.names].some((name) => name?.endsWith('.css'))) {
            return 'index.css';
          }
          return assetInfo.name!;
        },
        inlineDynamicImports: false,
      },
    },
    cssCodeSplit: false,
    emptyOutDir: true,
  },
});
