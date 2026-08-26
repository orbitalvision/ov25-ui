import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const DEV_RETAILER_APIKEY = import.meta.env.VITE_DEV_RETAILER_APIKEY;
const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;

const VARIANT_DISPLAY_MODES = ['wizard', 'guided-overview', 'list', 'tabs', 'accordion', 'tree'];
const query = new URLSearchParams(window.location.search);
const profile = query.get('profile') === 'snap2' ? 'snap2' : 'standard';
const requestedDisplayMode = query.get('display');
const displayMode = VARIANT_DISPLAY_MODES.includes(requestedDisplayMode)
  ? requestedDisplayMode
  : 'tree';

const callbacks = {
  addToBasket: () => {},
  buyNow: () => {},
  buySwatches: () => {},
};

/**
 * @param {'standard' | 'snap2'} selectedProfile
 * @param {string} selectedDisplayMode
 * @returns {import('ov25-ui').InjectConfiguratorInput}
 */
function buildConfig(selectedProfile, selectedDisplayMode) {
  const shared = {
    selectors: {
      gallery: { selector: '.configurator-container', replace: true },
      variants: '#ov25-controls',
      name: { selector: '#name', replace: true },
    },
    carousel: { desktop: 'stacked', mobile: 'carousel' },
    configurator: {
      displayMode: { desktop: 'sheet', mobile: 'drawer' },
      triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
      variants: {
        displayMode: { desktop: selectedDisplayMode, mobile: selectedDisplayMode },
      },
    },
    callbacks,
    flags: { hidePricing: true },
  };

  if (selectedProfile === 'snap2') {
    return {
      ...shared,
      apiKey: () => DEMO_RETAILER_APIKEY,
      productLink: () => 'snap2/126',
      // A saved configuration skips InitialiseMenu so every variant display mode is directly reviewable.
      configurationUuid: () => '8943fbc7-761e-4dbd-8e9d-29cf87127956',
      selectors: {
        ...shared.selectors,
        configureButton: { selector: '#ov25-fullscreen-button', replace: false },
      },
    };
  }

  return {
    ...shared,
    apiKey: () => DEV_RETAILER_APIKEY,
    productLink: () => '9035',
  };
}

const config = buildConfig(profile, displayMode);

function fixtureHref(nextProfile, nextDisplayMode) {
  const params = new URLSearchParams(window.location.search);
  params.set('profile', nextProfile);
  params.set('display', nextDisplayMode);
  return `?${params.toString()}`;
}

function controlClass(active) {
  return `ov:rounded-md ov:border ov:px-3 ov:py-1.5 ov:text-sm ov:no-underline ${
    active
      ? 'ov:border-[#1a1a1a] ov:bg-[#1a1a1a] ov:text-white'
      : 'ov:border-gray-300 ov:bg-white ov:text-[#1a1a1a] hover:ov:bg-gray-50'
  }`;
}

function App() {
  return (
    <TestPageLayout
      title="Single Product - No Pricing"
      description={`${profile === 'snap2' ? 'Snap2' : 'Standard'} product · Variants.displayMode: ${displayMode} · flags.hidePricing: true`}
      injectConfig={config}
      showPrice={false}
      topContent={
        <div
          className="ov:flex ov:flex-col ov:gap-3 ov:mb-4"
          data-testid="no-pricing-fixture-controls"
          data-profile={profile}
          data-display-mode={displayMode}
          data-hide-pricing="true"
        >
          <div className="ov:flex ov:flex-wrap ov:items-center ov:gap-2">
            <span className="ov:text-sm ov:text-[#525252]">Product:</span>
            {['standard', 'snap2'].map((value) => (
              <a
                key={value}
                href={fixtureHref(value, displayMode)}
                className={controlClass(profile === value)}
                aria-current={profile === value ? 'page' : undefined}
              >
                {value === 'snap2' ? 'Snap2' : 'Standard'}
              </a>
            ))}
          </div>
          <div className="ov:flex ov:flex-wrap ov:items-center ov:gap-2">
            <span className="ov:text-sm ov:text-[#525252]">Variants.displayMode:</span>
            {VARIANT_DISPLAY_MODES.map((value) => (
              <a
                key={value}
                href={fixtureHref(profile, value)}
                className={controlClass(displayMode === value)}
                aria-current={displayMode === value ? 'page' : undefined}
              >
                {value}
              </a>
            ))}
          </div>
          <div className="ov:text-sm ov:text-[#525252]">
            <code>flags.hidePricing: true</code>
          </div>
        </div>
      }
      asideSlot={
        profile === 'snap2' ? (
          <button
            id="ov25-fullscreen-button"
            type="button"
            className="ov:mb-2 ov:cursor-pointer ov:rounded-md ov:border ov:border-gray-300 ov:bg-white ov:px-3 ov:py-2 ov:text-sm ov:text-[#1a1a1a] hover:ov:bg-gray-50"
          >
            Configure (Snap2)
          </button>
        ) : undefined
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
