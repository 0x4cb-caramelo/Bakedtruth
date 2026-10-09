// Purpose: measure a cluster's clock against wall time (slot length, the confirmed-to-finalized gap, the drift of the
//          Clock sysvar and, under Alpenglow, of the leader's nanosecond clock) and read the Alpenglow and slot-time
//          feature gates, read-only, for the retest of deadlines and of the 60 s proof window (TP 14.4, C12, C23).
// Version: 0.0.3
// Sprint:  03 (readers and resolution)
//
// Usage:   bun run scripts/devnet-clock-probe.ts [devnet|mainnet] [minutes=12] [seconds between polls=2]
// DEVNET_RPC_URL / MAINNET_RPC_URL override the endpoints. Reads only, about 1.5 requests a second and one slot
// subscription. Drift is the cluster's clock minus this machine's, so this machine must be synced by NTP.
// PROBE_RAW=<file> also writes every poll as a JSON line. Findings: knowledge-base/tecnologia/alpenglow-devnet.md.

import { appendFileSync } from "node:fs";
import { Connection, PublicKey } from "@solana/web3.js";

type Cluster = "mainnet" | "devnet";
const cluster = (process.argv[2] ?? "devnet") as Cluster;
const minutes = Number(process.argv[3] ?? 12);
const intervalMs = Number(process.argv[4] ?? 2) * 1000;
const RPC: Record<Cluster, string> = {
  mainnet: process.env.MAINNET_RPC_URL ?? "https://api.mainnet-beta.solana.com",
  devnet: process.env.DEVNET_RPC_URL ?? "https://api.devnet.solana.com",
};
const GENESIS: Record<Cluster, string> = {
  mainnet: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
  devnet: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG",
};
if (!(cluster in RPC)) throw new Error(`unknown cluster "${cluster}"`);

// Feature gates as declared in Agave master 5faf023 (2026-10-09), feature-set/src/lib.rs, and the key SIMD-0384 names.
const FEATURES: [string, string][] = [
  ["alpenglow (SIMD-0326)", "A1pengvuM6JEcyNuTnMqepBKhwHE3N6PmUrdATGawhJS"],
  ["key named in SIMD-0384 (not in Agave)", "a1penGLz8Vm2QHYB3JPefBiU4BY3Z6JkW2k3Scw5GWP"],
  ["alpenglow_fast_leader_handover", "FastLeaderHandover11111111111111111111111111"],
  ["validator_admission_ticket (SIMD-0357)", "VAT9huvhPjRN9cyrPytq9rwvEJ3J4ADtjdncgZRyANJ"],
  ["discard_unexpected_data_complete_shreds (SIMD-0337)", "disCA4efguFL6Wqa4pGdG7jpjC7C5uiKzKnhEBqchBe"],
  ["bls_pubkey_management_in_vote_account (SIMD-0387)", "AnAP9zPV4KL7czAPQbFhpDKV2tx7g4UGNbK9wvXwjaRo"],
  ["enable_bls12_381_syscall (SIMD-0388)", "b1sgUiJ3qu7hYm3tNDyyqZNQd6gLGJmJppnLNa93PCQ"],
  ["reduce_slot_time_to_350ms (SIMD-0525)", "iBRL5RuWhw4yqaAZu96RUULHckHTZAoe2b77qaV38JZ"],
  ["reduce_slot_time_to_300ms (SIMD-0525)", "iBRLL3k18HST852F1Mf3Lv83waTNQmmqvKDxvYGwQFL"],
  ["reduce_slot_time_to_250ms (SIMD-0525)", "iBRLMc81UjRa8fn8A6eE8bJTnRbgQoPTynM51akENCV"],
  ["reduce_slot_time_to_200ms (SIMD-0525)", "iBRLjhJnkmDZgNoZRDMW11d8ZV7HvsL3vAyRjZB5npW"],
];
const FEATURE_PROGRAM = "Feature111111111111111111111111111111111111";
const CLOCK = new PublicKey("SysvarC1ock11111111111111111111111111111111");
// Agave keeps the Alpenglow genesis certificate and the leader's nanosecond clock at PDAs of the alpenglow feature id
// (votor-messages/src/migration.rs and runtime/src/bank.rs): they exist only once a cluster runs Alpenglow.
const ALPENGLOW = new PublicKey(FEATURES[0]![1]);
const GENESIS_CERT = PublicKey.findProgramAddressSync([Buffer.from("carlgration")], ALPENGLOW)[0];
const NANO_CLOCK = PublicKey.findProgramAddressSync([Buffer.from("alpenclock")], ALPENGLOW)[0];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const r1 = (x: number) => Math.round(x * 10) / 10;
function stats(values: number[]) {
  const s = [...values].sort((a, b) => a - b);
  const q = (p: number) => r1(s[Math.min(s.length - 1, Math.floor(p * s.length))] ?? NaN);
  return { n: s.length, min: q(0), p5: q(0.05), median: q(0.5), p95: q(0.95), max: r1(s[s.length - 1] ?? NaN) };
}
/** Clock sysvar: slot, epoch_start_timestamp, epoch, leader_schedule_epoch, unix_timestamp (40 bytes). */
const readClock = (data: Buffer) => ({
  slot: Number(data.readBigUInt64LE(0)),
  epochStartTimestamp: Number(data.readBigInt64LE(8)),
  epoch: Number(data.readBigUInt64LE(16)),
  unixTimestamp: Number(data.readBigInt64LE(32)),
});
async function blockTimeAtOrAfter(slot: number): Promise<[number, number] | string> {
  try {
    const [first] = await connection.getBlocks(slot, slot + 50, "finalized");
    if (first === undefined) return `no block in ${slot}..${slot + 50}`;
    await sleep(250);
    const time = await connection.getBlockTime(first);
    return time === null ? `no time for ${first}` : [first, time];
  } catch (error) {
    return String(error).slice(0, 120);
  }
}

