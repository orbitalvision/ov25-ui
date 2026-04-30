import React from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import 'ov25-ui/index.css';
import '../src/index.css';
import { TestBackButton } from '../templates/TestBackButton.jsx';
import { readSnap2LayoutQuery, Snap2PositionControls } from '../templates/Snap2PositionControls.jsx';

const MAZE_APIKEY = import.meta.env.VITE_MAZE_APIKEY;

const LAYOUT_DEFAULTS = {
  variantsDesktop: 'RIGHT',
  variantsMobile: 'LEFT',
  modulesDesktop: 'LEFT',
  modulesMobile: 'LEFT',
};

let injectRan = false;

function App() {
  const layout = React.useMemo(() => readSnap2LayoutQuery(LAYOUT_DEFAULTS), []);

  const injectConfig = React.useMemo(
    () =>
      /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
        apiKey: () => MAZE_APIKEY,
        productLink: () => 'snap2/445',
        selectors: {
          gallery: { selector: '.configurator-container', replace: true },
          variants: { selector: '#ov25-controls', replace: true },
          swatches: '#ov25-swatches',
          price: { selector: '#price', replace: true },
          name: { selector: '#name', replace: true },
        },
        carousel: { desktop: 'none', mobile: 'none' },
        configurator: {
          displayMode: { desktop: 'inline-sheet', mobile: 'inline' },
          triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
          variants: {
            displayMode: { desktop: 'tabs', mobile: 'tabs' },
            position: { desktop: layout.variantsDesktop, mobile: layout.variantsMobile },
          },
          modules: { position: { desktop: layout.modulesDesktop, mobile: layout.modulesMobile } },
        },
        callbacks: {
          addToBasket: () => {},
          buyNow: () => {},
          buySwatches: () => {},
        },
        flags: { hidePricing: false },
      }),
    [layout],
  );

  React.useEffect(() => {
    if (injectRan) return;
    injectRan = true;
    const forceMobile = typeof window !== 'undefined' && window.location.search.includes('viewport=mobile');
    injectConfigurator({
      ...injectConfig,
      flags: {
        ...(injectConfig && 'flags' in injectConfig ? injectConfig.flags : {}),
        ...(forceMobile ? { forceMobile: true } : {}),
      },
    });
  }, [injectConfig]);

  return (
    <div className="snap2-page ov:h-dvh ov:w-full ov:flex ov:flex-col ov:overflow-hidden ov:bg-[#f5f5f5]">
      <div className="ov:shrink-0 ov:z-2000002 ov:pointer-events-auto ov:border-b ov:border-gray-200 ov:bg-white ov:px-3 ov:py-2 ov:flex ov:flex-col ov:gap-2">
        <TestBackButton />
        <Snap2PositionControls defaults={LAYOUT_DEFAULTS} />
      </div>
      <main className="ov:relative ov:flex ov:min-h-0 ov:w-full ov:flex-1 ov:flex-col ov:max-h-100dvh">
        <div className="ov:fixed ov:top-3 ov:right-3 ov:z-2000002 ov:pointer-events-auto">
          <div id="ov25-snap2-configure" />
        </div>
        <div
          className="ov:absolute ov:w-px ov:h-px ov:overflow-hidden ov:opacity-0 ov:pointer-events-none"
          aria-hidden
        >
          <div id="ov25-swatches" />
          <div id="price">PRICE</div>
          <div id="name">NAME</div>
        </div>
        <div className="snap2-body ov:flex ov:min-h-0 ov:w-full ov:flex-1 ov:flex-col max-md:ov:overflow-hidden md:ov:items-center md:ov:justify-center md:ov:overflow-auto">
          <section
            aria-label="Configurator gallery"
            className="snap2-gallery-row ov:flex ov:shrink-0 ov:justify-center ov:aspect-square md:aspect-auto ov:overflow-hidden max-md:ov:h-[50dvh] max-md:ov:items-stretch md:ov:min-h-0 md:ov:flex-1 md:ov:items-center"
          >
            <div className="configurator-container ov:box-border ov:w-full ov:max-w-full ov:shrink-0 max-md:ov:h-full max-md:ov:w-full max-md:ov:aspect-square ov:md:h-[800px] ov:md:w-[1500px] ov:md:max-w-full" />
          </section>
          <div
            id="ov25-controls"
            aria-label="Configurator variants"
            className="ov:min-h-0 ov:min-w-0 ov:flex-1 ov:overflow-y-auto max-md:ov:border-t max-md:ov:border-gray-200 md:ov:w-full md:ov:flex-none"
          />
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
