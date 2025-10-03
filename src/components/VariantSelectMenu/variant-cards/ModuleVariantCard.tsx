import React from 'react';
import { CompatibleModule } from '../../../utils/configurator-utils.js';
import { Variant } from '../ProductVariants.js';

interface ModuleVariantCardProps {
  variant: Variant;
  onSelect: (variant: Variant) => void;
  index: number;
  isMobile?: boolean;
  isLoading?: boolean;
}

export const ModuleVariantCard = React.memo(
  ({ variant, onSelect, index, isLoading = false }: ModuleVariantCardProps) => {
    const module = variant.data as CompatibleModule;
    
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isLoading) {
            onSelect(variant);
          }
        }}
        className={`ov25-module-variant-card ov:relative ov:flex ov:flex-col ov:items-center ov:gap-2 ov:w-full ov:p-2 ov:text-left ov:md:border ov:border-[#F0F0F0] ov:text-[#282828] ${index % 2 === 0 ? 'ov:xl:border-r ov:border-[#F0F0F0]' : ''} ${
          isLoading 
            ? 'ov:opacity-50 ov:cursor-not-allowed ov:pointer-events-none' 
            : 'ov:cursor-pointer ov:hover:bg-accent'
        }`}
        title={module.product.name}
      >
        <div className="ov:flex ov:flex-1 ov:items-center ov:justify-between">
          <div className="ov:flex ov:flex-col ov:justify-center ov:items-center">
            {module.product.hasImage && module.product.imageUrl ? (
              <img
                src={module.product.imageUrl}
                alt={module.product.name}
                className="ov:w-12 ov:h-12 ov:object-cover ov:rounded ov:mb-1"
              />
            ) : (
              <div className="ov:w-12 ov:h-12 ov:bg-gray-200 ov:rounded ov:mb-1 ov:flex ov:items-center ov:justify-center">
                <span className="ov:text-gray-400 ov:text-xs">No Image</span>
              </div>
            )}
            
            <h3 className="ov:font-[350] ov:text-sm ov:text-center ov:leading-tight ov:text-[var(--ov25-secondary-text-color)]">
              {module.product.name}
            </h3>
          </div>
        </div>
        
        <div className="ov:flex ov:items-center ov:justify-between ov:w-full ov:-mt-2">
          <div className="ov:flex ov:items-center ov:gap-2 ov:w-full">
            <div className="ov:flex ov:items-center ov:flex-1">
              <div className="ov:w-[2px] ov:h-3 ov:bg-[#E5E5E5]"></div>
              <div className="ov:h-[2px] ov:flex-1 ov:bg-[#E5E5E5]"></div>
            </div>
            <span className="ov:text-[12px] ov:font-[350] ov:whitespace-nowrap ov:text-[var(--ov25-secondary-text-color)]">
              {module.dimensions.x}cm
            </span>
            <div className="ov:flex ov:items-center ov:flex-1">
              <div className="ov:h-[2px] ov:flex-1 ov:bg-[#E5E5E5]"></div>
              <div className="ov:w-[2px] ov:h-3 ov:bg-[#E5E5E5]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  },
  // Custom comparison function to determine when to re-render
  (prevProps, nextProps) => {
    // Only re-render if these properties changed
    const prevModule = prevProps.variant.data as CompatibleModule;
    const nextModule = nextProps.variant.data as CompatibleModule;
    return (
      prevModule.productId === nextModule.productId &&
      prevModule.model.modelId === nextModule.model.modelId &&
      prevProps.index === nextProps.index &&
      prevProps.isMobile === nextProps.isMobile &&
      prevProps.isLoading === nextProps.isLoading
    );
  }
);
