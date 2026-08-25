import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OV25UIProvider,
  useOV25UI,
  type Selection,
} from '../../src/contexts/ov25-ui-context';

const providerProps = {
  productLink: null,
  apiKey: 'test-api-key',
  configurationUuid: 'test-uuid',
  buyNowFunction: vi.fn(),
  addToBasketFunction: vi.fn(),
  buySwatchesFunction: vi.fn(),
  isProductGalleryStacked: false,
  carouselLayout: 'carousel' as const,
  hasConfigureButton: false,
};

function Harness() {
  const {
    currentProductId,
    handleSelectionSelect,
    selectedSelections,
    sizeOption,
  } = useOV25UI();
  const selections = sizeOption.groups[0].selections;

  return (
    <>
      {selections.map((selection) => (
        <output key={selection.id} data-testid={`thumbnail-${selection.id}`}>
          {selection.thumbnail ?? ''}
        </output>
      ))}
      <output data-testid="current-product-id">{currentProductId ?? ''}</output>
      <output data-testid="selected-size">
        {selectedSelections.find((selection) => selection.optionId === 'size')?.selectionId ?? ''}
      </output>
      <button
        type="button"
        onClick={() => handleSelectionSelect(selections[0] as Selection, 'size')}
      >
        Select first size
      </button>
    </>
  );
}

let iframe: HTMLIFrameElement;

function mountProvider() {
  return render(
    <OV25UIProvider {...providerProps}>
      <Harness />
    </OV25UIProvider>,
  );
}

function sendIframeMessage(type: string, payload: unknown) {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', {
      data: { type, payload: JSON.stringify(payload) },
      source: iframe.contentWindow,
    }));
  });
}

function product(id: string, metadata: unknown) {
  return {
    id,
    name: id,
    price: 0,
    discount: 0,
    lowestPrice: 0,
    metadata,
  };
}

describe('size-option thumbnail selection', () => {
  beforeEach(() => {
    iframe = document.createElement('iframe');
    iframe.id = 'ov25-configurator-iframe';
    document.body.appendChild(iframe);
  });

  afterEach(() => {
    iframe.remove();
  });

  it('prefers cutouts, then configurator thumbnails, then the final gallery image', () => {
    mountProvider();

    sendIframeMessage('ALL_PRODUCTS', [
      {
        ...product('string-cutout', {
          cutoutImage: '/string-cutout.jpg',
          images: ['/gallery-should-not-win.jpg'],
        }),
        configuratorThumbnail: '/configurator-should-not-win.jpg',
      },
      {
        ...product('structured-cutout', {
          cutoutImage: {
            urls: {
              image: '/structured-image.jpg',
              small_image: '/structured-carousel.jpg',
            },
          },
          images: ['/gallery-should-not-win.jpg'],
        }),
        configuratorThumbnail: '/configurator-should-not-win.jpg',
      },
      {
        ...product('fallback-configurator-thumbnail', {
          cutoutImage: { urls: {} },
          images: ['/gallery-should-not-win.jpg'],
        }),
        configuratorThumbnail: '/configurator-thumbnail.jpg',
      },
      product('fallback-gallery', {
        cutoutImage: { urls: {} },
        images: ['/earlier-gallery.jpg', '/final-gallery.jpg'],
      }),
      product('no-thumbnail', {}),
      product('malformed-final-gallery', {
        images: ['/earlier-gallery.jpg', { urls: {} }],
      }),
    ]);

    expect(screen.getByTestId('thumbnail-string-cutout')).toHaveTextContent('/string-cutout.jpg');
    expect(screen.getByTestId('thumbnail-structured-cutout')).toHaveTextContent('/structured-carousel.jpg');
    expect(screen.getByTestId('thumbnail-fallback-configurator-thumbnail')).toHaveTextContent('/configurator-thumbnail.jpg');
    expect(screen.getByTestId('thumbnail-fallback-gallery')).toHaveTextContent('/final-gallery.jpg');
    expect(screen.getByTestId('thumbnail-no-thumbnail')).toHaveTextContent('');
    expect(screen.getByTestId('thumbnail-malformed-final-gallery')).toHaveTextContent('');
  });

  it('keeps the selected size product ID behavior unchanged', () => {
    mountProvider();
    sendIframeMessage('ALL_PRODUCTS', [
      product('selected-product', { cutoutImage: '/selected-cutout.jpg' }),
    ]);
    const postMessage = vi.spyOn(iframe.contentWindow!, 'postMessage');

    fireEvent.click(screen.getByRole('button', { name: 'Select first size' }));

    expect(screen.getByTestId('current-product-id')).toHaveTextContent('selected-product');
    expect(screen.getByTestId('selected-size')).toHaveTextContent('selected-product');
    expect(postMessage).toHaveBeenCalledWith({
      type: 'SELECT_PRODUCT',
      payload: JSON.stringify('selected-product'),
    }, '*');
  });
});
