import { describe, expect, it } from 'vitest';
import { getPresetSettings, applySetupPreset } from '../../setup/src/components/ConfiguratorSetup/presets';
import { LEGACY_SETUP_FEATURES, unsupportedSetupFeatures } from '../../setup/src/components/ConfiguratorSetup/compatibility';
import { applyThemeStyleProposal, compatibleThemeStyleProposal, ensureOverlayThemeContrast, validateThemeStyleProposal, THEME_STYLE_FEATURE, THEME_FONTS_FEATURE, type ThemeStyleProposal } from '../../setup/src/components/ConfiguratorSetup/theme-style';
import { buildConfiguratorSetupPayload } from '../../setup/src/components/ConfiguratorSetup/serialize-config';
import { buildFormStateFromInitialPayload } from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';
import { PRESET_BASELINE } from '../../setup/src/components/ConfiguratorSetup/preset-baseline';
import { extractThemeButtonAnimations, type ThemeButtonAnimation } from '../../setup/src/components/ConfiguratorSetup/button-animations';

const proposal: ThemeStyleProposal = {
  schemaVersion: 1, method: 'source', generatedAt: '2026-10-01T12:00:00Z',
  source: { id: 'test-theme', label: 'Test theme', kind: 'local-theme', fingerprint: 'abc', files: ['config/settings_data.json'] },
  summary: 'Warm neutrals with a dark action button.',
  style: { '--ov25-background-color': '#fffaf0', '--ov25-cta-color': '#302e25', '--ov25-selected-background-color': '#eeeadd', '--ov25-360-font-family': "'Client Sans', sans-serif" },
  fonts: [{ family: 'Client Sans', url: 'https://cdn.example.com/font.woff2', weight: '400' }],
  palette: [{ role: 'Background', color: '#fffaf0', source: 'settings_data.json' }], warnings: [],
};

/** The style variables one real theme match returned, with neutral values: the widest proposal seen so far. */
const FULL_STYLE: Record<string, string> = {
  '--ov25-background-color': '#ffffff', '--ov25-secondary-background-color': '#f3f3f3', '--ov25-text-color': '#111111',
  '--ov25-secondary-text-color': '#707070', '--ov25-border-color': '#111111', '--ov25-border-color-secondary': '#cccccc',
  '--ov25-highlight-color': '#3366cc', '--ov25-hover-color': '#808080', '--ov25-primary-color': '#111111',
  '--ov25-button-text-color': '#3366cc', '--ov25-button-border-color': '#111111', '--ov25-button-hover-background-color': '#3366cc',
  '--ov25-button-hover-text-color': '#ffffff', '--ov25-button-border-width': '1px', '--ov25-button-border-radius': '0px',
  '--ov25-cta-color': '#111111', '--ov25-cta-text-color': '#ffffff', '--ov25-cta-color-hover': '#808080',
  '--ov25-cta-text-color-hover': '#ffffff', '--ov25-cta-color-light': '#333333', '--ov25-cta-text-color-disabled': '#808080',
  '--ov25-cta-border-color': '#111111', '--ov25-cta-border-width': '0px', '--ov25-cta-border-radius': '0px',
  '--ov25-selected-background-color': '#3366cc', '--ov25-selected-text-color': '#ffffff', '--ov25-selected-border-color': '#3366cc',
  '--ov25-input-background-color': '#ffffff', '--ov25-input-text-color': '#111111', '--ov25-input-border-color': '#111111',
  '--ov25-input-placeholder-color': '#707070', '--ov25-focus-ring-color': '#111111', '--ov25-overlay-button-color': '#111111',
  '--ov25-overlay-button-hover-color': '#3366cc', '--ov25-configurator-view-controls-text-color': '#ffffff',
  '--ov25-configurator-view-controls-border-color': '#111111', '--ov25-configurator-iframe-background-color': '#ffffff',
  '--ov25-configurator-title-text-color': '#111111', '--ov25-configurator-price-text-color': '#111111',
  '--ov25-compare-price-text-color': '#707070', '--ov25-link-color': '#111111', '--ov25-backdrop-color': '#000000',
  '--ov25-backdrop-opacity': '0.5', '--ov25-360-font-family': 'sans-serif', '--ov25-heading-font-family': 'sans-serif',
  '--ov25-button-font-family': 'sans-serif', '--ov25-body-font-weight': '400', '--ov25-heading-font-weight': '400',
  '--ov25-button-font-weight': '700', '--ov25-button-letter-spacing': '0.05em', '--ov25-button-text-transform': 'uppercase',
  '--ov25-configurator-qr-code-popup-background-color': '#ffffff', '--ov25-configurator-qr-code-popup-border-color': '#111111',
  '--ov25-configurator-qr-code-popup-title-text-color': '#111111', '--ov25-configurator-qr-code-popup-description-text-color': '#111111',
  '--ov25-destructive': '#ff0000', '--ov25-configurator-iframe-border-radius': '0px',
  '--ov25-configurator-view-controls-border-radius': '0px', '--ov25-variant-thumb-border-radius': '0px',
};

