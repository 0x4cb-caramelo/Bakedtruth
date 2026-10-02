// Price history and activity from the program's events: signatures for an address, the transactions,
// and their decoded events. No indexer: two RPC calls per refresh. Framework-free.

import type { Connection, PublicKey } from "@solana/web3.js";

import { BPS_DENOMINATOR, decodeEvents, type ProgramEvent } from "./market";

export type Activity = {
  signature: string;
  /** Block time in ms. */
  time: number;
  slot: number;
  event: ProgramEvent;
};

/** One point of the YES-chance series: the price in basis points from `time` on. */
export type PricePoint = { time: number; bps: number };

const chunks = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

/**
 * The newest `limit` transactions touching `address`, oldest first, with their program events.
 * Transactions are fetched in small batches to stay under public RPC limits.
 */
export async function fetchActivity(connection: Connection, address: PublicKey, limit = 100): Promise<Activity[]> {
  const signatures = (await connection.getSignaturesForAddress(address, { limit }, "confirmed")).filter(
    (s) => s.err === null,
  );
  const activity: Activity[] = [];
  for (const batch of chunks(signatures, 25)) {
    const txs = await connection.getTransactions(
      batch.map((s) => s.signature),
      { commitment: "confirmed", maxSupportedTransactionVersion: 0 },
    );
    txs.forEach((tx, i) => {
      if (!tx?.meta || tx.meta.err) return;
      const time = (tx.blockTime ?? batch[i]!.blockTime ?? 0) * 1000;
      for (const event of decodeEvents(tx.meta.logMessages ?? [])) {
        activity.push({ signature: batch[i]!.signature, time, slot: tx.slot, event });
      }
    });
  }
  return activity.sort((a, b) => a.slot - b.slot || a.time - b.time);
}

const n = (value: { toString(): string }) => BigInt(value.toString());

/**
 * The YES chance over time, the way `yesPrice` reads it: the pool's price while it has
 * liquidity, otherwise the sale price, and 100% or 0% once resolved.
 */
export function priceSeries(activity: Activity[]): PricePoint[] {
  const points: PricePoint[] = [];
  let salePrice: number | null = null;
  const push = (time: number, bps: number) => {
    if (points.length && points[points.length - 1]!.bps === bps) return;
    points.push({ time, bps });
  };
  for (const { time, event } of activity) {
    switch (event.name) {
      case "marketCreated":
        salePrice = event.data.yesPriceBps;
        push(time, salePrice);
        break;
      case "liquidityAdded":
      case "liquidityRemoved":
      case "swapped": {
        const [yes, no] = [n(event.data.poolYes), n(event.data.poolNo)];
        if (yes > 0n && no > 0n) push(time, Number((no * BPS_DENOMINATOR) / (yes + no)));
        else if (salePrice !== null) push(time, salePrice);
        break;
      }
      case "resolved":
        push(time, "yes" in event.data.outcome ? 10_000 : 0);
        break;
    }
  }
  return points;
}

/** The address that acted in an event (buyer, owner, provider, trader or sponsor), if any. */
export function actorOf(event: ProgramEvent): PublicKey | null {
  const data = event.data as Record<string, unknown>;
  for (const key of ["buyer", "owner", "provider", "trader", "sponsor"]) {
    const value = data[key];
    if (value && typeof value === "object" && "toBase58" in value) return value as PublicKey;
  }
  return null;
}

/** The market an event belongs to. */
export const marketOf = (event: ProgramEvent) => (event.data as { market: PublicKey }).market;

const usdc = (value: { toString(): string }) => {
  const units = Number(value.toString()) / 1e6;
  return units.toLocaleString(undefined, { maximumFractionDigits: units < 10 ? 4 : 2 });
};

/** One line for an activity feed: what happened, and whether it reads as YES, NO or neutral. */
export function describeEvent(event: ProgramEvent): { text: string; tone: "yes" | "no" | "neutral" } {
  switch (event.name) {
    case "marketCreated":
      return { text: `opened the market with a ${usdc(event.data.budget)} USDC bounty`, tone: "neutral" };
    case "yesBought": {
      const cents = (Number(event.data.price.toString()) / Number(event.data.amount.toString())) * 100;
      return { text: `bought ${usdc(event.data.amount)} YES at ${cents.toFixed(1)}¢ from the sale`, tone: "yes" };
    }
    case "pairMinted":
      return { text: `minted ${usdc(event.data.amount)} YES + NO`, tone: "neutral" };
    case "pairBurned":
      return { text: `burned ${usdc(event.data.amount)} pairs for USDC`, tone: "neutral" };
    case "liquidityAdded":
      return { text: `added ${usdc(event.data.yesIn)} YES + ${usdc(event.data.noIn)} NO to the pool`, tone: "neutral" };
    case "liquidityRemoved":
      return { text: `removed ${usdc(event.data.yesOut)} YES + ${usdc(event.data.noOut)} NO from the pool`, tone: "neutral" };
    case "swapped": {
      const yesIn = "yes" in event.data.tokenIn;
      return {
        text: `swapped ${usdc(event.data.amountIn)} ${yesIn ? "YES" : "NO"} for ${usdc(event.data.amountOut)} ${yesIn ? "NO" : "YES"}`,
        tone: yesIn ? "no" : "yes",
      };
    }
    case "resolved": {
      const yes = "yes" in event.data.outcome;
      return { text: `resolved the market ${yes ? "YES" : "NO"}`, tone: yes ? "yes" : "no" };
    }
    case "redeemed": {
      const yes = "yes" in event.data.outcome;
      return { text: `redeemed ${usdc(event.data.amount)} ${yes ? "YES" : "NO"} for USDC`, tone: yes ? "yes" : "no" };
    }
    case "sponsorWithdrew": {
      const total = BigInt(event.data.budget.toString()) + BigInt(event.data.sponsorNo.toString());
      return { text: `withdrew ${usdc(total)} USDC as sponsor`, tone: "neutral" };
    }
  }
}
