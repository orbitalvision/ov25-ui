import { describe, expect, it } from 'vitest';
import { getPresetSettings, applySetupPreset } from '../../setup/src/components/ConfiguratorSetup/presets';
import { LEGACY_SETUP_FEATURES, unsupportedSetupFeatures } from '../../setup/src/components/ConfiguratorSetup/compatibility';
import { applyThemeStyleProposal, compatibleThemeStyleProposal, validateThemeStyleProposal, THEME_STYLE_FEATURE, THEME_FONTS_FEATURE, type ThemeStyleProposal } from '../../setup/src/components/ConfiguratorSetup/theme-style';
import { buildConfiguratorSetupPayload } from '../../setup/src/components/ConfiguratorSetup/serialize-config';
import { buildFormStateFromInitialPayload } from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';
import { PRESET_BASELINE } from '../../setup/src/components/ConfiguratorSetup/preset-baseline';

const proposal: ThemeStyleProposal = {
  schemaVersion: 1, method: 'source', generatedAt: '2026-10-01T12:00:00Z',
  source: { id: 'test-theme', label: 'Test theme', kind: 'local-theme', fingerprint: 'abc', files: ['config/settings_data.json'] },
  summary: 'Warm neutrals with a dark action button.',
  style: { '--ov25-background-color': '#fffaf0', '--ov25-cta-color': '#302e25', '--ov25-selected-background-color': '#eeeadd', '--ov25-360-font-family': "'Client Sans', sans-serif" },
  fonts: [{ family: 'Client Sans', url: 'https://cdn.example.com/font.woff2', weight: '400' }],
  palette: [{ role: 'Background', color: '#fffaf0', source: 'settings_data.json' }], warnings: [],
};

describe('theme styling contract', () => {
  it('validates semantic controls and rejects arbitrary CSS, selectors, layout controls and unsafe font URLs', () => {
    expect(validateThemeStyleProposal(proposal)).toEqual(proposal);
    for (const style of [{ customCss: 'body{display:none}' }, { '--ov25-variants-per-row': '6' }, { '--ov25-cta-color': '#000000; color:red' }, { '--ov25-360-font-family': 'url(https://example.com)' }]) {
      expect(() => validateThemeStyleProposal({ ...proposal, style })).toThrow();
    }
    for (const url of ['javascript:alert(1)', 'http://public.example.com/font.woff2', 'file:///tmp/font.woff2', 'https://user:pass@example.com/a']) {
      expect(() => validateThemeStyleProposal({ ...proposal, fonts: [{ family: 'Font', url }] })).toThrow();
    }
    expect(() => validateThemeStyleProposal({ ...proposal, source: { ...proposal.source, label: {} as string } })).toThrow();
  });

  it('keeps useful baseline colours and explicitly omits newer styling and font loading for old clients', () => {
    const legacy = compatibleThemeStyleProposal(proposal);
    expect(legacy.style).toEqual({ '--ov25-background-color': '#fffaf0', '--ov25-cta-color': '#302e25' });
    expect(legacy.fonts).toBeUndefined();
    expect(legacy.warnings).toHaveLength(2);
    const modern = compatibleThemeStyleProposal(proposal, { supportedFeatures: [...LEGACY_SETUP_FEATURES, THEME_STYLE_FEATURE, THEME_FONTS_FEATURE] });
    expect(modern).toEqual(proposal);
  });

  it('applies only tokens/fonts, leaving integration, custom CSS and element styles untouched', () => {
    const settings = getPresetSettings('standard', 'in-page');
    settings.branding.cssString = '.merchant { color: red; }';
    settings.style = { '--ov25-variants-per-row': '3' };
    settings.elementStyles = { '.merchant': { color: '#123456' } };
    const before = structuredClone(settings);
    const result = applyThemeStyleProposal(settings, proposal);
    expect(result.style).toEqual({ ...settings.style, ...proposal.style });
    expect(result.branding.cssString).toBe(before.branding.cssString);
    expect(result.elementStyles).toEqual(before.elementStyles);
    expect(result.selectors).toEqual(before.selectors);
    expect(settings).toEqual(before);
    expect(unsupportedSetupFeatures(result)).toEqual([THEME_STYLE_FEATURE, THEME_FONTS_FEATURE]);
  });

  it('preserves the matched palette and later manual colour edits across presets without retaining layout dimensions', () => {
    const settings = applyThemeStyleProposal(getPresetSettings('standard', 'in-page'), proposal);
    settings.style['--ov25-cta-color'] = '#112233';
    settings.style['--ov25-variants-per-row'] = '3';
    const result = applySetupPreset('standard', 'guided', settings, true);
    expect(result.style['--ov25-cta-color']).toBe('#112233');
    expect(result.style['--ov25-background-color']).toBe('#fffaf0');
    expect(result.style).not.toHaveProperty('--ov25-variants-per-row');
    expect(result.branding.fonts).toEqual(proposal.fonts);
    expect(result.configurator.variantDisplayDesktop).toBe('wizard');
  });

  it('keeps saved semantic styles after import without editor provenance and enables the existing solid outline control', () => {
    const styled = applyThemeStyleProposal(getPresetSettings('standard', 'in-page'), { ...proposal, style: { ...proposal.style, '--ov25-highlight-color': '#302e25' } });
    const payload = buildConfiguratorSetupPayload({ layout: 'standard', typeSettings: { ...PRESET_BASELINE, standard: styled } });
    const imported = buildFormStateFromInitialPayload(payload);
    const changed = applySetupPreset('standard', 'overview', imported.typeSettings.standard);
    expect(changed.style['--ov25-cta-color']).toBe('#302e25');
    expect(changed.style['--ov25-variant-thumb-ring-mode']).toBe('solid');
    expect(changed.branding.fonts).toEqual(styled.branding.fonts);
  });
});
