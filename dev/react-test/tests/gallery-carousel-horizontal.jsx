import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import { ImageCountControl } from '../templates/ImageCountControl.jsx';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;

const BASE_CONFIG = {
  apiKey: () => DEMO_RETAILER_APIKEY,
  productLink: () => '1313',
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    variants: '#ov25-controls',
    swatches: '#ov25-swatches',
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
  },
  carousel: { desktop: 'carousel', mobile: 'carousel', maxImages: { desktop: 12, mobile: 6 } },
  configurator: {
    displayMode: { desktop: 'sheet', mobile: 'drawer' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: { displayMode: { desktop: 'tabs', mobile: 'list' } },
  },
  callbacks: { addToBasket: () => alert('Add to basket'), buyNow: () => alert('Buy now'), buySwatches: () => alert('Add swatches to cart') },
  flags: { hidePricing: false },
};

function App() {
  const [imageCount, setImageCount] = useState(5);
  const config = useMemo(() => /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
    ...BASE_CONFIG,
    images: Array.from({ length: imageCount }, (_, i) => `https://picsum.photos/600/600?random=${i + 1}`),
  }), [imageCount]);
  return (
    <TestPageLayout
      title="Gallery - Carousel Horizontal"
      description="Carousel thumbnails horizontal on desktop and mobile."
      injectConfig={config}
      showProductTabs
      topContent={<ImageCountControl count={imageCount} onChange={setImageCount} />}
      dynamicConfig
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
export default App;
