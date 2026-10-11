/**
 * Purpose: what one suggestion of "What should the chain answer?" says (the approved prototype's option, open-slots.js):
 *          the campaign sentence it would start, written by the site's own template v1 (features/campaigns/sentence.ts)
 *          so the list reads exactly as the campaign will, with the target converted to the kind's unit (US$ with its
 *          decimals, raw units, or SOL to lamports) and a reviewed name in place of the shortened address. Empty slots
 *          stay empty; the list writes them as "…".
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign), in the UI overhaul
 */
import { ReaderKind } from "@brot/sdk/read";

import { sentenceParts, type SentencePart } from "../campaigns/sentence";
import { templateOf } from "./kinds";
import type { Suggestion } from "./search";

const LAMPORTS = 1_000_000_000n;

/** The typed target as the sentence takes it: a raw value with its exponent, or null when it cannot be one. */
function targetOf(s: Suggestion): { raw: string; exponent: number } | null {
  if (!s.target || !/^\d+(\.\d+)?$/.test(s.target)) return null;
  const [whole, frac = ""] = s.target.split(".");
  const unit = templateOf(s.kind).unit;
  if (unit === "usd") return { raw: BigInt(whole + frac).toString(), exponent: -frac.length };
  if (unit === "sol") {
    if (frac.length > 9) return null;
    return { raw: (BigInt(whole) * LAMPORTS + BigInt(frac.padEnd(9, "0"))).toString(), exponent: 0 };
  }
  return frac ? null : { raw: whole, exponent: 0 };
}

export function suggestionParts(s: Suggestion): SentencePart[] {
  const t = templateOf(s.kind);
  const target = targetOf(s);
  const parts = sentenceParts({
    kind: ReaderKind[t.readerKind],
    direction: s.direction === "below" ? "Below" : "Above",
    feedIdHex: s.feedHex ?? null,
    target: target?.raw ?? null,
    priceExponent: target?.exponent ?? 0,
    metricAccount: s.account ?? null,
    epoch: t.epoch ? null : undefined,
  });
  return parts.map((p) => (typeof p !== "string" && p.slot === "account" && s.name ? { ...p, value: s.name } : p));
}
