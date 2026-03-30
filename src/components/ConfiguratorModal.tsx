import React, { useRef, useEffect, useLayoutEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import {
  TRANSITION_MODAL_OVERLAY_IN_MS,
  TRANSITION_MODAL_OVERLAY_OUT_MS,
  TRANSITION_PROXY_CLOSE_EASING,
} from '../lib/config/iframe-transition-snapshot.js';
import { ModalGalleryOpeningBitmap } from './ModalGalleryOpeningBitmap.js';
import { ProductVariantsWrapper } from './VariantSelectMenu/ProductVariantsWrapper.js';
import { WizardVariants } from './VariantSelectMenu/WizardVariants.js';
import { VariantsHeader } from './VariantSelectMenu/VariantsHeader.js';
import { VariantsCloseButton } from './VariantSelectMenu/VariantsCloseButton.js';

export const MODAL_GALLERY_SLOT_ID = 'ov25-modal-gallery-slot';

export interface ConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Ignored when useGallerySlot is true. */
  children?: React.ReactNode;
  /** Empty gallery slot; useIframePositioning moves the preloaded iframe here. */
  useGallerySlot?: boolean;
  /** Snapshot shown in the slot while the backdrop fades in; iframe mounts after `onModalShellOpeningComplete`. */
  galleryOpeningBitmap?: ImageBitmap | null;
  /** When true, the bitmap layer is hidden so the repositioned iframe can cover the slot. */
  suppressGalleryOpeningBitmap?: boolean;
  /** Fires when the modal backdrop has finished opening (opacity in). Parent then enables iframe positioning. */
  onModalShellOpeningComplete?: () => void;
  /**
   * When true (deferred preload gallery, no opening bitmap), notify shell ready after layout (~2 rAF) instead of
   * waiting for opacity transitionend / fallback timer so the iframe tracks the modal open on mobile.
   */
  earlyShellReadyForDeferredGallery?: boolean;
}

