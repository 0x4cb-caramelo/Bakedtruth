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

function main() {
  const base = baseRef(process.argv[2]);
  const range = `${base}...HEAD`;
  const diff = git(['diff', '--unified=0', range]);
  const changed = git(['diff', '--name-only', '--diff-filter=AM', range]).split('\n').filter(Boolean);
  const findings = scan(diff, changed);

  if (findings.length === 0) {
    console.log(`secret scan: clean (${changed.length} files changed since ${base})`);
    return;
  }

  console.error('secret scan: this branch adds something that looks like a credential.\n');
  for (const f of findings) console.error(`  - ${f.file}: ${f.label}`);
  console.error('\nRemove the value, rotate the key if it was real, and see .claude/rules/secrets.md.');
  process.exit(1);
}

main();