const connection = new Connection(RPC[cluster], "confirmed");
const genesis = await connection.getGenesisHash();
if (genesis !== GENESIS[cluster]) throw new Error(`the ${cluster} RPC answers for another cluster (${genesis})`);
const startedAt = new Date().toISOString();

// 1. Feature gates (a Feature account holds bincode Option<u64>: [1, slot LE] once active) and the Alpenglow PDAs.
const featureInfos = await connection.getMultipleAccountsInfo(FEATURES.map(([, id]) => new PublicKey(id)));
const features: Record<string, string> = {};
for (const [i, [name]] of FEATURES.entries()) {
  const info = featureInfos[i];
  if (!info) features[name] = "absent (never requested on this cluster)";
  else if (info.owner.toBase58() !== FEATURE_PROGRAM) features[name] = `unexpected owner ${info.owner.toBase58()}`;
  else if (info.data[0] !== 1) features[name] = "pending (requested, not yet active)";
  else {
    const slot = Number(info.data.readBigUInt64LE(1));
    await sleep(500);
    const time = await blockTimeAtOrAfter(slot);
    const date = Array.isArray(time) ? `, ${new Date(time[1] * 1000).toISOString()}` : "";
    features[name] = `active since slot ${slot}${date}`;
  }
}
const [cert, nano] = await connection.getMultipleAccountsInfo([GENESIS_CERT, NANO_CLOCK]);
const size = (account: { data: Buffer } | null) => (account ? `${account.data.length} bytes` : "absent");
const alpenglowAccounts = { [`certificate ${GENESIS_CERT}`]: size(cert), [`nano clock ${NANO_CLOCK}`]: size(nano) };

// 2. Per-minute samples the RPC node keeps (up to 720, about 12 hours), over raw JSON-RPC for the vote counts.
type Sample = { numSlots: number; samplePeriodSecs: number; numTransactions: number; numNonVoteTransactions: number };
const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getRecentPerformanceSamples", params: [720] });
const fetched = await fetch(RPC[cluster], { method: "POST", headers: { "content-type": "application/json" }, body });
const samples = ((await fetched.json()) as { result: Sample[] }).result.filter((s) => s.numSlots > 0);
const sampleMs = samples.map((s) => (s.samplePeriodSecs * 1000) / s.numSlots);
const performance = {
  minutes: samples.length,
  msPerSlot: stats(sampleMs),
  minutesBelow100ms: sampleMs.filter((ms) => ms < 100).length,
  minutesAbove500ms: sampleMs.filter((ms) => ms > 500).length,
  voteTransactionsPerSlot: stats(samples.map((s) => (s.numTransactions - s.numNonVoteTransactions) / s.numSlots)),
};

// 3. Long averages from the cluster's own clock: this epoch so far, then the last five whole epochs by block time.
const schedule = await connection.getEpochSchedule();
const clock0 = readClock((await connection.getAccountInfo(CLOCK, "finalized"))!.data);
const epochFirst = schedule.getFirstSlotInEpoch(clock0.epoch);
const currentMs = ((clock0.unixTimestamp - clock0.epochStartTimestamp) * 1000) / (clock0.slot - epochFirst);
const epochs: Record<string, string | number> = { [`${clock0.epoch} (current, Clock)`]: r1(currentMs) };
for (let epoch = clock0.epoch - 5; epoch < clock0.epoch; epoch++) {
  await sleep(1000);
  const start = await blockTimeAtOrAfter(schedule.getFirstSlotInEpoch(epoch));
  const end = await blockTimeAtOrAfter(schedule.getFirstSlotInEpoch(epoch + 1));
  epochs[String(epoch)] =
    Array.isArray(start) && Array.isArray(end)
      ? r1(((end[1] - start[1]) * 1000) / (end[0] - start[0]))
      : `unreadable: ${Array.isArray(start) ? end : start}`;
}

