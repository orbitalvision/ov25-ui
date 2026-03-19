import React, { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { ProductVariantsWrapper } from './VariantSelectMenu/ProductVariantsWrapper.js';
import { WizardVariants } from './VariantSelectMenu/WizardVariants.js';
import { VariantsHeader } from './VariantSelectMenu/VariantsHeader.js';
import { VariantsCloseButton } from './VariantSelectMenu/VariantsCloseButton.js';

export const MODAL_GALLERY_SLOT_ID = 'ov25-modal-gallery-slot';

export interface ConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Left area content (e.g. Snap2 ProductGallery). Ignored when useGallerySlot is true. */
  children?: React.ReactNode;
  /** When true, left area is an empty slot; useIframePositioning will reposition the iframe into it. For standard configurator with preloaded hidden iframe. */
  useGallerySlot?: boolean;
  /** Optional content after the variants panel (e.g. Snap2 ModuleBottomPanel + InitialiseMenu overlay). */
  extraContent?: React.ReactNode;
  /** Optional ref/callback for the modal content wrapper (e.g. Snap2 uses it for ModuleBottomPanel portal target). */
  contentRef?: React.Ref<HTMLDivElement>;
}

export const ConfiguratorModal: React.FC<ConfiguratorModalProps> = ({
  isOpen,
  onClose,
  children,
  useGallerySlot = false,
  extraContent,
  contentRef,
}) => {
  const {
    shareDialogTrigger,
    isVariantsOpen,
    isMobile,
    isSnap2Mode,
    variantDisplayStyleOverlay,
    variantDisplayStyleOverlayMobile,
    shadowDOMs,
  } = useOV25UI();
  const effectiveOverlayStyle = isMobile ? variantDisplayStyleOverlayMobile : variantDisplayStyleOverlay;
  const isShareDialogOpen = shareDialogTrigger !== 'none';
  const modalRef = useRef<HTMLDivElement>(null);
  const portalTarget = shadowDOMs?.modalPortal ?? document.body;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const leftArea = useGallerySlot ? (
    <div id={MODAL_GALLERY_SLOT_ID} className="ov:w-full ov:h-full ov:min-h-0" ><span></span></div>
  ) : (
    <div className="ov:w-full ov:h-full">{children}</div>
  );

  return createPortal(
    <div
      ref={modalRef}
      className={cn(
        'ov:fixed ov:inset-0 ov:z-2147483646 ov:bg-black/50 ov:flex ov:items-start ov:justify-center',
        isMobile ? 'ov:p-2' : 'ov:p-4',
        !isOpen && 'ov:hidden ov:pointer-events-none'
      )}
      onClick={handleBackdropClick}
      tabIndex={-1}
    >
      <div
        className={cn(
          'ov:relative ov:bg-transparent ov:shadow-xl ov:rounded-3xl',
          isMobile
            ? 'ov:w-full ov:h-full ov:max-w-none'
            : 'ov:w-auto ov:h-full ov:max-w-[1980px]'
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            'ov:relative ov:h-full ov:flex ov:rounded-3xl',
            isMobile
              ? 'ov:w-full ov:flex-col'
              : 'ov:w-[90vw] ov:flex-row'
          )}
          style={{ clipPath: 'inset(0 round 1.5rem)' }}
        >
          <VariantsCloseButton
            onClick={onClose}
            ariaLabel="Close modal"
            className={cn('ov:z-101', isShareDialogOpen && 'ov:opacity-0 ov:pointer-events-none')}
          />

          <div className={cn(
            'ov:relative ov:flex ov:items-stretch ov:min-w-0',
            isMobile
              ? 'ov:flex-col ov:w-full ov:h-full ov:min-h-0'
              : 'ov:flex-row ov:flex-1 ov:h-full'
          )}>
            <div className={cn(
              isMobile
                ? 'ov:w-full ov:h-[40vh] ov:shrink-0'
                : isSnap2Mode
                  ? 'ov:w-full ov:h-full'
                  : 'ov:flex-1 ov:min-w-0 ov:h-full'
            )}>
              {leftArea}
            </div>
            <div
              data-ov25-variants-panel
              data-open={isVariantsOpen}
              className={cn(
                'ov:z-102 ov:bg-white ov:overflow-y-auto',
                isMobile
                  ? 'ov:w-full ov:flex-1 ov:min-h-0 ov:border-t ov:border-gray-200'
                  : isSnap2Mode
                    ? 'ov:absolute ov:right-0 ov:top-0 ov:w-[384px] ov:h-full ov:border-l ov:border-gray-200'
                    : 'ov:shrink-0 ov:w-[384px] ov:h-full ov:border-l ov:border-gray-200'
              )}
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
          </div>

          {extraContent}
        </div>
      </div>
    </div>,
    portalTarget
  );
};
