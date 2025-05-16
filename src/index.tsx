import React from 'react'
import { createRoot } from 'react-dom/client'
import { ProductGallery } from "./components/product-gallery"
import { cn } from "./utils/cn"
import { OV25UIProvider, useOV25UI } from "./contexts/ov25-ui-context";
import VariantSelectMenu from "./components/VariantSelectMenu/VariantSelectMenu";
import ArPreviewQRCodeDialog from "./components/ar-preview-qr-code-dialog";
import '../globals.css'
import { ProductCarousel } from "./components/product-carousel";
import PriceAndName from "./components/PriceAndName";


export type DrawerSizes = 'closed' | 'small' | 'large'

// This component uses the SizeVariantCard and LegsVariantCard, which are defined above
const MainContent = () => {
  const {
    products,
    currentProductId,
    configuratorState,
    isVariantsOpen,
    error,
    isMobile
  } = useOV25UI();

  // Determine if we have required data
  const hasRequiredData = products?.length > 0 && currentProductId && configuratorState;

    return (
    <>
   
      <div id="ov-25-configurator-main-container" className={cn("h-screen min-h-screen w-full items-center flex-col ", !hasRequiredData && !error ? 'hidden' : 'flex')}>
        <main id="ov-25-configurator-content-wrapper" className="flex min-h-full w-full max-w-[2300px] flex-col xl:flex-row xl:gap-8 py-8 pt-0 xl:pt-8 xl:px-8 overflow-auto">
          <div id="ov-25-configurator-product-gallery-wrapper" className={cn("relative flex-grow-1 max-w-[100vh] 2xl:max-w-[120vh] w-full duration-600 transform", isMobile && isVariantsOpen ? 'sticky' : '')} style={{ top: '0rem' }}>
              <ProductGallery />
              <ProductCarousel />
        </div>

         {!error && (
            <div id="ov-25-configurator-product-details" className="flex-1 flex-shrink-0 xl:min-w-[494px] bg-white xl:px-0">
              <div id="ov-25-configurator-product-info" className="flex flex-col gap-6 pt-8 xl:pt-0">
                <div id="ov-25-configurator-product-header" className="flex flex-col gap-2 px-4 xl:px-0.5">
                  <PriceAndName 
                    className="px-0"
                  />
                </div>

                <VariantSelectMenu />

            </div>
          </div>
          )}
      </main>
    </div>
    </>
  );
};

// The main app component that wraps everything with the provider
export const APP = ({productLink = null}: {productLink?: string | null}) => {
  return (
    <OV25UIProvider productLink={'/range/12'}  apiKey='15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d'>
      <MainContent />
    </OV25UIProvider>
  );
};

export default APP;

// Render the React application
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<APP />);
}


