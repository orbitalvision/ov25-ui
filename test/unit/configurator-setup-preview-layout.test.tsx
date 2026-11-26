import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ConfiguratorSetup from '../../setup/src/components/ConfiguratorSetup';
import { PresetCards } from '../../setup/src/components/ConfiguratorSetup/PresetCards';
import { buildFormStateFromInitialPayload } from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';
import type { PreviewLayoutType } from '../../setup/src/components/ConfiguratorSetup/types';

vi.mock('../../setup/node_modules/react/index.js', async () => vi.importActual('react'));
// The setup package has its own React installation; these tests do not exercise
// the Radix dialog (covered by the browser suite), whose external dependency uses it.
vi.mock('../../setup/src/components/ui/dialog', () => ({
  Dialog: () => null,
  DialogContent: () => null,
  DialogHeader: () => null,
  DialogTitle: () => null,
  DialogDescription: () => null,
}));

describe('ConfiguratorSetup preview layout reporting', () => {
  beforeEach(() => localStorage.clear());

  it('offers the shared layout choices and reports the selected preset', () => {
    const onSelect = vi.fn();
    const view = render(<PresetCards layout="standard" selected="in-page" onSelect={onSelect} />);
    expect(screen.getByRole('radio', { name: /In-page/ })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: /Fullscreen/ }));
    expect(onSelect).toHaveBeenCalledWith('classic');
    view.rerender(<PresetCards layout="snap2" selected="classic" onSelect={onSelect} />);
    expect(screen.getByRole('radio', { name: /Classic/ })).toBeChecked();
  });

  it('uses the guided preset and matches the site by itself each time it is asked to, without opening a tab', async () => {
    const onRequest = vi.fn().mockRejectedValue(new Error('The theme could not be read.'));
    const onPrepareWindow = vi.fn();
    const onGuidedAutoMatchEnd = vi.fn();
    const props = {
      hidePreview: true,
      guidedSelection: { layout: 'standard' as const, preset: 'in-page' as const },
      themeStyling: { contextKey: 'theme', onRequest },
      livePreview: { availability: 'supported' as const, onRequest: vi.fn(), onPrepareWindow },
      onGuidedAutoMatchEnd,
    };
    const view = render(<ConfiguratorSetup {...props} guidedAutoMatch />);
    expect(screen.queryByRole('button', { name: 'Use preset' })).not.toBeInTheDocument();
    await waitFor(() => expect(onGuidedAutoMatchEnd).toHaveBeenCalledOnce());
    expect(onRequest).toHaveBeenCalledOnce();
    // Only a click may open the preview tab.
    expect(onPrepareWindow).not.toHaveBeenCalled();
    // No Match my site item in guided setup: only a note when it couldn't match, with a way to try again.
    expect(screen.queryByRole('button', { name: /Match my site/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Match your site')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('The theme could not be read.');
    expect(screen.getByRole('button', { name: /Try matching again/ })).toBeEnabled();
    expect(JSON.parse(localStorage.getItem('ov25-configurator-setup')!).setupProgress.standard.presetId).toBe('in-page');
    // Still asked (the host hasn't caught up yet): it doesn't run twice.
    view.rerender(<ConfiguratorSetup {...props} guidedAutoMatch />);
    expect(onRequest).toHaveBeenCalledOnce();
    // Arriving at the step again runs it again.
    view.rerender(<ConfiguratorSetup {...props} guidedAutoMatch={false} />);
    view.rerender(<ConfiguratorSetup {...props} guidedAutoMatch />);
    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(2));
  });

  it('greys out the preview and settings until the guided draft has settings', () => {
    const onRequest = vi.fn();
    render(<ConfiguratorSetup
      guidedSelection={{ layout: 'standard', preset: 'in-page' }}
      themeStyling={{ contextKey: 'theme', onRequest: vi.fn() }}
      livePreview={{ availability: 'supported', onRequest }}
    />);
    expect(screen.queryByRole('button', { name: /Match my site/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Preview site/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Advanced setup/ })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Ask for changes/ })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Configurator preview')).not.toBeInTheDocument();
  });

  it('fills the tab opened by the earlier click once the automatic match is applied', async () => {
    const source = { id: 'test', label: 'Redesign', kind: 'shopify-theme' as const, fingerprint: 'abc', files: [] };
    const proposal = { schemaVersion: 1 as const, source, summary: 'Test', style: { '--ov25-text-color': '#123456' }, palette: [], warnings: [], generatedAt: '2026-10-27T12:00:00.000Z', method: 'source' as const };
    const onRequest = vi.fn();
    render(<ConfiguratorSetup
      guidedSelection={{ layout: 'standard', preset: 'in-page' }} guidedAutoMatch
      themeStyling={{ contextKey: 'theme', onRequest: vi.fn().mockResolvedValue(proposal) }}
      livePreview={{ availability: 'supported', onRequest, hasPreparedWindow: () => true }}
    />);
    await waitFor(() => expect(onRequest).toHaveBeenCalledOnce());
    expect(onRequest.mock.calls[0][0].activeLayout).toBe('standard');
    expect(JSON.stringify(onRequest.mock.calls[0][0].payload)).toContain('#123456');
    expect(screen.getByRole('button', { name: /Preview site/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Advanced setup/ })).toBeEnabled();
  });

  it('requests the preview after automatic matching even when no earlier click prepared a tab', async () => {
    const source = { id: 'test', label: 'Redesign', kind: 'shopify-theme' as const, fingerprint: 'abc', files: [] };
    const proposal = { schemaVersion: 1 as const, source, summary: 'Test', style: { '--ov25-text-color': '#123456' }, palette: [], warnings: [], generatedAt: '2026-10-27T12:00:00.000Z', method: 'source' as const };
    const onRequest = vi.fn();
    const onGuidedAutoMatchEnd = vi.fn();
    const footer = document.createElement('div');
    document.body.append(footer);
    render(<ConfiguratorSetup
      guidedSelection={{ layout: 'standard', preset: 'in-page' }} guidedAutoMatch onGuidedAutoMatchEnd={onGuidedAutoMatchEnd}
      themeStyling={{ contextKey: 'theme', onRequest: vi.fn().mockResolvedValue(proposal) }}
      livePreview={{ availability: 'supported', onRequest, hasPreparedWindow: () => false }}
      saveSlot={{ container: footer, className: 'save' }}
    />);
    await waitFor(() => expect(onGuidedAutoMatchEnd).toHaveBeenCalledOnce());
    await waitFor(() => expect(onRequest).toHaveBeenCalledOnce());
    expect(screen.getByRole('button', { name: /Advanced setup/ })).toBeEnabled();
    expect(footer).toHaveTextContent('Save');
    expect(screen.getByRole('button', { name: /Preview site/ })).toBeEnabled();
    footer.remove();
  });

  it('saves the same matched theme placements that guided preview receives and reloads them', async () => {
    const themeId = 'gid://shopify/OnlineStoreTheme/190530617498';
    const source = { id: themeId, label: 'OV25 – Copy of Rise', kind: 'shopify-theme' as const, fingerprint: 'abc', files: ['templates/product.OV25_product.json'] };
    const selectors = { gallery: '.product__media-wrapper', price: '#ov25-configurator-price-container', name: '#ov25-configurator-name-container', variants: '#ov25-configurator-controls-container' };
    const proposal = { schemaVersion: 1 as const, source, summary: 'Test', style: { '--ov25-text-color': '#123456' }, palette: [], warnings: [], generatedAt: '2026-11-16T12:00:00.000Z', method: 'source' as const,
      placement: { schemaVersion: 1 as const, source, method: 'source' as const, generatedAt: '2026-11-16T12:00:00.000Z', warnings: [], targets: Object.entries(selectors).map(([key, selector]) => ({ key: key as 'gallery' | 'price' | 'name' | 'variants', selector, confidence: 'high' as const, reason: 'Known theme target', sourceFiles: source.files })) } };
    const onPreview = vi.fn();
    const onSave = vi.fn();
    const props = {
      hidePreview: true, onSave,
      guidedSelection: { layout: 'standard' as const, preset: 'in-page' as const },
      selectorThemes: { themes: [{ id: themeId, label: source.label, live: false }] },
      themeStyling: { contextKey: 'theme', onRequest: vi.fn().mockResolvedValue(proposal), themeSelection: { value: themeId, options: [{ value: themeId, label: source.label, live: false }], onChange: vi.fn() }, placement: { contextKey: 'theme', savedSettings: 'existing' as const } },
      livePreview: { availability: 'supported' as const, onRequest: onPreview, hasPreparedWindow: () => true },
    };
    const view = render(<ConfiguratorSetup {...props} guidedAutoMatch />);
    await waitFor(() => expect(onPreview).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }));
    expect(onSave).toHaveBeenCalledOnce();
    const saved = onSave.mock.calls[0][0];
    expect(saved.standard.themeSelectors?.['190530617498']).toEqual(onPreview.mock.calls[0][0].payload.standard.themeSelectors?.['190530617498']);
    expect(saved.standard.themeSelectors?.['190530617498'].gallery.selector).toBe(selectors.gallery);
    expect(saved.standard.selectors.gallery.selector).toBe('.configurator-container');
    view.unmount();
    localStorage.clear();
    render(<ConfiguratorSetup {...props} initialConfig={saved} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Open preview/ })); });
    fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }));
    expect(onSave.mock.calls[1][0].standard.themeSelectors).toEqual(saved.standard.themeSelectors);
  });

  it('shows everything when the preview can’t be opened, so the store isn’t stuck', async () => {
    const source = { id: 'test', label: 'Redesign', kind: 'shopify-theme' as const, fingerprint: 'abc', files: [] };
    const proposal = { schemaVersion: 1 as const, source, summary: 'Test', style: { '--ov25-text-color': '#123456' }, palette: [], warnings: [], generatedAt: '2026-10-27T12:00:00.000Z', method: 'source' as const };
    const onGuidedAutoMatchEnd = vi.fn();
    render(<ConfiguratorSetup
      guidedSelection={{ layout: 'standard', preset: 'in-page' }} guidedAutoMatch onGuidedAutoMatchEnd={onGuidedAutoMatchEnd}
      themeStyling={{ contextKey: 'theme', onRequest: vi.fn().mockResolvedValue(proposal) }}
      livePreview={{ availability: 'unsupported', onRequest: vi.fn(), message: 'Update the OV25 app to preview.' }}
    />);
    await waitFor(() => expect(onGuidedAutoMatchEnd).toHaveBeenCalledOnce());
    expect(screen.queryByRole('button', { name: /Open preview/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Advanced setup/ })).toBeEnabled();
  });

  it('reports the restored draft type without first reporting the default Standard type', () => {
    const state = buildFormStateFromInitialPayload({});
    state.layout = 'bedConfigurator';
    localStorage.setItem('ov25-configurator-setup', JSON.stringify(state));
    const onPreviewLayoutChange = vi.fn();

    render(<ConfiguratorSetup hidePreview onPreviewLayoutChange={onPreviewLayoutChange} />);

    expect(onPreviewLayoutChange.mock.calls).toEqual([['bedConfigurator']]);
    fireEvent.click(screen.getByRole('button', { name: /Snap2/ }));
    fireEvent.click(screen.getByRole('button', { name: /Standard/ }));
    expect(onPreviewLayoutChange.mock.calls).toEqual([['bedConfigurator'], ['snap2'], ['standard']]);
  });

  it('reports a newly hydrated target once, including when both targets use the same type', () => {
    const onPreviewLayoutChange = vi.fn();
    const view = render(<ConfiguratorSetup hidePreview draftKey="shop-one" onPreviewLayoutChange={onPreviewLayoutChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Snap2/ }));
    view.rerender(<ConfiguratorSetup hidePreview draftKey="shop-two" onPreviewLayoutChange={onPreviewLayoutChange} />);
    view.rerender(<ConfiguratorSetup hidePreview draftKey="shop-three" onPreviewLayoutChange={onPreviewLayoutChange} />);
    view.rerender(<ConfiguratorSetup hidePreview draftKey="shop-one" onPreviewLayoutChange={onPreviewLayoutChange} />);

    expect(onPreviewLayoutChange.mock.calls).toEqual([
      ['standard'], ['snap2'], ['standard'], ['standard'], ['snap2'],
    ]);
  });

  it('does not repeat reports or reset the draft and iframe when a host changes callback identity', () => {
    const reports = vi.fn();
    function Host() {
      const [reported, setReported] = React.useState<PreviewLayoutType>();
      const [, rerender] = React.useState(0);
      return <>
        <button onClick={() => rerender((value) => value + 1)}>Refresh host</button>
        <output>{reported}</output>
        <ConfiguratorSetup
          previewBaseUrl="https://demo.example/preview"
          onPreviewLayoutChange={(layout) => { reports(layout); setReported(layout); }}
        />
      </>;
    }
    render(<Host />);
    expect(reports.mock.calls).toEqual([['standard']]);
    fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
    const iframe = screen.getByTitle('Configurator preview');
    const draft = localStorage.getItem('ov25-configurator-setup');

    fireEvent.click(screen.getByRole('button', { name: 'Refresh host' }));

    expect(reports.mock.calls).toEqual([['standard']]);
    expect(screen.getByTitle('Configurator preview')).toBe(iframe);
    expect(localStorage.getItem('ov25-configurator-setup')).toBe(draft);
    expect(screen.getByRole('heading', { name: 'In-page' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Bed/ }));
    expect(reports.mock.calls).toEqual([['standard'], ['bedConfigurator']]);
  });
});
