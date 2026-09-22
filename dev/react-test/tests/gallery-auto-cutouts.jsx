import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import sofaImage from '../src/images/sofa.png';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;

/**
 * Host images sit AFTER the auto cutouts, so the strip reads: material shot, four cutouts, then
 * whatever the shop already had. Keeping a couple here is the point of the fixture — it shows the
 * live tiles are prepended rather than replacing the retailer's own photography.
 */
const DEMO_GALLERY_IMAGES = [
  sofaImage,
  ...Array.from({ length: 2 }, (_, i) => `https://picsum.photos/600/600?random=${i + 70}`),
];

const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
const autoCutouts = qs.get('autoCutouts') !== '0';
const deferThreeD = qs.get('defer3d') !== '0';
// maxImages caps the strip; the default here is deliberately generous enough to show the material
// shot, all four cutouts and the host images at once.
const maxImages = Number.parseInt(qs.get('maxImages') ?? '', 10) || 8;
// Stacked opens tiles in a fullscreen lightbox instead of swapping the main stage, so both gallery
// layouts need checking whenever cutout sizing changes.
const galleryLayout = qs.get('layout') === 'stacked' ? 'stacked' : 'carousel';

const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => DEMO_RETAILER_APIKEY,
  productLink: () => '58',
  images: DEMO_GALLERY_IMAGES,
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    variants: '#ov25-controls',
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
  },
  carousel: {
    desktop: galleryLayout,
    mobile: 'carousel',
    maxImages,
    autoCutouts,
  },
  configurator: {
    displayMode: { desktop: 'inline', mobile: 'inline' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: { displayMode: { desktop: 'list', mobile: 'list' } },
  },
  callbacks: {
    addToBasket: () => alert('Add to basket'),
    buyNow: () => alert('Buy now'),
    buySwatches: () => alert('Add swatches to cart'),
  },
  flags: { hidePricing: false, deferThreeD },
});

function ToggleLinks({ label, param, options }) {
  const linkClass = (active) =>
    active ? 'ov:bg-black ov:text-white' : 'ov:bg-gray-200 ov:text-gray-800 ov:hover:bg-gray-300';
  return (
    <div className="ov:flex ov:flex-wrap ov:gap-2 ov:text-sm ov:items-center">
      <span className="ov:text-gray-600">{label}:</span>
      {options.map((opt) => {
        const params = new URLSearchParams(window.location.search);
        params.set(param, opt.value);
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
  );
}

function App() {
  return (
    <TestPageLayout
      title="Gallery Auto Cutouts"
      description={
        'Auto cutouts on: the carousel leads with a material shot and four live cutouts (front-left, ' +
        'front, left-side, rear) of the current build. Change a fabric and the whole set re-renders. ' +
        'Auto cutouts off: only the host images and product metadata images remain.'
      }
      injectConfig={config}
      showProductTabs
      topContent={
        <div
          className="ov:flex ov:flex-wrap ov:gap-4 ov:mb-3 ov:items-center"
          data-auto-cutouts={autoCutouts ? 'on' : 'off'}
        >
          <ToggleLinks
            label="autoCutouts"
            param="autoCutouts"
            options={[
              { label: 'On', value: '1', active: autoCutouts },
              { label: 'Off', value: '0', active: !autoCutouts },
            ]}
          />
          <ToggleLinks
            label="layout"
            param="layout"
            options={[
              { label: 'Carousel', value: 'carousel', active: galleryLayout === 'carousel' },
              { label: 'Stacked', value: 'stacked', active: galleryLayout === 'stacked' },
            ]}
          />
          <ToggleLinks
            label="defer3D"
            param="defer3d"
            options={[
              { label: 'On', value: '1', active: deferThreeD },
              { label: 'Off', value: '0', active: !deferThreeD },
            ]}
          />
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
