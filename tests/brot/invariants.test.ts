/**
 * Purpose: the randomized test of the money (Sprint 04, gate 1, X0.1): a fixed seed draws operations over
 *          the whole lifecycle, and I1 to I15, the campaign's record (X0.4) and every referral link are checked
 *          after each one against the reference model. Needs the program binary (target/deploy/brot_markets.so).
 *          `INVARIANT_SEED` and `INVARIANT_OPERATIONS` replay another seed or length without editing the file. Since
 *          Sprints 14 and 15 share a branch, the run carries both; the default seed must draw every kind of operation
 *          and reach each case of the sealed entry (`MUST_REACH`).
 * Version: 0.2.0 (Sprint 14: the contest, the re-read, the admin's decision, the lapse, the tally, the links; D2;
 *          Sprint 15: the sealed entry, its held fee, SOL sent by hand to a SealedFee, the close that waits for it)
 * Sprint:  04 (contract freeze, lane E); 14 (lane INV14); 15 (lane INV15, with Sprint 14 in one branch)
 */
import { describe, expect, test } from "bun:test";

import { readConfig } from "./flows";
import { checkCampaign, checkWorld } from "./invariant-checks";
import { makeHarness, seededRandom, type Harness } from "./invariant-harness";
import { drawOp } from "./invariant-ops";
import { checkLinks } from "./invariant-referral";
import { runOp } from "./invariant-run";
import { windDown } from "./invariant-winddown";
import { chainView } from "./invariant-view";
import { balance } from "./setup";

/** The seed of the run; the report and the test output name it, so a failure can be replayed. */
export const SEED = Number(process.env.INVARIANT_SEED ?? 0x0b_ad_c0de);
/**
 * The number of operations drawn from the seed: 1,200 until Sprint 14, 2,000 since, because a contest adds three
 * steps to a campaign's life and the fixed seed should take every exit from it (a same re-read once stage 1's 24 hours
 * are over, the team's escalation, the admin's confirm and void, the lapse) within one run.
 */
export const OPERATIONS = Number(process.env.INVARIANT_OPERATIONS ?? 2_000);

/** Every kind of operation of both sprints' runs: the default seed draws each at least once. */
export const KINDS = [
  ...["openPaid", "openTeam", "join", "pause", "resume", "hand", "advance", "drain", "fund", "sweep"],
  ...["link", "linkOther", "fundLink", "resolveYes", "resolveNo", "resolveStale", "tally", "confirm", "void"],
  ...["finalize", "contest", "reread", "decide", "settle", "collect", "share", "prize", "close"],
  ...["sealed", "handSealed", "sealedSettle"],
];
/**
 * What the default seed's run must reach at least once (Sprint 15): a sealed entry and each of its refusals, a held fee
 * settled to each destination, its refusals, the close that waits for it, and SOL sent by hand to a SealedFee before
 * and after its creation. A held fee settled while paused is in `pausedOk` (I10′).
 */
export const MUST_REACH = [
  ...[/^sealed ok$/, /^sealed JoinWhilePaused$/, /^sealed CreationParamsChanged$/, /^sealed SealedEntryBelowFloor$/],
  ...[/^sealed SolUsdStale$/, /^sealed SolUsdConfidenceTooWide$/, /^sealed SealedEntryAboveMaxLamports$/],
  ...[/^sealed EntryTotalMismatch$/, /^sealedSettle-refunded ok$/, /^sealedSettle-kept ok$/],
  ...[/^sealedSettle NotFinalized$/, /^sealedSettle WrongSponsor$/, /^sealedSettle AlreadySettled$/],
  ...[/^close SealedFeesOpen$/, /^handSealed-funded ok$/, /^handSealed-live ok$/],
];

/**
 * Every invariant after one operation. A closed campaign has no account left to change: it is checked on the
 * operation that closed it and again at the end of the run (`all`); every other campaign after every operation.
 */
