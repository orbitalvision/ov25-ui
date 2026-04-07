import type { LayoutType } from '../../lib/config/preview-config';
import type { SerializableInjectConfig } from './preview-config-serializable';
import type { ConfiguratorSetupFormState, SelectorFormState, TypeSettings } from './types';
import { DEFAULT_FORM_STATE, DEFAULT_TYPE_SETTINGS } from './types';

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

/** Pulls `:root { --ov25-* }` declarations into a flat map and removes those blocks so they are not duplicated when re-exporting. */
export function pullRootVariablesFromCss(css: string | undefined): { style: Record<string, string>; rest: string } {
  const style: Record<string, string> = {};
  if (!css?.trim()) {
    return { style, rest: '' };
  }
  let rest = css;
  const rootBlock = /:root\s*\{([^}]*)\}/g;
  rest = rest.replace(rootBlock, (_, body: string) => {
    const decl = /(--ov25-[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
    let m: RegExpExecArray | null;
    while ((m = decl.exec(body)) !== null) {
      style[m[1].trim()] = m[2].trim();
    }
    return '';
  });
  return { style, rest: rest.replace(/\n{3,}/g, '\n\n').trim() };
}

function mergeSerializableIntoTypeSettings(base: TypeSettings, saved: SavedLayout): TypeSettings {
  const merged: TypeSettings = {
    ...base,
    selectors: { ...base.selectors },
    carousel: { ...base.carousel },
    configurator: { ...base.configurator },
    flags: { ...base.flags },
    branding: { ...base.branding },
    style: { ...base.style },
    elementStyles: { ...base.elementStyles },
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
      merged.configurator.displayModeDesktop = cf.displayMode.desktop as TypeSettings['configurator']['displayModeDesktop'];
      merged.configurator.displayModeMobile = cf.displayMode.mobile as TypeSettings['configurator']['displayModeMobile'];
    }
    if (cf.triggerStyle) {
      merged.configurator.triggerStyleDesktop = cf.triggerStyle.desktop as TypeSettings['configurator']['triggerStyleDesktop'];
      merged.configurator.triggerStyleMobile = cf.triggerStyle.mobile as TypeSettings['configurator']['triggerStyleMobile'];
    }
    if (cf.variants?.displayMode) {
      merged.configurator.variantDisplayDesktop = cf.variants.displayMode.desktop as TypeSettings['configurator']['variantDisplayDesktop'];
      merged.configurator.variantDisplayMobile = cf.variants.displayMode.mobile as TypeSettings['configurator']['variantDisplayMobile'];
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

  if (saved.branding) {
    merged.branding = { ...merged.branding };
    if (saved.branding.logoURL !== undefined) merged.branding.logoURL = saved.branding.logoURL ?? '';
    if (saved.branding.mobileLogoURL !== undefined) merged.branding.mobileLogoURL = saved.branding.mobileLogoURL ?? '';
    if (saved.branding.cssString !== undefined) {
      const { style: pulled, rest } = pullRootVariablesFromCss(saved.branding.cssString);
      merged.style = { ...merged.style, ...pulled };
      merged.branding.cssString = rest;
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
    );
  }
  return state;
}
