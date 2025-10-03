import React from 'react';
import { TwoStageDrawer } from ".././ui/two-stage-drawer.js";
import { useOV25UI } from "../../contexts/ov25-ui-context.js";
import { ProductOptionsGroup } from "./ProductOptions.js";
import { MobilePriceOverlay } from "../mobile-price-overlay.js";
import { VariantContentDesktop } from './VariantContentDesktop.js';
import { ProductVariantsWrapper } from './ProductVariantsWrapper.js';
import { MobileCheckoutButton } from './MobileCheckoutButton.js';

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
    allOptions,
    handleOptionClick,
    range,
    getSelectedValue,
    isSnap2Mode,
    isModalOpen,
    hasConfigureButton,
  } = useOV25UI();
  
  return (
    <>
      <div id="ov-25-configurator-variant-menu-container" className="ov:relative ov:font-[family-name:var(--ov25-font-family)]">
        {(() => {
          const Overlay = MobilePriceOverlay as any;
          return <Overlay />;
        })()}
        {!hasConfigureButton && (
          <ProductOptionsGroup
            allOptions={allOptions}
            handleOptionClick={handleOptionClick}
            range={range}
            getSelectedValue={getSelectedValue}
          />
        )}
        {!isModalOpen && (
          isMobile ? (
            (() => {
              return (
                <TwoStageDrawer
                  isOpen={isVariantsOpen}
                  onOpenChange={setIsVariantsOpen}
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
              );
            })()
          ) : (
            <VariantContentDesktop />
          )
        )}
      </div>
    </>
  );
  
}
  

export default VariantSelectMenu; 