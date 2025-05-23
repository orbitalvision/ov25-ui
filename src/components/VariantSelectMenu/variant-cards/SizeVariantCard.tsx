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
        className={`ov:relative ov:flex ov:cursor-pointer ov:flex-col ov:h-[160px] ov:md:h-[200px] ov:xl:h-[217px] ov:items-center ov:gap-4 ov:w-full ov:p-4 ov:text-left ov:hover:bg-accent ov:md:border-b ov:border-[#E5E5E5] ov:text-[#282828] ${index % 2 === 0 ? 'ov:xl:border-r ov:border-[#E5E5E5]' : ''}`}
      >
        <div className="ov:flex ov:flex-1 ov:items-center ov:justify-between">
          <div className="ov:flex ov:flex-col ov:justify-center ov:items-center">
            <h3 className="ov:font-[350] ov:text-base ov:text-[var(--ov25-secondary-text-color)]">{variant.name}</h3>
            <p className="ov:text-[12px] ov:font-[350] ov:mt-0.5 ov:text-[var(--ov25-secondary-text-color)]">£{(variant?.data?.price / 100)}</p>
          </div>
        </div>
        <div className="ov:relative ov:aspect-[3/4] ov:max-w-[200px] ov:w-full ov:overflow-hidden ov:rounded-md ov:bg-muted">
          <img 
            key={imgSrc}
            src={imgSrc} 
            alt={variant.name} 
            className="ov:object-center ov:object-cover"
          />
          {variant.isSelected && (
            <div className="ov:absolute ov:inset-0 ov:bg-transparent">
              <div className="ov:absolute ov:top-1/2 ov:left-1/2 ov:-translate-x-1/2 ov:-translate-y-1/2">
                <div className="ov:w-6 ov:h-6 ov:rounded-full ov:bg-black/50 ov:flex ov:items-center ov:justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ov:w-4 ov:h-4 ov:text-white">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="ov:flex ov:items-center ov:justify-between ov:w-full ov:-mt-4">
          <div className="ov:flex ov:items-center ov:gap-2 ov:w-full">
            <div className="ov:flex ov:items-center ov:flex-1">
              <div className="ov:w-[2px] ov:h-3 ov:bg-[#E5E5E5]"></div>
              <div className="ov:h-[2px] ov:flex-1 ov:bg-[#E5E5E5]"></div>
            </div>
            <span className="ov:text-[12px] ov:font-[350] ov:whitespace-nowrap ov:text-[var(--ov25-secondary-text-color)]">{variant?.data?.dimensionX}cm</span>
            <div className="ov:flex ov:items-center ov:flex-1">
              <div className="ov:h-[2px] ov:flex-1 ov:bg-[#E5E5E5]"></div>
              <div className="ov:w-[2px] ov:h-3 ov:bg-[#E5E5E5]"></div>
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