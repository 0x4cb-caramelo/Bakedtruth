/**
 * Purpose: the campaign's sentence, template v1 (the program stores `template_version` 1, the SDK's
 *          `CAMPAIGN_TEMPLATE_VERSION`; D-j and A-11), from its stored
 *          fields only: one template per kind (Sprint 19). A price campaign reads the feed's symbol from the SDK's
 *          pinned list and its target in the feed's exponent, "$150" when the feed is quoted in US$; a burn or a lock
 *          target is the raw amount the account stores; a stake pool, a stake or a graduation target is SOL. The other
 *          kinds name their account by its shortened address: no creator-supplied text, and no name unless two people
 *          reviewed it. One exception (A-11, TP §3.4.10): a graduation curve is named by the caller's `accountName`,
 *          its reviewed name or its token's ticker always paired with the pool's last four characters, and without
 *          one "Token (…7Dny)" (curve-name.ts). The creation box at /open writes its preview with this same function,
 *          so the sentence a creator reads is the one every page shows.
 * Version: 0.6.0 (the curve named by its ticker, never by its address alone; 0.5.0, the sixth template: a Meteora
 *          launch curve's graduation; 0.4.0, the UI overhaul: "$" before a price in US$, the title as a question)
 * Sprint:  10 (site: campaign list); 19; the sixth kind's site
 */
import { feedSymbol, ReaderKind, shortAddress } from "@brot/sdk/read";

import { sol4 } from "../entry/amount";
import { curveName } from "./curve-name";

export const KIND_LABEL: Record<string, string> = {
  PriceTouch: "Price",
  SupplyAtMost: "Burn",
  DammV2LockedAtLeast: "Lock",
  StakePoolTvlAtLeast: "Stake pool",
  StakeAtLeast: "Stake",
  DbcGraduated: "Graduation",
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

/**
 * A price as the approved prototype writes it: "$150" when the feed is quoted in US$ ("SOL/USD"); a ratio feed's value
 * ("SSOL/SOL.RR") stays a plain number, since it is not in dollars.
 */
export function priceText(value: bigint, exponent: number, asset: string | null): string {
  return `${asset !== null && asset.endsWith("/USD") ? "$" : ""}${formatTarget(value, exponent)}`;
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

/** A piece of a sentence: fixed words, or a slot with its value (`null` while the creator has not filled it). */
export type SentencePart = string | { slot: "asset" | "account" | "target" | "epoch"; value: string | null };

/** The fields a sentence is written from; `null` marks a slot the creation box has not filled yet. */
export type SentenceInput = {
  kind: string;
  direction: string;
  feedIdHex: string | null;
  target: string | null;
  priceExponent: number | null;
  metricAccount: string | null;
  /** The epoch kinds: the epoch whose start is measured, when the caller has it (the read API's list does not). */
  epoch?: string | null;
  /** The graduation kind: the curve's name (curve-name.ts), when the caller has read it. */
  accountName?: string | null;
};

/** Template v1 as parts, so the creation box can show its gaps; `sentenceOf` joins the same parts. */
export function sentenceParts(input: SentenceInput): SentencePart[] {
  const raw = input.target === null ? null : BigInt(input.target);
  const account = { slot: "account" as const, value: input.metricAccount ? shortAddress(input.metricAccount) : null };
  const target = (format: (value: bigint) => string) => ({
    slot: "target" as const,
    value: raw === null ? null : format(raw),
  });
  switch (input.kind) {
    case ReaderKind[ReaderKind.PriceTouch]: {
      const asset = input.feedIdHex === null ? null : assetOf(input.feedIdHex);
      if (input.feedIdHex !== null && asset === null) return [`${KIND_LABEL.PriceTouch} campaign `, account];
      const exponent = input.priceExponent;
      const value = raw === null || exponent === null ? null : priceText(raw, exponent, asset);
      const verb = input.direction === "Below" ? " falls to " : " reaches ";
      return [{ slot: "asset", value: asset }, verb, { slot: "target", value }];
    }
    case ReaderKind[ReaderKind.SupplyAtMost]:
      return [account, " supply falls to ", target(groupedDigits), " raw units"];
    case ReaderKind[ReaderKind.DammV2LockedAtLeast]:
      return ["Meteora pool ", account, " reaches ", target(groupedDigits), " liquidity units locked for good"];
    case ReaderKind[ReaderKind.StakePoolTvlAtLeast]:
      return [
        "Stake pool ",
        account,
        " holds at least ",
        target(solTarget),
        " SOL at the start of ",
        ...epochOf(input),
      ];
    case ReaderKind[ReaderKind.StakeAtLeast]:
      return ["Validator ", account, " has at least ", target(solTarget), " SOL staked in ", ...epochOf(input)];
    case ReaderKind[ReaderKind.DbcGraduated]: {
      const pool = input.metricAccount;
      const curve = { slot: "account" as const, value: pool ? (input.accountName ?? curveName(pool)) : null };
      return ["Meteora launch curve ", curve, " raises its full ", target(solTarget), " SOL"];
    }
    default:
      return [`${KIND_LABEL[input.kind] ?? input.kind} campaign `, account];
  }
}

/** "epoch 812", or "its measured epoch" where the caller does not have it (the list's cards). */
function epochOf(input: SentenceInput): SentencePart[] {
  if (input.epoch === undefined) return ["its measured epoch"];
  return ["epoch ", { slot: "epoch", value: input.epoch }];
}

const joined = (parts: SentencePart[]) =>
  parts.map((part) => (typeof part === "string" ? part : (part.value ?? `(${part.slot})`))).join("");

export function sentenceOf(input: SentenceInput): string {
  return joined(sentenceParts(input));
}

/**
 * The campaign page's title asks the sentence (Ronaldo, 2026-10-11): "SOL/USD reaches $150?". A campaign outside the
 * templates ("Price campaign 7Avi…HmyE") is a name, not a question, and takes no mark.
 */
export function questionOf(input: SentenceInput): string {
  const parts = sentenceParts(input);
  return joined(parts) + (parts.some((p) => typeof p !== "string" && p.slot === "target") ? "?" : "");
}
