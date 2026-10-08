import { describe, expect, it, vi } from 'vitest';
import { normalizeBrandingFonts, loadBrandingFonts, brandingFontAliases, prepareBrandingFontCSS } from '../../src/utils/branding-fonts';
import { normalizeInjectConfig } from '../../src/types/inject-config';
import { buildThemeStyleRules } from '../../src/utils/theme-style-rules';
import { DEFAULT_FORM_STATE } from '../../setup/src/components/ConfiguratorSetup/types';
import { buildConfiguratorSetupPayload } from '../../setup/src/components/ConfiguratorSetup/serialize-config';
import { buildFormStateFromInitialPayload } from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';

const font = { family: 'Theme Serif', url: 'https://cdn.example.com/serif.woff2', weight: '400' };

describe('theme fonts', () => {
  it('accepts observed HTTPS and loopback font sources but refuses unsafe URLs and descriptors', () => {
    expect(normalizeBrandingFonts([font, {...font, url: 'http://localhost:3000/font.woff2'}])).toHaveLength(2);
    for (const url of ['data:font/woff;base64,a', 'javascript:alert(1)', 'http://example.com/font.woff2', 'https://user:secret@example.com/font.woff2', '//example.com/font.woff2']) {
      expect(normalizeBrandingFonts([{...font, url}])).toEqual([]);
    }
    expect(normalizeBrandingFonts([{...font, weight: '400);color:red'}, {...font, family: "Font'; background: red"}])).toEqual([]);
  });

  it('aliases a family by its complete source set and only rewrites structured font variables', () => {
    const alias = brandingFontAliases([font]).get('theme serif');
    const css = ":host { --ov25-360-font-family: 'Theme Serif', serif; --ov25-heading-font-family: 'Theme Serif', serif; } button {font-family: 'Theme Serif';}";
    const prepared = prepareBrandingFontCSS(css, [font]);
    expect(prepared).toContain(`'${alias}', 'Theme Serif', serif`);
    expect(prepared).toContain("button {font-family: 'Theme Serif';}");
    expect(brandingFontAliases([{...font, url: 'https://different.example.com/font.woff2'}]).get('theme serif')).not.toBe(alias);
    expect(prepareBrandingFontCSS(prepared, [font])).toBe(prepared);
  });

  it('loads once per document, uses isolated families, and tolerates failed requests', async () => {
    const load = vi.fn().mockResolvedValue(undefined);
    const add = vi.fn();
    const Font = vi.fn(function(this: {load: () => Promise<void>}, _family: string) {this.load = load;});
    const doc = {fonts: {add}, defaultView: {FontFace: Font}} as unknown as Document;
    await Promise.all([loadBrandingFonts([font], doc), loadBrandingFonts([font], doc)]);
    expect(load).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledTimes(1);
    expect(Font.mock.calls[0][0]).toMatch(/^OV25Theme_/);
    await loadBrandingFonts([font], {...doc, fonts: {add: vi.fn()}} as unknown as Document);
    expect(load).toHaveBeenCalledTimes(2);
    load.mockRejectedValueOnce(new Error('CORS'));
    await expect(loadBrandingFonts([{...font, url:'https://cdn.example.com/missing.woff2'}], doc)).resolves.toBeUndefined();
    expect(add).toHaveBeenCalledTimes(1);
  });

  it('round trips fonts and style values through setup without converting them to custom CSS', () => {
    const state = structuredClone(DEFAULT_FORM_STATE);
    state.typeSettings.standard.branding.fonts = [font];
    state.typeSettings.standard.style['--ov25-heading-font-family'] = "'Theme Serif', serif";
    const payload = buildConfiguratorSetupPayload(state);
    const restored = buildFormStateFromInitialPayload(payload);
    expect(restored.typeSettings.standard.branding.fonts).toEqual([font]);
    expect(restored.typeSettings.standard.branding.cssString).toBe('');
    expect(restored.typeSettings.standard.style).toEqual(state.typeSettings.standard.style);
    expect(buildConfiguratorSetupPayload(restored)).toEqual(payload);
    const normalized = normalizeInjectConfig({...payload.standard, apiKey:'test', productLink:'product/test', callbacks:{addToBasket:vi.fn(), buyNow:vi.fn(), buySwatches:vi.fn()}} as any);
    expect(normalized.fonts).toEqual([font]);
    expect(normalized.cssString).toContain('OV25Theme_');
    expect(buildConfiguratorSetupPayload(DEFAULT_FORM_STATE).standard.branding?.fonts).toBeUndefined();
  });
});

describe('optional runtime styling', () => {
  it('keeps legacy CSS unchanged and activates only supplied structured controls', () => {
    expect(buildThemeStyleRules(':host {--ov25-background-color: #ffffff; --ov25-cta-color-light: #4ade80;}')).toBe('');
    expect(buildThemeStyleRules('/* :host {--ov25-backdrop-color: red;} */')).toBe('');
    const rules = buildThemeStyleRules(':host {--ov25-selected-text-color: #ffffff; --ov25-backdrop-opacity: 0;}');
    expect(rules).toContain('color: var(--ov25-selected-text-color)');
    expect(rules).toContain('var(--ov25-backdrop-opacity, 0.5)');
    expect(rules).not.toContain('font-family:');
    expect(rules).not.toContain('--ov25-selected-background-color');
  });
});
