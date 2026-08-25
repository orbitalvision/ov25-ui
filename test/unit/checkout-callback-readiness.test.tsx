import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutButton } from '../../src/components/VariantSelectMenu/CheckoutButton';
import { OV25UIProvider, useOV25UI } from '../../src/contexts/ov25-ui-context';

const providerProps = {
  productLink: null,
  apiKey: 'test-api-key',
  configurationUuid: 'test-uuid',
  buySwatchesFunction: vi.fn(),
  isProductGalleryStacked: false,
  carouselLayout: 'carousel' as const,
  hasConfigureButton: false,
};

function Harness() {
  const { cleanupConfigurator, currentProduct, isCheckoutPayloadReady } = useOV25UI();
  return (
    <>
      <CheckoutButton />
      <output data-testid="checkout-ready">{String(isCheckoutPayloadReady)}</output>
      <output data-testid="current-product">{currentProduct?.name ?? ''}</output>
      <button type="button" onClick={cleanupConfigurator}>Reset configurator</button>
    </>
  );
}

let activeIframe: HTMLIFrameElement;

function mountIframe() {
  const iframe = document.createElement('iframe');
  iframe.id = 'ov25-configurator-iframe';
  document.body.appendChild(iframe);
  return iframe;
}

function dispatchIframeMessage(type: string, payload: unknown, source = activeIframe) {
  window.dispatchEvent(new MessageEvent('message', {
    data: { type, payload: JSON.stringify(payload) },
    source: source.contentWindow,
  }));
}

function sendIframeMessage(type: string, payload: unknown, source = activeIframe) {
  act(() => dispatchIframeMessage(type, payload, source));
}

function InitialCommerceEmitter() {
  React.useEffect(() => {
    dispatchIframeMessage('CURRENT_PRODUCT_ID', null);
    dispatchIframeMessage('CURRENT_SKU', {
      skuString: 'SOFIA-INITIAL',
      skuMap: { Products: 'SOFIA-INITIAL' },
    });
    dispatchIframeMessage('CURRENT_PRICE', {
      totalPrice: 27500,
      subtotal: 27500,
      formattedPrice: '£275.00',
      formattedSubtotal: '£275.00',
    });
  }, []);

  return null;
}

