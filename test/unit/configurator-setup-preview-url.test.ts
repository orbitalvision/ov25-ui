import { describe, expect, it } from 'vitest';
import { resolvePreviewIframeSrc } from '../../setup/src/components/ConfiguratorSetup/PreviewArea';
import {
  CONFIGURATOR_PREVIEW_LOCAL_BASE_URL,
  CONFIGURATOR_PREVIEW_PRODUCTION_BASE_URL,
} from '../../setup/src/lib/config/preview-config';

describe('ConfiguratorSetup preview URL resolution', () => {
  it('gives an explicit preview URL highest priority', () => {
    expect(resolvePreviewIframeSrc('https://preview.example.test', false, 'localhost')).toBe(
      'https://preview.example.test',
    );
  });

  it('uses production when local preview is omitted', () => {
    expect(resolvePreviewIframeSrc(undefined, undefined, 'localhost')).toBe(
      CONFIGURATOR_PREVIEW_PRODUCTION_BASE_URL,
    );
  });

  it('uses production when local preview is explicitly disabled', () => {
    expect(resolvePreviewIframeSrc(undefined, false, 'localhost')).toBe(
      CONFIGURATOR_PREVIEW_PRODUCTION_BASE_URL,
    );
  });

  it.each(['localhost', '127.0.0.1'])('uses the local preview when enabled on %s', (hostname) => {
    expect(resolvePreviewIframeSrc(undefined, true, hostname)).toBe(
      CONFIGURATOR_PREVIEW_LOCAL_BASE_URL,
    );
  });

  it('uses production on non-local hosts even when local preview is enabled', () => {
    expect(resolvePreviewIframeSrc(undefined, true, 'app.ov25.ai')).toBe(
      CONFIGURATOR_PREVIEW_PRODUCTION_BASE_URL,
    );
  });
});
