import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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
