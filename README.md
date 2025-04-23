# OV25-UI

A modern React UI component library for e-commerce applications, featuring a configurator with 3D product visualization.

## Installation

```bash
npm install ov25-ui
```

## Usage

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
