import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import { TestBackButton } from '../templates/TestBackButton.jsx';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;
const DEFAULT_GALLERY_WIDTH = 595;
const DEFAULT_GALLERY_HEIGHT = 690;
const FIXTURE_ONLY_QUERY_KEYS = new Set(['apiKey', 'product', 'mode', 'width', 'height']);

let configuratorInitialized = false;

const SHOPIFY_STANDARD_DEFAULT_SETTINGS = {
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
    variants: '#ov25-controls',
    swatches: '#ov25-swatches',
  },
  carousel: {
    desktop: 'stacked',
    mobile: 'carousel',
    maxImages: { desktop: 4, mobile: 6 },
  },
  configurator: {
    displayMode: { desktop: 'sheet', mobile: 'drawer' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: {
      displayMode: { desktop: 'tree', mobile: 'list' },
      useSimpleVariantsSelector: true,
    },
  },
  flags: {
    hidePricing: false,
    disableAddToCart: false,
    disableBuyNow: false,
    hideAr: false,
    deferThreeD: false,
    showOptional: false,
    forceMobile: false,
    autoOpen: false,
  },
};

const SIZE_PRESETS = [
  { label: 'Phone', width: 390, height: 520 },
  { label: 'AAT', width: 595, height: 690 },
  { label: 'Breakpoint +1', width: 641, height: 690 },
  { label: 'Arighi', width: 800, height: 800 },
  { label: 'Tablet portrait', width: 820, height: 640 },
  { label: 'Desktop', width: 960, height: 720 },
];

const DISPLAY_MODE_OPTIONS = [
  {
    value: 'inline',
    label: 'Inline',
    displayMode: { desktop: 'inline', mobile: 'inline' },
  },
  {
    value: 'sheet',
    label: 'Sheet / drawer',
    displayMode: { desktop: 'sheet', mobile: 'drawer' },
  },
];

function getDisplayModeOption() {
  const params = getFixtureUrlParams();
  const requested = params.get('mode') || 'inline';
  return DISPLAY_MODE_OPTIONS.find((option) => option.value === requested) ?? DISPLAY_MODE_OPTIONS[0];
}

function getFixtureParams() {
  const params = getFixtureUrlParams();
  moveFixtureQueryParamsToHash();
  const initialGalleryWidth = Number(params.get('width')) || DEFAULT_GALLERY_WIDTH;
  const initialGalleryHeight = Number(params.get('height')) || DEFAULT_GALLERY_HEIGHT;

  return {
    apiKey: params.get('apiKey') || DEMO_RETAILER_APIKEY,
    productLink: params.get('product') || '1313',
    initialGalleryWidth,
    initialGalleryHeight,
  };
}

function createConfig(displayModeOption, fixtureParams) {
  const shopifyDefaults = SHOPIFY_STANDARD_DEFAULT_SETTINGS;
  return /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
    apiKey: () => fixtureParams.apiKey,
    productLink: () => fixtureParams.productLink,
    selectors: shopifyDefaults.selectors,
    carousel: shopifyDefaults.carousel,
    configurator: {
      ...shopifyDefaults.configurator,
      displayMode: displayModeOption.displayMode,
    },
    callbacks: {
      addToBasket: () => {},
      buyNow: () => {},
      buySwatches: () => {},
    },
    flags: shopifyDefaults.flags,
  });
}

function getHashParams(url = new URL(window.location.href)) {
  return new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash);
}

function getFixtureUrlParams() {
  const url = new URL(window.location.href);
  const params = getHashParams(url);

  for (const key of FIXTURE_ONLY_QUERY_KEYS) {
    if (url.searchParams.has(key)) {
      params.set(key, url.searchParams.get(key) || '');
    }
  }

  return params;
}

function moveFixtureQueryParamsToHash() {
  const url = new URL(window.location.href);
  const hashParams = getHashParams(url);
  let changed = false;

  for (const key of FIXTURE_ONLY_QUERY_KEYS) {
    if (url.searchParams.has(key)) {
      hashParams.set(key, url.searchParams.get(key) || '');
      url.searchParams.delete(key);
      changed = true;
    }
  }

  if (changed) {
    url.hash = hashParams.toString();
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }
}

function buildModeUrl(mode) {
  const url = new URL(window.location.href);
  const hashParams = getHashParams(url);
  hashParams.set('mode', mode);
  url.searchParams.set('mode', mode);
  url.hash = hashParams.toString();

  return `${url.pathname}${url.search}${url.hash}`;
}

function buildSizeUrl(width, height) {
  const url = new URL(window.location.href);
  const hashParams = getHashParams(url);
  hashParams.set('width', String(width));
  hashParams.set('height', String(height));
  url.searchParams.set('width', String(width));
  url.searchParams.set('height', String(height));
  url.hash = hashParams.toString();

  return `${url.pathname}${url.search}${url.hash}`;
}

