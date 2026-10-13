/**
 * Purpose: the incident powers rehearsed on the fork (runbook step 13 and option B): one team key pauses entries at once
 *          and a join is refused; the multisig resumes them, after its time lock when it has one; and option B, the
 *          two-step handover of `admin` from the time-locked multisig to a second 2-of-3 multisig of the same members
 *          without a lock, after which a pause is resumed within the same minute while upgrades still wait.
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 */
import { createNoopSigner, type Address, type KeyPairSigner } from "@solana/kit";

import { OperatingLevel, Side } from "@brot/sdk/read";
import {
  buildAcceptAdmin,
  buildJoinCampaign,
  buildPauseEntries,
  buildResumeEntries,
  buildTransferAdmin,
  ZERO_ADDRESS,
} from "@brot/sdk/tx";

import { check, type Session } from "../devnet";
import { expectOk, expectRefusal, send } from "../validator/rpc";
import { createMultisig, execute, executeAfterLock, propose, type Multisig } from "./multisig";

/** A team key pauses; a first join by `baker` is then refused with `JoinWhilePaused`. */
export async function pauseAndRefuse(
  s: Session,
  teamKey: KeyPairSigner,
  baker: KeyPairSigner,
  campaign: Address,
  mint: Address,
) {
  expectOk(await send(s.rpc, teamKey, [await buildPauseEntries({ teamMember: teamKey })]), "team_pause_entries");
  const join = await buildJoinCampaign({
    baker,
    campaign,
    metricAccount: mint,
    side: Side.Yes,
    amount: (await s.config()).params.minEntryLamports,
    minReturnBps: 0,
    expectedEntryTotal: 0n,
    joinIndex: 0,
  });
  expectRefusal(await send(s.rpc, baker, [join]), "JoinWhilePaused", "a join while paused");
  check(true, `paused by one team key (${teamKey.address}) at once; a join is refused (JoinWhilePaused)`);
}

/** `admin_resume_entries` proposed by `m`, executed after `lock` seconds (at once when 0); the level read back. */
export async function resumeThrough(s: Session, m: Multisig, lock: number) {
  const ix = await buildResumeEntries({ admin: createNoopSigner(m.vault) });
  const proposal = await propose(s.rpc, m, { vault: [ix] }, "resume entries");
  if (lock > 0) await executeAfterLock(s.rpc, m, proposal, lock);
  else await execute(s.rpc, m, proposal);
  check((await s.config()).operatingLevel === OperatingLevel.Normal, "entries resumed by the multisig");
}

/** Option B: `admin` moves from `from` (time-locked) to a new multisig of the same members without a lock. */
export async function adminToUnlockedMultisig(s: Session, from: Multisig, lock: number): Promise<Multisig> {
  const to = await createMultisig(s.rpc, from.members, 0);
  const transfer = await buildTransferAdmin({ admin: createNoopSigner(from.vault), newAdmin: to.vault });
  await executeAfterLock(s.rpc, from, await propose(s.rpc, from, { vault: [transfer] }, "transfer admin"), lock);
  const pending = await s.config();
  check(
    pending.admin === from.vault && pending.pendingAdmin === to.vault,
    "step one: the new vault named, still pending",
  );
  const accept = await buildAcceptAdmin({ newAdmin: createNoopSigner(to.vault) });
  await execute(s.rpc, to, await propose(s.rpc, to, { vault: [accept] }, "accept admin"));
  const moved = await s.config();
  check(moved.admin === to.vault && moved.pendingAdmin === ZERO_ADDRESS, `step two: admin is ${to.vault}`);
  return to;
}
