import React, { useEffect } from 'react';
import { injectConfigurator } from 'ov25-ui';
import sofaImage from '../src/images/sofa.png';
import { TestBackButton } from './TestBackButton.jsx';
import { ViewportWrapper } from './ViewportWrapper.jsx';

let configuratorInitialized = false;

function ProductTabs() {
  const [activeTab, setActiveTab] = React.useState('specifications');

  return (
    <div className="ov:w-full ov:mt-8 ov:border ov:border-gray-200 ov:rounded-lg ov:overflow-hidden">
      <div className="ov:flex ov:border-b ov:border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('specifications')}
          className={`ov:px-6 ov:py-3 ov:text-sm ov:font-medium ${activeTab === 'specifications' ? 'ov:border-b-2 ov:border-[#1a1a1a] ov:text-[#1a1a1a]' : 'ov:text-[#525252] ov:hover:text-[#1a1a1a]'}`}
        >
          Specifications
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('product-info')}
          className={`ov:px-6 ov:py-3 ov:text-sm ov:font-medium ${activeTab === 'product-info' ? 'ov:border-b-2 ov:border-[#1a1a1a] ov:text-[#1a1a1a]' : 'ov:text-[#525252] ov:hover:text-[#1a1a1a]'}`}
        >
          Product Info
        </button>
      </div>
      <div className="ov:p-6 ov:bg-gray-50 ov:min-h-[120px]">
        {activeTab === 'specifications' && (
          <dl className="ov:grid ov:grid-cols-2 ov:gap-4 ov:sm:grid-cols-3">
            <div><dt className="ov:text-sm ov:text-[#525252]">Dimensions</dt><dd className="ov:mt-1 ov:text-sm ov:text-[#1a1a1a]">W 220cm × D 95cm × H 85cm</dd></div>
            <div><dt className="ov:text-sm ov:text-[#525252]">Weight</dt><dd className="ov:mt-1 ov:text-sm ov:text-[#1a1a1a]">85 kg</dd></div>
            <div><dt className="ov:text-sm ov:text-[#525252]">Material</dt><dd className="ov:mt-1 ov:text-sm ov:text-[#1a1a1a]">Fabric / Wood</dd></div>
            <div><dt className="ov:text-sm ov:text-[#525252]">Seat depth</dt><dd className="ov:mt-1 ov:text-sm ov:text-[#1a1a1a]">60 cm</dd></div>
            <div><dt className="ov:text-sm ov:text-[#525252]">Assembly</dt><dd className="ov:mt-1 ov:text-sm ov:text-[#1a1a1a]">Required</dd></div>
          </dl>
        )}
        {activeTab === 'product-info' && (
          <div className="ov:text-sm ov:text-[#525252] ov:space-y-2">
            <p>Premium three-seater sofa with removable covers. Features solid wood legs and high-density foam cushions for lasting comfort.</p>
            <p>Available in multiple fabric options. Delivery typically within 2–4 weeks. Free returns within 30 days.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {React.ReactNode} props.description
 * @param {import('ov25-ui').InjectConfiguratorInput} props.injectConfig - Full inject config; callbacks include addToBasket, buyNow, buySwatches, onChange
 * @param {boolean} [props.showPrice]
 * @param {boolean} [props.showProductTabs]
 * @param {React.ReactNode} [props.topContent]
 * @param {React.ReactNode} [props.asideSlot]
 * @param {boolean} [props.renderControls]
 * @param {boolean} [props.renderSwatches]
 * @param {boolean} [props.dynamicConfig] - When true, re-initializes when injectConfig changes
 */
export function TestPageLayout({
  title,
  description,
  injectConfig,
  showPrice = true,
  showProductTabs = false,
  topContent,
  asideSlot,
  renderControls = true,
  renderSwatches = true,
  dynamicConfig = false,
}) {
  useEffect(() => {
    if (!dynamicConfig && configuratorInitialized) return;
    if (dynamicConfig) configuratorInitialized = false;
    const forceMobile = typeof window !== 'undefined' && window.location.search.includes('viewport=mobile');
    const config = {
      ...injectConfig,
      flags: {
        ...(injectConfig && 'flags' in injectConfig ? injectConfig.flags : {}),
        ...(forceMobile ? { forceMobile: true } : {}),
      },
    };
    injectConfigurator(config);
    configuratorInitialized = true;
  }, dynamicConfig ? [injectConfig] : []);

  return (
    <ViewportWrapper>
      <div className="app">
        <TestBackButton />
        <h1>{title}</h1>
        <p className="ov:mb-4 ov:text-[#525252]">{description}</p>
        {topContent}
        <div className="ov:flex ov:flex-col ov:md:flex-row">
          <div className="ov:w-full ov:md:w-[55%]">
            <div className="configurator-container ov:w-full">
              <img src={sofaImage} alt="Product" />
            </div>
          </div>
          <div id="ov25-aside-menu" className="ov:w-full ov:md:w-[35%] ov:h-full ov:md:h-[600px] ov:md:mt-0 ov:md:ml-4">
            <div id="price-name" className="ov:w-full">
              {showPrice && <div id="price">PRICE: £123</div>}
              <div id="name">NAME: Product Name</div>
            </div>
            {asideSlot}
            {renderControls && <div id="ov25-controls" />}
            {renderSwatches && <div id="ov25-swatches" />}
          </div>
        </div>
        {showProductTabs && <ProductTabs />}
      </div>
    </ViewportWrapper>
  );
}
