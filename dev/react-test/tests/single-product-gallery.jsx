import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const baseConfig = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
  productLink: () => '58',
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    variants: '#ov25-controls',
    swatches: '#ov25-swatches',
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
  },
  carousel: { desktop: 'stacked', mobile: 'carousel' },
  configurator: {
    displayMode: { desktop: 'sheet', mobile: 'drawer' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: { displayMode: { desktop: 'tabs', mobile: 'list' } },
  },
  callbacks: {
    addToBasket: () => alert('Add to basket'),
    buyNow: () => alert('Buy now'),
    buySwatches: () => alert('Add swatches to cart'),
  },
  flags: { hidePricing: false },
});

function App() {
  const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const deferThreeD = qs.get('defer3d') !== '0';
  const config = {
    ...baseConfig,
    flags: { ...baseConfig.flags, deferThreeD },
  };

  const linkClass = (active) =>
    active ? 'ov:bg-black ov:text-white' : 'ov:bg-gray-200 ov:text-gray-800 ov:hover:bg-gray-300';

  const deferOptions = [
    { label: 'On', param: '1', active: deferThreeD },
    { label: 'Off', param: '0', active: !deferThreeD },
  ];

  return (
    <TestPageLayout
      title="Product Gallery UI Configurator"
      description="Full product gallery with 3D viewer, variants, carousel thumbnails, price, name, and swatches."
      injectConfig={config}
      showProductTabs
      topContent={
        <div className="ov:flex ov:flex-wrap ov:gap-2 ov:mb-3 ov:text-sm ov:items-center">
          <span className="ov:text-gray-600">defer3D:</span>
          {deferOptions.map((opt) => {
            const params = new URLSearchParams(window.location.search);
            params.set('defer3d', opt.param);
            return (
              <a
                key={opt.label}
                href={`?${params}`}
                className={`ov:px-2 ov:py-1 ov:rounded ov:no-underline ${linkClass(opt.active)}`}
              >
                {opt.label}
              </a>
            );
          })}
        </div>
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
