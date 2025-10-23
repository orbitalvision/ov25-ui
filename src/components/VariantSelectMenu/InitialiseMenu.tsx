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

  return (
    <div className="ov:w-full ov:h-full ov:flex ov:flex-col ov:justify-center ov:overflow-y-auto ov:p-4">
      <div className="ov:w-full ov:max-w-[960px] ov:mx-auto ov:flex ov:flex-col ov:justify-center ov:items-center ov:pt-4">
        <h2 className="ov:text-center ov:text-base ov:mb-4 ov:text-[var(--ov25-text-color)] ov:flex-shrink-0">Select a model to get started</h2>
        <div className="ov:grid ov:grid-cols-2 ov:gap-2 ov:sm:grid-cols-4 ov:sm:gap-1">
        {compatibleModules.map((module, index) => {
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
              <div className="ov:w-full ov:h-[100px] ov:sm:h-[140px] ov:flex ov:items-center ov:justify-center ov:rounded-xl ov:bg-white ov:cursor-pointer ov:p-1 ov:sm:p-2 ov:border ov:border-[#F0F0F0]">
                {module.product.hasImage && module.product.imageUrl ? (
                  <img
                    src={module.product.imageUrl.replace('thumbnail', 'small_image')}
                    alt={module.product.name}
                    className="ov:w-full ov:h-full ov:object-cover ov:rounded-lg"
                  />
                ) : (
                  <div className="ov:w-full ov:h-full ov:bg-gray-200 ov:rounded-lg ov:flex ov:items-center ov:justify-center">
                    <span className="ov:text-gray-400 ov:text-xs">No Image</span>
                  </div>
                )}
              </div>
              
              {/* Custom tooltip */}
              {hoveredModule === `${module.productId}-${module.model.modelId}` && (
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


