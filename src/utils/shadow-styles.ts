// Shared stylesheet and helpers for Shadow DOM roots (used by inject and IframeContainer).

import cssText from '../../globals.css?inline';

let sharedStylesheet: CSSStyleSheet | null = null;

export function getSharedStylesheet(): CSSStyleSheet {
  if (typeof CSSStyleSheet === 'undefined') {
    throw new Error('getSharedStylesheet() requires constructable stylesheets (browser only)');
  }
  if (!sharedStylesheet) {
    sharedStylesheet = new CSSStyleSheet();
    sharedStylesheet.replaceSync(cssText);
  }
  return sharedStylesheet;
}

export function createuserCustomCssStylesheet(cssVariables: string): CSSStyleSheet {
  if (typeof CSSStyleSheet === 'undefined') {
    throw new Error('createuserCustomCssStylesheet() requires constructable stylesheets (browser only)');
  }
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssVariables);
  return sheet;
}
