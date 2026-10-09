/**
 * Purpose: the money rules run through the program, with the Sprint 04 instructions on injected states:
 *          a one-sided pot's rows, the pause never blocking a payout (I10′), two wallets that cannot take
 *          each other's money, and every transition outside TP section 3.4.2 refused with the instruction's own error (finalize: CampaignNotInReview; resolve: CampaignNotOpen, or CutoffNotMovable in review).
 *          Needs the program binary (target/deploy/brot_markets.so): run it at integration.
 * Version: 0.0.1
 * Sprint:  04 (contract freeze, lane E)
 */
import { describe, expect, test } from "bun:test";
import { type Address, lamports } from "@solana/kit";

import { injectCampaign, injectEntry, injectSettling } from "./campaigns";
import { BTC_PRICE, initConfig, newId, openedCampaign, openPriceCampaign, setTeam, join } from "./flows";
import { layoutSize } from "./layouts";
import * as I from "./instructions";
import {
  closeCampaignIx,
  collectFeeIx,
  finalizeCampaignIx,
  settleCreatorShareIx,
  settleEntryIx,
  settlePrizeIx,
} from "./instructions-settlement";
import * as P from "./program";
import { balance, createWorld, expectError, expectOk, fundedWallet, now, rentFor, send, type World } from "./setup";
import { ENTRY } from "./structs";

const SOL = P.SOL;
const HOUR = 3_600n;
const SETTLE_ONE_SIDED = 2;
const SETTLE_SPLIT = 1;
const RENT_ENTRY = (w: World) => rentFor(w, layoutSize(ENTRY));

/** Adds `extra` lamports to a data-less account (a vault), as a transfer would have. */
function fund(w: World, address: Address, extra: bigint) {
  w.client.svm.setAccount({
    address,
    data: new Uint8Array(0),
    executable: false,
    lamports: lamports(balance(w, address) + extra),
    programAddress: P.PROGRAM_ID,
    space: 0n,
  });
}

/**
 * A Split pot in `Settling`, written as the snapshot leaves it: Ana 6 SOL on YES, Bruno 4 SOL on NO. The fee is
 * 0.4 SOL, the creator's share 0.1 SOL from the pot, the winners' pot 9.5 SOL (TP section 3.4.16).
 */
async function splitWorld() {
  const w = await createWorld();
  const { admin } = await initConfig(w);
  const [member] = await setTeam(w, admin, 1);
  const [creator, ana, bruno] = [await fundedWallet(w), await fundedWallet(w), await fundedWallet(w)];
  const t = now(w.client);
  const { campaign, vault } = await injectSettling(
    w.client,
    {
      id: newId(),
      kind: P.ReaderKind.PriceTouch,
      metric: P.BTC_USD_ACCOUNT,
      target: BTC_PRICE,
      creator: creator.address,
      opensAt: t - P.DAY,
      entriesCloseAt: t - 24n * HOUR,
      deadlineAt: t - HOUR,
      feedId: P.BTC_USD_FEED_ID,
      priceExponent: -8,
      poolYes: 6n * SOL,
      poolNo: 4n * SOL,
      extra: { settle_mode: SETTLE_SPLIT, entries_open: 2, prize_settled: true },
    },
    P.Outcome.Yes,
    {
      winning_total: 6n * SOL,
      losing_total: 4n * SOL,
      distributable: 9_500_000_000n,
      fee_total: 400_000_000n,
      creator_share: 100_000_000n,
      creator_share_from_fee: 0n,
    },
  );
  await injectEntry(w.client, { campaign, baker: ana.address, amountYes: 6n * SOL });
  await injectEntry(w.client, { campaign, baker: bruno.address, amountNo: 4n * SOL });
  return { w, admin, member, creator, ana, bruno, campaign, vault, feeVault: await P.feeVaultPda() };
}

