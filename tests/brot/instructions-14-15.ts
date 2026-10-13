/**
 * Purpose: builders for the five instructions of Sprints 14 and 15, with the accounts in the order of
 *          programs/brot-markets/src/instructions/interface.rs. The program refuses each one with
 *          `UnknownInstruction` until its lane lands; the builders exist now so the IDL can be checked.
 * Version: 0.0.1
 * Sprint:  scaffold of Sprints 14–15, 2026-10-13 (the bodies are lanes L14A, L14B and L15's)
 */
import type { Address, Instruction, TransactionSigner } from "@solana/kit";

import { encode } from "./layouts";
import * as P from "./program";
import * as S from "./structs-14-15";
import { data, eventSlots, ix, ro, rw, signer } from "./instructions";

/** Lane L14A: the referee names its referrer, once, in a `ReferralLink` it pays the rent of. */
export async function userLinkReferrerIx(referee: TransactionSigner, referrer: Address): Promise<Instruction> {
  const args = encode(S.LINK_REFERRER_ARGS, { referrer });
  const accounts = [signer(referee, true), rw(await P.referralLinkPda(referee.address)), ro(P.SYSTEM_PROGRAM_ID)];
  return ix([...accounts, ...eventSlots()], data(P.IX.USER_LINK_REFERRER, args));
}

/**
 * Lane L14B: stage 1 of a contest, the reading run again. Any wallet, no signer slot. `proof` is the price kind's
 * proof; the other kinds do not read it, and it defaults to the metric account.
 */
export function rereadCampaignIx(campaign: Address, config: Address, metric: Address, proof = metric): Instruction {
  return ix([rw(campaign), rw(config), ro(metric), ro(proof), ...eventSlots()], data(P.IX.REREAD_CAMPAIGN));
}

/** Lane L14B: stage 2 of a contest, the admin's decision (`P.ContestDecision`). */
export function adminDecideContestIx(
  admin: TransactionSigner,
  config: Address,
  campaign: Address,
  args: { decision: number; voidReason: number; noteHash: Uint8Array },
): Instruction {
  const bytes = encode(S.DECIDE_CONTEST_ARGS, {
    decision: args.decision,
    void_reason: args.voidReason,
    note_hash: args.noteHash,
  });
  return ix([signer(admin), rw(config), rw(campaign), ...eventSlots()], data(P.IX.ADMIN_DECIDE_CONTEST, bytes));
}

export type SponsorJoinArgs = {
  side: number;
  entryUsd: bigint;
  maxLamports: bigint;
  minReturnBps?: number;
  expectedEntryTotal?: bigint;
  /** The Join account's index: the sponsor's `join_count` before this join (0 for the first). */
  joinIndex?: number;
};

/** Lane L15: a sealed entry. `metric` is the campaign's `metric_account`; `solUsd` the sponsored SOL/USD account. */
export async function sponsorJoinCampaignIx(
  sponsor: TransactionSigner,
  campaign: Address,
  metric: Address,
  a: SponsorJoinArgs,
  solUsd: Address = P.SOL_USD_ACCOUNT,
): Promise<Instruction> {
  const args = encode(S.SPONSOR_JOIN_ARGS, {
    side: a.side,
    entry_usd: a.entryUsd,
    max_lamports: a.maxLamports,
    min_return_bps: a.minReturnBps ?? 0,
    expected_entry_total: a.expectedEntryTotal ?? 0n,
  });
  const accounts = [signer(sponsor, true), ro(await P.configPda()), rw(campaign), rw(await P.vaultPda(campaign))];
  accounts.push(
    rw(await P.entryPda(campaign, sponsor.address)),
    ro(metric),
    rw(await P.joinPda(campaign, sponsor.address, a.joinIndex ?? 0)),
    ro(solUsd),
    rw(await P.sealedFeePda(campaign, sponsor.address)),
    ro(P.SYSTEM_PROGRAM_ID),
    ...eventSlots(),
  );
  return ix(accounts, data(P.IX.SPONSOR_JOIN_CAMPAIGN, args));
}

/** Lane L15: a sponsor's held fee settled once the campaign is finalized, and its `SealedFee` closed. Any wallet. */
export function settleSealedFeeIx(
  sealedFee: Address,
  campaign: Address,
  sponsor: Address,
  feeVault: Address,
): Instruction {
  return ix([rw(sealedFee), rw(campaign), rw(sponsor), rw(feeVault), ...eventSlots()], data(P.IX.SETTLE_SEALED_FEE));
}
