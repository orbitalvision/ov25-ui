import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils.js';
import { ConfiguratorModal } from './ConfiguratorModal.js';
import { ProductGallery } from './product-gallery.js';
import ConfiguratorViewControls from './ConfiguratorViewControls.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { ProductVariantsWrapper } from './VariantSelectMenu/ProductVariantsWrapper.js';
import { MobileCheckoutButton } from './VariantSelectMenu/MobileCheckoutButton.js';
import { TwoStageDrawer } from './ui/two-stage-drawer.js';
import { closeModuleSelectMenu, DRAWER_HEIGHT_RATIO, IFRAME_HEIGHT_RATIO } from '../utils/configurator-utils.js';
import { createPortal } from 'react-dom';

export const Snap2ConfigureButton: React.FC = () => {
  const { isVariantsOpen, isModalOpen, setIsModalOpen, setIsVariantsOpen, isMobile, allOptions, setActiveOptionId, setShareDialogTrigger, shareDialogTrigger, isSnap2Mode, drawerSize, setDrawerSize, configuratorState, skipNextDrawerCloseRef } = useOV25UI();
  const [shouldRenderIframe, setShouldRenderIframe] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);

  // Auto-open drawer once options are loaded
  useEffect(() => {
    if (pendingOpen && allOptions.length > 0 && !isVariantsOpen) {
      setActiveOptionId(allOptions[0].id);
      setIsVariantsOpen(true);
      setPendingOpen(false);
    }
  }, [pendingOpen, allOptions, isVariantsOpen, setActiveOptionId, setIsVariantsOpen]);

  // Clean up iframe on mobile when variants close and share dialog is not active
  useEffect(() => {
    if (isMobile && !isVariantsOpen && shareDialogTrigger === 'none') {
      setShouldRenderIframe(false);
    }
  }, [isMobile, isVariantsOpen, shareDialogTrigger]);

  const handleMobileDrawerClose = (open: boolean) => {
    if (!open) {
      setPendingOpen(false);
      
      // If this is a programmatic close from save dialog, skip the save dialog trigger
      if (skipNextDrawerCloseRef.current) {
        skipNextDrawerCloseRef.current = false;
        setShouldRenderIframe(false);
        setIsVariantsOpen(false);
        return;
      }
      
      // TwoStageDrawer will automatically set isDrawerOrDialogOpen to false
      if (isSnap2Mode && shareDialogTrigger === 'none' && (configuratorState?.snap2Objects?.length ?? 0) > 0) {
        // Trigger save dialog, but keep iframe rendered until save dialog closes
        setShareDialogTrigger('modal-close');
      } else {
        setShouldRenderIframe(false);
        setIsVariantsOpen(false);
      }
    } else {
      setIsVariantsOpen(open);
    }
  };

  const handleClick = () => {
    if (isMobile) {
      // On mobile, create iframe and open the variants drawer
      // TwoStageDrawer will automatically manage isDrawerOrDialogOpen state
      setShouldRenderIframe(true);
      if (allOptions.length > 0) {
        setActiveOptionId(allOptions[0].id);
        setIsVariantsOpen(true);
      } else {
        setPendingOpen(true);
      }
    } else {
      // On desktop, open the modal
      setIsModalOpen(true);
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
    
    // Only show save dialog for snap2 configurators with a configuration (has snap2Objects)
    if (isSnap2Mode && (configuratorState?.snap2Objects?.length ?? 0) > 0) {
      setShareDialogTrigger('modal-close');
    } else {
      setIsModalOpen(false);
      setIsVariantsOpen(false);
    }
  };

  return (
    <>
      <button 
        className={cn('ov25-configure-button ov:p-3 ov:py-2 ov:my-2 ov:cursor-pointer ov:bg-white ov:text-black ov:border ov:rounded-md ov:border-[var(--ov25-border-color)]')}
        onClick={handleClick}
      >
        Configure
      </button>
      
      {/* Render iframe on mobile when needed */}
      {isMobile && shouldRenderIframe && createPortal(
        <>
          <div className="ov:fixed ov:inset-0 ov:w-full ov:h-full ov:z-[2147483646]">
            <ProductGallery />
          </div>
          <div 
            className="ov:fixed ov:top-0 ov:left-0 ov:w-full ov:z-[2147483646] ov:pointer-events-none ov:transition-[height] ov:duration-500"
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
      
      {/* Always render drawer on mobile (just keep it closed until needed) */}
      {isMobile && (
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
      {!isMobile && (
        <ConfiguratorModal isOpen={isModalOpen} onClose={handleCloseModal}>
          <div className="ov:relative ov:w-full ov:h-full ov:flex">
            {/* Main content area */}
            <div className={cn(
              "ov:relative ov:flex-1 ov:transition-all ov:duration-300",
              isVariantsOpen ? "ov:w-[calc(100%-384px)]" : "ov:w-full"
            )}>
              <ProductGallery isInModal={isModalOpen} />
              <ConfiguratorViewControls />
            </div>
            
            {/* Variants panel - only shown when variants are open */}
            {isVariantsOpen && (
              <div className="ov:w-[384px] ov:h-full ov:bg-white ov:border-l ov:border-gray-200 ov:overflow-y-auto">
                <ProductVariantsWrapper />
              </div>
            )}
          </div>
        </ConfiguratorModal>
      )}
    </>
  );
};

