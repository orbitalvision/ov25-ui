import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Alias to use the source files directly instead of the compiled package
      'ov25-ui': path.resolve(__dirname, '../../dist'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        'single-no-variants': path.resolve(__dirname, 'single-no-variants.html'),
        'single-no-pricing': path.resolve(__dirname, 'single-no-pricing.html'),
        'single-no-groups': path.resolve(__dirname, 'single-no-groups.html'),
        'single-with-groups': path.resolve(__dirname, 'single-with-groups.html'),
        'range-no-groups': path.resolve(__dirname, 'range-no-groups.html'),
        'range-with-groups': path.resolve(__dirname, 'range-with-groups.html'),
        'snap2': path.resolve(__dirname, 'snap2.html'),
        'snap2-uuid': path.resolve(__dirname, 'snap2-uuid.html'),
      },
    },
  },
  server: {
    port: 3008,
  },
}); 