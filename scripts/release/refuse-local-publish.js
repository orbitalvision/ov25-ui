const command = process.argv.slice(2).join(' ') || 'publish';

console.error(`ERROR: ${command} is disabled for local release flow.`);
console.error('Packages are published only by tag-triggered GitHub Actions using npm Trusted Publishing.');
console.error('Use bun run release:review, bun run release:test, then bun run release:deploy.');

process.exit(1);
