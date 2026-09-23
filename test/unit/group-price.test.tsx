import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { GroupPrice } from '../../src/components/VariantSelectMenu/GroupPrice';

const context = vi.hoisted(() => ({
  hidePricing: false, isSnap2Mode: false, currencySymbol: '£',
  getString: vi.fn((_key: string, _vars: unknown, fallback: string) => fallback),
}));
vi.mock('../../src/contexts/ov25-ui-context.js', () => ({ useOV25UI: () => context }));
afterEach(() => { cleanup(); context.hidePricing = false; context.isSnap2Mode = false; context.currencySymbol = '£'; });

describe('group product price', () => {
  it('renders the total in the DOM, responds to live updates, and clears unavailable prices', () => {
    const { rerender, container } = render(<GroupPrice price={{ totalPrice: 150000, currency: 'GBP', isFrom: false }} />);
    expect(screen.getByText('£1,500.00 total')).toHaveClass('ov25-group-price');
    expect(screen.getByText('£1,500.00 total')).toHaveAttribute('data-price-pence', '150000');
    rerender(<GroupPrice price={{ totalPrice: 160000, currency: 'GBP', isFrom: true }} />);
    expect(screen.getByText('From £1,600.00 total')).toHaveAttribute('data-price-from', 'true');
    expect(context.getString).toHaveBeenLastCalledWith('groupPriceFromTotal', { PRICE: '£1,600.00' }, 'From £1,600.00 total');
    rerender(<GroupPrice />);
    expect(container).toBeEmptyDOMElement();
  });
  it('honours hidePricing and excludes Snap2 even when given a price', () => {
    context.hidePricing = true;
    const { container, rerender } = render(<GroupPrice price={{ totalPrice: 150000, currency: 'GBP', isFrom: false }} />);
    expect(container).toBeEmptyDOMElement();
    context.hidePricing = false; context.isSnap2Mode = true;
    rerender(<GroupPrice price={{ totalPrice: 150000, currency: 'GBP', isFrom: false }} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('retains genuine zero totals, supports the configured display symbol and rejects invalid totals', () => {
    context.currencySymbol = '€';
    const { container, rerender } = render(<GroupPrice price={{ totalPrice: 0, currency: 'GBP', isFrom: false }} />);
    expect(screen.getByText('€0.00 total')).toBeInTheDocument();
    rerender(<GroupPrice price={{ totalPrice: NaN, currency: 'GBP', isFrom: false }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
