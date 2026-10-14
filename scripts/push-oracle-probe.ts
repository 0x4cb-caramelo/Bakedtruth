// Purpose: probe Pyth's push oracle read-only: watch that the sponsored SOL/USD and BTC/USD accounts only move forward
//          on devnet and mainnet, and scan its recent transactions for failures, skipped updates and who pays.
// Version: 0.0.3
// Sprint:  03 (readers and resolution)
//
// Usage:   bun run scripts/push-oracle-probe.ts watch [minutes=12] [seconds between polls=3]
//          bun run scripts/push-oracle-probe.ts scan devnet|mainnet [transactions per account=60] [oracle pages=5]
// DEVNET_RPC_URL and MAINNET_RPC_URL override the public endpoints. Reads only, about one request a second per
// cluster. Findings: knowledge-base/tecnologia/pyth-leitor-de-preco.md, section "Sprint 03".

import { MAX_TRANSACTION_VERSION } from "@brot/sdk/read";
import { Connection, PublicKey, type ConfirmedSignatureInfo } from "@solana/web3.js";

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
const FEEDS: Record<string, PublicKey> = {
  "SOL/USD": new PublicKey("7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE"),
  "BTC/USD": new PublicKey("APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5"),
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const tally = (into: Record<string, number>, key: string) => (into[key] = (into[key] ?? 0) + 1);
function stats(values: number[]) {
  const s = [...values].sort((a, b) => a - b);
  const q = (p: number) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return { n: s.length, min: s[0], median: q(0.5), p95: q(0.95), max: s[s.length - 1] };
}
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
  return {
    payer: (json.result?.transaction?.message?.accountKeys?.[0] ?? "unknown") as string,
    logs: (json.result?.meta?.logMessages ?? []) as string[],
  };
}
/** A Full `PriceUpdateV2` (134 bytes; a Partial one shifts every later field by one byte and is not read). */
function readUpdate(data: Buffer) {
  if (data.length !== 134 || data[40] !== 1) return null;
  return {
    writeAuthority: new PublicKey(data.subarray(8, 40)).toBase58(),
    publishTime: Number(data.readBigInt64LE(93)),
    postedSlot: Number(data.readBigUInt64LE(125)),
  };
}
async function connect(cluster: Cluster) {
  const connection = new Connection(RPC[cluster], { commitment: "confirmed", disableRetryOnRateLimit: true });
  const genesis = await retry(() => connection.getGenesisHash());
  if (genesis !== GENESIS[cluster]) throw new Error(`the ${cluster} RPC answers for another cluster (${genesis})`);
  return connection;
}

async function watch(minutes: number, intervalMs: number) {
  const connections = { devnet: await connect("devnet"), mainnet: await connect("mainnet") };
  const blank = () => ({ polls: 0, regressions: 0, changes: [] as number[], slotSteps: [] as number[] });
  type Track = ReturnType<typeof blank> & {
    ages: number[];
    writers: Set<string>;
    last?: ReturnType<typeof readUpdate>;
  };
  const tracks: Record<string, Track> = {};
  const contextSlot: Record<Cluster, number> = { devnet: 0, mainnet: 0 };
  const behind: Record<Cluster, number> = { devnet: 0, mainnet: 0 };
  const startedAt = new Date().toISOString();
  for (const endAt = Date.now() + minutes * 60_000; Date.now() < endAt;) {
    const sent = Date.now();
    for (const cluster of ["devnet", "mainnet"] as const) {
      try {
        // minContextSlot keeps a lagging node behind the load balancer from serving an older state.
        const { context, value } = await retry(() =>
          connections[cluster].getMultipleAccountsInfoAndContext(Object.values(FEEDS), {
            commitment: "confirmed",
            minContextSlot: contextSlot[cluster],
          }),
        );
        contextSlot[cluster] = context.slot;
        Object.keys(FEEDS).forEach((symbol, i) => {
          const key = `${cluster} ${symbol}`;
          const t = (tracks[key] ??= { ...blank(), ages: [], writers: new Set() });
          const update = value[i] ? readUpdate(value[i]!.data) : null;
          if (!update) throw new Error(`${key}: missing or not a Full PriceUpdateV2`);
          t.polls++;
          t.ages.push(Math.round(Date.now() / 1000 - update.publishTime));
          t.writers.add(update.writeAuthority);
          const last = t.last;
          if (last && (update.publishTime < last.publishTime || update.postedSlot < last.postedSlot)) t.regressions++;
          if (last && update.publishTime > last.publishTime) {
            t.changes.push(update.publishTime - last.publishTime);
            t.slotSteps.push(update.postedSlot - last.postedSlot);
          }
          if (!last || update.publishTime >= last.publishTime) t.last = update;
        });
      } catch (error) {
        if (!String(error).includes("Minimum context slot")) throw error;
        behind[cluster]++;
      }
    }
    await sleep(Math.max(0, intervalMs - (Date.now() - sent)));
  }
  const summary = Object.fromEntries(
    Object.entries(tracks).map(([key, t]) => [
      key,
      {
        polls: t.polls,
        regressions: t.regressions,
        lastPublishTime: t.last?.publishTime,
        lastPostedSlot: t.last?.postedSlot,
        updatesSeen: t.changes.length,
        secondsBetweenSeenUpdates: stats(t.changes),
        slotsBetweenSeenUpdates: stats(t.slotSteps),
        ageAtPollSeconds: stats(t.ages),
        writeAuthorities: [...t.writers],
      },
    ]),
  );
  console.log(JSON.stringify({ startedAt, endedAt: new Date().toISOString(), behind, summary }, null, 2));
}

