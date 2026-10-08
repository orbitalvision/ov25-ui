import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ConfiguratorSetup from '../../setup/src/components/ConfiguratorSetup';
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
