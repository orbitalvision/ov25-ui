import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import sofaImage from './images/sofa.png';
import './index.css';

// Set up a global state for the configurator
let configuratorInitialized = false;

// Function to initialize the configurator
const initializeConfigurator = () => {
  if (configuratorInitialized) return;

  // Inject the configurator - Single product without variants
  injectConfigurator({
    apiKey: () => { return '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d' }, 
    productLink: () => { return '607' }, // Windrush - Loveseat
    galleryId: { id: '.configurator-container', replace: true },
    priceId: { id: '#price', replace: true },
    nameId: { id: '#name', replace: true },
  });

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
      <h1>Single Product - No Variants</h1>
      <div className="ov:flex ov:flex-col ov:md:flex-row">
        <div className="configurator-container ov:w-full ov:aspect-square ov:md:w-[700px] ov:md:h-[500px]">
          <img src={sofaImage} alt="Product Image" />
        </div>
        <div id="ov25-aside-menu" className="ov:w-full ov:md:w-[35%] ov:h-full ov:md:h-[600px] ov:md:mt-0 ov:md:ml-4">
          <div id="price-name" className="ov:w-full ov:md:w-[378px]">
            <div id="price">PRICE: £123</div>
            <div id="name">NAME: Product Name</div>
          </div>
          <div id='ov25-controls'></div>
          <div id="ov25-swatches"></div>
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
