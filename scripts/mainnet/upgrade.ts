/**
 * Purpose: an upgrade as it happens once the upgrade multisig holds the upgrade authority (runbook, "Upgrading"),
 *          rehearsed on the fork: the session payer writes a buffer, hands it to that multisig's vault, the multisig
 *          proposes the loader's `Upgrade` signed by the vault, its 24-hour lock (M-2) refuses it until it has run its
 *          course, and the upgraded bytes are read back equal to the binary. The same binary, so the program answers.
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 *
 * The loader takes `Upgrade` by CPI, which a Squads vault transaction is; it never takes `DeployWithMaxDataLen` that
 * way (agave v3.1.10 program-runtime/src/cpi.rs, `check_authorized_program`), which is why the first deploy is the
 * hardware wallet's and the handover follows it.
 */
import { join } from "node:path";

import { AccountRole, type Address, type Instruction } from "@solana/kit";

import { BPF_LOADER_UPGRADEABLE_ID, PROGRAM_ID, programDataAddress } from "@brot/sdk/read";

import * as L from "../deploy/mainnet-loader";
import { writeThrowawayKeypair } from "../validator/keys";
import { account, balance, type Rpc } from "../validator/rpc";
import type { Binary, DeployKeys } from "./deploy";
import { executeAfterLock, propose, type Multisig } from "./multisig";

const RENT_SYSVAR = "SysvarRent111111111111111111111111111111111" as Address;
const CLOCK_SYSVAR = "SysvarC1ock11111111111111111111111111111111" as Address;

/** The loader's `Upgrade` (tag 3): ProgramData, program, buffer, spill (the vault), the sysvars, the authority. */
async function upgradeIx(buffer: Address, vault: Address): Promise<Instruction> {
  const accounts = [
    { address: await programDataAddress(), role: AccountRole.WRITABLE },
    { address: PROGRAM_ID, role: AccountRole.WRITABLE },
    { address: buffer, role: AccountRole.WRITABLE },
    { address: vault, role: AccountRole.WRITABLE },
    { address: RENT_SYSVAR, role: AccountRole.READONLY },
    { address: CLOCK_SYSVAR, role: AccountRole.READONLY },
    { address: vault, role: AccountRole.READONLY_SIGNER },
  ];
  return { programAddress: BPF_LOADER_UPGRADEABLE_ID, accounts, data: Uint8Array.of(3, 0, 0, 0) };
}

/** The whole upgrade path, with the time lock proven on the proposal. */
export async function upgradeThroughMultisig(rpc: Rpc, k: DeployKeys, binary: Binary, m: Multisig, lock: number) {
  const before = await L.readProgram(rpc, PROGRAM_ID);
  const bufferKeypair = join(k.dir, "upgrade-buffer.json");
  const buffer = (await writeThrowawayKeypair(bufferKeypair)).address;
  const common = { payer: k.payer.path, url: rpc.url };
  L.runStep(L.writeBufferStep({ ...common, so: binary.path, bufferKeypair }), rpc.url);
  L.runStep(L.setBufferAuthorityStep({ ...common, buffer, newAuthority: m.vault }), rpc.url);
  await L.checkBuffer(rpc, buffer, { ...binary, authority: m.vault });
  const held = await balance(rpc, buffer);
  const vaultBefore = await balance(rpc, m.vault);
  const proposal = await propose(rpc, m, { vault: [await upgradeIx(buffer, m.vault)] }, "upgrade the program");
  await executeAfterLock(rpc, m, proposal, lock);
  // The loader drains an upgrade's buffer into the spill account and closes it: the evidence the upgrade ran. The
  // deploy slot is printed, not checked: Surfpool 1.5.0 recorded the same slot before and after (seen 2026-10-13).
  if (await account(rpc, buffer)) throw new Error(`the buffer ${buffer} is still open: no upgrade happened`);
  const spilled = (await balance(rpc, m.vault)) - vaultBefore;
  if (spilled < held) throw new Error(`the vault got ${spilled} lamports back, not the buffer's ${held}`);
  const after = await L.readProgram(rpc, PROGRAM_ID);
  await L.checkProgram(rpc, PROGRAM_ID, { ...binary, authority: m.vault });
  console.log(`  upgraded through the multisig: the buffer closed, its ${held} lamports back to the vault`);
  console.log(`  (ProgramData's deploy slot as the fork records it: ${before.slot} before, ${after.slot} after)`);
}
