/**
 * Purpose: the pause and resume of the runbook (step 13), rehearsed on the fork: one team key pauses entries at once
 *          and a join is refused; the admin multisig, which the founder chose to leave without a time lock (M-1,
 *          2026-10-13), resumes them in the same minute, while the upgrade multisig keeps its 24-hour lock.
 * Version: 0.2.0 (the resume through the unlocked admin multisig is the path, no longer option B)
 * Sprint:  18 (mainnet), lane L18
 */
import { createNoopSigner, type Address, type KeyPairSigner } from "@solana/kit";

import { OperatingLevel, Side } from "@brot/sdk/read";
import { buildJoinCampaign, buildPauseEntries, buildResumeEntries } from "@brot/sdk/tx";

import { check, type Session } from "../devnet";
import { expectOk, expectRefusal, send } from "../validator/rpc";
import { execute, propose, type Multisig } from "./multisig";

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

/** `admin_resume_entries` proposed and executed at once by the admin multisig (no lock); the level read back. */
export async function resumeThrough(s: Session, admin: Multisig) {
  const ix = await buildResumeEntries({ admin: createNoopSigner(admin.vault) });
  await execute(s.rpc, admin, await propose(s.rpc, admin, { vault: [ix] }, "resume entries"));
  check((await s.config()).operatingLevel === OperatingLevel.Normal, "entries resumed by the admin multisig");
}
