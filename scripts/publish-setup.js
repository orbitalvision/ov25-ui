import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const setupDir = path.join(rootDir, 'setup');
const setupPackageJsonPath = path.join(setupDir, 'package.json');

if (!fs.existsSync(setupPackageJsonPath)) {
  console.error('❌ setup/package.json not found');
  process.exit(1);
}

try {
  console.log('=== Building and publishing ov25-setup ===');
  execSync('npm install', { cwd: setupDir, stdio: 'inherit' });
  execSync('npm run build', { cwd: setupDir, stdio: 'inherit' });
  execSync(`node scripts/strip-layers.js "${path.join(setupDir, 'dist', 'index.css')}"`, { cwd: rootDir, stdio: 'inherit' });
  execSync('npm publish --ignore-scripts', { cwd: setupDir, stdio: 'inherit' });
  console.log('✓ ov25-setup published successfully!');
} catch (error) {
  console.error('\n❌ Error publishing ov25-setup:', error.message || error);
  process.exit(1);
}
