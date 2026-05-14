import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;
const MAZE_APIKEY = import.meta.env.VITE_MAZE_APIKEY;
const ARLO_APIKEY = import.meta.env.VITE_ARLO_APIKEY;
const query = new URLSearchParams(window.location.search);
const isSnap2Mode = query.get('mode') === 'snap2';

const injectConfig = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  // apiKey: () => MAZE_APIKEY,
  // productLink: () => 'snap2/445',
  // apiKey: () => ARLO_APIKEY,
  // productLink: () => 'snap2/22',
  apiKey: () => (isSnap2Mode ? MAZE_APIKEY : DEMO_RETAILER_APIKEY),
  productLink: () => (isSnap2Mode ? 'snap2/445' : '1313'),
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    ...(isSnap2Mode ? { configureButton: { selector: '#ov25-fullscreen-button', replace: false } } : {}),
    variants: '#ov25-controls',
    swatches: '#ov25-swatches',
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
  },
  configurator: {
    displayMode: isSnap2Mode
      ? { desktop: 'modal', mobile: 'drawer' }
      : { desktop: 'sheet', mobile: 'drawer' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: {
      displayMode: isSnap2Mode
        ? { desktop: 'list', mobile: 'list' }
        : { desktop: 'wizard', mobile: 'list' },
    },
    modules: { position: { desktop: 'RIGHT', mobile: 'RIGHT' } }
  },
  callbacks: {
    addToBasket: () => {},
    buyNow: () => {},
    buySwatches: () => {},
  },
  cssString: `
   #ov25-savings-amount-product-page, #ov25-savings-percentage-product-page {
    display: block;
   }
  `,
  stringReplacements: {
    // product name
    productTitle: [
      {
        template: '▽▽▽: ${RANGE_NAME} / ▽▽▽▽▽: ${PRODUCT_NAME}',
      },
    ],
    productName: [{ template: '▽Product: ${PRODUCT_NAME}▽' }],
    configureButtonText: [{ template: '▽Open Configurator▽' }],
    variantName: [{ template: ' ▽Variant: ${VARIANT_NAME}▽'}],
    // price
    priceValue: [{ template: 'Price ▽▽▽▽▽ ${PRICE}' }],
    priceSubtotal: [{ template: 'Subtotal ▽▽▽▽▽ ${SUBTOTAL}' }],
    priceSavingsAmount: [{ template: 'Saving amount ▽▽▽▽▽ ${DISCOUNT_AMOUNT}' }],
    priceSavingsPercentage: [{ template: 'Saving % ▽▽▽▽▽ ${DISCOUNT_PERCENTAGE}%' }],
    // checkout buttons
    checkoutAddToBasket: [{ template: '▽Add item▽' }],
    checkoutBuyNow: [
      {
        template: "${DISCOUNT_AMOUNT}${SUBTOTAL}",
      }
    ],
    // options
    optionHeader: [
      { trigger: { name: 'OPTION_NAME', value: 'upholstery fabrics' }, template: '▽upholstery fabrics▽' },
      { trigger: { name: 'OPTION_NAME', value: 'trims' }, template: '▽trims▽' },
      { template: '${OPTION_NAME}▽▽▽' },
    ],
    // groups
    groupHeader: [{ template: '▽Option: ${OPTION_NAME} / Group: ${GROUP_NAME}▽' }],
    // filters
    filtersLabel: [{ template: '▽Open filters for ${OPTION_NAME}▽' }],
    filtersSearchPlaceholder: [{ template: '▽Search options▽' }],
    filtersSelectedPill: [{ template: '▽Filter: ${FILTER_VALUE}▽' }],
    filtersNoFiltersAvailable: [{ template: '▽No filters are available▽' }],
    filtersOptionHeader: [{ template: '▽Option: ${OPTION_NAME}▽' }],
    filtersGroupHeader: [{ template: '▽${FILTER_GROUP}▽' }],
    filtersOptionValue: [{ template: '▽${FILTER_VALUE}▽' }],
    // swatch button & book
    swatchBookTitle: [{ template: '▽Sample Book▽' }],
    swatchBookEmptyTitle: [{ template: '▽No samples selected▽' }],
    swatchBookEmptyDescription: [{ template: '▽Use ${CONFIGURATOR_LINK_TEXT} to browse fabrics and add samples▽' }],
    swatchBookConfiguratorLinkText: [{ template: '▽Configurator▽' }],
    swatchBookTotalCost: [{ template: '▽Sample cost: ${FORMATTED_TOTAL_COST}▽' }],
    swatchBookOrderSamples: [{ template: '▽Order samples now▽' }],
    swatchBookZoomedSwatchName: [{ template: '▽${SWATCH_NAME}▽' }],
    swatchBookZoomedSwatchOption: [{ template: '▽Option: ${SWATCH_OPTION}▽' }],
    swatchBookZoomedSwatchSku: [{ template: '▽SKU: ${SWATCH_SKU}▽' }],
    swatchBookFirstFreeCount: [{ template: '▽First ${FREE_SWATCH_LIMIT} at no charge▽' }],
    swatchBookOrderUpToFreeSwatches: [{ template: '▽+ Up to ${FREE_SWATCH_LIMIT} free samples▽' }],
    swatchBookOrderMaxFreeSwatches: [{ template: '▽+ Choose ${MAX_SWATCHES} free samples▽' }],
    swatchBookOrderUpToMaxSwatches: [{ template: '▽+ Up to ${MAX_SWATCHES} samples total▽' }],
    // controls
    controlsShareLabel: [{ template: '▽Share▽' }],
    controlsDimensionsLabel: [{ template: '▽Dimensions▽' }],
    cameraName: [{ template: '▽Camera ${CAMERA_INDEX}: ${CAMERA_NAME}▽' }],
    controlsCameraLabel: [{ template: '▽Cameras▽' }],
    controlsLightsLabel: [{ template: '▽Lighting▽' }],
    controlsArLabel: [{ template: '▽View in room▽' }],
    controlsCameraFallback: [{ template: '▽Camera ${CAMERA_INDEX}▽' }],
    controlsLightFallback: [{ template: '▽Group ${GROUP_INDEX}▽' }],
    // wizard
    wizardBackButtonLabel: [{ template: '▽Back▽' }],
    wizardNextButtonLabel: [{ template: '▽Next▽' }],
    wizardStepProgress: [{ template: '▽Step ${CURRENT_STEP} / ${TOTAL_STEPS}▽' }],
    wizardCurrentStep: [{ template: '▽${STEP_LABEL}▽' }],
    wizardPreviousStep: [{ template: '▽← ${STEP_LABEL}▽' }],
    wizardNextStep: [{ template: '▽${STEP_LABEL} →▽' }],
    wizardReview: [{ template: '▽Review cart▽' }],
    wizardOverview: [{ template: '▽Summary▽' }],
    wizardReviewStepOption: [{ template: '▽${OPTION_NAME}▽' }],
    wizardReviewStepSelection: [{ template: '▽${SELECTION_LABEL}▽' }],
    // AR preview
    arPreviewTitle: [{ template: '▽View in room▽' }],
    arPreviewDescription: [{ template: '▽Scan this QR code to preview in your room▽' }],
    // Snap2
    // initialise menu
    initialiseMenuLoadingProducts: [{ template: '▽Loading compatible products...▽' }],
    initialiseMenuNoModules: [{ template: '▽Select an attachment point or model▽' }],
    initialiseMenuIntro: [{ template: '▽Choose a product to begin▽' }],
    noResultsModules: [{ template: 'Select an object to replace or attach.' }],
    noResultsDefault: [{ template: 'No options found' }],
    // checkout
    snap2CheckoutTotalItemsTitle: [{ template: '▽Cart items▽' }],
    snap2CheckoutEmpty: [{ template: '▽Line items appear here when pricing data is received.▽' }],
    snap2CheckoutLineName: [{ template: '▽Line name: ${LINE_NAME}▽' }],
    snap2CheckoutSubtotal: [{ template: '▽Subtotal: ${FORMATTED_SUBTOTAL}▽' }],
    snap2CheckoutQuantity: [{ template: '▽Qty: ${QUANTITY}▽' }],
    snap2CheckoutDiscountPercentage: [{ template: '▽(-${DISCOUNT_PERCENTAGE}%)▽' }],
    snap2CheckoutSelectionName: [{ template: '▽Selection: ${SELECTION_NAME}▽' }],
    snap2CheckoutLineTotal: [{ template: '▽Line total: ${FORMATTED_PRICE}▽' }],
    snap2CheckoutFooterTotalLabel: [{ template: '▽Estimated total▽' }],
    snap2Total: [{ template: '▽${FORMATTED_PRICE} (${DISCOUNT_PERCENTAGE}% off, save ${FORMATTED_DISCOUNT_AMOUNT})▽' }],
    snap2CheckoutBackToBuilder: [{ template: '▽Back to configurator▽' }],
    snap2CheckoutViewCart: [{ template: '▽Open Cart▽' }],
    // controls
    snap2ControlsToggleFloorTitle: [{ template: '▽Toggle floor▽' }],
    snap2ControlsViewLabel: [{ template: '▽Camera view selector▽' }],
    snap2ControlsCaptureTitle: [{ template: '▽Capture views▽' }],
    snap2SaveButtonTitle: [{ template: '▽Save or share this setup▽' }],
    // save dialog
    snap2SaveFailedMessage: [{ template: '▽Unable to save configuration▽' }],
    snap2SaveDialogTitleSave: [{ template: '▽Save this setup?▽' }],
    snap2SaveDialogTitleShare: [{ template: '▽Share setup▽' }],
    snap2SaveDialogConfirmClose: [{ template: '▽Save progress before closing?▽' }],
    snap2SaveDialogConfirmShare: [{ template: '▽Save this configuration now?▽' }],
    snap2SaveDialogNo: [{ template: '▽Discard▽' }],
    snap2SaveDialogYes: [{ template: '▽Save now▽' }],
    snap2SaveDialogSaving: [{ template: '▽Saving setup...▽' }],
    snap2SaveDialogBodyClose: [{ template: '▽Keep this link to reopen your setup later:▽' }],
    snap2SaveDialogBodyShare: [{ template: '▽Copy this link to share your setup:▽' }],
    snap2SaveDialogCopyLink: [{ template: '▽Copy URL▽' }],
    snap2SaveDialogCopySuccess: [{ template: '▽URL copied!▽' }],
    snap2SaveDialogCopyFailure: [{ template: '▽Copy failed. Please copy manually.▽' }],
    // share dialog
    shareLinkCopied: [{ template: '▽Share URL copied!▽' }],
    shareTitle: [{ template: '▽Check out my ${PRODUCT_NAME} setup▽' }],
    shareText: [{ template: '▽I designed this ${PRODUCT_NAME}. Have a look!▽' }],
    // screenshots dialog
    snap2ScreenshotsTitle: [{ template: '▽Screenshots▽' }],
    snap2ScreenshotsCount: [{ template: '▽${SCREENSHOT_COUNT} view${SCREENSHOT_SUFFIX}▽' }],
    snap2ScreenshotsDownloadAll: [{ template: '▽Download all images▽' }],
    snap2ScreenshotsDownloading: [{ template: '▽Downloading images...▽' }],
    snap2ScreenshotsDownloadOne: [{ template: '▽Download image▽' }],
    // snap2 module card
    moduleCardSeeMore: [{ template: '▽Read more...▽' }],
    moduleCardAddProduct: [{ template: '▽Add module▽' }],
    moduleCardNoImage: [{ template: '▽No image▽' }],
    moduleCardDescriptionShort: [{ template: '▽${PRODUCT_NAME} — ${DESCRIPTION}▽' }],
    moduleDetailDescriptionShort: [{ template: '▽Short: ${DESCRIPTION}▽' }],
    moduleDetailDescriptionLong: [{ template: '▽Long: ${DESCRIPTION}▽' }],
    moduleDetailDimensions: [{ template: '▽${PRODUCT_NAME}: ${DIMENSIONS_LINE}▽' }],
    snap2ModulesEmptyState: [{ template: '▽Tap a module to replace, or tap + to add one.▽' }],
    snap2ModulesLoading: [{ template: '▽Loading modules...▽' }],
    snap2ModulesGroupHeader: [{ template: '▽${GROUP_NAME}▽' }],
    modulePositionTypeTabLabel: [
      { trigger: {name: 'TAB_LABEL', value: 'All'}, template: '▽(all) ${TAB_LABEL}▽', },
      { trigger: {name: 'TAB_LABEL', value: 'Middle'}, template: '▽(middle) ${TAB_LABEL}▽', },
      { trigger: {name: 'TAB_LABEL', value: 'Corner'}, template: '▽(corner) ${TAB_LABEL}▽', },
      { trigger: {name: 'TAB_LABEL', value: 'End'}, template: '▽(end) ${TAB_LABEL}▽', }
    ],
    // custom dimensions dialog
    snap2CustomDimensionsTitle: [{ template: '▽Custom dimensions (cm)▽' }],
    snap2CustomDimensionsRange: [{ template: '▽From ${MIN} to ${MAX} in steps of ${STEP}▽' }],
    snap2CustomDimensionsCancel: [{ template: '▽Cancel▽' }],
    snap2CustomDimensionsAdd: [{ template: '▽Add module▽' }],
    snap2CustomDimensionsLabel: [{ template: '▽${DIMENSION_LABEL} (${AXIS})▽' }],
  },
});

