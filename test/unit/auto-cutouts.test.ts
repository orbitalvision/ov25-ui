import { afterEach, describe, expect, it } from 'vitest';
import {
  AUTO_CUTOUT_ANGLES,
  AUTO_CUTOUT_SIZE,
  autoCutoutAngleByImageUrl,
  composeAutoCutoutGalleryImages,
  isAutoCutoutAngle,
  materialThumbnailFromConfiguratorState,
} from '../../src/lib/auto-cutouts';
import {
  normalizeInjectConfig,
  type InjectConfiguratorOptions,
} from '../../src/types/inject-config';
import { getIframeSrc } from '../../src/utils/configurator-utils';

function groupedConfig(
  carousel?: InjectConfiguratorOptions['carousel'],
  productLink = '58',
): InjectConfiguratorOptions {
  return {
    apiKey: 'key',
    productLink,
    selectors: {},
    callbacks: {
      addToBasket: () => {},
      buyNow: () => {},
      buySwatches: () => {},
    },
    carousel,
  };
}

const MATERIAL_STATE = {
  options: [
    {
      id: 'opt-legs',
      name: 'Legs',
      groups: [{ id: 'g-legs', selections: [{ id: 'oak', thumbnail: 'legs/oak.webp' }] }],
    },
    {
      id: 'opt-fabric',
      name: 'Fabrics',
      groups: [
        {
          id: 'g-weaves',
          selections: [
            { id: 'pearl', thumbnail: 'fabrics/pearl.webp' },
            { id: 'indigo', thumbnail: 'fabrics/indigo.webp' },
          ],
        },
      ],
    },
  ],
  selectedSelections: [
    { optionId: 'opt-legs', groupId: 'g-legs', selectionId: 'oak' },
    { optionId: 'opt-fabric', groupId: 'g-weaves', selectionId: 'indigo' },
  ],
};

describe('auto cutouts config contract', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('is off unless the grouped carousel flag asks for it', () => {
    expect(normalizeInjectConfig(groupedConfig()).carouselAutoCutouts).toBe(false);
    expect(
      normalizeInjectConfig(groupedConfig({ desktop: 'carousel', autoCutouts: false }))
        .carouselAutoCutouts,
    ).toBe(false);
    expect(
      normalizeInjectConfig(groupedConfig({ desktop: 'carousel', autoCutouts: true }))
        .carouselAutoCutouts,
    ).toBe(true);
  });

  it('stays off for Snap2, which has its own embed', () => {
    expect(
      normalizeInjectConfig(
        groupedConfig({ desktop: 'carousel', autoCutouts: true }, 'snap2/292'),
      ).carouselAutoCutouts,
    ).toBe(false);
  });

  it('adds the fixed angle set and size to the iframe URL when enabled', () => {
    const url = new URL(getIframeSrc('key', '58', null, null, null, null, null, true));

    expect(url.searchParams.get('cutoutAngles')).toBe('-45,0,-90,180');
    expect(url.searchParams.get('cutoutSize')).toBe(String(AUTO_CUTOUT_SIZE));
  });

  it.each([false, undefined])('omits both params when %s', (autoCutouts) => {
    const url = new URL(getIframeSrc('key', '58', null, null, null, null, null, autoCutouts));

    expect(url.searchParams.has('cutoutAngles')).toBe(false);
    expect(url.searchParams.has('cutoutSize')).toBe(false);
  });

  it('leaves an explicit productLink angle set alone', () => {
    const url = new URL(
      getIframeSrc('key', '58?cutoutAngles=0&cutoutSize=200', null, null, null, null, null, true),
    );

    expect(url.searchParams.get('cutoutAngles')).toBe('0');
    expect(url.searchParams.get('cutoutSize')).toBe('200');
  });
});

describe('auto cutout gallery composition', () => {
  const cutouts = AUTO_CUTOUT_ANGLES.map((yaw) => ({ imageUrl: `blob:${yaw}`, yaw }));

  it('contributes nothing while disabled', () => {
    expect(
      composeAutoCutoutGalleryImages({
        enabled: false,
        materialThumbnail: 'fabrics/indigo.webp',
        cutouts,
      }),
    ).toEqual([]);
  });

  it('leads with the material shot, then the cutouts in reference order', () => {
    expect(
      composeAutoCutoutGalleryImages({
        enabled: true,
        materialThumbnail: 'fabrics/indigo.webp',
        // Deliberately out of order: the configurator makes no ordering promise.
        cutouts: [...cutouts].reverse(),
      }),
    ).toEqual(['fabrics/indigo.webp', 'blob:-45', 'blob:0', 'blob:-90', 'blob:180']);
  });

  it('holds the cutouts back until the whole set has arrived', () => {
    expect(
      composeAutoCutoutGalleryImages({
        enabled: true,
        materialThumbnail: 'fabrics/indigo.webp',
        cutouts: cutouts.slice(0, 2),
      }),
    ).toEqual(['fabrics/indigo.webp']);
  });

  it('works without a material shot', () => {
    expect(
      composeAutoCutoutGalleryImages({ enabled: true, materialThumbnail: null, cutouts }),
    ).toEqual(['blob:-45', 'blob:0', 'blob:-90', 'blob:180']);
  });

  it('only accepts the angles it asked for', () => {
    expect(isAutoCutoutAngle(-45)).toBe(true);
    expect(isAutoCutoutAngle(45)).toBe(false);
    expect(isAutoCutoutAngle(Number.NaN)).toBe(false);
    expect(isAutoCutoutAngle('0')).toBe(false);
  });
});

describe('material shot selection', () => {
  it('reads the selected fabric thumbnail', () => {
    expect(materialThumbnailFromConfiguratorState(MATERIAL_STATE)).toBe('fabrics/indigo.webp');
  });

  it('returns null when the product has no fabric or material option', () => {
    expect(
      materialThumbnailFromConfiguratorState({
        options: [MATERIAL_STATE.options[0]],
        selectedSelections: [MATERIAL_STATE.selectedSelections[0]],
      }),
    ).toBeNull();
  });

  it('returns null for missing or empty state', () => {
    expect(materialThumbnailFromConfiguratorState(null)).toBeNull();
    expect(materialThumbnailFromConfiguratorState(undefined)).toBeNull();
    expect(materialThumbnailFromConfiguratorState({})).toBeNull();
  });
});

describe('auto cutout angle lookup', () => {
  it('resolves a tile back to the angle it was captured at', () => {
    const cutouts = AUTO_CUTOUT_ANGLES.map((yaw) => ({ imageUrl: `blob:${yaw}`, yaw }));
    const byUrl = autoCutoutAngleByImageUrl(cutouts);

    expect(byUrl.get('blob:-45')).toBe(-45);
    expect(byUrl.get('blob:180')).toBe(180);
    // The material shot and the shop's own photography are stills, not angles.
    expect(byUrl.has('fabrics/indigo.webp')).toBe(false);
    expect(byUrl.size).toBe(AUTO_CUTOUT_ANGLES.length);
  });

  it('is empty before any set has arrived', () => {
    expect(autoCutoutAngleByImageUrl([]).size).toBe(0);
  });
});
