/**
 * Purpose: rows 2 and 3 of TP 3.4.10 (and the epoch kinds' part of row 5) for each of the six kinds:
 *          the metric account fits the kind and the target is neither met nor too close, refused with
 *          the program's errors in the program's order. Mirrors each reader's `validate_at_creation`
 *          (programs/brot-markets/src/readers/*.rs).
 * Version: 0.1.1 (the sixth kind, `DbcGraduated`, and the curve config it reads)
 * Sprint:  05 (SDK)
 */
import { refuse } from "../errors";
import { Direction, MIN_DISTANCE_BPS, PRICE_RULES, ReaderKind, WSOL_MINT } from "../constants";
import { i128 } from "../math/integers";
import { readLockedLiquidity, readMint, readStakePool, readVoteAccount } from "../chain/accounts";
import { curveGraduated, readCurveConfig, readCurvePool } from "../chain/dbc";
import { checkEpochForOpening, type EpochSchedule } from "../chain/epoch";
import { checkFreshAndTight, checkPriceTarget, minDistance, postedWithin } from "../chain/price-rules";
import { readPriceUpdate } from "../chain/price-update";

/** What a reader is handed at opening (`CreationContext`). */
export type KindContext = {
  kind: ReaderKind;
  /** The metric account as fetched; an absent account reads as owned by the System Program, empty. */
  metric: { address: string; owner: string; data: Uint8Array };
  /** The address the price kind requires: the sponsored account of the feed. */
  sponsoredAddress: string | null;
  feedId: Uint8Array;
  direction: Direction;
  target: bigint;
  /** The join-time price age the campaign will copy (`campaign_max_age`). */
  maxAge: number;
  epoch: bigint;
  deadlineAt: bigint;
  clock: { unixTimestamp: bigint; slot: bigint; epoch: bigint };
  epochSchedule: EpochSchedule;
  /** `StakeAtLeast`: the vote account's stake in the current epoch (RPC `getVoteAccounts`), when known. */
  voteStake: bigint | null;
  /** `DbcGraduated`: the account after the nine slots (the pool's `PoolConfig`) as fetched, or `null` when none. */
  curveConfig: { address: string; owner: string; data: Uint8Array } | null;
  /** `DbcGraduated`: the build's floor on the curve's threshold (`DBC_MIN_GRADUATION_LAMPORTS`). */
  dbcMinGraduationLamports: bigint;
};

/** Rows 2 and 3 for `ctx.kind`; returns the price exponent to store (0 for the other kinds). */
export function validateKind(ctx: KindContext): number {
  switch (ctx.kind) {
    case ReaderKind.PriceTouch:
      return validatePrice(ctx);
    case ReaderKind.SupplyAtMost:
      validateSupply(ctx);
      return 0;
    case ReaderKind.DammV2LockedAtLeast:
      validateAbove(readLockedLiquidity(ctx.metric.owner, ctx.metric.data), ctx.target, MIN_DISTANCE_BPS.damm);
      return 0;
    case ReaderKind.StakePoolTvlAtLeast:
      validateStakePool(ctx);
      return 0;
    case ReaderKind.StakeAtLeast:
      validateVoteStake(ctx);
      return 0;
    case ReaderKind.DbcGraduated:
      validateGraduation(ctx);
      return 0;
    default:
      return refuse("UnknownReaderKind");
  }
}

/** `price_touch::validate_at_creation`: the sponsored account, Full, fresh by slot then time, tight, target. */
function validatePrice(ctx: KindContext): number {
  if (ctx.metric.address !== ctx.sponsoredAddress) refuse("MetricAccountMismatch");
  const reading = readPriceUpdate(ctx.metric.owner, ctx.metric.data, ctx.feedId);
  if (!postedWithin(reading, ctx.clock.slot, ctx.maxAge)) refuse("PriceStale");
  const refusal = checkFreshAndTight(reading, ctx.clock.unixTimestamp, ctx.maxAge, PRICE_RULES.campaignMaxConfBps);
  if (refusal === "Stale") refuse("PriceStale");
  if (refusal === "NonPositive") refuse("PriceNonPositive");
  if (refusal === "ConfidenceTooWide") refuse("PriceConfidenceTooWide");
  checkPriceTarget(reading, ctx.direction, ctx.target, MIN_DISTANCE_BPS.price);
  return reading.exponent;
}

