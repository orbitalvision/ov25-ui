import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils.js';
import { Snap2ConfiguratorModal } from './Snap2ConfiguratorModal.js';
import { ProductGallery } from './product-gallery.js';
import ConfiguratorViewControls from './ConfiguratorViewControls.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { ProductVariantsWrapper } from './VariantSelectMenu/ProductVariantsWrapper.js';
import { MobileCheckoutButton } from './VariantSelectMenu/MobileCheckoutButton.js';
import { MobileDrawer } from './ui/mobile-drawer.js';
import { InitialiseMenu } from './VariantSelectMenu/InitialiseMenu.js';
import { VariantsCloseButton } from './VariantSelectMenu/VariantsCloseButton.js';
import { closeModuleSelectMenu, DRAWER_HEIGHT_RATIO, IFRAME_HEIGHT_RATIO } from '../utils/configurator-utils.js';
import { createPortal } from 'react-dom';
import { ConfigureButton } from './ConfigureButton.js';

export const Snap2ConfigureUI: React.FC = () => {
  const { isVariantsOpen, isModalOpen, setIsModalOpen, setIsVariantsOpen, isMobile, allOptions, activeOptionId, setActiveOptionId, setShareDialogTrigger, shareDialogTrigger, isSnap2Mode, drawerSize, setDrawerSize, configuratorState, skipNextDrawerCloseRef, setCompatibleModules, setConfiguratorState, setPreloading, preloading, iframeResetKey, resetIframe } = useOV25UI();
  const [shouldRenderIframe, setShouldRenderIframe] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const hasInitializedMobileRef = React.useRef(false);

  const hasSnap2Objects = (configuratorState?.snap2Objects?.length ?? 0) > 0;
  const showModuleSelect = activeOptionId === 'modules' && !hasSnap2Objects;

  useEffect(() => {
    if (isMobile && !hasInitializedMobileRef.current) {
      hasInitializedMobileRef.current = true;
      setShouldRenderIframe(true);
      setIsVariantsOpen(false);
    }
  }, [isMobile, setIsVariantsOpen]);

  useEffect(() => {
    if (pendingOpen && allOptions.length > 0 && !isVariantsOpen) {
      setActiveOptionId(allOptions[0].id);
      setIsVariantsOpen(true);
      setPendingOpen(false);
    }
  }, [pendingOpen, allOptions, isVariantsOpen, setActiveOptionId, setIsVariantsOpen]);

  const handleMobileDrawerClose = (open: boolean) => {
    if (!open) {
      setPendingOpen(false);
      setPreloading(false);

      if (skipNextDrawerCloseRef.current) {
        skipNextDrawerCloseRef.current = false;
        setIsVariantsOpen(false);
        return;
      }

      if (isSnap2Mode && shareDialogTrigger === 'none' && hasSnap2Objects) {
        setShareDialogTrigger('modal-close');
      } else {
        setIsVariantsOpen(false);
      }
    } else {
      setIsVariantsOpen(open);
    }
  };

  const handleCloseModal = () => {
    if (shareDialogTrigger !== 'none') {
      return;
    }

    if (isVariantsOpen) {
      closeModuleSelectMenu();
    }

    const shouldShowSaveDialog = isSnap2Mode && hasSnap2Objects;

    if (!shouldShowSaveDialog) {
      setIsModalOpen(false);
      setIsVariantsOpen(false);
      setCompatibleModules(null);
      setConfiguratorState(undefined);
      resetIframe();
    } else {
      setShareDialogTrigger('modal-close');
    }
  };

  return (
    <>
      {isMobile && shouldRenderIframe && createPortal(
        <>
          <div className={cn(
            "ov:fixed ov:inset-0 ov:w-full ov:h-full ov:z-[2147483644]",
            (!isVariantsOpen || showModuleSelect) && "ov:opacity-0 ov:pointer-events-none"
          )}>
            <ProductGallery key={`gallery-${iframeResetKey}`} isInModal={false} isPreloading={preloading} />
          </div>
          <div
            className={cn(
              "ov:fixed ov:top-0 ov:left-0 ov:w-full ov:z-[2147483644] ov:pointer-events-none ov:transition-[height] ov:duration-500",
              (!isVariantsOpen || showModuleSelect) && "ov:opacity-0 ov:pointer-events-none"
            )}
            style={{
              height: drawerSize === 'large'
                ? `${typeof window !== 'undefined' ? window.innerHeight * IFRAME_HEIGHT_RATIO : 0}px`
                : `${typeof window !== 'undefined' ? window.innerHeight * DRAWER_HEIGHT_RATIO : 0}px`
            }}
          >
            <ConfiguratorViewControls />
          </div>
        </>,
        document.body
      )}

      {isMobile && isVariantsOpen && showModuleSelect && createPortal(
        <div className="ov:fixed ov:inset-0 ov:z-[2147483645] ov:flex ov:flex-col ov:bg-[var(--ov25-background-color)] ov:pt-[env(safe-area-inset-top)]">
          <VariantsCloseButton className="ov:!top-[max(0.5rem,env(safe-area-inset-top))] ov:!right-3" />
          <div className="ov:flex-1 ov:min-h-0 ov:overflow-y-auto ov:px-2 ov:pb-[env(safe-area-inset-bottom)]">
            <InitialiseMenu />
          </div>
        </div>,
        document.body
      )}

      {isMobile && hasSnap2Objects && (
        <MobileDrawer
          isOpen={isVariantsOpen}
          onOpenChange={handleMobileDrawerClose}
          onStateChange={(value: number) => setDrawerSize(value === 0 ? 'closed' : value === 1 ? 'small' : 'large')}
          className="ov:z-[10]"
        >
          <div className="ov:w-full ov:h-full ov:flex ov:flex-col ov:absolute ov:top-0 ov:left-0 ov:pointer-events-auto">
            <ProductVariantsWrapper />
            <div className={cn(drawerSize === 'large' || drawerSize === 'small' ? 'ov:fixed ov:bottom-0 ov:left-0 ov:w-full' : '')}>
              <MobileCheckoutButton />
            </div>
          </div>
        </MobileDrawer>
      )}

      {!isMobile && (
        <Snap2ConfiguratorModal isOpen={isModalOpen} onClose={handleCloseModal}>
          <div className={cn(
            "ov:relative ov:w-full ov:h-full ov:flex",
            !isModalOpen && "ov:hidden"
          )}>
            <div className="ov:relative ov:flex-1 ov:min-h-0">
              <ProductGallery key={`gallery-${iframeResetKey}`} isInModal={isModalOpen} isPreloading={preloading} />
              <ConfiguratorViewControls />
            </div>
          </div>
        </Snap2ConfiguratorModal>
      )}
    </>
  );
};

export const Snap2ConfigureButton: React.FC = () => {
  const { configureHandlerRef } = useOV25UI();

  return (
    <>
      <ConfigureButton onClick={() => configureHandlerRef.current?.()} />
      <Snap2ConfigureUI />
    </>
  );
};

