import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PREVIEW_PRODUCT_LINKS,
  DEFAULT_PREVIEW_API_KEY,
  SNAP2_PREVIEW_STARTING_CONFIG_UUID,
} from '../../lib/config/preview-config';
import type { LayoutType } from '../../lib/config/preview-config';
import type {
  ConfiguratorSetupFormState,
  TypeSettings,
  SelectorFormState,
  PreviewLayoutType,
} from './types';
import { DEFAULT_FORM_STATE, DEFAULT_TYPE_SETTINGS } from './types';
import type { SerializableInjectConfig } from './preview-config-serializable';
import { generateVariableCSS, generateElementCSS } from '../../lib/config/configurator-style-variables';

const STORAGE_KEY = 'ov25-configurator-setup';
const EXPORT_MESSAGE_TYPE = 'OV25_CONFIGURATOR_SETTINGS';
const DEMO_IMAGE_COUNT = 9;
const DEMO_IMAGES = Array.from({ length: DEMO_IMAGE_COUNT }, (_, i) => `https://picsum.photos/800/800?random=${i + 1}`);

/** The payload onSave receives -- one SerializableInjectConfig per layout type */
export type ConfiguratorSetupPayload = Record<LayoutType, Omit<SerializableInjectConfig, 'apiKey' | 'productLink' | 'images'>>;

export interface ConfiguratorSetupOverrides {
  apiKey?: string;
  productLink?: string;
  previewBaseUrl?: string;
  initialConfig?: ConfiguratorSetupPayload;
  onSave?: (payload: ConfiguratorSetupPayload) => void;
  hidePreview?: boolean;
  hideSaveButton?: boolean;
}

function mergeTypeSettings(defaults: TypeSettings, saved: Partial<TypeSettings> | undefined): TypeSettings {
  if (!saved) return defaults;
  return {
    selectors: {
      gallery: { ...defaults.selectors.gallery, ...saved.selectors?.gallery },
      price: { ...defaults.selectors.price, ...saved.selectors?.price },
      name: { ...defaults.selectors.name, ...saved.selectors?.name },
      variants: { ...defaults.selectors.variants, ...saved.selectors?.variants },
      swatches: { ...defaults.selectors.swatches, ...saved.selectors?.swatches },
      configureButton: { ...defaults.selectors.configureButton, ...saved.selectors?.configureButton },
    },
    carousel: { ...defaults.carousel, ...saved.carousel },
    configurator: { ...defaults.configurator, ...saved.configurator },
    flags: { ...defaults.flags, ...saved.flags },
    branding: { ...defaults.branding, ...saved.branding },
    style: { ...defaults.style, ...saved.style },
    elementStyles: { ...defaults.elementStyles, ...saved.elementStyles },
    snap2UseStartingConfig: saved.snap2UseStartingConfig ?? defaults.snap2UseStartingConfig,
  };
}

function loadSavedState(): ConfiguratorSetupFormState {
  if (typeof window === 'undefined') return DEFAULT_FORM_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FORM_STATE;
    const parsed = JSON.parse(raw);
    return {
      layout: parsed.layout ?? DEFAULT_FORM_STATE.layout,
      typeSettings: {
        standard: mergeTypeSettings(DEFAULT_TYPE_SETTINGS.standard, parsed.typeSettings?.standard),
        snap2: mergeTypeSettings(DEFAULT_TYPE_SETTINGS.snap2, parsed.typeSettings?.snap2),
      },
    };
  } catch {
    return DEFAULT_FORM_STATE;
  }
}

function toElementSelector(s: SelectorFormState): string | { selector: string; replace: boolean } | undefined {
  if (!s.enabled || !s.selector.trim()) return undefined;
  return s.replace ? { selector: s.selector.trim(), replace: true } : s.selector.trim();
}

