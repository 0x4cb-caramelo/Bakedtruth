/**
 * Purpose: the proof a campaign page shows (BR-23; P1 §4.4): the value read now from the account the campaign reads,
 *          through the SDK's copy of the program's readers (owner first, then the layout), against the target, with
 *          "if read now". On a price campaign, the price facts the join applies: the price and its confidence, its
 *          publish time and posted slot, its age against the campaign's maximum age (30 s floor, Q4), whether a join
 *          would take it (fresh by time and by slot), and the 1% buffer near the target (question 7).
 * Version: 0.2.0 (the sixth kind: a Meteora DBC curve's raise against its threshold, ./curve.ts)
 * Sprint:  11 (site: campaign page and entry); the sixth kind's site
 */
import {
  bandCrossesTarget,
  bytesToHex,
  DAMM_V2_PROGRAM_ID,
  DBC_PROGRAM_ID,
  Direction,
  feedSymbol,
  isRefusal,
  joinBufferRefuses,
  postedWithin,
  publishedWithin,
  PYTH_RECEIVER_ID,
  readLockedLiquidity,
  readMint,
  readPriceUpdate,
  readStakePool,
  ReaderKind,
  SPL_TOKEN_PROGRAM_ID,
  STAKE_POOL_PROGRAM_ID,
  VOTE_PROGRAM_ID,
  type BrotErrorName,
  type Campaign,
  type ChainTime,
  type FetchedAccount,
} from "@brot/sdk/read";

import { curveFacts, curveIfReadNow, type CurveFacts } from "./curve";

export type KindName = "price" | "burn" | "lock" | "pool" | "stake" | "curve";

/** The site's name for each reader kind; `curve` is the sixth, a Meteora DBC launch curve's graduation. */
export const KIND_OF: Record<ReaderKind, KindName> = {
  [ReaderKind.PriceTouch]: "price",
  [ReaderKind.SupplyAtMost]: "burn",
  [ReaderKind.DammV2LockedAtLeast]: "lock",
  [ReaderKind.StakePoolTvlAtLeast]: "pool",
  [ReaderKind.StakeAtLeast]: "stake",
  [ReaderKind.DbcGraduated]: "curve",
};

/** The site's name for `kind`; throws for a byte no reader has (a program newer than this site). */
export function kindOf(kind: ReaderKind): KindName {
  const name = KIND_OF[kind] as KindName | undefined;
  if (name === undefined) throw new Error(`the site does not know the campaign kind ${kind}`);
  return name;
}

/** Per kind: the owner program the reader checks first, and the field it reads (TP §3.4.8). */
export const READER: Record<KindName, { owner: string; ownerId: string; field: string }> = {
  price: { owner: "Pyth receiver", ownerId: PYTH_RECEIVER_ID, field: "price (i64 at byte 73)" },
  burn: { owner: "SPL Token", ownerId: SPL_TOKEN_PROGRAM_ID, field: "supply (u64 at byte 36)" },
  lock: { owner: "Meteora DAMM v2", ownerId: DAMM_V2_PROGRAM_ID, field: "permanent_lock_liquidity (u128 at byte 552)" },
  pool: { owner: "SPL Stake Pool", ownerId: STAKE_POOL_PROGRAM_ID, field: "last_epoch_total_lamports (u64)" },
  stake: { owner: "Vote program", ownerId: VOTE_PROGRAM_ID, field: "epoch stake (read by sol_get_epoch_stake)" },
  curve: { owner: "Meteora DBC", ownerId: DBC_PROGRAM_ID, field: "quote_reserve (u64 at byte 240), stage at byte 308" },
};

export type PriceFacts = {
  symbol: string | null;
  price: bigint;
  conf: bigint;
  exponent: number;
  publishTime: bigint;
  postedSlot: bigint;
  /** Chain time less the publish time; negative when the update is ahead of the cluster's clock. */
  ageSeconds: bigint;
  maxAge: number;
  /** A join would take this price: published and posted within the campaign's maximum age. */
  fresh: boolean;
  /** The price band is within 1% of the target: joins wait (question 7). */
  tooClose: boolean;
};

