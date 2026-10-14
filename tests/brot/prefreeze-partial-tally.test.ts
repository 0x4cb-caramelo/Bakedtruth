/**
 * Purpose: O-3 of the audit package (Sprint 16): a tally of part of one entry's joins can no longer leave a tallied
 *          join in its old class when an earlier YES proof moves the cut-off back. The tally of a YES price result
 *          waits until its recorded proof is over 60 s old (`CutoffNotFinal`); from then on no earlier proof is fresh,
 *          so every join is classed under the final cut-off. The first test is the INV14 lane's reproduction, turned
 *          to assert the sums the stored cut-off implies.
 * Version: 0.0.1
 * Sprint:  16 (lane L16P, the pre-freeze hardening). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";

import type { Address } from "@solana/kit";

import { BTC_PRICE, initConfig, join, openedCampaign, readCampaign, readEntry } from "./flows";
import { refreshBase, setBtc } from "./invariant-harness";
import * as I from "./instructions";
import { tallyLateJoinsIx } from "./instructions-settlement";
import * as P from "./program";
import { createWorld, expectError, expectOk, fundedWallet, now, send, setTime, type World } from "./setup";

/** The YES price: the target crossed by 1%, with no confidence band. */
const TOUCH = (BTC_PRICE * 11n * 101n) / (10n * 100n);

type Scene = { w: World; t0: bigint; campaign: Address; baker: Address; entry: Address; joins: Address[] };

/** A price campaign opened at T0; one baker joins YES at T0+185 (1 SOL) and T0+200 (2 SOL); another NO, 5 SOL. */
async function twoJoins(): Promise<Scene> {
  const w = await createWorld();
  await initConfig(w);
  const creator = await fundedWallet(w, 1_000n);
  refreshBase(w);
  const { campaign } = await openedCampaign(w, creator);
  const t0 = now(w.client);
  const baker = await fundedWallet(w, 100n);
  setTime(w.client, t0 + 185n);
  refreshBase(w);
  expectOk(await join(w, baker, campaign, { side: P.Side.Yes, amount: P.SOL }));
  setTime(w.client, t0 + 200n);
  refreshBase(w);
  expectOk(await join(w, baker, campaign, { side: P.Side.Yes, amount: 2n * P.SOL, expectedEntryTotal: P.SOL }));
  expectOk(await join(w, await fundedWallet(w, 100n), campaign, { side: P.Side.No, amount: 5n * P.SOL }));
  const entry = await P.entryPda(campaign, baker.address);
  const joins = [await P.joinPda(campaign, baker.address, 0), await P.joinPda(campaign, baker.address, 1)];
  return { w, t0, campaign, baker: baker.address, entry, joins };
}

/** `resolve_campaign` at `at` with the sponsored account holding a touch published at `publishTime`. */
function resolveYes(s: Scene, at: bigint, publishTime: bigint) {
  setTime(s.w.client, at);
  setBtc(s.w, TOUCH, publishTime);
  return send(s.w, [I.resolveCampaignIx(s.campaign, P.BTC_USD_ACCOUNT, P.BTC_USD_ACCOUNT)]);
}

/** Tallies the joins `from..` of the baker's entry. */
const tally = (s: Scene, from: number) =>
  send(s.w, [tallyLateJoinsIx(s.baker, s.campaign, s.entry, s.joins.slice(from))]);

/** Tallies the joins of the baker's entry not tallied yet. */
async function tallyRest(s: Scene) {
  const done = Number((await readEntry(s.w, s.campaign, s.baker)).joins_tallied);
  return tally(s, done);
}

describe("O-3: no join keeps the class of a cut-off that moved", () => {
  test("a partial tally cannot keep a join early once an earlier proof moves the cut-off back", async () => {
    const s = await twoJoins();
    // YES at T0+230 from a touch published at T0+220: both joins (T0+185, T0+200) are early under it.
    expectOk(await resolveYes(s, s.t0 + 230n, s.t0 + 220n));
    // Anyone tallies join 0 alone while an earlier proof can still be offered.
    const partial = await send(s.w, [tallyLateJoinsIx(s.baker, s.campaign, s.entry, [s.joins[0]])]);
    // An earlier touch (T0+180, 55 s old) moves the cut-off back: both joins are at or after it.
    expectOk(await resolveYes(s, s.t0 + 235n, s.t0 + 180n));
    setTime(s.w.client, s.t0 + 241n);
    expectOk(await tallyRest(s));
    const c = readCampaign(s.w, s.campaign);
    expect(c.publish_time).toBe(s.t0 + 180n);
    // Under the stored cut-off both joins are late: 3 SOL come back whole, and none shares the losers' pot.
    expect(c.late_yes).toBe(3n * P.SOL);
    expect((await readEntry(s.w, s.campaign, s.baker)).late_yes).toBe(3n * P.SOL);
    // The partial tally was refused: the recorded proof was 10 s old, so the cut-off could still move.
    expectError(partial, "CutoffNotFinal");
  });

  test("the tally of a YES price result waits until its proof is over 60 s old, to the second", async () => {
    const s = await twoJoins();
    const proof = s.t0 + 220n;
    expectOk(await resolveYes(s, s.t0 + 230n, proof));
    setTime(s.w.client, proof + 60n);
    expectError(await tally(s, 0), "CutoffNotFinal");
    setTime(s.w.client, proof + 61n);
    expectOk(await send(s.w, [tallyLateJoinsIx(s.baker, s.campaign, s.entry, [s.joins[0]])]));
    // From then on no earlier proof is fresh: one published a second before the recorded one is 62 s old.
    setBtc(s.w, TOUCH, proof - 1n);
    expectError(await send(s.w, [I.resolveCampaignIx(s.campaign, P.BTC_USD_ACCOUNT, P.BTC_USD_ACCOUNT)]), "ProofStale");
    expectOk(await tallyRest(s));
    const c = readCampaign(s.w, s.campaign);
    // Both joins are before T0+220: early, nothing late.
    expect({ publish: c.publish_time, late: c.late_yes }).toEqual({ publish: proof, late: 0n });
  });

  test("a NO result has no cut-off to move: its joins are tallied at once", async () => {
    const s = await twoJoins();
    const deadline = readCampaign(s.w, s.campaign).deadline_at as bigint;
    setTime(s.w.client, deadline + 61n);
    refreshBase(s.w);
    expectOk(await send(s.w, [I.resolveCampaignIx(s.campaign, P.BTC_USD_ACCOUNT, P.PROGRAM_ID)]));
    expect(readCampaign(s.w, s.campaign).outcome).toBe(P.Outcome.No);
    expectOk(await tally(s, 0));
    expect(readCampaign(s.w, s.campaign).late_yes).toBe(0n);
  });
});
