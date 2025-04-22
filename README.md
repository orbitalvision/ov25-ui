# ov25-ui

A modern React UI component library for e-commerce applications.

## Installation

```bash
npm install ov25-ui
# or
yarn add ov25-ui
```

## Usage

Import the components you need:

```jsx
import { ProductCarousel, ProductGallery, ProductOptions, ProductVariants } from 'ov25-ui';

// Use in your React application
function MyApp() {
  return (
    <div>
      <ProductCarousel items={[...]} />
      <ProductGallery images={[...]} />
      <ProductOptions options={[...]} />
      <ProductVariants variants={[...]} />
    </div>
  );
}
```

## Components

- **ProductCarousel**: Displays products in a carousel layout
- **ProductGallery**: Creates an image gallery for product displays
- **ProductOptions**: Renders selectable product options
- **ProductVariants**: Shows different variants of a product

## Requirements

- React 19+
- TailwindCSS 4+

## License

MIT