// 4. Polls: the processed Clock and nanosecond clock with the confirmed and finalized slots; every slot notification.
type Poll = { t: number; latency: number; processed: number; confirmed: number; finalized: number; unix: number };
const polls: (Poll & { nanoMs: number | null })[] = [];
const arrivals: { slot: number; t: number }[] = [];
const subscription = connection.onSlotChange((info) => arrivals.push({ slot: info.slot, t: Date.now() }));
let errors = 0;
for (const endAt = Date.now() + minutes * 60_000; Date.now() < endAt;) {
  const sent = Date.now();
  try {
    const [accounts, confirmed, finalized] = await Promise.all([
      connection.getMultipleAccountsInfo([CLOCK, NANO_CLOCK], "processed"),
      connection.getSlot("confirmed"),
      connection.getSlot("finalized"),
    ]);
    const got = Date.now();
    const clock = readClock(accounts[0]!.data);
    const nanos = accounts[1]?.data.length === 8 ? accounts[1].data.readBigInt64LE(0) : null;
    const nanoMs = nanos === null ? null : Number(nanos / 1_000_000n);
    const [t, unix] = [(sent + got) / 2, clock.unixTimestamp];
    polls.push({ t, latency: got - sent, processed: clock.slot, confirmed, finalized, unix, nanoMs });
    if (process.env.PROBE_RAW) appendFileSync(process.env.PROBE_RAW, `${JSON.stringify(polls.at(-1))}\n`);
    if (polls.length % 30 === 0) console.error(`${polls.length} polls, slot ${clock.slot}`);
  } catch {
    errors++;
  }
  await sleep(Math.max(0, intervalMs - (Date.now() - sent)));
}
await connection.removeSlotChangeListener(subscription);
/** Average ms per slot over every pair of polls at least `seconds` apart (each poll paired with the first such one). */
function windowed(seconds: number) {
  const out: number[] = [];
  for (let i = 0, j = 0; i < polls.length; i++) {
    while (j < polls.length && polls[j]!.t - polls[i]!.t < seconds * 1000) j++;
    if (j === polls.length) break;
    const slots = polls[j]!.processed - polls[i]!.processed;
    if (slots > 0) out.push((polls[j]!.t - polls[i]!.t) / slots);
  }
  return stats(out);
}
const [first, last] = [polls[0]!, polls.at(-1)!];
const overallMs = (last.t - first.t) / (last.processed - first.processed);
const perSlot = arrivals.slice(1).flatMap((a, i) => {
  const slots = a.slot - arrivals[i]!.slot;
  return slots > 0 ? [(a.t - arrivals[i]!.t) / slots] : [];
});
const drift = polls.map((p) => p.unix - p.t / 1000);
const nanoPolls = polls.filter((p) => p.nanoMs !== null);
const summary = {
  cluster,
  rpc: RPC[cluster].replace(/\?.*$/, ""),
  startedAt,
  endedAt: new Date().toISOString(),
  features,
  alpenglowAccounts,
  performanceSamples: performance,
  epochAverageMsPerSlot: epochs,
  polls: { count: polls.length, errors, latencyMs: stats(polls.map((p) => p.latency)) },
  slotsObserved: [first.processed, last.processed],
  msPerSlotOverall: r1(overallMs),
  msPerSlotOver30s: windowed(30),
  msPerSlotOver60s: windowed(60),
  slotNotifications: { msPerSlot: stats(perSlot), below100ms: perSlot.filter((x) => x < 100).length },
  confirmedMinusFinalizedSlots: stats(polls.map((p) => p.confirmed - p.finalized)),
  processedMinusConfirmedSlots: stats(polls.map((p) => p.processed - p.confirmed)),
  clockDriftSeconds: stats(drift),
  nanosecondClockDriftMs: stats(nanoPolls.map((p) => p.nanoMs! - p.t)),
  clockEqualsNanosecondSeconds: nanoPolls.filter((p) => p.unix === Math.floor(p.nanoMs! / 1000)).length,
};
console.log(JSON.stringify(summary, null, 2));
process.exit(0);
