import React, { useEffect } from 'react';
import { injectConfigurator } from 'ov25-ui';

// Set up a global state for the configurator
let configuratorInitialized = false;

// Function to initialize the configurator
const initializeConfigurator = () => {
  if (configuratorInitialized) return;
  
  // Inject the configurator
  injectConfigurator({
    apiKey: () => { return '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d' }, 
    productLink: () => { return '576' }, 
    // 217 = Woodbros Pickering-3 Seater (Grouped)
    // range/2 Aughton (Non Grouped)
    // 501 Westbridge/glenwood/grand split option (no filters)
    onSelectionChange: (selections) => {
    },
    onProductChange: (product) => {
    },
    images: [
      'https://demo.orbital.vision/_next/image?url=https%3A%2F%2Flondon-website-general-purpose.s3.eu-west-2.amazonaws.com%2Fassets%2Forganizations%2F15%2Fproducts%2FTamarisk%2F45%2FWindrush-Large-Sofa-Front.png&w=1920&q=75',
      'https://demo.orbital.vision/_next/image?url=https%3A%2F%2Flondon-website-general-purpose.s3.eu-west-2.amazonaws.com%2Fassets%2Forganizations%2F15%2Fproducts%2FTamarisk%2F45%2FWindrush-Large-Sofa-Angled.png&w=1920&q=75',
      'https://demo.orbital.vision/_next/image?url=https%3A%2F%2Flondon-website-general-purpose.s3.eu-west-2.amazonaws.com%2Fassets%2Forganizations%2F15%2Fproducts%2FTamarisk%2F45%2FWindrush-Large-Sofa-Side.png&w=1920&q=75',
      'https://demo.orbital.vision/_next/image?url=https%3A%2F%2Flondon-website-general-purpose.s3.eu-west-2.amazonaws.com%2Fassets%2Forganizations%2F15%2Fproducts%2FTamarisk%2F45%2FWindrush-Large-Sofa-Back.png&w=1920&q=75',
    ],
    galleryId: {id: '.configurator-container', replace: true},
    priceId: {id: '#price', replace: true},
    nameId: {id: '#name', replace: true},
    deferThreeD: false,
    variantsId: '#ov25-controls',
    carouselId: true,
    showOptional: true,
    logoURL: 'https://ov25.orbital.vision/OV.png',

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
        console.log("ALL_PRODUCTS", data);
        break;
      case "CURRENT_PRICE":
        console.log("CURRENT_PRICE", data);
        break;
      case "CURRENT_PRODUCT_ID":
        console.log("CURRENT_PRODUCT_ID", data);
        break;
      case "CONFIGURATOR_STATE":
        console.log("CONFIGURATOR_STATE", data);
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
    <div className="app ">
      <h1>OV25 Configurator Test</h1>
      <div className="ov:flex ov:flex-col ov:md:flex-row">
        <div className="configurator-container ov:w-full ov:aspect-square ov:md:w-[700px] ov:md:h-[500px]"></div>
        <div id="ov25-aside-menu" className="ov:w-full ov:md:w-[35%] ov:h-full ov:md:h-[600px] ov:md:mt-0 ov:md:ml-4 ov:mt-[100px]">
          <div id="price-name" className="ov:w-full ov:md:w-[378px] ov:h-[96px]">
            <div id="price">PRICE: £123</div>
            <div id="name">NAME: Product Name</div>
          </div>
          <div id='ov25-controls' >

          </div>
          <p className='ov:mt-4'>This is a description of the product. Words will go here - it might continue for a few lines. It might be a few sentences long. </p>
        </div>
      </div>
    </div>
  );
}

export default App; 