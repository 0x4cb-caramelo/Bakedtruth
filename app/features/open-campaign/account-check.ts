/**
 * Purpose: the account check of the creation box (D-i: any address; TP §3.4.10 rows 2 and 4), live, through the SDK's
 *          copies of the program's readers, owner first and then the layout: a classic SPL mint with its authority
 *          revoked, a Meteora DAMM v2 pool, an SPL stake pool that still updates, a vote account; for the price kind,
 *          each listed feed's sponsored account, owned by the upgraded Pyth receiver, fully verified, fresh within the
 *          campaign's maximum age and with a confidence band of at most 0.5% of the price; for a graduation campaign, a
 *          Meteora DBC pool and the config it names, priced in SOL, of 85 SOL or more, still open and at least 10% short
 *          of its threshold. Then the value read now and "if resolved now: YES/NO", the way the program would read it.
 *          Pure: the box passes what it read.
 * Version: 0.2.0 (the sixth kind's curve)
 * Sprint:  19 (site: open a campaign); the sixth kind's site
 */
import {
  bandCrossesTarget,
  checkFreshAndTight,
  curveGraduated,
  DBC_MIN_GRADUATION_LAMPORTS,
  Direction,
  isRefusal,
  MIN_DISTANCE_BPS,
  minDistance,
  postedWithin,
  PRICE_RULES,
  readCurveConfig,
  readCurvePool,
  readLockedLiquidity,
  readMint,
  readPriceUpdate,
  readStakePool,
  readVoteAccount,
  WSOL_MINT,
  type BrotErrorName,
  type ChainTime,
  type FetchedAccount,
  type PriceReading,
} from "@brot/sdk/read";

import type { KindName } from "../campaign-page/proof";

/** Row 4's answer for one feed now. */
export type FeedState =
  { ok: true; reading: PriceReading; ageSeconds: bigint } | { ok: false; problem: BrotErrorName | "missing" };

const PRICE_PROBLEM = {
  Stale: "PriceStale",
  NonPositive: "PriceNonPositive",
  ConfidenceTooWide: "PriceConfidenceTooWide",
};

/** A feed's sponsored account as the price reader checks it at opening (`price_touch::validate_at_creation`). */
export function feedState(
  account: FetchedAccount | null,
  feedHex: string,
  clock: ChainTime,
  maxAge: number,
): FeedState {
  if (!account) return { ok: false, problem: "missing" };
  try {
    const reading = readPriceUpdate(account.owner, account.data, feedHex);
    if (!postedWithin(reading, clock.slot, maxAge)) return { ok: false, problem: "PriceStale" };
    const refusal = checkFreshAndTight(reading, clock.unixTimestamp, maxAge, PRICE_RULES.campaignMaxConfBps);
    if (refusal) return { ok: false, problem: PRICE_PROBLEM[refusal] as BrotErrorName };
    return { ok: true, reading, ageSeconds: clock.unixTimestamp - reading.publishTime };
  } catch (error) {
    if (isRefusal(error)) return { ok: false, problem: error.errorName };
    throw error;
  }
}

/** A graduation campaign's curve as the box read it: its threshold (the campaign's target) and its stage. */
export type CurveRead = { threshold: bigint; stage: number };

/** The account slot's state for the other five kinds (spec 3.12: checking, accepted, refused, missing). */
export type AccountState =
  | { state: "ok"; value: bigint | null; measured: "now" | "at-epoch"; curve?: CurveRead }
  | { state: "refused"; refusal: BrotErrorName }
  | { state: "missing" };

/**
 * Rows 2's rules for `kind` on the account as read: what the reader refuses, or the value it reads now. The target
 * and the epoch are checked by the whole opening check (validateOpenCampaign), not here, but for a curve, whose target
 * is not typed: its threshold. `curveConfig`: the config the pool names, as read (`null` when it does not exist).
 */