function App() {
  const modeParams = new URLSearchParams(window.location.search);
  modeParams.set('mode', 'standard');
  const standardHref = `?${modeParams.toString()}`;
  modeParams.set('mode', 'snap2');
  const snap2Href = `?${modeParams.toString()}`;

  return (
    <TestPageLayout
      title="String replacement"
      description={`Tests stringReplacements across name, price, CTA, filters, swatchbook, save/share, and Snap2 UI strings. Current mode: ${isSnap2Mode ? 'snap2' : 'standard'}.`}
      injectConfig={injectConfig}
      dynamicConfig
      topContent={
        <div className="ov:mb-3 ov:flex ov:items-center ov:gap-2 ov:text-sm">
          <a href={standardHref} className="ov:rounded ov:bg-gray-200 ov:px-2 ov:py-1 ov:no-underline">
            Standard mode
          </a>
          <a href={snap2Href} className="ov:rounded ov:bg-gray-200 ov:px-2 ov:py-1 ov:no-underline">
            Snap2 mode
          </a>
        </div>
      }
      asideSlot={
        isSnap2Mode ? (
          <button
            id="ov25-fullscreen-button"
            className="ov:cursor-pointer ov:bg-transparent ov:text-white ov:p-2 ov:rounded-md ov:mb-2"
          >
            Configure Your Sofa
          </button>
        ) : undefined
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
