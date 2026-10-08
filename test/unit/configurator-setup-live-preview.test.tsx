import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LivePreviewAction } from '../../setup/src/components/ConfiguratorSetup';
import type { ConfiguratorSetupLivePreviewConfig, ConfiguratorSetupPlacementValidation } from '../../setup/src/components/ConfiguratorSetup/live-preview';
import { PlacementValidation } from '../../setup/src/components/ConfiguratorSetup/PlacementValidation';
import type { ConfiguratorSetupFormState } from '../../setup/src/components/ConfiguratorSetup/types';

vi.mock('../../setup/node_modules/react/index.js', async () => vi.importActual('react'));
vi.mock('../../setup/src/components/ConfiguratorSetup/serialize-config', () => ({
  buildConfiguratorSetupPayload: (state: ConfiguratorSetupFormState) => ({ standard: { selectors: state.typeSettings?.standard?.selectors ?? {} } }),
  buildSerializableConfig: vi.fn(),
}));

const state = { layout: 'standard' } as ConfiguratorSetupFormState;

function renderAction(config: ConfiguratorSetupLivePreviewConfig) {
  return render(<LivePreviewAction config={config} state={state} />);
}

describe('ConfiguratorSetup site-preview availability', () => {
  it('shows Checking and disables opening and retrying while checking', () => {
    const onRequest = vi.fn();
    const onRetry = vi.fn();
    renderAction({ onRequest, onRetry, availability: 'checking', message: 'Checking your storefront…' });
    const open = screen.getByRole('button', { name: 'Checking site preview…' });
    expect(open).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Retry check' })).toBeDisabled();
    fireEvent.click(open);
    expect(onRequest).not.toHaveBeenCalled();
  });

  it.each(['unsupported', 'unverified'] as const)('keeps Retry check enabled when %s disables opening', async (availability) => {
    const onRequest = vi.fn();
    const onRetry = vi.fn();
    renderAction({ onRequest, onRetry, availability, disabled: true, message: 'Update or enable your plugin, then retry the check.' });
    expect(screen.getByRole('button', { name: 'Open site preview' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Update or enable your plugin');
    const retry = screen.getByRole('button', { name: 'Retry check' });
    expect(retry).not.toBeDisabled();
    await act(async () => { fireEvent.click(retry); });
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onRequest).not.toHaveBeenCalled();
  });

  it('only marks an acknowledged draft as Update site preview', async () => {
    const onRequest = vi.fn();
    const { rerender } = renderAction({ onRequest, availability: 'supported', status: 'idle' });
    const open = screen.getByRole('button', { name: 'Open site preview' });
    expect(open).not.toBeDisabled();
    await act(async () => {
      fireEvent.click(open);
      expect(onRequest).toHaveBeenCalledOnce();
    });
    expect(onRequest).toHaveBeenCalledWith({ payload: { standard: { selectors: {} } }, activeLayout: 'standard' });
    rerender(<LivePreviewAction config={{ onRequest, availability: 'supported', status: 'ready' }} state={state} />);
    expect(screen.getByRole('button', { name: 'Update site preview' })).not.toBeDisabled();
  });

  it('blocks duplicate retry requests and reopening until the check resolves', async () => {
    let resolve!: () => void;
    const onRetry = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    const onRequest = vi.fn();
    renderAction({ onRequest, onRetry, availability: 'supported' });
    const retry = screen.getByRole('button', { name: 'Retry check' });
    fireEvent.click(retry);
    fireEvent.click(retry);
    expect(screen.getByRole('button', { name: 'Checking site preview…' })).toBeDisabled();
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onRequest).not.toHaveBeenCalled();
    await act(async () => { resolve(); });
    expect(screen.getByRole('button', { name: 'Open site preview' })).not.toBeDisabled();
  });

  it('retains legacy hosts without an availability field and displays rejected requests', async () => {
    const onRequest = vi.fn().mockRejectedValue(new Error('Preview could not be opened.'));
    renderAction({ onRequest });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Open site preview' })); });
    expect(screen.getByRole('alert')).toHaveTextContent('Preview could not be opened.');
  });
});

function placementReport(overrides: Partial<ConfiguratorSetupPlacementValidation> = {}): ConfiguratorSetupPlacementValidation {
  return {
    schemaVersion: 1, themeId: '1234', template: 'product.ov25',
    viewport: { width: 1440, height: 900, mode: 'desktop' },
    checks: [{ key: 'gallery', selector: '.product__media-wrapper', status: 'matched', matchCount: 1, issues: [] }],
    sessionId: 'session-1', revision: 1, validationRunId: 'run-1', checkedAt: 1780000000000,
    activeLayout: 'standard', shopDomain: 'example.myshopify.com', productId: '12345',
    ...overrides,
  };
}

describe('ConfiguratorSetup live placement results', () => {
  it('keeps older plugins explicitly unchecked after they acknowledge mounting', () => {
    renderAction({ onRequest: vi.fn(), availability: 'supported', status: 'ready' });
    expect(screen.getByText(/Page placement: Not checked/)).toHaveTextContent('This preview did not report placement checks.');
    expect(screen.queryByText(/Page placement ·/)).not.toBeInTheDocument();
  });

  it('shows bounded target warnings and identifies the only viewport checked', async () => {
    const config: ConfiguratorSetupLivePreviewConfig = { onRequest: vi.fn(), availability: 'supported', contextKey: 'store:product:integration' };
    const { rerender } = renderAction(config);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Open site preview' })); });
    const report = placementReport({ checks: [
      { key: 'gallery', selector: '.product__media-wrapper', status: 'matched', matchCount: 1, issues: [] },
      { key: 'price', selector: '.price', status: 'ambiguous', matchCount: 3, issues: ['multiple-matches', 'not-visible'] },
      { key: 'name', selector: '#name', status: 'missing', matchCount: 0, issues: ['no-match'] },
      { key: 'swatches', selector: '', status: 'not-required', matchCount: 0, issues: ['disabled'] },
    ] });
    rerender(<LivePreviewAction config={{ ...config, status: 'ready', placementValidation: report }} state={state} />);
    expect(screen.getByText('Page placement · 1 matched, 2 need review')).toBeInTheDocument();
    expect(screen.getByText('Desktop · 1440 × 900')).toBeInTheDocument();
    expect(screen.getByText('Theme 1234 · product.ov25')).toBeInTheDocument();
    expect(screen.getByText(/Check mobile separately/)).toBeInTheDocument();
    expect(screen.getByText('3 matches')).toBeInTheDocument();
    expect(screen.getByText('The configurator uses the first match. Check that it is the intended element.')).toBeInTheDocument();
    expect(screen.getByText('The first match is hidden in this viewport.')).toBeInTheDocument();
    expect(screen.getByText('No element matches this selector.')).toBeInTheDocument();
    expect(screen.getByText('Not required')).toBeInTheDocument();
  });

  it('hides checks for changed payloads and restores them only for the exact submitted draft', async () => {
    const config: ConfiguratorSetupLivePreviewConfig = { onRequest: vi.fn(), availability: 'supported' };
    const { rerender } = renderAction(config);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Open site preview' })); });
    const ready = { ...config, status: 'ready' as const, placementValidation: placementReport() };
    rerender(<LivePreviewAction config={ready} state={state} />);
    expect(screen.getByText('Page placement · 1 matched')).toBeInTheDocument();
    const changed = { ...state, typeSettings: { standard: { selectors: { gallery: { selector: '.new-gallery' } } } } } as ConfiguratorSetupFormState;
    rerender(<LivePreviewAction config={ready} state={changed} />);
    expect(screen.queryByText('Page placement · 1 matched')).not.toBeInTheDocument();
    expect(screen.getByText(/Page placement: Not checked/)).toHaveTextContent('Update the site preview to check your changed draft.');
    rerender(<LivePreviewAction config={ready} state={state} />);
    expect(screen.getByText('Page placement · 1 matched')).toBeInTheDocument();
  });

  it('invalidates results when the layout or host store/product/integration context changes', async () => {
    const config: ConfiguratorSetupLivePreviewConfig = { onRequest: vi.fn(), availability: 'supported', contextKey: 'store:product:old-selectors' };
    const { rerender } = renderAction(config);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Open site preview' })); });
    const ready = { ...config, status: 'ready' as const, placementValidation: placementReport() };
    rerender(<LivePreviewAction config={ready} state={{ ...state, layout: 'snap2' }} />);
    expect(screen.queryByText('Page placement · 1 matched')).not.toBeInTheDocument();
    rerender(<LivePreviewAction config={{ ...ready, contextKey: 'store:product:new-selectors' }} state={state} />);
    expect(screen.queryByText('Page placement · 1 matched')).not.toBeInTheDocument();
    expect(screen.getByText(/Page placement: Not checked/)).toBeInTheDocument();
  });

  it('does not attach an existing report to a new request or trust it without a submitted draft', async () => {
    let resolve!: () => void;
    const onRequest = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    const ready: ConfiguratorSetupLivePreviewConfig = { onRequest, status: 'ready', placementValidation: placementReport() };
    const { rerender } = renderAction(ready);
    expect(screen.queryByText('Page placement · 1 matched')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Update site preview' }));
    expect(screen.queryByText('Page placement · 1 matched')).not.toBeInTheDocument();
    await act(async () => { resolve(); });
    expect(screen.queryByText('Page placement · 1 matched')).not.toBeInTheDocument();
    rerender(<LivePreviewAction config={{ ...ready, placementValidation: placementReport({ revision: 2, validationRunId: 'run-2' }) }} state={state} />);
    expect(screen.getByText('Page placement · 1 matched')).toBeInTheDocument();
  });

  it('shows failure diagnostics without claiming that the preview mounted successfully', async () => {
    const config: ConfiguratorSetupLivePreviewConfig = { onRequest: vi.fn() };
    const { rerender } = renderAction(config);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Open site preview' })); });
    rerender(<LivePreviewAction config={{ ...config, status: 'error', message: 'The configurator could not mount.', placementValidation: placementReport({ checks: [{ key: 'gallery', selector: 'body', status: 'unsafe', matchCount: 1, issues: ['unsafe-target'] }] }) }} state={state} />);
    expect(screen.getByRole('alert')).toHaveTextContent('The configurator could not mount.');
    expect(screen.getByText('Page placement · 0 matched, 1 needs review')).toBeInTheDocument();
    expect(screen.getByText('Replacing this element could remove other page content.')).toBeInTheDocument();
  });

  it('caps displayed selectors and counts and handles unknown theme context', () => {
    const longSelector = '.a'.repeat(1500);
    render(<PlacementValidation report={placementReport({
      themeId: null, template: null, viewport: { width: 390, height: 844, mode: 'mobile' },
      checks: [{ key: 'gallery', selector: longSelector, status: 'ambiguous', matchCount: 101, issues: ['multiple-matches', 'context-unverified'] }],
    })} />);
    expect(screen.getByText('101+ matches')).toBeInTheDocument();
    expect(screen.getByText(longSelector.slice(0, 2048))).toBeInTheDocument();
    expect(screen.queryByText(longSelector)).not.toBeInTheDocument();
    expect(screen.getByText('Theme unknown · Template unknown')).toBeInTheDocument();
    expect(screen.getByText(/Check desktop separately/)).toBeInTheDocument();
  });
});
