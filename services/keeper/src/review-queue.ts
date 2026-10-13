/**
 * Purpose: the review queue, one JSON line per entry, appended to a file the keeper owns. A second-read mismatch
 *          lands here so that a person looks at it (T22). Entries carry the campaign's public address and a
 *          reason, never an RPC URL, a key or a secret. The file is created 0600.
 * Version: 0.2.0 (Sprint 07 carry-over: the unchecked reason, the kind, which RPC answered)
 * Sprint:  07 (standby keeper and watchdog)
 */
import { appendFile } from "node:fs/promises";

export type ReviewEntry = {
  at: string;
  campaign: string;
  /** A disagreement, or (near the window's end) a resolution the second read could not check. */
  reason: "second_read_mismatch" | "second_read_unchecked";
  primarySlot: string | null;
  detail: string;
  /** The campaign's reader kind, by name. */
  kind?: string;
  /** The origin of the RPC that answered the second read (never its path or key), and whether it is the primary's. */
  answeredBy?: string;
  sameProvider?: boolean;
  /** A price campaign's proof slot, as the event recorded it. */
  postedSlot?: string | null;
};

const appendLine = (path: string, line: string) => appendFile(path, line, { mode: 0o600 });

/** Appends one entry as one JSON line; `write` is replaceable so tests need no disk. */
export async function appendReview(
  path: string,
  entry: ReviewEntry,
  write: (path: string, line: string) => Promise<void> = appendLine,
): Promise<void> {
  await write(path, `${JSON.stringify(entry)}\n`);
}
