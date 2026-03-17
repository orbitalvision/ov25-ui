import React from 'react';
import { useRef, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { ProductVariantsWrapper } from './VariantSelectMenu/ProductVariantsWrapper.js';
import { WizardVariants } from './VariantSelectMenu/WizardVariants.js';
import { VariantsHeader } from './VariantSelectMenu/VariantsHeader.js';
import { ModuleBottomPanel } from './VariantSelectMenu/ModuleBottomPanel.js';
import { VariantsCloseButton } from './VariantSelectMenu/VariantsCloseButton.js';
import InitialiseMenu from './VariantSelectMenu/InitialiseMenu.js';

interface ConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Snap2ConfiguratorModal: React.FC<ConfiguratorModalProps> = ({ isOpen, onClose, children }) => {
  const { shareDialogTrigger, isModalOpen, configuratorState, isVariantsOpen, isProductGalleryStacked, uniqueId, isMobile, variantDisplayStyleOverlay, variantDisplayStyleOverlayMobile } = useOV25UI();
  const effectiveOverlayStyle = isMobile ? variantDisplayStyleOverlayMobile : variantDisplayStyleOverlay;
  const isShareDialogOpen = shareDialogTrigger !== 'none';
  const modalRef = useRef<HTMLDivElement>(null);
  const [portalTargetEl, setPortalTargetEl] = useState<HTMLDivElement | null>(null);



  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Add global keydown listener when modal is open
  useEffect(() => {
    if (isOpen) {
      // Add global keydown listener
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  // render at z-index 2147483646 (max -1)
  return createPortal(
    <div
      ref={modalRef}
      className={cn(
        'ov:fixed ov:inset-0 ov:z-2147483646 ov:bg-black/50 ov:flex ov:flex-row ov:items-start ov:justify-center',
        'ov:p-4',
        !isOpen && 'ov:hidden ov:pointer-events-none'
      )}
      onClick={handleBackdropClick}
      tabIndex={-1}
    >
      <div
        className={cn(
          'ov:relative ov:bg-transparent ov:rounded-3xl ov:shadow-xl',
          'ov:w-auto ov:h-full ov:max-w-[1980px] ov:max-h-none',
  
        )}
      >
        {/* Modal content — clip-path used instead of overflow:hidden to avoid Chrome compositing bugs */}
        <div
          ref={setPortalTargetEl}
          className="ov:relative ov:w-[90vw] ov:h-full ov:flex ov:rounded-3xl"
          style={{ clipPath: 'inset(0 round 1.5rem)' }}
        >
          {/* Close button — z-101 so variants panel (z-102) covers it when open */}
          <VariantsCloseButton
            onClick={onClose}
            ariaLabel="Close modal"
            className={cn('ov:z-101', isShareDialogOpen && 'ov:opacity-0 ov:pointer-events-none')}
          />

          <div className="ov:relative ov:flex ov:items-stretch ov:justify-stretch ov:flex-1 ov:h-full ov:w-full">
            <div className="ov:w-full ov:h-full">
              {children}
            </div>
          </div>

          {/* Variants slide panel */}
          <div
            data-ov25-variants-panel
            data-open={isVariantsOpen}
            className="ov:absolute ov:top-0 ov:right-0 ov:h-full ov:w-[384px] ov:z-102 ov:bg-white ov:border-l ov:border-gray-200 ov:overflow-y-auto"
          >
            {effectiveOverlayStyle === 'wizard' ? (
              <div className="ov:flex ov:flex-col ov:h-full ov:bg-[var(--ov25-background-color)]">
                <VariantsHeader />
                <div className="ov:flex ov:flex-col ov:flex-1 ov:min-h-0 ov:overflow-hidden">
                  <WizardVariants mode="drawer" />
                </div>
              </div>
            ) : (
              <ProductVariantsWrapper />
            )}
          </div>
    


            {portalTargetEl && <ModuleBottomPanel portalTarget={portalTargetEl} />}

          {/* Full overlay when uninitialised. When stacked, iframe is portaled to body so overlay must go there too to cover 3D viewer */}
          {(!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0) && (
            isProductGalleryStacked ? (
              createPortal(
                <div className="ov:absolute ov:inset-0 ov:z-[103] ov:bg-[var(--ov25-background-color)]">
                  <InitialiseMenu />
                </div>,
                document.getElementById(uniqueId ? `true-configurator-view-controls-container-${uniqueId}` : 'true-configurator-view-controls-container')?.parentElement ?? document.body
              )
            ) : (
              <div className="ov:absolute ov:inset-0 ov:z-[103] ov:bg-[var(--ov25-background-color)]">
                <InitialiseMenu />
              </div>
            )
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
