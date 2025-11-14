import { BanIcon } from 'lucide-react';
import * as React from 'react'
import { cn } from '../../../lib/utils.js';
import { Variant } from '../ProductVariants.js';
import { SwatchIconOverlay } from './SwatchIconOverlay.js';
import { useSwatchActions } from '../../../hooks/useSwatchActions.js';

interface VariantCardProps {
    variant: Variant;
    onSelect: (variant: any) => void;
    index: number;
    isMobile?: boolean;
    isGrouped?: boolean;
  }

// Memoized image component that only re-renders when image URL or size changes
const VariantImage = React.memo(({ 
  image, 
  name, 
  isGrouped, 
  isMobile 
}: { 
  image: string | null | undefined; 
  name: string; 
  isGrouped: boolean; 
  isMobile?: boolean;
}) => {
  if (name.toLowerCase() === "none") {
    return (
      <div className="ov:w-full ov:h-full ov:flex ov:items-center ov:justify-center" data-none="true">
        <BanIcon className="ov:w-10 ov:h-10 ov:text-[var(--ov25-secondary-text-color)]" />
      </div>
    );
  }
  
  if (image) {
    return (
      <img 
        src={image || '/placeholder.svg'}
        alt={name}
        width={isGrouped && isMobile ? 56 : 64}
        height={isGrouped && isMobile ? 56 : 64}
        className={isGrouped && isMobile ? "ov:w-13 ov:h-13 ov:object-cover" : "ov:w-16 ov:h-16 ov:object-cover"}
      />
    );
  }
  
  return (
    <div className="ov:w-full ov:h-full ov:bg-gray-200 ov:flex ov:items-center ov:justify-center">
      <span className="ov:text-xs ov:text-[var(--ov25-secondary-text-color)]">No img</span>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if image URL, name, or size props change
  return (
    prevProps.image === nextProps.image &&
    prevProps.name === nextProps.name &&
    prevProps.isGrouped === nextProps.isGrouped &&
    prevProps.isMobile === nextProps.isMobile
  );
});

VariantImage.displayName = 'VariantImage';
  
export const DefaultVariantCard = React.memo(({ variant, onSelect, index, isMobile, isGrouped = false }: VariantCardProps) => {
    const { shouldShowSwatch, isSwatchSelectedFor, getSwatchClickHandler } = useSwatchActions();
    const swatchVisible = shouldShowSwatch(!!variant.isSelected, variant.swatch);
    const handleSwatchClick = getSwatchClickHandler(!!variant.isSelected, variant.swatch);

    return (
    <div 
        className={`ov25-default-variant-card ov:flex ov:flex-col ov:items-center ov:pt-1 ${isGrouped && isMobile ? '' : 'ov:my-4 ov:pb-1'} ${variant.isSelected ? '' : ''} ov:transition-transform`}
        key={variant.id + variant.groupId + variant.optionId}
        data-selected={variant.isSelected}
        title={variant.name}
    >
        <div className="ov:relative">
            <div 
                className={cn(
                    'ov25-variant-image-container',
                    isGrouped && isMobile ? 'ov:w-13 ov:h-13' : 'ov:w-16 ov:h-16',
                    'ov:rounded-full ov:overflow-hidden ov:cursor-pointer ov:border-transparent ov:shadow-md',
                )}
                {...(variant.isSelected && { selected: true })}
                onClick={() => onSelect(variant)}
            >
                <VariantImage 
                    image={variant.image}
                    name={variant.name}
                    isGrouped={isGrouped}
                    isMobile={isMobile}
                />
                {swatchVisible && variant.swatch && (
                    <SwatchIconOverlay isSelected={isSwatchSelectedFor(variant.swatch)} onClick={handleSwatchClick} />
                )}
            </div>
            <div className={`ov25-variant-card-gradient ${isGrouped && isMobile ? 'ov:w-13 ov:h-13' : 'ov:w-16 ov:h-16'} ov:rounded-full ov:absolute ${isGrouped && isMobile ? 'ov:top-0' : 'ov:top-0'} ov:left-0 radial_gradient ov:mix-blend-multiply ov:pointer-events-none`}></div>
            <div className={`ov25-variant-card-gradient ${isGrouped && isMobile ? 'ov:w-13 ov:h-13' : 'ov:w-16 ov:h-16'} ov:rounded-full ov:absolute ${isGrouped && isMobile ? 'ov:top-0' : 'ov:top-0'} ov:left-0 ov:bg-black shadow-inner-intense ov:mix-blend-difference ov:pointer-events-none`}></div>
            <div className={`ov25-variant-card-border ${isGrouped && isMobile ? 'ov:w-13 ov:h-13' : 'ov:w-16 ov:h-16'} ov:scale-[1.15] ov:pointer-events-none ov:bg-transparent ov:rounded-full ov:absolute ov:inset-0 ov:aspect-square ${variant.isSelected ? 'ov:border-2 ov:border-dashed ov:border-[var(--ov25-highlight-color)]' : 'hidden '}`}></div>
        </div>
        <div 
            onClick={() => onSelect(variant)}
            className="ov:cursor-pointer ov:max-w-full"
        >
            <span className={`ov25-variant-name ov:text-xs ov:text-center ov:text-black ov:line-clamp-3 ${isGrouped && isMobile ? '' : 'ov:pt-2'}`}>
                {variant.name}
            </span>
        </div>
    </div>
    )
  },
  // Custom comparison function to determine when to re-render
  (prevProps, nextProps) => {
    // Only re-render if these properties changed
    return (
      prevProps.variant.id === nextProps.variant.id &&
      prevProps.variant.isSelected === nextProps.variant.isSelected &&
      prevProps.index === nextProps.index &&
      prevProps.isMobile === nextProps.isMobile
    );
  });
  