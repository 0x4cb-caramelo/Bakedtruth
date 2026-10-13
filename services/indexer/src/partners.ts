/**
 * Purpose: the launch partners the indexer ranks and reports on (Sprint 08; TP §4 "Content files", P-3):
 *          content/partners.json, checked by the SDK's `parsePartners`, read at start and again before each refresh,
 *          so a merged change applies without a restart. A missing or broken file keeps the last good list and names
 *          the error (its name only: the message can quote the file); no file configured is an empty list.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { existsSync, readFileSync } from "node:fs";
import { parsePartners, type Partner } from "@brot/sdk/schemas";

export type Partners = {
  current(): readonly Partner[];
  /** The last read's error name ("NotFound" for a missing file), or null. */
  lastError(): string | null;
  refresh(): void;
};

export function createPartners(file: string | null): Partners {
  let list: readonly Partner[] = [];
  let error: string | null = null;
  const refresh = () => {
    if (file === null) return;
    try {
      if (!existsSync(file)) {
        error = "NotFound";
        return;
      }
      list = parsePartners(readFileSync(file, "utf8"));
      error = null;
    } catch (caught) {
      error = caught instanceof Error ? caught.name : "Error";
    }
  };
  refresh();
  return { current: () => list, lastError: () => error, refresh };
}

/** A fixed list, for a rebuild or a test. */
export const fixedPartners = (list: readonly Partner[]): Partners => ({
  current: () => list,
  lastError: () => null,
  refresh: () => {},
});
