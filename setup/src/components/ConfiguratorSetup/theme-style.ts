import { STYLE_GROUPS } from '../../lib/config/configurator-style-variables';
import { OV25_VARIANT_RING_MODE_SOLID, OV25_VARIANT_THUMB_RING_MODE_VAR } from '../../lib/config/variant-selection-style';
import type { ConfiguratorSetupCompatibility } from './compatibility';
import type { PreviewLayoutType, TypeSettings } from './types';
import { validateSelectorDiscoveryProposal, type ConfiguratorSetupSelectorDiscovery, type SelectorDiscoveryProposal } from './selector-discovery';

export interface ThemeStyleFont {
  family: string;
  url: string;
  weight?: string;
  style?: 'normal' | 'italic' | 'oblique';
  unicodeRange?: string;
}

/** Suggestions contain editable tokens, never executable CSS or brand/campaign content. */
export interface ThemeStyleProposal {
  schemaVersion: 1;
  source: { id: string; label: string; kind: 'local-theme'; fingerprint: string; files: string[] };
  summary: string;
  style: Record<string, string>;
  fonts?: ThemeStyleFont[];
  palette: { role: string; color: string; source: string }[];
  warnings: string[];
  generatedAt: string;
  method: 'ai' | 'source';
  /** Independently analysed placement suggestions, reviewed within the colour step. */
  placement?: SelectorDiscoveryProposal;
}

export interface ConfiguratorSetupThemeStyling {
  /** Change when the shop, product or source theme changes; cancels stale suggestions. */
  contextKey: string;
  sourceLabel?: string;
  disabled?: boolean;
  /** Host-confirmed saved-state and scope. Omit to keep placement suggestions inactive. */
  placement?: ConfiguratorSetupSelectorDiscovery;
  onRequest: (request: { activeLayout: PreviewLayoutType; signal: AbortSignal }) => Promise<ThemeStyleProposal>;
}

export const THEME_STYLE_FEATURE = 'styling:theme-v1';
export const THEME_FONTS_FEATURE = 'branding:fonts-v1';
/** These controls were introduced after the frozen September 2026 baseline. */
export const NEW_THEME_STYLE_VARIABLES = new Set([
  '--ov25-selected-background-color', '--ov25-selected-text-color', '--ov25-selected-border-color',
  '--ov25-cta-border-color', '--ov25-cta-border-width', '--ov25-cta-text-color-disabled',
  '--ov25-input-background-color', '--ov25-input-text-color', '--ov25-input-border-color', '--ov25-input-placeholder-color',
  '--ov25-focus-ring-color', '--ov25-overlay-button-hover-color', '--ov25-backdrop-color', '--ov25-backdrop-opacity',
  '--ov25-compare-price-text-color', '--ov25-link-color', '--ov25-heading-font-family', '--ov25-button-font-family',
  '--ov25-body-font-weight', '--ov25-heading-font-weight', '--ov25-button-font-weight',
  '--ov25-button-letter-spacing', '--ov25-button-text-transform',
]);

const extraThemeVariables = new Set([
  '--ov25-button-border-width', '--ov25-cta-border-width', '--ov25-backdrop-opacity',
  '--ov25-body-font-weight', '--ov25-heading-font-weight', '--ov25-button-font-weight',
  '--ov25-button-letter-spacing', '--ov25-button-text-transform',
]);

export function isThemeStyleVariable(key: string): boolean {
  if (key === OV25_VARIANT_THUMB_RING_MODE_VAR) return true;
  return STYLE_GROUPS.some((group) => group.variables.some((entry) => entry.variable === key &&
    (['color', 'corner', 'font'].includes(entry.control) || extraThemeVariables.has(key))));
}

function validStyleValue(key: string, value: string): boolean {
  const definition = STYLE_GROUPS.flatMap((group) => group.variables).find((entry) => entry.variable === key);
  if (!definition || !isThemeStyleVariable(key) || value.length > 200) return false;
  if (definition.control === 'color') return /^#[\da-f]{6}$/i.test(value);
  if (definition.control === 'font') return /^[\w\s,'"-]+$/.test(value) && value.trim().length > 0;
  if (key === '--ov25-button-text-transform') return ['none', 'uppercase', 'lowercase', 'capitalize'].includes(value);
  if (key.endsWith('font-weight')) return /^(?:[1-9]00)$/.test(value);
  if (key === '--ov25-backdrop-opacity') return /^(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(value);
  if (key === '--ov25-button-letter-spacing') return /^-?\d+(?:\.\d+)?(?:px|em)$/.test(value) && Math.abs(parseFloat(value)) <= (value.endsWith('em') ? 1 : 10);
  return /^\d+(?:\.\d+)?(?:px|rem|em)$/.test(value) && parseFloat(value) <= (key.endsWith('border-width') ? 4 : 9999);
}

export function isThemeFontUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return !url.username && !url.password && (url.protocol === 'https:' ||
      (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)));
  } catch { return false; }
}

