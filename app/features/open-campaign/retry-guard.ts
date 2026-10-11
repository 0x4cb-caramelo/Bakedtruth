/**
 * Purpose: the opening's retry guard (T17, A-9; TP §3.4.10 row 10). The campaign's id is a random u64 drawn once and
 *          saved in this browser before the wallet sees the transaction; every rebuilt transaction reuses it, so a
 *          second send fails on the existing `Campaign` (`AlreadyInitialized`) instead of charging US$500 twice. On a
 *          return without an answer the record says what to wait for: the opening landed once the campaign at its id
 *          exists with this wallet as creator; it can no longer land once the finalized block height passed the
 *          deadline with no campaign there; until then, wait. A landed opening's record is cleared, so the next opening
 *          draws a new id.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 *
 * The store is entry/retry-guard.ts's: this page's memory, mirrored to localStorage when the browser allows it. Nothing
 * here leaves the browser; a settled record is deleted after a day (`pruneSettledOpenings`).
 */
import { KEEP_SETTLED_MS, newAttempt, type KeyValueStore } from "../entry/retry-guard";

/** "drawn": the id is saved, nothing handed over yet; "handed": the wallet has it, answer unknown; "refused": provably not sent. */
export type OpeningState = "drawn" | "handed" | "refused" | "expired";

export type PendingOpening = {
  v: 1;
  /** One hand-off to the wallet; a new attempt gets a new attempt id but keeps the campaign id. */
  attempt: string;
  /** The campaign's id, decimal (JSON has no bigint). */
  id: string;
  creator: string;
  /** The heights to wait past, decimal; zero until the first hand-off. */
  lastValidBlockHeight: string;
  deadline: string;
  signature: string | null;
  state: OpeningState;
  /** The device's clock, for display and pruning only; nothing is decided by it (A-7). */
  savedAt: number;
};

export const openingKey = (creator: string) => `brot-pending-open:${creator}`;
const DIGITS = /^\d{1,20}$/;
const U64_MAX = (1n << 64n) - 1n;

/** The record for this wallet, or `null` when there is none or it does not parse as one. */
export function loadOpening(store: KeyValueStore | null, creator: string): PendingOpening | null {
  try {
    const raw = store?.getItem(openingKey(creator));
    if (!raw) return null;
    const p = JSON.parse(raw) as PendingOpening;
    const fine =
      p.v === 1 &&
      typeof p.attempt === "string" &&
      p.creator === creator &&
      [p.id, p.lastValidBlockHeight, p.deadline].every((n) => typeof n === "string" && DIGITS.test(n)) &&
      BigInt(p.id) <= U64_MAX &&
      (p.signature === null || typeof p.signature === "string") &&
      ["drawn", "handed", "refused", "expired"].includes(p.state);
    return fine ? p : null;
  } catch {
    return null;
  }
}

/** Writes the record; `false` when the store refused it. */
export function saveOpening(store: KeyValueStore | null, record: PendingOpening): boolean {
  try {
    store?.setItem(openingKey(record.creator), JSON.stringify(record));
    return store !== null;
  } catch {
    return false;
  }
}

export function clearOpening(store: KeyValueStore | null, creator: string): void {
  try {
    store?.removeItem(openingKey(creator));
  } catch {
    // A store that refuses a removal holds nothing to remove.
  }
}

/**
 * The id this wallet's next opening uses: the saved one while a record is kept (a rebuilt transaction reuses it), or
 * `draw()`'s, saved at once with state "drawn" before anything reaches the wallet.
 */
export function idFor(store: KeyValueStore | null, creator: string, draw: () => bigint): PendingOpening {
  const saved = loadOpening(store, creator);
  if (saved) return saved;
  const record: PendingOpening = {
    v: 1,
    attempt: newAttempt(),
    id: draw().toString(),
    creator,
    lastValidBlockHeight: "0",
    deadline: "0",
    signature: null,
    state: "drawn",
    savedAt: Date.now(),
  };
  saveOpening(store, record);
  return record;
}

/** The record of a hand-off: same id, a new attempt, the blockhash's last valid height. */
export const handedRecord = (record: PendingOpening, lastValid: bigint): PendingOpening => ({
  ...record,
  attempt: newAttempt(),
  lastValidBlockHeight: lastValid.toString(),
  deadline: lastValid.toString(),
  signature: null,
  state: "handed",
  savedAt: Date.now(),
});

/** Updates the record only while it still holds `record`'s attempt; a newer attempt's record is never touched. */
export function updateOpening(store: KeyValueStore | null, record: PendingOpening): void {
  const now = loadOpening(store, record.creator);
  if (!now || now.attempt === record.attempt) saveOpening(store, record);
}

/** What the chain shows now for the record's id. */
export type OpeningNow = {
  /** The creator stored in the campaign at the id, or `null` when no campaign is there. */
  campaignCreator: string | null;
  blockHeight: bigint;
  status: "landed" | "failed" | null;
};

export type OpeningVerdict = "landed" | "taken" | "failed" | "not-landed" | "wait";

/**
 * The guard's rule. The campaign at the id is the witness: there with this wallet as creator, the opening landed
 * (even when the wallet's own transaction failed as a retry, `AlreadyInitialized`); there with another creator, the id
 * is taken and a new one must be drawn. Without it, a failed status is a failure, and past the deadline nothing can
 * land any more.
 */
export function decideOpening(record: PendingOpening, now: OpeningNow): OpeningVerdict {
  if (now.campaignCreator === record.creator) return "landed";
  if (now.campaignCreator !== null) return "taken";
  if (now.status === "failed") return "failed";
  if (now.status === "landed") return "wait"; // seen landed before the campaign reads back: read again
  if (record.state !== "handed" || now.blockHeight > BigInt(record.deadline)) return "not-landed";
  return "wait";
}

/** Deletes this browser's settled opening records older than a day (privacy: they matter only while they guard). */
export function pruneSettledOpenings(
  local: (KeyValueStore & { key(i: number): string | null; length: number }) | null,
  now: number,
): void {
  try {
    if (!local) return;
    const stale: string[] = [];
    for (let i = 0; i < local.length; i++) {
      const key = local.key(i);
      if (!key?.startsWith("brot-pending-open:")) continue;
      const record = JSON.parse(local.getItem(key) ?? "null") as Partial<PendingOpening> | null;
      const settled = record?.state !== "handed";
      if (!record || (settled && now - (record.savedAt ?? 0) > KEEP_SETTLED_MS)) stale.push(key);
    }
    stale.forEach((key) => local.removeItem(key));
  } catch {
    // A store that refuses to be read holds nothing to prune.
  }
}
