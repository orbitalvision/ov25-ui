import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const baseConfig = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => '51-dd7de4d1dabdd994b22c406595cfe15589623ec85622b9f721ca4d1dbdb58721',
  productLink: () => '1682',
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
    variants: { displayMode: { desktop: 'list', mobile: 'list' } },
  },
  callbacks: {
    addToBasket: (payload) => alert(`Checkout: ${payload?.price?.formattedPrice ?? '—'} / ${payload?.skus?.skuString ?? '—'}`),
    buyNow: (payload) => alert(`Buy now: ${payload?.price?.formattedPrice ?? '—'} / ${payload?.skus?.skuString ?? '—'}`),
    buySwatches: () => alert('Add swatches to cart'),
    onChange: (payload) => console.log('onChange', payload),
  },
  branding: {
    cssString: `
      .ov25-variant-control {
        background-color: red;
      }
        
      #ov25-share-button, 
      #ov25-desktop-dimensions-toggle-button, 
      #ov25-mobile-dimensions-toggle-button, 
      #ov25-ar-toggle-button,
      #ov25-desktop-fullscreen-button,
      #ov25-animation-toggle-button {
        background-color: blue;
      }

      .ov25-dimensions-width, .ov25-dimensions-height, .ov25-dimensions-depth, .ov25-dimensions-mini {
        background-color: red;
        border: 2px dashed green;
        border-radius: 0px;
        scale: 2;
      }

      #ov25-configurator-variant-menu-container > button {
        background-color: orange;
        color: red;
      }

      .ov25-close-button {
        background-color: green;
        color: white;
      }

      #ov25-filter-controls-button {
        background-color: purple;
        color: white;
      }

      #ov25-filter-controls-swatches {
        background-color: yellow;
        color: black;
      }

      #ov25-filter-control-swatches svg {
        fill: red;
      }

      #ov25-selected-swatches-container {
        background-color: blue;
        color: white;
      }

      #ov25-variants-header {
        background: cyan;
      }

      .ov25-variant-header-logo {
        background: linear-gradient(to right, #0c5358, #0c5358);
      }
      
      #ov25-filter-controls-wrapper {
        background: lightcoral;
      }

      #ov25-filter-controls-search {
        background: lightblue;
      }

      #ov25-variants-content-wrapper {
        background: lightgreen;
      }

      .ov25-option-header {
        background: rebeccapurple;
      }

      .ov25-group-header {
        background: goldenrod;
      }

      .ov25-variant-group-content {
        background: darkblue;
      }

      .ov25-variant-name {
        color: gold;
      }

      .ov25-checkout-button-wrapper {
        background: pink;
      }

      .ov25-wizard-button-block {
        background: pink;
      }

      .ov25-wizard-button-back {
        background: blanchedalmond;
      }

      .ov25-wizard-button-next {
        background: green;
      }

      .ov25-wizard-button-option {
        background: lightgreen;
      }

      .ov25-wizard-button-option-image {
        background: lightblue;
      }

      .ov25-wizard-button-option-name {
        background: lightcoral;
      }

      .ov25-wizard-button-option-value {
        background: lightblue;
      }

      #ov25-checkout-button {
        background: orange;
        color: black;
      }

      #ov25-add-to-basket-button {
        background: red;
        color: black;
      }

      .ov25-filter-content-wrapper {
        background: brown;
      }

      .ov25-filter-option-header {
        background: lightcoral;
      }

      .ov25-filter-group-header {
        background: lightblue;
      }

      .ov25-filter-pill {
        background: lightgreen;
      }
      
      .ov25-checkout-combo-button-text {
        color: black;
      }

      #ov25-swatchbook {
        background: lightgreen;
      }

      #ov25-swatchbook-title {
        color: pink;
      }

      .ov25-selected-swatch-image-container {
        background: yellow;
      }

      .ov25-selected-swatch-name {
        color: green;
      }

      .ov25-selected-swatch-option {
        color: blue;
      }

      .ov25-selected-swatch-sku {
        color: red;
      }
      
      .ov25-selected-swatch-description {
        color: purple;
      }

      .ov25-swatchbook-total-cost { 
        background: lightcoral;
      }

      #ov25-swatchbook-add-to-cart-button {
        background: darkblue;
      }

      .ov25-tabs-header {
        background: lightcoral;
      }

      #ov25-tabs-dropdown-select {
        background: lightblue;
      }

      .ov25-tabs-button {
        background: lightgreen;
      }

      .ov25-wizard-current-step {
        color: green;
      }

      .ov25-wizard-next-step {
        color: blue;
      }
    `,
  },
  flags: { hidePricing: false },
});

const VARIANT_DISPLAY_TYPES = ['tree', 'list', 'tabs', 'accordion', 'wizard'];
/** Sheet = desktop sheet + mobile drawer. Inline = both inline. */
const CONFIG_DISPLAY_OPTIONS = [
  { value: 'sheet', label: 'sheet', displayMode: { desktop: 'sheet', mobile: 'drawer' } },
  { value: 'inline', label: 'inline', displayMode: { desktop: 'inline', mobile: 'inline' } },
];

function App() {
  const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const displayFromUrl = qs.get('display') || 'list';
  const menuFromUrl = qs.get('menu') || 'sheet';
  const mobileVariantDisplay = displayFromUrl === 'accordion' ? 'list' : displayFromUrl;
  const configDisplay = CONFIG_DISPLAY_OPTIONS.find((o) => o.value === menuFromUrl) ?? CONFIG_DISPLAY_OPTIONS[0];
  const config = {
    ...baseConfig,
    configurator: {
      ...baseConfig.configurator,
      displayMode: configDisplay.displayMode,
      variants: { displayMode: { desktop: displayFromUrl, mobile: mobileVariantDisplay } },
    },
  };

  const linkClass = (active) =>
    active ? 'ov:bg-black ov:text-white' : 'ov:bg-gray-200 ov:text-gray-800 ov:hover:bg-gray-300';

  return (
    <TestPageLayout
      title="Single Product – Custom CSS"
      description="Variant controls and dimensions styled with custom CSS."
      injectConfig={config}
      topContent={
        <div className="ov:flex ov:flex-col ov:gap-2 ov:mb-3 ov:text-sm">
          <div className="ov:flex ov:flex-wrap ov:gap-2 ov:items-center">
            <span className="ov:text-gray-600">Menu display:</span>
            {CONFIG_DISPLAY_OPTIONS.map((opt) => {
              const params = new URLSearchParams(window.location.search);
              params.set('menu', opt.value);
              return (
                <a
                  key={opt.value}
                  href={`?${params}`}
                  className={`ov:px-2 ov:py-1 ov:rounded ov:no-underline ${linkClass(opt.value === menuFromUrl)}`}
                >
                  {opt.label}
                </a>
              );
            })}
          </div>
          <div className="ov:flex ov:flex-wrap ov:gap-2 ov:items-center">
            <span className="ov:text-gray-600">Variants display:</span>
            {VARIANT_DISPLAY_TYPES.map((d) => {
              const params = new URLSearchParams(window.location.search);
              params.set('display', d);
              return (
                <a
                  key={d}
                  href={`?${params}`}
                  className={`ov:px-2 ov:py-1 ov:rounded ov:no-underline ${linkClass(d === displayFromUrl)}`}
                >
                  {d}
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
