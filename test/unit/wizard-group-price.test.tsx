import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { WizardVariants } from '../../src/components/VariantSelectMenu/WizardVariants.js';

const state = vi.hoisted(() => ({ context: {} as any, loadMore: undefined as undefined | ((entries: any[]) => void) }));
vi.mock('../../src/contexts/ov25-ui-context.js', () => ({ useOV25UI: () => state.context }));
vi.mock('../../src/components/VariantSelectMenu/variant-cards/DefaultVariantCard.js', () => ({
  DefaultVariantCard: ({ variant, index, onSelect }: any) => <button data-card-index={index} onClick={() => onSelect(variant)}>{variant.name}</button>,
}));
vi.mock('../../src/components/VariantSelectMenu/variant-cards/SizeVariantCard.js', () => ({ SizeVariantCard: () => null }));
vi.mock('../../src/components/VariantSelectMenu/variant-cards/VariantThumb.js', () => ({ VariantThumb: () => null }));
vi.mock('../../src/components/VariantSelectMenu/FilterControls.js', () => ({ FilterControls: () => null }));
vi.mock('../../src/components/VariantSelectMenu/FilterContent.js', () => ({ FilterContent: () => null }));
vi.mock('../../src/components/VariantSelectMenu/Snap2ModulesOptionBody.js', () => ({ Snap2ModulesOptionBody: () => null }));
vi.mock('../../src/components/VariantSelectMenu/CheckoutButton.js', () => ({ CheckoutButton: () => null }));
vi.mock('../../src/components/Snap2VariantSheetColumn.js', () => ({ Snap2VariantSheetColumn: ({ children }: React.PropsWithChildren) => children }));

function group(id: string, upgradePrice: number, count = 1) {
  return { id, name: id, priceSummary: { totalPrice: 10000 + upgradePrice, upgradePrice, currency: 'GBP', isFrom: false },
    selections: Array.from({ length: count }, (_, i) => ({ id: `${id}-${i}`, name: `${id} card ${i}`, thumbnail: '' })) };
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: (entries: any[]) => void) { state.loadMore = callback; }
    observe() {} disconnect() {}
  });
  state.context = {
    variantPanelOptions: [{ id: 'fabric', name: 'Fabric', groups: [group('Standard', 0), group('Leather', 10000), group('Luxury', 20000)] }],
    selectedSelections: [], products: [], activeOptionId: null, setActiveOptionId: vi.fn(),
    handleSelectionSelect: vi.fn(), getSelectedValue: () => '',
    applySearchAndFilters: (option: unknown) => option, hidePricing: false, isSnap2Mode: false,
    currencySymbol: '£', getString: (_key: string, _vars: unknown, fallback: string) => fallback,
  };
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); state.loadMore = undefined; });

it.each([
  ['wizard', true], ['wizard', false], ['guided-overview', true], ['guided-overview', false],
] as const)('shows sticky named groups with optional prices (%s, mobile=%s)', (displayMode, isMobile) => {
  state.context.isMobile = isMobile;
  const { container, rerender } = render(<WizardVariants mode="drawer" displayMode={displayMode} />);
  if (displayMode === 'guided-overview') {
    fireEvent.click(container.querySelector('[data-ov25-guided-overview-action="next"]')!);
  }
  const headings = screen.getAllByRole('heading', { level: 4 });
  expect(headings.map(node => node.textContent)).toEqual(['Standard', 'Leather - +£100.00', 'Luxury - +£200.00']);
  for (const heading of headings) {
    expect(heading).toHaveClass('ov25-group-header', 'ov25-sticky-header', 'ov:sticky', 'ov:top-0');
    expect(heading.nextElementSibling).toHaveClass('ov25-variant-card-grid');
  }
  expect(headings[2].nextElementSibling).toHaveTextContent('Luxury card 0');
  fireEvent.click(screen.getByRole('button', { name: 'Luxury card 0' }));
  expect(state.context.handleSelectionSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'Luxury-0', groupId: 'Luxury' }), 'fabric');
  state.context.hidePricing = true;
  rerender(<WizardVariants mode="drawer" displayMode={displayMode} />);
  expect(screen.getAllByRole('heading', { level: 4 }).map(node => node.textContent)).toEqual(['Standard', 'Leather', 'Luxury']);
  expect(container.querySelector('.ov25-group-price')).toBeNull();
});

it('omits labels for groups outside the visible batch and empty filtered groups', () => {
  state.context.variantPanelOptions[0].groups = [group('Standard', 0, 12), group('Empty', 5000, 0), group('Luxury', 20000)];
  const { container } = render(<WizardVariants mode="inline" />);
  expect(container.querySelectorAll('.ov25-variant-card-grid button')).toHaveLength(12);
  expect(container.querySelector('.ov25-group-price')).toBeNull();
  act(() => state.loadMore?.([{ isIntersecting: true }]));
  expect(container.querySelectorAll('.ov25-group-price')).toHaveLength(1);
  expect(screen.getByRole('heading', { name: /Luxury.*£200/ }).nextElementSibling).toHaveTextContent('Luxury card 0');
  expect(screen.queryByRole('heading', { name: 'Empty' })).toBeNull();
});

it('keeps one label when a group spans multiple batches', () => {
  state.context.variantPanelOptions[0].groups = [group('Luxury', 20000, 15)];
  const { container } = render(<WizardVariants mode="inline" />);
  expect(container.querySelectorAll('.ov25-group-price')).toHaveLength(1);
  act(() => state.loadMore?.([{ isIntersecting: true }]));
  expect(container.querySelectorAll('.ov25-variant-card-grid button')).toHaveLength(15);
  expect(container.querySelectorAll('.ov25-group-price')).toHaveLength(1);
});

it('uses the registered group header replacement when no prices are available', () => {
  state.context.variantPanelOptions[0].groups = [group('Standard', 0)];
  state.context.getString = (key: string, vars: any, fallback: string) => key === 'groupHeader' ? `Collection: ${vars.GROUP_NAME}` : fallback;
  render(<WizardVariants mode="inline" />);
  expect(screen.getByRole('heading', { name: 'Collection: Standard' })).toHaveClass('ov25-group-header');
});
