import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const CHAIR_STUDIO_APIKEY = import.meta.env.VITE_CHAIR_STUDIO_APIKEY;
const HOST_IMAGE_COUNTS = [0, 1, 3, 5];
const SELECTED_THUMBNAIL_CSS = `
  #ov25-product-carousel button[data-selected="true"] {
    border: 4px solid #dc2626 !important;
    box-sizing: border-box;
  }
`;

function makeShopifyImage(index) {
  const colours = ['#183153', '#8f5d46', '#40695b', '#74558b', '#b06d3b'];
  const label = `Shopify ${index + 1}`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="${colours[index % colours.length]}" />
      <text x="600" y="450" dominant-baseline="middle" text-anchor="middle"
        fill="white" font-family="Arial, sans-serif" font-size="112" font-weight="700">
        ${label}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const deferThreeD = searchParams.get('defer3d') === '1';
  const requestedHostImageCount = Number(searchParams.get('hostImages') ?? 1);
  const hostImageCount = HOST_IMAGE_COUNTS.includes(requestedHostImageCount)
    ? requestedHostImageCount
    : 1;
  const shopifyImages = Array.from({ length: hostImageCount }, (_, index) =>
    makeShopifyImage(index),
  );

  const fixtureHref = (next) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(next).forEach(([key, value]) => params.set(key, String(value)));
    return `?${params}`;
  };

  const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
    apiKey: () => CHAIR_STUDIO_APIKEY,
    productLink: () => 'range/326',
    // Shopify media is passed first; OV25 appends the selected range product's
    // Hero/Cutout/Gallery metadata images after these host images.
    images: shopifyImages,
    selectors: {
      gallery: { selector: '.configurator-container', replace: true },
      variants: '#ov25-controls',
      swatches: '#ov25-swatches',
      price: { selector: '#price', replace: true },
      name: { selector: '#name', replace: true },
    },
    carousel: { desktop: 'carousel', mobile: 'carousel' },
    branding: { cssString: SELECTED_THUMBNAIL_CSS },
    configurator: {
      displayMode: { desktop: 'inline', mobile: 'drawer' },
      triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
      variants: { displayMode: { desktop: 'tabs', mobile: 'list' } },
    },
    callbacks: {
      addToBasket: () => alert('Add to basket'),
      buyNow: () => alert('Buy now'),
      buySwatches: () => alert('Add swatches to cart'),
    },
    flags: { hidePricing: false, deferThreeD },
  });

  const optionClass = (active) =>
    active
      ? 'ov:bg-black ov:text-white'
      : 'ov:bg-gray-200 ov:text-gray-800 ov:hover:bg-gray-300';

  return (
    <TestPageLayout
      title="Range carousel - Shopify + OV25 indexing"
      description="Chair Studio range/326: Shopify host images followed by the selected OV25 product's Cutout and Gallery images in a horizontal carousel."
      injectConfig={config}
      showProductTabs
      topContent={
        <div className="ov:flex ov:flex-wrap ov:items-center ov:gap-2 ov:mb-3 ov:text-sm">
          <span className="ov:text-gray-600">Requested deferThreeD:</span>
          <a
            href={fixtureHref({ defer3d: 1 })}
            data-defer-three-d="true"
            className={`ov:px-2 ov:py-1 ov:rounded ov:no-underline ${optionClass(deferThreeD)}`}
          >
            On
          </a>
          <a
            href={fixtureHref({ defer3d: 0 })}
            data-defer-three-d="false"
            className={`ov:px-2 ov:py-1 ov:rounded ov:no-underline ${optionClass(!deferThreeD)}`}
          >
            Off
          </a>
          <output data-testid="requested-defer-three-d">
            flags.deferThreeD = {String(deferThreeD)}
          </output>
          <span className="ov:ml-2 ov:text-gray-600">Shopify images:</span>
          {HOST_IMAGE_COUNTS.map((count) => (
            <a
              key={count}
              href={fixtureHref({ hostImages: count })}
              data-host-image-count={count}
              className={`ov:px-2 ov:py-1 ov:rounded ov:no-underline ${optionClass(hostImageCount === count)}`}
            >
              {count}
            </a>
          ))}
          <output data-testid="host-image-count">
            images.length = {hostImageCount}
          </output>
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
