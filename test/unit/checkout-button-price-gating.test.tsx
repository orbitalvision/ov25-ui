import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CheckoutButton } from '../../src/components/VariantSelectMenu/CheckoutButton';

let checkoutContext: Record<string, any>;

vi.mock('../../src/contexts/ov25-ui-context.js', () => ({
  useOV25UI: () => checkoutContext,
}));

function createContext(hasReceivedPrice: boolean, overrides: Record<string, any> = {}) {
  return {
    buyNowFunction: vi.fn(),
    addToBasketFunction: undefined,
    setIsVariantsOpen: vi.fn(),
    formattedPrice: hasReceivedPrice ? '£1,299.00' : '£0.00',
    formattedSubtotal: hasReceivedPrice ? '£1,299.00' : '£0.00',
    discount: { percentage: 0, amount: 0, formattedAmount: '£0.00' },
    hasReceivedPrice,
    isCheckoutPayloadReady: hasReceivedPrice,
    disableAddToCart: false,
    disableBuyNow: false,
    getString: (_key: string, vars: Record<string, unknown>, fallback: string) =>
      `${fallback}${vars.PRICE ? ` ${vars.PRICE}` : ''}`,
    ...overrides,
  };
}

describe('CheckoutButton price gating', () => {
  it('omits the price from Buy now until the configurator reports one', () => {
    checkoutContext = createContext(false);

    render(<CheckoutButton />);

    const button = screen.getByRole('button');
    expect(button.textContent).toContain('Buy now');
    expect(button.textContent).not.toMatch(/0\.00/);
  });

  it('shows the price on Buy now once it has arrived', () => {
    checkoutContext = createContext(true);

    render(<CheckoutButton />);

    expect(screen.getByRole('button').textContent).toContain('£1,299.00');
  });

  it('blanks interpolated price vars so merchant templates cannot print the zero', () => {
    // getString here appends ${PRICE} the way a configured "Buy now ${PRICE}" template would.
    checkoutContext = createContext(false);

    render(<CheckoutButton />);

    expect(screen.getByRole('button').textContent).toBe('Buy now');
  });

  it('disables Buy now until a real price exists to check out with', () => {
    checkoutContext = createContext(false);

    render(<CheckoutButton />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables Buy now once the price has arrived', () => {
    checkoutContext = createContext(true);

    render(<CheckoutButton />);

    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('keeps checkout disabled while a price is present but the current SKU is not ready', () => {
    checkoutContext = createContext(true, { isCheckoutPayloadReady: false });

    render(<CheckoutButton />);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button').textContent).toContain('£1,299.00');
  });

  it('disables both halves of the combo layout until the price arrives', () => {
    checkoutContext = createContext(false, { addToBasketFunction: vi.fn() });

    render(<CheckoutButton />);

    expect(document.getElementById('ov25-checkout-button')).toBeDisabled();
    expect(document.getElementById('ov25-add-to-basket-button')).toBeDisabled();
  });

  it('enables both halves of the combo layout once the price arrives', () => {
    checkoutContext = createContext(true, { addToBasketFunction: vi.fn() });

    render(<CheckoutButton />);

    expect(document.getElementById('ov25-checkout-button')).toBeEnabled();
    expect(document.getElementById('ov25-add-to-basket-button')).toBeEnabled();
  });

  it('disables a standalone Add to basket until the price arrives', () => {
    checkoutContext = createContext(false, {
      buyNowFunction: undefined,
      addToBasketFunction: vi.fn(),
    });

    render(<CheckoutButton />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('omits the price from Add to basket until it has arrived', () => {
    checkoutContext = createContext(false, {
      buyNowFunction: undefined,
      addToBasketFunction: vi.fn(),
    });

    render(<CheckoutButton />);

    const button = screen.getByRole('button');
    expect(button.textContent).toContain('Add to basket');
    expect(button.textContent).not.toMatch(/0\.00/);
  });
});
