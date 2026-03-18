import '../globals.css';

export { default as ConfiguratorSetup } from './components/ConfiguratorSetup';
export { ConfigPanel } from './components/ConfiguratorSetup/ConfigPanel';
export { PreviewArea } from './components/ConfiguratorSetup/PreviewArea';

export type { ConfiguratorSetupProps, ConfiguratorSetupPayload } from './components/ConfiguratorSetup';
export type { LayoutType } from './lib/config/preview-config';
export type { SerializableInjectConfig } from './components/ConfiguratorSetup/preview-config-serializable';
export type { TypeSettings, ConfiguratorSetupFormState, SelectorFormState } from './components/ConfiguratorSetup/types';

export { buildSerializableConfig } from './components/ConfiguratorSetup/useConfiguratorSetup';
export { STYLE_GROUPS, generateVariableCSS, generateElementCSS } from './lib/config/configurator-style-variables';
