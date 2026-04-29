import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const testPages = [
  'configure-button-only',
  'configure-button-modal',
  'single-product-gallery',
  'split-variant-triggers',
  'single-no-variants',
  'single-no-pricing',
  'single-no-groups',
  'single-with-discounts',
  'single-with-groups',
  'single-inline-variants',
  'hidden-logo',
  'inline-variants-disable-add-to-cart',
  'single-custom-button',
  'single-custom-css',
  'single-custom-css-snap2',
  'single-defer-threed-no-gallery',
  'range-no-groups',
  'range-with-groups',
  'range-inline-variants-groups',
  'snap2-dialog',
  'snap2-inline',
  'snap2-uuid',
  'snap2-in-gallery',
  'snap2-custom-initialise-config',
  'bed-configurator',
  'product-with-swatches',
  'multiple-configurators',
  'multiple-standard-configurators',
  'multiple-standard-configurators-with-variants',
  'multiple-standard-configurators-inline-variants',
  'gallery-sheet-tabs',
  'gallery-sheet-accordion',
  'gallery-sheet-tree',
  'gallery-sheet-list',
  'gallery-sheet-wizard',
  'gallery-sheet-tabs-hide-fabrics',
  'gallery-sheet-accordion-hide-fabrics',
  'gallery-sheet-tree-hide-fabrics',
  'gallery-sheet-list-hide-fabrics',
  'gallery-sheet-wizard-hide-fabrics',
  'variants-only-sheet-hide-fabrics',
  'gallery-inline-tabs',
  'gallery-inline-accordion',
  'gallery-inline-tree',
  'gallery-inline-list',
  'gallery-inline-wizard',
  'gallery-carousel-horizontal',
  'gallery-carousel-stacked',
  'gallery-no-carousel',
  'configurator-setup',
];

const testInputs = Object.fromEntries(
  testPages.map((name) => [name, path.resolve(__dirname, `tests/${name}.html`)])
);

/** Same path as OV25 `app/.../configurator-preview` — iframe target for ConfiguratorSetup local preview. */
function rewriteConfiguratorPreviewUrl(req) {
  const raw = req.url || '';
  const [pathname, search] = raw.split('?');
  if (pathname === '/configurator-preview' || pathname === '/configurator-preview/') {
    req.url = '/configurator-preview.html' + (search ? `?${search}` : '');
  }
}

/** ov25-ui resolves to ../../dist (outside this package); default watcher misses it. Full reload when built artifacts change.
 * Do not reload on setup/src alone: watch-library-build rebuilds setup/dist asynchronously; reloading on src races stale dist. */
function watchLinkedPackagesReload() {
  const distJs = path.resolve(__dirname, '../../dist/index.js');
  const distCss = path.resolve(__dirname, '../../dist/index.css');
  const setupDistJs = path.resolve(__dirname, '../../setup/dist/index.js');
  const setupDistCss = path.resolve(__dirname, '../../setup/dist/index.css');
  const log = (msg) => console.log(`[ov25-test vite] ${msg}`);
  return {
    name: 'watch-linked-ov25-packages',
    configureServer(server) {
      log('subscribing to ov25-ui dist + ov25-setup dist for full-reload');
      log(`  ov25-ui JS:   ${distJs}`);
      log(`  ov25-ui CSS:  ${distCss}`);
      log(`  ov25-setup JS:  ${setupDistJs}`);
      log(`  ov25-setup CSS: ${setupDistCss}`);
      server.watcher.add(distJs);
      server.watcher.add(distCss);
      server.watcher.add(setupDistJs);
      server.watcher.add(setupDistCss);
      const reloadTargets = new Set(
        [distJs, distCss, setupDistJs, setupDistCss].map((f) => path.resolve(f).replace(/\\/g, '/'))
      );
      const shouldReload = (p) => {
        const n = path.resolve(p).replace(/\\/g, '/');
        return reloadTargets.has(n);
      };
      const onFsEvent = (kind, p) => {
        if (!shouldReload(p)) return;
        log(`${kind} → sending full-reload to browser: ${p}`);
        server.ws.send({ type: 'full-reload', path: '*' });
      };
      server.watcher.on('change', (p) => onFsEvent('change', p));
      server.watcher.on('add', (p) => onFsEvent('add', p));
    },
  };
}

function configuratorPreviewRoutePlugin() {
  return {
    name: 'configurator-preview-route',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewriteConfiguratorPreviewUrl(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewriteConfiguratorPreviewUrl(req);
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), configuratorPreviewRoutePlugin(), watchLinkedPackagesReload()],
  resolve: {
    alias: {
      'ov25-ui': path.resolve(__dirname, '../../dist'),
      'ov25-setup': path.resolve(__dirname, '../../setup'),
    },
  },
  optimizeDeps: {
    exclude: ['ov25-ui', 'ov25-setup'],
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        'mobile-preview': path.resolve(__dirname, 'mobile-preview.html'),
        'configurator-preview': path.resolve(__dirname, 'configurator-preview.html'),
        ...testInputs,
      },
    },
  },
  server: {
    port: 3008,
  },
});
