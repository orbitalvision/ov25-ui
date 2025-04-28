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
  server: {
    port: 3000,
  },
}); 