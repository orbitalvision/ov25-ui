import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import { readOptionalSelectionDetailsQuery } from '../templates/SelectionDetailsControls.jsx';
import '../src/index.css';

const DIAMOND_APIKEY = import.meta.env.VITE_DIAMOND_APIKEY;
const selectionDetails = readOptionalSelectionDetailsQuery();
// Optional overrides for viewing another bed: ?bed=<bed configurator id>&apiKey=<org api key>
const query = new URLSearchParams(window.location.search);
const BED_ID = query.get('bed') || '3';
const APIKEY = query.get('apiKey') || DIAMOND_APIKEY;

const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => APIKEY,
  productLink: () => `/bed-configurator/${BED_ID}`,
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
    displayMode: { desktop: 'inline', mobile: 'drawer' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: {
      displayMode: { desktop: 'tree', mobile: 'list' },
      ...(selectionDetails ? { selectionDetails } : {}),
    },
  },
  callbacks: {
    addToBasket: (payload) => {
      alert('addToBasket' + payload);
      console.log('payload', payload);
    },
    buyNow: (payload) => {
      alert('buyNow' + payload);
      console.log('payload', payload);
    },
    buySwatches: () => alert('buySwatches'),
  },
  flags: { hidePricing: false },
  bed: {
    allowNone: { headboard: false, base: false, mattress: false },
    filterSelectionsByCurrentSize: { headboard: false, base: true, mattress: true },
  },
  cssString:`
    #ov25-configurator-variant-menu-container {
        height: 700px
}
  `,
  currencySymbol: '€'
});

function App() {
  return (
    <TestPageLayout
      title="Bed configurator"
      description="Bed configurator product id 3 (alexis)."
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
