import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import { ViewportWrapper } from '../templates/ViewportWrapper.jsx';
import { TestBackButton } from '../templates/TestBackButton.jsx';
import '../src/index.css';

/** Undo globals.css `.ov25-inline-gallery-sticky` (sticky + z-index:1) on the gallery host so flex `min-h-0` can cap height. */
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

let snap2InlineConfiguratorInitialized = false;

const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => '27-87235dc13ef0089116f2bcd35dda712a8a26880541681261e9399016a89a4782',
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
    variants: { displayMode: { desktop: 'list', mobile: 'list' } },
    // modules: { position: { desktop: 'RIGHT', mobile: 'RIGHT' } }
  },
  callbacks: {
    addToBasket: (payload) => {
      alert('buyNow' + payload);
      console.log('payload', payload);
    },
    buyNow: (payload) => {
      alert('buyNow' + payload);
      console.log('payload', payload);
    },
    buySwatches: () => alert('buySwatches'),
  },
  cssString: SNAP2_INLINE_OV25_CSS,
});

function App() {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));
  useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
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
    if (snap2InlineConfiguratorInitialized) return;
    snap2InlineConfiguratorInitialized = true;
    const forceMobile = typeof window !== 'undefined' && window.location.search.includes('viewport=mobile');
    injectConfigurator({
      ...config,
      flags: {
        hidePricing: false,
        ...(forceMobile ? { forceMobile: true } : {}),
      },
    });
  }, []);

  return (
    <ViewportWrapper> 
      <style>{SNAP2_INLINE_PAGE_CSS}</style>
      {/* Replaced on inject: full-viewport host for Snap2 InitialiseMenu (shadow + ov:* styles). */}
      <div
        id="ov25-initialise-menu"
        className="ov:fixed ov:inset-0 ov:z-2147483000 ov:min-h-0 ov:min-w-0 ov:pointer-events-auto"
      />
      <div className="snap2-inline-page ov:box-border ov:flex ov:h-dvh ov:max-h-dvh ov:min-h-0 ov:w-full ov:flex-col ov:overflow-hidden ov:bg-white ov:text-neutral-900">
        {/* <TestBackButton /> */}


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
            {/* <div id="price-name" className="ov:shrink-0 ov:border-b ov:border-neutral-100 ov:px-4 ov:py-3">
              <div id="price" className="ov:text-sm ov:text-neutral-500">
                PRICE: £123
              </div>
              <div id="name" className="ov:mt-1 ov:text-base ov:font-medium ov:text-neutral-900">
                NAME: Product Name
              </div>
            </div> */}
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
