import { describe, expect, it } from 'vitest';
import { resolveStringReplacement } from '../../src/lib/strings/resolve-string-replacement';
import { STRING_REPLACEMENT_DEFINITIONS } from '../../src/lib/strings/string-keys';

const optionHeader = () => {
  const def = STRING_REPLACEMENT_DEFINITIONS.find((d) => d.key === 'optionHeader');
  if (!def) throw new Error('optionHeader definition missing');
  return def;
};

describe('optionHeader SELECTED_VARIANT_NAME', () => {
  it('exposes the token so the setup editor offers it', () => {
    const names = optionHeader().interpolationValues.map((iv) => iv.name);
    expect(names).toContain('OPTION_NAME');
    expect(names).toContain('SELECTED_VARIANT_NAME');
  });

  it('keeps ${OPTION_NAME} as the default template so existing configs are unchanged', () => {
    expect(optionHeader().defaultTemplate).toBe('${OPTION_NAME}');
  });

  it('interpolates the selected variant alongside the option name', () => {
    const result = resolveStringReplacement({
      fallback: 'Fabrics',
      rules: [{ template: '${OPTION_NAME} | ${SELECTED_VARIANT_NAME}' }],
      vars: { OPTION_NAME: 'Fabrics', SELECTED_VARIANT_NAME: 'Zelda Oyster' },
    });
    expect(result).toBe('Fabrics | Zelda Oyster');
  });

  // Nothing is selected on first paint, and the interpolator turns an absent
  // var into ''. A template with a separator therefore renders a dangling
  // "Fabrics | " until the selection resolves — documented, not a bug.
  it('renders an empty string for the token before a selection resolves', () => {
    const result = resolveStringReplacement({
      fallback: 'Fabrics',
      rules: [{ template: '${OPTION_NAME} | ${SELECTED_VARIANT_NAME}' }],
      vars: { OPTION_NAME: 'Fabrics', SELECTED_VARIANT_NAME: '' },
    });
    expect(result).toBe('Fabrics | ');
  });

  it('can drive a trigger rule, so one option can be styled differently', () => {
    const rules = [
      { template: '${OPTION_NAME}' },
      { trigger: { name: 'SELECTED_VARIANT_NAME', value: 'none' }, template: 'Choose a ${OPTION_NAME}' },
    ];
    expect(
      resolveStringReplacement({ fallback: 'x', rules, vars: { OPTION_NAME: 'Legs', SELECTED_VARIANT_NAME: 'None' } })
    ).toBe('Choose a Legs');
    expect(
      resolveStringReplacement({ fallback: 'x', rules, vars: { OPTION_NAME: 'Legs', SELECTED_VARIANT_NAME: 'Oak' } })
    ).toBe('Legs');
  });
});
