/**
 * Purpose: the revival of a closed campaign, in one transaction: close_campaign, a System Program transfer
 *          into the closed address, then a program instruction on it. The last must fail in the same
 *          transaction, so the closed address can never come back as a campaign (TP 3.4.4, 3.4.17, I14).
 * Version: 0.0.1
 * Sprint:  04 (lane D). Needs the SBF build: `bun run build:program` first, then `bun test tests/brot/close-revival.test.ts`.
 */
import { describe, expect, test } from "bun:test";
import type { Address, Instruction, TransactionSigner } from "@solana/kit";

import { injectCampaign } from "./campaigns";
import { initConfig } from "./flows";
import { data, rw, signer } from "./instructions";
import * as S from "./instructions-settlement";
import * as P from "./program";
import { anyAddress } from "./resolve-support";
import { accountData, balance, createWorld, expectError, expectOk, fundedWallet, send, START_TIME } from "./setup";

/** System Program `Transfer`: index 2, then the lamports as u64 little-endian. */
const systemTransfer = (from: TransactionSigner, to: Address, lamports: bigint): Instruction => ({
  programAddress: P.SYSTEM_PROGRAM_ID,
  accounts: [signer(from, true), rw(to)],
  data: Uint8Array.of(2, 0, 0, 0, ...P.u64le(lamports)),
});

describe("close_campaign revival", () => {
  test("a closed campaign cannot be revived in the same transaction", async () => {
    const w = await createWorld();
    await initConfig(w);
    const creator = await fundedWallet(w);
    const { campaign, vault } = await injectCampaign(w.client, {
      id: 4343n,
      kind: P.ReaderKind.SupplyAtMost,
      metric: await anyAddress(),
      target: 0n,
      creator: creator.address,
      opensAt: START_TIME - P.DAY,
      entriesCloseAt: START_TIME,
      deadlineAt: START_TIME + 3n * P.DAY,
      status: P.Status.Settled,
      extra: {
        outcome: P.Outcome.Yes,
        settle_mode: 1,
        fee_collected: 1,
        prize_settled: 1,
        creator_share_settled: 1,
        entries_open: 0,
      },
    });
    const feeVault = await P.feeVaultPda();

    // The revival: close, fund the closed address, then `collect_fee` on it. The whole transaction fails.
    const sent = await send(w, [
      S.closeCampaignIx(campaign, vault, creator.address, feeVault),
      systemTransfer(w.client.payer, campaign, 1_000_000n),
      S.collectFeeIx(campaign, vault, feeVault),
    ]);
    expectError(sent, "WrongOwner");
    // Nothing of the close survives the failed transaction: the campaign is still a program account.
    expect(accountData(w, campaign).length).toBeGreaterThan(0);
  });
});