async function scan(cluster: Cluster, perAccount: number, pages: number) {
  const connection = await connect(cluster);
  const span = (all: ConfirmedSignatureInfo[]) => ({
    signatures: all.length,
    failed: all.filter((s) => s.err).length,
    from: new Date((all[all.length - 1]?.blockTime ?? 0) * 1000).toISOString(),
    to: new Date((all[0]?.blockTime ?? 0) * 1000).toISOString(),
  });
  // 1. The push oracle's last `pages` thousand transactions: how many failed, and with which errors.
  const oracleSigs: ConfirmedSignatureInfo[] = [];
  for (let page = 0; page < pages; page++) {
    const before = oracleSigs[oracleSigs.length - 1]?.signature;
    const next = await retry(() => connection.getSignaturesForAddress(PUSH_ORACLE, { limit: 1000, before }));
    oracleSigs.push(...next);
    if (next.length < 1000) break;
    await sleep(1500);
  }
  const [errorKinds, errorLogs]: Record<string, number>[] = [{}, {}];
  const failed = oracleSigs.filter((s) => s.err);
  for (const s of failed) tally(errorKinds, JSON.stringify(s.err));
  for (const s of failed.slice(0, 25)) {
    await sleep(1000);
    const { logs } = await transaction(cluster, s.signature);
    const line = logs.find((l) => /Error Code|custom program error|failed:/.test(l)) ?? "no log";
    tally(errorLogs, line.replace(/\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g, "<address>").slice(0, 160));
  }
  // 2. The sponsored accounts: who signs, and whether each push wrote or was skipped as not newer.
  const accounts: Record<string, unknown> = {};
  for (const [symbol, account] of Object.entries(FEEDS)) {
    await sleep(1500);
    const all = await retry(() => connection.getSignaturesForAddress(account, { limit: 1000 }));
    const ok = all.filter((s) => !s.err);
    const byPayer: Record<string, Record<string, number>> = {};
    const otherPrograms: Record<string, number> = {};
    const step = Math.max(1, Math.floor(ok.length / perAccount));
    for (let i = 0; i < ok.length && i / step < perAccount; i += step) {
      await sleep(1000);
      const { payer, logs } = await transaction(cluster, ok[i]!.signature);
      const pushed = logs.some((l) => l.startsWith(`Program ${PUSH_ORACLE.toBase58()} invoke`));
      const wrote = logs.some((l) => l.startsWith(`Program ${RECEIVER} invoke [2]`));
      const outcome = !pushed ? "other (no push-oracle call)" : wrote ? "written" : "skipped (not newer)";
      tally((byPayer[payer] ??= {}), outcome);
      if (!pushed) for (const l of logs.filter((l) => / invoke \[1\]$/.test(l))) tally(otherPrograms, l.split(" ")[1]!);
    }
    accounts[symbol] = { ...span(all), fetched: Math.min(ok.length, perAccount), byPayer, otherPrograms };
  }
  const pushOracle = { ...span(oracleSigs), errorKinds, errorLogs };
  console.log(JSON.stringify({ cluster, at: new Date().toISOString(), pushOracle, accounts }, null, 2));
}

const [mode, a, b, c] = process.argv.slice(2);
if (mode === "watch") await watch(Number(a ?? 12), Number(b ?? 3) * 1000);
else if (mode === "scan" && (a === "devnet" || a === "mainnet")) await scan(a, Number(b ?? 60), Number(c ?? 5));
else throw new Error("usage: push-oracle-probe.ts watch [minutes] [seconds] | scan devnet|mainnet [count] [pages]");
process.exit(0);
