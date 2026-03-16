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
      productLink: () => 'range/126',
      selectors: {
        gallery: '#gallery-1',
        variants: '#variants-1',
        price: { selector: '#price-1', replace: true },
        name: { selector: '#name-1', replace: true },
      },
      callbacks: {
        addToBasket: () => console.log('Add to basket - Range 1'),
        buyNow: () => console.log('Buy now - Range 1'),
        buySwatches: () => console.log('Add swatches to cart - Range 1'),
      },
    },
    {
      apiKey: () => '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
      productLink: () => 'range/85',
      selectors: {
        gallery: '#gallery-2',
        variants: '#variants-2',
        price: { selector: '#price-2', replace: true },
        name: { selector: '#name-2', replace: true },
      },
      callbacks: {
        addToBasket: () => console.log('Add to basket - Range 2'),
        buyNow: () => console.log('Buy now - Range 2'),
        buySwatches: () => console.log('Add swatches to cart - Range 2'),
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
      <h1>Multiple Standard Configurators with Variants</h1>
      <p className="subtitle">Testing multiple standard configurators on the same page with variants</p>
      <div className="configurators-grid">
        <div className="configurator-card">
          <h3>Range 1 - Ashley Manor Ponti</h3>
          <div id="gallery-1" className="gallery-container" />
          <div className="product-info">
            <div id="name-1" className="product-name">Ashley Manor Ponti</div>
            <div id="price-1" className="product-price">£1,299</div>
          </div>
          <div className="variants-container">
            <div id="variants-1" />
          </div>
        </div>
        <div className="configurator-card">
          <h3>Range 2 - Arlo&Jacob Otti</h3>
          <div id="gallery-2" className="gallery-container" />
          <div className="product-info">
            <div id="name-2" className="product-name">Arlo&Jacob Otti</div>
            <div id="price-2" className="product-price">£1,599</div>
          </div>
          <div className="variants-container">
            <div id="variants-2" />
          </div>
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
