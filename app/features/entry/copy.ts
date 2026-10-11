/**
 * Purpose: the entry panel's words (BR-12, BR-27; D-m vocabulary): the panel, the five notices a baker reads before
 *          signing (the estimate, a large entry, the lock, the fee, devnet), the sheet "Check before you sign", and the
 *          signing steps. The lock notice is the founder's L-03 text, verbatim (2026-10-10), with the devnet wording
 *          the founder approved the same day in Sprint 12 (no automatic payout, no time promised, until the keeper
 *          settles); changing it is the founder's decision. English, per L-01. Failures have their own file
 *          (copy-failures.ts).
 * Version: 0.3.1 (the founder's answer 9a: a winning entry "can appear" on the leaderboard, since answer 3a leaves
 *          some unscored; 0.3.0, Sprint 13: the too-small refund before signing, the leaderboard in the first-entry line)
 * Sprint:  11 (site: campaign page and entry); 12; 13
 */

/**
 * L-03, approved by the founder on 2026-10-10; its last sentence in the devnet wording the founder approved in Sprint 12
 * (2026-10-10, answer 2a). Do not edit without a new founder decision.
 */
export const LOCK_NOTICE =
  "Your entry stays locked until the campaign ends. You cannot take it out before then. Payouts go to your wallet after the result is read; on devnet that is not automatic yet, and no time is promised.";

/** Basis points as a short percentage: 1,000 → "10%", 150 → "1.5%". */
export const pct = (bps: number): string => `${(bps / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;

export const NOTICES = {
  estimate:
    "Estimate, not a promise: it is net of Brot's fee and the creator's share, and it changes with every entry until entries close.",
  largeEntry: "Your own entry counts in the pot: the more you put on a side, the lower that side's return per 1.",
  largeEntryNumbers: (small: string, mine: string) =>
    `Est. ${small} per 1 for a minimum entry, ${mine} per 1 with yours.`,
  fee: (feeBps: number, creatorShareBps: number) =>
    `Brot keeps ${pct(feeBps)} of the losing side. ${creatorShareBps > 0 ? `The creator gets ${pct(creatorShareBps)} of the entries.` : "This campaign has no creator share."}`,
  oneSided: (oneSidedFeeBps: number) =>
    `If only one side has entries when they close, or the losing side is too small to pay the fees, every entry is refunded: the first wallet in full, the others less ${pct(oneSidedFeeBps)}.`,
  devnet: "Solana devnet: entries use test SOL, which has no real value. The program is not audited yet.",
  lock: LOCK_NOTICE,
} as const;

export const PANEL = {
  title: "Join this campaign",
  closes: (when: string) => `Entries close ${when}`,
  sideGroup: "Side",
  perOne: (value: string) => `est. ${value} per 1`,
  refundIfAlone: "refund if alone",
  amountLabel: "Amount (SOL)",
  balance: (sol: string) => `Balance ${sol} SOL`,
  balanceUnknown: "Balance …",
  connectToSee: "Connect to see your balance",
  max: "Max",
  minimumHelp: (min: string) => `Minimum ${min} SOL.`,
  amountInvalid: "Write the amount in SOL, like 0.5.",
  belowMinimum: (min: string) => `The minimum entry for this campaign is ${min} SOL.`,
  fromLink: "This came from the link you opened. Check the side and the amount before you sign.",
  enterAmount: "Enter an amount to see the estimate.",
  ifWins: (side: string, back: string, amount: string) =>
    `If ${side} wins: est. ${back} SOL back on your ${amount} SOL`,
  ifLoses: (other: string) => `If ${other} wins: 0 SOL back.`,
  onesided: (other: string, back: string) => `If ${other} stays empty: est. ${back} SOL back`,
  tooSmall: (other: string, oneSidedFeeBps: number) =>
    `The ${other} side is too small to pay the fees. If entries closed now, the pot would not split: every entry would come back, less ${pct(oneSidedFeeBps)} for all but the first wallet.`,
  onesidedSub: (first: boolean, other: string, oneSidedFeeBps: number) =>
    `${first ? "No fee: you would be the first wallet." : `A ${pct(oneSidedFeeBps)} fee; the first wallet pays none.`} If someone joins ${other}, the winners split the pot.`,
  rentFirst: (rent: string) =>
    `First entry here: + ${rent} SOL for the accounts it opens, returned when the campaign settles.`,
  rentAgain: (rent: string) => `+ ${rent} SOL for this entry's record, returned when the campaign settles.`,
  connect: "Connect",
  noWallet: "No installed wallet found",
  connecting: "Connecting…",
  faucet: "Get devnet SOL",
  noSol: "You need devnet SOL to join. It is free from the faucet and worth nothing.",
  paused: "Entries are paused",
  waitingPrice: "Waiting for a fresh price",
  review: "Review entry",
  preparing: "Checking the campaign and your entry…",
  notTaken: "Entries are not taken on this site right now. The campaign, its proof and its payouts stay visible.",
} as const;

