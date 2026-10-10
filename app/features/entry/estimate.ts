/**
 * Purpose: the entry panel's estimate (BR-09; P1 §3.2): what an entry returns if its side wins, net of Brot's fee and
 *          the creator's share, with the baker's own amount added to its side. The number is the SDK's `checkJoin`
 *          estimate, the same one `prepareJoin` signs `min_return_bps` against, so the panel cannot show another; when
 *          the program would refuse the entry, the refusal comes back instead of a number. Also the per-1 figure and
 *          the chance per side (each side's share of the entries; none for an empty pot, L-05).
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import {
  checkJoin,
  Side,
  type BrotErrorName,
  type Campaign,
  type ChainTime,
  type Entry,
  type FetchedAccount,
  type GlobalConfig,
} from "@brot/sdk/read";

export type EntrySide = "yes" | "no";

/** What the page read through the RPC, as `checkJoin` takes it. */
export type JoinInputs = {
  campaign: Campaign;
  config: GlobalConfig;
  /** The connected wallet's `Entry`, or `null` before its first entry (or with no wallet). */
  entry: Entry | null;
  metric: FetchedAccount;
  chain: ChainTime;
};

export type EntryEstimate =
  | {
      ok: true;
      /** The SDK's estimate in basis points of the amount: what `min_return_bps` is checked against. */
      bps: bigint;
      /** `amount × bps ÷ 10,000`, rounded down: what the entry returns if its side wins (or its refund). */
      returns: bigint;
      /** "onesided": the other side is empty, so the entry is refunded if it stays empty. */
      mode: "split" | "onesided";
      /** The first baker of the campaign pays no one-sided fee (Q3). */
      isFirst: boolean;
    }
  | { ok: false; refusal: BrotErrorName };

export const sideOf = (side: EntrySide): Side => (side === "yes" ? Side.Yes : Side.No);

/** The panel's estimate for `amount` lamports on `side`, or the program's refusal of that entry. */
export function estimateEntry(inputs: JoinInputs, side: EntrySide, amount: bigint): EntryEstimate {
  const check = checkJoin({ ...inputs, side: sideOf(side), amount });
  if (!check.ok) return { ok: false, refusal: check.refusal.errorName };
  const other = side === "yes" ? inputs.campaign.poolNo : inputs.campaign.poolYes;
  return {
    ok: true,
    bps: check.estimateBps,
    returns: (amount * check.estimateBps) / 10_000n,
    mode: other === 0n ? "onesided" : "split",
    isFirst: check.isFirst,
  };
}

/** Basis points as "per 1", exactly: 31,000 → "3.10", 30,666 → "3.0666" (never rounded up). */
export function perOne(bps: bigint): string {
  let fraction = (bps % 10_000n).toString().padStart(4, "0");
  while (fraction.length > 2 && fraction.endsWith("0")) fraction = fraction.slice(0, -1);
  return `${bps / 10_000n}.${fraction}`;
}

/** Each side's share of the entries in whole percent, adding up to 100; `null` for an empty pot (L-05). */
export function chance(poolYes: bigint, poolNo: bigint): { yes: number; no: number } | null {
  const pot = poolYes + poolNo;
  if (pot === 0n) return null;
  let yes = Number((poolYes * 200n + pot) / (pot * 2n)); // rounded half up
  if (poolYes > 0n && yes === 0) yes = 1;
  if (poolNo > 0n && yes === 100) yes = 99;
  return { yes, no: 100 - yes };
}

/** A large entry lowers its own side's return (P1 §3.2): true when it is under 90% of a minimum entry's. */
export const lowersItsSide = (mine: bigint, smallest: bigint): boolean => mine * 10n < smallest * 9n;
