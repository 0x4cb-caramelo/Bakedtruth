/**
 * solana-keys.js — finds Solana secret keys by their structure in the lines a diff adds.
 *
 * Purpose: a Solana keypair is 64 bytes, a 32-byte seed and then the ed25519 public key of that seed. This
 *          decodes every 64-byte value the added lines hold (base58, hex, base64, a JSON byte array, also one
 *          spread over lines) and reports the ones whose second half is the public key of the first half. A
 *          transaction signature or a SHA-512 digest has the same length and never passes, so unlike a regex
 *          rule it needs no word naming a secret nearby.
 * Version: 0.1.0
 * Sprint:  16 (hardening), for scripts/ci-secret-scan.js
 *
 * A finding is a file and a label; the value is never returned or printed.
 */

'use strict';

const crypto = require('node:crypto');

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const B58_DIGIT = new Map([...B58].map((c, i) => [c, BigInt(i)]));

/** Bitcoin-alphabet base58 to bytes, or null for any other character. */
function base58(text) {
  let n = 0n;
  for (const c of text) {
    const digit = B58_DIGIT.get(c);
    if (digit === undefined) return null;
    n = n * 58n + digit;
  }
  const bytes = [];
  for (; n > 0n; n >>= 8n) bytes.push(Number(n & 0xffn));
  for (const c of text) {
    if (c !== '1') break;
    bytes.push(0);
  }
  return Buffer.from(bytes.reverse());
}

/** The 64 numbers of a JSON byte array, or null when one is above 255. */
function byteArray(text) {
  const values = text.match(/\d+/g).map(Number);
  return values.every((v) => v <= 255) ? Buffer.from(values) : null;
}

// DER prefix of a PKCS#8 Ed25519 private key; the 32-byte seed follows it.
const PKCS8_ED25519 = Buffer.from('302e020100300506032b657004220420', 'hex');

/** True when `bytes` is a 64-byte keypair: its last 32 bytes are the public key of its first 32. */
function isKeypair(bytes) {
  if (!bytes || bytes.length !== 64) return false;
  try {
    const der = Buffer.concat([PKCS8_ED25519, bytes.subarray(0, 32)]);
    const secret = crypto.createPrivateKey({ key: der, format: 'der', type: 'pkcs8' });
    const spki = crypto.createPublicKey(secret).export({ format: 'der', type: 'spki' });
    return spki.subarray(-32).equals(bytes.subarray(32));
  } catch {
    return false;
  }
}

// Each shape: a label, the pattern of a 64-byte value in it, and its decoder. Lookarounds keep a longer run of the
// same alphabet (a hash list, a base64 blob) from being cut into a candidate.
const SHAPES = [
  ['Solana keypair (base58)', /(?<![1-9A-HJ-NP-Za-km-z])[1-9A-HJ-NP-Za-km-z]{86,88}(?![1-9A-HJ-NP-Za-km-z])/g, base58],
  ['Solana keypair (hex)', /(?<![0-9A-Fa-f])[0-9A-Fa-f]{128}(?![0-9A-Fa-f])/g, (t) => Buffer.from(t, 'hex')],
  ['Solana keypair (base64)', /(?<![A-Za-z0-9+/])[A-Za-z0-9+/]{86}==/g, (t) => Buffer.from(t, 'base64')],
  ['Solana keypair (byte array)', /\[\s*(?:\d{1,3}\s*,\s*){63}\d{1,3}\s*\]/g, byteArray],
];

/** The text each file gains in a unified diff, its added lines joined, so a value split over lines is whole. */
function addedByFile(diff) {
  const added = new Map();
  let file = '(unknown)';
  for (const line of String(diff || '').split('\n')) {
    const header = line.match(/^\+\+\+ b\/(.+)$/);
    if (header) {
      file = header[1];
      continue;
    }
    if (!line.startsWith('+') || line.startsWith('+++')) continue;
    added.set(file, (added.get(file) || '') + line.slice(1) + '\n');
  }
  return added;
}

/** One finding ({ file, label }) per file and shape holding a keypair the diff adds. Removed lines never count. */
function findSolanaKeys(diff) {
  const findings = [];
  for (const [file, text] of addedByFile(diff)) {
    for (const [label, pattern, decode] of SHAPES) {
      for (const match of text.matchAll(pattern)) {
        if (isKeypair(decode(match[0]))) {
          findings.push({ file, label });
          break;
        }
      }
    }
  }
  return findings;
}

module.exports = { findSolanaKeys, isKeypair, addedByFile, base58 };
