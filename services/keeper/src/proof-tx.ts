/**
 * Purpose: the proof transaction of a price resolution (the second read; Sprint 07 DoD, proposal §2.11): the
 *          transaction that wrote the price account at its `posted_slot`, found through a given RPC (RPC B), and the
 *          signed price message its Pyth instruction carries. The block at that slot is read with
 *          `transactionDetails: "accounts"`; each transaction that writes the account and did not fail is fetched,
 *          and its top-level Pyth instruction is parsed: the push oracle's `update_price_feed` (the sponsored
 *          account is its 6th account) or the receiver's `post_update` (the update account is its 5th).
 * Version: 0.1.0
 * Sprint:  07 carry-over (the second read of a price campaign)
 *
 * The layout was read from recorded devnet transactions (tests/fixtures/proof-tx/, scripts/capture-proof-tx.ts),
 * checked against the account each one wrote: an Anchor discriminator (`sha256("global:<name>")[0..8]`), then the
 * message as a u32 little-endian length and its bytes: type 0 (a price feed message), the feed id, then price (i64),
 * conf (u64), exponent (i32), publish time (i64), previous publish time (i64), EMA price and EMA conf, big-endian.
 * A proof posted any other way (another instruction, a program that calls the receiver itself) is not read here:
 * the second read then reports it as not checked, never as a match.
 */
import { getBase58Encoder, type Address } from "@solana/kit";
import { PYTH_PUSH_ORACLE_ID, PYTH_RECEIVER_ID, accountKeysOf, hexToBytes, type SolanaRpc } from "@brot/sdk/read";

export type PostedMessage = {
  feedId: Uint8Array;
  price: bigint;
  conf: bigint;
  exponent: number;
  publishTime: bigint;
  prevPublishTime: bigint;
};

/** The instructions read, by program: the discriminator and the index of the price account among its accounts. */
const READABLE = [
  { program: PYTH_PUSH_ORACLE_ID, name: "update_price_feed", discriminator: hexToBytes("1c095d965699bc73"), slot: 5 },
  { program: PYTH_RECEIVER_ID, name: "post_update", discriminator: hexToBytes("855fcfaf0b4f762c"), slot: 4 },
] as const;

const MESSAGE_LEN = 85;

/** The price message of a Pyth update instruction's data, or `null` when it is not one this keeper reads. */
export function parsePriceMessage(data: Uint8Array): PostedMessage | null {
  if (data.length < 12 + MESSAGE_LEN) return null;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const length = view.getUint32(8, true);
  if (length < MESSAGE_LEN || 12 + length > data.length || data[12] !== 0) return null;
  const at = 13;
  return {
    feedId: data.slice(at, at + 32),
    price: view.getBigInt64(at + 32, false),
    conf: view.getBigUint64(at + 40, false),
    exponent: view.getInt32(at + 48, false),
    publishTime: view.getBigInt64(at + 52, false),
    prevPublishTime: view.getBigInt64(at + 60, false),
  };
}

const same = (a: Uint8Array, b: readonly number[] | Uint8Array) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

type JsonInstruction = { programIdIndex: number; accounts: number[]; data: string };
type JsonTransaction = {
  transaction: { signatures: string[]; message: { accountKeys: string[]; instructions: JsonInstruction[] } };
  meta: { err: unknown; loadedAddresses?: { writable: string[]; readonly: string[] } } | null;
};

/** The message a transaction's top-level Pyth instruction wrote to `account`, or `null`. */
export function messageFor(tx: JsonTransaction, account: Address): PostedMessage | null {
  const keys = accountKeysOf(tx as never);
  for (const ix of tx.transaction.message.instructions) {
    const data = new Uint8Array(getBase58Encoder().encode(ix.data));
    const reader = READABLE.find(
      (r) => keys[ix.programIdIndex] === r.program && same(data.subarray(0, 8), r.discriminator),
    );
    if (!reader || keys[ix.accounts[reader.slot]!] !== account) continue;
    const message = parsePriceMessage(data);
    if (message) return message;
  }
  return null;
}

type BlockTransaction = { transaction: { signatures: string[]; accountKeys: { pubkey: string; writable: boolean }[] } };

/** The transaction of `slot` that wrote `account` through an instruction this keeper reads, with its message. */
export async function findProofUpdate(
  rpc: SolanaRpc,
  slot: bigint,
  account: Address,
): Promise<{ signature: string; message: PostedMessage } | { error: string }> {
  const config = { encoding: "json", maxSupportedTransactionVersion: 1, commitment: "confirmed" } as const;
  const block = (await rpc
    .getBlock(slot, { ...config, transactionDetails: "accounts", rewards: false })
    .send()) as unknown as { transactions: (BlockTransaction & { meta: { err: unknown } | null })[] } | null;
  if (!block) return { error: `slot ${slot} has no block at this RPC` };
  const writers = block.transactions.filter(
    (t) => !t.meta?.err && t.transaction.accountKeys.some((k) => k.pubkey === account && k.writable),
  );
  for (const writer of writers) {
    const signature = writer.transaction.signatures[0]!;
    const tx = (await rpc.getTransaction(signature as never, config).send()) as unknown as JsonTransaction | null;
    const message = tx && !tx.meta?.err ? messageFor(tx, account) : null;
    if (message) return { signature, message };
  }
  return {
    error: `no transaction of slot ${slot} writes ${account} through update_price_feed or post_update (${writers.length} wrote it)`,
  };
}
