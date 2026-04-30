import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import { TestBackButton } from '../templates/TestBackButton.jsx';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;

let configuratorInitialized = false;

const initializeConfigurator = () => {
  if (configuratorInitialized) return;

  injectConfigurator(/** @type {import('ov25-ui').InjectConfiguratorInput[]} */ ([
    {
      apiKey: () => DEMO_RETAILER_APIKEY,
      productLink: () => '607',
      selectors: {
        gallery: '#gallery-1',
        price: { selector: '#price-1', replace: true },
        name: { selector: '#name-1', replace: true },
      },
      callbacks: {
        addToBasket: () => console.log('Add to basket - Product 1'),
        buyNow: () => console.log('Buy now - Product 1'),
        buySwatches: () => console.log('Add swatches to cart - Product 1'),
      },
    },
    {
      apiKey: () => DEMO_RETAILER_APIKEY,
      productLink: () => '576',
      selectors: {
        gallery: '#gallery-2',
        price: { selector: '#price-2', replace: true },
        name: { selector: '#name-2', replace: true },
      },
      callbacks: {
        addToBasket: () => console.log('Add to basket - Product 2'),
        buyNow: () => console.log('Buy now - Product 2'),
        buySwatches: () => console.log('Add swatches to cart - Product 2'),
      },
    },
    {
      apiKey: () => DEMO_RETAILER_APIKEY,
      productLink: () => '1284',
      selectors: {
        gallery: '#gallery-3',
        price: { selector: '#price-3', replace: true },
        name: { selector: '#name-3', replace: true },
      },
      callbacks: {
        addToBasket: () => console.log('Add to basket - Product 3'),
        buyNow: () => console.log('Buy now - Product 3'),
        buySwatches: () => console.log('Add swatches to cart - Product 3'),
      },
    },
    {
      apiKey: () => DEMO_RETAILER_APIKEY,
      productLink: () => '1287',
      selectors: {
        gallery: '#gallery-4',
        price: { selector: '#price-4', replace: true },
        name: { selector: '#name-4', replace: true },
      },
      callbacks: {
        addToBasket: () => console.log('Add to basket - Product 4'),
        buyNow: () => console.log('Buy now - Product 4'),
        buySwatches: () => console.log('Add swatches to cart - Product 4'),
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
      <h1>Multiple Standard Configurators</h1>
      <p className="subtitle">Testing multiple standard configurators on the same page without variants</p>
      <div className="configurators-grid">
        <div className="configurator-card">
          <h3>Product 1</h3>
          <div id="gallery-1" className="gallery-container" />
          <div className="product-info">
            <div id="name-1" className="product-name">Windrush Loveseat</div>
            <div id="price-1" className="product-price">£1,299</div>
          </div>
        </div>
        <div className="configurator-card">
          <h3>Product 2</h3>
          <div id="gallery-2" className="gallery-container" />
          <div className="product-info">
            <div id="name-2" className="product-name">Aughton Petit</div>
            <div id="price-2" className="product-price">£899</div>
          </div>
        </div>
        <div className="configurator-card">
          <h3>Product 3 - Arlo&Jacob - Otti - Corner Unit</h3>
          <div id="gallery-3" className="gallery-container" />
          <div className="product-info">
            <div id="name-3" className="product-name">Arlo&Jacob - Otti - Corner Unit</div>
            <div id="price-3" className="product-price">£1,299</div>
          </div>
        </div>
        <div className="configurator-card">
          <h3>Product 4 - Arlo&Jacob - Otti - Grand Filler Unit</h3>
          <div id="gallery-4" className="gallery-container" />
          <div className="product-info">
            <div id="name-4" className="product-name">Arlo&Jacob - Otti - Grand Filler Unit</div>
            <div id="price-4" className="product-price">£1,599</div>
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
