#!/usr/bin/env node
/**
 * lockfile-registry.js — every npm package this repository installs comes from registry.npmjs.org.
 *
 * Purpose: T15 moved bun.lock off registry.npmmirror.com at the opening of Sprint 02; this keeps it there, and
 *          holds the React Native check's lockfile to the same rule. bun.lock records a package from the default
 *          registry with an empty URL, so bunfig.toml must pin that default to npmjs.org; any other URL must be
 *          npmjs.org's; every package carries a sha512. tests/react-native/package-lock.json resolves every
 *          package from npmjs.org with a sha512; every tracked .npmrc names only npmjs.org.
 * Version: 0.1.0
 * Sprint:  16 (hardening), carried from Sprint 00's review (TP section 7.1)
 *
 * Usage: node scripts/ci/lockfile-registry.js   (from the repository root; exit 1 names each offending entry)
 */

'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

const REGISTRY = 'https://registry.npmjs.org/';
const fromRegistry = (url) => url === REGISTRY.slice(0, -1) || url.startsWith(REGISTRY);
const sha512 = (integrity) => typeof integrity === 'string' && /^sha512-[A-Za-z0-9+/]{86}==$/.test(integrity);

/** JSON with trailing commas (bun.lock's text format) as JSON: commas before } or ] are dropped outside strings. */
function parseJsonc(text) {
  let out = '';
  for (let i = 0, inString = false; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      out += c;
      if (c === '\\') out += text[++i];
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
      out += c;
    } else if (c === ',' && /^\s*[}\]]/.test(text.slice(i + 1, i + 64))) {
      continue;
    } else out += c;
  }
  return JSON.parse(out);
}

/** Problems in bunfig.toml: its [install] registry must be npmjs.org, and no URL in it may name another host. */
function checkBunfig(text) {
  const problems = [];
  const lines = text.split('\n').filter((l) => !/^\s*#/.test(l));
  if (!lines.some((l) => /^\s*registry\s*=\s*"https:\/\/registry\.npmjs\.org\/?"\s*$/.test(l))) {
    problems.push('bunfig.toml: [install] registry is not "https://registry.npmjs.org"');
  }
  for (const url of lines.join('\n').match(/https?:\/\/[^\s"']+/g) || []) {
    if (!fromRegistry(url.replace(/\/?$/, '/'))) problems.push(`bunfig.toml: names ${url}`);
  }
  return problems;
}

/** Problems in an .npmrc: every URL in it (a registry, a scoped registry) must be npmjs.org. */
function checkNpmrc(text, file) {
  const lines = text.split('\n').filter((l) => !/^\s*[#;]/.test(l));
  const urls = lines.join('\n').match(/https?:\/\/[^\s"']+/g) || [];
  return urls.filter((url) => !fromRegistry(url.replace(/\/?$/, '/'))).map((url) => `${file}: names ${url}`);
}

/** Problems in bun.lock: each package is a workspace, or comes from npmjs.org (empty URL or its URL) with a sha512. */
function checkBunLock(text) {
  const problems = [];
  for (const [name, entry] of Object.entries(parseJsonc(text).packages || {})) {
    if (entry.length === 1 && /@workspace:/.test(entry[0])) continue;
    const [spec, url, , integrity] = entry;
    if (typeof url !== 'string' || (url !== '' && !url.startsWith(REGISTRY))) {
      problems.push(`bun.lock: ${name} (${spec}) resolves from ${JSON.stringify(url)}`);
    } else if (!sha512(integrity)) {
      problems.push(`bun.lock: ${name} (${spec}) has no sha512 integrity`);
    }
  }
  return problems;
}

/** Problems in a package-lock.json (v2/v3): each package resolves from npmjs.org with a sha512. */
function checkPackageLock(text, file) {
  const problems = [];
  for (const [key, entry] of Object.entries(JSON.parse(text).packages || {})) {
    if (key === '' || entry.link) continue;
    if (typeof entry.resolved !== 'string' || !entry.resolved.startsWith(REGISTRY)) {
      problems.push(`${file}: ${key} resolves from ${JSON.stringify(entry.resolved)}`);
    } else if (!sha512(entry.integrity)) {
      problems.push(`${file}: ${key} has no sha512 integrity`);
    }
  }
  return problems;
}

/** Every problem in the tracked files; a lockfile kind nothing here checks is a problem too. */
function checkRepository(read = (f) => fs.readFileSync(f, 'utf8')) {
  const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  const base = (f) => f.split('/').pop();
  const problems = [];
  const counted = { 'bun.lock': 0, 'package-lock.json': 0, '.npmrc': 0 };
  for (const file of tracked) {
    const name = base(file);
    if (name === 'bun.lock') problems.push(...checkBunLock(read(file)));
    else if (name === 'package-lock.json') problems.push(...checkPackageLock(read(file), file));
    else if (name === '.npmrc') problems.push(...checkNpmrc(read(file), file));
    else if (['bun.lockb', 'yarn.lock', 'pnpm-lock.yaml', 'npm-shrinkwrap.json'].includes(name)) {
      problems.push(`${file}: a lockfile this check does not read`);
    } else continue;
    if (name in counted) counted[name]++;
  }
  if (!tracked.includes('bunfig.toml')) problems.push('bunfig.toml is missing: bun.lock would follow ~/.npmrc');
  else problems.push(...checkBunfig(read('bunfig.toml')));
  return { problems, counted };
}

if (require.main === module) {
  const { problems, counted } = checkRepository();
  if (problems.length > 0) {
    console.error(`lockfiles: ${problems.length} entries do not come from ${REGISTRY}\n`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  const summary = Object.entries(counted).map(([name, n]) => `${n} ${name}`);
  console.log(`lockfiles: every package resolves from ${REGISTRY} with a sha512 (${summary.join(', ')})`);
}

module.exports = { checkBunLock, checkPackageLock, checkBunfig, checkNpmrc, parseJsonc };
