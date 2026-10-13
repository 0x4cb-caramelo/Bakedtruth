/**
 * Purpose: the sealed entry on the program (Sprint 15; TP 3.4.12): its 10% held in the sponsor's `SealedFee`, never in
 *          the vault, while the 90% joins the pot as a join does; a second sealed entry tops the account up; a plain
 *          join by the same wallet shares its `Entry`; the floor, `max_lamports` and the SOL/USD account refuse with
 *          their own codes and move nothing; the retry guard (`expected_entry_total`).
 *          Filter: `bun test tests/ -t "sealed entry holds its 10 percent until the outcome"`.
 * Version: 0.0.1
 * Sprint:  15 (lane L15). Needs the SBF build: `bun run build:program` first.
 */
import { describe, expect, test } from "bun:test";

import { join, readCampaign, readEntry, SOL_CHARGED } from "./flows";
import { ENTRY_LEN, JOIN_LEN } from "./join-campaign-support";
import * as P from "./program";
import { readSealedFee, SEALED_FEE_LEN, sealedCharge, sealedEntry, sealedState, sealedWorld } from "./sealed-support";
import { balance, expectError, expectOk, rentFor, START_TIME, setPriceAccount } from "./setup";

const SOL = P.SOL;

describe("sealed entry", () => {
  test("sealed entry holds its 10 percent until the outcome: the fee in its SealedFee, the 90% in the pot", async () => {
    const { w, campaign, vault, sponsor } = await sealedWorld();
    const sealedFee = await P.sealedFeePda(campaign, sponsor.address);
    const before = await sealedState(w, sponsor.address, campaign);
    const { paid, entry, fee } = sealedCharge(500n);
    const sent = expectOk(await sealedEntry(w, sponsor, campaign, { side: P.Side.Yes }));

    // The vault gets the entry and nothing else; the fee and the rents are elsewhere (I1 unchanged).
    expect(balance(w, vault) - before.vault).toBe(entry);
    const c = readCampaign(w, campaign);
    expect(balance(w, vault)).toBe(
      rentFor(w, 0) +
        (c.pool_yes as bigint) +
        (c.pool_no as bigint) +
        (c.prize_lamports as bigint) +
        (c.opening_fee_lamports as bigint),
    );
    expect([c.pool_yes, c.pool_no, c.first_baker, c.sealed_fees_open, c.entries_open]).toEqual([
      entry,
      0n,
      sponsor.address,
      1,
      1,
    ]);
    // The SealedFee holds its rent and the fee, bookkept.
    expect(balance(w, sealedFee)).toBe(rentFor(w, SEALED_FEE_LEN) + fee);
    expect(await readSealedFee(w, campaign, sponsor.address)).toMatchObject({
      tag: 6,
      version: 1,
      campaign,
      sponsor: sponsor.address,
      fee_lamports: fee,
      entry_lamports: entry,
      usd_total: 500n,
      sealed_count: 1,
    });
    // The sponsor paid the charge and three rents (Entry, Join, SealedFee); the fee vault is untouched.
    const rents = rentFor(w, ENTRY_LEN) + rentFor(w, JOIN_LEN) + rentFor(w, SEALED_FEE_LEN);
    expect(before.sponsor - balance(w, sponsor.address)).toBe(paid + rents);
    expect(balance(w, await P.feeVaultPda())).toBe(before.feeVault);
    const e = await readEntry(w, campaign, sponsor.address);
    expect([e.amount_yes, e.amount_no, e.join_count, e.is_first]).toEqual([entry, 0n, 1, true]);

    // EntryAdded, as any join, then SealedFeeHeld, with contiguous seqs.
    expect(sent.events.map((e) => e.name)).toEqual(["EntryAdded", "SealedFeeHeld"]);
    const [added, held] = sent.events.map((e) => e.data);
    expect(added).toMatchObject({ campaign, baker: sponsor.address, side: P.Side.Yes, amount: entry, is_first: true });
    expect(held).toEqual({
      campaign,
      seq: (added.seq as bigint) + 1n,
      sponsor: sponsor.address,
      entry_usd: 500n,
      paid,
      entry_lamports: entry,
      fee_lamports: fee,
      fee_total: fee,
      price: SOL_CHARGED,
      exponent: -8,
      publish_time: START_TIME - 5n,
    });
    expect(c.event_seq).toBe((added.seq as bigint) + 2n);
  });

  test("a second sealed entry tops up; a plain join by the same wallet shares its Entry", async () => {
    const { w, campaign, sponsor } = await sealedWorld();
    const first = sealedCharge(500n);
    const second = sealedCharge(700n);
    expectOk(await sealedEntry(w, sponsor, campaign, { side: P.Side.Yes }));
    expectOk(
      await join(w, sponsor, campaign, { side: P.Side.No, amount: SOL, expectedEntryTotal: first.entry, joinIndex: 1 }),
    );
    const sent = expectOk(await sealedEntry(w, sponsor, campaign, { side: P.Side.Yes, entryUsd: 700n }));

    const e = await readEntry(w, campaign, sponsor.address);
    expect([e.amount_yes, e.amount_no, e.join_count]).toEqual([first.entry + second.entry, SOL, 3]);
    expect(await readSealedFee(w, campaign, sponsor.address)).toMatchObject({
      fee_lamports: first.fee + second.fee,
      entry_lamports: first.entry + second.entry,
      usd_total: 1_200n,
      sealed_count: 2,
    });
    const sealedFee = await P.sealedFeePda(campaign, sponsor.address);
    expect(balance(w, sealedFee)).toBe(rentFor(w, SEALED_FEE_LEN) + first.fee + second.fee);
    const c = readCampaign(w, campaign);
    expect([c.sealed_fees_open, c.entries_open, c.pool_yes, c.pool_no]).toEqual([
      1,
      1,
      first.entry + second.entry,
      SOL,
    ]);
    expect(sent.events[1].data).toMatchObject({ fee_lamports: second.fee, fee_total: first.fee + second.fee });
  });

  test("the floor, max_lamports and the SOL/USD account refuse with their own codes and move nothing", async () => {
    const { w, campaign, sponsor } = await sealedWorld();
    const { paid } = sealedCharge(500n);
    const kept = await sealedState(w, sponsor.address, campaign);
    const refused = async (a: Parameters<typeof sealedEntry>[3], error: Parameters<typeof expectError>[1]) => {
      expectError(await sealedEntry(w, sponsor, campaign, a), error);
      expect(await sealedState(w, sponsor.address, campaign)).toEqual(kept);
    };
    await refused({ side: P.Side.Yes, entryUsd: 499n }, "SealedEntryBelowFloor");
    await refused({ side: P.Side.Yes, entryUsd: 0n }, "SealedEntryBelowFloor");
    await refused({ side: P.Side.Yes, maxLamports: paid - 1n }, "SealedEntryAboveMaxLamports");
    // The SOL/USD account keeps row 7's own codes: stale, another owner, another feed, unverified, too wide.
    const solUsd = (change: Parameters<typeof setPriceAccount>[3]) =>
      setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", change);
    solUsd({ publishTime: START_TIME - 121n });
    await refused({ side: P.Side.Yes }, "SolUsdStale");
    solUsd({ owner: P.PYTH_LEGACY_RECEIVER_ID });
    await refused({ side: P.Side.Yes }, "SolUsdWrongOwner");
    solUsd({ feedId: P.BTC_USD_FEED_ID });
    await refused({ side: P.Side.Yes }, "SolUsdWrongFeed");
    solUsd({ verification: 0 });
    await refused({ side: P.Side.Yes }, "SolUsdNotFullyVerified");
    solUsd({ conf: 1_000_000_000n });
    await refused({ side: P.Side.Yes }, "SolUsdConfidenceTooWide");
    solUsd({});
    // At `max_lamports` exactly, the entry passes.
    expectOk(await sealedEntry(w, sponsor, campaign, { side: P.Side.Yes, maxLamports: paid }));
  });

  test("the retry guard: the signed entry total, a replay included", async () => {
    const { w, campaign, sponsor } = await sealedWorld();
    const { entry } = sealedCharge(500n);
    const kept = await sealedState(w, sponsor.address, campaign);
    expectError(
      await sealedEntry(w, sponsor, campaign, { side: P.Side.No, expectedEntryTotal: 1n }),
      "EntryTotalMismatch",
    );
    expect(await sealedState(w, sponsor.address, campaign)).toEqual(kept);
    expectOk(await sealedEntry(w, sponsor, campaign, { side: P.Side.No, expectedEntryTotal: 0n }));
    // The same signed values again: the total is no longer 0, so the retry fails instead of entering twice.
    const replay = { side: P.Side.No, expectedEntryTotal: 0n, joinIndex: 1 };
    expectError(await sealedEntry(w, sponsor, campaign, replay), "EntryTotalMismatch");
    expectOk(await sealedEntry(w, sponsor, campaign, { ...replay, expectedEntryTotal: entry }));
  });
});