/** Validate at the package boundary too: hosts and cached proposals can be stale or malformed. */
export function validateThemeStyleProposal(value: ThemeStyleProposal): ThemeStyleProposal {
  const boundedText = (text: unknown, maximum: number) => typeof text === 'string' && text.length > 0 && text.length <= maximum;
  if (!value || value.schemaVersion !== 1 || !value.source || value.source.kind !== 'local-theme' ||
      !['ai', 'source'].includes(value.method) || !boundedText(value.source.id, 100) || !boundedText(value.source.label, 200) ||
      !boundedText(value.source.fingerprint, 128) || !Array.isArray(value.source.files) || value.source.files.length > 24 || value.source.files.some((v) => !boundedText(v, 500)) ||
      !boundedText(value.summary, 1000) || !boundedText(value.generatedAt, 100) || !Number.isFinite(Date.parse(value.generatedAt)) ||
      !value.style || typeof value.style !== 'object' || Array.isArray(value.style) ||
      !Array.isArray(value.palette) || !Array.isArray(value.warnings) || value.warnings.length > 64 || value.warnings.some((v) => !boundedText(v, 1000))) {
    throw new Error('The theme analysis returned an invalid palette. Please try again.');
  }
  const entries = Object.entries(value.style);
  if (!entries.length || entries.length > 100 || entries.some(([key, val]) => typeof val !== 'string' || !validStyleValue(key, val))) {
    throw new Error('The theme analysis included unsupported styling values. Please try again.');
  }
  if (value.palette.length > 16 || value.palette.some((swatch) => !swatch || !boundedText(swatch.role, 100) ||
      !boundedText(swatch.source, 500) || typeof swatch.color !== 'string' || !/^#[\da-f]{6}$/i.test(swatch.color))) {
    throw new Error('The theme analysis returned an invalid colour palette.');
  }
  if (value.fonts && (!Array.isArray(value.fonts) || value.fonts.length > 12 || value.fonts.some((font) =>
    !font || typeof font.family !== 'string' || !/^[\w\s-]{1,100}$/.test(font.family) || !boundedText(font.url, 2048) || !isThemeFontUrl(font.url) ||
    (font.weight !== undefined && (typeof font.weight !== 'string' || !/^(?:[1-9]00)(?: [1-9]00)?$/.test(font.weight))) ||
    (font.style && !['normal', 'italic', 'oblique'].includes(font.style)) ||
    (font.unicodeRange && !/^[uU+\da-fA-F?,\s-]{1,1000}$/.test(font.unicodeRange))))) {
    throw new Error('The theme analysis returned an invalid font definition.');
  }
  const result = structuredClone(value);
  if (value.placement) {
    try {
      result.placement = validateSelectorDiscoveryProposal(value.placement);
      if (result.placement.source.id !== value.source.id) throw new Error('Theme mismatch');
    } catch {
      delete result.placement;
      result.warnings.push('Page placement suggestions could not be validated. Your current placements will be kept.');
    }
  }
  return result;
}

/** Old clients receive a useful palette without silently saving tokens they cannot render. */
export function compatibleThemeStyleProposal(proposal: ThemeStyleProposal, compatibility?: ConfiguratorSetupCompatibility): ThemeStyleProposal {
  const supported = new Set(compatibility?.supportedFeatures ?? []);
  const omitted = Object.keys(proposal.style).filter((key) => NEW_THEME_STYLE_VARIABLES.has(key) && !supported.has(THEME_STYLE_FEATURE));
  const fontsOmitted = !!proposal.fonts?.length && !supported.has(THEME_FONTS_FEATURE);
  const style = Object.fromEntries(Object.entries(proposal.style).filter(([key]) => !omitted.includes(key)));
  // A font-family name without its font file is misleading on older runtimes. Keep their current font.
  if (fontsOmitted) for (const key of ['--ov25-360-font-family', '--ov25-heading-font-family', '--ov25-button-font-family']) delete style[key];
  return {
    ...proposal, style, fonts: fontsOmitted ? undefined : proposal.fonts,
    warnings: [...proposal.warnings,
      ...(omitted.length ? ['Your installed configurator supports a partial match. Advanced selection, input and typography styles need an updated plugin.'] : []),
      ...(fontsOmitted ? ['Custom font files need an updated plugin. Your current font will be kept.'] : []),
    ],
  };
}

export function applyThemeStyleProposal(settings: TypeSettings, proposal: ThemeStyleProposal): TypeSettings {
  return {
    ...settings,
    style: { ...settings.style, ...proposal.style,
      ...(proposal.style['--ov25-highlight-color'] ? { [OV25_VARIANT_THUMB_RING_MODE_VAR]: OV25_VARIANT_RING_MODE_SOLID } : {}),
    },
    branding: { ...settings.branding, ...(proposal.fonts?.length ? { fonts: proposal.fonts } : {}) },
  };
}
