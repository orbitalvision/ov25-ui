import React, { useState } from 'react';
import { cn } from '../lib/utils.js';
import { ConfiguratorModal } from './ConfiguratorModal.js';
import { ProductGallery } from './product-gallery.js';

export const Snap2ConfigureButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button 
        className={cn('ov:p-3 ov:py-2 ov:my-2 ov:cursor-pointer ov:bg-white ov:text-black ov:border ov:rounded-md ov:border-[var(--ov25-border-color)]')}
        onClick={handleClick}
      >
        Configure
      </button>
      
      <ConfiguratorModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ProductGallery isInModal={isModalOpen} />
      </ConfiguratorModal>
    </>
  );
};
