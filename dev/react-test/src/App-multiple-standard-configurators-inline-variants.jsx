import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { injectMultipleConfigurators } from 'ov25-ui';
import './index.css';

// Set up a global state for the configurator
let configuratorInitialized = false;

// Function to initialize the configurator
const initializeConfigurator = () => {
  if (configuratorInitialized) return;

  // Initialize multiple standard configurators with inline variant controls
  injectMultipleConfigurators([
    {
      apiKey: '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
      productLink: '607', // Windrush Loveseat
      galleryId: '#gallery-1',
      priceId: { id: '#price-1', replace: true },
      nameId: { id: '#name-1', replace: true },
      variantsId: '#variants-1',
      logoURL: 'https://ov25.orbital.vision/OV.png',
      addToBasketFunction: () => console.log('Add to basket - Product 1'),
      buyNowFunction: () => console.log('Buy now - Product 1'),
      addSwatchesToCartFunction: () => console.log('Add swatches to cart - Product 1'),
      useInlineVariantControls: true, // Enable inline variant controls
    },
    {
      apiKey: '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
      productLink: '576', // Aughton Petit
      galleryId: '#gallery-2',
      priceId: { id: '#price-2', replace: true },
      nameId: { id: '#name-2', replace: true },
      variantsId: '#variants-2',
      logoURL: 'https://ov25.orbital.vision/OV.png',
      addToBasketFunction: () => console.log('Add to basket - Product 2'),
      buyNowFunction: () => console.log('Buy now - Product 2'),
      addSwatchesToCartFunction: () => console.log('Add swatches to cart - Product 2'),
      useInlineVariantControls: true, // Enable inline variant controls
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
      <h1>Multiple Standard Configurators with Inline Variants</h1>
      <p className="subtitle">Testing multiple standard configurators with inline variant controls enabled</p>
      
      <div className="configurators-grid">
        {/* Configurator 1 */}
        <div className="configurator-card">
          <h3>Product 1 - Windrush Loveseat</h3>
          <div id="gallery-1" className="gallery-container"></div>
          <div className="product-info">
            <div id="name-1" className="product-name">Windrush Loveseat</div>
            <div id="price-1" className="product-price">£1,299</div>
          </div>
          <div id="variants-1" className="variants-container"></div>
        </div>
        
        {/* Configurator 2 */}
        <div className="configurator-card">
          <h3>Product 2 - Aughton Petit</h3>
          <div id="gallery-2" className="gallery-container"></div>
          <div className="product-info">
            <div id="name-2" className="product-name">Aughton Petit</div>
            <div id="price-2" className="product-price">£899</div>
          </div>
          <div id="variants-2" className="variants-container"></div>
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
