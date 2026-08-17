import { describe, expect, it } from 'vitest';
import { computeSelectionDetailsUsesMobileMode } from '../../src/utils/viewport-mobile';

describe('selection-details device mode', () => {
  it.each([
    [true, true, true],
    [true, false, true],
    [false, false, true],
    [false, true, false],
  ])(
    'uses the mobile details surface when isMobile=%s and canHover=%s',
    (isMobile, canHover, expected) => {
      expect(computeSelectionDetailsUsesMobileMode({ isMobile, canHover })).toBe(expected);
    },
  );
});
