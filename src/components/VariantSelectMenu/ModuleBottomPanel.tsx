import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { selectModule, CompatibleModule, closeModuleSelectMenu } from '../../utils/configurator-utils.js';
import { ModuleTypeTabs } from './ModuleTypeTabs.js';
import { ModuleVariantCard } from './variant-cards/ModuleVariantCard.js';
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel.js';
import { Variant } from './ProductVariants.js';

export const ModuleBottomPanel: React.FC<{ portalTarget?: Element }> = ({ portalTarget }) => {
  const {
    compatibleModules,
    isModulePanelOpen,
    setIsModulePanelOpen,
    selectedModuleType,
    setSelectedModuleType,
    isModuleSelectionLoading,
    setIsModuleSelectionLoading,
    isMobile,
  } = useOV25UI();

  // Mount/animation state
  const [isRendered, setIsRendered] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  // Filter modules based on selected type
  const filteredModules = compatibleModules && compatibleModules.length > 0 ? 
    compatibleModules.filter(module => {
      if (selectedModuleType === 'all') return true;
      const position = module.position.toLowerCase();
      return position.includes(selectedModuleType);
    }) : [];

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

  const handleClose = () => {
    setIsModulePanelOpen(false);
    closeModuleSelectMenu();
  };

  // Handle mount/unmount with transition classes; unmount on transition end
  useEffect(() => {
    if (isModulePanelOpen && filteredModules.length > 0) {
      setIsRendered(true);
      const id = requestAnimationFrame(() => setIsEntering(true));
      return () => cancelAnimationFrame(id);
    } else if (isRendered) {
      setIsEntering(false);
    }
  }, [isModulePanelOpen, filteredModules.length, isRendered]);

  if (!isRendered) {
    return null;
  }

  const positionClass = portalTarget ? 'ov:absolute' : 'ov:fixed';
  const handleTransitionEnd = () => {
    if (!isEntering && !isModulePanelOpen) {
      setIsRendered(false);
    }
  };

  const panelContent = (
    <div 
      className={`${positionClass} ov:bottom-0 ov:left-0 ov:right-0 ov:h-[15rem] ov:bg-[var(--ov25-background-color)] ov:shadow-inner-top ov:z-[102] ov:border-t ov:border-[var(--ov25-border-color)] ov:transition-transform ov:duration-300 ov:ease-out ${isEntering ? 'ov:translate-y-0' : 'ov:translate-y-full'}`}
      style={{ boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05), 0 -2px 4px -2px rgba(0,0,0,0.03)' }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="ov:w-full ov:h-full ov:p-4 ov:px-4">
        {/* Module type tabs */}
        <div className="ov:flex ov:justify-between ov:items-center ov:mb-4">
          <div className="ov:w-full">
            <ModuleTypeTabs 
              selectedType={selectedModuleType}
              onTypeChange={setSelectedModuleType}
              compatibleModules={compatibleModules}
              />
          </div>
          <button 
            onClick={handleClose}
            className="ov:p-2 ov:hover:bg-[var(--ov25-accent-color)] ov:rounded-full ov:cursor-pointer"
          >
            <svg className="ov:w-5 ov:h-5 ov:text-[var(--ov25-secondary-text-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Module carousel */}
        <div className="ov:flex-1 ov:overflow-hidden">
          {filteredModules.length === 0 ? (
            <div className="ov:flex ov:flex-col ov:items-center ov:justify-center ov:py-8 ov:space-y-4">
              <p className="ov:text-sm ov:text-[var(--ov25-secondary-text-color)]">
                Loading modules...
              </p>
            </div>
          ) : (
            <Carousel className="ov:w-full ov:pointer-events-auto">
              <CarouselContent className="ov:justify-center">
                {filteredModules.map((module) => {
                  const variant: Variant = {
                    id: `${module.productId}-${module.model.modelId}`,
                    name: module.product.name,
                    price: 0,
                    image: module.product.hasImage ? module.product.imageUrl : '/placeholder.svg?height=200&width=200',
                    blurHash: '',
                    data: module,
                    isSelected: false
                  };

                  return (
                    <CarouselItem key={module.productId} className="ov:md:basis-1/4 ov:lg:basis-1/5 ov:max-w-[8rem]">
                      <div 
                        className={`ov:p-2 ov:flex ov:flex-col ov:gap-2 ov:items-center ov:z-50 ${
                          isModuleSelectionLoading ? 'ov:cursor-not-allowed ov:opacity-50' : 'ov:cursor-pointer'
                        }`} 
                        onClick={() => handleModuleSelect(variant)}
                      >
                        <ModuleVariantCard 
                          variant={variant}
                          onSelect={handleModuleSelect}
                          index={0}
                          isMobile={isMobile}
                          isLoading={isModuleSelectionLoading}
                        />
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          )}
        </div>
      </div>
    </div>
  );

  // Render into provided target if available (e.g., modal), otherwise fallback to document.body
  const target = portalTarget ?? document.body;
  return createPortal(panelContent, target);
};
