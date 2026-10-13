/**
 * Purpose: who acts in the mainnet rehearsal, all throwaway and funded on the fork only: the session payer and the
 *          stand-in for the deploy-day hardware wallet (key files, since the Solana CLI signs with them, in a private
 *          folder outside every Git work tree), the three multisig members, the three team keys, three bakers, a paid
 *          opener and a resolver (in memory, never written); and the ops session the cycle helpers expect.
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 */
import { chmodSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { generateKeyPairSigner } from "@solana/kit";

import { configAddress, decodeGlobalConfig } from "@brot/sdk/read";

import type { Session } from "../devnet";
import { writeThrowawayKeypair } from "../validator/keys";
import { account, type Rpc } from "../validator/rpc";
import type { DeployKeys } from "./deploy";
import { fund } from "./fork";

const SOL = 1_000_000_000n;
const signers = (n: number) => Promise.all(Array.from({ length: n }, () => generateKeyPairSigner()));

/** The private folder for the two key files: MAINNET_REHEARSAL_KEYS, or a fresh one under the system's temp folder. */
export function keysFolder(): string {
  const dir = process.env.MAINNET_REHEARSAL_KEYS ?? mkdtempSync(join(tmpdir(), "brot-mainnet-keys-"));
  mkdirSync(dir, { recursive: true });
  chmodSync(dir, 0o700);
  return dir;
}

async function keyFile(dir: string, name: string) {
  const path = join(dir, `${name}.json`);
  return { path, signer: await writeThrowawayKeypair(path) };
}

/** Every actor, funded on the fork: the payer 20 SOL, the paid opener 30, the others 1 or 2. */
export async function makeActors(rpc: Rpc, dir: string) {
  const keys: DeployKeys = {
    dir,
    payer: await keyFile(dir, "session-payer"),
    hardware: await keyFile(dir, "hardware-stand-in"),
  };
  const [members, team, bakers, [opener, resolver]] = [
    await signers(3),
    await signers(3),
    await signers(3),
    await signers(2),
  ];
  await fund(rpc, keys.payer.signer.address, 20n * SOL);
  await fund(rpc, keys.hardware.signer.address, SOL);
  for (const s of [...members, ...team, ...bakers, resolver]) await fund(rpc, s.address, 2n * SOL);
  await fund(rpc, opener.address, 30n * SOL);
  return { keys, members, team, bakers, opener, resolver };
}

/** The session scripts/validator/cycle-open.ts expects, on the fork: the resolver pays, the first team key opens. */
export function forkSession(rpc: Rpc, a: Awaited<ReturnType<typeof makeActors>>, stop: () => void): Session {
  return {
    rpc,
    cluster: "local",
    payer: a.resolver,
    team: a.team[0],
    config: async () => decodeGlobalConfig((await account(rpc, await configAddress()))!),
    wallet: () => generateKeyPairSigner(),
    fund: (to, lamports) => fund(rpc, to, lamports),
    freshPrices: async () => {},
    stop,
  };
}
