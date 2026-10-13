/**
 * Purpose: a contested campaign's public view (Sprint 14, lane L14B; TP 3.4.2): still "In review", with its stage, the
 *          stage's deadline and the stage-2 lapse computed from the CHAIN's time (A-7); a campaign in review that is
 *          not contested, or one already paying, shows no contest. Filter: `bun test tests/ -t "contest view"`.
 * Version: 0.1.1 (review fix F3: an unread stage 1 lapses too)
 * Sprint:  14 (lane L14B)
 */
import { describe, expect, test } from "bun:test";

import {
  ACCOUNT_TAG,
  ContestStage,
  getCampaignDecoder,
  LAYOUT_VERSION,
  Outcome,
  publicState,
  Status,
  type Campaign,
} from "@brot/sdk/read";

/** A campaign as the program stores one, every field zero but the tag, then `over`. */
function campaign(over: Partial<Campaign>): Campaign {
  const data = new Uint8Array(512);
  data.set([ACCOUNT_TAG.campaign, LAYOUT_VERSION]);
  return { ...getCampaignDecoder().decode(data), ...over };
}

const chain = (unixTimestamp: bigint) => ({ slot: 1n, epoch: 0n, unixTimestamp });
const REVIEW_ENDS = 5_000n;
const contested = (stage: ContestStage, contestEndsAt: bigint) =>
  campaign({
    status: Status.Contested,
    outcome: Outcome.Yes,
    reviewEndsAt: REVIEW_ENDS,
    contestStage: stage,
    contestEndsAt,
  });

describe("contest view", () => {
  test("contest view: stage 1 is in review, paused, its re-read due by the hour's end", () => {
    const view = publicState(contested(ContestStage.Stage1, 8_600n), chain(5_100n));
    expect(view).toMatchObject({
      state: "InReview",
      contested: true,
      contestStage: ContestStage.Stage1,
      contestEndsAt: 8_600n,
      contestLapsed: false,
    });
    // Stage 1's deadline is the keeper's target, not a cut-off: past it, nothing has lapsed yet.
    expect(publicState(contested(ContestStage.Stage1, 8_600n), chain(9_000n)).contestLapsed).toBe(false);
  });

  test("contest view: a stage 1 nobody re-read lapses 48 hours after its deadline (review fix F3)", () => {
    const unread = contested(ContestStage.Stage1, 8_600n);
    const lapsesAt = 8_600n + 172_800n;
    expect(publicState(unread, chain(lapsesAt - 1n))).toMatchObject({
      contestLapsesAt: lapsesAt,
      contestLapsed: false,
    });
    expect(publicState(unread, chain(lapsesAt))).toMatchObject({ state: "InReview", contestLapsed: true });
  });

  test("contest view: stage 2 lapses at its deadline by chain time, and only then", () => {
    const stage2 = contested(ContestStage.Stage2, 180_000n);
    expect(publicState(stage2, chain(179_999n))).toMatchObject({
      contestStage: ContestStage.Stage2,
      contestLapsed: false,
    });
    expect(publicState(stage2, chain(180_000n))).toMatchObject({
      contestEndsAt: 180_000n,
      contestLapsesAt: 180_000n,
      contestLapsed: true,
    });
    // The six-hour window ended long before; it is the lapse, not the window, that lets finalize run.
    expect(publicState(stage2, chain(179_999n)).windowEnded).toBe(true);
  });

  test("contest view: no contest shows for a campaign in review or already paying", () => {
    const none = { contestStage: null, contestEndsAt: null, contestLapsesAt: null, contestLapsed: false };
    const review = campaign({ status: Status.InReview, outcome: Outcome.No, reviewEndsAt: REVIEW_ENDS });
    expect(publicState(review, chain(1n))).toMatchObject({ state: "InReview", contested: false, ...none });
    // A campaign that was contested and is now paying keeps its stage in the account, not in the view.
    const paying = campaign({ status: Status.Settling, outcome: Outcome.Yes, contestStage: ContestStage.Stage2 });
    expect(publicState(paying, chain(1n))).toMatchObject({ state: "Paid", ...none });
  });
});
