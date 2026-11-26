/**
 * Optional semantic controls are activated only when explicitly supplied. This
 * leaves every legacy selector/default intact when opening and saving old JSON.
 * Rules precede merchant CSS, so an existing explicit element override wins.
 */
export function buildThemeStyleRules(css: string): string {
  const rootBlocks = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/:(?:host|root)\s*\{([^}]*)\}/g)].map(match => match[1]).join(';');
  const configured = (variable: string) => new RegExp(`(?:^|;)\\s*${variable}\\s*:`).test(rootBlocks);
  const rules: string[] = [];
  function rule(variable: string, selector: string, declaration: string) {
    if (configured(variable)) rules.push(`${selector} { ${declaration.replaceAll('$value', `var(${variable})`)} }`);
  }
  // These controls style navigation tabs, not variant cards. Fabric thumbnails
  // keep VariantThumb's existing ring; their card surface and caption stay unchanged.
  const selected = '[data-ov25-tab-active="true"], #ov25-option-selector-tabs > [data-selected="true"], #ov25-module-type-tabs > [data-selected="true"]';
  const selectedText = `${selected}, #ov25-option-selector-tabs [data-selected="true"], #ov25-module-type-tabs [data-selected="true"]`;
  rule('--ov25-selected-background-color', selected, 'background-color: $value;');
  rule('--ov25-selected-text-color', selectedText, 'color: $value;');
  rule('--ov25-selected-border-color', selected, 'border-color: $value; box-shadow: inset 0 0 0 1px $value;');
  const cta = '.ov25-cta:not(.ov25-checkout-combo-button .ov25-cta), .ov25-checkout-combo-button';
  rule('--ov25-cta-border-color', cta, 'border-color: $value; border-style: solid;');
  rule('--ov25-cta-border-width', cta, 'border-width: $value; border-style: solid;');
  rule('--ov25-cta-text-color-disabled', '.ov25-cta:disabled, .ov25-cta:disabled:hover, .ov25-checkout-combo-button:has(button:disabled) .ov25-checkout-combo-button-text', 'color: $value;');
  // The pre-existing disabled tint also styles the split checkout's visible surface.
  if (configured('--ov25-cta-text-color-disabled')) rule('--ov25-cta-color-light', '.ov25-cta:disabled:not(.ov25-checkout-combo-button *), .ov25-cta:disabled:hover:not(.ov25-checkout-combo-button *), .ov25-checkout-combo-button:has(button:disabled)', 'background-color: $value;');
  const inputs = 'input[class]:not([type="checkbox"]):not([type="radio"]), select[class], textarea[class], #ov25-filter-controls-search';
  rule('--ov25-input-background-color', inputs, 'background-color: $value;');
  rule('--ov25-input-text-color', inputs, 'color: $value;');
  rule('--ov25-input-border-color', inputs, 'border-color: $value;');
  rule('--ov25-input-placeholder-color', 'input[class]::placeholder, textarea[class]::placeholder', 'color: $value; opacity: 1;');
  rule('--ov25-focus-ring-color', 'button[class]:focus-visible, [role="button"][class]:focus-visible, input[class]:focus-visible, select[class]:focus-visible, a[class]:focus-visible', 'outline: 2px solid $value; outline-offset: 3px;');
  rule('--ov25-overlay-button-hover-color', '#ov25-configurator-view-controls-container button:hover, .ov25-gallery-overlay-button:hover', 'background-color: $value;');
  const backdrops = '[data-ov25-themed-backdrop], #ov25-snap2-modal-backdrop, #ov25-snap2-settings-sheet-backdrop, .ov25-selection-details-backdrop[data-display-mode="modal"]';
  if (configured('--ov25-backdrop-color') || configured('--ov25-backdrop-opacity')) {
    rules.push(`${backdrops} { background-color: color-mix(in srgb, var(--ov25-backdrop-color, #000000) calc(var(--ov25-backdrop-opacity, 0.5) * 100%), transparent); }`);
  }
  rule('--ov25-compare-price-text-color', '#ov25-subtotal-product-page, #ov25-mobile-subtotal', 'color: $value;');
  rule('--ov25-link-color', 'a[class], #ov25-configurator-qr-code-popup a, #ov25-ar-preview-link', 'color: $value;');
  rule('--ov25-heading-font-family', 'h1[class], h2[class], h3[class], h4[class], .ov25-variants-header-name, .ov25-selection-details-title', 'font-family: $value;');
  rule('--ov25-body-font-weight', ':host', 'font-weight: $value; --ov-font-weight-normal: $value;');
  rule('--ov25-heading-font-weight', 'h1[class], h2[class], h3[class], h4[class], .ov25-variants-header-name, .ov25-selection-details-title', 'font-weight: $value;');
  const buttons = 'button[class], button[class] > span, button[class] > p, [role="button"][class], .ov25-checkout-combo-button';
  rule('--ov25-button-font-family', buttons, 'font-family: $value;');
  rule('--ov25-button-font-weight', buttons, 'font-weight: $value;');
  rule('--ov25-button-letter-spacing', buttons, 'letter-spacing: $value;');
  rule('--ov25-button-text-transform', buttons, 'text-transform: $value;');
  return rules.join('\n');
}
