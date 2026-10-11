/**
 * Purpose: the campaign's sentence, template v1 (the program stores `template_version` 1, the SDK's
 *          `CAMPAIGN_TEMPLATE_VERSION`; D-j and A-11), from its stored
 *          fields only: one template per kind (Sprint 19). A price campaign reads the feed's symbol from the SDK's
 *          pinned list and its target in the feed's exponent; a burn or a lock target is the raw amount the account
 *          stores; a stake pool or a stake target is SOL. The other kinds name their account by its shortened address:
 *          no creator-supplied text, and no name unless two people reviewed it. The creation box at /abrir writes its
 *          preview with this same function, so the sentence a creator reads is the one every page shows.
 * Version: 0.2.0 (Sprint 19: the five templates; 0.1.1, a target below 1 keeps six significant digits)
 * Sprint:  10 (site: campaign list); 19
 */
import { feedSymbol, ReaderKind, shortAddress } from "@brot/sdk/read";

import { sol4 } from "../entry/amount";

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

/**
 * A target in the feed's units: target × 10^exponent, with thousands separators and at most two decimals; below 1,
 * six significant digits, so a small price (BONK's) is not written as 0. Display only: the program compares raw values.
 */
export function formatTarget(target: bigint, exponent: number): string {
  const value = Number(target) * 10 ** exponent;
  const small = value !== 0 && Math.abs(value) < 1;
  return new Intl.NumberFormat("en-US", small ? { maximumSignificantDigits: 6 } : { maximumFractionDigits: 2 }).format(
    value,
  );
}

/** 1234567n → "1,234,567", exactly (a raw supply or liquidity can pass 2^53). */
export function groupedDigits(value: bigint): string {
  const sign = value < 0n ? "-" : "";
  return sign + (value < 0n ? -value : value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Lamports as SOL with up to four decimals, rounded down, trailing zeros dropped: 10,000,000,000,000n → "10,000". */
export function solTarget(lamports: bigint): string {
  const [whole, fraction] = sol4(lamports).split(".");
  const trimmed = fraction.replace(/0+$/, "");
  return groupedDigits(BigInt(whole)) + (trimmed ? `.${trimmed}` : "");
}

export function sentenceOf(input: {
  kind: string;
  direction: string;
  feedIdHex: string;
  target: string | null;
  priceExponent: number;
  metricAccount: string;
}): string {
  const raw = input.target === null ? null : BigInt(input.target);
  const account = shortAddress(input.metricAccount);
  switch (input.kind) {
    case ReaderKind[ReaderKind.PriceTouch]: {
      const asset = assetOf(input.feedIdHex);
      const value = raw === null ? "?" : formatTarget(raw, input.priceExponent);
      if (asset === null) return `${KIND_LABEL.PriceTouch} campaign ${account}`;
      const verb = input.direction === "Below" ? "falls to" : "reaches";
      return `${asset} ${verb} ${value}`;
    }
    case ReaderKind[ReaderKind.SupplyAtMost]:
      return `${account} supply falls to ${raw === null ? "?" : groupedDigits(raw)}`;
    case ReaderKind[ReaderKind.DammV2LockedAtLeast]:
      return `Meteora pool ${account} reaches ${raw === null ? "?" : groupedDigits(raw)} liquidity locked for good`;
    case ReaderKind[ReaderKind.StakePoolTvlAtLeast]:
      return `Stake pool ${account} reaches ${raw === null ? "?" : solTarget(raw)} SOL`;
    case ReaderKind[ReaderKind.StakeAtLeast]:
      return `Validator ${account} reaches ${raw === null ? "?" : solTarget(raw)} SOL staked`;
    default:
      return `${KIND_LABEL[input.kind] ?? input.kind} campaign ${account}`;
  }
}
