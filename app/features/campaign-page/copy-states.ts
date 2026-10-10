/**
 * Purpose: the words of the campaign states (Sprint 12; D-m vocabulary; English per L-01): closed and why, in review
 *          with the six-hour window, contested (L-04, answered "Contested"), paid (a split, a one-sided pot, a pot
 *          nobody entered), voided with its public reason (BR-45, `VoidReason`) and what returns to whoever opened
 *          (P-4), the connected wallet's payout, the creator's 1% and its reserve, and where to report a wrong result
 *          (L-13, answered: the official X account). On devnet nothing pays out by itself yet: until the keeper
 *          settles, the screen says "Waiting for payout" and promises no time (the founder's answer, 2026-10-10).
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { VoidReason } from "@brot/sdk/read";

/** L-13: where a wrong result is reported. A plain link: no X script, widget or API on a campaign page (K-10). */
export const REPORT = {
  url: "https://x.com/brotmarkets",
  text: "Think a result is wrong? Tell us on X:",
  link: "x.com/brotmarkets",
} as const;

/** The public reason of each void (BR-45), and who records it. */
export const VOID_REASON: Record<VoidReason, string> = {
  [VoidReason.None]: "No reason recorded.",
  [VoidReason.MissedWindow]: "Brot's service missed the moment the program had to read the account.",
  [VoidReason.UnreadableAccount]: "The account this campaign reads could no longer be read.",
  [VoidReason.StaleFeed]:
    "The price feed stopped updating before the deadline, so the result can't be proven either way. Every entry is refunded rather than the campaign resolving NO.",
  [VoidReason.TeamHouseFailure]: "The team voided it in review: the reading was wrong through Brot's fault.",
  [VoidReason.TeamOutsideCause]: "The team voided it in review, for a cause outside Brot.",
};

export const WAITING = "Waiting for payout";

export const STATES = {
  closed: "Entries closed",
  closedOnTime: (at: string) => `Entries closed on schedule, at ${at}.`,
  closedKnowable: "The answer is already on-chain, so entries closed early.",
  closedEpoch: "The measured epoch has started, so entries are closed.",
  closedNext: (deadline: string) =>
    `The program records the result once the answer is on-chain, or after the deadline (${deadline}) at the latest. Nobody chooses it.`,

  review: "In review",
  resultRead: (result: string) => `Result read: ${result}`,
  voidRead: "Result read: voided",
  valueRead: "Value read",
  target: "Target",
  accountRead: "Account read",
  metLate: "The target was met only after the deadline, so it counts as NO.",
  endsAt: (at: string) => `Review ends ${at}`,
  left: (clock: string) => `${clock} left`,
  ended: "The review window has ended: the result can now be made final by anyone.",
  reviewRule:
    "For 6 hours the team can confirm this result or void the campaign; nobody can turn a YES into a NO. Then payouts are sent. On devnet they are sent by hand for now, so no time is promised.",

  contested: "Contested",
  contestedText: "Payout is paused while this result is checked again.",
  contestEnds: (at: string) => `New deadline: ${at}`,

  paid: (result: string) => `Result: ${result}`,
  split: (result: string) =>
    `The wallets that entered ${result} share the pot, net of Brot's fee on the losing side and the creator's 1%.`,
  oneSided:
    "Only one side had entries, or the losing side was too small to cover the fees, so every entry is refunded: the first baker's in full, every other entry less 1% (rounded up to the lamport).",
  prizeBack: "The prize goes back to whoever opened the campaign.",
  /** [Q] Draft for the founder's approval: a campaign that ends with no entry (P1 §3.5 has no written rule). */
  empty: "Nobody entered this campaign, so there is nothing to pay out.",
  emptyPaid: "The prize goes back to whoever opened it, and Brot keeps the 10% opening fee.",
  allPaid: "Every entry has been paid out.",
  waiting: `${WAITING}: the result is final and the amounts are fixed.`,

  void: "Voided",
  refunded: "Every entry is refunded in full, with no fee.",
  feeRefunded: "The 10% opening fee goes back too, because the cause was Brot's.",
  feeKept: "Brot keeps the 10% opening fee, because the cause was outside Brot.",
  feeKeptEmpty: "With no entry at all, Brot keeps the 10% opening fee.",
  teamNote: "The team's note",
  noteHash: (hash: string) => `Its SHA-256 is on-chain: ${hash}`,
} as const;

export const YOURS = {
  title: "Your entry",
  sides: (sides: string) => `You have ${sides} in this campaign.`,
  ifWins: (side: string, sol: string) => `If ${side} wins: ${sol} SOL est.`,
  estimateNote: "Estimates change until entries close and the result is final.",
  ifConfirmed: (sol: string) => `If this result stands: ${sol} SOL`,
  owed: (sol: string) => `${WAITING}: ${sol} SOL`,
  received: (sol: string) => `Received: ${sol} SOL`,
  lost: "Your side lost, so nothing comes from the pot.",
  deposit: "The account deposit your entry opened comes back with it.",
  unread: "Your entry was settled. The amount could not be read now; it is in My entries.",
} as const;

export const OPENER = {
  title: "Creator and opener",
  share: (sol: string) => `Your creator share: ${sol} SOL`,
  sent: "Sent to your wallet.",
  /** The share's status after its amount, by `creatorShareStatus`. */
  status: { due: WAITING, reserved: "Kept in the vault for you", paid: "Sent to your wallet." } as Record<
    string,
    string
  >,
  reserved:
    "It is waiting in the campaign's vault: sending it would have left this empty wallet below Solana's minimum balance, so the program kept it. It can only ever go to this wallet.",
  reservedHow: (floor: string) => `Add at least ${floor} SOL to this wallet, then receive it here.`,
  prize: (sol: string) => `The prize returns to you: ${sol} SOL`,
  openingFee: (sol: string) => `The opening fee returns to you too: ${sol} SOL`,
} as const;

/** `hh:mm:ss` for a number of seconds (the review clock). */
export function clockText(seconds: bigint): string {
  const s = seconds > 0n ? seconds : 0n;
  const pad = (n: bigint) => n.toString().padStart(2, "0");
  return `${pad(s / 3_600n)}:${pad((s / 60n) % 60n)}:${pad(s % 60n)}`;
}

/** Lamports as SOL with every lamport kept and trailing zeros dropped: `495000000n` → `"0.495"`. */
export function exactSol(lamports: bigint): string {
  const whole = lamports / 1_000_000_000n;
  const frac = (lamports % 1_000_000_000n).toString().padStart(9, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : `${whole}`;
}
