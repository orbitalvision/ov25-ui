import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import { TestBackButton } from '../templates/TestBackButton.jsx';
import sofaImage from '../src/images/sofa.png';
import '../src/index.css';

function App() {
  useEffect(() => {
    injectConfigurator(/** @type {import('ov25-ui').InjectConfiguratorInput[]} */ ([
      {
        apiKey: '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
        productLink: 'snap2/126',
        selectors: {
          configureButton: { selector: '#ov25-fullscreen-button', replace: true },
        },
        callbacks: {
          addToBasket: () => {},
          buyNow: () => {},
          buySwatches: () => {},
        },
        flags: { hidePricing: false },
      },
      {
        apiKey: () => '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
        productLink: () => 'snap2/292',
        selectors: {
          configureButton: { selector: '#test', replace: true },
        },
        callbacks: {
          addToBasket: () => {},
          buyNow: () => {},
          buySwatches: () => {},
        },
        flags: { hidePricing: false },
      },
    ]));
  }, []);

  return (
    <div className="app">
      <TestBackButton />
      <h1>Multiple Configurators</h1>
      <p>Testing multiple Snap2 configurators on the same page</p>
      <div className="ov:mb-8">
        <div className="ov:flex ov:flex-col ov:md:flex-row">
         
          <div id="ov25-aside-menu-1" className="ov:w-full ov:md:w-[35%] ov:h-full ov:md:h-[400px] ov:md:mt-0 ov:md:ml-4">
            <div id="price-name-1" className="ov:w-full">
              <div id="price-1">PRICE: £123</div>
              <div id="name-1">NAME: Product</div>
            </div>
            <div className="ov:flex ov:flex-col">
                <div>
              <button id="ov25-fullscreen-button" className="ov:cursor-pointer ov:bg-black ov:text-white ov:p-2 ov:rounded-md ov:mb-2">
                Configure Otti (100cm)
              </button>
              </div>
              <div>
              <button id="test" className="ov:cursor-pointer ov:bg-black ov:text-white ov:p-2 ov:rounded-md ov:mt-2">
                Configure Otto (115cm)
              </button>
              </div>
            </div>
            
          </div>
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
