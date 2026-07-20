import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const MAZE_APIKEY = import.meta.env.VITE_MAZE_APIKEY;
const WHITEMEADOW_APIKEY = import.meta.env.VITE_WHITEMEADOW_APIKEY;
const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  // apiKey: () => MAZE_APIKEY,
  // productLink: () => 'snap2/445',
  
  apiKey: () => WHITEMEADOW_APIKEY,
  productLink: () => 'snap2/119',
  configurationUuid: () => '8be3bd4c-e9f9-4ed1-9e59-5cad79435ace',
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    configureButton: { selector: '#ov25-fullscreen-button', replace: false },
    variants: '#ov25-controls',
    swatches: '#ov25-swatches',
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
  },
  carousel: { desktop: 'stacked', mobile: 'carousel' },
  configurator: {
    displayMode: { desktop: 'sheet', mobile: 'drawer' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: { displayMode: { desktop: 'tree', mobile: 'list' } },
  },
  callbacks: {
    addToBasket: () => {},
    buyNow: () => {},
    buySwatches: () => {},
  },
  flags: { hidePricing: false },
});

function App() {
  return (
    <TestPageLayout
      title="Snap2 with Configuration UUID"
      description="Snap2 configuration with specific configuration UUID."
      injectConfig={config}
      asideSlot={
        <button id="ov25-fullscreen-button" className="ov:cursor-pointer ov:bg-transparent ov:text-white ov:p-2 ov:rounded-md ov:mb-2">
          Configure Your Sofa
        </button>
      }
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
