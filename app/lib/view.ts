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
  | "lockedAtLeast";
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

/** The epoch a `StakeAtLeast` market measures, or null for the other kinds. */
export const stakeEpoch = (market: MarketAccount) =>
  "stakeAtLeast" in market.kind && market.kind.stakeAtLeast ? Number(market.kind.stakeAtLeast.epoch.toString()) : null;

/**
 * Trading (the sale and the pool) runs until the cutoff, or until a stake market's epoch
 * starts; after that the market waits for anyone to resolve it. The program also halts
 * trading the moment a goal is met, which the metric reading shows.
 */
export function phaseOf(market: MarketAccount, clock: ClockInfo | null): Phase {
  if (statusOf(market) !== "active") return "resolved";
  if (!clock) return "trading";
  const epoch = stakeEpoch(market);
  const closed = clock.slot >= Number(market.cutoffSlot.toString()) || (epoch !== null && clock.epoch >= epoch);
  return closed ? "awaitingResolution" : "trading";
}

/**
 * The slot trading stops: the cutoff, or for a stake market the start of its epoch if that comes
 * first (estimated from the epoch schedule).
 */
export function closeSlot(market: MarketAccount, clock: ClockInfo | null): number {
  const cutoff = Number(market.cutoffSlot.toString());
  const epoch = stakeEpoch(market);
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
  supplyAtMost: { label: "Burn goal", summary: "Token supply falls to the target. The mint has no authority, so supply only goes down." },
  immutable: { label: "Immutability", summary: "The program's upgrade authority is revoked. Revoking is one-way." },
  stakeAtLeast: { label: "Stake goal", summary: "The vote account holds the target stake in the named epoch. Stake is fixed per epoch." },
  mintAuthorityRevoked: { label: "Renounce minting", summary: "The token's mint authority is revoked. It can never be set again." },
  freezeAuthorityRevoked: { label: "Renounce freezing", summary: "The token's freeze authority is revoked. It can never be set again." },
  lockedAtLeast: { label: "Lock goal", summary: "Tokens locked under the incinerator reach the target. Nobody can ever move them out." },
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
  immutable: "immutable",
  stakeAtLeast: "stake",
};

export const categoryOf = (market: MarketAccount) => KIND_CATEGORY[kindOf(market)];

/** What a winning token pays per unit of price: 10% -> 10x. */
export const multiplier = (bps: number) => (bps <= 0 ? null : 10_000 / bps);
