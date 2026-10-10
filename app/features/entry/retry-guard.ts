/**
 * Purpose: the retry guard (A-9; proposal §3.4 rule 6; TP §3.6 S1 rule 6). Before the wallet gets a join, the site
 *          saves what it read: the entry total the join is signed against (`expected_entry_total`) and the block height
 *          past which it can no longer land. On a return without an answer (a frozen tab, a lost wallet session, a
 *          reload), the record says what to wait for: the join landed once its signature or the entry total says so; it
 *          can no longer land once the finalized height passed the deadline with the total unchanged; until then, wait.
 *          Every later attempt passes the saved total back, so a join that did land makes it fail (`EntryTotalMismatch`)
 *          instead of entering twice. A record belongs to one attempt: only that attempt's watch updates or clears it.
 * Version: 0.2.0 (Sprint 11 review: a record kept in memory too, owned per attempt, a deadline that can only grow)
 * Sprint:  11 (site: campaign page and entry)
 *
 * The store is layered: a map in this page's memory, mirrored to localStorage when the browser allows it, so the
 * guard holds for the open page even with storage blocked, and across a reload when it is not. The program's
 * `expected_entry_total` check holds whatever the page remembers. Nothing here leaves the browser; a settled record is
 * deleted after a day (`pruneSettled`).
 */

/** "handed": given to the wallet, answer unknown; "refused": provably not sent; "expired": it can no longer land. */
export type PendingState = "handed" | "refused" | "expired";

export type PendingEntry = {
  v: 2;
  /** One hand-off to the wallet; a new attempt gets a new id. */
  attempt: string;
  campaign: string;
  baker: string;
  side: "yes" | "no";
  /** Lamports and heights, as decimal strings (JSON has no bigint). */
  amount: string;
  expectedEntryTotal: string;
  lastValidBlockHeight: string;
  /** The height to wait past: `lastValidBlockHeight`, raised when the wallet answers late (it may sign a newer blockhash). */
  deadline: string;
  signature: string | null;
  state: PendingState;
  /** An earlier attempt for this campaign and wallet may have reached the chain: a changed total then means it landed. */
  handedBefore: boolean;
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

const memory = new Map<string, string>();

/** This page's memory first, then `local` (localStorage, or `null` where the browser refuses it). Never throws. */
export function layeredStore(local: KeyValueStore | null): KeyValueStore & { persists: boolean } {
  const quietly = <T>(act: () => T, fallback: T) => {
    try {
      return act();
    } catch {
      return fallback;
    }
  };
  let persists = local !== null;
  return {
    get persists() {
      return persists;
    },
    getItem: (key) => memory.get(key) ?? quietly(() => local?.getItem(key) ?? null, null),
    setItem: (key, value) => {
      memory.set(key, value);
      persists = quietly(() => (local?.setItem(key, value), local !== null), false);
    },
    removeItem: (key) => {
      memory.delete(key);
      quietly(() => local?.removeItem(key), undefined);
    },
  };
}

/** Writes the record; `false` when the store refused it. */
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
      p.v === 2 &&
      typeof p.attempt === "string" &&
      p.campaign === campaign &&
      p.baker === baker &&
      (p.side === "yes" || p.side === "no") &&
      [p.amount, p.expectedEntryTotal, p.lastValidBlockHeight, p.deadline].every(
        (n) => typeof n === "string" && DIGITS.test(n),
      ) &&
      ["handed", "refused", "expired"].includes(p.state);
    return fine ? p : null;
  } catch {
    return null;
  }
}

/** Removes the record, whatever attempt it holds: the chain moved past every attempt it guarded. */
export function clearPending(store: KeyValueStore | null, campaign: string, baker: string): void {
  try {
    store?.removeItem(pendingKey(campaign, baker));
  } catch {
    // Nothing to do: a store that refuses a removal holds nothing to remove.
  }
}

/** Updates the record only while it still holds `entry`'s attempt; a newer attempt's record is never touched. */
export function updateAttempt(store: KeyValueStore | null, entry: PendingEntry): void {
  const now = loadPending(store, entry.campaign, entry.baker);
  if (!now || now.attempt === entry.attempt) savePending(store, entry);
}

/** Clears the record only while it still holds `entry`'s attempt. */
export function clearAttempt(store: KeyValueStore | null, entry: PendingEntry): void {
  if (loadPending(store, entry.campaign, entry.baker)?.attempt === entry.attempt) {
    clearPending(store, entry.campaign, entry.baker);
  }
}

/** What the chain shows now, for the record's campaign and wallet. */
export type ChainNow = {
  /** The wallet's entry total now (both sides), 0 before its first entry. */
  entryTotal: bigint;
  /** The finalized block height: past the deadline, the transaction can no longer land. */
  blockHeight: bigint;
  /** The signature's status, when the wallet returned one: landed or failed (both confirmed), or not seen. */
  status: "landed" | "failed" | null;
};

export type PendingVerdict = "landed" | "failed" | "not-landed" | "wait";

/**
 * The guard's rule. A signature's confirmed status decides when the wallet returned one (another entry may move the
 * total while this one fails); without a signature, the entry total is the only witness. Past the deadline nothing can
 * land any more: a moved total then counts as landed.
 */
export function decidePending(entry: PendingEntry, now: ChainNow): PendingVerdict {
  if (now.status === "landed") return "landed";
  if (now.status === "failed") return "failed";
  const moved = now.entryTotal !== BigInt(entry.expectedEntryTotal);
  if (entry.signature === null && moved) return "landed";
  if (now.blockHeight > BigInt(entry.deadline)) return moved ? "landed" : "not-landed";
  return "wait";
}

/** The `expected_entry_total` the next attempt must pass: the saved one while a record is kept, else none. */
export const guardedTotal = (entry: PendingEntry | null): bigint | undefined =>
  entry ? BigInt(entry.expectedEntryTotal) : undefined;

/** A changed total now means an earlier attempt landed (rather than another entry of this wallet). */
export const retrying = (entry: PendingEntry | null): boolean =>
  entry !== null && (entry.handedBefore || entry.state !== "refused");

/** How long a settled record (refused, expired) is kept: long past any blockhash's life of about a minute. */
export const KEEP_SETTLED_MS = 24 * 60 * 60 * 1_000;

/**
 * Deletes this browser's settled records older than a day (privacy: the wallet, the campaign, the side and the amount
 * of an attempt stay only while they can matter). An unresolved record is kept until a watch settles it.
 */
export function pruneSettled(
  local: (KeyValueStore & { key(i: number): string | null; length: number }) | null,
  now: number,
): void {
  try {
    if (!local) return;
    const stale: string[] = [];
    for (let i = 0; i < local.length; i++) {
      const key = local.key(i);
      if (!key?.startsWith("brot-pending-entry:")) continue;
      const record = JSON.parse(local.getItem(key) ?? "null") as Partial<PendingEntry> | null;
      const settled = record?.state === "refused" || record?.state === "expired";
      if (!record || (settled && now - (record.savedAt ?? 0) > KEEP_SETTLED_MS)) stale.push(key);
    }
    stale.forEach((key) => local.removeItem(key));
  } catch {
    // A store that refuses to be read holds nothing to prune.
  }
}

/** A new attempt id: the device's time and a random part (an id, never a decision, A-7). */
export const newAttempt = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
