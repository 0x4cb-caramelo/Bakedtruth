/**
 * Purpose: rehearse the referral signing file with the real Solana CLI (Sprint 14, lane L14R; second review, R1, R2
 *          and R4) on a local OFFLINE surfnet inside a loopback-only network namespace (scripts/validator/isolate.ts),
 *          with throwaway keys made here and nothing else: a batch of three lines, the second a sysvar (prepare would
 *          hold it; it is forced in to rehearse a failing line), run once: two lines land, the failed one is listed and
 *          the run went on; run again by mistake, it pays nothing twice (each memo is found on-chain first); another
 *          cluster's genesis or another signer sends nothing; then `record` reads both landings back by their memos,
 *          the rest is cancelled, and the public report says so. Exit status 0 only if every check holds.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 *
 * Run: bun scripts/referral/rehearse.ts   (Surfpool and the Solana CLI on PATH; ports 4210 and 4211 in the namespace)
 */
import { spawn, spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSolanaRpc } from "@solana/kit";

import type { Plan } from "../../services/indexer/src/referral/batch";
import { scanLandings } from "../../services/indexer/src/referral/landed";
import { cancelBatch, ledgerMark, openLedger } from "../../services/indexer/src/referral/ledger";
import { publicReport } from "../../services/indexer/src/referral/report";
import { signingScript } from "../../services/indexer/src/referral/script";
import { writeBatch } from "../../services/indexer/src/referral/write";
import { isolateOrExit } from "../validator/isolate";
import { connect } from "../validator/rpc";

isolateOrExit(import.meta.path);

const URL = "http://127.0.0.1:4210";
const CLOCK = "SysvarC1ock11111111111111111111111111111111";
const SOL = 1_000_000_000n;
const dir = mkdtempSync(join(tmpdir(), "brot-referral-rehearse-"));
const home = join(dir, "home");
mkdirSync(home);
const env = { ...process.env, HOME: home, NO_DNA: "1" };
const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
// Offline, on the port pair, with no keypair of its own, its logs in the rehearsal's folder, 400 ms slots.
const node = spawn(
  "surfpool",
  [
    ...["start", "--offline", "--no-tui", "--no-studio", "--disable-instruction-profiling", "--log-level", "warn"],
    ...["--no-deploy", "-o", "127.0.0.1", "-p", "4210", "-w", "4211", "-q", "0", "-k", join(dir, "no-keypair.json")],
    ...["--log-path", join(dir, "logs"), "-t", "400"],
  ],
  { cwd: dir, env, stdio: "ignore" },
);
const stop = () => {
  if (node.exitCode === null) node.kill("SIGKILL");
  rmSync(dir, { recursive: true, force: true });
};
process.once("exit", stop);

const rpc = connect(URL);
const checks: [string, boolean][] = [];
const check = (what: string, ok: boolean) => checks.push([what, ok]);
const run = (cmd: string, args: string[], extra: Record<string, string> = {}) =>
  spawnSync(cmd, args, { env: { ...env, ...extra }, encoding: "utf8" });
const keypair = (name: string) => {
  const path = join(dir, `${name}.json`);
  run("solana-keygen", ["new", "--no-bip39-passphrase", "-s", "--force", "-o", path]);
  return { path, address: run("solana", ["address", "-k", path]).stdout.trim() };
};
const balance = async (at: string) =>
  BigInt((await rpc.call<{ value: number }>("getBalance", [at, { commitment: "confirmed" }])).value);

for (let i = 0; i < 240 && (await rpc.call<string>("getHealth").catch(() => null)) !== "ok"; i++) await sleep(250);
const [ops, other, w1, w2] = [keypair("ops"), keypair("other"), keypair("w1"), keypair("w2")];
await rpc.call("requestAirdrop", [ops.address, Number(10n * SOL)]);
for (let i = 0; i < 120 && (await balance(ops.address)) === 0n; i++) await sleep(250);
const genesis = await rpc.call<string>("getGenesisHash");
const line = (idx: number, wallet: string, amount: bigint) => ({
  ...{ idx, wallet, amount, referrer: amount, rebate: 0n, paidBefore: 0n, balance: 0n, rentMin: 0n },
});
const ledger = openLedger(":memory:");
const send = [line(1, w1.address, SOL / 100n), line(2, CLOCK, SOL / 100n), line(3, w2.address, SOL / 50n)];
const plan: Plan = {
  ...{ batch: 1, ops: ops.address, genesis, rentMin: 0n, opsBalance: 10n * SOL, send, carried: [], held: [] },
  ...{ checked: true, total: 4n * (SOL / 100n), needed: 0n, mark: ledgerMark(ledger) },
  standing: { asOfSlot: 0, chainTime: null, earned: new Map(), held: [], waiting: 0, undecided: 0 },
};
writeBatch(ledger, plan, 0);
const script = join(dir, "referral-batch-1.sh");
writeFileSync(script, signingScript(plan));
const urlFile = join(dir, "rpc-url");
writeFileSync(urlFile, `${URL}\n`);
chmodSync(urlFile, 0o600);
const signing = { SIGNER: ops.path, RPC_URL_FILE: urlFile };

const first = run("bash", [script], signing);
check(
  "the first run exits 1, listing the failed sysvar line",
  first.status === 1 && first.stderr.includes(`2 ${CLOCK}`),
);
check("the first run went on past the failed line", first.stderr.includes("This batch stopped short"));
const paid = [await balance(w1.address), await balance(w2.address)];
check("lines 1 and 3 landed with their amounts", paid[0] === SOL / 100n && paid[1] === SOL / 50n);
const opsAfter = await balance(ops.address);
const again = run("bash", [script], signing);
check(
  "a second run finds each landed memo and sends it again never",
  /line 1: already on-chain[\s\S]*line 3: already on-chain/.test(again.stdout),
);
check(
  "nothing moved on the second run",
  (await balance(w1.address)) === paid[0] && (await balance(w2.address)) === paid[1],
);
const elsewhere = join(dir, "other-cluster.sh");
writeFileSync(
  elsewhere,
  readFileSync(script, "utf8").replace(`GENESIS=${genesis}`, "GENESIS=11111111111111111111111111111111"),
);
const wrongCluster = run("bash", [elsewhere], signing);
check(
  "another cluster's batch sends nothing",
  wrongCluster.status === 1 && wrongCluster.stderr.includes("not the cluster"),
);
const wrongSigner = run("bash", [script], { ...signing, SIGNER: other.path });
check(
  "another signer sends nothing",
  wrongSigner.status === 1 && wrongSigner.stderr.includes("not the operations wallet"),
);
check("the refused runs moved no lamport", (await balance(ops.address)) <= opsAfter);

let recorded = 0;
for (let i = 0; i < 240 && recorded < 2; i++, await sleep(500))
  recorded += (await scanLandings(createSolanaRpc(URL), ledger, ops.address)).recorded.length;
check("record reads both landings back by their memos", recorded === 2);
check("cancel gives up the line that never landed", cancelBatch(ledger, 1) === 1);
const report = publicReport(ledger, 1);
check(
  "the report: two paid, the sysvar pending",
  report.includes(`Pending\n${CLOCK} 0.010000000`) && report.includes(`${w1.address} 0.010000000`),
);

for (const [what, ok] of checks) console.log(`${ok ? "ok  " : "FAIL"} ${what}`);
process.exitCode = checks.every(([, ok]) => ok) ? 0 : 1;
stop();
