import { describe, expect, it } from 'vitest';
import { DEFAULT_FORM_STATE, DEFAULT_TYPE_SETTINGS } from '../../setup/src/components/ConfiguratorSetup/types';
import { buildConfiguratorSetupPayload, buildSerializableConfig } from '../../setup/src/components/ConfiguratorSetup/serialize-config';
import { buildFormStateFromInitialPayload } from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';
import { effectiveSelectors, hasThemeSelectorOverrides, normalizeThemeId, promoteThemeSelectors, pruneThemeSelectors,
  pruneThemeSelectorsInPayload, setThemeSelectorOverride } from '../../setup/src/components/ConfiguratorSetup/theme-selector-overrides';

const DRAFT = 'gid://shopify/OnlineStoreTheme/192503709994';
const base = { ...DEFAULT_TYPE_SETTINGS.standard, selectors: { ...DEFAULT_TYPE_SETTINGS.standard.selectors,
  gallery: { enabled: true, selector: '.product__media-wrapper', replace: true } } };
const withDraft = setThemeSelectorOverride(base, DRAFT, 'gallery', { enabled: true, selector: '.product-information__media', replace: true });

describe('per-theme placement overrides', () => {
  it('normalises Shopify GIDs to the storefront theme id', () => {
    expect(normalizeThemeId(DRAFT)).toBe('192503709994');
    expect(normalizeThemeId('192503709994')).toBe('192503709994');
    expect(normalizeThemeId('not-a-theme')).toBeUndefined();
  });

  it('overrides only the theme it belongs to and leaves the live defaults untouched', () => {
    expect(withDraft.selectors.gallery.selector).toBe('.product__media-wrapper');
    expect(effectiveSelectors(withDraft, DRAFT).gallery.selector).toBe('.product-information__media');
    expect(effectiveSelectors(withDraft, '111').gallery.selector).toBe('.product__media-wrapper');
    expect(effectiveSelectors(withDraft, DRAFT).price).toEqual(base.selectors.price);
  });

  it('drops an override that matches the default, and resets cleanly', () => {
    expect(setThemeSelectorOverride(withDraft, DRAFT, 'gallery', base.selectors.gallery).themeSelectors).toBeUndefined();
    expect(setThemeSelectorOverride(withDraft, DRAFT, 'gallery', undefined).themeSelectors).toBeUndefined();
  });

  it('promotes a published theme to the default so older plugins get its selectors', () => {
    const promoted = promoteThemeSelectors(withDraft, DRAFT);
    expect(promoted.selectors.gallery.selector).toBe('.product-information__media');
    expect(hasThemeSelectorOverrides(promoted, DRAFT)).toBe(false);
  });

  it('prunes deleted themes', () => {
    expect(pruneThemeSelectors(withDraft, ['gid://shopify/OnlineStoreTheme/1']).themeSelectors).toBeUndefined();
    expect(pruneThemeSelectors(withDraft, [DRAFT]).themeSelectors).toEqual(withDraft.themeSelectors);
  });

  it('saves overrides beside selectors (never inside) and reloads them', () => {
    const state = { ...DEFAULT_FORM_STATE, typeSettings: { ...DEFAULT_FORM_STATE.typeSettings, standard: withDraft } };
    const payload = buildConfiguratorSetupPayload(state);
    expect(payload.standard.selectors).not.toHaveProperty('themeSelectors');
    expect(payload.standard.themeSelectors).toEqual({ 192503709994: { gallery: { selector: '.product-information__media', replace: true } } });
    // The embedded preview config never carries the saved-only field.
    expect(buildSerializableConfig('standard', withDraft)).not.toHaveProperty('themeSelectors');
    const reloaded = buildFormStateFromInitialPayload(payload).typeSettings.standard;
    expect(effectiveSelectors(reloaded, '192503709994').gallery).toEqual({ enabled: true, selector: '.product-information__media', replace: true });
  });

  it('writes no themeSelectors for setups without overrides (e.g. WooCommerce)', () => {
    expect(buildConfiguratorSetupPayload(DEFAULT_FORM_STATE).standard).not.toHaveProperty('themeSelectors');
  });

  it('prunes deleted themes from the saved payload', () => {
    const state = { ...DEFAULT_FORM_STATE, typeSettings: { ...DEFAULT_FORM_STATE.typeSettings, standard: withDraft } };
    const payload = buildConfiguratorSetupPayload(state);
    expect(pruneThemeSelectorsInPayload(payload, ['1']).standard).not.toHaveProperty('themeSelectors');
    expect(pruneThemeSelectorsInPayload(payload, undefined)).toBe(payload);
  });
});
