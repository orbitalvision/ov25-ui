import { describe, expect, it, vi } from 'vitest';
import { ConfiguratorDisplayMode } from '../../src/types/config-enums';
import {
  normalizeInjectConfig,
  type InjectConfiguratorOptions,
} from '../../src/types/inject-config';
import { configuratorDisplayModeUsesInlineVariants } from '../../src/utils/configurator-utils';

function groupedConfig(
  overrides: Partial<InjectConfiguratorOptions> = {},
): InjectConfiguratorOptions {
  return {
    apiKey: 'key',
    productLink: 'products/1',
    selectors: {},
    callbacks: {
      addToBasket: () => {},
      buyNow: () => {},
      buySwatches: () => {},
    },
    ...overrides,
  };
}

describe('inline-sticky config contract', () => {
  it('exposes only the inline-sticky public enum value', () => {
    expect(ConfiguratorDisplayMode.InlineSticky).toBe('inline-sticky');
    expect(Object.values(ConfiguratorDisplayMode)).not.toContain('sticky');
    expect(configuratorDisplayModeUsesInlineVariants('inline-sticky')).toBe(true);
  });

  it('normalizes responsive inline-sticky mode and sticky selectors for standard products', () => {
    const desktopCarousel = '#desktop-carousel';
    const mobileCarousel = { selector: '#mobile-carousel', replace: false };
    const normalized = normalizeInjectConfig(
      groupedConfig({
        selectors: {
          gallery: '#gallery',
          header: '#announcement, #site-header',
          desktopCarousel,
          mobileCarousel,
        },
        configurator: {
          displayMode: { desktop: 'inline-sticky', mobile: 'inline-sticky' },
        },
      }),
    );

    expect(normalized.configuratorDisplayMode).toBe('inline-sticky');
    expect(normalized.configuratorDisplayModeMobile).toBe('inline-sticky');
    expect(normalized.headerSelector).toBe('#announcement, #site-header');
    expect(normalized.desktopCarouselTargetSelector).toBe(desktopCarousel);
    expect(normalized.mobileCarouselTargetSelector).toBe(mobileCarousel);
  });

  it('keeps ordinary viewport carousel selectors independent', () => {
    const normalized = normalizeInjectConfig(
      groupedConfig({
        selectors: { mobileCarousel: '#mobile-carousel-target' },
        configurator: {
          displayMode: { desktop: 'sheet', mobile: 'drawer' },
        },
      }),
    );

    expect(normalized.desktopCarouselTargetSelector).toBeUndefined();
    expect(normalized.mobileCarouselTargetSelector).toBe('#mobile-carousel-target');
  });

  it('omits both runtime carousel targets for Snap2 while preserving the public selector keys', () => {
    const normalized = normalizeInjectConfig({
      apiKey: 'test',
      productLink: 'snap2/119',
      selectors: {
        desktopCarousel: '#desktop-carousel-target',
        mobileCarousel: '#mobile-carousel-target',
      },
      callbacks: {
        addToBasket: () => {},
        buyNow: () => {},
        buySwatches: () => {},
      },
    });

    expect(normalized.desktopCarouselTargetSelector).toBeUndefined();
    expect(normalized.mobileCarouselTargetSelector).toBeUndefined();
  });

  it('inherits inline-sticky on mobile when the responsive mobile value is omitted', () => {
    const normalized = normalizeInjectConfig(
      groupedConfig({
        configurator: { displayMode: { desktop: 'inline-sticky' } },
      }),
    );

    expect(normalized.configuratorDisplayMode).toBe('inline-sticky');
    expect(normalized.configuratorDisplayModeMobile).toBe('inline-sticky');
  });

  it('rejects accidental Snap2 inline-sticky modes with one modal fallback warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const normalized = normalizeInjectConfig(
      groupedConfig({
        productLink: () => '/snap2/42',
        configurator: {
          displayMode: { desktop: 'inline-sticky', mobile: 'inline-sticky' },
        },
      }),
    );

    expect(normalized.configuratorDisplayMode).toBe('modal');
    expect(normalized.configuratorDisplayModeMobile).toBe('modal');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      '[OV25-UI] Inline sticky display mode is not supported for Snap2; falling back to modal.',
    );
    warn.mockRestore();
  });
});
