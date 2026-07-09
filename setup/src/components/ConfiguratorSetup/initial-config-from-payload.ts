import type { LayoutType } from '../../lib/config/preview-config';
import type { SerializableInjectConfig } from './preview-config-serializable';
import type { ConfiguratorSetupFormState, SelectorFormState, TypeSettings } from './types';
import { DEFAULT_FORM_STATE, DEFAULT_TYPE_SETTINGS } from './types';
import { serializableToFormStringReplacements } from '../../lib/string-replacements-config';

export type ConfiguratorSetupPayload = Record<
  LayoutType,
  Omit<SerializableInjectConfig, 'apiKey' | 'productLink' | 'images'>
>;

type SavedLayout = Partial<Omit<SerializableInjectConfig, 'apiKey' | 'productLink' | 'images'>>;

const LAYOUTS: LayoutType[] = ['standard', 'snap2', 'bedConfigurator'];

function deserializeSelector(val: string | { selector: string; replace: boolean }): SelectorFormState {
  if (typeof val === 'string') {
    return { enabled: true, selector: val, replace: false };
  }
  return {
    enabled: true,
    selector: val.selector,
    replace: Boolean(val.replace),
  };
}

const SNAP2_VARIANT_POSITIONS = ['left', 'right'] as const;
const SNAP2_MODULE_POSITIONS = ['left', 'right', 'bottom'] as const;
const DESKTOP_DISPLAY_MODES = ['inline', 'sheet', 'modal', 'variants-only-sheet'] as const;

function normalizePosition<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return allowed.includes(normalized as T) ? (normalized as T) : fallback;
}

function normalizeDesktopDisplayMode(
  layout: LayoutType,
  value: unknown,
  fallback: TypeSettings['configurator']['displayModeDesktop'],
): TypeSettings['configurator']['displayModeDesktop'] {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (layout === 'snap2') {
    return normalized === 'inline' ? 'inline' : 'modal';
  }
  return DESKTOP_DISPLAY_MODES.includes(normalized as (typeof DESKTOP_DISPLAY_MODES)[number])
    ? (normalized as TypeSettings['configurator']['displayModeDesktop'])
    : fallback;
}

function normalizeMobileDisplayMode(
  layout: LayoutType,
  value: unknown,
): TypeSettings['configurator']['displayModeMobile'] {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (layout === 'snap2') {
    return normalized === 'inline' || normalized === 'drawer'
      ? normalized
      : 'modal';
  }
  return value as TypeSettings['configurator']['displayModeMobile'];
}

/** Pulls `:host` / `:root` `--ov25-*` declarations into a flat map so they are not duplicated when re-exporting. */
export function pullRootVariablesFromCss(css: string | undefined): { style: Record<string, string>; rest: string } {
  const style: Record<string, string> = {};
  if (!css?.trim()) {
    return { style, rest: '' };
  }
  let rest = css;
  const rootOrHostBlock = /:(host|root)\s*\{([^}]*)\}/g;
  rest = rest.replace(rootOrHostBlock, (_, selectorName: string, body: string) => {
    const remainingDeclarations: string[] = [];

    for (const rawDeclaration of body.split(';')) {
      const declaration = rawDeclaration.trim();
      if (!declaration) continue;

      const variable = /^(--ov25-[a-zA-Z0-9-]+)\s*:\s*(.+)$/.exec(declaration);
      if (variable) {
        style[variable[1].trim()] = variable[2].trim();
        continue;
      }

      remainingDeclarations.push(declaration);
    }

    if (remainingDeclarations.length === 0) {
      return '';
    }

    return `:${selectorName} {\n${remainingDeclarations.map((declaration) => `  ${declaration};`).join('\n')}\n}`;
  });
  return { style, rest: rest.replace(/\n{3,}/g, '\n\n').trim() };
}

