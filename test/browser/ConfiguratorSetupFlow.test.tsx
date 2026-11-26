import * as React from 'react';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConfiguratorSetup from '../../setup/src/components/ConfiguratorSetup';
import { buildDefaultConfiguratorSetupPayload } from '../../setup/src/components/ConfiguratorSetup/serialize-config';


beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('preset-first setup', () => {
  it('browses without applying, applies one type, edits, and exports unchanged payload shape', () => {
    const onSave = vi.fn();
    render(<ConfiguratorSetup hidePreview onSave={onSave} />);
    expect(screen.getByRole('heading', { name: 'Choose a preset' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio').slice(0, 2).map((radio) => radio.getAttribute('value'))).toEqual(['in-page', 'classic']);
    expect(screen.getByRole('radio', { name: /In-page/ })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: /Guided/ }));
    expect(JSON.parse(localStorage.getItem('ov25-configurator-setup')!).typeSettings.standard.configurator.displayModeDesktop).toBe('sheet');
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
    expect(screen.getByRole('heading', { name: 'Guided' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }));
    const saved = onSave.mock.calls[0][0];
    expect(saved.standard.configurator.variants.displayMode.desktop).toBe('wizard');
    expect(saved.snap2).toEqual(buildDefaultConfiguratorSetupPayload().snap2);
    expect(saved).not.toHaveProperty('setupProgress');
    fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));
    expect(screen.getByRole('tab', { name: 'Settings', exact: true })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Summary' }));
    expect(screen.getByRole('heading', { name: 'Guided' })).toBeInTheDocument();
  });

  it('keeps fresh untouched drafts in the picker and applied drafts in the summary', () => {
    const first = render(<ConfiguratorSetup hidePreview />);
    first.unmount();
    const second = render(<ConfiguratorSetup hidePreview />);
    expect(screen.getByRole('heading', { name: 'Choose a preset' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
    second.unmount();
    render(<ConfiguratorSetup hidePreview />);
    expect(screen.getByRole('heading', { name: 'In-page' })).toBeInTheDocument();
  });

  it('requires reset confirmation for legacy customisations, can cancel, and rehydrates new initialConfig', () => {
    const onSave = vi.fn();
    const initial = buildDefaultConfiguratorSetupPayload();
    initial.standard.branding = { cssString: '.merchant { color: red; }', logoURL: 'logo.svg' };
    const { rerender } = render(<ConfiguratorSetup hidePreview initialConfig={initial} onSave={onSave} />);
    expect(screen.getByRole('heading', { name: 'Current configuration' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Change preset' }));
    fireEvent.click(screen.getByRole('radio', { name: /Overview/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }));
    expect(onSave.mock.calls[0][0].standard.branding.cssString).toContain('.merchant');
    fireEvent.click(screen.getByRole('button', { name: 'Change preset' }));
    fireEvent.click(screen.getByRole('radio', { name: /Guided/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('custom CSS');
    fireEvent.click(screen.getByRole('button', { name: 'Replace settings' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }));
    expect(onSave.mock.calls[1][0].standard.branding).toEqual({ logoURL: 'logo.svg' });
    rerender(<ConfiguratorSetup hidePreview initialConfig={buildDefaultConfiguratorSetupPayload()} onSave={onSave} />);
    expect(screen.getByRole('heading', { name: 'Current configuration' })).toBeInTheDocument();
  });

  it('shows the preview and host controls only after choosing a preset, prevents duplicate site requests, and keeps Save independent', async () => {
    let finish!: () => void;
    const onRequest = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    const onSave = vi.fn();
    render(<ConfiguratorSetup previewBaseUrl={`${window.location.origin}/mock-demo`} onSave={onSave} livePreview={{ onRequest }} previewToolbar={<span>Host product selector</span>} />);
    fireEvent.click(screen.getByRole('radio', { name: /Overview/ }));
    expect(screen.queryByTitle('Configurator preview')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open site preview' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save', exact: true })).not.toBeInTheDocument();
    expect(screen.queryByText('Host product selector')).not.toBeInTheDocument();
    expect(onRequest).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
    expect(screen.getByTitle('Configurator preview')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open site preview' }));
    expect(onRequest.mock.calls[0][0].payload.standard.configurator.displayMode.desktop).toBe('inline-sticky');
    expect(onRequest.mock.calls[0][0].activeLayout).toBe('standard');
    expect(screen.getByRole('button', { name: /Opening site preview/ })).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Host product selector')).toBeInTheDocument();
    await act(async () => finish());
    expect(screen.getByRole('button', { name: 'Open site preview' })).toBeEnabled();
    expect(onRequest).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Change preset' }));
    expect(screen.queryByTitle('Configurator preview')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open site preview' })).not.toBeInTheDocument();
    expect(screen.queryByText('Host product selector')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel', exact: true }));
    expect(screen.getByTitle('Configurator preview')).toBeInTheDocument();
  });

  it('discards an uncommitted candidate when product type changes', () => {
    render(<ConfiguratorSetup hidePreview />);
    fireEvent.click(screen.getByRole('radio', { name: /Guided/ }));
    fireEvent.click(screen.getByRole('button', { name: /Snap2/ }));
    expect(screen.getByRole('radio', { name: /Classic/ })).toBeChecked();
    expect(screen.queryByRole('radio', { name: /Fullscreen/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Bed/ }));
    expect(screen.getByRole('radio', { name: /Classic/ })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: /Standard/ }));
    expect(screen.getByRole('radio', { name: /In-page/ })).toBeChecked();
  });
});

it('blocks unsupported new presets without blocking retained configurations', () => {
  const compatibility = { buildId: 'limited-build', supportedFeatures: ['settings:legacy-2026-09-29'] };
  const onSave = vi.fn();
  const { rerender } = render(<ConfiguratorSetup hidePreview compatibility={compatibility} onSave={onSave} />);
  expect(screen.getByRole('button', { name: 'Use preset' })).toBeDisabled();
  expect(screen.getByRole('alert')).toHaveTextContent('This store needs an update');
  rerender(<ConfiguratorSetup hidePreview compatibility={compatibility} initialConfig={buildDefaultConfiguratorSetupPayload()} onSave={onSave} />);
  expect(screen.getByRole('button', { name: 'Save', exact: true })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }));
  expect(onSave).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Change preset' }));
  fireEvent.click(screen.getByRole('radio', { name: /Overview/ }));
  expect(screen.getByRole('button', { name: 'Use preset' })).toBeDisabled();
});

it('surfaces preview errors and update labels without disabling Save', async () => {
  const onRequest = vi.fn().mockRejectedValue(new Error('The storefront did not confirm this draft.'));
  const { rerender } = render(<ConfiguratorSetup hidePreview initialConfig={buildDefaultConfiguratorSetupPayload()} livePreview={{ onRequest }} onSave={vi.fn()} />);
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Open site preview' })));
  expect(screen.getByRole('alert')).toHaveTextContent('did not confirm');
  expect(screen.getByRole('button', { name: 'Save', exact: true })).toBeEnabled();
  rerender(<ConfiguratorSetup hidePreview initialConfig={buildDefaultConfiguratorSetupPayload()} livePreview={{ onRequest, status: 'ready' }} onSave={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Update site preview' })).toBeEnabled();
});

it('does not grandfather an unsupported autosaved draft after reopening setup', () => {
  const compatibility = { buildId: 'limited-build', supportedFeatures: ['settings:legacy-2026-09-29', 'layout:sheet', 'layout:drawer', 'variants:tree', 'variants:list', 'selection-details:tooltip', 'selection-details:fullscreen', 'gallery:stacked', 'gallery:carousel', 'gallery:auto-cutouts'] };
  const onSave = vi.fn();
  const first = render(<ConfiguratorSetup hidePreview compatibility={compatibility} onSave={onSave} />);
  fireEvent.click(screen.getByRole('radio', { name: /Fullscreen/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
  expect(screen.getByRole('button', { name: 'Save', exact: true })).toBeEnabled();
  first.unmount();
  // This is the same autosaved state produced by an editor change. It was never saved to the host.
  const draft = JSON.parse(localStorage.getItem('ov25-configurator-setup')!);
  draft.typeSettings.standard.configurator.variantDisplayDesktop = 'wizard';
  localStorage.setItem('ov25-configurator-setup', JSON.stringify(draft));
  render(<ConfiguratorSetup hidePreview compatibility={compatibility} onSave={onSave} />);
  expect(screen.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  expect(screen.getByRole('alert')).toHaveTextContent('variants: wizard');
  expect(onSave).not.toHaveBeenCalled();
});

it('retains known preset provenance when the host echoes a successful save', () => {
  const onSave = vi.fn();
  const view = render(<ConfiguratorSetup hidePreview onSave={onSave} />);
  fireEvent.click(screen.getByRole('radio', { name: /Guided/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }));
  view.rerender(<ConfiguratorSetup hidePreview initialConfig={onSave.mock.calls[0][0]} onSave={onSave} />);
  expect(screen.getByRole('heading', { name: 'Guided' })).toBeInTheDocument();
  view.unmount();
  render(<ConfiguratorSetup hidePreview initialConfig={onSave.mock.calls[0][0]} onSave={onSave} />);
  expect(screen.getByRole('heading', { name: 'Guided' })).toBeInTheDocument();
});
