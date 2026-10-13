/**
 * Purpose: who signs a mainnet deploy, held to Sprint 18's gate "the upgrade key was never in a file nor on an
 *          internet-connected machine": on mainnet the upgrade authority is a hardware wallet named by its Solana CLI
 *          URI (`usb://ledger?key=N`), a key file in its place is refused before any file is opened, and the device
 *          must show the public key the operator reviewed. The session payer (buffer writes and rents) may be a key
 *          file: it holds only what the plan spends and never any authority. On a fork rehearsal every signer is a
 *          throwaway key file, and a hardware URI is refused (no device signs for a fork).
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 *
 * The URI is handed to the Solana CLI, which talks to the device; nothing here reads a hardware key. The program
 * keypair is a file kept off the repository until the deploy lands (deploy/mainnet/README.md, "The program id").
 */
import { spawnSync } from "node:child_process";

import { address, type Address } from "@solana/kit";

import { PROGRAM_ID } from "@brot/sdk/read";

import { loadKeypair } from "../validator/keys";
import { checkKeypairLocation, checkProgramAddress } from "./checks";
import type { MainnetMode } from "./mainnet-cluster";

/** The Solana CLI's Ledger URIs: `usb://ledger`, optionally a wallet id and a derivation (`?key=0` or `?key=0/1`). */
const HARDWARE_URI = /^usb:\/\/ledger(\/[1-9A-HJ-NP-Za-km-z]{32,44})?(\?key=\d{1,3}(\/\d{1,3})?)?$/;

export const isHardwareUri = (value: string) => HARDWARE_URI.test(value);

/** A signer as the Solana CLI takes it (`uri`: a hardware URI or a key file path) and its public key. */
export type Signer = { uri: string; kind: "hardware" | "file"; address: Address };

/**
 * The upgrade authority. Mainnet: a hardware URI and the reviewed public key, which `confirmDevice` checks against
 * the device before anything is sent; a path is refused without being opened. Fork: a throwaway key file.
 */
export async function upgradeAuthority(
  mode: MainnetMode,
  spec: string | undefined,
  reviewedPubkey: string | undefined,
  root: string,
): Promise<Signer> {
  if (!spec) throw new Error("--upgrade-authority is required");
  if (mode === "mainnet") {
    if (!isHardwareUri(spec)) {
      throw new Error(
        "on mainnet the upgrade authority is a hardware wallet (usb://ledger?key=N): a key file never is",
      );
    }
    if (!reviewedPubkey) throw new Error("--upgrade-authority-pubkey is required: the device's key, as reviewed");
    return { uri: spec, kind: "hardware", address: address(reviewedPubkey) };
  }
  if (isHardwareUri(spec)) throw new Error("a fork rehearsal signs with throwaway key files, never a device");
  const real = checkKeypairLocation(spec, root, "upgrade authority (throwaway)");
  return { uri: real, kind: "file", address: (await loadKeypair(real)).address };
}

/** The public key the device shows for `signer.uri` (the operator approves on the device), equal to the reviewed one. */
export function confirmDevice(signer: Signer): void {
  if (signer.kind !== "hardware") return;
  const read = spawnSync("solana-keygen", ["pubkey", signer.uri], { encoding: "utf8" });
  const shown = (read.stdout ?? "").trim();
  if (read.status !== 0 || !shown) throw new Error(`the device at ${signer.uri} did not answer: plug it in, unlock it`);
  if (shown !== signer.address) {
    throw new Error(
      `the device's key is ${shown}, not the reviewed ${signer.address}: stopped before sending anything`,
    );
  }
  console.log(`  the device at ${signer.uri} holds the reviewed key ${shown}`);
}

/** The session payer: a key file outside every work tree, readable by its owner only; never the program id. */
export async function sessionPayer(spec: string | undefined, root: string): Promise<Signer> {
  if (!spec) throw new Error("--session-payer is required: the key file that pays the buffer's writes and the rents");
  const real = checkKeypairLocation(spec, root, "session payer");
  const found = (await loadKeypair(real)).address;
  if (found === PROGRAM_ID) throw new Error("the session payer is the program id itself: refusing");
  return { uri: real, kind: "file", address: found };
}

/** The program keypair, from its backup and at the declared id (an execute only: the dry run reads no secret). */
export async function programKeypair(spec: string | undefined, root: string): Promise<Signer> {
  if (!spec) throw new Error("--execute needs --program-keypair, the backup of the mainnet program id's keypair");
  const real = checkKeypairLocation(spec, root, "program keypair");
  const found = (await loadKeypair(real)).address;
  checkProgramAddress(found, PROGRAM_ID);
  return { uri: real, kind: "file", address: found };
}
