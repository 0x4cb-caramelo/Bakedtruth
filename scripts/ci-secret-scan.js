#!/usr/bin/env node
/**
 * ci-secret-scan.js — runs the commit-time secret scan over a whole branch, in CI.
 *
 * Purpose: the pre-commit hook only protects commits made on a machine that has it wired.
 *          This scans every line a branch adds relative to its base, with the same patterns.
 * Version: 0.0.1
 * Sprint:  00 (setup)
 *
 * Usage:   node scripts/ci-secret-scan.js [base-ref]     (default: origin/main)
 * Exit 0 when nothing looks like a credential, 1 otherwise. Never prints the matched value.
 */

'use strict';

const { execFileSync } = require('node:child_process');
const { scan } = require('../.claude/hooks/block-secret-commit.js');

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

/** Everything a revision range adds, as { diff, files }. Renames count as additions. */
function added(args) {
  return {
    diff: git(['-c', 'core.quotepath=off', ...args, '--unified=0', '--no-renames']),
    files: lines(git(['-c', 'core.quotepath=off', ...args, '--name-only', '--diff-filter=d', '--no-renames'])),
  };
}

function main() {
  const base = baseRef(process.argv[2]);
  const commits = lines(git(['rev-list', '--no-merges', `${base}..HEAD`]));

  // Commit by commit: a secret added in one commit and removed in the next is gone from the
  // net diff but stays in history. Then the net diff, which also covers merge resolutions.
  const parts = commits.map((sha) => added(['show', '--format=', sha]));
  parts.push(added(['diff', `${base}...HEAD`]));

  const seen = new Set();
  const findings = [];
  for (const { diff, files } of parts) {
    for (const f of scan(diff, files)) {
      const key = `${f.file}::${f.label}`;
      if (EXEMPT.has(f.file) || seen.has(key)) continue;
      seen.add(key);
      findings.push(f);
    }
  }

  if (findings.length === 0) {
    console.log(`secret scan: clean (${commits.length} commits since ${base}, plus the net diff)`);
    return;
  }

  console.error('secret scan: this branch adds something that looks like a credential.\n');
  for (const f of findings) console.error(`  - ${f.file}: ${f.label}`);
  console.error('\nRemove the value, rotate the key if it was real, and see .claude/rules/secrets.md.');
  process.exit(1);
}

main();
