/**
 * Purpose: the evidence table `feed_history` (A-4; TP §3.5 "Evidence tables", §4; Sprint 08 DoD "Evidence and
 *          snapshots"): every update of the sponsored Pyth account of each feed with a price campaign whose result is
 *          not final yet (open, in review or contested), the account the program reads. Read at `finalized` through
 *          `getMultipleAccounts` (100 a call), decoded by the SDK (`readPriceUpdate`: owner, layout, feed and full
 *          verification checked; anything else is refused and named, never stored), kept once per publish time
 *          (`INSERT OR IGNORE`). It judges a void inside the review window and is the reference for T8. RPC cannot
 *          rebuild it, so the rebuild never writes it and the nightly snapshot (snapshot.ts) carries it.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 *
 * Cadence: one read every INDEXER_FEED_POLL_MS (15 s by default) sees every devnet update, since devnet rewrites the
 * sponsored account every 62 to 64 s (knowledge-base/tecnologia/pyth-leitor-de-preco.md); mainnet rewrites it every
 * 5 to 11 s, so 15 s misses some there: Sprint 18 sizes the read, or subscribes to the accounts.
 */
import { address, getBase64Encoder } from "@solana/kit";
import { isRefusal, readPriceUpdate, sponsoredPriceAddress, type SolanaRpc } from "@brot/sdk/read";

import type { Store } from "./db/store";

export type FeedReport = {
  /** Feeds with a price campaign not final yet. */
  feeds: number;
  /** New updates written. */
  written: number;
  /** Feeds whose account was refused this time, by the reason's name. */
  refused: string[];
};

const BATCH = 100;

/** The feeds (hex ids) of price campaigns whose account exists and whose result is not final. */
export const watchedFeeds = (store: Store): string[] =>
  (
    store.db
      .query(
        `SELECT DISTINCT feed_id FROM campaigns
         WHERE kind = 'PriceTouch' AND closed = 0 AND status IN ('Open', 'InReview', 'Contested') ORDER BY feed_id`,
      )
      .all() as { feed_id: string }[]
  ).map((r) => r.feed_id);

export function createFeedRecorder(rpc: SolanaRpc, store: Store, timeoutMs: number) {
  const accounts = new Map<string, string>();
  const insert = store.db.prepare(
    `INSERT OR IGNORE INTO feed_history (feed_account, publish_time, price, conf, exponent, posted_slot)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const accountOf = async (feed: string) =>
    accounts.get(feed) ?? accounts.set(feed, (await sponsoredPriceAddress(feed)).toString()).get(feed)!;

  return {
    /** One read of every watched feed's sponsored account; a failed call throws, and nothing is written for it. */
    async record(): Promise<FeedReport> {
      const feeds = watchedFeeds(store);
      const report: FeedReport = { feeds: feeds.length, written: 0, refused: [] };
      for (let i = 0; i < feeds.length; i += BATCH) {
        const slice = feeds.slice(i, i + BATCH);
        const at = await Promise.all(slice.map(accountOf));
        const { value } = await rpc
          .getMultipleAccounts(
            at.map((a) => address(a)),
            { encoding: "base64", commitment: "finalized" },
          )
          .send({ abortSignal: AbortSignal.timeout(timeoutMs) });
        store.tx(() =>
          value.forEach((account, j) => {
            if (!account) return void report.refused.push("Missing");
            try {
              const data = new Uint8Array(getBase64Encoder().encode(account.data[0]));
              const r = readPriceUpdate(account.owner, data, slice[j]);
              const time = Number(r.publishTime);
              const [price, conf, slot] = [r.price.toString(), r.conf.toString(), Number(r.postedSlot)];
              report.written += insert.run(at[j], time, price, conf, r.exponent, slot).changes;
            } catch (caught) {
              report.refused.push(isRefusal(caught) ? caught.errorName : "Undecodable");
            }
          }),
        );
      }
      return report;
    },
  };
}
