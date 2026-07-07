import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import { TestBackButton } from '../templates/TestBackButton.jsx';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;
let responsiveConfiguratorInitialized = false;

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
  'responsive-width': {
    label: 'Responsive width',
    responsiveWidth: true,
  },
};

const RESPONSIVE_IFRAME_CSS = `
:host {
  display: block;
  width: 100%;
  height: 100%;
}

:host > div,
:host div:has(> #ov25-configurator-iframe-container),
#ov25-configurator-background-color,
#ov25-configurator-iframe-container,
#true-ov25-configurator-iframe-container,
#ov25-configurator-iframe {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: none !important;
  aspect-ratio: auto !important;
}
`;

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

function createResponsiveWidthConfig() {
  return /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
    apiKey: () => DEMO_RETAILER_APIKEY,
    productLink: () => 'range/126',
    selectors: {
      gallery: { selector: '.responsive-iframe-slot', replace: true },
      variants: '#ov25-controls',
      swatches: '#ov25-swatches',
      price: { selector: '#price', replace: true },
      name: { selector: '#name', replace: true },
    },
    carousel: { desktop: 'none', mobile: 'none' },
    configurator: {
      displayMode: { desktop: 'inline', mobile: 'inline' },
      triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
      variants: { displayMode: { desktop: 'accordion', mobile: 'list' } },
    },
    branding: { cssString: RESPONSIVE_IFRAME_CSS },
    callbacks: {
      addToBasket: () => alert('Add to basket function called'),
      buyNow: () => alert('Buy now function called'),
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

function querySelectorDeep(selector, root = document) {
  const directMatch = root.querySelector?.(selector);
  if (directMatch) return directMatch;

  const elements = Array.from(root.querySelectorAll?.('*') ?? []);
  for (const element of elements) {
    if (!element.shadowRoot) continue;
    const match = querySelectorDeep(selector, element.shadowRoot);
    if (match) return match;
  }

  return null;
}

function useElementRect(selector) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    let resizeObserver = null;
    let rafId = 0;
    let cancelled = false;

    const update = () => {
      if (cancelled) return;
      const el = querySelectorDeep(selector);

      if (!el) {
        rafId = window.requestAnimationFrame(update);
        return;
      }

      const setFromElement = () => {
        const next = el.getBoundingClientRect();
        setRect({
          width: Math.round(next.width),
          height: Math.round(next.height),
        });
      };

      setFromElement();
      resizeObserver = new ResizeObserver(setFromElement);
      resizeObserver.observe(el);
    };

    update();

    return () => {
      cancelled = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
    };
  }, [selector]);

  return rect;
}

function SizeReadout() {
  const slotRect = useElementRect('.responsive-iframe-slot');
  const iframeRect = useElementRect('#ov25-configurator-iframe');

  return (
    <div className="ov:grid ov:grid-cols-1 ov:gap-2 ov:text-sm ov:text-[#525252]">
      <div>
        <span className="ov:font-medium ov:text-[#1a1a1a]">Slot:</span>{' '}
        {slotRect ? `${slotRect.width} x ${slotRect.height}` : 'waiting'}
      </div>
      <div>
        <span className="ov:font-medium ov:text-[#1a1a1a]">Iframe:</span>{' '}
        {iframeRect ? `${iframeRect.width} x ${iframeRect.height}` : 'waiting'}
      </div>
      <div>
        <span className="ov:font-medium ov:text-[#1a1a1a]">Aspect:</span>{' '}
        {slotRect ? (slotRect.width / slotRect.height).toFixed(2) : 'waiting'}
      </div>
    </div>
  );
}

function ResponsiveWidthFixture({ configuratorMode }) {
  useEffect(() => {
    if (responsiveConfiguratorInitialized) return;
    injectConfigurator(createResponsiveWidthConfig());
    responsiveConfiguratorInitialized = true;
  }, []);

  return (
    <div className="ov:min-h-full ov:bg-[#f5f5f5] ov:px-3 ov:py-4 ov:sm:px-6 ov:sm:py-6">
      <TestBackButton />
      <main className="ov:mx-auto ov:flex ov:max-w-[1180px] ov:flex-col ov:gap-4">
        <header>
          <h1 className="ov:mb-2 ov:text-2xl ov:font-semibold ov:text-[#1a1a1a]">Configurator Sizing</h1>
          <p className="ov:m-0 ov:max-w-[760px] ov:text-sm ov:text-[#525252]">
            Switch between wide, tall, square, 16/9, and responsive-width configurator sizing.
          </p>
        </header>

        <SizeSwitch configuratorMode={configuratorMode} />

        <section className="ov:grid ov:grid-cols-1 ov:gap-4 ov:lg:grid-cols-[minmax(0,1fr)_640px] ov:lg:items-start">
          <div className="ov:min-w-0">
            <div className="responsive-iframe-frame">
              <div className="responsive-iframe-slot" />
            </div>
          </div>

          <aside className="ov:rounded-lg ov:border ov:border-gray-200 ov:bg-white ov:p-4 ov:shadow-sm">
            <div className="ov:mb-4">
              <div id="price">PRICE: £123</div>
              <div id="name">NAME: Responsive thumbnail range</div>
            </div>
            <SizeReadout />
            <div id="ov25-controls" className="ov:mt-4" />
            <div id="ov25-swatches" className="ov:mt-4" />
          </aside>
        </section>
      </main>

      <style>{`
        .responsive-iframe-frame {
          width: min(920px, calc(100vw - 24px));
          max-width: 100%;
        }

        .responsive-iframe-slot {
          width: 100%;
          height: min(720px, calc(100svh - 168px));
          min-height: 560px;
          max-height: 760px;
          overflow: hidden;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #f8fafc;
        }

        @media (max-width: 860px) {
          .responsive-iframe-slot {
            height: 680px;
            min-height: 640px;
          }
        }

        @media (max-width: 520px) {
          .responsive-iframe-frame {
            width: calc(100vw - 24px);
          }

          .responsive-iframe-slot {
            height: 720px;
            min-height: 680px;
          }
        }
      `}</style>
    </div>
  );
}

function App() {
  const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const requestedMode = qs.get('size') || (qs.get('height') === 'tall' ? 'tall' : '');
  const configuratorMode = requestedMode in CONFIGURATOR_MODES ? requestedMode : 'wide';
  const mode = CONFIGURATOR_MODES[configuratorMode];

  if (mode.responsiveWidth) {
    return <ResponsiveWidthFixture configuratorMode={configuratorMode} />;
  }

  const config = createConfig(configuratorMode);

  return (
    <TestPageLayout
      title="Configurator Sizing"
      description="Switch between wide, tall, square, 16/9, and responsive-width configurator sizing."
      injectConfig={config}
      topContent={<SizeSwitch configuratorMode={configuratorMode} />}
      wideConfigurator={Boolean(mode.wide)}
      configuratorTall={Boolean(mode.tall)}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
export default App;
