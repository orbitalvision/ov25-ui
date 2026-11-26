import * as React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildConfiguratorSetupPayload,
  buildSerializableConfig,
  type ConfiguratorSetupSerializableOverrides,
} from '../../setup/src/components/ConfiguratorSetup/serialize-config';
import { buildFormStateFromInitialPayload } from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';
import { useConfiguratorSetup } from '../../setup/src/components/ConfiguratorSetup/useConfiguratorSetup';
import {
  DEFAULT_PREVIEW_API_KEY,
  PREVIEW_PRODUCT_LINKS,
  SNAP2_PREVIEW_STARTING_CONFIG_UUID,
} from '../../setup/src/lib/config/preview-config';

vi.mock('../../setup/node_modules/react/index.js', async () => vi.importActual('react'));

const customPreview: ConfiguratorSetupSerializableOverrides = {
  apiKey: { standard: 'organisation-key', snap2: 'organisation-key' },
  productLink: { standard: '1234', snap2: 'snap2/456' },
  previewImages: { standard: ['https://images.example/actual-product.jpg'] },
};

describe('organisation products in the embedded setup preview', () => {
  beforeEach(() => localStorage.clear());

  it('uses the original product and API key together for unresolved layouts', () => {
    const state = buildFormStateFromInitialPayload({});
    const config = buildSerializableConfig('bedConfigurator', state.typeSettings.bedConfigurator, customPreview);
    expect(config.apiKey).toBe(DEFAULT_PREVIEW_API_KEY);
    expect(config.productLink).toBe(PREVIEW_PRODUCT_LINKS.bedConfigurator);
    expect(config.images).toEqual(['https://app.ov25.ai/bed-config.jpg']);
  });

  it.each(['standard', 'bedConfigurator'] as const)('does not show the fixture images for a custom %s product', (layout) => {
    const state = buildFormStateFromInitialPayload({});
    const config = buildSerializableConfig(layout, state.typeSettings[layout], {
      apiKey: { [layout]: 'organisation-key' },
      productLink: { [layout]: layout === 'standard' ? '1234' : 'bed-configurator/567' },
    });
    expect(config.images).toEqual([]);
  });

  it('uses host images, including an explicitly empty list, only for their matching layout', () => {
    const state = buildFormStateFromInitialPayload({});
    expect(buildSerializableConfig('standard', state.typeSettings.standard, customPreview).images)
      .toEqual(['https://images.example/actual-product.jpg']);
    expect(buildSerializableConfig('snap2', state.typeSettings.snap2, customPreview).images).toEqual([]);
    expect(buildSerializableConfig('standard', state.typeSettings.standard, {
      ...customPreview, previewImages: { standard: [] },
    }).images).toEqual([]);
  });

  it('only applies the built-in Snap2 starting configuration to its own demo identity', () => {
    const state = buildFormStateFromInitialPayload({});
    const settings = { ...state.typeSettings.snap2, snap2UseStartingConfig: true };
    expect(buildSerializableConfig('snap2', settings).productLink)
      .toBe(`${PREVIEW_PRODUCT_LINKS.snap2}?configuration_uuid=${SNAP2_PREVIEW_STARTING_CONFIG_UUID}`);
    expect(buildSerializableConfig('snap2', settings, customPreview).productLink).toBe('snap2/456');
    expect(buildSerializableConfig('snap2', settings, {
      apiKey: { snap2: 'organisation-key' }, productLink: { snap2: PREVIEW_PRODUCT_LINKS.snap2 },
    }).productLink).toBe(PREVIEW_PRODUCT_LINKS.snap2);
  });

  it('excludes product identities and images from saved settings', () => {
    const state = buildFormStateFromInitialPayload({});
    const saved = buildConfiguratorSetupPayload(state, customPreview);
    expect(saved).toEqual(buildConfiguratorSetupPayload(state));
    expect(JSON.stringify(saved)).not.toMatch(/organisation-key|actual-product|1234|snap2\/456/);
  });

  it('preserves preset edits and draft identity when products load or the selected product changes', () => {
    const initialProps: ConfiguratorSetupSerializableOverrides = {};
    const { result, rerender } = renderHook(
      (props: ConfiguratorSetupSerializableOverrides) => useConfiguratorSetup({ ...props, draftKey: 'shop-1' }),
      { initialProps },
    );
    act(() => {
      result.current.applyPreset('classic');
      result.current.updateNested('branding', 'logoURL', 'https://images.example/custom-logo.png');
    });
    const originalDraft = result.current.formState;
    const hydrationKey = result.current.hydrationKey;
    rerender(customPreview);
    expect(result.current.serializableConfig.productLink).toBe('1234');
    expect(result.current.serializableConfig.apiKey).toBe('organisation-key');
    expect(result.current.formState).toBe(originalDraft);
    expect(result.current.hydrationKey).toBe(hydrationKey);
    rerender({ ...customPreview, productLink: { standard: '9876' } });
    expect(result.current.serializableConfig.productLink).toBe('9876');
    expect(result.current.formState).toBe(originalDraft);
    expect(result.current.currentSettings.branding.logoURL).toBe('https://images.example/custom-logo.png');
    for (let index = 0; index < localStorage.length; index += 1) {
      expect(localStorage.getItem(localStorage.key(index)!)).not.toContain('organisation-key');
    }
  });
});
