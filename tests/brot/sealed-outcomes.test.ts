/**
 * Purpose: a sealed entry follows the common rule of any entry (TP v0.0.1 Q5, answered a; P-4), on the program, from
 *          the entry to `close_campaign`: in a split it is paid as any winning entry and its fee goes to the fee vault;
 *          in a one-sided pot it pays the 1% unless it was the first baker, and the fee is kept; on a void by an
 *          outside cause the entry comes back without fee and the fee is kept; on a void the house caused the entry
 *          comes back and so does the fee. Close is refused while the fee is held, and runs once it is settled.
 *          Filter: `bun test tests/ -t "sealed entry follows the common rule"`.
 * Version: 0.0.1
 * Sprint:  15 (lane L15). Needs the SBF build.
 */
import { describe, expect, test } from "bun:test";

import * as S from "./instructions-settlement";
import { join, readCampaign } from "./flows";
import { distributable, ENTRY_LEN, JOIN_LEN, oneSidedRefund } from "./join-campaign-support";
import * as P from "./program";
import { SEALED_FEE_LEN, sealedCharge, sealedEntry, sealedWorld } from "./sealed-support";
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
  voidAsHouseFailure,
  type Outcome,
} from "./sealed-flows";
import { balance, expectError, expectOk, fundedWallet, rentFor, send } from "./setup";

const SOL = P.SOL;
const MODE = { Split: 1, OneSided: 2, Refund: 3 };

type Case = { outcome: Outcome; house?: boolean; brunoFirst?: boolean; bruno: { side: number; amount: bigint } };

/** A paid campaign; Bruno's join and the sponsor's sealed YES of US$500 (Bruno first when asked); the outcome; every
 * settlement in turn, close refused while the fee is held; what each payout moved. */
async function lifecycle(cs: Case) {
  const { w, team, creator, campaign, sponsor } = await sealedWorld();
  const bruno = await fundedWallet(w);
  const brunoJoins = async () => expectOk(await join(w, bruno, campaign, cs.bruno));
  if (cs.brunoFirst) await brunoJoins();
  expectOk(await sealedEntry(w, sponsor, campaign, { side: P.Side.Yes }));
  if (!cs.brunoFirst) await brunoJoins();
  await resolve(w, campaign, cs.outcome);
  await tallyAll(w, campaign, [sponsor.address, bruno.address]);
  await (cs.house ? voidAsHouseFailure(w, team[0], campaign) : finalize(w, campaign));
  const c = readCampaign(w, campaign);
  const feeVault = await P.feeVaultPda();
  const vault = await P.vaultPda(campaign);
  const sponsorPaid = await moved(w, [sponsor.address], () => settleEntry(w, campaign, sponsor.address));
  const brunoPaid = await moved(w, [bruno.address], () => settleEntry(w, campaign, bruno.address));
  const collected = await moved(w, [feeVault], () => collectFee(w, campaign));
  const prize = await moved(w, [creator.address], () => settlePrize(w, campaign, creator.address));
  if (c.settle_mode === MODE.Split) expectOk(await send(w, [S.settleCreatorShareIx(campaign, vault, creator.address)]));
  expectError(await closeCampaign(w, campaign, creator.address), "SealedFeesOpen");
  const sealedFee = await P.sealedFeePda(campaign, sponsor.address);
  const settled = await moved(w, [sponsor.address, feeVault], () => settleSealedFee(w, campaign, sponsor.address));
  expect([balance(w, sealedFee), w.client.svm.getAccount(sealedFee).exists]).toEqual([0n, false]);
  expect(readCampaign(w, campaign).sealed_fees_open).toBe(0);
  expectOk(await closeCampaign(w, campaign, creator.address));
  const rents = rentFor(w, ENTRY_LEN) + rentFor(w, JOIN_LEN);
  return {
    c,
    rents,
    sealedRent: rentFor(w, SEALED_FEE_LEN),
    sponsorEntry: sponsorPaid.gains[0] - rents,
    brunoEntry: brunoPaid.gains[0] - rents,
    collected: collected.gains[0],
    prize: prize.gains[0],
    sealed: { sponsor: settled.gains[0], feeVault: settled.gains[1], event: settled.sent.events[0] },
  };
}

