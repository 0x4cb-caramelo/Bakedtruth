/**
 * Purpose: what a campaign owes, read from its stored account alone, for the screens that follow a payout (Sprint
 *          12): the pot rule `settle_entry` pays an entry by, what `settle_prize` returns to whoever opened, the
 *          creator share's status (`settle_creator_share`), and what an entry would be paid were the campaign
 *          finalized now on a given verdict (the snapshot's own input). Mirrors pot_rule in
 *          settlement/settle_entry.rs, opener_return and prize_return in settlement/collect_fee/amount.rs, the
 *          due check of settlement/settle_creator_share.rs, and input_of in settlement/snapshot.rs.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 *
 * Nothing here decides money: the program does. These functions say on screen what it will do, from the same
 * stored fields, and tests/sdk/stored.test.ts checks each against the program's own payouts in LiteSVM.
 */
import type { Campaign, Entry } from "../../idl/generated/accounts";
import { Outcome, SettleMode, Side, VoidReason } from "../../idl/generated/types";
import { refuse } from "../errors";
import { toU64 } from "./integers";
import { entryPayout, type EntryAmounts, type EntryPayout, type PotRule } from "./settle";
import { snapshot, type Snapshot, type Verdict } from "./snapshot";
import { voidClassOf } from "./void";

/** `first_baker` before the first join: the zero address. */
const NO_BAKER = "11111111111111111111111111111111";

/** No entry ever landed in the pot (`no_entry`): `first_baker` is set by the first join and never otherwise. */
export const noEntryEver = (c: Pick<Campaign, "firstBaker">): boolean => c.firstBaker === NO_BAKER;

/** The stored pot rule of a finalized campaign (`pot_rule`): the winning side is NO only on a NO outcome. */
export function potRuleOf(c: Campaign): PotRule {
  if (c.settleMode === SettleMode.Unset) refuse("NotFinalized");
  return {
    mode: c.settleMode,
    winning: c.outcome === Outcome.No ? Side.No : Side.Yes,
    winningTotal: c.winningTotal,
    distributable: c.distributable,
    oneSidedFeeBps: c.oneSidedFeeBps,
  };
}

/** An entry's amounts as `settle_entry` reads them. */
export const amountsOf = (e: Entry): EntryAmounts => ({
  yes: e.amountYes,
  no: e.amountNo,
  lateYes: e.lateYes,
  lateNo: e.lateNo,
});

/** What `settle_entry` pays `entry` from the pot of finalized campaign `c` (the Entry's rent comes back besides). */
export const entryOwed = (c: Campaign, entry: Entry): EntryPayout =>
  entryPayout(potRuleOf(c), amountsOf(entry), entry.isFirst);

/** What `settle_prize` returns to whoever opened (`prize_return`): nothing in a `Split`, whose prize is inside the
 * winners' pot; otherwise the prize, and the opening fee too on a house-failure void of a pot that had entries. */
export function prizeReturnOf(c: Campaign): { prize: bigint; openingFee: bigint } {
  if (c.settleMode === SettleMode.Unset) refuse("NotFinalized");
  if (c.settleMode === SettleMode.Split) return { prize: 0n, openingFee: 0n };
  const houseVoid =
    c.settleMode === SettleMode.Refund && !noEntryEver(c) && voidClassOf(c.voidReason) === "HouseFailure";
  return { prize: c.prizeLamports, openingFee: houseVoid ? c.openingFeeLamports : 0n };
}

/**
 * The creator share of a campaign, as `settle_creator_share` sees it: `none` (a team opening, a mode other than
 * `Split`, a zero share, or not finalized yet), `due` (not sent yet), `reserved` (a credit that would have left the
 * creator's empty wallet below the rent-exempt minimum, kept in the vault; the creator claims it), or `paid`.
 */
export type CreatorShareStatus =
  | { status: "none" }
  | { status: "due"; amount: bigint }
  | { status: "reserved"; amount: bigint }
  | { status: "paid"; amount: bigint };

export function creatorShareStatus(c: Campaign): CreatorShareStatus {
  if (c.creatorIsTeam || c.settleMode !== SettleMode.Split || c.creatorShare === 0n) return { status: "none" };
  if (!c.creatorShareSettled) return { status: "due", amount: c.creatorShare };
  if (c.creatorShareReserved > 0n) return { status: "reserved", amount: c.creatorShareReserved };
  return { status: "paid", amount: c.creatorShare };
}

/** The verdict a stored outcome gives the snapshot (`verdict`); `null` while unresolved. */
export function storedVerdict(c: Campaign): Verdict | null {
  switch (c.outcome) {
    case Outcome.Yes:
      return { kind: "Yes" };
    case Outcome.No:
      return { kind: "No" };
    case Outcome.Void: {
      const voidClass = voidClassOf(c.voidReason);
      return voidClass ? { kind: "Void", voidClass } : null;
    }
    default:
      return null;
  }
}

/** The snapshot finalize would take of `c` on `verdict`, from the stored totals without their late parts (`input_of`). */
export function snapshotOf(c: Campaign, verdict: Verdict): Snapshot {
  return snapshot({
    verdict,
    yesTotal: toU64(c.poolYes - c.lateYes),
    noTotal: toU64(c.poolNo - c.lateNo),
    lateYes: c.lateYes,
    lateNo: c.lateNo,
    prize: c.prizeLamports,
    openingFee: c.openingFeeLamports,
    feeBps: c.feeBps,
    oneSidedFeeBps: c.oneSidedFeeBps,
    creatorShareBps: c.creatorShareBps,
    creatorIsTeam: c.creatorIsTeam,
  });
}

/**
 * What `entry` would be paid were `c` finalized now on `verdict`: an estimate while the pot can still move, exact
 * once the outcome is recorded and the totals are final. `first_baker` is the entry's own flag.
 */
export function entryIfFinalized(c: Campaign, entry: Entry, verdict: Verdict): EntryPayout {
  const snap = snapshotOf(c, verdict);
  const rule: PotRule = {
    mode: snap.mode,
    winning: verdict.kind === "No" ? Side.No : Side.Yes,
    winningTotal: snap.winningTotal,
    distributable: snap.distributable,
    oneSidedFeeBps: c.oneSidedFeeBps,
  };
  return entryPayout(rule, amountsOf(entry), entry.isFirst);
}

/** Every void reason the program writes, by who writes it: `resolve_campaign` (automatic) or a team key. */
export const AUTOMATIC_VOIDS: readonly VoidReason[] = [
  VoidReason.MissedWindow,
  VoidReason.UnreadableAccount,
  VoidReason.StaleFeed,
];
