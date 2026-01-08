# OV25-UI

A modern React UI component library for e-commerce applications, featuring a configurator with 3D product visualization.

## Installation

### For React 19

```bash
npm install ov25-ui
```

### For React 18 (Shopify, WooCommerce, etc.)

```bash
npm install ov25-ui-react18
```

**Note:** Both packages provide identical functionality. Choose the package that matches your React version to avoid dependency conflicts.

## Usage

### ES Modules (recommended)

**For React 19:**
```javascript
import { injectConfigurator } from 'ov25-ui';
```

**For React 18:**
```javascript
import { injectConfigurator } from 'ov25-ui-react18';
```

// Inject the configurator into your page
injectConfigurator({
  apiKey: 'your-api-key',               // Required
  productLink: '/product/123',           // Required
  galleryId: '#product-image-container', // Optional
  carouselId: '#product-carousel',       // Optional
  priceId: '#price-element',              // Optional
  nameId: '#name-element',              // Optional
  variantsId: '#product-variants',        // Optional
  swatchesId: 'ov25-swatches'           // Optional
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

## Publishing

This package is published in two versions to support both React 18 and React 19:

- **`ov25-ui`** - For React 19 consumers (default)
- **`ov25-ui-react18`** - For React 18 consumers (Shopify, WooCommerce, etc.)

### Publishing both versions

1. Update the version number in `package.json`
2. Run `npm run publish` to build and publish both packages

### Publishing individual versions (don't do this usually)

- React 18: `npm run publish:react18`
- React 19: `npm run publish:react19`

### Building without publishing

- React 18: `npm run build:react18`
- React 19: `npm run build:react19`

### Managing Dependencies

When adding new dependencies to `package.json`, they will automatically be used for both React 18 and React 19 builds. The build scripts handle React version differences automatically.

## Testing locally

- There is a minimal react project in dev/react-test which build a simple webpage. 
- It then calls injectConfigurator with some options. (dev/react-test/src/App.jsx)
- The react-test project will need an initial `npm install` (dont install at root, you must `cd dev/react-test` first. it has a separate `package.json`)
- To run, go to root directory of ov25-ui. run `npm run dev`. This will build the project and then spin up the react project
- Go to http://localhost:3000

## Running tests locally

- `npm run test:unit` for unit tests
- `npm run test:e2e` for full end-to-end tests (page navigation network requests, all browser features, SLOW)
- `npm run test:browser` for simpler frontend tests (component testing but with real browser APIs)

