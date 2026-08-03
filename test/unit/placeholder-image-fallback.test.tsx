import * as React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModuleVariantCard } from '../../src/components/VariantSelectMenu/variant-cards/ModuleVariantCard';
import { SizeVariantCard } from '../../src/components/VariantSelectMenu/variant-cards/SizeVariantCard';
import { VariantThumb } from '../../src/components/VariantSelectMenu/variant-cards/VariantThumb';
import type { Variant } from '../../src/components/VariantSelectMenu/ProductVariants';
import { PLACEHOLDER_IMAGE_URL } from '../../src/lib/placeholder-image';
import type { CompatibleModule } from '../../src/utils/configurator-utils';

const placeholderContext = {
  cssString: '',
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

  it('uses the bundled placeholder in SizeVariantCard only when its image is missing', () => {
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

    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      PLACEHOLDER_IMAGE_URL,
    );

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
  });

  it('renders the bundled placeholder inside a missing-image module card', () => {
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
    expect(placeholder).toBeInstanceOf(HTMLImageElement);
    expect(placeholder).toHaveAttribute('src', PLACEHOLDER_IMAGE_URL);
    expect(container).not.toHaveTextContent('No Image');
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
