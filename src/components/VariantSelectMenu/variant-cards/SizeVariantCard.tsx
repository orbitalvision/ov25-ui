import React from 'react';

interface VariantCardProps {
  variant: any;
  onSelect: (variant: any) => void;
  index: number;
  isMobile?: boolean;
  showImage?: boolean;
  showDimensions?: boolean;
}

// Use React.memo to prevent unnecessary re-renders
export const SizeVariantCard = React.memo(
  ({ variant, onSelect, index, isMobile, showImage = false, showDimensions = true }: VariantCardProps) => {
    // Generate a stable image src that will be used for both rendering and as a key
    const imgSrc = variant.image || "/placeholder.svg";
    
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect(variant);
        }}
        className={`ov25-size-variant-card ov:relative ov:flex ov:cursor-pointer ov:flex-col ov:items-center ov:gap-4 ov:w-full ov:p-4 ov:text-left ov:hover:bg-accent ov:md:border ov:border-[#F0F0F0]  ov:text-[#282828] ${variant.isSelected ? 'ov:bg-[#F0F0F0]' : ''} ${index % 2 === 0 ? 'ov:xl:border-r ov:border-[#F0F0F0]' : ''}`}
        data-selected={variant.isSelected}
        title={variant.name}
      >
        <div className="ov:flex ov:flex-1 ov:flex-col ov:items-center ov:justify-between">
          {showImage && <img src={imgSrc} alt={variant.name} className="ov:w-full ov:h-full ov:object-cover ov:rounded-lg" />}
          <div className="ov:flex ov:flex-col ov:justify-center ov:items-center">
            <h3 className="ov:font-[350] ov:text-base ov:text-center ov:leading-[2em] ov:text-[var(--ov25-secondary-text-color)]">{variant.name}</h3>
          </div>
        </div>
        {showDimensions && (
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
        )}
      </div>
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