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
        
      :is(
        #ov25-share-button,
        #ov25-desktop-dimensions-toggle-button,
        #ov25-mobile-dimensions-toggle-button,
        #ov25-camera-toggle-button,
        #ov25-light-toggle-button,
        #ov25-ar-toggle-button,
        #ov25-desktop-fullscreen-button,
        #ov25-animation-toggle-button,
        #ov25-snap2-dimensions-button,
        #ov25-snap2-mini-dimensions-switch,
        #ov25-snap2-floor-grid-button,
        #ov25-snap2-view-select,
        [data-ov25-snap2-view-control="mobile"],
        #ov25-snap2-screenshots-button,
        #ov25-snap2-variants-button,
        #ov25-snap2-hide-all-button,
        #ov25-snap2-save-button
      ) {
        background-color: blue;
        border: 2px solid navy;
        color: white;
        box-shadow: 3px 3px 0 midnightblue;
        transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1);
      }

      :is(
        #ov25-share-button,
        #ov25-desktop-dimensions-toggle-button,
        #ov25-mobile-dimensions-toggle-button,
        #ov25-camera-toggle-button,
        #ov25-light-toggle-button,
        #ov25-ar-toggle-button,
        #ov25-desktop-fullscreen-button,
        #ov25-animation-toggle-button,
        #ov25-snap2-dimensions-button,
        #ov25-snap2-mini-dimensions-switch,
        #ov25-snap2-floor-grid-button,
        #ov25-snap2-view-select,
        [data-ov25-snap2-view-control="mobile"],
        #ov25-snap2-screenshots-button,
        #ov25-snap2-variants-button,
        #ov25-snap2-hide-all-button,
        #ov25-snap2-save-button
      ):focus-visible {
        outline: 3px solid gold;
        outline-offset: 3px;
      }

      :is(
        #ov25-share-button,
        #ov25-desktop-dimensions-toggle-button,
        #ov25-mobile-dimensions-toggle-button,
        #ov25-camera-toggle-button,
        #ov25-light-toggle-button,
        #ov25-ar-toggle-button,
        #ov25-desktop-fullscreen-button,
        #ov25-animation-toggle-button,
        #ov25-snap2-dimensions-button,
        #ov25-snap2-mini-dimensions-switch,
        #ov25-snap2-floor-grid-button,
        [data-ov25-snap2-view-control="mobile"],
        #ov25-snap2-screenshots-button,
        #ov25-snap2-variants-button,
        #ov25-snap2-hide-all-button,
        #ov25-snap2-save-button
      ):active:not(:disabled) {
        transform: scale(0.96);
      }

      #ov25-snap2-screenshots-button:disabled {
        background: slategray;
        border-color: dimgray;
        box-shadow: none;
      }

      [data-ov25-snap2-view-control]:focus-within {
        outline: 3px solid gold;
        outline-offset: 3px;
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

      /* --- Snap2 module cards: Initialise Menu + variants panel --- */
      .ov25-module-variant-card {
        background: honeydew;
        border: 3px solid teal;
        border-radius: 14px;
        box-shadow: 4px 4px 0 paleturquoise;
        transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1);
      }

      .ov25-module-variant-card[data-ov25-module-variant-card-pick="true"] {
        background: lemonchiffon;
        border-color: darkorange;
        box-shadow: 4px 4px 0 peachpuff;
      }

      #ov25-initialise-menu [data-ov25-initialise-menu-part="module-list"] {
        background: mintcream;
        outline: 3px solid seagreen;
        outline-offset: -3px;
      }

      #ov25-initialise-menu [data-ov25-initialise-menu-intro] {
        background: darkviolet;
        color: white;
        border-radius: 6px;
        padding: 0.5rem;
      }

      #ov25-initialise-menu
        [data-ov25-module-variant-card-part="tooltip"][data-ov25-module-variant-card-tooltip-active="true"] {
        background: darkviolet;
        border-color: gold;
        outline: 2px solid gold;
      }

      #ov25-initialise-menu [data-ov25-module-variant-card-part="thumb-cell"],
      #ov25-initialise-menu [data-ov25-module-variant-card-part="thumb-placeholder"] {
        background: palegreen;
        border-color: darkgreen;
      }

      #ov25-snap2-modules-body .ov25-module-variant-card {
        background: honeydew;
        border-color: teal;
      }

      #ov25-snap2-modules-body .ov25-module-variant-card[data-selected="true"] {
        background: palegreen;
        border-color: forestgreen;
        box-shadow: 4px 4px 0 darkseagreen;
      }

      .ov25-module-variant-card[data-ov25-module-variant-card-loading="true"] {
        filter: saturate(0.55);
        box-shadow: none;
      }

      [data-ov25-module-variant-card-part="name"] {
        background: lightcoral;
        color: darkred;
        border-left: 4px solid crimson;
        border-radius: 6px;
        padding: 0.35rem 0.5rem;
      }

      [data-ov25-module-variant-card-part="tooltip"] {
        background: midnightblue;
        color: white;
        border: 2px solid deepskyblue;
        box-shadow: 4px 4px 0 rgba(0, 0, 128, 0.28);
      }

      [data-ov25-module-variant-card-part="dimensions"] {
        background: lightcyan;
        color: darkslategray;
        border-left: 4px solid teal;
      }

      #ov25-snap2-modules-body
        [data-ov25-module-variant-card-part="dimensions"]:not([aria-hidden="true"]) {
        display: block;
      }

      [data-ov25-module-variant-card-part="thumb"] {
        background: papayawhip;
        border: 3px dashed teal;
        border-radius: 12px;
        padding: 0.35rem;
      }

      [data-ov25-module-variant-card-part="thumb-dual"] {
        background: lightcyan;
        border-radius: 10px;
      }

      .ov25-module-variant-card__thumb-dual-row {
        background: paleturquoise;
        border-radius: 8px;
      }

      [data-ov25-module-variant-card-part="thumb-cell"] {
        background: white;
        border: 2px solid dodgerblue;
        border-radius: 8px;
      }

      .ov25-module-variant-card__thumb-img {
        border-radius: 6px;
        filter: saturate(1.15) contrast(1.04);
      }

      [data-ov25-module-variant-card-part="thumb-placeholder"] {
        background: repeating-linear-gradient(
          135deg,
          lavender,
          lavender 10px,
          white 10px,
          white 20px
        );
        color: rebeccapurple;
      }

      [data-ov25-module-variant-card-part="descriptions"] {
        background: lavender;
        border: 2px dotted mediumorchid;
        border-radius: 8px;
        margin-top: 0.5rem;
      }

      [data-ov25-module-variant-card-part="description-short"] {
        background: aliceblue;
        border-radius: 6px;
      }

      [data-ov25-module-variant-card-part="description-long"] {
        background: thistle;
        border-top: 2px solid mediumorchid;
        border-radius: 6px;
      }

      [data-ov25-module-variant-card-part="footer"] {
        background: aliceblue;
        border-left: 4px solid dodgerblue;
        border-radius: 6px;
      }

      [data-ov25-module-variant-card-part="description-short-text"],
      [data-ov25-module-variant-card-part="description-long-text"] {
        color: midnightblue;
      }

      [data-ov25-module-variant-card-part="see-more"] {
        background: gold;
        color: darkred;
        box-shadow: inset 0 -2px 0 darkorange;
        transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1);
      }

      [data-ov25-module-variant-card-part="details-trigger"] {
        background: turquoise;
        color: darkslategray;
        border: 2px solid teal;
        border-radius: 999px;
        transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1);
      }

      .ov25-module-variant-card:focus-visible,
      [data-ov25-module-variant-card-part="see-more"]:focus-visible,
      [data-ov25-module-variant-card-part="details-trigger"]:focus-visible,
      .ov25-module-variant-detail-sheet-add-button:focus-visible {
        outline: 3px solid mediumblue;
        outline-offset: 3px;
      }

      .ov25-module-variant-card:active:not([data-ov25-module-variant-card-loading="true"]),
      [data-ov25-module-variant-card-part="see-more"]:active,
      [data-ov25-module-variant-card-part="details-trigger"]:active:not(:disabled) {
        transform: scale(0.97);
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

      [data-ov25-module-variant-detail-sheet="true"] {
        background: lavenderblush;
        outline: 3px solid rebeccapurple;
        outline-offset: -3px;
      }

      .ov25-module-variant-detail-sheet-footer {
        background: peachpuff;
        border-color: darkorange;
      }

      .ov25-module-variant-detail-sheet-add-button {
        background: chartreuse;
        color: darkgreen;
        border: 3px solid forestgreen;
        border-radius: 10px;
        box-shadow: 3px 3px 0 forestgreen;
        transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1);
      }

      .ov25-module-variant-detail-sheet-add-button:active:not(:disabled) {
        transform: scale(0.97);
      }

      .ov25-module-variant-detail-sheet-add-button:disabled {
        background: gainsboro;
        color: dimgray;
        border-color: gray;
        box-shadow: none;
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

      /* --- Selection details: every public hook and display-mode variation --- */
      .ov25-default-variant-card[data-selection-details-enabled="false"][data-display-mode="none"] {
        outline: 3px dashed slategray;
        outline-offset: 3px;
      }

      .ov25-selection-details-root {
        background: rgba(72, 61, 139, 0.12);
        box-shadow: inset 0 0 0 3px mediumslateblue;
      }

      .ov25-selection-details-backdrop {
        background: rgba(38, 20, 61, 0.72);
        backdrop-filter: blur(4px);
      }

      .ov25-selection-details-surface {
        background: lemonchiffon;
        color: midnightblue;
        border: 4px solid rebeccapurple;
        box-shadow: -12px 0 0 lightpink, -28px 0 48px rgba(72, 61, 139, 0.28);
      }

      .ov25-selection-details-close {
        background: tomato;
        color: white;
        border: 2px solid darkred;
        border-radius: 10px;
        box-shadow: 3px 3px 0 darkred;
        transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1);
      }

      .ov25-selection-details-image-frame {
        background: palegoldenrod;
        border-bottom: 4px solid teal;
        padding: 1rem;
      }

      .ov25-selection-details-image {
        background: white;
        border: 4px dashed teal;
        border-radius: 18px;
        filter: saturate(1.12) contrast(1.04);
      }

      .ov25-selection-details-copy {
        background: lavender;
        border-top: 3px dotted mediumorchid;
        padding: 1.25rem;
      }

      .ov25-selection-details-title {
        background: lightcoral;
        color: darkred;
        border: 2px solid crimson;
        border-radius: 8px;
        margin: 0;
        padding: 0.5rem 0.75rem;
        letter-spacing: 0.025em;
      }

      .ov25-selection-details-description {
        background: aliceblue;
        color: midnightblue;
        border-left: 5px solid dodgerblue;
        border-radius: 6px;
        padding: 0.75rem;
      }

      .ov25-selection-details-footer {
        background: peachpuff;
        border-top: 4px solid darkorange;
        gap: 0.75rem;
        padding: 1rem;
      }

      .ov25-selection-details-swatch-toggle {
        min-height: 48px;
        background: lightcyan;
        color: darkslategray;
        border: 3px solid teal;
        border-radius: 10px;
        box-shadow: 3px 3px 0 teal;
        transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1);
      }

      .ov25-selection-details-swatch-toggle[data-selected="true"] {
        background: turquoise;
        color: darkslategray;
      }

      .ov25-selection-details-apply {
        min-height: 48px;
        background: chartreuse;
        color: darkgreen;
        border: 3px solid forestgreen;
        border-radius: 10px;
        box-shadow: 3px 3px 0 forestgreen;
        transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1);
      }

      .ov25-selection-details-apply:disabled {
        background: gainsboro;
        color: dimgray;
        border-color: gray;
        box-shadow: 3px 3px 0 gray;
      }

      .ov25-selection-details-root:has(
        .ov25-selection-details-surface[data-display-mode="tooltip"]
      ) {
        background: transparent;
        box-shadow: none;
      }

      .ov25-selection-details-surface[data-display-mode="tooltip"] {
        border-width: 3px;
        border-radius: 14px;
        box-shadow: 0 12px 32px rgba(72, 61, 139, 0.32);
      }

      .ov25-selection-details-surface[data-display-mode="tooltip"]
        .ov25-selection-details-image-frame {
        padding: 0.5rem;
        border: 0;
      }

      .ov25-selection-details-surface[data-display-mode="tooltip"]
        .ov25-selection-details-copy {
        padding: 0;
        border: 0;
        background: transparent;
      }

      .ov25-selection-details-surface[data-display-mode="tooltip"]
        .ov25-selection-details-description {
        border-left: 0;
        border-top: 3px solid dodgerblue;
        border-radius: 0;
      }

      .ov25-selection-details-surface[data-display-mode="sheet"] {
        width: min(420px, 100dvw);
        border-width: 0 0 0 6px;
        border-radius: 0;
      }

      .ov25-selection-details-surface[data-display-mode="sheet"]
        .ov25-selection-details-copy {
        border-top: 0;
      }

      .ov25-selection-details-surface[data-display-mode="modal"] {
        border-radius: 24px;
        box-shadow: 0 24px 64px rgba(38, 20, 61, 0.38);
      }

      .ov25-selection-details-surface[data-display-mode="modal"][data-mobile="true"] {
        border-radius: 16px;
      }

      .ov25-selection-details-surface[data-display-mode="modal"]
        .ov25-selection-details-copy {
        border-top: 0;
      }

      .ov25-selection-details-surface[data-display-mode="fullscreen"] {
        border-width: 0;
        border-radius: 0;
        box-shadow: none;
      }

      .ov25-selection-details-surface[data-display-mode="fullscreen"][data-layout="split"]
        .ov25-selection-details-image-frame {
        border: 0;
        padding: 2rem;
      }

      .ov25-selection-details-surface[data-display-mode="fullscreen"][data-layout="split"]
        .ov25-selection-details-copy {
        border-top: 0;
        border-left: 4px dotted mediumorchid;
        padding: 5rem 2rem;
      }

      .ov25-selection-details-surface[data-display-mode="fullscreen"][data-layout="split"]
        .ov25-selection-details-footer {
        border-left: 4px dotted mediumorchid;
      }

      .ov25-selection-details-surface[data-display-mode="fullscreen"][data-layout="stacked"]
        .ov25-selection-details-copy {
        border-top: 0;
      }

      .ov25-selection-details-surface[data-display-mode="fullscreen"][data-mobile="true"]
        .ov25-selection-details-footer {
        padding-bottom: max(1rem, env(safe-area-inset-bottom));
      }

      .ov25-selection-details-image-frame[data-image-presentation="contain"] {
        background: palegoldenrod;
      }

      .ov25-selection-details-image-frame[data-image-presentation="square-crop"] {
        background: moccasin;
      }

      .ov25-selection-details-surface[aria-hidden="true"][data-interactive="false"] {
        filter: saturate(0.65);
      }

      .ov25-selection-details-close:focus-visible,
      .ov25-selection-details-swatch-toggle:focus-visible,
      .ov25-selection-details-apply:focus-visible {
        outline: 3px solid mediumblue;
        outline-offset: 3px;
      }

      @media (hover: hover) and (pointer: fine) {
        .ov25-selection-details-close:hover,
        .ov25-selection-details-swatch-toggle:hover,
        .ov25-selection-details-apply:hover:not(:disabled) {
          transform: translateY(-1px);
        }
      }

      .ov25-selection-details-close:active {
        transform: scale(0.96);
      }

      .ov25-selection-details-swatch-toggle:active,
      .ov25-selection-details-apply:active:not(:disabled) {
        transform: scale(0.97);
      }

      @media (prefers-reduced-motion: reduce) {
        .ov25-module-variant-card,
        [data-ov25-module-variant-card-part="see-more"],
        [data-ov25-module-variant-card-part="details-trigger"],
        .ov25-module-variant-detail-sheet-add-button,
        .ov25-selection-details-close,
        .ov25-selection-details-swatch-toggle,
        .ov25-selection-details-apply,
        :is(
          #ov25-share-button,
          #ov25-desktop-dimensions-toggle-button,
          #ov25-mobile-dimensions-toggle-button,
          #ov25-camera-toggle-button,
          #ov25-light-toggle-button,
          #ov25-ar-toggle-button,
          #ov25-desktop-fullscreen-button,
          #ov25-animation-toggle-button,
          #ov25-snap2-dimensions-button,
          #ov25-snap2-mini-dimensions-switch,
          #ov25-snap2-floor-grid-button,
          #ov25-snap2-view-select,
          [data-ov25-snap2-view-control="mobile"],
          #ov25-snap2-screenshots-button,
          #ov25-snap2-variants-button,
          #ov25-snap2-hide-all-button,
          #ov25-snap2-save-button
        ) {
          transition: none;
        }

        .ov25-module-variant-card:active,
        [data-ov25-module-variant-card-part="see-more"]:active,
        [data-ov25-module-variant-card-part="details-trigger"]:active,
        .ov25-module-variant-detail-sheet-add-button:active,
        .ov25-selection-details-close:hover,
        .ov25-selection-details-close:active,
        .ov25-selection-details-swatch-toggle:hover,
        .ov25-selection-details-swatch-toggle:active,
        .ov25-selection-details-apply:hover:not(:disabled),
        .ov25-selection-details-apply:active:not(:disabled),
        :is(
          #ov25-share-button,
          #ov25-desktop-dimensions-toggle-button,
          #ov25-mobile-dimensions-toggle-button,
          #ov25-camera-toggle-button,
          #ov25-light-toggle-button,
          #ov25-ar-toggle-button,
          #ov25-desktop-fullscreen-button,
          #ov25-animation-toggle-button,
          #ov25-snap2-dimensions-button,
          #ov25-snap2-mini-dimensions-switch,
          #ov25-snap2-floor-grid-button,
          [data-ov25-snap2-view-control="mobile"],
          #ov25-snap2-screenshots-button,
          #ov25-snap2-variants-button,
          #ov25-snap2-hide-all-button,
          #ov25-snap2-save-button
        ):active {
          transform: none;
        }
      }

      #ov25-carousel-controls {
        background: lightcoral;
      }
    `;
