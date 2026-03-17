import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const CANARY_TAG = 'canary';

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;

  if (!version.includes('-')) {
    console.log('Version should be a prerelease (e.g. 0.5.74-canary.0). Run: npm version prerelease --preid=canary');
    process.exit(1);
  }

  console.log(`Publishing canary ${version} (tag: ${CANARY_TAG})\n`);

  console.log('=== Building and publishing React 19 version (ov25-ui) ===');
  execSync('node scripts/build-react19.js', { cwd: rootDir, stdio: 'inherit' });
  execSync(`npm publish --tag ${CANARY_TAG} --ignore-scripts`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
  console.log('✓ React 19 canary published\n');

  console.log('=== Building and publishing React 18 version (ov25-ui-react18) ===');
  execSync('node scripts/build-react18.js', { cwd: rootDir, stdio: 'inherit' });

  const packageJsonForPublish = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJsonForPublish.name = 'ov25-ui-react18';
  packageJsonForPublish.version = version;
  packageJsonForPublish.peerDependencies = {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
  };
  packageJsonForPublish.devDependencies = {
    ...packageJsonForPublish.devDependencies,
    '@types/react': '^18.2.0',
    '@types/react-dom': '^18.2.0',
    react: '^18.2.0',
    'react-dom': '^18.2.0',
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonForPublish, null, 2) + '\n');

  console.log(`Publishing package: ${packageJsonForPublish.name}@${packageJsonForPublish.version}`);
  execSync(`npm publish --tag ${CANARY_TAG} --ignore-scripts`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
  console.log('✓ React 18 canary published\n');

  packageJson.peerDependencies = { react: '^19', 'react-dom': '^19' };
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    '@types/react': '^19.0.0',
    '@types/react-dom': '^19.0.0',
    react: '^19.2.0',
    'react-dom': '^19.2.0',
  };
  packageJson.name = 'ov25-ui';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  console.log('✓ Both canary versions published. Install with: npm install ov25-ui@canary');
} catch (error) {
  console.error('\n❌ Canary publish failed:', error.message || error);
  process.exit(1);
}
