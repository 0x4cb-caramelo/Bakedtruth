/**
 * Purpose: the money rules checked on the reference model alone, with no program: the one-sided pot's rows,
 *          the winners' floor (I11), the late-entry refund as a property over random pots, and I9 as a
 *          property of the payout rule. Runs with `bun test tests/brot/invariant-rules.test.ts`.
 * Version: 0.0.1
 * Sprint:  04 (contract freeze, lane E)
 */
import { describe, expect, test } from "bun:test";

import { checkSplitNeverPaysMore } from "./invariant-checks";
import {
  collectDue,
  CREATOR_BPS,
  entryPayout,
  FEE_BPS,
  ONE_SIDED_BPS,
  type Join,
  type ModelCampaign,
  newCampaign,
  prizeDue,
  snapshotOf,
} from "./invariant-model";
import { feeCeil, payoutOf, settleSplit } from "./money-model";
import { seededRandom } from "./invariant-harness";

const SOL = 1_000_000_000n;
const pot = (joins: Join[], over: Partial<ModelCampaign> = {}): ModelCampaign => {
  const c = newCampaign({
    label: "pot",
    team: false,
    creator: "creator",
    prize: 0n,
    openingFee: 0n,
    deadline: 0n,
    opensAt: 0n,
    entriesCloseAt: 0n,
  });
  Object.assign(c, { joins, ...over, outcome: over.outcome ?? "Yes" });
  c.snapshot = snapshotOf(c);
  return c;
};
const join = (baker: string, side: 0 | 1, amount: bigint, at = 0n): Join => ({ baker, side, amount, at });

describe("one-sided pot", () => {
  test("one-sided pot: Ana, Bruno and Carla come back 100, 198 and 297, Brot keeps 5", () => {
    const c = pot([join("ana", 0, 1n * SOL), join("bruno", 0, 2n * SOL), join("carla", 0, 3n * SOL)], {
      prize: 4_118_239_224n,
      openingFee: 457_582_136n,
    });
    expect(c.snapshot?.mode).toBe("OneSided");
    expect(entryPayout(c, "ana")).toBe(1n * SOL);
    expect(entryPayout(c, "bruno")).toBe(1_980_000_000n);
    expect(entryPayout(c, "carla")).toBe(2_970_000_000n);
    expect(collectDue(c)).toBe(50_000_000n + 457_582_136n);
    expect(prizeDue(c)).toBe(4_118_239_224n);
  });

  test("one-sided pot: only losers (all on NO, outcome Yes) pay the same one-sided fee", () => {
    const c = pot([join("ana", 1, 1n * SOL), join("bruno", 1, 2n * SOL)], { prize: 9n * SOL });
    expect(c.snapshot?.mode).toBe("OneSided");
    expect(entryPayout(c, "bruno")).toBe(2n * SOL - feeCeil(2n * SOL, ONE_SIDED_BPS));
    // Ana is the first baker, so her entry pays no fee; Bruno's pays 1%.
    expect(collectDue(c)).toBe(feeCeil(2n * SOL, ONE_SIDED_BPS));
  });

  test("one-sided pot: a single baker gets its whole entry back and Brot keeps only the opening fee", () => {
    const c = pot([join("ana", 0, 5n * SOL)], { prize: 4n * SOL, openingFee: 500_000_000n });
    expect(entryPayout(c, "ana")).toBe(5n * SOL);
    expect(collectDue(c)).toBe(500_000_000n);
    expect(prizeDue(c)).toBe(4n * SOL);
  });

  test("one-sided pot: without a prize the opener gets nothing back, with one it gets the prize", () => {
    expect(prizeDue(pot([join("ana", 0, SOL)], { prize: 0n }))).toBe(0n);
    expect(prizeDue(pot([join("ana", 0, SOL)], { prize: 3n * SOL }))).toBe(3n * SOL);
  });

  test("one-sided pot: no entry at all returns the prize to the opener and Brot keeps the 10%", () => {
    const c = pot([], { prize: 4n * SOL, openingFee: 500_000_000n });
    expect(c.snapshot?.mode).toBe("OneSided");
    expect(prizeDue(c)).toBe(4n * SOL);
    expect(collectDue(c)).toBe(500_000_000n);
  });
});

