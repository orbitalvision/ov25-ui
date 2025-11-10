import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const packageJsonPath = path.join(rootDir, 'package.json');

try {
  console.log('Publishing both React 18 and React 19 versions...\n');

  // Read version from package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;
  console.log(`Publishing version ${version}\n`);

  // Build and publish React 19 version (base package)
  console.log('=== Building and publishing React 19 version (ov25-ui) ===');
  execSync('node scripts/build-react19.js', { cwd: rootDir, stdio: 'inherit' });
  execSync('npm publish --ignore-scripts', { 
    cwd: rootDir, 
    stdio: 'inherit'
  });
  console.log('✓ React 19 version published\n');

  // Build and publish React 18 version
  console.log('=== Building and publishing React 18 version (ov25-ui-react18) ===');
  
  // Build React 18 version (this will modify package.json, build, then restore)
  execSync('node scripts/build-react18.js', { cwd: rootDir, stdio: 'inherit' });
  
  // Read package.json and modify for React 18 publishing
  // Note: build-react18.js already modified it, so we need to read the current state
  const packageJsonForPublish = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update for React 18 publishing
  packageJsonForPublish.name = "ov25-ui-react18";
  packageJsonForPublish.version = version;
  packageJsonForPublish.peerDependencies = {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  };
  packageJsonForPublish.devDependencies = {
    ...packageJsonForPublish.devDependencies,
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonForPublish, null, 2) + '\n');
  
  // Verify the package.json is correct before publishing
  console.log(`Publishing package: ${packageJsonForPublish.name}@${packageJsonForPublish.version}`);
  
  execSync('npm publish --ignore-scripts', { 
    cwd: rootDir, 
    stdio: 'inherit'
  });
  console.log('✓ React 18 version published\n');

  // Restore original React 19 package.json
  packageJson.peerDependencies = {
    "react": "^19",
    "react-dom": "^19"
  };
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  };
  packageJson.name = "ov25-ui";
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log('✓ Both versions published successfully!');
} catch (error) {
  console.error('Error publishing packages:', error);
  process.exit(1);
}

