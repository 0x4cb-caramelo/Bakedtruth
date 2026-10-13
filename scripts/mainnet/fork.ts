/**
 * Purpose: the mainnet fork the rehearsal runs on: a Surfpool surfnet forking mainnet-beta (accounts fetched on first
 *          read; nothing is ever sent to mainnet), bound to 127.0.0.1 on this lane's fixed ports, run from its own
 *          temporary directory with HOME inside it, killed on exit; and the cheats the rehearsal uses: SOL for a
 *          throwaway wallet, an account's bytes, and the clock moved forward (a time lock, a deadline, the window).
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 *
 * Ports: MAINNET_REHEARSAL_PORT (default 4235) and the next one for its WebSocket. The datasource is Surfpool's
 * mainnet default, or SURFPOOL_DATASOURCE_RPC_URL (read by Surfpool itself, never printed). `surfnet_timeTravel`
 * takes milliseconds (Surfpool 1.5.0, seen running 2026-10-13: +86,400 s moved the clock and the slot together).
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { clock, connect, type Rpc } from "../validator/rpc";

export type Fork = { rpc: Rpc; version: string; binarySha256: string; log: () => string; stop: () => void };

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
const alive = (child: ChildProcess) => child.exitCode === null && child.signalCode === null;

/** Starts the fork; refuses a busy port rather than wander outside the lane's range. */
export async function startFork(binary = process.env.SURFPOOL_BIN ?? "surfpool"): Promise<Fork> {
  const port = Number(process.env.MAINNET_REHEARSAL_PORT ?? 4235);
  if (!Number.isInteger(port) || port < 4235 || port > 4238) throw new Error("the rehearsal's ports are 4235 to 4239");
  const busy = await fetch(`http://127.0.0.1:${port}`, { method: "POST" }).then(
    () => true,
    () => false,
  );
  if (busy) throw new Error(`127.0.0.1:${port} already answers: stop whatever holds it`);
  const path = spawnSync("sh", ["-c", `command -v ${binary}`], { encoding: "utf8" }).stdout.trim();
  const version = /surfpool (\d+\.\d+\.\d+)/.exec(spawnSync(path, ["--version"], { encoding: "utf8" }).stdout)?.[1];
  if (!path || !version) throw new Error(`cannot run ${binary}: install Surfpool (CI pins 1.6.0)`);
  const binarySha256 = createHash("sha256").update(readFileSync(path)).digest("hex");
  const dir = mkdtempSync(join(tmpdir(), "brot-mainnet-fork-"));
  mkdirSync(join(dir, "home"));
  const args = ["start", "--no-tui", "--no-studio", "--disable-instruction-profiling", "--log-level", "warn"];
  args.push("--no-deploy", "-o", "127.0.0.1", "-p", String(port), "-w", String(port + 1), "-q", "0");
  args.push("-k", join(dir, "no-keypair.json"), "--log-path", join(dir, "logs"));
  if (!process.env.SURFPOOL_DATASOURCE_RPC_URL) args.push("-n", "mainnet");
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
  for (const deadline = Date.now() + 90_000; Date.now() < deadline && alive(child); await sleep(300)) {
    if ((await rpc.call<string>("getHealth").catch(() => null)) === "ok") {
      return { rpc, version, binarySha256, log: () => output, stop };
    }
  }
  stop();
  throw new Error(`surfpool never became healthy\n${output}`);
}

/** `surfnet_setAccount`, its data in hex (as Surfpool 1.5 and 1.6 take it). */
export async function setAccount(
  rpc: Rpc,
  address: string,
  update: { lamports: bigint; data?: Uint8Array; owner?: string; executable?: boolean },
) {
  const body: Record<string, unknown> = { lamports: Number(update.lamports) };
  if (update.data) body.data = Buffer.from(update.data).toString("hex");
  if (update.owner) body.owner = update.owner;
  if (update.executable !== undefined) body.executable = update.executable;
  await rpc.call("surfnet_setAccount", [address, body]);
}

/** Gives a throwaway wallet `lamports` on the fork (a system account with no data). */
export const fund = (rpc: Rpc, address: string, lamports: bigint) => setAccount(rpc, address, { lamports });

/** Moves the fork's clock to `unixTimestamp` (seconds) and waits until the Clock sysvar shows it. */
export async function travelTo(rpc: Rpc, unixTimestamp: bigint): Promise<bigint> {
  await rpc.call("surfnet_timeTravel", [{ absoluteTimestamp: Number(unixTimestamp * 1000n) }]);
  for (let i = 0; i < 100; i++) {
    const now = (await clock(rpc)).unixTimestamp;
    if (now >= unixTimestamp) return now;
    await sleep(100);
  }
  throw new Error(`the fork's clock never reached ${unixTimestamp}`);
}

/** The fork's clock, `seconds` later. */
export const travel = async (rpc: Rpc, seconds: bigint) => travelTo(rpc, (await clock(rpc)).unixTimestamp + seconds);
