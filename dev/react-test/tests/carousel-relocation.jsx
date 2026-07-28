import React, { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { injectConfigurator } from 'ov25-ui';
import sofaImage from '../src/images/sofa.png';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;
const images = [
  sofaImage,
  ...Array.from({ length: 5 }, (_, index) =>
    `https://picsum.photos/800/800?random=${720 + index}`
  ),
];

let configuratorInitialized = false;

function App() {
  const config = useMemo(
    () => /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
      apiKey: () => DEMO_RETAILER_APIKEY,
      productLink: () => '58',
      images,
      selectors: {
        gallery: { selector: '#carousel-relocation-gallery', replace: true },
        variants: '#carousel-relocation-controls',
        price: { selector: '#carousel-relocation-price', replace: true },
        name: { selector: '#carousel-relocation-name', replace: true },
        desktopCarousel: '[data-carousel-relocation-target="desktop"]',
        mobileCarousel: '[data-carousel-relocation-target="mobile"]',
      },
      carousel: {
        desktop: 'carousel',
        mobile: 'carousel',
        maxImages: 6,
      },
      configurator: {
        displayMode: { desktop: 'sheet', mobile: 'drawer' },
        triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
        variants: { displayMode: { desktop: 'list', mobile: 'list' } },
      },
      branding: {
        cssString: ':host { --ov25-carousel-relocation-fixture: active; }',
      },
      callbacks: {
        addToBasket: () => {},
        buyNow: () => {},
        buySwatches: () => {},
      },
    }),
    [],
  );

  useEffect(() => {
    if (configuratorInitialized) return;
    injectConfigurator(config);
    configuratorInitialized = true;
  }, [config]);

  return (
    <main
      className="ov:max-w-[1180px] ov:mx-auto ov:px-5 ov:py-8"
      data-carousel-relocation-fixture
    >
      <h1 className="ov:text-2xl ov:font-semibold ov:mb-2">Carousel relocation</h1>
      <p className="ov:mb-5 ov:text-[#525252]">
        Ordinary sheet and drawer modes with viewport-specific client-owned carousel destinations.
      </p>
      <div className="ov:grid ov:grid-cols-1 ov:md:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)] ov:gap-8">
        <section data-carousel-source-column>
          <h2 className="ov:text-sm ov:font-semibold ov:mb-2">Gallery source</h2>
          <div id="carousel-relocation-gallery" className="configurator-container ov:w-full">
            <img src={sofaImage} alt="Sofa" />
          </div>
        </section>
        <section data-carousel-product-column>
          <h2 id="carousel-relocation-name" className="ov:text-xl ov:font-semibold">
            Hepburn sofa
          </h2>
          <div id="carousel-relocation-price" className="ov:mb-4">GBP 2,195</div>
          <div className="ov:border ov:border-dashed ov:border-[#8a8a8a] ov:min-h-20 ov:mb-4" data-carousel-target-slot>
            <div data-carousel-relocation-target="desktop" />
            <div data-carousel-relocation-target="mobile" />
          </div>
          <div id="carousel-relocation-controls" />
        </section>
      </div>
      <style>{`
        [data-carousel-relocation-target] { min-height: 80px; }
        [data-carousel-relocation-target="mobile"] { display: none; }
        @media (max-width: 767px) {
          [data-carousel-relocation-target="desktop"] { display: none; }
          [data-carousel-relocation-target="mobile"] { display: block; }
        }
      `}</style>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>,
);

export default App;