describe('theme styling contract', () => {
  it('fixes a partial palette when its fill matches the existing overlay icon', () => {
    const existing = { '--ov25-configurator-view-controls-text-color': '#333333' };
    const raw = { ...proposal, style: { '--ov25-overlay-button-color': '#333333' } };
    const adjusted = ensureOverlayThemeContrast(raw, existing);
    expect(adjusted.style['--ov25-overlay-button-color']).toBe('#333333');
    expect(adjusted.style['--ov25-configurator-view-controls-text-color']).toBe('#ffffff');
    expect(adjusted.warnings.join(' ')).toContain('Overlay icon or hover fill adjusted');
    expect(raw.style).not.toHaveProperty('--ov25-configurator-view-controls-text-color');
    const settings = getPresetSettings('standard', 'in-page');
    settings.style = existing;
    expect(applyThemeStyleProposal(settings, raw).style['--ov25-configurator-view-controls-text-color']).toBe('#ffffff');
  });

  it('keeps valid overlay colours and repairs a conflicting suggested hover without adding unsupported tokens', () => {
    const good = { ...proposal, style: { '--ov25-overlay-button-color': '#ffffff', '--ov25-configurator-view-controls-text-color': '#111111' } };
    expect(ensureOverlayThemeContrast(good, {})).toBe(good);
    const badHover = { ...good, style: { ...good.style, '--ov25-overlay-button-hover-color': '#000000' } };
    const adjusted = ensureOverlayThemeContrast(badHover, {});
    expect(adjusted.style['--ov25-overlay-button-hover-color']).toBe('#ffffff');
    const oldPlugin = compatibleThemeStyleProposal(badHover);
    expect(ensureOverlayThemeContrast(oldPlugin, {}).style).not.toHaveProperty('--ov25-overlay-button-hover-color');
  });
  it('accepts the full backend source budget but still rejects excessive provenance', () => {
    const files = Array.from({ length: 64 }, (_, index) => `assets/theme-${index}.css`);
    expect(validateThemeStyleProposal({ ...proposal, source: { ...proposal.source, files } }).source.files).toEqual(files);
    expect(() => validateThemeStyleProposal({ ...proposal, source: { ...proposal.source, files: [...files, 'assets/overflow.css'] } })).toThrow('invalid palette');
  });

  it.each(['source', 'ai'] as const)('accepts a full-size %s proposal read from more than 24 theme files', method => {
    const files = Array.from({ length: 34 }, (_, index) => `assets/section-${index}.css`);
    const full: ThemeStyleProposal = {
      ...proposal, method, style: FULL_STYLE, fonts: [], source: { ...proposal.source, files },
      warnings: ['Theme fonts were not downloaded.'],
      animations: [{ target: 'cta', effect: 'fade', durationMs: 450, easing: 'ease', source: files[0] }],
    };
    const validated = validateThemeStyleProposal(full);
    expect(validated.source).toEqual(full.source);
    expect(validated.style).toEqual(FULL_STYLE);
    expect(validated.animations).toEqual(full.animations);
  });

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

  it('accepts authenticated Shopify theme proposals and rejects other source kinds', () => {
    const shopify = { ...proposal, source: { ...proposal.source, kind: 'shopify-theme' as const } };
    expect(validateThemeStyleProposal(shopify)).toEqual(shopify);
    expect(() => validateThemeStyleProposal({ ...proposal, source: { ...proposal.source, kind: 'website' as 'local-theme' } })).toThrow();
  });

  it('validates animation attribution and stores only generated CSS while preserving merchant rules', () => {
    const animations: ThemeButtonAnimation[] = [{ target: 'cta', effect: 'fade', durationMs: 200, easing: 'ease-in-out', source: proposal.source.files[0] }];
    expect(validateThemeStyleProposal({ ...proposal, animations }).animations).toEqual(animations);
    expect(() => validateThemeStyleProposal({ ...proposal, animations: [{ ...animations[0], source: 'assets/unread.css' }] })).toThrow();
    const settings = getPresetSettings('standard', 'in-page');
    settings.branding.cssString = '.merchant { padding: 2px; }';
    const applied = applyThemeStyleProposal(settings, { ...proposal, animations });
    expect(applied.branding.cssString).toContain(settings.branding.cssString);
    expect(extractThemeButtonAnimations(applied.branding.cssString)).toEqual(animations);
    expect(applied.branding).not.toHaveProperty('animations');
    expect(applyThemeStyleProposal(applied, proposal).branding.cssString).toBe(applied.branding.cssString);
    expect(extractThemeButtonAnimations(applyThemeStyleProposal(applied, { ...proposal, animations: [] }).branding.cssString)).toEqual([]);
    const legacy = compatibleThemeStyleProposal({ ...proposal, animations });
    expect(legacy.animations).toEqual(animations);
    const payload = buildConfiguratorSetupPayload({ layout: 'standard', typeSettings: { ...PRESET_BASELINE, standard: applied } });
    expect(JSON.stringify(payload)).not.toContain('"animations":');
    const imported = buildFormStateFromInitialPayload(payload).typeSettings.standard;
    expect(extractThemeButtonAnimations(imported.branding.cssString)).toEqual(animations);
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
