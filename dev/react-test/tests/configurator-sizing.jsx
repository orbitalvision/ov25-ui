import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;

const CONFIGURATOR_MODES = {
  wide: {
    label: 'Wide',
    height: '560px',
    maxHeight: '560px',
    wide: true,
  },
  tall: {
    label: 'Tall',
    height: 'calc(100svh - 180px)',
    maxHeight: '760px',
    tall: true,
  },
  square: {
    label: 'Square',
    aspectRatio: '1 / 1',
  },
  '16-9': {
    label: '16/9',
    aspectRatio: '16 / 9',
  },
};

function createConfiguratorCss(mode) {
  if (mode.aspectRatio) {
    return `
:host {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: ${mode.aspectRatio};
}

:host > div,
:host div:has(> #ov25-configurator-iframe-container) {
  height: auto !important;
  max-height: none !important;
  aspect-ratio: ${mode.aspectRatio} !important;
}

#ov25-configurator-background-color,
#ov25-configurator-iframe-container,
#true-ov25-configurator-iframe-container {
  aspect-ratio: ${mode.aspectRatio} !important;
  height: 100% !important;
  max-height: none !important;
}

#ov25-configurator-iframe {
  height: 100% !important;
}
`;
  }

  return `
:host {
  display: block;
  width: 100%;
  height: ${mode.height};
  max-height: ${mode.maxHeight};
  ${mode.wide ? 'max-width: none;' : ''}
}

:host > div,
:host div:has(> #ov25-configurator-iframe-container) {
  height: ${mode.height} !important;
  max-height: ${mode.maxHeight} !important;
  aspect-ratio: auto !important;
}

#ov25-configurator-background-color,
#ov25-configurator-iframe-container,
#true-ov25-configurator-iframe-container,
#ov25-configurator-iframe {
  height: ${mode.height} !important;
  max-height: ${mode.maxHeight} !important;
  aspect-ratio: auto !important;
}
`;
}

function createConfig(configuratorMode) {
  const mode = CONFIGURATOR_MODES[configuratorMode];
  return /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
    apiKey: () => DEMO_RETAILER_APIKEY,
    productLink: () => '58',
    selectors: {
      gallery: { selector: '.configurator-container', replace: true },
      variants: '#ov25-controls',
      swatches: '#ov25-swatches',
      price: { selector: '#price', replace: true },
      name: { selector: '#name', replace: true },
    },
    carousel: { desktop: 'none', mobile: 'none' },
    configurator: {
      displayMode: { desktop: 'inline', mobile: 'inline' },
      triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
      variants: { displayMode: { desktop: 'tabs', mobile: 'tabs' } },
    },
    branding: { cssString: createConfiguratorCss(mode) },
    callbacks: {
      addToBasket: () => alert('Add to basket'),
      buyNow: () => alert('Buy now'),
      buySwatches: () => alert('Add swatches to cart'),
    },
    flags: { hidePricing: false },
  });
}

function SizeSwitch({ configuratorMode }) {
  const options = Object.entries(CONFIGURATOR_MODES).map(([value, mode]) => ({ label: mode.label, value }));
  const linkClass = (active) =>
    active ? 'ov:bg-black ov:text-white' : 'ov:bg-gray-200 ov:text-gray-800 ov:hover:bg-gray-300';

  return (
    <div className="ov:flex ov:flex-wrap ov:gap-2 ov:mb-3 ov:text-sm ov:items-center">
      <span className="ov:text-gray-600">Configurator size:</span>
      {options.map((option) => {
        const params = new URLSearchParams(window.location.search);
        params.set('size', option.value);
        params.delete('height');
        const active = configuratorMode === option.value;
        return (
          <a
            key={option.value}
            href={`?${params}`}
            className={`ov:px-2 ov:py-1 ov:rounded ov:no-underline ${linkClass(active)}`}
          >
            {option.label}
          </a>
        );
      })}
    </div>
  );
}

function App() {
  const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const requestedMode = qs.get('size') || (qs.get('height') === 'tall' ? 'tall' : '');
  const configuratorMode = requestedMode in CONFIGURATOR_MODES ? requestedMode : 'wide';
  const mode = CONFIGURATOR_MODES[configuratorMode];
  const config = createConfig(configuratorMode);

  return (
    <TestPageLayout
      title="Configurator Sizing"
      description="Switch between wide, tall, square, and 16/9 configurator sizing."
      injectConfig={config}
      topContent={<SizeSwitch configuratorMode={configuratorMode} />}
      wideConfigurator={Boolean(mode.wide)}
      configuratorTall={Boolean(mode.tall)}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
export default App;
