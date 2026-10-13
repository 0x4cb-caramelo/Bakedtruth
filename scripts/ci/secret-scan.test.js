/**
 * secret-scan.test.js — the Solana keypair check, the file rules and the gitleaks run of the CI secret scan.
 *
 * Purpose: shows each new check of scripts/ci-secret-scan.js catches what it is for and lets through what this
 *          repository holds on purpose (signatures in session logs, sha512 lockfile hashes, images, fixtures).
 *          Every key here is generated when the test runs and never written to the repository.
 * Version: 0.1.0
 * Sprint:  16 (hardening)
 *
 * Run: node --test scripts/ci/secret-scan.test.js. The gitleaks case runs when gitleaks is installed
 * ($GITLEAKS_BIN or the PATH) and is skipped otherwise; CI installs the pinned one first.
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { findSolanaKeys, isKeypair, base58 } = require('./solana-keys.js');
const { forbiddenFiles, binaryPaths } = require('./file-rules.js');
const { runGitleaks } = require('./gitleaks.js');

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function toBase58(bytes) {
  let n = BigInt(`0x${Buffer.from(bytes).toString('hex')}`);
  let text = '';
  for (; n > 0n; n /= 58n) text = B58[Number(n % 58n)] + text;
  for (const b of bytes) {
    if (b !== 0) break;
    text = `1${text}`;
  }
  return text;
}

/** A fresh keypair as solana-keygen lays it out: the seed, then the public key. */
function freshKeypair() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  const seed = privateKey.export({ format: 'der', type: 'pkcs8' }).subarray(-32);
  const pub = publicKey.export({ format: 'der', type: 'spki' }).subarray(-32);
  return { bytes: Buffer.concat([seed, pub]), privateKey };
}

const diffAdding = (file, text) =>
  `+++ b/${file}\n${text
    .split('\n')
    .map((l) => `+${l}`)
    .join('\n')}\n`;

test('a keypair is found in base58, hex, base64 and as a byte array, also one spread over lines', () => {
  const { bytes } = freshKeypair();
  assert.equal(isKeypair(bytes), true);
  assert.deepEqual(base58(toBase58(bytes)), bytes);
  const shapes = {
    'notes/a.md': `Phantom export: ${toBase58(bytes)}`,
    'notes/b.md': `0x${bytes.toString('hex')}`,
    'notes/c.md': `key: "${bytes.toString('base64')}"`,
    'notes/d.json': JSON.stringify([...bytes]),
    'notes/e.json': JSON.stringify([...bytes], null, 2),
  };
  const found = findSolanaKeys(
    Object.entries(shapes)
      .map(([f, t]) => diffAdding(f, t))
      .join(''),
  );
  assert.deepEqual(found.map((f) => f.file).sort(), Object.keys(shapes).sort());
  assert.ok(found.every((f) => f.label.startsWith('Solana keypair (') && !f.label.includes(toBase58(bytes))));
});

test('signatures, lockfile hashes and other 64-byte values are not keypairs', () => {
  const { privateKey } = freshKeypair();
  const signature = crypto.sign(null, Buffer.from('a devnet transaction'), privateKey);
  const sha512 = crypto.createHash('sha512').update('a tarball').digest();
  const text = [
    `- deploy: \`${toBase58(signature)}\``,
    `"integrity": "sha512-${sha512.toString('base64')}"`,
    `${sha512.toString('hex')}  some-file.tar.gz`,
    `${crypto.randomBytes(32).toString('hex')}  brot_markets.so`,
    JSON.stringify([...crypto.randomBytes(64)]),
  ].join('\n');
  assert.deepEqual(findSolanaKeys(diffAdding('session-log/x.md', text)), []);
});

test('removing a leaked keypair stays possible: removed lines never count', () => {
  const { bytes } = freshKeypair();
  assert.deepEqual(findSolanaKeys(`+++ b/a.env\n-WALLET=${toBase58(bytes)}\n`), []);
});

test('key stores, compiled binaries, archives and unexpected binary files are refused by name or content', () => {
  const files = ['app/release.jks', 'android/upload.keystore', 'lib/x.so', 'dist/app.zip', 'notes.txt', 'a.ts'];
  const binaries = ['android/upload.keystore', 'notes.txt', 'tests/fixtures/sol_usd.bin', 'app/public/logo.png'];
  const found = forbiddenFiles(files, binaries);
  assert.deepEqual(found.map((f) => f.file).sort(), [
    'android/upload.keystore',
    'app/release.jks',
    'dist/app.zip',
    'lib/x.so',
    'notes.txt',
  ]);
  assert.deepEqual(binaryPaths('-\t-\tnotes.txt\n3\t1\ta.ts\n'), ['notes.txt']);
});

test('a missing gitleaks fails only where it is required', () => {
  const saved = process.env.GITLEAKS_BIN;
  process.env.GITLEAKS_BIN = path.join(os.tmpdir(), 'no-such-gitleaks-binary');
  try {
    assert.equal(runGitleaks('HEAD~1', { required: false }), null);
    assert.throws(() => runGitleaks('HEAD~1', { required: true }), /gitleaks is required/);
  } finally {
    if (saved === undefined) delete process.env.GITLEAKS_BIN;
    else process.env.GITLEAKS_BIN = saved;
  }
});

// A throwaway repository: no signing, no hooks, whatever the machine's git configuration says.
const GIT_CONFIG = [
  '-c',
  'user.name=t',
  '-c',
  'user.email=t@t',
  '-c',
  'commit.gpgsign=false',
  '-c',
  'core.hooksPath=/dev/null',
];
const gitleaksInstalled = !spawnSync(process.env.GITLEAKS_BIN || 'gitleaks', ['version']).error;

test('gitleaks finds what a commit plants with the repository configuration', { skip: !gitleaksInstalled }, () => {
  const root = path.resolve(__dirname, '../..');
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'secret-scan-test-'));
  const git = (...args) => execFileSync('git', [...GIT_CONFIG, ...args], { cwd: repo });
  try {
    git('init', '-q', '-b', 'main');
    fs.writeFileSync(path.join(repo, 'README.md'), 'base\n');
    git('add', '.');
    git('commit', '-q', '-m', 'base');
    const base = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
    const url = `https://devnet.example-rpc.com/?api-key=${crypto.randomUUID()}`;
    fs.writeFileSync(path.join(repo, 'rpc.ts'), `export const RPC = "${url}";\n`);
    fs.writeFileSync(path.join(repo, 'id.txt'), `${JSON.stringify([...freshKeypair().bytes])}\n`);
    git('add', '.');
    git('commit', '-q', '-m', 'planted');
    const found = runGitleaks(base, { required: false, cwd: repo, root });
    assert.deepEqual(found.map((f) => f.label.split(' ')[1]).sort(), [
      'solana-keypair-json-array',
      'url-query-credential',
    ]);
    assert.ok(found.every((f) => !f.label.includes(url)));
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});
