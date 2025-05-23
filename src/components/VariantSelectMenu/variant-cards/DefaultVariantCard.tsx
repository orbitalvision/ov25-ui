import { Check } from 'lucide-react';
import * as React from 'react'
import { CSSProperties } from 'react';

interface VariantCardProps {
    variant: any;
    onSelect: (variant: any) => void;
    index: number;
    isMobile?: boolean;
  }
  
export const DefaultVariantCard = React.memo(({ variant, onSelect, index, isMobile }: VariantCardProps) => {
    return (
        <div 
        className={`ov:flex ov:flex-col ov:items-center ${variant.isSelected ? '' : ''} ov:transition-transform ov:pt-2`}
        key={variant.id + variant.groupId + variant.optionId}
    >
        <div className="ov:relative">
            <div 
                className={`ov:w-14 ov:h-14 ov:rounded-full ov:overflow-hidden ov:mb-1 ov:cursor-pointer ${variant.isSelected ? 'ov:border-2 ov:border-[var(--ov25-highlight-color)] ov:shadow-lg' : 'ov:border-transparent ov:shadow-md'}`}
                onClick={() => onSelect(variant)}
            >
                {variant.image ? (
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
            className="ov:cursor-pointer"
        >
            <span className="ov:text-xs ov:text-center ov:text-[var(--ov25-secondary-text-color)] ov:line-clamp-2">
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
  