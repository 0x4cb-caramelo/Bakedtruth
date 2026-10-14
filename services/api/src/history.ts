/**
 * Purpose: the program's own history, read for the leaderboard (Sprint 13) until Sprint 08's indexer exists: every
 *          signature of the program through `getSignaturesForAddress` at `finalized`, newest first and paged back to
 *          the first one, then each landed transaction through `getTransaction`, decoded by the SDK under its four
 *          decoder rules. Only the events the points rule reads are kept, each once. In memory: a restart reads the
 *          history again, and nothing about a visitor is ever stored.
 * Version: 0.4.0 (Sprint 16, the review's F1: every transaction version the cluster serves, and one it cannot return
 *          in a version this client reads skipped at once and counted; 0.3.0, a 429 spends no try)
 * Sprint:  13 (site: ranking, notices and copy); the 429 fix after the 2026-10-13 release; 16
 *
 * Incremental: a refresh asks only for signatures newer than the newest one listed (`until`), paging back until a page
 * comes back empty, and remembers every signature listed, so a node that ignores `until` costs a re-listing but never a
 * second read. At most `perRefresh` transactions are fetched per refresh, four at a time; the rest wait for the next
 * refresh. One that does not read back goes to the back of the queue, and after `MAX_TRIES` it is skipped and counted.
 * A 429 is the node's rate limit, not the transaction's fault: it spends no try, the transaction keeps its place, and
 * the refresh reads nothing more. The public devnet RPC allows ten `getTransaction` per ten seconds per address
 * (`x-ratelimit-method-limit`); counted as tries, its 429s skipped 36 to 40 of the program's 70 transactions. Each
 * transaction is asked for up to the SDK's MAX_TRANSACTION_VERSION; one the node cannot return in it (-32015) is
 * skipped at once and counted: its events miss the board, which pays nothing (points are not money).
 */
import {
  isSolanaError,
  signature as toSignature,
  SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR,
  type Signature,
} from "@solana/kit";
import {
  decodeTransactionEvents,
  isUnsupportedVersion,
  MAX_TRANSACTION_VERSION,
  PROGRAM_ID,
  uniqueEvents,
  type DecodedEvent,
  type RpcTransaction,
  type SolanaRpc,
} from "@brot/sdk/read";

/** The events the points rule reads (`pointsTable`, `finalResults`); `CampaignOpened` splits a reused address. */
const KEPT = new Set([
  "CampaignOpened",
  "EntryAdded",
  "LateTallied",
  "CampaignResolved",
  "CampaignVoided",
  "CampaignFinalized",
]);
const PAGE = 1_000;
const AT_ONCE = 4;
const MAX_TRIES = 5;
const TX = {
  encoding: "json",
  maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION,
  commitment: "finalized",
} as const;

/** A 429: the node's rate limit, which says nothing about the transaction asked for. */
const throttled = (error: unknown) =>
  isSolanaError(error, SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR) && error.context.statusCode === 429;

export type HistoryOptions = { perRefresh?: number; timeoutMs?: number };

export type History = {
  /** The kept events in chain order (the order the program's signatures were listed, oldest first), each once. */
  events(): readonly DecodedEvent[];
  /** Grows by one each time `events()` changes, so a reader can keep what it computed from them. */
  version(): number;
  /** True once every listed transaction was read (or skipped) and the last refresh did not fail. */
  complete(): boolean;
  /** Transactions listed that never read back, after `MAX_TRIES`. */
  skipped(): number;
  /** At least one refresh finished. */
  ready(): boolean;
  refresh(): Promise<void>;
};

