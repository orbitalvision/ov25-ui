import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { injectDiningConfigurator } from 'ov25-ui';
import {
  DINING_CONFIGURATOR_ID,
  DINING_CONFIGURATOR_PRODUCT_LINK,
  DINING_CONFIGURATOR_PUBLIC_API_KEY,
} from '../src/config/dining-configurator.js';
import { TestBackButton } from '../templates/TestBackButton.jsx';
import { ViewportWrapper } from '../templates/ViewportWrapper.jsx';
import '../src/index.css';

let diningConfiguratorInitialized = false;

const config = /** @type {import('ov25-ui').InjectDiningConfiguratorOptions} */ ({
  apiKey: () => DINING_CONFIGURATOR_PUBLIC_API_KEY,
  diningConfiguratorId: () => DINING_CONFIGURATOR_ID,
  selectors: {
    gallery: '.dining-configurator-gallery',
    sidebar: '#dining-configurator-sidebar',
  },
  callbacks: {
    addToBasket: (payload) => {
      console.log('dining addToBasket', payload);
    },
    onChange: (payload) => {
      console.log('dining onChange', payload);
    },
  },
  flags: {
    hidePricing: false,
  },
  displayOptions: {
    showAttachmentPoints: false,
  },
});

function App() {
  useEffect(() => {
    if (diningConfiguratorInitialized) return;

    const forceMobile = typeof window !== 'undefined' && window.location.search.includes('viewport=mobile');
    injectDiningConfigurator({
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
      <div className="app ov:px-4 ov:py-8">
        <TestBackButton />
        <h1>Dining configurator — no attachment points</h1>
        <p className="ov:mb-4 ov:text-[#525252]">
          Product link: <code>{DINING_CONFIGURATOR_PRODUCT_LINK}</code>
        </p>

        <div className="ov:flex ov:flex-col ov:gap-4 ov:md:flex-row ov:md:items-start">
          <div className="ov:w-full ov:md:w-[65%]">
            <div className="dining-configurator-gallery ov:min-h-[520px] ov:h-full ov:w-full ov:overflow-hidden ov:rounded-lg ov:border ov:border-gray-200 ov:bg-white" />
          </div>

          <div className="ov:w-full ov:md:w-[35%]">
            <div
              id="dining-configurator-sidebar"
              className="ov:min-h-[520px] ov:w-full ov:rounded-lg ov:border ov:border-gray-200 ov:bg-white ov:p-4"
            />
          </div>
        </div>
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
