import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const packageJsonPath = path.join(rootDir, 'package.json');

let testServer = null;

try {
  console.log('Running tests before publishing...\n');

  // Run unit tests
  console.log('=== Running unit tests ===');
  execSync('npm run test:unit', { cwd: rootDir, stdio: 'inherit' });
  console.log('✓ Unit tests passed\n');

  // Run Component tests (browser tests in headless mode)
  console.log('=== Running component tests ===');
  execSync('npm run test:browser:ci', { 
    cwd: rootDir, 
    stdio: 'inherit',
    env: { ...process.env, CI: 'true' } // Force CI mode for headless
  });
  console.log('✓ Component tests passed\n');

  // Run E2E tests (requires build and running server)
  console.log('=== Building test app for E2E tests ===');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
  execSync('cd dev/react-test && npm install && npm run build', { cwd: rootDir, stdio: 'inherit' });
  
  console.log('=== Starting test server for E2E tests ===');
  testServer = spawn('npm', ['run', 'preview', '--', '--port', '3008'], {
    cwd: path.join(rootDir, 'dev/react-test'),
    stdio: 'pipe',
    shell: true,
    detached: false
  });

  let serverKilled = false;
  const killServer = () => {
    if (!serverKilled && testServer.pid) {
      try {
        process.kill(testServer.pid, 'SIGTERM');
        serverKilled = true;
      } catch (e) {
        // Process already dead, ignore
      }
    }
  };

  // Handle server errors and early exit
  testServer.on('error', (err) => {
    console.error('Failed to start test server:', err);
    killServer();
    process.exit(1);
  });

  testServer.on('exit', (code) => {
    if (code !== 0 && code !== null && !serverKilled) {
      console.error('Test server exited unexpectedly');
    }
  });

  // Wait for server to be ready using wait-on
  console.log('=== Waiting for test server to be ready ===');
  try {
    execSync('npx wait-on http://localhost:3008 --timeout 30000', { 
      cwd: rootDir, 
      stdio: 'inherit' 
    });
  } catch (error) {
    killServer();
    throw new Error('Test server failed to start within 30 seconds');
  }

  console.log('=== Running E2E tests ===');
  try {
    execSync('npm run test:e2e', { cwd: rootDir, stdio: 'inherit' });
    console.log('✓ E2E tests passed\n');
  } finally {
    // Always kill the test server
    killServer();
  }

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
  
  // Read package.json (build-react18.js restored it to React 19, so we need to modify it again)
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
  
  // Write the modified package.json
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
  
  // Clean up and reinstall dependencies to ensure dev/react-test works correctly
  console.log('\n=== Cleaning up dependencies ===');
  const nodeModulesPath = path.join(rootDir, 'node_modules');
  const packageLockPath = path.join(rootDir, 'package-lock.json');
  
  // Delete node_modules if it exists (using shell command for better reliability with symlinks)
  if (fs.existsSync(nodeModulesPath)) {
    console.log('Deleting node_modules...');
    try {
      // Use shell command for more reliable deletion on macOS/Unix systems
      execSync(`rm -rf "${nodeModulesPath}"`, { cwd: rootDir, stdio: 'inherit' });
      console.log('✓ node_modules deleted');
    } catch (error) {
      // Fallback to fs.rmSync if shell command fails
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      console.log('✓ node_modules deleted (fallback method)');
    }
  }
  
  // Delete package-lock.json if it exists
  if (fs.existsSync(packageLockPath)) {
    console.log('Deleting package-lock.json...');
    fs.unlinkSync(packageLockPath);
    console.log('✓ package-lock.json deleted');
  }
  
  // Reinstall dependencies
  console.log('Reinstalling dependencies...');
  execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
  console.log('✓ Dependencies reinstalled successfully\n');
} catch (error) {
  // Make sure test server is killed if it was started
  if (testServer && testServer.pid) {
    try {
      process.kill(testServer.pid, 'SIGTERM');
    } catch (e) {
      // Process already dead, ignore
    }
  }

  if (error.status !== undefined) {
    // Test failure or command failure
    console.error('\n❌ Tests failed or command error. Publishing aborted.');
  } else {
    console.error('\n❌ Error publishing packages:', error.message || error);
  }
  process.exit(1);
}

