/**
 * Purpose: the keeper settles on the program, end to end on LiteSVM, with nobody else acting (Sprint 06 DoD: resolve,
 *          finalize, settle in batches): a paid BTC/USD campaign with bakers on both sides resolves YES and pays as a
 *          Split; one with YES bakers only pays as OneSided. Inside the review window a YES price campaign is left
 *          alone (its cut-off may still move); after it, one cycle tallies, finalizes, settles every entry, pays the
 *          creator share and the prize, collects the fee, closes the campaign and sweeps the fee vault. Every lamport
 *          is checked against the SDK's math (kit/settle-checks.ts). Needs target/deploy/brot_markets.so.
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 06 DoD: the keeper's settlement)
 */
import { describe, expect, test } from "bun:test";
import { Outcome, SettleMode, Side, Status } from "@brot/sdk/read";

import { openedCampaign } from "../../../tests/brot/flows";
import { runCycle } from "../src/cycle";
import { expectPaidAsOwed } from "./kit/settle-checks";
import {
  bake,
  captureOnFinalize,
  keeperContext,
  keeperWorld,
  readCampaignOf,
  setClockTo,
  touchBtc,
} from "./kit/settle-world";

const SOL = 1_000_000_000n;

async function resolvedYes(joins: Array<[number, bigint]>) {
  const kw = await keeperWorld();
  const { campaign } = await openedCampaign(kw, kw.creator);
  const bakers = await bake(kw, campaign, joins);
  touchBtc(kw);
  const first = await runCycle(keeperContext(kw), false);
  expect(first.counts.resolved).toBe(1);
  const resolved = readCampaignOf(kw, campaign);
  expect({ status: resolved.status, outcome: resolved.outcome }).toEqual({
    status: Status.InReview,
    outcome: Outcome.Yes,
  });
  return { kw, campaign, bakers, resolved };
}

/** Runs one keeper cycle after the window, capturing the world the moment the snapshot lands. */
async function settleAfterWindow(r: Awaited<ReturnType<typeof resolvedYes>>) {
  const { kw, campaign, bakers, resolved } = r;
  setClockTo(kw, resolved.reviewEndsAt + 1n);
  const parties = [kw.creator.address, kw.feeRecipient, kw.keeper.address];
  const watch = await captureOnFinalize(
    kw,
    campaign,
    bakers.map((b) => b.address),
    parties,
  );
  const report = await runCycle(keeperContext(kw, { log: watch.log }), false);
  const captured = watch.captured();
  if (!captured) throw new Error("finalize did not land in the keeper's cycle");
  return { report, captured };
}

describe("the keeper's settlement on the program", () => {
  test("a Split: resolved, left alone in the window, then tallied, finalized, paid, closed and swept in one cycle", async () => {
    const r = await resolvedYes([
      [Side.Yes, 2n * SOL],
      [Side.Yes, SOL],
      [Side.No, 3n * SOL],
    ]);
    // Inside the window a YES price result may still move its cut-off: no tally, no finalize, nothing sent.
    const inside = await runCycle(keeperContext(r.kw), false);
    expect(inside.settle).toMatchObject({ landed: 0, refused: 0, failed: 0 });
    expect(inside.settle.pending).toMatchObject({ tally: 0, finalize: 0 });

    const { report, captured } = await settleAfterWindow(r);
    expect(captured.campaign.settleMode).toBe(SettleMode.Split);
    expect(report.settle).toMatchObject({ refused: 0, failed: 0 });
    const o = await expectPaidAsOwed(r.kw, r.campaign, captured);
    expect(o.share > 0n).toBe(true); // a non-team opening: the creator share is paid
    expect(o.bakers.find((b) => b.baker === r.bakers[2]!.address)?.amount).toBe(0n); // the NO side lost

    // A second cycle finds nothing left and sends nothing.
    const again = await runCycle(keeperContext(r.kw), false);
    expect(again.settle).toMatchObject({ landed: 0, refused: 0, failed: 0 });
  });

  test("a OneSided pot: entries back less the one-sided fee (the first baker exempt), the prize back to the opener", async () => {
    const r = await resolvedYes([
      [Side.Yes, SOL],
      [Side.Yes, 2n * SOL],
    ]);
    const { report, captured } = await settleAfterWindow(r);
    expect(captured.campaign.settleMode).toBe(SettleMode.OneSided);
    expect(report.settle).toMatchObject({ refused: 0, failed: 0 });
    const o = await expectPaidAsOwed(r.kw, r.campaign, captured);
    const [first, second] = o.bakers;
    expect(first!.oneSidedFee).toBe(0n);
    expect(second!.oneSidedFee > 0n).toBe(true);
    expect(o.share).toBe(0n);
    expect(o.prize).toBe(captured.campaign.prizeLamports);
  });
});
