/**
 * Purpose: start and stop a local OFFLINE Surfpool surfnet for the ops rehearsals: no datasource (`--offline`),
 *          bound to 127.0.0.1 on two free ports in 4200-4299, run from its own temporary directory with HOME
 *          inside it, the binary's version and SHA-256 recorded, killed on exit.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * Why Surfpool and not `solana-test-validator`: the prebuilt test validator of Solana CLI 3.1.10 stops at start
 * on this development machine ("Incompatible CPU detected: missing AVX2 support", an i5-3210M), and the sprint
 * file accepts either (Sprint 05, "a real validator (Surfpool or solana-test-validator)"). Surfpool still checks
 * for a newer version of itself at start (cloud.txtx.run); `isolate.ts` runs the whole rehearsal in a network
 * namespace with loopback only, so nothing leaves the machine.
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { connect, type Rpc } from "./rpc";

const PORT_FIRST = 4200;
const PORT_LAST = 4299;
const HEALTH_TIMEOUT_MS = 60_000;

export type Surfnet = { rpc: Rpc; version: string; binarySha256: string; log: () => string; stop: () => void };

const alive = (child: ChildProcess) => child.exitCode === null && child.signalCode === null;
const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

/** A port in 4200-4299 nothing listens on now, other than `skip`. */
async function freePort(skip: number[]): Promise<number> {
  for (let port = PORT_FIRST; port <= PORT_LAST; port++) {
    if (skip.includes(port)) continue;
    const free = await new Promise<boolean>((done) => {
      const server = createServer();
      server.once("error", () => done(false));
      server.listen(port, "127.0.0.1", () => server.close(() => done(true)));
    });
    if (free) return port;
  }
  throw new Error(`no free port in ${PORT_FIRST}-${PORT_LAST}`);
}

/** Starts an offline surfnet; `slotMs` is its slot time (Surfpool's default, 400 ms, unless given). */
export async function startOfflineSurfnet(binary = process.env.SURFPOOL_BIN ?? "surfpool", slotMs = 400) {
  const versionOut = spawnSync(binary, ["--version"], { encoding: "utf8" });
  const version = /surfpool (\d+\.\d+\.\d+)/.exec(versionOut.stdout ?? "")?.[1];
  if (!version) throw new Error(`cannot run ${binary} --version (${versionOut.error?.message ?? versionOut.stdout})`);
  const path = spawnSync("sh", ["-c", `command -v ${binary}`], { encoding: "utf8" }).stdout.trim();
  const binarySha256 = createHash("sha256").update(readFileSync(path)).digest("hex");
  const dir = mkdtempSync(join(tmpdir(), "brot-ops-surfnet-"));
  mkdirSync(join(dir, "home"));
  const port = await freePort([]);
  const wsPort = await freePort([port]);
  const args = ["start", "--offline", "--no-tui", "--no-studio", "--disable-instruction-profiling"];
  args.push("--log-level", "warn", "--no-deploy", "-o", "127.0.0.1", "-p", String(port), "-w", String(wsPort));
  args.push("-q", "0", "-k", join(dir, "no-keypair.json"), "--log-path", join(dir, "logs"), "-t", String(slotMs));
  const env = { ...process.env, HOME: join(dir, "home"), NO_DNA: "1" };
  const child = spawn(path, args, { cwd: dir, env, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  const keep = (chunk: Buffer) => (output = (output + chunk.toString()).slice(-6_000));
  child.stdout?.on("data", keep);
  child.stderr?.on("data", keep);
  const stop = () => {
    if (alive(child)) child.kill("SIGKILL");
    rmSync(dir, { recursive: true, force: true });
  };
  process.once("exit", stop);
  const rpc = connect(`http://127.0.0.1:${port}`);
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;
  while (Date.now() < deadline && alive(child)) {
    if ((await rpc.call<string>("getHealth").catch(() => null)) === "ok") {
      return { rpc, version, binarySha256, log: () => output, stop } satisfies Surfnet;
    }
    await sleep(250);
  }
  stop();
  throw new Error(`surfpool never became healthy\n${output}`);
}

/** `surfnet_setAccount` (hex data, as Surfpool 1.5 and 1.6 expect it). */
export async function setAccount(
  rpc: Rpc,
  address: string,
  update: { lamports: bigint; data?: Uint8Array; owner?: string; executable?: boolean },
): Promise<void> {
  const body: Record<string, unknown> = { lamports: Number(update.lamports) };
  if (update.data) body.data = Buffer.from(update.data).toString("hex");
  if (update.owner) body.owner = update.owner;
  if (update.executable !== undefined) body.executable = update.executable;
  await rpc.call("surfnet_setAccount", [address, body]);
}
