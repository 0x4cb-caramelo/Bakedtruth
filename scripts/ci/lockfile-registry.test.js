/**
 * lockfile-registry.test.js — the registry check of scripts/ci/lockfile-registry.js on small lockfiles.
 *
 * Purpose: shows the check accepts what this repository's lockfiles hold (npmjs.org entries, workspaces, an
 *          empty URL under a pinned bunfig.toml) and refuses a mirror, a git or tarball source, a missing sha512
 *          and a registry setting that names another host.
 * Version: 0.1.0
 * Sprint:  16 (hardening)
 *
 * Run: node --test scripts/ci/lockfile-registry.test.js
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { checkBunLock, checkPackageLock, checkBunfig, checkNpmrc, parseJsonc } = require('./lockfile-registry.js');

const SHA512 = `sha512-${'A'.repeat(86)}==`;
const bunLock = (packages) => `{\n  "lockfileVersion": 1,\n  "packages": {\n${packages.join(',\n')},\n  },\n}\n`;

test('bun.lock text with trailing commas parses, commas inside strings kept', () => {
  assert.deepEqual(parseJsonc('{ "a": ["x,]", "y",], "b": { "c": 1, }, }'), { a: ['x,]', 'y'], b: { c: 1 } });
});

test('bun.lock: workspaces, the default registry and npmjs.org URLs pass', () => {
  const text = bunLock([
    '    "@brot/sdk": ["@brot/sdk@workspace:packages/sdk"]',
    `    "zod": ["zod@4.6.5", "", {}, "${SHA512}"]`,
    `    "ms": ["ms@2.1.3", "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz", {}, "${SHA512}"]`,
  ]);
  assert.deepEqual(checkBunLock(text), []);
});

test('bun.lock: a mirror, a git source and a missing sha512 are refused', () => {
  const text = bunLock([
    `    "ms": ["ms@2.1.3", "https://registry.npmmirror.com/ms/-/ms-2.1.3.tgz", {}, "${SHA512}"]`,
    '    "x": ["x@github:someone/x#abc", { "dependencies": {} }, "someone-x-abc"]',
    '    "y": ["y@1.0.0", "", {}, "sha1-abc="]',
  ]);
  const problems = checkBunLock(text);
  assert.equal(problems.length, 3);
  assert.match(problems[0], /npmmirror/);
  assert.match(problems[2], /no sha512/);
});

test('package-lock.json: npmjs.org with sha512 passes; anything else is refused', () => {
  const lock = (packages) => JSON.stringify({ lockfileVersion: 3, packages });
  const good = { resolved: 'https://registry.npmjs.org/metro/-/metro-0.87.1.tgz', integrity: SHA512 };
  assert.deepEqual(checkPackageLock(lock({ '': {}, 'node_modules/metro': good }), 'p.json'), []);
  const bad = {
    'node_modules/a': { resolved: 'https://registry.npmmirror.com/a/-/a-1.0.0.tgz', integrity: SHA512 },
    'node_modules/b': { resolved: 'git+ssh://git@github.com/x/b.git#abc' },
    'node_modules/c': { resolved: 'https://registry.npmjs.org/c/-/c-1.0.0.tgz', integrity: 'sha1-abc=' },
    'node_modules/d': { link: true, resolved: '../d' },
  };
  assert.equal(checkPackageLock(lock(bad), 'p.json').length, 3);
});

test('bunfig.toml and .npmrc must name npmjs.org only', () => {
  assert.deepEqual(checkBunfig('# a comment\n[install]\nregistry = "https://registry.npmjs.org"\n'), []);
  assert.equal(checkBunfig('[install]\nregistry = "https://registry.npmmirror.com"\n').length, 2);
  assert.equal(checkBunfig('[install]\n').length, 1);
  assert.deepEqual(checkNpmrc('# pinned\nregistry=https://registry.npmjs.org/\n', '.npmrc'), []);
  assert.equal(checkNpmrc('@x:registry=https://npm.example.com/\n', '.npmrc').length, 1);
});
