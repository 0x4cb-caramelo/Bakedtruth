/**
 * Purpose: row 10 of TP section 3.4.10 (T17; X0.5, opening half): a retried opening with the same
 *          id fails on the existing account and charges nothing twice, while an address funded in
 *          advance does not block an opening; and when entries close for the six durations of P1
 *          section 3.6 (`math/schedule.rs` through the program).
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane D. Runs after the SBF build (Wave 2).
 */
import { describe, expect, test } from "bun:test";
import { lamports } from "@solana/kit";

import { newId, openingLamports, readCampaign, readConfig, SOL_PRICE } from "./flows";
import { openingWorld, rents, split, tryOpen } from "./opening";
import * as P from "./program";
import { balance, expectError, expectOk, now } from "./setup";

describe("retried opening fails on its id", () => {
  test("the same id twice: AlreadyInitialized, and nothing charged twice", async () => {
    const w = await openingWorld();
    const first = await tryOpen(w, w.creator);
    expectOk(first.sent);
    const afterFirst = { creator: balance(w, w.creator.address), vault: balance(w, first.vault) };

    // A rebuilt transaction reuses the saved id (T17), whoever signs it.
    const retry = await tryOpen(w, w.creator, { id: first.args.id, deadlineAt: first.args.deadlineAt });
    expectError(retry.sent, "AlreadyInitialized");
    const byTeam = await tryOpen(w, w.team, { id: first.args.id, openingUsd: 0n });
    expectError(byTeam.sent, "AlreadyInitialized");

    expect(balance(w, w.creator.address)).toBe(afterFirst.creator);
    expect(balance(w, first.vault)).toBe(afterFirst.vault);
    expect((await readConfig(w)).open_campaigns).toBe(1);
    expect(readCampaign(w, first.campaign).creator).toBe(w.creator.address);
  });

  test("a campaign address funded in advance still opens, topped up to its rent", async () => {
    const w = await openingWorld();
    const id = newId();
    const prefunded = 1_000_000n;
    w.client.svm.airdrop(await P.campaignPda(id), lamports(prefunded));
    const before = balance(w, w.creator.address);
    const { sent, campaign, vault } = await tryOpen(w, w.creator, { id });
    expectOk(sent);
    const rent = rents(w);
    const paid = openingLamports(500n, SOL_PRICE);
    expect(balance(w, campaign)).toBe(rent.campaign);
    expect(before - balance(w, w.creator.address)).toBe(rent.campaign - prefunded + rent.vault + paid);
    expect(balance(w, vault)).toBe(rent.vault + paid);
    expect(readCampaign(w, campaign)).toMatchObject({ tag: 2, id, creator: w.creator.address });
  });

  test("a vault address funded in advance still opens; the surplus is never bookkept (I15)", async () => {
    const w = await openingWorld();
    const id = newId();
    const prefunded = 2n * P.SOL;
    w.client.svm.airdrop(await P.vaultPda(await P.campaignPda(id)), lamports(prefunded));
    const before = balance(w, w.creator.address);
    const { sent, campaign, vault } = await tryOpen(w, w.creator, { id });
    expectOk(sent);
    const rent = rents(w);
    const { paid, prize, fee } = split(openingLamports(500n, SOL_PRICE));
    // Already above its rent, the vault needs no top-up: the creator pays the campaign's rent only.
    expect(before - balance(w, w.creator.address)).toBe(rent.campaign + paid);
    expect(balance(w, vault)).toBe(prefunded + paid);
    const stored = readCampaign(w, campaign);
    expect(stored).toMatchObject({ opening_paid_lamports: paid, prize_lamports: prize, opening_fee_lamports: fee });
    expect(stored).toMatchObject({ pool_yes: 0n, pool_no: 0n });
  });
});

describe("entries close at five percent of the duration", () => {
  test("3, 7, 14, 30, 60 and 90 days close at day 2.0, 6.0, 13.0, 28.5, 57.0 and 85.5", async () => {
    const w = await openingWorld();
    const rows: [days: bigint, closeHours: bigint][] = [
      [3n, 48n],
      [7n, 144n],
      [14n, 312n],
      [30n, 684n],
      [60n, 1_368n],
      [90n, 2_052n],
    ];
    for (const [days, closeHours] of rows) {
      const opensAt = now(w.client);
      const { sent, campaign } = await tryOpen(w, w.team, { openingUsd: 0n, deadlineAt: opensAt + days * P.DAY });
      expectOk(sent);
      const stored = readCampaign(w, campaign);
      expect([stored.opens_at, stored.entries_close_at - stored.opens_at]).toEqual([opensAt, closeHours * P.HOUR]);
      expect(stored.deadline_at).toBe(opensAt + days * P.DAY);
    }
  });
});
