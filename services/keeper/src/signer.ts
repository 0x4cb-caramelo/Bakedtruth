/**
 * Purpose: the keeper's signer, loaded from a keypair file named by KEEPER_KEYPAIR (the standard 64-byte JSON
 *          array). The file lives outside the repository; the keeper never writes it and never logs it.
 * Version: 0.1.0
 * Sprint:  06 (server and primary keeper), MVP happy path
 */
import { readFile } from "node:fs/promises";

import { createKeyPairSignerFromBytes, type KeyPairSigner } from "@solana/kit";

export async function loadKeeperSigner(path: string): Promise<KeyPairSigner> {
  const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
  if (
    !Array.isArray(parsed) ||
    parsed.length !== 64 ||
    !parsed.every((b) => Number.isInteger(b) && b >= 0 && b < 256)
  ) {
    throw new Error("the keeper keypair must be a 64-byte JSON array");
  }
  return createKeyPairSignerFromBytes(new Uint8Array(parsed));
}
