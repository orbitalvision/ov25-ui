import React from 'react';
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../lib/utils.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { ProductVariantsWrapper } from './VariantSelectMenu/ProductVariantsWrapper.js';
import { ModuleBottomPanel } from './VariantSelectMenu/ModuleBottomPanel.js';
import InitialiseMenu from './VariantSelectMenu/InitialiseMenu.js';

interface ConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const ConfiguratorModal: React.FC<ConfiguratorModalProps> = ({ isOpen, onClose, children }) => {
  const { shareDialogTrigger, isModalOpen, configuratorState, isVariantsOpen } = useOV25UI();
  const isShareDialogOpen = shareDialogTrigger !== 'none';
  const contentRef = useRef<HTMLDivElement>(null);

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
        'ov:fixed ov:inset-0 ov:z-[99999999999999] ov:bg-black/50 ov:flex ov:flex-row ov:items-start ov:justify-center',
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
          'ov:w-auto ov:h-[60vh] ov:lg:h-[70vh] ov:xl:h-[90vh] ov:max-w-[1980px] ov:max-h-none',
          'ov:flex'
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            'ov:absolute ov:z-10',
            'ov:w-10 ov:h-10 ov:rounded-full ov:bg-white ov:shadow-lg',
            'ov:flex ov:items-center ov:justify-center',
            'ov:text-gray-600 ov:hover:text-gray-800 ov:hover:bg-gray-50',
            'ov:transition-all ov:duration-200 ov:cursor-pointer',
            'ov:border ov:border-gray-200',
            'ov:top-4 ov:right-4 ov:min-[1325px]:-right-12',
            isShareDialogOpen && 'ov:opacity-0 ov:pointer-events-none'
          )}
          aria-label="Close modal"
        >
          <X className="ov:h-6 ov:w-6" />
        </button>

        {/* Modal content */}
        <div ref={contentRef} className="ov:relative ov:w-[90vw] ov:h-[90vh] ov:overflow-hidden ov:flex ov:rounded-lg">
          {/* Main content area */}
          <div className="ov:relative ov:flex ov:items-stretch ov:justify-stretch ov:flex-1 ov:h-full ov:w-full ov:overflow-visible">
            <div className="ov:w-full ov:h-full">
              {children}
            </div>
          </div>
          
          {/* Variants panel - always visible */}
          <div
            data-open={isVariantsOpen}
            className={
              `ov:absolute ov:top-0 ov:right-0 ov:h-full ov:w-[384px] ov:bg-white ov:border-l ov:border-gray-200 ov:overflow-y-auto ov:z-[102]
               ov:transition-transform ov:duration-500 ov:ease-in-out
               ${isVariantsOpen ? 'ov:translate-x-0' : 'ov:translate-x-full'}
               ${isVariantsOpen ? 'ov:pointer-events-auto' : 'ov:pointer-events-none'}`
            }
          >
            <ProductVariantsWrapper key={`variants-${isModalOpen ? 'open' : 'closed'}`} />
          </div>
            <ModuleBottomPanel portalTarget={contentRef.current || undefined} />

          {/* Full overlay to cover both panes (left + right) and the bottom panel when uninitialised */}
          {(!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0) && (
            <div className="ov:absolute ov:inset-0 ov:z-[103] ov:bg-[var(--ov25-background-color)]">
              <InitialiseMenu />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
