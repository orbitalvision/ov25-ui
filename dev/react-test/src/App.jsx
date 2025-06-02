import React, { useEffect, useState } from 'react';
import { injectConfigurator } from 'ov25-ui';
import './App.css';

// Set up a global state for the configurator
let configuratorInitialized = false;

// Function to initialize the configurator
const initializeConfigurator = () => {
  if (configuratorInitialized) return;
  
  
  // Inject the configurator
  injectConfigurator({
    apiKey: () => { return '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d' }, 
    productLink: () => { return '/range/1' }, 
    onSelectionChange: (selections) => {
      console.log('Selections changed:', selections);
    },
    onProductChange: (product) => {
      console.log('Product changed:', product);
    },
    galleryId: {id: '.configurator-container', replace: true},
    priceId: {id: '#price', replace: true},
    nameId: {id: '#name', replace: true},
    deferThreeD: false,
    variantsId: '#ov25-controls',
    carouselId: true,

    addToBasketFunction: () => {
        alert('Checkout function called');
      },
    buyNowFunction: () => {
        alert('Buy now function called');
      },
  });
  
  configuratorInitialized = true;
};

function App() {
  const [configuratorState, setConfiguratorState] = useState(null);

  // Function to handle configurator state changes
  const handleConfiguratorState = (state) => {
    setConfiguratorState(state);
  };

  // Set up the message event listener
  const handleMessage = (event) => {
    const { type, payload } = event.data;
    if (!type) return;
  
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
        handleConfiguratorState(data);
        break;
      case "RANGE":
        break;
      case "CURRENT_SKU":
        break;
    }
  };

  // Initialize the configurator after the component has mounted
  useEffect(() => {
    initializeConfigurator();
    window.addEventListener("message", handleMessage);
  }, []);

  return (
    <div className="app ov:overflow-x-hidden">
      <h1>OV25 Configurator Test</h1>
      <div className="ov:flex ov:flex-col ov:md:flex-row">
        <div className="configurator-container ov:w-[700px] ov:h-[500px]"></div>
        <div id="ov25-controls">
          <div id="price-name" className="ov:w-[378px] ov:h-[96px]">
            <div id="price">PRICE: £123</div>
            <div id="name">NAME: Product Name</div>
          </div>
          <h2>Variant Menu</h2>
          <p>This is a placeholder for the variant menu. In a real implementation, this would be populated with variant options.</p>
        </div>
      </div>
    </div>
  );
}

export default App; 