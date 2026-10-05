// How the app reads a market account: kind, status, phase and price. Framework-free.

import type { IdlAccounts } from "@anchor-lang/core";

import type { PredProvable } from "./idl/pred_provable";
import { BPS_DENOMINATOR } from "./market";
import type { ClockInfo } from "./format";

export type MarketAccount = IdlAccounts<PredProvable>["market"];
export type Kind =
  | "supplyAtMost"
  | "immutable"
  | "stakeAtLeast"
  | "mintAuthorityRevoked"
  | "freezeAuthorityRevoked"
  | "lockedAtLeast"
  | "stakePoolTvlAtLeast"
  | "dammV2LockedAtLeast"
  | "metadataImmutable";
/** The explorer's filter: open markets, and the two resolved outcomes. */
export type Status = "active" | "yes" | "no";
/** Where an open market is in its life. */
export type Phase = "trading" | "awaitingResolution" | "resolved";

export const big = (value: { toString(): string }) => BigInt(value.toString());

export const kindOf = (market: MarketAccount) => Object.keys(market.kind)[0] as Kind;

export function statusOf(market: MarketAccount): Status {
  if ("yes" in market.outcome) return "yes";
  if ("no" in market.outcome) return "no";
  return "active";
}

/**
 * The epoch an epoch-measured market (`StakeAtLeast`, `StakePoolTvlAtLeast`) reads, or null for the
 * ratchet kinds, which resolve the moment their goal is met.
 */
export function measuredEpoch(market: MarketAccount): number | null {
  const { kind } = market;
  if ("stakeAtLeast" in kind && kind.stakeAtLeast) return Number(kind.stakeAtLeast.epoch.toString());
  if ("stakePoolTvlAtLeast" in kind && kind.stakePoolTvlAtLeast) {
    return Number(kind.stakePoolTvlAtLeast.epoch.toString());
  }
  return null;
}

/** The scale of a `DammV2LockedAtLeast` goal (threshold << shift), or 0 for the other kinds. */
export const dammShift = (market: MarketAccount) =>
  "dammV2LockedAtLeast" in market.kind && market.kind.dammV2LockedAtLeast ? market.kind.dammV2LockedAtLeast.shift : 0;

/**
 * Trading (the sale and the pool) runs until the cutoff, or until an epoch-measured market's epoch
 * starts; after that the market waits for anyone to resolve it. The program also halts
 * trading the moment a ratchet goal is met, which the metric reading shows.
 */
export function phaseOf(market: MarketAccount, clock: ClockInfo | null): Phase {
  if (statusOf(market) !== "active") return "resolved";
  if (!clock) return "trading";
  const epoch = measuredEpoch(market);
  const closed = clock.slot >= Number(market.cutoffSlot.toString()) || (epoch !== null && clock.epoch >= epoch);
  return closed ? "awaitingResolution" : "trading";
}

/**
 * The slot trading stops: the cutoff, or for an epoch-measured market the start of its epoch if that
 * comes first (estimated from the epoch schedule).
 */
export function closeSlot(market: MarketAccount, clock: ClockInfo | null): number {
  const cutoff = Number(market.cutoffSlot.toString());
  const epoch = measuredEpoch(market);
  if (epoch === null || !clock) return cutoff;
  const epochStart = clock.slot - clock.slotIndex + (epoch - clock.epoch) * clock.slotsInEpoch;
  return Math.min(cutoff, epochStart);
}

export type Price = { bps: number; source: "pool" | "sale" };

/** YES price in basis points of its payout: the pool's if it has liquidity, else the sale's. */
export function yesPrice(market: MarketAccount): Price {
  const [poolYes, poolNo] = [big(market.poolYes), big(market.poolNo)];
  if (poolYes > BigInt(0) && poolNo > BigInt(0)) {
    return { bps: Number((poolNo * BPS_DENOMINATOR) / (poolYes + poolNo)), source: "pool" };
  }
  return { bps: market.yesPriceBps, source: "sale" };
}

export const hasPool = (market: MarketAccount) => big(market.poolYes) > BigInt(0) && big(market.poolNo) > BigInt(0);

export const KIND_INFO: Record<Kind, { label: string; summary: string }> = {
  supplyAtMost: {
    label: "Burn goal",
    summary: "Token supply falls to the target. The mint has no authority, so supply only goes down.",
  },
  immutable: { label: "Immutability", summary: "The program's upgrade authority is revoked. Revoking is one-way." },
  stakeAtLeast: {
    label: "Stake goal",
    summary: "The vote account holds the target stake in the named epoch. Stake is fixed per epoch.",
  },
  mintAuthorityRevoked: {
    label: "Renounce minting",
    summary: "The token's mint authority is revoked. It can never be set again.",
  },
  freezeAuthorityRevoked: {
    label: "Renounce freezing",
    summary: "The token's freeze authority is revoked. It can never be set again.",
  },
  lockedAtLeast: {
    label: "Lock goal",
    summary: "Tokens in the program's lock account reach the target. Nobody can ever move, burn or close them.",
  },
  stakePoolTvlAtLeast: {
    label: "Pool TVL goal",
    summary:
      "The stake pool holds the target SOL at the start of the named epoch. The pool records it itself, so a flash loan can't move it.",
  },
  dammV2LockedAtLeast: {
    label: "Liquidity lock",
    summary:
      "A Meteora pool's permanently locked liquidity reaches the target. Locked liquidity can never be withdrawn.",
  },
  metadataImmutable: {
    label: "Immutable metadata",
    summary: "The token's metadata is made immutable. The flag only ever flips one way.",
  },
};

/** Browse categories: the resolver kinds, with both renounce kinds under one. */
export type Category = "burn" | "renounce" | "lock" | "immutable" | "stake";

export const CATEGORIES: { slug: Category; label: string }[] = [
  { slug: "burn", label: "Burn" },
  { slug: "renounce", label: "Renounce" },
  { slug: "lock", label: "Lock" },
  { slug: "immutable", label: "Immutable" },
  { slug: "stake", label: "Stake" },
];

const KIND_CATEGORY: Record<Kind, Category> = {
  supplyAtMost: "burn",
  mintAuthorityRevoked: "renounce",
  freezeAuthorityRevoked: "renounce",
  lockedAtLeast: "lock",
  dammV2LockedAtLeast: "lock",
  immutable: "immutable",
  metadataImmutable: "immutable",
  stakeAtLeast: "stake",
  stakePoolTvlAtLeast: "stake",
};

export const categoryOf = (market: MarketAccount) => KIND_CATEGORY[kindOf(market)];

/** What a winning token pays per unit of price: 10% -> 10x. */
export const multiplier = (bps: number) => (bps <= 0 ? null : 10_000 / bps);