async function checkAll(h: Harness, closedSeen: Set<number>, all = false) {
  const config = await readConfig(h.w);
  const feeVault = balance(h.w, h.feeVault);
  let checked = 0;
  for (let i = 0; i < h.camps.length; i++) {
    if (h.camps[i].closed && closedSeen.has(i) && !all) continue;
    if (h.camps[i].closed) closedSeen.add(i);
    checkCampaign(h.camps[i], await chainView(h, i, config, feeVault), h, `${h.camps[i].label}`);
    checked++;
  }
  checkWorld(h, config, feeVault);
  await checkLinks(h);
  return checked;
}

const histogram = (counts: Map<string, number>, separator = ", ") =>
  [...counts]
    .sort()
    .map(([k, n]) => `${k} ${n}`)
    .join(separator);

describe("money invariants", () => {
  test("randomized invariants", async () => {
    const h = await makeHarness();
    const r = seededRandom(SEED);
    const kinds = new Map<string, number>();
    const closedSeen = new Set<number>();
    let checks = 0;
    for (let i = 0; i < OPERATIONS; i++) {
      const op = drawOp(h, r);
      kinds.set(op.k, (kinds.get(op.k) ?? 0) + 1);
      try {
        await runOp(h, op);
        checks += await checkAll(h, closedSeen);
      } catch (error) {
        const tail = h.trace.slice(-8).join("\n  ");
        throw new Error(
          `seed ${SEED}, operation ${i + 1} of ${OPERATIONS} (${op.k}): ${(error as Error).message}\n  ${tail}`,
        );
      }
    }
    // Sprint 15: no held fee stays stuck. Each finalized campaign holding one goes through its exits, every check after
    // each step.
    await windDown(h, async () => {
      checks += await checkAll(h, closedSeen);
    }).catch((error: Error) => {
      throw new Error(`seed ${SEED}, winding down: ${error.message}\n  ${h.trace.slice(-8).join("\n  ")}`);
    });
    // The end of the run: every campaign once more, the closed ones too, and every link.
    checks += await checkAll(h, closedSeen, true).catch((error: Error) => {
      throw new Error(`seed ${SEED}, after the last operation: ${error.message}`);
    });
    const succeeded = new Map<string, number>();
    const refusals = new Map<string, number>();
    for (const line of h.trace) {
      const [k, ...rest] = line.split(" ");
      const outcome = rest.join(" ");
      if (outcome === "ok") succeeded.set(k, (succeeded.get(k) ?? 0) + 1);
      else refusals.set(`${k}: ${outcome}`, (refusals.get(`${k}: ${outcome}`) ?? 0) + 1);
    }
    console.log(`randomized invariants: seed ${SEED}, ${OPERATIONS} operations, ${checks} campaign checks`);
    console.log(`operations: ${histogram(kinds)}`);
    console.log(`succeeded: ${histogram(succeeded)}`);
    console.log(`succeeded while paused (I10′): ${histogram(h.pausedOk)}`);
    console.log(`exits, open count checked (I7): ${histogram(h.exits)}`);
    console.log(`refusals: ${histogram(refusals, " | ")}`);
    console.log(`campaigns ${h.camps.length}, closed ${h.camps.filter((c) => c.closed).length}, links ${h.links.size}`);
    const undrawn = KINDS.filter((k) => !kinds.has(k));
    console.log(`kinds not drawn: ${undrawn.length > 0 ? undrawn.join(", ") : "none"}`);
    expect(h.camps.length).toBeGreaterThan(0);
    if (SEED === 0x0b_ad_c0de && OPERATIONS === 2_000) {
      const missed = MUST_REACH.filter((want) => !h.trace.some((line) => want.test(line))).map(String);
      const pausedSettle = [...h.pausedOk.keys()].some((label) => label.startsWith("sealedSettle-"));
      expect({ undrawn, missed, pausedSettle }).toEqual({ undrawn: [], missed: [], pausedSettle: true });
    }
  }, 600_000);
});
