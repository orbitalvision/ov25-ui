import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfiguratorModal } from '../../src/components/ConfiguratorModal';

let modalContext: Record<string, any>;

vi.mock('../../src/contexts/ov25-ui-context.js', () => ({
  useOV25UI: () => modalContext,
}));

vi.mock('../../src/components/VariantSelectMenu/ProductVariantsWrapper.js', () => ({
  ProductVariantsWrapper: () => <div>Product variants</div>,
}));

vi.mock('../../src/components/VariantSelectMenu/Snap2Wrapper.js', () => ({
  Snap2Wrapper: () => <div>Snap2 variants</div>,
}));

vi.mock('../../src/components/VariantSelectMenu/WizardVariants.js', () => ({
  WizardVariants: () => <div>Wizard variants</div>,
}));

vi.mock('../../src/components/VariantSelectMenu/VariantsHeader.js', () => ({
  VariantsHeader: () => <div>Variants header</div>,
}));

function createContext(isMobile: boolean) {
  return {
    shareDialogTrigger: 'none',
    isMobile,
    variantDisplayStyleOverlay: 'list',
    variantDisplayStyleOverlayMobile: 'list',
    shadowDOMs: undefined,
    isSnap2Mode: false,
    setIsVariantsOpen: vi.fn(),
    isModalOpen: false,
    setShareDialogTrigger: vi.fn(),
    configuratorState: undefined,
    configuratorDisplayMode: 'modal',
  };
}

describe('ConfiguratorModal close button', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('suppresses the modal-shell close button on mobile', () => {
    modalContext = createContext(true);

    render(<ConfiguratorModal isOpen onClose={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
  });

  it('retains the modal-shell close button on desktop', () => {
    modalContext = createContext(false);
    const onClose = vi.fn();

    render(<ConfiguratorModal isOpen onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: 'Close modal' });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledOnce();
  });
});
