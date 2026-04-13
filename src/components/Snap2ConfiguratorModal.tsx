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
import { Snap2SettingsSheet } from './Snap2SettingsSheet.js';
import { Snap2CheckoutSheetBody, Snap2CheckoutSheetFooter } from './Snap2CheckoutSheet.js';
import { Ov25ShadowHost } from './Ov25ShadowHost.js';
import { findElementByIdInShadowOrRegularDOM } from '../utils/configurator-dom-queries.js';

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
    isSnap2CheckoutSheetOpen,
    setIsSnap2CheckoutSheetOpen,
    hidePricing,
    disableAddToCart,
    addToBasketFunction,
    buyNowFunction,
  } = useOV25UI();
  const effectiveOverlayStyle = isMobile ? variantDisplayStyleOverlayMobile : variantDisplayStyleOverlay;
  const isShareDialogOpen = shareDialogTrigger !== 'none';
  const hasSnap2Checkout =
    (typeof addToBasketFunction === 'function' && !disableAddToCart) ||
    typeof buyNowFunction === 'function';
  const showSnap2CheckoutRail = hasSnap2Checkout && !hidePricing;
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
      if (isSnap2CheckoutSheetOpen) {
        setIsSnap2CheckoutSheetOpen(false);
        return;
      }
      if (isVariantsOpen) {
        setIsVariantsOpen(false);
      } else {
        onClose();
      }
    },
    [
      isOpen,
      isSnap2CheckoutSheetOpen,
      setIsSnap2CheckoutSheetOpen,
      isVariantsOpen,
      setIsVariantsOpen,
      onClose,
    ]
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

  const controlsHost = findElementByIdInShadowOrRegularDOM(
    uniqueId ? `true-configurator-view-controls-container-${uniqueId}` : 'true-configurator-view-controls-container'
  );
  const initialiseMenuPortalParent = controlsHost?.parentElement ?? document.body;

  return createPortal(
    <Ov25ShadowHost
      ref={modalRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483646,
        opacity: overlayOpaque ? 1 : 0,
        transitionProperty: 'opacity',
        transitionDuration: `${overlayOpaque ? TRANSITION_MODAL_OVERLAY_IN_MS : TRANSITION_MODAL_OVERLAY_OUT_MS}ms`,
        transitionTimingFunction: TRANSITION_PROXY_CLOSE_EASING,
        pointerEvents: overlayOpaque ? 'auto' : 'none',
      }}
      onTransitionEnd={handleBackdropTransitionEnd}
      tabIndex={-1}
    >
      <div
        className={cn(
          'ov:flex ov:flex-row ov:items-start ov:justify-center ov:p-4',
          'ov:w-full ov:h-full ov:min-h-0 ov:box-border ov:bg-black/50'
        )}
        onClick={handleBackdropClick}
      >
        <div
          className={cn(
            'ov:relative ov:bg-transparent ov:rounded-3xl ov:shadow-xl',
            'ov:w-auto ov:h-full ov:max-w-[1980px] ov:max-h-none'
          )}
        >
          <div
            ref={setPortalTargetEl}
            className="ov:relative ov:w-[min(90vw,1980px)] ov:h-full ov:flex ov:rounded-3xl"
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

            <Snap2SettingsSheet
              mode="modal"
              open={Boolean(overlayOpaque && isVariantsOpen)}
              onOpenChange={setIsVariantsOpen}
              sheetZClass="ov:z-102"
              showCloseButton={false}
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
            </Snap2SettingsSheet>

            {showSnap2CheckoutRail ? (
              <Snap2SettingsSheet
                mode="modal"
                open={Boolean(overlayOpaque && isSnap2CheckoutSheetOpen)}
                onOpenChange={setIsSnap2CheckoutSheetOpen}
                sheetZClass="ov:z-[110]"
                className="ov:bg-neutral-100"
                role="dialog"
                aria-modal
                aria-labelledby="ov25-snap2-checkout-sheet-title"
                id="ov25-snap2-checkout-sheet"
                footer={
                  <Snap2CheckoutSheetFooter
                    onRequestClose={() => setIsSnap2CheckoutSheetOpen(false)}
                  />
                }
              >
                <Snap2CheckoutSheetBody />
              </Snap2SettingsSheet>
            ) : null}

            {portalTargetEl && <ModuleBottomPanel portalTarget={portalTargetEl} />}

            {(!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0) &&
              (isProductGalleryStacked ? (
                createPortal(
                  <Ov25ShadowHost
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 103,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'auto',
                    }}
                  >
                    <div className="ov:absolute ov:inset-0 ov:z-[103] ov:bg-[var(--ov25-background-color)]">
                      <InitialiseMenu />
                    </div>
                  </Ov25ShadowHost>,
                  initialiseMenuPortalParent
                )
              ) : (
                <div className="ov:absolute ov:inset-0 ov:z-[103] ov:bg-[var(--ov25-background-color)]">
                  <InitialiseMenu />
                </div>
              ))}
          </div>
        </div>
      </div>
    </Ov25ShadowHost>,
    portalTarget
  );
};
