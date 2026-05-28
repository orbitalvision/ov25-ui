// Release phase 1: creates raw context files about the current release.
// This is triggered by AI Agent when you trigger the /release-review skill.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const allowedBumps = new Set(['patch', 'minor', 'major']);

function usage() {
  return `Usage:
  bun run release:review -- --bump patch
  bun run release:review -- --bump minor
  bun run release:review -- --bump major

Options:
  --bump <patch|minor|major>  Required release bump type.
  --since <git-ref>          Comparison base. Defaults to latest ov25-ui@x.y.z tag.
  --head <git-ref>           Comparison head. Defaults to HEAD.
  --force                    Overwrite existing context artifacts.
  --dry-run                  Print the context summary instead of writing files.
  --help                     Show this message.

This script only collects release-review context. It never classifies changes,
bumps versions, commits, tags, pushes, publishes packages, or deploys Shopify/WooCommerce.`;
}

function parseArgs(argv) {
  const args = {
    bump: null,
    since: null,
    head: 'HEAD',
    force: false,
    dryRun: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const [name, inlineValue] = arg.split('=', 2);

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (name === '--bump') {
      args.bump = inlineValue ?? argv[++index];
    } else if (name === '--since') {
      args.since = inlineValue ?? argv[++index];
    } else if (name === '--head') {
      args.head = inlineValue ?? argv[++index];
    } else if (arg === '--force') {
      args.force = true;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'));
}

function git(args, options = {}) {
  try {
    return execFileSync('git', args, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', options.allowFailure ? 'pipe' : 'inherit'],
      maxBuffer: 80 * 1024 * 1024,
    }).trim();
  } catch (error) {
    if (options.allowFailure) {
      return '';
    }
    throw error;
  }
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Unsupported version format: ${version}. Expected x.y.z.`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function formatVersion(version) {
  return `${version.major}.${version.minor}.${version.patch}`;
}

function bumpVersion(currentVersion, bump) {
  const next = parseVersion(currentVersion);

  if (bump === 'major') {
    next.major += 1;
    next.minor = 0;
    next.patch = 0;
  } else if (bump === 'minor') {
    next.minor += 1;
    next.patch = 0;
  } else {
    next.patch += 1;
  }

  return formatVersion(next);
}

function compareVersions(a, b) {
  const parsedA = parseVersion(a);
  const parsedB = parseVersion(b);

  return (
    parsedA.major - parsedB.major ||
    parsedA.minor - parsedB.minor ||
    parsedA.patch - parsedB.patch
  );
}

function latestOv25UiTag() {
  const tags = git(['tag', '--list', 'ov25-ui@*'], { allowFailure: true })
    .split('\n')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => {
      const version = tag.replace(/^ov25-ui@/, '');
      try {
        parseVersion(version);
        return { tag, version };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => compareVersions(b.version, a.version));

  return tags[0]?.tag ?? null;
}

function assertGitRef(ref, label) {
  const resolved = git(['rev-parse', '--verify', `${ref}^{commit}`], { allowFailure: true });
  if (!resolved) {
    throw new Error(`Could not resolve ${label} git ref: ${ref}`);
  }
  return resolved;
}

function lines(value) {
  if (!value) {
    return [];
  }
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function packageExcludesReleaseArtifacts(packageJson) {
  if (!Array.isArray(packageJson.files)) {
    return false;
  }
  return !packageJson.files.some((entry) => entry === 'releases' || entry.startsWith('releases/'));
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

function writeJson(filePath, data) {
  writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function buildContext(args) {
  const packageJson = readJson('package.json');
  const setupPackageJson = readJson('setup/package.json');
  const currentVersion = packageJson.version;
  const nextVersion = bumpVersion(currentVersion, args.bump);
  const baseRef = args.since ?? latestOv25UiTag();

  if (!baseRef) {
    throw new Error('No ov25-ui@x.y.z release tag found. Re-run with --since <git-ref>.');
  }

  const headRef = args.head;
  const baseSha = assertGitRef(baseRef, 'base');
  const headSha = assertGitRef(headRef, 'head');
  const range = `${baseRef}..${headRef}`;
  const releaseDir = `releases/${nextVersion}`;

  const artifacts = {
    releaseDir,
    contextJson: `${releaseDir}/context.json`,
    contextMarkdown: `${releaseDir}/context.md`,
    commits: `${releaseDir}/commits.txt`,
    changedFiles: `${releaseDir}/changed-files.txt`,
    diffStat: `${releaseDir}/diff-stat.txt`,
    diffPatch: `${releaseDir}/diff.patch`,
  };

  const context = {
    generatedAt: new Date().toISOString(),
    package: 'ov25-ui',
    bump: args.bump,
    currentVersion,
    nextVersion,
    baseRef,
    baseSha,
    headRef,
    headSha,
    range,
    branch: git(['rev-parse', '--abbrev-ref', 'HEAD'], { allowFailure: true }) || 'unknown',
    npmPackageSafety: {
      ov25UiFiles: packageJson.files ?? null,
      ov25SetupFiles: setupPackageJson.files ?? null,
      ov25UiExcludesReleaseArtifacts: packageExcludesReleaseArtifacts(packageJson),
      ov25SetupExcludesReleaseArtifacts: packageExcludesReleaseArtifacts(setupPackageJson),
    },
    commands: {
      committedLog: `git log --oneline --decorate=short ${range}`,
      committedDiffStat: `git diff --stat ${range}`,
      committedChangedFiles: `git diff --name-only ${range}`,
      committedDiff: `git diff ${range}`,
      status: 'git status --short',
    },
    artifacts,
  };

  const raw = {
    commits: git(['log', '--oneline', '--decorate=short', range], { allowFailure: true }),
    changedFiles: git(['diff', '--name-only', range], { allowFailure: true }),
    diffStat: git(['diff', '--stat', range], { allowFailure: true }),
    diffPatch: git(['diff', range], { allowFailure: true }),
    status: git(['status', '--short'], { allowFailure: true }),
  };

  return { context, raw };
}

function buildContextMarkdown(context, raw) {
  return `# Release Review Context: ov25-ui@${context.nextVersion}

Status: raw context only
Bump: ${context.bump}
Current version: ${context.currentVersion}
Target version: ${context.nextVersion}
Base: ${context.baseRef} (${context.baseSha.slice(0, 12)})
Head: ${context.headRef} (${context.headSha.slice(0, 12)})
Branch: ${context.branch}
Generated: ${context.generatedAt}

This is deterministic release-review context for AI review. This file does not classify changes and does not contain final patch notes.

No release action has happened. This script did not bump versions, commit, tag, push, publish packages, or deploy Shopify/WooCommerce.

## Artifact Files

${Object.entries(context.artifacts).map(([name, file]) => `- ${name}: \`${file}\``).join('\n')}

## Package Artifact Safety

- ov25-ui package files: ${JSON.stringify(context.npmPackageSafety.ov25UiFiles)}
- ov25-setup package files: ${JSON.stringify(context.npmPackageSafety.ov25SetupFiles)}
- ov25-ui excludes release artifacts: ${context.npmPackageSafety.ov25UiExcludesReleaseArtifacts ? 'yes' : 'no'}
- ov25-setup excludes release artifacts: ${context.npmPackageSafety.ov25SetupExcludesReleaseArtifacts ? 'yes' : 'no'}

## Working Tree Status

\`\`\`text
${raw.status || 'None.'}
\`\`\`

## Committed Changes

### Commits

\`\`\`text
${raw.commits || 'None.'}
\`\`\`

### Diff Stat

\`\`\`text
${raw.diffStat || 'None.'}
\`\`\`

### Changed Files

\`\`\`text
${raw.changedFiles || 'None.'}
\`\`\`
`;
}

function writeArtifacts(context, raw, force) {
  const releaseDir = path.join(rootDir, context.artifacts.releaseDir);
  const contextPath = path.join(rootDir, context.artifacts.contextJson);

  if (fs.existsSync(contextPath) && !force) {
    throw new Error(`Release review context already exists: ${context.artifacts.contextJson}. Use --force to overwrite.`);
  }

  fs.mkdirSync(releaseDir, { recursive: true });
  writeJson(contextPath, context);
  writeFile(path.join(rootDir, context.artifacts.contextMarkdown), buildContextMarkdown(context, raw));
  writeFile(path.join(rootDir, context.artifacts.commits), `${raw.commits}\n`);
  writeFile(path.join(rootDir, context.artifacts.changedFiles), `${raw.changedFiles}\n`);
  writeFile(path.join(rootDir, context.artifacts.diffStat), `${raw.diffStat}\n`);
  writeFile(path.join(rootDir, context.artifacts.diffPatch), `${raw.diffPatch}\n`);
}

function printSummary(context, raw) {
  console.log(`Release review context: ov25-ui@${context.nextVersion}`);
  console.log(`Bump: ${context.bump}`);
  console.log(`Base: ${context.baseRef} (${context.baseSha.slice(0, 12)})`);
  console.log(`Head: ${context.headRef} (${context.headSha.slice(0, 12)})`);
  console.log(`Release dir: ${context.artifacts.releaseDir}`);
  console.log(`Committed files changed: ${lines(raw.changedFiles).length}`);
  console.log(`Working tree entries: ${lines(raw.status).length}`);
  console.log('No versions were bumped and no release action was taken.');
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  if (!args.bump || !allowedBumps.has(args.bump)) {
    throw new Error('Missing or invalid --bump. Expected patch, minor, or major.');
  }

  const { context, raw } = buildContext(args);

  if (args.dryRun) {
    console.log(buildContextMarkdown(context, raw));
    return;
  }

  writeArtifacts(context, raw, args.force);
  printSummary(context, raw);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  console.error('');
  console.error(usage());
  process.exit(1);
}
