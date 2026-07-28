import { describe, expect, it } from 'vitest';
import {
  buildFormStateFromInitialPayload,
  type ConfiguratorSetupPayload,
} from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';
import { buildSerializableConfig } from '../../setup/src/components/ConfiguratorSetup/serialize-config';
import { mergeStoredTypeSettings } from '../../setup/src/components/ConfiguratorSetup/useConfiguratorSetup';
import {
  DEFAULT_TYPE_SETTINGS,
  type TypeSettings,
} from '../../setup/src/components/ConfiguratorSetup/types';

describe('ConfiguratorSetup inline-sticky display mode', () => {
  it('drops integration-owned selectors from fresh and legacy localStorage form state', () => {
    const legacySettings = {
      selectors: {
        ...DEFAULT_TYPE_SETTINGS.standard.selectors,
        header: {
          enabled: true,
          selector: '#saved-header',
          replace: false,
        },
        desktopCarousel: {
          enabled: true,
          selector: '#saved-desktop-carousel',
          replace: false,
        },
        mobileCarousel: {
          enabled: true,
          selector: '#saved-mobile-carousel',
          replace: false,
        },
      },
    } as unknown as Partial<TypeSettings>;

    const fresh = mergeStoredTypeSettings(DEFAULT_TYPE_SETTINGS.standard, undefined);
    const merged = mergeStoredTypeSettings(DEFAULT_TYPE_SETTINGS.standard, legacySettings);

    expect(fresh.selectors).not.toHaveProperty('header');
    expect(fresh.selectors).not.toHaveProperty('desktopCarousel');
    expect(fresh.selectors).not.toHaveProperty('mobileCarousel');
    expect(merged.selectors).not.toHaveProperty('header');
    expect(merged.selectors).not.toHaveProperty('desktopCarousel');
    expect(merged.selectors).not.toHaveProperty('mobileCarousel');
  });

  it('derives mobile inline-sticky when saved mobile mode is omitted', () => {
    const state = buildFormStateFromInitialPayload({
      standard: {
        configurator: {
          displayMode: { desktop: 'inline-sticky' },
        },
      },
    } as Partial<ConfiguratorSetupPayload>);

    expect(state.typeSettings.standard.configurator.displayModeDesktop).toBe('inline-sticky');
    expect(state.typeSettings.standard.configurator.displayModeMobile).toBe('inline-sticky');
  });

  it.each([
    ['sheet', 'sheet', 'drawer'],
    ['inline-sheet', 'sheet', 'drawer'],
    ['modal', 'modal', 'modal'],
    ['inline', 'inline', 'inline'],
  ] as const)(
    'derives mobile mode from saved desktop %s when mobile is omitted',
    (savedDesktop, expectedDesktop, expectedMobile) => {
      const state = buildFormStateFromInitialPayload({
        standard: {
          configurator: {
            displayMode: { desktop: savedDesktop },
          },
        },
      } as Partial<ConfiguratorSetupPayload>);

      expect(state.typeSettings.standard.configurator.displayModeDesktop).toBe(expectedDesktop);
      expect(state.typeSettings.standard.configurator.displayModeMobile).toBe(expectedMobile);
    },
  );

  it('preserves an explicit saved mobile mode', () => {
    const state = buildFormStateFromInitialPayload({
      standard: {
        configurator: {
          displayMode: { desktop: 'inline-sticky', mobile: 'drawer' },
        },
      },
    } as Partial<ConfiguratorSetupPayload>);

    expect(state.typeSettings.standard.configurator.displayModeDesktop).toBe('inline-sticky');
    expect(state.typeSettings.standard.configurator.displayModeMobile).toBe('drawer');
  });

  it('omits integration-owned selectors from setup defaults', () => {
    const state = buildFormStateFromInitialPayload({});
    const settings = state.typeSettings.standard;

    expect(settings.selectors).not.toHaveProperty('header');
    expect(settings.selectors).not.toHaveProperty('desktopCarousel');
    expect(settings.selectors).not.toHaveProperty('mobileCarousel');

    const config = buildSerializableConfig('standard', settings);

    expect(config.configurator?.displayMode).toEqual({ desktop: 'sheet', mobile: 'drawer' });
    expect(config.configurator).not.toHaveProperty('sticky');
    expect(config.selectors).not.toHaveProperty('header');
    expect(config.selectors).not.toHaveProperty('desktopCarousel');
    expect(config.selectors).not.toHaveProperty('mobileCarousel');
  });

  it('ignores saved integration-owned selectors', () => {
    const state = buildFormStateFromInitialPayload({
      standard: {
        selectors: {
          header: '#saved-header',
          desktopCarousel: '#saved-desktop-carousel',
          mobileCarousel: '#saved-mobile-carousel',
        },
        configurator: {
          displayMode: { desktop: 'inline-sticky', mobile: 'inline-sticky' },
        },
      },
    } as Partial<ConfiguratorSetupPayload>);
    const settings = state.typeSettings.standard;
    const config = buildSerializableConfig('standard', settings);

    expect(settings.selectors).not.toHaveProperty('header');
    expect(settings.selectors).not.toHaveProperty('desktopCarousel');
    expect(settings.selectors).not.toHaveProperty('mobileCarousel');
    expect(config.selectors).not.toHaveProperty('header');
    expect(config.selectors).not.toHaveProperty('desktopCarousel');
    expect(config.selectors).not.toHaveProperty('mobileCarousel');
  });

  it('round-trips sticky modes for the Bed standard shell', () => {
    const state = buildFormStateFromInitialPayload({
      bedConfigurator: {
        configurator: {
          displayMode: { desktop: 'inline-sticky', mobile: 'inline-sticky' },
        },
      },
    } as Partial<ConfiguratorSetupPayload>);
    const config = buildSerializableConfig('bedConfigurator', state.typeSettings.bedConfigurator);

    expect(state.typeSettings.bedConfigurator.configurator.displayModeDesktop).toBe('inline-sticky');
    expect(state.typeSettings.bedConfigurator.configurator.displayModeMobile).toBe('inline-sticky');
    expect(config.configurator?.displayMode).toEqual({ desktop: 'inline-sticky', mobile: 'inline-sticky' });
  });

  it.each(['standard', 'bedConfigurator', 'snap2'] as const)(
    'never exports saved integration-owned selectors for %s setup',
    (layout) => {
      const state = buildFormStateFromInitialPayload({
        [layout]: {
          selectors: {
            header: '#saved-header',
            desktopCarousel: '#saved-desktop-carousel',
            mobileCarousel: '#saved-mobile-carousel',
          },
        },
      } as Partial<ConfiguratorSetupPayload>);
      const settings = state.typeSettings[layout];
      const config = buildSerializableConfig(layout, settings);

      expect(settings.selectors).not.toHaveProperty('header');
      expect(settings.selectors).not.toHaveProperty('desktopCarousel');
      expect(settings.selectors).not.toHaveProperty('mobileCarousel');
      expect(config.selectors).not.toHaveProperty('header');
      expect(config.selectors).not.toHaveProperty('desktopCarousel');
      expect(config.selectors).not.toHaveProperty('mobileCarousel');
    },
  );
});

