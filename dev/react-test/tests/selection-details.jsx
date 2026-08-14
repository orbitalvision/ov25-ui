import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  readSelectionDetailsFixtureQuery,
  SelectionDetailsControls,
} from '../templates/SelectionDetailsControls.jsx';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const DEV_RETAILER_APIKEY = import.meta.env.VITE_DEV_RETAILER_APIKEY;

const PRESETS = {
  'selection-details-tooltip-sheet': {
    title: 'Selection details — Tooltip / Fullscreen',
    description: 'Desktop tooltip and animated mobile fullscreen using swatch fixture product 1682.',
    desktopDetails: 'tooltip',
    mobileDetails: 'fullscreen',
  },
  'selection-details-modal': {
    title: 'Selection details — Modal',
    description: 'Near-fullscreen modal selection details using swatch fixture product 1682.',
    desktopDetails: 'modal',
    mobileDetails: 'modal',
  },
  'selection-details-fullscreen': {
    title: 'Selection details — Fullscreen',
    description: 'Instant desktop and right-sliding mobile fullscreen details using swatch fixture product 1682.',
    desktopDetails: 'fullscreen',
    mobileDetails: 'fullscreen',
  },
};

function getPreset() {
  const pageName = window.location.pathname.split('/').pop()?.replace(/\.html$/, '');
  return PRESETS[pageName] ?? PRESETS['selection-details-tooltip-sheet'];
}

function BelowFoldProductContent() {
  const sections = [
    {
      title: 'Materials and care',
      copy: 'Performance upholstery, solid timber framing, and removable seat cushions designed for everyday use.',
    },
    {
      title: 'Dimensions',
      copy: 'Review the overall width, seat height, and clearance recommendations before placing your order.',
    },
    {
      title: 'Delivery and returns',
      copy: 'Made-to-order pieces include room-of-choice delivery and a dedicated delivery-day support team.',
    },
  ];

  return (
    <div
      className="ov:mt-10 ov:space-y-6 ov:pb-32"
      data-selection-details-scroll-content
    >
      <h2 className="ov:text-2xl ov:font-semibold">Product information</h2>
      {sections.map((section) => (
        <section
          key={section.title}
          className="ov:min-h-[180px] ov:rounded-lg ov:border ov:border-gray-200 ov:bg-gray-50 ov:p-6"
        >
          <h3 className="ov:mb-3 ov:text-lg ov:font-semibold">{section.title}</h3>
          <p className="ov:max-w-3xl ov:text-[#525252]">{section.copy}</p>
        </section>
      ))}
    </div>
  );
}

function App() {
  const preset = getPreset();
  const values = readSelectionDetailsFixtureQuery({
    ...preset,
    variantStyle: 'tree',
    configuratorMode: 'sheet',
  });
  const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
    apiKey: () => DEV_RETAILER_APIKEY,
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
      displayMode: values.configuratorDisplayMode,
      triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
      variants: {
        displayMode: {
          desktop: values.variantStyle,
          mobile: values.variantStyle === 'tree' ? 'list' : values.variantStyle,
        },
        selectionDetails: {
          displayMode: {
            desktop: values.desktopDetails,
            mobile: values.mobileDetails,
          },
        },
      },
    },
    callbacks: {
      addToBasket: () => alert('Checkout function called'),
      buyNow: () => alert('Buy now function called'),
      buySwatches: () => alert('Add swatches to cart'),
    },
    flags: { hidePricing: false },
    branding: {
      cssString: ":host {\n  --ov25-configurator-iframe-background-color: #FFBCB0;\n  --ov25-cta-border-radius: 0px;\n}",
    },
  });

  return (
    <TestPageLayout
      title={preset.title}
      description={preset.description}
      injectConfig={config}
      topContent={<SelectionDetailsControls values={values} />}
      bottomContent={<BelowFoldProductContent />}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
