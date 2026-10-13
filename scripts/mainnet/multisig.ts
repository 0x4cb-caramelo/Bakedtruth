/**
 * Purpose: the multisig's acts in the rehearsal, each sent through the real Squads v4 program on the mainnet fork:
 *          create the 2-of-3 multisig, propose a vault transaction or a time-lock change, two members approve, and
 *          execute; and the time lock proven: an execute before it ends is refused (`TimeLockNotReleased`), one
 *          minute before it ends still refused, and the same execute lands once the fork's clock passes it.
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 *
 * The three members are throwaway keys standing for the partners' hardware wallets: what a device adds (the approval
 * on its screen) is not rehearsed here. Squads' errors are read from the logs, since a custom code alone does not
 * say whether Squads or the program it called refused.
 */
import {
  generateKeyPairSigner,
  getAddressDecoder,
  type Address,
  type Instruction,
  type KeyPairSigner,
} from "@solana/kit";

import { COMPUTE_BUDGET_PROGRAM_ID } from "@brot/sdk/read";

import * as S from "../deploy/mainnet-squads";
import { account, expectOk, send, type Rpc, type Sent } from "../validator/rpc";
import { travelTo } from "./fork";
import * as Q from "./squads";

export type Multisig = { multisig: Address; vault: Address; members: KeyPairSigner[] };
export type Proposal = { index: bigint; keys?: S.MessageKey[]; label: string };

const STATUS = ["Draft", "Active", "Rejected", "Approved", "Executing", "Executed", "Cancelled"];
const limit = (units: number): Instruction => ({
  programAddress: COMPUTE_BUDGET_PROGRAM_ID,
  data: Uint8Array.of(2, units & 0xff, (units >> 8) & 0xff, (units >> 16) & 0xff, units >>> 24),
});

/** A 2-of-3 multisig with `timeLock` seconds, created by the first member; its creation fee read from the fork. */
export async function createMultisig(rpc: Rpc, members: KeyPairSigner[], timeLock: number): Promise<Multisig> {
  const config = (await account(rpc, await S.programConfigAddress()))!.data;
  const fee = new DataView(config.buffer, config.byteOffset).getBigUint64(40, true);
  const treasury = getAddressDecoder().decode(config.subarray(48, 80));
  const createKey = await generateKeyPairSigner();
  const addresses = members.map((m) => m.address);
  const made = await Q.multisigCreate({
    createKey,
    creator: members[0],
    treasury,
    members: addresses,
    threshold: 2,
    timeLock,
  });
  expectOk(await send(rpc, members[0], [made.instruction]), "multisig_create_v2");
  const vault = await S.vaultAddress(made.multisig, 0);
  console.log(`  multisig ${made.multisig} (creation fee ${fee} lamports), vault ${vault}, time lock ${timeLock} s`);
  return { multisig: made.multisig, vault, members };
}

/** A proposal's status and the second it took it (`Approved` starts the time lock). */
export async function proposalStatus(rpc: Rpc, m: Multisig, index: bigint) {
  const data = (await account(rpc, await S.proposalAddress(m.multisig, index)))!.data;
  const kind = STATUS[data[48]];
  const stamped = kind !== "Executing";
  return { kind, at: stamped ? new DataView(data.buffer, data.byteOffset).getBigInt64(49, true) : null };
}

/** Creates the transaction (vault instructions, or a time-lock change), proposes it, and two members approve. */
export async function propose(
  rpc: Rpc,
  m: Multisig,
  act: { vault: Instruction[] } | { timeLock: number },
  label: string,
) {
  const [first, second] = m.members;
  const index = (await S.readMultisig(rpc, m.multisig)).transactionIndex + 1n;
  let keys: S.MessageKey[] | undefined;
  if ("vault" in act) {
    const message = S.compileVaultMessage(m.vault, act.vault);
    keys = message.keys;
    expectOk(await send(rpc, first, [await Q.vaultTransactionCreate(m.multisig, index, first, message.bytes)]), label);
  } else {
    expectOk(await send(rpc, first, [await Q.setTimeLockCreate(m.multisig, index, first, act.timeLock)]), label);
  }
  expectOk(await send(rpc, first, [await Q.proposalCreate(m.multisig, index, first)]), `${label}: proposal_create`);
  for (const member of [first, second]) {
    expectOk(await send(rpc, member, [await Q.proposalApprove(m.multisig, index, member)]), `${label}: approve`);
  }
  const status = await proposalStatus(rpc, m, index);
  if (status.kind !== "Approved") throw new Error(`${label}: the proposal is ${status.kind} after two approvals`);
  console.log(`  ${label}: transaction ${index} proposed and approved by 2 of 3 at ${status.at}`);
  return { index, keys, label } satisfies Proposal;
}

/** Executes an approved proposal (the first member signs); returns the transaction, refused or not. */
export async function tryExecute(rpc: Rpc, m: Multisig, p: Proposal): Promise<Sent> {
  const member = m.members[0];
  const run = p.keys
    ? await Q.vaultTransactionExecute(m.multisig, p.index, member, p.keys)
    : await Q.configTransactionExecute(m.multisig, p.index, member);
  return send(rpc, member, [limit(1_000_000), run]);
}

/** Throws unless `sent` failed in the Squads program itself with `name` (read from its logs). */
export function expectSquadsRefusal(sent: Sent, name: string, label: string) {
  if (sent.ok) throw new Error(`${label}: expected Squads' ${name}, but it executed`);
  if (!sent.logs.some((line) => line.includes(`Error Code: ${name}`))) {
    throw new Error(`${label}: expected Squads' ${name}, got ${sent.error}\n${sent.logs.join("\n")}`);
  }
  console.log(`  refused as expected (${label}): Squads ${name}`);
}

/** Executes at once (a multisig without a time lock), and checks the proposal is `Executed`. */
export async function execute(rpc: Rpc, m: Multisig, p: Proposal): Promise<Sent> {
  const sent = expectOk(await tryExecute(rpc, m, p), `${p.label}: execute`);
  const status = await proposalStatus(rpc, m, p.index);
  if (status.kind !== "Executed") throw new Error(`${p.label}: the proposal is ${status.kind} after execute`);
  console.log(`  ${p.label}: executed (${sent.signature.slice(0, 16)}…, ${sent.computeUnits} CU)`);
  return sent;
}

/** The time lock proven on `p`: refused now, refused a minute before it ends, executed once the clock passes it. */
export async function executeAfterLock(rpc: Rpc, m: Multisig, p: Proposal, lock: number): Promise<Sent> {
  const approvedAt = (await proposalStatus(rpc, m, p.index)).at!;
  expectSquadsRefusal(await tryExecute(rpc, m, p), "TimeLockNotReleased", `${p.label}, at once`);
  await travelTo(rpc, approvedAt + BigInt(lock) - 60n);
  expectSquadsRefusal(await tryExecute(rpc, m, p), "TimeLockNotReleased", `${p.label}, 60 s before the lock ends`);
  const now = await travelTo(rpc, approvedAt + BigInt(lock) + 1n);
  console.log(`  the fork's clock moved to ${now}: ${now - approvedAt} s after the approval`);
  return execute(rpc, m, p);
}
