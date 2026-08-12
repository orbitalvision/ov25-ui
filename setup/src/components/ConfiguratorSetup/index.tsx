import { useConfiguratorSetup } from './useConfiguratorSetup';
import type { ConfiguratorSetupOverrides, ConfiguratorSetupPayload } from './useConfiguratorSetup';
import { ConfigPanel } from './ConfigPanel';
import { PreviewArea } from './PreviewArea';
import type { StorefrontIntegrationConfig } from './storefront-integration';

export interface ConfiguratorSetupProps {
  apiKey?: ConfiguratorSetupOverrides['apiKey'];
  productLink?: ConfiguratorSetupOverrides['productLink'];
  previewBaseUrl?: string;
  /**
   * `true`: use `http://app.localhost:3000/configurator-preview` when setup runs locally.
   * `false` or omitted: use `https://app.ov25.ai/configurator-preview`.
   * `previewBaseUrl` takes priority over this option.
   */
  useLocalPreview?: boolean;
  initialConfig?: ConfiguratorSetupPayload;
  onSave?: (payload: ConfiguratorSetupPayload) => void;
  hidePreview?: boolean;
  hideSaveButton?: boolean;
  storefrontIntegration?: StorefrontIntegrationConfig;
  className?: string;
}

export type { ConfiguratorSetupPayload, StorefrontIntegrationConfig };

export default function ConfiguratorSetup(props: ConfiguratorSetupProps) {
  const overrides: ConfiguratorSetupOverrides = {
    apiKey: props.apiKey,
    productLink: props.productLink,
    previewBaseUrl: props.previewBaseUrl,
    initialConfig: props.initialConfig,
    onSave: props.onSave,
    hidePreview: props.hidePreview,
    hideSaveButton: props.hideSaveButton,
  };

  const {
    formState,
    currentSettings,
    setLayout,
    updateSettings,
    updateNested,
    serializableConfig,
    getExportJson,
  } = useConfiguratorSetup(overrides);

  return (
    <div className={props.className || 'flex h-screen min-w-0 overflow-hidden'}>
      {!props.hidePreview && (
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden p-0">
          <PreviewArea serializableConfig={serializableConfig} previewBaseUrl={props.previewBaseUrl} useLocalPreview={props.useLocalPreview} />
        </main>
      )}
      <aside className={props.hidePreview ? 'flex h-full w-full min-w-0 flex-col overflow-hidden' : 'flex h-full w-[370px] shrink-0 flex-col overflow-hidden border-l bg-white px-4 pt-4 pb-4 min-w-0'}>
        <ConfigPanel
          formState={formState}
          currentSettings={currentSettings}
          setLayout={setLayout}
          updateSettings={updateSettings}
          updateNested={updateNested}
          getExportJson={getExportJson}
          onSave={props.onSave}
          hideSaveButton={props.hideSaveButton}
          storefrontIntegration={props.storefrontIntegration}
        />
      </aside>
    </div>
  );
}
