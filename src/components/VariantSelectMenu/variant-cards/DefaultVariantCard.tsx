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
        className={`orbitalvision:flex orbitalvision:flex-col orbitalvision:items-center ${variant.isSelected ? '' : ''} orbitalvision:transition-transform orbitalvision:pt-2`}
        key={variant.id + variant.groupId + variant.optionId}
    >
        <div className="orbitalvision:relative">
            <div 
                className={`orbitalvision:w-14 orbitalvision:h-14 orbitalvision:rounded-full orbitalvision:overflow-hidden orbitalvision:mb-1 orbitalvision:cursor-pointer ${variant.isSelected ? 'orbitalvision:border-2 orbitalvision:border-[var(--ov25-highlight-color)] orbitalvision:shadow-lg' : 'orbitalvision:border-transparent orbitalvision:shadow-md'}`}
                onClick={() => onSelect(variant)}
            >
                {variant.image ? (
                    <img 
                        src={variant.image || '/placeholder.svg'}
                        alt={variant.name}
                        width={56}
                        height={56}
                        className="orbitalvision:w-full orbitalvision:h-full orbitalvision:object-cover"
                    />
                ) : (
                    <div className="orbitalvision:w-full orbitalvision:h-full orbitalvision:bg-gray-200 orbitalvision:flex orbitalvision:items-center orbitalvision:justify-center">
                        <span className="orbitalvision:text-xs orbitalvision:text-[var(--ov25-secondary-text-color)]">No img</span>
                    </div>
                )}
            </div>
        </div>
        <div 
            onClick={() => onSelect(variant)}
            className="orbitalvision:cursor-pointer"
        >
            <span className="orbitalvision:text-xs orbitalvision:text-center orbitalvision:text-[var(--ov25-secondary-text-color)] orbitalvision:line-clamp-2">
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
  