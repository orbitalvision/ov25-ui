import * as React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModuleVariantCard } from '../../src/components/VariantSelectMenu/variant-cards/ModuleVariantCard';
import { SizeVariantCard } from '../../src/components/VariantSelectMenu/variant-cards/SizeVariantCard';
import { SwatchBook } from '../../src/components/VariantSelectMenu/SwatchBook';
import { VariantThumb } from '../../src/components/VariantSelectMenu/variant-cards/VariantThumb';
import type { Variant } from '../../src/components/VariantSelectMenu/ProductVariants';
import { PLACEHOLDER_IMAGE_URL } from '../../src/lib/placeholder-image';
import type { CompatibleModule } from '../../src/utils/configurator-utils';

const placeholderContext = {
  cssString: '',
  shadowDOMs: undefined,
  buySwatches: vi.fn(),
  toggleSwatch: vi.fn(),
  selectedSwatches: [
    {
      manufacturerId: 1,
      name: 'Missing-image swatch',
      option: 'Upholstery',
      sku: 'MISSING-1',
      description: 'Description remains visible without an image.',
      material: {
        id: 1,
        name: 'Missing image material',
        type: 'Fabric',
        range: 'Test Range',
        supplier: 'Test Supplier',
        colors: [],
        palette: [],
        dominantColorHex: null,
        aiTags: [],
        caption: null,
      },
      metadata: { weave: 'Plain weave' },
    },
    {
      manufacturerId: 1,
      name: 'Real-image swatch',
      option: 'Upholstery',
      sku: 'REAL-1',
      description: 'A swatch with an image.',
      thumbnail: {
        miniThumbnails: {
          small: '/real-small.jpg',
          medium: '/real-medium.jpg',
          large: '/real-large.jpg',
        },
      },
    },
  ],
  swatchRulesData: {
    canExeedFreeLimit: false,
    maxSwatches: 4,
    freeSwatchLimit: 4,
    pricePerSwatch: 0,
    minSwatches: 1,
    enabled: true,
    parameters: [{ id: 'weave', label: 'Weave' }],
  },
  isSwatchBookOpen: true,
  setIsSwatchBookOpen: vi.fn(),
  isVariantsOpen: false,
  openConfigurator: vi.fn(),
  currencySymbol: '£',
  getString: (
    _key: string,
    _values?: Record<string, string>,
    fallback?: string,
  ) => fallback ?? '',
};

vi.mock('../../src/contexts/ov25-ui-context.js', () => ({
  useOV25UI: () => placeholderContext,
}));

function moduleVariant(product: CompatibleModule['product']): Variant {
  const module: CompatibleModule = {
    productId: product.id,
    position: 'RIGHT',
    product,
    model: {
      modelPath: '/module.glb',
      modelId: product.id,
    },
    dimensions: {
      x: 100,
      y: 100,
      z: 100,
    },
  };

  return {
    id: `${product.id}`,
    name: product.name,
    price: 0,
    image: product.imageUrl,
    blurHash: '',
    data: module,
    isSelected: false,
  };
}

