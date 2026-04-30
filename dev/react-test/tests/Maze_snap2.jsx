import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';

//This uses tailwindcss, we checked your site to make sure you were using it. We did not check the version, so if you are using a different
//one you may need to change the imports/source at the top of the css file.
import '../src/index.css';

const MAZE_APIKEY = import.meta.env.VITE_MAZE_APIKEY;

let mazeSnap2Initialized = false;

// Custom CSS for styling the configurator to Maze branding
const MAZE_SNAP2_PAGE_CSS = `
.ov25-option-header {
  display: none;
}

#ov25-snap2-panel-checkout-button, .ov25-module-variant-detail-sheet-add-button {
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  color: #fff;
  background: #3d4149;
  line-height: 26px;
  text-transform: none;
}

.ov25-checkout-button-wrapper {
  padding: 0.5rem;
}

.ov25-module-variant-detail-sheet-footer {
  padding-bottom: 0.5rem;
  padding-inline: 0.5rem;
}

#ov25-checkout-button span {
  text-transform: none;
}

#ov25-snap2-panel-checkout-button:hover, #ov25-checkout-button:hover, #ov25-add-to-basket-button:hover {
  background: #545a67;
  color: #fff;
}

.ov25-checkout-combo-button {
  height: 42px; 
}

#ov25-add-to-basket-button {
  border-left: 1px solid white;  
}


.ov25-tabs-header {
  .ov25-tabs-button {
    background-color: #fff;
    border-width: 1px;
    border-style: solid;
    color: #3d4149;
    background: #fff;
    line-height: 26px;
    padding: 5px 18px;
  }

  .ov25-tabs-button[data-ov25-tab-active="true"]{
      --tw-bg-opacity: 1;
      background-color: rgb(231 233 239 / var(--tw-bg-opacity, 1));
      --tw-border-opacity: 1;
      border-color: rgb(61 65 73 / var(--tw-border-opacity, 1));
  }

  .ov25-tabs-button:hover {
    background: #3d4149;
    color: #fff;
  }
}

#ov25-snap2-options-wrapper {
  .ov25-tabs-button[data-selected="true"] {
    background: #3d4149;
    color: #fff;
  }
}

.ov25-default-variant-card[data-selected="true"] .ov25-variant-thumb-wrapper {
  background: #3d4149;
}

#ov25-snap2-modules-tabs-wrap {
  padding: 0.5rem;
}
`;

//These selectors are used to find and edit the content of the configurator to be
//more inline with Maze branding.
const INITIALISE_MENU_HOST_SELECTOR = '.ov25-configurator-initialise-menu';

const VARIANTS_CONTROLS_HOST_SELECTOR = '#ov25-controls';
const CHECKOUT_SHEET_BODY_CLASS = 'ov25-snap2-checkout-sheet-body';
const MAZE_CHECKOUT_BODY_FLAG = 'data-maze-snap2-checkout-body';

const INITIALISE_MENU_INTRO_SELECTOR = '[data-ov25-initialise-menu-intro]';


const DEFAULT_INITIALISE_INTRO = 'Select a product to get started';
const EMBER_TITLE = 'Ember Configurator';
const EMBER_INITIALISE_MENU_INTRO =
  'Build your dream Ember Kitchen by selecting a starting component. Use the filters to easily browse Middle, Corner, or End sections. To grow your layout, simply click the (+) icon next to any item to add a module to that side. You can select any component to replace it, click (+) anywhere to insert a new piece, or use delete to remove items.';

// Replace initialise menu intro text with some
// custom content. 
function replaceIntroText() {
  const host = document.querySelector(INITIALISE_MENU_HOST_SELECTOR);
  const sr = host?.shadowRoot;
  if (!sr) return;
  const menuRoot = sr.querySelector('#ov25-initialise-menu');
  if (!menuRoot) return;
  const byData = menuRoot.querySelector(INITIALISE_MENU_INTRO_SELECTOR);
  let el = null;
  if (byData instanceof HTMLParagraphElement) {
    el = byData;
  } else {
    for (const p of Array.from(menuRoot.querySelectorAll('p'))) {
      if ((p.textContent || '').trim() === DEFAULT_INITIALISE_INTRO) {
        el = p;
        break;
      }
    }
  }
  if (!el) return;
  const parent = el.parentElement;
  if (!parent) return;

  const existing = parent.querySelector('[data-ov25-ember-intro-block]');
  if (existing instanceof HTMLDivElement) return;

  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-ov25-ember-intro-block', 'true');
  wrapper.style.cssText = 'display:flex;flex-direction:column;gap:12px;padding:16px 20px';

  const title = document.createElement('div');
  title.textContent = EMBER_TITLE;
  title.style.cssText = 'font-size:18px;font-weight:700;line-height:1.2';

  const intro = document.createElement('div');
  intro.textContent = EMBER_INITIALISE_MENU_INTRO;
  intro.style.cssText = 'font-size:14px;line-height:1.5';

  wrapper.append(title, intro);
  el.replaceWith(wrapper);
}

