/**
 * Purpose: one message for each way an entry can fail (the Sprint 11 list: entries closed, outcome already known, no
 *          fresh price, pause, below the minimum, not enough SOL, entry changed since it was read, return below
 *          min_return_bps, signature refused, transaction failed, network down), plus the price buffer, an earlier
 *          entry that already landed, an attempt that expired, and A-8's pause: the program updated since this site
 *          was built (the page reloads after a back-off), or a site that does not know its program's version. Each
 *          says what happened, what it cost and the way out; the program's own message (from the SDK's error map) is
 *          shown under it. D-m words; English (L-01).
 * Version: 0.2.1 (A-8, 2026-10-10; Sprint 19: the program's line without "Row N:")
 * Sprint:  11 (site: campaign page and entry)
 */
import type { FailureKey } from "./failures";

/** What a message may name: the feed, the campaign's price age, its minimum, the floor signed, the money needed. */
export type FailureContext = {
  asset?: string | null;
  maxAge?: number;
  minEntry?: string;
  floor?: string;
  need?: { amount: string; rents: string; fee: string };
};

/**
 * "again": review again; "amount": change the amount; "close": nothing to retry; "faucet": get devnet SOL; "check":
 * watch an unresolved attempt again; "reload": reload the page for a site built for the program's new version (A-8).
 */
export type WayOut = "again" | "amount" | "close" | "faucet" | "wait" | "check" | "reload";

export type FailureCopy = { title: string; text: string; way: WayOut };

const TEXT: Record<FailureKey, (c: FailureContext) => FailureCopy> = {
  entriesClosed: () => ({
    title: "Entries closed",
    text: "This campaign stopped taking entries before yours went in. The page shows where the campaign stands now.",
    way: "close",
  }),
  outcomeKnown: () => ({
    title: "The answer is already known",
    text: "The account already shows the result, so entries are locked. The program records it next; follow it on this page.",
    way: "close",
  }),
  noFreshPrice: (c) => ({
    title: "No fresh price",
    text: `The ${c.asset ?? "feed's"} price on-chain is older than this campaign allows${c.maxAge ? ` (${c.maxAge} s)` : ""}. Entries wait for the next update; on devnet it comes about once a minute.`,
    way: "again",
  }),
  priceTooClose: () => ({
    title: "The price is too close to the target",
    text: "The price is within 1% of the target, so the answer could come at any moment. Entries wait until it moves away.",
    way: "again",
  }),
  paused: () => ({
    title: "Entries are paused",
    text: "The team paused entries. Payouts and refunds continue. Try again when entries resume.",
    way: "close",
  }),
  belowMinimum: (c) => ({
    title: "Below the minimum entry",
    text: `The minimum entry for this campaign is ${c.minEntry ?? "0.01"} SOL.`,
    way: "amount",
  }),
  notEnoughSol: (c) => ({
    title: "Not enough SOL",
    text: c.need
      ? `Your wallet needs ${c.need.amount} SOL for the entry, ${c.need.rents} SOL for the accounts it opens (returned when the campaign settles) and up to ${c.need.fee} SOL for the network fee.`
      : "Your wallet does not hold enough SOL for the entry, the accounts it opens and the network fee.",
    way: "faucet",
  }),
  entryChanged: () => ({
    title: "Your entry changed since this page read it",
    text: 'Another entry from this wallet went in after the page read it, so this one was refused. "Your entry" on this page shows what it holds now.',
    way: "close",
  }),
  alreadyLanded: () => ({
    title: "Your earlier entry already landed",
    text: "Nothing went in twice: this copy was refused, and your entry holds the earlier one.",
    way: "close",
  }),
  returnBelowMinimum: (c) => ({
    title: "The estimate fell below what you accepted",
    text: `Other entries went in first, and the return fell under the floor set for this entry${c.floor ? ` (${c.floor} per 1)` : ""}. Review it again.`,
    way: "again",
  }),
  signatureRefused: () => ({
    title: "You refused it in your wallet",
    text: "Nothing was sent.",
    way: "again",
  }),
  transactionFailed: () => ({
    title: "The transaction failed",
    text: "Your entry did not go in.",
    way: "again",
  }),
  networkDown: () => ({
    title: "Can't reach Solana right now",
    text: "The page could not reach the network. Check your connection and try again.",
    way: "again",
  }),
  notLanded: () => ({
    title: "Your entry did not go in",
    text: "Your wallet gave no answer, and the transaction expired without landing. You can try again.",
    way: "again",
  }),
  stillChecking: () => ({
    title: "Still checking your entry",
    text: "The network stopped answering while this page checked whether your entry landed. It may still land. Check again; nothing new can be signed here until this one is settled.",
    way: "check",
  }),
  programUpgraded: () => ({
    title: "Brot's program was just updated",
    text: "This page was built for the program's previous version, so it does not ask your wallet to sign. It reloads to get the page built for the new one.",
    way: "reload",
  }),
  versionUnknown: () => ({
    title: "This page can't confirm the program's version",
    text: "The page does not know which version of Brot's program it was built for, so it does not ask your wallet to sign. Try again later.",
    way: "close",
  }),
  walletChanged: () => ({
    title: "Your wallet changed",
    text: "The connected wallet is not the one this entry was prepared for. Review it again with the wallet you want to use.",
    way: "again",
  }),
};

export const failureCopy = (key: FailureKey, context: FailureContext = {}): FailureCopy => TEXT[key](context);

/** What a failure cost: nothing before the chain; only the network fee once a transaction landed and failed. */
export const COST = {
  nothing: "Nothing was charged.",
  fee: "No SOL moved except the network fee.",
  unknown: "If the transaction reached the chain and failed, only its network fee moved.",
} as const;

/** The program's own line, without the plan's row number or code quotes (the Sprint 19 copy review, M3). */
export const programLine = (code: number, name: string, message: string) =>
  `Program error ${code} ${name}: ${message.replace(/^Row \d+: /, "").replaceAll("`", "")}`;

export const ACTIONS: Record<WayOut, string> = {
  again: "Review again",
  amount: "Change the amount",
  close: "Close",
  faucet: "Get devnet SOL",
  wait: "Try again",
  check: "Check again",
  reload: "Reload now",
};

/** A-8's countdown: seconds under a minute, whole minutes (rounded up) above. */
export const RELOADING = (seconds: number) =>
  seconds < 60 ? `Reloading in ${seconds} s.` : `Reloading in ${Math.ceil(seconds / 60)} min.`;
