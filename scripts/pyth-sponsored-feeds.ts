// Purpose: list which Pyth feeds have a shard-0 push account on devnet and mainnet, which of those stay fresh, how
//          often they update and who pays for the writes, read-only, against Pyth's documented sponsored list.
// Version: 0.0.3
// Sprint:  03 (readers and resolution)
//
// Usage:   bun run scripts/pyth-sponsored-feeds.ts [minutes=6] [seconds between snapshots=20] [devnet,mainnet]
// Every feed Hermes lists (no key needed) gets its shard-0 address; the existing accounts are read every few seconds:
// a feed is fresh when its publish_time moved inside the window, and its cadence is the median gap between the changes
// seen (no finer than the snapshot interval). The writer is the payer of the transaction in the account's posted_slot;
// under 1,000 signatures the oldest one created it. The sponsored list is the table Pyth's docs page embeds, never
// typed by hand. DEVNET_RPC_URL / MAINNET_RPC_URL override the endpoints. Findings: pyth-feeds-patrocinados.md.

import { MAX_TRANSACTION_VERSION } from "@brot/sdk/read";
import { Connection, PublicKey } from "@solana/web3.js";

type Cluster = "mainnet" | "devnet";
const RPC: Record<Cluster, string> = {
  mainnet: process.env.MAINNET_RPC_URL ?? "https://api.mainnet-beta.solana.com",
  devnet: process.env.DEVNET_RPC_URL ?? "https://api.devnet.solana.com",
};
const GENESIS: Record<Cluster, string> = {
  mainnet: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
  devnet: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG",
};
const PUSH_ORACLE = new PublicKey("pyt2F414BA6dPttK6RddPZUdHfapoBN24GL5wbrPCou");
const RECEIVER = "rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp";
const HERMES = "https://hermes.pyth.network/v2/price_feeds";
const DOCS = "https://docs.pyth.network/price-feeds/core/push-feeds/solana";

const minutes = Number(process.argv[2] ?? 6);
const everyMs = Number(process.argv[3] ?? 20) * 1000;
const clusters = (process.argv[4] ?? "devnet,mainnet").split(",") as Cluster[];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const median = (xs: number[]) => (xs.length ? [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]! : null);

/** Public endpoints answer 429 under load: wait and retry, from 2 s up to a minute, instead of failing the run. */
async function retry<T>(call: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await call();
    } catch (error) {
      if (attempt >= 6 || !/429|Too many|50[234]|timed? ?out|ECONNRESET|fetch failed/i.test(String(error))) throw error;
      await sleep(Math.min(60_000, 2_000 * 2 ** attempt));
    }
  }
}
/** getTransaction over raw JSON-RPC: web3.js 1.x cannot decode version-1 transactions, which mainnet now carries. */
async function transaction(cluster: Cluster, signature: string) {
  const params = [
    signature,
    { encoding: "json", maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION, commitment: "confirmed" },
  ];
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getTransaction", params });
  const json = await retry(async () => {
    const init = { method: "POST", headers: { "content-type": "application/json" }, body };
    const response = await fetch(RPC[cluster], init);
    if (!response.ok) throw new Error(`${response.status} getTransaction`);
    return (await response.json()) as { result?: any; error?: { code: number; message: string } };
  });
  if (json.error) throw new Error(`getTransaction ${json.error.code}: ${json.error.message}`);
  const logs: string[] = json.result?.meta?.logMessages ?? [];
  return {
    payer: json.result?.transaction?.message?.accountKeys?.[0] as string | undefined,
    pushed: logs.some((l) => l.startsWith(`Program ${PUSH_ORACLE.toBase58()} invoke`)),
  };
}

type Feed = { id: string; symbol: string; account: PublicKey };
/** Owner, size, verification byte, and the fields at the Full layout's offsets (a Partial one is reported, not read). */
function read(feed: Feed, owner: PublicKey, data: Buffer) {
  const full = data.length === 134 && data[40] === 1;
  return {
    owner: owner.toBase58(),
    length: data.length,
    level: data[40] ?? -1,
    feedOk: full && data.subarray(41, 73).toString("hex") === feed.id,
    writer: data.length >= 40 ? new PublicKey(data.subarray(8, 40)).toBase58() : "",
    publishTime: full ? Number(data.readBigInt64LE(93)) : 0,
    postedSlot: full ? Number(data.readBigUInt64LE(125)) : 0,
    // Pythnet's previous aggregate, not this account's previous write (expected: 1 s before publish_time).
    prevGap: full ? Number(data.readBigInt64LE(93) - data.readBigInt64LE(101)) : null,
  };
}
async function snapshot(connection: Connection, feeds: Feed[]) {
  const found = new Map<string, ReturnType<typeof read>>();
  for (let i = 0; i < feeds.length; i += 100) {
    const batch = feeds.slice(i, i + 100);
    const value = await retry(() => connection.getMultipleAccountsInfo(batch.map((f) => f.account)));
    batch.forEach((feed, j) => value[j] && found.set(feed.id, read(feed, value[j]!.owner, value[j]!.data)));
    await sleep(1000);
  }
  return { at: Math.floor(Date.now() / 1000), found };
}