export function createHistory(rpc: SolanaRpc, options: HistoryOptions = {}): History {
  const perRefresh = options.perRefresh ?? 200;
  const timeoutMs = options.timeoutMs ?? 20_000;
  const send = () => ({ abortSignal: AbortSignal.timeout(timeoutMs) });
  let events: DecodedEvent[] = [];
  let version = 0;
  let newest: string | null = null;
  const listed = new Set<string>(); // every signature ever listed, landed or failed
  let pending: string[] = []; // landed and listed, not read yet, oldest first
  const tries = new Map<string, number>();
  // Each signature's place in the chain, oldest first: the listing's order. Events are sorted by it, never by slot
  // alone, since many transactions share a slot and their events' instruction indexes say nothing about each other.
  const place = new Map<string, number>();
  let placed = 0;
  const inChain = (a: DecodedEvent, b: DecodedEvent) =>
    (place.get(a.key.signature) ?? 0) - (place.get(b.key.signature) ?? 0) ||
    a.key.ixIndex - b.key.ixIndex ||
    a.key.innerIndex - b.key.innerIndex;
  let skipped = 0;
  let ready = false;
  let failed = false;

  /** Every signature newer than `until` (all of them when it is null), newest first, paged until an empty page. */
  async function newer(until: string | null) {
    const found: { signature: string; err: unknown }[] = [];
    let before: Signature | undefined;
    for (;;) {
      const config = { limit: PAGE, commitment: "finalized" as const, ...(before ? { before } : {}) };
      const page = await rpc
        .getSignaturesForAddress(PROGRAM_ID, until ? { ...config, until: toSignature(until) } : config)
        .send(send());
      if (page.length === 0) return found;
      found.push(...page.map((s) => ({ signature: s.signature as string, err: s.err })));
      before = page[page.length - 1].signature;
    }
  }

  /** The kept events of `sig`; `null` when it did not read back; "throttled" or "unreadable" (-32015) when refused. */
  async function eventsOf(sig: string): Promise<DecodedEvent[] | null | "throttled" | "unreadable"> {
    try {
      const tx = await rpc.getTransaction(toSignature(sig), TX).send(send());
      return tx ? decodeTransactionEvents(tx as unknown as RpcTransaction).filter((e) => KEPT.has(e.name)) : null;
    } catch (error) {
      return throttled(error) ? "throttled" : isUnsupportedVersion(error) ? "unreadable" : null;
    }
  }

  return {
    events: () => events,
    version: () => version,
    complete: () => ready && !failed && pending.length === 0,
    skipped: () => skipped,
    ready: () => ready,
    async refresh() {
      let fresh: { signature: string; err: unknown }[];
      try {
        fresh = (await newer(newest)).filter((s) => !listed.has(s.signature));
      } catch (error) {
        failed = true;
        throw error;
      }
      failed = false;
      for (const s of fresh) listed.add(s.signature);
      for (const s of [...fresh].reverse()) place.set(s.signature, placed++);
      if (fresh.length > 0) newest = fresh[0].signature;
      // Failed transactions carry no event; the rest are read oldest first.
      pending.push(
        ...fresh
          .filter((s) => s.err === null)
          .map((s) => s.signature)
          .reverse(),
      );
      const batch = pending.slice(0, perRefresh);
      const found: DecodedEvent[] = [];
      const again: string[] = [];
      const waiting: string[] = []; // refused by the node's rate limit, or not asked after a refusal
      for (let i = 0; i < batch.length && waiting.length === 0; i += AT_ONCE) {
        const slice = batch.slice(i, i + AT_ONCE);
        const read = await Promise.all(slice.map(eventsOf));
        read.forEach((got, j) => {
          const sig = slice[j];
          if (got === "throttled") return void waiting.push(sig);
          if (got === "unreadable") return void (skipped++, tries.delete(sig)); // no try can read it: never a stop
          if (got !== null) return void (found.push(...got), tries.delete(sig));
          const n = (tries.get(sig) ?? 0) + 1;
          if (n >= MAX_TRIES) return void (skipped++, tries.delete(sig));
          tries.set(sig, n);
          again.push(sig);
        });
        if (waiting.length > 0) waiting.push(...batch.slice(i + AT_ONCE));
      }
      // What the node refused keeps its place, untried; what did not read back waits behind everything else, so it
      // never blocks the queue.
      pending = [...waiting, ...pending.slice(batch.length), ...again];
      if (found.length > 0) {
        events = uniqueEvents([...events, ...found]).sort(inChain);
        version++;
      }
      ready = true;
    },
  };
}
