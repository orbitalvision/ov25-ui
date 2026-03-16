import React, { useEffect, useRef } from 'react';
import { MobileDrawer } from ".././ui/mobile-drawer.js";
import { useOV25UI } from "../../contexts/ov25-ui-context.js";
import { VariantDisplayStyleOverlay } from '../../types/config-enums.js';
import { ProductOptionsGroup } from "./ProductOptions.js";
import { MobilePriceOverlay } from "../mobile-price-overlay.js";
import { VariantContentDesktop } from './VariantContentDesktop.js';
import { VariantsOnlySheet } from './VariantsOnlySheet.js';
import { ProductVariantsWrapper } from './ProductVariantsWrapper.js';
import { MobileCheckoutButton } from './MobileCheckoutButton.js';
import { ModuleBottomPanel } from './ModuleBottomPanel.js';
import { WizardVariants } from './WizardVariants.js';
import { VariantsHeader } from './VariantsHeader.js';
import { ConfigureButton } from '../ConfigureButton.js';

// Types
export type DrawerSizes = 'closed' | 'small' | 'large';

// Simplified props - most data now comes from context
export const VariantSelectMenu: React.FC = () => {
  // Get all required data from context
  const {
    isVariantsOpen,
    setIsVariantsOpen,
    isMobile,
    setDrawerSize,
    drawerSize,
    allOptionsWithoutModules,
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
  } = useOV25UI();


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

  return (
    <>
      <div ref={containerRef} id="ov25-configurator-variant-menu-container" className="ov:relative ov:h-full ov:flex ov:flex-col ov:font-[family-name:var(--ov25-font-family)]">
        {(() => {
          const Overlay = MobilePriceOverlay as any;
          return <Overlay />;
        })()}
        {useTriggerArea ? (
          configuratorTriggerStyle === 'single-button' ? (
            <ConfigureButton onClick={openConfiguratorOrSnap2} />
          ) : (
            <ProductOptionsGroup
              allOptions={allOptionsWithoutModules}
              handleOptionClick={handleOptionClick}
              range={range}
              getSelectedValue={getSelectedValue}
            />
          )
        ) : !hasConfigureButton && (
          isInlineWizard ? (
            <div className="ov:flex-1 ov:min-h-0 ov:h-full ov:flex ov:flex-col ov:overflow-hidden">
              <WizardVariants mode="inline" />
            </div>
          ) : isInlineListLike ? (
            <div className="ov:flex-1 ov:min-h-0 ov:h-full ov:flex ov:flex-col ov:overflow-hidden">
              <ProductVariantsWrapper isInline />
            </div>
          ) : (
            <ProductOptionsGroup
              allOptions={allOptionsWithoutModules}
              handleOptionClick={handleOptionClick}
              range={range}
              getSelectedValue={getSelectedValue}
            />
          )
        )}
        {!isModalOpen && (
          isMobile ? (
            useInlineVariantControls ? (
              hasConfigureButton ? (
                isInlineWizard ? (
                  <div className="ov:flex-1 ov:min-h-0 ov:h-full ov:flex ov:flex-col ov:overflow-hidden">
                    <WizardVariants mode="inline" />
                  </div>
                ) : isInlineListLike ? (
                  <div className="ov:flex-1 ov:min-h-0 ov:h-full ov:flex ov:flex-col ov:overflow-hidden">
                    <ProductVariantsWrapper isInline />
                  </div>
                ) : (
                  <ProductOptionsGroup
                    allOptions={allOptionsWithoutModules}
                    handleOptionClick={handleOptionClick}
                    range={range}
                    getSelectedValue={getSelectedValue}
                  />
                )
              ) : null
            ) : configuratorDisplayModeMobile === 'variants-only-sheet' ? (
              <VariantsOnlySheet />
            ) : !isSnap2Mode ? (
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
                    <ProductVariantsWrapper />
                  )}
                  {variantDisplayStyleMobile !== 'wizard' && (
                    <div className={`${drawerSize === 'large' || drawerSize === 'small' ? 'ov:fixed ov:bottom-0 ov:left-0 ov:w-full ov:z-[20]' : '' }`}>
                      <MobileCheckoutButton />
                    </div>
                  )}
                </div>
              </MobileDrawer>
            ) : null
          ) : configuratorDisplayMode === 'variants-only-sheet' ? (
            <VariantsOnlySheet />
          ) : !useInlineVariantControls ? (
            <VariantContentDesktop />
          ) : null
        )}

      </div>
    </>
  );
  
}
  

export default VariantSelectMenu; 