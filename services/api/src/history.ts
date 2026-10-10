/**
 * Purpose: the program's own history, read for the leaderboard (Sprint 13) until Sprint 08's indexer exists: every
 *          signature of the program through `getSignaturesForAddress` at `finalized`, newest first and paged back to
 *          the first one, then each landed transaction through `getTransaction`, decoded by the SDK under its four
 *          decoder rules. Only the events the points rule reads are kept, each once. In memory: a restart reads the
 *          history again, and nothing about a visitor is ever stored.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 *
 * Incremental: a refresh asks only for signatures newer than the newest one read (`until`), paging back until it
 * meets it, so a burst cannot leave a hidden gap. At most `perRefresh` transactions are fetched per refresh, four at a
 * time; the rest, and any that did not read back, wait for the next refresh, and `complete` says so.
 */
import { signature as toSignature, type Signature } from "@solana/kit";
import {
  decodeTransactionEvents,
  PROGRAM_ID,
  uniqueEvents,
  type DecodedEvent,
  type RpcTransaction,
  type SolanaRpc,
} from "@brot/sdk/read";

/** The events the points rule reads (`pointsTable`, `finalResults`). */
const KEPT = new Set(["EntryAdded", "LateTallied", "CampaignResolved", "CampaignVoided", "CampaignFinalized"]);
const PAGE = 1_000;
const AT_ONCE = 4;
const TX = { encoding: "json", maxSupportedTransactionVersion: 0, commitment: "finalized" } as const;

export type History = {
  /** The kept events, oldest first, each once. */
  events(): readonly DecodedEvent[];
  /** True once every listed transaction was read: nothing waits for a later refresh. */
  complete(): boolean;
  /** At least one refresh finished. */
  ready(): boolean;
  refresh(): Promise<void>;
};

const bySlot = (a: DecodedEvent, b: DecodedEvent) =>
  a.slot !== b.slot ? (a.slot < b.slot ? -1 : 1) : a.key.ixIndex - b.key.ixIndex || a.key.innerIndex - b.key.innerIndex;

/** Every signature newer than `until` (all of them when it is null), newest first. */
async function newer(rpc: SolanaRpc, until: string | null) {
  const listed: { signature: string; err: unknown }[] = [];
  let before: Signature | undefined;
  for (;;) {
    const config = { limit: PAGE, commitment: "finalized" as const, ...(before ? { before } : {}) };
    const page = await rpc
      .getSignaturesForAddress(PROGRAM_ID, until ? { ...config, until: toSignature(until) } : config)
      .send();
    listed.push(...page.map((s) => ({ signature: s.signature as string, err: s.err })));
    if (page.length < PAGE) return listed;
    before = page[page.length - 1].signature;
  }
}

async function eventsOf(rpc: SolanaRpc, signature: string): Promise<DecodedEvent[] | null> {
  try {
    const tx = await rpc.getTransaction(toSignature(signature), TX).send();
    return tx ? decodeTransactionEvents(tx as unknown as RpcTransaction).filter((e) => KEPT.has(e.name)) : null;
  } catch {
    return null;
  }
}

export function createHistory(rpc: SolanaRpc, options: { perRefresh?: number } = {}): History {
  const perRefresh = options.perRefresh ?? 200;
  let events: DecodedEvent[] = [];
  let newest: string | null = null;
  let pending: string[] = []; // oldest first: listed and landed, not read yet
  let ready = false;
  return {
    events: () => events,
    complete: () => ready && pending.length === 0,
    ready: () => ready,
    async refresh() {
      const listed = await newer(rpc, newest);
      // Failed transactions carry no event. The newest listed is the next refresh's `until`, read or not.
      const landed = listed.filter((s) => s.err === null).map((s) => s.signature);
      pending = [...pending, ...landed.reverse()];
      if (listed.length > 0) newest = listed[0].signature;
      const batch = pending.slice(0, perRefresh);
      const found: DecodedEvent[] = [];
      const unread: string[] = [];
      for (let i = 0; i < batch.length; i += AT_ONCE) {
        const slice = batch.slice(i, i + AT_ONCE);
        const read = await Promise.all(slice.map((sig) => eventsOf(rpc, sig)));
        read.forEach((got, j) => (got === null ? unread.push(slice[j]) : found.push(...got)));
      }
      pending = [...unread, ...pending.slice(batch.length)];
      events = uniqueEvents([...events, ...found]).sort(bySlot);
      ready = true;
    },
  };
}
