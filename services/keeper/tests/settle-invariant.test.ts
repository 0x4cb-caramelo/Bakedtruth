/**
 * Purpose: the settlement's money-invariant alert (Sprint 16, the second pre-freeze review's R1): `settle_invariant`
 *          is raised for a refusal with 6101, 6179 or 6180, refused before sending or failed on chain, once per campaign,
 *          and for nothing else; and end to end on LiteSVM, a campaign whose payouts already passed its snapshot's cap
 *          (a state no settlement produces, written into the world) has its share, prize and fee refused by the
 *          program over two cycles, and the keeper raises one alert for it.
 * Version: 0.0.1
 * Sprint:  16 (lane L16P)
 */
import { describe, expect, test } from "bun:test";
import { generateKeyPairSigner } from "@solana/kit";
import { BROT_ERROR_CODES } from "@brot/sdk/read";

import { injectCampaign } from "../../../tests/brot/campaigns";
import { newId } from "../../../tests/brot/flows";
import { settleSplit } from "../../../tests/brot/money-model";
import * as P from "../../../tests/brot/program";
import { now } from "../../../tests/brot/setup";
import { createAlerter } from "../src/alert";
import { runCycle } from "../src/cycle";
import type { ItemResult } from "../src/landing";
import { alertInvariants } from "../src/settle-alert";
import { keeperContext, keeperWorld } from "./kit/settle-world";

const SOL = 1_000_000_000n;
const result = (outcome: ItemResult["outcome"], code: number | null): ItemResult => ({
  key: "collectFee:C",
  kind: "collectFee",
  outcome,
  detail: null,
  code,
});

function alerts() {
  const lines: Record<string, unknown>[] = [];
  const alerter = createAlerter({ emit: (line) => lines.push(JSON.parse(line)), dedupeMs: 0 });
  return { lines, sink: { alerter, raised: new Set<string>() } };
}

describe("settle_invariant", () => {
  test("a refusal for a money invariant raises it once per campaign; any other outcome or code does not", () => {
    const { lines, sink } = alerts();
    expect(
      alertInvariants(sink, "A", [result("landed", null), result("refused", BROT_ERROR_CODES.AlreadySettled)]),
    ).toBe(false);
    for (const code of [
      BROT_ERROR_CODES.InvariantViolated,
      BROT_ERROR_CODES.SnapshotInconsistent,
      BROT_ERROR_CODES.EntryPayoutAboveShare,
      BROT_ERROR_CODES.RefundPayoutAboveEntry,
      BROT_ERROR_CODES.OneSidedPayoutNotExact,
    ]) {
      expect(alertInvariants(sink, `B${code}`, [result("failed", code)])).toBe(true);
    }
    expect(alertInvariants(sink, "C", [result("refused", BROT_ERROR_CODES.PaidOutAboveSnapshot)])).toBe(true);
    expect(alertInvariants(sink, "C", [result("refused", BROT_ERROR_CODES.PaidOutAboveSnapshot)])).toBe(false);
    expect(alertInvariants(undefined, "D", [result("refused", BROT_ERROR_CODES.InvariantViolated)])).toBe(false);
    expect(lines.map((line) => [line.kind, line.key, line.code, line.error])).toEqual([
      ["settle_invariant", "B6101", 6101, "InvariantViolated"],
      ["settle_invariant", "B6102", 6102, "SnapshotInconsistent"],
      ["settle_invariant", "B6180", 6180, "EntryPayoutAboveShare"],
      ["settle_invariant", "B6181", 6181, "RefundPayoutAboveEntry"],
      ["settle_invariant", "B6182", 6182, "OneSidedPayoutNotExact"],
      ["settle_invariant", "C", 6179, "PaidOutAboveSnapshot"],
    ]);
  });

  test("end to end: a campaign paid past its snapshot's cap is refused every cycle and alerted once", async () => {
    const kw = await keeperWorld();
    const split = settleSplit({ winning: 2n * SOL, losing: SOL, prize: 0n, feeBps: 1_000n, creatorBps: 100n });
    const share = split.creatorFromPot + split.creatorFromFee;
    const t = now(kw.client);
    const { campaign } = await injectCampaign(kw.client, {
      id: newId(),
      kind: P.ReaderKind.SupplyAtMost,
      metric: (await generateKeyPairSigner()).address,
      target: 1n,
      creator: kw.creator.address,
      opensAt: t - P.DAY,
      entriesCloseAt: t - P.HOUR,
      deadlineAt: t - P.HOUR,
      poolYes: 2n * SOL,
      poolNo: SOL,
      status: P.Status.Settled,
      extra: {
        outcome: P.Outcome.Yes,
        settle_mode: 1, // Split
        winning_total: 2n * SOL,
        losing_total: SOL,
        distributable: split.distributable,
        fee_total: split.fee,
        creator_share: share,
        creator_share_from_fee: split.creatorFromFee,
        paid_out_total: split.distributable + share + 1n,
      },
    });
    const { lines, sink } = alerts();
    const ctx = keeperContext(kw);
    ctx.settle.invariants = sink;
    for (let cycle = 0; cycle < 2; cycle++) {
      const report = await runCycle(ctx, false);
      expect(report.settle).toMatchObject({ landed: 0, refused: 3 });
    }
    expect(lines.map((line) => [line.kind, line.key, line.code])).toEqual([
      ["settle_invariant", campaign, BROT_ERROR_CODES.PaidOutAboveSnapshot],
    ]);
  });
});
