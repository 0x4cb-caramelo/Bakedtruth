#!/usr/bin/env node
/**
 * ci-secret-scan.js — runs the commit-time secret scan over a whole branch, in CI.
 *
 * Purpose: the pre-commit hook only protects commits made on a machine that has it wired.
 *          This scans every line a branch adds relative to its base, with the same patterns,
 *          plus the Solana keypair check, the file rules and gitleaks (scripts/ci/).
 * Version: 0.1.0
 * Sprint:  00 (setup); 16 (hardening) adds scripts/ci/solana-keys.js, scripts/ci/file-rules.js
 *          and gitleaks with .gitleaks.toml (scripts/ci/gitleaks.js)
 *
 * Usage:   node scripts/ci-secret-scan.js [base-ref] [--require-gitleaks]   (default: origin/main)
 * Exit 0 when nothing looks like a credential, 1 otherwise. Never prints the matched value.
 * Without gitleaks ($GITLEAKS_BIN or on the PATH) it says so and runs the rest; CI passes
 * --require-gitleaks, which makes a missing gitleaks, or another version than the pinned one, fail.
 */

'use strict';

const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { scan } = require('../.claude/hooks/block-secret-commit.js');
const { findSolanaKeys } = require('./ci/solana-keys.js');
const { forbiddenFiles, binaryPaths } = require('./ci/file-rules.js');
const { runGitleaks } = require('./ci/gitleaks.js');

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/** A push that creates a branch reports an all-zero "before"; fall back to the previous commit. */
function baseRef(arg) {
  if (!arg) return 'origin/main';
  return /^0+$/.test(arg) ? 'HEAD~1' : arg;
}

// The scanner's own test file holds one sample per pattern. Nothing else is exempt.
const EXEMPT = new Set(['scripts/test/hooks.test.js']);

const lines = (text) => text.split('\n').filter(Boolean);

/** Everything a revision range adds, as { diff, files, binaries }. Renames count as additions. */
function added(args) {
  const range = ['-c', 'core.quotepath=off', ...args];
  return {
    diff: git([...range, '--unified=0', '--no-renames']),
    files: lines(git([...range, '--name-only', '--diff-filter=d', '--no-renames'])),
    binaries: binaryPaths(git([...range, '--numstat', '--diff-filter=d', '--no-renames'])),
  };
}

function main() {
  const args = process.argv.slice(2);
  const requireGitleaks = args.includes('--require-gitleaks');
  const base = baseRef(args.find((a) => !a.startsWith('--')));
  const commits = lines(git(['rev-list', '--no-merges', `${base}..HEAD`]));

  // Commit by commit: a secret added in one commit and removed in the next is gone from the
  // net diff but stays in history. Then the net diff, which also covers merge resolutions.
  const parts = commits.map((sha) => added(['show', '--format=', sha]));
  parts.push(added(['diff', `${base}...HEAD`]));

  const seen = new Set();
  const findings = [];
  const record = (f) => {
    const key = `${f.file}::${f.label}`;
    if (EXEMPT.has(f.file) || seen.has(key)) return;
    seen.add(key);
    findings.push(f);
  };
  for (const { diff, files, binaries } of parts) {
    [...scan(diff, files), ...findSolanaKeys(diff), ...forbiddenFiles(files, binaries)].forEach(record);
  }

  // gitleaks reads the same commits from history, with the configuration at the repository root.
  let leaks;
  try {
    leaks = runGitleaks(base, { required: requireGitleaks, root: path.resolve(__dirname, '..') });
  } catch (error) {
    console.error(`secret scan: ${error.message}`);
    process.exit(1);
  }
  if (leaks) leaks.forEach(record);
  const gitleaks = leaks ? 'gitleaks over the same commits' : 'gitleaks NOT run: it is not installed here';

  if (findings.length === 0) {
    console.log(`secret scan: clean (${commits.length} commits since ${base}, plus the net diff; ${gitleaks})`);
    return;
  }

  console.error('secret scan: this branch adds something that looks like a credential.\n');
  for (const f of findings) console.error(`  - ${f.file}: ${f.label}`);
  console.error('\nRemove the value, rotate the key if it was real, and see .claude/rules/secrets.md.');
  process.exit(1);
}

main();
