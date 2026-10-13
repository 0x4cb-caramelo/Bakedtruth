/**
 * Purpose: the public report of a batch (Sprint 14, lane L14R; services/indexer/src/referral/report.ts): wallets and
 *          amounts only, paid and pending, read from the ledger opened read-only; on stdout, or into a new file with
 *          --out (never overwriting one). It needs no RPC and no key.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 *
 * Run: bun scripts/referral/report.ts --ledger <referral-ledger.sqlite> --batch <n> [--out <file>]
 */
import { writeFileSync } from "node:fs";

import { openLedger } from "../../services/indexer/src/referral/ledger";
import { publicReport } from "../../services/indexer/src/referral/report";
import { batchNumber, existing, need, parseFlags, runCommand } from "./common";

export async function reportCommand(argv: readonly string[]): Promise<string> {
  const flags = parseFlags(argv, ["ledger", "batch", "out"], []);
  const batch = batchNumber(need(flags, "batch"));
  const ledger = openLedger(existing(flags, "ledger"), { readonly: true });
  try {
    const text = publicReport(ledger, batch);
    if (typeof flags.out !== "string") return text;
    writeFileSync(flags.out, text, { mode: 0o644, flag: "wx" });
    return `Written: ${flags.out}\n`;
  } finally {
    ledger.close();
  }
}

if (import.meta.main) await runCommand(() => reportCommand(process.argv.slice(2)));
