# Release Test Summary: 0.8.7

Status: passed
Started: 2026-08-18T12:41:23.818Z
Finished: 2026-08-18T12:43:29.256Z

No package metadata was intentionally changed by this test step.

## Steps

- PASSED: Type check
  - command: `bun run type-check`
- PASSED: Unit tests
  - command: `bun run test:unit`
- PASSED: Browser/component tests
  - command: `bun run test:browser:ci`
- PASSED: Build ov25-ui
  - command: `bun run build`
- PASSED: Install ov25-setup dependencies
  - command: `bun install --frozen-lockfile`
- PASSED: Build ov25-setup
  - command: `bun run build`
- PASSED: Build react-test app
  - command: `bun run build`
- PASSED: Wait for e2e preview server
  - command: `bun run wait-on http://localhost:3008 --timeout 30000`
- PASSED: Playwright e2e tests
  - command: `bun run test:e2e`
