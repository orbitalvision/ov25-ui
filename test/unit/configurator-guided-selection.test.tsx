import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ConfiguratorSetup from '../../setup/src/components/ConfiguratorSetup';

vi.mock('../../setup/node_modules/react/index.js', async () => vi.importActual('react'));
vi.mock('../../setup/src/components/ui/dialog', () => ({ Dialog: ({ children }: { children: React.ReactNode }) => <>{children}</>, DialogContent: () => null, DialogHeader: () => null, DialogTitle: () => null, DialogDescription: () => null }));
vi.mock('../../setup/src/components/ConfiguratorSetup/ConfigPanel', () => ({ ConfigPanel: () => null, ProductTypeSelector: () => null, SetupSaveControls: ({ label = 'Save' }: { label?: string }) => <button>{label}</button> }));
vi.mock('../../setup/src/components/ConfiguratorSetup/ThemeStyleAction', () => ({ ThemeStyleAction: () => null }));
vi.mock('../../setup/src/components/ConfiguratorSetup/PreviewArea', () => ({ PreviewArea: () => <div>Preview</div> }));

beforeEach(() => localStorage.clear());
describe('guided selection handoff', () => {
  it('applies the guided preset without asking for it again', async () => {
    render(<ConfiguratorSetup guidedSelection={{ layout: 'snap2', preset: 'guided' }} />);
    expect(await screen.findByRole('button', { name: /Advanced setup/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Use preset/ })).not.toBeInTheDocument();
  });

  it('opens Advanced setup and returns to automatic setup without saving', async () => {
    const onSave = vi.fn();
    render(<ConfiguratorSetup guidedSelection={{ layout: 'standard', preset: 'in-page' }} onSave={onSave} />);
    fireEvent.click(await screen.findByRole('button', { name: /Advanced setup/ }));
    fireEvent.click(screen.getByRole('button', { name: /Back to automatic setup/ }));
    expect(await screen.findByRole('button', { name: /Advanced setup/ })).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('opens Advanced setup full screen, with Save in its own bar instead of the host footer', async () => {
    const footer = document.createElement('div');
    document.body.append(footer);
    const { container } = render(<ConfiguratorSetup guidedSelection={{ layout: 'standard', preset: 'in-page' }} onSave={vi.fn()} saveSlot={{ container: footer }} />);
    const root = container.querySelector('.ov25-setup')!;
    await screen.findByRole('button', { name: /Advanced setup/ });
    expect(root).not.toHaveClass('ov25-setup-fullscreen');
    expect(footer).toHaveTextContent('Save');

    fireEvent.click(screen.getByRole('button', { name: /Advanced setup/ }));
    expect(root).toHaveClass('ov25-setup-fullscreen');
    expect(screen.getByRole('heading', { name: 'Advanced setup' })).toBeInTheDocument();
    const back = screen.getByRole('button', { name: /Back to automatic setup/ });
    expect(back).toHaveFocus();
    expect(screen.getAllByRole('button', { name: /Back to automatic setup/ })).toHaveLength(1);
    // The host footer sits under the full-screen editor, so Save moves into the bar.
    expect(footer).toBeEmptyDOMElement();
    expect(root.querySelector('.ov25-setup-fullscreen-bar')).toHaveTextContent('Save');

    fireEvent.click(back);
    await screen.findByRole('button', { name: /Advanced setup/ });
    expect(root).not.toHaveClass('ov25-setup-fullscreen');
    expect(footer).toHaveTextContent('Save');
    footer.remove();
  });

  describe('reopening a finished type', () => {
    const savedCss = ':host {\n  --ov25-configurator-iframe-background-color: #123456;\n}\n.ov25-chat-edit { color: red; }';
    const saved = { standard: { selectors: { gallery: { selector: '.saved-gallery', replace: true } }, branding: { cssString: savedCss } } };
    const themeStyling = { contextKey: 'shop:theme', onRequest: vi.fn() };
    const latest = (tools: ReturnType<typeof vi.fn>) => tools.mock.calls.at(-1)![0];
    const css = (tools: ReturnType<typeof vi.fn>) => latest(tools).request.payload.standard.branding.cssString as string;

    it('keeps the saved settings instead of applying the preset again', async () => {
      const tools = vi.fn(() => null);
      render(<ConfiguratorSetup guidedSelection={{ layout: 'standard', preset: 'in-page', resume: true }} initialConfig={saved} themeStyling={themeStyling} renderStorefrontTools={tools} />);
      await waitFor(() => expect(latest(tools).page?.preparation).toBe('saved'));
      expect(css(tools)).toContain('#123456');
      expect(css(tools)).toContain('.ov25-chat-edit { color: red; }');
      expect(latest(tools).request.payload.standard.selectors.gallery.selector).toBe('.saved-gallery');
    });

    it('applies the preset over the same saved settings when it is a new setup', async () => {
      const tools = vi.fn(() => null);
      render(<ConfiguratorSetup guidedSelection={{ layout: 'standard', preset: 'in-page' }} initialConfig={saved} themeStyling={themeStyling} renderStorefrontTools={tools} />);
      await waitFor(() => expect(latest(tools).page?.preparation).toBe('ready'));
      expect(css(tools)).not.toContain('.ov25-chat-edit');
    });

    it('matches the site again only when the store asks, from a button on the chat page', async () => {
      const tools = vi.fn(() => null);
      const onPrepareWindow = vi.fn();
      render(<ConfiguratorSetup guidedSelection={{ layout: 'standard', preset: 'in-page', resume: true }} initialConfig={saved} themeStyling={themeStyling}
        livePreview={{ onRequest: vi.fn(), onPrepareWindow }} renderStorefrontTools={tools} />);
      await waitFor(() => expect(latest(tools).page?.preparation).toBe('saved'));
      expect(themeStyling.onRequest).not.toHaveBeenCalled();
      // The host renders the chat page's actions; the button sits with Advanced setup.
      render(<>{latest(tools).page.advancedActions}</>);
      fireEvent.click(screen.getByRole('button', { name: 'Match my site again' }));
      expect(onPrepareWindow).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(latest(tools).page?.preparation).toBe('preparing'));
    });

    it('offers Match my site again on a new setup too, but not while the first match runs', async () => {
      const tools = vi.fn(() => null);
      const { rerender } = render(<ConfiguratorSetup guidedSelection={{ layout: 'standard', preset: 'in-page' }} initialConfig={saved} themeStyling={themeStyling} guidedAutoMatch renderStorefrontTools={tools} />);
      await waitFor(() => expect(latest(tools).page?.preparation).toBe('preparing'));
      const busy = render(<>{latest(tools).page.advancedActions}</>);
      expect(screen.getByRole('button', { name: 'Match my site again' })).toBeDisabled();
      busy.unmount();
      rerender(<ConfiguratorSetup guidedSelection={{ layout: 'standard', preset: 'in-page' }} initialConfig={saved} themeStyling={themeStyling} renderStorefrontTools={tools} />);
      await waitFor(() => expect(latest(tools).page?.preparation).toBe('ready'));
      render(<>{latest(tools).page.advancedActions}</>);
      expect(screen.getByRole('button', { name: 'Match my site again' })).toBeEnabled();
    });
  });

  it('uses the host save label in the footer and in the full-screen bar', async () => {
    const footer = document.createElement('div');
    document.body.append(footer);
    const { container } = render(<ConfiguratorSetup guidedSelection={{ layout: 'standard', preset: 'in-page' }} onSave={vi.fn()} saveSlot={{ container: footer }} saveLabel="Finalise" />);
    await screen.findByRole('button', { name: /Advanced setup/ });
    expect(footer).toHaveTextContent('Finalise');
    fireEvent.click(screen.getByRole('button', { name: /Advanced setup/ }));
    expect(container.querySelector('.ov25-setup-fullscreen-bar')).toHaveTextContent('Finalise');
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    footer.remove();
  });
});
