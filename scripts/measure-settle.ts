/**
 * Purpose: the settle batch (T3) and the per-account write limit (C7). For each batch size it builds one
 *          transaction of `settle_entry` instructions in LiteSVM (self-CPI events included), and prints
 *          the entries per transaction, the transaction's bytes, the compute units and the result.
 *          Then it derives how many settlements one campaign account can take per block.
 * Usage:   bun scripts/measure-settle.ts [--batch=1,2,4,8,12] [--account-cu=12000000] [--join-cu=0]
 * Version: 0.0.1
 * Sprint:  04 (lane F). Runs at integration, after `bun run build:program`.
 */
import {
  appendTransactionMessageInstructions,
  createTransactionMessage,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  signTransactionMessageWithSigners,
  type Instruction,
} from "@solana/kit";
import { isFailedTransaction } from "@solana/kit-plugin-litesvm";

import { fundedWallet, createWorld, type World } from "../tests/brot/setup";
import { injectEntry, injectSettling } from "../tests/brot/campaigns";
import * as P from "../tests/brot/program";
import * as S from "../tests/brot/instructions-settlement";

/** The transaction size limit of the wire format (bytes). */
const TX_LIMIT = 1232;
const arg = (name: string, fallback: string) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const batches = arg("batch", "1,2,4,8,12").split(",").map(Number);
/** [AC] the per-account write limit of one block, in compute units (verify against the current cost model). */
const accountCu = BigInt(arg("account-cu", "12000000"));
const joinCu = BigInt(arg("join-cu", "0"));
const SOL = P.SOL;

/** A settling campaign with `k` entries of 2 SOL on YES, its vault holding the pools. */
async function settlingWith(w: World, k: number) {
  const creator = await fundedWallet(w);
  const { campaign, vault } = await injectSettling(
    w.client,
    {
      id: BigInt(Date.now() % 1e9) * 100n + BigInt(k),
      kind: P.ReaderKind.PriceTouch,
      metric: creator.address,
      target: 1n,
      creator: creator.address,
      opensAt: 1n,
      entriesCloseAt: 2n,
      deadlineAt: 3n,
      poolYes: BigInt(k) * 2n * SOL,
      poolNo: BigInt(k) * SOL,
    },
    P.Outcome.Yes,
    {
      winning_total: BigInt(k) * 2n * SOL,
      losing_total: BigInt(k) * SOL,
      distributable: (BigInt(k) * 9n * SOL) / 10n,
      fee_total: (BigInt(k) * SOL) / 10n,
    },
  );
  const settles: Instruction[] = [];
  for (let n = 0; n < k; n++) {
    const baker = await fundedWallet(w);
    await injectEntry(w.client, { campaign, baker: baker.address, amountYes: 2n * SOL });
    settles.push(S.settleEntryIx(await P.entryPda(campaign, baker.address), campaign, vault, baker.address));
  }
  return settles;
}

/** Signs `ixs` as the world's payer and returns the wire transaction. */
async function buildTx(w: World, ixs: Instruction[]) {
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(w.client.payer, m),
    (m) => w.client.svm.setTransactionMessageLifetimeUsingLatestBlockhash(m),
    (m) => appendTransactionMessageInstructions(ixs, m),
  );
  return signTransactionMessageWithSigners(message);
}

const rows = [
  "| Entries per transaction | Transaction bytes | Compute units | CU per entry | Result |",
  "|---|---|---|---|---|",
];
let best = 0n;
for (const k of batches) {
  const w = await createWorld();
  const ixs = await settlingWith(w, k);
  const tx = await buildTx(w, ixs);
  const size = getTransactionEncoder().encode(tx).length;
  if (size > TX_LIMIT) {
    rows.push(`| ${k} | ${size} | - | - | does not fit (${TX_LIMIT} bytes) |`);
    continue;
  }
  const result = w.client.svm.sendTransaction(tx);
  if (isFailedTransaction(result)) {
    rows.push(`| ${k} | ${size} | - | - | refused: ${String(result.err())} |`);
    continue;
  }
  const cu = result.computeUnitsConsumed();
  best = cu / BigInt(k);
  rows.push(`| ${k} | ${size} | ${cu.toLocaleString("en-US")} | ${best.toLocaleString("en-US")} | ok |`);
}
console.log(rows.join("\n"));

if (best > 0n) {
  const settles = accountCu / best;
  console.log(`\nPer-account write limit (C7): ${accountCu.toLocaleString("en-US")} CU per block on one campaign.`);
  console.log(`settle_entry at ${best} CU each: ${settles} settlements per block on one campaign.`);
  if (joinCu > 0n) {
    const left = (accountCu - settles * best) / joinCu;
    console.log(`late joins at ${joinCu} CU each, after a full settle block: ${left} per block.`);
  }
}
