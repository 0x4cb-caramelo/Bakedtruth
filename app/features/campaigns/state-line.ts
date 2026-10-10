/**
 * Purpose: a card's line for its state (Sprint 12: "the states of the card"), from the read API's fields: the chip
 *          (contested apart from in review, L-04), and one line after entries close: when entries closed, the result read
 *          and when the review ends, the paused payout of a contest, the result and whether payouts are still waiting,
 *          or the void. On devnet nothing pays out by itself yet, so no line promises a time (founder, 2026-10-10).
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { formatUtc } from "@brot/sdk/read";

import type { Campaign } from "../../lib/api-client";

export type CardChip = "open" | "closed" | "in_review" | "contested" | "paid" | "void";

export const CARD_STATE = {
  closed: (at: string) => `Entries closed · deadline ${at}`,
  review: (result: string, at: string) => `Result read: ${result} · review ends ${at}`,
  contested: "Contested · payout paused",
  paid: (result: string, waiting: boolean) => `Result: ${result} · ${waiting ? "waiting for payout" : "paid out"}`,
  void: (waiting: boolean) => `Voided · every entry gets its full amount back${waiting ? " · waiting for payout" : ""}`,
} as const;

const resultWord = (outcome: string) => (outcome === "Yes" ? "YES" : outcome === "No" ? "NO" : "voided");

export const chipOf = (c: Pick<Campaign, "state" | "status">): CardChip =>
  c.state === "in_review" && c.status === "Contested" ? "contested" : c.state;

/** The card's state line; `null` while the campaign is open. */
export function stateLine(
  c: Pick<Campaign, "state" | "status" | "outcome" | "deadline_at" | "review_ends_at">,
): string | null {
  const at = (value: string | null) => (value === null ? "—" : formatUtc(BigInt(value)));
  switch (chipOf(c)) {
    case "open":
      return null;
    case "closed":
      return CARD_STATE.closed(at(c.deadline_at));
    case "in_review":
      return CARD_STATE.review(resultWord(c.outcome), at(c.review_ends_at));
    case "contested":
      return CARD_STATE.contested;
    case "paid":
      return CARD_STATE.paid(resultWord(c.outcome), c.status === "Settling");
    case "void":
      return CARD_STATE.void(c.status === "Settling");
  }
}
