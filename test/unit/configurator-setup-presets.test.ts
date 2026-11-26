import { describe, expect, it } from 'vitest';
import { DEFAULT_TYPE_SETTINGS, type PreviewLayoutType } from '../../setup/src/components/ConfiguratorSetup/types';
import { PRESET_BASELINE } from '../../setup/src/components/ConfiguratorSetup/preset-baseline';
import { SETUP_PRESETS, getPresetSettings, applySetupPreset } from '../../setup/src/components/ConfiguratorSetup/presets';
import { LEGACY_SETUP_FEATURES, requiredSetupFeatures, unsupportedSetupFeatures } from '../../setup/src/components/ConfiguratorSetup/compatibility';
import { buildConfiguratorSetupPayload } from '../../setup/src/components/ConfiguratorSetup/serialize-config';
import { buildFormStateFromInitialPayload } from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';
import { extractThemeButtonAnimations, mergeThemeButtonAnimationCss, type ThemeButtonAnimation } from '../../setup/src/components/ConfiguratorSetup/button-animations';

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

  it('keeps matched button effects across presets and imports while retaining the existing manual CSS reset policy', () => {
    const current = getPresetSettings('standard', 'in-page');
    const animations: ThemeButtonAnimation[] = [{ target: 'secondary', effect: 'underline', durationMs: 250, easing: 'ease', direction: 'right', source: 'assets/theme.css' }];
    current.branding.cssString = mergeThemeButtonAnimationCss('.old-layout { width: 300px; }', animations);
    const payload = buildConfiguratorSetupPayload({ layout: 'standard', typeSettings: { ...PRESET_BASELINE, standard: current } });
    const imported = buildFormStateFromInitialPayload(payload).typeSettings.standard;
    const changed = applySetupPreset('standard', 'guided', imported);
    expect(extractThemeButtonAnimations(changed.branding.cssString)).toEqual(animations);
    expect(changed.branding.cssString).not.toContain('.old-layout');
    expect(applySetupPreset('standard', 'in-page', changed).branding.cssString).toBe(changed.branding.cssString);
  });
  it('bed: has no configure button unless one was saved', () => {
    expect(DEFAULT_TYPE_SETTINGS.bedConfigurator.selectors).toEqual(DEFAULT_TYPE_SETTINGS.standard.selectors);
    for (const preset of SETUP_PRESETS) expect(getPresetSettings('bedConfigurator', preset.id).selectors.configureButton.enabled).toBe(false);
    const fresh = buildConfiguratorSetupPayload({ layout: 'bedConfigurator', typeSettings: { ...PRESET_BASELINE } });
    expect((fresh.bedConfigurator.selectors as Record<string, unknown>).configureButton).toBeUndefined();
    // A store that really has the old button saved it explicitly, and gets it back.
    const saved = { ...fresh, bedConfigurator: { ...fresh.bedConfigurator, selectors: { ...fresh.bedConfigurator.selectors, configureButton: '#ov25-fullscreen-button' } } };
    expect(buildFormStateFromInitialPayload(saved).typeSettings.bedConfigurator.selectors.configureButton).toEqual({ enabled: true, selector: '#ov25-fullscreen-button', replace: false });
  });

  it('bed: In-page presents like Standard In-page and keeps its saved placements', () => {
    const bed = getPresetSettings('bedConfigurator', 'in-page');
    const standard = getPresetSettings('standard', 'in-page');
    expect(bed.configurator).toEqual(standard.configurator);
    expect(bed.carousel).toEqual(standard.carousel);
    const saved = getPresetSettings('bedConfigurator', 'classic');
    saved.selectors.gallery.selector = '#saved-gallery';
    const inPage = applySetupPreset('bedConfigurator', 'in-page', saved);
    expect(inPage.configurator.displayModeDesktop).toBe('inline-sticky');
    expect(inPage.configurator.variantDisplayMobile).toBe('list');
    expect(inPage.selectors).toEqual(saved.selectors);
  });

  it('snap2: switching presets on saved settings moves it between the gallery slot and the button, keeping selectors', () => {
    const inline = applySetupPreset('snap2', 'in-page', { ...DEFAULT_TYPE_SETTINGS.snap2, selectors: {
      ...DEFAULT_TYPE_SETTINGS.snap2.selectors,
      gallery: { enabled: true, selector: '.saved-gallery', replace: true },
      configureButton: { enabled: false, selector: '.saved-button', replace: false },
    } });
    expect(inline.selectors.gallery).toEqual({ enabled: true, selector: '.saved-gallery', replace: true });
    const dialog = applySetupPreset('snap2', 'classic', inline);
    expect(dialog.configurator.displayModeDesktop).toBe('modal');
    expect(dialog.selectors.gallery).toEqual({ enabled: false, selector: '.saved-gallery', replace: true });
    expect(dialog.selectors.configureButton).toEqual({ enabled: true, selector: '.saved-button', replace: false });
    expect(applySetupPreset('snap2', 'in-page', dialog).selectors.gallery.enabled).toBe(true);
    // Other types keep every saved placement as it was.
    const standard = { ...DEFAULT_TYPE_SETTINGS.standard, selectors: { ...DEFAULT_TYPE_SETTINGS.standard.selectors, gallery: { enabled: false, selector: '.x', replace: true } } };
    expect(applySetupPreset('standard', 'classic', standard).selectors).toEqual(standard.selectors);
  });
  it('keeps the product in view for Standard\u2019s Guided preset, and leaves Bed and Snap2 opening a modal', () => {
    const standard = getPresetSettings('standard', 'guided').configurator;
    expect([standard.displayModeDesktop, standard.displayModeMobile]).toEqual(['inline-sticky', 'inline-sticky']);
    expect([standard.variantDisplayDesktop, standard.variantDisplayMobile]).toEqual(['wizard', 'wizard']);
    expect(getPresetSettings('bedConfigurator', 'guided').configurator.displayModeDesktop).toBe('modal');
    expect(getPresetSettings('snap2', 'guided').configurator.displayModeDesktop).toBe('modal');
  });
});
