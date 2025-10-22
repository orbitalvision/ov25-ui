import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import sofaImage from './images/sofa.png';
import './index.css';

// Function to initialize the first configurator
const initializeConfigurator1 = () => {

  // Inject the first configurator
  injectConfigurator({
    apiKey: () => { return '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d' }, 
    productLink: () => { return 'snap2/126' }, // Otti range
    configureButtonId: { id: '#ov25-fullscreen-button', replace: false },
    logoURL: 'https://ov25.orbital.vision/OV.png',
    hidePricing: true,
  });
};

// Function to initialize the second configurator
const initializeConfigurator2 = () => {

  // Inject the second configurator
  injectConfigurator({
    apiKey: () => { return '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d' }, 
    productLink: () => { return 'snap2/4' }, // Otto range
    configureButtonId: { id: '#ov25-fullscreen-button-2', replace: false },
    logoURL: 'https://ov25.orbital.vision/OV.png',
    hidePricing: true,
  });
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

  useEffect(() => {
    window.addEventListener("message", handleMessage);
  }, []);

  return (
    <div className="app">
      <h1>Multiple Configurators</h1>
      <p>Testing multiple configurators on the same page</p>
      <div className="ov:mb-8">
        <div className="ov:flex ov:flex-col ov:md:flex-row">
          <div className="configurator-container-1 ov:w-full ov:aspect-square ov:md:w-[500px] ov:md:h-[400px]">
            <img src={sofaImage} alt="Product Image" />
          </div>
          <div id="ov25-aside-menu-1" className="ov:w-full ov:md:w-[35%] ov:h-full ov:md:h-[400px] ov:md:mt-0 ov:md:ml-4">
            <div id="price-name-1" className="ov:w-full">
              <div id="price-1">PRICE: £123</div>
              <div id="name-1">NAME: Product</div>
            </div>
            <div className='ov:flex ov:flex-col'>
              <button id="ov25-fullscreen-button" onClick={initializeConfigurator1} className='ov:cursor-pointer ov:bg-blue-500 ov:text-white ov:p-2 ov:rounded-md ov:mb-2'>Configure Otti (100cm)</button>
              <button id="ov25-fullscreen-button-2" onClick={initializeConfigurator2} className='ov:cursor-pointer ov:bg-blue-500 ov:text-white ov:p-2 ov:rounded-md ov:mt-2'>Configure Otto (115cm)</button>
            </div>
            <div id='ov25-controls-1'></div>
            <div id="ov25-swatches-1"></div>
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
