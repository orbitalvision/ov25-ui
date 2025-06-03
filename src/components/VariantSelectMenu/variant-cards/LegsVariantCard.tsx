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
    
    return (<>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect(variant);
        }}
        className={`ov25-legs-variant-card ov:**:ov:relative ov:hidden ov:md:flex ov:cursor-pointer ov:flex-col ov:h-[160px] ov:md:h-[200px] ov:xl:h-[217px] ov:items-center ov:gap-4 ov:w-full ov:p-6 ov:py-4 ov:text-left ov:hover:bg-accent ov:md:border-b ov:border-[#E5E5E5] ov:text-[#282828] ov:group ${index % 2 === 0 ? 'ov:xl:border-r ov:border-[#E5E5E5]' : ''}`}
        data-selected={variant.isSelected}
      >
        <div className="ov:relative ov:aspect-square ov:h-full ov:group-hover:bg-accent">
          <div className="ov:absolute ov:inset-0 ov:rounded-full ov:overflow-hidden ov:bg-[var(--ov25-background-color)] ov:group-hover:bg-accent">
            <div className="ov:relative ov:w-full ov:h-full">
              {!isMobile ? (
                <img 
                  key={imgSrc} 
                  src={imgSrc} 
                  alt={variant.name} 
                  className="ov:object-cover ov:w-full ov:h-full" 
                />
              ) : (
                <img 
                  key={imgSrc} 
                  src={imgSrc} 
                  alt={variant.name} 
                  className="ov:object-cover ov:w-full ov:h-full" 
                  width={100} 
                  height={100} 
                />
              )}
              {variant.isSelected && (
                <div className="ov:absolute ov:inset-0">
                  <div className="ov25-variant-selected-indicator ov:absolute ov:top-1/2 ov:left-1/2 ov:-translate-x-1/2 ov:-translate-y-1/2">
                    <div className="ov:w-6 ov:h-6 ov:rounded-full ov:bg-black ov:flex ov:items-center ov:justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ov:w-4 ov:h-4 ov:text-white">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="ov:flex ov:flex-1 ov:items-center ov:justify-between">
          <div className="ov:flex ov:flex-col ov:justify-center ov:items-center">
            <h3 className="ov:font-[350] ov:text-sm ov:text-[var(--ov25-secondary-text-color)]">{variant.name}</h3>
          </div>
        </div>
      </button>
        <div 
        className={`ov:flex ov:md:hidden ov:flex-col ov:items-center ${variant.isSelected ? '' : ''} ov:transition-transform ov:pt-2`}
        key={variant.id + variant.groupId + variant.optionId} 
        data-selected={variant.isSelected}
    >
        <div className="ov:relative">
            <div 
                className={`ov:w-14 ov:h-14 ov:rounded-full ov:overflow-hidden ov:mb-1 ov:cursor-pointer ${variant.isSelected ? 'ov:border-2 ov:border-[var(--ov25-highlight-color)] ov:shadow-lg' : 'ov:border-transparent ov:shadow-md'}`}
                {...(variant.isSelected && { selected: true })}
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
    </>
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