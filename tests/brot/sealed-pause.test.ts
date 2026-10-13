/**
 * Purpose: I10′ with the sealed entry (TP 3.4.13; Sprint 15 DoD): with the pause on, a sealed entry fails as a join
 *          and an opening do, before its price is even read, and moves nothing; resolution, the tally, the snapshot,
 *          every payout and `settle_sealed_fee` still run, and the campaign closes.
 *          Filter: `bun test tests/ -t "paused campaign refuses new money, never payouts"`.
 * Version: 0.0.1
 * Sprint:  15 (lane L15). Needs the SBF build.
 */
import { describe, expect, test } from "bun:test";

import { join, openedCampaign, openPriceCampaign, readConfig } from "./flows";
import * as I from "./instructions";
import { refreshBase, refreshSol } from "./invariant-harness";
import * as S from "./instructions-settlement";
import * as P from "./program";
import {
  closeCampaign,
  collectFee,
  finalize,
  moved,
  resolve,
  settleEntry,
  settlePrize,
  settleSealedFee,
  tallyAll,
} from "./sealed-flows";
import { sealedCharge, sealedEntry, sealedState, sealedWorld } from "./sealed-support";
import { expectError, expectOk, fundedWallet, send } from "./setup";

const SOL = P.SOL;

describe("paused campaign refuses new money, never payouts", () => {
  test("paused campaign refuses new money, never payouts: a sealed entry fails, settle_sealed_fee runs", async () => {
    const { w, team, admin, creator, campaign, sponsor } = await sealedWorld();
    const [bruno, newcomer] = [await fundedWallet(w), await fundedWallet(w, 1_000n)];
    expectOk(await sealedEntry(w, sponsor, campaign, { side: P.Side.Yes }));
    expectOk(await join(w, bruno, campaign, { side: P.Side.No, amount: SOL }));
    expectOk(await send(w, [await I.pauseEntriesIx(team[0])]));

    // New money stops: a later sealed entry, a first one, one below the floor (the pause is read before the price),
    // a plain join and an opening; nothing moves.
    const kept = await sealedState(w, sponsor.address, campaign);
    expectError(await sealedEntry(w, sponsor, campaign, { side: P.Side.Yes }), "JoinWhilePaused");
    expectError(await sealedEntry(w, sponsor, campaign, { side: P.Side.Yes, entryUsd: 1n }), "JoinWhilePaused");
    expectError(await sealedEntry(w, newcomer, campaign, { side: P.Side.No }), "JoinWhilePaused");
    const again = { side: P.Side.No, amount: SOL, expectedEntryTotal: SOL, joinIndex: 1 };
    expectError(await join(w, bruno, campaign, again), "JoinWhilePaused");
    expectError((await openPriceCampaign(w, creator)).sent, "OpenWhilePaused");
    expect(await sealedState(w, sponsor.address, campaign)).toEqual(kept);

    // Payouts never stop: the outcome, the tally, the snapshot, the entries, the held fee, the fee, the prize, the
    // creator's share and the close all run under the pause.
    await resolve(w, campaign, "yes");
    await tallyAll(w, campaign, [sponsor.address, bruno.address]);
    await finalize(w, campaign);
    expectOk(await settleEntry(w, campaign, sponsor.address));
    expectOk(await settleEntry(w, campaign, bruno.address));
    const feeVault = await P.feeVaultPda();
    const held = await moved(w, [feeVault], () => settleSealedFee(w, campaign, sponsor.address));
    expect(held.gains).toEqual([sealedCharge(500n).fee]);
    expectOk(await collectFee(w, campaign));
    expectOk(await settlePrize(w, campaign, creator.address));
    const vault = await P.vaultPda(campaign);
    expectOk(await send(w, [S.settleCreatorShareIx(campaign, vault, creator.address)]));
    expectOk(await closeCampaign(w, campaign, creator.address));
    expect((await readConfig(w)).operating_level).toBe(P.OperatingLevel.EntriesHalted);

    // Resumed by the admin, a sealed entry passes again (on a new campaign, at fresh prices: this one is closed).
    expectOk(await send(w, [await I.resumeEntriesIx(admin)]));
    refreshBase(w);
    refreshSol(w);
    const reopened = (await openedCampaign(w, creator)).campaign;
    expectOk(await sealedEntry(w, newcomer, reopened, { side: P.Side.No }));
  });
});
