/**
 * Purpose: the keeper settles a void on the program, end to end on LiteSVM. A price campaign whose feed stopped
 *          before the deadline is voided by the keeper's own resolve (`StaleFeed`, an outside cause: the opening fee is
 *          Brot's); a void cannot move its cut-off, so the keeper tallies it at once, inside the window. After the
 *          window it finalizes it as a Refund and pays every entry back whole. In the second case a team key turns
 *          the void into a house failure inside the window (`team_void_campaign`, which needs those tallies): the
 *          opening fee goes back to the opener with the prize. Every lamport is checked against the SDK's math.
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 06 DoD: the three settle modes and a house-failure void)
 */
import { describe, expect, test } from "bun:test";
import { Outcome, SettleMode, Side, Status, VoidReason } from "@brot/sdk/read";
import { buildTeamVoidCampaign } from "@brot/sdk/tx";

import { openedCampaign } from "../../../tests/brot/flows";
import * as P from "../../../tests/brot/program";
import { expectOk, send, setPriceAccount } from "../../../tests/brot/setup";
import { runCycle } from "../src/cycle";
import { expectPaidAsOwed } from "./kit/settle-checks";
import {
  bake,
  captureOnFinalize,
  capturer,
  keeperContext,
  keeperWorld,
  readCampaignOf,
  setClockTo,
} from "./kit/settle-world";

const SOL = 1_000_000_000n;

/** A paid campaign with a YES and a NO baker whose BTC/USD feed last published 601 s before the deadline. */
async function staleFeedVoid() {
  const kw = await keeperWorld();
  const { campaign } = await openedCampaign(kw, kw.creator);
  const bakers = await bake(kw, campaign, [
    [Side.Yes, SOL],
    [Side.No, 2n * SOL],
  ]);
  const deadline = readCampaignOf(kw, campaign).deadlineAt;
  setClockTo(kw, deadline + 120n);
  setPriceAccount(kw.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { publishTime: deadline - 601n });
  // Cycle 1 resolves (past the deadline, so it is simulated); cycle 2 tallies at once (a void cannot move its cut-off).
  expect((await runCycle(keeperContext(kw), false)).counts.resolved).toBe(1);
  const voided = readCampaignOf(kw, campaign);
  expect({ status: voided.status, outcome: voided.outcome, reason: voided.voidReason }).toEqual({
    status: Status.InReview,
    outcome: Outcome.Void,
    reason: VoidReason.StaleFeed,
  });
  const tally = await runCycle(keeperContext(kw), false);
  expect(tally.settle).toMatchObject({ landed: 2, refused: 0, failed: 0 });
  const tallied = readCampaignOf(kw, campaign);
  expect({ untallied: tallied.entriesUntallied, status: tallied.status }).toEqual({
    untallied: 0,
    status: Status.InReview,
  });
  return { kw, campaign, bakers, voided: tallied };
}

describe("the keeper's settlement of a void", () => {
  test("an outside cause (StaleFeed): a Refund, entries back whole, the prize back, the opening fee kept", async () => {
    const { kw, campaign, bakers, voided } = await staleFeedVoid();
    // Inside the window nothing more happens: finalize waits for its end.
    expect((await runCycle(keeperContext(kw), false)).settle.landed).toBe(0);
    setClockTo(kw, voided.reviewEndsAt + 1n);
    const parties = [kw.creator.address, kw.feeRecipient, kw.keeper.address];
    const watch = await captureOnFinalize(
      kw,
      campaign,
      bakers.map((b) => b.address),
      parties,
    );
    const report = await runCycle(keeperContext(kw, { log: watch.log }), false);
    const captured = watch.captured();
    if (!captured) throw new Error("finalize did not land");
    expect(captured.campaign.settleMode).toBe(SettleMode.Refund);
    expect(report.settle).toMatchObject({ refused: 0, failed: 0 });
    const o = await expectPaidAsOwed(kw, campaign, captured);
    for (const baker of o.bakers) expect(baker.amount).toBe(baker.entry.amountYes + baker.entry.amountNo);
    expect(o.prize).toBe(captured.campaign.prizeLamports); // the opening fee stays with Brot
    expect(o.kept).toBe(captured.campaign.openingFeeLamports);
  });

  test("a house failure (a team void in the window): a Refund, and the opening fee goes back with the prize", async () => {
    const { kw, campaign, bakers } = await staleFeedVoid();
    const take = await capturer(
      kw,
      campaign,
      bakers.map((b) => b.address),
      [kw.creator.address, kw.feeRecipient, kw.keeper.address],
    );
    const noteHash = new Uint8Array(32).fill(7);
    const reason = VoidReason.TeamHouseFailure;
    expectOk(await send(kw, [await buildTeamVoidCampaign({ teamMember: kw.team, campaign, reason, noteHash })]));
    const captured = take();
    expect({ status: captured.campaign.status, mode: captured.campaign.settleMode }).toEqual({
      status: Status.Settling,
      mode: SettleMode.Refund,
    });
    const report = await runCycle(keeperContext(kw), false);
    expect(report.settle).toMatchObject({ refused: 0, failed: 0 });
    const o = await expectPaidAsOwed(kw, campaign, captured);
    expect(o.prize).toBe(captured.campaign.prizeLamports + captured.campaign.openingFeeLamports);
    expect(o.kept).toBe(0n);
  });
});
