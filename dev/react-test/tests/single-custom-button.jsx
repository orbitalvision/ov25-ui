import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const baseConfig = /** @type {import('ov25-ui').InjectConfiguratorOptions} */ ({
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
    variants: { displayMode: { desktop: 'tree', mobile: 'list' } },
  },
  callbacks: {
    addToBasket: () => alert('Checkout function called'),
    buyNow: () => alert('Buy now function called'),
    buySwatches: () => alert('Add swatches to cart'),
  },
  flags: { hidePricing: false },
});

const DISPLAY_TYPES = ['tree', 'list', 'tabs', 'accordion', 'wizard'];

function App() {
  const displayFromUrl =
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('display')) || 'tree';
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
      title="Single Product – Custom open/close buttons"
      description={
        <>
          Uses <code>window.ov25OpenConfigurator(optionName?)</code> / <code>window.ov25CloseConfigurator</code> and{' '}
          <code>window.ov25OpenSwatchBook</code> / <code>window.ov25CloseSwatchBook</code>.
        </>
      }
      injectConfig={/** @type {import('ov25-ui').InjectConfiguratorInput} */ (config)}
      topContent={
        <>
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
          <div className="ov:flex ov:flex-wrap ov:gap-2 ov:mb-4">
          <button
            type="button"
            onClick={() => window.ov25OpenConfigurator?.()}
            className="ov:px-4 ov:py-2 ov:bg-black ov:text-white ov:rounded-md ov:cursor-pointer"
          >
            Open configurator
          </button>
          <button
            type="button"
            onClick={() => window.ov25OpenConfigurator?.('wood finishes')}
            className="ov:px-4 ov:py-2 ov:bg-gray-700 ov:text-white ov:rounded-md ov:cursor-pointer"
          >
            Open configurator (Wood finishes)
          </button>
          <button
            type="button"
            onClick={() => window.ov25CloseConfigurator?.()}
            className="ov:px-4 ov:py-2 ov:bg-gray-900 ov:text-white ov:rounded-md ov:cursor-pointer"
          >
            Close configurator
          </button>
          <button
            type="button"
            onClick={() => window.ov25OpenSwatchBook?.()}
            className="ov:px-4 ov:py-2 ov:bg-emerald-700 ov:text-white ov:rounded-md ov:cursor-pointer"
          >
            Open swatches
          </button>
          <button
            type="button"
            onClick={() => window.ov25CloseSwatchBook?.()}
            className="ov:px-4 ov:py-2 ov:bg-emerald-900 ov:text-white ov:rounded-md ov:cursor-pointer"
          >
            Close swatches
          </button>
        </div>
        </>
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
