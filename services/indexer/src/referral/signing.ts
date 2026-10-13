/**
 * Purpose: what a person signs, and what they read first (Sprint 14, lane L14R; the founder's answer: the routine
 *          prepares the transfers and a person signs them from an operations wallet; no payout key ever goes on the
 *          server): the batch as a Bash file of Solana CLI transfers, one per wallet, each with its memo
 *          `brot-referral:<batch>:<index>`, to run where the operations wallet can sign (a keypair file, or a Ledger
 *          through `SIGNER=usb://ledger`), never on the server. It checks that the signer is the operations wallet,
 *          stops at the first failure, and skips a transfer it already sent (a `.done` file beside it). And the
 *          summary, which is also the dry run's output: the batch's slot, the rent minimum as the RPC answered it,
 *          the operations wallet's balance and what the batch needs, each transfer, each carried one, the entries held.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import { formatUtc } from "@brot/sdk/read";

import { FEE_PER_TRANSFER, type Line, type Plan } from "./batch";
import { MEMO_PREFIX, solOf } from "./rules";

export const scriptName = (batch: number) => `referral-batch-${batch}.sh`;
export const summaryName = (batch: number) => `referral-batch-${batch}.txt`;

/** The signing file: Bash, one `solana transfer` per wallet to pay. */
export function signingScript(plan: Plan): string {
  return [
    "#!/usr/bin/env bash",
    `# Brot Markets: referral payouts, batch ${plan.batch}: ${plan.send.length} transfer(s), ${solOf(plan.total)} SOL.`,
    `# Prepared from the indexer's finalized rows up to slot ${plan.standing.asOfSlot}. Run it where the operations`,
    `# wallet ${plan.ops} can sign (a keypair file, or a Ledger), never on the server:`,
    `#   SIGNER=usb://ledger RPC_URL=https://... bash ${scriptName(plan.batch)}`,
    `# Each transfer carries the memo ${MEMO_PREFIX}:${plan.batch}:<n>; afterwards, record finds every landed one.`,
    "# If it stops halfway, run record before anything else; run again, it skips what it already sent.",
    "set -euo pipefail",
    ': "${SIGNER:?set SIGNER to the operations wallet: a keypair file, or usb://ledger}"',
    ': "${RPC_URL:?set RPC_URL to the cluster RPC URL}"',
    `OPS=${plan.ops}`,
    '[ "$(solana address --keypair "$SIGNER")" = "$OPS" ] || { echo "SIGNER is not the operations wallet $OPS" >&2; exit 1; }',
    'DONE="${BASH_SOURCE[0]}.done"',
    'touch "$DONE"',
    "send() {",
    '  if grep -qx "$1" "$DONE"; then echo "transfer $1: sent before, skipped"; return; fi',
    '  solana transfer --url "$RPC_URL" --keypair "$SIGNER" --from "$SIGNER" --fee-payer "$SIGNER" \\',
    `    --allow-unfunded-recipient --with-memo "${MEMO_PREFIX}:${plan.batch}:$1" "$2" "$3"`,
    '  echo "$1" >> "$DONE"',
    "}",
    ...plan.send.map((l) => `send ${l.idx} ${l.wallet} ${solOf(l.amount)}`),
    "",
  ].join("\n");
}

const sendLine = (l: Line) =>
  `  ${l.idx}  ${l.wallet}  ${solOf(l.amount)} SOL  (earned as referrer ${solOf(l.referrer)}, as referee ` +
  `${solOf(l.rebate)}; paid before ${solOf(l.paidBefore)})`;
const carriedLine = (l: Line) =>
  `  ${l.wallet}  ${solOf(l.amount)} SOL  (balance ${l.balance} lamports, minimum ${l.rentMin})`;

/** What a person reads before signing, and the dry run's output. */
export function batchSummary(plan: Plan, dryRun: boolean): string {
  const s = plan.standing;
  const time = s.chainTime === null ? "" : ` (chain time ${formatUtc(BigInt(s.chainTime))})`;
  const short = plan.send.length > 0 && plan.opsBalance < plan.needed;
  return [
    `Brot Markets: referral payouts, batch ${plan.batch}${dryRun ? " (dry run: nothing written)" : ""}`,
    `From the indexer's finalized rows up to slot ${s.asOfSlot}${time}.`,
    `Rent-exempt minimum of an empty wallet, as the RPC answered it: ${plan.rentMin} lamports.`,
    `Operations wallet ${plan.ops}: ${solOf(plan.opsBalance)} SOL; the batch needs ${solOf(plan.needed)} SOL ` +
      `(the transfers, ${FEE_PER_TRANSFER} lamports of fee each, and its own minimum)${short ? ": NOT ENOUGH" : "."}`,
    "",
    `To send: ${plan.send.length} transfer(s), ${solOf(plan.total)} SOL.`,
    ...plan.send.map(sendLine),
    `Carried to the next batch, pending (it would leave the wallet below the rent-exempt minimum): ${plan.carried.length}.`,
    ...plan.carried.map(carriedLine),
    `Held for the team (a check against the campaign failed; never paid until it passes): ${s.held.length}.`,
    ...s.held.map((e) => `  ${e.referee} on ${e.campaign} #${e.opening}: ${e.reason}`),
    `Waiting for a campaign to end, pay out or collect its fee: ${s.waiting} entr${s.waiting === 1 ? "y" : "ies"}.`,
    `Links waiting for a block's order: ${s.undecided}.`,
    "",
  ].join("\n");
}