export const SHEET = {
  title: "Check before you sign",
  campaign: (id: string) => `Campaign ${id}`,
  sideAmount: "Side · amount",
  estimate: "Estimated return now",
  estimateValue: (perOne: string, back: string, side: string) =>
    `est. ${perOne} per 1 · est. ${back} SOL back if ${side} wins`,
  estimateOnesided: (back: string, other: string) => `est. ${back} SOL back if ${other} stays empty`,
  tooSmall: (other: string) =>
    `The ${other} side is too small to pay the fees: if entries closed now, the pot would not split and this entry would be refunded. The floor below is the program's own estimate, which assumes the pot splits.`,
  floor: "Lowest estimate you accept",
  floorValue: (perOne: string) => `${perOne} per 1`,
  floorNote: (bps: string) =>
    `min_return_bps ${bps}: if other entries go in first and the estimate falls below this, the program refuses the entry. Later entries can still lower it.`,
  guard: (total: string) =>
    `expected_entry_total ${total} SOL: this entry goes in only if your entry is still ${total} SOL when it lands, so this transaction cannot go in twice.`,
  addsTo: (total: string) => `This entry adds to the ${total} SOL you already have in this campaign.`,
  notKept:
    'This browser does not keep data for this page. If it closes before your wallet answers, check "Your entry" here before you try again.',
  soFar: "Your entry so far",
  refreshed: "Prepared again: the network moved on while this was open. Check it again before you sign.",
  feeValue: (fee: string) => `at most ${fee} SOL`,
  rents: "Account rents",
  rentsNote: "Returned when the campaign settles",
  fee: "Network fee",
  total: "Total from your wallet",
  network: "Network · program",
  bytes: "What you sign, read from the transaction's bytes",
  walletDiffers: "If your wallet shows something different from this summary, reject it.",
  public:
    "Entries are public and permanent: anyone can see this wallet's entries on-chain, and a wallet that enters on the side that wins can appear on the public devnet leaderboard.",
  back: "Back",
  sign: "Sign in wallet",
} as const;

export const STEPS = {
  title: "Signing your entry",
  wallet: "Approve in your wallet.",
  confirming: "Sent. Confirming on devnet…",
  checking: "Checking whether your entry landed…",
  checkingNote:
    "Your wallet gave no answer. This page checks until the transaction can no longer land, then tells you, so an entry cannot go in twice.",
  blocksLeft: (left: string) => `About ${left} blocks until it expires.`,
  keepOpen: "Keep this page open.",
} as const;

export const DONE = {
  title: "You're in",
  text: (side: string, amount: string) => `${side} ${amount} SOL is in the pot.`,
  paidOut:
    "Your payout goes to your wallet after the result is read and its 6-hour review ends. On devnet that is not automatic yet, and no time is promised. You do not need to claim it.",
  transaction: "Transaction",
  landedNoSignature: "Your entry account shows the entry. The wallet did not return its signature.",
  holdsNow: (yes: string, no: string) => `Your entry now holds YES ${yes} SOL and NO ${no} SOL.`,
  close: "Done",
} as const;
