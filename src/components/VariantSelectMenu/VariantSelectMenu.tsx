import React from 'react';
import { TwoStageDrawer } from ".././ui/two-stage-drawer.js";
import { useOV25UI } from "../../contexts/ov25-ui-context.js";
import { ProductOptionsGroup } from "./ProductOptions.js";
import { MobilePriceOverlay } from "../mobile-price-overlay.js";
import { VariantContentDesktop } from './VariantContentDesktop.js';
import { ProductVariantsWrapper } from './ProductVaraintsWrapper.js';
import { CheckoutButton } from './CheckoutButton.js';
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
    getSelectedValue
  } = useOV25UI();

  

  return (
    <div id="ov-25-configurator-variant-menu-container" className="orbitalvision:relative orbitalvision:font-[family-name:var(--ov25-font-family)]">
      {(() => {
        const Overlay = MobilePriceOverlay as any;
        return <Overlay />;
      })()}
      
      <ProductOptionsGroup
        allOptions={allOptions}
        handleOptionClick={handleOptionClick}
        range={range}
        getSelectedValue={getSelectedValue}
      />
      
      {isMobile ? (
        (() => {
          return (
            <TwoStageDrawer
              isOpen={isVariantsOpen}
              onOpenChange={setIsVariantsOpen}
              onStateChange={(value: any) => setDrawerSize(value === 0 ? 'closed' : value === 1 ? 'small' : 'large')}
              className="orbitalvision:z-[10]"
            >
                <div className='orbitalvision:w-full orbitalvision:h-full orbitalvision:flex orbitalvision:flex-col orbitalvision:absolute orbitalvision:top-0 orbitalvision:left-0 orbitalvision:pointer-events-auto'>
                    <ProductVariantsWrapper />
                    <div className={`${drawerSize === 'large' ? 'orbitalvision:fixed orbitalvision:bottom-0 orbitalvision:left-0 orbitalvision:w-full' : '' }`}>
                    <MobileCheckoutButton />
                    </div>
                </div>
            </TwoStageDrawer>
          );
        })()
      ) : (
        <VariantContentDesktop />
      )}
    </div>
  );
  
}
  

export default VariantSelectMenu; 