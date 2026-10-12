/**
 * Purpose: the return a screen shows is what finalize would pay if entries closed now (Sprint 13, the legal and
 *          adversarial reviews): the split's estimate when the pot would split, and the one-sided refund when its
 *          losing side is too small to pay Brot's fee and the creator's 1% (the Economic Viability Rule), where the
 *          program's own `estimateReturnBps` would show several times more. Checked against the SDK's mirror of
 *          finalize (`snapshot`, `splitIsViable`) on a grid of pots. Filter: `bun test tests/ -t "shown return"`.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { describe, expect, test } from "bun:test";

import {
  estimateReturnBps,
  oneSidedRefund,
  SettleMode,
  shownReturnBps,
  snapshot,
  splitIsViable,
  splitsIfWins,
  type JoinedPot,
} from "@brot/sdk/read";

const SOL = 1_000_000_000n;
const RATES = { feeBps: 1_000, oneSidedFeeBps: 100, creatorShareBps: 100 };
const PRIZE = 4_118_239_224n; // a paid opening's prize at the plan's reference price

const pot = (amount: bigint, sideBefore: bigint, other: bigint, more: Partial<JoinedPot> = {}): JoinedPot => ({
  amount,
  sideAfter: sideBefore + amount,
  other,
  prize: PRIZE,
  ...RATES,
  isFirst: false,
  ...more,
});

describe("shown return", () => {
  test("a pot that would split shows the program's own estimate", () => {
    const p = pot(SOL, 5n * SOL, 4n * SOL);
    expect(splitsIfWins(p)).toBe(true);
    expect(shownReturnBps(p)).toBe(estimateReturnBps(p));
  });

  test("a losing side too small to pay the fees shows the refund, not several times the entry", () => {
    // 1 SOL on YES with this entry, 0.01 SOL on NO, and a paid opening's prize: the split formula shows about 5 per 1.
    const p = pot(SOL / 100n, 99n * (SOL / 100n), SOL / 100n);
    expect(estimateReturnBps(p)).toBeGreaterThan(40_000n);
    expect(splitsIfWins(p)).toBe(false);
    expect(shownReturnBps(p)).toBe(9_900n);
    // Finalize agrees: with these totals the pot is refunded as one-sided, and this entry gets back 99%.
    const snap = snapshot({
      verdict: { kind: "Yes" },
      yesTotal: p.sideAfter,
      noTotal: p.other,
      lateYes: 0n,
      lateNo: 0n,
      prize: PRIZE,
      openingFee: 0n,
      ...RATES,
      creatorIsTeam: false,
    });
    expect(snap.mode).toBe(SettleMode.OneSided);
    expect(oneSidedRefund(p.amount, RATES.oneSidedFeeBps, false).payout).toBe((p.amount * 9_900n) / 10_000n);
    expect(shownReturnBps({ ...p, isFirst: true })).toBe(10_000n);
  });

  test("an empty other side shows the one-sided refund, as before", () => {
    const p = pot(SOL, 0n, 0n);
    expect(shownReturnBps(p)).toBe(estimateReturnBps(p));
  });

  test("splitsIfWins is finalize's splitIsViable on every pot of a grid, team campaigns included", () => {
    const sizes = [1n, 999n, SOL / 1_000n, SOL / 100n, SOL / 89n, SOL / 10n, SOL, 7n * SOL, 100n * SOL];
    for (const team of [false, true]) {
      const creatorShareBps = team ? 0 : RATES.creatorShareBps;
      for (const side of sizes)
        for (const other of sizes) {
          const p = pot(side, 0n, other, { creatorShareBps });
          const input = {
            verdict: { kind: "Yes" as const },
            yesTotal: p.sideAfter,
            noTotal: other,
            lateYes: 0n,
            lateNo: 0n,
            prize: PRIZE,
            openingFee: 0n,
            ...RATES,
            creatorShareBps,
            creatorIsTeam: team,
          };
          expect(`${team}/${side}/${other}: ${splitsIfWins(p)}`).toBe(
            `${team}/${side}/${other}: ${splitIsViable(input, p.sideAfter, other)}`,
          );
        }
    }
  });
});
