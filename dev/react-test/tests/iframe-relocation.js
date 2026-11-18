import { getConfiguratorBaseUrl } from '../../../src/utils/configurator-origin';

const page = document.querySelector('#page');
const overlay = document.querySelector('#overlay');
const panel = document.querySelector('#panel');
const layer = document.querySelector('#frame-layer');
const sourceInput = document.querySelector('#source-url');
const sceneStatus = document.querySelector('#scene-status');
const slots = {
  page: document.querySelector('#page-slot'),
  lower: document.querySelector('#lower-slot'),
  fluid: document.querySelector('#fluid-slot'),
  sheet: document.querySelector('#panel-slot'),
  modal: document.querySelector('#panel-slot'),
};
const labels = { page: 'Page · square', lower: 'Lower page · 16:9', fluid: 'Fluid width · Orla Kiely', sheet: 'Sheet · 16:9', modal: 'Modal · 16:9' };
let place = 'page';
let returnFocus = null;
let placementFrame = 0;
let expectedOrigin = null;
let loads = 0;
let iframe = null;

function positionViewer() {
  placementFrame = 0;
  const rect = slots[place].getBoundingClientRect();
  // Never hide, detach, reparent or recreate the iframe when changing locations.
  // Keeping its browsing context alive is the point of this fixture.
  if (rect.width <= 0 || rect.height <= 0) return;
  Object.assign(layer.style, {
    top: `${rect.top}px`, left: `${rect.left}px`,
    width: `${rect.width}px`, height: `${rect.height}px`,
  });
  // Match the panel's scroll clipping without changing the iframe viewport.
  // Otherwise the fixed layer would paint above the panel when its content scrolls.
  if (!overlay.hidden) {
    const bounds = panel.getBoundingClientRect();
    layer.style.clipPath = `inset(${Math.max(0, bounds.top - rect.top)}px ${Math.max(0, rect.right - bounds.right)}px ${Math.max(0, rect.bottom - bounds.bottom)}px ${Math.max(0, bounds.left - rect.left)}px)`;
  } else layer.style.removeProperty('clip-path');
}

function queuePlacement() {
  if (!placementFrame) placementFrame = requestAnimationFrame(positionViewer);
}

function setPlace(next) {
  if (!slots[next]) return;
  const opening = next === 'sheet' || next === 'modal';
  const wasOpen = !overlay.hidden;
  if (opening && !wasOpen) returnFocus = document.activeElement;
  place = next;
  overlay.dataset.place = next;
  overlay.hidden = !opening;
  page.inert = opening;
  document.body.style.overflow = opening ? 'hidden' : '';
  document.querySelector('#panel-kind').textContent = next === 'sheet' ? 'Sheet' : 'Modal';
  document.querySelector('#location').textContent = labels[next];
  document.querySelectorAll('[data-place]').forEach(button => {
    if (button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(button.dataset.place === next));
  });
  if (opening) document.querySelector('#close-panel').focus({ preventScroll: true });
  else {
    if (wasOpen && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    slots[next].scrollIntoView({ behavior: 'instant', block: 'center' });
  }
  positionViewer();
}

document.querySelectorAll('button[data-place]').forEach(button => {
  button.addEventListener('click', () => setPlace(button.dataset.place));
});
document.querySelector('#fluid-width').addEventListener('input', event => {
  const width = `${event.target.value}%`;
  document.querySelector('.fluid-gallery').style.setProperty('--fluid-gallery-width', width);
  document.querySelector('#fluid-width-value').textContent = width;
});
document.querySelector('#close-panel').addEventListener('click', () => setPlace('page'));
overlay.addEventListener('click', event => { if (event.target === overlay) setPlace('page'); });
document.addEventListener('keydown', event => {
  if (overlay.hidden) return;
  if (event.key === 'Escape') { event.preventDefault(); setPlace('page'); }
  if (event.key === 'Tab') {
    const controls = [...panel.querySelectorAll('button'), ...(iframe ? [iframe] : [])];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

const slotObserver = new ResizeObserver(queuePlacement);
new Set(Object.values(slots)).forEach(slot => slotObserver.observe(slot));
const sizeObserver = new ResizeObserver(() => {
  const { width, height } = layer.getBoundingClientRect();
  document.querySelector('#dimensions').textContent = `${Math.round(width)} × ${Math.round(height)} · ${(width / height).toFixed(2)}`;
});
sizeObserver.observe(layer);
window.addEventListener('resize', queuePlacement);
window.addEventListener('scroll', queuePlacement, true);
window.visualViewport?.addEventListener('resize', queuePlacement);

window.addEventListener('message', event => {
  if (!iframe || event.source !== iframe.contentWindow || event.origin !== expectedOrigin) return;
  if (event.data?.type !== 'IS_LOADING') return;
  let loading = event.data.payload;
  try { if (typeof loading === 'string') loading = JSON.parse(loading); } catch { return; }
  if (typeof loading === 'boolean') sceneStatus.textContent = loading ? 'Scene loading…' : 'Scene ready';
});

function loadUrl(value) {
  const error = document.querySelector('#source-error');
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
      throw new Error('Use a public HTTP or HTTPS iframe URL without username/password credentials.');
    }
    expectedOrigin = url.origin;
    sceneStatus.textContent = 'Loading document…';
    // The source form is the sole navigation path. Placement sends no messages.
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'resize-test-iframe';
      iframe.title = 'OV25 resize test configurator';
      iframe.allow = 'fullscreen; xr-spatial-tracking';
      iframe.loading = 'eager';
      iframe.addEventListener('load', () => {
        loads += 1;
        document.querySelector('#load-count').textContent = String(loads);
        if (sceneStatus.textContent === 'Loading document…') sceneStatus.textContent = 'Document loaded · waiting for scene';
      });
      positionViewer();
      iframe.src = url.href;
      layer.append(iframe);
    } else iframe.src = url.href;
    sourceInput.value = url.href;
    error.hidden = true;
    const link = new URL(window.location.href);
    link.searchParams.set('src', url.href);
    history.replaceState(null, '', link);
  } catch (cause) {
    error.textContent = cause.message;
    error.hidden = false;
    document.querySelector('.source').open = true;
  }
}

document.querySelector('#source-form').addEventListener('submit', event => {
  event.preventDefault();
  loadUrl(sourceInput.value.trim());
});

const devKey = import.meta.env.VITE_DEV_RETAILER_APIKEY;
const publicKey = devKey || import.meta.env.VITE_DEMO_RETAILER_APIKEY;
const params = new URLSearchParams(window.location.search);
if (slots[params.get('place')]) setPlace(params.get('place'));
// Switch only the server while retaining the demo product and public embed key.
// Local Next.js uses e.g. ?origin=http://localhost:3030/configurator.
const baseUrl = (params.get('origin') || getConfiguratorBaseUrl()).replace(/\/$/, '');
const defaultUrl = publicKey
  ? `${baseUrl}/${encodeURIComponent(publicKey)}/${devKey ? '1682' : '58'}?initialZoom=0.8&lockVertical=true&hexBgColor=f9f9f9`
  : '';
const initialUrl = params.get('src') || defaultUrl;
if (initialUrl) loadUrl(initialUrl);
else {
  sceneStatus.textContent = 'Enter an iframe URL to begin';
  document.querySelector('.source').open = true;
}

// Dispose local listeners when Vite replaces this fixture; never retain two viewers.
if (import.meta.hot) import.meta.hot.dispose(() => {
  cancelAnimationFrame(placementFrame);
  slotObserver.disconnect();
  sizeObserver.disconnect();
});
