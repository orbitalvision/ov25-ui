import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

// Mirrors the embed config on www.diamondfurniture.ie bed pages (Shopify app block, read 2026-10-08),
// so a Diamond bed loads here the way their shoppers see it. Pick a bed with ?bed=<bed configurator id>.
const DIAMOND_APIKEY = import.meta.env.VITE_DIAMOND_APIKEY;
const BED_ID = new URLSearchParams(window.location.search).get('bed') || '3';

const DIAMOND_CSS = `
:host {
  --ov25-variant-thumb-ring-mode: solid;
  --ov25-highlight-color: #8b634e;
  --ov25-configurator-iframe-border-radius: 0px;
  --ov25-cta-border-radius: 4px;
  --ov25-variant-thumb-border-radius: 0px;
  --ov25-cta-color: #8b634e;
  --ov25-cta-color-hover: #8b634e;
  --ov25-cta-color-light: #c4a899;
  --ov25-configurator-iframe-background-color: #fafafa;
}
.ov25-selection-thumbnail { background: white; }
[data-ov25-list-variants-content="true"] { overflow-y: visible; height: auto !important; max-height: fit-content !important; }
[data-ov25-tree-variants-mode="inline"] { overflow-y: visible; }
div:has(> [data-ov25-tree-variants-mode="inline"]) { overflow-y: visible; }
#ov25-configurator-variant-menu-container { max-height: fit-content !important; }
.ov25-checkout-button-wrapper { padding-inline: 0px; }
.ov25-option-header { font-size: 11.475px; text-transform: uppercase; padding-block: 1rem; }
.ov25-option-header svg { width: 20px; height: 20px; stroke-width: 2.5px; }
.ov25-option-header:first-child { border-top: 1px solid #e5e5e5; }
`;

const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => DIAMOND_APIKEY,
  productLink: () => `/bed-configurator/${BED_ID}`,
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
    variants: '#ov25-controls',
    swatches: '#ov25-swatches',
    configureButton: '#ov25-fullscreen-button',
  },
  carousel: { desktop: 'stacked', mobile: 'none', maxImages: { desktop: 4, mobile: 6 } },
  configurator: {
    displayMode: { desktop: 'inline', mobile: 'inline' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: { displayMode: { desktop: 'tree', mobile: 'tree' }, useSimpleVariantsSelector: true },
  },
  flags: {
    hidePricing: false,
    disableAddToCart: true,
    hideAr: true,
    deferThreeD: false,
    showOptional: false,
    forceMobile: false,
    autoOpen: false,
  },
  branding: { cssString: DIAMOND_CSS },
  bed: {
    allowNone: { headboard: false, base: true, mattress: true },
    filterSelectionsByCurrentSize: { headboard: false, base: true, mattress: true },
  },
  callbacks: {
    addToBasket: (payload) => console.log('addToBasket', payload),
    buyNow: (payload) => console.log('buyNow', payload),
    buySwatches: () => console.log('buySwatches'),
  },
  // The Shopify app block adds this from the shop currency (EUR).
  currencySymbol: '€',
});

function App() {
  return (
    <TestPageLayout
      title="Bed configurator (Diamond live config)"
      description={`Diamond bed configurator ${BED_ID} with the embed settings from diamondfurniture.ie. Headboard has no None; base and mattress do.`}
      injectConfig={config}
      asideSlot={
        <button
          id="ov25-fullscreen-button"
          className="ov:cursor-pointer ov:bg-transparent ov:text-white ov:p-2 ov:rounded-md ov:mb-2"
        >
          Configure your bed
        </button>
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
