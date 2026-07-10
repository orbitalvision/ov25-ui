import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;

// Product-list links use dash-separated ids: "123-456-789".
const PRODUCT_IDS = [
  '3332',
  '3333',
  '3334',
];

const productLink = PRODUCT_IDS.join('-');

const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => DEMO_RETAILER_APIKEY,
  productLink: () => productLink,
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
    addToBasket: () => alert('Add to basket function called'),
    buyNow: () => alert('Buy now function called'),
    buySwatches: () => alert('Add swatches to cart'),
  },
  flags: { hidePricing: false },
});

function App() {
  return (
    <TestPageLayout
      title="Product List"
      description={`Dash-separated product ids: ${productLink}`}
      injectConfig={config}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
