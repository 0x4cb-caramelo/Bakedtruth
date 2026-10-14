/**
 * Purpose: the ingest (proposal §2.7; Sprint 08 DoD), the indexer's one writer. A refresh lists the program's new
 *          signatures at `finalized` back to the checkpoint (listing.ts), then reads the pending ones oldest first
 *          (`getTransaction`, JSON, up to the SDK's MAX_TRANSACTION_VERSION) and decodes their events with the SDK under
 *          its four decoder rules, lookup tables included. Each signature is one SQLite transaction: its events
 *          `INSERT OR IGNORE` on (signature, ix_index, inner_index), the projections of every campaign it touches
 *          (project.ts), and its own state, which is the processing checkpoint. A transaction the node answers null
 *          for holds the later ones, so the chain's order holds, until its tries run out; then it is skipped and
 *          counted. One the node cannot return in a version this client reads (-32015) is unreadable: skipped at once
 *          and counted, never a stop (the review's F1); its campaign's `seq` gap reads it once more per refresh. A
 *          call that fails (a timeout, a 429, a node down) only stops the refresh and is named: an outage never costs
 *          a try, so it never makes the indexer skip a transaction. A campaign whose `seq` has a gap gets its own
 *          signatures listed and read again, once per refresh until the gap closes (a skipped one gets one more read
 *          each time, and never holds the others again). Last, the points and the home page's order, from one live
 *          read (derived.ts). Nothing about a visitor is ever stored. Since Sprint 14, the referral tables are
 *          rewritten after each refresh (referral/project.ts); a failure there is named and stops nothing else.
 * Version: 0.4.0 (Sprint 16: every transaction version the cluster serves; an unreadable one is skipped and counted)
 * Sprint:  08 (indexer, API, relay and points); 14 (referral, lane L14R); 16 (the review's F1)
 */
import {
  decodeTransactionEvents,
  eventCampaign,
  eventSeq,
  PROGRAM_ID,
  type RpcTransaction,
  type SolanaRpc,
} from "@brot/sdk/read";

import type { Partner } from "@brot/sdk/schemas";

import { jsonOf, rawOf } from "./codec";
import type { Store } from "./db/store";
import { checkpointOf, keepListed, listNewer, type ListOptions } from "./listing";
import { liveReader, type ReadLive } from "./live";
import { refreshDerived } from "./derived";
import { gapIn, projectAddress } from "./project";
import { isFailed, isUnreadable, readTransaction } from "./read-tx";
import { refreshReferrals } from "./referral/project";

export type IngestOptions = Partial<ListOptions> & {
  maxTries?: number;
  atOnce?: number;
  readLive?: ReadLive;
  /** The launch partners the ranking highlights (content/partners.json), read before each ranking. */
  partners?: () => readonly Partner[];
};
export type IngestReport = {
  listed: number;
  processed: number;
  /** A transaction did not read back: the later ones wait for it. */
  waiting: boolean;
  skipped: number;
  /** Transactions the node cannot return in a version this client reads (-32015): skipped and counted (F1). */
  unreadable: number;
  /** Campaign addresses whose `seq` still has a gap after this refresh. */
  gaps: string[];
  /** The name of a read or a gap's listing that failed in this refresh (a timeout, a node error). */
  readError: string | null;
  /** The live read behind the points and the ranking failed: both stay as they were. */
  pointsError: string | null;
  /** A block position or the referral tables could not be read or rewritten (referral/project.ts). */
  referralError: string | null;
};

type Pending = { signature: string; slot: number; ord: number; tries: number };
const nameOf = (caught: unknown) => (caught instanceof Error ? caught.name : "Error");

