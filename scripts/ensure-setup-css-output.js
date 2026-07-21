import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(scriptsDir, '../setup/dist');
const indexCss = path.join(distDir, 'index.css');
const legacyCss = path.join(distDir, 'ov25-setup.css');

if (!fs.existsSync(indexCss)) {
  if (!fs.existsSync(legacyCss)) {
    console.error('Expected setup/dist/index.css or setup/dist/ov25-setup.css after Vite build');
    process.exit(1);
  }

  fs.copyFileSync(legacyCss, indexCss);
  console.log('Copied setup/dist/ov25-setup.css to setup/dist/index.css');
}
