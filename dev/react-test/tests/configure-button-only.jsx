import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
  productLink: () => '217',
  selectors: {
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
    configureButton: { selector: '[data-ov25-configure-button]', replace: true },
  },
  carousel: { desktop: 'stacked', mobile: 'carousel' },
  configurator: {
    displayMode: { desktop: 'sheet', mobile: 'drawer' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: {
      displayMode: { desktop: 'tabs', mobile: 'list' },
      useSimpleVariantsSelector: true,
    },
  },
  deferThreeD: true,
  callbacks: {
    addToBasket: () => alert('Add to basket'),
    buyNow: () => alert('Buy now'),
    buySwatches: () => alert('Add swatches to cart'),
  },
  flags: { hidePricing: false },
});

function App() {
  return (
    <TestPageLayout
      title="Configure Button Only"
      description="Standard product with a single Configure button. Variants drawer opens on click (useSimpleVariantsSelector)."
      injectConfig={config}
      renderControls={false}
      renderSwatches={false}
      asideSlot={
        <button
          type="button"
          data-ov25-configure-button
          className="ov:mt-4 ov:px-4 ov:py-2 ov:bg-transparent ov:text-white ov:rounded-md ov:cursor-pointer hover:ov:bg-blue-700"
        >
          Configure
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
