import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import sofaImage from '../src/images/sofa.png';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;

const SCENARIOS = {
  'desktop-no-header': {
    title: 'Inline sticky / no header',
    description: 'A long product page with no theme header offset.',
    header: 'none',
  },
  'desktop-fixed-header': {
    title: 'Inline sticky / fixed header',
    description: 'A fixed announcement bar and storefront header remain above the product.',
    header: 'fixed',
  },
  'desktop-collapsing-header': {
    title: 'Inline sticky / collapsing header',
    description: 'The announcement closes, the header compacts, and downward scrolling hides it.',
    header: 'collapsing',
  },
};

const scenarioKey = document.body.dataset.fixtureStickyScenario || 'desktop-no-header';
const scenario = SCENARIOS[scenarioKey] || SCENARIOS['desktop-no-header'];
const params = new URLSearchParams(window.location.search);
const useExplicitHeader = params.get('header') === 'explicit';
const omitCarouselTarget = params.get('target') === 'missing';
const useStackedCarousel = params.get('carousel') === 'stacked';
const useStackedGalleryPath = params.get('stackedGallery') === '1';
const useCompactViewer = params.get('viewer') === 'compact';
const useContentBoxGalleryTarget = params.get('hostBox') === 'content-box';
const forceBodyLayerFallback = params.get('fallback') === 'body-layer';
const useHiddenRootOverflow = params.get('rootOverflow') === 'hidden';
const requestedDesktopDisplayMode = params.get('desktopMode');
const desktopDisplayMode =
  requestedDesktopDisplayMode === 'inline' || requestedDesktopDisplayMode === 'inline-sheet'
    ? requestedDesktopDisplayMode
    : 'inline-sticky';
const mobileDisplayMode = params.get('mobileMode') === 'inline' ? 'inline' : 'inline-sticky';
const useBlockedGalleryAncestor =
  params.get('blocker') === '1' || forceBodyLayerFallback;

let fixturePopoverMode = 'native';
if (forceBodyLayerFallback) {
  const nativeShowPopover = HTMLElement.prototype.showPopover;
  if (typeof nativeShowPopover === 'function') {
    Object.defineProperty(HTMLElement.prototype, 'showPopover', {
      configurable: true,
      writable: true,
      value: function fixtureShowPopover(...args) {
        if (this.id === 'ov25-sticky-gallery') {
          throw new DOMException(
            'Fixture forces the sticky gallery onto the body-layer fallback.',
            'NotSupportedError',
          );
        }
        return nativeShowPopover.apply(this, args);
      },
    });
    fixturePopoverMode = 'gallery-show-fails';
  } else {
    fixturePopoverMode = 'unavailable';
  }
}

const DEMO_GALLERY_IMAGES = [
  sofaImage,
  ...Array.from({ length: 5 }, (_, index) => `https://picsum.photos/800/800?random=${390 + index}`),
];

let configuratorInitialized = false;

function FixedHeader() {
  return (
    <div
      id="header-group"
      className="shopify-section-group-header-group fixture-fixed-header"
      data-fixture-header
    >
      <div className="fixture-announcement">Free delivery on made-to-order furniture</div>
      <header id="header-component" className="fixture-site-header" role="banner">
        <a className="fixture-brand" href="#product-boundary">North &amp; Loom</a>
        <nav className="fixture-navigation" aria-label="Storefront">
          <a href="#product-boundary">Seating</a>
          <a href="#materials">Materials</a>
          <a href="#delivery">Delivery</a>
        </nav>
      </header>
    </div>
  );
}