describe('ConfiguratorSetup preview overrides', () => {
  it('resolves apiKey and productLink overrides per preview layout', () => {
    const state = buildFormStateFromInitialPayload({});

    const standardConfig = buildSerializableConfig('standard', state.typeSettings.standard, {
      apiKey: {
        standard: 'diamond-key',
        snap2: 'whitemeadow-key',
      },
      productLink: {
        snap2: 'snap2/119',
      },
    });
    const snap2Config = buildSerializableConfig('snap2', state.typeSettings.snap2, {
      apiKey: {
        standard: 'diamond-key',
        snap2: 'whitemeadow-key',
      },
      productLink: {
        snap2: 'snap2/119',
      },
    });

    expect(standardConfig.apiKey).toBe('diamond-key');
    expect(standardConfig.productLink).toBe('58');
    expect(snap2Config.apiKey).toBe('whitemeadow-key');
    expect(snap2Config.productLink).toBe('snap2/119');
  });

  it('keeps existing string apiKey and productLink overrides global', () => {
    const state = buildFormStateFromInitialPayload({});

    const standardConfig = buildSerializableConfig('standard', state.typeSettings.standard, {
      apiKey: 'shared-key',
      productLink: 'shared-product',
    });
    const snap2Config = buildSerializableConfig('snap2', state.typeSettings.snap2, {
      apiKey: 'shared-key',
      productLink: 'shared-product',
    });

    expect(standardConfig.apiKey).toBe('shared-key');
    expect(standardConfig.productLink).toBe('shared-product');
    expect(snap2Config.apiKey).toBe('shared-key');
    expect(snap2Config.productLink).toBe('shared-product');
  });
});

