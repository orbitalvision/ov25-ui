// Shared stylesheet and helpers for Shadow DOM roots (used by inject and IframeContainer).

import cssText from '../../globals.css?inline';

const sharedStylesheet = new CSSStyleSheet();
sharedStylesheet.replaceSync(cssText);

export function getSharedStylesheet(): CSSStyleSheet {
  return sharedStylesheet;
}

export function createCSSVariablesStylesheet(cssVariables: string): CSSStyleSheet {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssVariables);
  return sheet;
}
