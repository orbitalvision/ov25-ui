import { afterEach, describe, expect, it } from 'vitest';
import {
  AUTO_CUTOUT_ANGLES,
  AUTO_CUTOUT_SIZE,
  autoCutoutAngleByImageUrl,
  composeAutoCutoutGalleryImages,
  composeGalleryOrder,
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
    ).toEqual({ materialImages: [], cutoutImages: [] });
  });

  it('returns the material shot and the cutouts separately, in reference order', () => {
    // They are split because they are not adjacent in the strip: the material shot leads and
    // the cutouts sit behind the 360 tile.
    expect(
      composeAutoCutoutGalleryImages({
        enabled: true,
        materialThumbnail: 'fabrics/indigo.webp',
        // Deliberately out of order: the configurator makes no ordering promise.
        cutouts: [...cutouts].reverse(),
      }),
    ).toEqual({
      materialImages: ['fabrics/indigo.webp'],
      cutoutImages: ['blob:-45', 'blob:0', 'blob:-90', 'blob:180'],
    });
  });

  it('holds the cutouts back until the whole set has arrived', () => {
    expect(
      composeAutoCutoutGalleryImages({
        enabled: true,
        materialThumbnail: 'fabrics/indigo.webp',
        cutouts: cutouts.slice(0, 2),
      }),
    ).toEqual({ materialImages: ['fabrics/indigo.webp'], cutoutImages: [] });
  });

  it('works without a material shot', () => {
    expect(
      composeAutoCutoutGalleryImages({ enabled: true, materialThumbnail: null, cutouts }),
    ).toEqual({
      materialImages: [],
      cutoutImages: ['blob:-45', 'blob:0', 'blob:-90', 'blob:180'],
    });
  });

  describe('gallery order', () => {
    const cutoutImages = ['cut:-45', 'cut:0', 'cut:-90', 'cut:180'];
    const galleryImages = ['gal:1', 'gal:2', 'gal:3'];

    it('puts the first gallery image between the material shot and the 360', () => {
      expect(
        composeGalleryOrder({
          materialImages: ['material'],
          cutoutImages,
          galleryImages,
          deferThreeD: false,
        }),
      ).toEqual({
        images: ['material', 'gal:1', 'cut:-45', 'cut:0', 'cut:-90', 'cut:180', 'gal:2', 'gal:3'],
        // The 360 is spliced in at this index, so the full strip reads:
        // material, gal:1, 360, cutouts x4, remaining gallery images.
        threeDIndex: 2,
      });
    });

    it('ignores deferThreeD once cutouts place the 360 themselves', () => {
      // deferThreeD only exists to stop the 360 landing first; at index 2 it already cannot.
      const withDefer = composeGalleryOrder({
        materialImages: ['material'],
        cutoutImages,
        galleryImages,
        deferThreeD: true,
      });
      const withoutDefer = composeGalleryOrder({
        materialImages: ['material'],
        cutoutImages,
        galleryImages,
        deferThreeD: false,
      });
      expect(withDefer).toEqual(withoutDefer);
    });

    it('closes the gap when there is no material shot', () => {
      expect(
        composeGalleryOrder({
          materialImages: [],
          cutoutImages,
          galleryImages,
          deferThreeD: false,
        }),
      ).toEqual({
        images: ['gal:1', 'cut:-45', 'cut:0', 'cut:-90', 'cut:180', 'gal:2', 'gal:3'],
        threeDIndex: 1,
      });
    });

    it('handles a product with no gallery images', () => {
      expect(
        composeGalleryOrder({
          materialImages: ['material'],
          cutoutImages,
          galleryImages: [],
          deferThreeD: false,
        }),
      ).toEqual({
        images: ['material', 'cut:-45', 'cut:0', 'cut:-90', 'cut:180'],
        threeDIndex: 1,
      });
    });

    it('still leads with the material shot while the cutout set is incomplete', () => {
      expect(
        composeGalleryOrder({
          materialImages: ['material'],
          cutoutImages: [],
          galleryImages,
          deferThreeD: false,
        }),
      ).toEqual({ images: ['material', 'gal:1', 'gal:2', 'gal:3'], threeDIndex: 2 });
    });

    it('leaves the plain gallery untouched when auto cutouts contribute nothing', () => {
      expect(
        composeGalleryOrder({
          materialImages: [],
          cutoutImages: [],
          galleryImages,
          deferThreeD: false,
        }),
      ).toEqual({ images: galleryImages, threeDIndex: 0 });
    });

    it('keeps deferThreeD pushing the 360 to second place without cutouts', () => {
      expect(
        composeGalleryOrder({
          materialImages: [],
          cutoutImages: [],
          galleryImages,
          deferThreeD: true,
        }),
      ).toEqual({ images: galleryImages, threeDIndex: 1 });
    });

    it('keeps the 360 first for an empty gallery even when deferring', () => {
      expect(
        composeGalleryOrder({
          materialImages: [],
          cutoutImages: [],
          galleryImages: [],
          deferThreeD: true,
        }),
      ).toEqual({ images: [], threeDIndex: 0 });
    });
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
