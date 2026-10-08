import * as React from 'react';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConfiguratorSetup from '../../setup/src/components/ConfiguratorSetup';
import { LEGACY_SETUP_FEATURES } from '../../setup/src/components/ConfiguratorSetup/compatibility';
import { THEME_STYLE_FEATURE, THEME_FONTS_FEATURE, type ThemeStyleProposal } from '../../setup/src/components/ConfiguratorSetup/theme-style';
import { buildDefaultConfiguratorSetupPayload } from '../../setup/src/components/ConfiguratorSetup/serialize-config';

const proposal: ThemeStyleProposal = {
  schemaVersion: 1, method: 'source', generatedAt: '2026-10-01T12:00:00Z',
  source: { id: 'local', label: 'Local theme', kind: 'local-theme', fingerprint: 'abc', files: ['config/settings_data.json'] },
  summary: 'Colours from the downloaded theme.', style: { '--ov25-cta-color': '#243322', '--ov25-cta-text-color': '#ffffff', '--ov25-selected-background-color': '#f3f3ed' },
  palette: [{ role: 'Action', color: '#243322', source: 'settings_data.json' }], warnings: [],
};
const compatibility = { supportedFeatures: [...LEGACY_SETUP_FEATURES, THEME_STYLE_FEATURE, THEME_FONTS_FEATURE] };
beforeEach(() => localStorage.clear());
afterEach(cleanup);
const savedDraft = () => JSON.parse(localStorage.getItem('ov25-configurator-setup')!);

