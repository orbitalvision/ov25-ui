import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  BODY_DIALOG_CONTENT_Z_INDEX,
  BODY_MOBILE_DRAWER_PORTAL_Z_INDEX,
  BODY_MOBILE_GALLERY_Z_INDEX,
  BODY_SNAP2_MOBILE_MODULE_PICKER_Z_INDEX,
} from '../../src/lib/config/layers.js';

let snap2Context: Record<string, unknown> = {};

vi.mock('../../src/contexts/ov25-ui-context.js', () => ({
  useOV25UI: () => snap2Context,
}));
vi.mock('../../src/components/Ov25ShadowHost.js', () => ({
  Ov25ShadowHost: ({ children, ...hostProps }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
    <div data-testid="body-layer" {...hostProps}>
      {children}
    </div>
  ),
}));
vi.mock('../../src/components/product-gallery.js', () => ({
  ProductGallery: () => <div data-testid="snap2-mobile-viewer" />,
}));
vi.mock('../../src/components/VariantSelectMenu/InitialiseMenu.js', () => ({
  InitialiseMenu: () => <div data-testid="snap2-module-picker" />,
}));
vi.mock('../../src/components/ui/mobile-drawer.js', () => ({
  MobileDrawer: ({ children }: React.PropsWithChildren) => <div data-testid="snap2-mobile-drawer">{children}</div>,
}));
vi.mock('../../src/components/Snap2ViewControls.js', () => ({ default: () => null }));
vi.mock('../../src/components/VariantSelectMenu/Snap2Wrapper.js', () => ({ Snap2Wrapper: () => null }));
vi.mock('../../src/components/VariantSelectMenu/VariantsCloseButton.js', () => ({ VariantsCloseButton: () => null }));
vi.mock('../../src/components/Snap2ConfiguratorModal.js', () => ({ Snap2ConfiguratorModal: () => null }));
vi.mock('../../src/components/Snap2InlineSheetDesktopShell.js', () => ({ Snap2InlineSheetDesktopShell: () => null }));
vi.mock('../../src/components/ConfigureButton.js', () => ({ ConfigureButton: () => null }));
vi.mock('../../src/utils/configurator-utils.js', () => ({
  closeModuleSelectMenu: vi.fn(),
  DRAWER_HEIGHT_RATIO: 0.58,
  IFRAME_HEIGHT_RATIO: 0.42,
}));

import { Snap2ConfigureUI } from '../../src/components/Snap2ConfigureButton.js';

function snap2MobileDrawerContext(overrides: Record<string, unknown> = {}) {
  return {
    isVariantsOpen: true,
    isModalOpen: false,
    setIsModalOpen: vi.fn(),
    setIsVariantsOpen: vi.fn(),
    isMobile: true,
    allOptions: [],
    activeOptionId: 'fabric',
    setActiveOptionId: vi.fn(),
    setShareDialogTrigger: vi.fn(),
    shareDialogTrigger: 'none',
    isSnap2Mode: true,
    drawerSize: 'large',
    setDrawerSize: vi.fn(),
    configuratorState: { snap2Objects: [{ id: 'module-1' }] },
    skipNextDrawerCloseRef: { current: false },
    setCompatibleModules: vi.fn(),
    setConfiguratorState: vi.fn(),
    setPreloading: vi.fn(),
    preloading: false,
    iframeResetKey: 0,
    resetIframe: vi.fn(),
    configuratorDisplayMode: 'modal',
    configuratorDisplayModeMobile: 'drawer',
    initialiseMenuUsesExternalSelector: false,
    ...overrides,
  };
}

/** The z-index of the body-level layer that holds the element. */
function bodyLayerZIndex(testId: string): number {
  const layer = screen.getByTestId(testId).closest<HTMLElement>('[data-testid="body-layer"]');
  expect(layer?.parentElement).toBe(document.body);
  return Number(layer?.style.zIndex);
}

describe('Snap2 mobile drawer body layers', () => {
  it('keeps the full-screen builder viewer below the drawer and dialogs', () => {
    snap2Context = snap2MobileDrawerContext();
    render(<Snap2ConfigureUI />);

    expect(screen.getByTestId('snap2-mobile-drawer')).toBeInTheDocument();
    const viewerZIndex = bodyLayerZIndex('snap2-mobile-viewer');
    expect(viewerZIndex).toBe(BODY_MOBILE_GALLERY_Z_INDEX);
    expect(viewerZIndex).toBeLessThan(BODY_MOBILE_DRAWER_PORTAL_Z_INDEX);
    expect(viewerZIndex).toBeLessThan(BODY_DIALOG_CONTENT_Z_INDEX);
  });

  it('shows the empty-builder module picker on its own tier, without the drawer', () => {
    snap2Context = snap2MobileDrawerContext({
      activeOptionId: 'modules',
      configuratorState: { snap2Objects: [] },
    });
    render(<Snap2ConfigureUI />);

    expect(bodyLayerZIndex('snap2-module-picker')).toBe(BODY_SNAP2_MOBILE_MODULE_PICKER_Z_INDEX);
    expect(screen.queryByTestId('snap2-mobile-drawer')).not.toBeInTheDocument();
  });
});
