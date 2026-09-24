// @vitest-environment node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { buildReact18Isolated } from '../../scripts/release/react18-preflight.js';

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) fs.rmSync(directory, { recursive: true, force: true });
});

function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'react18-preflight-test-'));
  directories.push(directory);
  execFileSync('git', ['init', '-q', directory]);
  fs.writeFileSync(path.join(directory, '.gitignore'), 'node_modules\ndist\n.env\n');
  fs.writeFileSync(path.join(directory, 'package.json'), '{"name":"original"}');
  fs.writeFileSync(path.join(directory, 'deleted.ts'), 'deleted');
  execFileSync('git', ['add', '.'], { cwd: directory });
  fs.rmSync(path.join(directory, 'deleted.ts'));
  fs.writeFileSync(path.join(directory, 'package.json'), '{"name":"working-copy"}');
  fs.writeFileSync(path.join(directory, 'new.ts'), 'new source');
  for (const ignored of ['node_modules', 'dist']) {
    fs.mkdirSync(path.join(directory, ignored));
    fs.writeFileSync(path.join(directory, ignored, 'keep'), 'original');
  }
  fs.writeFileSync(path.join(directory, '.env'), 'local-only');
  return directory;
}

it.each([false, true])('isolates current source and cleans up (build fails: %s)', (fails) => {
  const sourceDir = fixture();
  let snapshot = '';
  const build = () => buildReact18Isolated({ sourceDir, runBuild: (command, args, { cwd }) => {
    snapshot = cwd;
    expect(command).toBe('npm');
    expect(args).toEqual(['run', 'build:react18']);
    expect(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')).toContain('working-copy');
    expect(fs.readFileSync(path.join(cwd, 'new.ts'), 'utf8')).toBe('new source');
    for (const excluded of ['.git', 'node_modules', 'dist', '.env', 'deleted.ts']) {
      expect(fs.existsSync(path.join(cwd, excluded))).toBe(false);
    }
    fs.writeFileSync(path.join(cwd, 'package.json'), 'mutated');
    fs.writeFileSync(path.join(cwd, 'package-lock.json'), 'mutated');
    if (fails) throw new Error('build failed');
  } });
  if (fails) expect(build).toThrow('build failed');
  else build();
  expect(snapshot).not.toBe('');
  expect(fs.existsSync(snapshot)).toBe(false);
  expect(fs.readFileSync(path.join(sourceDir, 'package.json'), 'utf8')).toContain('working-copy');
  expect(fs.existsSync(path.join(sourceDir, 'package-lock.json'))).toBe(false);
  expect(fs.readFileSync(path.join(sourceDir, 'node_modules/keep'), 'utf8')).toBe('original');
});

it('rejects symlinks before the build can write outside the snapshot', () => {
  const sourceDir = fixture();
  fs.symlinkSync(path.join(sourceDir, 'package.json'), path.join(sourceDir, 'linked.json'));
  let buildStarted = false;
  expect(() => buildReact18Isolated({ sourceDir, runBuild: () => { buildStarted = true; } }))
    .toThrow('React 18 snapshot requires a regular file: linked.json');
  expect(buildStarted).toBe(false);
  expect(fs.readFileSync(path.join(sourceDir, 'package.json'), 'utf8')).toContain('working-copy');
});
