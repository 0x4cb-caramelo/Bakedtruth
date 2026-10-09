/**
 * Purpose: the price kind's YES proof window in LiteSVM (TP sections 3.4.6 and 3.4.8; Q4; D7): a
 *          touch proven from any address resolves YES inside `[opens_at, deadline]` while at most
 *          60 s old and posted within 600 slots, its whole band across the target; NO waits for
 *          the deadline plus 60 s; a sponsored feed stale at the deadline, or rescaled since the
 *          opening, voids the campaign.
 * Version: 0.0.2
 * Sprint:  03 (readers and resolution), lane C. Runs after the SBF build (lanes C and D).
 */
import { describe, expect, test } from "bun:test";
import type { Address } from "@solana/kit";

import { BTC_PRICE, openedCampaign } from "./flows";
import { BTC_CONF, openingWorld } from "./opening";
import { capturedPrice, proofAccount, recorded, resolveWith } from "./price-support";
import * as P from "./program";
import { setClock } from "./readers";
import { expectError, setPriceAccount, START_TIME, type World } from "./setup";

/** The default campaign's target (110% of BTC/USD) and the lowest price whose whole band reaches it. */
const TARGET = (BTC_PRICE * 11n) / 10n;
const TOUCH = TARGET + BTC_CONF;
/** A day into the campaign, and the slot the captured BTC/USD update was posted in. */
const DAY_ONE = START_TIME + P.DAY;
const POSTED_SLOT = capturedPrice("pyth-btc-usd-devnet").postedSlot;

/** A world with the default BTC/USD campaign, opened at `START_TIME` (its `opens_at`), seven days long. */
async function campaignWorld() {
  const w = await openingWorld();
  const { campaign, args } = await openedCampaign(w, w.creator);
  return { w, campaign, deadline: args.deadlineAt };
}

/** Resolves `campaign` with a touching proof published at `publishTime`; the outcome must be YES. */
async function provesYes(w: World, campaign: Address, publishTime: bigint) {
  const proof = await proofAccount(w, { price: TOUCH, publishTime });
  const { campaign: c, event } = recorded(w, campaign, await resolveWith(w, campaign, proof));
  expect(c).toMatchObject({ outcome: P.Outcome.Yes, void_reason: P.VoidReason.None, observed_value: TOUCH });
  expect(event).toMatchObject({ outcome: P.Outcome.Yes, read_account: proof, publish_time: publishTime });
  return event;
}

/** Points the sponsored BTC/USD account at `publishTime`, its captured price far from the target. */
const sponsoredAt = (w: World, publishTime: bigint) =>
  setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { publishTime });

