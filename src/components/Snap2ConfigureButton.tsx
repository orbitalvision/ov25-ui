import React, { useState } from 'react';
import { cn } from '../lib/utils.js';
import { ConfiguratorModal } from './ConfiguratorModal.js';
import { ProductGallery } from './product-gallery.js';
import ConfiguratorViewControls from './ConfiguratorViewControls.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { ProductVariantsWrapper } from './VariantSelectMenu/ProductVariantsWrapper.js';

export const Snap2ConfigureButton: React.FC = () => {
  const { isVariantsOpen, isModalOpen, setIsModalOpen, setIsVariantsOpen } = useOV25UI();

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsVariantsOpen(false);
  };

  return (
    <>
      <button 
        className={cn('ov25-snap2-configure-button ov:p-3 ov:py-2 ov:my-2 ov:cursor-pointer ov:bg-white ov:text-black ov:border ov:rounded-md ov:border-[var(--ov25-border-color)]')}
        onClick={handleClick}
      >
        Configure
      </button>
      
      <ConfiguratorModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="ov:relative ov:w-full ov:h-full ov:flex">
          {/* Main content area */}
          <div className={cn(
            "ov:relative ov:flex-1 ov:transition-all ov:duration-300",
            isVariantsOpen ? "ov:w-[calc(100%-384px)]" : "ov:w-full"
          )}>
            <ProductGallery isInModal={isModalOpen} />
            <ConfiguratorViewControls />
          </div>
          
          {/* Variants panel - only shown when variants are open */}
          {isVariantsOpen && (
            <div className="ov:w-[384px] ov:h-full ov:bg-white ov:border-l ov:border-gray-200 ov:overflow-y-auto">
              <ProductVariantsWrapper />
            </div>
          )}
        </div>
      </ConfiguratorModal>
    </>
  );
};
