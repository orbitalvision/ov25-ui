import { BanIcon } from 'lucide-react';
import * as React from 'react';
import { useOV25UI } from '../../../contexts/ov25-ui-context.js';
import { OV25_VARIANT_RING_MODE_SOLID, OV25_VARIANT_THUMB_RING_MODE_VAR } from '../../../lib/config/variant-selection-style.js';
import { cn } from '../../../lib/utils.js';

type VariantThumbSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<VariantThumbSize, string> = {
  sm: 'ov:w-12 ov:h-12',
  md: 'ov:w-13 ov:h-13',
  lg: 'ov:w-16 ov:h-16',
};

export interface VariantThumbProps {
  imageUrl?: string | null;
  name?: string;
  alt?: string;
  size?: VariantThumbSize;
  selected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  /** Optional overlay (e.g. SwatchIconOverlay) rendered inside the thumb */
  overlay?: React.ReactNode;
  /** Use for variant grid cards; adds ov25-variant-image-container */
  asImageContainer?: boolean;
}

export const VariantThumb = React.memo(({
  imageUrl,
  name = '',
  alt,
  size = 'lg',
  selected = false,
  onClick,
  className,
  overlay,
  asImageContainer = false,
}: VariantThumbProps) => {
  const { cssString } = useOV25UI();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [useSolidThumbRing, setUseSolidThumbRing] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const root = el.getRootNode();
    const target =
      root instanceof ShadowRoot ? root.host : document.documentElement;
    const mode = getComputedStyle(target)
      .getPropertyValue(OV25_VARIANT_THUMB_RING_MODE_VAR)
      .trim()
      .toLowerCase();
    setUseSolidThumbRing(mode === OV25_VARIANT_RING_MODE_SOLID);
  }, [cssString]);

  const sizeClass = SIZE_CLASSES[size];

  const content = name.toLowerCase() === 'none' ? (
    <div className="ov:w-full ov:h-full ov:flex ov:items-center ov:justify-center ov:bg-white" data-none="true">
      <BanIcon className="ov:w-10 ov:h-10 ov:text-red-400" />
    </div>
  ) : imageUrl ? (
    <img src={imageUrl} alt={alt ?? name} className="ov:w-full ov:h-full ov:object-cover" />
  ) : (
    <div className="ov:w-full ov:h-full ov:flex ov:items-center ov:justify-center ov:bg-[var(--ov25-border-color)]">
      <span className="ov:text-[var(--ov25-secondary-text-color)] ov:text-sm">—</span>
    </div>
  );

  const thumbAndOverlays = (
    <>
      <div
        className={cn(
          'ov25-selection-thumbnail ov:relative',
          asImageContainer && 'ov25-variant-image-container',
          sizeClass,
          onClick && 'ov:cursor-pointer ov:border-transparent',
          className
        )}
        {...(selected && { selected: true })}
        onClick={onClick}
      >
        {content}
      </div>
      {overlay}
      <div className={cn('ov25-variant-card-gradient ov25-variant-thumb-overlay', sizeClass, 'radial_gradient ov:mix-blend-multiply')} aria-hidden />
      <div className={cn('ov25-variant-card-gradient ov25-variant-thumb-overlay', sizeClass, !selected && 'ov:shadow-sm', 'ov:bg-black  ov:mix-blend-difference')} aria-hidden />
    </>
  );

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'ov25-variant-thumb-wrapper ov:relative ov:p-1',
        !selected && 'ov:bg-transparent',
        selected &&
          !useSolidThumbRing &&
          'ov25-gradient ov:shadow-sm ov:rounded-[var(--ov25-variant-thumb-border-radius,9999px)]',
        selected &&
          useSolidThumbRing &&
          'ov:bg-[var(--ov25-highlight-color)] ov:shadow-sm ov:rounded-[var(--ov25-variant-thumb-border-radius,9999px)]',
      )}
    >
      {thumbAndOverlays}
    </div>
  );
});

VariantThumb.displayName = 'VariantThumb';
