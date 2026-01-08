import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import react from '@vitejs/plugin-react'

// This config is used for browser tests (tests run in a real browser environment, for "unit-like" tests, but not for full end-to-end (e2e) tests)
// This config always runs headless. Use test:browser for interactive mode (which uses a different approach)
const isHeadless = process.env.CI === 'true' || !process.env.VITEST_UI;

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['test/browser/**/*.test.ts', 'test/browser/**/*.test.tsx'],
    browser: {
      enabled: true,
      provider: playwright({
        launchOptions: {
          headless: isHeadless !== false, // Default to headless unless explicitly disabled
        },
      }),
      // https://vitest.dev/config/browser/playwright
      instances: [
        {
          browser: 'chromium',
          headless: isHeadless !== false,
        },
      ],
    },
  },
})
