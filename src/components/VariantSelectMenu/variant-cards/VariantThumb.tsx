import { BanIcon } from 'lucide-react';
import * as React from 'react';
import { useOV25UI } from '../../../contexts/ov25-ui-context.js';
import { OV25_VARIANT_RING_MODE_SOLID, OV25_VARIANT_THUMB_RING_MODE_VAR } from '../../../lib/config/variant-selection-style.js';
import { SWATCH_PATH } from '../../../lib/svgs/SwatchIconSvg.js';
import { cn } from '../../../lib/utils.js';

type VariantThumbSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<VariantThumbSize, string> = {
  sm: 'ov:w-12 ov:h-12',
  md: 'ov:w-13 ov:h-13',
  lg: 'ov:w-16 ov:h-16',
};

interface VariantSwatchThumbSvgProps {
  imageUrl: string;
  alt: string;
}

function VariantSwatchThumbSvg({ imageUrl, alt }: VariantSwatchThumbSvgProps) {
  const clipId = React.useId().replace(/:/g, '');
  const edgeGradientId = React.useId().replace(/:/g, '');

  return (
    <svg
      viewBox="-1 -1 34 34"
      className="ov25-variant-thumb-swatch-svg ov:block ov:w-full ov:h-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={alt}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={SWATCH_PATH} />
        </clipPath>
        <radialGradient id={edgeGradientId} cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" />
        </radialGradient>
      </defs>
      <image
        href={imageUrl}
        x="-1"
        y="-1"
        width="36"
        height="36"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
      <path d={SWATCH_PATH} fill={`url(#${edgeGradientId})`} style={{ mixBlendMode: 'multiply' }} aria-hidden />
      <path d={SWATCH_PATH} fill="#000000" style={{ mixBlendMode: 'difference' }} aria-hidden />
    </svg>
  );
}

function VariantSwatchRing({ solid }: { solid: boolean }) {
  const gradientId = React.useId().replace(/:/g, '');

  return (
    <svg
      viewBox="-1 -1 34 34"
      className="ov25-variant-thumb-swatch-ring ov:absolute ov:inset-0 ov:w-full ov:h-full ov:pointer-events-none"
      preserveAspectRatio="none"
      aria-hidden
    >
      {!solid && (
        <defs>
          <linearGradient id={gradientId} x1="0%" x2="100%" y1="50%" y2="50%">
            <stop offset="0%" stopColor="#26E8FE" />
            <stop offset="50%" stopColor="#808AFF" />
            <stop offset="100%" stopColor="#A41EFE" />
          </linearGradient>
        </defs>
      )}
      <path d={SWATCH_PATH} fill={solid ? 'var(--ov25-highlight-color)' : `url(#${gradientId})`} />
    </svg>
  );
}

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
  const imageAlt = alt ?? name;
  const renderSwatchImage = !!imageUrl && name.toLowerCase() !== 'none';

  const content = name.toLowerCase() === 'none' ? (
    <div className="ov:w-full ov:h-full ov:flex ov:items-center ov:justify-center ov:bg-white" data-none="true">
      <BanIcon className="ov:w-10 ov:h-10 ov:text-red-400" />
    </div>
  ) : imageUrl ? (
    <VariantSwatchThumbSvg imageUrl={imageUrl} alt={imageAlt} />
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
          className,
          renderSwatchImage && 'ov25-variant-thumb-swatch',
        )}
        {...(selected && { selected: true })}
        onClick={onClick}
      >
        {content}
        {!renderSwatchImage && (
          <>
            <div className={cn('ov25-variant-card-gradient ov25-variant-thumb-overlay', sizeClass, 'radial_gradient ov:mix-blend-multiply')} aria-hidden />
            <div className={cn('ov25-variant-card-gradient ov25-variant-thumb-overlay', sizeClass, !selected && 'ov:shadow-sm', 'ov:bg-black  ov:mix-blend-difference')} aria-hidden />
          </>
        )}
      </div>
      {overlay}
    </>
  );

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'ov25-variant-thumb-wrapper ov:relative ov:p-[4px]',
        !selected && 'ov:bg-transparent',
        renderSwatchImage && 'ov25-variant-thumb-swatch',
        selected &&
          !renderSwatchImage &&
          !useSolidThumbRing &&
          'ov25-gradient ov:shadow-sm ov:rounded-[var(--ov25-variant-thumb-border-radius,9999px)]',
        selected &&
          !renderSwatchImage &&
          useSolidThumbRing &&
          'ov:bg-[var(--ov25-highlight-color)] ov:shadow-sm ov:rounded-[var(--ov25-variant-thumb-border-radius,9999px)]',
      )}
    >
      {selected && renderSwatchImage && <VariantSwatchRing solid={useSolidThumbRing} />}
      {thumbAndOverlays}
    </div>
  );
});

VariantThumb.displayName = 'VariantThumb';
