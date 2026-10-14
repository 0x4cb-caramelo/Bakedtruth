/**
 * Purpose: the end of the randomized run (Sprint 15; the sprint's gate "the sponsor's money is never stuck"): every
 *          finalized campaign that still holds a sponsor's fee is taken through its exits in order, as a keeper would:
 *          each entry, the fee, the prize and the share; the close, refused while a fee is held (`SealedFeesOpen`);
 *          each held fee settled; then the close. Every step runs through invariant-run.ts and is followed by every
 *          check, so the wind-down is held to the same model as the random run.
 * Version: 0.1.0
 * Sprint:  15 (lane INV15, with Sprint 14 in one branch)
 */
import type { Harness } from "./invariant-harness";
import { bakersOf } from "./invariant-model";
import type { Op } from "./invariant-ops";
import { shareDue } from "./invariant-payouts";
import { runOp } from "./invariant-run";
import { liveSealed } from "./invariant-sealed-model";

const bakerIndex = (h: Harness, address: string) => h.bakers.findIndex((b) => b.address === address);

/** Runs each exit of every finalized campaign holding a fee; `after` runs the checks after each step. */
export async function windDown(h: Harness, after: () => Promise<void>) {
  const step = async (op: Op) => {
    await runOp(h, op);
    await after();
  };
  for (const [index, c] of h.camps.entries()) {
    if (c.closed || c.snapshot === null || liveSealed(c).length === 0) continue;
    for (const baker of bakersOf(c).filter((b) => !c.settled.has(b))) {
      await step({ k: "settle", c: index, baker: bakerIndex(h, baker) });
    }
    if (!c.feeMoved) await step({ k: "collect", c: index });
    if (!c.prizeSettled) await step({ k: "prize", c: index });
    if (shareDue(c) > 0n && !c.shareSettled) await step({ k: "share", c: index });
    // Refused while a fee is held: SealedFeesOpen once the rest is settled (the model says which refusal).
    await step({ k: "close", c: index });
    for (const s of liveSealed(c)) {
      await step({ k: "sealedSettle", c: index, sponsor: bakerIndex(h, s.sponsor), thief: null });
    }
    await step({ k: "close", c: index });
  }
}
