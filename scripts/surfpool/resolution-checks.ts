/**
 * Purpose: what the price-touch run asserts about `resolve_campaign`, against the semantics frozen
 *          at Sprint 03's opening: refused while no YES is proven, then YES with the proof recorded
 *          in the campaign and in exactly one `CampaignResolved` event.
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution): the Surfpool run of the price reader
 */
import type { Address } from "@solana/kit";

import { BrotError } from "../../tests/brot/errors";
import * as P from "../../tests/brot/program";
import * as C from "./campaign";
import type { PriceValues } from "./pyth-model";
import type { Rpc, Sent } from "./rpc";

/** The YES proof's age bound (Q4) and its slot bound, `ceil(60 s × 1,000 / MIN_SLOT_MS)`. */
const PROOF_MAX_AGE = 60n;
const PROOF_MAX_SLOTS = (PROOF_MAX_AGE * 1_000n) / P.MIN_SLOT_MS;
/**
 * The frozen contract has two codes for "no YES proven yet" before the deadline; which one a proof
 * that is valid but does not cross the target gets is lane C's choice, so both are accepted.
 */
const NO_YES_YET: number[] = [BrotError.ProofDoesNotTouch, BrotError.NotResolvableYet];

/** Refused with one of the two codes, and the campaign still `Open` and `Unresolved`. */
export async function expectNoYesYet(rpc: Rpc, sent: Sent, campaign: Address) {
  if (sent.code === BrotError.ReaderNotReady) {
    throw new Error(
      "resolve_campaign answered ReaderNotReady (6070): this binary's price reader is the frozen " +
        "contract's stub. The refusal and the YES are checked against the integrated build.",
    );
  }
  const refusedRightly = !sent.ok && sent.code !== null && NO_YES_YET.includes(sent.code);
  const got = `${C.describeFailure(sent)}\n${sent.logs.join("\n")}`;
  C.expectThat(
    refusedRightly,
    `before the move: expected ProofDoesNotTouch (6085) or NotResolvableYet (6072), got ${got}`,
  );
  const unchanged = await C.readCampaign(rpc, campaign);
  C.expectEqual("campaign.status after the refusal", unchanged.status, P.Status.Open);
  C.expectEqual("campaign.outcome after the refusal", unchanged.outcome, P.Outcome.Unresolved);
  C.expectEqual("campaign.event_seq after the refusal", unchanged.event_seq, 1n);
}

/**
 * YES recorded from `proof` (the account the move wrote): the campaign `InReview` for the review
 * window, the proof's price as the observed value, and one `CampaignResolved` (seq 1, after
 * `CampaignOpened`) carrying the proof account, its publish time and its posted slot.
 */
export async function expectYes(rpc: Rpc, sent: Sent, campaign: Address, proof: Address, move: Required<PriceValues>) {
  C.expectOk(sent, "resolve_campaign after the move");
  const after = await C.readCampaign(rpc, campaign);
  C.expectEqual("campaign.status", after.status, P.Status.InReview);
  C.expectEqual("campaign.outcome", after.outcome, P.Outcome.Yes);
  C.expectEqual("campaign.void_reason", after.void_reason, P.VoidReason.None);
  C.expectEqual("campaign.met_late", after.met_late, false);
  C.expectEqual("campaign.observed_value (the proof's price)", after.observed_value, move.price);
  const reviewEnds = (after.resolved_at as bigint) + P.REVIEW_WINDOW_SECONDS;
  C.expectEqual("campaign.review_ends_at", after.review_ends_at, reviewEnds);
  C.expectEqual("campaign.event_seq", after.event_seq, 2n);

  const events = sent.events.filter((e) => e.name === "CampaignResolved");
  C.expectEqual("CampaignResolved events", events.length, 1);
  const e = events[0].data;
  C.expectEqual("event.campaign", e.campaign, campaign);
  C.expectEqual("event.seq", e.seq, 1n);
  C.expectEqual("event.kind", e.kind, P.ReaderKind.PriceTouch);
  C.expectEqual("event.outcome", e.outcome, P.Outcome.Yes);
  C.expectEqual("event.void_reason", e.void_reason, P.VoidReason.None);
  C.expectEqual("event.met_late", e.met_late, false);
  C.expectEqual("event.observed_value", e.observed_value, move.price);
  C.expectEqual("event.read_account (the proof)", e.read_account, proof);
  C.expectEqual("event.publish_time", e.publish_time, move.publishTime);
  C.expectEqual("event.posted_slot", e.posted_slot, move.postedSlot);
  C.expectEqual("event.resolved_at", e.resolved_at, after.resolved_at);
  C.expectEqual("event.review_ends_at", e.review_ends_at, after.review_ends_at);
  const age = (e.resolved_at as bigint) - move.publishTime;
  C.expectThat(age >= 0n && age <= PROOF_MAX_AGE, `the proof was ${age} s old at resolution`);
  const lag = (e.slot as bigint) - move.postedSlot;
  C.expectThat(lag <= PROOF_MAX_SLOTS, `the proof was ${lag} slots old at resolution`);
  return { event: e, age, lag };
}
