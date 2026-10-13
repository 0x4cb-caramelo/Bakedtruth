/**
 * Purpose: what the referral commands share (Sprint 14, lane L14R): their flags (`--name value` and `--switch`, any
 *          other argument refused), the operations wallet checked as an address, a batch number, the RPC from the
 *          environment (REFERRAL_RPC_URL_FILE or REFERRAL_RPC_URL, else the indexer's INDEXER_RPC_URL_FILE or
 *          INDEXER_RPC_URL; a file wins over its variable, as a systemd credential does), and how a command ends: its
 *          output on stdout; a refusal by its name and message; any other failure by its name only, since an RPC
 *          error's message could quote the URL and its key. Exit status 1 on any failure.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import { existsSync, readFileSync } from "node:fs";
import { address } from "@solana/kit";
import { rpcFor, type SolanaRpc } from "@brot/sdk/read";

export type Env = Record<string, string | undefined>;
export type Flags = Record<string, string | true>;

/** A command line the command cannot run. */
export class UsageError extends Error {
  override name = "UsageError";
}

/** `--name value` for each of `values`, `--name` for each of `switches`; anything else is refused. */
export function parseFlags(argv: readonly string[], values: readonly string[], switches: readonly string[]): Flags {
  const flags: Flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const name = argv[i].startsWith("--") ? argv[i].slice(2) : null;
    if (name !== null && switches.includes(name)) flags[name] = true;
    else if (name !== null && values.includes(name) && i + 1 < argv.length) flags[name] = argv[(i += 1)];
    else throw new UsageError(`unknown or incomplete argument: ${argv[i]}`);
  }
  return flags;
}

export function need(flags: Flags, name: string): string {
  const value = flags[name];
  if (typeof value !== "string" || value.trim() === "") throw new UsageError(`--${name} is required`);
  return value;
}

/** A file `--name` must name, and does. */
export function existing(flags: Flags, name: string): string {
  const path = need(flags, name);
  if (!existsSync(path)) throw new UsageError(`--${name}: no such file: ${path}`);
  return path;
}

/** The operations wallet named by `--ops`. */
export function opsOf(flags: Flags): string {
  const text = need(flags, "ops");
  try {
    return address(text);
  } catch {
    throw new UsageError("--ops is not an address");
  }
}

/** A batch number: a whole number from 1. */
export function batchNumber(text: string): number {
  if (!/^[1-9][0-9]{0,8}$/.test(text)) throw new UsageError(`not a batch number: ${text}`);
  return Number(text);
}

/** The RPC the commands read through; its URL is never printed. */
export function rpcFromEnv(env: Env, read = (path: string) => readFileSync(path, "utf8")): SolanaRpc {
  for (const name of ["REFERRAL_RPC_URL", "INDEXER_RPC_URL"]) {
    const file = env[`${name}_FILE`]?.trim();
    const url = file ? read(file).trim() : env[name]?.trim();
    if (!url) continue;
    if (!/^https?:\/\//i.test(url)) throw new UsageError(`${name} is not an http(s) URL`);
    return rpcFor(url);
  }
  throw new UsageError("set REFERRAL_RPC_URL_FILE or REFERRAL_RPC_URL (or the indexer's INDEXER_RPC_URL)");
}

const TOLD = new Set(["UsageError", "BatchRefused", "NotComplete", "LedgerRefused", "StoreRefused", "RangeError"]);

/** Prints the command's output; on a failure, its name (and message for a refusal), with exit status 1. */
export async function runCommand(work: () => Promise<string>): Promise<void> {
  try {
    process.stdout.write(await work());
  } catch (caught) {
    const error = caught instanceof Error ? caught : new Error("unknown failure");
    console.error(TOLD.has(error.name) ? `${error.name}: ${error.message}` : `failed: ${error.name}`);
    process.exit(1);
  }
}
