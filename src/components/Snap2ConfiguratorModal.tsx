import React, { useRef, useEffect, useLayoutEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import {
  TRANSITION_MODAL_OVERLAY_IN_MS,
  TRANSITION_MODAL_OVERLAY_OUT_MS,
  TRANSITION_PROXY_CLOSE_EASING,
} from '../lib/config/iframe-transition-snapshot.js';
import { ProductVariantsWrapper } from './VariantSelectMenu/ProductVariantsWrapper.js';
import { WizardVariants } from './VariantSelectMenu/WizardVariants.js';
import { VariantsHeader } from './VariantSelectMenu/VariantsHeader.js';
import { ModuleBottomPanel } from './VariantSelectMenu/ModuleBottomPanel.js';
import { VariantsCloseButton } from './VariantSelectMenu/VariantsCloseButton.js';
import InitialiseMenu from './VariantSelectMenu/InitialiseMenu.js';

interface Snap2ConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Desktop Snap2 shell: self-contained modal (gallery + absolute variants column + module panel / InitialiseMenu).
 * Kept separate from ConfiguratorModal so standard iframe-slot behavior does not share layout with Snap2.
 */
export const Snap2ConfiguratorModal: React.FC<Snap2ConfiguratorModalProps> = ({ isOpen, onClose, children }) => {
  const {
    shareDialogTrigger,
    configuratorState,
    isProductGalleryStacked,
    uniqueId,
    isMobile,
    variantDisplayStyleOverlay,
    variantDisplayStyleOverlayMobile,
    shadowDOMs,
    isVariantsOpen,
    setIsVariantsOpen,
  } = useOV25UI();
  const effectiveOverlayStyle = isMobile ? variantDisplayStyleOverlayMobile : variantDisplayStyleOverlay;
  const isShareDialogOpen = shareDialogTrigger !== 'none';
  const modalRef = useRef<HTMLDivElement>(null);
  const portalTarget = shadowDOMs?.modalPortal ?? document.body;
  const [portalTargetEl, setPortalTargetEl] = useState<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [overlayOpaque, setOverlayOpaque] = useState(false);

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
    if (!isOpen) setMounted(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;
      if (isVariantsOpen) {
        setIsVariantsOpen(false);
      } else {
        onClose();
      }
    },
    [isOpen, isVariantsOpen, setIsVariantsOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      ref={modalRef}
      className={cn(
        'ov:fixed ov:inset-0 ov:z-2147483646 ov:bg-black/50 ov:flex ov:flex-row ov:items-start ov:justify-center',
        'ov:p-4'
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
          'ov:relative ov:bg-transparent ov:rounded-3xl ov:shadow-xl',
          'ov:w-auto ov:h-full ov:max-w-[1980px] ov:max-h-none'
        )}
      >
        <div
          ref={setPortalTargetEl}
          className="ov:relative ov:w-[90vw] ov:h-full ov:flex ov:rounded-3xl"
          style={{ clipPath: 'inset(0 round 1.5rem)' }}
        >
          <VariantsCloseButton
            onClick={onClose}
            ariaLabel="Close modal"
            className={cn('ov:z-101', isShareDialogOpen && 'ov:opacity-0 ov:pointer-events-none')}
          />

          <div className="ov:relative ov:flex ov:items-stretch ov:justify-stretch ov:flex-1 ov:h-full ov:min-h-0 ov:min-w-0 ov:w-full">
            <div className="ov:w-full ov:h-full ov:min-h-0 ov:min-w-0">{children}</div>
          </div>

          <div
            data-ov25-snap2-variants-panel
            data-open={overlayOpaque && isVariantsOpen ? 'true' : 'false'}
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

          {(!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0) &&
            (isProductGalleryStacked ? (
              createPortal(
                <div className="ov:absolute ov:inset-0 ov:z-[103] ov:bg-[var(--ov25-background-color)]">
                  <InitialiseMenu />
                </div>,
                document.getElementById(
                  uniqueId ? `true-configurator-view-controls-container-${uniqueId}` : 'true-configurator-view-controls-container'
                )?.parentElement ?? document.body
              )
            ) : (
              <div className="ov:absolute ov:inset-0 ov:z-[103] ov:bg-[var(--ov25-background-color)]">
                <InitialiseMenu />
              </div>
            ))}
        </div>
      </div>
    </div>,
    portalTarget
  );
};
