import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
  productLink: () => '576',
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    variants: '#ov25-controls',
    swatches: '#ov25-swatches',
    name: { selector: '#name', replace: true },
  },
  carousel: { desktop: 'stacked', mobile: 'carousel' },
  configurator: {
    displayMode: { desktop: 'sheet', mobile: 'drawer' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: { displayMode: { desktop: 'tree', mobile: 'list' } },
  },
  callbacks: {
    addToBasket: () => {},
    buyNow: () => {},
    buySwatches: () => {},
  },
  flags: { hidePricing: true },
});

function App() {
  return (
    <TestPageLayout
      title="Single Product - No Pricing"
      description="Aughton - Petit"
      injectConfig={config}
      showPrice={false}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
