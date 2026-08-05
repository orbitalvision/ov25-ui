import { capture } from '../../scripts/release/common.js';

describe('release command capture', () => {
  it('preserves the leading status column from git status --short output', () => {
    const status = capture(process.execPath, [
      '-e',
      'process.stdout.write(" M releases/0.8.0/client-email.md\\n")',
    ]);

    expect(status).toBe(' M releases/0.8.0/client-email.md');
  });
});
