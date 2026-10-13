/**
 * Purpose: how the indexer keeps an event (Sprint 08): its payload as JSON for readers (amounts as decimal strings,
 *          bytes as hex, enums as their numbers) and its own bytes (`raw`: the inner instruction's base58 data,
 *          exactly what the SDK decoded), from which `revive` gives back the SDK's `DecodedEvent`, bigints included,
 *          for the projections and the points rule. A stored event that no longer decodes is an error, never a guess.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { getBase58Encoder } from "@solana/kit";
import { decodeEventData, type DecodedEvent, type RpcTransaction } from "@brot/sdk/read";

const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

/** An event's payload as JSON: bigints as decimal strings, byte arrays as hex. */
export const jsonOf = (data: unknown): string =>
  JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v instanceof Uint8Array ? hex(v) : v));

/**
 * The base58 data of the inner instruction an event came from, found by its key (decoder rule 4). Kit parses every
 * integer of an RPC answer as a bigint, so the group's index is compared as a number.
 */
export function rawOf(tx: RpcTransaction, ixIndex: number, innerIndex: number): string {
  const group = tx.meta?.innerInstructions?.find((g) => Number(g.index) === Number(ixIndex));
  const ix = group?.instructions[Number(innerIndex)] as { data?: unknown } | undefined;
  if (typeof ix?.data !== "string") throw new Error("an event without its inner instruction");
  return ix.data;
}

/** A stored event's key, place and bytes, as the `events` table keeps them. */
export type StoredEvent = {
  signature: string;
  ix_index: number;
  inner_index: number;
  slot: number;
  block_time: number | null;
  raw: string;
};

/** The SDK's event again, from its stored bytes. */
export function revive(row: StoredEvent): DecodedEvent {
  const event = decodeEventData(new Uint8Array(getBase58Encoder().encode(row.raw)));
  if (!event) throw new Error(`the stored event ${row.signature}:${row.ix_index}:${row.inner_index} does not decode`);
  return {
    ...event,
    key: { signature: row.signature, ixIndex: row.ix_index, innerIndex: row.inner_index },
    slot: BigInt(row.slot),
    blockTime: row.block_time === null ? null : BigInt(row.block_time),
  };
}

/** The columns `revive` reads, for a SELECT. */
export const STORED_EVENT = "signature, ix_index, inner_index, slot, block_time, raw";
