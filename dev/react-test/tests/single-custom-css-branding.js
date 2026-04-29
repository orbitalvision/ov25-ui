/**
 * Shared `branding.cssString` for react-test custom-CSS demos (standard + Snap2).
 * @type {string}
 */
export const SINGLE_CUSTOM_CSS_BRANDING = `
      #true-ov25-configurator-iframe-container, #ov25-configurator-iframe-container, #ov25-configurator-background-color, #ov25-initialise-menu {
          background-color: darkgreen;
      }

      .ov25-variant-control {
        background-color: red;
      }
        
      #ov25-share-button,
      #ov25-desktop-dimensions-toggle-button,
      #ov25-mobile-dimensions-toggle-button,
      #ov25-ar-toggle-button,
      #ov25-desktop-fullscreen-button,
      #ov25-animation-toggle-button,
      #ov25-snap2-dimensions-button,
      #ov25-snap2-mini-dimensions-switch,
      #ov25-snap2-variants-button,
      #ov25-snap2-hide-all-button,
      #ov25-snap2-save-button {
        background-color: blue;
      }

      .ov25-dimensions-width, .ov25-dimensions-height, .ov25-dimensions-depth, .ov25-dimensions-mini {
        background-color: red;
        border: 2px dashed green;
        border-radius: 0px;
        scale: 2;
      }

      #ov25-configurator-variant-menu-container > button {
        background-color: orange;
        color: red;
      }

      .ov25-close-button {
        background-color: green;
        color: white;
      }

      #ov25-filter-controls-button {
        background-color: purple;
        color: white;
      }

      #ov25-filter-controls-swatches {
        background-color: yellow;
        color: black;
      }

      #ov25-filter-control-swatches svg {
        fill: red;
      }

      #ov25-selected-swatches-container {
        background-color: blue;
        color: white;
      }

      #ov25-variants-header {
        background: cyan;
      }

      .ov25-variant-header-logo {
        background: linear-gradient(to right, #0c5358, #0c5358);
      }
      
      #ov25-filter-controls-wrapper {
        background: lightcoral;
      }

      #ov25-filter-controls-search {
        background: lightblue;
      }

      #ov25-variants-content-wrapper {
        background: lightgreen;
      }

      .ov25-option-header {
        background: rebeccapurple;
      }

      .ov25-group-header {
        background: goldenrod;
      }

      .ov25-variant-group-content {
        background: darkblue;
      }

      .ov25-variant-name {
        color: gold;
      }

      .ov25-checkout-button-wrapper {
        background: pink;
      }

      .ov25-wizard-button-block {
        background: pink;
      }

      .ov25-wizard-button-back {
        background: blanchedalmond;
      }

      .ov25-wizard-button-next {
        background: green;
      }

      .ov25-wizard-button-option {
        background: lightgreen;
      }

      .ov25-wizard-button-option-image {
        background: lightblue;
      }

      .ov25-wizard-button-option-name {
        background: lightcoral;
      }

      .ov25-wizard-button-option-value {
        background: lightblue;
      }

      #ov25-checkout-button {
        background: orange;
        color: black;
      }

      #ov25-add-to-basket-button {
        background: red;
        color: black;
      }

      .ov25-filter-content-wrapper {
        background: brown;
      }

      .ov25-filter-option-header {
        background: lightcoral;
      }

      .ov25-filter-group-header {
        background: lightblue;
      }

      .ov25-filter-pill {
        background: lightgreen;
      }
      
      .ov25-checkout-combo-button-text {
        color: black;
      }

      #ov25-swatchbook {
        background: lightgreen;
      }

      #ov25-swatchbook-title {
        color: pink;
      }

      .ov25-selected-swatch-image-container {
        background: yellow;
      }

      .ov25-selected-swatch-name {
        color: green;
      }

      .ov25-selected-swatch-option {
        color: blue;
      }

      .ov25-selected-swatch-sku {
        color: red;
      }
      
      .ov25-selected-swatch-description {
        color: purple;
      }

      .ov25-swatchbook-total-cost { 
        background: lightcoral;
      }

      #ov25-swatchbook-add-to-cart-button {
        background: darkblue;
      }

      #ov25-tabs-dropdown-select {
        background: lightblue;
      }

      .ov25-tabs-button {
        background: lightgreen;
      }

      .ov25-wizard-current-step {
        color: green;
      }

      .ov25-wizard-next-step {
        color: blue;
      }

      .ov25-module-variant-card[data-selected="true"] {
        border: 2px solid lightgreen;
      }

      /* Module variant detail sheet body (Snap2) */
      .ov25-module-variant-detail-panel {
        background-color: lemonchiffon !important;
        border-radius: 12px !important;
        padding: 0.35rem !important;
      }

      .ov25-module-variant-detail-panel__header {
        background: lightcoral;
        border-radius: 8px;
        padding: 0.35rem 0.5rem;
      }

      .ov25-module-variant-detail-panel__title {
        background: orange;
        color: darkred !important;
      }

      .ov25-module-variant-detail-panel__dimensions {
        background: turquoise;
        color: darkslategray !important;
      }

      .ov25-module-variant-detail-panel__gallery {
        background: palegoldenrod;
        border-radius: 8px;
        padding: 0.35rem;
      }

      .ov25-module-variant-detail-panel__gallery-inner--single,
      .ov25-module-variant-detail-panel__gallery-inner--grid,
      .ov25-module-variant-detail-panel__figure {
        outline: 2px dashed hotpink;
      }

      .ov25-module-variant-detail-panel__description {
        background: thistle;
        color: darkmagenta !important;
        border-radius: 6px;
        padding: 0.5rem !important;
      }

      /* --- Snap2: modal / inline shell, rails, checkout, controls (custom-css test harness) --- */
      #ov25-snap2-modal-shell {
        outline: 3px solid chartreuse;
      }
      #ov25-snap2-modal-backdrop {
        background: rgba(255, 0, 255, 0.12) !important;
      }
      #ov25-snap2-modal-frame {
        outline: 3px dashed cyan;
      }
      [data-ov25-snap2-shell="inline-sheet"] {
        outline: 3px solid darkorange;
      }
      .ov25-snap2-inline-sheet-stage,
      [id^="ov25-snap2-inline-sheet-stage-"] {
        outline: 2px dotted navy;
      }

      [data-ov25-snap2-settings-sheet] {
        background: antiquewhite !important;
        border-color: firebrick !important;
      }
      [data-ov25-snap2-settings-sheet][data-open="true"] {
        box-shadow: -8px 0 0 gold;
      }
      .ov25-snap2-settings-sheet-body {
        background: bisque;
      }
      #ov25-snap2-settings-sheet-backdrop {
        background: rgba(128, 0, 128, 0.2) !important;
      }

      #ov25-snap2-variant-sheet-column {
        outline: 2px solid seagreen;
      }
      #ov25-snap2-variant-sheet-column[data-ov25-snap2-checkout-open="true"] {
        outline-color: deeppink;
      }

      [id^="ov25-snap2-checkout-sheet"] {
        background: mintcream !important;
      }
      #ov25-snap2-checkout-sheet-back {
        color: crimson !important;
        font-weight: 700;
      }
      #ov25-snap2-checkout-sheet-title {
        color: indigo !important;
        background: yellow;
        border-radius: 6px;
      }
      #ov25-snap2-checkout-sheet-scroll {
        background: azure;
      }
      .ov25-snap2-checkout-line {
        border: 2px solid coral !important;
      }
      #ov25-snap2-checkout-sheet-footer {
        background: peachpuff !important;
      }
      #ov25-snap2-panel-checkout-button {
        border: 3px ridge rebeccapurple !important;
      }

      #ov25-snap2-controls > div {
        outline: 2px solid lime;
        background: rgba(255, 255, 0, 0.25) !important;
      }

      #ov25-snap2-options-layout {
        outline: 2px dashed sienna;
      }
      #ov25-snap2-options-wrapper {
        background: gainsboro;
      }
      [data-ov25-snap2-primary-segment-tab] {
        outline: 2px solid black;
      }

      .ov25-snap2-pieces-panel {
        outline: 2px solid olive;
        background: darkblue;
      }

      #ov25-snap2-variants-layout {
        outline: 2px solid teal;
      }

      #ov25-snap2-modules-body[data-ov25-snap2-modules-state="loading"] {
        background: honeydew !important;
      }
      #ov25-snap2-modules-body[data-ov25-snap2-modules-state="empty"] {
        background: mistyrose !important;
      }
      #ov25-snap2-modules-body[data-ov25-snap2-modules-state="ready"] {
        outline: 2px solid dodgerblue;
      }
      #ov25-snap2-modules-tabs-wrap {
        background: wheat !important;
      }
      .ov25-snap2-modules-grid[data-loading="true"] {
        opacity: 0.88;
        outline: 2px dashed red;
      }

      [data-ov25-snap2-module-panel] {
        outline: 2px solid chocolate;
      }

      #ov25-snap2-module-bottom-panel {
        background: lightcoral;
      }

      #ov25-snap2-modules-sheet {
        outline: 2px solid slateblue;
      }

      #ov25-initialise-menu {
        outline: 3px solid darkviolet;
      }

      [data-ov25-snap2-modal-open="true"],
      [data-ov25-snap2-drawer-open="true"] {
        outline: 2px dotted fuchsia;
      }

      #ov25-snap2-save-dialog {
        background: mediumorchid;
      }

      #ov25-snap2-save-dialog-no {
        outline: 3px dashed tomato;
        background: navajowhite !important;
        color: darkred !important;
      }

      #ov25-snap2-save-dialog-yes {
        outline: 3px solid forestgreen;
        background: palegreen !important;
        color: darkgreen !important;
      }

      #ov25-carousel-controls {
        background: lightcoral;
      }
    `;
