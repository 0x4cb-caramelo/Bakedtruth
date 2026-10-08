/**
 * Purpose: two wallets: A cannot change, close or redirect B's Entry, whichever slot of a join it
 *          puts that Entry in, and cannot join as B without B's signature (A-1).
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane E. Needs the SBF build: runs from the integration on.
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, type Address } from "@solana/kit";

import { join, readCampaign, readEntry } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { expectError, expectOk, send } from "./setup";
import { entryBump, joinWorld, snapshot, walletWhere } from "./join-campaign-support";

const SOL = P.SOL;

describe("two wallets", () => {
  test("A cannot change, close or redirect B's Entry", async () => {
    const { w, campaign, metric } = await joinWorld();
    // Equal canonical bumps: B's bump on A's seeds gives A's own Entry address, which the load
    // compares with the account passed, on every run ("join refuses" has the other path, a bump
    // that gives no address at all).
    const bumpIs255 = async (x: Address) => (await entryBump(campaign, x)) === 255;
    const [a, b] = [await walletWhere(w, bumpIs255), await walletWhere(w, bumpIs255)];
    expectOk(await join(w, b, campaign, { side: P.Side.Yes, amount: SOL }));
    const entryB = await P.entryPda(campaign, b.address);
    const keptB = snapshot(w, entryB);
    const joinA = (expectedEntryTotal: bigint) =>
      I.joinCampaignIx(a, campaign, metric, { side: P.Side.No, amount: SOL, expectedEntryTotal });

    // A signs its own join and names B's Entry: the program derives the Entry from the signer, so
    // B's address fails, whatever total A signs.
    for (const total of [0n, SOL]) {
      expectError(await send(w, [I.withSlot(await joinA(total), 4, { address: entryB })]), "PdaMismatch");
    }
    // A puts B in the baker slot to join as B: B never signed.
    const asB = await I.joinCampaignIx(b, campaign, metric, { side: P.Side.No, amount: SOL, expectedEntryTotal: SOL });
    expectError(await send(w, [I.withSlot(asB, 0, { role: AccountRole.WRITABLE })]), "MissingSignature");

    // Once A has an Entry of its own, B's Entry in any other slot of A's join is refused too.
    expectOk(await join(w, a, campaign, { side: P.Side.Yes, amount: SOL }));
    expectError(await send(w, [I.withSlot(await joinA(SOL), 4, { address: entryB })]), "PdaMismatch");
    expectError(await send(w, [I.withSlot(await joinA(SOL), 3, { address: entryB })]), "PdaMismatch"); // as the vault
    expectError(await send(w, [I.withSlot(await joinA(SOL), 2, { address: entryB })]), "WrongLength"); // as the campaign
    expectError(await send(w, [I.withSlot(await joinA(SOL), 1, { address: entryB })]), "WrongLength"); // as the config

    // B's Entry is byte for byte what B left, with its rent, under the program: nothing moved it,
    // and no instruction of this sprint closes an Entry (settle_entry arrives in Sprint 04).
    expect(snapshot(w, entryB)).toEqual(keptB);
    expect(readCampaign(w, campaign)).toMatchObject({ pool_yes: 2n * SOL, pool_no: 0n, entries_open: 2 });
    // And B's own next join still finds B's own total.
    expectOk(await join(w, b, campaign, { side: P.Side.No, amount: SOL, expectedEntryTotal: SOL }));
    expect(await readEntry(w, campaign, b.address)).toMatchObject({ amount_yes: SOL, amount_no: SOL });
    expect(await readEntry(w, campaign, a.address)).toMatchObject({ amount_yes: SOL, amount_no: 0n });
  });
});
