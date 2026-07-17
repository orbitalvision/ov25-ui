import { describe, expect, it } from 'vitest';
import {
  buildFormStateFromInitialPayload,
  type ConfiguratorSetupPayload,
} from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';
import {
  buildConfiguratorSetupPayload,
  buildSerializableConfig,
} from '../../setup/src/components/ConfiguratorSetup/serialize-config';

describe('ConfiguratorSetup hideGestureHint flag', () => {
  it('defaults to false for every layout and preview config', () => {
    const state = buildFormStateFromInitialPayload({});

    for (const layout of ['standard', 'snap2', 'bedConfigurator'] as const) {
      expect(state.typeSettings[layout].flags.hideGestureHint).toBe(false);
      expect(
        buildSerializableConfig(layout, state.typeSettings[layout]).flags?.hideGestureHint,
      ).toBe(false);
    }
  });

  it('persists, imports, previews, and round-trips the grouped flag', () => {
    const state = buildFormStateFromInitialPayload({});
    state.typeSettings.standard.flags.hideGestureHint = true;
    state.typeSettings.snap2.flags.hideGestureHint = false;
    state.typeSettings.bedConfigurator.flags.hideGestureHint = true;

    const saved = buildConfiguratorSetupPayload(state);
    const persisted = JSON.parse(JSON.stringify(saved)) as ConfiguratorSetupPayload;
    const restored = buildFormStateFromInitialPayload(persisted);
    const roundTripped = buildConfiguratorSetupPayload(restored);

    expect(persisted.standard.flags?.hideGestureHint).toBe(true);
    expect(persisted.snap2.flags?.hideGestureHint).toBe(false);
    expect(persisted.bedConfigurator.flags?.hideGestureHint).toBe(true);
    expect(restored.typeSettings.standard.flags.hideGestureHint).toBe(true);
    expect(restored.typeSettings.snap2.flags.hideGestureHint).toBe(false);
    expect(restored.typeSettings.bedConfigurator.flags.hideGestureHint).toBe(true);
    expect(
      buildSerializableConfig('standard', restored.typeSettings.standard).flags
        ?.hideGestureHint,
    ).toBe(true);
    expect(roundTripped).toEqual(persisted);
    expect(roundTripped.standard).not.toHaveProperty('hideGestureHint');
  });
});
