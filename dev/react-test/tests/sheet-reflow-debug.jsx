import React from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import sofaImage from '../src/images/sofa.png';
import '../src/index.css';
import { TestBackButton } from '../templates/TestBackButton.jsx';
import { ViewportWrapper } from '../templates/ViewportWrapper.jsx';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;

let configuratorInitialized = false;

const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => DEMO_RETAILER_APIKEY,
  productLink: () => '576',
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    variants: '#ov25-controls',
    swatches: '#ov25-swatches',
    name: { selector: '#name', replace: true },
  },
  carousel: { desktop: 'stacked', mobile: 'carousel' },
  configurator: {
    displayMode: { desktop: 'sheet', mobile: 'drawer' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: { displayMode: { desktop: 'tree', mobile: 'list' } },
  },
  callbacks: {
    addToBasket: () => {},
    buyNow: () => {},
    buySwatches: () => {},
  },
  flags: { hidePricing: true },
});

const DEBUG_BODY_CLASS = 'sheet-reflow-debug-body';
const DEBUG_HTML_CLASS = 'sheet-reflow-debug-html';

function DiagnosticBand({ className = '', label, children }) {
  return (
    <section className={`sheet-reflow-debug-band ${className}`}>
      <div className="sheet-reflow-debug-band-label">{label}</div>
      <div>{children}</div>
    </section>
  );
}

