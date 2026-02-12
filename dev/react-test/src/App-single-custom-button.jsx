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
  });

  configuratorInitialized = true;
};

function App() {
  useEffect(() => {
    initializeConfigurator();
  }, []);

  return (
    <div className="app">
      <h1>Single Product – Custom open/close buttons</h1>
      <p className="ov:mb-4 ov:text-gray-600">
        These buttons use <code>window.ov25OpenConfigurator(optionName?)</code> / <code>window.ov25CloseConfigurator</code> and{' '}
        <code>window.ov25OpenSwatchBook</code> / <code>window.ov25CloseSwatchBook</code>. Pass an option name (case insensitive) to open the configurator on that option, e.g. <code>ov25OpenConfigurator('Fabric')</code>.
      </p>
      <div className="ov:flex ov:flex-wrap ov:gap-2 ov:mb-4">
        <button
          type="button"
          onClick={() => {
            if (typeof window.ov25OpenConfigurator === 'function') {
              window.ov25OpenConfigurator();
            } else {
              console.warn('ov25OpenConfigurator not yet available (configurator may still be mounting).');
            }
          }}
          className="ov:px-4 ov:py-2 ov:bg-black ov:text-white ov:rounded-md ov:cursor-pointer"
        >
          Open configurator
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof window.ov25CloseConfigurator === 'function') {
              window.ov25OpenConfigurator('wood finishers');
            } else {
              console.warn('ov25OpenConfigurator not yet available.');
            }
          }}
          className="ov:px-4 ov:py-2 ov:bg-gray-700 ov:text-white ov:rounded-md ov:cursor-pointer"
        >
          Open configurator (Wood finishes)
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof window.ov25OpenSwatchBook === 'function') {
              window.ov25OpenSwatchBook();
            } else {
              console.warn('ov25OpenSwatchBook not yet available.');
            }
          }}
          className="ov:px-4 ov:py-2 ov:bg-emerald-700 ov:text-white ov:rounded-md ov:cursor-pointer"
        >
          Open swatches
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof window.ov25CloseSwatchBook === 'function') {
              window.ov25CloseSwatchBook();
            } else {
              console.warn('ov25CloseSwatchBook not yet available.');
            }
          }}
          className="ov:px-4 ov:py-2 ov:bg-emerald-900 ov:text-white ov:rounded-md ov:cursor-pointer"
        >
          Close swatches
        </button>
      </div>
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
