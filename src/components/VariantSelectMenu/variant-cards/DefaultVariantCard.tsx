import * as React from 'react'
import { Variant } from '../ProductVariants.js';
import { SwatchIconOverlay } from './SwatchIconOverlay.js';
import { VariantThumb } from './VariantThumb.js';
import { useSwatchActions } from '../../../hooks/useSwatchActions.js';

interface VariantCardProps {
    variant: Variant;
    onSelect: (variant: any) => void;
    index: number;
    isMobile?: boolean;
    isGrouped?: boolean;
    compactSpacing?: boolean;
  }

export const DefaultVariantCard = React.memo(({ variant, onSelect, index, isMobile, isGrouped = false, compactSpacing = false }: VariantCardProps) => {
    const { shouldShowSwatchOverlay, isSwatchSelectedFor, getSwatchClickHandler } = useSwatchActions();
    const isSwatchInBook = isSwatchSelectedFor(variant.swatch);
    const swatchVisible = shouldShowSwatchOverlay(!!variant.isSelected, variant.swatch);
    const handleSwatchClick = getSwatchClickHandler(!!variant.isSelected, variant.swatch);
    const isSwatchSelected = isSwatchSelectedFor(variant.swatch);

    const spacingClass = compactSpacing ? 'ov:mb-4 ov:pb-1' : (isGrouped && isMobile ? '' : 'ov:my-4 ov:pb-1');
    const title =
      variant.name + (variant.bedSize ? ` · ${variant.bedSize}` : '');

    return (
    <div 
        className={`ov25-default-variant-card ov:flex ov:flex-col ov:items-center ov:pt-1 ${spacingClass} ${variant.isSelected ? '' : ''} ov:transition-transform`}
        key={variant.id + variant.groupId + variant.optionId}
        data-selected={variant.isSelected}
        data-swatch-selected={isSwatchSelected}
        title={title}
    >
        <VariantThumb
            imageUrl={variant.image}
            name={variant.name}
            size={isGrouped && isMobile ? 'md' : 'lg'}
            selected={variant.isSelected}
            onClick={() => onSelect(variant)}
            asImageContainer
            overlay={swatchVisible && variant.swatch ? (
                <SwatchIconOverlay isSelected={isSwatchInBook} isVariantSelected={!!variant.isSelected} onClick={handleSwatchClick} />
            ) : undefined}
        />
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
      prevProps.variant.bedSize === nextProps.variant.bedSize &&
      prevProps.index === nextProps.index &&
      prevProps.isMobile === nextProps.isMobile
    );
  });
  