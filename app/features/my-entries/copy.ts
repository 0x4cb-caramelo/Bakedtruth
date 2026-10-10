/**
 * Purpose: the words of "My entries" (Sprint 12; D-m vocabulary; English per L-01, route `/my-entries` confirmed by
 *          the founder): the wallet prompt, the totals received and waiting, each row's state, sides and payout, how
 *          far back the history was read, and what to do when a read fails. On devnet nothing pays out by itself yet,
 *          so a final amount not yet sent says "Waiting for payout" and promises no time (founder, 2026-10-10).
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
export const MINE = {
  title: "My entries",
  intro: "Your entries, results and payouts, read from the chain.",
  connect: "Connect a wallet to see its entries, results and payouts.",
  loading: "Reading your entries from the chain…",
  failed: "Can't reach Solana right now. Your entries could not be read; try again in a moment.",
  staleRead: "Can't reach Solana right now. What you see is from the last successful read.",
  retry: "Try again",
  empty: "This wallet has no entries yet.",
  browse: "Browse campaigns",
  received: "Received",
  waiting: "Waiting for payout",
  waitingNote:
    "Waiting counts what the program will send this wallet once someone sends it: entries, the creator's 1% and returned prizes.",
  receivedNote:
    "Received counts only what the program's settlement events show was sent to this wallet: payouts, refunds, the creator's 1%, and returned prizes and opening fees. The account deposit an entry opens, which comes back with it, is not counted.",
  coverage: (n: number) => `History read from this wallet's last ${n} transactions on-chain.`,
  complete: (n: number) =>
    `History read from ${n === 1 ? "this wallet's only transaction" : `all ${n} of this wallet's transactions`} on-chain.`,
  older: "Read older transactions",
  readingOlder: "Reading…",
  unreadable: (n: number) =>
    `${n} ${n === 1 ? "transaction" : "transactions"} could not be read now: amounts in them are missing from the totals until a later read.`,
  apiDown: "The campaign list is unavailable now, so only campaigns found in this wallet's history are shown.",
  closedAccount: "Settled",
  closedText: "Every payout went out and the campaign's account was closed.",
  youEntered: (sides: string) => `You entered ${sides}`,
  created: "You opened this campaign",
} as const;
