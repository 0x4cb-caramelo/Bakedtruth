/**
 * Purpose: the settlement plan of one campaign (TP §3.5, the keeper's cycle, steps 2 to 5), from its stored account,
 *          its entries and its sponsors' sealed fees alone: each step is planned only when the program's own
 *          conditions for it hold, as read in programs/brot-markets/src/instructions/settlement/*.rs, and every
 *          destination is a stored field (the entry's baker, the fee's sponsor, the campaign's creator and rent payer,
 *          the config's fee recipient), never one the keeper chooses. Pure; settle.ts builds and sends what it returns.
 * Version: 0.2.0 (Sprints 14 and 15: a lapsed contest finalized; every sealed fee settled before the close)
 * Sprint:  07 carry-over (Sprint 06 DoD); 14 and 15 (lane L14K)
 *
 * Every open `SealedFee` is settled (`settle_sealed_fee`) once the campaign is finalized, and the close is planned
 * only when the campaign counts none open (`SealedFeesOpen` otherwise): the plan reads the fees, it never retries a
 * refused close. A contest that lapsed with no decision (the SDK's view: stage 2's deadline, or 48 hours after an
 * unread stage 1's) is finalized with its stored result; the keeper never opens, escalates or decides a contest.
 *
 * The tally of a YES price campaign waits for the end of its review window: its cut-off can still move back to an
 * earlier YES proof, but only while no tally has started (`CutoffNotMovable`, decision of 2026-10-09), so tallying at
 * once would close that door. Every other outcome cannot move its cut-off and is tallied as soon as it is in review,
 * so a team confirmation or void inside the window (which needs the tallies) is not held up. Finalize waits for the
 * window's end in every case.
 */
import type { Address } from "@solana/kit";
import { Outcome, ReaderKind, SettleMode, Status, publicState, type Campaign } from "@brot/sdk/read";

import type { EntryAt, OpenCampaign, SealedFeeAt } from "./campaigns";

export type Step =
  | { kind: "tally"; campaign: Address; baker: Address; from: number; to: number }
  | { kind: "finalize"; campaign: Address }
  | { kind: "settleEntry"; campaign: Address; baker: Address }
  | { kind: "creatorShare"; campaign: Address; creator: Address; claim: boolean }
  | { kind: "collectFee"; campaign: Address }
  | { kind: "settlePrize"; campaign: Address; recipient: Address }
  | { kind: "sealedFee"; campaign: Address; sponsor: Address }
  | { kind: "close"; campaign: Address; rentPayer: Address }
  | { kind: "sweep"; feeRecipient: Address };

/** Join accounts closed by one `tally_late_joins`: 20 addresses keep the instruction well inside a transaction. */
export const JOINS_PER_TALLY = 20;

/** A creator share is owed (`settle_creator_share` refuses `CreatorShareNotDue` otherwise). */
export const shareDue = (c: Campaign) => !c.creatorIsTeam && c.settleMode === SettleMode.Split && c.creatorShare > 0n;

const finalized = (c: Campaign) => c.status === Status.Settling || c.status === Status.Settled;

/** `close_campaign`'s own test: Settled, no entry or sealed fee open, the three flags, no reserve unless the creator
 *  pays rent. */
export const closable = (c: Campaign) =>
  c.status === Status.Settled &&
  c.entriesOpen === 0 &&
  c.sealedFeesOpen === 0 &&
  c.feeCollected &&
  c.prizeSettled &&
  c.creatorShareSettled &&
  (c.creatorShareReserved === 0n || c.creator === c.rentPayer);

/** A YES price result whose cut-off can still move back to an earlier proof, while no tally has started. */
export const cutoffMayMove = (c: Campaign) => c.kind === ReaderKind.PriceTouch && c.outcome === Outcome.Yes;

/** Joins wait to be tallied, and may be now: in review, and past the window unless the cut-off cannot move. */
export const tallyOpen = (c: Campaign, now: bigint) =>
  c.status === Status.InReview && c.entriesUntallied > 0 && (now >= c.reviewEndsAt || !cutoffMayMove(c));

/** A contest that lapsed with no decision, by the SDK's view: the stored result stands and finalize may run. */
export const contestLapsed = (c: Campaign, now: bigint) =>
  c.status === Status.Contested && publicState(c, { slot: 0n, epoch: 0n, unixTimestamp: now }).contestLapsed;

/** Settlement is due: the window ended, a contest lapsed, or the campaign is finalized (the idle alert's "settling"). */
export const settlementDue = (c: Campaign, now: bigint) =>
  (c.status === Status.InReview && now >= c.reviewEndsAt) || contestLapsed(c, now) || finalized(c);

/** The campaign needs its sponsors' sealed fees listed to be planned. */
export const needsSealed = (c: Campaign) => finalized(c) && c.sealedFeesOpen > 0;

/** The campaign needs its entries listed to be planned: joins to tally, or open entries. */
export const needsEntries = (c: Campaign, now: bigint) =>
  tallyOpen(c, now) || (c.status === Status.Settling && c.entriesOpen > 0);

