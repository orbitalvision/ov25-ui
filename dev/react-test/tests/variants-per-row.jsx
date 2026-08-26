import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;
const VARIANT_DISPLAY_MODES = ['wizard', 'guided-overview', 'list', 'tabs', 'accordion', 'tree'];
const CONFIGURATOR_DISPLAY_MODES = {
  inline: { desktop: 'inline', mobile: 'inline' },
  'inline-sticky': { desktop: 'inline-sticky', mobile: 'inline-sticky' },
  sheet: { desktop: 'sheet', mobile: 'drawer' },
  modal: { desktop: 'modal', mobile: 'modal' },
  'variants-only-sheet': { desktop: 'variants-only-sheet', mobile: 'variants-only-sheet' },
  'inline-sheet': { desktop: 'inline-sheet', mobile: 'drawer' },
};

const query = new URLSearchParams(window.location.search);
const requestedVariantMode = query.get('variants');
const variantDisplayMode = VARIANT_DISPLAY_MODES.includes(requestedVariantMode)
  ? requestedVariantMode
  : 'tabs';
const requestedConfiguratorMode = query.get('configurator');
const configuratorMode = requestedConfiguratorMode in CONFIGURATOR_DISPLAY_MODES
  ? requestedConfiguratorMode
  : 'inline';
const parsedInitialCount = Number.parseInt(query.get('count') || '4', 10);
const initialCount = Number.isFinite(parsedInitialCount)
  ? Math.min(6, Math.max(1, parsedInitialCount))
  : 4;

const selectedConfiguratorDisplayMode = CONFIGURATOR_DISPLAY_MODES[configuratorMode];
const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => DEMO_RETAILER_APIKEY,
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
    displayMode: selectedConfiguratorDisplayMode,
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: {
      displayMode: { desktop: variantDisplayMode, mobile: variantDisplayMode },
      // Size/product cards intentionally keep their established two-column treatment.
      hideOptions: ['size'],
    },
  },
  branding: {
    cssString: `:host { --ov25-variants-per-row: ${initialCount}; }`,
  },
  callbacks: {
    addToBasket: () => alert('Add to basket'),
    buyNow: () => alert('Buy now'),
    buySwatches: () => alert('Add swatches to cart'),
  },
  flags: {
    hidePricing: false,
    autoOpen: !['inline', 'inline-sticky'].includes(configuratorMode),
  },
});

function updateFixtureQuery(name, value) {
  const params = new URLSearchParams(window.location.search);
  params.set(name, value);
  window.location.search = params.toString();
}

function replaceFixtureQuery(name, value) {
  const params = new URLSearchParams(window.location.search);
  params.set(name, value);
  window.history.replaceState(null, '', `?${params.toString()}`);
}

function applyVariantsPerRow(count) {
  const visit = (root) => {
    for (const grid of root.querySelectorAll('.ov25-variant-card-grid')) {
      grid.style.setProperty('--ov25-variants-per-row', String(count), 'important');
    }
    for (const element of root.querySelectorAll('*')) {
      if (!element.shadowRoot) continue;
      element.style.setProperty('--ov25-variants-per-row', String(count), 'important');
      visit(element.shadowRoot);
    }
  };
  visit(document);
}

function FixtureControls() {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    applyVariantsPerRow(count);
    const observer = new MutationObserver(() => applyVariantsPerRow(count));
    observer.observe(document.documentElement, { childList: true, subtree: true });
    const retry = window.setInterval(() => applyVariantsPerRow(count), 500);
    return () => {
      observer.disconnect();
      window.clearInterval(retry);
    };
  }, [count]);

  return (
    <section
      className="ov:mb-4 ov:grid ov:gap-4 ov:rounded-lg ov:border ov:border-gray-200 ov:bg-white ov:p-4 ov:md:grid-cols-3"
      data-testid="variants-per-row-controls"
      data-variants-per-row={count}
      data-variant-display-mode={variantDisplayMode}
      data-configurator-display-mode={configuratorMode}
    >
      <label className="ov:flex ov:flex-col ov:gap-2 ov:text-sm ov:text-[#1a1a1a]">
        <span className="ov:flex ov:items-center ov:justify-between ov:gap-3">
          <span>Variants per row</span>
          <output
            htmlFor="variants-per-row-slider"
            className="ov:min-w-8 ov:rounded-md ov:bg-gray-100 ov:px-2 ov:py-1 ov:text-center ov:font-mono ov:tabular-nums"
            aria-live="polite"
          >
            {count}
          </output>
        </span>
        <input
          id="variants-per-row-slider"
          data-testid="variants-per-row-slider"
          type="range"
          min="1"
          max="6"
          step="1"
          value={count}
          onChange={(event) => {
            const nextCount = Number(event.target.value);
            setCount(nextCount);
            replaceFixtureQuery('count', String(nextCount));
          }}
          className="ov:w-full ov:cursor-pointer"
        />
        <span className="ov:flex ov:justify-between ov:text-xs ov:text-[#6b7280]">
          <span>Fewer, larger cards</span>
          <span>More, smaller cards</span>
        </span>
      </label>

      <label className="ov:flex ov:flex-col ov:gap-2 ov:text-sm ov:text-[#1a1a1a]">
        <span>Variants.displayMode</span>
        <select
          value={variantDisplayMode}
          onChange={(event) => updateFixtureQuery('variants', event.target.value)}
          className="ov:h-10 ov:rounded-md ov:border ov:border-gray-300 ov:bg-white ov:px-3"
        >
          {VARIANT_DISPLAY_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
        </select>
      </label>

      <label className="ov:flex ov:flex-col ov:gap-2 ov:text-sm ov:text-[#1a1a1a]">
        <span>Configurator displayMode</span>
        <select
          value={configuratorMode}
          onChange={(event) => updateFixtureQuery('configurator', event.target.value)}
          className="ov:h-10 ov:rounded-md ov:border ov:border-gray-300 ov:bg-white ov:px-3"
        >
          {Object.keys(CONFIGURATOR_DISPLAY_MODES).map((mode) => <option key={mode} value={mode}>{mode}</option>)}
        </select>
      </label>
    </section>
  );
}

function App() {
  return (
    <TestPageLayout
      title="Variants Per Row"
      description="Move the slider to verify fluid variant-card columns. Switch either display mode to exercise the same setting across every variants surface."
      injectConfig={config}
      topContent={<FixtureControls />}
      showProductTabs
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
