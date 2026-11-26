import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeStyleAction } from '../../setup/src/components/ConfiguratorSetup/ThemeStyleAction';
import { DEFAULT_TYPE_SETTINGS } from '../../setup/src/components/ConfiguratorSetup/types';
import type { ConfiguratorSetupThemeStyling, ThemeStyleProposal } from '../../setup/src/components/ConfiguratorSetup/theme-style';

vi.mock('../../setup/node_modules/react/index.js', async () => vi.importActual('react'));

const source = { id: 'test', label: 'Redesign', kind: 'shopify-theme' as const, fingerprint: 'abc', files: ['templates/product.OV25_product.json'] };
const proposal: ThemeStyleProposal = {
  schemaVersion: 1, source, summary: 'Test', style: { '--ov25-text-color': '#111111' },
  palette: [], warnings: [], generatedAt: '2026-10-27T12:00:00.000Z', method: 'source',
  placement: { schemaVersion: 1, source, method: 'source', generatedAt: '2026-10-27T12:00:00.000Z', warnings: [], targets: [
    { key: 'price', selector: '#ov25-configurator-price-container', confidence: 'medium', sourceFiles: source.files,
      reason: 'Enabled ov25_configurator_price declaration uses the known OV25 block selector. Deployed markup and rendered presence are unverified.' },
  ] },
};

describe('theme choice and known app block placement', () => {
  function renderAction(savedSettings: 'none' | 'existing' = 'none', themeValue = 'live', nextProposal = proposal) {
    const select = vi.fn(); const onApply = vi.fn();
    const config: ConfiguratorSetupThemeStyling = {
      contextKey: 'test', onRequest: vi.fn().mockResolvedValue(nextProposal),
      themeSelection: { value: themeValue, options: [{ value: 'live', label: 'Live (Live)' }, { value: 'draft', label: 'Redesign' }], onChange: select },
      placement: { contextKey: 'test', savedSettings },
    };
    render(<ThemeStyleAction config={config} layout="standard" settings={structuredClone(DEFAULT_TYPE_SETTINGS.standard)} onApply={onApply} onContinue={vi.fn()} onBack={vi.fn()} />);
    return { select, onApply };
  }
  it('lets the user choose a theme before requesting analysis', () => {
    // The theme picker is a Radix select (opening it needs browser APIs jsdom lacks).
    renderAction('none', '');
    expect(screen.getByRole('combobox', { name: 'Theme' })).toHaveTextContent('Choose a theme');
    expect(screen.getByRole('button', { name: 'Match my site' })).toBeDisabled();
  });
  it('applies the match straight to the draft, with corrected overlay colours', async () => {
    const { onApply } = renderAction('none', 'live', { ...proposal, style: {
      '--ov25-overlay-button-color': '#ffffff', '--ov25-configurator-view-controls-text-color': '#ffffff',
    } });
    fireEvent.click(screen.getByRole('button', { name: 'Match my site' }));
    await waitFor(() => expect(onApply).toHaveBeenCalledOnce());
    expect(onApply.mock.calls[0][0].style['--ov25-configurator-view-controls-text-color']).toBe('#000000');
    expect(screen.queryByRole('button', { name: 'Apply to draft' })).not.toBeInTheDocument();
  });
  it('reports the match start synchronously and whether anything was applied', async () => {
    const onMatchStart = vi.fn(); const onMatchEnd = vi.fn();
    const config: ConfiguratorSetupThemeStyling = { contextKey: 'test', onRequest: vi.fn().mockResolvedValue(proposal) };
    render(<ThemeStyleAction config={config} layout="standard" settings={structuredClone(DEFAULT_TYPE_SETTINGS.standard)} onApply={vi.fn()} onContinue={vi.fn()} onMatchStart={onMatchStart} onMatchEnd={onMatchEnd} />);
    fireEvent.click(screen.getByRole('button', { name: 'Match my site' }));
    expect(onMatchStart).toHaveBeenCalledOnce();
    await waitFor(() => expect(onMatchEnd).toHaveBeenCalledWith(true, false));
  });
  it('reports a failed match as not applied', async () => {
    const onMatchEnd = vi.fn();
    const config: ConfiguratorSetupThemeStyling = { contextKey: 'test', onRequest: vi.fn().mockRejectedValue(new Error('Theme unavailable')) };
    render(<ThemeStyleAction config={config} layout="standard" settings={structuredClone(DEFAULT_TYPE_SETTINGS.standard)} onApply={vi.fn()} onContinue={vi.fn()} onMatchEnd={onMatchEnd} />);
    fireEvent.click(screen.getByRole('button', { name: 'Match my site' }));
    await waitFor(() => expect(onMatchEnd).toHaveBeenCalledWith(false, false));
    expect(screen.getByRole('alert')).toHaveTextContent('Theme unavailable');
  });
  it.each(['none', 'existing'] as const)('includes known medium-confidence blocks only on new setups (%s)', async savedSettings => {
    const { onApply } = renderAction(savedSettings);
    fireEvent.click(screen.getByRole('button', { name: 'Match my site' }));
    await waitFor(() => expect(onApply).toHaveBeenCalledOnce());
    const applied = onApply.mock.calls[0][0] as ThemeStyleProposal;
    if (savedSettings === 'none') expect(applied.placement?.targets[0].selector).toBe('#ov25-configurator-price-container');
    else expect(applied.placement).toBeUndefined();
  });
});

