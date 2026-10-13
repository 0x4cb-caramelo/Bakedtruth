/**
 * Purpose: `sponsor_join_campaign`, the sealed entry (Sprint 15; TP 3.4.12), built by the Codama client with
 *          every program address derived here: the sponsor's `Entry`, its next `Join`, its `SealedFee` and the
 *          sponsored SOL/USD account the program prices the entry with.
 * Version: 0.1.1 (the creation rules' version, red team L2)
 * Sprint:  15 (lane L15)
 *
 * A builder checks nothing a program rule decides: ../read/validate/sealed-entry.ts mirrors the sealed entry's
 * rules for the preview, ../read/sealed-quote.ts its charge, and the program decides (A-10).
 */
import type { Address, Instruction, TransactionSigner } from "@solana/kit";

import { getSponsorJoinCampaignInstruction } from "../idl/generated/instructions";
import { SOL_USD_ACCOUNT, type Side } from "../read/constants";
import { configAddress, entryAddress, joinAddress, sealedFeeAddress, vaultAddress } from "../read/pdas";

/**
 * `sponsor_join_campaign`. `joinIndex` is the sponsor's `join_count` before this entry (0 for the first), the same
 * count its plain joins use: a sealed entry and a plain join of one wallet share one `Entry`.
 */
export async function buildSponsorJoinCampaign(a: {
  sponsor: TransactionSigner;
  campaign: Address;
  /** The campaign's stored `metric_account`. */
  metricAccount: Address;
  side: Side;
  /** Whole US$: at least the config's `opening_fee_usd`. */
  entryUsd: bigint;
  /** The most lamports the entry and its fee may cost together at the SOL/USD price (rents apart). */
  maxLamports: bigint;
  /** The least return, in bps of the entry part, the sponsor accepts (the program refuses below it). */
  minReturnBps: number;
  /** The sponsor's entry total before this one, both sides: the retry guard (A-9). */
  expectedEntryTotal: bigint;
  /** `GlobalConfig.params_version` as read for the preview: the split and the floor the sponsor saw. */
  expectedParamsVersion: number;
  joinIndex: number;
}): Promise<Instruction> {
  return getSponsorJoinCampaignInstruction({
    sponsor: a.sponsor,
    config: await configAddress(),
    campaign: a.campaign,
    vault: await vaultAddress(a.campaign),
    entry: await entryAddress(a.campaign, a.sponsor.address),
    metricAccount: a.metricAccount,
    join: await joinAddress(a.campaign, a.sponsor.address, a.joinIndex),
    solUsdPrice: SOL_USD_ACCOUNT,
    sealedFee: await sealedFeeAddress(a.campaign, a.sponsor.address),
    side: a.side,
    entryUsd: a.entryUsd,
    maxLamports: a.maxLamports,
    minReturnBps: a.minReturnBps,
    expectedEntryTotal: a.expectedEntryTotal,
    expectedParamsVersion: a.expectedParamsVersion,
  });
}
