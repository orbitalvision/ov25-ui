import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  readSelectionDetailsFixtureQuery,
  SelectionDetailsControls,
  SelectionDetailsModeControls,
} from '../templates/SelectionDetailsControls.jsx';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import '../src/index.css';

const DEV_RETAILER_APIKEY = import.meta.env.VITE_DEV_RETAILER_APIKEY;

const PRESETS = {
  'selection-details-tooltip-sheet': {
    title: 'Selection details — Tooltip / Fullscreen',
    description: 'Desktop tooltip and animated mobile fullscreen using swatch fixture product 1682.',
    desktopDetails: 'tooltip',
    mobileDetails: 'fullscreen',
  },
  'selection-details-modal': {
    title: 'Selection details — Modal',
    description: 'Near-fullscreen modal selection details using swatch fixture product 1682.',
    desktopDetails: 'modal',
    mobileDetails: 'modal',
  },
  'selection-details-fullscreen': {
    title: 'Selection details — Fullscreen',
    description: 'Instant desktop and right-sliding mobile fullscreen details using swatch fixture product 1682.',
    desktopDetails: 'fullscreen',
    mobileDetails: 'fullscreen',
  },
  'selection-details-sticky-top-layer': {
    title: 'Selection details — Sticky gallery top layer',
    description: (
      <>
        Inline-sticky gallery on a page that scrolls inside a wrapper (like Savor:{' '}
        <code>body {'{'} overflow: hidden {'}'}</code> + an <code>overflow: auto</code> page wrapper), so the
        sticky gallery is lifted into the browser top layer. Hover a fabric swatch: the tooltip opens over the
        gallery and must be fully visible. Scroll until the gallery sticks to see it enter the top layer.
      </>
    ),
    desktopDetails: 'tooltip',
    mobileDetails: 'fullscreen',
    stickyTopLayer: true,
  },
};

const OV25_TOP_LAYER_PORTAL_ID =
  /^ov25-(selection-details-portal-container|popover-portal-container|modal-portal-container|toaster-container)/;

function getPreset() {
  const pageName = window.location.pathname.split('/').pop()?.replace(/\.html$/, '');
  return PRESETS[pageName] ?? PRESETS['selection-details-tooltip-sheet'];
}

function isPopoverOpen(element) {
  try {
    return Boolean(element?.matches(':popover-open'));
  } catch {
    return false;
  }
}

function readStickyTopLayerStatus() {
  const galleryInTopLayer = Array.from(document.querySelectorAll('[popover]')).some(
    (element) => !OV25_TOP_LAYER_PORTAL_ID.test(element.id) && isPopoverOpen(element),
  );
  const container = document.querySelector('[id^="ov25-selection-details-portal-container"]');
  const surface = container?.shadowRoot?.querySelector('[role="tooltip"], [role="dialog"]');
  if (!surface) {
    return { galleryInTopLayer, detailsInTopLayer: isPopoverOpen(container), visiblePoints: null };
  }
  const rect = surface.getBoundingClientRect();
  const insetX = Math.min(16, rect.width / 4);
  const insetY = Math.min(16, rect.height / 4);
  const points = [
    [rect.left + rect.width / 2, rect.top + rect.height / 2],
    [rect.left + insetX, rect.top + insetY],
    [rect.right - insetX, rect.top + insetY],
    [rect.left + insetX, rect.bottom - insetY],
    [rect.right - insetX, rect.bottom - insetY],
  ];
  // Tooltips are click-through, which hit-testing skips; make the surface hittable just for this check.
  const previousPointerEvents = surface.style.getPropertyValue('pointer-events');
  const previousPriority = surface.style.getPropertyPriority('pointer-events');
  surface.style.setProperty('pointer-events', 'auto', 'important');
  const visible = points.filter(([x, y]) => document.elementFromPoint(x, y) === container).length;
  if (previousPointerEvents) surface.style.setProperty('pointer-events', previousPointerEvents, previousPriority);
  else surface.style.removeProperty('pointer-events');
  return {
    galleryInTopLayer,
    detailsInTopLayer: isPopoverOpen(container),
    visiblePoints: `${visible}/${points.length}`,
  };
}

function StickyTopLayerControls({ values }) {
  const [status, setStatus] = React.useState(readStickyTopLayerStatus);

  React.useEffect(() => {
    const interval = window.setInterval(() => setStatus(readStickyTopLayerStatus()), 200);
    return () => window.clearInterval(interval);
  }, []);

  const yesNo = (value) => (value ? 'yes' : 'no');

  return (
    <div className="ov:mb-4 ov:flex ov:flex-wrap ov:items-end ov:gap-3">
      <SelectionDetailsModeControls values={values} />
      <dl
        data-ov25-sticky-top-layer-status
        data-gallery-top-layer={status.galleryInTopLayer}
        data-details-top-layer={status.detailsInTopLayer}
        data-details-visible-points={status.visiblePoints ?? ''}
        className="ov:flex ov:gap-4 ov:rounded-lg ov:border ov:border-gray-200 ov:bg-white ov:p-3 ov:text-xs ov:text-[#525252]"
        // Pinned bottom-right (over the options column, clear of the gallery) so it stays visible while
        // scrolling. A top-layer gallery would paint over it if they overlapped.
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 2147483000,
          margin: 0,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        }}
      >
        <div><dt>Gallery in top layer</dt><dd className="ov:font-semibold ov:text-[#1a1a1a]">{yesNo(status.galleryInTopLayer)}</dd></div>
        <div><dt>Details in top layer</dt><dd className="ov:font-semibold ov:text-[#1a1a1a]">{yesNo(status.detailsInTopLayer)}</dd></div>
        <div>
          <dt>Details visible (hit-test)</dt>
          <dd className="ov:font-semibold ov:text-[#1a1a1a]">{status.visiblePoints ?? 'closed'}</dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Savor's product information column is much taller than its gallery, which is what gives the
 * sticky gallery room to travel. Without it there is no useful product boundary and OV25 keeps the
 * gallery in native flow instead of relocating it.
 */