describe('guided Match my site on a theme that is not live', () => {
  const draftProposal: ThemeStyleProposal = { ...proposal, placement: { ...proposal.placement!, targets: [
    { key: 'gallery', selector: '.product-information__media', confidence: 'low', sourceFiles: source.files, reason: 'Section-specific gallery wrapper.' },
  ] } };
  function renderGuided(supportedFeatures?: string[]) {
    const onApply = vi.fn();
    const config: ConfiguratorSetupThemeStyling = {
      contextKey: 'test', onRequest: vi.fn().mockResolvedValue(draftProposal),
      themeSelection: { value: 'gid://shopify/OnlineStoreTheme/222', options: [
        { value: 'gid://shopify/OnlineStoreTheme/111', label: 'Live (Live)', live: true },
        { value: 'gid://shopify/OnlineStoreTheme/222', label: 'Redesign', live: false },
      ], onChange: vi.fn() },
      placement: { contextKey: 'test', savedSettings: 'existing' },
    };
    // Guided setup matches by itself; it has no Match my site button.
    render(<ThemeStyleAction actions={<span />} autoMatch config={config} layout="standard" settings={structuredClone(DEFAULT_TYPE_SETTINGS.standard)}
      compatibility={supportedFeatures && { supportedFeatures }} onApply={onApply} onContinue={vi.fn()} />);
    return onApply;
  }

  it('applies placement suggestions as overrides for that theme, never to the live defaults', async () => {
    const onApply = renderGuided(['settings:legacy-2026-09-29', 'placement:theme-selectors-v1']);
    await waitFor(() => expect(onApply).toHaveBeenCalled());
    const [applied, options] = onApply.mock.calls[0];
    expect(applied.placement).toBeUndefined();
    expect(options.themePlacement.themeId).toBe('gid://shopify/OnlineStoreTheme/222');
    expect(options.themePlacement.placement.targets.map((target: { selector: string }) => target.selector)).toEqual(['.product-information__media']);
  });

  it('still saves the override when the plugin build is unknown (e.g. a password-protected storefront)', async () => {
    const onApply = renderGuided();
    await waitFor(() => expect(onApply).toHaveBeenCalled());
    expect(onApply.mock.calls[0][1]?.themePlacement?.themeId).toBe('gid://shopify/OnlineStoreTheme/222');
  });

  it('keeps the previous behaviour when a recognised plugin build lacks theme overrides', async () => {
    const onApply = renderGuided(['settings:legacy-2026-09-29']);
    await waitFor(() => expect(onApply).toHaveBeenCalled());
    expect(onApply.mock.calls[0][1]).toBeUndefined();
  });
});


it('uses the host conversation as the guided page while retaining automatic matching', async () => {
  const onApply = vi.fn();
  render(<ThemeStyleAction actions={<button>Advanced setup</button>} autoMatch inlineStorefrontTools
    storefrontTools={<div>Conversation and persistent actions</div>}
    config={{ contextKey: 'inline-test', onRequest: vi.fn().mockResolvedValue(proposal) }}
    layout="standard" settings={structuredClone(DEFAULT_TYPE_SETTINGS.standard)} onApply={onApply} onContinue={vi.fn()} />);
  await waitFor(() => expect(onApply).toHaveBeenCalledOnce());
  expect(screen.getByText('Conversation and persistent actions')).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Check your product page' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Ask for changes' })).not.toBeInTheDocument();
});
