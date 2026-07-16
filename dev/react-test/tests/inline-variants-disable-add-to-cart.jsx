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

/**
 * @param {'standard' | 'snap2'} profile
 * @param {{ hidePricing: boolean; disableAddToCart: boolean; disableBuyNow: boolean }} flags
 * @returns {import('ov25-ui').InjectConfiguratorInput}
 */
function buildInjectConfig(profile, flags) {
  if (profile === 'snap2') {
    // Same as snap2-uuid.jsx: UUID skips InitialiseMenu (no in-test furniture pick).
    return {
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
      flags,
    };
  }
  return {
    apiKey,
    productLink: () => '58',
    selectors: {
      gallery: { selector: '.configurator-container', replace: true },
      variants: '#ov25-controls',
      swatches: '#ov25-swatches',
      price: { selector: '#price', replace: true },
      name: { selector: '#name', replace: true },
    },
    carousel: { desktop: 'stacked', mobile: 'carousel' },
    configurator: {
      displayMode: { desktop: 'inline', mobile: 'inline' },
      triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
      variants: { displayMode: { desktop: 'accordion', mobile: 'list' } },
    },
    callbacks,
    flags,
  };
}

function App() {
  const [profile, setProfile] = useState(/** @type {'standard' | 'snap2'} */ ('standard'));
  const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const disableBuyNow = qs.get('disableBuyNow') === '1';
  const disableAddToCart = qs.has('disableAddToCart') ? qs.get('disableAddToCart') === '1' : !disableBuyNow;
  const flags = useMemo(
    () => ({ hidePricing: false, disableAddToCart, disableBuyNow }),
    [disableAddToCart, disableBuyNow]
  );
  const injectConfig = useMemo(() => buildInjectConfig(profile, flags), [profile, flags]);

  return (
    <TestPageLayout
      title="Inline variants — disable add to cart"
      description="Checkout action toggles for standard inline and Snap2. Query params: disableAddToCart=1, disableBuyNow=1."
      injectConfig={injectConfig}
      dynamicConfig
      topContent={
        <div className="ov:flex ov:flex-wrap ov:items-center ov:gap-2 ov:mb-4">
          <span className="ov:text-sm ov:text-[#525252]">Product:</span>
          <button
            type="button"
            className={`ov:rounded-md ov:border ov:px-3 ov:py-1.5 ov:text-sm ${
              profile === 'standard'
                ? 'ov:border-[#1a1a1a] ov:bg-[#1a1a1a] ov:text-black'
                : 'ov:border-gray-300 ov:bg-white ov:text-[#1a1a1a]'
            }`}
            onClick={() => setProfile('standard')}
          >
            Standard (58, inline)
          </button>
          <button
            type="button"
            className={`ov:rounded-md ov:border ov:px-3 ov:py-1.5 ov:text-sm ${
              profile === 'snap2'
                ? 'ov:border-[#1a1a1a] ov:bg-[#1a1a1a] ov:text-black'
                : 'ov:border-gray-300 ov:bg-white ov:text-[#1a1a1a]'
            }`}
            onClick={() => setProfile('snap2')}
          >
            Snap2 (snap2/126)
          </button>
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
