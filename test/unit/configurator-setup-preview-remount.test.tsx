import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PreviewArea } from '../../setup/src/components/ConfiguratorSetup/PreviewArea';
import type { SerializableInjectConfig } from '../../setup/src/components/ConfiguratorSetup/preview-config-serializable';

vi.mock('../../setup/node_modules/react/index.js', async () => vi.importActual('react'));

const config: SerializableInjectConfig = {
  apiKey: 'preview-api-key',
  productLink: 'product/58',
  selectors: {},
};

describe('ConfiguratorSetup preview device switching', () => {
  it('remounts the preview iframe when switching to mobile', () => {
    render(
      <PreviewArea
        serializableConfig={config}
        previewBaseUrl="http://localhost:3000/configurator-preview"
      />,
    );

    const desktopIframe = screen.getByTitle('Configurator preview');

    fireEvent.click(screen.getByRole('button', { name: 'Mobile' }));

    expect(screen.getByTitle('Configurator preview')).not.toBe(desktopIframe);
  });
});

it('retains the iframe for an equivalent config and remounts only for an effective change', () => {
  const { rerender } = render(<PreviewArea serializableConfig={config} previewBaseUrl="https://demo.example/preview" />);
  const iframe = screen.getByTitle('Configurator preview');
  rerender(<PreviewArea serializableConfig={{ ...config, selectors: {} }} previewBaseUrl="https://demo.example/preview" />);
  expect(screen.getByTitle('Configurator preview')).toBe(iframe);
  rerender(<PreviewArea serializableConfig={{ ...config, productLink: '99' }} previewBaseUrl="https://demo.example/preview" />);
  expect(screen.getByTitle('Configurator preview')).not.toBe(iframe);
});

it('remounts for a changed organisation key and ignores status from the previous product iframe', () => {
  const { rerender } = render(<PreviewArea serializableConfig={config} previewBaseUrl="https://demo.example/preview" />);
  const previousIframe = screen.getByTitle('Configurator preview') as HTMLIFrameElement;
  const previousWindow = previousIframe.contentWindow;
  rerender(<PreviewArea serializableConfig={{ ...config, apiKey: 'another-organisation-key' }} previewBaseUrl="https://demo.example/preview" />);
  expect(screen.getByTitle('Configurator preview')).not.toBe(previousIframe);
  fireEvent(window, new MessageEvent('message', {
    origin: 'https://demo.example', source: previousWindow,
    data: { type: 'OV25_PREVIEW_STATUS', status: 'error', message: 'Previous product error' },
  }));
  expect(screen.queryByText('Previous product error')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Loading demo');
});

it('accepts status only from the current iframe origin and supports a retry after failure', () => {
  render(<PreviewArea serializableConfig={config} previewBaseUrl="https://demo.example/preview" />);
  const iframe = screen.getByTitle('Configurator preview') as HTMLIFrameElement;
  fireEvent(window, new MessageEvent('message', { origin: 'https://wrong.example', source: iframe.contentWindow, data: { type: 'OV25_PREVIEW_STATUS', status: 'error', message: 'Ignored' } }));
  expect(screen.queryByText('Ignored')).not.toBeInTheDocument();
  fireEvent(window, new MessageEvent('message', { origin: 'https://demo.example', source: iframe.contentWindow, data: { type: 'OV25_PREVIEW_STATUS', status: 'error', message: 'Demo unavailable' } }));
  expect(screen.getByRole('alert')).toHaveTextContent('Demo unavailable');
  fireEvent.click(screen.getByRole('button', { name: 'Retry demo' }));
  expect(screen.getByTitle('Configurator preview')).not.toBe(iframe);
});

it('does not treat an arbitrary loaded page as a working demo', () => {
  vi.useFakeTimers();
  try {
    render(<PreviewArea serializableConfig={config} previewBaseUrl="https://demo.example/preview" />);
    fireEvent.load(screen.getByTitle('Configurator preview'));
    expect(screen.getByRole('status')).toHaveTextContent('Loading demo');
    act(() => vi.advanceTimersByTime(30000));
    expect(screen.getByRole('alert')).toHaveTextContent('The demo could not be loaded');
  } finally { vi.useRealTimers(); }
});

it('waits for product readiness on status-aware pages and accepts legacy handshakes', () => {
  vi.useFakeTimers();
  try {
    const { rerender } = render(<PreviewArea serializableConfig={config} previewBaseUrl="https://demo.example/preview" />);
    let iframe = screen.getByTitle('Configurator preview') as HTMLIFrameElement;
    fireEvent(window, new MessageEvent('message', { origin: 'https://demo.example', source: iframe.contentWindow, data: { type: 'OV25_PREVIEW_READY', statusProtocolVersion: 1 } }));
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.getByRole('status')).toHaveTextContent('Loading product');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent(window, new MessageEvent('message', { origin: 'https://demo.example', source: iframe.contentWindow, data: { type: 'OV25_PREVIEW_STATUS', status: 'ready' } }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    rerender(<PreviewArea serializableConfig={{ ...config, productLink: '99' }} previewBaseUrl="https://demo.example/preview" />);
    iframe = screen.getByTitle('Configurator preview') as HTMLIFrameElement;
    fireEvent(window, new MessageEvent('message', { origin: 'https://demo.example', source: iframe.contentWindow, data: { type: 'OV25_PREVIEW_READY' } }));
    act(() => vi.advanceTimersByTime(95000));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  } finally { vi.useRealTimers(); }
});