export function buildSerializableConfig(
  layout: PreviewLayoutType,
  settings: TypeSettings,
  overrides?: { apiKey?: string; productLink?: string },
): SerializableInjectConfig {
  let productLink = overrides?.productLink || PREVIEW_PRODUCT_LINKS[layout];
  if (layout === 'snap2' && settings.snap2UseStartingConfig) {
    const sep = productLink.includes('?') ? '&' : '?';
    productLink = `${productLink}${sep}configuration_uuid=${encodeURIComponent(SNAP2_PREVIEW_STARTING_CONFIG_UUID)}`;
  }
  const apiKey = overrides?.apiKey || DEFAULT_PREVIEW_API_KEY;

  const selectors: Record<string, string | { selector: string; replace: boolean }> = {};
  const selectorEntries = Object.entries(settings.selectors) as [keyof TypeSettings['selectors'], SelectorFormState][];
  for (const [key, state] of selectorEntries) {
    const val = toElementSelector(state);
    if (val) selectors[key] = val;
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
      displayMode: { desktop: settings.configurator.displayModeDesktop, mobile: settings.configurator.displayModeMobile },
      triggerStyle: { desktop: settings.configurator.triggerStyleDesktop, mobile: settings.configurator.triggerStyleMobile },
      variants: {
        displayMode: { desktop: settings.configurator.variantDisplayDesktop, mobile: settings.configurator.variantDisplayMobile },
        useSimpleVariantsSelector: true,
      },
    },
    flags: {
      hidePricing: settings.flags.hidePricing,
      hideAr: settings.flags.hideAr,
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

  if (combinedCSS || settings.branding.logoURL || settings.branding.mobileLogoURL) {
    config.branding = {};
    if (settings.branding.logoURL) config.branding.logoURL = settings.branding.logoURL;
    if (settings.branding.mobileLogoURL) config.branding.mobileLogoURL = settings.branding.mobileLogoURL;
    if (combinedCSS) config.branding.cssString = combinedCSS;
  }

  if (settings.flags.hidePricing && config.selectors) {
    delete config.selectors.price;
  }

  return config;
}

function buildExportJson(
  state: ConfiguratorSetupFormState,
  overrides?: { apiKey?: string; productLink?: string },
): ConfiguratorSetupPayload {
  const result = {} as ConfiguratorSetupPayload;
  for (const type of Object.keys(state.typeSettings) as PreviewLayoutType[]) {
    const cfg = buildSerializableConfig(type, state.typeSettings[type], overrides);
    const { apiKey: _a, productLink: _p, images: _i, ...rest } = cfg;
    (result as Record<string, unknown>)[type] = rest;
  }
  return result;
}

function postToParent(data: unknown) {
  if (typeof window === 'undefined') return;
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: EXPORT_MESSAGE_TYPE, settings: data }, '*');
  }
}

export function useConfiguratorSetup(overrides?: ConfiguratorSetupOverrides) {
  const hasInitialConfig = !!overrides?.initialConfig;
  const [formState, setFormState] = useState<ConfiguratorSetupFormState>(DEFAULT_FORM_STATE);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (hasInitialConfig) {
      setHasHydrated(true);
      return;
    }
    setFormState(loadSavedState());
    setHasHydrated(true);
  }, [hasInitialConfig]);

  useEffect(() => {
    if (!hasHydrated || hasInitialConfig) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(formState)); } catch { /* quota exceeded */ }
  }, [formState, hasHydrated, hasInitialConfig]);

  const currentSettings = formState.typeSettings[formState.layout];

  const setLayout = useCallback((layout: PreviewLayoutType) => {
    setFormState((prev) => ({ ...prev, layout }));
  }, []);

  const updateSettings = useCallback(<K extends keyof TypeSettings>(key: K, value: TypeSettings[K]) => {
    setFormState((prev) => ({
      ...prev,
      typeSettings: {
        ...prev.typeSettings,
        [prev.layout]: { ...prev.typeSettings[prev.layout], [key]: value },
      },
    }));
  }, []);

  const updateNested = useCallback(
    (section: keyof TypeSettings, key: string, value: unknown) => {
      setFormState((prev) => {
        const ts = prev.typeSettings[prev.layout];
        return {
          ...prev,
          typeSettings: {
            ...prev.typeSettings,
            [prev.layout]: { ...ts, [section]: { ...(ts[section] as object), [key]: value } },
          },
        };
      });
    },
    [],
  );

  const serializableConfig = useMemo(
    () => buildSerializableConfig(formState.layout, currentSettings, overrides),
    [formState.layout, currentSettings, overrides],
  );

  const getExportJson = useCallback(
    (mode: 'current' | 'all') => {
      if (mode === 'current') {
        const cfg = buildSerializableConfig(formState.layout, currentSettings, overrides);
        const { apiKey: _a, productLink: _p, images: _i, ...rest } = cfg;
        return rest;
      }
      return buildExportJson(formState, overrides);
    },
    [formState, currentSettings, overrides],
  );

  const exportSettings = useCallback(async () => {
    const json = buildExportJson(formState, overrides);
    if (overrides?.onSave) {
      overrides.onSave(json);
    } else {
      await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    }
    postToParent(json);
  }, [formState, overrides]);

  return {
    formState,
    currentSettings,
    setLayout,
    updateSettings,
    updateNested,
    serializableConfig,
    exportSettings,
    getExportJson,
  };
}
