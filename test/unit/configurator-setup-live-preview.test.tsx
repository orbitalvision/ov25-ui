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

  it('opens password-protected stores and lets the user resume without claiming readiness', async () => {
    const onRequest = vi.fn();
    const config: ConfiguratorSetupLivePreviewConfig = { onRequest, availability: 'requires-unlock', status: 'idle', message: 'Enter the storefront password in the preview tab.' };
    const { rerender } = renderAction(config);
    expect(screen.getByRole('button', { name: 'Open site preview' })).toBeEnabled();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Open site preview' })); });
    rerender(<LivePreviewAction config={{ ...config, label: 'Continue after unlocking' }} state={state} />);
    expect(screen.getByRole('status')).toHaveTextContent('Enter the storefront password');
    const resume = screen.getByRole('button', { name: 'Continue after unlocking' });
    expect(resume).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Update site preview' })).not.toBeInTheDocument();
    await act(async () => { fireEvent.click(resume); });
    expect(onRequest).toHaveBeenCalledTimes(2);
  });

  it('blocks duplicate retry requests and reopening until the check resolves', async () => {
    let resolve!: () => void;
    const onRetry = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    const onRequest = vi.fn();
    const { rerender } = renderAction({ onRequest, onRetry, availability: 'unverified' });
    const retry = screen.getByRole('button', { name: 'Retry check' });
    fireEvent.click(retry);
    fireEvent.click(retry);
    expect(screen.getByRole('button', { name: 'Checking site preview…' })).toBeDisabled();
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onRequest).not.toHaveBeenCalled();
    await act(async () => { resolve(); });
    rerender(<LivePreviewAction config={{ onRequest, onRetry, availability: 'supported' }} state={state} />);
    expect(screen.getByRole('button', { name: 'Open site preview' })).not.toBeDisabled();
  });

  it('offers Retry check only while the preview is unavailable', () => {
    renderAction({ onRequest: vi.fn(), onRetry: vi.fn(), availability: 'supported', status: 'ready' });
    expect(screen.queryByRole('button', { name: 'Retry check' })).not.toBeInTheDocument();
  });

  it('updates an open preview by itself shortly after edits stop, instead of offering Update site preview', async () => {
    vi.useFakeTimers();
    try {
      const onRequest = vi.fn();
      const onAutoUpdate = vi.fn();
      const ready: ConfiguratorSetupLivePreviewConfig = { onRequest, onAutoUpdate, availability: 'supported', status: 'ready' };
      const { rerender } = renderAction(ready);
      expect(screen.getByRole('button', { name: 'Open site preview' })).toBeEnabled();
      expect(screen.queryByRole('button', { name: 'Update site preview' })).not.toBeInTheDocument();
      // A preview opened elsewhere already shows this draft: nothing to send yet.
      await act(async () => { vi.advanceTimersByTime(5000); });
      expect(onAutoUpdate).not.toHaveBeenCalled();

      const edit = (selector: string) => ({ ...state, typeSettings: { standard: { selectors: { gallery: { selector } } } } } as ConfiguratorSetupFormState);
      rerender(<LivePreviewAction config={ready} state={edit('.a')} />);
      await act(async () => { vi.advanceTimersByTime(1000); });
      rerender(<LivePreviewAction config={ready} state={edit('.ab')} />);
      await act(async () => { vi.advanceTimersByTime(1000); });
      expect(onAutoUpdate).not.toHaveBeenCalled();
      await act(async () => { vi.advanceTimersByTime(600); });
      expect(onAutoUpdate).toHaveBeenCalledOnce();
      expect(onAutoUpdate).toHaveBeenCalledWith({ payload: { standard: { selectors: { gallery: { selector: '.ab' } } } }, activeLayout: 'standard' });
      await act(async () => { vi.advanceTimersByTime(5000); });
      expect(onAutoUpdate).toHaveBeenCalledOnce();
      expect(onRequest).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not auto-update without an open preview, or in guided setup', async () => {
    vi.useFakeTimers();
    try {
      const onAutoUpdate = vi.fn();
      const changed = { ...state, typeSettings: { standard: { selectors: { gallery: { selector: '.b' } } } } } as ConfiguratorSetupFormState;
      const { rerender } = render(<LivePreviewAction config={{ onRequest: vi.fn(), onAutoUpdate, availability: 'supported', status: 'idle' }} state={state} />);
      rerender(<LivePreviewAction config={{ onRequest: vi.fn(), onAutoUpdate, availability: 'supported', status: 'idle' }} state={changed} />);
      await act(async () => { vi.advanceTimersByTime(5000); });
      const guided = render(<LivePreviewAction simple config={{ onRequest: vi.fn(), onAutoUpdate, availability: 'supported', status: 'ready' }} state={state} />);
      guided.rerender(<LivePreviewAction simple config={{ onRequest: vi.fn(), onAutoUpdate, availability: 'supported', status: 'ready' }} state={changed} />);
      await act(async () => { vi.advanceTimersByTime(5000); });
      expect(onAutoUpdate).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
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

describe('ConfiguratorSetup live placement warnings', () => {
  const broken = { key: 'name' as const, selector: '#name', status: 'missing' as const, matchCount: 0, issues: ['no-match' as const] };

  it('shows nothing about placement when every target is fine or the plugin reports no checks', () => {
    const { rerender } = renderAction({ onRequest: vi.fn(), availability: 'supported', status: 'ready' });
    expect(screen.queryByText(/Page placement/)).not.toBeInTheDocument();
    render(<PlacementValidation report={placementReport()} />);
    expect(document.querySelector('[data-ov25-placement-validation]')).toBeNull();
    rerender(<LivePreviewAction config={{ onRequest: vi.fn(), availability: 'supported', status: 'ready' }} state={state} />);
    expect(screen.queryByText(/Not checked/)).not.toBeInTheDocument();
  });

  it('turns definite problems into plain sentences and leaves out borderline results', () => {
    render(<PlacementValidation report={placementReport({ viewport: { width: 390, height: 844, mode: 'mobile' }, checks: [
      { key: 'gallery', selector: '.product__media-wrapper', status: 'matched', matchCount: 1, issues: [] },
      { key: 'price', selector: '.price', status: 'ambiguous', matchCount: 3, issues: ['multiple-matches'] },
      { key: 'variants', selector: 'body', status: 'unsafe', matchCount: 1, issues: ['unsafe-target'] },
      broken,
      { key: 'swatches', selector: '.swatch', status: 'hidden', matchCount: 1, issues: ['not-visible'] },
      { key: 'addToCartFormSelector', selector: 'form[', status: 'invalid', matchCount: 0, issues: ['invalid-selector'] },
      { key: 'configureButton', selector: '', status: 'not-required', matchCount: 0, issues: ['disabled'] },
    ] })} />);
    expect(screen.getByText('OV25 couldn’t find the product name on your product page.')).toBeInTheDocument();
    expect(screen.getByText('OV25 found where the swatches should go, but that part of your page is hidden on mobile.')).toBeInTheDocument();
    expect(screen.getByText('The add to basket form placement isn’t a valid setting.')).toBeInTheDocument();
    expect(screen.getByText('Check Settings › Storefront selectors and the Global tab.')).toBeInTheDocument();
    expect(screen.queryByText(/price/)).not.toBeInTheDocument();
    expect(screen.queryByText(/option controls/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\.price|body|form\[/)).not.toBeInTheDocument();
  });

  it('shows warnings only for the exact draft the preview checked', async () => {
    const config: ConfiguratorSetupLivePreviewConfig = { onRequest: vi.fn(), availability: 'supported', contextKey: 'store:product:integration' };
    const { rerender } = renderAction(config);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Open site preview' })); });
    const ready = { ...config, status: 'ready' as const, placementValidation: placementReport({ checks: [broken] }) };
    const warning = 'OV25 couldn’t find the product name on your product page.';
    rerender(<LivePreviewAction config={ready} state={state} />);
    expect(screen.getByText(warning)).toBeInTheDocument();
    const changed = { ...state, typeSettings: { standard: { selectors: { gallery: { selector: '.new-gallery' } } } } } as ConfiguratorSetupFormState;
    rerender(<LivePreviewAction config={ready} state={changed} />);
    expect(screen.queryByText(warning)).not.toBeInTheDocument();
    rerender(<LivePreviewAction config={ready} state={state} />);
    expect(screen.getByText(warning)).toBeInTheDocument();
    rerender(<LivePreviewAction config={{ ...ready, contextKey: 'store:product:new-selectors' }} state={state} />);
    expect(screen.queryByText(warning)).not.toBeInTheDocument();
  });

  it('keeps the open preview’s warnings when the editor joins a preview opened elsewhere', () => {
    renderAction({ onRequest: vi.fn(), onAutoUpdate: vi.fn(), availability: 'supported', status: 'ready', placementValidation: placementReport({ checks: [broken] }) });
    expect(screen.getByText('OV25 couldn’t find the product name on your product page.')).toBeInTheDocument();
  });

  it('does not attach an existing report to a new request', async () => {
    let resolve!: () => void;
    const onRequest = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    const ready: ConfiguratorSetupLivePreviewConfig = { onRequest, status: 'ready', placementValidation: placementReport({ checks: [broken] }) };
    const warning = 'OV25 couldn’t find the product name on your product page.';
    const { rerender } = renderAction(ready);
    expect(screen.queryByText(warning)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Update site preview' }));
    await act(async () => { resolve(); });
    expect(screen.queryByText(warning)).not.toBeInTheDocument();
    rerender(<LivePreviewAction config={{ ...ready, placementValidation: placementReport({ checks: [broken], revision: 2, validationRunId: 'run-2' }) }} state={state} />);
    expect(screen.getByText(warning)).toBeInTheDocument();
  });

  it('tells a guided store what to do while its locked storefront is being unlocked, and stays quiet otherwise', () => {
    const unlocking = render(<LivePreviewAction simple config={{ onRequest: vi.fn(), availability: 'requires-unlock', status: 'waiting', message: 'Enter the storefront password in the preview tab, then come back here.' }} state={state} />);
    expect(screen.getByText(/then come back here/)).toBeInTheDocument();
    unlocking.unmount();
    render(<LivePreviewAction simple config={{ onRequest: vi.fn(), availability: 'supported', status: 'ready', message: 'Your site preview is open and updates as you edit.' }} state={state} />);
    expect(screen.queryByText(/updates as you edit/)).not.toBeInTheDocument();
  });
});

describe('ConfiguratorSetup site preview in the toolbar', () => {
  function renderToolbar(config: ConfiguratorSetupLivePreviewConfig, reportContainer: HTMLElement | null = null) {
    return render(<LivePreviewAction config={config} state={state} toolbar={{ reportContainer }} />);
  }

  it('keeps the status message as a hover hint instead of text in the bar', () => {
    const message = 'Your storefront is password protected. Open site preview and enter the storefront password if prompted.';
    const { container } = renderToolbar({ onRequest: vi.fn(), availability: 'requires-unlock', message });
    const open = screen.getByRole('button', { name: 'Open site preview' });
    expect(open).not.toBeDisabled();
    expect(open).not.toHaveClass('w-full');
    expect(open.parentElement).toHaveAttribute('title', message);
    // Available to assistive technology, but not laid out in the toolbar.
    expect(screen.getByRole('status')).toHaveClass('sr-only');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(container.querySelector('[data-ov25-setup-live-preview="toolbar"]')).toBeInTheDocument();
  });

  it('says why opening is blocked in the bar, with Retry check beside it', () => {
    const onRetry = vi.fn();
    renderToolbar({ onRequest: vi.fn(), onRetry, availability: 'unsupported', disabled: true, message: 'Update or enable your plugin, then retry the check.' });
    const open = screen.getByRole('button', { name: 'Open site preview' });
    expect(open).toBeDisabled();
    expect(open.parentElement).not.toHaveAttribute('title');
    expect(screen.getByRole('status')).toHaveTextContent('Update or enable your plugin');
    expect(screen.getByRole('status')).not.toHaveClass('sr-only');
    fireEvent.click(screen.getByRole('button', { name: 'Retry check' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the host’s instruction while a request is waiting, and marks an open preview that follows edits', async () => {
    let finish: () => void = () => {};
    const onRequest = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
    const config = { onRequest, onAutoUpdate: vi.fn(), availability: 'supported' as const, message: 'The preview tab is loading this draft. Switch to it so the configurator can finish loading.' };
    const { rerender } = renderToolbar(config);
    expect(screen.getByRole('status')).toHaveClass('sr-only');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Open site preview' })); });
    expect(screen.getByText(/Switch to it so the configurator can finish loading/)).not.toHaveClass('sr-only');
    await act(async () => { finish(); });
    expect(screen.queryByText('Updates as you edit')).not.toBeInTheDocument();
    rerender(<LivePreviewAction config={{ ...config, status: 'ready', message: 'Your site preview is open and updates as you edit.' }} state={state} toolbar={{ reportContainer: null }} />);
    expect(screen.getByText('Updates as you edit')).toBeInTheDocument();
    rerender(<LivePreviewAction config={{ ...config, status: 'idle', message: 'Site preview closed. Open it again to see your changes.' }} state={state} toolbar={{ reportContainer: null }} />);
    expect(screen.queryByText('Updates as you edit')).not.toBeInTheDocument();
  });

  it('shows a failure in the bar, not only on hover', async () => {
    const onRequest = vi.fn().mockRejectedValue(new Error('Allow pop-ups for this page, then open the site preview again.'));
    renderToolbar({ onRequest, availability: 'supported', message: 'Opens your real product page with temporary settings.' });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Open site preview' })); });
    expect(screen.getByRole('alert')).toHaveTextContent('Allow pop-ups for this page');
    expect(screen.getByRole('button', { name: 'Open site preview' }).parentElement).not.toHaveAttribute('title');
  });

  it('puts placement warnings in the sidebar slot, not in the bar', () => {
    const slot = document.body.appendChild(document.createElement('div'));
    const { container } = renderToolbar({ onRequest: vi.fn(), onAutoUpdate: vi.fn(), availability: 'supported', status: 'ready', placementValidation: placementReport({ checks: [{ key: 'name', selector: '#name', status: 'missing', matchCount: 0, issues: ['no-match'] }] }) }, slot);
    expect(slot).toHaveTextContent('OV25 couldn’t find the product name on your product page.');
    expect(container).not.toHaveTextContent('OV25 couldn’t find the product name');
    slot.remove();
  });

  it('shows a host-reported error in the bar', () => {
    renderToolbar({ onRequest: vi.fn(), availability: 'supported', status: 'error', message: 'The preview could not load this draft.' });
    expect(screen.getByRole('alert')).toHaveTextContent('The preview could not load this draft.');
  });
});