describe("yes proof window", () => {
  test("a touch proven from any address inside the window resolves YES, with its evidence", async () => {
    const { w, campaign } = await campaignWorld();
    setClock(w.client, { unixTimestamp: DAY_ONE });
    const event = await provesYes(w, campaign, DAY_ONE - 10n);
    expect(event).toMatchObject({ observed_value: TOUCH, posted_slot: POSTED_SLOT, met_late: false });
  });

  test("refused for a touch published before opens_at; opens_at itself counts", async () => {
    const { w, campaign } = await campaignWorld();
    setClock(w.client, { unixTimestamp: START_TIME + 10n });
    const early = await proofAccount(w, { price: TOUCH, publishTime: START_TIME - 1n });
    expectError(await resolveWith(w, campaign, early), "ProofOutsideWindow");
    await provesYes(w, campaign, START_TIME);
  });

  test("refused for a touch published after the deadline; the deadline's own second counts", async () => {
    const { w, campaign, deadline } = await campaignWorld();
    setClock(w.client, { unixTimestamp: deadline + 30n });
    const late = await proofAccount(w, { price: TOUCH, publishTime: deadline + 1n });
    expectError(await resolveWith(w, campaign, late), "ProofOutsideWindow");
    await provesYes(w, campaign, deadline);
  });

  test("refused for a proof 61 s old; 60 s old counts", async () => {
    const { w, campaign } = await campaignWorld();
    setClock(w.client, { unixTimestamp: DAY_ONE });
    const old = await proofAccount(w, { price: TOUCH, publishTime: DAY_ONE - 61n });
    expectError(await resolveWith(w, campaign, old), "ProofStale");
    await provesYes(w, campaign, DAY_ONE - 60n);
  });

  test("refused for a proof posted more than 600 slots ago (60 s at 100 ms a slot)", async () => {
    const { w, campaign } = await campaignWorld();
    setClock(w.client, { unixTimestamp: DAY_ONE, slot: 10_000n });
    const posted = (postedSlot: bigint) => proofAccount(w, { price: TOUCH, publishTime: DAY_ONE, postedSlot });
    expectError(await resolveWith(w, campaign, await posted(9_399n)), "ProofStale");
    const onBound = await posted(9_400n);
    const { event } = recorded(w, campaign, await resolveWith(w, campaign, onBound));
    expect(event).toMatchObject({ outcome: P.Outcome.Yes, read_account: onBound, posted_slot: 9_400n });
  });

  test("refused when the whole band does not cross the target", async () => {
    const { w, campaign } = await campaignWorld();
    setClock(w.client, { unixTimestamp: DAY_ONE });
    // One unit short, and the price on the target with its band only reaching across.
    for (const price of [TOUCH - 1n, TARGET]) {
      const proof = await proofAccount(w, { price, publishTime: DAY_ONE });
      expectError(await resolveWith(w, campaign, proof), "ProofDoesNotTouch");
    }
  });

  test("NO only after the deadline plus 60 s: refused at D + 60, recorded at D + 61", async () => {
    const { w, campaign, deadline } = await campaignWorld();
    // A fresh sponsored update after the deadline, nowhere near the target.
    sponsoredAt(w, deadline + 30n);
    setClock(w.client, { unixTimestamp: deadline + 60n });
    expectError(await resolveWith(w, campaign), "ProofOutsideWindow");
    // The same call with nothing to offer (the program's address in the proof slot) says why.
    expectError(await resolveWith(w, campaign, P.PROGRAM_ID), "NotResolvableYet");
    setClock(w.client, { unixTimestamp: deadline + 61n });
    const { campaign: c, event } = recorded(w, campaign, await resolveWith(w, campaign));
    expect(c).toMatchObject({ outcome: P.Outcome.No, void_reason: P.VoidReason.None, met_late: false });
    expect(c.observed_value).toBe(BTC_PRICE);
    expect(event).toMatchObject({ read_account: P.BTC_USD_ACCOUNT, publish_time: deadline + 30n });
  });

  test("a sponsored feed older than deadline − max(max_age, 600 s) at the deadline voids as StaleFeed", async () => {
    const w = await openingWorld();
    const stale = await openedCampaign(w, w.creator);
    const fresh = await openedCampaign(w, w.creator);
    const deadline = stale.args.deadlineAt;
    expect(fresh.args.deadlineAt).toBe(deadline);
    setClock(w.client, { unixTimestamp: deadline + 61n });
    // max_age is 120 s, under the 600 s floor: an update 601 s before the deadline, and none
    // since, is a stale feed.
    const edge = deadline - P.STALE_FEED_MIN_SECONDS;
    sponsoredAt(w, edge - 1n);
    const voided = recorded(w, stale.campaign, await resolveWith(w, stale.campaign));
    expect(voided.campaign).toMatchObject({ outcome: P.Outcome.Void, void_reason: P.VoidReason.StaleFeed });
    expect(voided.event).toMatchObject({ read_account: P.BTC_USD_ACCOUNT, publish_time: edge - 1n });
    // 600 s before it was still fresh: NO.
    sponsoredAt(w, edge);
    const no = recorded(w, fresh.campaign, await resolveWith(w, fresh.campaign));
    expect(no.campaign).toMatchObject({ outcome: P.Outcome.No, void_reason: P.VoidReason.None });
  });

  test("a sponsored feed in another exponent after the window voids as UnreadableAccount", async () => {
    const { w, campaign, deadline } = await campaignWorld();
    setClock(w.client, { unixTimestamp: deadline + 61n });
    setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { publishTime: deadline - 10n, exponent: -7 });
    const { campaign: c, event } = recorded(w, campaign, await resolveWith(w, campaign));
    expect(c).toMatchObject({ outcome: P.Outcome.Void, void_reason: P.VoidReason.UnreadableAccount });
    expect(event).toMatchObject({ read_account: P.BTC_USD_ACCOUNT, publish_time: deadline - 10n });
  });
});
