/**
 * Purpose: the weekly referral routine's second command (Sprint 14, lane L14R): after a person ran a batch's signing
 *          file, it reads the operations wallet's history at `finalized` and records in the ledger each transfer that
 *          landed under a payout memo, by its signature (services/indexer/src/referral/landed.ts), with a note for
 *          anything that was not the prepared transfer; then, with --cancel, gives up what is left of that batch, owed
 *          again in the next one. It prints what it recorded and each batch's rows by status. It holds no key.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 *
 * Run (as the indexer's user):
 *   REFERRAL_RPC_URL_FILE=<file> bun scripts/referral/record.ts --ledger <referral-ledger.sqlite> \
 *     --ops <operations wallet> [--cancel <batch>]
 */
import type { SolanaRpc } from "@brot/sdk/read";

import { openLedger } from "../../services/indexer/src/referral/ledger";
import { recordPayouts } from "../../services/indexer/src/referral/routine";
import { solOf } from "../../services/indexer/src/referral/rules";
import { batchNumber, existing, opsOf, parseFlags, rpcFromEnv, runCommand, type Env } from "./common";

export async function recordCommand(argv: readonly string[], env: Env, rpcOf: (env: Env) => SolanaRpc = rpcFromEnv) {
  const flags = parseFlags(argv, ["ledger", "ops", "cancel"], []);
  const cancel = typeof flags.cancel === "string" ? batchNumber(flags.cancel) : undefined;
  const ops = opsOf(flags);
  const rpc = rpcOf(env);
  const ledger = openLedger(existing(flags, "ledger"));
  try {
    const { scan, cancelled, status } = await recordPayouts({ rpc, ledger, ops, cancel });
    const byBatch = new Map<number, string[]>();
    for (const s of status) byBatch.set(s.batch, [...(byBatch.get(s.batch) ?? []), `${s.n} ${s.status}`]);
    return [
      `Read ${scan.scanned} transaction(s) of the operations wallet; recorded ${scan.recorded.length} transfer(s).`,
      ...scan.recorded.map(
        ({ landing: l, note }) =>
          `  batch ${l.batch} #${l.idx}  ${l.wallet}  ${solOf(l.lamports)} SOL  ${l.signature}${note ? `  (${note})` : ""}`,
      ),
      ...(scan.stoppedAt === null ? [] : [`The node has not returned ${scan.stoppedAt} yet: run record again later.`]),
      ...(cancel === undefined ? [] : [`Cancelled ${cancelled} transfer(s) of batch ${cancel}: owed again.`]),
      ...[...byBatch].map(([batch, counts]) => `Batch ${batch}: ${counts.join(", ")}.`),
      "",
    ].join("\n");
  } finally {
    ledger.close();
  }
}

if (import.meta.main) await runCommand(() => recordCommand(process.argv.slice(2), process.env));
