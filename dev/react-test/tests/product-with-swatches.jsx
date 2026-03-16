import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
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

function App() {
  return (
    <TestPageLayout
      title="Product with Swatches"
      description="Testing product configuration with color/material swatches"
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
