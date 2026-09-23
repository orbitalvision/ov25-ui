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
    const { rerender, container } = render(<GroupPrice price={{ totalPrice: 150000, upgradePrice: 5000, currency: 'GBP', isFrom: false }} />);
    expect(screen.getByText('- +£50.00')).toHaveClass('ov25-group-price');
    expect(screen.getByText('- +£50.00')).toHaveAttribute('data-price-pence', '5000');
    rerender(<GroupPrice price={{ totalPrice: 160000, upgradePrice: 6000, currency: 'GBP', isFrom: true }} />);
    expect(screen.getByText('- From +£60.00')).toHaveAttribute('data-price-from', 'true');
    expect(context.getString).toHaveBeenCalledWith('groupPriceFromTotal', { PRICE: '+£60.00' }, 'From +£60.00');
    rerender(<GroupPrice groupName="Standard" price={{ totalPrice: 70000, upgradePrice: 2000, currency: 'GBP', isFrom: true }} />);
    expect(screen.getByText('Standard - From +£20.00')).toBeInTheDocument();
    rerender(<GroupPrice />);
    expect(container).toBeEmptyDOMElement();
  });
  it('honours hidePricing and excludes Snap2 even when given a price', () => {
    context.hidePricing = true;
    const { container, rerender } = render(<GroupPrice price={{ totalPrice: 150000, upgradePrice: 5000, currency: 'GBP', isFrom: false }} />);
    expect(container).toBeEmptyDOMElement();
    context.hidePricing = false; context.isSnap2Mode = true;
    rerender(<GroupPrice price={{ totalPrice: 150000, upgradePrice: 5000, currency: 'GBP', isFrom: false }} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('hides the cheapest groups and unknown baselines, and supports the currency display symbol', () => {
    context.currencySymbol = '€';
    const { container, rerender } = render(<GroupPrice price={{ totalPrice: 10000, upgradePrice: 0, currency: 'GBP', isFrom: false }} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<GroupPrice price={{ totalPrice: 15000, upgradePrice: 5000, currency: 'GBP', isFrom: false }} />);
    expect(screen.getByText('- +€50.00')).toHaveAttribute('data-total-price-pence', '15000');
    rerender(<GroupPrice price={{ totalPrice: 15000, currency: 'GBP', isFrom: false }} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<GroupPrice price={{ totalPrice: 15000, upgradePrice: NaN, currency: 'GBP', isFrom: false }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
