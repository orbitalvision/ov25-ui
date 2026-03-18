import { useConfiguratorSetup } from './useConfiguratorSetup';
import type { ConfiguratorSetupOverrides, ConfiguratorSetupPayload } from './useConfiguratorSetup';
import { ConfigPanel } from './ConfigPanel';
import { PreviewArea } from './PreviewArea';

export interface ConfiguratorSetupProps {
  apiKey?: string;
  productLink?: string;
  previewBaseUrl?: string;
  initialConfig?: ConfiguratorSetupPayload;
  onSave?: (payload: ConfiguratorSetupPayload) => void;
  hidePreview?: boolean;
  hideSaveButton?: boolean;
}

export type { ConfiguratorSetupPayload };

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
    <div className="h-screen flex">
      {!props.hidePreview && (
        <main className="flex-1 min-h-0 p-4">
          <PreviewArea serializableConfig={serializableConfig} previewBaseUrl={props.previewBaseUrl} />
        </main>
      )}
      <aside className={props.hidePreview ? 'w-full' : 'w-[370px] shrink-0 border-l bg-background/50 px-4 pt-4 pb-4 overflow-hidden'}>
        <ConfigPanel
          formState={formState}
          currentSettings={currentSettings}
          setLayout={setLayout}
          updateSettings={updateSettings}
          updateNested={updateNested}
          getExportJson={getExportJson}
          onSave={props.onSave}
          hideSaveButton={props.hideSaveButton}
        />
      </aside>
    </div>
  );
}
