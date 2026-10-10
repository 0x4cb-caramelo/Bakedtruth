/**
 * Purpose: the JSON shape of a campaign for the site. Amounts are lamport strings, addresses base58, times Unix seconds
 *          (strings for the big integers). The state is the SDK's public state, in snake case for the URL.
 * Version: 0.1.0
 * Sprint:  08 (indexer and API, hackathon MVP)
 *
 * Assumption: these field names are a first draft for Lucas's screens; the D6 names (TP §6) are not fixed yet.
 */
import { Outcome, ReaderKind, Status } from "@brot/sdk/read";
import type { PublicState } from "@brot/sdk/read";
import type { Row } from "./snapshot";

export type PublicCampaign = ReturnType<typeof toCampaign>;

export const STATE_NAME: Record<PublicState, string> = {
  Open: "open",
  Closed: "closed",
  InReview: "in_review",
  Paid: "paid",
  Void: "void",
};

const big = (value: bigint | null | undefined): string | null =>
  value === null || value === undefined ? null : value.toString();

export function toCampaign(row: Row) {
  const c = row.campaign;
  return {
    address: row.address.toString(),
    id: c.id.toString(),
    state: STATE_NAME[row.view.state],
    kind: ReaderKind[c.kind] ?? "unknown",
    status: Status[c.status] ?? "unknown",
    outcome: Outcome[c.outcome] ?? "unknown",
    creator: c.creator.toString(),
    creator_is_team: c.creatorIsTeam,
    pool_yes: big(c.poolYes),
    pool_no: big(c.poolNo),
    prize_lamports: big(c.prizeLamports),
    entries_close_at: big(c.entriesCloseAt),
    deadline_at: big(c.deadlineAt),
    review_ends_at: row.view.reviewEndsAt === null ? null : big(row.view.reviewEndsAt),
    resolved_at: big(c.resolvedAt),
    target: big(c.target),
    metric_account: c.metricAccount.toString(),
  };
}
