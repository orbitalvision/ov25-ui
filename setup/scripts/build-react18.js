import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const packageJsonPath = path.join(rootDir, 'package.json');
const packageJsonBackupPath = path.join(rootDir, 'package.json.backup');

try {
  console.log('Building ov25-setup React 18 version...');

  if (fs.existsSync(packageJsonPath)) {
    fs.copyFileSync(packageJsonPath, packageJsonBackupPath);
    console.log('Backed up package.json');
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const originalName = packageJson.name;
  const originalPeerDeps = { ...packageJson.peerDependencies };
  const originalDevDeps = {
    '@types/react': packageJson.devDependencies['@types/react'],
    '@types/react-dom': packageJson.devDependencies['@types/react-dom'],
    react: packageJson.devDependencies['react'],
    'react-dom': packageJson.devDependencies['react-dom'],
  };

  packageJson.name = 'ov25-setup-react18';
  packageJson.peerDependencies = {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
  };
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    '@types/react': '^18.2.0',
    '@types/react-dom': '^18.2.0',
    react: '^18.2.0',
    'react-dom': '^18.2.0',
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('Updated package.json for React 18');

  console.log('Installing dependencies...');
  execSync('npm install', { cwd: rootDir, stdio: 'inherit' });

  console.log('Building library...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

  console.log('ov25-setup React 18 build completed!');

  packageJson.name = originalName;
  packageJson.peerDependencies = originalPeerDeps;
  packageJson.devDependencies = { ...packageJson.devDependencies, ...originalDevDeps };
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('Restored package.json to React 19');
} catch (error) {
  console.error('Error building React 18 version:', error);
  if (fs.existsSync(packageJsonBackupPath)) {
    fs.copyFileSync(packageJsonBackupPath, packageJsonPath);
    fs.unlinkSync(packageJsonBackupPath);
    console.log('Restored package.json from backup');
  }
  process.exit(1);
} finally {
  if (fs.existsSync(packageJsonBackupPath)) {
    fs.unlinkSync(packageJsonBackupPath);
  }
}
