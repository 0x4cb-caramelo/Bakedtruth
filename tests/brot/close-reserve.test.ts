/**
 * Purpose: the closure review's fix to `close_campaign` with a reserved creator share (decision of 2026-10-09):
 *          a reserve blocks close unless the creator is the rent payer; then close pays the reserve to the rent
 *          payer with the rent, and hand-sent surplus of the campaign goes to the fee vault.
 * Version: 0.0.1
 * Sprint:  04 (closure review)
 */
import { describe, expect, test } from "bun:test";

import { injectCampaign } from "./campaigns";
import { initConfig, newId } from "./flows";
import * as P from "./program";
import { balance, createWorld, expectError, expectOk, fundedWallet, now, send } from "./setup";
import { closeCampaignIx } from "./instructions-settlement";

/** A settled campaign with its three flags set and a reserve of `reserved` lamports in its vault. */
async function settledWithReserve(
  w: Awaited<ReturnType<typeof createWorld>>,
  creator: Address,
  rentPayer: Address,
  reserved: bigint,
) {
  const t = now(w.client);
  const { campaign, vault } = await injectCampaign(w.client, {
    id: newId(),
    kind: P.ReaderKind.SupplyAtMost,
    metric: (await fundedWallet(w)).address,
    target: 1n,
    creator,
    opensAt: t - P.DAY,
    entriesCloseAt: t - P.HOUR,
    deadlineAt: t - P.HOUR,
    // The vault holds the reserve (the injector funds the vault with its pools).
    poolYes: reserved,
    poolNo: 0n,
    status: P.Status.Settled,
    extra: {
      rent_payer: rentPayer,
      // Only a Split pays a creator share; close reads the books against the vault (G-2), so the mode is set.
      settle_mode: 1,
      fee_collected: 1,
      prize_settled: 1,
      creator_share_settled: 1,
      creator_share_reserved: reserved,
      entries_open: 0,
    },
  });
  return { campaign, vault };
}

type Address = Awaited<ReturnType<typeof fundedWallet>>["address"];

describe("close with a reserved creator share", () => {
  test("a reserve blocks close unless the creator is the rent payer", async () => {
    const w = await createWorld();
    await initConfig(w);
    const creator = await fundedWallet(w);
    const other = await fundedWallet(w);
    const { campaign, vault } = await settledWithReserve(w, creator.address, other.address, 100_000n);
    const feeVault = await P.feeVaultPda();
    expectError(await send(w, [closeCampaignIx(campaign, vault, other.address, feeVault)]), "ReserveNotClaimable");
    expect(balance(w, vault)).toBeGreaterThan(0n);
  });

  test("a creator who is the rent payer takes the reserve with the rent", async () => {
    const w = await createWorld();
    await initConfig(w);
    const creator = await fundedWallet(w);
    const reserved = 100_000n;
    const { campaign, vault } = await settledWithReserve(w, creator.address, creator.address, reserved);
    const feeVault = await P.feeVaultPda();
    const before = balance(w, creator.address);
    const feeBefore = balance(w, feeVault);
    expectOk(await send(w, [closeCampaignIx(campaign, vault, creator.address, feeVault)]));
    // The creator receives the reserve (and the rent); the fee vault receives no part of the reserve.
    expect(balance(w, creator.address) - before).toBeGreaterThanOrEqual(reserved);
    expect(balance(w, feeVault) - feeBefore).toBeLessThan(reserved);
  });
});
