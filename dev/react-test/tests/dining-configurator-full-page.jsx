import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import {
  DINING_CONFIGURATOR_PRODUCT_LINK,
  DINING_CONFIGURATOR_PUBLIC_API_KEY,
} from '../src/config/dining-configurator.js';
import { TestBackButton } from '../templates/TestBackButton.jsx';
import { ViewportWrapper } from '../templates/ViewportWrapper.jsx';
import '../src/index.css';

let diningConfiguratorInitialized = false;

const config = /** @type {import('ov25-ui').InjectConfiguratorOptions} */ ({
  apiKey: () => DINING_CONFIGURATOR_PUBLIC_API_KEY,
  productLink: () => DINING_CONFIGURATOR_PRODUCT_LINK,
  selectors: {
    root: '#dining-configurator-full-page-root',
  },
  callbacks: {
    addToBasket: (payload) => {
      console.log('dining full-page addToBasket', payload);
    },
    buyNow: (payload) => {
      console.log('dining full-page buyNow', payload);
    },
    buySwatches: (swatches, swatchRulesData) => {
      console.log('dining full-page buySwatches', swatches, swatchRulesData);
    },
    onChange: (payload) => {
      console.log('dining full-page onChange', payload);
    },
  },
  dining: {
    displayMode: {
      desktop: 'full-page',
      mobile: 'full-page',
    },
    displayOptions: {
      showAttachmentPoints: false,
    },
  },
  branding: {
    cssString: `
      [data-ov25-dining-full-page-shell] {
        --ov25-background-color: #ffffff;
        --ov25-secondary-background-color: #f4f5f2;
        --ov25-primary-color: #087f5b;
        --ov25-primary-text-color: #ffffff;
        --ov25-border-color: #d9ded6;
      }
    `,
  },
  flags: {
    hidePricing: false,
    currencySymbol: '£',
  },
});

function App() {
  useEffect(() => {
    if (diningConfiguratorInitialized) return;

    const forceMobile = typeof window !== 'undefined' && window.location.search.includes('viewport=mobile');
    injectConfigurator({
      ...config,
      flags: {
        ...config.flags,
        ...(forceMobile ? { forceMobile: true } : {}),
      },
    });
    diningConfiguratorInitialized = true;
  }, []);

  return (
    <ViewportWrapper>
      <div className="app ov:min-h-screen ov:bg-[#f4f5f2]">
        <TestBackButton />
        <div id="dining-configurator-full-page-root" className="ov:min-h-screen" />
      </div>
    </ViewportWrapper>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
