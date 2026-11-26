import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
// Deliberately run current source: profiling must not silently use a stale dist build.
import { injectConfigurator } from '../../../src/index.ts';
import { getSharedStylesheet } from '../../../src/utils/shadow-styles.ts';
import builtShadowCss from '../../../dist/index.css?raw';
import './performance-darlings-savor.css';

// Source imports bypass the library's CSS build/postprocessing. Use its built,
// shadow-scoped stylesheet so profiling measures real card and gallery layout.
getSharedStylesheet().replaceSync(builtShadowCss);

const apiKey = import.meta.env.VITE_DARLINGS_APIKEY;
const PRODUCT_ID = '7449';
let initialized = false;

function App() {
  const [hidden, setHidden] = useState(false);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState('Ready for manual scrolling.');
  useEffect(() => {
    let previous = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 100 && y > previous);
      previous = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const readiness = setInterval(() => {
      const root = document.querySelector('#performance-controls')?.shadowRoot;
      if (root?.querySelector('.ov25-default-variant-card')) {
        setReady(true);
        clearInterval(readiness);
      }
    }, 1000);
    if (apiKey && !initialized) {
      initialized = true;
      injectConfigurator({
        apiKey: () => apiKey,
        productLink: () => PRODUCT_ID,
        selectors: {
          gallery: { selector: '#performance-gallery', replace: true },
          variants: '#performance-controls',
          name: { selector: '#performance-name', replace: true },
          price: { selector: '#performance-price', replace: true },
          header: '#performance-header',
        },
        carousel: { desktop: 'carousel', mobile: 'carousel', autoCutouts: true, maxImages: { desktop: 10, mobile: 10 } },
        configurator: {
          displayMode: { desktop: 'inline-sticky', mobile: 'inline-sticky' },
          variants: { displayMode: { desktop: 'list', mobile: 'list' } },
        },
        callbacks: { addToBasket: () => {}, buyNow: () => {}, buySwatches: () => {} },
        flags: { hidePricing: false },
      });
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearInterval(readiness);
    };
  }, []);

  async function runScroll() {
    const button = document.querySelector('#run-scroll');
    button.disabled = true;
    setResult('Scrolling for 12 seconds…');
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 700));
    const gaps = [];
    let previous = performance.now();
    const start = previous;
    const end = document.querySelector('#performance-product').getBoundingClientRect().bottom + window.scrollY;
    await new Promise(resolve => {
      const tick = now => {
        gaps.push(now - previous); previous = now;
        const t = Math.min(1, (now - start) / 12000);
        window.scrollTo(0, end * (1 - Math.cos(t * Math.PI * 4)) / 2);
        if (t < 1) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
    const sorted = [...gaps].sort((a, b) => a - b);
    const summary = { frames: gaps.length, p95Ms: sorted[Math.floor(sorted.length * .95)], maxMs: Math.max(...gaps), over50ms: gaps.filter(n => n > 50).length };
    window.__performanceScrollResult = summary;
    setResult(`${summary.frames} frames · p95 ${summary.p95Ms.toFixed(1)} ms · max ${summary.maxMs.toFixed(1)} ms · ${summary.over50ms} gaps over 50 ms`);
    button.disabled = false;
  }
  return <>
    <header id="performance-header" data-hidden={hidden}><strong>Darlings of Chelsea</strong><span>Performance fixture</span></header>
    <section className="performance-tools">
      <h1>Darlings fabrics × Savor layout</h1>
      <p>Real product {PRODUCT_ID}, real WebGL viewer and full list of fabrics. Savor’s stretched two-row mobile product grid, with a collapsing header. Uses current local UI source; catalogue and viewer load from OV25.</p>
      {!apiKey && <p role="alert">Set VITE_DARLINGS_APIKEY in ov25-ui/.env.local, then restart Vite.</p>}
      <button id="run-scroll" onClick={runScroll} disabled={!ready}>Run scroll measurement</button>
      <output aria-live="polite">{result}</output>
      <p>For rotation testing, tap a 360° thumbnail and immediately scroll. Scripted scrolling is not a substitute for a physical iPhone touch test. Cart buttons have no purchase action.</p>
    </section>
    <section id="performance-product" className="product-information__grid">
      <div className="product-information__media"><div id="performance-gallery" /></div>
      <div className="product-information__details">
        <h2 id="performance-name">Loading product…</h2><div id="performance-price" />
        <div id="performance-controls" />
      </div>
    </section>
    <footer>End of product — scroll across this boundary to check the gallery releases smoothly.</footer>
  </>;
}
createRoot(document.getElementById('root')).render(<App />);
