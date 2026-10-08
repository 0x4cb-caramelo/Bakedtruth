/**
 * Purpose: I10′, first half (TP section 3.4.9): with the pause on, only `user_join_campaign` and
 *          `user_open_campaign` fail; every other instruction of Sprint 02 still runs, none of
 *          them lifts the pause, and the admin's resume does.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio); lane B
 */
import { describe, expect, test } from "bun:test";

import { DEFAULT_PARAMS, initConfig, join, openedCampaign, openPriceCampaign, readConfig, setTeam } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { accountData, createWorld, expectError, expectOk, fundedWallet, send } from "./setup";

const STAKE = P.SOL / 10n;

describe("pause stops only joins and openings", () => {
  test("with the pause on, joins and openings fail and every other instruction of the sprint runs", async () => {
    const w = await createWorld();
    const { admin } = await initConfig(w);
    const [member, other] = await setTeam(w, admin, 2);
    const [creator, baker] = [await fundedWallet(w), await fundedWallet(w)];
    const { campaign } = await openedCampaign(w, creator);
    expectOk(await join(w, baker, campaign, { side: P.Side.Yes, amount: STAKE }));
    expectOk(await send(w, [await I.pauseEntriesIx(member)]));
    const frozen = accountData(w, campaign);

    // Joins and openings stop: any wallet's, and a team key's free opening too.
    const second = { side: P.Side.No, amount: STAKE, expectedEntryTotal: STAKE };
    expectError(await join(w, baker, campaign, second), "JoinWhilePaused");
    expectError((await openPriceCampaign(w, creator)).sent, "OpenWhilePaused");
    expectError((await openPriceCampaign(w, other, { openingUsd: 0n })).sent, "OpenWhilePaused");
    expect(accountData(w, campaign)).toEqual(frozen);

    // Every other instruction of this sprint runs, and none of them lifts the pause.
    const [next, recipient] = [await fundedWallet(w), await fundedWallet(w, 1n)];
    expectOk(await send(w, [await I.setTeamIx(admin, [member.address, other.address, next.address])]));
    expectOk(await send(w, [await I.setCreationParamsIx(admin, { ...DEFAULT_PARAMS, fee_bps: 900 })]));
    expectOk(await send(w, [await I.setFeeRecipientIx(admin, recipient.address)]));
    expectOk(await send(w, [await I.transferAdminIx(admin, next.address)]));
    expectOk(await send(w, [await I.acceptAdminIx(next)]));
    expect((await readConfig(w)).operating_level).toBe(P.OperatingLevel.EntriesHalted);
    expectOk(await send(w, [await I.resumeEntriesIx(next)]));

    // Resumed: the same join and an opening go through.
    expectOk(await join(w, baker, campaign, second));
    expectOk((await openPriceCampaign(w, creator)).sent);
    expectOk((await openPriceCampaign(w, other, { openingUsd: 0n })).sent);
  });
});
