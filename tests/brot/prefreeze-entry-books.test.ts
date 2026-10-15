/**
 * Purpose: S-8 of the audit scope (the third review) through the program: in `OneSided` and `Refund`, `settle_entry`
 *          checks each payout against the entry's own amounts (`settlement/entry_books.rs`). Planted: an entry whose
 *          first-baker flag disagrees with the campaign's `first_baker` is refused with `OneSidedPayoutNotExact`, either
 *          way, and nothing moves. Legitimate: a one-sided pot pays its first baker whole and another baker its entry
 *          less the rate's ceiling on the early part, the late parts back whole on both sides; a refund pays an entry
 *          back whole, late part included. The `Refund` rule and the snapshot's pin cannot be planted: the payout and
 *          the check read the same stored amounts (`prefreeze_entry_books.rs`, `prefreeze_snapshot_books.rs`).
 * Version: 0.0.1
 * Sprint:  16 (lane S8). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";

import { generateKeyPairSigner, type Address, type Instruction } from "@solana/kit";

import { injectCampaign, injectEntry } from "./campaigns";
import { initConfig, newId, readCampaign } from "./flows";
import * as S from "./instructions-settlement";
import * as P from "./program";
import type { BrotErrorName } from "./errors";
import { balance, createWorld, expectError, expectOk, fundedWallet, now, send, type World } from "./setup";

const SOL = P.SOL;
const ONE_SIDED = 2;
const REFUND = 3;

async function world() {
  const w = await createWorld();
  await initConfig(w);
  return w;
}

/** A campaign settling in `mode`, written into `w` with its pools in the vault; `extra` names more fields. */
async function settling(w: World, mode: number, poolYes: bigint, poolNo: bigint, extra: Record<string, unknown>) {
  const creator = await fundedWallet(w);
  const t = now(w.client);
  return injectCampaign(w.client, {
    id: newId(),
    kind: P.ReaderKind.SupplyAtMost,
    metric: (await generateKeyPairSigner()).address,
    target: 1n,
    creator: creator.address,
    opensAt: t - P.DAY,
    entriesCloseAt: t - P.HOUR,
    deadlineAt: t - P.HOUR,
    poolYes,
    poolNo,
    status: P.Status.Settling,
    extra: { settle_mode: mode, one_sided_fee_bps: 100, ...extra },
  });
}

/** The instruction is refused with `error`, and none of `accounts` gains or loses a lamport. */
async function refused(w: World, ix: Instruction, error: BrotErrorName, accounts: Address[]) {
  const before = accounts.map((a) => balance(w, a));
  expectError(await send(w, [ix]), error);
  const after = accounts.map((a) => balance(w, a));
  if (after.some((b, i) => b !== before[i])) throw new Error(`a refused ${error} moved lamports`);
}

/** Settles `entry` and returns what its baker received, less the Entry's rent that comes back with it. */
async function settled(w: World, campaign: Address, vault: Address, baker: Address, entry: Address) {
  const before = balance(w, baker);
  const rent = balance(w, entry);
  expectOk(await send(w, [S.settleEntryIx(entry, campaign, vault, baker)]));
  return balance(w, baker) - before - rent;
}

describe("settle_entry checks a one-sided or refunded payout against the entry's own amounts", () => {
  test("settle_entry one-sided: an entry whose first-baker flag disagrees with the campaign's first_baker is refused either way", async () => {
    const w = await world();
    const first = (await fundedWallet(w)).address;
    const other = (await fundedWallet(w)).address;
    const extra = { outcome: P.Outcome.Yes, winning_total: 3n * SOL, entries_open: 2, first_baker: first };
    const { campaign, vault } = await settling(w, ONE_SIDED, 3n * SOL, 0n, extra);
    // Another baker's entry carries the flag: the payout would skip the fee the campaign says this entry owes.
    const flagged = await injectEntry(w.client, { campaign, baker: other, amountYes: SOL, isFirst: true });
    const flaggedIx = S.settleEntryIx(flagged, campaign, vault, other);
    await refused(w, flaggedIx, "OneSidedPayoutNotExact", [vault, other, flagged]);
    // The campaign's first baker's own entry without the flag: the payout would charge the fee it is exempt from.
    const unflagged = await injectEntry(w.client, { campaign, baker: first, amountYes: 2n * SOL });
    const unflaggedIx = S.settleEntryIx(unflagged, campaign, vault, first);
    await refused(w, unflaggedIx, "OneSidedPayoutNotExact", [vault, first, unflagged]);
  });

  test("settle_entry one-sided: the first baker back whole, another baker less the ceiling of 1% of its early part", async () => {
    const w = await world();
    const first = (await fundedWallet(w)).address;
    const other = (await fundedWallet(w)).address;
    // YES won with no early NO entry, so the pot is one-sided. The first baker: 2 SOL early and 0.5 SOL late on YES.
    // The other: 1,000,000,050 lamports early on YES, 0.25 SOL late on YES and 0.1 SOL late on NO.
    const early = 1_000_000_050n;
    const [firstLate, otherLateYes, otherLateNo] = [SOL / 2n, SOL / 4n, SOL / 10n];
    const poolYes = 2n * SOL + firstLate + early + otherLateYes;
    const { campaign, vault } = await settling(w, ONE_SIDED, poolYes, otherLateNo, {
      outcome: P.Outcome.Yes,
      winning_total: 2n * SOL + early,
      late_yes: firstLate + otherLateYes,
      late_no: otherLateNo,
      entries_open: 2,
      first_baker: first,
    });
    const a = await injectEntry(w.client, {
      campaign,
      baker: first,
      amountYes: 2n * SOL + firstLate,
      lateYes: firstLate,
      isFirst: true,
    });
    const b = await injectEntry(w.client, {
      campaign,
      baker: other,
      amountYes: early + otherLateYes,
      amountNo: otherLateNo,
      lateYes: otherLateYes,
      lateNo: otherLateNo,
    });
    expect(await settled(w, campaign, vault, first, a)).toBe(2n * SOL + firstLate);
    // 1% of 1,000,000,050 is 10,000,000.5: the fee is its ceiling, and the late parts come back whole.
    const fee = 10_000_001n;
    const otherPaid = early - fee + otherLateYes + otherLateNo;
    expect(await settled(w, campaign, vault, other, b)).toBe(otherPaid);
    const c = readCampaign(w, campaign);
    expect(c.one_sided_fees).toBe(fee);
    expect(c.paid_out_total).toBe(2n * SOL + firstLate + otherPaid);
    expect(c.status).toBe(P.Status.Settled);
  });

  test("settle_entry refund: an entry back whole, its late part included", async () => {
    const w = await world();
    const baker = (await fundedWallet(w)).address;
    const [yes, no, late] = [SOL + SOL / 5n, (3n * SOL) / 10n, SOL / 5n];
    const { campaign, vault } = await settling(w, REFUND, yes, no, {
      outcome: P.Outcome.Void,
      void_reason: P.VoidReason.UnreadableAccount,
      late_yes: late,
      entries_open: 1,
      first_baker: baker,
    });
    const e = await injectEntry(w.client, {
      campaign,
      baker,
      amountYes: yes,
      amountNo: no,
      lateYes: late,
      isFirst: true,
    });
    expect(await settled(w, campaign, vault, baker, e)).toBe(yes + no);
    expect(readCampaign(w, campaign).paid_out_total).toBe(yes + no);
  });
});
