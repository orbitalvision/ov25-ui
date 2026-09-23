import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductCarousel } from '../../src/components/product-carousel';
import { PLACEHOLDER_IMAGE_URL } from '../../src/lib/placeholder-image';

const setGalleryIndex = vi.fn((index: number) => {
  carouselContext.galleryIndex = index;
});

const carouselContext = {
  currentProduct: { metadata: {} },
  galleryIndex: 0,
  setGalleryIndex,
  error: null,
  images: ['/first.jpg', '/second.jpg'],
  galleryIndexToUse: 0,
  carouselLayout: 'carousel',
  carouselLayoutMobile: 'carousel',
  carouselMaxImagesDesktop: undefined,
  carouselMaxImagesMobile: undefined,
  isMobile: false,
  deferThreeD: true,
  galleryCarouselFullscreenImage: null,
  setGalleryCarouselFullscreenImage: vi.fn(),
};

vi.mock('../../src/contexts/ov25-ui-context.js', () => ({
  useOV25UI: () => carouselContext,
}));

function getThumbnailButtons(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('.ov25-thumbnail-scroll button'));
}

describe('ProductCarousel', () => {
  let originalShowPopover: PropertyDescriptor | undefined;
  let originalHidePopover: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalShowPopover = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'showPopover');
    originalHidePopover = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'hidePopover');
    carouselContext.galleryIndex = 0;
    carouselContext.currentProduct = { metadata: {} };
    carouselContext.carouselLayout = 'carousel';
    carouselContext.carouselLayoutMobile = 'carousel';
    carouselContext.isMobile = false;
    carouselContext.images = ['/first.jpg', '/second.jpg'];
    carouselContext.galleryIndexToUse = 0;
    carouselContext.deferThreeD = true;
    carouselContext.galleryCarouselFullscreenImage = null;
    setGalleryIndex.mockClear();
    carouselContext.setGalleryCarouselFullscreenImage.mockClear();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalShowPopover) {
      Object.defineProperty(HTMLElement.prototype, 'showPopover', originalShowPopover);
    } else {
      delete (HTMLElement.prototype as HTMLElement & { showPopover?: unknown }).showPopover;
    }
    if (originalHidePopover) {
      Object.defineProperty(HTMLElement.prototype, 'hidePopover', originalHidePopover);
    } else {
      delete (HTMLElement.prototype as HTMLElement & { hidePopover?: unknown }).hidePopover;
    }
    document.body.removeAttribute('style');
    document.documentElement.removeAttribute('style');
  });

  it('exposes and updates selected state on every horizontal thumbnail', () => {
    const { container, rerender } = render(<ProductCarousel />);

    let thumbnails = getThumbnailButtons(container);
    expect(thumbnails.map((thumbnail) => thumbnail.dataset.selected)).toEqual([
      'true',
      'false',
      'false',
    ]);

    fireEvent.click(thumbnails[2]);
    expect(setGalleryIndex).toHaveBeenLastCalledWith(2);
    rerender(<ProductCarousel />);

    thumbnails = getThumbnailButtons(container);
    expect(thumbnails.map((thumbnail) => thumbnail.dataset.selected)).toEqual([
      'false',
      'false',
      'true',
    ]);

    fireEvent.click(thumbnails[0]);
    expect(setGalleryIndex).toHaveBeenLastCalledWith(0);
    rerender(<ProductCarousel />);

    expect(getThumbnailButtons(container).map((thumbnail) => thumbnail.dataset.selected)).toEqual([
      'true',
      'false',
      'false',
    ]);
  });

  it('uses the OV25 cutout as the non-deferred 3D thumbnail without shifting merged images', () => {
    carouselContext.currentProduct = {
      metadata: {
        cutoutImage: '/cutout.jpg',
        images: ['/gallery.jpg'],
      },
    };
    carouselContext.images = ['/shopify.jpg'];
    carouselContext.deferThreeD = false;

    const { container, rerender } = render(<ProductCarousel />);

    let thumbnails = getThumbnailButtons(container);
    expect(thumbnails.map((thumbnail) => thumbnail.querySelector('img')?.getAttribute('src'))).toEqual([
      '/cutout.jpg',
      '/shopify.jpg',
      '/gallery.jpg',
    ]);
    expect(container.querySelectorAll('.ov25-360-label')).toHaveLength(1);
    expect(thumbnails[0]).toHaveTextContent('360°');
    expect(container.querySelectorAll('img[src="/cutout.jpg"]')).toHaveLength(1);
    expect(thumbnails.map((thumbnail) => thumbnail.dataset.selected)).toEqual([
      'true',
      'false',
      'false',
    ]);

    fireEvent.click(thumbnails[1]);
    expect(setGalleryIndex).toHaveBeenLastCalledWith(1);
    rerender(<ProductCarousel />);
    expect(getThumbnailButtons(container).map((thumbnail) => thumbnail.dataset.selected)).toEqual([
      'false',
      'true',
      'false',
    ]);

    thumbnails = getThumbnailButtons(container);
    fireEvent.click(thumbnails[2]);
    expect(setGalleryIndex).toHaveBeenLastCalledWith(2);
    rerender(<ProductCarousel />);
    expect(getThumbnailButtons(container).map((thumbnail) => thumbnail.dataset.selected)).toEqual([
      'false',
      'false',
      'true',
    ]);

    thumbnails = getThumbnailButtons(container);
    fireEvent.click(thumbnails[0]);
    expect(setGalleryIndex).toHaveBeenLastCalledWith(0);
    rerender(<ProductCarousel />);
    expect(getThumbnailButtons(container).map((thumbnail) => thumbnail.dataset.selected)).toEqual([
      'true',
      'false',
      'false',
    ]);
  });

  it('uses the OV25 cutout as the deferred 3D thumbnail without shifting merged images', () => {
    carouselContext.currentProduct = {
      metadata: {
        cutoutImage: '/cutout.jpg',
        images: ['/gallery.jpg'],
      },
    };
    carouselContext.images = ['/shopify.jpg'];
    carouselContext.deferThreeD = true;
    carouselContext.galleryIndexToUse = 1;

    const { container, rerender } = render(<ProductCarousel />);

    let thumbnails = getThumbnailButtons(container);
    expect(thumbnails.map((thumbnail) => thumbnail.querySelector('img')?.getAttribute('src'))).toEqual([
      '/shopify.jpg',
      '/cutout.jpg',
      '/gallery.jpg',
    ]);
    expect(container.querySelectorAll('.ov25-360-label')).toHaveLength(1);
    expect(thumbnails[1]).toHaveTextContent('360°');
    expect(container.querySelectorAll('img[src="/cutout.jpg"]')).toHaveLength(1);
    expect(thumbnails.map((thumbnail) => thumbnail.dataset.selected)).toEqual([
      'true',
      'false',
      'false',
    ]);

    fireEvent.click(thumbnails[1]);
    expect(setGalleryIndex).toHaveBeenLastCalledWith(1);
    rerender(<ProductCarousel />);
    expect(getThumbnailButtons(container).map((thumbnail) => thumbnail.dataset.selected)).toEqual([
      'false',
      'true',
      'false',
    ]);

    thumbnails = getThumbnailButtons(container);
    fireEvent.click(thumbnails[2]);
    expect(setGalleryIndex).toHaveBeenLastCalledWith(2);
    rerender(<ProductCarousel />);
    expect(getThumbnailButtons(container).map((thumbnail) => thumbnail.dataset.selected)).toEqual([
      'false',
      'false',
      'true',
    ]);
  });

  it('uses a cutout-first image as the deferred 3D thumbnail without duplicating it', () => {
    carouselContext.currentProduct = {
      metadata: {
        heroImage: '/hero.jpg',
        cutoutImage: '/cutout.jpg',
        images: ['/gallery.jpg'],
      },
    };
    carouselContext.images = [];
    carouselContext.isMobile = true;
    carouselContext.deferThreeD = true;
    carouselContext.galleryIndexToUse = 1;

    const { container, rerender } = render(<ProductCarousel />);

    let thumbnails = getThumbnailButtons(container);
    expect(thumbnails.map((thumbnail) => thumbnail.querySelector('img')?.getAttribute('src'))).toEqual([
      '/hero.jpg',
      '/cutout.jpg',
      '/gallery.jpg',
    ]);
    expect(thumbnails[1]).toHaveTextContent('360°');
    expect(container.querySelectorAll('img[src="/cutout.jpg"]')).toHaveLength(1);
    expect(thumbnails.map((thumbnail) => thumbnail.dataset.selected)).toEqual([
      'true',
      'false',
      'false',
    ]);

    fireEvent.click(thumbnails[1]);
    expect(setGalleryIndex).toHaveBeenLastCalledWith(1);
    rerender(<ProductCarousel />);
    expect(getThumbnailButtons(container).map((thumbnail) => thumbnail.dataset.selected)).toEqual([
      'false',
      'true',
      'false',
    ]);

    thumbnails = getThumbnailButtons(container);
    fireEvent.click(thumbnails[2]);
    expect(setGalleryIndex).toHaveBeenLastCalledWith(2);
  });

  it('keeps a cutout-only product available as the 3D thumbnail', () => {
    carouselContext.currentProduct = {
      metadata: {
        cutoutImage: '/cutout.jpg',
      },
    };
    carouselContext.images = [];
    carouselContext.deferThreeD = true;
    carouselContext.galleryIndexToUse = 0;

    const { container } = render(<ProductCarousel />);
    const thumbnails = getThumbnailButtons(container);

    expect(thumbnails).toHaveLength(1);
    expect(thumbnails[0]).toHaveTextContent('360°');
    expect(thumbnails[0]).toHaveAttribute('data-selected', 'true');
    expect(thumbnails[0].querySelector('img')).toHaveAttribute('src', '/cutout.jpg');
  });

  it('preserves horizontal slots while omitting missing images', () => {
    carouselContext.images = ['', '/real.jpg'];

    const { container } = render(<ProductCarousel />);
    const thumbnails = getThumbnailButtons(container);
    const slots = container.querySelectorAll('.ov25-thumbnail-scroll > div > div');
    const emptySlot = container.querySelector<HTMLElement>(
      '[data-ov25-gallery-image-empty-slot="true"]',
    );
    const galleryButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.ov25-gallery-image-button'),
    );

    expect(slots).toHaveLength(3);
    expect(thumbnails).toHaveLength(2);
    expect(emptySlot?.tagName).toBe('DIV');
    expect(emptySlot).toHaveClass('ov25-gallery-image-empty-slot');
    expect(emptySlot).toHaveAttribute('aria-hidden', 'true');
    expect(emptySlot).toHaveAttribute('data-ov25-gallery-item-index', '1');
    expect(emptySlot?.querySelector('button')).toBeNull();
    expect(galleryButtons).toHaveLength(1);
    expect(galleryButtons[0].querySelector('img')).toHaveAttribute('src', '/real.jpg');
    expect(container.innerHTML).not.toContain(PLACEHOLDER_IMAGE_URL);

    fireEvent.click(galleryButtons[0]);
    expect(setGalleryIndex).toHaveBeenLastCalledWith(2);
  });

  it('preserves stacked slots and real-image fullscreen behavior without a missing-image placeholder', () => {
    carouselContext.images = ['', '/real.jpg'];
    carouselContext.carouselLayout = 'stacked';

    const { container } = render(<ProductCarousel />);
    const emptySlot = container.querySelector<HTMLElement>(
      '[data-ov25-gallery-image-empty-slot="true"]',
    );
    const galleryButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.ov25-gallery-image-button'),
    );

    expect(emptySlot?.parentElement?.children).toHaveLength(3);
    expect(emptySlot?.parentElement?.children[1]).toBe(emptySlot);
    expect(emptySlot?.tagName).toBe('DIV');
    expect(emptySlot).toHaveClass('ov25-gallery-image-empty-slot');
    expect(emptySlot).toHaveAttribute('aria-hidden', 'true');
    expect(emptySlot).toHaveAttribute('data-ov25-gallery-item-index', '1');
    expect(emptySlot?.querySelector('button')).toBeNull();
    expect(galleryButtons).toHaveLength(1);
    expect(galleryButtons[0].querySelector('img')).toHaveAttribute('src', '/real.jpg');
    expect(container.innerHTML).not.toContain(PLACEHOLDER_IMAGE_URL);

    fireEvent.click(galleryButtons[0]);
    expect(carouselContext.setGalleryCarouselFullscreenImage).toHaveBeenLastCalledWith('/real.jpg');
  });

  it('shows the fullscreen overlay as a manual popover without reparenting it', () => {
    const showPopover = vi.fn();
    const hidePopover = vi.fn();
    Object.defineProperties(HTMLElement.prototype, {
      showPopover: { configurable: true, value: showPopover },
      hidePopover: { configurable: true, value: hidePopover },
    });
    carouselContext.galleryCarouselFullscreenImage = '/fullscreen.jpg';

    const { container, unmount } = render(<ProductCarousel />);
    const carousel = container.querySelector('#ov25-product-carousel');
    const overlay = container.querySelector<HTMLElement>('[popover="manual"]');

    expect(overlay).not.toBeNull();
    expect(overlay?.parentElement).toBe(carousel);
    expect(showPopover).toHaveBeenCalledOnce();
    expect(overlay?.style.border).toBe('0px');
    expect(overlay?.style.padding).toBe('0px');
    expect(document.body.style.position).toBe('fixed');

    unmount();

    expect(hidePopover).toHaveBeenCalledOnce();
    expect(document.body.style.position).toBe('');
  });

  it('keeps a fixed fullscreen overlay when the Popover API is unavailable', () => {
    delete (HTMLElement.prototype as HTMLElement & { showPopover?: unknown }).showPopover;
    delete (HTMLElement.prototype as HTMLElement & { hidePopover?: unknown }).hidePopover;
    carouselContext.galleryCarouselFullscreenImage = '/fullscreen.jpg';

    const { container, unmount } = render(<ProductCarousel />);
    const overlay = container.querySelector<HTMLElement>('#ov25-product-carousel > div:last-child');

    expect(overlay?.hasAttribute('popover')).toBe(false);
    expect(overlay?.className).toContain('ov:fixed');

    unmount();
  });

  it('labels every tile kind with stable styling hooks in both layouts', () => {
    // Merchant cssString has no other way to tell auto cutout tiles from gallery photos:
    // they share .ov25-gallery-image-button, and their position shifts with the material shot.
    const ctx = carouselContext as typeof carouselContext & Record<string, unknown>;
    const cutouts = ['blob:-45', 'blob:0', 'blob:-90', 'blob:180'];
    Object.assign(ctx, {
      carouselAutoCutouts: true,
      autoCutoutMaterialImages: ['/material.webp'],
      autoCutoutImages: cutouts,
      autoCutoutAngleByImage: new Map(cutouts.map((url) => [url, Number(url.slice(5))])),
      selectAutoCutoutAngle: vi.fn(),
      // material, first image, then the 360 — see composeGalleryOrder.
      galleryIndexToUse: 2,
      deferThreeD: true,
    });

    const kindsIn = (buttons: Element[]) =>
      buttons.map((b) => {
        const el = b as HTMLElement;
        return el.dataset.ov25CutoutYaw
          ? `${el.dataset.ov25GalleryTile}:${el.dataset.ov25CutoutYaw}`
          : el.dataset.ov25GalleryTile;
      });
    const expected = [
      'material', 'image', '360',
      'cutout:-45', 'cutout:0', 'cutout:-90', 'cutout:180',
      'image',
    ];

    try {
      const { container, rerender } = render(<ProductCarousel />);
      expect(kindsIn(getThumbnailButtons(container))).toEqual(expected);

      carouselContext.carouselLayout = 'stacked';
      rerender(<ProductCarousel />);
      expect(
        kindsIn(Array.from(container.querySelectorAll('#ov25-product-carousel-controls button'))),
      ).toEqual(expected);
    } finally {
      for (const key of [
        'carouselAutoCutouts',
        'autoCutoutMaterialImages',
        'autoCutoutImages',
        'autoCutoutAngleByImage',
        'selectAutoCutoutAngle',
      ]) {
        delete ctx[key];
      }
    }
  });

  it('marks ordinary gallery photos as image tiles when auto cutouts are off', () => {
    const { container } = render(<ProductCarousel />);
    const kinds = getThumbnailButtons(container).map((b) => b.dataset.ov25GalleryTile);
    expect(kinds).toEqual(['360', 'image', 'image']);
  });

  it('switches between viewport-specific none and carousel modes without changing hook order', () => {
    carouselContext.carouselLayout = 'none';
    carouselContext.carouselLayoutMobile = 'carousel';
    const { container, rerender } = render(<ProductCarousel />);

    expect(container.querySelector('#ov25-product-carousel')).toBeNull();

    carouselContext.isMobile = true;
    rerender(<ProductCarousel />);
    expect(container.querySelector('#ov25-product-carousel')).not.toBeNull();

    carouselContext.carouselLayoutMobile = 'none';
    rerender(<ProductCarousel />);
    expect(container.querySelector('#ov25-product-carousel')).toBeNull();
  });
});
