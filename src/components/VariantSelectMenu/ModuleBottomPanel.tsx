import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { selectModule, CompatibleModule, closeModuleSelectMenu } from '../../utils/configurator-utils.js';
import { ChevronsRight, CornerDownRight, Layers, Sofa } from 'lucide-react';
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
  
  // Tab underline animation state
  const tabTypes = ['all', 'middle', 'corner', 'end'];
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

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

  // Reset to "All" when compatibleModules changes
  useEffect(() => {
    if (compatibleModules && compatibleModules.length > 0) {
      setSelectedModuleType('all');
      setActiveTabIndex(0);
    }
  }, [compatibleModules, setSelectedModuleType]);

  // Update active tab index when selectedModuleType changes
  useEffect(() => {
    const newIndex = tabTypes.indexOf(selectedModuleType);
    if (newIndex !== -1) {
      setActiveTabIndex(newIndex);
    }
  }, [selectedModuleType, tabTypes]);

  const updateUnderlinePosition = (tabIndex: number) => {
    const activeTab = tabsRef.current[tabIndex];
    if (activeTab) {
      const { offsetLeft, offsetWidth } = activeTab;
      setUnderlineStyle({
        width: offsetWidth,
        left: offsetLeft
      });
    }
  };

  // Update underline position when active tab changes
  useEffect(() => {
    if (isRendered) {
      updateUnderlinePosition(activeTabIndex);
    }
  }, [activeTabIndex, isRendered]);

  // Ensure underline is positioned after animation completes
  useEffect(() => {
    if (isRendered && underlineStyle.width === 0 && isEntering) {
      // Wait for animation to complete (300ms duration + buffer)
      const timer = setTimeout(() => {
        updateUnderlinePosition(0);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isRendered, isEntering]);

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
      className={`${positionClass} ov:bottom-0 ov:left-0 ov:right-0 ov:h-[15rem] ov:bg-gray-100 ov:shadow-inner-top ov:z-[102] ov:border-t ov:border-[var(--ov25-border-color)] ov:transition-transform ov:duration-300 ov:ease-out ov:shadow-inner-top ${isEntering ? 'ov:translate-y-0' : 'ov:translate-y-full'}`}
      style={{ boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05), 0 -2px 4px -2px rgba(0,0,0,0.03)' }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="ov:w-full ov:h-full ov:p-4 ov:px-4">
        {/* Module type tabs */}
        <div className="ov:flex ov:justify-between ov:items-center">
          <div className="ov:w-full">
            <div className="ov:flex ov:justify-center ov:mb-4">
              <div className="ov:bg-white ov:shadow-md ov:backdrop-blur-sm ov:rounded-full ov:px-2 ov:pt-2 ov:pb-0">
                <div className="ov:relative ov:flex ov:items-center ov:gap-1">
                  <button
                    ref={(el) => tabsRef.current[0] = el}
                    onClick={() => setSelectedModuleType('all')}
                    className={`ov:flex ov:items-center ov:gap-1.5 ov:px-4 ov:py-2 ov:rounded-full ov:text-sm ov:font-medium ov:transition-colors ${
                      selectedModuleType === 'all' 
                        ? 'ov:text-gray-900' 
                        : 'ov:text-gray-600 ov:hover:text-gray-900'
                    }`}
                  >
                    <Layers className="ov:w-3.5 ov:h-3.5" />
                    <span>All</span>
                  </button>
                  <button
                    ref={(el) => tabsRef.current[1] = el}
                    onClick={() => setSelectedModuleType('middle')}
                    className={`ov:flex ov:items-center ov:gap-1.5 ov:px-4 ov:py-2 ov:rounded-full ov:text-sm ov:font-medium ov:transition-colors ${
                      selectedModuleType === 'middle' 
                        ? 'ov:text-gray-900' 
                        : 'ov:text-gray-600 ov:hover:text-gray-900'
                    }`}
                  >
                    <Sofa className="ov:w-3.5 ov:h-3.5" />
                    <span>Middle</span>
                  </button>
                  <button
                    ref={(el) => tabsRef.current[2] = el}
                    onClick={() => setSelectedModuleType('corner')}
                    className={`ov:flex ov:items-center ov:gap-1.5 ov:px-4 ov:py-2 ov:rounded-full ov:text-sm ov:font-medium ov:transition-colors ${
                      selectedModuleType === 'corner' 
                        ? 'ov:text-gray-900' 
                        : 'ov:text-gray-600 ov:hover:text-gray-900'
                    }`}
                  >
                    <CornerDownRight className="ov:w-3.5 ov:h-3.5" />
                    <span>Corner</span>
                  </button>
                  <button
                    ref={(el) => tabsRef.current[3] = el}
                    onClick={() => setSelectedModuleType('end')}
                    className={`ov:flex ov:items-center ov:gap-1.5 ov:px-4 ov:py-2 ov:rounded-full ov:text-sm ov:font-medium ov:transition-colors ${
                      selectedModuleType === 'end' 
                        ? 'ov:text-gray-900' 
                        : 'ov:text-gray-600 ov:hover:text-gray-900'
                    }`}
                  >
                    <ChevronsRight className="ov:w-3.5 ov:h-3.5" />
                    <span>End</span>
                  </button>
                  
                  {/* Animated green underline */}
                  <div
                    className="ov:absolute ov:bottom-0 ov:transition-all ov:duration-300 ov:ease-out"
                    style={{
                      width: `${underlineStyle.width}px`,
                      left: `${underlineStyle.left}px`,
                      height: '4px',
                      backgroundColor: '#64bfb7'
                    }}
                  />
                </div>
              </div>
            </div>
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
                    <CarouselItem key={module.productId} className="ov:basis-[150px] ov:flex-shrink-0">
                      <div 
                        className={`ov:p-2 ov:flex ov:flex-col ov:gap-2 ov:items-center ov:z-50 ov:w-[150px] ov:h-[150px] ${
                          isModuleSelectionLoading ? 'ov:cursor-not-allowed ov:opacity-50' : 'ov:cursor-pointer'
                        }`} 
                        onClick={() => handleModuleSelect(variant)}
                      >
                        <div 
                          className="ov:w-[100px] ov:h-[100px] ov:flex ov:items-center ov:justify-center ov:rounded-xl ov:shadow-lg ov:bg-white ov:cursor-pointer ov:p-2"
                        >
                          {module.product.hasImage && module.product.imageUrl ? (
                            <img
                              src={module.product.imageUrl}
                              alt={module.product.name}
                              className="ov:w-full ov:h-full ov:object-none ov:rounded-lg"
                            />
                          ) : (
                            <div className="ov:w-full ov:h-full ov:bg-gray-200 ov:rounded-lg ov:flex ov:items-center ov:justify-center">
                              <span className="ov:text-gray-400 ov:text-xs">No Image</span>
                            </div>
                          )}
                        </div>
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