describe('checkout callback readiness', () => {
  beforeEach(() => {
    activeIframe = mountIframe();
  });

  afterEach(() => {
    activeIframe.remove();
  });

  it('receives initial commerce messages emitted before child passive effects complete', () => {
    render(
      <OV25UIProvider {...providerProps} buyNowFunction={vi.fn()} addToBasketFunction={vi.fn()}>
        <InitialCommerceEmitter />
        <Harness />
      </OV25UIProvider>,
    );

    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('true');
    expect(screen.getAllByText('£275.00')).not.toHaveLength(0);
    expect(document.getElementById('ov25-checkout-button')).toBeEnabled();
  });

  it('preserves numeric wire IDs when resolving the current product', () => {
    render(
      <OV25UIProvider {...providerProps} buyNowFunction={vi.fn()} addToBasketFunction={vi.fn()}>
        <Harness />
      </OV25UIProvider>,
    );

    sendIframeMessage('ALL_PRODUCTS', [{
      id: 1682,
      name: 'Sofia Dining Chair',
      price: 27500,
      discount: 0,
      lowestPrice: 27500,
      metadata: {},
    }]);
    sendIframeMessage('CURRENT_PRODUCT_ID', 1682);

    expect(screen.getByTestId('current-product')).toHaveTextContent('Sofia Dining Chair');
  });

  it('waits for price and SKU in either order, and clears both on product switch and cleanup', () => {
    const buyNow = vi.fn();
    render(
      <OV25UIProvider {...providerProps} buyNowFunction={buyNow} addToBasketFunction={vi.fn()}>
        <Harness />
      </OV25UIProvider>,
    );

    sendIframeMessage('CURRENT_PRODUCT_ID', 'product-a');
    // This is the fully formed zero payload emitted by pre-fix OV25. It is intentionally
    // indistinguishable from a legitimate free configuration, so OV25 must suppress it before
    // delivery; ov25-ui only prevents checkout until CURRENT_SKU follows.
    sendIframeMessage('CURRENT_PRICE', {
      totalPrice: 0,
      subtotal: 0,
      formattedPrice: '£0.00',
      formattedSubtotal: '£0.00',
      priceBreakdown: [],
      discount: { percentage: 0, amount: 0, formattedAmount: '£0.00' },
    });

    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('false');
    expect(document.getElementById('ov25-checkout-button')).toBeDisabled();
    expect(screen.getAllByText('£0.00')).not.toHaveLength(0);

    sendIframeMessage('CURRENT_SKU', { skuString: 'OV25-A', skuMap: { Product: 'product-a' } });

    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('true');
    const checkout = document.getElementById('ov25-checkout-button')!;
    expect(checkout).toBeEnabled();
    fireEvent.click(checkout);
    expect(buyNow).toHaveBeenCalledWith(expect.objectContaining({
      skus: expect.objectContaining({ skuString: 'OV25-A' }),
      price: expect.objectContaining({ totalPrice: 0, formattedPrice: '£0.00' }),
    }));

    sendIframeMessage('CURRENT_PRODUCT_ID', 'product-b');
    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('false');
    expect(document.getElementById('ov25-checkout-button')).toBeDisabled();

    sendIframeMessage('CURRENT_SKU', { skuString: 'OV25-B', skuMap: { Product: 'product-b' } });
    sendIframeMessage('CURRENT_PRICE', {
      totalPrice: 12500,
      subtotal: 12500,
      formattedPrice: '£125.00',
      formattedSubtotal: '£125.00',
    });
    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('true');

    fireEvent.click(screen.getByRole('button', { name: 'Reset configurator' }));

    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('false');
    expect(document.getElementById('ov25-checkout-button')).toBeDisabled();
  });

  it('does not discard a replacement quote when its product ID arrives after cleanup', () => {
    render(
      <OV25UIProvider {...providerProps} buyNowFunction={vi.fn()} addToBasketFunction={vi.fn()}>
        <Harness />
      </OV25UIProvider>,
    );

    sendIframeMessage('CURRENT_PRODUCT_ID', 'product-a');
    sendIframeMessage('CURRENT_SKU', { skuString: 'OV25-A', skuMap: { Product: 'product-a' } });
    sendIframeMessage('CURRENT_PRICE', {
      totalPrice: 12500,
      subtotal: 12500,
      formattedPrice: '£125.00',
      formattedSubtotal: '£125.00',
    });
    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('true');

    fireEvent.click(screen.getByRole('button', { name: 'Reset configurator' }));
    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('false');

    sendIframeMessage('CURRENT_SKU', { skuString: 'OV25-B', skuMap: { Product: 'product-b' } });
    sendIframeMessage('CURRENT_PRICE', {
      totalPrice: 15000,
      subtotal: 15000,
      formattedPrice: '£150.00',
      formattedSubtotal: '£150.00',
    });
    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('true');

    sendIframeMessage('CURRENT_PRODUCT_ID', 'product-b');

    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('true');
    expect(document.getElementById('ov25-checkout-button')).toBeEnabled();
  });

  it('keeps the initial quote when a null product ID resolves after SKU and price', () => {
    render(
      <OV25UIProvider {...providerProps} buyNowFunction={vi.fn()} addToBasketFunction={vi.fn()}>
        <Harness />
      </OV25UIProvider>,
    );

    // OV25 can send this placeholder before its configurator menu has resolved. It is not a
    // previous product, so the following concrete ID must not clear the quote already received.
    sendIframeMessage('CURRENT_PRODUCT_ID', null);
    sendIframeMessage('CURRENT_SKU', { skuString: 'PICKERING-3', skuMap: { Products: 'PICKERING-3' } });
    sendIframeMessage('CURRENT_PRICE', {
      totalPrice: 10000,
      subtotal: 10000,
      formattedPrice: '£100.00',
      formattedSubtotal: '£100.00',
      priceBreakdown: [],
      discount: { percentage: 0, amount: 0, formattedAmount: '£0.00' },
    });

    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('true');
    expect(screen.getAllByText('£100.00')).not.toHaveLength(0);

    sendIframeMessage('CURRENT_PRODUCT_ID', 1682);

    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('true');
    expect(screen.getAllByText('£100.00')).not.toHaveLength(0);
    expect(document.getElementById('ov25-checkout-button')).toBeEnabled();
  });

  it.each([
    ['number then string', 1682, '1682'],
    ['string then number', '1682', 1682],
  ])('keeps the quote when the same product ID changes representation: %s', (_label, firstId, repeatedId) => {
    render(
      <OV25UIProvider {...providerProps} buyNowFunction={vi.fn()} addToBasketFunction={vi.fn()}>
        <Harness />
      </OV25UIProvider>,
    );

    sendIframeMessage('CURRENT_PRODUCT_ID', firstId);
    sendIframeMessage('CURRENT_SKU', {
      skuString: 'SOFIA-INITIAL',
      skuMap: { Products: 'SOFIA-INITIAL' },
    });
    sendIframeMessage('CURRENT_PRICE', {
      totalPrice: 27500,
      subtotal: 27500,
      formattedPrice: '£275.00',
      formattedSubtotal: '£275.00',
    });
    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('true');

    sendIframeMessage('CURRENT_PRODUCT_ID', repeatedId);

    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('true');
    expect(screen.getAllByText('£275.00')).not.toHaveLength(0);
    expect(document.getElementById('ov25-checkout-button')).toBeEnabled();
  });

  it('ignores delayed messages from a retired default iframe after cleanup', () => {
    render(
      <OV25UIProvider {...providerProps} buyNowFunction={vi.fn()} addToBasketFunction={vi.fn()}>
        <Harness />
      </OV25UIProvider>,
    );

    const retiredIframe = activeIframe;
    sendIframeMessage('CURRENT_PRODUCT_ID', 'product-a');
    sendIframeMessage('CURRENT_SKU', { skuString: 'OV25-A', skuMap: { Product: 'product-a' } });
    sendIframeMessage('CURRENT_PRICE', {
      totalPrice: 12500,
      subtotal: 12500,
      formattedPrice: '£125.00',
      formattedSubtotal: '£125.00',
    });
    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('true');

    fireEvent.click(screen.getByRole('button', { name: 'Reset configurator' }));
    retiredIframe.remove();
    activeIframe = mountIframe();

    sendIframeMessage('CURRENT_SKU', { skuString: 'OV25-A', skuMap: { Product: 'product-a' } }, retiredIframe);
    sendIframeMessage('CURRENT_PRICE', {
      totalPrice: 12500,
      subtotal: 12500,
      formattedPrice: '£125.00',
      formattedSubtotal: '£125.00',
    }, retiredIframe);
    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('false');
    expect(document.getElementById('ov25-checkout-button')).toBeDisabled();

    sendIframeMessage('CURRENT_SKU', { skuString: 'OV25-B', skuMap: { Product: 'product-b' } });
    sendIframeMessage('CURRENT_PRICE', {
      totalPrice: 15000,
      subtotal: 15000,
      formattedPrice: '£150.00',
      formattedSubtotal: '£150.00',
    });
    expect(screen.getByTestId('checkout-ready')).toHaveTextContent('true');
  });
});
