import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SizeVariantCard } from '../../src/components/VariantSelectMenu/variant-cards/SizeVariantCard.js';

const { getString } = vi.hoisted(() => ({
  getString: vi.fn(
    (key: string, vars?: { VARIANT_NAME?: string }, fallback?: string) => {
      if (key === 'variantName' && vars?.VARIANT_NAME === 'Small') return 'Localized Small';
      return fallback ?? '';
    },
  ),
}));

vi.mock('../../src/contexts/ov25-ui-context.js', () => ({
  useOV25UI: () => ({ getString }),
}));

const makeVariant = (overrides: Record<string, unknown> = {}) => ({
  id: 'size-1',
  name: 'Small',
  image: '/size.jpg',
  isSelected: false,
  data: { dimensionX: 80 },
  ...overrides,
});

describe('SizeVariantCard', () => {
  beforeEach(() => {
    getString.mockReset();
    getString.mockImplementation(
      (key: string, vars?: { VARIANT_NAME?: string }, fallback?: string) => {
        if (key === 'variantName' && vars?.VARIANT_NAME === 'Small') return 'Localized Small';
        return fallback ?? '';
      },
    );
  });

  it('uses the variantName replacement and keeps the fallback product name', () => {
    const variant = makeVariant();
    const { container } = render(
      <SizeVariantCard variant={variant} onSelect={vi.fn()} index={0} />,
    );

    expect(getString).toHaveBeenCalledWith(
      'variantName',
      { VARIANT_NAME: 'Small' },
      'Small',
    );
    expect(container.querySelector('h3') as HTMLHeadingElement).toHaveTextContent('Localized Small');

    getString.mockImplementation((_key, _vars, fallback) => fallback ?? '');
    const fallbackVariant = makeVariant({
      id: 'size-fallback',
      name: 'Original fallback product',
    });
    const fallbackRender = render(
      <SizeVariantCard variant={fallbackVariant} onSelect={vi.fn()} index={0} />,
    );
    expect(fallbackRender.container.querySelector('h3')?.textContent).toBe(
      'Original fallback product',
    );
  });

  it('renders replacement newlines as text with pre-line whitespace and no HTML', () => {
    getString.mockImplementation((_key, vars, fallback) =>
      vars?.VARIANT_NAME === 'Small' ? 'Small\n<em>Second line</em>' : fallback ?? '',
    );
    const { container } = render(
      <SizeVariantCard
        variant={makeVariant()}
        onSelect={vi.fn()}
        index={0}
      />,
    );

    const heading = container.querySelector('h3') as HTMLHeadingElement;
    expect(heading).toHaveClass('ov:whitespace-pre-line');
    expect(heading?.querySelector('em')).toBeNull();
    expect(heading?.textContent).toBe('Small\n<em>Second line</em>');
  });

  it('renders images by default and preserves image opt-outs', () => {
    const { container, rerender } = render(
      <SizeVariantCard
        variant={makeVariant()}
        onSelect={vi.fn()}
        index={0}
        showDimensions
      />,
    );

    expect(container.querySelector('img') as HTMLImageElement).toHaveClass('ov:object-contain');
    expect(container.querySelector('img') as HTMLImageElement).not.toHaveClass('ov:object-cover');
    expect(container.querySelector('img') as HTMLImageElement).toHaveAttribute('src', '/size.jpg');
    expect(container.querySelector('.ov25-size-variant-card-dimensions')).not.toBeNull();

    rerender(
      <SizeVariantCard
        variant={makeVariant()}
        onSelect={vi.fn()}
        index={0}
        showImage={false}
        showDimensions={false}
      />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.ov25-size-variant-card-dimensions')).toBeNull();

    rerender(
      <SizeVariantCard
        variant={makeVariant({ image: undefined })}
        onSelect={vi.fn()}
        index={0}
      />,
    );
    expect(container.querySelector('img')).toBeNull();
  });

  it('rerenders when the variant name or showDimensions changes', () => {
    getString.mockImplementation((_key, vars, fallback) => vars?.VARIANT_NAME ?? fallback ?? '');
    const variant = makeVariant();
    const { container, rerender } = render(
      <SizeVariantCard variant={variant} onSelect={vi.fn()} index={0} showDimensions />,
    );

    rerender(
      <SizeVariantCard
        variant={{ ...variant, name: 'Large' }}
        onSelect={vi.fn()}
        index={0}
        showDimensions
      />,
    );
    expect(container.querySelector('h3') as HTMLHeadingElement).toHaveTextContent('Large');

    rerender(
      <SizeVariantCard
        variant={{ ...variant, name: 'Large' }}
        onSelect={vi.fn()}
        index={0}
        showDimensions={false}
      />,
    );
    expect(container.querySelector('.ov25-size-variant-card-dimensions')).toBeNull();
  });

  it('passes the original variant object, including its product ID, on selection', () => {
    const variant = makeVariant({ id: 'product-42' });
    const onSelect = vi.fn();
    const { container } = render(
      <SizeVariantCard variant={variant} onSelect={onSelect} index={0} />,
    );

    fireEvent.click(container.querySelector('.ov25-size-variant-card')!);
    expect(onSelect).toHaveBeenCalledWith(variant);
    expect(onSelect.mock.calls[0][0].id).toBe('product-42');
  });
});
