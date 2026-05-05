import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import postcss from 'postcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const prefixSelector = require('postcss-prefix-selector');

const cssPath = path.resolve(__dirname, '../dist/index.css');

const prefix = ':host';
const prefixWithSpace = `${prefix} `;

/**
 * Prefix every rule selector with :host so the bundle does not match the document
 * when the stylesheet is linked in the light DOM. Replaces :root / html / body with
 * :host so custom properties and preflight do not target the real document root.
 * Skips rules inside @keyframes (handled by postcss-prefix-selector).
 */
function scopeShadowHost(css) {
  return postcss([
    prefixSelector({
      prefix,
      transform(_pref, selector) {
        let s = selector.trim();
        // :root at selector start has no leading \b before ':' — avoid \b:root\b (it misses).
        s = s.replace(/:root\b/g, ':host');
        s = s.replace(/^html\b/, ':host');
        s = s.replace(/^body\b/, ':host');
        if (s.startsWith(':host')) {
          return s;
        }
        return prefixWithSpace + s;
      },
    }),
  ]).process(css, { from: cssPath }).css;
}

if (!fs.existsSync(cssPath)) {
  console.error(`scope-dist-css-for-shadow-host: missing ${cssPath} (run vite build first)`);
  process.exit(1);
}

const before = fs.readFileSync(cssPath, 'utf8');
const after = scopeShadowHost(before);
fs.writeFileSync(cssPath, after, 'utf8');

const rootRefs = (after.match(/:root\b/g) || []).length;
if (rootRefs > 0) {
  console.warn(`scope-dist-css-for-shadow-host: warning: ${rootRefs} :root references remain`);
}
console.log(`scope-dist-css-for-shadow-host: wrote ${cssPath}`);