/** There is settlement work this campaign could take now. */
export const inSettlement = (c: Campaign, now: bigint) => tallyOpen(c, now) || settlementDue(c, now);

function tallies(campaign: Address, entries: readonly EntryAt[]): Step[] {
  const steps: Step[] = [];
  for (const { entry } of entries) {
    for (let from = entry.joinsTallied; from < entry.joinCount; from += JOINS_PER_TALLY) {
      const to = Math.min(from + JOINS_PER_TALLY, entry.joinCount);
      steps.push({ kind: "tally", campaign, baker: entry.baker, from, to });
    }
  }
  return steps;
}

/**
 * The steps `at` takes now. `entries` and `sealed` are the campaign's existing entries and sealed fees (null when not
 * listed); `claimDue` lets a reserved creator share be retried (once a day, by the caller's clock).
 */
export function planCampaign(
  at: OpenCampaign,
  entries: readonly EntryAt[] | null,
  now: bigint,
  claimDue: boolean,
  sealed: readonly SealedFeeAt[] | null = null,
): Step[] {
  const c = at.campaign;
  const campaign = at.address;
  if (contestLapsed(c, now)) return [{ kind: "finalize", campaign }];
  if (c.status === Status.InReview) {
    if (tallyOpen(c, now)) return entries ? tallies(campaign, entries) : [];
    if (c.entriesUntallied > 0 || now < c.reviewEndsAt) return [];
    return [{ kind: "finalize", campaign }];
  }
  if (!finalized(c)) return []; // Open is the resolve task's; a live contest is contest.ts's (the re-read)
  const steps: Step[] = [];
  if (c.status === Status.Settling) {
    for (const { entry } of entries ?? []) {
      if (entry.joinsTallied === entry.joinCount) steps.push({ kind: "settleEntry", campaign, baker: entry.baker });
    }
  }
  if (!c.creatorShareSettled && shareDue(c)) {
    steps.push({ kind: "creatorShare", campaign, creator: c.creator, claim: false });
  } else if (c.creatorShareSettled && c.creatorShareReserved > 0n && claimDue) {
    steps.push({ kind: "creatorShare", campaign, creator: c.creator, claim: true });
  }
  if (!c.prizeSettled) steps.push({ kind: "settlePrize", campaign, recipient: c.creator });
  if (!c.feeCollected && c.entriesOpen === 0) steps.push({ kind: "collectFee", campaign });
  for (const { fee } of sealed ?? []) steps.push({ kind: "sealedFee", campaign, sponsor: fee.sponsor });
  if (closable(c)) steps.push({ kind: "close", campaign, rentPayer: c.rentPayer });
  return steps;
}

/** `sweep_fees` once the fee vault holds at least `minimum` above its rent, to the config's fee recipient only. */
export function planSweep(feeVaultLamports: bigint | null, rentMin: bigint, minimum: bigint, feeRecipient: Address) {
  if (feeVaultLamports === null) return null;
  const surplus = feeVaultLamports - rentMin;
  if (surplus <= 0n || surplus < minimum) return null; // nothing above the rent is `NothingToSweep`
  return { kind: "sweep", feeRecipient } satisfies Step;
}

/** A step's identity across cycles (its backoff key and its log name). */
export function stepKey(step: Step): string {
  switch (step.kind) {
    case "tally":
      return `tally:${step.campaign}:${step.baker}:${step.from}`;
    case "settleEntry":
      return `settleEntry:${step.campaign}:${step.baker}`;
    case "sealedFee":
      return `sealedFee:${step.campaign}:${step.sponsor}`;
    case "sweep":
      return "sweep";
    default:
      return `${step.kind}:${step.campaign}`;
  }
}

/** What the campaigns owe, from their accounts alone (for /healthz): counts, not addresses. */
export function pendingOf(campaigns: readonly OpenCampaign[], now: bigint) {
  const pending = {
    tally: 0,
    finalize: 0,
    entries: 0,
    sealedFees: 0,
    creatorShare: 0,
    fee: 0,
    prize: 0,
    close: 0,
    reserved: 0,
    contested: 0,
  };
  for (const { campaign: c } of campaigns) {
    if (tallyOpen(c, now)) pending.tally += c.entriesUntallied;
    if ((c.status === Status.InReview && now >= c.reviewEndsAt) || contestLapsed(c, now)) pending.finalize++;
    if (c.status === Status.Contested) pending.contested++;
    if (!finalized(c)) continue;
    if (c.status === Status.Settling) pending.entries += c.entriesOpen;
    pending.sealedFees += c.sealedFeesOpen;
    if (!c.creatorShareSettled && shareDue(c)) pending.creatorShare++;
    if (c.creatorShareReserved > 0n) pending.reserved++;
    if (!c.prizeSettled) pending.prize++;
    if (!c.feeCollected) pending.fee++;
    if (c.status === Status.Settled) pending.close++;
  }
  return pending;
}

export type Pending = ReturnType<typeof pendingOf>;
