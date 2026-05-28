import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const rootDir = path.resolve(__dirname, '../..');

export function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) {
      args._.push(arg);
      continue;
    }

    const [name, inlineValue] = arg.split('=', 2);
    const key = name.slice(2);
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
    } else if (argv[index + 1] && !argv[index + 1].startsWith('--')) {
      args[key] = argv[++index];
    } else {
      args[key] = true;
    }
  }
  return args;
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(rootDir, filePath), 'utf8'));
}

export function writeJson(filePath, data) {
  fs.writeFileSync(path.resolve(rootDir, filePath), `${JSON.stringify(data, null, 2)}\n`);
}

export function ensureSemver(version, label = 'version') {
  if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) {
    throw new Error(`Invalid ${label}: ${version}. Expected x.y.z.`);
  }
}

export function run(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? rootDir,
    env: options.env ?? process.env,
    stdio: options.stdio ?? 'inherit',
    shell: false,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }

  return result;
}

export function capture(command, args = [], options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd ?? rootDir,
    env: options.env ?? process.env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', options.allowFailure ? 'pipe' : 'inherit'],
    maxBuffer: 80 * 1024 * 1024,
  }).trim();
}

export function captureOrEmpty(command, args = [], options = {}) {
  try {
    return capture(command, args, { ...options, allowFailure: true });
  } catch {
    return '';
  }
}

export function git(args, options = {}) {
  return capture('git', args, options);
}

export function gitOrEmpty(args, options = {}) {
  return captureOrEmpty('git', args, options);
}

export function appendFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, contents);
}

export function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

export function timestamp() {
  return new Date().toISOString();
}

export function releaseDir(version) {
  return path.join(rootDir, 'releases', version);
}
