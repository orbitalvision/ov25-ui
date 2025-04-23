import { Check } from 'lucide-react';
import * as React from 'react'
interface VariantCardProps {
    variant: any;
    onSelect: (variant: any) => void;
    index: number;
    isMobile?: boolean;
  }
  
export const DefaultVariantCard = React.memo(({ variant, onSelect, index, isMobile }: VariantCardProps) => {
    // Generate a stable image src that will be used for both rendering and as a key
    const imgSrc = variant.image || '/placeholder.svg';
    
    return (
      <button
        onClick={() => onSelect(variant)}
        className="relative flex flex-col items-center gap-4 w-full p-2   text-left  hover:bg-accent"
      >
          <div className="relative aspect-[65/47] w-full pt-2 overflow-hidden rounded-none bg-transparent">
              <img 
                key={imgSrc}
                src={imgSrc} 
                className="w-full h-full object-cover"
                alt={variant.name}
              />
  
              {variant.isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white"/>
                    </div>
                  </div>
                </div>
              )}
          </div>
  
          <div className="px-2">
              <h4 className="font-[350] text-[12px]">{variant.name}</h4>
          </div>
      </button>
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
  