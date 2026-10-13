/**
 * Purpose: the admin's decision in the indexer's rows (Sprint 14, lane L14R; second review, I1), over hand-built event
 *          streams through the real ingest: a `ContestClosed` with a Void decision makes the campaign's outcome Void
 *          with the team's reason, so the KPIs stop counting it as decided and a referee's winning entry there earns
 *          nothing; a Confirm keeps the stored outcome, which pays as a split. Filter: `bun test services/indexer -t referral`.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import { describe, expect, test } from "bun:test";
import { VoidReason } from "@brot/sdk/read";

import { computeKpis } from "../src/kpis";
import { Campaign } from "./referral-campaign";
import { Chain, DAY, indexed, SOL, T0, wallet } from "./referral-chain";

const [R, F, D] = [wallet(1), wallet(2), wallet(4)];

describe("referral contest", () => {
  test("an admin's Void through ContestClosed is a void in the row, the KPIs and the referral; a Confirm is not", async () => {
    const chain = new Chain();
    chain.link(R, F);
    const [voided, confirmed] = [new Campaign(chain, 1), new Campaign(chain, 2)];
    for (const c of [voided, confirmed]) {
      c.join(R, "yes", SOL);
      c.join(D, "no", 2n * SOL);
    }
    voided.finalize("yes", { contest: VoidReason.TeamHouseFailure });
    voided.settle();
    confirmed.finalize("yes", { contest: "confirm" });
    confirmed.settle();
    const x = await indexed(chain);
    const row = (c: Campaign) =>
      x.store.db
        .query("SELECT status, outcome, void_reason, settle_mode FROM campaigns WHERE address = ?")
        .get(c.address);
    expect(row(voided)).toEqual({
      ...{ status: "Settled", outcome: "Void", void_reason: "TeamHouseFailure", settle_mode: "Refund" },
    });
    expect(row(confirmed)).toEqual({ status: "Settled", outcome: "Yes", void_reason: "None", settle_mode: "Split" });
    const resolution = computeKpis(x.store, [], T0 + 100 * DAY).resolution;
    expect(resolution).toMatchObject({ resolved: 2, yes: 1, no: 0, void: { TeamHouseFailure: 1 }, contested: 2 });
    expect(x.entries(R).map((e) => [e.settle_mode, e.state])).toEqual([
      ["Refund", "no_fee"],
      ["Split", "payable"],
    ]);
  });
});
