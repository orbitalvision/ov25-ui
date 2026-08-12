import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { ConfigPanel } from '../../setup/src/components/ConfiguratorSetup/ConfigPanel';
import type { ConfiguratorSetupPayload } from '../../setup/src/components/ConfiguratorSetup';
import type { StorefrontIntegrationConfig } from '../../setup/src/components/ConfiguratorSetup/storefront-integration';
import { buildConfiguratorSetupPayload } from '../../setup/src/components/ConfiguratorSetup/serialize-config';
import {
  DEFAULT_FORM_STATE,
  DEFAULT_TYPE_SETTINGS,
  type PreviewLayoutType,
} from '../../setup/src/components/ConfiguratorSetup/types';

function renderPanel(options?: {
  hideSaveButton?: boolean;
  layout?: PreviewLayoutType;
  onSave?: (payload: ConfiguratorSetupPayload) => void;
  storefrontIntegration?: StorefrontIntegrationConfig;
}) {
  const layout = options?.layout ?? 'standard';
  const formState = { ...DEFAULT_FORM_STATE, layout };
  const setLayout = vi.fn();
  const updateSettings = vi.fn();
  const updateNested = vi.fn();
  const payload = buildConfiguratorSetupPayload(formState);
  const getExportJson = vi.fn(() => payload);
  const onSave = options?.onSave ?? vi.fn();

  return render(
    <div style={{ width: 370, height: 800 }}>
      <ConfigPanel
        formState={formState}
        currentSettings={DEFAULT_TYPE_SETTINGS[layout]}
        setLayout={setLayout}
        updateSettings={updateSettings}
        updateNested={updateNested}
        getExportJson={getExportJson}
        onSave={onSave}
        hideSaveButton={options?.hideSaveButton ?? true}
        storefrontIntegration={options?.storefrontIntegration}
      />
    </div>,
  ).then((result) => ({
    ...result,
    getExportJson,
    onSave,
    payload,
    setLayout,
    updateNested,
  }));
}

