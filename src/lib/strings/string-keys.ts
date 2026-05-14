import type { StringReplacements } from '../../types/string-replacements.js';

/**
 * Setup-facing catalog of replaceable string keys.
 */
export const STRING_REPLACEMENT_DEFINITIONS: StringReplacements = [
  {
    key: 'productTitle',
    label: 'Product name (can include range name)',
    description:
      'Name of the product/range being displayed.',
    defaultTemplate: '${RANGE_NAME}-${PRODUCT_NAME}',
    interpolationValues: [
      {
        name: 'RANGE_NAME',
        description: 'Current range name.',
      },
      {
        name: 'PRODUCT_NAME',
        description: 'Current product name.',
      },
    ],
  },
  {
    key: 'productName',
    label: 'Product name',
    description: 'Plain product name.',
    defaultTemplate: '${PRODUCT_NAME}',
    interpolationValues: [
      {
        name: 'PRODUCT_NAME',
        description: 'Current product name.',
      },
    ],
  },
  { key: 'configureButtonText', label: 'Configure button text', defaultTemplate: 'Configure', interpolationValues: [] },
  {
    key: 'variantName',
    label: 'Variant name',
    defaultTemplate: '${VARIANT_NAME}',
    interpolationValues: [
      { name: 'VARIANT_NAME', description: 'Variant display name.' },
    ],
  },
  { key: 'optionHeader', label: 'Option header', defaultTemplate: '${OPTION_NAME}', interpolationValues: [{ name: 'OPTION_NAME', description: 'Option display name.' }] },
  {
    key: 'groupHeader',
    label: 'Group header',
    defaultTemplate: '${GROUP_NAME}',
    interpolationValues: [
      { name: 'OPTION_NAME', description: 'Option display name.' },
      { name: 'GROUP_NAME', description: 'Group display name.' },
    ],
  },
  // prices
  { key: 'priceValue',label: 'Price value', defaultTemplate: '${PRICE}',interpolationValues: [
      { name: 'PRICE', description: 'Current formatted price.' },
      { name: 'SUBTOTAL', description: 'Current formatted subtotal.' },
      { name: 'DISCOUNT_AMOUNT', description: 'Formatted discount amount.' },
      { name: 'DISCOUNT_PERCENTAGE', description: 'Discount percentage.' },
    ] 
  },
  {
    key: 'priceSubtotal', label: 'Price subtotal', defaultTemplate: '${SUBTOTAL}', interpolationValues: [
      { name: 'SUBTOTAL', description: 'Current formatted subtotal.' },
      { name: 'PRICE', description: 'Current formatted price.' },
      { name: 'DISCOUNT_AMOUNT', description: 'Formatted discount amount.' },
      { name: 'DISCOUNT_PERCENTAGE', description: 'Discount percentage.' },
    ] },
  { key: 'priceSavingsAmount', label: 'Price savings amount', defaultTemplate: '${DISCOUNT_AMOUNT}', interpolationValues: [
    { name: 'DISCOUNT_AMOUNT', description: 'Formatted discount amount.' },
    { name: 'PRICE', description: 'Current formatted price.' },
    { name: 'SUBTOTAL', description: 'Current formatted subtotal.' },
    { name: 'DISCOUNT_PERCENTAGE', description: 'Discount percentage.' },
  ] },
  { key: 'priceSavingsPercentage', label: 'Price savings percentage', defaultTemplate: '${DISCOUNT_PERCENTAGE}%', interpolationValues: [
    { name: 'DISCOUNT_PERCENTAGE', description: 'Discount percentage.' },
    { name: 'PRICE', description: 'Current formatted price.' },
    { name: 'SUBTOTAL', description: 'Current formatted subtotal.' },
    { name: 'DISCOUNT_AMOUNT', description: 'Formatted discount amount.' },
  ] },
  // checkout buttons
  { key: 'checkoutAddToBasket', label: 'Checkout add to basket text', defaultTemplate: 'Add to basket', interpolationValues: [
    { name: 'PRICE', description: 'Current formatted price.' },
    { name: 'SUBTOTAL', description: 'Current formatted subtotal.' },
    { name: 'DISCOUNT_AMOUNT', description: 'Formatted discount amount.' },
    { name: 'DISCOUNT_PERCENTAGE', description: 'Discount percentage.' },
  ] },
  { key: 'checkoutBuyNow', label: 'Checkout buy now text', defaultTemplate: 'Buy now', interpolationValues: [
    { name: 'PRICE', description: 'Current formatted price.' },
    { name: 'SUBTOTAL', description: 'Current formatted subtotal.' },
    { name: 'DISCOUNT_AMOUNT', description: 'Formatted discount amount.' },
    { name: 'DISCOUNT_PERCENTAGE', description: 'Discount percentage.' },
  ] },
  // filters
  { key: 'filtersLabel', label: 'Filters button label', defaultTemplate: 'Filters', interpolationValues: [] },
  { key: 'filtersSearchPlaceholder', label: 'Filters search placeholder', defaultTemplate: 'Search', interpolationValues: [] },
  { key: 'filtersSelectedPill', label: 'Selected filter pill', defaultTemplate: '${FILTER_VALUE}', interpolationValues: [{ name: 'FILTER_VALUE', description: 'Selected filter value.' }] },
  { key: 'filtersNoFiltersAvailable', label: 'No filters available', defaultTemplate: 'No filters available', interpolationValues: [] },
  { key: 'filtersOptionHeader', label: 'Filter option header', defaultTemplate: '${OPTION_NAME}', interpolationValues: [{ name: 'OPTION_NAME', description: 'Option name.' }] },
  { key: 'filtersGroupHeader', label: 'Filter group header', defaultTemplate: '${FILTER_GROUP}', interpolationValues: [{ name: 'FILTER_GROUP', description: 'Filter group name.' }] },
  { key: 'filtersOptionValue', label: 'Filter option value', defaultTemplate: '${FILTER_VALUE}', interpolationValues: [{ name: 'FILTER_VALUE', description: 'Filter option value.' }] },
  // swatch button & book
  { key: 'swatchBookTitle', label: 'Swatch book title', defaultTemplate: 'Swatch Book', interpolationValues: [] },
  { key: 'swatchBookEmptyTitle', label: 'Swatch book empty title', defaultTemplate: 'No swatches selected', interpolationValues: [] },
  { key: 'swatchBookEmptyDescription', label: 'Swatch book empty description', defaultTemplate: 'Use the ${CONFIGURATOR_LINK_TEXT} to view fabrics and select swatch samples', interpolationValues: [{ name: 'CONFIGURATOR_LINK_TEXT', description: 'Clickable link label inside empty-state text.' }] },
  { key: 'swatchBookConfiguratorLinkText', label: 'Swatch book configurator link text', defaultTemplate: '3D Configurator', interpolationValues: [] },
  { key: 'swatchBookTotalCost', label: 'Swatch total cost', defaultTemplate: 'Total cost: ${FORMATTED_TOTAL_COST}', interpolationValues: [
    { name: 'FORMATTED_TOTAL_COST', description: 'Formatted total swatch cost including currency symbol.' },
    { name: 'CURRENCY_SYMBOL', description: 'Currency symbol.' },
    { name: 'PRICE_PER_SWATCH', description: 'Price per swatch.' },
    { name: 'SWATCH_COUNT', description: 'Number of swatches.' },
  ] },
  { key: 'swatchBookOrderSamples', label: 'Order samples button', defaultTemplate: 'Order Samples', interpolationValues: [
    { name: 'SWATCH_COUNT', description: 'Number of swatches.' },
    { name: 'CURRENCY_SYMBOL', description: 'Currency symbol.' },
    { name: 'PRICE_PER_SWATCH', description: 'Price per swatch.' },
  ] },
  { key: 'swatchBookZoomedSwatchName', label: 'Swatch book zoomed swatch name', defaultTemplate: '${SWATCH_NAME}', interpolationValues: [{ name: 'SWATCH_NAME', description: 'Selected swatch display name.' }] },
  { key: 'swatchBookZoomedSwatchOption', label: 'Swatch book zoomed option line', defaultTemplate: '- ${SWATCH_OPTION}', interpolationValues: [{ name: 'SWATCH_OPTION', description: 'Swatch option label text.' }] },
  { key: 'swatchBookZoomedSwatchSku', label: 'Swatch book zoomed SKU line', defaultTemplate: '- ${SWATCH_SKU}', interpolationValues: [{ name: 'SWATCH_SKU', description: 'Swatch SKU text.' }] },
  // swatches 
  { key: 'swatchBookFirstFreeCount', label: 'Swatch book first free line', defaultTemplate: 'First ${FREE_SWATCH_LIMIT} are free', interpolationValues: [{ name: 'FREE_SWATCH_LIMIT', description: 'Number of swatch samples included free.' }] },
  { key: 'swatchBookOrderUpToFreeSwatches', label: 'Swatch book order up to free swatches line', defaultTemplate: '+ Order up to ${FREE_SWATCH_LIMIT} Free Swatches', interpolationValues: [{ name: 'FREE_SWATCH_LIMIT', description: 'Maximum number of free swatch samples.' }] },
  { key: 'swatchBookOrderMaxFreeSwatches', label: 'Swatch book order N free swatches when max equals free limit', defaultTemplate: '+ Order ${MAX_SWATCHES} Free Swatches', interpolationValues: [{ name: 'MAX_SWATCHES', description: 'Maximum swatch count (same as the free swatch limit in this state).' }] },
  { key: 'swatchBookOrderUpToMaxSwatches', label: 'Swatch book order up to N swatches', defaultTemplate: '+ Order up to ${MAX_SWATCHES} Swatches', interpolationValues: [{ name: 'MAX_SWATCHES', description: 'Maximum total swatch count including paid selections.' }] },
  // controls
  { key: 'controlsShareLabel', label: 'Controls share label', defaultTemplate: 'Share', interpolationValues: [] },
  { key: 'controlsDimensionsLabel', label: 'Controls dimensions label', defaultTemplate: 'Dimensions', interpolationValues: [] },
  { key: 'cameraName', label: 'Camera name', defaultTemplate: '${CAMERA_NAME}', interpolationValues: [{ name: 'CAMERA_NAME', description: 'Camera display name.' }, { name: 'CAMERA_INDEX', description: '1-based camera index or identifier.' }] },
  { key: 'controlsCameraLabel', label: 'Controls camera label', defaultTemplate: 'Camera', interpolationValues: [] },
  { key: 'controlsLightsLabel', label: 'Controls lights label', defaultTemplate: 'Lights', interpolationValues: [] },
  { key: 'controlsLightFallback', label: 'Light fallback label', defaultTemplate: 'Group ${GROUP_INDEX}', interpolationValues: [{ name: 'GROUP_INDEX', description: '1-based light group index.' }] },
  { key: 'controlsArLabel', label: 'Controls AR label', defaultTemplate: 'View in your room', interpolationValues: [] }, { key: 'controlsCameraFallback', label: 'Camera fallback label', defaultTemplate: 'Camera ${CAMERA_INDEX}', interpolationValues: [{ name: 'CAMERA_INDEX', description: '1-based camera index.' }] }, 
  { key: 'arPreviewTitle', label: 'AR preview title', defaultTemplate: 'View in room', interpolationValues: [] },
  { key: 'arPreviewDescription', label: 'AR preview description', defaultTemplate: 'Scan the QR code on your phones camera to view this item in your room', interpolationValues: [] },

  // wizard 
  { key: 'wizardBackButtonLabel', label: 'Wizard back button label', defaultTemplate: 'Back', interpolationValues: [] },
  { key: 'wizardNextButtonLabel', label: 'Wizard next button label', defaultTemplate: 'Next', interpolationValues: [] },
  {
    key: 'wizardStepProgress',
    label: 'Wizard step progress',
    defaultTemplate: 'Step ${CURRENT_STEP} of ${TOTAL_STEPS}',
    interpolationValues: [
      { name: 'CURRENT_STEP', description: '1-based index of the current step.' },
      { name: 'TOTAL_STEPS', description: 'Total number of steps in the wizard.' },
    ],
  },
  {
    key: 'wizardCurrentStep',
    label: 'Wizard current step title',
    defaultTemplate: '${STEP_LABEL}',
    interpolationValues: [
      { name: 'STEP_LABEL', description: 'Label for this step (option name, or Review/Overview on the last step).' },
    ],
  },
  {
    key: 'wizardPreviousStep',
    label: 'Wizard previous step button',
    defaultTemplate: '${STEP_LABEL}',
    interpolationValues: [
      { name: 'STEP_LABEL', description: 'Label for the previous step (option name, or Review/Overview).' },
    ],
  },
  {
    key: 'wizardNextStep',
    label: 'Wizard next step button',
    defaultTemplate: '${STEP_LABEL}',
    interpolationValues: [
      { name: 'STEP_LABEL', description: 'Label for the next step (option name, or Review/Overview).' },
    ],
  },
  { key: 'wizardReview', label: 'Wizard final step label (with checkout)', defaultTemplate: 'Review', interpolationValues: [] },
  { key: 'wizardOverview', label: 'Wizard final step label (without checkout)', defaultTemplate: 'Overview', interpolationValues: [] },
  { key: 'wizardReviewStepOption', label: 'Wizard review row — option name', defaultTemplate: '${OPTION_NAME}', interpolationValues: [
    { name: 'OPTION_NAME', description: 'Option display name on the review step.' },
    { name: 'GROUP_NAME', description: 'Variant group name when applicable (empty for size-only or modules).' },
    { name: 'SELECTION_LABEL', description: 'Formatted selection summary for that option (or em dash when none).' },
  ]},
  { key: 'wizardReviewStepSelection', label: 'Wizard review row — selected value', defaultTemplate: '${SELECTION_LABEL}', interpolationValues: [
    { name: 'OPTION_NAME', description: 'Option display name on the review step.' },
    { name: 'GROUP_NAME', description: 'Variant group name when applicable (empty for size-only or modules).' },
    { name: 'SELECTION_LABEL', description: 'Formatted selection summary for that option (or em dash when none).' },
  ]},
  // Snap2
  // initialise menu
  { key: 'initialiseMenuLoadingProducts', label: 'Initialise menu loading', defaultTemplate: 'Loading products...', interpolationValues: [] },
  { key: 'initialiseMenuNoModules', label: 'Initialise menu no modules', defaultTemplate: 'Select an attachment point or model to replace', interpolationValues: [] },
  { key: 'initialiseMenuIntro', label: 'Initialise menu intro', defaultTemplate: 'Select a product to get started', interpolationValues: [] },
  { key: 'noResultsModules', label: 'No results message for modules', defaultTemplate: 'Select an object to replace or attach to.', interpolationValues: [] },
  { key: 'noResultsDefault', label: 'Default no results message', defaultTemplate: 'No results found', interpolationValues: [] },
  // checkout
  { key: 'snap2CheckoutTotalItemsTitle', label: 'Snap2 checkout total items title', defaultTemplate: 'Total items', interpolationValues: [] },
  { key: 'snap2CheckoutEmpty', label: 'Snap2 checkout empty state', defaultTemplate: 'Pricing updates appear here when the configurator sends price data.', interpolationValues: [] },
  { key: 'snap2CheckoutLineName', label: 'Snap2 checkout line name', defaultTemplate: '${LINE_NAME}', interpolationValues: [{ name: 'LINE_NAME', description: 'Checkout line product name.' }] },
  { key: 'snap2CheckoutSubtotal', label: 'Snap2 checkout subtotal', defaultTemplate: '${FORMATTED_SUBTOTAL}', interpolationValues: [{ name: 'FORMATTED_SUBTOTAL', description: 'Checkout line subtotal formatted value.' }] },
  { key: 'snap2CheckoutQuantity', label: 'Snap2 checkout quantity', defaultTemplate: '× ${QUANTITY}', interpolationValues: [{ name: 'QUANTITY', description: 'Checkout line quantity.' }] },
  { key: 'snap2CheckoutDiscountPercentage', label: 'Snap2 checkout discount percentage', defaultTemplate: '(-${DISCOUNT_PERCENTAGE}%)', interpolationValues: [{ name: 'DISCOUNT_PERCENTAGE', description: 'Checkout line discount percentage value.' }] },
  { key: 'snap2CheckoutSelectionName', label: 'Snap2 checkout selection name', defaultTemplate: '${SELECTION_NAME}', interpolationValues: [{ name: 'SELECTION_NAME', description: 'Checkout line selection name.' }] },
  { key: 'snap2CheckoutLineTotal', label: 'Snap2 checkout line total', defaultTemplate: 'Total: ${FORMATTED_PRICE}', interpolationValues: [{ name: 'FORMATTED_PRICE', description: 'Line formatted price.' }] },
  { key: 'snap2CheckoutFooterTotalLabel', label: 'Snap2 checkout total label', defaultTemplate: 'Total', interpolationValues: [] },
  { key: 'snap2Total', label: 'Snap2 checkout footer total value', defaultTemplate: '${FORMATTED_PRICE}', interpolationValues: [
    { name: 'PRICE', description: 'Numeric cart total (after discount), from price payload.' },
    { name: 'FORMATTED_PRICE', description: 'Cart total as formatted currency string.' },
    { name: 'FORMATTED_DISCOUNT_AMOUNT', description: 'Aggregate discount as formatted currency string.' },
    { name: 'DISCOUNT_PERCENTAGE', description: 'Aggregate discount percentage from price payload.' },
  ]},
  { key: 'snap2CheckoutBackToBuilder', label: 'Snap2 checkout back button', defaultTemplate: 'Back to builder', interpolationValues: [] },
  { key: 'snap2CheckoutViewCart', label: 'Snap2 checkout view cart button', defaultTemplate: 'View Cart', interpolationValues: [] },
  // controls
  { key: 'snap2ControlsToggleFloorTitle', label: 'Snap2 floor toggle title', defaultTemplate: 'Toggle floor grid', interpolationValues: [] },
  { key: 'snap2ControlsViewLabel', label: 'Snap2 view label', defaultTemplate: 'View', interpolationValues: [] },
  { key: 'snap2ControlsCaptureTitle', label: 'Snap2 capture title', defaultTemplate: 'Capture screenshots', interpolationValues: [] },
  // save dialog
  { key: 'snap2SaveFailedMessage', label: 'Snap2 save failed', defaultTemplate: 'Failed to save configuration', interpolationValues: [] },
  { key: 'snap2SaveButtonTitle', label: 'Snap2 save button title', defaultTemplate: 'Save or share configuration', interpolationValues: [] },
  { key: 'snap2SaveDialogTitleSave', label: 'Snap2 save dialog title', defaultTemplate: 'Save Your Configuration', interpolationValues: [] },
  { key: 'snap2SaveDialogTitleShare', label: 'Snap2 share dialog title', defaultTemplate: 'Share Configuration', interpolationValues: [] },
  { key: 'snap2SaveDialogConfirmClose', label: 'Snap2 save dialog confirm text', defaultTemplate: 'Do you want to save your progress? Without saving, your configuration will be lost.', interpolationValues: [] },
  { key: 'snap2SaveDialogConfirmShare', label: 'Snap2 share dialog confirm text', defaultTemplate: 'Do you want to save your configuration?', interpolationValues: [] },
  { key: 'snap2SaveDialogNo', label: 'Snap2 save dialog no button', defaultTemplate: 'No', interpolationValues: [] },
  { key: 'snap2SaveDialogYes', label: 'Snap2 save dialog yes button', defaultTemplate: 'Yes', interpolationValues: [] },
  { key: 'snap2SaveDialogSaving', label: 'Snap2 save dialog saving text', defaultTemplate: 'Saving configuration…', interpolationValues: [] },
  { key: 'snap2SaveDialogBodyClose', label: 'Snap2 save dialog body', defaultTemplate: 'Save this link to return to your configuration later. Without it, your progress will be lost:', interpolationValues: [] },
  { key: 'snap2SaveDialogBodyShare', label: 'Snap2 share dialog body', defaultTemplate: 'Copy this link to share with others or save your custom configuration for later:', interpolationValues: [] },
  { key: 'snap2SaveDialogCopyLink', label: 'Snap2 save dialog copy button', defaultTemplate: 'Copy link', interpolationValues: [] },
  { key: 'snap2SaveDialogCopySuccess', label: 'Snap2 save dialog copy success', defaultTemplate: 'Link copied to clipboard!', interpolationValues: [] },
  { key: 'snap2SaveDialogCopyFailure', label: 'Snap2 save dialog copy failure', defaultTemplate: 'Failed to copy link. Please select and copy manually.', interpolationValues: [] },
  // share dialog
  { key: 'shareLinkCopied', label: 'Share copied', defaultTemplate: 'Share link copied to clipboard!', interpolationValues: [] },
  { key: 'shareTitle', label: 'Share title', defaultTemplate: 'Share this ${PRODUCT_NAME} configuration with your friends!', interpolationValues: [{ name: 'PRODUCT_NAME', description: 'Current product name.' }] },
  { key: 'shareText', label: 'Share text', defaultTemplate: 'I just designed this ${PRODUCT_NAME} — take a look!', interpolationValues: [{ name: 'PRODUCT_NAME', description: 'Current product name.' }] },
  // screenshots dialog
  { key: 'snap2ScreenshotsTitle', label: 'Snap2 screenshots dialog title', defaultTemplate: 'Snap2 screenshots', interpolationValues: [] },
  { key: 'snap2ScreenshotsCount', label: 'Snap2 screenshots count', defaultTemplate: '${SCREENSHOT_COUNT} screenshot${SCREENSHOT_SUFFIX}', interpolationValues: [{ name: 'SCREENSHOT_COUNT', description: 'Number of screenshots.' }, { name: 'SCREENSHOT_SUFFIX', description: 'Plural suffix.' }] },
  { key: 'snap2ScreenshotsDownloadAll', label: 'Snap2 screenshots download all', defaultTemplate: 'Download all', interpolationValues: [] },
  { key: 'snap2ScreenshotsDownloading', label: 'Snap2 screenshots downloading', defaultTemplate: 'Downloading…', interpolationValues: [] },
  { key: 'snap2ScreenshotsDownloadOne', label: 'Snap2 screenshots download one', defaultTemplate: 'Download', interpolationValues: [] },
  // snap2 module card
  { key: 'moduleCardSeeMore', label: 'Module card see more', defaultTemplate: 'See more...', interpolationValues: [] },
  { key: 'moduleCardAddProduct', label: 'Module card add product', defaultTemplate: 'Add Product', interpolationValues: [] },
  { key: 'moduleCardNoImage', label: 'Module card no image', defaultTemplate: 'No Image', interpolationValues: [] },
  { key: 'moduleCardDescriptionShort', label: 'Module card short description (collapsed row)', defaultTemplate: '${DESCRIPTION}', interpolationValues: [
    { name: 'DESCRIPTION', description: 'Product short or long description text shown in the collapsed card row.' },
    { name: 'PRODUCT_NAME', description: 'Module product name (same source as productName; use in prefixes or labels).' },
  ] },
  { key: 'moduleDetailDescriptionShort', label: 'Module detail sheet short description', defaultTemplate: '${DESCRIPTION}', interpolationValues: [
    { name: 'DESCRIPTION', description: 'Product short description in module detail panel.' },
    { name: 'PRODUCT_NAME', description: 'Module product name.' },
  ] },
  { key: 'moduleDetailDescriptionLong', label: 'Module detail sheet long description', defaultTemplate: '${DESCRIPTION}', interpolationValues: [
    { name: 'DESCRIPTION', description: 'Product long description in module detail panel.' },
    { name: 'PRODUCT_NAME', description: 'Module product name.' },
  ] },
  { key: 'moduleDetailDimensions', label: 'Module detail sheet dimensions line', defaultTemplate: '${DIMENSIONS_LINE}', interpolationValues: [
    { name: 'DIMENSIONS_LINE', description: 'Default W/H/D line from module dimensions (e.g. W 12cm × H 20cm × D 8cm).' },
    { name: 'PRODUCT_NAME', description: 'Module product name.' },
    { name: 'WIDTH_CM', description: 'Width in cm when set, else empty.' },
    { name: 'HEIGHT_CM', description: 'Height in cm when set, else empty.' },
    { name: 'DEPTH_CM', description: 'Depth in cm when set, else empty.' },
  ] },
  { key: 'snap2ModulesEmptyState', label: 'Snap2 modules empty state', defaultTemplate: 'Tap a product to replace it, or tap a white circle with a plus to add another product.', interpolationValues: [] },
  { key: 'snap2ModulesLoading', label: 'Snap2 modules loading', defaultTemplate: 'Loading...', interpolationValues: [] },
  { key: 'snap2ModulesGroupHeader', label: 'Snap2 modules group header', defaultTemplate: '${GROUP_NAME}', interpolationValues: [{ name: 'GROUP_NAME', description: 'Module group name.' }] },
  { key: 'modulePositionTypeTabLabel', label: 'Module position type tab label', defaultTemplate: '${TAB_LABEL}', interpolationValues: [{ name: 'TAB_LABEL', description: 'Default tab label text.' }, { name: 'TAB_TYPE', description: 'Tab identifier, for example all/middle/corner/end.' }] },
  // custom dimensions dialog
  { key: 'snap2CustomDimensionsTitle', label: 'Snap2 custom dimensions title', defaultTemplate: 'Custom size (cm)', interpolationValues: [] },
  { key: 'snap2CustomDimensionsRange', label: 'Snap2 custom dimensions range text', defaultTemplate: 'Min ${MIN} · Max ${MAX} · Step ${STEP}', interpolationValues: [{ name: 'MIN', description: 'Minimum value.' }, { name: 'MAX', description: 'Maximum value.' }, { name: 'STEP', description: 'Step value.' }] },
  { key: 'snap2CustomDimensionsCancel', label: 'Snap2 custom dimensions cancel', defaultTemplate: 'Cancel', interpolationValues: [] },
  { key: 'snap2CustomDimensionsAdd', label: 'Snap2 custom dimensions add', defaultTemplate: 'Add', interpolationValues: [] },
  { key: 'snap2CustomDimensionsLabel', label: 'Dimensions axis label', defaultTemplate: '${DIMENSION_LABEL}', interpolationValues: [{ name: 'DIMENSION_LABEL', description: 'Resolved dimension label, for example Width/Height/Depth.' }, { name: 'AXIS', description: 'Dimension axis identifier, for example X/Y/Z.' }] },
  
];
