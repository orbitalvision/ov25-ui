import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;
const FALLBACK_SIZE_NAMES = ['Chaise LHF', 'Chaise RHF', 'Corner Unit'];
const RELEVANT_MESSAGE_TYPES = new Set([
  'ALL_PRODUCTS',
  'CONFIGURATOR_STATE',
  'SELECTED_SELECTIONS',
  'CURRENT_SKU',
  'CURRENT_PRODUCT_ID',
  'ERROR',
]);

const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => DEMO_RETAILER_APIKEY,
  productLink: () => 'range/126',
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    variants: '#ov25-controls',
    swatches: '#ov25-swatches',
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
  },
  carousel: { desktop: 'stacked', mobile: 'carousel' },
  configurator: {
    displayMode: { desktop: 'sheet', mobile: 'drawer' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: {
      displayMode: { desktop: 'tree', mobile: 'list' },
      hideOptions: ['size'],
    },
  },
  callbacks: {
    addToBasket: () => alert('Checkout function called'),
    buyNow: () => alert('Buy now function called'),
    buySwatches: () => alert('Add swatches to cart'),
  },
  flags: { hidePricing: false },
});

function normalizeLabel(value) {
  return String(value ?? '').trim().toLowerCase();
}

function parsePayload(payload) {
  if (!payload) return {};
  if (typeof payload !== 'string') return payload;
  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
}

function findSizeOption(state) {
  const options = Array.isArray(state?.options) ? state.options : [];
  return options.find((option) => {
    const optionId = normalizeLabel(option?.id);
    const optionName = normalizeLabel(option?.name);
    return optionId === 'size' || optionName === 'size' || optionName === 'sizes';
  });
}

function getSelectionNames(option) {
  const names = [];
  for (const group of option?.groups ?? []) {
    for (const selection of group?.selections ?? []) {
      if (selection?.name && !names.includes(selection.name)) {
        names.push(selection.name);
      }
    }
  }
  return names.slice(0, 3);
}

function getSelectedSizeName(state, option) {
  const selectedRows = Array.isArray(state?.selectedSelections) ? state.selectedSelections : [];
  const selectedForSize = selectedRows.find((row) => row.optionId === option?.id);
  if (!selectedForSize) return '';

  for (const group of option?.groups ?? []) {
    for (const selection of group?.selections ?? []) {
      if (selection?.id === selectedForSize.selectionId) return selection.name;
    }
  }

  return '';
}

function findSelectionByName(option, selectionName) {
  const requestedName = normalizeLabel(selectionName);
  for (const group of option?.groups ?? []) {
    for (const selection of group?.selections ?? []) {
      if (normalizeLabel(selection?.name) === requestedName) {
        return { group, selection };
      }
    }
  }
  return null;
}

function getProductSizeButtons(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return FALLBACK_SIZE_NAMES.map((name) => ({ id: null, name }));
  }
  return products.slice(0, 3).map((product) => ({
    id: product?.id ?? null,
    name: product?.name ?? `Product ${product?.id}`,
  }));
}

/**
 * @param {Document | ShadowRoot} [root]
 */
function findConfiguratorIframe(root = document) {
  const iframe = /** @type {HTMLIFrameElement | null} */ (
    root.querySelector?.('iframe[id^="ov25-configurator-iframe"]') ?? null
  );
  if (iframe?.contentWindow) return iframe;

  const elements = Array.from(root.querySelectorAll?.('*') ?? []);
  for (const element of elements) {
    if (!element.shadowRoot) continue;
    const iframeInShadowRoot = findConfiguratorIframe(element.shadowRoot);
    if (iframeInShadowRoot?.contentWindow) return iframeInShadowRoot;
  }

  return null;
}

