import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const baseConfig = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
  productLink: () => '217',
  selectors: {
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
    configureButton: { selector: '[data-ov25-configure-button]', replace: true },
  },
  carousel: { desktop: 'stacked', mobile: 'carousel' },
  configurator: {
    displayMode: { desktop: 'modal', mobile: 'modal' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: {
      displayMode: { desktop: 'tabs', mobile: 'list' },
      useSimpleVariantsSelector: true,
    },
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
  // Default off = in-page gallery in modal. ?defer3d=1 = no gallery slot + deferred preload into modal.
  const deferThreeD = qs.get('defer3d') === '1';

  const config = {
    ...baseConfig,
    ...(deferThreeD
      ? {
          deferThreeD: true,
          flags: { ...baseConfig.flags, deferThreeD: true },
        }
      : {
          selectors: {
            ...baseConfig.selectors,
            gallery: { selector: '.configurator-container', replace: true },
          },
        }),
  };

  const linkClass = (active) =>
    active ? 'ov:bg-black ov:text-white' : 'ov:bg-gray-200 ov:text-gray-800 ov:hover:bg-gray-300';

  const deferOptions = [
    { label: 'On', param: '1', active: deferThreeD },
    { label: 'Off', param: '0', active: !deferThreeD },
  ];

  return (
    <TestPageLayout
      title="Configure button — Modal"
      description={
        deferThreeD
          ? 'defer3D on: no gallery slot — 3D preloads in a hidden container, then moves into the modal. Toggle off for an in-page gallery that repositions when the modal opens.'
          : 'defer3D off: gallery replaces .configurator-container; modal repositions the iframe into the dialog. Toggle defer3D on to test preload without a page gallery.'
      }
      injectConfig={config}
      renderControls={false}
      renderSwatches={false}
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
      asideSlot={
        <button
          type="button"
          data-ov25-configure-button
          className="ov:mt-4 ov:px-4 ov:py-2 ov:bg-transparent ov:text-white ov:rounded-md ov:cursor-pointer hover:ov:bg-blue-700"
        >
          Configure
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
