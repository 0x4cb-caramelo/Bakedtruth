/**
 * Purpose: the campaign's own record checked against the model after every operation (Sprint 14): its status, its
 *          event count (`event_seq`, X0.4), the result resolution stored (outcome, void reason, `met_late`, observed
 *          value, publish time, review window), which no contest step rewrites and no decision inverts; the contest's
 *          stage and deadline; the tallies and the late totals; the note hash; the snapshot's mode; the reserve.
 * Version: 0.1.0
 * Sprint:  14 (lane INV14)
 */
import type { ChainView } from "./invariant-view";
import { bakersOf, isLate, sideTotal, type ModelCampaign, type Phase } from "./invariant-model";

const STATUS: Record<Phase, number> = { Open: 0, InReview: 1, Contested: 2, Settling: 3, Settled: 4, Closed: -1 };
const OUTCOME = { Unresolved: 0, Yes: 1, No: 2, Void: 3 } as const;
const MODE = { Split: 1, OneSided: 2, Refund: 3 } as const;

/** The late amount on `side` the tallies have added: the late joins of every baker tallied so far. */
function talliedLate(c: ModelCampaign, side: 0 | 1): bigint {
  return sideTotal(
    c.joins.filter((j) => c.tallied.has(j.baker) && isLate(c, j.at)),
    side,
  );
}

/** Null when the chain's record of campaign `c` is the model's; otherwise the first field that differs. */
export function stateCheck(c: ModelCampaign, v: ChainView): string | null {
  const k = v.campaign;
  if (!k) return null;
  const fields: [string, unknown, unknown][] = [
    ["status", k.status, STATUS[c.phase]],
    ["event_seq (X0.4)", k.event_seq, c.seq],
    ["outcome", k.outcome, OUTCOME[c.outcome]],
    ["void_reason", k.void_reason, c.voidReason],
    ["met_late", k.met_late, false],
    ["observed_value", k.observed_value, c.observed],
    ["publish_time", k.publish_time, c.storedPublish],
    ["review_ends_at", k.review_ends_at, c.reviewEndsAt],
    ["contest_stage", k.contest_stage, c.stage],
    ["contest_ends_at", k.contest_ends_at, c.contestEndsAt],
    ["entries_untallied", k.entries_untallied, bakersOf(c).length - c.tallied.size],
    ["late_yes", k.late_yes, talliedLate(c, 0)],
    ["late_no", k.late_no, talliedLate(c, 1)],
    ["settle_mode", k.settle_mode, c.snapshot ? MODE[c.snapshot.mode] : 0],
    ["creator_share_reserved", k.creator_share_reserved, c.reserved],
  ];
  for (const [name, have, want] of fields) if (have !== want) return `${name} is ${have}, the model ${want}`;
  const note = k.void_note_hash as Uint8Array;
  return note.every((byte) => byte === c.note) ? null : `void_note_hash is not the model's note (${c.note})`;
}
