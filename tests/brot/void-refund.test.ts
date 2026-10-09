/**
 * Purpose: a void on the binary: the prize goes back to the stored creator, the opening fee goes with it on a
 *          house failure and stays with Brot on an outside cause, and the second payment of each is refused
 *          (`bun test tests/brot/void-refund.test.ts`).
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

const PRIZE = 900_000n;
const OPENING = 100_000n;
/** `Refund` is settle mode 3 (`SettleMode`), and a void's entries sit in the vault with the prize and the fee. */
const REFUND = 3;

async function voided(reason: number) {
  const w = await createWorld();
  await initConfig(w);
  const creator = await fundedWallet(w);
  const baker = await anyAddress();
  const { campaign, vault } = await injectCampaign(w.client, {
    id: reason === P.VoidReason.MissedWindow ? 4444n : 4445n,
    kind: P.ReaderKind.SupplyAtMost,
    metric: await anyAddress(),
    target: 0n,
    creator: creator.address,
    opensAt: START_TIME - P.DAY,
    entriesCloseAt: START_TIME,
    deadlineAt: START_TIME + 3n * P.DAY,
    status: P.Status.Settled,
    poolNo: PRIZE + OPENING,
    extra: {
      outcome: P.Outcome.Void,
      void_reason: reason,
      settle_mode: REFUND,
      prize_lamports: PRIZE,
      opening_fee_lamports: OPENING,
      first_baker: baker,
      entries_open: 0,
    },
  });
  return { w, creator, campaign, vault, feeVault: await P.feeVaultPda() };
}

describe("void refunds", () => {
  test("void refunds and the opening fee follows the cause", async () => {
    // A house failure (the window was missed): the prize and the opening fee go back to the creator.
    const house = await voided(P.VoidReason.MissedWindow);
    const before = await balance(house.w, house.creator.address);
    const feeBefore = await balance(house.w, house.feeVault);
    expectOk(await send(house.w, [S.settlePrizeIx(house.campaign, house.vault, house.creator.address)]));
    expect(await balance(house.w, house.creator.address)).toBe(before + PRIZE + OPENING);
    expectOk(await send(house.w, [S.collectFeeIx(house.campaign, house.vault, house.feeVault)]));
    expect(await balance(house.w, house.feeVault)).toBe(feeBefore);
    // The vault keeps only its own rent: the prize and the fee are both out.
    expect(await balance(house.w, house.vault)).toBe(rentFor(house.w, 0));
    expectError(
      await send(house.w, [S.settlePrizeIx(house.campaign, house.vault, house.creator.address)]),
      "PrizeAlreadySettled",
    );
    expectError(
      await send(house.w, [S.collectFeeIx(house.campaign, house.vault, house.feeVault)]),
      "FeeAlreadyCollected",
    );

    // An outside cause (a stale feed): the prize goes back, and the opening fee is Brot's, to the fee vault.
    const outside = await voided(P.VoidReason.StaleFeed);
    const creatorBefore = await balance(outside.w, outside.creator.address);
    const feeVaultBefore = await balance(outside.w, outside.feeVault);
    expectOk(await send(outside.w, [S.settlePrizeIx(outside.campaign, outside.vault, outside.creator.address)]));
    expect(await balance(outside.w, outside.creator.address)).toBe(creatorBefore + PRIZE);
    expectOk(await send(outside.w, [S.collectFeeIx(outside.campaign, outside.vault, outside.feeVault)]));
    expect(await balance(outside.w, outside.feeVault)).toBe(feeVaultBefore + OPENING);
  });
});
