/**
 * Purpose: close_campaign and sweep_fees on the binary: the rent of the campaign and its vault goes back to
 *          the stored rent payer, the vault's surplus goes to the fee vault, both accounts are gone, and the
 *          fee vault's surplus above its rent goes to the stored fee recipient (`bun test tests/brot/close-sweep.test.ts`).
 * Version: 0.0.1
 * Sprint:  04 (lane D). Needs the SBF build: `bun run build:program` first.
 */
import { describe, expect, test } from "bun:test";

import { injectCampaign } from "./campaigns";
import { initConfig } from "./flows";
import * as S from "./instructions-settlement";
import * as P from "./program";
import { anyAddress } from "./resolve-support";
import { balance, createWorld, expectError, expectOk, fundedWallet, rentFor, send, START_TIME } from "./setup";
import { CAMPAIGN_LEN } from "./opening";

const SURPLUS = 5_000n;
/** Settled as a split: every flag set, nothing open; the vault holds its rent plus a hand-sent surplus. */
async function settledCampaign(
  w: Awaited<ReturnType<typeof createWorld>>,
  creator: Awaited<ReturnType<typeof fundedWallet>>,
) {
  return injectCampaign(w.client, {
    id: 4242n,
    kind: P.ReaderKind.SupplyAtMost,
    metric: await anyAddress(),
    target: 0n,
    creator: creator.address,
    opensAt: START_TIME - P.DAY,
    entriesCloseAt: START_TIME,
    deadlineAt: START_TIME + 3n * P.DAY,
    status: P.Status.Settled,
    poolYes: SURPLUS,
    extra: {
      outcome: P.Outcome.Yes,
      settle_mode: 1,
      fee_collected: 1,
      prize_settled: 1,
      creator_share_settled: 1,
      entries_open: 0,
    },
  });
}

describe("close and sweep", () => {
  test("close returns rent and sweeps the surplus", async () => {
    const w = await createWorld();
    const { feeRecipient } = await initConfig(w);
    const creator = await fundedWallet(w);
    const { campaign, vault } = await settledCampaign(w, creator);
    const feeVault = await P.feeVaultPda();
    const campaignRent = await balance(w, campaign);
    const vaultRent = (await balance(w, vault)) - SURPLUS;
    expect(campaignRent).toBe(rentFor(w, CAMPAIGN_LEN));
    const creatorBefore = await balance(w, creator.address);
    const feeVaultBefore = await balance(w, feeVault);

    expectOk(await send(w, [S.closeCampaignIx(campaign, vault, creator.address, feeVault)]));
    expect(await balance(w, campaign)).toBe(0n);
    expect(await balance(w, vault)).toBe(0n);
    expect(await balance(w, creator.address)).toBe(creatorBefore + campaignRent + vaultRent);
    expect(await balance(w, feeVault)).toBe(feeVaultBefore + SURPLUS);

    // The fee vault's surplus above its own rent goes to the fee recipient, and nowhere else.
    const rent0 = rentFor(w, 0);
    const surplus = (await balance(w, feeVault)) - rent0;
    const recipientBefore = await balance(w, feeRecipient.address);
    expectOk(await send(w, [S.sweepFeesIx(await P.configPda(), feeVault, feeRecipient.address)]));
    expect(await balance(w, feeVault)).toBe(rent0);
    expect(await balance(w, feeRecipient.address)).toBe(recipientBefore + surplus);
  });

  test("close refuses a second call and a rent payer other than the stored one", async () => {
    const w = await createWorld();
    await initConfig(w);
    const creator = await fundedWallet(w);
    const stranger = await fundedWallet(w);
    const { campaign, vault } = await settledCampaign(w, creator);
    const feeVault = await P.feeVaultPda();
    expectError(await send(w, [S.closeCampaignIx(campaign, vault, stranger.address, feeVault)]), "RentPayerNotStored");
    expectOk(await send(w, [S.closeCampaignIx(campaign, vault, creator.address, feeVault)]));
    expectError(await send(w, [S.closeCampaignIx(campaign, vault, creator.address, feeVault)]), "AlreadyClosed");
  });
});
