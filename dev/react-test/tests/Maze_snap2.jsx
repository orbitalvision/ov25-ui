import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';

import '../src/index.css';

let mazeSnap2Initialized = false;

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

.ov25-module-variant-detail-sheet-footer {
  padding-bottom: 0.5rem;
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
`;

/** Inject InitialiseMenu host (`portalReplaceElement` adds this class). */
const INITIALISE_MENU_HOST_SELECTOR = '.ov25-configurator-initialise-menu';

/**
 * Variants slot from config (`variants: '#ov25-controls'`). With `pushPortal` + shadow, inject
 * `attachShadow`s on this node and portals `VariantSelectMenu` into `#ov25-controls`’s shadow root
 * (not `.ov25-configurator-variants`, which is only used when the slot uses `replace: true`).
 */
const VARIANTS_CONTROLS_HOST_SELECTOR = '#ov25-controls';
const CHECKOUT_SHEET_BODY_CLASS = 'ov25-snap2-checkout-sheet-body';
const MAZE_CHECKOUT_BODY_FLAG = 'data-maze-snap2-checkout-body';

const INITIALISE_MENU_INTRO_SELECTOR = '[data-ov25-initialise-menu-intro]';
const DEFAULT_INITIALISE_INTRO = 'Select a product to get started';
const EMBER_TITLE = 'Ember Configurator';
const EMBER_INITIALISE_MENU_INTRO =
  'Build your dream Ember Kitchen by selecting a starting component. Use the filters to easily browse Middle, Corner, or End sections. To grow your layout, simply click the (+) icon next to any item to add a module to that side. You can select any component to replace it, click (+) anywhere to insert a new piece, or use delete to remove items.';

/**
 * Single InitialiseMenu host (`.ov25-configurator-initialise-menu`). Stale `dist` may omit
 * `data-ov25-initialise-menu-intro`; React can revert `textContent` — we re-apply on an interval and
 * MutationObserver on that host’s shadow root.
 */
function findInitialiseMenuIntroParagraph() {
  const host = document.querySelector(INITIALISE_MENU_HOST_SELECTOR);
  const sr = host?.shadowRoot;
  if (!sr) return null;
  const menuRoot = sr.querySelector('#ov25-initialise-menu');
  if (!menuRoot) return null;
  const byData = menuRoot.querySelector(INITIALISE_MENU_INTRO_SELECTOR);
  if (byData instanceof HTMLParagraphElement) return byData;
  for (const p of Array.from(menuRoot.querySelectorAll('p'))) {
    if ((p.textContent || '').trim() === DEFAULT_INITIALISE_INTRO) return p;
  }
  return null;
}

function applyEmberInitialiseMenuIntro() {
  const el = findInitialiseMenuIntroParagraph();
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

function findCheckoutSheetBody() {
  const host = document.querySelector(VARIANTS_CONTROLS_HOST_SELECTOR);
  const sr = host?.shadowRoot;
  if (!sr) return null;
  return sr.querySelector(`.${CHECKOUT_SHEET_BODY_CLASS}`);
}

/** Replace {@link Snap2VariantSheetColumn} body wrapper contents with a visible placeholder (React may revert; we re-apply). */
function applyMazeCheckoutSheetBodyPlaceholder() {
  const body = findCheckoutSheetBody();
  if (!body) return;
  if (body.firstElementChild?.getAttribute(MAZE_CHECKOUT_BODY_FLAG) === 'true') return;
  const red = document.createElement('div');
  red.setAttribute(MAZE_CHECKOUT_BODY_FLAG, 'true');
  red.style.cssText = 'min-height:8rem;flex:1 1 auto;width:100%;height:100%;background:red';
  body.replaceChildren(red);
  const host = document.querySelector(VARIANTS_CONTROLS_HOST_SELECTOR);
  const sr = host?.shadowRoot;
  const footer = sr?.querySelector('#ov25-snap2-checkout-sheet-footer');
  if (footer instanceof HTMLElement) {
    footer.style.setProperty('display', 'none', 'important');
  }
}

function installMazeSnap2DomDemoPatches() {
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
    applyEmberInitialiseMenuIntro();
    applyMazeCheckoutSheetBodyPlaceholder();
    tryObserveShadow(INITIALISE_MENU_HOST_SELECTOR, 'ov25MazeIntroObserved', applyEmberInitialiseMenuIntro);
    tryObserveShadow(VARIANTS_CONTROLS_HOST_SELECTOR, 'ov25MazeCheckoutBodyObserved', applyMazeCheckoutSheetBodyPlaceholder);
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

/**
 * Client baseline settings for Snap2 inline usage:
 * - selectors.gallery + selectors.variants + selectors.swatches are required.
 * - selectors.initialiseMenu is required for inline mode so the initial module chooser has a dedicated host.
 * - carousel should be none for both breakpoints.
 * - displayMode must be inline for both desktop and mobile.
 */
const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => '27-87235dc13ef0089116f2bcd35dda712a8a26880541681261e9399016a89a4782',
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

  /** Match Snap2 mobile behavior: phones + portrait tablets. */
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
    if (mazeSnap2Initialized) return;
    mazeSnap2Initialized = true;
    injectConfigurator({
      ...config,
      flags: {
        hidePricing: false,
      },
    });
  }, []);

  useEffect(() => installMazeSnap2DomDemoPatches(), []);

  return (
    <>
      <div
        id="ov25-initialise-menu"
        className="ov:fixed ov:inset-0 ov:z-2147483000 ov:pointer-events-auto"
      />
      <div className="snap2-inline-page ov:flex ov:h-dvh ov:w-full ov:flex-col">
        <main className={`ov:flex ov:min-h-0 ov:flex-1 ov:flex-col ov:overflow-hidden ${useMobileLayout ? '' : 'ov:md:flex-row'}`}>
          <div className="configurator-container ov:flex ov:h-full ov:w-full ov:flex-1 ov:flex-col ov:overflow-hidden" />
          <aside
            id="ov25-aside-menu"
            className={`ov:flex ov:min-h-0 ov:w-full ov:flex-1 ov:flex-col ov:overflow-hidden  ${
              useMobileLayout ? '' : 'ov:md:w-[min(420px,40vw)] ov:md:max-w-[480px] ov:md:flex-none ov:md:shrink-0'
            }`}
          >
            <div
              className={`ov:flex ov:min-h-0 ov:flex-1 ov:flex-col ov:overflow-hidden ov:px-4 ${
                useMobileLayout ? '' : 'ov:md:pb-4'
              }`}
            >
              <div id="ov25-controls" className="ov:min-h-0 ov:flex-1 ov:overflow-y-auto ov:overflow-x-hidden" />
            </div>
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