type Snapshot = Awaited<ReturnType<typeof snapshot>>;
/** One existing account: layout, freshness over the window, cadence, and who wrote and created it. */
async function describe(cluster: Cluster, connection: Connection, feed: Feed, span: Snapshot[], seen: number[]) {
  const [first, last] = span as [Snapshot, Snapshot];
  const [a, b] = [first.found.get(feed.id)!, last.found.get(feed.id)!];
  const docs = docsById.get(feed.id);
  const all = await retry(() => connection.getSignaturesForAddress(feed.account, { limit: 1000 }));
  const ok = all.filter((s) => !s.err);
  // The pusher's own Wormhole transaction can share the slot of the write: look for the push among them.
  let writer: Awaited<ReturnType<typeof transaction>> | undefined;
  for (const s of ok.filter((s) => s.slot === b.postedSlot).slice(0, 3)) {
    writer = await transaction(cluster, s.signature);
    if (writer.pushed) break;
  }
  const oldest = all.length < 1000 ? ok[ok.length - 1] : undefined;
  const creator = oldest ? await transaction(cluster, oldest.signature) : undefined;
  return {
    symbol: feed.symbol,
    feedId: feed.id,
    account: feed.account.toBase58(),
    documented: docs ? `${docs.time_difference} s / ${docs.price_deviation}%` : false,
    layoutOk:
      b.owner === RECEIVER && b.length === 134 && b.level === 1 && b.feedOk && b.writer === feed.account.toBase58(),
    ageStartSeconds: first.at - a.publishTime,
    ageEndSeconds: last.at - b.publishTime,
    fresh: b.publishTime > a.publishTime,
    publishMinusPrevSeconds: b.prevGap,
    changesSeen: seen.length,
    medianSecondsBetweenChanges: median(seen.slice(1).map((t, i) => t - seen[i]!)),
    lastWrite: b.publishTime ? new Date(b.publishTime * 1000).toISOString() : null,
    lastWriterPayer: writer?.pushed ? writer.payer! : writer ? "no push in that slot" : "write not in last 1000",
    signatures: all.length === 1000 ? "1000+" : all.length,
    creatorPayer: creator ? `${creator.payer}${creator.pushed ? "" : " (not a push)"}` : "not reached (1000+)",
    created: oldest?.blockTime ? new Date(oldest.blockTime * 1000).toISOString() : null,
  };
}

// The sponsored list, from the table the docs page embeds (its rows carry the legacy-generation addresses).
const page = (await (await fetch(DOCS)).text()).replaceAll('\\"', '"');
const start = page.indexOf('{"feeds":[');
if (start < 0) throw new Error("the docs page no longer embeds its feed table; read it by hand");
let depth = 0;
let end = page.indexOf("[", start);
for (; end < page.length; end++) {
  if (page[end] === "[") depth++;
  if (page[end] === "]" && --depth === 0) break;
}
type Documented = { id: string; alias: string; time_difference: number; price_deviation: number };
const documented = JSON.parse(page.slice(page.indexOf("[", start), end + 1)) as Documented[];
const docsById = new Map(documented.map((f) => [f.id, f]));
const hermes = (await (await fetch(HERMES)).json()) as { id: string; attributes: { symbol?: string } }[];
const feeds: Feed[] = hermes.map((f) => ({
  id: f.id,
  symbol: f.attributes.symbol ?? "?",
  account: PublicKey.findProgramAddressSync([Buffer.from([0, 0]), Buffer.from(f.id, "hex")], PUSH_ORACLE)[0],
}));
const out: Record<string, unknown> = {
  at: new Date().toISOString(),
  hermesFeeds: feeds.length,
  documentedSponsored: documented.length,
  documentedNotInHermes: documented.filter((d) => !feeds.some((f) => f.id === d.id)).map((d) => d.alias),
  window: { minutes, secondsBetweenSnapshots: everyMs / 1000 },
};

for (const cluster of clusters) {
  const connection = new Connection(RPC[cluster], { commitment: "confirmed", disableRetryOnRateLimit: true });
  const genesis = await retry(() => connection.getGenesisHash());
  if (genesis !== GENESIS[cluster]) throw new Error(`the ${cluster} RPC answers for another cluster (${genesis})`);
  const first = await snapshot(connection, feeds);
  const existing = feeds.filter((f) => first.found.has(f.id));
  console.error(`${cluster}: ${existing.length} of ${feeds.length} shard-0 accounts exist; watching ${minutes} min`);
  const changes = new Map<string, number[]>(existing.map((f) => [f.id, []]));
  let last = first;
  for (const endAt = Date.now() + minutes * 60_000; Date.now() < endAt;) {
    await sleep(everyMs);
    const next = await snapshot(connection, existing);
    for (const feed of existing) {
      const [a, b] = [last.found.get(feed.id), next.found.get(feed.id)];
      if (a && b && b.publishTime > a.publishTime) changes.get(feed.id)!.push(b.publishTime);
      if (!b && a) next.found.set(feed.id, a);
    }
    last = next;
  }
  const rows: Awaited<ReturnType<typeof describe>>[] = [];
  for (const feed of existing) {
    rows.push(await describe(cluster, connection, feed, [first, last], changes.get(feed.id)!));
    await sleep(800);
  }
  const payers = (documentedOnly: boolean) => {
    const tally: Record<string, number> = {};
    for (const r of rows.filter((r) => Boolean(r.documented) === documentedOnly)) {
      tally[r.lastWriterPayer] = (tally[r.lastWriterPayer] ?? 0) + 1;
    }
    return tally;
  };
  out[cluster] = {
    firstSnapshot: new Date(first.at * 1000).toISOString(),
    lastSnapshot: new Date(last.at * 1000).toISOString(),
    exist: rows.length,
    documentedExist: rows.filter((r) => r.documented).length,
    documentedMissing: documented.filter((d) => !first.found.has(d.id)).map((d) => d.alias),
    freshDocumented: rows.filter((r) => r.fresh && r.documented).map((r) => r.symbol),
    freshUndocumented: rows.filter((r) => r.fresh && !r.documented).map((r) => r.symbol),
    lastWriterOfDocumented: payers(true),
    lastWriterOfUndocumented: payers(false),
    rows,
  };
}
console.log(JSON.stringify(out, null, 2));
process.exit(0);
