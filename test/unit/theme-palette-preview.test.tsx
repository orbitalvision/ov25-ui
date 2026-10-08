import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemePalettePreview } from '../../setup/src/components/ConfiguratorSetup/ThemePalettePreview';
import type { ThemeStyleProposal } from '../../setup/src/components/ConfiguratorSetup/theme-style';

const fontLoader = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock('../../setup/node_modules/react/index.js', async () => vi.importActual('react'));
vi.mock('../../setup/node_modules/ov25-ui/dist/index.js', () => ({
  brandingFontAliases: (fonts: {family: string; url: string}[]) => new Map(fonts.map((font) => [font.family.toLowerCase(), font.url.includes('/current.') ? 'CurrentFamily' : 'SuggestedFamily'])),
  loadBrandingFonts: fontLoader,
}));

const proposal: ThemeStyleProposal = {
  schemaVersion: 1,
  source: { id: 'local-example', label: 'Example store', kind: 'local-theme', fingerprint: 'example', files: ['config/settings_data.json'] },
  summary: 'Warm neutrals with a dark button.',
  style: {
    '--ov25-background-color': '#faf7f0',
    '--ov25-text-color': '#262924',
    '--ov25-cta-color': '#262924',
    '--ov25-cta-text-color': '#ffffff',
    '--ov25-cta-color-hover': '#181b16',
    '--ov25-cta-text-color-hover': '#ffffff',
  },
  palette: [{ role: 'Background', color: '#faf7f0', source: 'config/settings_data.json' }],
  warnings: [],
  generatedAt: '2026-10-01T12:00:00.000Z',
  method: 'source',
};

describe('ThemePalettePreview draft review', () => {
  it('lets people compare and try controls without applying the proposal', () => {
    const onApply = vi.fn();
    const original = structuredClone(proposal);
    const currentStyle = { '--ov25-background-color': '#ffffff', '--ov25-text-color': '#222222' };
    render(<ThemePalettePreview proposal={proposal} currentStyle={currentStyle} onApply={onApply} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Current' }));
    expect(screen.getByRole('list', { name: 'Current colours' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Suggested' }));
    expect(screen.getByRole('list', { name: 'Suggested colours' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Warm' }));
    expect(screen.getByRole('radio', { name: 'Warm' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Add to basket' }));
    expect(screen.getByText('Sample interaction only. Nothing added to a basket.')).toBeInTheDocument();
    expect(onApply).not.toHaveBeenCalled();
    expect(proposal).toEqual(original);
    expect(currentStyle).toEqual({ '--ov25-background-color': '#ffffff', '--ov25-text-color': '#222222' });

    fireEvent.click(screen.getByRole('button', { name: 'Apply to draft' }));
    expect(onApply).toHaveBeenCalledOnce();
    expect(screen.getByText('Your saved site stays the same until you save.')).toBeInTheDocument();
  });

  it('prevents applying an unsupported proposal and keeps cancellation available', () => {
    const onApply = vi.fn();
    const onCancel = vi.fn();
    render(<ThemePalettePreview proposal={proposal} onApply={onApply} onCancel={onCancel}
      unavailableMessage="Choose a preset first." />);
    const apply = screen.getByRole('button', { name: 'Apply to draft' });
    expect(apply).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
    fireEvent.click(apply);
    expect(onApply).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a preset first.');
  });

  it('shows a readable warning for low contrast rather than claiming the palette passed', () => {
    render(<ThemePalettePreview proposal={{ ...proposal, style: { ...proposal.style, '--ov25-text-color': '#faf7f0' } }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Body text falls below the 4.5:1 contrast target');
    expect(screen.queryByRole('button', { name: 'Apply to draft' })).not.toBeInTheDocument();
  });

  it('compares the current font source instead of replacing it with a same-named suggested font', () => {
    const currentFonts = [{ family: 'Shop Sans', url: 'https://example.test/current.woff2' }];
    const suggestedFonts = [{ family: 'Shop Sans', url: 'https://example.test/suggested.woff2' }];
    const fontStyle = { '--ov25-360-font-family': "'Shop Sans', sans-serif" };
    const { container } = render(<ThemePalettePreview proposal={{ ...proposal, fonts: suggestedFonts, style: { ...proposal.style, ...fontStyle } }} currentStyle={fontStyle} currentFonts={currentFonts} />);
    const board = container.querySelector<HTMLElement>('.ov25-palette-board')!;
    expect(board.style.getPropertyValue('--ov25-palette-font')).toBe("'SuggestedFamily', 'Shop Sans', sans-serif");
    expect(fontLoader).toHaveBeenLastCalledWith(suggestedFonts);
    fireEvent.click(screen.getByRole('radio', { name: 'Current' }));
    expect(board.style.getPropertyValue('--ov25-palette-font')).toBe("'CurrentFamily', 'Shop Sans', sans-serif");
    expect(fontLoader).toHaveBeenLastCalledWith(currentFonts);
  });
});
