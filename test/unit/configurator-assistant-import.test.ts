import { expect, it } from 'vitest';
import { mergeSerializableIntoTypeSettings } from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';
import { DEFAULT_TYPE_SETTINGS } from '../../setup/src/components/ConfiguratorSetup/types';
import { buildSerializableConfig } from '../../setup/src/components/ConfiguratorSetup/serialize-config';

it('imports assistant JSON into the same colour control and serializes it for Save and preview',()=>{
  const before=structuredClone(DEFAULT_TYPE_SETTINGS.standard);
  before.style['--ov25-configurator-iframe-background-color']='#FFFFFF';
  const next=mergeSerializableIntoTypeSettings(before,{branding:{cssString:':host { --ov25-configurator-iframe-background-color:#FBFFF2; } #ov25-name {color:red}'},flags:{hidePricing:true},themeSelectors:{123:{gallery:'#draft-gallery'}}},'standard');
  expect(next.style['--ov25-configurator-iframe-background-color']).toBe('#FBFFF2');
  expect(next.branding.cssString).toContain('#ov25-name');
  expect(next.flags.hidePricing).toBe(true);
  expect(next.selectors.gallery).toEqual(before.selectors.gallery);
  expect(next.themeSelectors?.['123'].gallery?.selector).toBe('#draft-gallery');
  const saved=buildSerializableConfig('standard',next);
  expect(saved.branding?.cssString).toContain('--ov25-configurator-iframe-background-color: #FBFFF2');
  expect(saved.branding?.cssString).not.toContain('#FFFFFF');
  expect(before.style['--ov25-configurator-iframe-background-color']).toBe('#FFFFFF');
});
