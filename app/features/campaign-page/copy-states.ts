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
  [VoidReason.TeamHouseFailure]: "The team recorded this void in review: the cause was Brot's.",
  [VoidReason.TeamOutsideCause]: "The team recorded this void in review: the cause was outside Brot.",
};

export const WAITING = "Waiting for payout";

export const STATES = {
  closed: "Entries closed",
  closedOnTime: (at: string) => `Entries closed on schedule, at ${at}.`,
  closedKnowable: "The answer is already on-chain, so entries closed early.",
  closedEpoch: "The measured epoch has started, so entries are closed.",
  closedNext: (deadline: string) =>
    `The program records the result once the answer is on-chain, or once the deadline (${deadline}) has passed. Nobody chooses it.`,

  review: "In review",
  resultRead: (result: string) => `Result read: ${result}`,
  voidRead: "Result read: voided",
  valueRead: "Value read",
  target: "Target",
  accountRead: "Account read",
  metLate:
    "The program read the account after the deadline, and the target was met by then. YES counts only if it is read before the deadline, so this counts as NO.",
  endsAt: (at: string) => `Review ends ${at}`,
  left: (clock: string) => `${clock} left`,
  ended: "The review window has ended: the result can now be made final by anyone.",
  reviewRule:
    "For 6 hours the team can confirm this result; nobody can change a YES into a NO, or a NO into a YES. After that the result is final and payouts wait to be sent: on devnet that is not automatic yet, and no time is promised.",

  contested: "Contested",
  contestedText: "Payout is paused while this result is checked again.",
  contestEnds: (at: string) => `The check is set to end ${at}.`,

  paid: (result: string) => `Result: ${result}`,
  split: (result: string, creatorShare = true) =>
    `The bakers who entered ${result} share the pot, net of Brot's fee on the losing side${creatorShare ? " and the creator's 1%" : ""}.`,
  oneSided:
    "Every entry is refunded: only one side had entries, or the losing side was too small to cover the fees. The first baker gets the whole entry back; every other entry gets back less 1%, rounded up to the lamport.",
  feeKeptOneSided: "Brot keeps the 10% opening fee.",
  prizeBack: "The prize goes back to whoever opened the campaign.",
  /** A campaign that ends with no entry (P1 §3.5 has no written rule): approved by the founder, 2026-10-10 (answer 1a). */
  empty: "Nobody entered this campaign, so there are no entries to pay.",
  emptyPaid:
    "The prize goes back to whoever opened it, and Brot keeps the 10% opening fee, as it does whenever nobody enters.",
  allPaid: "Every entry has been paid out.",
  waiting: `${WAITING}: the result is final and the amounts are fixed.`,

  void: "Voided",
  refunded: "Every entry gets its full amount back, with no fee.",
  feeRefunded: "The 10% opening fee goes back too, because the cause was Brot's.",
  feeKept: "Brot keeps the 10% opening fee, because the cause was outside Brot.",
  feeKeptEmpty: "With no entry at all, Brot keeps the 10% opening fee, whatever the cause of the void.",
  teamNote: "The team's note",
  noteHash: (hash: string) => `Its SHA-256 is on-chain: ${hash}`,
} as const;

export const YOURS = {
  title: "Your entry",
  sides: (sides: string) => `You have ${sides} in this campaign.`,
  ifWins: (side: string, sol: string) => `If ${side} wins: est. ${sol} SOL`,
  estimateNote: "Estimates change until entries close and the result is final.",
  ifConfirmed: (sol: string) => `If this result stands: ${sol} SOL`,
  ifConfirmedEst: (sol: string) =>
    `If this result stands: est. ${sol} SOL, until every join is tallied (a join after a YES proof comes back whole).`,
  owed: (sol: string) => `${WAITING}: ${sol} SOL`,
  received: (sol: string) => `Received: ${sol} SOL`,
  lost: "Your side lost: nothing comes from the pot.",
  deposit: "The account deposit your entry opened comes back when it is settled.",
  unread: "Your entry was settled, but its amount could not be read now. Try again in a moment.",
} as const;

export const OPENER = {
  title: "Creator",
  share: (sol: string) => `Your creator share: ${sol} SOL`,
  sent: "Sent to your wallet.",
  /** The share's status after its amount, by `creatorShareStatus`. */
  status: { due: WAITING, reserved: "Kept in the vault for you", paid: "Sent to your wallet." } as Record<
    string,
    string
  >,
  reserved:
    "The program kept it in the campaign's vault: sending it to your empty wallet would have left the account below Solana's minimum balance. It can only ever go to this wallet.",
  reservedHow: (floor: string) =>
    `This wallet needs at least ${floor} SOL in it to receive it (it pays the network fee and must keep Solana's minimum balance); add a little more if your wallet adds a priority fee.`,
  atClose: (sol: string) => `Your creator share, ${sol} SOL, was sent with the campaign's close.`,
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
