# Release Test Summary: 0.8.2

Status: passed
Started: 2026-08-14T09:37:39.071Z
Finished: 2026-08-14T09:39:48.688Z
Runtime source commit: `16f12b381d0924477f2d7504121c15cd2196c160`
Reviewed head: `dcb55e5e7ff5cfa91610140e6f9cc026fd85d70c`

The release suite ran against the final runtime working tree immediately before it was committed as
`16f12b3`. Subsequent commits change release automation/tests, the runbook, and review artifacts;
they do not change package runtime or Configurator Setup source.

No package metadata was intentionally changed by this test step.

## Release Test Steps

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
- PASSED: Wait for E2E preview server
  - command: `bun run wait-on http://localhost:3008 --timeout 30000`
- PASSED: Playwright E2E tests
  - command: `bun run test:e2e`
  - result: 69 total; 67 passed; 0 failed; 0 flaky; 2 skipped

## Additional Preflight Evidence

- PASSED, user-reported: the runbook's isolated `npm run build:react18` publish build after the final
  runtime fixes. This manual preflight is outside `release:test`; no standalone machine log is
  attached to this summary. Later commits do not modify runtime source.
- PASSED: type-check and the complete 281-test unit suite after the release-deploy changes.
- PASSED: real temporary Setup lock regeneration against `ov25-ui@0.8.1`; the generated
  `setup/package.json`, `setup/package-lock.json`, and `setup/bun.lock` matched the committed files
  byte-for-byte.
- PASSED: `git diff --check ov25-ui@0.8.1..HEAD` and current working-tree diff check.

## Accepted Coverage Exception

The two skipped Playwright cases are the bed shared-detail integration and bed selection-only
fallback screenshot. The release owner accepted this as a documented coverage exception; it is not
recorded as manual-validation evidence.