describe("sealed entry follows the common rule", () => {
  const { entry, fee } = sealedCharge(500n);

  test("Split: the sealed entry is paid as any winning entry, and its fee goes to the fee vault", async () => {
    const r = await lifecycle({ outcome: "yes", bruno: { side: P.Side.No, amount: 2n * SOL } });
    expect(r.c.settle_mode).toBe(MODE.Split);
    // Alone on the winning side, the sealed entry's 90% takes the whole distributable amount; the 10% was never in it.
    const prize = r.c.prize_lamports as bigint;
    expect(r.c.distributable).toBe(distributable(entry, 2n * SOL, prize, 1_000n, 100n));
    expect([r.sponsorEntry, r.brunoEntry]).toEqual([r.c.distributable as bigint, 0n]);
    // The creator's share counts the entry part only: 1% of V + P.
    expect(r.c.creator_share).toBe((entry + 2n * SOL) / 100n);
    expect(r.sealed.sponsor).toBe(r.sealedRent);
    expect(r.sealed.feeVault).toBe(fee);
    expect(r.sealed.event).toMatchObject({ name: "SealedFeeSettled", data: { fee_lamports: fee, refunded: false } });
  });

  test("OneSided, the sponsor first: its entry comes back whole, the fee is kept", async () => {
    const r = await lifecycle({ outcome: "no", bruno: { side: P.Side.Yes, amount: SOL } });
    expect(r.c.settle_mode).toBe(MODE.OneSided);
    expect([r.sponsorEntry, r.brunoEntry]).toEqual([entry, oneSidedRefund(SOL, 100n, false)]);
    expect(r.collected).toBe(SOL / 100n + (r.c.opening_fee_lamports as bigint));
    expect([r.sealed.sponsor, r.sealed.feeVault]).toEqual([r.sealedRent, fee]);
  });

  test("OneSided, another baker first: the sealed entry pays the 1% like any later entry, the fee is kept", async () => {
    const r = await lifecycle({ outcome: "yes", brunoFirst: true, bruno: { side: P.Side.Yes, amount: SOL } });
    expect(r.c.settle_mode).toBe(MODE.OneSided);
    expect([r.sponsorEntry, r.brunoEntry]).toEqual([oneSidedRefund(entry, 100n, false), SOL]);
    expect([r.sealed.sponsor, r.sealed.feeVault]).toEqual([r.sealedRent, fee]);
  });

  test("Void by an outside cause: the entry comes back without fee, the 10% is kept", async () => {
    const r = await lifecycle({ outcome: "stale", bruno: { side: P.Side.No, amount: 2n * SOL } });
    expect([r.c.settle_mode, r.c.void_reason]).toEqual([MODE.Refund, P.VoidReason.StaleFeed]);
    expect([r.sponsorEntry, r.brunoEntry]).toEqual([entry, 2n * SOL]);
    expect([r.prize, r.collected]).toEqual([r.c.prize_lamports as bigint, r.c.opening_fee_lamports as bigint]);
    expect([r.sealed.sponsor, r.sealed.feeVault]).toEqual([r.sealedRent, fee]);
    expect(r.sealed.event.data).toMatchObject({ refunded: false });
  });

  test("Void by a house failure: the entry comes back, and so does the fee, to the sponsor", async () => {
    const r = await lifecycle({ outcome: "stale", house: true, bruno: { side: P.Side.No, amount: 2n * SOL } });
    expect([r.c.settle_mode, r.c.void_reason]).toEqual([MODE.Refund, P.VoidReason.TeamHouseFailure]);
    expect([r.sponsorEntry, r.brunoEntry]).toEqual([entry, 2n * SOL]);
    const opening = r.c.opening_fee_lamports as bigint;
    expect([r.prize, r.collected]).toEqual([(r.c.prize_lamports as bigint) + opening, 0n]);
    expect([r.sealed.sponsor, r.sealed.feeVault]).toEqual([r.sealedRent + fee, 0n]);
    expect(r.sealed.event.data).toMatchObject({ fee_lamports: fee, refunded: true });
  });
});
