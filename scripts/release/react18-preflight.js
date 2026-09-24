import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rootDir, run } from './common.js';

export function buildReact18Isolated({ sourceDir = rootDir, runBuild = run } = {}) {
  const temporaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ov25-ui-react18-check-'));
  try {
    // Copy working-tree contents, including new source files, rather than stale HEAD.
    // Git's ignore rules exclude installed dependencies, build output and local env files.
    const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
      cwd: sourceDir,
      encoding: 'utf8',
      maxBuffer: 80 * 1024 * 1024,
    }).split('\0').filter(Boolean);
    for (const relativePath of new Set(files)) {
      const source = path.join(sourceDir, relativePath);
      if (!fs.existsSync(source)) continue; // Respect working-tree deletions.
      const stat = fs.lstatSync(source);
      // A link could let the dependency install or build write outside the copy.
      if (!stat.isFile()) throw new Error(`React 18 snapshot requires a regular file: ${relativePath}`);
      const destination = path.join(temporaryDir, relativePath);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(source, destination);
    }
    runBuild('npm', ['run', 'build:react18'], { cwd: temporaryDir });
  } finally {
    fs.rmSync(temporaryDir, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    buildReact18Isolated();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
