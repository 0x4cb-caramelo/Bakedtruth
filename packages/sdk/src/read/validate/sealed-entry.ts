/**
 * Purpose: `checkSealedEntry`, the SDK's mirror of `sponsor_join_campaign`'s rules for the preview (Sprint 15): from the
 *          campaign, the config, the sponsor's entry and SealedFee, the metric and SOL/USD accounts and the chain's
 *          clock, the first refusal the program would return, or the charge and the return estimate the sealed entry
 *          will be checked against. Mirrors programs/brot-markets/src/instructions/entries/sponsor_join_campaign.rs,
 *          join_core.rs, sealed_charge.rs and sealed_fee_account.rs, as checkJoin (./join.ts) mirrors the join.
 * Version: 0.1.1 (the creation rules' version, red team L2)
 * Sprint:  15 (lane L15)
 *
 * Order, as the handler runs it after its slot checks: the metric account is the campaign's; `Open`; before the entry
 * close; the join lock (the reader's errors, `OutcomeKnowable`, then the price buffer); the pause; the creation
 * rules' version the client signs (`CreationParamsChanged`); the charge (the floor, the SOL/USD account,
 * `max_lamports`); the SealedFee (an existing one is the sponsor's, on this campaign); the
 * campaign's minimum, on the entry part; the entry total the client signs; the estimate, on the entry part.
 */
import type { Address } from "@solana/kit";

import { AccountRefused, entryTotal, type Campaign, type Entry, type GlobalConfig, type RawAccount } from "../accounts";
import { OperatingLevel, PROGRAM_ID, ReaderKind, Side, Status } from "../constants";
import { BrotRefusal, isRefusal, refuse } from "../errors";
import { joinBufferRefuses, joinPriceReading, outcomeKnowable } from "../knowable";
import { estimateReturnBps } from "../math/payout";
import type { FetchedAccount } from "../quote";
import type { ChainTime } from "../rpc";
import { decodeSealedFee } from "../sealed-fee";
import { chargeSealedEntry, type SealedCharge } from "../sealed-quote";

export type SealedEntryCheckInput = {
  /** The campaign's address and its account, decoded. */
  campaignAddress: Address;
  campaign: Campaign;
  config: GlobalConfig;
  /** The signing sponsor. */
  sponsor: Address;
  /** The sponsor's `Entry`, or `null` before its first join or sealed entry. */
  entry: Entry | null;
  /** What is at the sponsor's SealedFee address, as fetched; `null` when nothing is there. */
  sealedFee: RawAccount | null;
  metric: FetchedAccount;
  solUsd: FetchedAccount;
  chain: ChainTime;
  side: Side;
  entryUsd: bigint;
  maxLamports: bigint;
  /** What the client will sign; omit to learn the estimate first. */
  minReturnBps?: number;
  expectedEntryTotal?: bigint;
  /** The creation rules' version the client will sign; omitted, the config's own. */
  expectedParamsVersion?: number;
};

export type SealedEntryCheck =
  | {
      ok: true;
      charge: SealedCharge;
      estimateBps: bigint;
      isFirst: boolean;
      expectedEntryTotal: bigint;
      joinIndex: number;
      /** The first sealed entry creates the SealedFee, with the sponsor's rent. */
      createsSealedFee: boolean;
    }
  | { ok: false; refusal: BrotRefusal };

/** The SealedFee at the sponsor's address: created when the program does not own it, else the sponsor's own. */
function createsSealedFee(input: SealedEntryCheckInput): boolean {
  const account = input.sealedFee;
  if (!account || account.owner !== PROGRAM_ID) return true;
  let stored;
  try {
    stored = decodeSealedFee(account);
  } catch (error) {
    if (error instanceof AccountRefused) refuse(error.problem);
    throw error;
  }
  if (stored.campaign !== input.campaignAddress || stored.sponsor !== input.sponsor) refuse("SealedFeeMismatch");
  return false;
}

function check(input: SealedEntryCheckInput): Extract<SealedEntryCheck, { ok: true }> {
  const { campaign, chain } = input;
  if (input.metric.address !== campaign.metricAccount) refuse("MetricAccountMismatch");
  if (campaign.status !== Status.Open) refuse("CampaignNotOpen");
  if (chain.unixTimestamp >= campaign.entriesCloseAt) refuse("EntriesClosed");
  if (outcomeKnowable(campaign, input.metric, chain)) refuse("OutcomeKnowable");
  if (campaign.kind === ReaderKind.PriceTouch) {
    if (joinBufferRefuses(campaign, joinPriceReading(campaign, input.metric, chain))) refuse("JoinBufferRefused");
  }
  if (input.config.operatingLevel !== OperatingLevel.Normal) refuse("JoinWhilePaused");
  const version = input.config.paramsVersion;
  if ((input.expectedParamsVersion ?? version) !== version) refuse("CreationParamsChanged");
  const charge = chargeSealedEntry({
    params: input.config.params,
    entryUsd: input.entryUsd,
    maxLamports: input.maxLamports,
    solUsd: input.solUsd,
    clock: chain,
  });
  const creates = createsSealedFee(input);
  if (charge.entry < campaign.minEntryLamports) refuse("BelowCampaignMinEntry");
  const total = entryTotal(input.entry);
  if ((input.expectedEntryTotal ?? total) !== total) refuse("EntryTotalMismatch");
  const isFirst = (input.entry?.isFirst ?? false) || campaign.poolYes + campaign.poolNo === 0n;
  const [side, other] =
    input.side === Side.Yes ? [campaign.poolYes, campaign.poolNo] : [campaign.poolNo, campaign.poolYes];
  const estimateBps = estimateReturnBps({
    amount: charge.entry,
    sideAfter: side + charge.entry,
    other,
    prize: campaign.prizeLamports,
    feeBps: campaign.feeBps,
    oneSidedFeeBps: campaign.oneSidedFeeBps,
    creatorShareBps: campaign.creatorShareBps,
    isFirst,
  });
  if (estimateBps < BigInt(input.minReturnBps ?? 0)) refuse("ReturnBelowMinimum");
  const joinIndex = input.entry?.joinCount ?? 0;
  return { ok: true, charge, estimateBps, isFirst, expectedEntryTotal: total, joinIndex, createsSealedFee: creates };
}

/** The preview's verdict on a sealed entry: its charge and the estimate it will be checked against, or the refusal. */
export function checkSealedEntry(input: SealedEntryCheckInput): SealedEntryCheck {
  try {
    return check(input);
  } catch (error) {
    if (isRefusal(error)) return { ok: false, refusal: error };
    throw error;
  }
}
