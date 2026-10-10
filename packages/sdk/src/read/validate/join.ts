/**
 * Purpose: `checkJoin`, the SDK's mirror of `user_join_campaign`'s rules for the preview: from the
 *          campaign, the config, the baker's entry, the metric account and the chain's clock, the first
 *          refusal the program would return, or the return estimate the join will be checked against.
 *          Mirrors programs/brot-markets/src/instructions/entries/join_campaign.rs and join_lock.rs.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * Order, as the handler runs it after its slot checks: the metric account is the campaign's; `Open`;
 * before the entry close; the join lock (the reader's errors, `OutcomeKnowable`, then the price buffer);
 * the pause; the campaign's minimum entry; the entry total the client signs; the estimate.
 */
import { BrotRefusal, isRefusal, refuse } from "../errors";
import { OperatingLevel, ReaderKind, Side, Status } from "../constants";
import type { Campaign, Entry, GlobalConfig } from "../accounts";
import { entryTotal } from "../accounts";
import { joinBufferRefuses, joinPriceReading, outcomeKnowable } from "../knowable";
import { estimateReturnBps } from "../math/payout";
import type { FetchedAccount } from "../quote";
import type { ChainTime } from "../rpc";

export type JoinCheckInput = {
  campaign: Campaign;
  config: GlobalConfig;
  /** The baker's `Entry`, or `null` before the first join. */
  entry: Entry | null;
  metric: FetchedAccount;
  chain: ChainTime;
  side: Side;
  amount: bigint;
  /** What the client will sign; omit to learn the estimate first. */
  minReturnBps?: number;
  expectedEntryTotal?: bigint;
};

export type JoinCheck =
  | { ok: true; estimateBps: bigint; isFirst: boolean; expectedEntryTotal: bigint; joinIndex: number }
  | { ok: false; refusal: BrotRefusal };

function check(input: JoinCheckInput): Extract<JoinCheck, { ok: true }> {
  const { campaign, chain } = input;
  if (input.metric.address !== campaign.metricAccount) refuse("MetricAccountMismatch");
  if (campaign.status !== Status.Open) refuse("CampaignNotOpen");
  if (chain.unixTimestamp >= campaign.entriesCloseAt) refuse("EntriesClosed");
  if (outcomeKnowable(campaign, input.metric, chain)) refuse("OutcomeKnowable");
  if (campaign.kind === ReaderKind.PriceTouch) {
    if (joinBufferRefuses(campaign, joinPriceReading(campaign, input.metric, chain))) refuse("JoinBufferRefused");
  }
  if (input.config.operatingLevel !== OperatingLevel.Normal) refuse("JoinWhilePaused");
  if (input.amount < campaign.minEntryLamports) refuse("BelowCampaignMinEntry");
  const total = entryTotal(input.entry);
  if ((input.expectedEntryTotal ?? total) !== total) refuse("EntryTotalMismatch");
  const isFirst = (input.entry?.isFirst ?? false) || campaign.poolYes + campaign.poolNo === 0n;
  const [side, other] =
    input.side === Side.Yes ? [campaign.poolYes, campaign.poolNo] : [campaign.poolNo, campaign.poolYes];
  const estimateBps = estimateReturnBps({
    amount: input.amount,
    sideAfter: side + input.amount,
    other,
    prize: campaign.prizeLamports,
    feeBps: campaign.feeBps,
    oneSidedFeeBps: campaign.oneSidedFeeBps,
    creatorShareBps: campaign.creatorShareBps,
    isFirst,
  });
  if (estimateBps < BigInt(input.minReturnBps ?? 0)) refuse("ReturnBelowMinimum");
  return { ok: true, estimateBps, isFirst, expectedEntryTotal: total, joinIndex: input.entry?.joinCount ?? 0 };
}

/** The preview's verdict on a join: the estimate it will be checked against, or the program's refusal. */
export function checkJoin(input: JoinCheckInput): JoinCheck {
  try {
    return check(input);
  } catch (error) {
    if (isRefusal(error)) return { ok: false, refusal: error };
    throw error;
  }
}
