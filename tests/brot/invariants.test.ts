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

/**
 * The seed of the run; the report and the test output name it, so a failure can be replayed. `INVARIANT_SEED`
 * (decimal or 0x-hex) runs another seed once, without changing the file: `INVARIANT_SEED=0x1234 bun test <this file>`.
 */
export const DEFAULT_SEED = 0x0b_ad_c0de;
export const SEED = process.env.INVARIANT_SEED ? Number(process.env.INVARIANT_SEED) >>> 0 : DEFAULT_SEED;
/** The number of operations drawn from the seed. */
export const OPERATIONS = 1_200;

async function checkAll(h: Harness) {
  const config = await readConfig(h.w);
  for (let i = 0; i < h.camps.length; i++) {
    const view = await chainView(h, i, config);
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
    const succeeded = new Map<string, number>();
    for (const line of h.trace) {
      const [k, outcome] = line.split(" ");
      if (outcome === "ok") succeeded.set(k, (succeeded.get(k) ?? 0) + 1);
    }
    const okHistogram = [...succeeded]
      .sort()
      .map(([k, n]) => `${k} ${n}`)
      .join(", ");
    console.log(`succeeded: ${okHistogram}`);
    const refusals = new Map<string, number>();
    for (const line of h.trace) {
      const [k, ...rest] = line.split(" ");
      const outcome = rest.join(" ");
      if (outcome !== "ok") refusals.set(`${k}: ${outcome}`, (refusals.get(`${k}: ${outcome}`) ?? 0) + 1);
    }
    console.log(
      `refusals: ${[...refusals]
        .sort()
        .map(([k, n]) => `${k} ${n}`)
        .join(" | ")}`,
    );
    expect(h.camps.length).toBeGreaterThan(0);
  }, 600_000);
});