describe('placeholder image leaf fallbacks', () => {
  it('keeps the featured swatch placeholder and metadata when its image is missing', async () => {
    const { baseElement } = render(<SwatchBook isMobile={false} />);

    const featured = await waitFor(() => {
      const element = baseElement.querySelector('#ov25-swatchbook-featured');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    await waitFor(() => {
      expect(featured.querySelector('image')).toHaveAttribute('href', '/real-large.jpg');
    });

    const zoomButtons = baseElement.querySelectorAll<HTMLButtonElement>('.ov25-swatch-zoom-button');
    expect(zoomButtons).toHaveLength(2);
    fireEvent.click(zoomButtons[0]);

    expect(featured.querySelector('image')).toHaveAttribute('href', PLACEHOLDER_IMAGE_URL);
    expect(featured.querySelector('.ov25-selected-swatch-name')).toHaveTextContent('Missing-image swatch');
    expect(featured.querySelector('.ov25-selected-swatch-description')).toHaveTextContent(
      'Description remains visible without an image.',
    );
    expect(featured.querySelector('.ov25-selected-swatch-metadata')).toHaveTextContent(
      'Range',
    );
    expect(featured.querySelector('.ov25-selected-swatch-metadata')).toHaveTextContent(
      'Test Range',
    );
    expect(featured.querySelector('.ov25-selected-swatch-metadata')).toHaveTextContent(
      'Supplier',
    );
    expect(featured.querySelector('.ov25-selected-swatch-metadata')).toHaveTextContent(
      'Test Supplier',
    );
    expect(featured.querySelector('.ov25-selected-swatch-metadata')).toHaveTextContent(
      'Weave',
    );
    expect(featured.querySelector('.ov25-selected-swatch-metadata')).toHaveTextContent(
      'Plain weave',
    );
  });

  it('uses the bundled placeholder in VariantThumb while preserving real and None variants', () => {
    const { container, rerender } = render(
      <VariantThumb imageUrl="" name="Missing thumbnail" />,
    );

    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      PLACEHOLDER_IMAGE_URL,
    );

    rerender(<VariantThumb imageUrl="/real.jpg" name="Real thumbnail" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/real.jpg');

    rerender(<VariantThumb imageUrl="" name="None" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[data-none="true"]')).not.toBeNull();
  });

  it('omits a missing SizeVariantCard image and preserves a real image', () => {
    const variant = {
      id: 'size-1',
      name: 'Small',
      image: '',
      isSelected: false,
    };
    const { container, rerender } = render(
      <SizeVariantCard
        variant={variant}
        onSelect={vi.fn()}
        index={0}
        isMobile={false}
        showImage
      />,
    );

    expect(container.querySelector('img')).toBeNull();
    expect(container.innerHTML).not.toContain(PLACEHOLDER_IMAGE_URL);

    rerender(
      <SizeVariantCard
        variant={{ ...variant, id: 'size-2', image: '/size.jpg' }}
        onSelect={vi.fn()}
        index={0}
        isMobile={false}
        showImage
      />,
    );
    expect(container.querySelector('img')).toHaveAttribute('src', '/size.jpg');

    rerender(
      <SizeVariantCard
        variant={{ ...variant, id: 'size-3', image: '/hidden-size.jpg' }}
        onSelect={vi.fn()}
        index={0}
        isMobile={false}
        showImage={false}
      />,
    );
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders the text fallback inside a missing-image module card', () => {
    const variant = moduleVariant({
      id: 1,
      name: 'Missing module image',
      imageUrl: '',
      hasImage: false,
    });
    const { container } = render(
      <ModuleVariantCard
        variant={variant}
        onSelect={vi.fn()}
        index={0}
        isMobile={false}
      />,
    );

    const placeholder = container.querySelector(
      '[data-ov25-module-variant-card-part="thumb-placeholder"]',
    );
    expect(placeholder).toBeInstanceOf(HTMLDivElement);
    expect(container.querySelector('img')).toBeNull();
    expect(placeholder).toHaveTextContent('No Image');
    expect(container.innerHTML).not.toContain(PLACEHOLDER_IMAGE_URL);
  });

  it('preserves responsive attributes for a real module image', () => {
    const variant = moduleVariant({
      id: 2,
      name: 'Responsive module image',
      imageUrl: '/primary.jpg',
      imageUrls: {
        thumbnail: '/thumb.jpg',
        small_image: '/small.jpg',
        image: '/medium.jpg',
      },
      hasImage: true,
    });
    const { container } = render(
      <ModuleVariantCard
        variant={variant}
        onSelect={vi.fn()}
        index={0}
        isMobile={false}
      />,
    );

    const image = container.querySelector(
      '[data-ov25-module-variant-card-part="thumb"] img',
    );
    expect(image).toHaveAttribute('src', '/small.jpg');
    expect(image).toHaveAttribute(
      'srcset',
      '/thumb.jpg 120w, /small.jpg 320w, /medium.jpg 640w',
    );
    expect(image).not.toHaveAttribute('src', PLACEHOLDER_IMAGE_URL);
  });

  it('preserves the two-image module preview', () => {
    const variant = moduleVariant({
      id: 3,
      name: 'Dual module image',
      imageUrl: '/primary.jpg',
      hasImage: true,
      cutoutImage: '/cutout.jpg',
      heroImage: '/hero.jpg',
    });
    const { container } = render(
      <ModuleVariantCard
        variant={variant}
        onSelect={vi.fn()}
        index={0}
        isMobile={false}
      />,
    );

    const images = Array.from(
      container.querySelectorAll(
        '[data-ov25-module-variant-card-part="thumb-dual"] img',
      ),
    );
    expect(images.map((image) => image.getAttribute('src'))).toEqual([
      '/cutout.jpg',
      '/hero.jpg',
    ]);
    expect(
      container.querySelector(
        '[data-ov25-module-variant-card-part="thumb-placeholder"]',
      ),
    ).toBeNull();
  });
});
