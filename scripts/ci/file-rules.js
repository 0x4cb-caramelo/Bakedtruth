/**
 * file-rules.js — files a branch must not add, by name or by binary content.
 *
 * Purpose: beyond the commit hook's list (.env, keypair JSON, .pem, .key, .p12, .pfx), refuse Android and Java
 *          key stores, compiled binaries and archives by name, and any binary file that is not an image, a font
 *          or a captured test fixture. gitleaks skips the files git calls binary when it scans commits, and its
 *          default allowlist skips .bin, .exe and .dll everywhere, so this is where those are caught.
 * Version: 0.1.0
 * Sprint:  16 (hardening), for scripts/ci-secret-scan.js
 */

'use strict';

const NAME_RULES = [
  ['key store (keystore, jks, bks, kdbx, ppk)', /\.(?:keystore|jks|bks|kdbx|ppk)$/i],
  ['compiled binary (so, dylib, dll, exe, o, a, elf, wasm)', /\.(?:so|dylib|dll|exe|o|a|elf|wasm)$/i],
  ['archive (zip, tar, gz, 7z, jar, apk and the like)', /\.(?:zip|tar|tgz|gz|bz2|xz|zst|7z|rar|jar|apk|aab|ipa)$/i],
];

// The binary files this repository holds on purpose: images, fonts, and the mainnet accounts that
// scripts/capture-fixtures.ts writes to tests/fixtures (each one's SHA-256 is in tests/fixtures/index.json).
const BINARY_ALLOWED = [/\.(?:png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf)$/i, /^tests\/fixtures\/[^/]+\.bin$/];

/** `git --numstat` marks a binary file with "-\t-\t<path>"; returns those paths. */
function binaryPaths(numstat) {
  return String(numstat || '')
    .split('\n')
    .filter((line) => line.startsWith('-\t-\t'))
    .map((line) => line.slice(4));
}

/** Findings ({ file, label }) for the added `files` and the added `binaries` among them. */
function forbiddenFiles(files, binaries) {
  const findings = [];
  for (const file of files || []) {
    for (const [label, pattern] of NAME_RULES) if (pattern.test(file)) findings.push({ file, label });
  }
  for (const file of binaries || []) {
    if (NAME_RULES.some(([, pattern]) => pattern.test(file))) continue;
    if (BINARY_ALLOWED.some((pattern) => pattern.test(file))) continue;
    findings.push({ file, label: 'binary file (not an image, a font or a test fixture)' });
  }
  return findings;
}

module.exports = { forbiddenFiles, binaryPaths, NAME_RULES, BINARY_ALLOWED };
