import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import { SINGLE_CUSTOM_CSS_BRANDING } from './single-custom-css-branding.js';
import '../src/index.css';

const DEV_RETAILER_APIKEY = import.meta.env.VITE_DEV_RETAILER_APIKEY;

const baseConfig = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => DEV_RETAILER_APIKEY,
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
    cssString: SINGLE_CUSTOM_CSS_BRANDING,
  },
  flags: { hidePricing: false },
});

const VARIANT_DISPLAY_TYPES = ['tree', 'list', 'tabs', 'accordion', 'wizard'];
/** Sheet = desktop sheet + mobile drawer. Inline = both inline. */
const CONFIG_DISPLAY_OPTIONS = [
  { value: 'sheet', label: 'sheet', displayMode: { desktop: 'sheet', mobile: 'drawer' } },
  { value: 'inline', label: 'inline', displayMode: { desktop: 'inline', mobile: 'inline' } },
];

function App() {
  const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const displayFromUrl = qs.get('display') || 'list';
  const menuFromUrl = qs.get('menu') || 'sheet';
  const mobileVariantDisplay = displayFromUrl === 'accordion' ? 'list' : displayFromUrl;
  const configDisplay = CONFIG_DISPLAY_OPTIONS.find((o) => o.value === menuFromUrl) ?? CONFIG_DISPLAY_OPTIONS[0];
  const config = {
    ...baseConfig,
    configurator: {
      ...baseConfig.configurator,
      displayMode: configDisplay.displayMode,
      variants: { displayMode: { desktop: displayFromUrl, mobile: mobileVariantDisplay } },
    },
  };

  const linkClass = (active) =>
    active ? 'ov:bg-black ov:text-white' : 'ov:bg-gray-200 ov:text-gray-800 ov:hover:bg-gray-300';

  return (
    <TestPageLayout
      title="Single Product – Custom CSS"
      description="Variant controls and dimensions styled with custom CSS."
      injectConfig={config}
      topContent={
        <div className="ov:flex ov:flex-col ov:gap-2 ov:mb-3 ov:text-sm">
          <div className="ov:flex ov:flex-wrap ov:gap-2 ov:items-center">
            <span className="ov:text-gray-600">Menu display:</span>
            {CONFIG_DISPLAY_OPTIONS.map((opt) => {
              const params = new URLSearchParams(window.location.search);
              params.set('menu', opt.value);
              return (
                <a
                  key={opt.value}
                  href={`?${params}`}
                  className={`ov:px-2 ov:py-1 ov:rounded ov:no-underline ${linkClass(opt.value === menuFromUrl)}`}
                >
                  {opt.label}
                </a>
              );
            })}
          </div>
          <div className="ov:flex ov:flex-wrap ov:gap-2 ov:items-center">
            <span className="ov:text-gray-600">Variants display:</span>
            {VARIANT_DISPLAY_TYPES.map((d) => {
              const params = new URLSearchParams(window.location.search);
              params.set('display', d);
              return (
                <a
                  key={d}
                  href={`?${params}`}
                  className={`ov:px-2 ov:py-1 ov:rounded ov:no-underline ${linkClass(d === displayFromUrl)}`}
                >
                  {d}
                </a>
              );
            })}
          </div>
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
