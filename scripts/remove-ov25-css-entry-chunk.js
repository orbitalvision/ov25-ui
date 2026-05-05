import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const chunk = path.resolve(__dirname, '../dist/__ov25-temp-css-entry.js');
const map = path.resolve(__dirname, '../dist/__ov25-temp-css-entry.js.map');
const chunkBare = path.resolve(__dirname, '../dist/__ov25-temp-css-entry');
const mapBare = path.resolve(__dirname, '../dist/__ov25-temp-css-entry.map');

for (const p of [chunk, map, chunkBare, mapBare]) {
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log(`remove-ov25-css-entry-chunk: removed ${path.basename(p)}`);
  }
}
