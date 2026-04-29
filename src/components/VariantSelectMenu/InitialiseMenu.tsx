import React from 'react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { CompatibleModule, selectModule } from '../../utils/configurator-utils.js';
import { Variant } from './ProductVariants.js';
import { cn } from '../../lib/utils.js';
import { ModuleVariantCard } from './variant-cards/ModuleVariantCard.js';

export const InitialiseMenu: React.FC = () => {
  const {
    compatibleModules,
    isModuleSelectionLoading,
    setIsModuleSelectionLoading,
    isMobile,
    configuratorState,
    initialiseMenuUsesExternalSelector,
  } = useOV25UI();
  const hasSnap2Objects = (configuratorState?.snap2Objects?.length ?? 0) > 0;

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
    selectModule({ modelPath, modelId });
  };

  const initialiseMenuShellClass =
    'ov:bg-[var(--ov25-configurator-iframe-background-color)] ov:w-full ov:h-full';

  if (compatibleModules === null) {
    return (
      <div
        id="ov25-initialise-menu"
        className={cn(initialiseMenuShellClass, 'ov:flex ov:items-center ov:justify-center')}
      >
        <p className="ov:text-sm ov:text-(--ov25-secondary-text-color)">Loading products...</p>
      </div>
    );
  }

  /** Full-screen inject host: collapse shadow host so fixed/inset page chrome does not stay opaque over the scene. */
  if (
    initialiseMenuUsesExternalSelector &&
    (hasSnap2Objects ||
      (isModuleSelectionLoading && compatibleModules.length === 0))
  ) {
    return (
      <style>
        {
          ':host { display: none !important; pointer-events: none !important; visibility: hidden !important; }'
        }
      </style>
    );
  }

  if (compatibleModules.length === 0) {
    if (!initialiseMenuUsesExternalSelector && (isModuleSelectionLoading || hasSnap2Objects)) {
      return null;
    }
    return (
      <div
        id="ov25-initialise-menu"
        className={cn(
          initialiseMenuShellClass,
          'ov:flex ov:items-center ov:justify-center ov:px-4 ov:text-center'
        )}
      >
        <p className="ov:text-sm ov:text-(--ov25-secondary-text-color)">
          Select an attachment point or model to replace
        </p>
      </div>
    );
  }

  const compact = isMobile;

  return (
    <div
      id="ov25-initialise-menu"
      className={cn(
        initialiseMenuShellClass,
        'ov:flex ov:flex-col ov:min-h-0 ov:overflow-hidden',
        compact ? 'ov:p-2' : 'ov:p-4'
      )}
    >
      <div
        className={cn(
          'ov:mx-auto ov:flex ov:min-h-0 ov:w-full ov:flex-1 ov:flex-col ov:items-stretch',
          compact ? 'ov:max-w-md' : 'ov:max-w-md ov:md:max-w-3xl'
        )}
      >
        <p
          data-ov25-initialise-menu-intro
          className={cn(
            'ov:text-center ov:text-(--ov25-text-color) ov:shrink-0',
            compact ? 'ov:text-sm ov:mb-2 ov:mt-1' : 'ov:text-base ov:mb-3'
          )}
        >
          Select a product to get started
        </p>
        <div
          className={cn(
            'ov25-initialise-menu-module-list ov:grid ov:min-h-0 ov:flex-1 ov:grid-cols-1 ov:content-start ov:gap-3 ov:overflow-y-auto ov:overflow-x-hidden ov:pb-2',
            !compact && 'ov:md:grid-cols-2'
          )}
          data-ov25-initialise-menu-part="module-list"
        >
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
              <ModuleVariantCard
                key={`${module.productId}-${module.model.modelId}`}
                variant={variant}
                onSelect={handleModuleSelect}
                index={index}
                isMobile={compact}
                isLoading={isModuleSelectionLoading}
                pickOnActivate
                className="ov:mb-0 ov:h-[185px] ov:px-4"
                thumbDualClassName="ov:p-[0.5rem]"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InitialiseMenu;