function SizeButtons() {
  const [configuratorState, setConfiguratorState] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [lastRequestedSize, setLastRequestedSize] = useState('');
  const [lastError, setLastError] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    function handleMessage(event) {
      const { type, payload } = event.data ?? {};
      if (!RELEVANT_MESSAGE_TYPES.has(type)) return;

      const data = parsePayload(payload);
      if (type === 'ALL_PRODUCTS') setProducts(Array.isArray(data) ? data : []);
      if (type === 'CURRENT_PRODUCT_ID') setCurrentProductId(data);
      if (type === 'CONFIGURATOR_STATE') setConfiguratorState(data);
      if (type === 'SELECTED_SELECTIONS') {
        setConfiguratorState((current) => current ? { ...current, selectedSelections: data } : current);
        setLastError('');
      }
      if (type === 'ERROR') setLastError(data?.message ?? JSON.stringify(data));

      setMessages((current) => [
        {
          type,
          summary: type === 'ALL_PRODUCTS'
            ? `Products: ${data.map((product) => `${product.id}:${product.name}`).join(', ')}`
            : type === 'CONFIGURATOR_STATE'
              ? `Options: ${(data?.options ?? []).map((option) => `${option.id}:${option.name}`).join(', ')}`
              : type === 'SELECTED_SELECTIONS'
              ? `Selected: ${JSON.stringify(data)}`
            : JSON.stringify(data),
        },
        ...current,
      ].slice(0, 5));
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sizeOption = useMemo(() => findSizeOption(configuratorState), [configuratorState]);
  const sizeNames = useMemo(() => {
    const discoveredNames = getSelectionNames(sizeOption);
    return discoveredNames.length >= 3 ? discoveredNames : FALLBACK_SIZE_NAMES;
  }, [sizeOption]);
  const productSizeButtons = useMemo(() => getProductSizeButtons(products), [products]);
  const selectedSizeName = useMemo(
    () => getSelectedSizeName(configuratorState, sizeOption),
    [configuratorState, sizeOption]
  );
  const sizeOptionName = sizeOption?.name || 'Size';

  function sendSizeSelection(sizeButton) {
    const iframeEl = findConfiguratorIframe();
    if (!iframeEl?.contentWindow) {
      setLastError('Configurator iframe not found yet.');
      return;
    }

    const matchedSizeSelection = findSelectionByName(sizeOption, sizeButton.name);
    const canUseProductSelection = typeof sizeButton.id === 'number';
    const message = canUseProductSelection
      ? { type: 'SELECT_PRODUCT', payload: JSON.stringify(sizeButton.id) }
      : {
          type: 'SELECT_SELECTION',
          payload: JSON.stringify(
            matchedSizeSelection
              ? {
                  optionId: sizeOption.id,
                  groupId: matchedSizeSelection.group.id,
                  selectionId: matchedSizeSelection.selection.id,
                }
              : { [sizeOptionName]: sizeButton.name }
          ),
        };

    iframeEl.contentWindow.postMessage(message, '*');
    setLastRequestedSize(sizeButton.name);
    setLastError('');
  }

  return (
    <div className="ov:my-4 ov:rounded-lg ov:border ov:border-gray-200 ov:bg-white ov:p-4">
      <h2 className="ov:m-0 ov:text-sm ov:font-semibold ov:text-[#1a1a1a]">Custom size buttons</h2>
      <p className="ov:mt-1 ov:mb-3 ov:text-xs ov:text-[#525252]">
        The normal Size variant UI is hidden with <code>hideOptions: ['size']</code>. Range sizes come from
        <code> ALL_PRODUCTS </code>
        and are switched with <code>SELECT_PRODUCT</code>; <code>SELECT_SELECTION</code> is only used as a fallback.
      </p>

      <div className="ov:flex ov:flex-wrap ov:gap-2">
        {productSizeButtons.map((sizeButton) => {
          const isSelected = currentProductId != null && String(currentProductId) === String(sizeButton.id);
          return (
            <button
              key={sizeButton.id ?? sizeButton.name}
              type="button"
              onClick={() => sendSizeSelection(sizeButton)}
              className={`ov:cursor-pointer ov:rounded-md ov:border ov:px-3 ov:py-2 ov:text-sm ov:font-medium ${
                isSelected
                  ? 'ov:border-[#1a1a1a] ov:bg-[#1a1a1a] ov:text-white'
                  : 'ov:border-gray-300 ov:bg-white ov:text-[#1a1a1a] ov:hover:bg-gray-50'
              }`}
            >
              {sizeButton.name}
            </button>
          );
        })}
      </div>

      <div className="ov:mt-3 ov:space-y-1 ov:text-xs ov:text-[#525252]">
        <div>Range products detected: {products.length || 'Waiting for ALL_PRODUCTS'}</div>
        <div>Configurator variant options: {(configuratorState?.options ?? []).map((option) => option.name).join(', ') || 'Unknown'}</div>
        <div>Current product id: {currentProductId ?? 'Unknown'}</div>
        <div>Hidden size option from CONFIGURATOR_STATE: {selectedSizeName || 'Not present'}</div>
        <div>Last requested size: {lastRequestedSize || 'None'}</div>
        {lastError ? <div className="ov:text-red-600">Last error: {lastError}</div> : null}
      </div>

      <details className="ov:mt-3">
        <summary className="ov:cursor-pointer ov:text-xs ov:font-medium ov:text-[#525252]">
          Recent configurator messages
        </summary>
        <pre className="ov:mt-2 ov:max-h-40 ov:overflow-auto ov:rounded ov:bg-gray-50 ov:p-2 ov:text-[11px] ov:text-[#1a1a1a]">
          {messages.length ? messages.map((message) => `${message.type}: ${message.summary}`).join('\n') : 'No messages yet.'}
        </pre>
      </details>
    </div>
  );
}

function App() {
  return (
    <TestPageLayout
      title="Range - Hidden Size with Buttons"
      description="Arlo&Jacob - Otti range with Size hidden from variants and controlled by host page buttons."
      injectConfig={config}
      asideSlot={<SizeButtons />}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