function walkRoots(callback) {
  const roots = [document];
  const seen = new Set();

  for (const root of roots) {
    callback(root);
    root.querySelectorAll?.('*').forEach((element) => {
      if (element.shadowRoot && !seen.has(element.shadowRoot)) {
        seen.add(element.shadowRoot);
        roots.push(element.shadowRoot);
      }
    });
  }
}

function findConfiguratorIframe() {
  /** @type {HTMLIFrameElement[]} */
  const iframes = [];

  walkRoots((root) => {
    root.querySelectorAll?.('iframe').forEach((iframe) => {
      if (iframe.id === 'ov25-configurator-iframe') iframes.push(iframe);
    });
  });

  return iframes.find((iframe) => {
    const rect = iframe.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }) ?? iframes[0] ?? null;
}

function getIframeInfo() {
  const iframe = findConfiguratorIframe();
  if (!iframe) return null;

  const rect = iframe.getBoundingClientRect();

  return {
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
}

function formatStatus(status) {
  if (status === 'capturing') return 'Capturing...';
  if (status === 'success') return 'Generated';
  if (status === 'error') return 'Failed';
  return 'Ready';
}

function App() {
  const displayModeOption = useMemo(getDisplayModeOption, []);
  const fixtureParams = useMemo(getFixtureParams, []);
  const [status, setStatus] = useState('idle');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [error, setError] = useState('');
  const [durationMs, setDurationMs] = useState(null);
  const [iframeInfo, setIframeInfo] = useState(null);
  const galleryWidth = fixtureParams.initialGalleryWidth;
  const galleryHeight = fixtureParams.initialGalleryHeight;

  useEffect(() => {
    if (!configuratorInitialized) {
      injectConfigurator(createConfig(displayModeOption, fixtureParams));
      configuratorInitialized = true;
    }

    const intervalId = window.setInterval(() => setIframeInfo(getIframeInfo()), 500);
    setIframeInfo(getIframeInfo());

    return () => window.clearInterval(intervalId);
  }, [displayModeOption, fixtureParams]);

  const generateThumbnail = useCallback(async () => {
    setStatus('capturing');
    setError('');
    setThumbnailUrl('');
    setDurationMs(null);

    try {
      if (typeof window.ov25GenerateThumbnail !== 'function') {
        throw new Error('window.ov25GenerateThumbnail is not available yet.');
      }

      const startedAt = performance.now();
      const url = await window.ov25GenerateThumbnail();
      const duration = Math.round(performance.now() - startedAt);
      setDurationMs(duration);

      if (!url) throw new Error('The screenshot API returned an empty URL.');

      setThumbnailUrl(url);
      setStatus('success');
    } catch (captureError) {
      setStatus('error');
      setError(captureError instanceof Error ? captureError.message : String(captureError));
    }
  }, []);

  return (
    <main className="cart-thumbnail-page">
      <TestBackButton />
      <style>{`
        .cart-thumbnail-page {
          max-width: 1180px;
          margin: 0 auto;
          padding: 24px;
          color: #1a1a1a;
        }

        .cart-thumbnail-header {
          margin-bottom: 20px;
        }

        .cart-thumbnail-header h1 {
          margin: 0 0 8px;
          font-size: 28px;
          line-height: 1.15;
        }

        .cart-thumbnail-header p {
          margin: 0;
          max-width: 760px;
          color: #525252;
        }

        .cart-thumbnail-layout {
          display: grid;
          grid-template-columns: minmax(0, var(--cart-thumbnail-gallery-width)) minmax(320px, 1fr);
          gap: 24px;
          align-items: start;
        }

        .cart-thumbnail-product {
          width: var(--cart-thumbnail-gallery-width);
          max-width: 100%;
        }

        .cart-thumbnail-gallery-shell {
          width: var(--cart-thumbnail-gallery-width);
          height: var(--cart-thumbnail-gallery-height);
          max-width: 100%;
          overflow: hidden;
          border: 1px solid #d4d4d4;
          border-radius: 6px;
          background: #f6f6f6;
        }

        .cart-thumbnail-gallery-shell > *,
        .configurator-container {
          width: 100%;
          height: 100%;
        }

        .configurator-container {
          overflow: hidden;
        }

        .cart-thumbnail-panel {
          border: 1px solid #d4d4d4;
          border-radius: 6px;
          background: #fff;
          padding: 16px;
        }

        .cart-thumbnail-panel + .cart-thumbnail-panel {
          margin-top: 16px;
        }

        .cart-thumbnail-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
        }

        .cart-thumbnail-actions button {
          border: 0;
          border-radius: 4px;
          background: #1a1a1a;
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-weight: 600;
          padding: 10px 14px;
        }

        .cart-thumbnail-actions button:disabled {
          cursor: wait;
          opacity: 0.55;
        }

        .cart-thumbnail-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .cart-thumbnail-mode-links {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .cart-thumbnail-mode-links a,
        .cart-thumbnail-presets button {
          border: 1px solid #d4d4d4;
          border-radius: 999px;
          background: #fff;
          color: #1a1a1a;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          padding: 6px 10px;
          text-decoration: none;
        }

        .cart-thumbnail-mode-links a[aria-current="true"],
        .cart-thumbnail-presets button[aria-pressed="true"] {
          border-color: #1a1a1a;
          background: #1a1a1a;
          color: #fff;
        }

        .cart-thumbnail-status {
          color: #525252;
          font-size: 13px;
        }

        .cart-thumbnail-error {
          margin-top: 12px;
          color: #b91c1c;
          font-size: 13px;
        }

        .cart-thumbnail-cart-line {
          display: grid;
          grid-template-columns: 96px 1fr auto;
          gap: 12px;
          align-items: start;
          margin-top: 12px;
          border-top: 1px solid #e5e5e5;
          padding-top: 12px;
        }

        .cart-thumbnail-cart-line img,
        .cart-thumbnail-empty-image {
          display: block;
          width: 96px;
          height: 96px;
          border: 1px solid #d4d4d4;
          border-radius: 4px;
          background: #f6f6f6;
          object-fit: cover;
        }

        .cart-thumbnail-empty-image {
          color: #737373;
          font-size: 12px;
          line-height: 96px;
          text-align: center;
        }

        .cart-thumbnail-cart-line h2 {
          margin: 0 0 4px;
          font-size: 16px;
        }

        .cart-thumbnail-cart-line p {
          margin: 0;
          color: #525252;
          font-size: 13px;
        }

        .cart-thumbnail-cart-line strong {
          font-size: 14px;
        }

        #price,
        #name,
        #ov25-controls,
        #ov25-swatches {
          margin-top: 16px;
        }

        @media (max-width: 960px) {
          .cart-thumbnail-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="cart-thumbnail-header">
        <h1>Cart Thumbnail</h1>
        <p>
          Generate a storefront cart thumbnail and check the cart line image before release.
        </p>
      </div>

      <div
        className="cart-thumbnail-layout"
        style={{
          '--cart-thumbnail-gallery-width': `${galleryWidth}px`,
          '--cart-thumbnail-gallery-height': `${galleryHeight}px`,
        }}
      >
        <section className="cart-thumbnail-product" aria-label="Product configurator">
          <div className="cart-thumbnail-gallery-shell">
            <div className="configurator-container" />
          </div>
          <div id="price">PRICE: £123</div>
          <div id="name">NAME: Product Name</div>
          <div id="ov25-controls" />
          <div id="ov25-swatches" />
        </section>

        <aside>
          <section className="cart-thumbnail-panel" aria-label="Thumbnail capture">
            <h2>Capture</h2>
            <p className="cart-thumbnail-status">
              Status: {formatStatus(status)}
              {durationMs ? ` (${durationMs}ms)` : ''}
            </p>
            <div className="cart-thumbnail-actions">
              <button type="button" onClick={generateThumbnail} disabled={status === 'capturing'}>
                Generate cart image
              </button>
              <span className="cart-thumbnail-status">
                {thumbnailUrl ? 'Image URL received' : 'No cart image yet'}
              </span>
            </div>
            {error ? <div className="cart-thumbnail-error">{error}</div> : null}

            <div className="cart-thumbnail-mode-links" aria-label="Configurator display mode">
              {DISPLAY_MODE_OPTIONS.map((option) => {
                return (
                  <a
                    key={option.value}
                    href={buildModeUrl(option.value)}
                    aria-current={displayModeOption.value === option.value ? 'true' : undefined}
                  >
                    {option.label}
                  </a>
                );
              })}
            </div>

            <p className="cart-thumbnail-status">
              Product: <code>{fixtureParams.productLink}</code>. Initial slot: {galleryWidth} x {galleryHeight}.
              {iframeInfo ? ` Iframe: ${iframeInfo.width} x ${iframeInfo.height}.` : ' Waiting for iframe.'}
            </p>

            <div className="cart-thumbnail-presets" aria-label="Gallery size presets">
              {SIZE_PRESETS.map((preset) => {
                const active = galleryWidth === preset.width && galleryHeight === preset.height;

                return (
                  <button
                    key={preset.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      window.location.assign(buildSizeUrl(preset.width, preset.height));
                    }}
                  >
                    {preset.label} ({preset.width}x{preset.height})
                  </button>
                );
              })}
            </div>
          </section>

          <section className="cart-thumbnail-panel" aria-label="Cart preview">
            <h2>Cart line preview</h2>
            <div className="cart-thumbnail-cart-line">
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="OV25 cart thumbnail result" />
              ) : (
                <div className="cart-thumbnail-empty-image">No image</div>
              )}
              <div>
                <h2>OV25 configured product</h2>
                <p>Uses the same line item property the Shopify cart patch reads.</p>
              </div>
              <strong>£500.00</strong>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
export default App;
