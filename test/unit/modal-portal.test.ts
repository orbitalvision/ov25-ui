import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BODY_MODAL_PORTAL_Z_INDEX } from '../../src/lib/config/layers';
import type { ConfiguratorDisplayMode } from '../../src/types/inject-config';
import { shouldCreateModalPortal } from '../../src/utils/configurator-utils';
import { injectConfigurator } from '../../src/utils/inject';

vi.mock('react-dom/client', () => ({
  createRoot: () => ({ render: () => {} }),
}));

class TestCSSStyleSheet {
  replaceSync() {}
}

function injectWithDesktopMode(productLink: string, desktop: ConfiguratorDisplayMode) {
  injectConfigurator({
    apiKey: 'test-key',
    productLink,
    selectors: {},
    configurator: {
      displayMode: { desktop, mobile: 'drawer' },
    },
    callbacks: {
      addToBasket: () => {},
      buyNow: () => {},
      buySwatches: () => {},
    },
  });

  document.dispatchEvent(new Event('DOMContentLoaded'));
}

beforeEach(() => {
  document.body.innerHTML = '';
  (globalThis as any).CSSStyleSheet = TestCSSStyleSheet;
  (window as any).CSSStyleSheet = TestCSSStyleSheet;
});

describe('shouldCreateModalPortal', () => {
  it.each([
    ['modal', true],
    ['sheet', false],
    ['drawer', false],
    ['inline', false],
    ['inline-sticky', false],
    ['inline-sheet', false],
  ])('standard desktop %s creates a modal portal: %s', (desktopDisplayMode, expected) => {
    expect(
      shouldCreateModalPortal({
        isSnap2: false,
        desktopDisplayMode,
        mobileDisplayMode: 'drawer',
      }),
    ).toBe(expected);
  });

  it('preserves standard mobile modal portal creation', () => {
    expect(
      shouldCreateModalPortal({
        isSnap2: false,
        desktopDisplayMode: 'sheet',
        mobileDisplayMode: 'modal',
      }),
    ).toBe(true);
  });

  it.each([
    ['sheet', true],
    ['modal', true],
    ['inline', true],
    ['inline-sheet', false],
  ])('Snap2 desktop %s creates a modal portal: %s', (desktopDisplayMode, expected) => {
    expect(
      shouldCreateModalPortal({
        isSnap2: true,
        desktopDisplayMode,
        mobileDisplayMode: 'drawer',
      }),
    ).toBe(expected);
  });
});

describe('injectConfigurator modal portal contract', () => {
  it('creates the lower modal portal for Snap2 desktop sheet', () => {
    injectWithDesktopMode('snap2/292', 'sheet');

    const portal = document.getElementById('ov25-modal-portal-container');
    expect(portal).toBeTruthy();
    expect(portal?.style.zIndex).toBe(String(BODY_MODAL_PORTAL_Z_INDEX));
  });

  it.each([
    ['standard desktop sheet', 'products/58', 'sheet'],
    ['Snap2 desktop inline-sheet', 'snap2/292', 'inline-sheet'],
  ] as const)('does not create the modal portal for %s', (_label, productLink, desktopMode) => {
    injectWithDesktopMode(productLink, desktopMode);

    expect(document.getElementById('ov25-modal-portal-container')).toBeNull();
  });
});
