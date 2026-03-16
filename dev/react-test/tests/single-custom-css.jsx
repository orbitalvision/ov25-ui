import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const baseConfig = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => '51-dd7de4d1dabdd994b22c406595cfe15589623ec85622b9f721ca4d1dbdb58721',
  productLink: () => '1682',
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
    variants: { displayMode: { desktop: 'list', mobile: 'list' } },
  },
  callbacks: {
    addToBasket: (payload) => alert(`Checkout: ${payload?.price?.formattedPrice ?? '—'} / ${payload?.skus?.skuString ?? '—'}`),
    buyNow: (payload) => alert(`Buy now: ${payload?.price?.formattedPrice ?? '—'} / ${payload?.skus?.skuString ?? '—'}`),
    buySwatches: () => alert('Add swatches to cart'),
    onChange: (payload) => console.log('onChange', payload),
  },
  branding: {
    cssString: `
      .ov25-variant-control {
        background-color: red;
      }
        
      #ov25-share-button {
        background-color: blue;
      }

      .ov25-dimensions-width, .ov25-dimensions-height, .ov25-dimensions-depth, .ov25-dimensions-mini {
        background-color: red;
        border: 2px dashed green;
        border-radius: 0px;
        scale: 2;
      }
    `,
  },
  flags: { hidePricing: false },
});

const DISPLAY_TYPES = ['tree', 'list', 'tabs', 'accordion', 'wizard'];

function App() {
  const displayFromUrl =
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('display')) || 'list';
  const mobileDisplay = displayFromUrl === 'accordion' ? 'list' : displayFromUrl;
  const config = {
    ...baseConfig,
    configurator: {
      ...baseConfig.configurator,
      variants: { displayMode: { desktop: displayFromUrl, mobile: mobileDisplay } },
    },
  };

  return (
    <TestPageLayout
      title="Single Product – Custom CSS"
      description="Variant controls and dimensions styled with custom CSS."
      injectConfig={config}
      topContent={
        <div className="ov:flex ov:flex-wrap ov:gap-2 ov:mb-3 ov:text-sm">
          <span className="ov:text-gray-600">Menu display:</span>
          {DISPLAY_TYPES.map((d) => {
            const params = new URLSearchParams(window.location.search);
            params.set('display', d);
            return (
              <a
                key={d}
                href={`?${params}`}
                className={`ov:px-2 ov:py-1 ov:rounded ov:no-underline ${d === displayFromUrl ? 'ov:bg-black ov:text-white' : 'ov:bg-gray-200 ov:text-gray-800 ov:hover:bg-gray-300'}`}
              >
                {d}
              </a>
            );
          })}
        </div>
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
