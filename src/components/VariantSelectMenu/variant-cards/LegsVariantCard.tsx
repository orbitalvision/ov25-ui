import React from 'react';

interface VariantCardProps {
  variant: any;
  onSelect: (variant: any) => void;
  index: number;
  isMobile?: boolean;
}

// Use React.memo to prevent unnecessary re-renders
export const LegsVariantCard = React.memo(
  ({ variant, onSelect, index, isMobile }: VariantCardProps) => {
    // Generate a stable image src that will be used for both rendering and as a key
    const imgSrc = variant.image || "/placeholder.svg";
    
    return (
      <button
        onClick={() => onSelect(variant)}
        className={`relative flex flex-col h-[160px] md:h-[200px] xl:h-[217px] items-center gap-4 w-full p-6 py-4  text-left hover:bg-accent xl:border-t border-[#E5E5E5] text-[#282828] group ${index % 2 === 0 ? 'xl:border-r border-[#E5E5E5]' : ''}`}
      >
        <div className="relative aspect-square h-full  group-hover:bg-accent">
          <div className="absolute inset-0 rounded-full overflow-hidden bg-white group-hover:bg-accent">
            <div className="relative w-full h-full">
              {!isMobile ? (
                <img 
                  key={imgSrc} 
                  src={imgSrc} 
                  alt={variant.name} 
                  className="object-cover w-full h-full" 
                />
              ) : (
                <img 
                  key={imgSrc} 
                  src={imgSrc} 
                  alt={variant.name} 
                  className="object-cover w-full h-full" 
                  width={100} 
                  height={100} 
                />
              )}
              {variant.isSelected && (
                <div className="absolute inset-0">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-col justify-center items-center">
            <h3 className="font-[350] text-[12px]">{variant.name}</h3>
          </div>
        </div>
      </button>
    );
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
  }
); 