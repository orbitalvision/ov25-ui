import { describe, expect, it } from 'vitest';
import {
  getSwatchMetadataRows,
} from '../../src/components/VariantSelectMenu/SwatchMetadata';
import type { Swatch } from '../../src/contexts/ov25-ui-context';

const getString = (_key: string, _values?: Record<string, string | number | null | undefined>, fallback?: string) => fallback ?? '';

const swatch: Swatch = {
  manufacturerId: 7,
  name: 'Dove',
  option: 'Fabric',
  material: {
    id: 9,
    name: 'Dove Linen',
    type: 'Fabric',
    range: 'Heritage',
    supplier: 'Moorland Mills',
    colors: [],
    palette: [],
    dominantColorHex: null,
    aiTags: [],
    caption: null,
  },
  metadata: {
    composition: '100% linen',
    care: '  Dry clean only  ',
    empty: '   ',
    retired: 'No longer defined',
  },
};

describe('getSwatchMetadataRows', () => {
  it('keeps Range and Supplier plus configured retailer fields in their configured order', () => {
    expect(getSwatchMetadataRows(swatch, [
      { id: 'care', label: 'Care' },
      { id: 'composition', label: 'Composition' },
      { id: 'empty', label: 'Empty' },
      { id: 'missing', label: 'Missing' },
    ], getString)).toEqual([
      { id: 'material-range', label: 'Range', value: 'Heritage' },
      { id: 'material-supplier', label: 'Supplier', value: 'Moorland Mills' },
      { id: 'parameter-care', label: 'Care', value: 'Dry clean only' },
      { id: 'parameter-composition', label: 'Composition', value: '100% linen' },
    ]);
  });

  it('does not expose undefined parameters or empty material fields', () => {
    expect(getSwatchMetadataRows({
      ...swatch,
      material: null,
      metadata: { retired: 'No longer defined' },
    }, [{ id: 'current', label: 'Current' }], getString)).toEqual([]);
  });
});
