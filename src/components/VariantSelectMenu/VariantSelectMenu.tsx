import React, { useEffect, useRef } from 'react';
import { MobileDrawer } from ".././ui/mobile-drawer.js";
import { useOV25UI } from "../../contexts/ov25-ui-context.js";
import { VariantDisplayStyleOverlay } from '../../types/config-enums.js';
import { ProductOptionsGroup } from "./ProductOptions.js";
import { MobilePriceOverlay } from "../mobile-price-overlay.js";
import { VariantContentDesktop } from './VariantContentDesktop.js';
import { ModalConfiguratorDesktop } from './ModalConfiguratorDesktop.js';
import { VariantsOnlySheet } from './VariantsOnlySheet.js';
import { ProductVariantsWrapper } from './ProductVariantsWrapper.js';
import { Snap2Wrapper } from './Snap2Wrapper.js';
import { MobileCheckoutButton } from './MobileCheckoutButton.js';
import { WizardVariants } from './WizardVariants.js';
import { VariantsHeader } from './VariantsHeader.js';
import { ConfigureButton } from '../ConfigureButton.js';

// Types
export type DrawerSizes = 'closed' | 'small' | 'large';

/* Renders either the trigger area (configure button or options) or inline wizard/list/options when there's no configure button. */
/* also renders the mobile drawer or desktop sheet/fullscreen content when the modal is closed. */
export const VariantSelectMenu: React.FC = () => {
  
  const {
    isVariantsOpen,
    setIsVariantsOpen,
    isMobile,
    setDrawerSize,
    drawerSize,
    allOptions,
    handleOptionClick,
    range,
    getSelectedValue,
    isModalOpen,
    hasConfigureButton,
    setShareDialogTrigger,
    isSnap2Mode,
    useInlineVariantControls,
    useSimpleVariantsSelector,
    configuratorDisplayMode,
    configuratorDisplayModeMobile,
    configuratorTriggerStyle,
    variantDisplayStyleMobile,
    variantDisplayStyleInline,
    variantDisplayStyleInlineMobile,
    openConfiguratorOrSnap2,
    configuratorState,
  } = useOV25UI();


  useEffect(() => {
    if (useInlineVariantControls && isSnap2Mode) {
      setIsVariantsOpen(true);
    }
  }, [useInlineVariantControls, isSnap2Mode, setIsVariantsOpen]);

  const handleMobileDrawerClose = (open: boolean) => {
    if (!open && hasConfigureButton && isMobile && isSnap2Mode) {
      console.log('[VariantSelectMenu] handleMobileDrawerClose - setShareDialogTrigger(modal-close)');
      setShareDialogTrigger('modal-close');
    } else {
      setIsVariantsOpen(open);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const listLikeInline: VariantDisplayStyleOverlay[] = [
    VariantDisplayStyleOverlay.List,
    VariantDisplayStyleOverlay.Tabs,
    VariantDisplayStyleOverlay.Accordion,
    VariantDisplayStyleOverlay.Tree,
  ];
  const effectiveVariantDisplayStyleInline = isMobile ? variantDisplayStyleInlineMobile : variantDisplayStyleInline;
  const isInlineListLike = useInlineVariantControls && listLikeInline.includes(effectiveVariantDisplayStyleInline);
  const isInlineWizard = useInlineVariantControls && effectiveVariantDisplayStyleInline === 'wizard';
  const isInlineTall = isInlineListLike || isInlineWizard;
  const useTriggerArea = useSimpleVariantsSelector && (!useInlineVariantControls || (!isInlineWizard && !isInlineListLike));

  const hasSnap2Objects = (configuratorState?.snap2Objects?.length ?? 0) > 0;
  const snap2InlineGalleryShowingInitialise =
    isSnap2Mode &&
    !isMobile &&
    configuratorDisplayMode === 'inline' &&
    !isModalOpen &&
    !hasSnap2Objects;
  const holdVariantsPanelForSnap2Initialise =
    useInlineVariantControls && snap2InlineGalleryShowingInitialise;

  useEffect(() => {
    const aside = containerRef.current?.getRootNode() instanceof ShadowRoot
      ? (containerRef.current.getRootNode() as ShadowRoot).host.closest('#ov25-aside-menu')
      : containerRef.current?.closest('#ov25-aside-menu');
    if (aside) {
      if (isInlineTall) {
        aside.setAttribute('data-ov25-inline-list', 'true');
      } else {
        aside.removeAttribute('data-ov25-inline-list');
      }
    }
    return () => aside?.removeAttribute('data-ov25-inline-list');
  }, [isInlineTall]);

  const inlineTallWrapperClass = 'ov:flex-1 ov:min-h-0 ov:h-full ov:flex ov:flex-col ov:overflow-hidden';
  const productOptionsGroupProps = { allOptions, handleOptionClick, range, getSelectedValue };

  /** Trigger area (configure button or options) when useTriggerArea; otherwise inline wizard/list/options when there's no configure button. */
  const renderTriggerOrInlineVariants = () => {
    if (useTriggerArea) {
      return configuratorTriggerStyle === 'single-button'
        ? <ConfigureButton onClick={openConfiguratorOrSnap2} />
        : <ProductOptionsGroup {...productOptionsGroupProps} />;
    }
    if (!hasConfigureButton) {
      if (isInlineWizard) return <div className={inlineTallWrapperClass}><WizardVariants mode="inline" /></div>;
      if (isInlineListLike) return <div className={inlineTallWrapperClass}>{isSnap2Mode ? <Snap2Wrapper isInline /> : <ProductVariantsWrapper isInline />}</div>;
      return <ProductOptionsGroup {...productOptionsGroupProps} />;
    }
    return null;
  };

  const renderMobile = () => {
    if (useInlineVariantControls) {
      if (!hasConfigureButton) return null;
      if (isInlineWizard) return <div className={inlineTallWrapperClass}><WizardVariants mode="inline" /></div>;
      if (isInlineListLike) return <div className={inlineTallWrapperClass}>{isSnap2Mode ? <Snap2Wrapper isInline /> : <ProductVariantsWrapper isInline />}</div>;
      return <ProductOptionsGroup {...productOptionsGroupProps} />;
    }
    if (configuratorDisplayModeMobile === 'variants-only-sheet') return <VariantsOnlySheet />;
    if (configuratorDisplayModeMobile === 'modal') return <ModalConfiguratorDesktop />;
    if (isSnap2Mode) return null;
    return (
      <MobileDrawer
        isOpen={isVariantsOpen}
        onOpenChange={handleMobileDrawerClose}
        onStateChange={(value: any) => setDrawerSize(value === 0 ? 'closed' : value === 1 ? 'small' : 'large')}
        className="ov:z-[10]"
      >
        <div className='ov:w-full ov:h-full ov:flex ov:flex-col ov:absolute ov:top-0 ov:left-0 ov:pointer-events-auto'>
          {variantDisplayStyleMobile === 'wizard' ? (
            <div className="ov:flex ov:flex-col ov:h-full ov:bg-[var(--ov25-background-color)]">
              <VariantsHeader />
              <div className="ov:flex ov:flex-col ov:flex-1 ov:min-h-0 ov:overflow-hidden">
                <WizardVariants mode="drawer" />
              </div>
            </div>
          ) : (
            isSnap2Mode ? <Snap2Wrapper /> : <ProductVariantsWrapper />
          )}
          {variantDisplayStyleMobile !== 'wizard' && (
            <div className={`${drawerSize === 'large' || drawerSize === 'small' ? 'ov:fixed ov:bottom-0 ov:left-0 ov:w-full ov:z-[20]' : ''}`}>
              <MobileCheckoutButton />
            </div>
          )}
        </div>
      </MobileDrawer>
    );
  };

  const renderDesktop = () => {
    if (configuratorDisplayMode === 'inline-sheet') return null;
    if (configuratorDisplayMode === 'variants-only-sheet') return <VariantsOnlySheet />;
    if (configuratorDisplayMode === 'modal') return <ModalConfiguratorDesktop />;
    if (!useInlineVariantControls) return <VariantContentDesktop />;
    return null;
  };

  return (
    <>
      <div ref={containerRef} id="ov25-configurator-variant-menu-container" className="ov:relative ov:h-full ov:flex ov:flex-col ov:font-[family-name:var(--ov25-font-family)]">
        {holdVariantsPanelForSnap2Initialise ? (
          <div className="ov:flex-1 ov:min-h-0 ov:flex ov:flex-col ov:items-center ov:justify-center ov:px-4 ov:py-8 ov:text-center">
            <p className="ov:text-base ov:text-(--ov25-text-color) ov:shrink-0">Select a model to get started</p>
          </div>
        ) : (
          <>
            {(() => {
              const Overlay = MobilePriceOverlay as any;
              return <Overlay />;
            })()}
            {renderTriggerOrInlineVariants()}
            {isMobile ? renderMobile() : !isModalOpen ? renderDesktop() : null}
          </>
        )}
      </div>
    </>
  );
  
}
  

export default VariantSelectMenu; 