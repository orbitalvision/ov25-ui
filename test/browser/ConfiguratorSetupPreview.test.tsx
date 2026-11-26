import React from 'react';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { PreviewArea } from '../../setup/src/components/ConfiguratorSetup/PreviewArea';
import '../../setup/globals.css';

test('keeps a desktop viewport in a narrow host without remounting on host resize', async () => {
  const config = { apiKey: 'demo', productLink: '58', selectors: {} };
  const { container, rerender, getByRole } = await render(<div style={{ width: 350, height: 600 }}><PreviewArea serializableConfig={config} previewBaseUrl={`${window.location.origin}/mock-demo`} /></div>);
  const iframe = container.querySelector('iframe')!;
  await expect.poll(() => iframe.clientWidth).toBeGreaterThanOrEqual(1024);
  await expect.poll(() => iframe.getBoundingClientRect().width).toBeLessThanOrEqual(350);
  await rerender(<div style={{ width: 700, height: 600 }}><PreviewArea serializableConfig={config} previewBaseUrl={`${window.location.origin}/mock-demo`} /></div>);
  expect(container.querySelector('iframe')).toBe(iframe);
  await expect.poll(() => iframe.clientWidth).toBeGreaterThanOrEqual(1024);
  await getByRole('button', { name: 'Mobile', exact: true }).click();
  const mobile = container.querySelector('iframe')!;
  expect(mobile).not.toBe(iframe);
  await expect.poll(() => mobile.clientWidth).toBeLessThanOrEqual(375);
});
