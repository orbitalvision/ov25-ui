import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../lib/utils.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { ProductVariantsWrapper } from './VariantSelectMenu/ProductVariantsWrapper.js';

interface ConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const ConfiguratorModal: React.FC<ConfiguratorModalProps> = ({ isOpen, onClose, children }) => {
  const { shareDialogTrigger, isModalOpen } = useOV25UI();
  const isShareDialogOpen = shareDialogTrigger !== 'none';

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return createPortal(
    <div
      className={cn(
        'ov:fixed ov:inset-0 ov:z-[99999999999999] ov:bg-black/50 ov:flex ov:items-center ov:justify-center',
        'ov:p-4',
        !isOpen && 'ov:hidden ov:pointer-events-none'
      )}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className={cn(
          'ov:relative ov:bg-white ov:rounded-lg ov:shadow-xl',
          'ov:w-auto ov:h-[90vh] ov:max-w-[1980px] ov:max-h-none',
          'ov:flex'
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            'ov:absolute ov:-right-12 ov:z-10',
            'ov:w-10 ov:h-10 ov:rounded-full ov:bg-white ov:shadow-lg',
            'ov:flex ov:items-center ov:justify-center',
            'ov:text-gray-600 ov:hover:text-gray-800 ov:hover:bg-gray-50',
            'ov:transition-all ov:duration-200 ov:cursor-pointer',
            'ov:border ov:border-gray-200',
            isShareDialogOpen && 'ov:opacity-0 ov:pointer-events-none'
          )}
          aria-label="Close modal"
        >
          <X className="ov:h-6 ov:w-6" />
        </button>

        {/* Modal content */}
        <div className="ov:w-full ov:h-full ov:overflow-hidden ov:flex ov:rounded-lg">
          {/* Main content area with square aspect ratio */}
          <div className="ov:relative ov:flex ov:items-center ov:justify-center ov:overflow-hidden ov:w-[90vh] ov:h-[90vh]">
            <div className="ov:w-full ov:h-full">
              {children}
            </div>
          </div>
          
          {/* Variants panel - always visible */}
          <div className="ov:w-[384px] ov:h-full ov:bg-white ov:border-l ov:border-gray-200 ov:overflow-y-auto">
            <ProductVariantsWrapper key={`variants-${isModalOpen ? 'open' : 'closed'}`} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
