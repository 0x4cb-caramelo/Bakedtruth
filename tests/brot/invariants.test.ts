/**
 * Purpose: the randomized test of the money (Sprint 04, gate 1, X0.1): a fixed seed draws operations over
 *          the whole sprint, and I1 to I15 are checked after each one against the reference model.
 *          Needs the program binary (target/deploy/brot_markets.so): run it at integration.
 * Version: 0.0.1
 * Sprint:  04 (contract freeze, lane E)
 */
import { describe, expect, test } from "bun:test";

import { readConfig } from "./flows";
import { checkCampaign, checkWorld } from "./invariant-checks";
import { chainView, makeHarness, seededRandom, type Harness } from "./invariant-harness";
import { drawOp, runOp } from "./invariant-ops";

/** The seed of the run; the report and the test output name it, so a failure can be replayed. */
export const SEED = 0x0b_ad_c0de;
/** The number of operations drawn from the seed. */
export const OPERATIONS = 400;

async function checkAll(h: Harness) {
  const config = await readConfig(h.w);
  for (let i = 0; i < h.camps.length; i++) {
    const view = await chainView(h, i);
    checkCampaign(h.camps[i], view, h, `${h.camps[i].label}`);
  }
  checkWorld(h, config);
  return h.camps.length;
}

describe("money invariants", () => {
  test("randomized invariants", async () => {
    const h = await makeHarness();
    const r = seededRandom(SEED);
    const kinds = new Map<string, number>();
    let checks = 0;
    for (let i = 0; i < OPERATIONS; i++) {
      const op = drawOp(h, r);
      kinds.set(op.k, (kinds.get(op.k) ?? 0) + 1);
      try {
        await runOp(h, op);
        checks += await checkAll(h);
      } catch (error) {
        const tail = h.trace.slice(-8).join("\n  ");
        throw new Error(
          `seed ${SEED}, operation ${i + 1} of ${OPERATIONS} (${op.k}): ${(error as Error).message}\n  ${tail}`,
        );
      }
    }
    const histogram = [...kinds]
      .sort()
      .map(([k, n]) => `${k} ${n}`)
      .join(", ");
    console.log(`randomized invariants: seed ${SEED}, ${OPERATIONS} operations, ${checks} campaign checks`);
    console.log(`operations: ${histogram}`);
    expect(h.camps.length).toBeGreaterThan(0);
  }, 600_000);
});
