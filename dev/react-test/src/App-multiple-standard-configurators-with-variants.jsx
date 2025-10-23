import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { injectMultipleConfigurators } from 'ov25-ui';
import './index.css';

// Set up a global state for the configurator
let configuratorInitialized = false;

// Function to initialize the configurator
const initializeConfigurator = () => {
  if (configuratorInitialized) return;

  // Initialize multiple standard configurators with variants
  injectMultipleConfigurators([
    {
      apiKey: '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
      productLink: 'range/126', // Arlo&Jacob - Otti range
      galleryId: '#gallery-1',
      variantsId: '#variants-1',
      priceId: { id: '#price-1', replace: true },
      nameId: { id: '#name-1', replace: true },
      logoURL: 'https://ov25.orbital.vision/OV.png',
      addToBasketFunction: () => console.log('Add to basket - Range 1'),
      buyNowFunction: () => console.log('Buy now - Range 1'),
      addSwatchesToCartFunction: () => console.log('Add swatches to cart - Range 1'),
    },
    {
      apiKey: '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
      productLink: 'range/85', // Ashley Manor - Ponti range
      galleryId: '#gallery-2',
      variantsId: '#variants-2',
      priceId: { id: '#price-2', replace: true },
      nameId: { id: '#name-2', replace: true },
      logoURL: 'https://ov25.orbital.vision/OV.png',
      addToBasketFunction: () => console.log('Add to basket - Range 2'),
      buyNowFunction: () => console.log('Buy now - Range 2'),
      addSwatchesToCartFunction: () => console.log('Add swatches to cart - Range 2'),
    }
  ]);

  configuratorInitialized = true;
};

function App() {
  // Set up the message event listener
  const handleMessage = (event) => {
    const { type, payload } = event.data;
    if (!type || type === 'AR_GLB_DATA') return;

    // Safely parse payload
    let data;
    try {
      data = JSON.parse(payload);
    } catch (error) {
      console.error("Failed to parse configurator message payload:", payload);
      return;
    }

    switch (type) {
      case "ALL_PRODUCTS":
        break;
      case "CURRENT_PRICE":
        break;
      case "CURRENT_PRODUCT_ID":
        break;
      case "CONFIGURATOR_STATE":
        break;
      case "RANGE":
        break;
      case "CURRENT_SKU":
        break;
      case "CURRENT_QUERY_STRING":
        break;
    }
  };

  // Initialize the configurator after the component has mounted
  useEffect(() => {
    initializeConfigurator();
    window.addEventListener("message", handleMessage);
  }, []);

  return (
    <div className="app">
      <h1>Multiple Standard Configurators with Variants</h1>
      <p className="subtitle">Testing multiple standard configurators on the same page with variants</p>
      
      <div className="configurators-grid">
        {/* Configurator 1 */}
        <div className="configurator-card">
          <h3>Range 1 - Ashley Manor Ponti</h3>
          <div id="gallery-1" className="gallery-container"></div>
          <div className="product-info">
            <div id="name-1" className="product-name">Ashley Manor Ponti</div>
            <div id="price-1" className="product-price">£1,299</div>
          </div>
          <div className="variants-container">
            <h4>Size Options</h4>
            <div id="variants-1"></div>
          </div>
        </div>
        
        {/* Configurator 2 */}
        <div className="configurator-card">
          <h3>Range 2 - Arlo&Jacob Otti</h3>
          <div id="gallery-2" className="gallery-container"></div>
          <div className="product-info">
            <div id="name-2" className="product-name">Arlo&Jacob Otti</div>
            <div id="price-2" className="product-price">£1,599</div>
          </div>
          <div className="variants-container">
            <h4>Size Options</h4>
            <div id="variants-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Initialize React app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
