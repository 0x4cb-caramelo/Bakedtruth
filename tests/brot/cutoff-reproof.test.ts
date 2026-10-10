/**
 * Purpose: the earlier-proof re-proof (decision of 2026-10-09): a campaign already in review moves its cut-off back
 *          to an earlier valid YES price proof, and to no later one; the outcome and the review window stay put.
 * Version: 0.0.1
 * Sprint:  04 (closure review)
 */
import { describe, expect, test } from "bun:test";

import { BTC_PRICE, openedCampaign } from "./flows";
import { BTC_CONF, openingWorld } from "./opening";
import { proofAccount, recorded, resolveWith } from "./price-support";
import * as P from "./program";
import { setClock } from "./readers";
import { expectError, START_TIME } from "./setup";

const TARGET = (BTC_PRICE * 11n) / 10n;
const TOUCH = TARGET + BTC_CONF;
const DAY_ONE = START_TIME + P.DAY;

describe("the cut-off moves back to an earlier valid YES proof", () => {
  test("an earlier YES proof moves publish_time back; a later one is refused; the outcome and window stay", async () => {
    const w = await openingWorld();
    const { campaign } = await openedCampaign(w, w.creator);
    setClock(w.client, { unixTimestamp: DAY_ONE });
    const late = await proofAccount(w, { price: TOUCH, publishTime: DAY_ONE - 10n });
    const first = recorded(w, campaign, await resolveWith(w, campaign, late));
    expect(first.campaign).toMatchObject({ outcome: P.Outcome.Yes, publish_time: DAY_ONE - 10n });
    const reviewEnds = first.campaign.review_ends_at;

    const early = await proofAccount(w, { price: TOUCH, publishTime: DAY_ONE - 30n });
    const moved = recorded(w, campaign, await resolveWith(w, campaign, early));
    expect(moved.campaign).toMatchObject({
      status: P.Status.InReview,
      outcome: P.Outcome.Yes,
      publish_time: DAY_ONE - 30n,
      review_ends_at: reviewEnds,
    });

    const later = await proofAccount(w, { price: TOUCH, publishTime: DAY_ONE - 5n });
    expectError(await resolveWith(w, campaign, later), "CutoffNotMovable");
  });
});
