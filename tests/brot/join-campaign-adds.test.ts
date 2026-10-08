/**
 * Purpose: what a join writes: the Entry created on the first join with the baker's rent, the
 *          first baker, later joins of the same wallet on either side (Q3), the bookkept pools
 *          (I2), the vault growing by exactly each entry, EntryAdded with a contiguous seq, and an
 *          Entry address funded in advance. Logs the Entry's size and rent and the CU (T19).
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane E. Needs the SBF build: runs from the integration on.
 */
import { describe, expect, test } from "bun:test";

import { join, readCampaign, readEntry } from "./flows";
import * as P from "./program";
import { balance, expectOk, fundedWallet, rentFor, send } from "./setup";
import { ENTRY_LEN, entryBump, joinWorld, snapshot, systemTransferIx } from "./join-campaign-support";

const SOL = P.SOL;

describe("join adds an entry", () => {
  test("the first join creates the Entry with the baker's rent and marks the first baker", async () => {
    const { w, opened, campaign, vault } = await joinWorld();
    const baker = await fundedWallet(w);
    const rent = rentFor(w, ENTRY_LEN);
    const [bakerBefore, vaultBefore] = [balance(w, baker.address), balance(w, vault)];
    const sent = expectOk(await join(w, baker, campaign, { side: P.Side.Yes, amount: 2n * SOL }));

    expect(balance(w, baker.address)).toBe(bakerBefore - 2n * SOL - rent);
    expect(balance(w, vault)).toBe(vaultBefore + 2n * SOL);
    const created = snapshot(w, await P.entryPda(campaign, baker.address));
    expect([created.owner, created.lamports, created.data.length]).toEqual([P.PROGRAM_ID, rent, ENTRY_LEN]);
    expect(await readEntry(w, campaign, baker.address)).toMatchObject({
      tag: P.AccountTag.Entry,
      version: 1,
      bump: await entryBump(campaign, baker.address),
      is_first: true,
      campaign,
      baker: baker.address,
      amount_yes: 2n * SOL,
      amount_no: 0n,
    });
    expect(readCampaign(w, campaign)).toMatchObject({
      first_baker: baker.address,
      entries_open: 1,
      pool_yes: 2n * SOL,
      pool_no: 0n,
      event_seq: 2n,
    });
    // CampaignOpened is the campaign's seq 0, so its first entry is seq 1.
    expect(expectOk(opened.sent).events.map((e) => [e.name, e.data.seq])).toEqual([["CampaignOpened", 0n]]);
    expect(sent.events).toEqual([
      {
        name: "EntryAdded",
        data: {
          campaign,
          seq: 1n,
          baker: baker.address,
          side: P.Side.Yes,
          is_first: true,
          amount: 2n * SOL,
          pool_yes: 2n * SOL,
          pool_no: 0n,
          entry_yes: 2n * SOL,
          entry_no: 0n,
        },
      },
    ]);
  });

  test("later joins add to the same Entry, on either side, and the books follow (I2)", async () => {
    const { w, campaign, vault } = await joinWorld();
    const [a, b] = [await fundedWallet(w), await fundedWallet(w)];
    const vaultBefore = balance(w, vault);
    const steps = [
      { baker: a, side: P.Side.Yes, amount: SOL, expectedEntryTotal: 0n },
      { baker: a, side: P.Side.Yes, amount: 2n * SOL, expectedEntryTotal: SOL },
      { baker: b, side: P.Side.No, amount: SOL / 2n, expectedEntryTotal: 0n },
      { baker: a, side: P.Side.No, amount: (3n * SOL) / 2n, expectedEntryTotal: 3n * SOL },
    ];
    const sent = [];
    for (const { baker, ...args } of steps) {
      const before = balance(w, baker.address);
      sent.push(expectOk(await join(w, baker, campaign, args)));
      // Only a wallet's first join pays the Entry's rent; a later one pays exactly its entry.
      if (args.expectedEntryTotal > 0n) expect(balance(w, baker.address)).toBe(before - args.amount);
    }

    const added = sent.map((s) => s.events[0].data);
    expect(sent.map((s) => s.events.length)).toEqual([1, 1, 1, 1]);
    expect(added.map((e) => e.seq)).toEqual([1n, 2n, 3n, 4n]);
    expect(added.map((e) => [e.pool_yes, e.pool_no])).toEqual([
      [SOL, 0n],
      [3n * SOL, 0n],
      [3n * SOL, SOL / 2n],
      [3n * SOL, 2n * SOL],
    ]);
    expect(added[2]).toMatchObject({ baker: b.address, is_first: false, entry_yes: 0n, entry_no: SOL / 2n });
    // One wallet on both sides (Q3), still the first baker for its whole entry.
    expect(added[3]).toMatchObject({ baker: a.address, side: P.Side.No, is_first: true, entry_yes: 3n * SOL });
    expect(added[3].entry_no).toBe((3n * SOL) / 2n);

    const [entryA, entryB] = [await readEntry(w, campaign, a.address), await readEntry(w, campaign, b.address)];
    expect([entryA.amount_yes, entryA.amount_no, entryA.is_first]).toEqual([3n * SOL, (3n * SOL) / 2n, true]);
    expect([entryB.amount_yes, entryB.amount_no, entryB.is_first]).toEqual([0n, SOL / 2n, false]);
    const c = readCampaign(w, campaign);
    // I2: each pool is its side summed over every Entry; the vault grew by exactly the entries.
    expect([c.pool_yes, c.pool_no]).toEqual([
      entryA.amount_yes + entryB.amount_yes,
      entryA.amount_no + entryB.amount_no,
    ]);
    expect(balance(w, vault)).toBe(vaultBefore + c.pool_yes + c.pool_no);
    expect([c.first_baker, c.entries_open, c.event_seq]).toEqual([a.address, 2, 5n]);

    // T19: the measured size and rent of an Entry, and what a join costs in compute units.
    const rent = rentFor(w, ENTRY_LEN);
    console.log(`T19 Entry: ${ENTRY_LEN} bytes, rent ${rent} lamports (LiteSVM's rent; check on devnet)`);
    console.log(`T19 join: first ${sent[0].computeUnits} CU (creates the Entry), second ${sent[1].computeUnits} CU`);
  });

  test("an Entry address funded in advance is created all the same", async () => {
    const { w, campaign, vault } = await joinWorld();
    const [donor, a, b] = [await fundedWallet(w), await fundedWallet(w), await fundedWallet(w)];
    const rent = rentFor(w, ENTRY_LEN);
    // Below the Entry's rent (the least a new data-less account may hold), and well above it.
    const cases = [
      { baker: a, prefund: rentFor(w, 0) },
      { baker: b, prefund: SOL },
    ];
    for (const { baker, prefund } of cases) {
      const address = await P.entryPda(campaign, baker.address);
      expectOk(await send(w, [systemTransferIx(donor, address, prefund)]));
      const [before, vaultBefore] = [balance(w, baker.address), balance(w, vault)];
      expectOk(await join(w, baker, campaign, { side: P.Side.Yes, amount: SOL }));
      // The baker tops the address up to the Entry's rent and no further; the vault takes the entry.
      const topUp = prefund < rent ? rent - prefund : 0n;
      expect(balance(w, baker.address)).toBe(before - SOL - topUp);
      expect(snapshot(w, address)).toMatchObject({ owner: P.PROGRAM_ID, lamports: prefund + topUp });
      expect(balance(w, vault)).toBe(vaultBefore + SOL);
      expect(await readEntry(w, campaign, baker.address)).toMatchObject({
        campaign,
        baker: baker.address,
        amount_yes: SOL,
      });
    }
    expect(readCampaign(w, campaign)).toMatchObject({ entries_open: 2, pool_yes: 2n * SOL, first_baker: a.address });
  });
});
