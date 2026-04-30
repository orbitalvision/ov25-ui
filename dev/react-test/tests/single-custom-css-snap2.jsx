import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import { ViewportWrapper } from '../templates/ViewportWrapper.jsx';
import { TestBackButton } from '../templates/TestBackButton.jsx';
import { readSnap2LayoutQuery, Snap2PositionControls } from '../templates/Snap2PositionControls.jsx';
import { SINGLE_CUSTOM_CSS_BRANDING } from './single-custom-css-branding.js';
import '../src/index.css';

const MAZE_APIKEY = import.meta.env.VITE_MAZE_APIKEY;

/** Same host-page CSS as `snap2-inline.jsx` (sticky gallery override). */
const SNAP2_INLINE_PAGE_CSS = `
html.snap2-inline-root,
body.snap2-inline-root {
  overflow: hidden;
  height: 100%;
  max-height: 100%;
}
.snap2-inline-page .ov25-inline-gallery-sticky {
  position: relative !important;
  top: auto !important;
  align-self: stretch !important;
  display: flex !important;
  flex: 1 1 auto !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  z-index: auto !important;
}
`;

const SNAP2_INLINE_OV25_CSS = `
#ov-25-configurator-gallery-container {
  display: flex !important;
  flex: 1 1 auto !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
}
`;

const VARIANT_DISPLAY_TYPES = ['tree', 'list', 'tabs', 'accordion', 'wizard'];

const LAYOUT_DEFAULTS = {
  variantsDesktop: 'RIGHT',
  variantsMobile: 'RIGHT',
  modulesDesktop: 'BOTTOM',
  modulesMobile: 'BOTTOM',
};

let snap2CustomCssInlineInitialized = false;

function snap2Callbacks() {
  return {
    addToBasket: (payload) => {
      alert('buyNow' + payload);
      console.log('payload', payload);
    },
    buyNow: (payload) => {
      alert('buyNow' + payload);
      console.log('payload', payload);
    },
    buySwatches: () => alert('buySwatches'),
    onChange: (payload) => console.log('onChange', payload),
  };
}

function linkClass(active) {
  return active ? 'ov:bg-black ov:text-white' : 'ov:bg-gray-200 ov:text-gray-800 ov:hover:bg-gray-300';
}

/**
 * @param {Object} props
 * @param {'inline' | 'dialog'} props.layout
 * @param {string} props.displayFromUrl
 */
function VariantAndLayoutControls({ layout, displayFromUrl }) {
  return (
    <div className="ov:flex ov:flex-col ov:gap-2 ov:mb-3 ov:text-sm">
      <div className="ov:flex ov:flex-wrap ov:gap-2 ov:items-center">
        <span className="ov:text-gray-600">Snap2 layout:</span>
        {['inline', 'dialog'].map((l) => {
          const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
          params.set('layout', l);
          return (
            <a
              key={l}
              href={`?${params.toString()}`}
              className={`ov:px-2 ov:py-1 ov:rounded ov:no-underline ${linkClass(l === layout)}`}
            >
              {l}
            </a>
          );
        })}
      </div>
      <div className="ov:flex ov:flex-wrap ov:gap-2 ov:items-center">
        <span className="ov:text-gray-600">Variants display:</span>
        {VARIANT_DISPLAY_TYPES.map((d) => {
          const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
          params.set('display', d);
          return (
            <a
              key={d}
              href={`?${params.toString()}`}
              className={`ov:px-2 ov:py-1 ov:rounded ov:no-underline ${linkClass(d === displayFromUrl)}`}
            >
              {d}
            </a>
          );
        })}
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} props.displayFromUrl
 * @param {string} props.mobileVariantDisplay
 * @param {'inline' | 'dialog'} props.layout
 */
function Snap2InlineCustomCss({ displayFromUrl, mobileVariantDisplay, layout }) {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const useMobileLayout = useMemo(() => {
    const { width, height } = viewport;
    const isPortraitTablet = width >= 768 && width <= 1024 && height > width;
    return width < 768 || isPortraitTablet;
  }, [viewport]);

  useEffect(() => {
    document.documentElement.classList.add('snap2-inline-root');
    document.body.classList.add('snap2-inline-root');
    return () => {
      document.documentElement.classList.remove('snap2-inline-root');
      document.body.classList.remove('snap2-inline-root');
    };
  }, []);

  useEffect(() => {
    if (snap2CustomCssInlineInitialized) return;
    snap2CustomCssInlineInitialized = true;
    const forceMobile = typeof window !== 'undefined' && window.location.search.includes('viewport=mobile');
    const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
      apiKey: () => MAZE_APIKEY,
      productLink: () => 'snap2/445',
      selectors: {
        gallery: { selector: '.configurator-container', replace: true },
        variants: '#ov25-controls',
        swatches: '#ov25-swatches',
        initialiseMenu: { selector: '#ov25-initialise-menu', replace: true },
      },
      carousel: { desktop: 'none', mobile: 'none' },
      configurator: {
        displayMode: { desktop: 'inline', mobile: 'inline' },
        triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
        variants: { displayMode: { desktop: displayFromUrl, mobile: mobileVariantDisplay } },
      },
      callbacks: snap2Callbacks(),
      cssString: SNAP2_INLINE_OV25_CSS,
      branding: { cssString: SINGLE_CUSTOM_CSS_BRANDING },
      flags: {
        hidePricing: false,
        ...(forceMobile ? { forceMobile: true } : {}),
      },
    });
    injectConfigurator(config);
  }, []);

  return (
    <ViewportWrapper>
      <style>{SNAP2_INLINE_PAGE_CSS}</style>
      <div
        id="ov25-initialise-menu"
        className="ov:fixed ov:inset-0 ov:z-2147483000 ov:min-h-0 ov:min-w-0 ov:pointer-events-auto"
      />
      <div className="snap2-inline-page ov:box-border ov:flex ov:h-dvh ov:max-h-dvh ov:min-h-0 ov:w-full ov:flex-col ov:overflow-hidden ov:bg-white ov:text-neutral-900">
        <TestBackButton />
        <header className="ov:shrink-0 ov:border-b ov:border-neutral-200 ov:bg-neutral-100 ov:px-4 ov:py-3">
          <p className="ov:text-sm ov:font-medium ov:tracking-wide ov:text-neutral-600">OV25 react-test</p>
          <h1 className="ov:text-lg ov:font-semibold ov:text-neutral-900">Snap2 + custom CSS (inline)</h1>
          <VariantAndLayoutControls layout={layout} displayFromUrl={displayFromUrl} />
        </header>

        <main className={`ov:flex ov:min-h-0 ov:flex-1 ov:flex-col ov:overflow-hidden ${useMobileLayout ? '' : 'ov:md:flex-row'}`}>
          <div
            className={`ov:flex ov:min-h-0 ov:min-w-0 ov:flex-1 ov:flex-col ov:overflow-hidden ov:border-b ov:border-neutral-200 ov:bg-neutral-50 ${
              useMobileLayout ? '' : 'ov:md:border-b-0 ov:md:border-r ov:md:border-neutral-200'
            }`}
          >
            <div className="configurator-container ov:flex ov:h-full ov:min-h-0 ov:w-full ov:max-h-full ov:flex-1 ov:flex-col ov:overflow-hidden" />
          </div>

          <aside
            id="ov25-aside-menu"
            className={`ov:flex ov:min-h-0 ov:min-w-0 ov:w-full ov:flex-1 ov:flex-col ov:overflow-hidden ov:bg-white ${
              useMobileLayout ? '' : 'ov:md:w-[min(420px,40vw)] ov:md:max-w-[480px] ov:md:flex-none ov:md:shrink-0'
            }`}
          >
            <div
              className={`ov:flex ov:min-h-0 ov:flex-1 ov:flex-col ov:overflow-hidden ov:px-4 ov:pb-2 ${
                useMobileLayout ? '' : 'ov:md:pb-4'
              }`}
            >
              <div id="ov25-controls" className="ov:min-h-0 ov:flex-1 ov:overflow-y-auto ov:overflow-x-hidden" />
              <div id="ov25-swatches" className="ov:shrink-0" />
            </div>
          </aside>
        </main>
      </div>
    </ViewportWrapper>
  );
}

