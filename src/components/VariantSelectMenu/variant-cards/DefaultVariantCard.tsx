import { BanIcon, X } from 'lucide-react';
import * as React from 'react'
import { cn } from '../../../lib/utils.js';
import { useOV25UI } from '../../../contexts/ov25-ui-context.js';
import { Variant } from '../ProductVariants.js';
import { toast } from 'sonner';
import { SwatchIcon } from '../../ui/SwatchIcon.js';

const SwatchIconOverlay = ({ isSelected, onClick }: { isSelected: boolean; onClick: (e: React.MouseEvent) => void }) => {
    return (
        <div 
            id="ov25-variant-swatch-icon-container"
            className="ov:absolute ov:inset-0 ov:flex ov:items-center ov:justify-center ov:cursor-pointer ov:transition-all ov:bg-black/50 ov:rounded-full" 
            onClick={onClick} 
            title="Order a swatch sample"
            data-selected={isSelected}
        >
            <div className="ov:flex ov:items-center ov:justify-center ov:relative ov:w-10 ov:h-10 ov:p-0.5">
                <SwatchIcon 
                    fill="white"
                    stroke="#6E6E6E"
                    strokeWidth="0"
                    size={30}
                    className="ov:absolute ov:inset-0 ov:m-auto"
                />
                <X className={cn(
                    "ov:w-4 ov:h-4 ov:relative ov:transition-transform ov:duration-300 ov:ease-in-out ov:text-[#79ae3c]",
                    isSelected ? "ov:rotate-0" : "ov:rotate-45",
                    isSelected ? "ov:text-red-500" : "ov:text-[#79ae3c]"
                )} />
            </div>
        </div>
    );
};

interface VariantCardProps {
    variant: Variant;
    onSelect: (variant: any) => void;
    index: number;
    isMobile?: boolean;
    isGrouped?: boolean;
  }
  
export const DefaultVariantCard = React.memo(({ variant, onSelect, index, isMobile, isGrouped = false }: VariantCardProps) => {
    const { swatchRulesData, toggleSwatch, isSwatchSelected, selectedSwatches } = useOV25UI();
    const shouldShowSwatch = variant.isSelected && swatchRulesData.enabled && variant.swatch;

    const handleSwatchClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!variant.swatch) {
            return;
        }
        if (selectedSwatches.length >= (swatchRulesData.canExeedFreeLimit ? swatchRulesData.maxSwatches : swatchRulesData.freeSwatchLimit) && !isSwatchSelected(variant.swatch)) {
            toast.error('You have reached the maximum number of swatches');
            return;
        }
        if (isSwatchSelected(variant.swatch)) {
            toast.success('Swatch removed from swatchbook');
        } else {
            toast.success('Swatch added to swatchbook');
        }
        toggleSwatch(variant.swatch);
    };

    return (
    <div 
        className={`ov25-default-variant-card ov:flex ov:flex-col ov:items-center ${variant.isSelected ? '' : ''} ov:transition-transform ov:pt-2`}
        key={variant.id + variant.groupId + variant.optionId}
        data-selected={variant.isSelected}
        title={variant.name}
    >
        <div className="ov:relative">
            <div 
                className={cn(
                    'ov25-variant-image-container',
                    'ov:w-14 ov:h-14 ov:rounded-full ov:overflow-hidden ov:cursor-pointer',
                    variant.isSelected ? 'ov:border-2 ov:border-[var(--ov25-highlight-color)] ov:shadow-lg' : 'ov:border-transparent ov:shadow-md',
                )}
                {...(variant.isSelected && { selected: true })}
                onClick={() => onSelect(variant)}
            >
                {variant.name.toLowerCase() === "none" ? (
                    <div className="ov:w-full ov:h-full ov:flex ov:items-center ov:justify-center" data-none="true">
                        <BanIcon className="ov:w-10 ov:h-10 ov:text-[var(--ov25-secondary-text-color)]" />
                    </div>
                ) : variant.image ? (
                    <img 
                        src={variant.image || '/placeholder.svg'}
                        alt={variant.name}
                        width={56}
                        height={56}
                        className="ov:w-full ov:h-full ov:object-cover"
                    />
                ) : (
                    <div className="ov:w-full ov:h-full ov:bg-gray-200 ov:flex ov:items-center ov:justify-center">
                        <span className="ov:text-xs ov:text-[var(--ov25-secondary-text-color)]">No img</span>
                    </div>
                )}
                {shouldShowSwatch && variant.swatch && (
                    <SwatchIconOverlay isSelected={isSwatchSelected(variant.swatch)} onClick={handleSwatchClick} />
                )}
            </div>
        </div>
        <div 
            onClick={() => onSelect(variant)}
            className="ov:cursor-pointer ov:max-w-full"
        >
            <span className="ov:text-xs ov:text-center ov:text-[var(--ov25-secondary-text-color)] ov:line-clamp-3">
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
  