export type Proof = {
  kind: KindName;
  account: string;
  value: bigint | null;
  target: bigint;
  comparator: "≥" | "≤";
  /** What the program would record if it read the account now; `null` where a read now decides nothing. */
  ifReadNow: "YES" | "NO" | null;
  /** Why the account cannot be read the way the program reads it: missing, or the reader's refusal. */
  problem: BrotErrorName | "missing" | null;
  price: PriceFacts | null;
  /** The epoch kinds: the epoch whose start is measured. */
  measuredEpoch: bigint | null;
  /** A graduation campaign: the curve's raise against its threshold, its stage and when it completed. */
  curve: CurveFacts | null;
};

const verdict = (yes: boolean): "YES" | "NO" => (yes ? "YES" : "NO");

function priceProof(c: Campaign, metric: FetchedAccount, chain: ChainTime): Partial<Proof> {
  const reading = readPriceUpdate(metric.owner, metric.data, bytesToHex(c.feedId));
  const fresh = publishedWithin(reading, chain.unixTimestamp, c.maxAge) && postedWithin(reading, chain.slot, c.maxAge);
  const price: PriceFacts = {
    symbol: feedSymbol(bytesToHex(c.feedId))?.replace(/^Crypto\./, "") ?? null,
    price: reading.price,
    conf: reading.conf,
    exponent: reading.exponent,
    publishTime: reading.publishTime,
    postedSlot: reading.postedSlot,
    ageSeconds: chain.unixTimestamp - reading.publishTime,
    maxAge: c.maxAge,
    fresh,
    tooClose: joinBufferRefuses(c, reading),
  };
  const problem = reading.exponent !== c.priceExponent ? ("PriceExponentChanged" as const) : null;
  return {
    value: reading.price,
    price,
    problem,
    ifReadNow: verdict(bandCrossesTarget(reading, c.direction, c.target)),
  };
}

function read(c: Campaign, kind: KindName, metric: FetchedAccount, chain: ChainTime): Partial<Proof> {
  switch (kind) {
    case "price":
      return priceProof(c, metric, chain);
    case "burn": {
      const supply = readMint(metric.owner, metric.data).supply;
      return { value: supply, ifReadNow: verdict(supply <= c.target) };
    }
    case "lock": {
      const locked = readLockedLiquidity(metric.owner, metric.data);
      return { value: locked, ifReadNow: verdict(locked >= c.target) };
    }
    case "pool": {
      const pool = readStakePool(metric.owner, metric.data);
      // The program reads the snapshot written at the measured epoch's first update; before it, nothing is decided.
      if (pool.lastUpdateEpoch === c.epoch) {
        return { value: pool.lastEpochTotalLamports, ifReadNow: verdict(pool.lastEpochTotalLamports >= c.target) };
      }
      return { value: pool.totalLamports, ifReadNow: null };
    }
    case "curve": {
      const curve = curveFacts(metric, c.target);
      return { value: curve.raised, ifReadNow: curveIfReadNow(curve, c.deadlineAt, chain.unixTimestamp), curve };
    }
    default:
      // The epoch stake is read by a syscall in the measured epoch, not from the vote account's bytes.
      return { value: null, ifReadNow: null };
  }
}

/** The proof of `campaign` from its metric account as read at `chain` (`null`: the account does not exist). */
export function proofOf(campaign: Campaign, metric: FetchedAccount | null, chain: ChainTime): Proof {
  const kind = kindOf(campaign.kind);
  const base: Proof = {
    kind,
    account: campaign.metricAccount,
    value: null,
    target: campaign.target,
    comparator: kind === "burn" || (kind === "price" && campaign.direction === Direction.Below) ? "≤" : "≥",
    ifReadNow: null,
    problem: metric ? null : "missing",
    price: null,
    measuredEpoch: kind === "pool" || kind === "stake" ? campaign.epoch : null,
    curve: null,
  };
  if (!metric) return base;
  try {
    return { ...base, ...read(campaign, kind, metric, chain) };
  } catch (error) {
    if (!isRefusal(error)) throw error;
    return { ...base, problem: error.errorName };
  }
}
