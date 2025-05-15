import React, { useEffect, useState } from 'react';
import { injectConfigurator } from 'ov25-ui';
import './App.css';

// Set up a global state for the configurator
let configuratorInitialized = false;

// Function to initialize the configurator
const initializeConfigurator = () => {
  if (configuratorInitialized) return;
  
  console.log('Initializing configurator...');
  
  // Inject the configurator
  injectConfigurator({
    apiKey: () => { return import.meta.env.VITE_OV25_API_KEY; }, 
    productLink: () => { return '/range/12' }, 
    onSelectionChange: (selections) => {
      console.log('Selections changed:', selections);
    },
    onProductChange: (product) => {
      console.log('Product changed:', product);
    },
    galleryId: {id: '.configurator-container', replace: true},
    priceNameId: {id: '#price-name', replace: true},
    variantsId: '#ov25-controls',
    checkoutFunction: () => {
      alert('Checkout function called');
    },
    logoURL: 'https://www.arighibianchi.co.uk/cdn/shop/files/Arighi_Bianchi_Horizontal_1854_Logo_CMYK_White_a90a3919-ad62-497c-a763-6198af0e460c_220x.png',
    cssVariables: {
      '--ov25-background-color': '#faf9f8',
      // '--ov25-secondary-background-color': '#b512e9',
      '--ov25-text-color': '#06051c',
      '--ov25-text-color-secondary': '#ffffff',
      '--ov25-panel-header-background-color': '#0c5358',
      //'--ov25-border-color': '#0c5358',
      '--ov25-button-hover-background-color': '#ffffff',
      '--ov25-button-text-color': '#ffffff',
      '--ov25-button-hover-text-color': '#0c5358',
      '--ov25-button-border-color': '#0c5358',
      '--ov25-button-border-width': '2px',
      '--ov25-button-border-radius': '30px',
      '--ov25-overlay-button-color': '#ffffff',
      '--ov25-button-background-color': '#0c5358',
      '--ov25-font-family': 'classico-urw',
    }
  });
  
  configuratorInitialized = true;
};

function App() {
  const [configuratorState, setConfiguratorState] = useState(null);

  // Function to handle configurator state changes
  const handleConfiguratorState = (state) => {
    setConfiguratorState(state);
    console.log('Configurator state updated:', state);
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
        // e.g. store in your state
        console.log("All products:", data);
        break;
      case "CURRENT_PRICE":
        console.log("Updated price:", data);
        break;
      case "CURRENT_PRODUCT_ID":
        console.log("Active product ID:", data);
        break;
      case "CONFIGURATOR_STATE":
        console.log("Configurator state:", data);
        handleConfiguratorState(data);
        break;
      case "RANGE":
        console.log("Range data:", data);
        break;
      case "CURRENT_SKU":
        console.log("Current SKU:", data);
        break;
  
      // ... handle other message types
    }
  };

  // Initialize the configurator after the component has mounted
  useEffect(() => {
    initializeConfigurator();
    window.addEventListener("message", handleMessage);
  }, []);

  return (
    <div className="app">
      <h1>OV25 Configurator Test</h1>
      <div className="layout-container">
        <div className="configurator-container w-[700px] h-[500px]"></div>
        <div id="ov25-controls">
          <div id="price-name" className="w-[378px] h-[96px]">
            <div>PRICE: £123</div>
            <div>NAME: Product Name</div>
          </div>
          <h2>Variant Menu</h2>
          <p>This is a placeholder for the variant menu. In a real implementation, this would be populated with variant options.</p>
        </div>
      </div>
    </div>
  );
}

export default App; 