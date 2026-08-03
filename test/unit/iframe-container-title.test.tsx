import * as React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IframeContainer } from '../../src/components/IframeContainer';

let iframeContext: Record<string, any>;

vi.mock('../../src/contexts/ov25-ui-context.js', () => ({
  useOV25UI: () => iframeContext,
}));

function createContext(overrides: Record<string, any> = {}) {
  return {
    iframeRef: React.createRef<HTMLIFrameElement>(),
    products: [],
    currentProduct: undefined,
    range: undefined,
    galleryIndex: 0,
    productLink: 'product/58',
    apiKey: 'test-api-key',
    configurationUuid: null,
    bedAllowNoneQueryValue: null,
    diningShowAttachmentPoints: null,
    galleryIndexToUse: 1,
    images: [],
    isProductGalleryStacked: true,
    isVariantsOpen: false,
    uniqueId: undefined,
    isMobile: false,
    deferThreeD: true,
    isDrawerOrDialogOpen: false,
    configuratorDisplayMode: 'inline',
    configuratorDisplayModeMobile: 'inline',
    isSnap2Mode: false,
    isModalOpen: false,
    stickyLayoutActive: false,
    cssString: undefined,
    hideGestureHint: false,
    shareDialogTrigger: 'none',
    ...overrides,
  };
}

function getRealIframe(container: HTMLElement) {
  return container.querySelector<HTMLIFrameElement>('#ov25-configurator-iframe');
}

function getDummyIframe(container: HTMLElement) {
  return container.querySelector<HTMLIFrameElement>('#ov25-dummy-iframe');
}

