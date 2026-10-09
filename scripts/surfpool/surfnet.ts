/**
 * Purpose: start and stop a Surfpool surfnet for the scripts in this folder: a mainnet fork on
 *          127.0.0.1 with both ports in 4200-4299, run from its own temporary directory (logs,
 *          HOME), the binary's version read first, and the process killed on exit and on failure.
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution): the Surfpool run of the price reader
 *
 * The surfnet is started from an empty directory with HOME pointed inside it, so it neither finds
 * this repository's Anchor.toml (Surfpool scaffolds and deploys a project it detects) nor reads the
 * developer's ~/.config/solana/id.json (its default airdrop keypair). Lessons from the agent-rails
 * gate: a liveness probe must know whose liveness it measures, so the child's exit is checked on
 * every pass; and nothing here turns a missing binary into a skip.
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { accessSync, constants, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";

import { connect, type Rpc } from "./rpc";

/** The house rule for the shared server: local services bind 127.0.0.1 on ports 4200-4299. */
const PORT_FIRST = 4200;
const PORT_LAST = 4299;
const HEALTH_TIMEOUT_MS = 90_000;
const LOG_TAIL_BYTES = 6_000;

export type Surfnet = {
  rpc: Rpc;
  version: string;
  binary: string;
  /** SHA-256 of the binary that ran, so a log shows which build it was. */
  binarySha256: string;
  datasource: string;
  log: () => string;
  stop: () => void;
};

/** `surfpool --version` prints `surfpool X.Y.Z`; anything else is a refusal, never a guess. */
export function surfpoolVersion(binary: string): string {
  const out = spawnSync(binary, ["--version"], { encoding: "utf8" });
  if (out.error) throw new Error(`cannot run ${binary} (${out.error.message}); CI installs Surfpool 1.6.0`);
  const match = /surfpool (\d+\.\d+\.\d+)/.exec(out.stdout ?? "");
  if (!match) throw new Error(`unexpected \`${binary} --version\` output: ${JSON.stringify(out.stdout)}`);
  return match[1];
}

/** The binary's path: `name` itself when it holds a slash, else the first match on PATH. */
function resolveBinary(name: string): string {
  const candidates = name.includes("/")
    ? [name]
    : (process.env.PATH ?? "").split(delimiter).map((dir) => join(dir || ".", name));
  for (const candidate of candidates) {
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // not here
    }
  }
  throw new Error(`${name} not found or not executable; CI installs Surfpool 1.6.0`);
}

const alive = (child: ChildProcess) => child.exitCode === null && child.signalCode === null;

/** A port in 4200-4299 that nothing listens on now, other than `skip`. */
async function freePort(skip: number[]): Promise<number> {
  const span = PORT_LAST - PORT_FIRST + 1;
  const start = Math.floor(Math.random() * span);
  for (let i = 0; i < span; i++) {
    const port = PORT_FIRST + ((start + i) % span);
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

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

/**
 * Starts a surfnet forking mainnet (or `SURFPOOL_DATASOURCE_RPC_URL`, which Surfpool reads itself
 * and which is never printed). Refuses a version other than `SURFPOOL_EXPECTED_VERSION` when set.
 */
export async function startSurfnet(binaryName = process.env.SURFPOOL_BIN ?? "surfpool"): Promise<Surfnet> {
  const binary = resolveBinary(binaryName);
  const version = surfpoolVersion(binary);
  const expected = process.env.SURFPOOL_EXPECTED_VERSION;
  if (expected && expected !== version) throw new Error(`Surfpool ${version} found, ${expected} expected`);
  const binarySha256 = createHash("sha256").update(readFileSync(binary)).digest("hex");
  const datasource = process.env.SURFPOOL_DATASOURCE_RPC_URL ? "SURFPOOL_DATASOURCE_RPC_URL" : "mainnet";

  const dir = mkdtempSync(join(tmpdir(), "brot-surfpool-"));
  mkdirSync(join(dir, "home"));
  let child: ChildProcess | null = null;
  let output = "";
  // SIGKILL: the surfnet holds nothing worth a graceful stop, and its ports free at once.
  const stop = () => {
    if (child && alive(child)) child.kill("SIGKILL");
    child = null;
    rmSync(dir, { recursive: true, force: true });
  };
  process.once("exit", stop);
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      stop();
      process.exit(signal === "SIGINT" ? 130 : 143);
    });
  }

  // Two attempts: another process may take a port between the probe and the bind.
  const tried: number[] = [];
  for (let attempt = 1; attempt <= 2; attempt++) {
    const port = await freePort(tried);
    const wsPort = await freePort([...tried, port]);
    tried.push(port, wsPort);
    // `--ci` minus its `--log-level none`: Surfpool's warnings (a skipped override, a failed remote
    // fetch) reach the output tail printed on failure.
    const args = ["start", "--no-tui", "--no-studio", "--disable-instruction-profiling", "--log-level", "warn"];
    args.push("--no-deploy", "-o", "127.0.0.1", "-p", String(port), "-w", String(wsPort));
    args.push("-q", "0", "-k", join(dir, "no-keypair.json"), "--log-path", join(dir, "logs"));
    if (datasource === "mainnet") args.push("-n", "mainnet");
    const env = { ...process.env, HOME: join(dir, "home"), NO_DNA: "1" };
    const started = spawn(binary, args, { cwd: dir, env, stdio: ["ignore", "pipe", "pipe"] });
    child = started;
    output = "";
    const keep = (chunk: Buffer) => (output = (output + chunk.toString()).slice(-LOG_TAIL_BYTES));
    started.stdout?.on("data", keep);
    started.stderr?.on("data", keep);
    const rpc = connect(`http://127.0.0.1:${port}`);
    const deadline = Date.now() + HEALTH_TIMEOUT_MS;
    while (Date.now() < deadline && alive(started)) {
      const health = await rpc.call<string>("getHealth").catch(() => null);
      if (health === "ok" && alive(started)) {
        return { rpc, version, binary, binarySha256, datasource, log: () => output, stop };
      }
      await sleep(300);
    }
    const why = alive(started) ? "never became healthy" : `exited (${started.exitCode ?? started.signalCode})`;
    if (alive(started)) started.kill("SIGKILL");
    if (attempt === 2) {
      stop();
      throw new Error(`surfpool ${why}\n--- surfpool output (tail) ---\n${output}`);
    }
  }
  throw new Error("unreachable");
}
