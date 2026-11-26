import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OV25UIProvider, useOV25UI } from '../../src/contexts/ov25-ui-context';
import type { StickyLayoutControllerOptions } from '../../src/lib/sticky-layout-controller';

// JSDOM has no layout engine. Supply the blocked-sticky measurement while exercising
// the real provider state and relocation hook, including opening/closing its Popover.
vi.mock('../../src/lib/sticky-layout-controller', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/lib/sticky-layout-controller')>();
  return {
    ...actual,
    createStickyLayoutController: (options: StickyLayoutControllerOptions) => ({
      start: () => options.onChange?.({
        headerOffset: 56,
        topGap: 16,
        bottomGap: 16,
        optionHeaderHeight: 0,
        carouselHeight: 0,
        headerElements: [],
        headerStatus: 'resolved',
        headerSource: 'auto',
        ancestorBlockers: [],
        requiresBodyFallback: true,
        fallbackBoundary: options.galleryHost?.parentElement ?? null,
      }),
      setElements: vi.fn(),
      scheduleMeasure: vi.fn(),
      destroy: vi.fn(),
    }),
  };
});

function SwatchBookControls() {
  const { openSwatchBook, closeSwatchBook, isSwatchBookOpen } = useOV25UI();
  return <>
    <button onClick={openSwatchBook}>Open swatches</button>
    <button onClick={closeSwatchBook}>Close swatches</button>
    <output data-testid="swatchbook-open">{String(isSwatchBookOpen)}</output>
  </>;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('inline-sticky swatch book stacking', () => {
  it('leaves the top layer while swatches are open and resumes without replacing the iframe', () => {
    const product = document.createElement('section');
    const gallery = document.createElement('div');
    const iframe = document.createElement('iframe');
    iframe.id = 'ov25-configurator-iframe';
    gallery.appendChild(iframe);
    product.appendChild(gallery);
    document.body.appendChild(product);
    vi.spyOn(product, 'getBoundingClientRect').mockReturnValue(new DOMRect(40, -100, 500, 1200));
    vi.spyOn(gallery, 'getBoundingClientRect').mockReturnValue(new DOMRect(40, 40, 500, 320));
    let inTopLayer = false;
    const showPopover = vi.fn(() => { inTopLayer = true; });
    const hidePopover = vi.fn(() => { inTopLayer = false; });
    Object.defineProperties(gallery, {
      showPopover: { configurable: true, value: showPopover },
      hidePopover: { configurable: true, value: hidePopover },
    });
    const initialIframeWindow = iframe.contentWindow;

    render(<OV25UIProvider
      productLink={null}
      apiKey="test-api-key"
      configurationUuid="test-uuid"
      buyNowFunction={vi.fn()}
      addToBasketFunction={vi.fn()}
      buySwatchesFunction={vi.fn()}
      isProductGalleryStacked={false}
      hasConfigureButton={false}
      showCarousel={false}
      configuratorDisplayMode="inline-sticky"
      configuratorDisplayModeMobile="inline-sticky"
      galleryHost={gallery}
    >
      <SwatchBookControls />
    </OV25UIProvider>);

    expect(inTopLayer).toBe(true);
    expect(gallery.getAttribute('popover')).toBe('manual');
    expect(document.querySelector('[data-ov25-sticky-placeholder]')).not.toBeNull();

    fireEvent.click(screen.getByText('Open swatches'));
    expect(screen.getByTestId('swatchbook-open')).toHaveTextContent('true');
    expect(inTopLayer).toBe(false);
    expect(hidePopover).toHaveBeenCalled();
    expect(gallery.hasAttribute('popover')).toBe(false);
    expect(document.querySelector('[data-ov25-sticky-placeholder]')).toBeNull();
    expect(gallery.querySelector('iframe')).toBe(iframe);
    expect(iframe.contentWindow).toBe(initialIframeWindow);

    fireEvent.click(screen.getByText('Close swatches'));
    expect(screen.getByTestId('swatchbook-open')).toHaveTextContent('false');
    expect(inTopLayer).toBe(true);
    expect(gallery.getAttribute('popover')).toBe('manual');
    expect(gallery.parentElement).toBe(product);
    expect(gallery.querySelector('iframe')).toBe(iframe);
    expect(iframe.contentWindow).toBe(initialIframeWindow);
  });
});
