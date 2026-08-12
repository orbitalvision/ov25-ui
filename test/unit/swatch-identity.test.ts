import { describe, expect, it } from 'vitest';
import { swatchesMatch, type Swatch } from '../../src/contexts/ov25-ui-context.js';

function swatch(group?: string | null): Swatch {
  return {
    manufacturerId: 42,
    name: 'Natural Linen',
    option: 'Fabric',
    group,
  };
}

describe('swatchesMatch', () => {
  it('includes group in the current identity tuple', () => {
    expect(swatchesMatch(swatch('A'), swatch('A'))).toBe(true);
    expect(swatchesMatch(swatch('A'), swatch('B'))).toBe(false);
  });

  it('matches legacy stored entries that have no group', () => {
    expect(swatchesMatch(swatch(undefined), swatch('A'))).toBe(true);
    expect(swatchesMatch(swatch('A'), swatch(null))).toBe(true);
  });

  it('normalizes numeric and legacy string manufacturer ids', () => {
    expect(swatchesMatch(swatch('A'), { ...swatch('A'), manufacturerId: '42' })).toBe(true);
  });
});
