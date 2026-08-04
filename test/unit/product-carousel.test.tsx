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
    carouselContext.carouselLayout = 'carousel';
    carouselContext.carouselLayoutMobile = 'carousel';
    carouselContext.isMobile = false;
    carouselContext.images = ['/first.jpg', '/second.jpg'];
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