function mergeSerializableIntoTypeSettings(base: TypeSettings, saved: SavedLayout, layout: LayoutType): TypeSettings {
  const merged: TypeSettings = {
    ...base,
    selectors: { ...base.selectors },
    carousel: { ...base.carousel },
    configurator: { ...base.configurator },
    flags: { ...base.flags },
    branding: { ...base.branding },
    style: { ...base.style },
    elementStyles: { ...base.elementStyles },
    stringReplacements: { ...base.stringReplacements },
  };

  if (saved.selectors) {
    for (const key of Object.keys(saved.selectors) as (keyof TypeSettings['selectors'])[]) {
      const val = saved.selectors[key as string];
      if (val === undefined) continue;
      merged.selectors[key] = deserializeSelector(val as string | { selector: string; replace: boolean });
    }
  }

  if (saved.carousel) {
    const c = saved.carousel;
    if (c.desktop) merged.carousel.desktop = c.desktop as TypeSettings['carousel']['desktop'];
    if (c.mobile) merged.carousel.mobile = c.mobile as TypeSettings['carousel']['mobile'];
    if (c.maxImages !== undefined) {
      if (typeof c.maxImages === 'number') {
        merged.carousel.maxImagesDesktop = c.maxImages;
        merged.carousel.maxImagesMobile = c.maxImages;
      } else if (c.maxImages && typeof c.maxImages === 'object') {
        merged.carousel.maxImagesDesktop = c.maxImages.desktop;
        merged.carousel.maxImagesMobile = c.maxImages.mobile;
      }
    }
  }

  if (saved.configurator) {
    const cf = saved.configurator;
    if (cf.displayMode) {
      merged.configurator.displayModeDesktop = normalizeDesktopDisplayMode(
        layout,
        cf.displayMode.desktop,
        merged.configurator.displayModeDesktop,
      );
      merged.configurator.displayModeMobile = normalizeMobileDisplayMode(
        layout,
        cf.displayMode.mobile,
      );
    }
    if (cf.triggerStyle) {
      merged.configurator.triggerStyleDesktop = cf.triggerStyle.desktop as TypeSettings['configurator']['triggerStyleDesktop'];
      merged.configurator.triggerStyleMobile = cf.triggerStyle.mobile as TypeSettings['configurator']['triggerStyleMobile'];
    }
    if (cf.variants?.displayMode) {
      merged.configurator.variantDisplayDesktop = cf.variants.displayMode.desktop as TypeSettings['configurator']['variantDisplayDesktop'];
      merged.configurator.variantDisplayMobile = cf.variants.displayMode.mobile as TypeSettings['configurator']['variantDisplayMobile'];
    }
    if (cf.variants?.position) {
      const desktop = normalizePosition(
        cf.variants.position.desktop,
        SNAP2_VARIANT_POSITIONS,
        merged.configurator.snap2VariantPositionDesktop,
      );
      merged.configurator.snap2VariantPositionDesktop = desktop;
      merged.configurator.snap2VariantPositionMobile = normalizePosition(
        cf.variants.position.mobile ?? cf.variants.position.desktop,
        SNAP2_VARIANT_POSITIONS,
        merged.configurator.snap2VariantPositionMobile,
      );
    }
    if (cf.modules?.position) {
      const desktop = normalizePosition(
        cf.modules.position.desktop,
        SNAP2_MODULE_POSITIONS,
        merged.configurator.snap2ModulePositionDesktop,
      );
      merged.configurator.snap2ModulePositionDesktop = desktop;
      merged.configurator.snap2ModulePositionMobile = normalizePosition(
        cf.modules.position.mobile ?? cf.modules.position.desktop,
        SNAP2_MODULE_POSITIONS,
        merged.configurator.snap2ModulePositionMobile,
      );
    }
    if (cf.variants?.useSimpleVariantsSelector !== undefined) {
      merged.configurator.useSimpleVariantsSelector = cf.variants.useSimpleVariantsSelector;
    }
    if (Array.isArray(cf.variants?.hideOptions) && cf.variants.hideOptions.length > 0) {
      merged.configurator.variantHideOptionsCsv = cf.variants.hideOptions
        .filter((x): x is string => typeof x === 'string' && x.trim() !== '')
        .join(', ');
    }
  }

  if (saved.flags) {
    merged.flags = { ...merged.flags, ...saved.flags } as TypeSettings['flags'];
  }

  if (saved.stringReplacements && typeof saved.stringReplacements === 'object') {
    merged.stringReplacements = {
      ...merged.stringReplacements,
      ...serializableToFormStringReplacements(saved.stringReplacements),
    };
  }

  if (saved.branding) {
    merged.branding = { ...merged.branding };
    if (saved.branding.logoURL !== undefined) merged.branding.logoURL = saved.branding.logoURL ?? '';
    if (saved.branding.mobileLogoURL !== undefined) merged.branding.mobileLogoURL = saved.branding.mobileLogoURL ?? '';
    if (saved.branding.hideLogo !== undefined) merged.branding.hideLogo = Boolean(saved.branding.hideLogo);
    if (saved.branding.cssString !== undefined) {
      const { style: pulled, rest } = pullRootVariablesFromCss(saved.branding.cssString);
      merged.style = { ...merged.style, ...pulled };
      merged.branding.cssString = rest;
    }
  }

  if (saved.bed) {
    merged.bed = {
      ...(merged.bed ?? DEFAULT_TYPE_SETTINGS.bedConfigurator.bed!),
    };
    if (saved.bed.allowNone) {
      const a = saved.bed.allowNone;
      merged.bed.allowNoneHeadboard = Boolean(a.headboard);
      merged.bed.allowNoneBase = Boolean(a.base);
      merged.bed.allowNoneMattress = Boolean(a.mattress);
    }
    if (saved.bed.filterSelectionsByCurrentSize) {
      const f = saved.bed.filterSelectionsByCurrentSize;
      merged.bed.filterMatchingSizeHeadboard = Boolean(f.headboard);
      merged.bed.filterMatchingSizeBase = Boolean(f.base);
      merged.bed.filterMatchingSizeMattress = Boolean(f.mattress);
    }
  }

  return merged;
}

function isLayoutPayloadEmpty(raw: unknown): boolean {
  return !raw || typeof raw !== 'object' || Object.keys(raw as object).length === 0;
}

export function hasMeaningfulInitialConfig(config: Partial<ConfiguratorSetupPayload> | undefined): boolean {
  if (!config) return false;
  return LAYOUTS.some((layout) => !isLayoutPayloadEmpty(config[layout]));
}

export function buildFormStateFromInitialPayload(initial: Partial<ConfiguratorSetupPayload> | undefined): ConfiguratorSetupFormState {
  const state: ConfiguratorSetupFormState = JSON.parse(JSON.stringify(DEFAULT_FORM_STATE)) as ConfiguratorSetupFormState;
  if (!initial) return state;

  for (const layout of LAYOUTS) {
    const raw = initial[layout];
    if (isLayoutPayloadEmpty(raw)) continue;
    state.typeSettings[layout] = mergeSerializableIntoTypeSettings(
      DEFAULT_TYPE_SETTINGS[layout],
      raw as SavedLayout,
      layout,
    );
  }
  return state;
}
