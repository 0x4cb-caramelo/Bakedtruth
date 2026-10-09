/**
 * Purpose: keypairs for the ops scripts: read a Solana CLI keypair file (64-byte JSON array) into a Kit signer,
 *          write a throwaway one for a local rehearsal, and derive a stable wallet from a parent key and a role,
 *          so an interrupted devnet run reuses the same wallets and loses no SOL.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * Keys live on the machine of whoever runs a script, in files named by environment variables (TP §11:
 * DEVNET_WALLET, TEAM_KEYPAIR); never in the repository, never printed. Only public keys are logged.
 */
import { createHash, getRandomValues } from "node:crypto";
import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";

import {
  createKeyPairSignerFromBytes,
  createKeyPairSignerFromPrivateKeyBytes,
  getAddressEncoder,
  type KeyPairSigner,
} from "@solana/kit";

/** `~/...` expanded, so env vars can name keys under the home folder. */
export const expandHome = (path: string) => (path.startsWith("~/") ? `${homedir()}${path.slice(1)}` : path);

/** The 64 bytes of a Solana CLI keypair file (secret seed, then public key). */
export function readKeypairBytes(path: string): Uint8Array {
  const parsed = JSON.parse(readFileSync(expandHome(path), "utf8"));
  if (!Array.isArray(parsed) || parsed.length !== 64) throw new Error(`${path} is not a 64-byte keypair file`);
  return Uint8Array.from(parsed);
}

/** A signer from a keypair file; the file's public half must match its secret (Kit checks it). */
export const loadKeypair = (path: string): Promise<KeyPairSigner> =>
  createKeyPairSignerFromBytes(readKeypairBytes(path));

/** The keypair file named by `variable`, or a clear error naming the variable (never its value's content). */
export async function keypairFromEnv(variable: string, fallback?: string): Promise<KeyPairSigner> {
  const path = process.env[variable] ?? fallback;
  if (!path) throw new Error(`${variable} is not set: point it at your own keypair file`);
  return loadKeypair(path);
}

/** A signer from a 32-byte seed, and the 64-byte file content for it (seed then public key). */
async function fromSeed(seed: Uint8Array): Promise<{ signer: KeyPairSigner; bytes: Uint8Array }> {
  const signer = await createKeyPairSignerFromPrivateKeyBytes(seed, true);
  const bytes = new Uint8Array(64);
  bytes.set(seed);
  bytes.set(getAddressEncoder().encode(signer.address), 32);
  return { signer: await createKeyPairSignerFromBytes(bytes), bytes };
}

/** A throwaway keypair written to `path` (mode 0600) for a local rehearsal; returns its signer. */
export async function writeThrowawayKeypair(path: string): Promise<KeyPairSigner> {
  const { signer, bytes } = await fromSeed(getRandomValues(new Uint8Array(32)));
  writeFileSync(path, JSON.stringify(Array.from(bytes)));
  chmodSync(path, 0o600);
  return signer;
}

/** A wallet derived from `parent`'s keypair file and `role`: the same on every run, so funds are never lost. */
export async function derivedSigner(parentPath: string, role: string): Promise<KeyPairSigner> {
  const parent = readKeypairBytes(parentPath);
  const seed = createHash("sha256").update(parent).update(`brot-ops:${role}`).digest();
  return (await fromSeed(new Uint8Array(seed))).signer;
}
