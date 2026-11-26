import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Price from '../../src/components/Price';

let priceContext: Record<string, any>;

vi.mock('../../src/contexts/ov25-ui-context.js', () => ({
  useOV25UI: () => priceContext,
}));

// Price portals into a shadow root, which Testing Library queries can't reach.
vi.mock('../../src/components/Ov25ShadowHost.js', () => ({
  Ov25ShadowHost: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
}));

function createContext(hasReceivedPrice: boolean) {
  return {
    formattedPrice: hasReceivedPrice ? '£1,299.00' : '£0.00',
    formattedSubtotal: hasReceivedPrice ? '£1,299.00' : '£0.00',
    hasReceivedPrice,
    discount: { percentage: 0, amount: 0, formattedAmount: '£0.00' },
    getString: (_key: string, _vars: unknown, fallback: string) => fallback,
  };
}

describe('Price loading state', () => {
  it('renders a skeleton instead of the placeholder zero before the first CURRENT_PRICE', () => {
    priceContext = createContext(false);

    render(<Price />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading price')).toBeInTheDocument();
    // The placeholder zero must never reach the page: it reads as a real free-product price.
    expect(screen.queryByText(/0\.00/)).not.toBeInTheDocument();
  });

  it('reserves the loaded price line box by rendering the real price element', () => {
    priceContext = createContext(false);

    render(<Price />);

    // The skeleton IS the price element, so it inherits the exact font-size and line-height the
    // price will have — including merchant CSS from cssString targeting this id.
    const priceElement = document.getElementById('ov25-price-product-page');
    expect(priceElement).not.toBeNull();
    expect(priceElement?.tagName).toBe('P');
    expect(priceElement?.className).toContain('ov:text-2xl');
    expect(priceElement?.textContent).not.toMatch(/\d/);
  });

  it('renders the price once the configurator has reported one', () => {
    priceContext = createContext(true);

    render(<Price />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('£1,299.00')).toBeInTheDocument();
    expect(document.getElementById('ov25-price-product-page')).not.toBeNull();
  });

  it('shows nothing, not a skeleton, while a Snap2 dialog has not been opened', () => {
    // Desktop dialog and mobile modal: the viewer (and so the price) only exists once Configure is pressed.
    for (const snap2 of [{ isMobile: false, configuratorDisplayMode: 'modal' }, { isMobile: true, configuratorDisplayModeMobile: 'modal' }]) {
      priceContext = { ...createContext(false), isSnap2Mode: true, configuratorDisplayMode: 'modal', configuratorDisplayModeMobile: 'drawer', ...snap2 };
      const view = render(<Price />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(view.container.querySelector('#ov25-configurator-price-container')).toHaveStyle({ display: 'none' });
      view.unmount();
    }
    // Once a price arrives it shows as usual.
    priceContext = { ...createContext(true), isSnap2Mode: true, isMobile: false, configuratorDisplayMode: 'modal' };
    render(<Price />);
    expect(screen.getByText('£1,299.00')).toBeInTheDocument();
  });

  it('keeps the skeleton where a Snap2 viewer loads with the page', () => {
    for (const snap2 of [{ isMobile: false, configuratorDisplayMode: 'inline' }, { isMobile: false, configuratorDisplayMode: 'inline-sheet' }, { isMobile: true, configuratorDisplayModeMobile: 'drawer' }]) {
      priceContext = { ...createContext(false), isSnap2Mode: true, configuratorDisplayMode: 'modal', configuratorDisplayModeMobile: 'modal', ...snap2 };
      const view = render(<Price />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
      view.unmount();
    }
  });
});
