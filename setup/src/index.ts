import '../globals.css';

export { default as ConfiguratorSetup } from './components/ConfiguratorSetup';
export { ConfigPanel } from './components/ConfiguratorSetup/ConfigPanel';
export { PreviewArea } from './components/ConfiguratorSetup/PreviewArea';

export type { ConfiguratorSetupProps, ConfiguratorSetupPayload } from './components/ConfiguratorSetup';
export type {
  StorefrontIntegrationConfig,
  StorefrontIntegrationErrorConfig,
  StorefrontIntegrationField,
  StorefrontIntegrationLoadingConfig,
  StorefrontIntegrationReadyConfig,
  StorefrontIntegrationSection,
  StorefrontIntegrationSelectField,
  StorefrontIntegrationSelectOption,
  StorefrontIntegrationSelectorField,
  StorefrontIntegrationSwitchField,
  StorefrontIntegrationTextField,
  StorefrontIntegrationValue,
} from './components/ConfiguratorSetup/storefront-integration';
export type { LayoutType } from './lib/config/preview-config';
export type { SerializableInjectConfig } from './components/ConfiguratorSetup/preview-config-serializable';
export type { TypeSettings, ConfiguratorSetupFormState, SelectorFormState } from './components/ConfiguratorSetup/types';

export {
  buildSerializableConfig,
  buildConfiguratorSetupPayload,
  buildDefaultConfiguratorSetupPayload,
} from './components/ConfiguratorSetup/serialize-config';
export type { ConfiguratorSetupPreviewImages } from './components/ConfiguratorSetup/serialize-config';
export { STYLE_GROUPS, generateVariableCSS, generateElementCSS } from './lib/config/configurator-style-variables';

export type { ConfiguratorSetupLivePreviewConfig, ConfiguratorSetupLivePreviewRequest, ConfiguratorSetupPlacementValidation, ConfiguratorSetupPlacementCheck, ConfiguratorSetupPlacementKey, ConfiguratorSetupPlacementStatus, ConfiguratorSetupPlacementIssue } from './components/ConfiguratorSetup/live-preview';
export type { ConfiguratorSetupCompatibility } from './components/ConfiguratorSetup/compatibility';
export { LEGACY_SETUP_FEATURES } from './components/ConfiguratorSetup/compatibility';
export { ThemePalettePreview } from './components/ConfiguratorSetup/ThemePalettePreview';
export type { ThemeStyleProposal, ThemeStyleFont, ConfiguratorSetupThemeStyling } from './components/ConfiguratorSetup/theme-style';
export { validateThemeStyleProposal, THEME_STYLE_FEATURE, THEME_FONTS_FEATURE } from './components/ConfiguratorSetup/theme-style';
export type { ConfiguratorSetupSelectorDiscovery, SelectorDiscoveryProposal, SelectorDiscoveryTarget, SelectorDiscoveryKey } from './components/ConfiguratorSetup/selector-discovery';
export { validateSelectorDiscoveryProposal } from './components/ConfiguratorSetup/selector-discovery';
