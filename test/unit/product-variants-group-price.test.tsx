import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ProductVariantsWrapper } from '../../src/components/VariantSelectMenu/ProductVariantsWrapper.js';

const state = vi.hoisted(() => ({ context: {} as any }));
vi.mock('../../src/contexts/ov25-ui-context.js', () => ({ useOV25UI: () => state.context }));
vi.mock('../../src/components/VariantSelectMenu/ProductVariants.js', () => ({ ProductVariants: () => null }));
vi.mock('../../src/components/VariantSelectMenu/AccordionVariants.js', () => ({ AccordionVariants: ({ reserveCheckoutSpace }: any) => <div data-checkout-reserved={String(reserveCheckoutSpace)} /> }));
vi.mock('../../src/components/VariantSelectMenu/TreeVariants.js', () => ({ TreeVariants: ({ reserveCheckoutSpace }: any) => <div data-checkout-reserved={String(reserveCheckoutSpace)} /> }));
vi.mock('../../src/components/VariantSelectMenu/VariantsHeader.js', () => ({ VariantsHeader: () => null }));
vi.mock('../../src/components/VariantSelectMenu/VariantsContent.js', () => ({ VariantsContent: () => null }));
vi.mock('../../src/components/VariantSelectMenu/variant-cards/SizeVariantCard.js', () => ({ SizeVariantCard: () => null }));
vi.mock('../../src/components/VariantSelectMenu/variant-cards/DefaultVariantCard.js', () => ({ DefaultVariantCard: () => null }));
vi.mock('../../src/components/VariantSelectMenu/CheckoutButton.js', () => ({ CheckoutButton: () => null }));
vi.mock('../../src/components/VariantSelectMenu/FilterControls.js', () => ({ FilterControls: () => null }));
vi.mock('../../src/components/VariantSelectMenu/FilterContent.js', () => ({ FilterContent: () => null }));
vi.mock('../../src/components/VariantSelectMenu/DesktopVariants.js', () => ({ getGridColsClass: () => '' }));

function groups(upgradePrice = 5000) {
  return [
    { id: 'standard', name: 'Standard', priceSummary: { totalPrice: 10000, upgradePrice: 0, currency: 'GBP', isFrom: false }, selections: [{ id: 'a', name: 'A' }] },
    { id: 'luxury', name: 'Luxury', priceSummary: { totalPrice: 10000 + upgradePrice, upgradePrice, currency: 'GBP', isFrom: true }, selections: [{ id: 'b', name: 'B' }] },
  ];
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  state.context = {
    isMobile: true, drawerSize: 'large', isVariantsOpen: true, activeOptionId: undefined,
    variantPanelOptions: [{ id: 'fabric', name: 'Fabric', groups: groups() }],
    selectedSelections: [], products: [], availableProductFilters: {}, searchQueries: {},
    applySearchAndFilters: (option: unknown) => option,
    variantDisplayStyleMobile: 'list', variantDisplayStyleOverlay: 'list',
    variantDisplayStyleInline: 'list', variantDisplayStyleInlineMobile: 'list',
    hidePricing: false, isSnap2Mode: false, currencySymbol: '£',
    getString: (_key: string, _vars: unknown, fallback: string) => fallback,
    getSelectedValueForOption: () => '', setStickyOptionHeader: vi.fn(),
  };
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it.each([
  ['list', true, false], ['tabs', true, false],
  ['list', true, true], ['tabs', true, true],
  ['list', false, false], ['tabs', false, false],
  ['list', false, true], ['tabs', false, true],
])('renders live group prices in %s (mobile=%s, inline=%s)', (style, isMobile, isInline) => {
  Object.assign(state.context, {
    isMobile, variantDisplayStyleMobile: style, variantDisplayStyleOverlay: style,
    variantDisplayStyleInline: style, variantDisplayStyleInlineMobile: style,
  });
  const { rerender, container } = render(<ProductVariantsWrapper isInline={isInline as boolean} />);
  const heading = screen.getByRole('heading', { name: /Luxury\s*- From \+£50\.00/ });
  expect(heading).toHaveClass('ov25-sticky-header');
  for (const optionHeader of container.querySelectorAll('.ov25-option-header')) {
    expect(optionHeader).toHaveClass('ov25-sticky-header');
  }
  expect(heading.querySelector('.ov25-group-price')).toHaveAttribute('data-price-pence', '5000');
  expect(screen.getByRole('heading', { name: 'Standard', exact: true }).querySelector('.ov25-group-price')).toBeNull();

  state.context.variantPanelOptions = [{ id: 'fabric', name: 'Fabric', groups: groups(7500) }];
  rerender(<ProductVariantsWrapper isInline={isInline as boolean} />);
  expect(screen.getByRole('heading', { name: /Luxury\s*- From \+£75\.00/ })).toBeInTheDocument();

  state.context.variantPanelOptions = [{ id: 'fabric', name: 'Fabric', groups: groups().map(({ priceSummary, ...group }) => group) }];
  rerender(<ProductVariantsWrapper isInline={isInline as boolean} />);
  expect(container.querySelector('.ov25-group-price')).toBeNull();
});

it('retains a named price when filtering leaves one group without a heading', () => {
  state.context.variantPanelOptions[0].groups = groups().slice(1);
  const { container, rerender } = render(<ProductVariantsWrapper />);
  expect(container.querySelector('h4')).toBeNull();
  expect(screen.getByText('Luxury - From +£50.00')).toHaveClass('ov25-group-price');
  state.context.hidePricing = true;
  rerender(<ProductVariantsWrapper />);
  expect(container.querySelector('.ov25-group-price')).toBeNull();
  state.context.hidePricing = false;
  state.context.isSnap2Mode = true;
  rerender(<ProductVariantsWrapper />);
  expect(container.querySelector('.ov25-group-price')).toBeNull();
});

it.each(['list', 'tabs', 'tree', 'accordion'])('reserves checkout space only for the mobile drawer in %s', (style) => {
  state.context.variantDisplayStyleMobile = style;
  state.context.configuratorDisplayModeMobile = 'drawer';
  const { container, rerender } = render(<ProductVariantsWrapper />);
  const checkoutPadding = '[class~="ov:pb-16"], [class~="ov:pb-20"], [data-checkout-reserved="true"]';
  expect(container.querySelector(checkoutPadding)).not.toBeNull();
  rerender(<ProductVariantsWrapper embeddedInVariantsOnlySheet />);
  expect(container.querySelector(checkoutPadding)).toBeNull();
  state.context.configuratorDisplayModeMobile = 'modal';
  rerender(<ProductVariantsWrapper />);
  expect(container.querySelector(checkoutPadding)).toBeNull();
});