describe('IframeContainer title', () => {
  beforeEach(() => {
    iframeContext = createContext();
  });

  it('titles a loaded single-product configurator from the current product', () => {
    iframeContext = createContext({
      productLink: '/product/58?configuration=abc#viewer',
      products: [{ name: 'Fallback Sofa', metadata: {} }],
      currentProduct: { name: '  Current Sofa  ', metadata: {} },
      range: { name: '  Living  ' },
    });

    const { container } = render(<IframeContainer />);

    expect(getRealIframe(container)).toHaveAttribute(
      'title',
      '3D configurator for Living Current Sofa.',
    );
  });

  it('titles an explicit range route from the standard range payload', () => {
    iframeContext = createContext({
      productLink: '///range/42?configuration=abc#viewer',
      products: [{ name: 'Range Product', metadata: {} }],
      currentProduct: { name: 'Range Product', metadata: {} },
      range: { name: '  Living  ' },
    });

    const { container } = render(<IframeContainer />);

    expect(getRealIframe(container)).toHaveAttribute(
      'title',
      '3D configurator for Living range.',
    );
  });

  it('recognizes a legacy numeric range from multiple products', () => {
    iframeContext = createContext({
      productLink: '/42?configuration=abc#viewer',
      products: [
        { name: 'First Product', metadata: {} },
        { name: 'Second Product', metadata: {} },
      ],
      currentProduct: { name: 'First Product', metadata: {} },
      range: { name: '  Legacy  ' },
    });

    const { container } = render(<IframeContainer />);

    expect(getRealIframe(container)).toHaveAttribute(
      'title',
      '3D configurator for Legacy range.',
    );
  });

  it.each([
    ['nested', { rangeData: { name: '  Modular Living  ' } }],
    ['flat', { name: '  Modular Living  ' }],
  ])('titles Snap2 from a %s range payload', (_shape, range) => {
    iframeContext = createContext({
      productLink: '/snap2/58?configuration=abc#viewer',
      isSnap2Mode: true,
      range,
    });

    const { container } = render(<IframeContainer />);

    expect(getRealIframe(container)).toHaveAttribute(
      'title',
      'Modular 3D configurator for Modular Living range.',
    );
  });

  it.each([
    [
      'single product',
      { productLink: '/product/58?configuration=abc#viewer' },
      '3D product configurator.',
    ],
    [
      'range',
      { productLink: '/range/42?configuration=abc#viewer' },
      '3D range configurator.',
    ],
    [
      'Snap2',
      {
        productLink: '/snap2/58?configuration=abc#viewer',
        isSnap2Mode: true,
      },
      'Modular 3D configurator.',
    ],
  ])('uses a non-empty fallback before %s data arrives', (_mode, overrides, title) => {
    iframeContext = createContext(overrides);

    const { container } = render(<IframeContainer />);

    expect(getRealIframe(container)).toHaveAttribute('title', title);
  });

  it('falls back to the only product when currentProduct is not available', () => {
    iframeContext = createContext({
      products: [{ name: '  Only Sofa  ', metadata: {} }],
    });

    const { container } = render(<IframeContainer />);

    expect(getRealIframe(container)).toHaveAttribute(
      'title',
      '3D configurator for Only Sofa.',
    );
  });

  it('updates the real iframe title when product data arrives', () => {
    const { container, rerender } = render(<IframeContainer />);
    expect(getRealIframe(container)).toHaveAttribute('title', '3D product configurator.');

    iframeContext = createContext({
      products: [{ name: 'Loaded Sofa', metadata: {} }],
      currentProduct: { name: '  Loaded Sofa  ', metadata: {} },
    });
    rerender(<IframeContainer />);

    expect(getRealIframe(container)).toHaveAttribute(
      'title',
      '3D configurator for Loaded Sofa.',
    );
  });

  it('updates a single-product title when the range payload arrives after product data', () => {
    iframeContext = createContext({
      products: [{ name: 'Loaded Sofa', metadata: {} }],
      currentProduct: { name: '  Loaded Sofa  ', metadata: {} },
    });
    const { container, rerender } = render(<IframeContainer />);
    expect(getRealIframe(container)).toHaveAttribute(
      'title',
      '3D configurator for Loaded Sofa.',
    );

    iframeContext = createContext({
      products: [{ name: 'Loaded Sofa', metadata: {} }],
      currentProduct: { name: '  Loaded Sofa  ', metadata: {} },
      range: { name: '  Living  ' },
    });
    rerender(<IframeContainer />);

    expect(getRealIframe(container)).toHaveAttribute(
      'title',
      '3D configurator for Living Loaded Sofa.',
    );
  });

  it('updates an explicit range title when the flat range payload arrives', () => {
    iframeContext = createContext({
      productLink: '/range/42?configuration=abc#viewer',
    });
    const { container, rerender } = render(<IframeContainer />);
    expect(getRealIframe(container)).toHaveAttribute('title', '3D range configurator.');

    iframeContext = createContext({
      productLink: '/range/42?configuration=abc#viewer',
      range: { name: '  Living  ' },
    });
    rerender(<IframeContainer />);

    expect(getRealIframe(container)).toHaveAttribute(
      'title',
      '3D configurator for Living range.',
    );
  });

  it('updates a Snap2 title when the nested range payload arrives', () => {
    iframeContext = createContext({
      productLink: '/snap2/58?configuration=abc#viewer',
      isSnap2Mode: true,
    });
    const { container, rerender } = render(<IframeContainer />);
    expect(getRealIframe(container)).toHaveAttribute('title', 'Modular 3D configurator.');

    iframeContext = createContext({
      productLink: '/snap2/58?configuration=abc#viewer',
      isSnap2Mode: true,
      range: { rangeData: { name: '  Modular Living  ' } },
    });
    rerender(<IframeContainer />);

    expect(getRealIframe(container)).toHaveAttribute(
      'title',
      'Modular 3D configurator for Modular Living range.',
    );
  });

  it('distinguishes the hidden compatibility iframe from the real configurator iframe', () => {
    iframeContext = createContext({
      currentProduct: { name: 'Test Sofa', metadata: {} },
    });

    const { container } = render(<IframeContainer />);
    const realIframe = getRealIframe(container);
    const dummyIframe = getDummyIframe(container);

    expect(realIframe).toHaveAttribute('title', '3D configurator for Test Sofa.');
    expect(realIframe).not.toHaveAttribute('aria-hidden');
    expect(dummyIframe).toHaveAttribute('title', 'Compatibility frame');
    expect(dummyIframe).toHaveAttribute('aria-hidden', 'true');
    expect(dummyIframe).toHaveAttribute('hidden');
  });
});
