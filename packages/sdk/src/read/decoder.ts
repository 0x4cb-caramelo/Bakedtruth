/**
 * Purpose: the program's events out of a transaction as the RPC returns it (`getTransaction` with JSON
 *          encoding, or `simulateTransaction`), under the four decoder rules every consumer follows
 *          (TP 3.4.14; proposal 2.3).
 * Version: 0.1.1
 * Sprint:  05 (SDK)
 *
 * 1. A transaction whose `meta.err` is not null is skipped whole (so is one without `meta`).
 * 2. An event is accepted only from an INNER instruction of this program whose one account is the
 *    program's event authority, with data `[0xFF, discriminator, payload]` of the event's exact size.
 *    Only this program can sign for that PDA, and its event handler refuses an unsigned authority, so
 *    in a successful transaction such an instruction came from the program's own `emit`. Log lines,
 *    which any program can write, and top-level instructions are never read.
 * 3. Inner-instruction account indexes resolve through the static keys, then `loadedAddresses`
 *    (writable, then readonly), so a transaction that uses address lookup tables decodes. An inner
 *    instruction the node wrote with addresses instead of indexes (`simulateTransaction` does, for a
 *    program it cannot parse) is read by its addresses.
 * 4. Each event is keyed by (signature, top-level instruction index, inner instruction index): one
 *    top-level instruction, such as a multisig's execute, can hold two of this program's events.
 *
 * Data longer than the largest event is refused before it is decoded: base58 decoding costs the square
 * of the length, and the strings come from third-party RPCs (zone Z5).
 */
import { getBase58Encoder, type Address } from "@solana/kit";

import { EVENT_AUTHORITY, PROGRAM_ID } from "./constants";
import { decodeEventData, MAX_EVENT_DATA, type BrotEvent } from "./events";

/** A compiled instruction as the RPC's JSON encoding writes it: account indexes. */
export type RpcCompiledInstruction = {
  readonly programIdIndex: number;
  readonly accounts: readonly number[];
  /** Base58 of the instruction data. */
  readonly data: string;
  readonly stackHeight?: number | null;
};

/** An instruction written with addresses, as a node writes one it cannot parse (`simulateTransaction`). */
export type RpcPartiallyDecodedInstruction = {
  readonly programId: string;
  readonly accounts: readonly string[];
  /** Base58 of the instruction data. */
  readonly data: string;
  readonly stackHeight?: number | null;
};

/** An instruction the node parsed into JSON (the System Program's, say): never this program's. */
export type RpcParsedInstruction = { readonly programId: string; readonly parsed: unknown };

export type RpcInnerInstruction = RpcCompiledInstruction | RpcPartiallyDecodedInstruction | RpcParsedInstruction;

/** The part of `getTransaction` (encoding `json`, `maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION`) it reads. */
export type RpcTransaction = {
  readonly slot: bigint | number;
  readonly blockTime?: bigint | number | null;
  readonly transaction: {
    readonly signatures: readonly string[];
    readonly message: { readonly accountKeys: readonly string[] };
  };
  readonly meta: {
    readonly err: unknown;
    readonly innerInstructions?:
      | readonly {
          readonly index: number;
          readonly instructions: readonly RpcInnerInstruction[];
        }[]
      | null;
    readonly loadedAddresses?: { readonly writable: readonly string[]; readonly readonly: readonly string[] } | null;
  } | null;
};

/** The longest base58 string the largest event's data can be, plus one character for the rounding. */
export const MAX_EVENT_BASE58 = Math.ceil((MAX_EVENT_DATA * 8) / Math.log2(58)) + 1;

/** Where an event sits in the chain: the decoder's rule 4. */
export type EventKey = { signature: string; ixIndex: number; innerIndex: number };

/** An accepted event, with its key and the slot and block time of its transaction. */
export type DecodedEvent = BrotEvent & { key: EventKey; slot: bigint; blockTime: bigint | null };

/** The account keys an instruction's indexes point into: static keys, then the loaded ones (rule 3). */
export function accountKeysOf(tx: RpcTransaction): readonly string[] {
  const loaded = tx.meta?.loadedAddresses;
  return [...tx.transaction.message.accountKeys, ...(loaded?.writable ?? []), ...(loaded?.readonly ?? [])];
}

/** The program and the one account of `ix`, as addresses, whichever way the node wrote them. */
function addressesOf(ix: RpcInnerInstruction, keys: readonly string[]): { program: unknown; accounts: unknown[] } {
  if ("programIdIndex" in ix) {
    const accounts = Array.isArray(ix.accounts) ? ix.accounts.map((i) => keys[i]) : [];
    return { program: keys[ix.programIdIndex], accounts };
  }
  const accounts = "accounts" in ix && Array.isArray(ix.accounts) ? ix.accounts : [];
  return { program: ix.programId, accounts };
}

/** The event an inner instruction carries, if it is one of this program's (rule 2); else `null`. */
export function innerInstructionEvent(ix: RpcInnerInstruction, keys: readonly string[]): BrotEvent | null {
  if (typeof ix !== "object" || ix === null || !("data" in ix)) return null;
  if (typeof ix.data !== "string" || ix.data.length > MAX_EVENT_BASE58) return null;
  const { program, accounts } = addressesOf(ix, keys);
  if (program !== PROGRAM_ID) return null;
  if (accounts.length !== 1 || accounts[0] !== EVENT_AUTHORITY) return null;
  let data: Uint8Array;
  try {
    data = new Uint8Array(getBase58Encoder().encode(ix.data));
  } catch {
    return null;
  }
  return decodeEventData(data);
}

/** Every event of this program in `tx`, in the order the transaction emitted them (rules 1 to 4). */
export function decodeTransactionEvents(tx: RpcTransaction): DecodedEvent[] {
  const meta = tx.meta;
  if (!meta || meta.err !== null) return [];
  const signature = tx.transaction.signatures[0];
  const keys = accountKeysOf(tx);
  const slot = BigInt(tx.slot);
  const blockTime = tx.blockTime === null || tx.blockTime === undefined ? null : BigInt(tx.blockTime);
  const events: DecodedEvent[] = [];
  for (const group of meta.innerInstructions ?? []) {
    group.instructions.forEach((ix, innerIndex) => {
      const event = innerInstructionEvent(ix, keys);
      if (event) events.push({ ...event, key: { signature, ixIndex: group.index, innerIndex }, slot, blockTime });
    });
  }
  return events;
}

/** The string form of an event's key, for maps and database keys. */
export const eventKeyString = (key: EventKey): string => `${key.signature}:${key.ixIndex}:${key.innerIndex}`;

/**
 * Events with duplicates dropped by key (rule 4): the same transaction read twice, through two RPC
 * providers or two pages, yields each event once. The first occurrence is kept.
 */
export function uniqueEvents<E extends { key: EventKey }>(events: Iterable<E>): E[] {
  const seen = new Set<string>();
  const out: E[] = [];
  for (const event of events) {
    const id = eventKeyString(event.key);
    if (!seen.has(id)) {
      seen.add(id);
      out.push(event);
    }
  }
  return out;
}

/** True when `address` is this program (for callers that filter by program before decoding). */
export const isProgram = (address: Address | string): boolean => address === PROGRAM_ID;