export const ConfiguratorModal: React.FC<ConfiguratorModalProps> = ({
  isOpen,
  onClose,
  children,
  useGallerySlot = false,
  galleryOpeningBitmap = null,
  suppressGalleryOpeningBitmap = false,
  onModalShellOpeningComplete,
  earlyShellReadyForDeferredGallery = false,
}) => {
  const {
    shareDialogTrigger,
    isMobile,
    variantDisplayStyleOverlay,
    variantDisplayStyleOverlayMobile,
    shadowDOMs,
  } = useOV25UI();
  const effectiveOverlayStyle = isMobile ? variantDisplayStyleOverlayMobile : variantDisplayStyleOverlay;
  const isShareDialogOpen = shareDialogTrigger !== 'none';
  const modalRef = useRef<HTMLDivElement>(null);
  const modalGallerySlotRef = useRef<HTMLDivElement>(null);
  const portalTarget = shadowDOMs?.modalPortal ?? document.body;

  const [mounted, setMounted] = useState(false);
  const [overlayOpaque, setOverlayOpaque] = useState(false);
  const earlyShellNotifiedRef = useRef(false);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  useLayoutEffect(() => {
    if (!isOpen) {
      earlyShellNotifiedRef.current = false;
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    if (isOpen) {
      setMounted(true);
      setOverlayOpaque(false);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setOverlayOpaque(true));
      });
    } else {
      setOverlayOpaque(false);
    }
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [isOpen]);

  const handleBackdropTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== 'opacity') return;
    if (!isOpen) {
      setMounted(false);
      return;
    }
    if (overlayOpaque) {
      if (earlyShellReadyForDeferredGallery && earlyShellNotifiedRef.current) return;
      if (earlyShellReadyForDeferredGallery) earlyShellNotifiedRef.current = true;
      onModalShellOpeningComplete?.();
    }
  };

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

  useEffect(() => {
    if (!isOpen || !overlayOpaque || !onModalShellOpeningComplete) return;
    if (earlyShellReadyForDeferredGallery) return;
    const id = window.setTimeout(() => {
      onModalShellOpeningComplete();
    }, TRANSITION_MODAL_OVERLAY_IN_MS + 120);
    return () => window.clearTimeout(id);
  }, [isOpen, overlayOpaque, onModalShellOpeningComplete, earlyShellReadyForDeferredGallery]);

  useEffect(() => {
    if (!earlyShellReadyForDeferredGallery || !isOpen || !overlayOpaque || !onModalShellOpeningComplete) return;
    if (earlyShellNotifiedRef.current) return;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!isOpenRef.current || earlyShellNotifiedRef.current) return;
        earlyShellNotifiedRef.current = true;
        onModalShellOpeningComplete();
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [earlyShellReadyForDeferredGallery, isOpen, overlayOpaque, onModalShellOpeningComplete]);

  const showGalleryBitmap =
    useGallerySlot &&
    galleryOpeningBitmap &&
    !suppressGalleryOpeningBitmap;

  const leftArea = useGallerySlot ? (
    <div
      ref={modalGallerySlotRef}
      id={MODAL_GALLERY_SLOT_ID}
      className="ov:relative ov:w-full ov:h-full ov:min-h-0"
    >
      {showGalleryBitmap ? (
        <ModalGalleryOpeningBitmap bitmap={galleryOpeningBitmap} slotRef={modalGallerySlotRef} />
      ) : null}
      <span className="ov:sr-only" aria-hidden />
    </div>
  ) : (
    <div className="ov:w-full ov:h-full">{children}</div>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      ref={modalRef}
      className={cn(
        'ov:fixed ov:inset-0 ov:z-2147483646 ov:bg-black/50 ov:flex ov:items-start ov:justify-center',
        isMobile ? 'ov:p-2' : 'ov:p-4'
      )}
      style={{
        opacity: overlayOpaque ? 1 : 0,
        transitionProperty: 'opacity',
        transitionDuration: `${overlayOpaque ? TRANSITION_MODAL_OVERLAY_IN_MS : TRANSITION_MODAL_OVERLAY_OUT_MS}ms`,
        transitionTimingFunction: TRANSITION_PROXY_CLOSE_EASING,
        pointerEvents: overlayOpaque ? 'auto' : 'none',
      }}
      onTransitionEnd={handleBackdropTransitionEnd}
      onClick={handleBackdropClick}
      tabIndex={-1}
    >
      <div
        className={cn(
          'ov:relative ov:bg-transparent ov:shadow-xl ov:rounded-3xl',
          isMobile
            ? 'ov:w-full ov:h-full ov:max-w-none'
            : 'ov:box-border ov:h-full ov:min-w-0 ov:w-[min(90vw,1980px)] ov:max-w-full'
        )}
      >
        <div
          className={cn(
            'ov:relative ov:h-full ov:flex ov:min-w-0 ov:w-full ov:rounded-3xl',
            isMobile ? 'ov:flex-col' : 'ov:flex-row'
          )}
          style={{ clipPath: 'inset(0 round 1.5rem)' }}
        >
          <VariantsCloseButton
            onClick={onClose}
            ariaLabel="Close modal"
            className={cn('ov:z-101', isShareDialogOpen && 'ov:opacity-0 ov:pointer-events-none')}
          />

          <div
            className={cn(
              'ov:relative ov:flex ov:items-stretch ov:min-w-0',
              isMobile ? 'ov:flex-col ov:w-full ov:h-full ov:min-h-0' : 'ov:flex-row ov:flex-1 ov:h-full ov:min-w-0 ov:w-full'
            )}
          >
            <div
              className={cn(
                isMobile ? 'ov:w-full ov:h-[40vh] ov:shrink-0' : 'ov:flex-1 ov:min-w-0 ov:h-full'
              )}
            >
              {leftArea}
            </div>
            <div
              data-ov25-variants-panel
              data-ov25-variants-panel-layout="modal"
              className={cn(
                'ov:z-102 ov:bg-white ov:overflow-y-auto',
                isMobile
                  ? 'ov:w-full ov:flex-1 ov:min-h-0 ov:border-t ov:border-gray-200'
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
        </div>
      </div>
    </div>,
    portalTarget
  );
};
