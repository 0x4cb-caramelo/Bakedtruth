/**
 * Purpose: the pot is the books, never the vault's balance: SOL sent by hand to a vault moves no
 *          pool, no prize, no first baker and no estimate (I15, first half); and the join half of
 *          the pause (I10′): no join passes while entries are halted, and nothing moves.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane E. Needs the SBF build: runs from the integration on.
 */
import { describe, expect, test } from "bun:test";

import { join, readCampaign } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { balance, expectError, expectOk, fundedWallet, send } from "./setup";
import { expectedEstimate, joinWorld, snapshot, systemTransferIx } from "./join-campaign-support";

const SOL = P.SOL;

describe("hand-sent lamports do not move the pot", () => {
  test("SOL sent to the vault is no entry, no prize and no chance (I15)", async () => {
    const { w, campaign, vault } = await joinWorld();
    const [donor, a, b] = [await fundedWallet(w), await fundedWallet(w), await fundedWallet(w)];
    const books = () => {
      const c = readCampaign(w, campaign);
      return [
        c.pool_yes,
        c.pool_no,
        c.prize_lamports,
        c.opening_fee_lamports,
        c.first_baker,
        c.entries_open,
        c.event_seq,
      ];
    };
    const opened = books();
    const vaultOpened = balance(w, vault);

    // Before any entry: the vault holds more, the books do not move, and the pot is still empty.
    expectOk(await send(w, [systemTransferIx(donor, vault, 5n * SOL)]));
    expect(balance(w, vault)).toBe(vaultOpened + 5n * SOL);
    expect(books()).toEqual(opened);
    const first = expectOk(await join(w, a, campaign, { side: P.Side.Yes, amount: SOL, minReturnBps: 10_000 }));
    expect(first.events[0].data).toMatchObject({ is_first: true, pool_yes: SOL, pool_no: 0n });
    expect(readCampaign(w, campaign).first_baker).toBe(a.address);

    // With an entry in: more SOL by hand, and the next join is estimated and recorded on the books
    // alone. Counted, 50 SOL would lift the estimate far above the one computed here.
    expectOk(await send(w, [systemTransferIx(donor, vault, 50n * SOL)]));
    const bps = expectedEstimate(w, campaign, P.Side.No, SOL, false);
    const atLeast = (minReturnBps: bigint) => ({ side: P.Side.No, amount: SOL, minReturnBps: Number(minReturnBps) });
    expectError(await join(w, b, campaign, atLeast(bps + 1n)), "ReturnBelowMinimum");
    const second = expectOk(await join(w, b, campaign, atLeast(bps)));
    expect(second.events[0].data).toMatchObject({ is_first: false, pool_yes: SOL, pool_no: SOL });

    const c = readCampaign(w, campaign);
    expect([c.pool_yes, c.pool_no, c.prize_lamports, c.opening_fee_lamports]).toEqual([SOL, SOL, opened[2], opened[3]]);
    // The vault holds the books plus the 55 SOL sent by hand, which only close_campaign sweeps (Sprint 04).
    expect(balance(w, vault)).toBe(vaultOpened + 55n * SOL + 2n * SOL);
  });
});

describe("pause stops joins", () => {
  test("with the pause on no join passes, first or later, and nothing moves; resumed, both pass (I10′)", async () => {
    const { w, admin, team, campaign, vault } = await joinWorld();
    const [a, b] = [await fundedWallet(w), await fundedWallet(w)];
    expectOk(await join(w, a, campaign, { side: P.Side.Yes, amount: SOL }));
    expectOk(await send(w, [await I.pauseEntriesIx(team[1])]));
    const state = () => ({
      vault: balance(w, vault),
      a: balance(w, a.address),
      b: balance(w, b.address),
      campaign: readCampaign(w, campaign),
    });
    const kept = state();
    const later = { side: P.Side.Yes, amount: SOL, expectedEntryTotal: SOL };
    const first = { side: P.Side.No, amount: SOL };

    expectError(await join(w, a, campaign, later), "JoinWhilePaused");
    expectError(await join(w, b, campaign, first), "JoinWhilePaused");
    expect(snapshot(w, await P.entryPda(campaign, b.address)).owner).toBeNull();
    expect(state()).toEqual(kept);

    expectOk(await send(w, [await I.resumeEntriesIx(admin)]));
    expectOk(await join(w, a, campaign, later));
    expectOk(await join(w, b, campaign, first));
    expect(readCampaign(w, campaign)).toMatchObject({ pool_yes: 2n * SOL, pool_no: SOL, entries_open: 2 });
  });
});
