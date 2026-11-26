/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

// This config is used for unit tests
export default defineConfig({
    // setup/ has its own node_modules; one React copy keeps Radix hooks working in tests.
    resolve: { dedupe: ['react', 'react-dom'] },
    test: {
        include: ['test/unit/**/*.test.ts', 'test/unit/**/*.test.tsx'],
        environment: 'jsdom',
        globals: true, // simplified usage
        setupFiles: ['./test/unit/setup.ts'],
        // Radix lives in setup/node_modules; inline it so the React dedupe above applies.
        server: { deps: { inline: [/@radix-ui/] } },
    },
});