describe("winners never get back less than their entry", () => {
  test("worked example B: the creator's share comes from the losing side and the fee, never the prize", () => {
    const s = settleSplit({
      winning: 600n * SOL,
      losing: SOL,
      prize: 4_118_239_224n,
      feeBps: FEE_BPS,
      creatorBps: CREATOR_BPS,
    });
    // Decision of 2026-10-09: the losing side less the fee (0.9 SOL) then the fee (0.1 SOL): the creator gets 1 SOL.
    expect(s.creatorFromPot + s.creatorFromFee).toBe(SOL);
    expect(s.creatorFromPot).toBe(900_000_000n);
    // The distributable pot holds the prize: V + P − fee − from_pot + R.
    expect(s.distributable).toBe(604_118_239_224n);
  });

  test("worked example A: Ana and Bruno split 13.6182 SOL, the creator takes 0.1 SOL from the pot", () => {
    const c = pot([join("ana", 0, 4n * SOL), join("bruno", 0, 2n * SOL), join("carla", 1, 4n * SOL)], {
      prize: 4_118_239_224n,
      openingFee: 457_582_136n,
    });
    expect(c.snapshot?.distributable).toBe(13_618_239_224n);
    expect(entryPayout(c, "ana")).toBe(9_078_826_149n);
    expect(entryPayout(c, "bruno")).toBe(4_539_413_074n);
    expect(entryPayout(c, "carla")).toBe(0n);
  });

  test("property: over 2,000 random pots each winner's entry, and each split of it, gets back at least itself", () => {
    const r = seededRandom(0x5eed_0011);
    for (let n = 0; n < 2_000; n++) {
      const winning = r.big(10_000_000n, 10n ** 12n);
      const losing = r.big(10_000_000n, 10n ** 12n);
      const prize = r.big(0n, 5n * 10n ** 9n);
      const s = settleSplit({ winning, losing, prize, feeBps: FEE_BPS, creatorBps: CREATOR_BPS });
      expect(s.distributable >= winning).toBe(true);
      const first = r.big(1n, winning - 1n);
      for (const part of [first, winning - first, winning]) {
        expect(payoutOf(part, s.distributable, winning) >= part).toBe(true);
      }
      checkSplitNeverPaysMore(winning, s.distributable, winning);
    }
  });
});

describe("late entries come back whole", () => {
  test("late entries come back whole: a late entry is refunded to its baker, to the last lamport", () => {
    const r = seededRandom(0x1a7e_0001);
    for (let n = 0; n < 500; n++) {
      const joins: Join[] = [];
      const count = r.int(1, 12);
      let at = 0n;
      for (let j = 0; j < count; j++) {
        at += BigInt(r.int(0, 20));
        joins.push(join(`baker${r.int(0, 4)}`, r.next() < 0.5 ? 0 : 1, r.big(10_000_000n, 2n * SOL), at));
      }
      const publish = BigInt(r.int(1, 60));
      const full = pot(joins, { prize: r.big(0n, 3n * SOL), publish, openingFee: 0n });
      const early = pot(
        joins.filter((j) => j.at < publish),
        { prize: full.prize, publish, openingFee: 0n },
      );
      for (const baker of new Set(joins.map((j) => j.baker))) {
        const late = joins.filter((j) => j.baker === baker && j.at >= publish).reduce((s, j) => s + j.amount, 0n);
        // Removing the late joins leaves the totals, the fees and the first baker unchanged, so the difference is the refund.
        const whole = entryPayout(full, baker);
        const withoutLate = early.joins.some((j) => j.baker === baker) ? entryPayout(early, baker) : 0n;
        expect(whole - withoutLate).toBe(late);
      }
    }
  });

  test("late entries are never paid as winners or charged as losers", () => {
    const c = pot([join("ana", 0, 6n * SOL, 1n), join("bruno", 1, 4n * SOL, 2n), join("carla", 1, SOL, 50n)], {
      publish: 10n,
      prize: 0n,
    });
    expect(c.snapshot?.mode).toBe("Split");
    expect(c.snapshot?.losing).toBe(4n * SOL);
    expect(c.snapshot?.fee).toBe(feeCeil(4n * SOL, FEE_BPS));
    expect(entryPayout(c, "carla")).toBe(SOL);
    expect(entryPayout(c, "bruno")).toBe(0n);
  });

  test("a baker whose every join is late gets all of them back, one-sided or not", () => {
    const c = pot([join("ana", 0, SOL, 1n), join("bruno", 1, 2n * SOL, 30n)], { publish: 20n, prize: SOL });
    expect(c.snapshot?.mode).toBe("OneSided");
    expect(entryPayout(c, "bruno")).toBe(2n * SOL);
    expect(entryPayout(c, "ana")).toBe(SOL);
  });
});
