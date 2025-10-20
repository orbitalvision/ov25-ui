import React from 'react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { CompatibleModule, selectModule } from '../../utils/configurator-utils.js';
import { ModuleVariantCard } from './variant-cards/ModuleVariantCard.js';
import { Variant } from './ProductVariants.js';

export const InitialiseMenu: React.FC = () => {
  const {
    compatibleModules,
    isModuleSelectionLoading,
    setIsModuleSelectionLoading,
    isMobile,
  } = useOV25UI();

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
    <div className="ov:w-full ov:h-full ov:overflow-auto ov:p-4">
      <div className="ov:grid ov:grid-cols-4 ov:gap-2">
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
            <div key={`${module.productId}-${module.model.modelId}`} className="ov:w-full">
              <ModuleVariantCard
                variant={variant}
                onSelect={handleModuleSelect}
                index={index}
                isMobile={isMobile}
                isLoading={isModuleSelectionLoading}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InitialiseMenu;


