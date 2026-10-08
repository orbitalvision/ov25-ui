import type { TypeSettings } from './types';
import { NEW_THEME_STYLE_VARIABLES, THEME_STYLE_FEATURE, THEME_FONTS_FEATURE } from './theme-style';

/** Fixed feature baseline agreed on 29 September 2026. Never extend this array. */
export const LEGACY_SETUP_FEATURES = [
  'settings:legacy-2026-09-29',
  'layout:inline', 'layout:inline-sticky', 'layout:sheet', 'layout:modal', 'layout:drawer', 'layout:variants-only-sheet',
  'variants:tree', 'variants:list', 'variants:tabs', 'variants:accordion', 'variants:wizard', 'variants:guided-overview',
  'selection-details:tooltip', 'selection-details:sheet', 'selection-details:modal', 'selection-details:fullscreen',
  'gallery:carousel', 'gallery:stacked', 'gallery:auto-cutouts',
] as const;

export interface ConfiguratorSetupCompatibility {
  buildId?: string;
  /** Tested adapter + UI support from a recognised release manifest. Omit the prop for unknown builds. */
  supportedFeatures: readonly string[];
}

export function requiredSetupFeatures(settings: TypeSettings): string[] {
  const features = new Set<string>(['settings:legacy-2026-09-29']);
  for (const mode of [settings.configurator.displayModeDesktop, settings.configurator.displayModeMobile]) features.add(`layout:${mode}`);
  for (const mode of [settings.configurator.variantDisplayDesktop, settings.configurator.variantDisplayMobile]) features.add(`variants:${mode}`);
  for (const mode of [settings.configurator.selectionDetailsDisplayModeDesktop, settings.configurator.selectionDetailsDisplayModeMobile]) {
    if (mode !== 'none') features.add(`selection-details:${mode}`);
  }
  for (const mode of [settings.carousel.desktop, settings.carousel.mobile]) if (mode !== 'none') features.add(`gallery:${mode}`);
  if (settings.carousel.autoCutouts) features.add('gallery:auto-cutouts');
  if (Object.entries(settings.style).some(([key, value]) => value && NEW_THEME_STYLE_VARIABLES.has(key))) features.add(THEME_STYLE_FEATURE);
  if (settings.branding.fonts?.length) features.add(THEME_FONTS_FEATURE);
  return [...features];
}

/** Retaining an existing setting must remain possible after a host/plugin downgrade. */
export function unsupportedSetupFeatures(settings: TypeSettings, compatibility?: ConfiguratorSetupCompatibility, existing?: TypeSettings): string[] {
  const supported = new Set<string>(compatibility?.supportedFeatures ?? LEGACY_SETUP_FEATURES);
  const retained = new Set(existing ? requiredSetupFeatures(existing) : []);
  return requiredSetupFeatures(settings).filter((feature) => !supported.has(feature) && !retained.has(feature));
}

export function describeUnsupportedFeatures(features: string[]): string {
  return features.length ? `This store needs an update for: ${features.map((feature) => feature.replace(':', ': ').replaceAll('-', ' ')).join(', ')}.` : '';
}
