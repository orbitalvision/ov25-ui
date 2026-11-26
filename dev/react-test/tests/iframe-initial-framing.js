import { injectConfigurator } from 'ov25-ui';
import settings from './iframe-framing-settings.json';

const params = new URLSearchParams(window.location.search);
const modes = ['sticky', 'sheet', 'carousel', 'stacked'];
const mode = modes.includes(params.get('mode')) ? params.get('mode') : 'sticky';
// The storefront embed key for the original small-model reproduction product, kept out of the repository.
const key = import.meta.env.VITE_IFRAME_FRAMING_APIKEY;
const product = '10127';
const plain = document.querySelector('#framing-plain');
const output = document.querySelector('#framing-measurements');
const started = performance.now();
const sizes = new Map();
const observed = new WeakSet();
let loads = 0;

function log(message) {
  output.textContent += `${Math.round(performance.now() - started)}ms ${message}\n`;
  output.scrollTop = output.scrollHeight;
}
function inspect(root) {
  for (const element of root.querySelectorAll('*')) {
    if (element.matches('iframe') && element.id !== 'ov25-dummy-iframe') {
      const rect = element.getBoundingClientRect();
      const phase = element.getAttribute('src') ? 'source set' : 'waiting for layout';
      const size = `${Math.round(rect.width)} × ${Math.round(rect.height)} (${phase})`;
      if (sizes.get(element) !== size) {
        sizes.set(element, size);
        log(`${element.id || 'iframe'}: ${size}`);
      }
      if (element.id === 'ov25-configurator-iframe' && !observed.has(element)) {
        observed.add(element);
        element.addEventListener('load', () => log(`UI iframe document loads: ${++loads}`));
      }
    }
    if (element.shadowRoot) inspect(element.shadowRoot);
  }
}
document.querySelectorAll('[data-layout]').forEach(link => {
  const url = new URL(window.location.href);
  url.searchParams.set('mode', link.dataset.layout);
  link.href = url.href;
  if (link.dataset.layout === mode) link.setAttribute('aria-current', 'page');
});
document.querySelector('#framing-label').textContent = `Local OV25 UI · ${mode}`;

// Copy the actual UI URL so both viewers use identical origin, selections and
// camera parameters. The reference already has its square viewport before src.
let referenceStarted = false;
function sample() {
  inspect(document);
  if (!referenceStarted) {
    const uiFrame = [...sizes.keys()].find(element => element.id === 'ov25-configurator-iframe');
    const src = uiFrame?.getAttribute('src');
    if (src && src !== 'about:blank') {
      plain.src = src;
      referenceStarted = true;
    }
  }
}
const timer = setInterval(sample, 50);
window.addEventListener('pagehide', () => clearInterval(timer), { once: true });
if (import.meta.hot) import.meta.hot.dispose(() => clearInterval(timer));

if (!key) log('Set VITE_IFRAME_FRAMING_APIKEY in ov25-ui/.env, then restart Vite.');
injectConfigurator({
  apiKey: () => key,
  productLink: () => product,
  selectors: {
    gallery: { selector: '#framing-gallery', replace: false },
    variants: '#framing-variants',
    name: { selector: '#framing-name', replace: false },
    price: { selector: '#framing-price', replace: false },
  },
  carousel: mode === 'sticky' ? settings.carousel : {
    desktop: mode === 'sheet' ? 'carousel' : mode,
    mobile: 'carousel',
    autoCutouts: true,
  },
  configurator: mode === 'sticky' ? settings.configurator : {
    displayMode: { desktop: mode === 'sheet' ? 'sheet' : 'inline', mobile: mode === 'sheet' ? 'drawer' : 'inline' },
    variants: { displayMode: { desktop: 'list', mobile: 'list' } },
  },
  branding: settings.branding,
  flags: { hidePricing: true },
  callbacks: { addToBasket: () => {}, buyNow: () => {} },
});