// Replace checkout sheet with custom HTML (red div placeholder)
//This is where you will inject your custom checkout that reads the 
//post messages and matches up the payload data with your 
//custom ecommerce system.
function replaceCheckoutSheet() {
  const host = document.querySelector(VARIANTS_CONTROLS_HOST_SELECTOR);
  const sr = host?.shadowRoot;
  if (!sr) return;
  const body = sr.querySelector(`.${CHECKOUT_SHEET_BODY_CLASS}`);
  if (!body) return;
  if (body.firstElementChild?.getAttribute(MAZE_CHECKOUT_BODY_FLAG) === 'true') return;
  const red = document.createElement('div');
  red.setAttribute(MAZE_CHECKOUT_BODY_FLAG, 'true');
  red.style.cssText = 'min-height:8rem;flex:1 1 auto;width:100%;height:100%;background:red';
  body.replaceChildren(red);
  const footer = sr.querySelector('#ov25-snap2-checkout-sheet-footer');
  if (footer instanceof HTMLElement) {
    footer.style.setProperty('display', 'none', 'important');
  }
}

// This is abit janky and uses a interval to check the DOM for changes and ensure the changes are applied.
// You could try to use something like the following to listen for the DOMContentLoaded event instead.

// const myFrame = document.querySelector('#my-iframe');
// myFrame.addEventListener('load', () => {
//   console.log('This specific iframe has finished loading.');
// });
function installMazeSnap2Patches() {
  const disposers = [];

  const tryObserveShadow = (selector, datasetKey, onMutate) => {
    const hostEl = document.querySelector(selector);
    const host = hostEl instanceof HTMLElement ? hostEl : null;
    const sr = host?.shadowRoot;
    if (!host || !sr || host.dataset[datasetKey] === '1') return;
    host.dataset[datasetKey] = '1';
    const mo = new MutationObserver(() => {
      onMutate();
    });
    mo.observe(sr, { subtree: true, childList: true, characterData: true });
    disposers.push(() => {
      mo.disconnect();
      delete host.dataset[datasetKey];
    });
  };

  const tick = () => {
    replaceIntroText();
    replaceCheckoutSheet();
    tryObserveShadow(INITIALISE_MENU_HOST_SELECTOR, 'ov25MazeIntroObserved', replaceIntroText);
    tryObserveShadow(VARIANTS_CONTROLS_HOST_SELECTOR, 'ov25MazeCheckoutBodyObserved', replaceCheckoutSheet);
  };

  tick();
  const intervalId = window.setInterval(tick, 120);

  disposers.push(() => window.clearInterval(intervalId));

  const cap = window.setTimeout(() => {
    disposers.forEach((d) => d());
  }, 120_000);

  disposers.push(() => window.clearTimeout(cap));

  return () => {
    disposers.forEach((d) => d());
  };
}

// Settings for passing to injectConfigurator, this is what would've been generated
// by ov25-setup in a perfect world. This api key is the public configurator access key.
const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => MAZE_APIKEY,
  productLink: () => 'snap2/445',
  cssString: MAZE_SNAP2_PAGE_CSS,
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    variants: '#ov25-controls',
    initialiseMenu: { selector: '#ov25-initialise-menu', replace: true },
  },
  carousel: { desktop: 'none', mobile: 'none' },
  configurator: {
    displayMode: { desktop: 'inline', mobile: 'inline' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: { displayMode: { desktop: 'list', mobile: 'list' } },
  },
  callbacks: {
    addToBasket: () => {},
    buyNow: () => {},
    buySwatches: () => {},
  },
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

  // Make portrait viewports (tablets) use the mobile layout.

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

  // Initialise the configurator once
  useEffect(() => {
    if (mazeSnap2Initialized) return;
    mazeSnap2Initialized = true;
    injectConfigurator({
      ...config,
      flags: {
        hidePricing: false,
      },
    });
  }, []);

  useEffect(() => installMazeSnap2Patches(), []);

  return (
    <>
      <div
        id="ov25-initialise-menu"
        className="fixed inset-0 z-[2147483000] pointer-events-auto"
      />
      <div className="flex h-full w-calc(100dvw - 32px) flex-col">
        <main className={`flex min-h-0 flex-1 flex-col overflow-hidden ${useMobileLayout ? '' : 'md:flex-row'}`}>
          {/* Gallery */}
          <div className="configurator-container flex h-full w-full flex-1 flex-col overflow-hidden" />
          {/* Variants */}
          <aside
            id="ov25-aside-menu"
            className={`flex min-h-0 w-full flex-1 flex-col overflow-hidden ${
              useMobileLayout ? '' : 'md:w-[384px] md:flex-none md:shrink-0'
            }`}
          >
              <div id="ov25-controls" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden" />
           
          </aside>
        </main>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
