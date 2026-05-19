#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const repoRoot = resolve(process.argv[2] ?? process.cwd());
const srcRoot = join(repoRoot, 'src');
const definitionsPath = join(srcRoot, 'lib/strings/string-keys.ts');

const skipDirs = new Set(['node_modules', 'dist', '.git', '.codex']);
const sourceExtensions = new Set(['.ts', '.tsx']);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (skipDirs.has(entry)) continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    const ext = fullPath.slice(fullPath.lastIndexOf('.'));
    if (sourceExtensions.has(ext)) files.push(fullPath);
  }
  return files;
}

function lineNumber(source, index) {
  return source.slice(0, index).split('\n').length;
}

function collectDefinitionKeys(source) {
  const keys = new Set();
  const keyRegex = /\bkey:\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = keyRegex.exec(source))) {
    keys.add(match[1]);
  }
  return keys;
}

function collectGetStringUsages(files) {
  const usages = [];
  const usageRegex = /\bgetString\(\s*['"`]([^'"`]+)['"`]/g;

  for (const file of files) {
    if (file === definitionsPath) continue;
    const source = readFileSync(file, 'utf8');
    let match;
    while ((match = usageRegex.exec(source))) {
      usages.push({
        key: match[1],
        file,
        line: lineNumber(source, match.index),
      });
    }
  }

  return usages;
}

function collectHardcodedCandidates(files) {
  const candidates = [];
  const attrRegex = /\b(?:placeholder|label)\s*=\s*(?:\{\s*)?['"`]([^'"`]*[A-Za-z][^'"`]*)['"`]/;
  const toastRegex = /\btoast\.(?:success|error|info|message|warning)\(\s*['"`]([^'"`]*[A-Za-z][^'"`]*)['"`]/;
  const jsxTextRegex = />\s*([^<>{}\n]*[A-Za-z][^<>{}\n]*)\s*</;
  const ignoredPathParts = [
    'src/lib/strings/',
    'src/types/',
    'src/lib/svgs/',
  ];
  const looksLikeCode = (text) =>
    /&&|\|\||=>|React\.|[=!<>]=|^\s*[=!<>]/.test(text) ||
    (text.includes('=') && !text.includes('${'));

  for (const file of files) {
    const relativePath = relative(repoRoot, file);
    if (ignoredPathParts.some((part) => relativePath.includes(part))) continue;

    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.includes('getString(')) return;
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
      if (trimmed.includes('className=')) return;

      const attrMatch = trimmed.match(attrRegex);
      const toastMatch = trimmed.match(toastRegex);
      const jsxTextMatch = trimmed.match(jsxTextRegex);
      const matched = attrMatch?.[1] ?? toastMatch?.[1] ?? jsxTextMatch?.[1];

      if (!matched) return;
      if (looksLikeCode(matched)) return;
      candidates.push({
        file,
        line: index + 1,
        text: matched.trim(),
      });
    });
  }

  return candidates;
}

if (!existsSync(definitionsPath)) {
  console.error(`Could not find ${relative(repoRoot, definitionsPath)}. Run from the ov25-ui repo root.`);
  process.exit(2);
}

const sourceFiles = walk(srcRoot);
const definitionKeys = collectDefinitionKeys(readFileSync(definitionsPath, 'utf8'));
const usages = collectGetStringUsages(sourceFiles);
const missingDefinitions = usages.filter((usage) => !definitionKeys.has(usage.key));
const hardcodedCandidates = collectHardcodedCandidates(sourceFiles);

if (missingDefinitions.length > 0) {
  console.error('Missing STRING_REPLACEMENT_DEFINITIONS entries:');
  for (const usage of missingDefinitions) {
    console.error(`- ${usage.key} at ${relative(repoRoot, usage.file)}:${usage.line}`);
  }
} else {
  console.log('OK: every getString key has a STRING_REPLACEMENT_DEFINITIONS entry.');
}

if (hardcodedCandidates.length > 0) {
  console.log('\nReview likely hardcoded customer-facing strings:');
  for (const candidate of hardcodedCandidates) {
    console.log(`- ${relative(repoRoot, candidate.file)}:${candidate.line} "${candidate.text}"`);
  }
  console.log('\nThis list is heuristic. Ignore internal-only strings and convert customer-facing copy.');
}

process.exit(missingDefinitions.length > 0 ? 1 : 0);
