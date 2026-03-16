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

function App() {
  return (
    <TestPageLayout
      title="Single Product – Custom CSS"
      description="Variant controls and dimensions styled with custom CSS."
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