export function createIngest(rpc: SolanaRpc, store: Store, options: IngestOptions = {}) {
  const list: ListOptions = { pageSize: options.pageSize ?? 1_000, timeoutMs: options.timeoutMs ?? 20_000 };
  const maxTries = options.maxTries ?? 5;
  const atOnce = options.atOnce ?? 4;
  const readLive = options.readLive ?? liveReader(rpc, list.timeoutMs);
  const partners = options.partners ?? (() => []);
  const insertEvent = store.db.prepare(
    `INSERT OR IGNORE INTO events (signature, ix_index, inner_index, slot, ord, block_time, name, campaign, seq, data,
       raw) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const read = (sig: string) => readTransaction(rpc, sig, list.timeoutMs);

  /** One signature's events, projections and state, together. Returns the campaigns it touched. */
  function write(p: Pending, tx: RpcTransaction): Set<string> {
    const events = decodeTransactionEvents(tx);
    const touched = new Set<string>();
    store.tx(() => {
      for (const e of events) {
        const campaign = eventCampaign(e);
        const seq = eventSeq(e);
        const [ix, inner] = [Number(e.key.ixIndex), Number(e.key.innerIndex)];
        const time = e.blockTime === null ? null : Number(e.blockTime);
        const raw = rawOf(tx, ix, inner);
        const n = seq === null ? null : Number(seq);
        insertEvent.run(p.signature, ix, inner, Number(e.slot), p.ord, time, e.name, campaign, n, jsonOf(e.data), raw);
        if (campaign !== null) touched.add(campaign);
      }
      store.db.run("UPDATE signatures SET state = 'done', tries = ? WHERE signature = ?", [p.tries, p.signature]);
      for (const at of touched) projectAddress(store, at);
    });
    return touched;
  }

  /** Reads and writes the pending signatures in chain order, `atOnce` reads in flight. */
  async function processPending(report: IngestReport, touched: Set<string>): Promise<void> {
    const pending = store.db
      .query("SELECT signature, slot, ord, tries FROM signatures WHERE state = 'pending' ORDER BY ord")
      .all() as Pending[];
    for (let i = 0; i < pending.length; i += atOnce) {
      const slice = pending.slice(i, i + atOnce);
      const read_ = await Promise.all(slice.map((p) => read(p.signature)));
      for (const [j, p] of slice.entries()) {
        const tx = read_[j];
        if (isUnreadable(tx)) {
          store.db.run("UPDATE signatures SET state = 'skipped' WHERE signature = ?", [p.signature]);
          report.unreadable += 1; // never a stop: the later ones are read
          continue;
        }
        if (isFailed(tx)) {
          report.readError = tx.failed; // the node did not answer: no try is spent, the refresh stops here
          report.waiting = true;
          return;
        }
        if (tx !== null) {
          for (const at of write(p, tx)) touched.add(at);
          report.processed += 1;
          continue;
        }
        const tries = p.tries + 1;
        if (tries >= maxTries) {
          store.db.run("UPDATE signatures SET state = 'skipped', tries = ? WHERE signature = ?", [tries, p.signature]);
          report.skipped += 1;
          continue;
        }
        store.db.run("UPDATE signatures SET tries = ? WHERE signature = ?", [tries, p.signature]);
        report.waiting = true;
        return;
      }
    }
  }

  /** A gap: the address's own signatures, listed whole; new ones are kept, skipped ones get one more read. */
  async function refetch(at: string): Promise<void> {
    const found = await listNewer(rpc, at, null, list);
    keepListed(store, found, null);
    const retry = store.db.prepare("UPDATE signatures SET state = 'pending' WHERE signature = ? AND state = 'skipped'");
    store.tx(() => {
      for (const s of found) retry.run(s.signature);
    });
  }

  /** Addresses with a gap, kept across refreshes; on the first refresh, every address the file holds is checked. */
  let gapped: Set<string> | null = null;
  const withGap = (addresses: Iterable<string>) => new Set([...addresses].filter((at) => gapIn(store, at)));

  return {
    async refresh(): Promise<IngestReport> {
      const report: IngestReport = {
        ...{ listed: 0, processed: 0, waiting: false, skipped: 0, unreadable: 0, gaps: [] },
        ...{ readError: null, pointsError: null, referralError: null },
      };
      gapped ??= withGap(
        (
          store.db.query("SELECT DISTINCT campaign FROM events WHERE campaign IS NOT NULL").all() as {
            campaign: string;
          }[]
        ).map((r) => r.campaign),
      );
      const fresh = await listNewer(rpc, PROGRAM_ID, checkpointOf(store, "program"), list);
      report.listed = keepListed(store, fresh, "program");
      const touched = new Set<string>();
      await processPending(report, touched);
      const toFix = withGap([...touched, ...gapped]);
      if (toFix.size > 0 && !report.waiting) {
        for (const at of toFix) await refetch(at).catch((caught: unknown) => void (report.readError = nameOf(caught)));
        await processPending(report, touched);
      }
      gapped = withGap([...touched, ...toFix]);
      report.gaps = [...gapped].sort();
      report.referralError = await refreshReferrals(rpc, store, list.timeoutMs);
      try {
        await refreshDerived(store, readLive, partners());
      } catch (caught) {
        report.pointsError = nameOf(caught);
      }
      return report;
    },
  };
}
