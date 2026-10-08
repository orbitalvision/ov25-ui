import { describe, expect, it } from 'vitest';
import { DEFAULT_TYPE_SETTINGS, type PreviewLayoutType } from '../../setup/src/components/ConfiguratorSetup/types';
import { PRESET_BASELINE } from '../../setup/src/components/ConfiguratorSetup/preset-baseline';
import { SETUP_PRESETS, getPresetSettings, applySetupPreset } from '../../setup/src/components/ConfiguratorSetup/presets';
import { LEGACY_SETUP_FEATURES, requiredSetupFeatures, unsupportedSetupFeatures } from '../../setup/src/components/ConfiguratorSetup/compatibility';
import { buildConfiguratorSetupPayload } from '../../setup/src/components/ConfiguratorSetup/serialize-config';
import { buildFormStateFromInitialPayload } from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';

const layouts: PreviewLayoutType[] = ['standard', 'snap2', 'bedConfigurator'];
function leafPaths(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, v]) => v && typeof v === 'object' && Object.keys(v).length ? leafPaths(v, `${prefix}${key}.`) : [`${prefix}${key}`]).sort();
}

describe('setup preset catalogue', () => {
  for (const layout of layouts) {
    it(`${layout}: accounts for every setting without inheriting future defaults`, () => {
      expect(leafPaths(PRESET_BASELINE[layout])).toEqual(leafPaths(DEFAULT_TYPE_SETTINGS[layout]));
    });
    for (const preset of SETUP_PRESETS) {
      it(`${layout}/${preset.id}: has complete baseline-compatible settings and round trips`, () => {
        const settings = getPresetSettings(layout, preset.id);
        if (preset.id === 'classic') {
          expect(settings.configurator.displayModeDesktop).toBe(layout === 'snap2' ? 'modal' : 'sheet');
          expect(settings.configurator.displayModeMobile).toBe('drawer');
        }
        expect(leafPaths(settings)).toEqual(leafPaths(PRESET_BASELINE[layout]));
        expect(unsupportedSetupFeatures(settings)).toEqual([]);
        const state = { layout, typeSettings: { ...PRESET_BASELINE, [layout]: settings } };
        const payload = buildConfiguratorSetupPayload(state);
        expect(buildConfiguratorSetupPayload(buildFormStateFromInitialPayload(payload))).toEqual(payload);
        expect(JSON.stringify(payload)).not.toMatch(/images|apiKey|productLink|setupProgress|presetVersion/);
        settings.flags.hideAr = true;
        expect(getPresetSettings(layout, preset.id).flags.hideAr).toBe(false);
      });
    }
  }

  it('replaces presentation while preserving integration, branding and product rules', () => {
    const current = getPresetSettings('bedConfigurator', 'classic');
    current.selectors.gallery.selector = '#client-gallery';
    current.branding = { cssString: '.custom { color: red; }', hideLogo: true, logoURL: 'client.svg', mobileLogoURL: 'mobile.svg' };
    current.flags.hideAr = true;
    current.bed!.allowNoneBase = false;
    current.configurator.variantHideOptionsCsv = 'Size,123';
    current.style = { '--ov25-color': 'red' };
    current.elementStyles = { '.tile': { color: 'red' } };
    const before = JSON.stringify(current);
    const result = applySetupPreset('bedConfigurator', 'guided', current);
    expect(result.configurator.displayModeDesktop).toBe('modal');
    expect(result.configurator.variantDisplayDesktop).toBe('wizard');
    expect(result.configurator.variantHideOptionsCsv).toBe('Size,123');
    for (const key of ['selectors', 'flags', 'bed', 'stringReplacements'] as const) expect(result[key]).toEqual(current[key]);
    expect(result.branding).toEqual({ ...current.branding, cssString: PRESET_BASELINE.bedConfigurator.branding.cssString });
    expect(result.style).toEqual({});
    expect(result.elementStyles).toEqual({});
    expect(JSON.stringify(current)).toBe(before);
  });

  it('uses the frozen baseline for unconfirmed clients, but respects a known limited build', () => {
    const overview = getPresetSettings('standard', 'overview');
    expect(unsupportedSetupFeatures(overview)).toEqual([]);
    const limited = { buildId: 'old-tested-build', supportedFeatures: LEGACY_SETUP_FEATURES.filter((id) => id !== 'variants:guided-overview') };
    expect(unsupportedSetupFeatures(overview, limited)).toEqual(['variants:guided-overview']);
    expect(unsupportedSetupFeatures(overview, limited, overview)).toEqual([]);
    const future = getPresetSettings('standard', 'classic');
    (future.configurator as { variantDisplayDesktop: string }).variantDisplayDesktop = 'future-mode';
    expect(unsupportedSetupFeatures(future)).toEqual(['variants:future-mode']);
    expect(requiredSetupFeatures(future)).toContain('settings:legacy-2026-09-29');
  });
});
