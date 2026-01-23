import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils.js';
import { ConfiguratorModal } from './ConfiguratorModal.js';
import { ProductGallery } from './product-gallery.js';
import ConfiguratorViewControls from './ConfiguratorViewControls.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { ProductVariantsWrapper } from './VariantSelectMenu/ProductVariantsWrapper.js';
import { MobileCheckoutButton } from './VariantSelectMenu/MobileCheckoutButton.js';
import { TwoStageDrawer } from './ui/two-stage-drawer.js';
import { InitialiseMenu } from './VariantSelectMenu/InitialiseMenu.js';
import { closeModuleSelectMenu, DRAWER_HEIGHT_RATIO, IFRAME_HEIGHT_RATIO } from '../utils/configurator-utils.js';
import { createPortal } from 'react-dom';

export const Snap2ConfigureUI: React.FC = () => {
  const { isVariantsOpen, isModalOpen, setIsModalOpen, setIsVariantsOpen, isMobile, allOptions, activeOptionId, setActiveOptionId, setShareDialogTrigger, shareDialogTrigger, isSnap2Mode, drawerSize, setDrawerSize, configuratorState, skipNextDrawerCloseRef, setCompatibleModules, setConfiguratorState, setPreloading, preloading, iframeResetKey, resetIframe } = useOV25UI();
  const [shouldRenderIframe, setShouldRenderIframe] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);

  // Preload iframe on component mount for mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setShouldRenderIframe(true);
      setIsVariantsOpen(false);
    }
  }, [setIsVariantsOpen]);

  // Auto-open drawer once options are loaded
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
      
      // If this is a programmatic close from save dialog, skip the save dialog trigger
      if (skipNextDrawerCloseRef.current) {
        skipNextDrawerCloseRef.current = false;
        setIsVariantsOpen(false);
        return;
      }
      
      // TwoStageDrawer will automatically set isDrawerOrDialogOpen to false
      if (isSnap2Mode && shareDialogTrigger === 'none' && (configuratorState?.snap2Objects?.length ?? 0) > 0) {
        // Trigger save dialog, but keep iframe rendered until save dialog closes
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
    
    // If variants panel is open and showing modules, send close message to iframe
    if (isVariantsOpen) {
      closeModuleSelectMenu();
    }
    
    // Check if we should show save dialog BEFORE clearing state
    const shouldShowSaveDialog = isSnap2Mode && (configuratorState?.snap2Objects?.length ?? 0) > 0;

    if (!shouldShowSaveDialog) {
      setIsModalOpen(false);
      resetIframe();
    }
    setIsVariantsOpen(false);
    setCompatibleModules(null);
    setConfiguratorState(undefined);

    if (shouldShowSaveDialog) {
      setShareDialogTrigger('modal-close');
    }
  };

  return (
    <>
      {/* Render iframe on mobile when needed (hidden during initial module selection). z-index 2147483644 is max - 3 */}
      {window.innerWidth < 1024 && shouldRenderIframe && createPortal(
        <>
          <div className={cn(
            "ov:fixed ov:inset-0 ov:w-full ov:h-full ov:z-2147483644",
            (!isVariantsOpen || (activeOptionId === 'modules' && (!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0))) && "ov:opacity-0 ov:pointer-events-none"
          )}>
            <ProductGallery key={`gallery-${iframeResetKey}`} isInModal={false} isPreloading={preloading} />
          </div>
          <div 
            className={cn(
              "ov:fixed ov:top-0 ov:left-0 ov:w-full ov:z-2147483644 ov:pointer-events-none ov:transition-[height] ov:duration-500",
              (!isVariantsOpen || (activeOptionId === 'modules' && (!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0))) && "ov:opacity-0 ov:pointer-events-none"
            )}
            style={{ 
              height: drawerSize === 'large' 
                ? `${window.innerHeight * IFRAME_HEIGHT_RATIO}px` 
                : `${window.innerHeight * DRAWER_HEIGHT_RATIO}px`
            }}
          >
            <ConfiguratorViewControls />
          </div>
        </>,
        document.body
      )}
      
      {/* Fullscreen initial module selection for mobile */}
      {window.innerWidth < 1024 && isVariantsOpen && activeOptionId === 'modules' && (!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0) && createPortal(
        <div className="ov:fixed ov:inset-0 ov:z-[20] ov:bg-white">
          <InitialiseMenu />
        </div>,
        document.body
      )}

      {/* Only render drawer on mobile when there are snap2Objects */}
      {window.innerWidth < 1024 && (configuratorState?.snap2Objects?.length ?? 0) > 0 && (
        <TwoStageDrawer
          isOpen={isVariantsOpen}
          onOpenChange={handleMobileDrawerClose}
          onStateChange={(value: any) => setDrawerSize(value === 0 ? 'closed' : value === 1 ? 'small' : 'large')}
          className="ov:z-[10]"
        >
          <div className='ov:w-full ov:h-full ov:flex ov:flex-col ov:absolute ov:top-0 ov:left-0 ov:pointer-events-auto'>
            <ProductVariantsWrapper />
            <div className={`${drawerSize === 'large' || drawerSize === 'small' ? 'ov:fixed ov:bottom-0 ov:left-0 ov:w-full' : '' }`}>
              <MobileCheckoutButton />
            </div>
          </div>
        </TwoStageDrawer>
      )}
      
      {/* Only show modal on desktop */}
      {window.innerWidth >= 1024 && (
        <ConfiguratorModal isOpen={isModalOpen} onClose={handleCloseModal}>
          <div className={cn(
            "ov:relative ov:w-full ov:h-full ov:flex",
            !isModalOpen && "ov:hidden"
          )}>
            {/* Main content area - always full width since variants are in modal */}
            <div className="ov:relative ov:flex-1 ov:min-h-0">
              <ProductGallery key={`gallery-${iframeResetKey}`} isInModal={isModalOpen} isPreloading={preloading} />
              <ConfiguratorViewControls />
            </div>
          </div>
        </ConfiguratorModal>
      )}
    </>
  );
};

export const Snap2ConfigureButton: React.FC = () => {
  const { configureHandlerRef } = useOV25UI();

  return (
    <>
      <button 
        id="ov25-configure-button"
        className={cn('ov25-configure-button ov:p-3 ov:py-2 ov:my-2 ov:cursor-pointer ov:bg-white ov:text-black ov:border ov:rounded-md ov:border-[var(--ov25-border-color)]')}
        onClick={() => configureHandlerRef.current?.()}
      >
        Configure
      </button>
      <Snap2ConfigureUI />
    </>
  );
};

