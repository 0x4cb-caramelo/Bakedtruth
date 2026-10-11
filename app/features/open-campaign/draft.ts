/**
 * Purpose: what the creator fills in the creation box, and the exact `OpeningChoice` the SDK prepares from it (D-j: the
 *          kind, the account, the target, the deadline, the epoch on the epoch kinds and, for the price kind, the feed
 *          and the direction; nothing else). Every number is parsed as text into a bigint, never through a float: a
 *          price target in the feed's own exponent, a raw supply or liquidity as a whole number, a stake target in
 *          lamports, whole US$. A comma only groups thousands, and a target has no more precision than the sentence
 *          prints. What a person types in the search box is never sent; a picked suggestion fills fields (search.ts).
 * Version: 0.2.0 (the Sprint 19 reviews: commas as thousands only, the sentence's precision, the 90-day bound)
 * Sprint:  19 (site: open a campaign)
 */
import { isAddress, type Address } from "@solana/kit";
import { Direction, hexToBytes } from "@brot/sdk/read";
import type { OpeningChoice } from "@brot/sdk/tx";

import type { KindName } from "../campaign-page/proof";
import { templateOf, type TargetUnit } from "./kinds";

export const DAY_SECONDS = 86_400n;

/** The slots of the box, in the order the creator meets them. */
export type Slot = "kind" | "feed" | "account" | "target" | "epoch" | "deadline" | "usd";

export type Draft = {
  kind: KindName;
  /** Price kind: the feed id in hex (64 characters), from the pinned list. */
  feedHex: string | null;
  direction: "above" | "below";
  /** The other kinds: the account's address as typed or picked. */
  account: string;
  /** The target as typed, in the kind's unit. */
  target: string;
  /** Unix seconds; a number of days waits for the chain's clock (`resolveDeadline`). */
  deadline: { at: bigint } | { days: number } | null;
  /** The epoch kinds: the epoch whose start is measured, as typed. */
  epoch: string;
  /** Whole US$ for a paid opening, as typed; ignored for a team key, which opens free. */
  usd: string;
};

export const EMPTY_DRAFT: Draft = {
  kind: "price",
  feedHex: null,
  direction: "above",
  account: "",
  target: "",
  deadline: { days: 14 },
  epoch: "",
  usd: "500",
};

/**
 * Digits with an optional dot and at most `decimals` decimals. A comma is read only as a thousands separator in its
 * place ("120,000"); anywhere else ("1,5") the text is refused rather than guessed, since the entry panel reads a comma
 * as a decimal point (the Sprint 19 adversarial review, M5).
 */
export function parseScaled(text: string, decimals: number): bigint | null {
  const plain = text.trim();
  const match = /^(\d{1,40}|\d{1,3}(?:,\d{3})+)(?:\.(\d+))?$/.exec(plain);
  if (!match || decimals < 0) return null;
  const whole = match[1].replace(/,/g, "");
  const fraction = match[2] ?? "";
  if (fraction.length > decimals) return null;
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, "0") || "0");
}

/**
 * No more precision than the sentence prints (M4), so every page states the very threshold the program stores: a price
 * at most 2 decimals from US$1 up and 6 significant digits below it; SOL at most 4 decimals; raw units whole.
 */
export function withinPrecision(unit: TargetUnit, text: string): boolean {
  const [whole, fraction = ""] = text.trim().replace(/,/g, "").split(".");
  if (!/^\d*$/.test(whole) || !/^\d*$/.test(fraction)) return false; // "abc", "1e5": parseScaled says why
  if (unit === "raw") return fraction === "";
  if (unit === "sol") return fraction.length <= 4;
  if (BigInt(whole || "0") > 0n) return fraction.length <= 2;
  return fraction.replace(/^0+/, "").length <= 6;
}

/** The target in the kind's raw unit: the feed's exponent for a price (needs it read), lamports for SOL. */
export function parseTarget(unit: TargetUnit, text: string, priceExponent: number | null): bigint | null {
  if (!withinPrecision(unit, text)) return null;
  if (unit === "usd") return priceExponent === null || priceExponent > 0 ? null : parseScaled(text, -priceExponent);
  return parseScaled(text, unit === "sol" ? 9 : 0);
}

/** The ten minutes a transaction may take to land, on top of the program's three-day floor (spec 3.12). */
export const LAND_MARGIN_SECONDS = 600n;

/**
 * A moment `days` after `chainNow`, on the minute, so the date and time fields show a whole minute: rounded down (90
 * days never passes the program's bound), except 3 days, which gets the ten minutes to land and rounds up.
 */
export const daysFrom = (chainNow: bigint, days: number) => {
  if (days <= 3) {
    const at = chainNow + BigInt(days) * DAY_SECONDS + LAND_MARGIN_SECONDS;
    return at % 60n === 0n ? at : at + 60n - (at % 60n);
  }
  const at = chainNow + BigInt(days) * DAY_SECONDS;
  return at - (at % 60n);
};

/** A deadline given in days becomes a moment once the chain's clock is known (A-7: never the device's). */
export function resolveDeadline(deadline: Draft["deadline"], chainNow: bigint | null): bigint | null {
  if (deadline === null) return null;
  if ("at" in deadline) return deadline.at;
  return chainNow === null ? null : chainNow + BigInt(deadline.days) * DAY_SECONDS;
}

/** The metric account the draft names: the typed address for the other kinds, when it is one. */
export function accountOf(draft: Draft): Address | null {
  if (draft.kind === "price") return null;
  const text = draft.account.trim();
  return isAddress(text) ? (text as Address) : null;
}

export type ChoiceResult = { ok: true; choice: OpeningChoice } | { ok: false; missing: Slot[] };

/**
 * The SDK's `OpeningChoice` from the draft, or the slots still missing. `priceExponent`: the feed's, read from its
 * account (`null` until read). `isTeam`: a team key opens free and sends no `opening_usd` (P-3).
 */
export function choiceOf(
  draft: Draft,
  ctx: { priceExponent: number | null; chainNow: bigint | null; isTeam: boolean },
): ChoiceResult {
  const template = templateOf(draft.kind);
  const missing: Slot[] = [];
  const isPrice = draft.kind === "price";
  const feedOk = !isPrice || (draft.feedHex !== null && /^[0-9a-f]{64}$/.test(draft.feedHex));
  if (!feedOk) missing.push("feed");
  const metric = accountOf(draft);
  if (!isPrice && metric === null) missing.push("account");
  const target = parseTarget(template.unit, draft.target, isPrice ? ctx.priceExponent : 0);
  if (target === null) missing.push("target");
  const epoch = template.epoch ? (/^\d{1,19}$/.test(draft.epoch.trim()) ? BigInt(draft.epoch.trim()) : null) : 0n;
  if (epoch === null) missing.push("epoch");
  const deadlineAt = resolveDeadline(draft.deadline, ctx.chainNow);
  if (deadlineAt === null) missing.push("deadline");
  const usd = ctx.isTeam ? 0n : /^\d{1,9}$/.test(draft.usd.trim()) ? BigInt(draft.usd.trim()) : null;
  if (usd === null) missing.push("usd");
  if (missing.length > 0 || target === null || epoch === null || deadlineAt === null || usd === null) {
    return { ok: false, missing };
  }
  return {
    ok: true,
    choice: {
      kind: template.readerKind,
      direction: isPrice && draft.direction === "below" ? Direction.Below : Direction.Above,
      feedId: isPrice ? hexToBytes(draft.feedHex as string) : new Uint8Array(32),
      target,
      deadlineAt,
      epoch,
      metricAccount: metric ?? undefined,
      openingUsd: usd,
    },
  };
}
