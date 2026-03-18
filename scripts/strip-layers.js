import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '../dist/index.css');

function stripLayers(css) {
  let result = '';
  let i = 0;

  while (i < css.length) {
    const layerMatch = css.slice(i).match(/^\s*@layer\s+[^{]*\s*\{/);
    if (layerMatch) {
      i += layerMatch[0].length;
      let depth = 1;
      const start = i;
      while (depth > 0 && i < css.length) {
        if (css[i] === '{') depth++;
        else if (css[i] === '}') depth--;
        i++;
      }
      result += css.slice(start, i - 1);
      continue;
    }
    result += css[i];
    i++;
  }
  return result;
}

try {
  let content = fs.readFileSync(cssPath, 'utf8');
  const layerCount = (content.match(/@layer\s+/g) || []).length;
  content = stripLayers(content);
  fs.writeFileSync(cssPath, content, 'utf8');
  console.log(`Stripped ${layerCount} @layer wrappers from dist/index.css`);
} catch (err) {
  console.error('Error stripping @layer:', err);
  process.exit(1);
}
