/**
 * Purpose: the join right before the wallet (2026-10-15, so "Sign" works on the first click). A blockhash lives 150
 *          blocks, about 34 s on devnet (4.45 blocks a second, measured that day), and reading the sheet often takes
 *          longer. So, on "Sign": A-8 again (the program's last deploy), then the blockhash's life; a join with fewer
 *          than FRESH_BLOCKS left is prepared again, and when only its blockhash moved (`sameTerms`), what the person
 *          reviewed is what the wallet signs, so the same click goes on. The terms are everything the sheet shows: the
 *          summary of the bytes (fee payer, fee, side, amount, `min_return_bps`, `expected_entry_total`, accounts), what
 *          leaves the wallet, the estimate and the pot after the entry. The blockhash is in none of them.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry), the first-click fix
 */
import { assertDeploy, type SolanaRpc } from "@brot/sdk/read";

import { lastValidOf, type prepareEntry, type ReadyJoin } from "./submit";

/** Fewer blocks than this left on the prepared blockhash, and the entry is prepared again before the wallet. */
export const FRESH_BLOCKS = 60n;

export type Prepared = Awaited<ReturnType<typeof prepareEntry>>;
export type Preparation = { prepared: Prepared; retry: boolean };

const potAfter = (ready: ReadyJoin): string => {
  const added = ready.simulation.events.find((e) => e.name === "EntryAdded");
  return added?.name === "EntryAdded" ? `${added.data.poolYes}/${added.data.poolNo}` : "";
};

/** Whether a join prepared again carries the terms of the one on screen. */
export function sameTerms(shown: ReadyJoin, again: ReadyJoin): boolean {
  return (
    shown.summary.lines.join("\n") === again.summary.lines.join("\n") &&
    shown.debit.total === again.debit.total &&
    shown.debit.rents === again.debit.rents &&
    shown.debit.networkFee === again.debit.networkFee &&
    shown.minReturnBps === again.minReturnBps &&
    shown.expectedEntryTotal === again.expectedEntryTotal &&
    shown.check.estimateBps === again.check.estimateBps &&
    shown.check.isFirst === again.check.isFirst &&
    potAfter(shown) === potAfter(again)
  );
}

/**
 * `go`: the join to hand to the wallet (the one on screen, or the one prepared again with the same terms, with its
 * `retry`). `again`: prepared again with other terms, or refused, for the sheet. Throws what the RPC throws.
 */
export async function freshJoin(
  rpc: SolanaRpc,
  builtFor: bigint | null,
  shown: ReadyJoin,
  prepare: () => Promise<Preparation>,
): Promise<{ kind: "go"; ready: ReadyJoin; retry?: boolean } | ({ kind: "again" } & Preparation)> {
  const height = rpc.getBlockHeight({ commitment: "confirmed" }).send();
  const [now] = await Promise.all([height, assertDeploy(rpc, builtFor)]);
  if (lastValidOf(shown) - now >= FRESH_BLOCKS) return { kind: "go", ready: shown };
  const again = await prepare();
  return again.prepared.ok && sameTerms(shown, again.prepared)
    ? { kind: "go", ready: again.prepared, retry: again.retry }
    : { kind: "again", ...again };
}