/** `spl_mint::validate_at_creation`. */
function validateSupply(ctx: KindContext): void {
  const mint = readMint(ctx.metric.owner, ctx.metric.data);
  if (mint.mintAuthorityLive) refuse("MintAuthorityLive");
  if (ctx.target < 0n) refuse("TargetUnreachable");
  if (mint.supply <= ctx.target) refuse("TargetAlreadyTouched");
  if (ctx.target > i128(mint.supply - minDistance(mint.supply, MIN_DISTANCE_BPS.supply))) refuse("TargetTooClose");
}

/** An "at least" target: not met, and at least the minimum distance above the current value. */
function validateAbove(current: bigint, target: bigint, bps: number): void {
  if (target <= current) refuse("TargetAlreadyTouched");
  if (target < i128(current + minDistance(current, bps))) refuse("TargetTooClose");
}

/** `stake_pool::validate_at_creation`: the pool, the epoch rule, a pool that still updates, the target. */
function validateStakePool(ctx: KindContext): void {
  const pool = readStakePool(ctx.metric.owner, ctx.metric.data);
  checkEpochForOpening(ctx.epoch, ctx.deadlineAt, ctx.clock, ctx.epochSchedule);
  if (pool.lastUpdateEpoch + 1n < ctx.clock.epoch) refuse("StakePoolNotUpdating");
  const current = pool.totalLamports > pool.lastEpochTotalLamports ? pool.totalLamports : pool.lastEpochTotalLamports;
  validateAbove(current, ctx.target, MIN_DISTANCE_BPS.stakePool);
}

/**
 * `vote_stake::validate_at_creation`: the vote account, the epoch rule, the target above the stake. The
 * program reads the stake by syscall; a client must pass it (RPC `getVoteAccounts`), or the check would
 * refuse less than the program does.
 */
function validateVoteStake(ctx: KindContext): void {
  readVoteAccount(ctx.metric.owner, ctx.metric.data);
  checkEpochForOpening(ctx.epoch, ctx.deadlineAt, ctx.clock, ctx.epochSchedule);
  if (ctx.voteStake === null) throw new RangeError("StakeAtLeast needs the vote account's current epoch stake");
  validateAbove(ctx.voteStake, ctx.target, MIN_DISTANCE_BPS.stake);
}

/**
 * `dbc_graduation::validate_at_creation`: the pool; its own config, priced in SOL, at least the floor; the target at
 * the threshold; a curve still open with at least 10% of the threshold missing. The program refuses a missing config
 * with `NotEnoughAccountKeys`, which has no code: the SDK's builder always passes it, so here it is the caller's error.
 */
function validateGraduation(ctx: KindContext): void {
  const pool = readCurvePool(ctx.metric.owner, ctx.metric.data);
  if (ctx.curveConfig === null) throw new RangeError("DbcGraduated needs the pool's config account");
  if (ctx.curveConfig.address !== pool.config) refuse("CurveConfigMismatch");
  const config = readCurveConfig(ctx.curveConfig.owner, ctx.curveConfig.data);
  if (config.quoteMint !== WSOL_MINT) refuse("CurveNotInSol");
  if (config.threshold < ctx.dbcMinGraduationLamports) refuse("CurveTooSmall");
  if (ctx.target !== config.threshold) refuse("TargetNotThreshold");
  if (curveGraduated(pool)) refuse("TargetAlreadyTouched");
  const missing = config.threshold - pool.quoteReserve;
  if (missing < minDistance(config.threshold, MIN_DISTANCE_BPS.dbc)) refuse("TargetTooClose");
}
