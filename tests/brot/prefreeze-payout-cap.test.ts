/**
 * Purpose: F4 of the pre-freeze review (Sprint 16) through the program: every call site of `VaultWatch::check`
 *          refuses a planted state no settlement produces, so deleting any of them fails a test here. A one-sided pot
 *          whose fee was collected while an entry is open (the entry's fee would leave the books, not the vault:
 *          `InvariantViolated`); payouts past the snapshot's cap at `settle_entry`, at each of
 *          `settle_creator_share`'s three paths, at `collect_fee` and at `settle_prize` (`PaidOutAboveSnapshot`);
 *          a close whose vault holds less than its books (`InvariantViolated`). Nothing moves in any of them.
 * Version: 0.0.1
 * Sprint:  16 (lane L16P, the review's follow-ups). Needs target/deploy/brot_markets.so.
 */
import { describe, test } from "bun:test";

import { generateKeyPairSigner, lamports, type Address, type Instruction } from "@solana/kit";

import { injectCampaign, injectEntry } from "./campaigns";
import { initConfig, newId } from "./flows";
import { settleSplit } from "./money-model";
import * as S from "./instructions-settlement";
import * as P from "./program";
import type { BrotErrorName } from "./errors";
import { balance, createWorld, expectError, fundedWallet, now, send, type World } from "./setup";

const SOL = P.SOL;
/** A split of 2 SOL won against 1 SOL lost, the fee 10% and the creator's 1% (the reference model's numbers). */
const SPLIT = settleSplit({ winning: 2n * SOL, losing: SOL, prize: 0n, feeBps: 1_000n, creatorBps: 100n });
const SHARE = SPLIT.creatorFromPot + SPLIT.creatorFromFee;
/** The cap of that split: the distributable amount and the creator share (no late part). */
const CAP = SPLIT.distributable + SHARE;
const SNAPSHOT = {
  settle_mode: 1, // Split
  winning_total: 2n * SOL,
  losing_total: SOL,
  distributable: SPLIT.distributable,
  fee_total: SPLIT.fee,
  creator_share: SHARE,
  creator_share_from_fee: SPLIT.creatorFromFee,
};

/** A finalized campaign written into a fresh world: YES won 2 SOL to 1 SOL; its vault holds its rent and pools. */
async function finalized(status: number, extra: Record<string, unknown>) {
  const w = await createWorld();
  await initConfig(w);
  const creator = await fundedWallet(w);
  const t = now(w.client);
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
    status,
    extra: { outcome: P.Outcome.Yes, ...SNAPSHOT, ...extra },
  });
  return { w, creator: creator.address, campaign, vault };
}

/** The instruction is refused with `error`, and none of `accounts` gains or loses a lamport. */
async function refused(w: World, ix: Instruction, error: BrotErrorName, accounts: Address[]) {
  const before = accounts.map((a) => balance(w, a));
  expectError(await send(w, [ix]), error);
  const after = accounts.map((a) => balance(w, a));
  if (after.some((b, i) => b !== before[i])) throw new Error(`a refused ${error} moved lamports`);
}

/** A settling campaign's open entry: `amountYes` on the winning side, not the first baker's. */
async function openEntry(w: World, campaign: Address, amountYes: bigint) {
  const baker = (await fundedWallet(w)).address;
  const entry = await injectEntry(w.client, { campaign, baker, amountYes });
  return { baker, entry };
}

describe("every VaultWatch call site refuses a state no settlement produces", () => {
  test("settle_entry: a one-sided fee collected while an entry is open leaves the books, not the vault", async () => {
    const extra = { settle_mode: 2, fee_collected: 1, entries_open: 1, one_sided_fee_bps: 100 };
    const s = await finalized(P.Status.Settling, extra);
    const { baker, entry } = await openEntry(s.w, s.campaign, 2n * SOL);
    const ix = S.settleEntryIx(entry, s.campaign, s.vault, baker);
    await refused(s.w, ix, "InvariantViolated", [s.vault, baker, entry]);
  });

  test("settle_entry: a payout past the snapshot's cap", async () => {
    const s = await finalized(P.Status.Settling, { entries_open: 1, paid_out_total: CAP });
    const { baker, entry } = await openEntry(s.w, s.campaign, 2n * SOL);
    const ix = S.settleEntryIx(entry, s.campaign, s.vault, baker);
    await refused(s.w, ix, "PaidOutAboveSnapshot", [s.vault, baker, entry]);
  });

  test("settle_creator_share: a payment, a reserve and a claim past the snapshot's cap", async () => {
    const pay = await finalized(P.Status.Settled, { paid_out_total: CAP - SHARE + 1n });
    const payIx = S.settleCreatorShareIx(pay.campaign, pay.vault, pay.creator);
    await refused(pay.w, payIx, "PaidOutAboveSnapshot", [pay.vault, pay.creator]);

    // A share below an empty wallet's rent-exempt minimum is reserved: it books nothing, and is refused all the same.
    const small = { creator_share: 500_000n, creator_share_from_fee: 0n };
    const reserve = await finalized(P.Status.Settled, { ...small, paid_out_total: SPLIT.distributable + 500_001n });
    const emptied = { data: new Uint8Array(0), executable: false, programAddress: P.SYSTEM_PROGRAM_ID, space: 0n };
    reserve.w.client.svm.setAccount({ address: reserve.creator, lamports: lamports(0n), ...emptied });
    const reserveIx = S.settleCreatorShareIx(reserve.campaign, reserve.vault, reserve.creator);
    await refused(reserve.w, reserveIx, "PaidOutAboveSnapshot", [reserve.vault, reserve.creator]);

    const reserved = { ...small, creator_share_settled: 1, creator_share_reserved: 500_000n };
    const claim = await finalized(P.Status.Settled, { ...reserved, paid_out_total: SPLIT.distributable + 1n });
    const claimIx = S.settleCreatorShareIx(claim.campaign, claim.vault, claim.creator);
    await refused(claim.w, claimIx, "PaidOutAboveSnapshot", [claim.vault, claim.creator]);
  });

  test("collect_fee and settle_prize: a campaign already paid past the snapshot's cap", async () => {
    const fee = await finalized(P.Status.Settled, { paid_out_total: CAP + 1n });
    const feeVault = await P.feeVaultPda();
    await refused(fee.w, S.collectFeeIx(fee.campaign, fee.vault, feeVault), "PaidOutAboveSnapshot", [
      fee.vault,
      feeVault,
    ]);
    const prize = await finalized(P.Status.Settled, { paid_out_total: CAP + 1n });
    const prizeIx = S.settlePrizeIx(prize.campaign, prize.vault, prize.creator);
    await refused(prize.w, prizeIx, "PaidOutAboveSnapshot", [prize.vault, prize.creator]);
  });

  test("close_campaign: a vault holding less than its books still owe", async () => {
    const flags = { fee_collected: 1, prize_settled: 1, creator_share_settled: 1 };
    // Nothing paid out of 3 SOL, the fee collected: the books still hold almost all of it; the vault only its rent.
    const s = await finalized(P.Status.Settled, flags);
    const rent = s.w.client.svm.minimumBalanceForRentExemption(0n);
    s.w.client.svm.setAccount({
      address: s.vault,
      data: new Uint8Array(0),
      executable: false,
      lamports: lamports(rent),
      programAddress: P.PROGRAM_ID,
      space: 0n,
    });
    const feeVault = await P.feeVaultPda();
    const ix = S.closeCampaignIx(s.campaign, s.vault, s.creator, feeVault);
    await refused(s.w, ix, "InvariantViolated", [s.vault, s.campaign, s.creator, feeVault]);
  });
});
