import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const testPages = [
  'configure-button-only',
  'configure-button-modal',
  'single-product-gallery',
  'single-no-variants',
  'single-no-pricing',
  'single-no-groups',
  'single-with-discounts',
  'single-with-groups',
  'single-inline-variants',
  'single-custom-button',
  'single-custom-css',
  'range-no-groups',
  'range-with-groups',
  'range-inline-variants-groups',
  'snap2',
  'snap2-uuid',
  'product-with-swatches',
  'multiple-configurators',
  'multiple-standard-configurators',
  'multiple-standard-configurators-with-variants',
  'multiple-standard-configurators-inline-variants',
  'gallery-sheet-tabs',
  'gallery-sheet-accordion',
  'gallery-sheet-tree',
  'gallery-sheet-list',
  'gallery-sheet-wizard',
  'gallery-inline-tabs',
  'gallery-inline-accordion',
  'gallery-inline-tree',
  'gallery-inline-list',
  'gallery-inline-wizard',
  'gallery-carousel-horizontal',
  'gallery-carousel-stacked',
  'gallery-no-carousel',
  'configurator-setup',
];

const testInputs = Object.fromEntries(
  testPages.map((name) => [name, path.resolve(__dirname, `tests/${name}.html`)])
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'ov25-ui': path.resolve(__dirname, '../../dist'),
      'ov25-setup': path.resolve(__dirname, '../../setup'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        'mobile-preview': path.resolve(__dirname, 'mobile-preview.html'),
        ...testInputs,
      },
    },
  },
  server: {
    port: 3008,
  },
});
