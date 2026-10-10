/**
 * Purpose: the retry guard (A-9; proposal §3.4 rule 6; TP §3.6 S1 rule 6). Before the wallet gets a join, the site
 *          saves what it read: the entry total the join is signed against (`expected_entry_total`) and the
 *          transaction's `lastValidBlockHeight`. On a return without an answer (a frozen tab, a lost wallet session, a
 *          reload), the record says what to wait for: the join landed once the entry total moved; it can no longer
 *          land once the finalized block height passed `lastValidBlockHeight` with the total unchanged; until then,
 *          wait. Every later attempt passes the saved total back, so a join that did land makes it fail
 *          (`EntryTotalMismatch`) instead of entering twice. Only a landing seen on-chain clears the record.
 * Version: 0.1.1 (the web smoke: a returned signature's failure is not hidden by another entry moving the total)
 * Sprint:  11 (site: campaign page and entry)
 *
 * The store is the browser's localStorage, read and written inside try/catch: with storage blocked, the guard still
 * holds for the open page (the record also lives in memory), and the program's `expected_entry_total` check holds
 * whatever the page remembers.
 */

/** "handed": given to the wallet, answer unknown; "refused": the wallet said no; "expired": it can no longer land. */
export type PendingState = "handed" | "refused" | "expired";

export type PendingEntry = {
  v: 1;
  campaign: string;
  baker: string;
  side: "yes" | "no";
  /** Lamports, as decimal strings (JSON has no bigint). */
  amount: string;
  expectedEntryTotal: string;
  lastValidBlockHeight: string;
  signature: string | null;
  state: PendingState;
  /** The device's clock, for display only; nothing is decided by it (A-7). */
  savedAt: number;
};

/** The part of `Storage` the guard uses, so tests and the server can pass their own. */
export type KeyValueStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export const pendingKey = (campaign: string, baker: string) => `brot-pending-entry:${campaign}:${baker}`;

/** Saves the record; `false` when the store refused (private mode, full or blocked storage). */
export function savePending(store: KeyValueStore | null, entry: PendingEntry): boolean {
  try {
    store?.setItem(pendingKey(entry.campaign, entry.baker), JSON.stringify(entry));
    return store !== null;
  } catch {
    return false;
  }
}

const DIGITS = /^\d+$/;

/** The record for this campaign and wallet, or `null` when there is none or it does not parse as one. */
export function loadPending(store: KeyValueStore | null, campaign: string, baker: string): PendingEntry | null {
  try {
    const raw = store?.getItem(pendingKey(campaign, baker));
    if (!raw) return null;
    const p = JSON.parse(raw) as PendingEntry;
    const fine =
      p.v === 1 &&
      p.campaign === campaign &&
      p.baker === baker &&
      (p.side === "yes" || p.side === "no") &&
      [p.amount, p.expectedEntryTotal, p.lastValidBlockHeight].every((n) => typeof n === "string" && DIGITS.test(n)) &&
      ["handed", "refused", "expired"].includes(p.state);
    return fine ? p : null;
  } catch {
    return null;
  }
}

export function clearPending(store: KeyValueStore | null, campaign: string, baker: string): void {
  try {
    store?.removeItem(pendingKey(campaign, baker));
  } catch {
    // Nothing to do: the record in memory is dropped by the caller.
  }
}

/** What the chain shows now, for the record's campaign and wallet. */
export type ChainNow = {
  /** The wallet's entry total now (both sides), 0 before its first entry. */
  entryTotal: bigint;
  /** The finalized block height: past `lastValidBlockHeight`, the transaction can no longer land. */
  blockHeight: bigint;
  /** The signature's status, when the wallet returned one: landed (confirmed), failed (landed with an error), or not seen. */
  status: "landed" | "failed" | null;
};

export type PendingVerdict = "landed" | "failed" | "not-landed" | "wait";

/**
 * The guard's rule: what a record means given what the chain shows now. A signature's status decides when the wallet
 * returned one (another entry may move the total while this one fails); without a signature, the entry total is the
 * only witness. Past `lastValidBlockHeight` nothing can land any more: a moved total then counts as landed.
 */
export function decidePending(entry: PendingEntry, now: ChainNow): PendingVerdict {
  if (now.status === "landed") return "landed";
  if (now.status === "failed") return "failed";
  const moved = now.entryTotal !== BigInt(entry.expectedEntryTotal);
  if (entry.signature === null && moved) return "landed";
  if (now.blockHeight > BigInt(entry.lastValidBlockHeight)) return moved ? "landed" : "not-landed";
  return "wait";
}

/** The `expected_entry_total` the next attempt must pass: the saved one while a record is kept, else none. */
export const guardedTotal = (entry: PendingEntry | null): bigint | undefined =>
  entry ? BigInt(entry.expectedEntryTotal) : undefined;
