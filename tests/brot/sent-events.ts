/**
 * Purpose: the events of a transaction the kit sent, decoded by the SDK (`@brot/sdk/read`), the way an
 *          indexer reads them: the LiteSVM result put in the RPC's `getTransaction` shape and passed to
 *          `decodeTransactionEvents`, decoder rules and all. For the events the kit also lays out by hand
 *          (tests/brot/events.ts), both decodings must agree, so every LiteSVM test checks the SDK.
 * Version: 0.1.0
 * Sprint:  05 (SDK): the test kit uses the SDK; Sprint 02's `decodeEvent` stays for raw bytes
 */
import { getBase58Decoder, type Address } from "@solana/kit";

import { decodeTransactionEvents, type RpcTransaction } from "@brot/sdk/read";

import { EVENTS } from "./events";
import { normalized } from "./idl";
import { decode } from "./layouts";
import * as P from "./program";

export type Event = { name: string; data: Record<string, any> };

type Compiled = { programIdIndex(): number; accounts(): Uint8Array; data(): Uint8Array };
type Inner = { instruction(): Compiled };

/** Decodes `[0xFF, discriminator, payload]` with the kit's own layouts; null for anything else. */
export function decodeEvent(data: Uint8Array): Event | null {
  if (data[0] !== P.IX.EMIT_EVENT) return null;
  const found = Object.entries(EVENTS).find(([, e]) => e.discriminator === data[1]);
  return found ? { name: found[0], data: decode(found[1].layout, data, 2) } : null;
}

const json = (value: unknown) => JSON.stringify(value, (_, v) => (typeof v === "bigint" ? `${v}n` : v));

/**
 * The SDK's events of a successful LiteSVM transaction whose static keys are `keys`, `inner` being its
 * inner instructions per top-level instruction. An event the kit lays out comes back with the kit's
 * snake_case fields, after a check that the SDK decoded the same values; any other event comes back as
 * the SDK decodes it (camelCase).
 */
export function sentEvents(signature: string, keys: readonly Address[], inner: Inner[][]): Event[] {
  const compiled = inner.map((list) => list.map((entry) => entry.instruction()));
  const tx: RpcTransaction = {
    slot: 0n,
    transaction: { signatures: [signature], message: { accountKeys: keys } },
    meta: {
      err: null,
      innerInstructions: compiled.map((list, index) => ({
        index,
        instructions: list.map((ix) => ({
          programIdIndex: ix.programIdIndex(),
          accounts: Array.from(ix.accounts()),
          data: getBase58Decoder().decode(ix.data()),
        })),
      })),
      loadedAddresses: { writable: [], readonly: [] },
    },
  };
  return decodeTransactionEvents(tx).map((event) => {
    const layout = EVENTS[event.name];
    if (!layout) return { name: event.name, data: event.data as Record<string, any> };
    const kit = decode(layout.layout, compiled[event.key.ixIndex][event.key.innerIndex].data(), 2);
    if (json(normalized(kit)) !== json(normalized(event.data))) {
      throw new Error(`the SDK decodes ${event.name} differently from the kit: ${json(normalized(event.data))}`);
    }
    return { name: event.name, data: kit };
  });
}
