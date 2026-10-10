/**
 * Purpose: holds the last good chain snapshot in memory and refreshes it on a timer. A failed refresh keeps the last
 *          good snapshot and records the error, so the API answers with what it had and says it is stale.
 * Version: 0.1.0
 * Sprint:  08 (indexer and API, hackathon MVP)
 */
import type { SolanaRpc } from "@brot/sdk/read";
import { takeSnapshot, type Snapshot } from "./snapshot";

export type Store = {
  current(): Snapshot | null;
  lastError(): string | null;
  refresh(): Promise<void>;
};

export function createStore(rpc: SolanaRpc, take = takeSnapshot): Store {
  let snapshot: Snapshot | null = null;
  let error: string | null = null;
  return {
    current: () => snapshot,
    lastError: () => error,
    async refresh() {
      try {
        snapshot = await take(rpc);
        error = null;
      } catch (caught) {
        // Only the error's name: an RPC error's message can carry the provider URL, and this is served publicly.
        error = caught instanceof Error ? caught.name : "Error";
      }
    },
  };
}
