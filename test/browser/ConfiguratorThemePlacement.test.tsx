import * as React from 'react';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConfiguratorSetup from '../../setup/src/components/ConfiguratorSetup';
import type { ThemeStyleProposal } from '../../setup/src/components/ConfiguratorSetup/theme-style';
import type { StorefrontIntegrationConfig } from '../../setup/src/components/ConfiguratorSetup/storefront-integration';
import { DEFAULT_FORM_STATE } from '../../setup/src/components/ConfiguratorSetup/types';

const proposal: ThemeStyleProposal = {
  schemaVersion: 1, method: 'source', generatedAt: '2026-10-05T12:00:00Z',
  source: { id: 'local', label: 'Local theme', kind: 'local-theme', fingerprint: 'colours', files: ['config/settings_data.json'] },
  summary: 'Theme colours.', style: { '--ov25-cta-color': '#243322' },
  palette: [{ role: 'Action', color: '#243322', source: 'config/settings_data.json' }], warnings: [],
  placement: {
    schemaVersion: 1, method: 'source', generatedAt: '2026-10-05T12:00:00Z',
    source: { id: 'local', label: 'Local theme', kind: 'local-theme', fingerprint: 'markup', files: ['sections/main-product.liquid'] },
    warnings: ['Source only; verify placements in a site preview.'],
    targets: [
      { key: 'gallery', selector: '#ov25-gallery', confidence: 'high', reason: 'Dedicated product gallery.', sourceFiles: ['sections/main-product.liquid'] },
      { key: 'headerSelector', selector: '#ov25-header', confidence: 'high', reason: 'Dedicated header.', sourceFiles: ['sections/main-product.liquid'] },
      { key: 'variants', selector: '.native-options', confidence: 'medium', reason: 'Needs review.', sourceFiles: ['sections/main-product.liquid'] },
    ],
  },
};
const draft = () => JSON.parse(localStorage.getItem('ov25-configurator-setup')!);
beforeEach(() => localStorage.clear());
afterEach(cleanup);

function integration(onChange = vi.fn()): StorefrontIntegrationConfig {
  return { status: 'ready', platformLabel: 'Shopify', sections: [{ id: 'placements', title: 'Placements', fields: [{ key: 'headerSelector', label: 'Header', type: 'selector' }] }], values: { headerSelector: '' }, onChange };
}
async function scan() {
  fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Match my site', exact: true })));
}

