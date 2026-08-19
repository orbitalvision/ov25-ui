import { expect, test } from '@playwright/test';
import { validateE2EFixtureLedger } from '../../scripts/validate-e2e-fixture-ledger.mjs';

test('safe-to-skip fixture index matches the E2E coverage ledger', () => {
  const result = validateE2EFixtureLedger();
  expect(result.errors).toEqual([]);
});
