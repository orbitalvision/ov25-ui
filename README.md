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

### Screenshot Generation

After injecting the configurator, you can generate thumbnails using the `window.ov25GenerateThumbnail()` function:

```javascript
// Generate a screenshot and get the URL
window.ov25GenerateThumbnail()
  .then(screenshotUrl => {
    console.log('Screenshot URL:', screenshotUrl);
    // Use the URL for thumbnails, social sharing, etc.
  })
  .catch(error => {
    console.error('Screenshot generation failed:', error);
  });

// Using async/await
async function captureThumbnail() {
  try {
    const url = await window.ov25GenerateThumbnail();
    return url;
  } catch (error) {
    console.error('Failed to capture thumbnail:', error);
  }
}
```

The function returns a Promise that resolves with the uploaded screenshot URL from S3. Screenshots are automatically uploaded and the returned URL can be used immediately.

## Updating the node pacakge

1. Go into package.json and increase the version number
2. Run npm publish


## Testing locally

- There is a minimal react project in dev/react-test which build a simple webpage. 
- It then calls injectConfigurator with some options. (dev/react-test/src/App.jsx)
- The react-test project will need an initial `npm install`
- To run, go to root directory of ov25-ui. run `npm run dev`. This will build the project and then spin up the react project
- Go to http://localhost:3000

