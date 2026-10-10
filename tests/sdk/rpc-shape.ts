/**
 * Purpose: a transaction sent in LiteSVM, returned in the shape the RPC's `getTransaction` (encoding
 *          `json`, `maxSupportedTransactionVersion: 0`) gives it, so the SDK's decoder is tested on what an
 *          indexer reads: static keys, inner instructions grouped by top-level index, `loadedAddresses`
 *          for address lookup tables, `meta.err`. Also writes a lookup table into the world.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import {
  address,
  appendTransactionMessageInstructions,
  compressTransactionMessageUsingAddressLookupTables,
  createTransactionMessage,
  getAddressEncoder,
  getBase58Decoder,
  getCompiledTransactionMessageDecoder,
  getSignatureFromTransaction,
  lamports,
  pipe,
  setTransactionMessageFeePayerSigner,
  signTransactionMessageWithSigners,
  type Address,
  type Instruction,
} from "@solana/kit";
import { isFailedTransaction } from "@solana/kit-plugin-litesvm";

import type { RpcTransaction } from "@brot/sdk/read";
import type { World } from "../brot/setup";

export const ALT_PROGRAM_ID = address("AddressLookupTab1e1111111111111111111111111");

/** An active address lookup table holding `addresses`, written straight into the world. */
export function setLookupTable(w: World, at: Address, addresses: readonly Address[]) {
  const data = new Uint8Array(56 + 32 * addresses.length);
  const view = new DataView(data.buffer);
  view.setUint32(0, 1, true); // ProgramState::LookupTable
  view.setBigUint64(4, 0xffff_ffff_ffff_ffffn, true); // deactivation_slot: never
  view.setBigUint64(12, 0n, true); // last_extended_slot: before the world's slot
  addresses.forEach((a, i) => data.set(getAddressEncoder().encode(a), 56 + 32 * i));
  w.client.svm.setAccount({
    address: at,
    data,
    executable: false,
    lamports: lamports(1_000_000_000n),
    programAddress: ALT_PROGRAM_ID,
    space: BigInt(data.length),
  });
}

type Inner = { instruction(): { programIdIndex(): number; accounts(): Uint8Array; data(): Uint8Array } };

/** Sends `ixs` (compressed through `tables` when given) and returns the RPC's view of the transaction. */
export async function sendAsRpc(
  w: World,
  ixs: Instruction[],
  tables: Record<Address, Address[]> = {},
): Promise<{ ok: boolean; tx: RpcTransaction; logs: string[] }> {
  const base = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(w.client.payer, m),
    (m) => w.client.svm.setTransactionMessageLifetimeUsingLatestBlockhash(m),
    (m) => appendTransactionMessageInstructions(ixs, m),
  );
  const message = Object.keys(tables).length ? compressTransactionMessageUsingAddressLookupTables(base, tables) : base;
  const signed = await signTransactionMessageWithSigners(message);
  const compiled = getCompiledTransactionMessageDecoder().decode(signed.messageBytes);
  const loaded = { writable: [] as string[], readonly: [] as string[] };
  const lookups = "addressTableLookups" in compiled ? (compiled.addressTableLookups ?? []) : [];
  for (const lookup of lookups) {
    const table = tables[lookup.lookupTableAddress];
    loaded.writable.push(...lookup.writableIndexes.map((i: number) => table[i]));
    loaded.readonly.push(...lookup.readonlyIndexes.map((i: number) => table[i]));
  }
  const result = w.client.svm.sendTransaction(signed);
  w.client.svm.expireBlockhash();
  const failed = isFailedTransaction(result);
  type Meta = { innerInstructions(): unknown; logs(): string[] };
  const meta = (failed ? (result as unknown as { meta(): Meta }).meta() : result) as Meta;
  const groups = (meta.innerInstructions() as Inner[][])
    .map((list, index) => ({
      index,
      instructions: list.map((inner) => {
        const ix = inner.instruction();
        return {
          programIdIndex: ix.programIdIndex(),
          accounts: Array.from(ix.accounts()),
          data: getBase58Decoder().decode(ix.data()),
        };
      }),
    }))
    .filter((group) => group.instructions.length > 0);
  const tx: RpcTransaction = {
    slot: w.client.svm.getClock().slot,
    blockTime: w.client.svm.getClock().unixTimestamp,
    transaction: {
      signatures: [getSignatureFromTransaction(signed)],
      message: { accountKeys: compiled.staticAccounts },
    },
    meta: {
      err: failed ? { InstructionError: [0, String((result.err() as { toString(): string }).toString())] } : null,
      innerInstructions: groups,
      loadedAddresses: loaded,
    },
  };
  return { ok: !failed, tx, logs: meta.logs() };
}
