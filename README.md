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
  priceId: '#price-element',              // Optional
  nameId: '#name-element',              // Optional
  variantsId: '#product-variants'        // Optional
});
```


## Updating the node pacakge

1. Go into package.json and increase the version number
2. Run npm publish


## Testing locally

- There is a minimal react project in dev/react-test which build a simple webpage. 
- It then calls injectConfigurator with some options. (dev/react-test/src/App.jsx)
- The react-test project will need an initial `npm install`
- To run, go to root directory of ov25-ui. run `npm run dev`. This will build the project and then spin up the react project
- Go to http://localhost:3000

