import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ELEMENT_SELECTORS,
  STYLE_GROUPS,
  generateVariableCSS,
} from '../../setup/src/lib/config/configurator-style-variables';

const readProjectFile = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

describe('variants per row', () => {
  it('exposes a unitless 1–6 slider in Product Variants & Collections', () => {
    const variantsGroup = STYLE_GROUPS.find(({ id }) => id === 'variants');
    const control = variantsGroup?.variables.find(
      ({ variable }) => variable === '--ov25-variants-per-row',
    );

    expect(control).toEqual({
      variable: '--ov25-variants-per-row',
      label: 'Variants per row',
      defaultValue: '4',
      control: 'slider',
      sliderMin: 1,
      sliderMax: 6,
      sliderStep: 1,
      sliderUnit: '',
      sliderLabels: ['Fewer', 'More'],
    });
    expect(generateVariableCSS({ '--ov25-variants-per-row': '3' })).toContain(
      '--ov25-variants-per-row: 3;',
    );
  });

  it('keeps the existing four-column default and fluid grid tracks', () => {
    const css = readProjectFile('globals.css');

    expect(css).toContain('--ov25-variants-per-row: 4;');
    expect(css).toContain(
      'grid-template-columns: repeat(var(--ov25-variants-per-row), minmax(0, 1fr)) !important;',
    );
    expect(css).toContain(
      'width: min(100%, calc(16rem / var(--ov25-variants-per-row) + 0.5rem));',
    );
    expect(css).toContain('.ov25-variant-image-container.ov25-variant-image-container');
    expect(css).toContain('aspect-ratio: 1;');
  });

  it('uses the shared grid hook in every variant display-mode renderer', () => {
    const displayModeRendererSources = [
      readProjectFile('src/components/VariantSelectMenu/WizardVariants.tsx'),
      readProjectFile('src/components/VariantSelectMenu/ProductVariantsWrapper.tsx'),
      readProjectFile('src/components/VariantSelectMenu/GroupedVariantsList.tsx'),
      readProjectFile('src/components/VariantSelectMenu/DesktopVariants.tsx'),
      readProjectFile('src/components/VariantSelectMenu/MobileVariants.tsx'),
    ];

    for (const source of displayModeRendererSources) {
      expect(source).toContain('ov25-variant-card-grid');
    }
  });

  it('exposes the grid as a stable custom-CSS target', () => {
    expect(ELEMENT_SELECTORS).toContainEqual({
      selector: '.ov25-variant-card-grid',
      label: 'Variant card grid',
      element: 'div',
    });
  });
});
