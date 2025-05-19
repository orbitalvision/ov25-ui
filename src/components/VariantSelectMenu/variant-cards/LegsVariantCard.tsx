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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect(variant);
        }}
        className={`orbitalvision:relative orbitalvision:flex orbitalvision:cursor-pointer orbitalvision:flex-col orbitalvision:h-[160px] orbitalvision:md:h-[200px] orbitalvision:xl:h-[217px] orbitalvision:items-center orbitalvision:gap-4 orbitalvision:w-full orbitalvision:p-6 orbitalvision:py-4 orbitalvision:text-left orbitalvision:hover:bg-accent orbitalvision:md:border-b orbitalvision:border-[#E5E5E5] orbitalvision:text-[#282828] orbitalvision:group ${index % 2 === 0 ? 'orbitalvision:xl:border-r orbitalvision:border-[#E5E5E5]' : ''}`}
      >
        <div className="orbitalvision:relative orbitalvision:aspect-square orbitalvision:h-full orbitalvision:group-hover:bg-accent">
          <div className="orbitalvision:absolute orbitalvision:inset-0 orbitalvision:rounded-full orbitalvision:overflow-hidden orbitalvision:bg-white orbitalvision:group-hover:bg-accent">
            <div className="orbitalvision:relative orbitalvision:w-full orbitalvision:h-full">
              {!isMobile ? (
                <img 
                  key={imgSrc} 
                  src={imgSrc} 
                  alt={variant.name} 
                  className="orbitalvision:object-cover orbitalvision:w-full orbitalvision:h-full" 
                />
              ) : (
                <img 
                  key={imgSrc} 
                  src={imgSrc} 
                  alt={variant.name} 
                  className="orbitalvision:object-cover orbitalvision:w-full orbitalvision:h-full" 
                  width={100} 
                  height={100} 
                />
              )}
              {variant.isSelected && (
                <div className="orbitalvision:absolute orbitalvision:inset-0">
                  <div className="orbitalvision:absolute orbitalvision:top-1/2 orbitalvision:left-1/2 orbitalvision:-translate-x-1/2 orbitalvision:-translate-y-1/2">
                    <div className="orbitalvision:w-6 orbitalvision:h-6 orbitalvision:rounded-full orbitalvision:bg-black/50 orbitalvision:flex orbitalvision:items-center orbitalvision:justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="orbitalvision:w-4 orbitalvision:h-4 orbitalvision:text-white">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="orbitalvision:flex orbitalvision:flex-1 orbitalvision:items-center orbitalvision:justify-between">
          <div className="orbitalvision:flex orbitalvision:flex-col orbitalvision:justify-center orbitalvision:items-center">
            <h3 className="orbitalvision:font-[350] orbitalvision:text-sm orbitalvision:text-[var(--ov25-secondary-text-color)]">{variant.name}</h3>
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