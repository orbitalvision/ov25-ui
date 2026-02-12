import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import sofaImage from './images/sofa.png';
import './index.css';

let configuratorInitialized = false;

const initializeConfigurator = () => {
  if (configuratorInitialized) return;

  injectConfigurator({
    apiKey: () => { return '51-dd7de4d1dabdd994b22c406595cfe15589623ec85622b9f721ca4d1dbdb58721' }, 
    productLink: () => { return '1682' }, // Woodbros Pickering-3 Seater (has swatches)
    galleryId: { id: '.configurator-container', replace: true },
    variantsId: '#ov25-controls',
    priceId: { id: '#price', replace: true },
    nameId: { id: '#name', replace: true },
    logoURL: 'https://ov25.orbital.vision/OV.png',
    hidePricing: false,
    addToBasketFunction: () => alert('Checkout function called'),
    buyNowFunction: () => alert('Buy now function called'),
    cssString: `
      .ov25-variant-control {
        background-color: red;
      }
      .ov25-dimensions-width, .ov25-dimensions-height, .ov25-dimensions-depth, .ov25-dimensions-mini {
        background-color: red;
        border: 2px dashed green;
        border-radius: 0px;
        scale: 2;
      }
    `,
  });

  configuratorInitialized = true;
};

function App() {
  useEffect(() => {
    initializeConfigurator();
  }, []);

  return (
    <div className="app">
      <h1>Single Product – Custom CSS</h1>
      <p className="ov:mb-4 ov:text-gray-600">
        This test demonstrates the new custom CSS feature. the variant controls and dimensions are styled with custom CSS.
      </p>
      <div className="ov:flex ov:flex-col ov:md:flex-row">
        <div className="configurator-container ov:w-full ov:aspect-square ov:md:w-[700px] ov:md:h-[500px]">
          <img src={sofaImage} alt="Product" />
        </div>
        <div id="ov25-aside-menu" className="ov:w-full ov:md:w-[35%] ov:h-full ov:md:h-[600px] ov:md:mt-0 ov:md:ml-4">
          <div id="price-name" className="ov:w-full">
            <div id="price">PRICE: £123</div>
            <div id="name">NAME: Product Name</div>
          </div>
          <div id="ov25-controls" />
          <div id="ov25-swatches" />
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
