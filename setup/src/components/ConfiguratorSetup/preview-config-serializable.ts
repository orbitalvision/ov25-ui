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
    };
  };
  flags?: Record<string, boolean>;
  branding?: { logoURL?: string; mobileLogoURL?: string; cssString?: string };
  images?: string[];
  uniqueId?: string;
}
