import { BanIcon } from 'lucide-react';
import * as React from 'react'

interface VariantCardProps {
    variant: any;
    onSelect: (variant: any) => void;
    index: number;
    isMobile?: boolean;
    isGrouped?: boolean;
  }
  
export const DefaultVariantCard = React.memo(({ variant, onSelect, index, isMobile, isGrouped = false }: VariantCardProps) => {
    return (
    <div 
        className={`ov25-default-variant-card ov:flex ov:flex-col ov:items-center ${variant.isSelected ? '' : ''} ov:transition-transform ov:pt-2`}
        key={variant.id + variant.groupId + variant.optionId}
        data-selected={variant.isSelected}
        title={variant.name}
    >
        <div className="ov:relative">
            <div 
                className={`ov25-variant-image-container ${isGrouped ? 'ov:w-10 ov:h-10' : 'ov:w-14 ov:h-14'} md:ov:w-14 md:ov:h-14 ov:rounded-full ov:overflow-hidden ov:mb-1 ov:cursor-pointer ${variant.isSelected ? 'ov:border-2 ov:border-[var(--ov25-highlight-color)] ov:shadow-lg' : 'ov:border-transparent ov:shadow-md'}`}
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
  