/**
 * Purpose: every refusal of `user_join_campaign` on the campaign's rules, each with its own error
 *          (X0.7): not Open, entries closed, the pause, the minimum, the signed total (T10), the
 *          signed return, the side, the metric account, and an Entry that is not the baker's.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane E. Needs the SBF build: runs from the integration on.
 */
import { describe, expect, test } from "bun:test";
import { getAddressEncoder, type Address, type KeyPairSigner } from "@solana/kit";

import { join, openedCampaign, readCampaign, readEntry } from "./flows";
import * as I from "./instructions";
import { offsetOf } from "./layouts";
import * as P from "./program";
import { accountData, expectError, expectOk, fundedWallet, send, setTime } from "./setup";
import { CAMPAIGN, ENTRY } from "./structs";
import { entryBump, expectedEstimate, joinWorld, MIN_ENTRY, rewrite, walletWhere } from "./join-campaign-support";

const SOL = P.SOL;
const yes = (amount: bigint, more: Partial<I.JoinArgs> = {}): I.JoinArgs => ({ side: P.Side.Yes, amount, ...more });
const no = (amount: bigint, more: Partial<I.JoinArgs> = {}): I.JoinArgs => ({ side: P.Side.No, amount, ...more });

describe("join refuses", () => {
  test("a campaign that is not Open", async () => {
    const { w, campaign } = await joinWorld();
    const baker = await fundedWallet(w);
    // Nothing in Sprint 02 takes a campaign out of Open (resolution is Sprint 03), so this one test
    // writes the status byte with setAccount: a state no transaction of this sprint can reach.
    for (const status of [P.Status.InReview, P.Status.Settled]) {
      rewrite(w, campaign, (data) => (data[offsetOf(CAMPAIGN, "status")] = status));
      expectError(await join(w, baker, campaign, yes(SOL)), "CampaignNotOpen");
    }
  });

  test("from entries_close_at on, and not one second before", async () => {
    const { w, campaign } = await joinWorld();
    const baker = await fundedWallet(w);
    const closeAt = readCampaign(w, campaign).entries_close_at as bigint;
    setTime(w.client, closeAt);
    expectError(await join(w, baker, campaign, yes(SOL)), "EntriesClosed");
    setTime(w.client, closeAt + P.DAY);
    expectError(await join(w, baker, campaign, yes(SOL)), "EntriesClosed");
    setTime(w.client, closeAt - 1n);
    expectOk(await join(w, baker, campaign, yes(SOL)));
  });

  test("with the pause on", async () => {
    const { w, team, campaign } = await joinWorld();
    const baker = await fundedWallet(w);
    expectOk(await send(w, [await I.pauseEntriesIx(team[0])]));
    expectError(await join(w, baker, campaign, yes(SOL)), "JoinWhilePaused");
  });

  test("below min_entry_lamports, and takes exactly the minimum", async () => {
    const { w, campaign } = await joinWorld();
    const baker = await fundedWallet(w);
    expectError(await join(w, baker, campaign, yes(MIN_ENTRY - 1n)), "EntryBelowMinimum");
    expectError(await join(w, baker, campaign, no(0n)), "EntryBelowMinimum");
    expectOk(await join(w, baker, campaign, yes(MIN_ENTRY)));
  });

  test("an expected_entry_total that is not the entry's (T10), a replayed join included", async () => {
    const { w, campaign } = await joinWorld();
    const baker = await fundedWallet(w);
    // No Entry yet: the baker's total is 0, and only 0 passes.
    expectError(await join(w, baker, campaign, yes(SOL, { expectedEntryTotal: SOL })), "EntryTotalMismatch");
    expectOk(await join(w, baker, campaign, yes(SOL)));
    // The same join sent again, as a client retries one it never saw confirmed: the total is now
    // 1 SOL, not the 0 it signed, so it fails instead of entering twice.
    expectError(await join(w, baker, campaign, yes(SOL)), "EntryTotalMismatch");
    expectError(await join(w, baker, campaign, yes(SOL, { expectedEntryTotal: SOL - 1n })), "EntryTotalMismatch");
    expectError(await join(w, baker, campaign, yes(SOL, { expectedEntryTotal: SOL + 1n })), "EntryTotalMismatch");
    // The total is the whole entry, both sides (Q3).
    expectOk(await join(w, baker, campaign, no(SOL, { expectedEntryTotal: SOL })));
    expectError(await join(w, baker, campaign, no(SOL, { expectedEntryTotal: SOL })), "EntryTotalMismatch");
    expectOk(await join(w, baker, campaign, no(SOL, { expectedEntryTotal: 2n * SOL })));
    const entry = await readEntry(w, campaign, baker.address);
    expect([entry.amount_yes, entry.amount_no]).toEqual([SOL, 2n * SOL]);
  });

  test("an estimated return below min_return_bps", async () => {
    const { w, campaign } = await joinWorld();
    const [a, b, c] = [await fundedWallet(w), await fundedWallet(w), await fundedWallet(w)];
    // The first baker in an empty pot: its whole entry back, with no fee, is 10,000 bps.
    expectError(await join(w, a, campaign, yes(SOL, { minReturnBps: 10_001 })), "ReturnBelowMinimum");
    expectOk(await join(w, a, campaign, yes(SOL, { minReturnBps: 10_000 })));
    // NO still empty: 1 SOL less the 1% one-sided fee is 9,900 bps.
    expectError(await join(w, b, campaign, yes(SOL, { minReturnBps: 9_901 })), "ReturnBelowMinimum");
    expectOk(await join(w, b, campaign, yes(SOL, { minReturnBps: 9_900 })));
    // Alone on NO against 2 SOL and the prize: the Split payout, net of the fee and the share.
    const bps = expectedEstimate(w, campaign, P.Side.No, SOL, false);
    expect(bps).toBeGreaterThan(20_000n);
    expectError(await join(w, c, campaign, no(SOL, { minReturnBps: Number(bps + 1n) })), "ReturnBelowMinimum");
    expectOk(await join(w, c, campaign, no(SOL, { minReturnBps: Number(bps) })));
  });

  test("a side byte that is neither YES nor NO", async () => {
    const { w, campaign } = await joinWorld();
    const baker = await fundedWallet(w);
    expectError(await join(w, baker, campaign, { side: 2, amount: SOL }), "InvalidSide");
    expectError(await join(w, baker, campaign, { side: 255, amount: SOL }), "InvalidSide");
  });

  test("a metric account other than the campaign's", async () => {
    const { w, campaign } = await joinWorld();
    const baker = await fundedWallet(w);
    // A real Pyth account, but not the BTC/USD account this campaign locked at opening.
    expectError(
      await send(w, [await I.joinCampaignIx(baker, campaign, P.SOL_USD_ACCOUNT, yes(SOL))]),
      "MetricAccountMismatch",
    );
  });

  test("an Entry of another campaign or another baker (PdaMismatch), or one naming them (EntryMismatch)", async () => {
    const { w, creator, campaign, metric } = await joinWorld();
    const other = (await openedCampaign(w, creator)).campaign;
    // The program re-derives the Entry from this campaign, the signer and the bump stored in the
    // account passed. c's canonical bumps in both campaigns are equal, so its other Entry's bump
    // gives c's own address here, a different one; b's bump is 255 and a's is lower, so on a's
    // seeds it gives no address at all. Both are `PdaMismatch` (`checks::pda`), on every run.
    const c = await walletWhere(w, async (x) => (await entryBump(other, x)) === (await entryBump(campaign, x)));
    const a = await walletWhere(w, async (x) => (await entryBump(campaign, x)) < 255);
    const b = await walletWhere(w, async (x) => (await entryBump(campaign, x)) === 255);
    expectOk(await join(w, c, other, yes(SOL)));
    expectOk(await join(w, b, campaign, yes(SOL)));
    const passing = async (signer: KeyPairSigner, entry: Address) =>
      I.withSlot(await I.joinCampaignIx(signer, campaign, metric, yes(SOL)), 4, { address: entry });
    expectError(await send(w, [await passing(c, await P.entryPda(other, c.address))]), "PdaMismatch");
    expectError(await send(w, [await passing(a, await P.entryPda(campaign, b.address))]), "PdaMismatch");
    // An Entry at a's own address that names someone else exists only through setAccount; the
    // stored keys are compared as well (the explicit `has_one` of TP section 3.4.17).
    expectOk(await join(w, a, campaign, yes(SOL)));
    const own = await P.entryPda(campaign, a.address);
    const original = Uint8Array.from(accountData(w, own));
    const fields = [
      ["baker", b.address],
      ["campaign", other],
    ] as const;
    for (const [field, value] of fields) {
      rewrite(w, own, (data) => data.set(getAddressEncoder().encode(value), offsetOf(ENTRY, field)));
      expectError(await join(w, a, campaign, yes(SOL, { expectedEntryTotal: SOL })), "EntryMismatch");
      rewrite(w, own, (data) => data.set(original));
    }
    expectOk(await join(w, a, campaign, yes(SOL, { expectedEntryTotal: SOL })));
  });
});
