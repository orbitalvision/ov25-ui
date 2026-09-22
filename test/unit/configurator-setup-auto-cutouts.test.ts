import { describe, expect, it } from 'vitest';
import {
  buildFormStateFromInitialPayload,
  type ConfiguratorSetupPayload,
} from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';
import { buildSerializableConfig } from '../../setup/src/components/ConfiguratorSetup/serialize-config';
import { DEFAULT_TYPE_SETTINGS } from '../../setup/src/components/ConfiguratorSetup/types';

describe('ConfiguratorSetup auto cutouts toggle', () => {
  it('defaults to off', () => {
    expect(DEFAULT_TYPE_SETTINGS.standard.carousel.autoCutouts).toBe(false);
    expect(
      buildSerializableConfig('standard', DEFAULT_TYPE_SETTINGS.standard).carousel?.autoCutouts,
    ).toBeUndefined();
  });

  it('serializes the flag into the carousel config when switched on', () => {
    const settings = {
      ...DEFAULT_TYPE_SETTINGS.standard,
      carousel: { ...DEFAULT_TYPE_SETTINGS.standard.carousel, autoCutouts: true },
    };

    expect(buildSerializableConfig('standard', settings).carousel?.autoCutouts).toBe(true);
  });

  it('round-trips a saved payload back into the form', () => {
    const payload = {
      standard: {
        carousel: { desktop: 'carousel', mobile: 'carousel', autoCutouts: true },
      },
    } as unknown as Partial<ConfiguratorSetupPayload>;

    const state = buildFormStateFromInitialPayload(payload);

    expect(state.typeSettings.standard.carousel.autoCutouts).toBe(true);
  });

  it('leaves a legacy payload without the flag switched off', () => {
    const payload = {
      standard: { carousel: { desktop: 'carousel', mobile: 'carousel' } },
    } as unknown as Partial<ConfiguratorSetupPayload>;

    const state = buildFormStateFromInitialPayload(payload);

    expect(state.typeSettings.standard.carousel.autoCutouts).toBe(false);
  });
});
