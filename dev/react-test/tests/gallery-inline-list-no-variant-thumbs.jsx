import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;
const SANITIZED_MESSAGE_FLAG = '__ov25NoVariantThumbsFixture';
const SANITIZED_MESSAGE_TYPES = new Set(['ALL_PRODUCTS', 'CONFIGURATOR_STATE', 'CURRENT_PRICE']);

function stripVariantThumbnailFields(value) {
  if (Array.isArray(value)) return value.map(stripVariantThumbnailFields);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== 'thumbnail' && key !== 'miniThumbnails')
      .map(([key, child]) => [key, stripVariantThumbnailFields(child)])
  );
}

function buildNoVariantThumbnailMessage(data) {
  if (!data || typeof data !== 'object' || data[SANITIZED_MESSAGE_FLAG]) return null;
  if (!SANITIZED_MESSAGE_TYPES.has(data.type) || typeof data.payload !== 'string') return null;

  try {
    return {
      ...data,
      payload: JSON.stringify(stripVariantThumbnailFields(JSON.parse(data.payload))),
      [SANITIZED_MESSAGE_FLAG]: true,
    };
  } catch {
    return null;
  }
}

function installNoVariantThumbnailFixture() {
  window.addEventListener(
    'message',
    (event) => {
      const sanitizedData = buildNoVariantThumbnailMessage(event.data);
      if (!sanitizedData) return;

      event.stopImmediatePropagation();
      window.dispatchEvent(
        new MessageEvent('message', {
          data: sanitizedData,
          origin: event.origin,
          lastEventId: event.lastEventId,
          source: event.source,
          ports: event.ports,
        })
      );
    },
    true
  );
}

installNoVariantThumbnailFixture();

const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => DEMO_RETAILER_APIKEY,
  productLink: () => '58',
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    variants: '#ov25-controls',
    swatches: '#ov25-swatches',
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
  },
  carousel: { desktop: 'stacked', mobile: 'carousel' },
  configurator: {
    displayMode: { desktop: 'inline', mobile: 'inline' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: { displayMode: { desktop: 'list', mobile: 'list' } },
  },
  callbacks: {
    addToBasket: () => alert('Add to basket'),
    buyNow: () => alert('Buy now'),
    buySwatches: () => alert('Add swatches to cart'),
  },
  flags: { hidePricing: false },
});

function App() {
  return (
    <TestPageLayout
      title="Gallery - Inline + List - No Variant Thumbnails"
      description="Inline configurator with list variant display and stripped variant thumbnail payloads."
      injectConfig={config}
      showProductTabs
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
export default App;
