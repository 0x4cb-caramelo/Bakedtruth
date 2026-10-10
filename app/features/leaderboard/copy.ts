/**
 * Purpose: the words of the devnet leaderboard (spec 3.9 of Sprint -1; BR-29; D-m vocabulary; English per L-01): the
 *          table, the connected wallet's own line, the loading, error and empty states, and how points work. What
 *          points are worth after devnet is L-09, still open: `POINTS_WORTH` is the recommended answer, one string, so
 *          the founder's answer changes it here. No line names a size of entry, a return or a reward.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */

/** L-09 (Product Brief v0.0.1 gap, open), as recommended: points promise nothing. Change it here only. */
export const POINTS_WORTH =
  "Points are a devnet game. They are not money, and nothing is promised for them after the beta.";

export const BOARD = {
  kicker: "Devnet points",
  title: "Devnet leaderboard",
  lead: "Wallets ranked by the campaigns they entered on the side that won.",
  columns: { rank: "Rank", wallet: "Wallet", points: "Points", hitRate: "Hit rate", entered: "Entered" },
  points: (n: number) => `${n} ${n === 1 ? "point" : "points"}`,
  hitRateNone: "—",
  readAt: (slot: string) => `Read from the chain at slot ${slot}.`,
  partial: "Still reading the program's history: some points may be missing for a few minutes.",
  foot: (shown: number, total: number) =>
    `${shown} of ${total} ${total === 1 ? "wallet" : "wallets"} with points. "Entered" counts every campaign a wallet joined; the hit rate counts only those with a final YES or NO.`,
  more: "Show more",
  loading: "Loading the leaderboard…",
  error: "The leaderboard could not be loaded.",
  errorNote: "Your entries are on-chain and unaffected; only this page could not load its data.",
  retry: "Try again",
  empty: "No points yet: they arrive when a campaign's result is final.",
  you: "You",
  connect: "Connect a wallet to see where it stands.",
  youNone: "No points yet. They arrive when a campaign you entered ends on your side and its result is final.",
  youBeyond: (n: number) => `Not among the first ${n.toLocaleString("en-US")} wallets read: fewer points, or none yet.`,
  youRank: (rank: number, points: string) => `#${rank} · ${points}`,
  youDetail: (points: number, decided: number, entered: number) =>
    `${points} of ${decided} decided ${decided === 1 ? "campaign" : "campaigns"} on the side that won; ${entered} entered.`,
  howTitle: "How points work",
  how: [
    "One point per campaign entered on the side that won, once its result is final: the 6-hour review has ended. Nothing else scores.",
    "The size of an entry never counts: 0.01 SOL scores the same as any larger entry.",
    "A voided campaign scores nothing: no side won.",
    POINTS_WORTH,
  ],
  public:
    "Wallet addresses and entries are public on Solana already; this page only counts them. Nothing about you is stored to make it.",
} as const;
