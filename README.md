# OV25-UI

A modern React UI component library for e-commerce applications, featuring a configurator with 3D product visualization.

## Installation

```bash
npm install ov25-ui
```

## Usage

### ES Modules (recommended)

```javascript

import { injectConfigurator } from 'ov25-ui';

// Inject the configurator into your page
injectConfigurator({
  apiKey: 'your-api-key',               // Required
  productLink: '/product/123',           // Required
  galleryId: '#product-image-container', // Optional
  carouselId: '#product-carousel',       // Optional
  priceNameId: '#product-price-name',    // Optional
  variantsId: '#product-variants'        // Optional
});
```


## Updating the node pacakge

1. Go into package.json and increase the version number
2. Run npm publish

