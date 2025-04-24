# OV25-UI

A modern React UI component library for e-commerce applications, featuring a configurator with 3D product visualization.

## Installation

```bash
npm install ov25-ui
```

## Usage

### ES Modules (recommended)

```javascript
// Styles are automatically imported - no need for separate import
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

### UMD Bundle (WordPress/vanilla JS)

The package includes a UMD bundle with all dependencies (except React and ReactDOM) bundled together.

```html
<!-- First include React and ReactDOM -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- Include the CSS file -->
<link rel="stylesheet" href="https://unpkg.com/ov25-ui@0.1.14/dist/styles.css">

<!-- Then include OV25 UI bundle -->
<script src="https://unpkg.com/ov25-ui@0.1.14/dist/bundle/ov25-ui.min.js"></script>

<script>
  // Use the global Ov25UI object
  Ov25UI.injectConfigurator({
    apiKey: 'your-api-key',
    productLink: '/range/123',
    galleryId: '#product-image-container',
    carouselId: '#product-carousel',
    priceNameId: '#product-price-name',
    variantsId: '#product-variants'
  });
</script>
```

## Webpack Configuration

If you're using webpack and encounter errors related to `react/jsx-runtime`, add this to your webpack config:

```js
module.exports = {
  // ... your other webpack config
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    extensionAlias: {
      '.js': ['.js', '.jsx', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts'],
      '.cjs': ['.cjs', '.cts']
    },
    fallback: {
      'react/jsx-runtime': require.resolve('react/jsx-runtime.js')
    }
  }
};
```

## Bundler Configuration for Usage

### Next.js

Next.js should work out of the box. However, if you encounter issues with ESM modules, you can add the following to your next.config.js:

```js
const nextConfig = {
  transpilePackages: ['ov25-ui']
};

module.exports = nextConfig;
```

### Vite

For Vite projects, you typically don't need special configuration.

## Requirements

* React 16.8+
* React DOM 16.8+

## License

MIT
