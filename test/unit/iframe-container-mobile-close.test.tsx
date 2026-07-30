import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IframeContainer } from '../../src/components/IframeContainer';

const setIsVariantsOpen = vi.fn();

let iframeContext: Record<string, any>;

vi.mock('../../src/contexts/ov25-ui-context.js', () => ({
  useOV25UI: () => iframeContext,
}));

vi.mock('../../src/components/Ov25ShadowHost.js', () => ({
  Ov25ShadowHost: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
}));

function createContext(overrides: Record<string, any> = {}) {
  return {
    iframeRef: React.createRef<HTMLIFrameElement>(),
    currentProduct: { metadata: {} },
    galleryIndex: 0,
    productLink: 'product/58',
    apiKey: 'test-api-key',
    configurationUuid: null,
    bedAllowNoneQueryValue: null,
    diningShowAttachmentPoints: null,
    galleryIndexToUse: 1,
    images: ['/product-image.jpg'],
    isProductGalleryStacked: true,
    isVariantsOpen: true,
    setIsVariantsOpen,
    uniqueId: undefined,
    isMobile: true,
    deferThreeD: true,
    isDrawerOrDialogOpen: true,
    configuratorDisplayMode: 'sheet',
    configuratorDisplayModeMobile: 'drawer',
    isSnap2Mode: false,
    isModalOpen: false,
    stickyLayoutActive: false,
    cssString: undefined,
    hideGestureHint: false,
    canAnimate: false,
    animationState: 'unavailable',
    availableCameras: [],
    selectCamera: vi.fn(),
    availableLights: [],
    selectLightGroup: vi.fn(),
    controlsHidden: false,
    shareDialogTrigger: 'none',
    setShareDialogTrigger: vi.fn(),
    configuratorState: undefined,
    hasConfigureButton: true,
    toggleAR: vi.fn(),
    hideAr: true,
    getString: (_key: string, _replacements: unknown, fallback: string) => fallback,
    ...overrides,
  };
}

function getCloseButtons(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('.ov25-close-button'));
}

function getShareButton(container: HTMLElement) {
  return container.querySelector<HTMLButtonElement>('#ov25-share-button');
}

describe('IframeContainer mobile drawer close button', () => {
  beforeEach(() => {
    setIsVariantsOpen.mockClear();
    iframeContext = createContext();
  });

  it.each([
    ['a deferred product image', 0],
    ['the 360 viewer', 1],
  ])('renders exactly one visible close button for %s and closes the drawer', (_label, galleryIndex) => {
    iframeContext.galleryIndex = galleryIndex;
    const { container } = render(<IframeContainer />);

    const closeButtons = getCloseButtons(container);
    expect(closeButtons).toHaveLength(1);
    expect(closeButtons[0]).toBeVisible();

    fireEvent.click(closeButtons[0]);
    expect(setIsVariantsOpen).toHaveBeenCalledOnce();
    expect(setIsVariantsOpen).toHaveBeenCalledWith(false);
  });

  it.each([
    ['the drawer is closed', { isVariantsOpen: false, isDrawerOrDialogOpen: false }],
    ['the viewport is desktop', { isMobile: false }],
    ['mobile modal mode is active', { configuratorDisplayModeMobile: 'modal', isModalOpen: true }],
    ['mobile inline mode is active', { configuratorDisplayModeMobile: 'inline' }],
    ['variants-only mode is active', { configuratorDisplayModeMobile: 'variants-only-sheet' }],
    ['the product is Snap2', { isSnap2Mode: true }],
  ])('does not render the drawer close overlay when %s', (_label, overrides) => {
    iframeContext = createContext(overrides);
    const { container } = render(<IframeContainer />);

    expect(getCloseButtons(container)).toHaveLength(0);
  });
});

describe('IframeContainer viewer controls', () => {
  beforeEach(() => {
    iframeContext = createContext();
  });

  it('shows controls over a static image while the desktop sheet is open', () => {
    iframeContext = createContext({
      isMobile: false,
      galleryIndex: 0,
      configuratorDisplayMode: 'sheet',
      isDrawerOrDialogOpen: true,
    });
    const { container } = render(<IframeContainer />);

    expect(getShareButton(container)).toBeVisible();
  });

  it('shows controls over a static image while the mobile drawer is open', () => {
    iframeContext = createContext({
      isMobile: true,
      galleryIndex: 0,
      configuratorDisplayModeMobile: 'drawer',
      isDrawerOrDialogOpen: true,
    });
    const { container } = render(<IframeContainer />);

    expect(getShareButton(container)).toBeVisible();
  });

  it.each([
    ['desktop sheet', { isMobile: false, configuratorDisplayMode: 'sheet' }],
    ['mobile drawer', { isMobile: true, configuratorDisplayModeMobile: 'drawer' }],
  ])('keeps controls hidden over a static image while the %s is closed', (_label, overrides) => {
    iframeContext = createContext({
      ...overrides,
      galleryIndex: 0,
      isVariantsOpen: false,
      isDrawerOrDialogOpen: false,
    });
    const { container } = render(<IframeContainer />);

    expect(getShareButton(container)).not.toBeInTheDocument();
  });

  it.each([
    ['normal mobile modal', {
      isMobile: true,
      configuratorDisplayModeMobile: 'modal',
      isModalOpen: true,
      isDrawerOrDialogOpen: true,
    }],
    ['normal desktop inline mode', {
      isMobile: false,
      configuratorDisplayMode: 'inline',
      isVariantsOpen: false,
      isDrawerOrDialogOpen: false,
    }],
    ['normal mobile variants-only sheet', {
      isMobile: true,
      configuratorDisplayModeMobile: 'variants-only-sheet',
      isDrawerOrDialogOpen: true,
    }],
    ['Snap2 desktop sheet', {
      isMobile: false,
      isSnap2Mode: true,
      configuratorDisplayMode: 'sheet',
      isDrawerOrDialogOpen: true,
    }],
  ])('keeps controls hidden over a static image in %s', (_label, overrides) => {
    iframeContext = createContext({
      ...overrides,
      galleryIndex: 0,
    });
    const { container } = render(<IframeContainer />);

    expect(getShareButton(container)).not.toBeInTheDocument();
  });

  it.each([
    ['desktop', { isMobile: false }],
    ['mobile', { isMobile: true }],
  ])('keeps controls visible on the 360 viewer on %s', (_label, overrides) => {
    iframeContext = createContext({
      ...overrides,
      galleryIndex: 1,
      isVariantsOpen: false,
      isDrawerOrDialogOpen: false,
    });
    const { container } = render(<IframeContainer />);

    expect(getShareButton(container)).toBeVisible();
  });
});
