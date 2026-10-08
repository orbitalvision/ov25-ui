import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SelectorPlacementReview } from '../../setup/src/components/ConfiguratorSetup/SelectorPlacementReview';
import { DEFAULT_TYPE_SETTINGS } from '../../setup/src/components/ConfiguratorSetup/types';
import type { SelectorDiscoveryProposal } from '../../setup/src/components/ConfiguratorSetup/selector-discovery';

vi.mock('../../setup/node_modules/react/index.js', async () => vi.importActual('react'));
afterEach(cleanup);
const proposal: SelectorDiscoveryProposal = {
  schemaVersion: 1, method: 'source', generatedAt: '2026-10-05T12:00:00Z',
  source: { id: 'test-theme', label: 'Test theme', kind: 'local-theme', fingerprint: 'abc', files: ['sections/product.liquid'] }, warnings: [],
  targets: [
    { key: 'gallery', selector: '.product-gallery', confidence: 'high', reason: 'This wrapper contains the product media.', sourceFiles: ['sections/product.liquid'] },
    { key: 'price', selector: '.product-price', confidence: 'medium', reason: 'This element displays a price.', sourceFiles: ['sections/product.liquid'] },
    { key: 'headerSelector', selector: '.site-header', confidence: 'high', reason: 'This header is sticky.', sourceFiles: ['sections/product.liquid'] },
  ],
};

function openReview() { fireEvent.click(screen.getByText('Page placements')); }

describe('compact page placement review', () => {
  it('stays collapsed, never applies automatically and clearly identifies unvalidated source-only analysis', () => {
    const onApply = vi.fn();
    const { container } = render(<SelectorPlacementReview proposal={proposal} settings={DEFAULT_TYPE_SETTINGS.standard} savedSettings="none" onApply={onApply} />);
    expect(container.querySelector('details')).not.toHaveAttribute('open');
    expect(onApply).not.toHaveBeenCalled();
    openReview();
    expect(screen.getByText(/Source-only analysis · Not AI generated/)).toHaveTextContent('not been validated on your rendered site');
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(screen.getByRole('checkbox', { name: /Product gallery/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Product price/ })).not.toBeChecked();
  });

  it.each(['existing', 'unknown'] as const)('warns about %s settings and stages only explicitly selected fields', (savedSettings) => {
    const onApply = vi.fn();
    render(<SelectorPlacementReview proposal={proposal} settings={DEFAULT_TYPE_SETTINGS.standard} savedSettings={savedSettings} scopeLabel="All storefront products" onApply={onApply} />);
    openReview();
    expect(screen.getByRole('note')).toHaveTextContent('other product pages, layouts or older themes');
    expect(screen.getByRole('note')).toHaveTextContent('All storefront products');
    fireEvent.click(screen.getByRole('checkbox', { name: /Product gallery/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Product price/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Include selected placements (1)' }));
    expect(onApply).toHaveBeenCalledWith({ ...proposal, targets: [proposal.targets[1]] });
    expect(screen.getByRole('status')).toHaveTextContent('Included when you apply the palette. No settings have been saved.');
    expect(screen.getByRole('button', { name: 'Include selected placements (1)' })).toBeDisabled();
    expect(DEFAULT_TYPE_SETTINGS.standard.selectors.price.selector).toBe('#price');
  });

  it('lets people inspect current and suggested selectors and remove automatically included placements', () => {
    const onApply = vi.fn();
    render(<SelectorPlacementReview proposal={proposal} settings={DEFAULT_TYPE_SETTINGS.standard} savedSettings="none" includedTargets={['gallery']} onApply={onApply} />);
    openReview();
    fireEvent.click(screen.getAllByText('Selector details')[0]);
    expect(screen.getByText('.configurator-container')).toBeVisible();
    expect(screen.getByText('.product-gallery')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Include selected placements (1)' })).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: /Product gallery/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove included placements' }));
    expect(onApply).toHaveBeenCalledWith({ ...proposal, targets: [] });
  });

  it('hides when there are no available changes and never stages a field disabled during review', () => {
    const onApply = vi.fn();
    const { rerender, container } = render(<SelectorPlacementReview proposal={proposal} settings={DEFAULT_TYPE_SETTINGS.standard} savedSettings="existing" onApply={onApply} />);
    openReview();
    const settings = structuredClone(DEFAULT_TYPE_SETTINGS.standard);
    settings.selectors.gallery.enabled = false;
    rerender(<SelectorPlacementReview proposal={proposal} settings={settings} savedSettings="existing" onApply={onApply} />);
    expect(screen.queryByRole('checkbox', { name: /Product gallery/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: /Product price/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Include selected placements (1)' }));
    expect(onApply).toHaveBeenCalledWith({ ...proposal, targets: [proposal.targets[1]] });
    settings.selectors.price.selector = '.product-price';
    rerender(<SelectorPlacementReview proposal={proposal} settings={settings} savedSettings="existing" onApply={onApply} />);
    expect(container).toBeEmptyDOMElement();
  });
});
