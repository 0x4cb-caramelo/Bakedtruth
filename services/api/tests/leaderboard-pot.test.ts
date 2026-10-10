/**
 * Purpose: what the leaderboard route reads from a live account for the founder's answer 3a (2026-10-10), with fake
 *          data and no cluster: whether a final pot splits (the mode finalize stored, or the one it would store from
 *          the totals: one side empty, or a losing side too small to pay Brot's fee and the creator's 1%; a team
 *          campaign has no creator share), totals finalize would refuse never final, and the creator's own wallet left
 *          unranked on a burn, lock or stake campaign it opened. Filter: `bun test services/api -t "leaderboard route"`.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { describe, expect, test } from "bun:test";
import { Outcome, ReaderKind, SettleMode, Side } from "@brot/sdk/read";

import { nowOf } from "../src/leaderboard";
import { ADDR, call, ended, entry, EVENTS, history, POT, row, SNAP, SOL, view, WALLET } from "./board-kit";

describe("leaderboard route, the founder's answer 3a", () => {
  test("a final pot is refunded when finalize stored it so, or would: one side empty or too small for the fees", () => {
    const priceYes = (pot: Partial<typeof POT>, v = ended) => nowOf(row(7, Outcome.Yes, v, ReaderKind.PriceTouch, pot));
    expect(priceYes({ settleMode: SettleMode.OneSided }, view("Paid"))).toMatchObject({ final: true, oneSided: true });
    expect(priceYes({})).toMatchObject({ final: false }); // a YES price result waits for settling
    const pot = (more: Partial<typeof POT>) => nowOf(row(8, Outcome.No, ended, ReaderKind.SupplyAtMost, more));
    expect(pot({})).toMatchObject({ final: true, oneSided: false });
    expect(pot({ poolYes: 0n })).toMatchObject({ final: true, oneSided: true });
    // 0.001 SOL on the losing side cannot pay Brot's 10% and the creator's 1% of the pot: every entry comes back.
    expect(pot({ poolYes: SOL / 1000n })).toMatchObject({ final: true, oneSided: true });
    // A team campaign takes no creator share, so the same pot with 0.002 SOL losing splits.
    expect(pot({ poolYes: SOL / 500n, creatorIsTeam: true })).toMatchObject({ final: true, oneSided: false });
    expect(pot({ poolYes: SOL / 500n })).toMatchObject({ final: true, oneSided: true });
    // Totals finalize would refuse are not final: nothing scores until they read.
    expect(pot({ feeBps: 20_000 })).toMatchObject({ final: false, oneSided: false });
    expect(nowOf(SNAP.rows[0])).toEqual({
      outcome: Outcome.Yes,
      final: true,
      oneSided: false,
      creator: WALLET(9),
      kind: ReaderKind.SupplyAtMost,
    });
  });

  test("the creator's own wallet scores nothing on a burn, lock or stake campaign it opened", async () => {
    const events = [...EVENTS, entry(ADDR(1), WALLET(9), Side.Yes, 6)];
    const { body } = await call(history(events), "/api/v1/leaderboard");
    expect(body.rows.map((r: any) => r.wallet)).not.toContain(WALLET(9));
    expect(body.total).toBe(3);
    expect(body.both_sides_score).toBe(false);
    expect(body.rule).toContain("the pot splits");
  });
});
