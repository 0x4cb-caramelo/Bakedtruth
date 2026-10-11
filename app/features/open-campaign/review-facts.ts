/**
 * Purpose: what "Check before you sign" says about the campaign, from the signed arguments only (A-3; the Sprint 19
 *          adversarial review, H1): the sentence (template v1) written from the prepared choice, the price exponent the
 *          SDK read and the account the instruction reads; that account with its reviewed name or its owner; and the
 *          target written exactly, with no rounding, in the kind's unit. Nothing here reads the draft, which may have
 *          changed while the opening was prepared.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { bytesToHex, Direction, formatScaled, ReaderKind } from "@brot/sdk/read";
import type { OpeningChoice } from "@brot/sdk/tx";

import { assetOf, groupedDigits, sentenceOf } from "../campaigns/sentence";
import { KIND_OF } from "../campaign-page/proof";
import { KIND_WORDS, PREVIEW } from "./copy";
import { templateOf } from "./kinds";
import type { KnownName } from "./names";

/** `value × 10^exponent` exactly, grouped, trailing zeros dropped: (9373357000000n, −8) → "93,733.57". */
export function exactDecimal(value: bigint, exponent: number): string {
  const [whole, fraction = ""] = formatScaled(value, exponent).split(".");
  const negative = whole.startsWith("-");
  const digits = groupedDigits(BigInt(negative ? whole.slice(1) : whole));
  const trimmed = fraction.replace(/0+$/, "");
  return `${negative ? "-" : ""}${digits}${trimmed ? `.${trimmed}` : ""}`;
}

export type ReviewFacts = { sentence: string; account: { address: string; label: string }; target: string };

export function reviewFacts(a: {
  choice: OpeningChoice;
  priceExponent: number;
  metric: string;
  names: readonly KnownName[];
}): ReviewFacts {
  const { choice } = a;
  const kind = KIND_OF[choice.kind as ReaderKind];
  const feedHex = typeof choice.feedId === "string" ? choice.feedId : bytesToHex(choice.feedId ?? new Uint8Array(32));
  const isPrice = kind === "price";
  const sentence = sentenceOf({
    kind: ReaderKind[choice.kind],
    direction: Direction[choice.direction ?? Direction.Above],
    feedIdHex: feedHex,
    target: choice.target.toString(),
    priceExponent: isPrice ? a.priceExponent : 0,
    metricAccount: a.metric,
    epoch: (choice.epoch ?? 0n).toString(),
  });
  const owner = templateOf(kind).owner;
  const named = a.names.find((n) => n.address === a.metric && n.kind === kind)?.name ?? null;
  const label = isPrice ? PREVIEW.priceAccount(assetOf(feedHex) ?? "") : PREVIEW.accountOf(named, owner);
  const unit = templateOf(kind).unit;
  const target =
    unit === "usd"
      ? `US$${exactDecimal(choice.target, a.priceExponent)}`
      : unit === "sol"
        ? `${exactDecimal(choice.target, -9)} SOL`
        : `${groupedDigits(choice.target)} ${KIND_WORDS[kind].unit}`;
  return { sentence, account: { address: a.metric, label }, target };
}
