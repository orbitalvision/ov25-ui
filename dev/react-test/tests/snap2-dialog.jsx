import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import { readSnap2LayoutQuery, Snap2PositionControls } from '../templates/Snap2PositionControls.jsx';
import '../src/index.css';

const LAYOUT_DEFAULTS = {
  variantsDesktop: 'RIGHT',
  variantsMobile: 'RIGHT',
  modulesDesktop: 'BOTTOM',
  modulesMobile: 'BOTTOM',
};

function App() {
  const layout = React.useMemo(() => readSnap2LayoutQuery(LAYOUT_DEFAULTS), []);

  const injectConfig = React.useMemo(
    () =>
      /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
        apiKey: () => '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d',
        productLink: () => 'snap2/4',
        selectors: {
          gallery: { selector: '.configurator-container', replace: true },
          configureButton: { selector: '#ov25-fullscreen-button', replace: false },
          variants: '#ov25-controls',
          swatches: '#ov25-swatches',
          price: { selector: '#price', replace: true },
          name: { selector: '#name', replace: true },
        },
        carousel: { desktop: 'stacked', mobile: 'carousel' },
        configurator: {
          displayMode: { desktop: 'modal', mobile: 'drawer' },
          triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
          variants: {
            displayMode: { desktop: 'tabs', mobile: 'list' },
            position: { desktop: layout.variantsDesktop, mobile: layout.variantsMobile },
          },
          modules: { position: { desktop: layout.modulesDesktop, mobile: layout.modulesMobile } },
        },
        callbacks: {
          addToBasket: (payload) => {
            alert('buyNow' + payload);
            console.log('payload', payload);
          },
          buyNow: (payload) => {
            alert('buyNow' + payload);
            console.log('payload', payload);
          },
          buySwatches: () => alert('buySwatches'),
        },
        flags: { hidePricing: false },
      }),
    [layout],
  );

  return (
    <TestPageLayout
      title="Snap2 dialog"
      description="Snap2 with sheet / drawer; InitialiseMenu uses default in-gallery placement (no selectors.initialiseMenu)."
      injectConfig={injectConfig}
      topContent={<Snap2PositionControls defaults={LAYOUT_DEFAULTS} className="ov:mb-4" />}
      asideSlot={
        <button
          id="ov25-fullscreen-button"
          className="ov:cursor-pointer ov:bg-transparent ov:text-white ov:p-2 ov:rounded-md ov:mb-2"
        >
          Configure Your Sofa
        </button>
      }
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