/**
 * @param {Object} props
 * @param {string} props.displayFromUrl
 * @param {string} props.mobileVariantDisplay
 * @param {'inline' | 'dialog'} props.layout
 */
function Snap2DialogCustomCss({ displayFromUrl, mobileVariantDisplay, layout }) {
  const layoutRails = React.useMemo(() => readSnap2LayoutQuery(LAYOUT_DEFAULTS), []);

  const injectConfig = React.useMemo(
    () =>
      /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
        apiKey: () => MAZE_APIKEY,
        productLink: () => 'snap2/445',
        selectors: {
          gallery: { selector: '.configurator-container', replace: true },
          configureButton: { selector: '#ov25-fullscreen-button', replace: false },
          variants: '#ov25-controls',
          swatches: '#ov25-swatches',
          price: { selector: '#price', replace: true },
          name: { selector: '#name', replace: true },
        },
        carousel: { desktop: 'stacked', mobile: 'carousel' },
        configurator: {
          displayMode: { desktop: 'modal', mobile: 'drawer' },
          triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
          variants: {
            displayMode: { desktop: displayFromUrl, mobile: mobileVariantDisplay },
            position: { desktop: layoutRails.variantsDesktop, mobile: layoutRails.variantsMobile },
          },
          modules: { position: { desktop: layoutRails.modulesDesktop, mobile: layoutRails.modulesMobile } },
        },
        callbacks: snap2Callbacks(),
        branding: { cssString: SINGLE_CUSTOM_CSS_BRANDING },
        flags: { hidePricing: false },
      }),
    [layoutRails, displayFromUrl, mobileVariantDisplay],
  );

  return (
    <TestPageLayout
      title="Snap2 + custom CSS (dialog)"
      description="Same branding.cssString as single-custom-css; modal / drawer like snap2-dialog. Use ?layout=inline for full-page inline Snap2."
      injectConfig={injectConfig}
      dynamicConfig
      topContent={
        <div>
          <VariantAndLayoutControls layout={layout} displayFromUrl={displayFromUrl} />
          <Snap2PositionControls defaults={LAYOUT_DEFAULTS} className="ov:mb-4" />
        </div>
      }
      asideSlot={
        <button
          id="ov25-fullscreen-button"
          className="ov:cursor-pointer ov:bg-transparent ov:text-white ov:p-2 ov:rounded-md ov:mb-2"
          type="button"
        >
          Configure Your Sofa
        </button>
      }
    />
  );
}

function App() {
  const qs = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const displayFromUrl = qs.get('display') || 'list';
  const layout = qs.get('layout') === 'dialog' ? 'dialog' : 'inline';
  const mobileVariantDisplay = displayFromUrl === 'accordion' ? 'list' : displayFromUrl;

  if (layout === 'inline') {
    return (
      <Snap2InlineCustomCss
        displayFromUrl={displayFromUrl}
        mobileVariantDisplay={mobileVariantDisplay}
        layout={layout}
      />
    );
  }
  return (
    <Snap2DialogCustomCss
      displayFromUrl={displayFromUrl}
      mobileVariantDisplay={mobileVariantDisplay}
      layout={layout}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
