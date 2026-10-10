/**
 * Purpose: the campaign's sentence, from its stored fields (Sprint 10): a price campaign reads the feed's symbol from the
 *          SDK's pinned list and its target in the feed's exponent; the other kinds get their kind's name and the
 *          metric account shortened. The wording is a first version, to be confirmed with the founder.
 * Version: 0.1.0
 * Sprint:  10 (site: campaign list)
 */
import { feedSymbol, ReaderKind, shortAddress } from "@brot/sdk/read";

export const KIND_LABEL: Record<string, string> = {
  PriceTouch: "Price",
  SupplyAtMost: "Burn",
  DammV2LockedAtLeast: "Lock",
  StakePoolTvlAtLeast: "Stake pool",
  StakeAtLeast: "Stake",
};

/** The feed's short name ("BTC/USD") from its hex id, or null when the id is not in the pinned list. */
export function assetOf(feedIdHex: string): string | null {
  const symbol = feedSymbol(feedIdHex);
  return symbol ? symbol.replace(/^Crypto\./, "") : null;
}

/** A target in the feed's units: target × 10^exponent, with thousands separators and at most two decimals. */
export function formatTarget(target: bigint, exponent: number): string {
  const value = Number(target) * 10 ** exponent;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export function sentenceOf(input: {
  kind: string;
  direction: string;
  feedIdHex: string;
  target: string | null;
  priceExponent: number;
  metricAccount: string;
}): string {
  if (input.kind === ReaderKind[ReaderKind.PriceTouch]) {
    const asset = assetOf(input.feedIdHex);
    const value = input.target === null ? "?" : formatTarget(BigInt(input.target), input.priceExponent);
    if (asset === null) return `${KIND_LABEL.PriceTouch} campaign ${shortAddress(input.metricAccount)}`;
    const verb = input.direction === "Below" ? "falls to" : "reaches";
    return `${asset} ${verb} ${value}`;
  }
  return `${KIND_LABEL[input.kind] ?? input.kind} campaign ${shortAddress(input.metricAccount)}`;
}
