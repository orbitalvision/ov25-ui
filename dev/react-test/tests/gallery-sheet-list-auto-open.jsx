import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;

// ?desktopMode=inline shows the configurator inline on desktop; mobile keeps the drawer either way.
const desktopMode = new URLSearchParams(window.location.search).get('desktopMode') === 'inline' ? 'inline' : 'sheet';

const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => DEMO_RETAILER_APIKEY,
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
    displayMode: { desktop: desktopMode, mobile: 'drawer' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: { displayMode: { desktop: 'list', mobile: 'list' } },
  },
  callbacks: { addToBasket: () => alert('Add to basket'), buyNow: () => alert('Buy now'), buySwatches: () => alert('Add swatches to cart') },
  flags: { hidePricing: false, autoOpen: true },
});

function App() {
  const linkClass = (active) =>
    active ? 'ov:bg-black ov:text-white' : 'ov:bg-gray-200 ov:text-gray-800 ov:hover:bg-gray-300';

  return (
    <TestPageLayout
      title="Gallery - Sheet + List Auto-open"
      description="Configurator sheet with list variant display and autoOpen enabled. With desktop inline, autoOpen applies only to the mobile drawer."
      injectConfig={config}
      showProductTabs
      topContent={
        <div className="ov:flex ov:flex-wrap ov:gap-2 ov:mb-3 ov:text-sm ov:items-center">
          <span className="ov:text-gray-600">Desktop displayMode:</span>
          {['sheet', 'inline'].map((mode) => {
            const params = new URLSearchParams(window.location.search);
            params.set('desktopMode', mode);
            return (
              <a
                key={mode}
                href={`?${params}`}
                className={`ov:px-2 ov:py-1 ov:rounded ov:no-underline ${linkClass(mode === desktopMode)}`}
              >
                {mode}
              </a>
            );
          })}
        </div>
      }
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
export default App;
