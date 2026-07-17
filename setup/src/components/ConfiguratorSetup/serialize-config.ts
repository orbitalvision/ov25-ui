import {
  PREVIEW_PRODUCT_LINKS,
  DEFAULT_PREVIEW_API_KEY,
  SNAP2_PREVIEW_STARTING_CONFIG_UUID,
} from '../../lib/config/preview-config';
import type {
  ConfiguratorSetupFormState,
  TypeSettings,
  SelectorFormState,
  PreviewLayoutType,
} from './types';
import { DEFAULT_FORM_STATE } from './types';
import type { SerializableInjectConfig } from './preview-config-serializable';
import { generateVariableCSS, generateElementCSS } from '../../lib/config/configurator-style-variables';
import type { ConfiguratorSetupPayload } from './initial-config-from-payload';
import { formStringReplacementsToSerializable } from '../../lib/string-replacements-config';

export type { ConfiguratorSetupPayload };

export type ConfiguratorSetupPreviewOverride = string | Partial<Record<PreviewLayoutType, string>>;

export interface ConfiguratorSetupSerializableOverrides {
  apiKey?: ConfiguratorSetupPreviewOverride;
  productLink?: ConfiguratorSetupPreviewOverride;
}

function parseVariantHideOptionsCsv(csv: string): string[] {
  if (!csv?.trim()) return [];
  return csv.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
}

function toElementSelector(s: SelectorFormState): string | { selector: string; replace: boolean } | undefined {
  if (!s.enabled || !s.selector.trim()) return undefined;
  return s.replace ? { selector: s.selector.trim(), replace: true } : s.selector.trim();
}

const DEMO_IMAGE_COUNT = 9;
const DEMO_IMAGES = Array.from({ length: DEMO_IMAGE_COUNT }, (_, i) => `https://picsum.photos/800/800?random=${i + 1}`);

function resolvePreviewOverride(
  override: ConfiguratorSetupPreviewOverride | undefined,
  layout: PreviewLayoutType,
  fallback: string,
): string {
  if (typeof override === 'string') return override || fallback;
  return override?.[layout] || fallback;
}

function normalizeSnap2DesktopDisplayMode(displayMode: unknown): 'inline' | 'modal' {
  return typeof displayMode === 'string' && displayMode.trim().toLowerCase() === 'inline'
    ? 'inline'
    : 'modal';
}

function normalizeSnap2MobileDisplayMode(displayMode: unknown): 'inline' | 'drawer' | 'modal' {
  const normalized = typeof displayMode === 'string' ? displayMode.trim().toLowerCase() : '';
  return normalized === 'inline' || normalized === 'drawer'
    ? normalized
    : 'modal';
}

