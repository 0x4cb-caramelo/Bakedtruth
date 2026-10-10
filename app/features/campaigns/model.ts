/**
 * Purpose: a campaign's card values, from the read API's fields and the SDK's math (Sprint 10): the pot in lamports, the
 *          chance per side (none for an empty pot, L-05), the estimated return per side from the SDK's estimate, the listing
 *          rule (no entry 24 hours after opening leaves the home page), and the ranking groups (two-sided, one-sided, empty).
 *          Pure: it takes the chain's time as an input, so tests need no clock.
 * Version: 0.2.0 (Sprint 12: the state chip and line, state-line.ts)
 * Sprint:  10 (site: campaign list); 12
 *
 * Assumption: the estimate uses one SOL on the joining side, as a first baker who is not the first of the campaign
 * (the program's own rules for a join). The campaign's rank is not the indexer's: the indexer (Sprint 08) is not built.
 */
import { estimateReturnBps, type JoinedPot } from "@brot/sdk/read";

import type { Campaign } from "@/lib/api-client";
import { assetOf, sentenceOf } from "./sentence";
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
  entriesCloseAt: bigint | null;
  deadlineAt: bigint | null;
  reviewEndsAt: bigint | null;
  estYesBps: bigint | null;
  estNoBps: bigint | null;
  /** Sprint 12: the chip (contested apart) and the line after entries close. */
  chip: CardChip;
  stateLine: string | null;
};

const big = (value: string | null): bigint => (value === null ? 0n : BigInt(value));

/** The estimated return of one SOL on `side`, in bps of the stake, or null when the estimate refuses the inputs. */
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
    return estimateReturnBps(pot);
  } catch {
    return null;
  }
}

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
    title: sentenceOf({
      kind: c.kind,
      direction: c.direction,
      feedIdHex: c.feed_id,
      target: c.target,
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
    entriesCloseAt: c.entries_close_at === null ? null : BigInt(c.entries_close_at),
    deadlineAt: c.deadline_at === null ? null : BigInt(c.deadline_at),
    reviewEndsAt: c.review_ends_at === null ? null : BigInt(c.review_ends_at),
    estYesBps: estimate(c, "yes"),
    estNoBps: estimate(c, "no"),
    chip: chipOf(c),
    stateLine: stateLine(c),
  };
}
