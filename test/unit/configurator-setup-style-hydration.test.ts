import { describe, expect, it } from 'vitest';
import {
  buildFormStateFromInitialPayload,
  type ConfiguratorSetupPayload,
} from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';
import { buildSerializableConfig } from '../../setup/src/components/ConfiguratorSetup/serialize-config';

function hydrateStandardCss(cssString: string) {
  return buildFormStateFromInitialPayload({
    standard: {
      branding: { cssString },
    },
  } as Partial<ConfiguratorSetupPayload>).typeSettings.standard;
}

describe('ConfiguratorSetup initial config style variables', () => {
  it('hydrates :host color variables into standard style settings', () => {
    const settings = hydrateStandardCss(`
:host {
  --ov25-configurator-iframe-background-color: #123456;
  --ov25-cta-color: #abcdef;
}
`);

    expect(settings.style['--ov25-configurator-iframe-background-color']).toBe('#123456');
    expect(settings.style['--ov25-cta-color']).toBe('#abcdef');
    expect(settings.branding.cssString).toBe('');
  });

  it('keeps hydrating legacy :root color variables', () => {
    const settings = hydrateStandardCss(`
:root {
  --ov25-configurator-iframe-background-color: #101010;
  --ov25-cta-color: #202020;
}
`);

    expect(settings.style['--ov25-configurator-iframe-background-color']).toBe('#101010');
    expect(settings.style['--ov25-cta-color']).toBe('#202020');
    expect(settings.branding.cssString).toBe('');
  });

  it('preserves non-variable custom CSS after pulling setup style variables', () => {
    const settings = hydrateStandardCss(`
:host {
  --ov25-configurator-iframe-background-color: #112233;
  color: red;
  --merchant-token: 12px;
}

.ov25-custom {
  color: rebeccapurple;
}

:root {
  --ov25-cta-color: #445566;
}
`);

    expect(settings.style['--ov25-configurator-iframe-background-color']).toBe('#112233');
    expect(settings.style['--ov25-cta-color']).toBe('#445566');
    expect(settings.branding.cssString).toContain(':host {');
    expect(settings.branding.cssString).toContain('color: red;');
    expect(settings.branding.cssString).toContain('--merchant-token: 12px;');
    expect(settings.branding.cssString).toContain('.ov25-custom');
    expect(settings.branding.cssString).toContain('color: rebeccapurple;');
    expect(settings.branding.cssString).not.toContain('--ov25-configurator-iframe-background-color');
    expect(settings.branding.cssString).not.toContain('--ov25-cta-color');
  });

  it('round-trips exported :host color selectors back into standard style settings', () => {
    const state = buildFormStateFromInitialPayload({});
    state.typeSettings.standard.style['--ov25-configurator-iframe-background-color'] = '#102030';
    state.typeSettings.standard.style['--ov25-cta-color'] = '#405060';

    const exported = buildSerializableConfig('standard', state.typeSettings.standard);
    const { apiKey: _apiKey, productLink: _productLink, images: _images, ...savedStandard } = exported;
    const hydrated = buildFormStateFromInitialPayload({
      standard: savedStandard,
    } as Partial<ConfiguratorSetupPayload>).typeSettings.standard;

    expect(exported.branding?.cssString).toContain(':host {');
    expect(hydrated.style['--ov25-configurator-iframe-background-color']).toBe('#102030');
    expect(hydrated.style['--ov25-cta-color']).toBe('#405060');
    expect(hydrated.branding.cssString).toBe('');
  });
});
