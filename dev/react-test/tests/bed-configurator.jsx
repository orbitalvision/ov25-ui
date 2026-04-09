import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => '64-cded72a1485f2a14fbc30d0e41dfc702aed35dd77605628a3a839dc8d523ffca',
  productLink: () => '/bed-configurator/3',
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
    variants: { displayMode: { desktop: 'tree', mobile: 'list' } },
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
    allowNone: { headboard: false, base: true, mattress: true },
    filterSelectionsByCurrentSize: { headboard: false, base: true, mattress: true },
  },
  cssString:`
    #ov25-configurator-variant-menu-container {
        height: 700px
}
  `
});

function App() {
  return (
    <TestPageLayout
      title="Bed configurator"
      description="Bed configurator product id 2."
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
