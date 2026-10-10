/**
 * Purpose: how the campaign page writes what it read: a value in its field's units (a price in the feed's exponent, a
 *          supply or a liquidity as a whole number, a pool or a stake in SOL), a moment in UTC (the SDK's, exact) and
 *          in the visitor's own time zone, an age in seconds and minutes, and the public state's chip. Money never
 *          passes through a float; a price is shown through Sprint 10's target format so the page agrees with the list.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { formatUtc, type PublicView } from "@brot/sdk/read";

import { formatTarget } from "../campaigns/sentence";
import { sol4 } from "../entry/amount";
import type { KindName } from "./proof";

/** The chip's names (components/ui/state-chip.tsx). */
export type ChipState = "open" | "closed" | "in_review" | "final" | "paid" | "void" | "contested";

/** 1234567n → "1,234,567", exactly. */
export function grouped(value: bigint): string {
  const sign = value < 0n ? "-" : "";
  const digits = (value < 0n ? -value : value).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** A value read or a target, in the units its kind reads. */
export function valueText(kind: KindName, value: bigint, exponent: number): string {
  if (kind === "price") return formatTarget(value, exponent);
  if (kind === "pool" || kind === "stake") return `${sol4(value)} SOL`;
  return grouped(value);
}

/** The exact raw value, as the account stores it: "8,521,233,806,870 × 10^-8". */
export const rawText = (value: bigint, exponent: number | null) =>
  exponent === null || exponent === 0 ? grouped(value) : `${grouped(value)} × 10^${exponent}`;

export const utc = (unixSeconds: bigint) => formatUtc(unixSeconds);

/** The fields of a local moment. `timeZoneName` cannot be combined with `dateStyle` or `timeStyle`: V8 throws. */
const LOCAL: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short",
};

/** The visitor's own time, for the moments the page names (rendered in the browser only). */
export function local(unixSeconds: bigint, locale?: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(locale, { ...LOCAL, timeZone }).format(new Date(Number(unixSeconds) * 1_000));
}

/** 7n → "7 s"; 125n → "2 min 5 s"; 3_780n → "1 h 3 min". */
export function ageText(seconds: bigint): string {
  const s = seconds < 0n ? -seconds : seconds;
  if (s < 60n) return `${s} s`;
  if (s < 3_600n) return `${s / 60n} min${s % 60n ? ` ${s % 60n} s` : ""}`;
  return `${s / 3_600n} h${(s % 3_600n) / 60n ? ` ${(s % 3_600n) / 60n} min` : ""}`;
}

/**
 * The SDK's public state as the chip names it; a contested review shows as such, and a Paid campaign is "Result final"
 * until its entries are paid out (the founder's answer 3a, Sprint 12).
 */
export function stateChip(view: PublicView): ChipState {
  if (view.state === "InReview") return view.contested ? "contested" : "in_review";
  if (view.state === "Paid" && !view.settled) return "final";
  return ({ Open: "open", Closed: "closed", Paid: "paid", Void: "void" } as const)[view.state];
}
