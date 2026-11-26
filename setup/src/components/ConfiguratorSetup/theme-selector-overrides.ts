import type { SelectorFormState, ThemeSelectorOverrides, TypeSettings } from './types';

/**
 * Per-theme placement overrides (see OV25 docs/shopify-theme-specific-placements.md).
 *
 * `settings.selectors` always holds the live theme's values so storefronts on plugin
 * versions without theme lookup keep working. `themeSelectors[themeId]` only holds the
 * slots that differ for another theme (usually a draft being redesigned).
 */
export type SelectorKey = keyof TypeSettings['selectors'];
/** Advertised by plugin builds that resolve `themeSelectors`; older builds ignore the field. */
export const THEME_SELECTORS_FEATURE = 'placement:theme-selectors-v1';
export type SelectorOverrideTheme = { id: string; label: string; live?: boolean };

/** Shopify GIDs and numeric IDs both normalise to the numeric id the storefront exposes as theme.id. */
export function normalizeThemeId(themeId: string | null | undefined): string | undefined {
  const id = themeId?.trim().split('/').pop();
  return id && /^\d+$/.test(id) ? id : undefined;
}

export function themeSelectorOverride(settings: TypeSettings, themeId: string | null | undefined, key: SelectorKey): SelectorFormState | undefined {
  const id = normalizeThemeId(themeId);
  return id ? settings.themeSelectors?.[id]?.[key] : undefined;
}

/** The selectors a theme actually gets: its overrides on top of the defaults. */
export function effectiveSelectors(settings: TypeSettings, themeId: string | null | undefined): TypeSettings['selectors'] {
  const id = normalizeThemeId(themeId);
  const overrides = id ? settings.themeSelectors?.[id] : undefined;
  return overrides ? { ...settings.selectors, ...overrides } as TypeSettings['selectors'] : settings.selectors;
}

function withOverrides(settings: TypeSettings, id: string, next: ThemeSelectorOverrides[string] | undefined): TypeSettings {
  const themeSelectors: ThemeSelectorOverrides = { ...settings.themeSelectors };
  if (next && Object.keys(next).length) themeSelectors[id] = next; else delete themeSelectors[id];
  const { themeSelectors: _old, ...rest } = settings;
  return Object.keys(themeSelectors).length ? { ...rest, themeSelectors } : rest;
}

/** Set (or with `undefined`, reset to default) one slot for a theme. An override equal to the default is dropped. */
export function setThemeSelectorOverride(settings: TypeSettings, themeId: string, key: SelectorKey, value: SelectorFormState | undefined): TypeSettings {
  const id = normalizeThemeId(themeId);
  if (!id) return settings;
  const current = { ...settings.themeSelectors?.[id] };
  const base = settings.selectors[key];
  if (!value || (value.enabled === base.enabled && value.selector.trim() === base.selector.trim() && value.replace === base.replace)) delete current[key];
  else current[key] = { ...value };
  return withOverrides(settings, id, current);
}

/** Make a theme's overrides the default (e.g. once that theme is live) and remove them. */
export function promoteThemeSelectors(settings: TypeSettings, themeId: string): TypeSettings {
  const id = normalizeThemeId(themeId);
  const overrides = id ? settings.themeSelectors?.[id] : undefined;
  if (!id || !overrides) return settings;
  return withOverrides({ ...settings, selectors: { ...settings.selectors, ...overrides } as TypeSettings['selectors'] }, id, undefined);
}

/** Drop overrides for themes that no longer exist in the store. */
export function pruneThemeSelectors(settings: TypeSettings, existingThemeIds: readonly string[]): TypeSettings {
  if (!settings.themeSelectors) return settings;
  const keep = new Set(existingThemeIds.map(normalizeThemeId).filter(Boolean));
  let next = settings;
  for (const id of Object.keys(settings.themeSelectors)) if (!keep.has(id)) next = withOverrides(next, id, undefined);
  return next;
}

export function hasThemeSelectorOverrides(settings: TypeSettings, themeId: string | null | undefined): boolean {
  const id = normalizeThemeId(themeId);
  return Boolean(id && settings.themeSelectors?.[id] && Object.keys(settings.themeSelectors[id]).length);
}

/** Save-time pruning on the runtime payload: drop overrides for themes no longer in the store. */
export function pruneThemeSelectorsInPayload<T extends Record<string, unknown>>(payload: T, existingThemeIds: readonly string[] | undefined): T {
  if (!existingThemeIds) return payload;
  const keep = new Set(existingThemeIds.map(normalizeThemeId).filter(Boolean));
  const next = { ...payload } as Record<string, unknown>;
  for (const [layout, value] of Object.entries(payload)) {
    const themeSelectors = (value as { themeSelectors?: Record<string, unknown> } | null)?.themeSelectors;
    if (!themeSelectors) continue;
    const kept = Object.fromEntries(Object.entries(themeSelectors).filter(([id]) => keep.has(id)));
    const { themeSelectors: _old, ...rest } = value as Record<string, unknown>;
    next[layout] = Object.keys(kept).length ? { ...rest, themeSelectors: kept } : rest;
  }
  return next as T;
}
