/**
 * Purpose: what a card and the home page's proof panel say about the account a campaign reads, now (the UI overhaul;
 *          the approved prototype's `card-read` and `home-proof`): the value through the SDK's copy of the program's
 *          readers (owner first, then the layout), against the target, with "if read now" (the price's confidence band
 *          on a price campaign, as the program reads it) and the distance in percent for a price. Pure: the fetch is
 *          use-readings.ts. A stake pool shows its total now, not the measured epoch's snapshot, and a validator's
 *          stake shows none (it is a syscall in the measured epoch, not account bytes), as the campaign page does.
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul
 */
import {
  bandCrossesTarget,
  Direction,
  isRefusal,
  readLockedLiquidity,
  readMint,
  readPriceUpdate,
  readStakePool,
  type FetchedAccount,
} from "@brot/sdk/read";

import type { KindName } from "@/features/campaign-page/proof";
import type { Card } from "./model";

export const KIND_NAME: Record<string, KindName> = {
  PriceTouch: "price",
  SupplyAtMost: "burn",
  DammV2LockedAtLeast: "lock",
  StakePoolTvlAtLeast: "pool",
  StakeAtLeast: "stake",
};

export type Reading = {
  value: bigint;
  /** The exponent the value is written with: the price's own, or 0 for whole units and lamports. */
  exponent: number;
  /** What the program would read now, or null when a read now decides nothing (a pool before its epoch). */
  ifReadNow: "YES" | "NO" | null;
};

export const kindName = (card: Pick<Card, "kind">): KindName => KIND_NAME[card.kind] ?? "price";

/** "≥" or "≤": the side of the target YES needs. */
export const comparator = (card: Pick<Card, "kind" | "direction">): "≥" | "≤" =>
  card.kind === "SupplyAtMost" || (card.kind === "PriceTouch" && card.direction === "Below") ? "≤" : "≥";

const verdict = (yes: boolean): "YES" | "NO" => (yes ? "YES" : "NO");

/** The reading of `card` from its metric account, or null when there is none or the bytes are refused. */
export function readingOf(card: Card, account: FetchedAccount | null): Reading | null {
  if (!account || card.target === null) return null;
  const target = card.target;
  try {
    switch (kindName(card)) {
      case "price": {
        const r = readPriceUpdate(account.owner, account.data, card.feedId);
        const direction = card.direction === "Below" ? Direction.Below : Direction.Above;
        return { value: r.price, exponent: r.exponent, ifReadNow: verdict(bandCrossesTarget(r, direction, target)) };
      }
      case "burn": {
        const supply = readMint(account.owner, account.data).supply;
        return { value: supply, exponent: 0, ifReadNow: verdict(supply <= target) };
      }
      case "lock": {
        const locked = readLockedLiquidity(account.owner, account.data);
        return { value: locked, exponent: 0, ifReadNow: verdict(locked >= target) };
      }
      case "pool":
        return { value: readStakePool(account.owner, account.data).totalLamports, exponent: 0, ifReadNow: null };
      default:
        return null;
    }
  } catch (error) {
    if (isRefusal(error)) return null;
    throw error;
  }
}

/** The distance to the target as a share of the value now, for a price: "+17.4%" or "−5.8%". */
export function distanceText(reading: Reading, target: bigint): string | null {
  if (reading.value === 0n) return null;
  const share = (Number(target - reading.value) / Number(reading.value)) * 100;
  return `${share > 0 ? "+" : share < 0 ? "−" : ""}${Math.abs(share).toFixed(1)}%`;
}
