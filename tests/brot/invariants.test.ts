/**
 * Purpose: the randomized test of the money (Sprint 04, gate 1, X0.1): a fixed seed draws operations over
 *          the whole sprint, and I1 to I15 are checked after each one against the reference model. Since Sprint 15
 *          the run carries sealed entries and their held fees, and the default seed must reach each of their cases.
 *          Needs the program binary (target/deploy/brot_markets.so): run it at integration.
 * Version: 0.0.2
 * Sprint:  04 (contract freeze, lane E); 15 (the sealed entry, the coverage of the default seed; lane INV15)
 */
import { describe, expect, test } from "bun:test";

import { readConfig } from "./flows";
import { checkCampaign, checkWorld } from "./invariant-checks";
import { chainView, makeHarness, seededRandom, type Harness } from "./invariant-harness";
import { drawOp, runOp } from "./invariant-ops";

/**
 * The seed of the run; the report and the test output name it, so a failure can be replayed. `INVARIANT_SEED`
 * (decimal or 0x-hex) runs another seed once, without changing the file: `INVARIANT_SEED=0x1234 bun test <this file>`.
 */
export const DEFAULT_SEED = 0x0b_ad_c0de;
export const SEED = process.env.INVARIANT_SEED ? Number(process.env.INVARIANT_SEED) >>> 0 : DEFAULT_SEED;
/** The number of operations drawn from the seed. */
export const OPERATIONS = 1_200;

/**
 * What the default seed's run must reach at least once (Sprint 15): a sealed entry and each of its refusals, a held
 * fee settled to each destination and under the pause (I10′), its refusals, the close that waits for it, SOL sent by
 * hand to a SealedFee before and after its creation, and the team's confirm and void, which tally first.
 */
export const MUST_REACH = [
  /^sealed ok$/,
  /^sealed JoinWhilePaused$/,
  /^sealed CreationParamsChanged$/,
  /^sealed SealedEntryBelowFloor$/,
  /^sealed SolUsdStale$/,
  /^sealed SolUsdConfidenceTooWide$/,
  /^sealed SealedEntryAboveMaxLamports$/,
  /^sealed EntryTotalMismatch$/,
  /^sealedSettle ok refunded/,
  /^sealedSettle ok kept/,
  /^sealedSettle ok \w+ paused$/,
  /^sealedSettle NotFinalized$/,
  /^sealedSettle WrongSponsor$/,
  /^sealedSettle AlreadySettled$/,
  /^close SealedFeesOpen$/,
  /^handSealed ok funded$/,
  /^handSealed ok live$/,
  /^confirm ok$/,
  /^void ok$/,
];

async function checkAll(h: Harness) {
  const config = await readConfig(h.w);
  for (let i = 0; i < h.camps.length; i++) {
    const view = await chainView(h, i, config);
    checkCampaign(h.camps[i], view, h, `${h.camps[i].label}`);
  }
  checkWorld(h, config);
  return h.camps.length;
}

/** `name n, name n, …` of a count map, sorted. */
const histogram = (counts: Map<string, number>, separator = ", ") =>
  [...counts]
    .sort()
    .map(([k, n]) => `${k} ${n}`)
    .join(separator);
const count = (counts: Map<string, number>, key: string) => counts.set(key, (counts.get(key) ?? 0) + 1);

describe("money invariants", () => {
  test("randomized invariants", async () => {
    const h = await makeHarness();
    const r = seededRandom(SEED);
    const kinds = new Map<string, number>();
    let checks = 0;
    for (let i = 0; i < OPERATIONS; i++) {
      const op = drawOp(h, r);
      count(kinds, op.k);
      try {
        await runOp(h, op);
        checks += await checkAll(h);
      } catch (error) {
        const tail = h.trace.slice(-8).join("\n  ");
        throw new Error(
          `seed ${SEED} (0x${SEED.toString(16)}), operation ${i + 1} of ${OPERATIONS} (${op.k}): ${(error as Error).message}\n  ${tail}`,
        );
      }
    }
    const [succeeded, cases, refusals] = [new Map<string, number>(), new Map<string, number>(), new Map()];
    for (const line of h.trace) {
      const [k, outcome, ...tag] = line.split(" ");
      if (outcome !== "ok") count(refusals, `${k}: ${[outcome, ...tag].join(" ")}`);
      else {
        count(succeeded, k);
        if (tag.length > 0) count(cases, `${k} ${tag.join(" ")}`);
      }
    }
    console.log(
      `randomized invariants: seed ${SEED} (0x${SEED.toString(16)}), ${OPERATIONS} operations, ${checks} campaign checks`,
    );
    console.log(`operations: ${histogram(kinds)}`);
    console.log(`succeeded: ${histogram(succeeded)}`);
    console.log(`cases: ${histogram(cases)}`);
    console.log(`refusals: ${histogram(refusals, " | ")}`);
    expect(h.camps.length).toBeGreaterThan(0);
    if (SEED === DEFAULT_SEED) {
      const missed = MUST_REACH.filter((want) => !h.trace.some((line) => want.test(line)));
      expect(missed.map(String)).toEqual([]);
    }
  }, 600_000);
});
