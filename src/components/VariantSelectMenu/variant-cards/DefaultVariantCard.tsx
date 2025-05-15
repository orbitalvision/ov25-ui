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
        className={`flex flex-col items-center ${variant.isSelected ? 'scale-110' : 'hover:scale-105'} transition-transform pt-2`}
        key={variant.id + variant.groupId + variant.optionId}
    >
        <div className="relative">
            <div 
                className={`w-14 h-14 rounded-full overflow-hidden mb-1 cursor-pointer ${variant.isSelected ? 'border-2 border-primary shadow-lg' : 'border-transparent shadow-md'}`}
                onClick={() => onSelect(variant)}
            >
                {variant.image ? (
                    <img 
                        src={variant.image || '/placeholder.svg'}
                        alt={variant.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">No img</span>
                    </div>
                )}
            </div>
        </div>
        <div 
            onClick={() => onSelect(variant)}
            className="cursor-pointer"
        >
            <span className="text-xs text-center text-gray-600 line-clamp-2">
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
  