describe('ConfiguratorSetup Snap2 export', () => {
  it('defaults Snap2 display modes to dialog/modal', () => {
    const state = buildFormStateFromInitialPayload({});
    const settings = state.typeSettings.snap2;

    expect(settings.configurator.displayModeDesktop).toBe('modal');
    expect(settings.configurator.displayModeMobile).toBe('modal');

    const config = buildSerializableConfig('snap2', settings);

    expect(config.configurator?.displayMode).toEqual({ desktop: 'modal', mobile: 'modal' });
    expect(config.selectors.configureButton).toBe('[data-ov25-configure-button]');
    expect(config.selectors).not.toHaveProperty('gallery');
    expect(config.selectors).not.toHaveProperty('initialiseMenu');
  });

  it('normalizes unsupported saved Snap2 display modes to modal', () => {
    const unsupportedModes = [
      { desktop: 'sheet', mobile: 'sheet' },
      { desktop: 'inline-sheet', mobile: 'variants-only-sheet' },
      { desktop: 'variants-only-sheet', mobile: 'inline-sheet' },
      { desktop: 'inline-sticky', mobile: 'inline-sticky' },
    ];

    for (const displayMode of unsupportedModes) {
      const state = buildFormStateFromInitialPayload({
        snap2: {
          configurator: { displayMode },
        },
      } as Partial<ConfiguratorSetupPayload>);

      expect(state.typeSettings.snap2.configurator.displayModeDesktop).toBe('modal');
      expect(state.typeSettings.snap2.configurator.displayModeMobile).toBe('modal');

      const config = buildSerializableConfig('snap2', state.typeSettings.snap2);

      expect(config.configurator?.displayMode).toEqual({ desktop: 'modal', mobile: 'modal' });
      expect(config.selectors).not.toHaveProperty('gallery');
      expect(config.selectors).not.toHaveProperty('initialiseMenu');
    }
  });

  it('preserves saved Snap2 mobile drawer on hydration and export', () => {
    const state = buildFormStateFromInitialPayload({
      snap2: {
        configurator: {
          displayMode: { desktop: 'variants-only-sheet', mobile: 'drawer' },
        },
      },
    } as Partial<ConfiguratorSetupPayload>);

    expect(state.typeSettings.snap2.configurator.displayModeDesktop).toBe('modal');
    expect(state.typeSettings.snap2.configurator.displayModeMobile).toBe('drawer');

    const config = buildSerializableConfig('snap2', state.typeSettings.snap2);

    expect(config.configurator?.displayMode).toEqual({ desktop: 'modal', mobile: 'drawer' });
    expect(config.selectors.configureButton).toBe('[data-ov25-configure-button]');
    expect(config.selectors).not.toHaveProperty('gallery');
    expect(config.selectors).not.toHaveProperty('initialiseMenu');
  });

  it('keeps standard desktop sheet display mode unchanged', () => {
    const state = buildFormStateFromInitialPayload({});
    const config = buildSerializableConfig('standard', state.typeSettings.standard);

    expect(config.configurator?.displayMode.desktop).toBe('sheet');
  });

  it('omits the configure button and exports inline selectors when both breakpoints are inline', () => {
    const state = buildFormStateFromInitialPayload({});
    const settings = state.typeSettings.snap2;
    settings.configurator.displayModeDesktop = 'inline';
    settings.configurator.displayModeMobile = 'inline';

    const config = buildSerializableConfig('snap2', settings);

    expect(config.selectors).not.toHaveProperty('configureButton');
    expect(config.selectors.gallery).toEqual({ selector: '.configurator-container', replace: true });
    expect(config.selectors.variants).toBe('#ov25-controls');
    expect(config.selectors.initialiseMenu).toEqual({ selector: '#ov25-initialise-menu', replace: true });
    expect(config.configurator?.variants?.position).toEqual({ desktop: 'right', mobile: 'right' });
    expect(config.configurator?.modules?.position).toEqual({ desktop: 'right', mobile: 'right' });
  });

  it('keeps the configure button and exports inline selectors when one breakpoint is inline', () => {
    const state = buildFormStateFromInitialPayload({});
    const settings = state.typeSettings.snap2;
    settings.configurator.displayModeDesktop = 'inline';

    const config = buildSerializableConfig('snap2', settings);

    expect(config.selectors.configureButton).toBe('[data-ov25-configure-button]');
    expect(config.selectors.gallery).toEqual({ selector: '.configurator-container', replace: true });
    expect(config.selectors.variants).toBe('#ov25-controls');
    expect(config.selectors.initialiseMenu).toEqual({ selector: '#ov25-initialise-menu', replace: true });
  });

  it('hydrates and re-exports a saved Snap2 initialise menu selector', () => {
    const state = buildFormStateFromInitialPayload({
      snap2: {
        selectors: {
          initialiseMenu: { selector: '#custom-initialise-menu', replace: true },
        },
        configurator: {
          displayMode: { desktop: 'inline', mobile: 'modal' },
        },
      },
    } as Partial<ConfiguratorSetupPayload>);

    expect(state.typeSettings.snap2.selectors.initialiseMenu).toEqual({
      enabled: true,
      selector: '#custom-initialise-menu',
      replace: true,
    });

    const config = buildSerializableConfig('snap2', state.typeSettings.snap2);

    expect(config.selectors.initialiseMenu).toEqual({
      selector: '#custom-initialise-menu',
      replace: true,
    });
  });

  it('hydrates but does not export a saved Snap2 initialise menu selector when neither breakpoint is inline', () => {
    const state = buildFormStateFromInitialPayload({
      snap2: {
        selectors: {
          initialiseMenu: { selector: '#custom-initialise-menu', replace: true },
        },
        configurator: {
          displayMode: { desktop: 'modal', mobile: 'modal' },
        },
      },
    } as Partial<ConfiguratorSetupPayload>);

    expect(state.typeSettings.snap2.selectors.initialiseMenu).toEqual({
      enabled: true,
      selector: '#custom-initialise-menu',
      replace: true,
    });

    const config = buildSerializableConfig('snap2', state.typeSettings.snap2);

    expect(config.selectors).not.toHaveProperty('initialiseMenu');
  });

  it('hydrates saved Snap2 positions back into setup state', () => {
    const state = buildFormStateFromInitialPayload({
      snap2: {
        configurator: {
          variants: {
            displayMode: { desktop: 'tree', mobile: 'list' },
            position: { desktop: 'left', mobile: 'right' },
          },
          modules: {
            position: { desktop: 'bottom', mobile: 'left' },
          },
        },
      },
    } as Partial<ConfiguratorSetupPayload>);

    expect(state.typeSettings.snap2.configurator.snap2VariantPositionDesktop).toBe('left');
    expect(state.typeSettings.snap2.configurator.snap2VariantPositionMobile).toBe('right');
    expect(state.typeSettings.snap2.configurator.snap2ModulePositionDesktop).toBe('bottom');
    expect(state.typeSettings.snap2.configurator.snap2ModulePositionMobile).toBe('left');
  });

  it('does not export Snap2-only selectors or positions from standard defaults', () => {
    const state = buildFormStateFromInitialPayload({});
    const config = buildSerializableConfig('standard', state.typeSettings.standard);

    expect(config.selectors).not.toHaveProperty('initialiseMenu');
    expect(config.configurator?.variants?.position).toBeUndefined();
    expect(config.configurator?.modules).toBeUndefined();
  });
});
