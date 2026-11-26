import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfiguratorSetup } from 'ov25-setup';
import 'ov25-setup/dist/index.css';

const DIAMOND_APIKEY = import.meta.env.VITE_DIAMOND_APIKEY;
const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;
const WHITEMEADOW_APIKEY = import.meta.env.VITE_WHITEMEADOW_APIKEY;

const SAVED_CONFIG = {
  "standard": {
    "selectors": {
      "gallery": { "selector": ".configurator-container", "replace": true },
      "price": { "selector": "#price", "replace": true },
      "name": { "selector": "#name", "replace": true },
      "variants": "#ov25-controls",
      "swatches": "#ov25-swatches"
    },
    "carousel": { "desktop": "stacked", "mobile": "carousel", "maxImages": { "desktop": 4, "mobile": 6 } },
    "configurator": {
      "displayMode": { "desktop": "sheet", "mobile": "drawer" },
      "triggerStyle": { "desktop": "single-button", "mobile": "single-button" },
      "variants": { "displayMode": { "desktop": "tree", "mobile": "list" }, "useSimpleVariantsSelector": true }
    },
    "flags": { "hidePricing": false, "disableAddToCart": false, "hideAr": false, "deferThreeD": false, "showOptional": false, "forceMobile": false, "autoOpen": false },
    "branding": { "cssString": ":host {\n  --ov25-configurator-iframe-background-color: #ff0000;\n}" }
  },
  "snap2": {
    "selectors": {
      "price": { "selector": "#price", "replace": true },
      "name": { "selector": "#name", "replace": true },
      "variants": "#ov25-controls",
      "swatches": "#ov25-swatches",
      "configureButton": "[data-ov25-configure-button]"
    },
    "carousel": { "desktop": "stacked", "mobile": "carousel", "maxImages": { "desktop": 4, "mobile": 6 } },
    "configurator": {
      "displayMode": { "desktop": "sheet", "mobile": "drawer" },
      "triggerStyle": { "desktop": "single-button", "mobile": "single-button" },
      "variants": { "displayMode": { "desktop": "tree", "mobile": "list" }, "useSimpleVariantsSelector": true }
    },
    "flags": { "hidePricing": false, "disableAddToCart": false, "hideAr": false, "deferThreeD": false, "showOptional": false, "forceMobile": false, "autoOpen": false }
  },
  "bedConfigurator": {
    "selectors": {
      "gallery": { "selector": ".configurator-container", "replace": true },
      "price": { "selector": "#price", "replace": true },
      "name": { "selector": "#name", "replace": true },
      "variants": "#ov25-controls",
      "swatches": "#ov25-swatches",
      "configureButton": "#ov25-fullscreen-button"
    },
    "carousel": { "desktop": "stacked", "mobile": "carousel", "maxImages": { "desktop": 4, "mobile": 6 } },
    "configurator": {
      "displayMode": { "desktop": "sheet", "mobile": "drawer" },
      "triggerStyle": { "desktop": "single-button", "mobile": "single-button" },
      "variants": { "displayMode": { "desktop": "tree", "mobile": "list" }, "useSimpleVariantsSelector": true }
    },
    "flags": { "hidePricing": false, "disableAddToCart": false, "hideAr": false, "deferThreeD": false, "showOptional": false, "forceMobile": false, "autoOpen": false },
    "branding": { "cssString": "ov25-selection-thumbnail: bg-white;" },
    "bed": { "allowNone": { "headboard": true, "base": true, "mattress": true } }
  }
};

function App() {
  const params = new URLSearchParams(window.location.search);
  const fresh = params.has('fresh');
  const demoDefaults = params.has('demoDefaults');
  const [integrationValues, setIntegrationValues] = React.useState({
    headerSelector: '.shopify-section-header',
    desktopCarouselSelector: '.product-gallery--desktop',
    mobileCarouselSelector: '.product-gallery--mobile',
    addToCartFormSelector: 'form[action="/cart/add"]',
    currencySymbol: '£',
  });

  // `?guided=standard|snap2|bedConfigurator`: guided mode in a portal-sized box with a host footer for Save.
  const guided = params.get('guided');
  const [footer, setFooter] = React.useState(null);

  const setup = (
    <ConfiguratorSetup
      guidedSelection={guided ? { layout: guided, preset: 'in-page' } : undefined}
      saveSlot={guided ? { container: footer } : undefined}
      // `&livePreview`: an open site preview that updates by itself and reports one missing placement.
      livePreview={params.has('livePreview') ? {
        onRequest: (request) => console.log('[fixture] open preview', request),
        onAutoUpdate: (request) => console.log('[fixture] auto-update', request),
        availability: 'supported', status: 'ready', message: 'Your site preview is open and updates as you edit.',
        placementValidation: {
          schemaVersion: 1, themeId: '1', template: 'product.ov25', viewport: { width: 1440, height: 900, mode: 'desktop' },
          checks: [{ key: 'price', selector: '.price', status: 'missing', matchCount: 0, issues: ['no-match'] }],
          sessionId: 'fixture', revision: 1, validationRunId: 'fixture', checkedAt: 0, activeLayout: 'standard', shopDomain: 'fixture.myshopify.com', productId: '1',
        },
      } : undefined}
      className={guided ? 'h-full' : undefined}
      onSave={guided ? () => {} : undefined}
      useLocalPreview
      previewBaseUrl={new URLSearchParams(window.location.search).get('previewBaseUrl') || undefined}
      apiKey={demoDefaults ? undefined : {
        standard: DEMO_RETAILER_APIKEY,
        snap2: WHITEMEADOW_APIKEY,
        bedConfigurator: DIAMOND_APIKEY,
      }}
      productLink={demoDefaults ? undefined : {
        snap2: 'snap2/119',
      }}
      initialConfig={fresh ? undefined : SAVED_CONFIG}
      storefrontIntegration={{
        status: 'ready',
        platformLabel: 'Shopify integration',
        scopeLabel: 'fixture-store.myshopify.com · Store-wide',
        notice: 'Integration settings are supplied and stored by the host platform, separately from setup JSON.',
        sections: [
          {
            id: 'theme-targets',
            title: 'Theme targets',
            description: 'Connect OV25 to elements owned by the storefront theme.',
            fields: [
              {
                type: 'selector',
                key: 'headerSelector',
                label: 'Header selector',
                placeholder: '.site-header',
              },
              {
                type: 'selector',
                key: 'desktopCarouselSelector',
                label: 'Desktop carousel target',
                placeholder: '.product-gallery--desktop',
              },
              {
                type: 'selector',
                key: 'mobileCarouselSelector',
                label: 'Mobile carousel target',
                placeholder: '.product-gallery--mobile',
              },
              {
                type: 'selector',
                key: 'addToCartFormSelector',
                label: 'Add to cart form selector',
                placeholder: 'form[action="/cart/add"]',
              },
            ],
          },
          {
            id: 'commerce',
            title: 'Commerce',
            description: 'Platform-owned cart and currency behaviour.',
            fields: [
              {
                type: 'text',
                key: 'currencySymbol',
                label: 'Currency symbol',
                placeholder: '£',
              },
            ],
          },
        ],
        values: integrationValues,
        onChange: (key, value) => {
          setIntegrationValues((current) => ({ ...current, [key]: value }));
        },
      }}
    />
  );
  if (!guided) return setup;
  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Guided host page</h1>
      <div style={{ height: 560, border: '1px solid #eaeaea', borderRadius: 14, overflow: 'hidden' }}>{setup}</div>
      <div ref={setFooter} data-host-footer style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 0' }} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