describe("money rules on the program", () => {
  test("one-sided pot: Ana, Bruno and Carla come back 1, 1.98 and 2.97 SOL, the prize returns, Brot keeps 0.05 SOL", async () => {
    const w = await createWorld();
    await initConfig(w);
    const [creator, ana, bruno, carla] = [
      await fundedWallet(w),
      await fundedWallet(w),
      await fundedWallet(w),
      await fundedWallet(w),
    ];
    const prize = 4_118_239_224n;
    const opening = 457_582_136n;
    const t = now(w.client);
    const { campaign, vault } = await injectSettling(
      w.client,
      {
        id: newId(),
        kind: P.ReaderKind.PriceTouch,
        metric: P.BTC_USD_ACCOUNT,
        target: BTC_PRICE,
        creator: creator.address,
        opensAt: t - P.DAY,
        entriesCloseAt: t - 24n * HOUR,
        deadlineAt: t - HOUR,
        feedId: P.BTC_USD_FEED_ID,
        priceExponent: -8,
        poolYes: 6n * SOL,
        poolNo: 0n,
        extra: {
          settle_mode: SETTLE_ONE_SIDED,
          entries_open: 3,
          first_baker: ana.address,
          prize_lamports: prize,
          opening_fee_lamports: opening,
          opening_paid_lamports: prize + opening,
          creator_share_settled: true,
        },
      },
      P.Outcome.Yes,
      { winning_total: 6n * SOL, fee_total: 50_000_000n, distributable: 0n },
    );
    fund(w, vault, prize + opening);
    // Ana joined the empty pot first: her entry is exempt from the one-sided fee (Q3).
    await injectEntry(w.client, { campaign, baker: ana.address, amountYes: SOL, isFirst: true });
    await injectEntry(w.client, { campaign, baker: bruno.address, amountYes: 2n * SOL });
    await injectEntry(w.client, { campaign, baker: carla.address, amountYes: 3n * SOL });
    const feeVault = await P.feeVaultPda();
    const rent = RENT_ENTRY(w);
    const deltas = [
      [ana, SOL],
      [bruno, 1_980_000_000n],
      [carla, 2_970_000_000n],
    ] as const;
    for (const [baker, amount] of deltas) {
      const before = balance(w, baker.address);
      expectOk(
        await send(w, [settleEntryIx(await P.entryPda(campaign, baker.address), campaign, vault, baker.address)]),
      );
      expect(balance(w, baker.address) - before).toBe(amount + rent);
    }
    const creatorBefore = balance(w, creator.address);
    expectOk(await send(w, [settlePrizeIx(campaign, vault, creator.address)]));
    expect(balance(w, creator.address) - creatorBefore).toBe(prize);
    const feeBefore = balance(w, feeVault);
    expectOk(await send(w, [collectFeeIx(campaign, vault, feeVault)]));
    expect(balance(w, feeVault) - feeBefore).toBe(50_000_000n + opening);
  });

  test("pause never blocks a payout: joins and openings refuse, every payout, the share, the fee and the close run", async () => {
    const s = await splitWorld();
    const { w, admin, member, creator, ana, bruno, campaign, vault, feeVault } = s;
    const open = await openedCampaign(w, creator);
    expectOk(await send(w, [await I.pauseEntriesIx(member)]));

    const baker = await fundedWallet(w);
    expectError(await join(w, baker, open.campaign, { side: P.Side.Yes, amount: SOL / 10n }), "JoinWhilePaused");
    expectError((await openPriceCampaign(w, creator)).sent, "OpenWhilePaused");

    const rent = RENT_ENTRY(w);
    const anaBefore = balance(w, ana.address);
    expectOk(await send(w, [settleEntryIx(await P.entryPda(campaign, ana.address), campaign, vault, ana.address)]));
    expect(balance(w, ana.address) - anaBefore).toBe(9_500_000_000n + rent);
    const bruBefore = balance(w, bruno.address);
    expectOk(await send(w, [settleEntryIx(await P.entryPda(campaign, bruno.address), campaign, vault, bruno.address)]));
    expect(balance(w, bruno.address) - bruBefore).toBe(rent);

    const shareBefore = balance(w, creator.address);
    expectOk(await send(w, [settleCreatorShareIx(campaign, vault, creator.address)]));
    expect(balance(w, creator.address) - shareBefore).toBe(100_000_000n);
    const feeBefore = balance(w, feeVault);
    expectOk(await send(w, [collectFeeIx(campaign, vault, feeVault)]));
    expect(balance(w, feeVault) - feeBefore).toBe(400_000_000n);
    expectOk(await send(w, [closeCampaignIx(campaign, vault, creator.address, feeVault)]));
    expect(balance(w, campaign)).toBe(0n);
    expectOk(await send(w, [await I.resumeEntriesIx(admin)]));
  });

  test("two wallets: A cannot receive, close or redirect B's Entry, nor take the creator share", async () => {
    const s = await splitWorld();
    const { w, creator, ana, bruno, campaign, vault, feeVault } = s;
    const bEntry = await P.entryPda(campaign, bruno.address);
    const bBefore = balance(w, ana.address);
    expectError(await send(w, [settleEntryIx(bEntry, campaign, vault, ana.address)]), "WrongBaker");
    expectError(await send(w, [settleCreatorShareIx(campaign, vault, ana.address)]), "WrongCreator");
    expect(balance(w, ana.address)).toBe(bBefore);
    expect(balance(w, bEntry)).toBeGreaterThan(0n);

    expectOk(await send(w, [settleEntryIx(await P.entryPda(campaign, ana.address), campaign, vault, ana.address)]));
    expectOk(await send(w, [settleEntryIx(bEntry, campaign, vault, bruno.address)]));
    expectOk(await send(w, [settleCreatorShareIx(campaign, vault, creator.address)]));
    expectOk(await send(w, [collectFeeIx(campaign, vault, feeVault)]));
    const anaBefore = balance(w, ana.address);
    expect((await send(w, [closeCampaignIx(campaign, vault, ana.address, feeVault)])).ok).toBe(false);
    expect(balance(w, ana.address)).toBe(anaBefore);
  });

  test("every transition outside TP section 3.4.2 is refused with the instruction's own error", async () => {
    const w = await createWorld();
    await initConfig(w);
    const creator = await fundedWallet(w);
    const t = now(w.client);
    const base = {
      kind: P.ReaderKind.PriceTouch,
      metric: P.BTC_USD_ACCOUNT,
      target: BTC_PRICE,
      creator: creator.address,
      opensAt: t - P.DAY,
      entriesCloseAt: t + P.DAY,
      deadlineAt: t + 2n * P.DAY,
    };
    const config = await P.configPda();
    for (const status of [P.Status.Open, P.Status.Contested, P.Status.Settling, P.Status.Settled]) {
      const { campaign } = await injectCampaign(w.client, { ...base, id: newId(), status });
      expectError(await send(w, [finalizeCampaignIx(campaign, config)]), "CampaignNotInReview");
    }
    // In review the re-proof rule answers first: only an earlier YES price proof moves the cut-off.
    const refusedAs: [number, "CutoffNotMovable" | "CampaignNotOpen"][] = [
      [P.Status.InReview, "CutoffNotMovable"],
      [P.Status.Contested, "CampaignNotOpen"],
      [P.Status.Settling, "CampaignNotOpen"],
      [P.Status.Settled, "CampaignNotOpen"],
    ];
    for (const [status, error] of refusedAs) {
      const { campaign } = await injectCampaign(w.client, { ...base, id: newId(), status });
      expectError(await send(w, [I.resolveCampaignIx(campaign, P.BTC_USD_ACCOUNT, P.BTC_USD_ACCOUNT)]), error);
    }
  });
});
