import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'OV25UI',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
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
})