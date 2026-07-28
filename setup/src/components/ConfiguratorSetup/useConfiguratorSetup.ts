import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ConfiguratorSetupFormState,
  TypeSettings,
  PreviewLayoutType,
} from './types';
import { DEFAULT_FORM_STATE, DEFAULT_TYPE_SETTINGS } from './types';
import {
  buildFormStateFromInitialPayload,
  hasMeaningfulInitialConfig,
  type ConfiguratorSetupPayload,
} from './initial-config-from-payload';
import {
  normalizeStringReplacementsState,
} from '../../lib/string-replacements-config';
import {
  buildConfiguratorSetupPayload,
  buildSerializableConfig,
} from './serialize-config';
import type { ConfiguratorSetupSerializableOverrides } from './serialize-config';

export type { ConfiguratorSetupPayload };

const STORAGE_KEY = 'ov25-configurator-setup';
const EXPORT_MESSAGE_TYPE = 'OV25_CONFIGURATOR_SETTINGS';

export interface ConfiguratorSetupOverrides extends ConfiguratorSetupSerializableOverrides {
  previewBaseUrl?: string;
  initialConfig?: ConfiguratorSetupPayload;
  onSave?: (payload: ConfiguratorSetupPayload) => void;
  hidePreview?: boolean;
  hideSaveButton?: boolean;
}

export function mergeStoredTypeSettings(
  defaults: TypeSettings,
  saved: Partial<TypeSettings> | undefined,
): TypeSettings {
  if (!saved) return defaults;
  return {
    selectors: {
      gallery: { ...defaults.selectors.gallery, ...saved.selectors?.gallery },
      price: { ...defaults.selectors.price, ...saved.selectors?.price },
      name: { ...defaults.selectors.name, ...saved.selectors?.name },
      variants: { ...defaults.selectors.variants, ...saved.selectors?.variants },
      swatches: { ...defaults.selectors.swatches, ...saved.selectors?.swatches },
      configureButton: { ...defaults.selectors.configureButton, ...saved.selectors?.configureButton },
      initialiseMenu: { ...defaults.selectors.initialiseMenu, ...saved.selectors?.initialiseMenu },
    },
    carousel: { ...defaults.carousel, ...saved.carousel },
    configurator: { ...defaults.configurator, ...saved.configurator },
    flags: { ...defaults.flags, ...saved.flags },
    branding: { ...defaults.branding, ...saved.branding },
    style: { ...defaults.style, ...saved.style },
    elementStyles: { ...defaults.elementStyles, ...saved.elementStyles },
    stringReplacements: {
      ...normalizeStringReplacementsState(defaults.stringReplacements),
      ...normalizeStringReplacementsState(saved.stringReplacements),
    },
    snap2UseStartingConfig: saved.snap2UseStartingConfig ?? defaults.snap2UseStartingConfig,
    bed:
      saved.bed !== undefined
        ? {
            ...(defaults.bed ?? {
              allowNoneHeadboard: true,
              allowNoneBase: true,
              allowNoneMattress: true,
              filterMatchingSizeHeadboard: false,
              filterMatchingSizeBase: false,
              filterMatchingSizeMattress: false,
            }),
            ...saved.bed,
          }
        : defaults.bed,
  };
}

function hashString(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function draftStorageKey(initialConfigKey: string, hasServerConfig: boolean): string {
  return hasServerConfig ? `${STORAGE_KEY}:draft:${hashString(initialConfigKey)}` : STORAGE_KEY;
}

function readSavedState(storageKey: string): ConfiguratorSetupFormState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      layout: parsed.layout ?? DEFAULT_FORM_STATE.layout,
      typeSettings: {
        standard: mergeStoredTypeSettings(DEFAULT_TYPE_SETTINGS.standard, parsed.typeSettings?.standard),
        snap2: mergeStoredTypeSettings(DEFAULT_TYPE_SETTINGS.snap2, parsed.typeSettings?.snap2),
        bedConfigurator: mergeStoredTypeSettings(
          DEFAULT_TYPE_SETTINGS.bedConfigurator,
          parsed.typeSettings?.bedConfigurator,
        ),
      },
    };
  } catch {
    return null;
  }
}

function postToParent(data: unknown) {
  if (typeof window === 'undefined') return;
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: EXPORT_MESSAGE_TYPE, settings: data }, '*');
  }
}

export function useConfiguratorSetup(overrides?: ConfiguratorSetupOverrides) {
  const initialConfigKey = useMemo(
    () => JSON.stringify(overrides?.initialConfig ?? null),
    [overrides?.initialConfig],
  );
  const serverWins = useMemo(() => {
    if (initialConfigKey === 'null') return false;
    try {
      const parsed = JSON.parse(initialConfigKey) as Partial<ConfiguratorSetupPayload> | undefined;
      return hasMeaningfulInitialConfig(parsed);
    } catch {
      return false;
    }
  }, [initialConfigKey]);
  const storageKey = useMemo(
    () => draftStorageKey(initialConfigKey, serverWins),
    [initialConfigKey, serverWins],
  );
  const [formState, setFormState] = useState<ConfiguratorSetupFormState>(DEFAULT_FORM_STATE);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(null);

  useEffect(() => {
    const parsed: Partial<ConfiguratorSetupPayload> | undefined =
      initialConfigKey === 'null' ? undefined : (JSON.parse(initialConfigKey) as Partial<ConfiguratorSetupPayload>);
    const savedDraft = readSavedState(storageKey);
    if (hasMeaningfulInitialConfig(parsed)) {
      setFormState(savedDraft ?? buildFormStateFromInitialPayload(parsed));
    } else {
      setFormState(savedDraft ?? DEFAULT_FORM_STATE);
    }
    setHydratedStorageKey(storageKey);
    setHasHydrated(true);
  }, [initialConfigKey, storageKey]);

  useEffect(() => {
    if (!hasHydrated || hydratedStorageKey !== storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify(formState)); } catch { /* quota exceeded */ }
  }, [formState, hasHydrated, hydratedStorageKey, storageKey]);

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
      return buildConfiguratorSetupPayload(formState, overrides);
    },
    [formState, currentSettings, overrides],
  );

  const exportSettings = useCallback(async () => {
    const json = buildConfiguratorSetupPayload(formState, overrides);
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
