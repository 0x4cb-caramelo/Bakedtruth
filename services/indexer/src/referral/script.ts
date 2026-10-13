/**
 * Purpose: the signing file a person runs ONCE where the operations wallet can sign (Sprint 14, lane L14R; the
 *          founder's answer: no payout key on the server; second review, R1, R2 and R4): Bash and the Solana CLI only,
 *          one `solana transfer --with-memo brot-referral:<batch>:<n>` per line. It refuses another cluster (the
 *          genesis hash read at prepare) and another signer; the RPC URL comes from a file (RPC_URL_FILE) or the
 *          environment and reaches the CLI only through a private temporary config, never a command line (no keyed
 *          URL in the shell history or in `ps`). Before each line it looks for that line's memo in the operations
 *          wallet's recent history (`transaction-history`, at `confirmed`) and skips a line already there; it goes
 *          on past a line that fails, and ends by listing the failed lines with what to do. It keeps no local record:
 *          what was paid is only what the chain shows, which `record` reads.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import type { Plan } from "./batch";
import { MEMO_PREFIX, solOf } from "./rules";

export const scriptName = (batch: number) => `referral-batch-${batch}.sh`;

/** What to do after any stop or failure: never run the file again. */
export const afterAStop = (batch: number) =>
  `do not run it again: wait 2 minutes (a blockhash expires and the chain finalizes), then on the server run ` +
  `record, then record --cancel ${batch} (what did not land is owed again), then prepare a new batch`;

/** The signing file: Bash, one guarded `solana transfer` per line to pay. */
export function signingScript(plan: Plan): string {
  const b = plan.batch;
  return [
    "#!/usr/bin/env bash",
    `# Brot Markets: referral payouts, batch ${b}: ${plan.send.length} transfer(s), ${solOf(plan.total)} SOL, from the`,
    `# operations wallet ${plan.ops} on the cluster whose genesis hash is ${plan.genesis}.`,
    `# Prepared from the indexer's finalized rows up to slot ${plan.standing.asOfSlot}. Run it ONCE, where the operations`,
    "# wallet can sign (a keypair file, or a Ledger), never on the server; the RPC URL from a file, never typed inline:",
    `#   SIGNER=usb://ledger RPC_URL_FILE=<file holding the RPC URL> bash ${scriptName(b)}`,
    "# Each line is sent once; a line whose memo the wallet's history already shows is skipped; a failed line is listed",
    `# at the end and the run goes on. After ANY stop or failure, ${afterAStop(b)}.`,
    "set -uo pipefail",
    `BATCH=${b}`,
    `OPS=${plan.ops}`,
    `GENESIS=${plan.genesis}`,
    ': "${SIGNER:?set SIGNER to the operations wallet: a keypair file, or usb://ledger}"',
    'if [ -n "${RPC_URL_FILE:-}" ]; then RPC_URL="$(tr -d "[:space:]" < "$RPC_URL_FILE")"; fi',
    ': "${RPC_URL:?set RPC_URL_FILE to a file holding the cluster RPC URL}"',
    'TMP="$(mktemp -d)"',
    'CFG="$TMP/cli.yml"',
    'trap \'rm -f "$CFG"; rmdir "$TMP"\' EXIT',
    `case "$RPC_URL$SIGNER" in *"'"*) echo "a single quote in RPC_URL or SIGNER is not supported" >&2; exit 1;; esac`,
    `( umask 077; printf "json_rpc_url: '%s'\\nwebsocket_url: ''\\nkeypair_path: '%s'\\ncommitment: confirmed\\n" \\`,
    '  "$RPC_URL" "$SIGNER" > "$CFG" )',
    "unset RPC_URL",
    '[ "$(solana genesis-hash -C "$CFG")" = "$GENESIS" ] || {',
    '  echo "the RPC is not the cluster this batch was prepared on (genesis $GENESIS): nothing sent" >&2; exit 1; }',
    '[ "$(solana address -C "$CFG" --keypair "$SIGNER")" = "$OPS" ] || {',
    '  echo "SIGNER is not the operations wallet $OPS: nothing sent" >&2; exit 1; }',
    "FAILED=()",
    "send() {",
    `  local memo="${MEMO_PREFIX}:$BATCH:$1" history`,
    '  if ! history="$(solana transaction-history -C "$CFG" "$OPS" --limit 1000 --verbose --output json-compact 2>/dev/null)"',
    '  then FAILED+=("$1 $2 $3 (the history could not be read, so it was not sent)"); return; fi',
    '  case "$history" in *"$memo\\""*|*"$memo;"*) echo "line $1: already on-chain, not sent again"; return;; esac',
    '  solana transfer -C "$CFG" --keypair "$SIGNER" --from "$SIGNER" --fee-payer "$SIGNER" \\',
    '    --allow-unfunded-recipient --with-memo "$memo" "$2" "$3" || FAILED+=("$1 $2 $3")',
    "}",
    ...plan.send.map((l) => `send ${l.idx} ${l.wallet} ${solOf(l.amount)}`),
    'if [ "${#FAILED[@]}" -gt 0 ]; then',
    '  printf "Lines not sent, or not confirmed (one may still land):\\n" >&2',
    "  printf '  %s\\n' \"${FAILED[@]}\" >&2",
    `  echo "This batch stopped short: ${afterAStop(b)}." >&2`,
    "  exit 1",
    "fi",
    'echo "Every line was sent. In 2 minutes, on the server: record."',
    "",
  ].join("\n");
}