export function buildSerializableConfig(
  layout: PreviewLayoutType,
  settings: TypeSettings,
  overrides?: ConfiguratorSetupSerializableOverrides,
): SerializableInjectConfig {
  let productLink = resolvePreviewOverride(overrides?.productLink, layout, PREVIEW_PRODUCT_LINKS[layout]);
  if (layout === 'snap2' && settings.snap2UseStartingConfig) {
    const sep = productLink.includes('?') ? '&' : '?';
    productLink = `${productLink}${sep}configuration_uuid=${encodeURIComponent(SNAP2_PREVIEW_STARTING_CONFIG_UUID)}`;
  }
  const apiKey = resolvePreviewOverride(overrides?.apiKey, layout, DEFAULT_PREVIEW_API_KEY);
  const parsedHideOptions = parseVariantHideOptionsCsv(settings.configurator.variantHideOptionsCsv);
  const isSnap2 = layout === 'snap2';
  const displayModeDesktop = isSnap2
    ? normalizeSnap2DesktopDisplayMode(settings.configurator.displayModeDesktop)
    : settings.configurator.displayModeDesktop;
  const displayModeMobile = isSnap2
    ? normalizeSnap2MobileDisplayMode(settings.configurator.displayModeMobile)
    : settings.configurator.displayModeMobile;
  const hasSnap2PureInlineDisplayMode =
    isSnap2 &&
    (displayModeDesktop === 'inline' || displayModeMobile === 'inline');
  const hasSnap2InPageGalleryDisplayMode =
    isSnap2 &&
    (displayModeDesktop === 'inline' || displayModeMobile === 'inline');
  const shouldOmitSnap2ConfigureButton =
    isSnap2 &&
    displayModeDesktop === 'inline' &&
    displayModeMobile === 'inline';

  const selectors: Record<string, string | { selector: string; replace: boolean }> = {};
  const selectorEntries = Object.entries(settings.selectors) as [keyof TypeSettings['selectors'], SelectorFormState][];
  for (const [key, state] of selectorEntries) {
    if (shouldOmitSnap2ConfigureButton && key === 'configureButton') continue;
    if (isSnap2 && key === 'initialiseMenu' && !hasSnap2PureInlineDisplayMode) continue;
    const val = toElementSelector(state);
    if (val) selectors[key] = val;
  }
  if (hasSnap2InPageGalleryDisplayMode) {
    if (selectors.gallery === undefined) {
      selectors.gallery = { selector: '.configurator-container', replace: true };
    }
  }
  if (hasSnap2PureInlineDisplayMode) {
    if (selectors.variants === undefined) {
      selectors.variants = '#ov25-controls';
    }
    if (selectors.initialiseMenu === undefined) {
      selectors.initialiseMenu = { selector: '#ov25-initialise-menu', replace: true };
    }
  }

  const config: SerializableInjectConfig = {
    apiKey,
    productLink,
    selectors,
    carousel: {
      desktop: settings.carousel.desktop,
      mobile: settings.carousel.mobile,
      maxImages:
        settings.carousel.maxImagesDesktop !== settings.carousel.maxImagesMobile
          ? { desktop: settings.carousel.maxImagesDesktop, mobile: settings.carousel.maxImagesMobile }
          : settings.carousel.maxImagesDesktop,
    },
    configurator: {
      displayMode: { desktop: displayModeDesktop, mobile: displayModeMobile },
      triggerStyle: { desktop: settings.configurator.triggerStyleDesktop, mobile: settings.configurator.triggerStyleMobile },
      variants: {
        displayMode: { desktop: settings.configurator.variantDisplayDesktop, mobile: settings.configurator.variantDisplayMobile },
        ...(isSnap2
          ? {
              position: {
                desktop: settings.configurator.snap2VariantPositionDesktop,
                mobile: settings.configurator.snap2VariantPositionMobile,
              },
            }
          : {}),
        useSimpleVariantsSelector: settings.configurator.useSimpleVariantsSelector,
        ...(parsedHideOptions.length > 0 ? { hideOptions: parsedHideOptions } : {}),
      },
      ...(isSnap2
        ? {
            modules: {
              position: {
                desktop: settings.configurator.snap2ModulePositionDesktop,
                mobile: settings.configurator.snap2ModulePositionMobile,
              },
            },
          }
        : {}),
    },
    flags: {
      hidePricing: settings.flags.hidePricing,
      disableAddToCart: settings.flags.disableAddToCart,
      disableBuyNow: settings.flags.disableBuyNow,
      hideAr: settings.flags.hideAr,
      hideGestureHint: settings.flags.hideGestureHint,
      deferThreeD: settings.flags.deferThreeD,
      showOptional: settings.flags.showOptional,
      forceMobile: settings.flags.forceMobile,
      autoOpen: settings.flags.autoOpen,
    },
    images: DEMO_IMAGES,
  };

  const variableCSS = generateVariableCSS(settings.style);
  const elementCSS = generateElementCSS(settings.elementStyles);
  const manualCSS = settings.branding.cssString;
  const combinedCSS = [variableCSS, elementCSS, manualCSS].filter(Boolean).join('\n\n');

  if (
    combinedCSS ||
    settings.branding.logoURL ||
    settings.branding.mobileLogoURL ||
    settings.branding.hideLogo
  ) {
    config.branding = {};
    if (settings.branding.logoURL) config.branding.logoURL = settings.branding.logoURL;
    if (settings.branding.mobileLogoURL) config.branding.mobileLogoURL = settings.branding.mobileLogoURL;
    if (combinedCSS) config.branding.cssString = combinedCSS;
    if (settings.branding.hideLogo) config.branding.hideLogo = true;
  }

  if (settings.flags.hidePricing && config.selectors) {
    delete config.selectors.price;
  }

  if (layout === 'bedConfigurator' && settings.bed) {
    const filterSelectionsByCurrentSize = {
      headboard: settings.bed.filterMatchingSizeHeadboard,
      base: settings.bed.filterMatchingSizeBase,
      mattress: settings.bed.filterMatchingSizeMattress,
    };
    config.bed = {
      allowNone: {
        headboard: settings.bed.allowNoneHeadboard,
        base: settings.bed.allowNoneBase,
        mattress: settings.bed.allowNoneMattress,
      },
      ...(filterSelectionsByCurrentSize.headboard ||
      filterSelectionsByCurrentSize.base ||
      filterSelectionsByCurrentSize.mattress
        ? { filterSelectionsByCurrentSize }
        : {}),
    };
  }

  const stringReplacementsSerializable = formStringReplacementsToSerializable(settings.stringReplacements);
  if (stringReplacementsSerializable) {
    config.stringReplacements = stringReplacementsSerializable;
  }

  return config;
}

export function buildConfiguratorSetupPayload(
  state: ConfiguratorSetupFormState,
  overrides?: ConfiguratorSetupSerializableOverrides,
): ConfiguratorSetupPayload {
  const result = {} as ConfiguratorSetupPayload;
  for (const type of Object.keys(state.typeSettings) as PreviewLayoutType[]) {
    const cfg = buildSerializableConfig(type, state.typeSettings[type], overrides);
    const { apiKey: _a, productLink: _p, images: _i, ...rest } = cfg;
    (result as Record<string, unknown>)[type] = rest;
  }
  return result;
}

export function buildDefaultConfiguratorSetupPayload(
  overrides?: ConfiguratorSetupSerializableOverrides,
): ConfiguratorSetupPayload {
  return buildConfiguratorSetupPayload(DEFAULT_FORM_STATE, overrides);
}
