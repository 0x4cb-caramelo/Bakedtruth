/**
 * Purpose: what a person reads before signing, and the dry run's output (Sprint 14, lane L14R): the batch's slot and
 *          cluster (its genesis hash, which the signing file checks: script.ts), the rent minimum as the RPC answered
 *          it, the operations wallet's balance and what the batch needs, each transfer, each carried line, each line
 *          held for a person with why (never in the signing file), whether each transfer was simulated, the entries a
 *          check held, how far back the operations wallet's history was read (a node that keeps no full history
 *          shows here: the oldest signature read should be the wallet's first), and what to do after a stop.
 * Version: 0.2.0 (the held lines, the cluster, the history read, the procedure after a stop; the script in script.ts)
 * Sprint:  14 (referral, lane L14R)
 */
import { formatUtc } from "@brot/sdk/read";

import { FEE_PER_TRANSFER, type Held, type Line, type Plan } from "./batch";
import type { ScanReport } from "./landed";
import { solOf } from "./rules";
import { afterAStop } from "./script";

export { scriptName, signingScript } from "./script";
export const summaryName = (batch: number) => `referral-batch-${batch}.txt`;

const sendLine = (l: Line) =>
  `  ${l.idx}  ${l.wallet}  ${solOf(l.amount)} SOL  (earned as referrer ${solOf(l.referrer)}, as referee ` +
  `${solOf(l.rebate)}; paid before ${solOf(l.paidBefore)})`;
const carriedLine = (l: Line) =>
  `  ${l.wallet}  ${solOf(l.amount)} SOL  (balance ${l.balance} lamports, minimum ${l.rentMin})`;
const heldLine = (l: Held) => `  ${l.wallet}  ${solOf(l.amount)} SOL  (${l.reason})`;

/** How far back the operations wallet's history is known, from the scan before the plan. */
function historyLine(scan: ScanReport | undefined): string {
  if (!scan) return "The operations wallet's history was not read for this summary.";
  const read = scan.since === null ? "from the oldest the RPC returned" : "since the last scan";
  const first = scan.first === null ? "none yet" : `${scan.first.signature} (slot ${scan.first.slot})`;
  return `Operations wallet history: ${scan.scanned} new transaction(s) read ${read}; the oldest this ledger ever read is ${first}.`;
}

/** What a person reads before signing, and the dry run's output. */
export function batchSummary(plan: Plan, dryRun: boolean, scan?: ScanReport): string {
  const s = plan.standing;
  const time = s.chainTime === null ? "" : ` (chain time ${formatUtc(BigInt(s.chainTime))})`;
  const short = plan.send.length > 0 && plan.opsBalance < plan.needed;
  const checked = plan.checked ? "each one simulated from the operations wallet" : "not simulated";
  return [
    `Brot Markets: referral payouts, batch ${plan.batch}${dryRun ? " (dry run: nothing written)" : ""}`,
    `From the indexer's finalized rows up to slot ${s.asOfSlot}${time}, on the cluster ${plan.genesis} (genesis).`,
    historyLine(scan),
    `Rent-exempt minimum of an empty wallet, as the RPC answered it: ${plan.rentMin} lamports.`,
    `Operations wallet ${plan.ops}: ${solOf(plan.opsBalance)} SOL; the batch needs ${solOf(plan.needed)} SOL ` +
      `(the transfers, ${FEE_PER_TRANSFER} lamports of fee each, and its own minimum)${short ? ": NOT ENOUGH" : "."}`,
    "",
    `To send: ${plan.send.length} transfer(s), ${solOf(plan.total)} SOL, ${checked}.`,
    ...plan.send.map(sendLine),
    `Carried to the next batch, pending (it would leave the wallet below the rent-exempt minimum): ${plan.carried.length}.`,
    ...plan.carried.map(carriedLine),
    `Held for a person (it cannot be credited; carried, never in the signing file): ${plan.held.length}.`,
    ...plan.held.map(heldLine),
    `Entries a check against the campaign held (never paid until it passes): ${s.held.length}.`,
    ...s.held.map((e) => `  ${e.referee} on ${e.campaign} #${e.opening}: ${e.reason}`),
    `Waiting for a campaign to end, pay out or collect its fee: ${s.waiting} entr${s.waiting === 1 ? "y" : "ies"}.`,
    `Links waiting for a block's order: ${s.undecided}.`,
    "",
    `Run the signing file once. After any stop or failure, ${afterAStop(plan.batch)}.`,
    "",
  ].join("\n");
}
