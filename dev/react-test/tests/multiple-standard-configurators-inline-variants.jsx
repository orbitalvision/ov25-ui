import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import { TestBackButton } from '../templates/TestBackButton.jsx';
import '../src/index.css';

let configuratorInitialized = false;

const initializeConfigurator = () => {
  if (configuratorInitialized) return;

  injectConfigurator(/** @type {import('ov25-ui').InjectConfiguratorInput[]} */ ([
    {
      apiKey: () => '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
      productLink: () => '607',
      selectors: {
        gallery: '#gallery-1',
        variants: '#variants-1',
        price: { selector: '#price-1', replace: true },
        name: { selector: '#name-1', replace: true },
      },
      configurator: {
        displayMode: { desktop: 'inline', mobile: 'inline' },
        triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
        variants: { displayMode: { desktop: 'accordion', mobile: 'list' } },
      },
      callbacks: {
        addToBasket: () => console.log('Add to basket - Product 1'),
        buyNow: () => console.log('Buy now - Product 1'),
        buySwatches: () => console.log('Add swatches to cart - Product 1'),
      },
    },
    {
      apiKey: () => '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
      productLink: () => '576',
      selectors: {
        gallery: '#gallery-2',
        variants: '#variants-2',
        price: { selector: '#price-2', replace: true },
        name: { selector: '#name-2', replace: true },
      },
      configurator: {
        displayMode: { desktop: 'inline', mobile: 'inline' },
        triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
        variants: { displayMode: { desktop: 'accordion', mobile: 'list' } },
      },
      callbacks: {
        addToBasket: () => console.log('Add to basket - Product 2'),
        buyNow: () => console.log('Buy now - Product 2'),
        buySwatches: () => console.log('Add swatches to cart - Product 2'),
      },
    },
  ]));

  configuratorInitialized = true;
};

function App() {
  useEffect(() => {
    initializeConfigurator();
  }, []);

  return (
    <div className="app">
      <TestBackButton />
      <h1>Multiple Standard Configurators with Inline Variants</h1>
      <p className="subtitle">Testing multiple standard configurators with inline variant controls enabled</p>
      <div className="configurators-grid">
        <div className="configurator-card">
          <h3>Product 1 - Windrush Loveseat</h3>
          <div id="gallery-1" className="gallery-container" />
          <div className="product-info">
            <div id="name-1" className="product-name">Windrush Loveseat</div>
            <div id="price-1" className="product-price">£1,299</div>
          </div>
          <div id="variants-1" className="variants-container" />
        </div>
        <div className="configurator-card">
          <h3>Product 2 - Aughton Petit</h3>
          <div id="gallery-2" className="gallery-container" />
          <div className="product-info">
            <div id="name-2" className="product-name">Aughton Petit</div>
            <div id="price-2" className="product-price">£899</div>
          </div>
          <div id="variants-2" className="variants-container" />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
