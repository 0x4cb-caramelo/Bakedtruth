/**
 * Purpose: the wallets left out of the public leaderboard at their owner's request (Sprint 13, the privacy review, TP
 *          §8.2 question 8): a JSON array of base58 addresses in a file on the server, outside the repository and
 *          never served, named by API_LEADERBOARD_HIDDEN. The team adds an address only after the wallet signs a
 *          message asking for it (services/api/README.md). Read again on every history refresh, so a change applies
 *          without a restart; a file that does not parse keeps the last good list and reports the error's name.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { existsSync, readFileSync } from "node:fs";

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export type Hidden = {
  /** The addresses left out of the ranking. */
  current(): ReadonlySet<string>;
  /** Grows by one each time the list changes. */
  version(): number;
  /** The last read's error name, or null. */
  lastError(): string | null;
  refresh(): void;
};

/** The addresses in `text`, or a thrown error naming the first entry that is not one. */
export function parseHidden(text: string): string[] {
  const list: unknown = JSON.parse(text);
  if (!Array.isArray(list)) throw new Error("the hidden list must be a JSON array of addresses");
  return list.map((entry, i) => {
    if (typeof entry !== "string" || !BASE58.test(entry)) throw new Error(`hidden[${i}] is not a base58 address`);
    return entry;
  });
}

/** `file` unset: nobody is hidden. A missing file is an empty list, so the variable can be set before anyone asks. */
export function createHidden(file: string | null): Hidden {
  let set: ReadonlySet<string> = new Set();
  let key = "";
  let version = 0;
  let error: string | null = null;
  return {
    current: () => set,
    version: () => version,
    lastError: () => error,
    refresh() {
      if (!file) return;
      try {
        const next = existsSync(file) ? parseHidden(readFileSync(file, "utf8")) : [];
        const nextKey = [...next].sort().join(",");
        if (nextKey !== key) {
          set = new Set(next);
          key = nextKey;
          version++;
        }
        error = null;
      } catch (caught) {
        error = caught instanceof Error ? caught.name : "Error";
      }
    },
  };
}
