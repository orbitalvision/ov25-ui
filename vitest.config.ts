/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

// This config is used for unit tests
export default defineConfig({
    test: {
        include: ['test/unit/**/*.test.ts', 'test/unit/**/*.test.tsx'],
        environment: 'jsdom',
        globals: true, // simplified usage
        setupFiles: ['./test/unit/setup.ts'],
    },
});
