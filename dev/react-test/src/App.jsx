import React, { useEffect } from 'react';
import { injectConfigurator } from 'ov25-ui';
import sofaImage from './images/sofa.png';

// Set up a global state for the configurator
let configuratorInitialized = false;

// Function to initialize the configurator
const initializeConfigurator = () => {
  if (configuratorInitialized) return;

  // Inject the configurator
  injectConfigurator({
    apiKey: () => { return '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d' }, 
    // productLink: () => { return '607' }, 
    // productLink: () => { return 'range/77' },
    productLink: () => { return 'snap2/4' }, 
    configureButtonId: { id: '#ov25-fullscreen-button', replace: true },
    // configurationUuid: () => { return '1ae1bb48-d4d0-41ae-92b4-758a64bdd334' },
    // 217 = Woodbros Pickering-3 Seater (Grouped)
    // range/2 Aughton (Non Grouped)
    // 501 Westbridge/glenwood/grand split option (no filters)
    // onSelectionChange: (selections) => {
    // },
    // onProductChange: (product) => {
    // },
    // images: [
    //   'https://demo.orbital.vision/_next/image?url=https%3A%2F%2Flondon-website-general-purpose.s3.eu-west-2.amazonaws.com%2Fassets%2Forganizations%2F15%2Fproducts%2FTamarisk%2F45%2FWindrush-Large-Sofa-Front.png&w=1920&q=75',
    //   'https://demo.orbital.vision/_next/image?url=https%3A%2F%2Flondon-website-general-purpose.s3.eu-west-2.amazonaws.com%2Fassets%2Forganizations%2F15%2Fproducts%2FTamarisk%2F45%2FWindrush-Large-Sofa-Angled.png&w=1920&q=75',
    //   'https://demo.orbital.vision/_next/image?url=https%3A%2F%2Flondon-website-general-purpose.s3.eu-west-2.amazonaws.com%2Fassets%2Forganizations%2F15%2Fproducts%2FTamarisk%2F45%2FWindrush-Large-Sofa-Side.png&w=1920&q=75',
    //   'https://demo.orbital.vision/_next/image?url=https%3A%2F%2Flondon-website-general-purpose.s3.eu-west-2.amazonaws.com%2Fassets%2Forganizations%2F15%2Fproducts%2FTamarisk%2F45%2FWindrush-Large-Sofa-Back.png&w=1920&q=75',
    // ],
    // galleryId: { id: '.configurator-container', replace: true },
    // variantsId: '#ov25-controls',
    priceId: { id: '#price', replace: true },
    nameId: { id: '#name', replace: true },
    // deferThreeD: false,
    // variantsId: '#ov25-controls',
    // swatchesId: '#ov25-swatches',
    // carouselId: true,
    // showOptional: true,
    logoURL: 'https://ov25.orbital.vision/OV.png',
    // addToBasketFunction: () => {
    //   alert('Checkout function called');
    // },
    // buyNowFunction: () => {
    //   alert('Buy now function called');
    // },
    // addSwatchesToCartFunction: (swatches, swatchRulesData) => {
    //   console.log('Add swatches to cart function called with:', { swatches, swatchRulesData });
    //   alert(`Add swatches to cart function called with ${swatches.length} swatches`);
    // },
    hidePricing: true,
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
          <div id="ov25-fullscreen-button"></div>
          <div id='ov25-controls'></div>
          <div id="ov25-swatches"></div>
           </div>
      </div>
    </div>
  );
}

export default App; 