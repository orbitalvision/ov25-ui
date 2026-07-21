import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductCarousel } from '../../src/components/product-carousel';

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

describe('ProductCarousel selected state', () => {
  beforeEach(() => {
    carouselContext.galleryIndex = 0;
    carouselContext.carouselLayout = 'carousel';
    carouselContext.carouselLayoutMobile = 'carousel';
    carouselContext.isMobile = false;
    carouselContext.galleryCarouselFullscreenImage = null;
    setGalleryIndex.mockClear();
    carouselContext.setGalleryCarouselFullscreenImage.mockClear();
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
});
