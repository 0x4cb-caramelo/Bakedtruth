/**
 * Purpose: install the brot-markets binary on a surfnet at the id the program declares, with no
 *          keypair: its ProgramData account (naming an upgrade authority the caller holds) and its
 *          program account are written directly through `surfnet_setAccount`.
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution): the Surfpool run of the price reader
 *
 * `solana program deploy` lands wherever its keypair file points, and that file is gitignored: on a
 * fresh checkout it would hold a new key and the deploy would go to a random id while exiting 0 (the
 * agent-rails gate, 2026-09-17). A surfnet owns its ledger, so the program is placed where it lives.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

import { getAddressEncoder, type Address } from "@solana/kit";

import * as P from "../../tests/brot/program";
import { account, setAccount, type Rpc } from "./rpc";

/** `UpgradeableLoaderState`: tag 3 opens a ProgramData account, tag 2 a program account. */
const PROGRAM_DATA_TAG = 3;
const PROGRAM_TAG = 2;
/** u32 tag, u64 deployment slot, Option<Pubkey> authority: 4 + 8 + 1 + 32 bytes before the ELF. */
const PROGRAM_DATA_HEADER = 45;

export type Installed = { programData: Address; sha256: string; bytes: number };

/** Writes ProgramData (`authority` as its upgrade authority) then the program account, and checks both. */
export async function installProgram(rpc: Rpc, authority: Address, soPath = P.PROGRAM_SO): Promise<Installed> {
  if (!existsSync(soPath)) throw new Error(`${soPath} is missing: run \`bun run build:program\` first`);
  const elf = new Uint8Array(readFileSync(soPath));
  const sha256 = createHash("sha256").update(elf).digest("hex");
  const programData = await P.programDataPda();
  const key = getAddressEncoder();

  const data = new Uint8Array(PROGRAM_DATA_HEADER + elf.length);
  const view = new DataView(data.buffer);
  view.setUint32(0, PROGRAM_DATA_TAG, true);
  view.setBigUint64(4, 0n, true);
  data[12] = 1;
  data.set(key.encode(authority), 13);
  data.set(elf, PROGRAM_DATA_HEADER);
  const rent = async (size: number) => BigInt(await rpc.call<number>("getMinimumBalanceForRentExemption", [size]));
  await setAccount(rpc, programData, { lamports: await rent(data.length), data, owner: P.LOADER_V3_ID });

  const program = new Uint8Array(36);
  new DataView(program.buffer).setUint32(0, PROGRAM_TAG, true);
  program.set(key.encode(programData), 4);
  const lamports = await rent(program.length);
  await setAccount(rpc, P.PROGRAM_ID, { lamports, data: program, owner: P.LOADER_V3_ID, executable: true });

  const installed = await account(rpc, P.PROGRAM_ID);
  if (!installed?.executable || installed.owner !== P.LOADER_V3_ID) {
    throw new Error(`${P.PROGRAM_ID} is not an executable loader-v3 program after the install`);
  }
  const written = await account(rpc, programData);
  const recorded = Buffer.from(written?.data.subarray(13, PROGRAM_DATA_HEADER) ?? []);
  if (written?.data.length !== data.length || !recorded.equals(Buffer.from(key.encode(authority)))) {
    throw new Error(`ProgramData ${programData} does not hold the binary and the upgrade authority`);
  }
  return { programData, sha256, bytes: elf.length };
}
