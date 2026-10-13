/**
 * Purpose: the weekly referral routine's first command (Sprint 14, lane L14R; TP §3.4.11), run on the server beside the
 *          indexer: it reads the indexer's file read-only, syncs the ledger with what the operations wallet's history
 *          shows landed, and prepares the week's batch (services/indexer/src/referral/routine.ts): the ledger's rows,
 *          and in --out the signing file and its summary, never overwriting one. With --dry-run it does the same on a
 *          throwaway copy of the ledger and prints the summary: nothing is written anywhere. A ledger is started only
 *          with --new-ledger, so a mistyped path can never hide an open batch behind an empty ledger. It holds no key
 *          and signs nothing: a person runs the signing file where the operations wallet can sign, then runs record.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 *
 * Run (as the indexer's user; the RPC URL from a credential file, never on the command line):
 *   REFERRAL_RPC_URL_FILE=<file> bun scripts/referral/prepare.ts --indexer <indexer.sqlite> \
 *     --ledger <referral-ledger.sqlite> --ops <operations wallet> --out <dir> [--dry-run] [--new-ledger]
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SolanaRpc } from "@brot/sdk/read";

import { openStore } from "../../services/indexer/src/db/store";
import { ledgerCopy, openLedger } from "../../services/indexer/src/referral/ledger";
import { prepareBatch } from "../../services/indexer/src/referral/routine";
import { scriptName, summaryName } from "../../services/indexer/src/referral/signing";
import { existing, need, opsOf, parseFlags, rpcFromEnv, runCommand, UsageError, type Env } from "./common";

export async function prepareCommand(argv: readonly string[], env: Env, rpcOf: (env: Env) => SolanaRpc = rpcFromEnv) {
  const flags = parseFlags(argv, ["indexer", "ledger", "ops", "out"], ["dry-run", "new-ledger"]);
  const dryRun = flags["dry-run"] === true;
  const [indexerPath, ledgerPath, ops] = [existing(flags, "indexer"), need(flags, "ledger"), opsOf(flags)];
  if (existsSync(ledgerPath) === (flags["new-ledger"] === true))
    throw new UsageError(
      existsSync(ledgerPath) ? "--new-ledger: the ledger exists" : "--ledger: no such file (--new-ledger starts one)",
    );
  const out = dryRun ? null : need(flags, "out");
  const rpc = rpcOf(env);
  const indexer = openStore(indexerPath, { readonly: true });
  const ledger = dryRun ? ledgerCopy(existsSync(ledgerPath) ? ledgerPath : null) : openLedger(ledgerPath);
  try {
    const now = Math.floor(Date.now() / 1_000);
    const p = await prepareBatch({ rpc, indexer, ledger, ops, dryRun, now });
    if (out === null) return p.summary;
    if (!p.written) return "Nothing owed: no batch prepared.\n";
    mkdirSync(out, { recursive: true });
    const files = [join(out, summaryName(p.plan.batch))];
    writeFileSync(files[0], p.summary, { mode: 0o640, flag: "wx" });
    if (p.script !== null) {
      files.push(join(out, scriptName(p.plan.batch)));
      writeFileSync(files[1], p.script, { mode: 0o750, flag: "wx" });
    }
    return `${p.summary}\nWritten: ${files.join(", ")}\n`;
  } finally {
    indexer.close();
    ledger.close();
  }
}

if (import.meta.main) await runCommand(() => prepareCommand(process.argv.slice(2), process.env));
