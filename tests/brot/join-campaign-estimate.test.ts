/**
 * Purpose: pins the join tests' copy of the money math to the worked examples of TP section
 *          3.4.16, so a failing join test points at the program and not at its expectation. Runs
 *          without the program binary.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane E
 */
import { describe, expect, test } from "bun:test";

import { distributable, estimateReturnBps, oneSidedRefund, splitPayout } from "./join-campaign-support";

const R = 4_118_239_224n; // the prize of a US$500 opening at 109.27 US$ per SOL
const pot = { prize: R, feeBps: 1_000n, oneSidedFeeBps: 100n, creatorShareBps: 100n, isFirst: false };

describe("join estimate mirror", () => {
  test("worked example A: a paid campaign, YES wins", () => {
    const [V, P] = [6_000_000_000n, 4_000_000_000n];
    const dist = distributable(V, P, R, 1_000n, 100n);
    expect(dist).toBe(13_618_239_224n);
    expect(splitPayout(4_000_000_000n, dist, V)).toBe(9_078_826_149n); // Ana
    expect(splitPayout(2_000_000_000n, dist, V)).toBe(4_539_413_074n); // Bruno
    // "Each 1 SOL on YES returns 2.2697 SOL; without the prize it would be 1.5833."
    const one = { ...pot, amount: 1_000_000_000n, sideAfter: V, other: P };
    expect(estimateReturnBps(one)).toBe(22_697n);
    expect(estimateReturnBps({ ...one, prize: 0n })).toBe(15_833n);
  });

  test("worked example B: the share the fee pays leaves every winner whole", () => {
    expect(distributable(600_000_000_000n, 1_000_000_000n, R, 1_000n, 100n)).toBe(600_000_000_000n);
  });

  test("worked example C: a one-sided pot, the first baker exempt", () => {
    expect(oneSidedRefund(1_000_000_000n, 100n, true)).toBe(1_000_000_000n);
    expect(oneSidedRefund(2_000_000_000n, 100n, false)).toBe(1_980_000_000n);
    expect(oneSidedRefund(3_000_000_000n, 100n, false)).toBe(2_970_000_000n);
    const alone = { ...pot, amount: 1_000_000_000n, sideAfter: 1_000_000_000n, other: 0n };
    expect(estimateReturnBps({ ...alone, isFirst: true })).toBe(10_000n);
    expect(estimateReturnBps(alone)).toBe(9_900n);
  });
});
