import { afterEach, describe, expect, it } from 'vitest';
import {
  normalizeInjectConfig,
  type InjectConfiguratorOptions,
} from '../../src/types/inject-config';
import { getIframeSrc } from '../../src/utils/configurator-utils';
import { getDiningIframeSrc } from '../../src/utils/inject-dining';

function groupedConfig(flags?: InjectConfiguratorOptions['flags']): InjectConfiguratorOptions {
  return {
    apiKey: 'key',
    productLink: '58',
    selectors: {},
    callbacks: {
      addToBasket: () => {},
      buyNow: () => {},
      buySwatches: () => {},
    },
    flags,
  };
}

describe('flags.hideGestureHint runtime contract', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('normalizes the grouped flag to false by default and true when enabled', () => {
    expect(normalizeInjectConfig(groupedConfig()).hideGestureHint).toBe(false);
    expect(
      normalizeInjectConfig(groupedConfig({ hideGestureHint: true })).hideGestureHint,
    ).toBe(true);
  });

  it('does not treat a legacy flat property as an alias', () => {
    const legacyConfig = {
      apiKey: 'key',
      productLink: '58',
      addToBasketFunction: () => {},
      buyNowFunction: () => {},
      buySwatchesFunction: () => {},
      hideGestureHint: true,
    } as any;

    expect(normalizeInjectConfig(legacyConfig).hideGestureHint).toBe(false);
  });

  it.each([
    ['standard', '58'],
    ['Snap2', 'snap2/292'],
    ['Bed', 'bed-configurator/3'],
  ])('adds hideGestureHint=true to %s iframe URLs', (_name, productLink) => {
    const url = new URL(
      getIframeSrc('key', productLink, null, null, null, null, true),
    );

    expect(url.searchParams.get('hideGestureHint')).toBe('true');
  });

  it.each([false, undefined])(
    'omits hideGestureHint from standard iframe URLs when set to %s',
    (hideGestureHint) => {
      window.history.replaceState({}, '', '/host?hideGestureHint=true');
      const url = new URL(
        getIframeSrc(
          'key',
          '58?hideGestureHint=true',
          null,
          null,
          null,
          null,
          hideGestureHint,
        ),
      );

      expect(url.searchParams.has('hideGestureHint')).toBe(false);
    },
  );

  it('adds the flag to Dining iframe URLs and omits it when false', () => {
    const enabled = new URL(getDiningIframeSrc('key', '7', null, null, true));
    expect(enabled.searchParams.get('hideGestureHint')).toBe('true');

    window.history.replaceState({}, '', '/host?hideGestureHint=true');
    const disabled = new URL(getDiningIframeSrc('key', '7', null, null, false));
    expect(disabled.searchParams.has('hideGestureHint')).toBe(false);
  });
});
