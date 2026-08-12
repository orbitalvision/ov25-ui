export type StorefrontIntegrationValue = string | boolean;

interface StorefrontIntegrationFieldBase {
  key: string;
  label: string;
  description?: string;
  placeholder?: string;
}

export interface StorefrontIntegrationSelectorField
  extends StorefrontIntegrationFieldBase {
  type: 'selector';
}

export interface StorefrontIntegrationTextField
  extends StorefrontIntegrationFieldBase {
  type: 'text';
}

export interface StorefrontIntegrationSwitchField
  extends StorefrontIntegrationFieldBase {
  type: 'switch';
}

export interface StorefrontIntegrationSelectOption {
  value: string;
  label: string;
}

export interface StorefrontIntegrationSelectField
  extends StorefrontIntegrationFieldBase {
  type: 'select';
  options: readonly StorefrontIntegrationSelectOption[];
}

export type StorefrontIntegrationField =
  | StorefrontIntegrationSelectorField
  | StorefrontIntegrationTextField
  | StorefrontIntegrationSwitchField
  | StorefrontIntegrationSelectField;

export interface StorefrontIntegrationSection {
  id: string;
  title: string;
  description?: string;
  fields: readonly StorefrontIntegrationField[];
}

export interface StorefrontIntegrationLoadingConfig {
  status: 'loading';
  platformLabel?: string;
  message?: string;
}

export interface StorefrontIntegrationErrorConfig {
  status: 'error';
  platformLabel?: string;
  message: string;
  onRetry?: () => void;
}

export interface StorefrontIntegrationReadyConfig {
  status: 'ready';
  platformLabel: string;
  scopeLabel?: string;
  notice?: string;
  readOnly?: boolean;
  sections: readonly StorefrontIntegrationSection[];
  values: Readonly<Record<string, StorefrontIntegrationValue>>;
  onChange: (key: string, value: StorefrontIntegrationValue) => void;
}

/**
 * Host-owned, platform-specific settings rendered by the shared setup UI.
 * These values are intentionally separate from setup JSON and editor draft state.
 */
export type StorefrontIntegrationConfig =
  | StorefrontIntegrationLoadingConfig
  | StorefrontIntegrationErrorConfig
  | StorefrontIntegrationReadyConfig;