test('keeps Product Type above and outside the Settings and Style tabs', async () => {
  const { container, getByRole, updateNested } = await renderPanel();
  const productType = container.querySelector<HTMLElement>('[data-ov25-setup-product-type]');
  const tabs = container.querySelector<HTMLElement>('[data-ov25-setup-editor-tabs]');

  expect(productType).not.toBeNull();
  expect(tabs).not.toBeNull();
  expect(getByRole('tab', { name: 'Global' }).query()).toBeNull();
  expect(
    productType!.compareDocumentPosition(tabs!) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  await expect.element(getByRole('heading', { name: 'Display & layout' })).toBeVisible();
  await expect.element(getByRole('heading', { name: 'Variant experience' })).toBeVisible();
  await expect.element(getByRole('heading', { name: 'Storefront selectors' })).toBeVisible();
  await expect.element(getByRole('heading', { name: 'Behaviour' })).toBeVisible();
  const configuratorSelector = getByRole('textbox', { name: 'Configurator container selector' });
  await expect.element(configuratorSelector).toHaveValue('.configurator-container');
  await configuratorSelector.fill('#product-configurator');
  expect(updateNested).toHaveBeenCalledWith('selectors', 'gallery', {
    enabled: true,
    selector: '#product-configurator',
    replace: true,
  });

  await getByRole('tab', { name: 'Style' }).click();

  await expect.element(productType!).toBeVisible();
  await expect.element(getByRole('heading', { name: 'Brand identity' })).toBeVisible();
  await expect.element(getByRole('textbox', { name: 'Logo URL', exact: true })).toBeVisible();
  await expect.element(getByRole('textbox', { name: 'Mobile logo URL', exact: true })).toBeVisible();
  await expect.element(getByRole('heading', { name: 'Custom CSS' })).toBeInTheDocument();
});

test('keeps Product Type selection wired to the existing layout state', async () => {
  const { getByRole, setLayout } = await renderPanel();

  await getByRole('button', { name: /Bed/ }).click();

  expect(setLayout).toHaveBeenCalledOnce();
  expect(setLayout).toHaveBeenCalledWith('bedConfigurator');
});

test('preserves the existing all-layout save payload', async () => {
  const onSave = vi.fn();
  const { getByRole, getExportJson, payload } = await renderPanel({
    hideSaveButton: false,
    onSave,
  });

  await getByRole('button', { name: 'Save' }).click();

  expect(getExportJson).toHaveBeenCalledWith('all');
  expect(onSave).toHaveBeenCalledWith(payload);
});

test('keeps Bed-only controls in Variant experience', async () => {
  const { getByRole } = await renderPanel({ layout: 'bedConfigurator' });

  await expect.element(getByRole('heading', { name: 'Bed — allow “None”' })).toBeInTheDocument();
  await expect.element(getByRole('heading', { name: 'Bed — matching sizes' })).toBeInTheDocument();
});

const INTEGRATION_SECTIONS = [
  {
    id: 'theme-targets',
    title: 'Theme targets',
    description: 'Connect OV25 to platform-owned storefront elements.',
    fields: [
      {
        type: 'selector' as const,
        key: 'headerSelector',
        label: 'Header selector',
        description: 'The sticky storefront header.',
        placeholder: '.site-header',
      },
      {
        type: 'text' as const,
        key: 'currencyCode',
        label: 'Currency code',
        placeholder: 'GBP',
      },
      {
        type: 'switch' as const,
        key: 'nativeCart',
        label: 'Use native cart',
      },
      {
        type: 'select' as const,
        key: 'cartMode',
        label: 'Cart mode',
        options: [
          { value: 'drawer', label: 'Drawer' },
          { value: 'page', label: 'Cart page' },
        ],
      },
    ],
  },
];

function readyIntegration(
  onChange = vi.fn(),
  overrides: Partial<Extract<StorefrontIntegrationConfig, { status: 'ready' }>> = {},
): Extract<StorefrontIntegrationConfig, { status: 'ready' }> {
  return {
    status: 'ready',
    platformLabel: 'Shopify integration',
    scopeLabel: 'demo.myshopify.com · Store-wide',
    notice: 'These values are stored by Shopify, outside setup JSON.',
    sections: INTEGRATION_SECTIONS,
    values: {
      headerSelector: '.shopify-section-header',
      currencyCode: 'GBP',
      nativeCart: false,
      cartMode: 'drawer',
    },
    onChange,
    ...overrides,
  };
}

test('adds the Global tab when a storefront integration schema is supplied', async () => {
  const { container, getByRole } = await renderPanel({
    storefrontIntegration: readyIntegration(),
  });
  const productType = container.querySelector<HTMLElement>('[data-ov25-setup-product-type]');
  const tabs = container.querySelector<HTMLElement>('[data-ov25-setup-editor-tabs]');

  await expect.element(getByRole('tab', { name: 'Global' })).toBeVisible();
  expect(
    productType!.compareDocumentPosition(tabs!) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();

  await getByRole('tab', { name: 'Global' }).click();
  await expect.element(getByRole('heading', { name: 'Shopify integration' })).toBeVisible();
  await expect.element(getByRole('heading', { name: 'Theme targets' })).toBeVisible();
  await expect.element(getByRole('textbox', { name: 'Header selector' })).toHaveValue(
    '.shopify-section-header',
  );
  await expect.element(getByRole('textbox', { name: 'Currency code' })).toHaveValue('GBP');
  await expect.element(getByRole('switch', { name: 'Use native cart' })).toBeVisible();
  await expect.element(getByRole('combobox', { name: 'Cart mode' })).toBeVisible();
});

test('routes shared integration field edits through the external onChange callback', async () => {
  const onChange = vi.fn();
  const { getByRole } = await renderPanel({
    storefrontIntegration: readyIntegration(onChange),
  });

  await getByRole('tab', { name: 'Global' }).click();
  await getByRole('textbox', { name: 'Header selector' }).fill('#shopify-header');
  expect(onChange).toHaveBeenLastCalledWith('headerSelector', '#shopify-header');

  await getByRole('switch', { name: 'Use native cart' }).click();
  expect(onChange).toHaveBeenLastCalledWith('nativeCart', true);

  await getByRole('combobox', { name: 'Cart mode' }).click();
  await getByRole('option', { name: 'Cart page' }).click();
  expect(onChange).toHaveBeenLastCalledWith('cartMode', 'page');
});

test('renders the integration loading state', async () => {
  const loading = await renderPanel({
    storefrontIntegration: {
      status: 'loading',
      platformLabel: 'Shopify integration',
      message: 'Reading store metafields…',
    },
  });
  await loading.getByRole('tab', { name: 'Global' }).click();
  await expect.element(loading.getByRole('status')).toHaveTextContent('Reading store metafields');
});

test('renders a retryable integration error state', async () => {
  const onRetry = vi.fn();
  const failed = await renderPanel({
    storefrontIntegration: {
      status: 'error',
      platformLabel: 'Shopify integration',
      message: 'Shopify did not return the requested settings.',
      onRetry,
    },
  });
  await failed.getByRole('tab', { name: 'Global' }).click();
  await expect.element(failed.getByRole('alert')).toHaveTextContent(
    'Shopify did not return the requested settings.',
  );
  await failed.getByRole('button', { name: 'Retry' }).click();
  expect(onRetry).toHaveBeenCalledOnce();
});

test('disables integration controls in the read-only state', async () => {
  const onChange = vi.fn();
  const readOnly = await renderPanel({
    storefrontIntegration: readyIntegration(onChange, { readOnly: true }),
  });
  await readOnly.getByRole('tab', { name: 'Global' }).click();
  await expect.element(readOnly.getByRole('status')).toHaveTextContent('read-only');
  await expect.element(readOnly.getByRole('textbox', { name: 'Header selector' })).toBeDisabled();
  await expect.element(readOnly.getByRole('switch', { name: 'Use native cart' })).toBeDisabled();
  expect(onChange).not.toHaveBeenCalled();
});

test('keeps the setup JSON Save action visible and unchanged on Global', async () => {
  const onSave = vi.fn();
  const { getByRole, getExportJson, payload } = await renderPanel({
    hideSaveButton: false,
    onSave,
    storefrontIntegration: readyIntegration(),
  });

  await getByRole('tab', { name: 'Global' }).click();
  await getByRole('button', { name: 'Save' }).click();

  expect(getExportJson).toHaveBeenCalledWith('all');
  expect(onSave).toHaveBeenCalledWith(payload);
});
