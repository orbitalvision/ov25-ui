import React, { useEffect } from 'react';
import { injectConfigurator } from 'ov25-ui';
import sofaImage from './images/sofa.png';

// Set up a global state for the configurator
let configuratorInitialized = false;

// Function to initialize the configurator
const initializeConfigurator = () => {
  if (configuratorInitialized) return;

  // Inject the configurator
  injectConfigurator(/** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
    apiKey: () => '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
    productLink: () => '607',
    selectors: {
      gallery: { selector: '.configurator-container', replace: true },
      variants: '#ov25-controls',
      price: { selector: '#price', replace: true },
      name: { selector: '#name', replace: true },
    },
    callbacks: {
      addToBasket: () => {},
      buyNow: () => {},
      buySwatches: () => {},
    },
    flags: { hidePricing: true },
  }));

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
    <div className="app ">
      <h1>Your Website</h1>
      <div className="ov:flex ov:flex-col ov:md:flex-row">
        <div className="configurator-container ov:w-full ov:aspect-square ov:md:w-[700px] ov:md:h-[500px]">
          <img src={sofaImage} alt="Product Image" />
        </div>
        <div id="ov25-aside-menu" className="ov:w-full ov:md:w-[35%] ov:h-full ov:md:h-[600px] ov:md:mt-0 ov:md:ml-4">
          <div id="price-name" className="ov:w-full ov:md:w-[378px] ov:h-[96px]">
            <div id="price">PRICE: £123</div>
            <div id="name">NAME: Product Name</div>
          </div>
          <button id="ov25-fullscreen-button" className='ov:cursor-pointer ov:bg-transparent ov:text-white ov:p-2 ov:rounded-md'>Configure Your Sofa</button>
          <div id='ov25-controls'></div>
          <div id="ov25-swatches"></div>
           </div>
      </div>
    </div>
  );
}

export default App; 