export function accountState(
  kind: Exclude<KindName, "price">,
  account: FetchedAccount | null,
  epoch: bigint,
  curveConfig: FetchedAccount | null = null,
): AccountState {
  if (!account) return { state: "missing" };
  try {
    switch (kind) {
      case "burn": {
        const mint = readMint(account.owner, account.data);
        if (mint.mintAuthorityLive) return { state: "refused", refusal: "MintAuthorityLive" };
        return { state: "ok", value: mint.supply, measured: "now" };
      }
      case "lock":
        return { state: "ok", value: readLockedLiquidity(account.owner, account.data), measured: "now" };
      case "pool": {
        const pool = readStakePool(account.owner, account.data);
        if (pool.lastUpdateEpoch + 1n < epoch) return { state: "refused", refusal: "StakePoolNotUpdating" };
        const value =
          pool.totalLamports > pool.lastEpochTotalLamports ? pool.totalLamports : pool.lastEpochTotalLamports;
        return { state: "ok", value, measured: "at-epoch" };
      }
      case "stake":
        readVoteAccount(account.owner, account.data);
        // The epoch stake is read by a syscall in the measured epoch, not from the vote account's bytes.
        return { state: "ok", value: null, measured: "at-epoch" };
      case "curve":
        return curveState(account, curveConfig);
    }
  } catch (error) {
    if (isRefusal(error)) return { state: "refused", refusal: error.errorName };
    throw error;
  }
}

/**
 * `dbc_graduation::validate_at_creation` in its order, the target aside (the box sets it to the threshold): the pool, the
 * config it names (one not there reads as the System Program's, empty), priced in SOL, at least the 85 SOL floor of the
 * build the site talks to, a curve still open and at least 10% short of its threshold.
 */
function curveState(account: FetchedAccount, config: FetchedAccount | null): AccountState {
  const pool = readCurvePool(account.owner, account.data);
  if (!config) return { state: "refused", refusal: "ReaderWrongOwner" };
  const curve = readCurveConfig(config.owner, config.data);
  if (curve.quoteMint !== WSOL_MINT) return { state: "refused", refusal: "CurveNotInSol" };
  if (curve.threshold < DBC_MIN_GRADUATION_LAMPORTS.real) return { state: "refused", refusal: "CurveTooSmall" };
  if (curveGraduated(pool)) return { state: "refused", refusal: "TargetAlreadyTouched" };
  if (curve.threshold - pool.quoteReserve < minDistance(curve.threshold, MIN_DISTANCE_BPS.dbc))
    return { state: "refused", refusal: "TargetTooClose" };
  const read: CurveRead = { threshold: curve.threshold, stage: pool.stage };
  return { state: "ok", value: pool.quoteReserve, measured: "now", curve: read };
}

/** A graduation campaign's target once the account slot accepted its pool: the curve's threshold. */
export const curveTarget = (slot: { status: string; state?: AccountState }): bigint | null =>
  slot.state?.state === "ok" ? (slot.state.curve?.threshold ?? null) : null;

/** A curve's threshold from its config, a graduation campaign's target; `null` when the config does not read as one. */
export function curveThresholdOf(config: FetchedAccount | null): bigint | null {
  if (!config) return null;
  try {
    return readCurveConfig(config.owner, config.data).threshold;
  } catch (error) {
    if (isRefusal(error)) return null;
    throw error;
  }
}

/**
 * "If resolved now" (spec 3.12): what the program would record if it read the account now with this target; `null`
 * where a read now decides nothing (the epoch kinds, read at the measured epoch's start) or nothing is set yet.
 */
export function ifResolvedNow(a: {
  kind: KindName;
  target: bigint | null;
  direction: Direction;
  price: PriceReading | null;
  value: bigint | null;
}): "YES" | "NO" | null {
  if (a.target === null) return null;
  if (a.kind === "price") return a.price ? (bandCrossesTarget(a.price, a.direction, a.target) ? "YES" : "NO") : null;
  if (a.value === null || a.kind === "pool" || a.kind === "stake") return null;
  if (a.kind === "burn") return a.value <= a.target ? "YES" : "NO";
  return a.value >= a.target ? "YES" : "NO";
}

/** Burn targets fall, price targets fall when "below"; every other target rises. */
export const targetFalls = (kind: KindName, direction: Direction) =>
  kind === "burn" || (kind === "price" && direction === Direction.Below);
