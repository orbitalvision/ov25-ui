import { describe, expect, it } from 'vitest';
import { resolveStringReplacement } from '../../src/lib/strings/resolve-string-replacement';

describe('resolveStringReplacement', () => {
  describe('happy path', () => {
    it('returns fallback when rules are empty', () => {
      const result = resolveStringReplacement({
        fallback: 'Configure',
        rules: [],
      });
      expect(result).toBe('Configure');
    });

    it('applies a catch-all template without interpolation', () => {
      const result = resolveStringReplacement({
        fallback: 'fall-back',
        rules: [{ template: 'catch-all' }],
      });
      expect(result).toBe('catch-all');
    });

    it('applies a catch-all template with interpolation', () => {
      const result = resolveStringReplacement({
        fallback: '',
        rules: [{ template: '${RANGE_NAME} - ${PRODUCT_NAME}' }],
        vars: {
          RANGE_NAME: 'Aughton',
          PRODUCT_NAME: 'Petit',
        },
      });
      expect(result).toBe('Aughton - Petit');
    });

    it('applies trigger rule using trigger.name and trigger.value', () => {
      const result = resolveStringReplacement({
        fallback: 'Default',
        rules: [
          { template: 'Fallback catch-all' },
          {
            trigger: { name: 'OPTION_NAME', value: 'leg' },
            template: 'Leg Type',
          },
        ],
        vars: {
          OPTION_NAME: ' Leg ',
        },
      });
      expect(result).toBe('Leg Type');
    });

    it('uses catch-all only when no trigger rule matches', () => {
      const result = resolveStringReplacement({
        fallback: 'Default',
        rules: [
          {
            trigger: { name: 'OPTION_NAME', value: 'leg' },
            template: 'Leg Type',
          },
          { template: 'Choose your ${OPTION_NAME}' },
        ],
        vars: {
          OPTION_NAME: 'Fabric',
        },
      });
      expect(result).toBe('Choose your Fabric');
    });

    it('two matching trigger rules, first rule gets precedence.', () => {
      const result = resolveStringReplacement({
        fallback: 'Default',
        rules: [
          { trigger: { name: 'OPTION_NAME', value: 'leg' }, template: 'Leg Type' },
          { trigger: { name: 'OPTION_NAME', value: 'leg' }, template: 'Fabric Type' },
        ],
        vars: {
          OPTION_NAME: 'leg',
        },
      });
      expect(result).toBe('Leg Type');
    });

    it('no matching trigger rules, uses catch-all', () => {
      const result = resolveStringReplacement({
        fallback: 'Default',
        rules: [
          { trigger: { name: 'OPTION_NAME', value: 'leg' }, template: 'Leg Type' },
          { trigger: { name: 'OPTION_NAME', value: 'fabric' }, template: 'Fabric Type' },
          { template: 'Catch-all' },
        ],
        vars: {
          OPTION_NAME: 'wood',
        },
      });
      expect(result).toBe('Catch-all');
    });
  });

  describe('edge cases', () => {
    it('no matching trigger rules, no catch-all, returns fallback', () => {
      const result = resolveStringReplacement({
        fallback: 'catch-all',
        rules: [
          { trigger: { name: 'OPTION_NAME', value: 'leg' }, template: 'Leg Type' },
        ],
        vars: {
          OPTION_NAME: 'wood',
        },
      });
      expect(result).toBe('catch-all');
    });

    it('string interpolation with missing variable', () => {
      const result = resolveStringReplacement({
        fallback: 'catch-all',
        rules: [{ template: '${RANGE_NAME} - ${PRODUCT_NAME}' }],
        vars: {
          RANGE_NAME: 'Aughton',
        },
      });
      expect(result).toBe('Aughton - ');
    });

    it('string interpolation with missing variable 2', () => {
      const result = resolveStringReplacement({
        fallback: 'catch-all',
        rules: [{ template: '${RANGE_NAME} - ${PRODUCT_NAME}' }],
        vars: {},
      });
      expect(result).toBe(' - ');
    });

    it('trigger matches value case insensitively', () => {
      const result = resolveStringReplacement({
        fallback: 'catch-all',
        rules: [{ trigger: { name: 'OPTION_NAME', value: 'leg' }, template: 'Leg Type' }],
        vars: {
          OPTION_NAME: 'LEG',
        },
      });
    });

    it('trigger matches trimmed value', () => {
      const result = resolveStringReplacement({
        fallback: 'catch-all',
        rules: [{ trigger: { name: 'OPTION_NAME', value: 'leg' }, template: 'Leg Type' }],
        vars: {
          OPTION_NAME: '    leg    ',
        },
      });
      expect(result).toBe('Leg Type');
    });
  });
});
