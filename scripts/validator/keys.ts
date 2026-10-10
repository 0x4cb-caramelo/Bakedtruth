/**
 * Purpose: keypairs for the ops scripts: read a Solana CLI keypair file (64-byte JSON array) into a Kit signer,
 *          check that a key file is fit to sign with, write a throwaway one for a local rehearsal, and derive a
 *          stable wallet from a parent key and a role, so an interrupted devnet run reuses the same wallets.
 * Version: 0.1.1
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * Keys live on the machine of whoever runs a script, in files named by environment variables (TP §11:
 * DEVNET_WALLET, TEAM_KEYPAIR) or flags; never in a repository, never printed. Only public keys are logged,
 * and a file that does not parse is named, never quoted (Sprint 05 deploy review, F6 and F7).
 */
import { spawnSync } from "node:child_process";
import { createHash, getRandomValues } from "node:crypto";
import { chmodSync, existsSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, sep } from "node:path";

import {
  createKeyPairSignerFromBytes,
  createKeyPairSignerFromPrivateKeyBytes,
  getAddressEncoder,
  type KeyPairSigner,
} from "@solana/kit";

/** `~/...` expanded, so env vars can name keys under the home folder. */
export const expandHome = (path: string) => (path.startsWith("~/") ? `${homedir()}${path.slice(1)}` : path);

/** The 64 bytes of a Solana CLI keypair file (secret seed, then public key). Never quotes the file. */
export function readKeypairBytes(path: string): Uint8Array {
  if (!existsSync(expandHome(path))) throw new Error(`${path} does not exist`);
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(readFileSync(expandHome(path), "utf8"));
  } catch {
    // The parser's message would quote the file's content; a secret saved by mistake must not be printed.
  }
  const bytes =
    Array.isArray(parsed) && parsed.length === 64 && parsed.every((b) => Number.isInteger(b) && b >= 0 && b <= 255);
  if (!bytes) throw new Error(`${path} is not a Solana CLI keypair file (a JSON array of 64 numbers)`);
  return Uint8Array.from(parsed as number[]);
}

/** True when `dir` is inside a Git work tree: this repository, a sibling worktree, or any other. */
export function insideGitWorkTree(dir: string): boolean {
  const result = spawnSync("git", ["-C", dir, "rev-parse", "--is-inside-work-tree"], { encoding: "utf8" });
  return result.status === 0 && result.stdout.trim() === "true";
}

/**
 * A key file fit to sign with: it exists, it is not cargo-build-sbf's throwaway under target/deploy/, it sits in
 * no Git work tree (so it can never be committed), and only its owner can read it. Returns the resolved path,
 * the one to use from then on.
 */
export function checkKeyFile(path: string, label: string): string {
  if (!existsSync(expandHome(path))) throw new Error(`${label} ${path} does not exist`);
  const real = realpathSync(expandHome(path));
  if (real.split(sep).join("/").includes("/target/deploy/")) {
    throw new Error(`refusing the ${label} under target/deploy/ (${real}): use the backup`);
  }
  if (insideGitWorkTree(dirname(real))) {
    throw new Error(`refusing the ${label} inside a Git work tree (${real}): keep keys outside every repository`);
  }
  if ((statSync(real).mode & 0o077) !== 0) throw new Error(`the ${label} ${real} is readable by others: chmod 600 it`);
  return real;
}

/** A signer from a keypair file; the file's public half must match its secret (Kit checks it). */
export const loadKeypair = (path: string): Promise<KeyPairSigner> =>
  createKeyPairSignerFromBytes(readKeypairBytes(path));

/** The keypair file named by `variable`, checked as a key file, or a clear error naming the variable. */
export async function keypairFromEnv(variable: string, fallback?: string): Promise<KeyPairSigner> {
  const path = process.env[variable] ?? fallback;
  if (!path) throw new Error(`${variable} is not set: point it at your own keypair file`);
  return loadKeypair(checkKeyFile(path, variable));
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
