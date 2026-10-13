/**
 * Purpose: a contested campaign's public view (Sprint 14, lane L14B; TP 3.4.2): still "In review", with its stage, the
 *          stage's deadline, stage 1's wait before a matching re-read pays and the team's escalation until then (D2),
 *          and the lapse, all from the CHAIN's time (A-7); a campaign in review that is not contested, or one already
 *          paying, shows no contest. Filter: `bun test tests/ -t "contest view"`.
 * Version: 0.1.2 (D2: stage 1's 24 hours and the escalation; review fix F3: an unread stage 1 lapses too)
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
/** Stage 1's deadline for a contest opened at 5,100: its 24 hours later. */
const STAGE1_ENDS = 5_100n + 86_400n;
const contested = (stage: ContestStage, contestEndsAt: bigint) =>
  campaign({
    status: Status.Contested,
    outcome: Outcome.Yes,
    reviewEndsAt: REVIEW_ENDS,
    contestStage: stage,
    contestEndsAt,
  });

describe("contest view", () => {
  test("contest view: stage 1 is in review, paused, a matching re-read waits for its deadline, the team escalates until then", () => {
    const stage1 = contested(ContestStage.Stage1, STAGE1_ENDS);
    expect(publicState(stage1, chain(5_100n))).toMatchObject({
      state: "InReview",
      contested: true,
      contestStage: ContestStage.Stage1,
      contestEndsAt: STAGE1_ENDS,
      contestTimelockEndsAt: STAGE1_ENDS,
      contestEscalable: true,
      contestLapsed: false,
    });
    // The team's hand closes at stage 1's deadline, when a matching re-read may pay; nothing has lapsed there.
    expect(publicState(stage1, chain(STAGE1_ENDS - 1n)).contestEscalable).toBe(true);
    expect(publicState(stage1, chain(STAGE1_ENDS))).toMatchObject({ contestEscalable: false, contestLapsed: false });
  });

  test("contest view: a stage 1 nobody re-read lapses 48 hours after its deadline (review fix F3)", () => {
    const unread = contested(ContestStage.Stage1, STAGE1_ENDS);
    const lapsesAt = STAGE1_ENDS + 172_800n;
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
      contestTimelockEndsAt: null,
      contestEscalable: false,
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
    const none = {
      contestStage: null,
      contestEndsAt: null,
      contestTimelockEndsAt: null,
      contestEscalable: false,
      contestLapsesAt: null,
      contestLapsed: false,
    };
    const review = campaign({ status: Status.InReview, outcome: Outcome.No, reviewEndsAt: REVIEW_ENDS });
    expect(publicState(review, chain(1n))).toMatchObject({ state: "InReview", contested: false, ...none });
    // A campaign that was contested and is now paying keeps its stage in the account, not in the view.
    const paying = campaign({ status: Status.Settling, outcome: Outcome.Yes, contestStage: ContestStage.Stage2 });
    expect(publicState(paying, chain(1n))).toMatchObject({ state: "Paid", ...none });
  });
});