function AsideProductDetails() {
  const sections = [
    ['Description', 'A deep, generous two seater with a single arm, feather-wrapped cushions, and a kiln-dried hardwood frame.'],
    ['Dimensions', 'Width 182cm, depth 98cm, height 84cm. Seat height 46cm. Check doorways and stairwells before ordering.'],
    ['Fabric and care', 'Every cover is removable and dry-cleanable. Rotate and plump cushions weekly to keep their shape.'],
    ['Delivery', 'Made to order in eight to ten weeks, with room-of-choice delivery and packaging removal included.'],
    ['Guarantee', 'Fifteen-year frame guarantee and five years on springs and cushion interiors.'],
  ];
  return (
    <div className="ov:mt-8 ov:space-y-4" data-selection-details-aside-copy>
      {sections.map(([title, copy]) => (
        <section key={title} className="ov:min-h-[240px] ov:rounded-lg ov:border ov:border-gray-200 ov:bg-gray-50 ov:p-5">
          <h3 className="ov:mb-2 ov:text-base ov:font-semibold">{title}</h3>
          <p className="ov:text-sm ov:text-[#525252]">{copy}</p>
        </section>
      ))}
    </div>
  );
}

/** Savor-style page: the viewport never scrolls; a full-height wrapper does. */
function PageWrapperScrollStyles() {
  return (
    <style>{`
      html, body { height: 100%; }
      body { overflow: hidden; margin: 0; }
      #root { height: 100%; overflow: auto; }
    `}</style>
  );
}

function BelowFoldProductContent() {
  const sections = [
    {
      title: 'Materials and care',
      copy: 'Performance upholstery, solid timber framing, and removable seat cushions designed for everyday use.',
    },
    {
      title: 'Dimensions',
      copy: 'Review the overall width, seat height, and clearance recommendations before placing your order.',
    },
    {
      title: 'Delivery and returns',
      copy: 'Made-to-order pieces include room-of-choice delivery and a dedicated delivery-day support team.',
    },
  ];

  return (
    <div
      className="ov:mt-10 ov:space-y-6 ov:pb-32"
      data-selection-details-scroll-content
    >
      <h2 className="ov:text-2xl ov:font-semibold">Product information</h2>
      {sections.map((section) => (
        <section
          key={section.title}
          className="ov:min-h-[180px] ov:rounded-lg ov:border ov:border-gray-200 ov:bg-gray-50 ov:p-6"
        >
          <h3 className="ov:mb-3 ov:text-lg ov:font-semibold">{section.title}</h3>
          <p className="ov:max-w-3xl ov:text-[#525252]">{section.copy}</p>
        </section>
      ))}
    </div>
  );
}

function App() {
  const preset = getPreset();
  const values = readSelectionDetailsFixtureQuery({
    ...preset,
    variantStyle: 'tree',
    configuratorMode: 'sheet',
  });
  const configuratorDisplayMode = preset.stickyTopLayer
    ? { desktop: 'inline-sticky', mobile: 'inline-sticky' }
    : values.configuratorDisplayMode;
  const config = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
    apiKey: () => DEV_RETAILER_APIKEY,
    productLink: () => '1682',
    selectors: {
      gallery: { selector: '.configurator-container', replace: true },
      variants: '#ov25-controls',
      swatches: '#ov25-swatches',
      price: { selector: '#price', replace: true },
      name: { selector: '#name', replace: true },
    },
    carousel: { desktop: 'stacked', mobile: 'carousel' },
    configurator: {
      displayMode: configuratorDisplayMode,
      triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
      variants: {
        displayMode: {
          desktop: values.variantStyle,
          mobile: values.variantStyle === 'tree' ? 'list' : values.variantStyle,
        },
        selectionDetails: {
          displayMode: {
            desktop: values.desktopDetails,
            mobile: values.mobileDetails,
          },
        },
      },
    },
    callbacks: {
      addToBasket: () => alert('Checkout function called'),
      buyNow: () => alert('Buy now function called'),
      buySwatches: () => alert('Add swatches to cart'),
    },
    flags: { hidePricing: false },
    branding: {
      cssString: ":host {\n  --ov25-configurator-iframe-background-color: #FFBCB0;\n  --ov25-cta-border-radius: 0px;\n}",
    },
  });

  return (
    <>
      {preset.stickyTopLayer ? <PageWrapperScrollStyles /> : null}
      <TestPageLayout
        title={preset.title}
        description={preset.description}
        injectConfig={config}
        topContent={
          preset.stickyTopLayer
            ? <StickyTopLayerControls values={values} />
            : <SelectionDetailsControls values={values} />
        }
        bottomContent={<BelowFoldProductContent />}
        asideBottomSlot={preset.stickyTopLayer ? <AsideProductDetails /> : undefined}
        galleryColumnWidth={preset.stickyTopLayer ? '60%' : undefined}
      />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
