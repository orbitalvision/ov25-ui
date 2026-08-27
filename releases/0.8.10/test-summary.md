# Release Test Summary: 0.8.10

Status: accepted with documented Playwright exception
Started: 2026-08-27T09:08:18.626Z
Finished: 2026-08-27T09:11:26.338Z

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
- ACCEPTED WITH EXCEPTION: Playwright e2e tests
  - command: `bun run test:e2e`
  - Full-suite runs completed with 107 passed, 2 skipped, and 1 failed test.
  - Network-dependent failures were inconsistent between runs and passed when rerun individually.
  - The remaining new-headless visual failure was a 4px checkout-wrapper width difference (expected 444px, received 448px); the checkout behavior assertions passed before the screenshot comparison.
  - The user reviewed and accepted these E2E exceptions for this release.
