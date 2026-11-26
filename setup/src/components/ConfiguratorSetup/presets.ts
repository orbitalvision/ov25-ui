import type { PreviewLayoutType, TypeSettings } from './types';
import { PRESET_BASELINE } from './preset-baseline';
import { isThemeStyleVariable } from './theme-style';
import { extractThemeButtonAnimationBlock } from './button-animations';

export type SetupPresetId = 'classic' | 'in-page' | 'guided' | 'overview';
export const PRESET_CATALOGUE_VERSION = 2;
export const SETUP_PRESETS: readonly { id: SetupPresetId; name: string; description: string }[] = [
  { id: 'classic', name: 'Classic', description: 'A familiar product page with a focused configurator.' },
  { id: 'in-page', name: 'In-page', description: 'Keep the product and its options together on the page.' },
  { id: 'guided', name: 'Guided', description: 'Help shoppers build their product one step at a time.' },
  { id: 'overview', name: 'Overview', description: 'Show every choice at a glance, then refine the details.' },
];
const STANDARD_SETUP_PRESETS = [
  { ...SETUP_PRESETS[1], description: 'Most similar to a normal product page, with options alongside the product.' },
  // Keep the existing ID so saved local drafts retain their preset identity.
  { ...SETUP_PRESETS[0], name: 'Fullscreen', description: 'Clicking a button opens the configurator in fullscreen.' },
  ...SETUP_PRESETS.slice(2),
];

export function getSetupPresets(layout: PreviewLayoutType) {
  return layout === 'standard' ? STANDARD_SETUP_PRESETS : SETUP_PRESETS;
}

export function getDefaultPresetId(layout: PreviewLayoutType): SetupPresetId {
  return getSetupPresets(layout)[0].id;
}

export function getPresetSettings(layout: PreviewLayoutType, id: SetupPresetId): TypeSettings {
  const settings = JSON.parse(JSON.stringify(PRESET_BASELINE[layout])) as TypeSettings;
  settings.carousel.autoCutouts = true;
  settings.carousel.maxImagesDesktop = settings.carousel.maxImagesMobile = 10;
  const isSnap2 = layout === 'snap2';
  const c = settings.configurator;
  if (id === 'classic') {
    c.displayModeDesktop = isSnap2 ? 'modal' : 'sheet';
    c.displayModeMobile = 'drawer';
    c.variantDisplayDesktop = 'tree';
    c.variantDisplayMobile = 'list';
  } else {
    const mode = id === 'guided' ? 'modal' : id === 'overview' && !isSnap2 ? 'inline-sticky' : 'inline';
    c.displayModeDesktop = mode;
    c.displayModeMobile = mode;
    c.variantDisplayDesktop = c.variantDisplayMobile = id === 'guided' ? 'wizard' : id === 'overview' ? 'guided-overview' : 'accordion';
    settings.carousel.desktop = id === 'overview' ? 'stacked' : 'carousel';
    settings.carousel.mobile = 'carousel';
  }
  // Bed's In-page is Standard's: sticky inline with a list of options.
  if ((layout === 'standard' || layout === 'bedConfigurator') && id === 'in-page') {
    c.displayModeDesktop = c.displayModeMobile = 'inline-sticky';
    c.variantDisplayDesktop = c.variantDisplayMobile = 'list';
  }
  // Standard's Guided keeps the product in view: the step-by-step options sit beside a sticky viewer, not in a modal.
  if (layout === 'standard' && id === 'guided') c.displayModeDesktop = c.displayModeMobile = 'inline-sticky';
  if (isSnap2) {
    const inline = c.displayModeDesktop === 'inline';
    settings.selectors.gallery.enabled = inline;
    settings.selectors.configureButton.enabled = !inline;
    if (!inline) settings.carousel.desktop = settings.carousel.mobile = 'none';
  }
  return settings;
}

/** Placements whose on/off state belongs to the preset rather than the store. */
const PRESET_PLACEMENTS: Record<PreviewLayoutType, ('gallery' | 'configureButton')[]> = {
  standard: [], snap2: ['gallery', 'configureButton'], bedConfigurator: [],
};

/** Reset presentation only; preserve merchant integration, rules and branding. */
export function applySetupPreset(layout: PreviewLayoutType, id: SetupPresetId, current?: TypeSettings, preserveThemeStyle = false): TypeSettings {
  const preset = getPresetSettings(layout, id);
  if (!current) return preset;
  const preserved = JSON.parse(JSON.stringify(current)) as TypeSettings;
  // Runtime exports intentionally omit editor provenance. Preserve semantic styling
  // after importing saved JSON too, so a fresh browser cannot erase a matched palette.
  const themeStyles = Object.fromEntries(Object.entries(preserved.style).filter(([key]) => isThemeStyleVariable(key)));
  const matchedAnimationCss = extractThemeButtonAnimationBlock(preserved.branding.cssString);
  // Some presets decide whether a placement is used at all (Snap2 in the gallery slot or from a button), so whether
  // it's on comes from the preset. The store's selectors themselves are kept.
  const selectors = { ...preserved.selectors };
  for (const key of PRESET_PLACEMENTS[layout]) selectors[key] = { ...preserved.selectors[key], enabled: preset.selectors[key].enabled };
  return {
    ...preserved,
    selectors,
    carousel: preset.carousel,
    configurator: { ...preset.configurator, variantHideOptionsCsv: preserved.configurator.variantHideOptionsCsv },
    branding: { ...preserved.branding, cssString: [preset.branding.cssString, matchedAnimationCss].filter(Boolean).join('\n\n') },
    style: preserveThemeStyle || Object.keys(themeStyles).length ? { ...preset.style, ...themeStyles } : preset.style,
    elementStyles: preset.elementStyles,
  };
}

export function presentationFingerprint(settings: TypeSettings): string {
  const { variantHideOptionsCsv: _hidden, ...configurator } = settings.configurator;
  return JSON.stringify([settings.carousel, configurator, settings.style, settings.elementStyles, settings.branding.cssString, settings.branding.fonts]);
}