function CollapsingHeader() {
  const previousScrollY = useRef(0);
  const frame = useRef(0);
  const [headerState, setHeaderState] = useState({ compact: false, hidden: false });

  useEffect(() => {
    previousScrollY.current = window.scrollY;

    const updateHeader = () => {
      frame.current = 0;
      const scrollY = window.scrollY;
      const delta = scrollY - previousScrollY.current;

      setHeaderState((current) => {
        let hidden = current.hidden;
        if (scrollY <= 220 || delta < -1) hidden = false;
        else if (delta > 1) hidden = true;

        return { compact: scrollY > 28, hidden };
      });
      previousScrollY.current = scrollY;
    };

    const onScroll = () => {
      if (!frame.current) frame.current = window.requestAnimationFrame(updateHeader);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div
      id="HeaderWrapper"
      className="fixture-collapsing-header"
      data-compact={headerState.compact}
      data-hidden={headerState.hidden}
      data-fixture-header
    >
      <div className="fixture-collapsing-announcement">Complimentary fabric samples available</div>
      <header id="SiteHeader" className="site-header fixture-site-header" role="banner">
        <a className="fixture-brand" href="#product-boundary">North &amp; Loom</a>
        <nav className="fixture-navigation" aria-label="Storefront">
          <a href="#product-boundary">Sofas</a>
          <a href="#materials">Fabrics</a>
          <a href="#delivery">Visit us</a>
        </nav>
      </header>
    </div>
  );
}

function ThemeHeader() {
  if (scenario.header === 'fixed') return <FixedHeader />;
  if (scenario.header === 'collapsing') return <CollapsingHeader />;
  return null;
}

function ProductInformation() {
  return (
    <>
      <div className="fixture-product-heading">
        <p className="fixture-eyebrow">Handmade in Long Eaton</p>
        <h2 id="ov25-sticky-name">Hepburn three seat sofa</h2>
        <div id="ov25-sticky-price" className="fixture-price">GBP 2,195</div>
        <p className="fixture-lede">
          Deep feather-wrapped cushions, a hardwood frame, and a broad choice of upholstery.
        </p>
      </div>

      {!omitCarouselTarget ? (
        <div className="fixture-carousel-target" data-ov25-sticky-mobile-carousel />
      ) : null}

      <div id="ov25-sticky-controls" className="fixture-variant-slot" />
      <div id="ov25-sticky-swatches" className="fixture-swatch-slot" />

      <dl className="fixture-facts">
        <div><dt>Frame</dt><dd>FSC-certified hardwood</dd></div>
        <div><dt>Seat</dt><dd>Feather-wrapped foam</dd></div>
        <div><dt>Lead time</dt><dd>Eight to ten weeks</dd></div>
      </dl>
      <div className="fixture-detail-copy">
        <h3>Built for everyday use</h3>
        <p>
          Every frame is assembled by hand, with removable seat covers and reversible cushions designed for regular turning.
        </p>
        <h3>Choose your finish</h3>
        <p>
          The full list includes textured weaves, brushed cottons, velvets, and family-friendly performance fabrics.
        </p>
      </div>
    </>
  );
}

function GalleryTarget() {
  return (
    <div
      id="ov25-sticky-gallery"
      className="configurator-container fixture-gallery-target"
      style={
        useStackedGalleryPath || useContentBoxGalleryTarget
          ? {
              ...(useStackedGalleryPath ? { zIndex: 1 } : {}),
              ...(useContentBoxGalleryTarget
                ? {
                    boxSizing: 'content-box',
                    padding: '12px',
                    border: '4px solid #7b7468',
                  }
                : {}),
            }
          : undefined
      }
    >
      <img src={sofaImage} alt="Hepburn sofa" />
    </div>
  );
}

function App() {
  const config = useMemo(
    () => /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
      apiKey: () => DEMO_RETAILER_APIKEY,
      productLink: () => '58',
      images: DEMO_GALLERY_IMAGES,
      selectors: {
        gallery: { selector: '#ov25-sticky-gallery', replace: true },
        variants: '#ov25-sticky-controls',
        swatches: '#ov25-sticky-swatches',
        price: { selector: '#ov25-sticky-price', replace: true },
        name: { selector: '#ov25-sticky-name', replace: true },
        ...(useExplicitHeader ? { header: '[data-fixture-header]' } : {}),
      },
      carousel: {
        desktop: useStackedCarousel ? 'stacked' : 'carousel',
        mobile: 'carousel',
        maxImages: { desktop: 6, mobile: 6 },
      },
      configurator: {
        displayMode: { desktop: desktopDisplayMode, mobile: mobileDisplayMode },
        triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
        variants: { displayMode: { desktop: 'list', mobile: 'list' } },
      },
      branding: {
        cssString: `
          :host { --ov25-configurator-iframe-background-color: #ff0000; }
          ${useCompactViewer ? `
            .ov25-inline-sticky-iframe-slot {
              width: 72%;
              align-self: center;
              aspect-ratio: 4 / 3;
            }
          ` : ''}
        `,
      },
      callbacks: {
        addToBasket: () => alert('Add to basket'),
        buyNow: () => alert('Buy now'),
        buySwatches: () => alert('Add swatches to cart'),
      },
      flags: { hidePricing: false },
    }),
    [],
  );

  useEffect(() => {
    if (configuratorInitialized) return;
    injectConfigurator(config);
    configuratorInitialized = true;
  }, [config]);

  return (
    <div
      className={`inline-sticky-fixture scenario-${scenarioKey}`}
      data-missing-carousel-target={omitCarouselTarget ? 'true' : undefined}
      data-gallery-blocker={useBlockedGalleryAncestor}
      data-stacked-gallery-trigger={useStackedGalleryPath ? 'true' : undefined}
      data-viewer-override={useCompactViewer ? 'compact' : undefined}
      data-gallery-host-box={useContentBoxGalleryTarget ? 'content-box' : undefined}
      data-fallback-strategy={forceBodyLayerFallback ? 'body-layer' : undefined}
      data-popover-fixture={forceBodyLayerFallback ? fixturePopoverMode : undefined}
      data-root-overflow={useHiddenRootOverflow ? 'hidden' : undefined}
    >
      <ThemeHeader />
      {forceBodyLayerFallback ? (
        <div
          popover="manual"
          data-fixture-native-popover-probe
          aria-label="Native Popover control probe"
        />
      ) : null}
      <main className="fixture-main">
        <section className="fixture-intro">
          <div className="fixture-content">
            <p className="fixture-eyebrow">Bug 39 fixture</p>
            <h1>{scenario.title}</h1>
            <p>{scenario.description}</p>
          </div>
        </section>

        <section id="product-boundary" className="fixture-product-boundary">
          <div className="fixture-product-grid">
            <div className="fixture-gallery-column">
              {useBlockedGalleryAncestor ? (
                <div
                  data-fixture-gallery-blocker
                  style={{ overflow: 'clip', transform: 'translateZ(0)' }}
                >
                  <GalleryTarget />
                </div>
              ) : (
                <GalleryTarget />
              )}
              <p className="fixture-gallery-note">Hepburn collection / three seat</p>
            </div>
            <aside className="fixture-product-information" aria-label="Product options">
              <ProductInformation />
            </aside>
          </div>
        </section>

        <section id="materials" className="fixture-movement-band fixture-movement-band--mint">
          <div className="fixture-content">
            <p className="fixture-eyebrow">Materials</p>
            <h2>Natural texture, practical finishes</h2>
          </div>
        </section>
        <section className="fixture-movement-band fixture-movement-band--yellow">
          <div className="fixture-content">
            <p className="fixture-eyebrow">Craft</p>
            <h2>Made and checked by one upholstery team</h2>
          </div>
        </section>
        <section id="delivery" className="fixture-movement-band fixture-movement-band--blue">
          <div className="fixture-content">
            <p className="fixture-eyebrow">Delivery</p>
            <h2>Room-of-choice delivery across mainland UK</h2>
          </div>
        </section>
      </main>

      <style>{`
        * { box-sizing: border-box; }
        html {
          scroll-behavior: auto;
          ${useHiddenRootOverflow ? 'overflow-x: hidden;' : ''}
        }
        body {
          background: #f3f1ed;
          ${useHiddenRootOverflow ? 'overflow-x: hidden;' : ''}
        }
        #root { min-height: 100%; }
        a { color: inherit; }

        .inline-sticky-fixture {
          min-height: 100%;
          background: #f8f7f4;
          color: #181818;
          --ov25-sticky-carousel-height: 112px;
        }

        .fixture-main { min-height: 100%; }
        .scenario-desktop-fixed-header .fixture-main { padding-top: 106px; }
        .scenario-desktop-collapsing-header .fixture-main { padding-top: 110px; }

        .fixture-fixed-header,
        .fixture-collapsing-header {
          position: fixed;
          inset: 0 0 auto;
          z-index: 300;
          width: 100%;
          background: #ffffff;
          box-shadow: 0 1px 0 rgba(24, 24, 24, 0.16);
        }

        .fixture-announcement,
        .fixture-collapsing-announcement {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 34px;
          padding: 0 20px;
          background: #e7644a;
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
        }

        .fixture-site-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          padding: 0 clamp(20px, 4vw, 64px);
          background: #ffffff;
        }

        .fixture-brand {
          font-size: 19px;
          font-weight: 700;
          text-decoration: none;
        }

        .fixture-navigation { display: flex; align-items: center; gap: clamp(14px, 3vw, 34px); }
        .fixture-navigation a { font-size: 13px; font-weight: 500; text-decoration: none; }
        .fixture-navigation a:hover { text-decoration: underline; }

        .fixture-collapsing-header {
          transition: transform 180ms ease;
          will-change: transform;
        }

        .fixture-collapsing-header[data-hidden='true'] { transform: translateY(-100%); }
        .fixture-collapsing-announcement {
          max-height: 34px;
          overflow: hidden;
          transition: max-height 180ms ease, opacity 140ms ease;
        }

        .fixture-collapsing-header .fixture-site-header { transition: height 180ms ease; }
        .fixture-collapsing-header[data-compact='true'] .fixture-collapsing-announcement {
          max-height: 0;
          opacity: 0;
        }
        .fixture-collapsing-header[data-compact='true'] .fixture-site-header { height: 54px; }

        .fixture-content,
        .fixture-product-grid {
          width: min(100% - 40px, 1320px);
          margin-inline: auto;
        }

        .fixture-intro {
          display: flex;
          align-items: center;
          min-height: 220px;
          padding: 42px 0;
          background: #d9eee3;
          border-bottom: 1px solid #accdbb;
        }

        .fixture-intro h1 {
          max-width: 760px;
          margin: 4px 0 10px;
          font-size: 52px;
          line-height: 1.04;
          letter-spacing: 0;
        }

        .fixture-intro p:last-child { max-width: 650px; margin: 0; font-size: 16px; }
        .fixture-eyebrow {
          margin: 0;
          color: #474747;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .fixture-product-boundary {
          min-height: 165vh;
          padding: 56px 0 96px;
          background: #f8f7f4;
        }

        .fixture-product-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.18fr) minmax(340px, 0.82fr);
          align-items: start;
          gap: clamp(34px, 5vw, 76px);
        }

        .fixture-gallery-column,
        .fixture-product-information { min-width: 0; }

        .fixture-gallery-target {
          width: 100%;
          min-height: min(680px, calc(100dvh - 48px));
          overflow: hidden;
          border: 1px solid #c7c4bd;
          border-radius: 4px;
          background: #ece9e2;
        }

        .fixture-gallery-target > img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .fixture-gallery-note {
          margin: 12px 0 0;
          color: #64615c;
          font-size: 12px;
        }

        .fixture-product-heading { padding-bottom: 26px; border-bottom: 1px solid #cfccc5; }
        .fixture-product-heading h2 {
          margin: 8px 0 10px;
          font-size: 32px;
          line-height: 1.15;
          letter-spacing: 0;
        }

        .fixture-price { min-height: 30px; font-size: 20px; font-weight: 600; }
        .fixture-lede { max-width: 540px; margin: 16px 0 0; color: #52504c; }
        .fixture-variant-slot { display: block; width: 100%; margin-top: 28px; }
        .fixture-swatch-slot { display: block; width: 100%; }

        .fixture-carousel-target {
          display: block;
          width: 100%;
          min-height: 112px;
          margin-top: 22px;
          border-block: 1px solid #cfccc5;
          background: #ffffff;
        }

        .fixture-carousel-target:empty { display: none; }

        .fixture-facts { margin: 36px 0 0; border-top: 1px solid #cfccc5; }
        .fixture-facts > div {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid #cfccc5;
        }
        .fixture-facts dt { color: #64615c; font-size: 12px; }
        .fixture-facts dd { margin: 0; font-size: 13px; font-weight: 600; }
        .fixture-detail-copy { padding-top: 38px; }
        .fixture-detail-copy h3 { margin: 24px 0 8px; font-size: 18px; }
        .fixture-detail-copy p { margin: 0; color: #55524d; }

        .fixture-movement-band {
          display: flex;
          align-items: center;
          min-height: 340px;
          padding: 64px 0;
          border-top: 1px solid rgba(24, 24, 24, 0.18);
        }

        .fixture-movement-band h2 {
          max-width: 800px;
          margin: 10px 0 0;
          font-size: 48px;
          line-height: 1.08;
          letter-spacing: 0;
        }

        .fixture-movement-band--mint { background: #b9ddcb; }
        .fixture-movement-band--yellow { background: #f0cf62; }
        .fixture-movement-band--blue { background: #91bce2; }

        @media (max-width: 767px) {
          .fixture-navigation { gap: 14px; }
          .fixture-navigation a:nth-child(2) { display: none; }
          .fixture-site-header { height: 60px; padding-inline: 16px; }
          .scenario-desktop-fixed-header .fixture-main { padding-top: 94px; }
          .scenario-desktop-collapsing-header .fixture-main { padding-top: 94px; }
          .fixture-intro { min-height: 174px; padding: 30px 0; }
          .fixture-intro h1 { font-size: 34px; }
          .fixture-content,
          .fixture-product-grid { width: min(100% - 28px, 520px); }
          .fixture-product-boundary { min-height: 190vh; padding: 24px 0 72px; }
          .fixture-product-grid { grid-template-columns: minmax(0, 1fr); gap: 28px; }
          .fixture-gallery-target { min-height: min(100vw, 520px, calc(100dvh - 92px)); }
          .fixture-product-heading h2 { font-size: 27px; }
          .fixture-movement-band { min-height: 270px; }
          .fixture-movement-band h2 { font-size: 32px; }
        }
      `}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
