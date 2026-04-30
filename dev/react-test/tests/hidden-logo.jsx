import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;

const apiKey = () => DEMO_RETAILER_APIKEY;

const callbacks = {
  addToBasket: () => alert('Add to basket function called'),
  buyNow: () => alert('Buy now function called'),
  buySwatches: () => alert('Add swatches to cart'),
};

const rangeBase = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey,
  productLink: () => 'range/126',
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    variants: '#ov25-controls',
    swatches: '#ov25-swatches',
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
  },
  carousel: { desktop: 'stacked', mobile: 'carousel' },
  configurator: {
    displayMode: { desktop: 'sheet', mobile: 'drawer' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: { displayMode: { desktop: 'accordion', mobile: 'list' } },
  },
  callbacks,
  flags: { hidePricing: false },
});

const snap2Base = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey,
  productLink: () => 'snap2/126',
  configurationUuid: () => '8943fbc7-761e-4dbd-8e9d-29cf87127956',
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    configureButton: { selector: '#ov25-fullscreen-button', replace: false },
    variants: '#ov25-controls',
    swatches: '#ov25-swatches',
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
  },
  carousel: { desktop: 'stacked', mobile: 'carousel' },
  configurator: {
    displayMode: { desktop: 'sheet', mobile: 'drawer' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: { displayMode: { desktop: 'tree', mobile: 'list' } },
  },
  callbacks,
  flags: { hidePricing: false },
});

function App() {
  const [profile, setProfile] = useState(/** @type {'range' | 'snap2'} */ ('range'));
  const [hideLogo, setHideLogo] = useState(false);

  const injectConfig = useMemo(
    () => ({
      ...(profile === 'snap2' ? snap2Base : rangeBase),
      branding: { hideLogo },
    }),
    [profile, hideLogo],
  );

  return (
    <TestPageLayout
      title="Hidden logo"
      description="Range vs Snap2: hideLogo removes the mask logo on range; on Snap2 it also removes #ov25-variants-header-wrapper (desktop)."
      injectConfig={injectConfig}
      dynamicConfig
      topContent={
        <div className="ov:flex ov:flex-col ov:gap-3 ov:mb-4">
          <div className="ov:flex ov:flex-wrap ov:items-center ov:gap-2">
            <span className="ov:text-sm ov:text-[#525252]">productLink:</span>
            <button
              type="button"
              data-testid="product-range-button"
              className={`ov:rounded-md ov:border ov:px-3 ov:py-1.5 ov:text-sm ${
                profile === 'range'
                  ? 'ov:border-[#1a1a1a] ov:bg-[#1a1a1a] ov:text-white'
                  : 'ov:border-gray-300 ov:bg-white ov:text-[#1a1a1a] hover:ov:bg-gray-50'
              }`}
              onClick={() => setProfile('range')}
            >
              range/126
            </button>
            <button
              type="button"
              data-testid="product-snap2-button"
              className={`ov:rounded-md ov:border ov:px-3 ov:py-1.5 ov:text-sm ${
                profile === 'snap2'
                  ? 'ov:border-[#1a1a1a] ov:bg-[#1a1a1a] ov:text-white'
                  : 'ov:border-gray-300 ov:bg-white ov:text-[#1a1a1a] hover:ov:bg-gray-50'
              }`}
              onClick={() => setProfile('snap2')}
            >
              snap2/126
            </button>
          </div>
          <div className="ov:flex ov:flex-wrap ov:items-center ov:gap-2">
            <span className="ov:text-sm ov:text-[#525252]">branding.hideLogo:</span>
            <button
              type="button"
              data-testid="show-logo-button"
              className={`ov:rounded-md ov:border ov:px-3 ov:py-1.5 ov:text-sm ${
                !hideLogo
                  ? 'ov:border-[#1a1a1a] ov:bg-[#1a1a1a] ov:text-white'
                  : 'ov:border-gray-300 ov:bg-white ov:text-[#1a1a1a] hover:ov:bg-gray-50'
              }`}
              onClick={() => setHideLogo(false)}
            >
              Off (show logo)
            </button>
            <button
              type="button"
              data-testid="hide-logo-button"
              className={`ov:rounded-md ov:border ov:px-3 ov:py-1.5 ov:text-sm ${
                hideLogo
                  ? 'ov:border-[#1a1a1a] ov:bg-[#1a1a1a] ov:text-white'
                  : 'ov:border-gray-300 ov:bg-white ov:text-[#1a1a1a] hover:ov:bg-gray-50'
              }`}
              onClick={() => setHideLogo(true)}
            >
              On (hide logo)
            </button>
          </div>
        </div>
      }
      asideSlot={
        profile === 'snap2' ? (
          <button
            id="ov25-fullscreen-button"
            type="button"
            className="ov:mb-2 ov:cursor-pointer ov:rounded-md ov:border ov:border-gray-300 ov:bg-white ov:px-3 ov:py-2 ov:text-sm ov:text-[#1a1a1a] hover:ov:bg-gray-50"
          >
            Configure (Snap2)
          </button>
        ) : undefined
      }
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
