import React, { useState } from 'react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { CompatibleModule, selectModule } from '../../utils/configurator-utils.js';
import { Variant } from './ProductVariants.js';
import { cn } from '../../lib/utils.js';

export const InitialiseMenu: React.FC = () => {
  const {
    compatibleModules,
    isModuleSelectionLoading,
    setIsModuleSelectionLoading,
    isMobile,
  } = useOV25UI();

  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  const handleModuleSelect = (variant: Variant) => {
    if (isModuleSelectionLoading) {
      return;
    }
    const module = variant.data as CompatibleModule;
    const modelPath = module?.model?.modelPath;
    const modelId = module?.model?.modelId;
    if (!modelPath || !modelId) {
      return;
    }
    setIsModuleSelectionLoading(true);
    selectModule(modelPath, modelId);
  };

  if (!compatibleModules || compatibleModules.length === 0) {
    return (
      <div className="ov:w-full ov:h-full ov:flex ov:items-center ov:justify-center">
        <p className="ov:text-sm ov:text-[var(--ov25-secondary-text-color)]">Loading modules...</p>
      </div>
    );
  }

  const compact = isMobile;

  return (
    <div className={cn(
      "ov:w-full ov:h-full ov:flex ov:flex-col ov:overflow-y-auto",
      compact ? "ov:justify-start ov:p-2" : "ov:justify-center ov:p-4"
    )}>
      <div className={cn(
        "ov:w-full ov:mx-auto ov:flex ov:flex-col ov:items-center",
        compact ? "ov:max-w-none" : "ov:max-w-[960px] ov:pt-4"
      )}>
        <p className={cn(
          "ov:text-center ov:text-[var(--ov25-text-color)] ov:flex-shrink-0",
          compact ? "ov:text-sm ov:mb-2 ov:mt-1" : "ov:text-base ov:mb-4"
        )}>
          Select a model to get started
        </p>
        <div className={cn(
          "ov:grid ov:grid-cols-2 ov:w-full",
          compact ? "ov:gap-1 ov:sm:grid-cols-3" : "ov:gap-2 ov:sm:grid-cols-4 ov:sm:gap-1"
        )}>
        {compatibleModules.map((module) => {
          const variant: Variant = {
            id: `${module.productId}-${module.model.modelId}`,
            name: module.product.name,
            price: 0,
            image: module.product.hasImage ? module.product.imageUrl : '/placeholder.svg?height=200&width=200',
            blurHash: '',
            data: module,
            isSelected: false,
          };
          return (
            <div 
              key={`${module.productId}-${module.model.modelId}`} 
              className={cn(
                "ov:w-full ov:flex ov:flex-col ov:relative",
                isModuleSelectionLoading ? "ov:cursor-not-allowed ov:opacity-50" : "ov:cursor-pointer"
              )}
              onClick={() => !isModuleSelectionLoading && handleModuleSelect(variant)}
              onMouseEnter={() => setHoveredModule(`${module.productId}-${module.model.modelId}`)}
              onMouseLeave={() => setHoveredModule(null)}
            >
              <div className={cn(
                "ov:w-full ov:flex ov:items-center ov:justify-center ov:cursor-pointer ov:overflow-hidden",
                compact
                  ? "ov:aspect-square ov:min-h-0 ov:rounded-lg"
                  : "ov:w-[170px] ov:md:w-[235px] ov:h-[100px] ov:sm:h-[140px] ov:rounded-xl ov:p-1 ov:sm:p-2 ov:border ov:border-[#F0F0F0] ov:bg-white"
              )}>
                {module.product.hasImage && module.product.imageUrl ? (
                  <img
                    src={module.product.imageUrl.replace('thumbnail', 'small_image')}
                    alt={module.product.name}
                    className={cn("ov:w-full ov:h-full ov:object-cover", compact && "ov:rounded-lg")}
                  />
                ) : (
                  <div className={cn(
                    "ov:w-full ov:h-full ov:flex ov:items-center ov:justify-center ov:min-h-[80px]",
                    compact ? "ov:bg-[var(--ov25-border-color)] ov:rounded-lg" : "ov:bg-gray-200 ov:rounded-lg"
                  )}>
                    <span className="ov:text-gray-400 ov:text-xs">No Image</span>
                  </div>
                )}
              </div>
              {!compact && hoveredModule === `${module.productId}-${module.model.modelId}` && (
                <div className="ov:absolute ov:bottom-full ov:left-1/2 ov:transform ov:-translate-x-1/2 ov:mb-2 ov:px-2 ov:py-1 ov:bg-gray-900 ov:text-white ov:text-xs ov:rounded ov:whitespace-nowrap ov:z-10">
                  {module.product.name}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default InitialiseMenu;


