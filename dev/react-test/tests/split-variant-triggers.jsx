import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import sofaImage from '../src/images/sofa.png';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;

const DEMO_GALLERY_IMAGES = [
  sofaImage,
  ...Array.from({ length: 4 }, (_, i) => `https://picsum.photos/600/600?random=${i + 50}`),
];

const baseConfig = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => DEMO_RETAILER_APIKEY,
  productLink: () => '58',
  images: DEMO_GALLERY_IMAGES,
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
    triggerStyle: { desktop: 'split-buttons', mobile: 'split-buttons' },
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
      title="Split variant triggers (ProductOptions)"
      description="Same as full gallery but triggerStyle split-buttons so per-option rows (class ov25-variant-control) render in the variants slot. Inspect #ov25-controls → shadow root → #ov25-configurator-variant-menu-container."
      injectConfig={config}
      showProductTabs
      topContent={
        <div className="ov:flex ov:flex-col ov:gap-2 ov:mb-3 ov:text-sm">
          <div className="ov:flex ov:flex-wrap ov:gap-2 ov:items-center">
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