describe('placements inside theme matching', () => {
  it('stages fresh high-confidence defaults silently, commits with the palette, and keeps Save separate', async () => {
    const onChange = vi.fn(), onSave = vi.fn();
    render(<ConfiguratorSetup hidePreview onSave={onSave} storefrontIntegration={integration(onChange)} themeStyling={{ contextKey: 'local', placement: { contextKey: 'local', savedSettings: 'none', untouchedIntegrationKeys: ['headerSelector'] }, onRequest: async () => proposal }} />);
    await scan();
    expect(draft().typeSettings.standard.selectors.gallery.selector).toBe('.configurator-container');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Apply to draft' }));
    expect(draft().typeSettings.standard.selectors.gallery).toEqual({ selector: '#ov25-gallery', enabled: true, replace: true });
    expect(draft().typeSettings.standard.selectors.variants.selector).toBe('#ov25-controls');
    expect(draft().typeSettings.snap2.selectors.gallery.enabled).toBe(false);
    expect(onChange).toHaveBeenCalledExactlyOnceWith('headerSelector', '#ov25-header');
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }));
    expect(onSave.mock.calls[0][0].standard.selectors.gallery.selector).toBe('#ov25-gallery');
    expect(onSave.mock.calls[0][0].standard).not.toHaveProperty('placement');
  });

  it.each(['existing', 'unknown'] as const)('keeps %s placements unchanged when applying just the palette', async (savedSettings) => {
    const onChange = vi.fn();
    render(<ConfiguratorSetup hidePreview storefrontIntegration={integration(onChange)} themeStyling={{ contextKey: 'local', placement: { contextKey: 'local', savedSettings }, onRequest: async () => proposal }} />);
    await scan();
    fireEvent.click(screen.getByRole('button', { name: 'Apply to draft' }));
    expect(draft().typeSettings.standard.selectors.gallery.selector).toBe('.configurator-container');
    expect(draft().typeSettings.standard.style['--ov25-cta-color']).toBe('#243322');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('preserves a cleared local selector and globals without explicit untouched provenance', async () => {
    const stored = structuredClone(DEFAULT_FORM_STATE);
    stored.setupProgress = { standard: { configured: true, themeStep: 'pending' } };
    stored.typeSettings.standard.selectors.gallery.selector = '';
    localStorage.setItem('ov25-configurator-setup', JSON.stringify(stored));
    const onChange = vi.fn();
    render(<ConfiguratorSetup hidePreview storefrontIntegration={integration(onChange)} themeStyling={{ contextKey: 'local', placement: { contextKey: 'local', savedSettings: 'none' }, onRequest: async () => proposal }} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Match my site', exact: true })));
    fireEvent.click(screen.getByRole('button', { name: 'Apply to draft' }));
    expect(draft().typeSettings.standard.selectors.gallery.selector).toBe('');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies only explicitly included existing placements together with the palette', async () => {
    const onChange = vi.fn();
    render(<ConfiguratorSetup hidePreview storefrontIntegration={integration(onChange)} themeStyling={{ contextKey: 'local', placement: { contextKey: 'local', savedSettings: 'existing' }, onRequest: async () => proposal }} />);
    await scan();
    fireEvent.click(screen.getByText('Page placements', { exact: true }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Product gallery/ }));
    fireEvent.click(screen.getByRole('button', { name: /Include selected placements/ }));
    expect(draft().typeSettings.standard.selectors.gallery.selector).toBe('.configurator-container');
    fireEvent.click(screen.getByRole('button', { name: 'Apply to draft' }));
    expect(draft().typeSettings.standard.selectors.gallery.selector).toBe('#ov25-gallery');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('requires explicit inclusion for existing placements and cancellation still discards both suggestions', async () => {
    const onChange = vi.fn();
    render(<ConfiguratorSetup hidePreview storefrontIntegration={integration(onChange)} themeStyling={{ contextKey: 'local', placement: { contextKey: 'local', savedSettings: 'existing' }, onRequest: async () => proposal }} />);
    await scan();
    fireEvent.click(screen.getByText('Page placements', { exact: true }));
    expect(screen.getByRole('note')).toHaveTextContent(/other product pages/);
    fireEvent.click(screen.getByRole('checkbox', { name: /Product gallery/ }));
    fireEvent.click(screen.getByRole('button', { name: /Include selected placements/ }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel', exact: true }));
    expect(draft().typeSettings.standard.selectors.gallery.selector).toBe('.configurator-container');
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Match my site', exact: true })));
    fireEvent.click(screen.getByRole('button', { name: 'Apply to draft' }));
    expect(draft().typeSettings.standard.selectors.gallery.selector).toBe('.configurator-container');
  });

  it('keeps the palette usable if placement suggestions are malformed or from another theme', async () => {
    render(<ConfiguratorSetup hidePreview themeStyling={{ contextKey: 'local', placement: { contextKey: 'local', savedSettings: 'none' }, onRequest: async () => ({ ...proposal, placement: { ...proposal.placement!, source: { ...proposal.placement!.source, id: 'wrong-store' } } }) }} />);
    await scan();
    expect(screen.getByText(/Page placement suggestions could not be validated/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Apply to draft' }));
    expect(draft().typeSettings.standard.selectors.gallery.selector).toBe('.configurator-container');
    expect(draft().typeSettings.standard.style['--ov25-cta-color']).toBe('#243322');
  });
});
