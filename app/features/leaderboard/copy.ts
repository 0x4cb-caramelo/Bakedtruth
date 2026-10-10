/**
 * Purpose: the words of the devnet leaderboard (spec 3.9 of Sprint -1; BR-29; D-m vocabulary; English per L-01): the
 *          table, the connected wallet's own line, the loading, error and empty states, how points work (the SDK's
 *          rule, with the founder's answer 3a; the both-sides line follows `BOTH_SIDES_SCORE`), what the page keeps and
 *          sends, and how to leave the ranking (the privacy review, TP §8.2; the 15 days of answer 8a). What points are
 *          worth after devnet is L-09, answered 2a: `POINTS_WORTH`, one string. No line names a return or a reward.
 * Version: 0.3.0 (the founder's answers of 2026-10-10: what scores, and the answer within 15 days)
 * Sprint:  13 (site: ranking, notices and copy)
 */

import { BOTH_SIDES_SCORE } from "@brot/sdk/read";

/**
 * L-09 (Product Brief v0.0.1 gap), answered 2a on 2026-10-10: points promise nothing. No "game" and no "beta" (the
 * legal and copy reviews). Change it here only.
 */
export const POINTS_WORTH =
  "Points only count on devnet. They are not money, and nothing is promised for them after the test phase.";

/** Where to ask to leave the ranking: the same X account as L-13, a plain link. */
export const LEAVE_URL = "https://x.com/brotmarkets";

export const BOARD = {
  kicker: "Devnet points",
  title: "Devnet leaderboard",
  lead: "Wallets ranked by the campaigns they entered on the side that won.",
  columns: { rank: "Rank", wallet: "Wallet", points: "Points", entered: "Campaigns entered" },
  points: (n: number) => `${n} ${n === 1 ? "point" : "points"}`,
  readAt: (slot: string) => `Read from the chain at slot ${slot}.`,
  partial: "Still reading the program's history: some points may be missing until it finishes.",
  foot: (shown: number, total: number) =>
    `${shown} of ${total} ${total === 1 ? "wallet" : "wallets"} with points. "Campaigns entered" counts every campaign a wallet joined.`,
  more: "Show more",
  loading: "Loading the leaderboard…",
  error: "The leaderboard could not be loaded.",
  errorNote: "Your entries are on-chain and unaffected; only this page could not load its data.",
  retry: "Try again",
  empty: "No points yet: they are counted when a campaign's result is final.",
  you: "You",
  connect: "Connect a wallet to see where it stands.",
  youNone:
    "No points yet. A campaign you entered scores when its result is final, your side won and its pot was split. How points work has the details.",
  youReading: "Still reading the program's history: your points may not all be counted yet.",
  youBeyond: (n: number) => `Your wallet is not among the first ${n.toLocaleString("en-US")} wallets read.`,
  youRank: (rank: number, points: string) => `#${rank} · ${points}`,
  youDetail: (points: number, entered: number) =>
    `${points} from ${entered} ${entered === 1 ? "campaign" : "campaigns"} entered.`,
  howTitle: "How points work",
  how: [
    "One point per campaign entered on the side that won, once its result is final. Nothing else scores.",
    "The size of an entry never counts: 0.01 SOL scores the same as any larger entry.",
    BOTH_SIDES_SCORE
      ? "A wallet with entries on both sides of a campaign scores when either side wins."
      : "A wallet with entries on both sides of a campaign does not score for it.",
    "A voided campaign scores nothing: no side won.",
    "A refunded pot scores nothing: when one side is empty, or the losing side cannot pay the fees, every entry is refunded instead of split.",
    "Whoever opens a burn, lock or stake campaign can control its result, so the wallet that opened it does not score for it. Their other wallets cannot be told apart on-chain.",
    "One person can hold many wallets, so the ranking says nothing about who is behind them.",
    POINTS_WORTH,
  ],
  public:
    "Wallet addresses and their entries are public on Solana. This ranking is computed from them on Brot's server and kept in memory, never written to disk. The page does not send your wallet to Brot: it finds your line in your browser.",
  leave:
    "The Brot Markets team runs this ranking. To leave it, send us a direct message on X; we will ask your wallet to sign a short message to confirm the request, and answer within 15 days.",
  leaveLink: "x.com/brotmarkets",
} as const;
