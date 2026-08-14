import {
  assertSetupLockVersions,
  commitSetupRelease,
  commitUiRelease,
  inspectSetupFinalizationStatus,
  isSafeSetupRetryFile,
  refreshSetupLockfiles,
  waitForPackage,
} from '../../scripts/release/deploy.js';

const setupPackageLock = (version: string, resolvedVersion = version) => ({
  version,
  packages: {
    '': {
      version,
      dependencies: {
        'ov25-ui': version,
      },
    },
    'node_modules/ov25-ui': { version: resolvedVersion },
  },
});

const setupBunLock = (version: string) => `{
  "workspaces": {
    "": {
      "dependencies": {
        "ov25-ui": "${version}",
      },
    },
  },
  "packages": {
    "ov25-ui": ["ov25-ui@${version}", "", {}, "sha512-test"],
  },
}`;

describe('release deploy Setup lockfiles', () => {
  it('refreshes both Setup lockfiles and verifies the frozen Bun lock', () => {
    const setupDir = '/tmp/ov25-setup';
    const runCommand = vi.fn();

    refreshSetupLockfiles('0.8.2', {
      runCommand,
      setupDir,
      readSetupPackageLock: () => setupPackageLock('0.8.2'),
      readSetupBunLock: () => setupBunLock('0.8.2'),
    });

    expect(runCommand.mock.calls).toEqual([
      [
        'npm',
        ['install', '--package-lock-only', '--ignore-scripts', '--legacy-peer-deps'],
        { cwd: setupDir },
      ],
      ['bun', ['install', '--lockfile-only', '--ignore-scripts'], { cwd: setupDir }],
      [
        'bun',
        ['install', '--frozen-lockfile', '--ignore-scripts', '--dry-run'],
        { cwd: setupDir },
      ],
    ]);
  });

  it('rejects stale npm or Bun resolutions', () => {
    expect(() =>
      assertSetupLockVersions(
        '0.8.2',
        setupPackageLock('0.8.2', '0.8.1'),
        setupBunLock('0.8.2'),
      ),
    ).toThrow('setup/package-lock.json resolved ov25-ui@0.8.1 instead of 0.8.2');

    expect(() =>
      assertSetupLockVersions(
        '0.8.2',
        setupPackageLock('0.8.2'),
        setupBunLock('0.8.1'),
      ),
    ).toThrow('setup/bun.lock did not resolve ov25-ui@0.8.2');
  });

  it('allows only the three recoverable Setup release files during a retry', () => {
    expect(
      inspectSetupFinalizationStatus(
        ' M setup/package.json\nM  setup/package-lock.json\n M setup/bun.lock',
      ),
    ).toEqual({ clean: false, disallowed: [] });

    expect(
      inspectSetupFinalizationStatus(' M setup/bun.lock\n?? releases/0.8.2/context.md'),
    ).toEqual({ clean: false, disallowed: ['?? releases/0.8.2/context.md'] });

    expect(isSafeSetupRetryFile('old lock', 'old lock', 'new lock')).toBe(true);
    expect(isSafeSetupRetryFile('new lock', 'old lock', 'new lock')).toBe(true);
    expect(isSafeSetupRetryFile('manual edit', 'old lock', 'new lock')).toBe(false);
  });

  it('polls until the published package and its integrity are ready', () => {
    const packageExistsFn = vi
      .fn<() => boolean>()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValue(true);
    const sleep = vi.fn();

    waitForPackage('ov25-ui', '0.8.2', {
      packageExistsFn,
      pollIntervalMs: 1,
      sleep,
    });

    expect(packageExistsFn).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it('stages setup/bun.lock in the Setup release commit', () => {
    const runCommand = vi.fn();
    const gitCommand = vi.fn();

    commitSetupRelease('0.8.2', { runCommand, gitCommand });

    expect(runCommand).toHaveBeenCalledWith('git', [
      'add',
      'setup/package.json',
      'setup/package-lock.json',
      'setup/bun.lock',
    ]);
    expect(gitCommand).toHaveBeenCalledWith([
      'commit',
      '-m',
      'chore: release ov25-setup 0.8.2',
    ]);
  });

  it('keeps Setup metadata out of the pre-publication UI release commit', () => {
    const runCommand = vi.fn();
    const gitCommand = vi.fn();

    commitUiRelease('0.8.2', { runCommand, gitCommand });

    expect(runCommand).toHaveBeenCalledWith('git', [
      'add',
      'CHANGELOG.md',
      'package.json',
      'package-lock.json',
      'releases/0.8.2',
    ]);
  });
});
