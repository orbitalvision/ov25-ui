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
  normalizeSelectionDetailsMobileMode,
  selectionDetailsMobileFallbackFromDesktop,
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
import { PRESET_CATALOGUE_VERSION, applySetupPreset, presentationFingerprint, type SetupPresetId } from './presets';
import { applyThemeStyleProposal, type ThemeStyleProposal } from './theme-style';
import { applySelectorDiscoveryProposal } from './selector-discovery';

export type { ConfiguratorSetupPayload };

const STORAGE_KEY = 'ov25-configurator-setup';
const EXPORT_MESSAGE_TYPE = 'OV25_CONFIGURATOR_SETTINGS';

export interface ConfiguratorSetupOverrides extends ConfiguratorSetupSerializableOverrides {
  /** Host-owned identity for drafts whose initial JSON may be identical across targets. */
  draftKey?: string;
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
  const savedSelectionDetailsDesktop =
    saved.configurator?.selectionDetailsDisplayModeDesktop ?? 'none';
  const savedSelectionDetailsMobile = normalizeSelectionDetailsMobileMode(
    (saved.configurator as { selectionDetailsDisplayModeMobile?: unknown } | undefined)
      ?.selectionDetailsDisplayModeMobile,
    selectionDetailsMobileFallbackFromDesktop(savedSelectionDetailsDesktop),
  );
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
    configurator: {
      ...defaults.configurator,
      ...saved.configurator,
      selectionDetailsDisplayModeDesktop: savedSelectionDetailsDesktop,
      selectionDetailsDisplayModeMobile: savedSelectionDetailsMobile,
    },
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

function draftStorageKey(initialConfigKey: string, hasServerConfig: boolean, scope?: string): string {
  const base = scope ? `${STORAGE_KEY}:scope:${hashString(scope)}` : STORAGE_KEY;
  return hasServerConfig ? `${base}:draft:${hashString(initialConfigKey)}` : base;
}

function readSavedState(storageKey: string): ConfiguratorSetupFormState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      layout: parsed.layout ?? DEFAULT_FORM_STATE.layout,
      setupProgress: parsed.setupProgress ?? {
        standard: { configured: true }, snap2: { configured: true }, bedConfigurator: { configured: true },
      },
      typeSettings: {
        // The presence of a stored form state makes omitted layouts legacy.
        // Merge an empty object so new feature defaults are not silently
        // enabled when an older partial draft is opened and saved.
        standard: mergeStoredTypeSettings(
          DEFAULT_TYPE_SETTINGS.standard,
          parsed.typeSettings?.standard ?? {},
        ),
        snap2: mergeStoredTypeSettings(
          DEFAULT_TYPE_SETTINGS.snap2,
          parsed.typeSettings?.snap2 ?? {},
        ),
        bedConfigurator: mergeStoredTypeSettings(
          DEFAULT_TYPE_SETTINGS.bedConfigurator,
          parsed.typeSettings?.bedConfigurator ?? {},
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
    () => draftStorageKey(initialConfigKey, serverWins, overrides?.draftKey),
    [initialConfigKey, serverWins, overrides?.draftKey],
  );
  const [formState, setFormState] = useState<ConfiguratorSetupFormState>(DEFAULT_FORM_STATE);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(null);
  const [initialSettings, setInitialSettings] = useState<ConfiguratorSetupFormState['typeSettings']>();

  useEffect(() => {
    const parsed: Partial<ConfiguratorSetupPayload> | undefined =
      initialConfigKey === 'null' ? undefined : (JSON.parse(initialConfigKey) as Partial<ConfiguratorSetupPayload>);
    const savedDraft = readSavedState(storageKey);
    const base = buildFormStateFromInitialPayload(parsed);
    base.setupProgress = hasMeaningfulInitialConfig(parsed)
      ? { standard: { configured: true }, snap2: { configured: true }, bedConfigurator: { configured: true } }
      : {};
    // An autosaved draft is not evidence of previously deployed support. Otherwise
    // reopening an unsupported edit would bypass compatibility validation.
    setInitialSettings(hasMeaningfulInitialConfig(parsed) ? base.typeSettings : undefined);
    setFormState((previous) => {
      if (savedDraft) return savedDraft;
      // Hosts commonly echo a successful save through initialConfig. Keep known
      // provenance when that response represents exactly this draft.
      if (hasMeaningfulInitialConfig(parsed) && previous.setupProgress && Object.values(previous.setupProgress).some((entry) => entry?.configured) &&
        JSON.stringify(buildConfiguratorSetupPayload(previous)) === JSON.stringify(buildConfiguratorSetupPayload(base))) {
        return { ...base, layout: previous.layout, setupProgress: previous.setupProgress };
      }
      return base;
    });
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
      setupProgress: { ...prev.setupProgress, [prev.layout]: { ...prev.setupProgress?.[prev.layout], configured: true } },
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
          setupProgress: { ...prev.setupProgress, [prev.layout]: { ...prev.setupProgress?.[prev.layout], configured: true } },
          typeSettings: {
            ...prev.typeSettings,
            [prev.layout]: { ...ts, [section]: { ...(ts[section] as object), [key]: value } },
          },
        };
      });
    },
    [],
  );

  const applyPreset = useCallback((id: SetupPresetId, reviewTheme = false) => {
    setFormState((prev) => {
      const previousProgress = prev.setupProgress?.[prev.layout];
      const next = applySetupPreset(prev.layout, id, previousProgress?.configured ? prev.typeSettings[prev.layout] : undefined, !!previousProgress?.themeStyle);
      return {
        ...prev,
        typeSettings: { ...prev.typeSettings, [prev.layout]: next },
        setupProgress: { ...prev.setupProgress, [prev.layout]: {
          configured: true, presetId: id, presetVersion: PRESET_CATALOGUE_VERSION,
          presentationFingerprint: presentationFingerprint(next),
          themeStep: reviewTheme ? 'pending' : 'complete',
          themeStyle: previousProgress?.themeStyle,
        } },
      };
    });
  }, []);

  const applyThemeStyle = useCallback((layout: PreviewLayoutType, proposal: ThemeStyleProposal) => {
    setFormState((prev) => ({
      ...prev,
      typeSettings: { ...prev.typeSettings, [layout]: applyThemeStyleProposal(
        proposal.placement ? applySelectorDiscoveryProposal(prev.typeSettings[layout], proposal.placement) : prev.typeSettings[layout], proposal,
      ) },
      setupProgress: { ...prev.setupProgress, [layout]: {
        ...prev.setupProgress?.[layout], configured: true, themeStep: 'complete',
        themeStyle: { sourceId: proposal.source.id, label: proposal.source.label, fingerprint: proposal.source.fingerprint },
      } },
    }));
  }, []);

  const completeThemeStep = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      setupProgress: { ...prev.setupProgress, [prev.layout]: {
        ...prev.setupProgress?.[prev.layout], configured: true, themeStep: 'complete',
      } },
    }));
  }, []);

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
    applyPreset,
    applyThemeStyle,
    completeThemeStep,
    initialSettings,
    hydrationKey: storageKey,
    hasHydrated: hasHydrated && hydratedStorageKey === storageKey,
  };
}
