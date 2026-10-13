/**
 * Purpose: the join lock (BR-06) as the program applies it, for a client that wants to know whether a
 *          join can still go in: `outcomeKnowable` per kind (the price band reaching the target on the
 *          sponsored account, the supply at the target, the locked liquidity at the target, the measured
 *          epoch started, a DBC curve completed) and the proximity buffer of a price campaign. Mirrors
 *          programs/brot-markets/src/readers/*.rs `outcome_knowable` and instructions/entries/join_rules.rs.
 * Version: 0.1.1 (the sixth kind's lock: the curve's stage at 1 or later)
 * Sprint:  05 (SDK)
 *
 * An unreadable metric account is a refusal with the reader's error, as at the join.
 */
import { refuse } from "./errors";
import { Direction, PRICE_RULES, ReaderKind } from "./constants";
import type { Campaign } from "./accounts";
import { bytesToHex } from "./bytes";
import { readLockedLiquidity, readMint } from "./chain/accounts";
import { curveGraduated, readCurvePool } from "./chain/dbc";
import { bandReachesTarget, minDistance, postedWithin, publishedWithin } from "./chain/price-rules";
import { readPriceUpdate, type PriceReading } from "./chain/price-update";
import { i128 } from "./math/integers";
import type { FetchedAccount } from "./quote";
import type { ChainTime } from "./rpc";

/** The campaign's price, read as the join reads it: Full, its feed, the stored exponent, fresh by time and slot. */
export function joinPriceReading(campaign: Campaign, metric: FetchedAccount, chain: ChainTime): PriceReading {
  const reading = readPriceUpdate(metric.owner, metric.data, bytesToHex(campaign.feedId));
  if (reading.exponent !== campaign.priceExponent) refuse("PriceExponentChanged");
  const fresh =
    publishedWithin(reading, chain.unixTimestamp, campaign.maxAge) &&
    postedWithin(reading, chain.slot, campaign.maxAge);
  if (!fresh) refuse("JoinPriceStale");
  return reading;
}

/**
 * True once the campaign's outcome can no longer change, or is already decided: the join refuses then
 * (`OutcomeKnowable`). The epoch kinds read nothing: the measured epoch has started or not.
 */
export function outcomeKnowable(campaign: Campaign, metric: FetchedAccount, chain: ChainTime): boolean {
  switch (campaign.kind) {
    case ReaderKind.PriceTouch:
      return bandReachesTarget(joinPriceReading(campaign, metric, chain), campaign.direction, campaign.target);
    case ReaderKind.SupplyAtMost:
      return readMint(metric.owner, metric.data).supply <= campaign.target;
    case ReaderKind.DammV2LockedAtLeast:
      return readLockedLiquidity(metric.owner, metric.data) >= campaign.target;
    case ReaderKind.StakePoolTvlAtLeast:
    case ReaderKind.StakeAtLeast:
      return chain.epoch >= campaign.epoch;
    case ReaderKind.DbcGraduated:
      return curveGraduated(readCurvePool(metric.owner, metric.data));
    default:
      return refuse("BadAccountData");
  }
}

/**
 * The proximity buffer (question 7): a price join is refused while the band's edge on the target's
 * side is less than 1% of the price from the target (`buffer_refuses`).
 */
export function joinBufferRefuses(campaign: Campaign, reading: PriceReading): boolean {
  const margin = minDistance(reading.price, PRICE_RULES.joinBufferBps);
  const gap =
    campaign.direction === Direction.Above
      ? i128(campaign.target - i128(reading.price + reading.conf))
      : i128(i128(reading.price - reading.conf) - campaign.target);
  return gap < margin;
}
