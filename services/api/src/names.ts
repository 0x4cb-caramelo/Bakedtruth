/**
 * Purpose: what /api/v1/names serves (TP §6; A-11; Sprint 08): the reviewed account names of
 *          content/account-names.json, checked by the SDK's `parseAccountNames` (the rules the site's creation box
 *          applies too), and the Pyth feeds the program lists, each with its sponsored price account. The file is read
 *          at start and again on every refresh, so a merged change applies without a restart; a missing file or one
 *          that breaks a rule keeps the last good list, and /api/v1/health names the error.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { existsSync, readFileSync } from "node:fs";
import { feedsOf, sponsoredPriceAddress } from "@brot/sdk/read";
import { parseAccountNames, type AccountName } from "@brot/sdk/schemas";

/** One listed Pyth feed: its id (hex), its symbol without Pyth's "Crypto." prefix, its sponsored account. */
export type FeedName = { feed_id: string; symbol: string; account: string };

export type Names = {
  names(): readonly AccountName[];
  feeds(): readonly FeedName[];
  /** The last read's error name ("NotFound" for a missing file), or null. */
  lastError(): string | null;
  refresh(): void;
};

/** The feeds of the program's devnet build (the API serves devnet and the local test chain, both on that list). */
export async function listedFeeds(): Promise<FeedName[]> {
  return Promise.all(
    feedsOf("devnet").map(async ([hex, symbol]) => ({
      feed_id: hex,
      symbol: symbol.replace(/^Crypto\./, ""),
      account: (await sponsoredPriceAddress(hex)).toString(),
    })),
  );
}

export async function createNames(file: string): Promise<Names> {
  const feeds = await listedFeeds();
  let names: readonly AccountName[] = [];
  let error: string | null = null;
  const refresh = () => {
    try {
      if (!existsSync(file)) {
        error = "NotFound";
        return;
      }
      names = parseAccountNames(readFileSync(file, "utf8"));
      error = null;
    } catch (caught) {
      error = caught instanceof Error ? caught.name : "Error";
    }
  };
  refresh();
  return { names: () => names, feeds: () => feeds, lastError: () => error, refresh };
}
