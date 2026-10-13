/**
 * Purpose: a campaign's card values, from the read API's fields and the SDK's math (Sprint 10): the pot in lamports, the
 *          chance per side (none for an empty pot, L-05), the estimated return per side from the SDK's estimate, the listing
 *          rule (no entry 24 hours after opening leaves the home page), and the ranking groups (two-sided, one-sided, empty).
 *          Pure: it takes the chain's time as an input, so tests need no clock.
 * Version: 0.3.2 (a graduation card's title names its curve, `cardTitle`; 0.3.1, the title as a question; 0.3.0, the
 *          UI overhaul: the metric, the target and the answer for the prototype's card; 0.2.1, Sprint 13)
 * Sprint:  10 (site: campaign list); 12; 13
 *
 * Assumption: the estimate uses one SOL on the joining side, as a first baker who is not the first of the campaign
 * (the program's own rules for a join). The campaign's rank is not the indexer's: the indexer (Sprint 08) is not built.
 */
import { shownReturnBps, type JoinedPot } from "@brot/sdk/read";

import type { Campaign } from "@/lib/api-client";
import { assetOf, questionOf } from "./sentence";
import { chipOf, stateLine, type CardChip } from "./state-line";

export const ONE_SOL = 1_000_000_000n;
const DAY_SECONDS = 86_400n;

export type Card = {
  id: string;
  address: string;
  kind: string;
  state: string;
  title: string;
  asset: string | null;
  creator: string;
  creatorIsTeam: boolean;
  potLamports: bigint;
  yesLamports: bigint;
  noLamports: bigint;
  prizeLamports: bigint;
  yesShare: number | null;
  entries: number;
  group: 0 | 1 | 2;
  listed: boolean;
  /** When the campaign opened (Unix seconds): with the id, it names one opening of an address that can be reused. */
  opensAt: bigint | null;
  entriesCloseAt: bigint | null;
  deadlineAt: bigint | null;
  reviewEndsAt: bigint | null;
  estYesBps: bigint | null;
  estNoBps: bigint | null;
  /** Sprint 12: the chip (contested apart) and the line after entries close. */
  chip: CardChip;
  stateLine: string | null;
  /** The UI overhaul: what the card's live line and the home page's proof panel read, and the answer once read. */
  metricAccount: string;
  feedId: string;
  target: bigint | null;
  direction: "Above" | "Below" | "unknown";
  priceExponent: number;
  outcome: string;
  resolvedAt: bigint | null;
};

const big = (value: string | null): bigint => (value === null ? 0n : BigInt(value));

/**
 * The estimated return of one SOL on `side`, in bps of the stake, or null when the estimate refuses the inputs. Since
 * Sprint 13 it is what finalize would pay if entries closed now: the refund when the other side is too small to pay
 * the fees (the Economic Viability Rule), not the split's formula.
 */
function estimate(c: Campaign, side: "yes" | "no"): bigint | null {
  const mine = side === "yes" ? big(c.pool_yes) : big(c.pool_no);
  const other = side === "yes" ? big(c.pool_no) : big(c.pool_yes);
  const pot: JoinedPot = {
    amount: ONE_SOL,
    sideAfter: mine + ONE_SOL,
    other,
    prize: big(c.prize_lamports),
    feeBps: c.fee_bps,
    oneSidedFeeBps: c.one_sided_fee_bps,
    creatorShareBps: c.creator_share_bps,
    isFirst: false,
  };
  try {
    return shownReturnBps(pot);
  } catch {
    return null;
  }
}

/**
 * The card asks its sentence, as the campaign page does: "SOL/USD reaches $150?" (Ronaldo, 2026-10-11). A graduation
 * card names its curve once the list has read it (curve-names.tsx); until then "Token (…7Dny)".
 */
export const cardTitle = (
  card: Pick<Card, "kind" | "direction" | "feedId" | "target" | "priceExponent" | "metricAccount">,
  accountName?: string,
): string =>
  questionOf({
    kind: card.kind,
    direction: card.direction,
    feedIdHex: card.feedId,
    target: card.target === null ? null : card.target.toString(),
    priceExponent: card.priceExponent,
    metricAccount: card.metricAccount,
    accountName,
  });

export function toCard(c: Campaign, nowUnix: bigint): Card {
  const yes = big(c.pool_yes);
  const no = big(c.pool_no);
  const pot = yes + no;
  const entries = c.entries_count;
  const opensAt = c.opens_at === null ? null : BigInt(c.opens_at);
  const idle = entries === 0 && opensAt !== null && nowUnix >= opensAt + DAY_SECONDS;
  const group: 0 | 1 | 2 = yes > 0n && no > 0n ? 0 : pot > 0n ? 1 : 2;
  return {
    id: c.id,
    address: c.address,
    kind: c.kind,
    state: c.state,
    title: cardTitle({
      kind: c.kind,
      direction: c.direction,
      feedId: c.feed_id,
      target: c.target === null ? null : BigInt(c.target),
      priceExponent: c.price_exponent,
      metricAccount: c.metric_account,
    }),
    asset: assetOf(c.feed_id),
    creator: c.creator,
    creatorIsTeam: c.creator_is_team,
    potLamports: pot,
    yesLamports: yes,
    noLamports: no,
    prizeLamports: big(c.prize_lamports),
    yesShare: pot === 0n ? null : Number((yes * 10_000n) / pot) / 10_000,
    entries,
    group,
    listed: !idle,
    opensAt,
    entriesCloseAt: c.entries_close_at === null ? null : BigInt(c.entries_close_at),
    deadlineAt: c.deadline_at === null ? null : BigInt(c.deadline_at),
    reviewEndsAt: c.review_ends_at === null ? null : BigInt(c.review_ends_at),
    estYesBps: estimate(c, "yes"),
    estNoBps: estimate(c, "no"),
    chip: chipOf(c),
    stateLine: stateLine(c),
    metricAccount: c.metric_account,
    feedId: c.feed_id,
    target: c.target === null ? null : BigInt(c.target),
    direction: c.direction,
    priceExponent: c.price_exponent,
    outcome: c.outcome,
    resolvedAt: c.resolved_at === null ? null : BigInt(c.resolved_at),
  };
}
