/**
 * Purpose: F5 of the pre-freeze review (Sprint 16): a close after the rent-exempt minimum rose above what the vault
 *          was funded with at its opening. The vault is planted 1,000 lamports short of today's rent plus its books
 *          (the split's dust and a reserved creator share). The close still goes through: the rent payer gets the
 *          vault's rent from what lies above the books only, 1,000 lamports less than today's rent, plus the reserve
 *          and the campaign's rent; the fee vault gets the dust; nothing the books owe is lost. Before the fix the
 *          close took today's whole rent first and was refused for good.
 * Version: 0.0.1
 * Sprint:  16 (lane L16P, the review's follow-ups). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";

import { generateKeyPairSigner, lamports } from "@solana/kit";

import { injectCampaign } from "./campaigns";
import { initConfig, newId } from "./flows";
import { settleSplit } from "./money-model";
import * as S from "./instructions-settlement";
import * as P from "./program";
import { balance, createWorld, expectOk, fundedWallet, now, send } from "./setup";

const SOL = P.SOL;
const SPLIT = settleSplit({ winning: 2n * SOL, losing: SOL, prize: 0n, feeBps: 1_000n, creatorBps: 100n });
const SHARE = SPLIT.creatorFromPot + SPLIT.creatorFromFee;
/** What the split's floor rounding left in the vault. */
const DUST = 7n;
/** How much the rent-exempt minimum of an empty account rose since the vault was funded. */
const RISE = 1_000n;

describe("a close after the rent-exempt minimum rose", () => {
  test("the rent comes from above the books: the dust and the reserve are paid, the close goes through", async () => {
    const w = await createWorld();
    await initConfig(w);
    const creator = await fundedWallet(w);
    const t = now(w.client);
    // Settled: the winners were paid the distributable amount less the dust, the creator's share was reserved (its
    // wallet was empty then), Brot's fee was collected and the prize flag set.
    const { campaign, vault } = await injectCampaign(w.client, {
      id: newId(),
      kind: P.ReaderKind.SupplyAtMost,
      metric: (await generateKeyPairSigner()).address,
      target: 1n,
      creator: creator.address,
      opensAt: t - P.DAY,
      entriesCloseAt: t - P.HOUR,
      deadlineAt: t - P.HOUR,
      poolYes: 2n * SOL,
      poolNo: SOL,
      status: P.Status.Settled,
      extra: {
        outcome: P.Outcome.Yes,
        settle_mode: 1, // Split
        winning_total: 2n * SOL,
        losing_total: SOL,
        distributable: SPLIT.distributable,
        fee_total: SPLIT.fee,
        creator_share: SHARE,
        creator_share_from_fee: SPLIT.creatorFromFee,
        paid_out_total: SPLIT.distributable - DUST,
        fee_collected: 1,
        prize_settled: 1,
        creator_share_settled: 1,
        creator_share_reserved: SHARE,
      },
    });
    // The vault holds the books (the dust and the reserve) and the rent it was funded with, RISE below today's.
    const rentNow = w.client.svm.minimumBalanceForRentExemption(0n);
    w.client.svm.setAccount({
      address: vault,
      data: new Uint8Array(0),
      executable: false,
      lamports: lamports(rentNow - RISE + DUST + SHARE),
      programAddress: P.PROGRAM_ID,
      space: 0n,
    });
    const feeVault = await P.feeVaultPda();
    const campaignRent = balance(w, campaign);
    const [creatorBefore, feesBefore] = [balance(w, creator.address), balance(w, feeVault)];

    expectOk(await send(w, [S.closeCampaignIx(campaign, vault, creator.address, feeVault)]));
    // The rent payer: the campaign's rent, the vault's rent as far as the vault holds it, and the reserve.
    expect(balance(w, creator.address) - creatorBefore).toBe(campaignRent + rentNow - RISE + SHARE);
    // The fee vault: the dust, the books' last lamports.
    expect(balance(w, feeVault) - feesBefore).toBe(DUST);
    expect([balance(w, vault), balance(w, campaign)]).toEqual([0n, 0n]);
  });
});
