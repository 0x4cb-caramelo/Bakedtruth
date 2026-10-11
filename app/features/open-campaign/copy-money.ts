/**
 * Purpose: the creation box's money words and notices (BR-01, BR-26; TP §3.4.10, §3.4.16; D-m vocabulary; English per
 *          L-01): the charge at Pyth's price, the cost table with what comes back and when, the team key's variant, the
 *          notices said before paying and before signing (the devnet line, where the prize goes, what devnet does not
 *          send by itself, the no-entry rule, no taking it back), the box's button, and what the box stops on its own
 *          before the program would. Split from copy.ts in the Sprint 19 reviews.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import type { TargetUnit } from "./kinds";

export const MONEY = {
  charge: (usd: string, sol: string, price: string, at: string) =>
    `${usd} = ${sol} SOL at Pyth SOL/USD ${price}, its price minus its confidence band (a slightly lower price, so slightly more SOL), published ${at}`,
  opening: "Opening",
  notPriced: "Not priced yet",
  notPricedNote: "Priced from Pyth's SOL/USD once the amount is set and the price is fresh",
  prize: "Prize in the pot (90%)",
  prizeNote:
    "On no side. When the pot splits, it goes to the side that was right. It comes back to you only if nobody enters, the pot is refunded (one side only, or a losing side too small to pay the fees) or the campaign is voided",
  fee: "Opening fee (10%)",
  feeNote:
    "Held until the campaign settles. It comes back only when a void is Brot's fault (a reading Brot's service missed, or a cause the team records), and never on a campaign with no entry",
  most: "Most you'll pay",
  mostNote:
    "The quote plus 1% for price moves. Past it the program refuses the opening and takes no opening payment; a transaction that was sent still pays its network fee",
  rent: "Account rent",
  rentNote: "For the campaign and its vault; returned to you when the campaign is closed after its payouts",
  network: "Network fee",
  total: "Total now",
  atMost: (sol: string) => `At most ${sol} SOL`,
  free: "Free (team key)",
  onEntries: (feePct: string, sharePct: string | null) =>
    `On entries: Brot keeps ${feePct} of the losing side · ${sharePct ? `you get ${sharePct} of the entries when the pot splits` : "no creator share"} · no cap on the pot`,
  usdSource: "The US$ values are the opening's own amounts; the SOL is what the program charges at Pyth's price.",
  balance: (sol: string) => `Balance ${sol} SOL`,
  balanceOk: (sol: string) => `Balance ${sol} SOL, enough`,
  balanceShort: (need: string, has: string) => `You need up to ${need} SOL; this wallet has ${has} SOL.`,
  faucet: "Get devnet SOL",
} as const;

/** Before paying (Sprint 12's copy review; TP §3.4.10 "A campaign with no entries"): said next to the price. */
export const NO_ENTRY_RULE =
  "If the campaign ends with no entry at all, the prize comes back to you and Brot keeps the 10% opening fee, even when Brot's service caused a void.";
/** The opening is a commitment: there is no early exit for a prize either (P1 §3.10). */
export const NO_TAKE_BACK = "The opening can't be taken back: the prize stays in the pot until the campaign ends.";
/** The legal review (M1): the box's own devnet line, said where the price is, and in the sheet before signing. */
export const OPEN_DEVNET =
  "Solana devnet: an opening is paid in test SOL, which has no real value. The US$ amounts only set how much test SOL it costs, at Pyth's SOL/USD price. The program is not audited yet.";
/** The coordinator review (S-1): a team key's opening pays no US$ amount, only the rent and the network fee. */
export const OPEN_DEVNET_TEAM =
  "Solana devnet: the rent and the network fee are paid in test SOL, which has no real value. The program is not audited yet.";
/** The legal review (M3): the usual case, said plainly; the founder's devnet wording for what comes back. */
export const PRIZE_FATE =
  "When the pot splits, the prize goes to the side that was right. It comes back to you only if nobody enters, the pot is refunded (one side only, or a losing side too small to pay the fees) or the campaign is voided.";
export const RETURNS_DEVNET =
  "On devnet, what comes back to you (the prize, the rent, your 1%) is not sent automatically yet, and no time is promised.";
/** The copy review (M6): a team key's opening has no prize and no share; only its rent comes back. */
export const RETURNS_DEVNET_TEAM = "On devnet, the rent is not sent back automatically yet, and no time is promised.";

export const TEAM = {
  note: "Team key: this opening is free, with no prize and no creator share. A launch partner's campaign is linked to the partner by Brot's team, apart from this box.",
} as const;

export const ACTION = {
  review: "Review and sign",
  preparing: "Checking your opening…",
  ready: "Nothing is signed until you approve it in your wallet.",
  wait: "Finish the items above to continue.",
  also: (tags: string) => `Also: ${tags}`,
} as const;

/** What the box stops on its own before the program would, each with a short tag for the button. */
export const ISSUES = {
  connect: ["Connect a wallet to open.", "Connect wallet"],
  reading: ["Reading the program's settings and Pyth's SOL/USD price…", "Reading Solana"],
  readFailed: ["Couldn't reach Solana right now. This page tries again by itself.", "Can't reach Solana"],
  noConfig: ["The program isn't set up on this network.", "Not set up"],
  feed: ["Pick an asset.", "Pick an asset"],
  feedWait: ["Reading the feed's price…", "Reading the price"],
  account: ["Paste an account's address, or pick a known name.", "Pick an account"],
  accountWait: ["Reading the account…", "Checking the account"],
  noAccount: ["No account at this address on this network.", "No account there"],
  target: ["Set a target.", "Set a target"],
  epoch: ["Pick an epoch.", "Pick an epoch"],
  deadline: ["Pick a date and a time.", "Pick a deadline"],
  margin: [
    "Pick a deadline at least 3 days and 10 minutes from now, so the transaction can still land inside the 3-day rule.",
    "Deadline too soon",
  ],
  usd: ["Enter a whole number of US$, at least 500.", "At least US$500"],
  site: ["Openings are off on this site right now. Campaigns already open are not affected.", "Openings off here"],
  balance: ["", "Not enough SOL"],
} as const;

/** A target the box cannot read, by unit (the copy review, M7). */
export const TARGET_FORMAT: Record<TargetUnit, readonly [string, string]> = {
  usd: [
    "Write the target as a plain number with a dot for decimals: at most 2 of them, or 6 significant digits below US$1.",
    "Check the target",
  ],
  raw: ["Write the target as a whole number, with no decimals.", "Check the target"],
  sol: ["Write the target in SOL with a dot for decimals: at most 4 of them.", "Check the target"],
};
