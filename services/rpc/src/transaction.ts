/**
 * Purpose: what a transaction may hold to pass brot-rpc (TP §3.5; Sprint 08): sendTransaction and simulateTransaction
 *          carry a base64 wire transaction whose every top-level instruction belongs to this program, to ComputeBudget
 *          or to Lighthouse, the wallet-assertion program a wallet may add (the System Program appears only as the
 *          program's own CPI); a program id taken from a lookup table is refused. And whether the transaction joins
 *          or opens a campaign, which the country gate reads (K-11). Pure: nothing is signed or sent here.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { getBase64Encoder, getCompiledTransactionMessageDecoder, getTransactionDecoder } from "@solana/kit";
import {
  COMPUTE_BUDGET_PROGRAM_ID,
  INSTRUCTION_DISCRIMINATOR,
  LIGHTHOUSE_PROGRAM_ID,
  PROGRAM_ID,
} from "@brot/sdk/read";

export type TransactionCheck = { ok: true; joinsOrOpens: boolean } | { ok: false; reason: string };

const ALSO_CARRIED = new Set<string>([COMPUTE_BUDGET_PROGRAM_ID, LIGHTHOUSE_PROGRAM_ID]);
const GATED = new Set<number>([INSTRUCTION_DISCRIMINATOR.userOpenCampaign, INSTRUCTION_DISCRIMINATOR.userJoinCampaign]);

type Compiled = { programAddressIndex: number; data?: Uint8Array };

export function checkTransaction(base64: string): TransactionCheck {
  let accounts: readonly string[];
  let instructions: readonly Compiled[];
  try {
    const transaction = getTransactionDecoder().decode(getBase64Encoder().encode(base64));
    const message = getCompiledTransactionMessageDecoder().decode(transaction.messageBytes);
    accounts = message.staticAccounts;
    instructions = ("instructions" in message ? message.instructions : []) as readonly Compiled[];
  } catch {
    return { ok: false, reason: "not a transaction" };
  }
  if (instructions.length === 0) return { ok: false, reason: "a transaction with no instruction" };
  let joinsOrOpens = false;
  for (const ix of instructions) {
    const program = accounts[ix.programAddressIndex];
    if (program === undefined) return { ok: false, reason: "a program named through a lookup table" };
    if (program === PROGRAM_ID) {
      if (GATED.has(ix.data?.[0] ?? -1)) joinsOrOpens = true;
      continue;
    }
    if (!ALSO_CARRIED.has(program)) return { ok: false, reason: "a program the relay does not carry" };
  }
  return { ok: true, joinsOrOpens };
}
