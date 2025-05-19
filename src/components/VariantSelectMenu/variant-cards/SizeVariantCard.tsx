import React from 'react';

interface VariantCardProps {
  variant: any;
  onSelect: (variant: any) => void;
  index: number;
  isMobile?: boolean;
}

// Use React.memo to prevent unnecessary re-renders
export const SizeVariantCard = React.memo(
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
        className={`orbitalvision:relative orbitalvision:flex orbitalvision:cursor-pointer orbitalvision:flex-col orbitalvision:h-[160px] orbitalvision:md:h-[200px] orbitalvision:xl:h-[217px] orbitalvision:items-center orbitalvision:gap-4 orbitalvision:w-full orbitalvision:p-4 orbitalvision:text-left orbitalvision:hover:bg-accent orbitalvision:md:border-b orbitalvision:border-[#E5E5E5] orbitalvision:text-[#282828] ${index % 2 === 0 ? 'orbitalvision:xl:border-r orbitalvision:border-[#E5E5E5]' : ''}`}
      >
        <div className="orbitalvision:flex orbitalvision:flex-1 orbitalvision:items-center orbitalvision:justify-between">
          <div className="orbitalvision:flex orbitalvision:flex-col orbitalvision:justify-center orbitalvision:items-center">
            <h3 className="orbitalvision:font-[350] orbitalvision:text-base orbitalvision:text-[var(--ov25-secondary-text-color)]">{variant.name}</h3>
            <p className="orbitalvision:text-[12px] orbitalvision:font-[350] orbitalvision:mt-0.5 orbitalvision:text-[var(--ov25-secondary-text-color)]">£{(variant?.data?.price / 100)}</p>
          </div>
        </div>
        <div className="orbitalvision:relative orbitalvision:aspect-[3/4] orbitalvision:max-w-[200px] orbitalvision:w-full orbitalvision:overflow-hidden orbitalvision:rounded-md orbitalvision:bg-muted">
          <img 
            key={imgSrc}
            src={imgSrc} 
            alt={variant.name} 
            className="orbitalvision:object-center orbitalvision:object-cover"
          />
          {variant.isSelected && (
            <div className="orbitalvision:absolute orbitalvision:inset-0 orbitalvision:bg-transparent">
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
        <div className="orbitalvision:flex orbitalvision:items-center orbitalvision:justify-between orbitalvision:w-full orbitalvision:-mt-4">
          <div className="orbitalvision:flex orbitalvision:items-center orbitalvision:gap-2 orbitalvision:w-full">
            <div className="orbitalvision:flex orbitalvision:items-center orbitalvision:flex-1">
              <div className="orbitalvision:w-[2px] orbitalvision:h-3 orbitalvision:bg-[#E5E5E5]"></div>
              <div className="orbitalvision:h-[2px] orbitalvision:flex-1 orbitalvision:bg-[#E5E5E5]"></div>
            </div>
            <span className="orbitalvision:text-[12px] orbitalvision:font-[350] orbitalvision:whitespace-nowrap orbitalvision:text-[var(--ov25-secondary-text-color)]">{variant?.data?.dimensionX}cm</span>
            <div className="orbitalvision:flex orbitalvision:items-center orbitalvision:flex-1">
              <div className="orbitalvision:h-[2px] orbitalvision:flex-1 orbitalvision:bg-[#E5E5E5]"></div>
              <div className="orbitalvision:w-[2px] orbitalvision:h-3 orbitalvision:bg-[#E5E5E5]"></div>
            </div>
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