function App() {
  React.useEffect(() => {
    document.documentElement.classList.add(DEBUG_HTML_CLASS);
    document.body.classList.add(DEBUG_BODY_CLASS);

    if (!configuratorInitialized) {
      const forceMobile = window.location.search.includes('viewport=mobile');
      injectConfigurator({
        ...config,
        flags: {
          ...config.flags,
          ...(forceMobile ? { forceMobile: true } : {}),
        },
      });
      configuratorInitialized = true;
    }

    return () => {
      document.documentElement.classList.remove(DEBUG_HTML_CLASS);
      document.body.classList.remove(DEBUG_BODY_CLASS);
    };
  }, []);

  return (
    <ViewportWrapper>
      <style>{`
        html.${DEBUG_HTML_CLASS},
        body.${DEBUG_BODY_CLASS} {
          min-height: 100%;
          height: auto;
        }

        body.${DEBUG_BODY_CLASS} {
          margin: 0;
          color: #111827;
          background:
            linear-gradient(90deg, rgba(17, 24, 39, 0.18) 1px, transparent 1px),
            linear-gradient(0deg, rgba(17, 24, 39, 0.18) 1px, transparent 1px),
            repeating-linear-gradient(135deg, #ffe45c 0 18px, #ff6b6b 18px 36px, #2dd4bf 36px 54px, #60a5fa 54px 72px);
          background-size: 48px 48px, 48px 48px, auto;
        }

        body.${DEBUG_BODY_CLASS} #root {
          min-height: 100%;
          height: auto;
        }

        body.${DEBUG_BODY_CLASS}::before,
        body.${DEBUG_BODY_CLASS}::after {
          content: '';
          position: fixed;
          pointer-events: none;
          z-index: 2147483647;
        }

        body.${DEBUG_BODY_CLASS}::before {
          top: 0;
          bottom: 0;
          left: 50%;
          width: 4px;
          background: #111827;
          box-shadow: -12px 0 0 #facc15, 12px 0 0 #22c55e;
        }

        body.${DEBUG_BODY_CLASS}::after {
          top: 50%;
          left: 0;
          right: 0;
          height: 4px;
          background: #dc2626;
          box-shadow: 0 -12px 0 #2563eb, 0 12px 0 #f97316;
        }

        .sheet-reflow-debug-page {
          position: relative;
          min-height: 210vh;
          padding: 28px;
          box-sizing: border-box;
        }

        .sheet-reflow-debug-fixed-label {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 2147483647;
          padding: 10px 12px;
          border: 3px solid #111827;
          background: #f8fafc;
          color: #111827;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.2;
          text-transform: uppercase;
          pointer-events: none;
        }

        .sheet-reflow-debug-band {
          display: grid;
          grid-template-columns: minmax(88px, 140px) minmax(0, 1fr);
          gap: 18px;
          align-items: center;
          min-height: 168px;
          margin: 0 auto 28px;
          max-width: 1280px;
          padding: 24px;
          border: 6px solid #111827;
          box-shadow: 12px 12px 0 #111827;
          font-weight: 700;
        }

        .sheet-reflow-debug-band-label {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 96px;
          border: 4px dashed currentColor;
          font-size: 18px;
          text-transform: uppercase;
        }

        .sheet-reflow-debug-band-top {
          background: #f97316;
          color: #111827;
        }

        .sheet-reflow-debug-band-bottom {
          margin-top: 36px;
          margin-bottom: 72px;
          background: #22c55e;
          color: #052e16;
        }

        .sheet-reflow-debug-shell {
          max-width: 1280px;
          margin: 0 auto;
          border: 8px solid #111827;
          background:
            repeating-linear-gradient(0deg, rgba(17, 24, 39, 0.08) 0 12px, transparent 12px 24px),
            #f8fafc;
          box-shadow: 16px 16px 0 #111827;
        }

        .sheet-reflow-debug-header {
          padding: 22px 26px;
          border-bottom: 8px solid #111827;
          background: #2563eb;
          color: #ffffff;
        }

        .sheet-reflow-debug-header h1 {
          margin: 0 0 8px;
          color: inherit;
          font-size: 30px;
          line-height: 1.1;
        }

        .sheet-reflow-debug-header p {
          margin: 0;
          max-width: 680px;
          color: inherit;
          font-size: 15px;
          font-weight: 600;
        }

        .sheet-reflow-debug-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
          gap: 0;
          min-height: 620px;
        }

        .sheet-reflow-debug-gallery-panel {
          padding: 22px;
          border-right: 8px solid #111827;
          background: #e879f9;
        }

        .sheet-reflow-debug-gallery-wrapper {
          min-height: 590px;
          padding: 18px;
          border: 6px solid #111827;
          background:
            linear-gradient(45deg, rgba(255, 255, 255, 0.24) 25%, transparent 25% 50%, rgba(255, 255, 255, 0.24) 50% 75%, transparent 75%),
            #a7f3d0;
          background-size: 32px 32px;
        }

        .sheet-reflow-debug-slot-caption {
          display: inline-block;
          margin-bottom: 12px;
          padding: 8px 10px;
          border: 3px solid #111827;
          background: #facc15;
          color: #111827;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .sheet-reflow-debug-gallery-slot {
          width: 100%;
          height: 548px;
          max-height: 548px;
          overflow: hidden;
          border: 6px solid #be123c;
          background: #ffffff;
        }

        .sheet-reflow-debug-gallery-slot img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sheet-reflow-debug-aside {
          padding: 22px;
          background: #fde68a;
        }

        .sheet-reflow-debug-name {
          min-height: 72px;
          margin-bottom: 16px;
          padding: 14px;
          border: 5px solid #111827;
          background: #ffffff;
          color: #111827;
          font-size: 22px;
          font-weight: 800;
        }

        .sheet-reflow-debug-aside-note,
        .sheet-reflow-debug-controls-slot,
        .sheet-reflow-debug-swatches-slot {
          margin-top: 16px;
          padding: 14px;
          border: 4px dashed #111827;
          background: #ffffff;
          color: #111827;
          font-size: 13px;
          font-weight: 700;
        }

        .sheet-reflow-debug-after {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          padding: 22px;
          border-top: 8px solid #111827;
          background: #0f766e;
        }

        .sheet-reflow-debug-after-card {
          min-height: 116px;
          padding: 14px;
          border: 4px solid #111827;
          background: #ffffff;
          color: #111827;
          font-size: 13px;
          font-weight: 800;
        }

        @media (max-width: 860px) {
          .sheet-reflow-debug-page {
            padding: 16px;
          }

          .sheet-reflow-debug-band {
            grid-template-columns: 1fr;
            box-shadow: 8px 8px 0 #111827;
          }

          .sheet-reflow-debug-layout,
          .sheet-reflow-debug-after {
            grid-template-columns: 1fr;
          }

          .sheet-reflow-debug-gallery-panel {
            border-right: 0;
            border-bottom: 8px solid #111827;
          }
        }
      `}</style>
      <div className="sheet-reflow-debug-page">
        <TestBackButton />
        <div className="sheet-reflow-debug-fixed-label">
          Fixed viewport marker
          <br />
          Sheet reflow debug
        </div>

        <DiagnosticBand className="sheet-reflow-debug-band-top" label="Above">
          Top page band. If sheet mode reflows the client page, this block should visibly shift against the fixed center rulers.
        </DiagnosticBand>

        <main className="sheet-reflow-debug-shell">
          <header className="sheet-reflow-debug-header">
            <h1>Sheet Reflow Debug</h1>
            <p>Single product, no pricing, desktop sheet mode. Strong colors expose page movement or configurator disappearance during the sheet transition.</p>
          </header>

          <section className="sheet-reflow-debug-layout">
            <div className="sheet-reflow-debug-gallery-panel">
              <div className="sheet-reflow-debug-gallery-wrapper">
                <div className="sheet-reflow-debug-slot-caption">Colored gallery slot wrapper</div>
                <div className="configurator-container sheet-reflow-debug-gallery-slot">
                  <img src={sofaImage} alt="Product" />
                </div>
              </div>
            </div>

            <aside id="ov25-aside-menu" className="sheet-reflow-debug-aside">
              <div id="price-name">
                <div id="name" className="sheet-reflow-debug-name">NAME: Product Name</div>
              </div>
              <div className="sheet-reflow-debug-aside-note">
                Pricing is intentionally hidden. The configure control should remain visible here before opening the sheet.
              </div>
              <div id="ov25-controls" className="sheet-reflow-debug-controls-slot" />
              <div id="ov25-swatches" className="sheet-reflow-debug-swatches-slot" />
            </aside>
          </section>

          <section className="sheet-reflow-debug-after">
            <div className="sheet-reflow-debug-after-card">Below marker A</div>
            <div className="sheet-reflow-debug-after-card">Below marker B</div>
            <div className="sheet-reflow-debug-after-card">Below marker C</div>
            <div className="sheet-reflow-debug-after-card">Below marker D</div>
          </section>
        </main>

        <DiagnosticBand className="sheet-reflow-debug-band-bottom" label="Below">
          Bottom page band. It should keep its place while the fixed desktop sheet animates over the page.
        </DiagnosticBand>
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
