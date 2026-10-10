/**
 * Purpose: what one entry is paid under its campaign's snapshot, the late-entry split, and the reserve
 *          path of a credit below rent. Mirrors programs/brot-markets/src/instructions/settlement/rules.rs
 *          and programs/brot-markets/src/math/refund.rs (TP 3.4.5, 3.4.16; founder answer 7).
 * Version: 0.1.0
 * Sprint:  05 (SDK: the math mirror)
 *
 * The late parts of an entry (joined at or after a YES price proof's `publish_time`) come back whole in
 * every mode. Then `Refund` returns the entry whole; `OneSided` returns the early part less its
 * one-sided fee (the first baker exempt); `Split` pays a winner `floor(early_winning × distributable ÷ V)`
 * and a loser nothing from the pot.
 */
import { SettleMode, Side } from "../../idl/generated/types";
import { refuse } from "../errors";
import { argU64, toU64 } from "./integers";
import { oneSidedRefund, splitPayout } from "./payout";

/** The part of a snapshot an entry is paid from (`PotRule`). */
export type PotRule = {
  mode: SettleMode;
  /** The side that wins in `Split` (ignored in the other modes). */
  winning: Side;
  /** `V`, the winning side without its late entries. */
  winningTotal: bigint;
  distributable: bigint;
  oneSidedFeeBps: number;
};

/** One baker's entry: both sides, and the late part of each (`EntryAmounts`). */
export type EntryAmounts = { yes: bigint; no: bigint; lateYes: bigint; lateNo: bigint };

/** What one entry is paid, and the one-sided fee Brot keeps on it (`EntryPayout`). */
export type EntryPayout = { amount: bigint; oneSidedFee: bigint };

const early = (total: bigint, late: bigint) => toU64(total - late);

/** What `settle_entry` pays one entry (`entry_payout`). `BadAccountData` for an unset mode. */
export function entryPayout(rule: PotRule, entry: EntryAmounts, isFirst: boolean): EntryPayout {
  [entry.yes, entry.no, entry.lateYes, entry.lateNo, rule.winningTotal, rule.distributable].forEach((value) =>
    argU64(value, "amount"),
  );
  const late = toU64(entry.lateYes + entry.lateNo);
  switch (rule.mode) {
    case SettleMode.Refund:
      return { amount: toU64(entry.yes + entry.no), oneSidedFee: 0n };
    case SettleMode.OneSided: {
      const earlyTotal = toU64(early(entry.yes, entry.lateYes) + early(entry.no, entry.lateNo));
      const refund = oneSidedRefund(earlyTotal, rule.oneSidedFeeBps, isFirst);
      return { amount: toU64(refund.payout + late), oneSidedFee: refund.fee };
    }
    case SettleMode.Split: {
      const earlyWinning = rule.winning === Side.Yes ? early(entry.yes, entry.lateYes) : early(entry.no, entry.lateNo);
      const share = earlyWinning === 0n ? 0n : splitPayout(earlyWinning, rule.distributable, rule.winningTotal);
      return { amount: toU64(share + late), oneSidedFee: 0n };
    }
    default:
      return refuse("BadAccountData");
  }
}

/** A credit that leaves the wallet at or above the rent minimum is paid; below it, it is reserved. */
export type Credit = "Pay" | "Reserve";

/** What a credit of `amount` to a wallet holding `walletLamports` does (`plan_credit`). */
export function planCredit(walletLamports: bigint, amount: bigint, rentMin: bigint): Credit {
  return toU64(argU64(walletLamports, "walletLamports") + argU64(amount, "amount")) < argU64(rentMin, "rentMin")
    ? "Reserve"
    : "Pay";
}

/** A reserved credit can be claimed once the wallet, with it, reaches the rent minimum (`claimable`). */
export function claimable(walletLamports: bigint, reserved: bigint, rentMin: bigint): void {
  if (toU64(argU64(walletLamports, "walletLamports") + argU64(reserved, "reserved")) < argU64(rentMin, "rentMin")) {
    refuse("ReserveNotClaimable");
  }
}

/** One join of a baker on one side: when it landed (Unix seconds) and how many lamports it added. */
export type JoinTime = { joinedAt: bigint; amount: bigint };

/**
 * `[early, late]`: the amounts joined before `publishTime`, and at or after it; they add up to the
 * total of `joins` (`split_late`).
 */
export function splitLate(joins: readonly JoinTime[], publishTime: bigint): [bigint, bigint] {
  let early = 0n;
  let late = 0n;
  for (const join of joins) {
    if (join.joinedAt >= publishTime) late = toU64(late + argU64(join.amount, "amount"));
    else early = toU64(early + argU64(join.amount, "amount"));
  }
  return [early, late];
}
