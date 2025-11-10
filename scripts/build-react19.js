import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

try {
  console.log('Building React 19 version...');
  console.log('(package.json is already configured for React 19)');

  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install', { cwd: rootDir, stdio: 'inherit' });

  // Build
  console.log('Building library...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

  console.log('React 19 build completed successfully!');
} catch (error) {
  console.error('Error building React 19 version:', error);
  process.exit(1);
}
