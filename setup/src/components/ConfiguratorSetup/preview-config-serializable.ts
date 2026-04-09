/**
 * Serializable config for postMessage - no functions, only plain data.
 * The preview iframe reconstructs the full InjectConfiguratorOptions from this.
 */
export interface SerializableInjectConfig {
  apiKey: string;
  productLink: string;
  selectors: Record<string, string | { selector: string; replace: boolean }>;
  carousel?: {
    desktop: string;
    mobile: string;
    maxImages?: number | { desktop: number; mobile: number };
  };
  configurator?: {
    displayMode: { desktop: string; mobile: string };
    triggerStyle?: { desktop: string; mobile: string };
    variants?: {
      displayMode: { desktop: string; mobile: string };
      useSimpleVariantsSelector?: boolean;
      /** Option ids/names omitted from variant UI (ov25-ui `hideOptions`). */
      hideOptions?: string[];
    };
  };
  flags?: Record<string, boolean>;
  branding?: { logoURL?: string; mobileLogoURL?: string; cssString?: string };
  /** OV25 bed iframe `bedAllowNone` (see main package `InjectConfiguratorOptions.bed`). */
  bed?: {
    allowNone: { headboard: boolean; base: boolean; mattress: boolean };
    filterSelectionsByCurrentSize?: { headboard: boolean; base: boolean; mattress: boolean };
  };
  images?: string[];
  uniqueId?: string;
}