describe('theme matching flow', () => {
  it('reviews the palette inline before showing the preview, applies one type and leaves Save explicit', async () => {
    const onSave = vi.fn();
    const onRequest = vi.fn().mockResolvedValue(proposal);
    render(<ConfiguratorSetup previewBaseUrl={`${window.location.origin}/mock-demo`} compatibility={compatibility} onSave={onSave}
      previewToolbar={<span>Host product selector</span>} livePreview={{ onRequest: vi.fn() }} themeStyling={{ contextKey: 'local', onRequest }} />);
    expect(screen.queryByRole('button', { name: 'Match my site' })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Configurator preview')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
    const before = savedDraft();
    expect(before.setupProgress.standard.themeStep).toBe('pending');
    expect(screen.queryByTitle('Configurator preview')).not.toBeInTheDocument();
    expect(screen.queryByText('Host product selector')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open site preview' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save', exact: true })).not.toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Match my site' })));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Local theme' })).toBeInTheDocument();
    expect(screen.queryByTitle('Configurator preview')).not.toBeInTheDocument();
    expect(onRequest.mock.calls[0][0].activeLayout).toBe('standard');
    expect(savedDraft()).toEqual(before);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel', exact: true }));
    expect(savedDraft()).toEqual(before);
    expect(screen.getByRole('button', { name: 'Match my site' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Apply to draft' })).not.toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Match my site' })));
    fireEvent.click(screen.getByRole('button', { name: 'Apply to draft' }));
    expect(savedDraft().typeSettings.standard.style['--ov25-cta-color']).toBe('#243322');
    expect(savedDraft().typeSettings.snap2).toEqual(before.typeSettings.snap2);
    expect(savedDraft().setupProgress.standard.themeStep).toBe('complete');
    expect(screen.getByTitle('Configurator preview')).toBeInTheDocument();
    expect(screen.getByText('Host product selector')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open site preview' })).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));
    expect(screen.queryByRole('button', { name: 'Match my site' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Summary' }));
    fireEvent.click(screen.getByRole('button', { name: 'Match my site' }));
    expect(screen.queryByTitle('Configurator preview')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue to preview' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue to preview' }));
    fireEvent.click(screen.getByRole('button', { name: 'Change preset' }));
    fireEvent.click(screen.getByRole('radio', { name: /Guided/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
    fireEvent.click(screen.getByRole('button', { name: 'Replace settings' }));
    expect(savedDraft().typeSettings.standard.style['--ov25-cta-color']).toBe('#243322');
    expect(screen.queryByTitle('Configurator preview')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue to preview' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave.mock.calls[0][0].standard.branding.cssString).toContain('--ov25-cta-color: #243322');
    expect(onSave.mock.calls[0][0]).not.toHaveProperty('setupProgress');
  });

  it('aborts and ignores late results when the source or product type changes, and prevents duplicate scans', async () => {
    let resolve!: (value: ThemeStyleProposal) => void;
    const onRequest = vi.fn(() => new Promise<ThemeStyleProposal>((done) => { resolve = done; }));
    const view = render(<ConfiguratorSetup hidePreview themeStyling={{ contextKey: 'first', onRequest }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
    fireEvent.click(screen.getByRole('button', { name: 'Match my site' }));
    expect(screen.getByRole('button', { name: 'Reading theme…' })).toBeDisabled();
    expect(onRequest).toHaveBeenCalledOnce();
    const signal = onRequest.mock.calls[0][0].signal;
    view.rerender(<ConfiguratorSetup hidePreview themeStyling={{ contextKey: 'second', onRequest }} />);
    expect(signal.aborted).toBe(true);
    await act(async () => resolve(proposal));
    expect(screen.queryByRole('button', { name: 'Apply to draft' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Match my site' }));
    const nextSignal = onRequest.mock.calls[1][0].signal;
    fireEvent.click(screen.getByRole('button', { name: /Snap2/ }));
    expect(nextSignal.aborted).toBe(true);
    await act(async () => resolve(proposal));
    expect(screen.queryByRole('button', { name: 'Apply to draft' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Choose a preset' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Standard/ }));
    expect(screen.getByRole('button', { name: 'Match my site' })).toBeInTheDocument();
  });

  it('surfaces failed/invalid analysis without changing the draft and allows skipping to Save', async () => {
    const onRequest = vi.fn().mockRejectedValueOnce(new Error('Local theme is unavailable.')).mockResolvedValueOnce({ ...proposal, style: { customCss: 'body {display:none}' } });
    render(<ConfiguratorSetup hidePreview onSave={vi.fn()} themeStyling={{ contextKey: 'local', onRequest }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
    const before = savedDraft();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Match my site' })));
    expect(screen.getByRole('alert')).toHaveTextContent('unavailable');
    expect(screen.getByRole('button', { name: 'Skip for now' })).toBeEnabled();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Match my site' })));
    expect(screen.getByRole('alert')).toHaveTextContent('unsupported styling');
    expect(savedDraft()).toEqual(before);
    fireEvent.click(screen.getByRole('button', { name: 'Skip for now' }));
    expect(screen.getByRole('button', { name: 'Save', exact: true })).toBeEnabled();
  });

  it('resumes an incomplete theme step, aborts a skipped scan, and remembers the skip on reopen', async () => {
    let resolve!: (value: ThemeStyleProposal) => void;
    const onRequest = vi.fn(() => new Promise<ThemeStyleProposal>((done) => { resolve = done; }));
    const props = { previewBaseUrl: `${window.location.origin}/mock-demo`, themeStyling: { contextKey: 'local', onRequest } };
    const first = render(<ConfiguratorSetup {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
    const before = savedDraft().typeSettings;
    first.unmount();
    const second = render(<ConfiguratorSetup {...props} />);
    expect(screen.queryByRole('heading', { name: 'Choose a preset' })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Configurator preview')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Match my site' }));
    const signal = onRequest.mock.calls[0][0].signal;
    fireEvent.click(screen.getByRole('button', { name: 'Skip for now' }));
    expect(signal.aborted).toBe(true);
    expect(screen.getByTitle('Configurator preview')).toBeInTheDocument();
    await act(async () => resolve(proposal));
    expect(screen.queryByRole('button', { name: 'Apply to draft' })).not.toBeInTheDocument();
    expect(savedDraft().typeSettings).toEqual(before);
    expect(savedDraft().setupProgress.standard.themeStep).toBe('complete');
    second.unmount();
    render(<ConfiguratorSetup {...props} />);
    expect(screen.getByRole('heading', { name: 'In-page' })).toBeInTheDocument();
    expect(screen.getByTitle('Configurator preview')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Skip for now' })).not.toBeInTheDocument();
  });

  it('keeps existing configurations without theme-step metadata in the summary', () => {
    render(<ConfiguratorSetup hidePreview initialConfig={buildDefaultConfiguratorSetupPayload()}
      themeStyling={{ contextKey: 'local', onRequest: vi.fn() }} />);
    expect(screen.getByRole('heading', { name: 'Current configuration' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit settings' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Skip for now' })).not.toBeInTheDocument();
  });

  it('isolates drafts for different local themes with identical starting JSON', async () => {
    const onRequest = vi.fn().mockResolvedValue(proposal);
    const view = render(<ConfiguratorSetup hidePreview draftKey="theme-one" themeStyling={{ contextKey: 'one', onRequest }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use preset' }));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Match my site' })));
    fireEvent.click(screen.getByRole('button', { name: 'Apply to draft' }));
    view.rerender(<ConfiguratorSetup hidePreview draftKey="theme-two" themeStyling={{ contextKey: 'two', onRequest }} />);
    expect(screen.getByRole('heading', { name: 'Choose a preset' })).toBeInTheDocument();
    view.rerender(<ConfiguratorSetup hidePreview draftKey="theme-one" themeStyling={{ contextKey: 'one', onRequest }} />);
    expect(screen.getByText(/Palette matched: Local theme/)).toBeInTheDocument();
  });
});
